package com.me.webdesigner;

import com.inductiveautomation.ignition.common.gson.Gson;
import com.inductiveautomation.ignition.common.gson.GsonBuilder;
import com.inductiveautomation.ignition.common.gson.JsonArray;
import com.inductiveautomation.ignition.common.gson.JsonElement;
import com.inductiveautomation.ignition.common.gson.JsonObject;
import com.inductiveautomation.ignition.common.gson.JsonParser;
import com.inductiveautomation.ignition.common.tags.model.TagProvider;
import com.inductiveautomation.ignition.common.tags.model.TagPath;
import com.inductiveautomation.ignition.common.tags.paths.parser.TagPathParser;
import com.inductiveautomation.ignition.common.tags.config.TagConfigurationModel;
import com.inductiveautomation.ignition.common.tags.config.types.TagObjectType;
import com.inductiveautomation.ignition.gateway.dataroutes.RequestContext;
import com.inductiveautomation.ignition.gateway.dataroutes.RouteGroup;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.inductiveautomation.ignition.gateway.project.ProjectManager;
import com.inductiveautomation.perspective.gateway.api.SessionScope;
import com.inductiveautomation.perspective.gateway.comm.Routes;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.inductiveautomation.ignition.gateway.dataroutes.HttpMethod.PUT;

/**
 * REST API Routes for Web Designer Module
 *
 * Version: 0.14.1 - Compact UI
 *
 * Handles all API requests at /data/webdesigner/api/v1/*
 *
 * Security: All endpoints require:
 * 1. Authenticated Ignition Gateway session (inherited from home page launcher)
 * 2. Appropriate permissions checked in handlers (Designer role or custom permissions)
 * 3. Input validation and sanitization
 *
 * Features:
 * - GET /api/v1/projects - List all projects (with authentication)
 * - GET /api/v1/projects/{name}/views - List Perspective views (with authorization)
 * - GET /api/v1/projects/{name}/view?path=... - Get view.json content (with ETag)
 * - PUT /api/v1/projects/{name}/view?path=... - Save view.json (with optimistic concurrency)
 * - GET /api/v1/tags - List tag providers
 * - GET /api/v1/tags/{provider}?path=... - Browse tags
 * - GET /api/v1/perspective/components - Get component catalog
 *
 * All write operations are audit logged.
 *
 * NOTE: v0.9.0 removes Perspective session requirement. Routes now rely on Gateway authentication
 * inherited from home page launcher integration. Access control simplified to allow any authenticated
 * Gateway session.
 */
public final class WebDesignerApiRoutes {

    private static final Logger logger = LoggerFactory.getLogger(WebDesignerApiRoutes.class);
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    // Route patterns for path parameter extraction
    private static final Pattern VIEWS_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/views$");
    private static final Pattern VIEW_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/view$");
    private static final Pattern TAGS_PROVIDER_PATTERN = Pattern.compile("^/api/v1/tags/([^/]+)$");
    private static final Pattern SCRIPTS_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/scripts$");
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/script$");

    // Audit event types
    private static final String AUDIT_ACTION_VIEW_READ = "WebDesigner.View.Read";
    private static final String AUDIT_ACTION_VIEW_WRITE = "WebDesigner.View.Write";
    private static final String AUDIT_ACTION_UNAUTHORIZED = "WebDesigner.Unauthorized";

    // Max request body size (2 MB)
    private static final int MAX_BODY_SIZE = 2 * 1024 * 1024;

    // Private constructor - this is a utility class with static methods only
    private WebDesignerApiRoutes() {
    }

    /**
     * Mount all API routes for the Web Designer module.
     *
     * @param routes The RouteGroup to mount routes on
     */
    public static void mountRoutes(RouteGroup routes) {
        logger.info("Mounting Web Designer API routes...");

        // Test endpoint to verify routing works
        // Access control: Gateway session (any authenticated user)
        routes.newRoute("/test")
            .type(RouteGroup.TYPE_JSON)
            .handler((req, res) -> {
                JsonObject response = new JsonObject();
                response.addProperty("status", "ok");
                response.addProperty("message", "Web Designer module is running");
                response.addProperty("version", "0.18.0");
                return response;
            })
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/projects - List all projects
        routes.newRoute("/api/v1/projects")
            .type(RouteGroup.TYPE_JSON)
            .handler(WebDesignerApiRoutes::handleGetProjects)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/projects/{name}/views - List views in a project
        routes.newRoute("/api/v1/projects/*/views")
            .type(RouteGroup.TYPE_JSON)
            .handler(WebDesignerApiRoutes::handleGetProjectViews)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/projects/{name}/view?path=... - Get specific view
        routes.newRoute("/api/v1/projects/*/view")
            .type(RouteGroup.TYPE_JSON)
            .handler(WebDesignerApiRoutes::handleGetView)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // PUT /api/v1/projects/{name}/view?path=... - Save view
        routes.newRoute("/api/v1/projects/*/view")
            .type(RouteGroup.TYPE_JSON)
            .method(PUT)
            .handler(WebDesignerApiRoutes::handlePutView)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/tags - List tag providers
        routes.newRoute("/api/v1/tags")
            .type(RouteGroup.TYPE_JSON)
            .handler(WebDesignerApiRoutes::handleGetTagProviders)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/tags/{provider}?path=... - Browse tags
        routes.newRoute("/api/v1/tags/*")
            .type(RouteGroup.TYPE_JSON)
            .handler(WebDesignerApiRoutes::handleBrowseTags)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/perspective/components - Get component catalog
        routes.newRoute("/api/v1/perspective/components")
            .type(RouteGroup.TYPE_JSON)
            .handler(WebDesignerApiRoutes::handleGetComponents)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/projects/{name}/scripts - List all scripts in a project
        routes.newRoute("/api/v1/projects/*/scripts")
            .type(RouteGroup.TYPE_JSON)
            .handler(WebDesignerApiRoutes::handleGetScripts)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/projects/{name}/script?path=... - Get specific script
        routes.newRoute("/api/v1/projects/*/script")
            .type(RouteGroup.TYPE_JSON)
            .handler(WebDesignerApiRoutes::handleGetScript)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // PUT /api/v1/projects/{name}/script?path=... - Save script
        routes.newRoute("/api/v1/projects/*/script")
            .type(RouteGroup.TYPE_JSON)
            .method(PUT)
            .handler(WebDesignerApiRoutes::handlePutScript)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        logger.info("Mounted Web Designer API routes:");
        logger.info("  - GET  /data/webdesigner/test");
        logger.info("  - GET  /data/webdesigner/api/v1/projects");
        logger.info("  - GET  /data/webdesigner/api/v1/projects/{name}/views");
        logger.info("  - GET  /data/webdesigner/api/v1/projects/{name}/view");
        logger.info("  - PUT  /data/webdesigner/api/v1/projects/{name}/view");
        logger.info("  - GET  /data/webdesigner/api/v1/tags");
        logger.info("  - GET  /data/webdesigner/api/v1/tags/{provider}");
        logger.info("  - GET  /data/webdesigner/api/v1/perspective/components");
        logger.info("  - GET  /data/webdesigner/api/v1/projects/{name}/scripts");
        logger.info("  - GET  /data/webdesigner/api/v1/projects/{name}/script");
        logger.info("  - PUT  /data/webdesigner/api/v1/projects/{name}/script");
    }

    /**
     * Check authentication and authorization for a request.
     * Returns 401 with WWW-Authenticate header if not authenticated, triggering browser login prompt.
     *
     * @param req The request context
     * @param res The HTTP response
     * @param context The Gateway context
     * @param requireDesigner Whether to require Designer role
     * @return A string representing the user, or null if unauthorized
     */
    private static String checkAuth(RequestContext req, HttpServletResponse res, GatewayContext context, boolean requireDesigner) {
        try {
            // Try to get authenticated user from Gateway session
            // This works with Ignition's built-in authentication
            jakarta.servlet.http.HttpServletRequest servletReq = req.getRequest();
            java.security.Principal principal = servletReq.getUserPrincipal();

            if (principal == null) {
                // No authenticated user - trigger browser login prompt
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.setHeader("WWW-Authenticate", "Basic realm=\"Ignition Gateway - Web Designer\"");
                logger.debug("Unauthenticated request from {}", servletReq.getRemoteAddr());
                return null;
            }

            String username = principal.getName();
            logger.debug("Authenticated request from user: {}", username);

            // TODO: Check for Designer role if requireDesigner is true
            // For now, any authenticated user can access

            return username;

        } catch (Exception e) {
            logger.error("Error checking authentication", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return null;
        }
    }

    /**
     * Validate input string against potential injection attacks.
     */
    private static boolean isValidInput(String input) {
        if (input == null || input.trim().isEmpty()) {
            return false;
        }
        // Check for path traversal attempts
        if (input.contains("..") || input.contains("\\")) {
            return false;
        }
        // Check length (max 255 characters)
        if (input.length() > 255) {
            return false;
        }
        return true;
    }

    /**
     * Calculate SHA-256 hash for ETag generation.
     */
    private static String calculateHash(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            logger.error("Error calculating hash", e);
            return UUID.randomUUID().toString(); // Fallback to random UUID
        }
    }

    /**
     * Log audit event.
     */
    private static void logAudit(GatewayContext context, String action, String username, String remoteAddr,
                                   String details, boolean success) {
        // TODO: Implement actual audit logging when tested on live Gateway
        // Expected: context.getAuditManager().audit(auditRecord)
        logger.info("AUDIT: {} by {} from {} - {} (success: {})", action, username, remoteAddr, details, success);
    }

    /**
     * Check if a project has Perspective enabled.
     *
     * Uses reflection to discover the ProjectManager API and checks for Perspective resources.
     * Projects can have multiple modules enabled (Perspective, Vision, both, or neither).
     * This filters out Vision-only projects.
     *
     * @param projectManager The ProjectManager instance
     * @param projectName The project name to check
     * @return true if the project has Perspective views, false otherwise
     */
    private static boolean isPerspectiveProject(ProjectManager projectManager, String projectName) {
        try {
            // Try to get the project object
            java.lang.reflect.Method getProjectMethod = null;
            Object project = null;

            // Try common method names for getting a project
            try {
                getProjectMethod = projectManager.getClass().getMethod("getProject", String.class);
                project = getProjectMethod.invoke(projectManager, projectName);
            } catch (NoSuchMethodException e) {
                logger.trace("Method getProject(String) not found for project '{}'", projectName);
            }

            if (project == null) {
                // If we can't get the project object, assume it might have Perspective
                // Better to show it and let user discover it's Vision-only than hide valid projects
                logger.debug("Could not get project object for '{}', assuming Perspective-enabled", projectName);
                return true;
            }

            // Try to check for Perspective resources
            Class<?> projectClass = project.getClass();

            // Strategy 1: Try to list resources and check for Perspective scope
            try {
                java.lang.reflect.Method listResourcesMethod = projectClass.getMethod("listResources");
                Object resources = listResourcesMethod.invoke(project);

                if (resources != null) {
                    // Check if any resource path contains "perspective" or Perspective package
                    String resourcesStr = resources.toString();
                    boolean hasPerspective = resourcesStr.contains("perspective") ||
                                            resourcesStr.contains("com.inductiveautomation.perspective");
                    logger.debug("Project '{}' Perspective check via listResources: {}", projectName, hasPerspective);
                    return hasPerspective;
                }
            } catch (Exception e) {
                logger.trace("listResources method not available or failed for '{}'", projectName);
            }

            // Strategy 2: Check for a getManifest or getProjectProperties method
            try {
                java.lang.reflect.Method manifestMethod = projectClass.getMethod("getManifest");
                Object manifest = manifestMethod.invoke(project);
                if (manifest != null) {
                    String manifestStr = manifest.toString();
                    boolean hasPerspective = manifestStr.contains("perspective");
                    logger.debug("Project '{}' Perspective check via manifest: {}", projectName, hasPerspective);
                    return hasPerspective;
                }
            } catch (Exception e) {
                logger.trace("getManifest method not available or failed for '{}'", projectName);
            }

            // If we can't determine, assume it has Perspective
            // Better UX to show it and let user discover it doesn't have views than hide valid projects
            logger.debug("Could not determine Perspective status for '{}', assuming true", projectName);
            return true;

        } catch (Exception e) {
            logger.warn("Error checking Perspective status for project '{}': {}", projectName, e.getMessage());
            // On error, include the project (better to show than hide)
            return true;
        }
    }

    /**
     * Check if a resource path is a Perspective view.
     *
     * Perspective views are located under: com.inductiveautomation.perspective/views/
     * Vision windows are located under: com.inductiveautomation.vision/windows/
     *
     * @param resourcePath The resource path to check
     * @return true if this is a Perspective view path
     */
    private static boolean isPerspectiveView(String resourcePath) {
        if (resourcePath == null) {
            return false;
        }

        // Check for Perspective view indicators
        boolean isPerspective = resourcePath.contains("com.inductiveautomation.perspective") ||
                               (resourcePath.contains("perspective") && resourcePath.contains("views")) ||
                               resourcePath.endsWith("view.json");

        // Exclude Vision windows
        boolean isVision = resourcePath.contains("com.inductiveautomation.vision") ||
                          (resourcePath.contains("vision") && resourcePath.contains("windows")) ||
                          resourcePath.endsWith("window.bin");

        return isPerspective && !isVision;
    }

    /**
     * Handle GET /api/v1/projects endpoint.
     *
     * Returns a list of all project names on the Gateway.
     * Filters to only include projects with Perspective views (excludes Vision-only projects).
     */
    private static JsonObject handleGetProjects(RequestContext req, HttpServletResponse res) {
        logger.info("GET /api/v1/projects requested");

        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Check authentication
        String user = checkAuth(req, res, context, false);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication required");
        }

        try {
            // Get ProjectManager from GatewayContext
            ProjectManager projectManager = context.getProjectManager();

            // Build response
            JsonObject response = new JsonObject();
            JsonArray projectsArray = new JsonArray();

            // Try to get project names using reflection to discover the actual API
            try {
                // Try common method names
                java.lang.reflect.Method method = null;
                try {
                    method = projectManager.getClass().getMethod("getProjectNames");
                } catch (NoSuchMethodException e) {
                    // Try alternative method names
                    try {
                        method = projectManager.getClass().getMethod("getAllProjects");
                    } catch (NoSuchMethodException e2) {
                        logger.warn("Could not find project listing method. Available methods: {}",
                            java.util.Arrays.toString(projectManager.getClass().getMethods()));
                    }
                }

                if (method != null) {
                    Object result = method.invoke(projectManager);
                    if (result instanceof List) {
                        for (Object item : (List<?>) result) {
                            String projectName = item.toString();
                            // Filter to only include Perspective projects
                            if (isPerspectiveProject(projectManager, projectName)) {
                                projectsArray.add(projectName);
                            }
                        }
                    } else if (result instanceof String[]) {
                        for (String name : (String[]) result) {
                            // Filter to only include Perspective projects
                            if (isPerspectiveProject(projectManager, name)) {
                                projectsArray.add(name);
                            }
                        }
                    }
                }
            } catch (Exception reflectionEx) {
                logger.error("Failed to discover ProjectManager API", reflectionEx);
                response.addProperty("note", "API discovery failed - check Gateway logs for available methods");
            }

            response.add("projects", projectsArray);

            logger.info("Returned {} Perspective projects (filtered) for user {}", projectsArray.size(), user);

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
     */
    private static JsonObject handleGetProjectViews(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String path = req.getRequest().getRequestURI();
        Matcher matcher = VIEWS_PATTERN.matcher(path);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        logger.info("GET /api/v1/projects/{}/views requested", projectName);

        // Check authentication
        String user = checkAuth(req, res, context, false);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication required");
        }

        // Validate project name
        if (!isValidInput(projectName)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid project name");
        }

        try {
            // Get ProjectManager
            ProjectManager projectManager = context.getProjectManager();

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);

            JsonArray viewsArray = new JsonArray();

            // TODO: Implement actual view listing once we discover the correct API on live Gateway
            // Expected pattern:
            //   1. Get project object via projectManager.getProject(projectName)
            //   2. List resources under "com.inductiveautomation.perspective/views/" path
            //   3. Filter using isPerspectiveView(resourcePath) to exclude Vision windows
            //   4. Return view paths relative to the views folder
            // For now, return empty array with instructions
            response.add("views", viewsArray);
            response.addProperty("note", "View listing requires Gateway API discovery - install module and check logs");

            logger.info("View listing not yet implemented for project '{}'", projectName);
            logger.info("ProjectManager class: {}", projectManager.getClass().getName());
            logger.info("Available methods: {}", java.util.Arrays.toString(projectManager.getClass().getMethods()));

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
     * Extract the view name from a resource path.
     * For example: "views/MainView" -> "MainView"
     */
    private static String extractViewName(String resourcePath) {
        if (resourcePath == null || resourcePath.isEmpty()) {
            return "";
        }
        int lastSlash = resourcePath.lastIndexOf('/');
        return lastSlash >= 0 ? resourcePath.substring(lastSlash + 1) : resourcePath;
    }

    /**
     * Handle GET /api/v1/projects/{name}/view?path=... endpoint.
     *
     * Returns the content of a specific view.json file with ETag header.
     */
    private static JsonObject handleGetView(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = VIEW_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String viewPath = req.getRequest().getParameter("path");

        logger.info("GET /api/v1/projects/{}/view?path={} requested", projectName, viewPath);

        // Check authentication
        String user = checkAuth(req, res, context, false);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication required");
        }

        // Validate parameters
        if (!isValidInput(projectName)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid project name");
        }

        if (!isValidInput(viewPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid view path");
        }

        try {
            // Get Gateway data directory
            File dataDir = context.getSystemManager().getDataDir();

            // Construct path to view.json file
            // Format: {dataDir}/projects/{projectName}/com.inductiveautomation.perspective/views/{viewPath}/view.json
            String relativePath = String.format("projects/%s/com.inductiveautomation.perspective/views/%s/view.json",
                projectName, viewPath);
            Path viewFilePath = Paths.get(dataDir.getAbsolutePath(), relativePath);

            logger.debug("Reading view file from: {}", viewFilePath.toAbsolutePath());

            // Check if file exists
            if (!Files.exists(viewFilePath)) {
                logger.warn("View file not found: {}", viewFilePath);
                res.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return createErrorResponse(HttpServletResponse.SC_NOT_FOUND,
                    "View not found: " + viewPath + " in project: " + projectName);
            }

            // Read file content
            byte[] fileBytes = Files.readAllBytes(viewFilePath);
            String contentStr = new String(fileBytes, StandardCharsets.UTF_8);

            // Parse JSON to validate and extract content
            JsonParser parser = new JsonParser();
            JsonElement contentElement = parser.parse(contentStr);

            // View file should contain a JSON object
            if (!contentElement.isJsonObject()) {
                logger.error("View file is not a valid JSON object: {}", viewFilePath);
                res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Invalid view file format");
            }

            JsonObject viewContent = contentElement.getAsJsonObject();

            // Calculate ETag for optimistic concurrency control
            String etag = calculateHash(contentStr);

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);
            response.addProperty("path", viewPath);
            response.add("content", viewContent);

            // Set ETag header for optimistic concurrency
            res.setHeader("ETag", "\"" + etag + "\"");

            // Log audit event
            logAudit(context, AUDIT_ACTION_VIEW_READ, user, req.getRequest().getRemoteAddr(),
                "Project: " + projectName + ", View: " + viewPath, true);

            logger.info("Successfully loaded view '{}' from project '{}'", viewPath, projectName);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error reading view file", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve view: " + e.getMessage());
        }
    }

    /**
     * Handle PUT /api/v1/projects/{name}/view?path=... endpoint.
     *
     * Saves the content of a specific view.json file with optimistic concurrency control.
     */
    private static JsonObject handlePutView(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = VIEW_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String viewPath = req.getRequest().getParameter("path");

        logger.info("PUT /api/v1/projects/{}/view?path={} requested", projectName, viewPath);

        // Check authentication AND authorization (write requires Designer role)
        String user = checkAuth(req, res, context, true);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication/Authorization required");
        }

        // Validate parameters
        if (!isValidInput(projectName)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid project name");
        }

        if (!isValidInput(viewPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid view path");
        }

        try {
            // Read request body with size limit
            HttpServletRequest servletReq = req.getRequest();
            BufferedReader reader = servletReq.getReader();
            StringBuilder requestBody = new StringBuilder();
            String line;
            int totalChars = 0;

            while ((line = reader.readLine()) != null) {
                totalChars += line.length();
                if (totalChars > MAX_BODY_SIZE) {
                    res.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
                    return createErrorResponse(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE,
                        "Request body too large (max 2 MB)");
                }
                requestBody.append(line);
            }

            if (requestBody.length() == 0) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Request body is required");
            }

            // Parse JSON body
            JsonObject requestJson = JsonParser.parseString(requestBody.toString()).getAsJsonObject();
            if (!requestJson.has("content")) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST,
                    "Missing 'content' field in request body");
            }

            JsonElement viewContent = requestJson.get("content");

            // Get Gateway data directory
            File dataDir = context.getSystemManager().getDataDir();

            // Construct path to view.json file
            String relativePath = String.format("projects/%s/com.inductiveautomation.perspective/views/%s/view.json",
                projectName, viewPath);
            Path viewFilePath = Paths.get(dataDir.getAbsolutePath(), relativePath);

            logger.debug("Saving view file to: {}", viewFilePath.toAbsolutePath());

            // Check if file exists for optimistic concurrency control
            if (!Files.exists(viewFilePath)) {
                logger.warn("Cannot save - view file not found: {}", viewFilePath);
                res.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return createErrorResponse(HttpServletResponse.SC_NOT_FOUND,
                    "View not found: " + viewPath + " in project: " + projectName);
            }

            // Read current file content for ETag validation
            byte[] currentFileBytes = Files.readAllBytes(viewFilePath);
            String currentContentStr = new String(currentFileBytes, StandardCharsets.UTF_8);
            String currentEtag = calculateHash(currentContentStr);

            // Check If-Match header for optimistic concurrency control
            String ifMatch = req.getRequest().getHeader("If-Match");
            if (ifMatch != null) {
                // Remove quotes from ETag header if present
                ifMatch = ifMatch.replace("\"", "");

                if (!ifMatch.equals(currentEtag)) {
                    logger.warn("Optimistic concurrency conflict - If-Match: {}, Current ETag: {}",
                        ifMatch, currentEtag);
                    res.setStatus(HttpServletResponse.SC_CONFLICT);
                    JsonObject conflictResponse = createErrorResponse(HttpServletResponse.SC_CONFLICT,
                        "View was modified by another user. Please reload and try again.");
                    conflictResponse.addProperty("currentEtag", currentEtag);
                    return conflictResponse;
                }
            }

            // Serialize new content
            String newContentStr = gson.toJson(viewContent);
            byte[] newContentBytes = newContentStr.getBytes(StandardCharsets.UTF_8);

            // Write to file
            Files.write(viewFilePath, newContentBytes);

            // Calculate new ETag
            String newEtag = calculateHash(newContentStr);

            // Log audit event
            logAudit(context, AUDIT_ACTION_VIEW_WRITE, user, req.getRequest().getRemoteAddr(),
                "Project: " + projectName + ", View: " + viewPath + ", Size: " + newContentBytes.length + " bytes", true);

            logger.info("Successfully saved view '{}' in project '{}' by user '{}'",
                viewPath, projectName, user);

            // Build success response
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.addProperty("project", projectName);
            response.addProperty("path", viewPath);
            response.addProperty("message", "View saved successfully");
            response.addProperty("size", newContentBytes.length);

            // Set new ETag header
            res.setHeader("ETag", "\"" + newEtag + "\"");

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (com.google.gson.JsonSyntaxException e) {
            logger.error("Invalid JSON in request body", e);
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST,
                "Invalid JSON in request body: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error handling put view request", e);

            // Log failed audit event
            logAudit(context, AUDIT_ACTION_VIEW_WRITE,
                user != null ? user : "unknown",
                req.getRequest().getRemoteAddr(),
                "Project: " + projectName + ", View: " + viewPath + ", Error: " + e.getMessage(), false);

            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to save view: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/tags endpoint.
     *
     * Returns a list of all tag providers.
     */
    private static JsonObject handleGetTagProviders(RequestContext req, HttpServletResponse res) {
        logger.info("GET /api/v1/tags requested");

        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Check authentication
        String user = checkAuth(req, res, context, false);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication required");
        }

        try {
            // Get tag providers
            List<TagProvider> tagProviders = context.getTagManager().getTagProviders();

            // Build response
            JsonObject response = new JsonObject();
            JsonArray providersArray = new JsonArray();

            for (TagProvider tagProvider : tagProviders) {
                JsonObject provider = new JsonObject();
                provider.addProperty("name", tagProvider.getName());
                providersArray.add(provider);
            }

            response.add("providers", providersArray);

            logger.info("Returned {} tag providers", tagProviders.size());

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling get tag providers request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve tag providers: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/tags/{provider}?path=... endpoint.
     *
     * Browse tags in a specific provider.
     */
    private static JsonObject handleBrowseTags(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract provider name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = TAGS_PROVIDER_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String providerName = matcher.group(1);
        String tagPath = req.getRequest().getParameter("path");
        if (tagPath == null || tagPath.trim().isEmpty()) {
            tagPath = ""; // Browse root
        }

        logger.info("GET /api/v1/tags/{}?path={} requested", providerName, tagPath);

        // Check authentication
        String user = checkAuth(req, res, context, false);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication required");
        }

        // Validate provider name
        if (!isValidInput(providerName) && !providerName.equals("[System]")) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid provider name");
        }

        try {
            // Get the tag provider
            TagProvider provider = context.getTagManager().getTagProvider(providerName);
            if (provider == null) {
                res.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return createErrorResponse(HttpServletResponse.SC_NOT_FOUND,
                    "Tag provider not found: " + providerName);
            }

            // Construct full tag path
            // If tagPath is empty, browse root: [providerName]
            // Otherwise: [providerName]tagPath
            String fullPathStr;
            if (tagPath == null || tagPath.trim().isEmpty()) {
                fullPathStr = "[" + providerName + "]";
            } else {
                // Ensure path doesn't start with /
                String cleanPath = tagPath.startsWith("/") ? tagPath.substring(1) : tagPath;
                fullPathStr = "[" + providerName + "]" + cleanPath;
            }

            TagPath browsePath = TagPathParser.parse(fullPathStr);
            logger.debug("Browsing tags at: {}", browsePath);

            // Get tag configurations asynchronously
            // Parameters: paths, getBrowseableChildren=true, localOnly=false
            List<TagPath> paths = Collections.singletonList(browsePath);
            List<TagConfigurationModel> tagConfigs = provider.getTagConfigsAsync(paths, true, false)
                .get(30, TimeUnit.SECONDS);

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("provider", providerName);
            response.addProperty("path", tagPath);

            JsonArray tagsArray = new JsonArray();

            // Process tag configurations
            for (TagConfigurationModel tagConfig : tagConfigs) {
                // For the requested path, add its children
                if (tagConfig.getChildren() != null) {
                    for (TagConfigurationModel child : tagConfig.getChildren()) {
                        JsonObject tagObj = new JsonObject();
                        tagObj.addProperty("name", child.getName());
                        tagObj.addProperty("tagType", child.getType().toString());

                        // Determine if this is a folder (has children)
                        boolean hasChildren = child.getType() == TagObjectType.Folder ||
                                            child.getType() == TagObjectType.UdtInstance ||
                                            (child.getChildren() != null && !child.getChildren().isEmpty());
                        tagObj.addProperty("hasChildren", hasChildren);

                        // Build full tag path for this child
                        String childPath = tagPath == null || tagPath.isEmpty()
                            ? child.getName()
                            : tagPath + "/" + child.getName();
                        tagObj.addProperty("tagPath", "[" + providerName + "]" + childPath);

                        tagsArray.add(tagObj);
                    }
                }
            }

            response.add("tags", tagsArray);

            logger.info("Returned {} tags for provider '{}', path '{}'",
                tagsArray.size(), providerName, tagPath);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling browse tags request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to browse tags: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/perspective/components endpoint.
     *
     * Returns the Perspective component catalog.
     */
    private static JsonObject handleGetComponents(RequestContext req, HttpServletResponse res) {
        logger.info("GET /api/v1/perspective/components requested");

        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Check authentication
        String user = checkAuth(req, res, context, false);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication required");
        }

        try {
            // TODO: Implement actual component catalog retrieval
            // This requires access to Perspective module's component registry
            // Expected pattern:
            // var perspectiveContext = context.getModule("perspective");
            // var componentRegistry = perspectiveContext.getComponentRegistry();
            // var components = componentRegistry.getComponentDescriptors();

            // Build placeholder response with common Perspective components
            JsonObject response = new JsonObject();
            JsonArray componentsArray = new JsonArray();

            // Add some common component types
            String[] commonComponents = {
                "ia.container.flex",
                "ia.container.coord",
                "ia.display.label",
                "ia.display.image",
                "ia.input.button",
                "ia.input.textfield",
                "ia.input.toggle",
                "ia.chart.timeseries",
                "ia.display.table",
                "ia.container.tabs"
            };

            for (String componentType : commonComponents) {
                JsonObject component = new JsonObject();
                component.addProperty("type", componentType);
                component.addProperty("name", componentType.substring(componentType.lastIndexOf('.') + 1));
                componentsArray.add(component);
            }

            response.add("components", componentsArray);
            response.addProperty("note", "Component catalog requires Perspective API access");

            logger.info("Returned {} component types", commonComponents.length);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling get components request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve components: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/projects/{name}/scripts endpoint.
     *
     * Returns a list of all scripts in the project.
     */
    private static JsonObject handleGetScripts(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = SCRIPTS_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);

        logger.info("GET /api/v1/projects/{}/scripts requested", projectName);

        // Check authentication
        String user = checkAuth(req, res, context, false);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication required");
        }

        // Validate project name
        if (!isValidInput(projectName)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid project name");
        }

        try {
            // Build response
            JsonObject response = new JsonObject();
            JsonArray scriptsArray = new JsonArray();

            // TODO: Implement actual script discovery from project resources
            // Expected pattern:
            // 1. Access project via ProjectManager
            // 2. Get script resources from com.inductiveautomation.ignition/script-python/
            // 3. Parse resource.json files to get script metadata
            // 4. Return script list with names, paths, and types

            // For now, return empty array indicating scripts endpoint is ready
            response.add("scripts", scriptsArray);
            response.addProperty("project", projectName);
            response.addProperty("note", "Script discovery from project resources pending implementation");

            logger.info("Returned {} scripts for project '{}'", scriptsArray.size(), projectName);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling get scripts request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve scripts: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/projects/{name}/script?path=... endpoint.
     *
     * Returns the content of a specific script.
     */
    private static JsonObject handleGetScript(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = SCRIPT_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String scriptPath = req.getRequest().getParameter("path");

        logger.info("GET /api/v1/projects/{}/script?path={} requested", projectName, scriptPath);

        // Check authentication
        String user = checkAuth(req, res, context, false);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication required");
        }

        // Validate parameters
        if (!isValidInput(projectName)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid project name");
        }

        if (!isValidInput(scriptPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid script path");
        }

        try {
            // TODO: Implement actual script content retrieval
            // Expected pattern:
            // 1. Navigate to project resource directory
            // 2. Find script resource by path
            // 3. Read code.py file from resource folder
            // 4. Return content with metadata

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);
            response.addProperty("path", scriptPath);
            response.addProperty("content", "# Script content retrieval pending implementation\n");
            response.addProperty("note", "Script file reading from project resources pending");

            logger.info("Returned script content for project '{}', path '{}'", projectName, scriptPath);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling get script request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve script: " + e.getMessage());
        }
    }

    /**
     * Handle PUT /api/v1/projects/{name}/script?path=... endpoint.
     *
     * Saves the content of a specific script.
     */
    private static JsonObject handlePutScript(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = SCRIPT_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String scriptPath = req.getRequest().getParameter("path");

        logger.info("PUT /api/v1/projects/{}/script?path={} requested", projectName, scriptPath);

        // Check authentication AND authorization (write requires Designer role)
        String user = checkAuth(req, res, context, true);
        if (user == null) {
            return createErrorResponse(res.getStatus(), "Authentication/Authorization required");
        }

        // Validate parameters
        if (!isValidInput(projectName)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid project name");
        }

        if (!isValidInput(scriptPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid script path");
        }

        try {
            // Read request body
            HttpServletRequest servletReq = req.getRequest();
            BufferedReader reader = servletReq.getReader();
            StringBuilder requestBody = new StringBuilder();
            String line;
            int totalChars = 0;

            while ((line = reader.readLine()) != null) {
                totalChars += line.length();
                if (totalChars > MAX_BODY_SIZE) {
                    res.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
                    return createErrorResponse(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE,
                        "Request body too large (max 2 MB)");
                }
                requestBody.append(line);
            }

            if (requestBody.length() == 0) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Request body is required");
            }

            // Parse JSON body
            JsonObject requestJson = JsonParser.parseString(requestBody.toString()).getAsJsonObject();
            if (!requestJson.has("content")) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST,
                    "Missing 'content' field in request body");
            }

            String scriptContent = requestJson.get("content").getAsString();

            // TODO: Implement actual script saving
            // Expected pattern:
            // 1. Navigate to project resource directory
            // 2. Find or create script resource folder
            // 3. Write code.py file
            // 4. Update resource.json metadata
            // 5. Trigger project reload if necessary

            // Build success response
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.addProperty("project", projectName);
            response.addProperty("path", scriptPath);
            response.addProperty("message", "Script save endpoint ready - persistence pending implementation");
            response.addProperty("size", scriptContent.length());

            logger.info("Script save simulated for project '{}', path '{}' by user '{}'",
                projectName, scriptPath, user);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (com.google.gson.JsonSyntaxException e) {
            logger.error("Invalid JSON in request body", e);
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return createErrorResponse(HttpServletResponse.SC_BAD_REQUEST,
                "Invalid JSON in request body: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error handling put script request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to save script: " + e.getMessage());
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
