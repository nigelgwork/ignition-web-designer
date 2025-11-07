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
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
            // Get Gateway data directory
            File dataDir = context.getSystemManager().getDataDir();

            // Construct path to scripts directory
            // Format: {dataDir}/projects/{projectName}/com.inductiveautomation.ignition/script-python/
            String relativePath = String.format("projects/%s/com.inductiveautomation.ignition/script-python",
                projectName);
            Path scriptsBasePath = Paths.get(dataDir.getAbsolutePath(), relativePath);

            logger.debug("Listing scripts from: {}", scriptsBasePath.toAbsolutePath());

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);
            JsonArray scriptsArray = new JsonArray();

            // Check if scripts directory exists
            if (Files.exists(scriptsBasePath) && Files.isDirectory(scriptsBasePath)) {
                // Recursively find all code.py files
                try {
                    java.util.stream.Stream<Path> paths = Files.walk(scriptsBasePath);
                    paths
                        .filter(Files::isRegularFile)
                        .filter(path -> path.getFileName().toString().equals("code.py"))
                        .forEach(scriptFile -> {
                            try {
                                // Get parent directory (the script directory)
                                Path scriptDir = scriptFile.getParent();
                                // Calculate relative path from scripts base
                                Path relativeScript = scriptsBasePath.relativize(scriptDir);
                                String scriptPath = relativeScript.toString().replace("\\", "/");

                                // Create script object with metadata
                                JsonObject scriptObj = new JsonObject();
                                scriptObj.addProperty("path", scriptPath);
                                scriptObj.addProperty("name", scriptDir.getFileName().toString());
                                scriptObj.addProperty("type", "project");  // Could be "project", "gateway", "transform"

                                // Try to read resource.json for additional metadata
                                Path resourceJson = scriptDir.resolve("resource.json");
                                if (Files.exists(resourceJson)) {
                                    try {
                                        byte[] jsonBytes = Files.readAllBytes(resourceJson);
                                        String jsonContent = new String(jsonBytes, StandardCharsets.UTF_8);
                                        JsonObject resourceMeta = JsonParser.parseString(jsonContent).getAsJsonObject();

                                        // Extract metadata if available
                                        if (resourceMeta.has("scope")) {
                                            scriptObj.addProperty("scope", resourceMeta.get("scope").getAsString());
                                        }
                                        if (resourceMeta.has("documentation")) {
                                            scriptObj.addProperty("documentation",
                                                resourceMeta.get("documentation").getAsString());
                                        }
                                    } catch (Exception parseEx) {
                                        logger.debug("Could not parse resource.json for script: {}", scriptPath);
                                    }
                                }

                                scriptsArray.add(scriptObj);
                            } catch (Exception e) {
                                logger.warn("Error processing script at {}: {}", scriptFile, e.getMessage());
                            }
                        });
                    paths.close();
                } catch (Exception walkEx) {
                    logger.error("Error walking scripts directory", walkEx);
                }

                logger.info("Found {} scripts in project '{}'", scriptsArray.size(), projectName);
            } else {
                logger.warn("Scripts directory not found: {}", scriptsBasePath);
                response.addProperty("note", "Project does not exist or has no scripts");
            }

            response.add("scripts", scriptsArray);

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
            // Get Gateway data directory
            File dataDir = context.getSystemManager().getDataDir();

            // Construct path to script file
            // Format: {dataDir}/projects/{projectName}/com.inductiveautomation.ignition/script-python/{scriptPath}/code.py
            String relativePath = String.format("projects/%s/com.inductiveautomation.ignition/script-python/%s/code.py",
                projectName, scriptPath);
            Path scriptFilePath = Paths.get(dataDir.getAbsolutePath(), relativePath);

            logger.debug("Reading script file from: {}", scriptFilePath.toAbsolutePath());

            // Check if file exists
            if (!Files.exists(scriptFilePath)) {
                logger.warn("Script file not found: {}", scriptFilePath);
                res.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return ResponseUtil.createErrorResponse(HttpServletResponse.SC_NOT_FOUND,
                    "Script not found: " + scriptPath + " in project: " + projectName);
            }

            // Read file content
            byte[] fileBytes = Files.readAllBytes(scriptFilePath);
            String scriptContent = new String(fileBytes, StandardCharsets.UTF_8);

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);
            response.addProperty("path", scriptPath);
            response.addProperty("content", scriptContent);

            // Try to read resource.json for metadata
            Path resourceJsonPath = scriptFilePath.getParent().resolve("resource.json");
            if (Files.exists(resourceJsonPath)) {
                try {
                    byte[] jsonBytes = Files.readAllBytes(resourceJsonPath);
                    String jsonContent = new String(jsonBytes, StandardCharsets.UTF_8);
                    JsonObject resourceMeta = JsonParser.parseString(jsonContent).getAsJsonObject();
                    response.add("metadata", resourceMeta);
                } catch (Exception parseEx) {
                    logger.debug("Could not parse resource.json for script: {}", scriptPath);
                }
            }

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

            // Get Gateway data directory
            File dataDir = context.getSystemManager().getDataDir();

            // Construct path to script file
            // Format: {dataDir}/projects/{projectName}/com.inductiveautomation.ignition/script-python/{scriptPath}/code.py
            String relativePath = String.format("projects/%s/com.inductiveautomation.ignition/script-python/%s",
                projectName, scriptPath);
            Path scriptDirPath = Paths.get(dataDir.getAbsolutePath(), relativePath);
            Path scriptFilePath = scriptDirPath.resolve("code.py");

            logger.debug("Saving script file to: {}", scriptFilePath.toAbsolutePath());

            // Create directory if it doesn't exist
            if (!Files.exists(scriptDirPath)) {
                logger.info("Creating script directory: {}", scriptDirPath);
                Files.createDirectories(scriptDirPath);
            }

            // Check if file exists (for logging)
            boolean isNewScript = !Files.exists(scriptFilePath);

            // Write script content to file
            Files.write(scriptFilePath, scriptContent.getBytes(StandardCharsets.UTF_8));

            // Audit log the write operation
            SecurityUtil.logAudit(context, user, "WebDesigner.Script.Write",
                String.format("Saved script: project=%s, path=%s, size=%d bytes, new=%b",
                    projectName, scriptPath, scriptContent.length(), isNewScript));

            // Build success response
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.addProperty("project", projectName);
            response.addProperty("path", scriptPath);
            response.addProperty("message", isNewScript ? "Script created successfully" : "Script updated successfully");
            response.addProperty("size", scriptContent.length());

            logger.info("Script saved for project '{}', path '{}' by user '{}' ({})",
                projectName, scriptPath, user, isNewScript ? "new" : "updated");

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
