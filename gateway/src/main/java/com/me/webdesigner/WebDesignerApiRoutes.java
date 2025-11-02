package com.me.webdesigner;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.inductiveautomation.ignition.gateway.dataroutes.RequestContext;
import com.inductiveautomation.ignition.gateway.dataroutes.RouteGroup;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * REST API Routes for Web Designer Module
 *
 * Version: 0.2.0 - Phase 2
 *
 * Handles all API requests at /data/webdesigner/api/v1/*
 *
 * Security: All endpoints require:
 * 1. Authenticated Ignition session (enforced by Gateway)
 * 2. Appropriate permissions (TODO: Add role checking in production)
 *
 * Phase 2 Endpoints:
 * - GET /api/v1/projects - List all projects
 * - GET /api/v1/projects/{name}/views - List all Perspective views in a project
 * - GET /api/v1/projects/{name}/view?path=... - Get specific view.json content
 *
 * Future Endpoints (Phase 3+):
 * - POST /api/v1/projects/{name}/view?path=... - Save view.json
 * - GET /api/v1/tags - List tag providers
 * - GET /api/v1/tags/{provider}?path=... - Browse tags
 * - GET /api/v1/perspective/components - Get component catalog
 */
public final class WebDesignerApiRoutes {

    private static final Logger logger = LoggerFactory.getLogger(WebDesignerApiRoutes.class);
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    // Route patterns for path parameter extraction
    private static final Pattern VIEWS_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/views$");
    private static final Pattern VIEW_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/view$");

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

        // GET /api/v1/projects/{name}/views - List views in a project
        routes.newRoute("/api/v1/projects/*/views")
            .type(RouteGroup.TYPE_JSON)
            .handler((req, res) -> handleGetProjectViews(req, res, context))
            .mount();

        // GET /api/v1/projects/{name}/view?path=... - Get specific view
        routes.newRoute("/api/v1/projects/*/view")
            .type(RouteGroup.TYPE_JSON)
            .handler((req, res) -> handleGetView(req, res, context))
            .mount();

        logger.info("Mounted Web Designer API routes:");
        logger.info("  - GET /data/webdesigner/api/v1/projects");
        logger.info("  - GET /data/webdesigner/api/v1/projects/{name}/views");
        logger.info("  - GET /data/webdesigner/api/v1/projects/{name}/view");
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
            // TODO: Implement actual project listing using ProjectManager
            // Research needed: ProjectManager API method to list all projects
            // Possible methods to test:
            //   - context.getProjectManager().getProjects()
            //   - context.getProjectManager().getAllProjects()
            //   - context.getProjectManager().getProjectNames()
            //
            // Once tested, replace placeholder with real implementation

            // Build response
            JsonObject response = new JsonObject();
            JsonArray projectsArray = new JsonArray();

            // Placeholder: Return empty array for now
            // TODO: Get actual projects from ProjectManager
            // Example implementation (needs testing):
            // try {
            //     var projectManager = context.getProjectManager();
            //     // Method name needs to be determined through testing
            //     Collection<String> projects = projectManager.getProjects(); // or similar
            //     for (String projectName : projects) {
            //         projectsArray.add(projectName);
            //     }
            // } catch (Exception e) {
            //     logger.error("Error accessing ProjectManager", e);
            // }

            response.add("projects", projectsArray);
            response.addProperty("note", "Phase 2: ProjectManager API needs testing on live Gateway");

            logger.info("Returned project list (Phase 2 - placeholder)");

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling projects request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve projects: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/projects/{name}/views endpoint.
     *
     * Returns a list of all Perspective views in the specified project.
     *
     * Response format:
     * {
     *   "project": "ProjectName",
     *   "views": [
     *     {"path": "MainView", "name": "MainView"},
     *     {"path": "subfolder/DetailView", "name": "DetailView"}
     *   ]
     * }
     *
     * @param req The request context
     * @param res The HTTP response
     * @param context The Gateway context
     * @return JSON response with view list
     */
    private static JsonObject handleGetProjectViews(RequestContext req, HttpServletResponse res, GatewayContext context) {
        try {
            // Extract project name from path
            String path = req.getRequest().getRequestURI();
            Matcher matcher = VIEWS_PATTERN.matcher(path);

            if (!matcher.matches()) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
            }

            String projectName = matcher.group(1);
            logger.info("GET /api/v1/projects/{}/views requested", projectName);

            // Validate project name
            if (projectName == null || projectName.trim().isEmpty()) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Project name is required");
            }

            // TODO: Implement view listing using ProjectManager and Resource API
            // Research needed:
            // 1. Get project by name: projectManager.getProject(projectName)
            // 2. Get resources: project.getResourcesOfType(PERSPECTIVE_VIEW_TYPE)
            // 3. Extract paths and names from resources
            //
            // Expected pattern based on SDK research:
            // var project = context.getProjectManager().getProject(projectName);
            // var viewResources = project.getResourcesOfType(PerspectiveViewResourceType);
            // for (Resource resource : viewResources) {
            //     String viewPath = resource.getResourcePath().toString();
            //     String viewName = resource.getName();
            //     // Add to response
            // }

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);

            JsonArray viewsArray = new JsonArray();
            // TODO: Add actual views from ProjectManager

            response.add("views", viewsArray);
            response.addProperty("note", "Phase 2: View listing requires Resource API testing");

            logger.info("Returned view list for project '{}' (Phase 2 - placeholder)", projectName);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling get views request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve views: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/projects/{name}/view?path=... endpoint.
     *
     * Returns the content of a specific view.json file.
     *
     * Query Parameters:
     * - path: The view path within the project (e.g., "MainView" or "subfolder/DetailView")
     *
     * Response format:
     * {
     *   "project": "ProjectName",
     *   "path": "MainView",
     *   "content": { ... view.json object ... }
     * }
     *
     * @param req The request context
     * @param res The HTTP response
     * @param context The Gateway context
     * @return JSON response with view content
     */
    private static JsonObject handleGetView(RequestContext req, HttpServletResponse res, GatewayContext context) {
        try {
            // Extract project name from path
            String requestPath = req.getRequest().getRequestURI();
            Matcher matcher = VIEW_PATTERN.matcher(requestPath);

            if (!matcher.matches()) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
            }

            String projectName = matcher.group(1);

            // Extract view path from query parameter
            HttpServletRequest servletReq = req.getRequest();
            String viewPath = servletReq.getParameter("path");

            logger.info("GET /api/v1/projects/{}/view?path={} requested", projectName, viewPath);

            // Validate parameters
            if (projectName == null || projectName.trim().isEmpty()) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Project name is required");
            }

            if (viewPath == null || viewPath.trim().isEmpty()) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "View path is required");
            }

            // TODO: Implement view reading using ProjectManager and Resource API
            // Research needed:
            // 1. Get project by name
            // 2. Get specific resource by path
            // 3. Read view.json content from resource
            // 4. Parse and return JSON
            //
            // Expected pattern based on SDK research:
            // var project = context.getProjectManager().getProject(projectName);
            // var resourcePath = ResourcePath.fromString("view/" + viewPath);
            // var resource = project.getResource(resourcePath);
            // var viewData = resource.getData("view.json");
            // String viewJson = viewData.map(ImmutableBytes::getBytesAsString).orElse("{}");
            // JsonObject viewContent = JsonParser.parseString(viewJson).getAsJsonObject();

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);
            response.addProperty("path", viewPath);

            // Placeholder content
            JsonObject placeholderContent = new JsonObject();
            placeholderContent.addProperty("root", "{}");
            placeholderContent.addProperty("note", "Phase 2: View content requires Resource API testing");

            response.add("content", placeholderContent);

            logger.info("Returned view content for project '{}', path '{}' (Phase 2 - placeholder)",
                projectName, viewPath);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling get view request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve view: " + e.getMessage());
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
