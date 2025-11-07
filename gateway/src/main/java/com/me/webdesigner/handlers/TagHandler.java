package com.me.webdesigner.handlers;

import com.inductiveautomation.ignition.common.gson.JsonArray;
import com.inductiveautomation.ignition.common.gson.JsonObject;
import com.inductiveautomation.ignition.common.tags.config.TagConfigurationModel;
import com.inductiveautomation.ignition.common.tags.config.types.TagObjectType;
import com.inductiveautomation.ignition.common.tags.model.TagProvider;
import com.inductiveautomation.ignition.common.tags.model.TagPath;
import com.inductiveautomation.ignition.common.tags.paths.parser.TagPathParser;
import com.inductiveautomation.ignition.gateway.dataroutes.RequestContext;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.me.webdesigner.util.ResponseUtil;
import com.me.webdesigner.util.SecurityUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Handler for tag browsing API endpoints.
 *
 * Handles:
 * - GET /api/v1/tags - List tag providers
 * - GET /api/v1/tags/{provider}?path=... - Browse tags
 */
public final class TagHandler {

    private static final Logger logger = LoggerFactory.getLogger(TagHandler.class);

    // Route patterns for path parameter extraction
    private static final Pattern TAGS_PROVIDER_PATTERN = Pattern.compile("^/api/v1/tags/([^/]+)$");

    // Private constructor - utility class
    private TagHandler() {
    }

    /**
     * Handle GET /api/v1/tags endpoint.
     *
     * Returns a list of all tag providers.
     */
    public static JsonObject handleGetTagProviders(RequestContext req, HttpServletResponse res) {
        logger.info("GET /api/v1/tags requested");

        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Check authentication
        String user = SecurityUtil.checkAuth(req.getRequest(), res, context, false);
        if (user == null) {
            return ResponseUtil.createErrorResponse(res.getStatus(), "Authentication required");
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
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve tag providers: " + e.getMessage());
        }
    }

    /**
     * Handle GET /api/v1/tags/{provider}?path=... endpoint.
     *
     * Browse tags in a specific provider.
     */
    public static JsonObject handleBrowseTags(RequestContext req, HttpServletResponse res) {
        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Extract provider name from path
        String requestPath = req.getRequest().getRequestURI();
        Matcher matcher = TAGS_PROVIDER_PATTERN.matcher(requestPath);

        if (!matcher.matches()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
        }

        String providerName = matcher.group(1);
        String tagPath = req.getRequest().getParameter("path");
        if (tagPath == null || tagPath.trim().isEmpty()) {
            tagPath = ""; // Browse root
        }

        logger.info("GET /api/v1/tags/{}?path={} requested", providerName, tagPath);

        // Check authentication
        String user = SecurityUtil.checkAuth(req.getRequest(), res, context, false);
        if (user == null) {
            return ResponseUtil.createErrorResponse(res.getStatus(), "Authentication required");
        }

        // Validate provider name
        if (!SecurityUtil.isValidInput(providerName) && !providerName.equals("[System]")) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_BAD_REQUEST, "Invalid provider name");
        }

        try {
            // Get the tag provider
            TagProvider provider = context.getTagManager().getTagProvider(providerName);
            if (provider == null) {
                res.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return ResponseUtil.createErrorResponse(HttpServletResponse.SC_NOT_FOUND,
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
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to browse tags: " + e.getMessage());
        }
    }
}
