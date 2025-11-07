package com.me.webdesigner.handlers;

import com.inductiveautomation.ignition.common.gson.JsonArray;
import com.inductiveautomation.ignition.common.gson.JsonObject;
import com.inductiveautomation.ignition.common.gson.JsonParser;
import com.inductiveautomation.ignition.gateway.dataroutes.RequestContext;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.me.webdesigner.util.ResponseUtil;
import com.me.webdesigner.util.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Handler for script management API endpoints.
 *
 * Handles:
 * - GET /api/v1/projects/{name}/scripts - List all scripts in a project
 * - GET /api/v1/projects/{name}/script?path=... - Get specific script
 * - PUT /api/v1/projects/{name}/script?path=... - Save script
 */
public final class ScriptHandler {

    private static final Logger logger = LoggerFactory.getLogger(ScriptHandler.class);

    // Route patterns for path parameter extraction
    private static final Pattern SCRIPTS_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/scripts$");
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/script$");

    // Max request body size (2 MB)
    private static final int MAX_BODY_SIZE = 2 * 1024 * 1024;

    // Private constructor - utility class
    private ScriptHandler() {
    }

    /**
     * Handle GET /api/v1/projects/{name}/scripts endpoint.
     *
     * Returns a list of all scripts in the project.
     */
    public static JsonObject handleGetScripts(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = SCRIPTS_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);

        logger.info("GET /api/v1/projects/{}/scripts requested", projectName);

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
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve scripts: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/projects/{name}/script?path=... endpoint.
     *
     * Returns the content of a specific script.
     */
    public static JsonObject handleGetScript(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = SCRIPT_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String scriptPath = req.getRequest().getParameter("path");

        logger.info("GET /api/v1/projects/{}/script?path={} requested", projectName, scriptPath);

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

        if (!SecurityUtil.isValidInput(scriptPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid script path");
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
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve script: " + e.getMessage());
        }
    }

    /**
     * Handle PUT /api/v1/projects/{name}/script?path=... endpoint.
     *
     * Saves the content of a specific script.
     */
    public static JsonObject handlePutScript(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = SCRIPT_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String scriptPath = req.getRequest().getParameter("path");

        logger.info("PUT /api/v1/projects/{}/script?path={} requested", projectName, scriptPath);

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

        if (!SecurityUtil.isValidInput(scriptPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid script path");
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
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST,
                "Invalid JSON in request body: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error handling put script request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to save script: " + e.getMessage());
        }
    }
}
