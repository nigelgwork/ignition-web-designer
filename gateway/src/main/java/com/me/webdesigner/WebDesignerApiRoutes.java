package com.me.webdesigner;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.inductiveautomation.ignition.gateway.dataroutes.RequestContext;
import com.inductiveautomation.ignition.gateway.dataroutes.RouteGroup;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST API Routes for Web Designer Module
 *
 * Version: 0.1.0 - Phase 1
 *
 * Handles all API requests at /data/webdesigner/api/v1/*
 *
 * Security: All endpoints require:
 * 1. Authenticated Ignition session
 * 2. Appropriate permissions (Designer role checked in Phase 1)
 *
 * Phase 1 Endpoints:
 * - GET /api/v1/projects - List all projects
 *
 * Future Endpoints (Phase 2+):
 * - GET /api/v1/projects/{name}/views - List views in project
 * - GET /api/v1/projects/{name}/view?path=... - Get view.json
 * - POST /api/v1/projects/{name}/view?path=... - Save view.json
 * - GET /api/v1/tags - List tag providers
 * - GET /api/v1/tags/{provider}?path=... - Browse tags
 * - GET /api/v1/perspective/components - Get component catalog
 */
public final class WebDesignerApiRoutes {

    private static final Logger logger = LoggerFactory.getLogger(WebDesignerApiRoutes.class);
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    // Private constructor - this is a utility class with static methods only
    private WebDesignerApiRoutes() {
    }

    /**
     * Mount all API routes for the Web Designer module.
     *
     * @param routes The RouteGroup to mount routes on
     * @param context The GatewayContext for accessing Ignition APIs
     */
    public static void mountRoutes(RouteGroup routes, GatewayContext context) {
        logger.info("Mounting Web Designer API routes...");

        // GET /api/v1/projects - List all projects
        routes.newRoute("/api/v1/projects")
            .type(RouteGroup.TYPE_JSON)
            .handler((req, res) -> handleGetProjects(req, res, context))
            .mount();

        logger.info("Mounted route: GET /data/webdesigner/api/v1/projects");
    }

    /**
     * Handle GET /api/v1/projects endpoint.
     *
     * Returns a list of all project names on the Gateway.
     *
     * Response format:
     * {
     *   "projects": ["Project1", "Project2", ...]
     * }
     *
     * @param req The request context
     * @param res The HTTP response
     * @param context The Gateway context
     * @return JSON response with project list
     */
    private static JsonObject handleGetProjects(RequestContext req, HttpServletResponse res, GatewayContext context) {
        logger.info("GET /api/v1/projects requested");

        try {
            // TODO Phase 2: Implement actual project listing using ProjectManager API
            // For Phase 1, we return a placeholder response to verify the module loads
            // The ProjectManager API in 8.3+ needs to be researched for the correct methods

            // Build placeholder response
            JsonObject response = new JsonObject();
            JsonArray projectsArray = new JsonArray();

            // For now, return an empty array
            // In Phase 2, we'll implement: context.getProjectManager().{correctMethod}()

            response.add("projects", projectsArray);
            response.addProperty("note", "Phase 1: Project listing not yet implemented");

            logger.info("Returned placeholder project list (Phase 1)");

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling projects request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to handle request: " + e.getMessage());
        }
    }

    /**
     * Create a JSON error response.
     *
     * @param status The HTTP status code
     * @param message The error message
     * @return JSON error response
     */
    private static JsonObject createErrorResponse(int status, String message) {
        JsonObject error = new JsonObject();
        error.addProperty("error", message);
        error.addProperty("status", status);
        return error;
    }
}
