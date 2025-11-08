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
 * Handler for named query management API endpoints.
 *
 * Handles:
 * - GET /api/v1/projects/{name}/queries - List all queries in a project
 * - GET /api/v1/projects/{name}/query?path=... - Get specific query
 * - PUT /api/v1/projects/{name}/query?path=... - Save query
 */
public final class QueryHandler {

    private static final Logger logger = LoggerFactory.getLogger(QueryHandler.class);

    // Route patterns for path parameter extraction
    private static final Pattern QUERIES_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/queries$");
    private static final Pattern QUERY_PATTERN = Pattern.compile("^/api/v1/projects/([^/]+)/query$");

    // Max request body size (2 MB)
    private static final int MAX_BODY_SIZE = 2 * 1024 * 1024;

    // Private constructor - utility class
    private QueryHandler() {
    }

    /**
     * Handle GET /api/v1/projects/{name}/queries endpoint.
     *
     * Returns a list of all named queries in the project.
     */
    public static JsonObject handleGetQueries(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = QUERIES_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);

        logger.info("GET /api/v1/projects/{}/queries requested", projectName);

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

            // Construct path to queries directory
            // Format: {dataDir}/projects/{projectName}/com.inductiveautomation.ignition/named-query/
            String relativePath = String.format("projects/%s/com.inductiveautomation.ignition/named-query",
                projectName);
            Path queriesBasePath = Paths.get(dataDir.getAbsolutePath(), relativePath);

            logger.debug("Listing queries from: {}", queriesBasePath.toAbsolutePath());

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);
            JsonArray queriesArray = new JsonArray();

            // Check if queries directory exists
            if (Files.exists(queriesBasePath) && Files.isDirectory(queriesBasePath)) {
                // Recursively find all query.props files
                try {
                    java.util.stream.Stream<Path> paths = Files.walk(queriesBasePath);
                    paths
                        .filter(Files::isRegularFile)
                        .filter(path -> path.getFileName().toString().equals("query.props"))
                        .forEach(queryFile -> {
                            try {
                                // Get parent directory (the query directory)
                                Path queryDir = queryFile.getParent();
                                // Calculate relative path from queries base
                                Path relativeQuery = queriesBasePath.relativize(queryDir);
                                String queryPath = relativeQuery.toString().replace("\\", "/");

                                // Create query object with metadata
                                JsonObject queryObj = new JsonObject();
                                queryObj.addProperty("path", queryPath);
                                queryObj.addProperty("name", queryDir.getFileName().toString());
                                queryObj.addProperty("type", "named-query");

                                // Try to read resource.json for additional metadata
                                Path resourceJson = queryDir.resolve("resource.json");
                                if (Files.exists(resourceJson)) {
                                    try {
                                        byte[] jsonBytes = Files.readAllBytes(resourceJson);
                                        String jsonContent = new String(jsonBytes, StandardCharsets.UTF_8);
                                        JsonObject resourceMeta = JsonParser.parseString(jsonContent).getAsJsonObject();

                                        // Extract metadata if available
                                        if (resourceMeta.has("scope")) {
                                            queryObj.addProperty("scope", resourceMeta.get("scope").getAsString());
                                        }
                                        if (resourceMeta.has("documentation")) {
                                            queryObj.addProperty("documentation",
                                                resourceMeta.get("documentation").getAsString());
                                        }
                                    } catch (Exception parseEx) {
                                        logger.debug("Could not parse resource.json for query: {}", queryPath);
                                    }
                                }

                                queriesArray.add(queryObj);
                            } catch (Exception e) {
                                logger.warn("Error processing query at {}: {}", queryFile, e.getMessage());
                            }
                        });
                    paths.close();
                } catch (Exception walkEx) {
                    logger.error("Error walking queries directory", walkEx);
                }

                logger.info("Found {} queries in project '{}'", queriesArray.size(), projectName);
            } else {
                logger.warn("Queries directory not found: {}", queriesBasePath);
                response.addProperty("note", "Project does not exist or has no named queries");
            }

            response.add("queries", queriesArray);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling get queries request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve queries: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/projects/{name}/query?path=... endpoint.
     *
     * Returns the content of a specific named query.
     */
    public static JsonObject handleGetQuery(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = QUERY_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String queryPath = req.getRequest().getParameter("path");

        logger.info("GET /api/v1/projects/{}/query?path={} requested", projectName, queryPath);

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

        if (!SecurityUtil.isValidInput(queryPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid query path");
        }

        try {
            // Get Gateway data directory
            File dataDir = context.getSystemManager().getDataDir();

            // Construct path to query file
            // Format: {dataDir}/projects/{projectName}/com.inductiveautomation.ignition/named-query/{queryPath}/query.props
            String relativePath = String.format("projects/%s/com.inductiveautomation.ignition/named-query/%s/query.props",
                projectName, queryPath);
            Path queryFilePath = Paths.get(dataDir.getAbsolutePath(), relativePath);

            logger.debug("Reading query file from: {}", queryFilePath.toAbsolutePath());

            // Check if file exists
            if (!Files.exists(queryFilePath)) {
                logger.warn("Query file not found: {}", queryFilePath);
                res.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return ResponseUtil.createErrorResponse(HttpServletResponse.SC_NOT_FOUND,
                    "Query not found: " + queryPath + " in project: " + projectName);
            }

            // Read file content
            byte[] fileBytes = Files.readAllBytes(queryFilePath);
            String queryContent = new String(fileBytes, StandardCharsets.UTF_8);

            // Build response
            JsonObject response = new JsonObject();
            response.addProperty("project", projectName);
            response.addProperty("path", queryPath);
            response.addProperty("content", queryContent);

            // Try to read resource.json for metadata
            Path resourceJsonPath = queryFilePath.getParent().resolve("resource.json");
            if (Files.exists(resourceJsonPath)) {
                try {
                    byte[] jsonBytes = Files.readAllBytes(resourceJsonPath);
                    String jsonContent = new String(jsonBytes, StandardCharsets.UTF_8);
                    JsonObject resourceMeta = JsonParser.parseString(jsonContent).getAsJsonObject();
                    response.add("metadata", resourceMeta);
                } catch (Exception parseEx) {
                    logger.debug("Could not parse resource.json for query: {}", queryPath);
                }
            }

            logger.info("Returned query content for project '{}', path '{}'", projectName, queryPath);

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (Exception e) {
            logger.error("Error handling get query request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve query: " + e.getMessage());
        }
    }

    /**
     * Handle PUT /api/v1/projects/{name}/query?path=... endpoint.
     *
     * Saves the content of a specific named query.
     */
    public static JsonObject handlePutQuery(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract project name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = QUERY_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String projectName = matcher.group(1);
        String queryPath = req.getRequest().getParameter("path");

        logger.info("PUT /api/v1/projects/{}/query?path={} requested", projectName, queryPath);

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

        if (!SecurityUtil.isValidInput(queryPath)) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid query path");
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

            String queryContent = requestJson.get("content").getAsString();

            // Get Gateway data directory
            File dataDir = context.getSystemManager().getDataDir();

            // Construct path to query file
            // Format: {dataDir}/projects/{projectName}/com.inductiveautomation.ignition/named-query/{queryPath}/query.props
            String relativePath = String.format("projects/%s/com.inductiveautomation.ignition/named-query/%s",
                projectName, queryPath);
            Path queryDirPath = Paths.get(dataDir.getAbsolutePath(), relativePath);
            Path queryFilePath = queryDirPath.resolve("query.props");

            logger.debug("Saving query file to: {}", queryFilePath.toAbsolutePath());

            // Create directory if it doesn't exist
            if (!Files.exists(queryDirPath)) {
                logger.info("Creating query directory: {}", queryDirPath);
                Files.createDirectories(queryDirPath);
            }

            // Check if file exists (for logging)
            boolean isNewQuery = !Files.exists(queryFilePath);

            // Write query content to file
            Files.write(queryFilePath, queryContent.getBytes(StandardCharsets.UTF_8));

            // Audit log the write operation
            SecurityUtil.logAudit(context, "WebDesigner.Query.Write", user, req.getRequest().getRemoteAddr(),
                String.format("Saved query: project=%s, path=%s, size=%d bytes, new=%b",
                    projectName, queryPath, queryContent.length(), isNewQuery), true);

            // Build success response
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.addProperty("project", projectName);
            response.addProperty("path", queryPath);
            response.addProperty("message", isNewQuery ? "Query created successfully" : "Query updated successfully");
            response.addProperty("size", queryContent.length());

            logger.info("Query saved for project '{}', path '{}' by user '{}' ({})",
                projectName, queryPath, user, isNewQuery ? "new" : "updated");

            res.setStatus(HttpServletResponse.SC_OK);
            return response;

        } catch (com.google.gson.JsonSyntaxException e) {
            logger.error("Invalid JSON in request body", e);
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST,
                "Invalid JSON in request body: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error handling put query request", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to save query: " + e.getMessage());
        }
    }
}
