package com.me.webdesigner.handlers;

import com.inductiveautomation.ignition.common.gson.*;
import com.inductiveautomation.ignition.gateway.dataroutes.RequestContext;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.inductiveautomation.ignition.gateway.project.ProjectManager;
import com.me.webdesigner.util.ResponseUtil;
import com.me.webdesigner.util.SecurityUtil;
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
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Handler for project and view-related API endpoints.
 *
 * Handles:
 * - GET /api/v1/projects - List all projects
 * - GET /api/v1/projects/{name}/views - List views in a project
 * - GET /api/v1/projects/{name}/view?path=... - Get specific view
 * - PUT /api/v1/projects/{name}/view?path=... - Save view
 */
public final class ProjectHandler {

    private static final Logger logger = LoggerFactory.getLogger(ProjectHandler.class);
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    // Route patterns for path parameter extraction
    private static final Pattern VIEWS_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/views$");
    private static final Pattern VIEW_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/view$");

    // Audit event types
    private static final String AUDIT_ACTION_VIEW_READ = "WebDesigner.View.Read";
    private static final String AUDIT_ACTION_VIEW_WRITE = "WebDesigner.View.Write";

    // Max request body size (2 MB)
    private static final int MAX_BODY_SIZE = 2 * 1024 * 1024;

    // Private constructor - utility class
    private ProjectHandler() {
    }

    /**
     * Handle GET /api/v1/projects endpoint.
     *
     * Returns a list of all project names on the Gateway.
     * Filters to only include projects with Perspective views (excludes Vision-only projects).
     */
    public static JsonObject handleGetProjects(RequestContext req, HttpServletResponse res) {
        logger.info("GET /api/v1/projects requested");

        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Check authentication
        String user = SecurityUtil.checkAuth(req.getRequest(), res, context, false);
        if (user == null) {
            return ResponseUtil.createErrorResponse(res.getStatus(), "Authentication required");
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
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve projects: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/projects/{name}/views endpoint.
     *
     * Returns a list of all Perspective views in the specified project.
     */
    public static JsonObject handleGetProjectViews(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String path = req.getRequest().getRequestURI();
        Matcher matcher = VIEWS_PATTERN.matcher(path);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        logger.info("GET /api/v1/projects/{}/views requested", projectName);

        // Check authentication
        String user = SecurityUtil.checkAuth(req.getRequest(), res, context, false);
        if (user == null) {
            return ResponseUtil.createErrorResponse(res.getStatus(), "Authentication required");
        }

        // Validate project name
        if (!SecurityUtil.isValidInput(projectName)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid project name");
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
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve views: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/projects/{name}/view?path=... endpoint.
     *
     * Returns the content of a specific view.json file with ETag header.
     */
    public static JsonObject handleGetView(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = VIEW_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String viewPath = req.getRequest().getParameter("path");

        logger.info("GET /api/v1/projects/{}/view?path={} requested", projectName, viewPath);

        // Check authentication
        String user = SecurityUtil.checkAuth(req.getRequest(), res, context, false);
        if (user == null) {
            return ResponseUtil.createErrorResponse(res.getStatus(), "Authentication required");
        }

        // Validate parameters
        if (!SecurityUtil.isValidInput(projectName)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid project name");
        }

        if (!SecurityUtil.isValidInput(viewPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid view path");
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
                return ResponseUtil.createErrorResponse(HttpServletResponse.SC_NOT_FOUND,
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
                return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Invalid view file format");
            }

            JsonObject viewContent = contentElement.getAsJsonObject();

            // Calculate ETag for optimistic concurrency control
            String etag = ResponseUtil.calculateHash(contentStr);

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);
            response.addProperty("path", viewPath);
            response.add("content", viewContent);

            // Set ETag header for optimistic concurrency
            res.setHeader("ETag", "\"" + etag + "\"");

            // Log audit event
            SecurityUtil.logAudit(context, AUDIT_ACTION_VIEW_READ, user, req.getRequest().getRemoteAddr(),
                "Project: " + projectName + ", View: " + viewPath, true);

            logger.info("Successfully loaded view '{}' from project '{}'", viewPath, projectName);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error reading view file", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve view: " + e.getMessage());
        }
    }

    /**
     * Handle PUT /api/v1/projects/{name}/view?path=... endpoint.
     *
     * Saves the content of a specific view.json file with optimistic concurrency control.
     */
    public static JsonObject handlePutView(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = VIEW_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String viewPath = req.getRequest().getParameter("path");

        logger.info("PUT /api/v1/projects/{}/view?path={} requested", projectName, viewPath);

        // Check authentication AND authorization (write requires Designer role)
        String user = SecurityUtil.checkAuth(req.getRequest(), res, context, true);
        if (user == null) {
            return ResponseUtil.createErrorResponse(res.getStatus(), "Authentication/Authorization required");
        }

        // Validate parameters
        if (!SecurityUtil.isValidInput(projectName)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid project name");
        }

        if (!SecurityUtil.isValidInput(viewPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid view path");
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
                    return ResponseUtil.createErrorResponse(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE,
                        "Request body too large (max 2 MB)");
                }
                requestBody.append(line);
            }

            if (requestBody.length() == 0) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Request body is required");
            }

            // Parse JSON body
            JsonObject requestJson = JsonParser.parseString(requestBody.toString()).getAsJsonObject();
            if (!requestJson.has("content")) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST,
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
                return ResponseUtil.createErrorResponse(HttpServletResponse.SC_NOT_FOUND,
                    "View not found: " + viewPath + " in project: " + projectName);
            }

            // Read current file content for ETag validation
            byte[] currentFileBytes = Files.readAllBytes(viewFilePath);
            String currentContentStr = new String(currentFileBytes, StandardCharsets.UTF_8);
            String currentEtag = ResponseUtil.calculateHash(currentContentStr);

            // Check If-Match header for optimistic concurrency control
            String ifMatch = req.getRequest().getHeader("If-Match");
            if (ifMatch != null) {
                // Remove quotes from ETag header if present
                ifMatch = ifMatch.replace("\"", "");

                if (!ifMatch.equals(currentEtag)) {
                    logger.warn("Optimistic concurrency conflict - If-Match: {}, Current ETag: {}",
                        ifMatch, currentEtag);
                    res.setStatus(HttpServletResponse.SC_CONFLICT);
                    JsonObject conflictResponse = ResponseUtil.createErrorResponse(HttpServletResponse.SC_CONFLICT,
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
            String newEtag = ResponseUtil.calculateHash(newContentStr);

            // Log audit event
            SecurityUtil.logAudit(context, AUDIT_ACTION_VIEW_WRITE, user, req.getRequest().getRemoteAddr(),
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
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST,
                "Invalid JSON in request body: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error handling put view request", e);

            // Log failed audit event
            SecurityUtil.logAudit(context, AUDIT_ACTION_VIEW_WRITE,
                user != null ? user : "unknown",
                req.getRequest().getRemoteAddr(),
                "Project: " + projectName + ", View: " + viewPath + ", Error: " + e.getMessage(), false);

            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to save view: " + e.getMessage());
        }
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
}
