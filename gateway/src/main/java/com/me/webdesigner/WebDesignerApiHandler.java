package com.me.webdesigner;

import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.inductiveautomation.ignition.gateway.project.ProjectManager;
import com.inductiveautomation.ignition.gateway.web.components.AbstractRouteHandler;
import com.inductiveautomation.ignition.common.user.User;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

/**
 * REST API Handler for Web Designer Module
 *
 * Version: 0.1.0 - Phase 1
 *
 * Handles all API requests at /webdesigner/api/v1/*
 *
 * Security: All endpoints require:
 * 1. Authenticated Ignition session
 * 2. "Designer" role or "webdesigner.edit" permission
 *
 * Phase 1 Endpoints:
 * - GET /projects - List all projects
 *
 * Future Endpoints (Phase 2+):
 * - GET /projects/{name}/views - List views in project
 * - GET /projects/{name}/view?path=... - Get view.json
 * - POST /projects/{name}/view?path=... - Save view.json
 * - GET /tags - List tag providers
 * - GET /tags/{provider}?path=... - Browse tags
 * - GET /perspective/components - Get component catalog
 */
public class WebDesignerApiHandler extends AbstractRouteHandler {

    private static final Logger logger = LoggerFactory.getLogger(WebDesignerApiHandler.class);

    private final GatewayContext gatewayContext;
    private final Gson gson;

    /**
     * Constructor
     *
     * @param gatewayContext The Gateway context for accessing Ignition APIs
     */
    public WebDesignerApiHandler(GatewayContext gatewayContext) {
        this.gatewayContext = gatewayContext;
        this.gson = new GsonBuilder()
            .setPrettyPrinting()
            .create();

        logger.info("WebDesignerApiHandler initialized");
    }

    /**
     * Handle all API requests.
     * Routes to appropriate endpoint handler based on path.
     */
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
        // Get the path after /webdesigner/api/v1/
        String path = request.getPathInfo();
        if (path == null) {
            path = "/";
        }

        String method = request.getMethod();

        logger.debug("API Request: {} {}", method, path);

        // Set response content type
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Enable CORS for development (same-origin in production)
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, If-Match");

        // Handle OPTIONS preflight
        if ("OPTIONS".equals(method)) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        try {
            // Authenticate and authorize the request
            User user = authenticateAndAuthorize(request, response);
            if (user == null) {
                // Response already sent by authenticateAndAuthorize
                return;
            }

            // Route to appropriate endpoint handler
            if ("GET".equals(method) && path.equals("/projects")) {
                handleGetProjects(request, response, user);
            } else {
                // Endpoint not implemented yet
                sendError(response, HttpServletResponse.SC_NOT_FOUND,
                    "Endpoint not implemented: " + method + " " + path);
            }

        } catch (Exception e) {
            logger.error("Error handling API request: {} {}", method, path, e);
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Internal server error: " + e.getMessage());
        }
    }

    /**
     * Authenticate and authorize the request.
     *
     * SECURITY CRITICAL: This method enforces:
     * 1. Valid Ignition session (authenticated user)
     * 2. "Designer" role or "webdesigner.edit" permission
     *
     * @param request  The HTTP request
     * @param response The HTTP response (used to send errors)
     * @return The authenticated User, or null if auth failed (response already sent)
     */
    private User authenticateAndAuthorize(HttpServletRequest request, HttpServletResponse response)
        throws IOException {

        // Step 1: Get user from session
        Optional<User> userOpt = gatewayContext.getAuthManager().getUserFromRequest(request);

        if (userOpt.isEmpty()) {
            logger.warn("Unauthorized API access attempt from {}", request.getRemoteAddr());
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                "Authentication required. Please log in to the Gateway.");
            return null;
        }

        User user = userOpt.get();

        // Step 2: Check for Designer role
        // Note: In production, you might want to create a custom "webdesigner.edit" permission
        if (!user.hasRole("Designer")) {
            logger.warn("Forbidden API access attempt by user '{}' from {}",
                user.getUsername(), request.getRemoteAddr());
            sendError(response, HttpServletResponse.SC_FORBIDDEN,
                "Access denied. 'Designer' role required.");
            return null;
        }

        logger.debug("User '{}' authenticated and authorized", user.getUsername());
        return user;
    }

    /**
     * Handle GET /projects endpoint.
     *
     * Returns a list of all project names on the Gateway.
     *
     * Response format:
     * {
     *   "projects": ["Project1", "Project2", ...]
     * }
     *
     * @param request  The HTTP request
     * @param response The HTTP response
     * @param user     The authenticated user
     */
    private void handleGetProjects(HttpServletRequest request, HttpServletResponse response, User user)
        throws IOException {

        logger.info("GET /projects requested by user '{}'", user.getUsername());

        try {
            // Get ProjectManager from GatewayContext
            ProjectManager projectManager = gatewayContext.getProjectManager();

            // Get list of all project names
            List<String> projectNames = new ArrayList<>(projectManager.getProjectNames());

            // Sort alphabetically for consistent ordering
            Collections.sort(projectNames);

            // Build response
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("projects", projectNames);

            // Send JSON response
            response.setStatus(HttpServletResponse.SC_OK);
            PrintWriter writer = response.getWriter();
            gson.toJson(responseData, writer);
            writer.flush();

            logger.info("Returned {} projects to user '{}'", projectNames.size(), user.getUsername());

        } catch (Exception e) {
            logger.error("Error getting projects for user '{}'", user.getUsername(), e);
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve projects: " + e.getMessage());
        }
    }

    /**
     * Send a JSON error response.
     *
     * @param response The HTTP response
     * @param status   The HTTP status code
     * @param message  The error message
     */
    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);

        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        error.put("status", status);

        PrintWriter writer = response.getWriter();
        gson.toJson(error, writer);
        writer.flush();
    }
}
