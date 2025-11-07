package com.me.webdesigner.handlers;

import com.inductiveautomation.ignition.common.gson.JsonArray;
import com.inductiveautomation.ignition.common.gson.JsonObject;
import com.inductiveautomation.ignition.gateway.dataroutes.RequestContext;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.me.webdesigner.util.ResponseUtil;
import com.me.webdesigner.util.SecurityUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Handler for component catalog API endpoint.
 *
 * Handles:
 * - GET /api/v1/perspective/components - Get component catalog
 */
public final class ComponentHandler {

    private static final Logger logger = LoggerFactory.getLogger(ComponentHandler.class);

    // Private constructor - utility class
    private ComponentHandler() {
    }

    /**
     * Handle GET /api/v1/perspective/components endpoint.
     *
     * Returns the Perspective component catalog.
     */
    public static JsonObject handleGetComponents(RequestContext req, HttpServletResponse res) {
        logger.info("GET /api/v1/perspective/components requested");

        // Get GatewayContext from RequestContext
        GatewayContext context = req.getGatewayContext();

        // Check authentication
        String user = SecurityUtil.checkAuth(req.getRequest(), res, context, false);
        if (user == null) {
            return ResponseUtil.createErrorResponse(res.getStatus(), "Authentication required");
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
            return ResponseUtil.createErrorResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Failed to retrieve components: " + e.getMessage());
        }
    }
}
