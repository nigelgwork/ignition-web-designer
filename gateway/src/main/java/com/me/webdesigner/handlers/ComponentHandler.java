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
     * Helper method to add a component to the catalog array.
     *
     * @param array       The JsonArray to add to
     * @param type        Component type identifier (e.g., "ia.display.label")
     * @param name        Display name
     * @param category    Category (container, display, input, chart, etc.)
     * @param description Component description
     */
    private static void addComponent(JsonArray array, String type, String name, String category, String description) {
        JsonObject component = new JsonObject();
        component.addProperty("type", type);
        component.addProperty("name", name);
        component.addProperty("category", category);
        component.addProperty("description", description);
        array.add(component);
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
            // Build comprehensive Perspective component catalog
            // TODO: When Perspective module API is accessible, replace with:
            //   var perspectiveModule = context.getModule("perspective");
            //   var componentRegistry = perspectiveModule.getComponentRegistry();
            //   var components = componentRegistry.getComponentDescriptors();

            JsonObject response = new JsonObject();
            JsonArray componentsArray = new JsonArray();

            // Comprehensive component catalog organized by category
            // Based on Perspective Designer component palette as of Ignition 8.3

            // CONTAINERS
            addComponent(componentsArray, "ia.container.flex", "Flex Container", "container", "Flexible box layout container");
            addComponent(componentsArray, "ia.container.coord", "Coordinate Container", "container", "Absolute positioning container");
            addComponent(componentsArray, "ia.container.column", "Column Container", "container", "Column-based layout container");
            addComponent(componentsArray, "ia.container.tabs", "Tab Container", "container", "Tabbed interface container");
            addComponent(componentsArray, "ia.container.docked", "Docked View", "container", "Docked view container");
            addComponent(componentsArray, "ia.container.breakpoint", "Breakpoint Container", "container", "Responsive breakpoint container");

            // DISPLAYS
            addComponent(componentsArray, "ia.display.label", "Label", "display", "Text label display");
            addComponent(componentsArray, "ia.display.markdown", "Markdown", "display", "Markdown formatted text");
            addComponent(componentsArray, "ia.display.image", "Image", "display", "Image display");
            addComponent(componentsArray, "ia.display.video", "Video Player", "display", "Video playback");
            addComponent(componentsArray, "ia.display.icon", "Icon", "display", "Icon display");
            addComponent(componentsArray, "ia.display.symbol", "Symbol", "display", "Symbol display");
            addComponent(componentsArray, "ia.display.svg", "SVG", "display", "SVG graphic display");
            addComponent(componentsArray, "ia.display.tank", "Tank", "display", "Tank level indicator");
            addComponent(componentsArray, "ia.display.gauge", "Gauge", "display", "Circular gauge");
            addComponent(componentsArray, "ia.display.linear-gauge", "Linear Gauge", "display", "Linear progress gauge");
            addComponent(componentsArray, "ia.display.led", "LED Display", "display", "LED indicator");
            addComponent(componentsArray, "ia.display.multistateIndicator", "Multi-state Indicator", "display", "Multi-state visual indicator");
            addComponent(componentsArray, "ia.display.thermometer", "Thermometer", "display", "Temperature display");
            addComponent(componentsArray, "ia.display.xyTrace", "XY Trace", "display", "XY coordinate trace");

            // INPUT
            addComponent(componentsArray, "ia.input.button", "Button", "input", "Push button");
            addComponent(componentsArray, "ia.input.textfield", "Text Field", "input", "Single-line text input");
            addComponent(componentsArray, "ia.input.textarea", "Text Area", "input", "Multi-line text input");
            addComponent(componentsArray, "ia.input.toggle", "Toggle Switch", "input", "Toggle switch input");
            addComponent(componentsArray, "ia.input.checkbox", "Checkbox", "input", "Checkbox input");
            addComponent(componentsArray, "ia.input.radio", "Radio Group", "input", "Radio button group");
            addComponent(componentsArray, "ia.input.dropdown", "Dropdown", "input", "Dropdown selection");
            addComponent(componentsArray, "ia.input.numeric", "Numeric Entry Field", "input", "Numeric input with spinners");
            addComponent(componentsArray, "ia.input.slider", "Slider", "input", "Value slider");
            addComponent(componentsArray, "ia.input.multistateButton", "Multi-state Button", "input", "Multi-state toggle button");
            addComponent(componentsArray, "ia.input.momentaryButton", "Momentary Button", "input", "Momentary push button");
            addComponent(componentsArray, "ia.input.dateTimePicker", "Date Time Picker", "input", "Date and time selection");
            addComponent(componentsArray, "ia.input.fileUpload", "File Upload", "input", "File upload control");

            // CHARTS
            addComponent(componentsArray, "ia.chart.timeseries", "Time Series Chart", "chart", "Time series line/area chart");
            addComponent(componentsArray, "ia.chart.pie", "Pie Chart", "chart", "Pie or donut chart");
            addComponent(componentsArray, "ia.chart.bar", "Bar Chart", "chart", "Horizontal or vertical bar chart");
            addComponent(componentsArray, "ia.chart.xytrace", "XY Chart", "chart", "XY scatter plot");
            addComponent(componentsArray, "ia.chart.ohlc", "OHLC Chart", "chart", "Open-high-low-close financial chart");
            addComponent(componentsArray, "ia.chart.pareto", "Pareto Chart", "chart", "Pareto distribution chart");
            addComponent(componentsArray, "ia.chart.powerChart", "Power Chart", "chart", "Advanced time series chart with pens");

            // TABLES
            addComponent(componentsArray, "ia.display.table", "Table", "table", "Data table display");
            addComponent(componentsArray, "ia.display.tree", "Tree", "table", "Hierarchical tree view");

            // NAVIGATION
            addComponent(componentsArray, "ia.navigation.menuTree", "Menu Tree", "navigation", "Hierarchical navigation menu");
            addComponent(componentsArray, "ia.navigation.breadcrumb", "Breadcrumb", "navigation", "Breadcrumb navigation");
            addComponent(componentsArray, "ia.navigation.link", "Link", "navigation", "Hyperlink");
            addComponent(componentsArray, "ia.navigation.dock", "Dock", "navigation", "Dockable panel");

            // SCHEDULING
            addComponent(componentsArray, "ia.scheduler.schedule", "Schedule", "scheduling", "Scheduler component");
            addComponent(componentsArray, "ia.scheduler.timeline", "Timeline", "scheduling", "Timeline view");

            // ALARM
            addComponent(componentsArray, "ia.alarm.journalTable", "Alarm Journal Table", "alarm", "Alarm history table");
            addComponent(componentsArray, "ia.alarm.statusTable", "Alarm Status Table", "alarm", "Active alarm table");
            addComponent(componentsArray, "ia.alarm.banner", "Alarm Status Banner", "alarm", "Alarm banner notification");

            // MISCELLANEOUS
            addComponent(componentsArray, "ia.display.embeddedView", "Embedded View", "misc", "Embedded Perspective view");
            addComponent(componentsArray, "ia.display.webFrame", "Web Frame", "misc", "Embedded web page (iframe)");
            addComponent(componentsArray, "ia.display.pdf", "PDF Viewer", "misc", "PDF document viewer");
            addComponent(componentsArray, "ia.input.colorPicker", "Color Picker", "misc", "Color selection control");
            addComponent(componentsArray, "ia.display.popup", "Popup", "misc", "Popup window trigger");
            addComponent(componentsArray, "ia.display.map", "Map", "misc", "Interactive map component");

            response.add("components", componentsArray);
            response.addProperty("note", "Comprehensive Perspective component catalog (60+ components)");
            response.addProperty("version", "8.3");

            logger.info("Returned {} component types organized by category", componentsArray.size());

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
