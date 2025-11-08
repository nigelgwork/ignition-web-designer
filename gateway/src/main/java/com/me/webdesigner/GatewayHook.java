package com.me.webdesigner;

import com.inductiveautomation.ignition.common.licensing.LicenseState;
import com.inductiveautomation.ignition.gateway.dataroutes.RouteGroup;
import com.inductiveautomation.ignition.gateway.model.AbstractGatewayModuleHook;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.inductiveautomation.ignition.gateway.web.systemjs.SystemJsModule;
import com.inductiveautomation.perspective.gateway.api.SessionScope;
import com.inductiveautomation.perspective.gateway.comm.Routes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.EnumSet;
import java.util.Optional;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Gateway Hook for Web-Based Perspective Designer Module
 *
 * Version: 0.18.0
 *
 * This module provides a web-based interface for editing Perspective views.
 * It integrates into the Gateway home page as a launcher (like Designer/Perspective/Vision).
 * Also provides a standalone full-screen mode at /data/webdesigner/standalone
 *
 * REST API endpoints:
 * - Browsing projects and views
 * - Reading and writing view.json files
 * - Browsing tag providers and tags
 * - Introspecting Perspective component registry
 *
 * Security: Gateway authentication is inherited automatically.
 * All API endpoints require authenticated session.
 */
public class GatewayHook extends AbstractGatewayModuleHook {

    private static final Logger logger = LoggerFactory.getLogger(GatewayHook.class);

    private GatewayContext gatewayContext;

    /**
     * Called when the module is first loaded by the Gateway.
     * Initialize the module, store the GatewayContext, and register home page launcher.
     */
    @Override
    public void setup(GatewayContext context) {
        this.gatewayContext = context;

        // Create SystemJS module for the WebDesigner React component
        SystemJsModule jsModule = new SystemJsModule(
            "com.me.webdesigner.WebDesigner",
            "/res/webdesigner/webdesigner.js"
        );

        // Add Web Designer launcher to Gateway home page
        // This integrates with the existing Designer/Perspective/Vision launchers
        context.getWebResourceManager()
            .getNavigationModel()
            .getHome()
            .addCategory("webdesigner", cat -> cat
                .label("Web Designer")
                .addPage("Perspective Designer", page -> page
                    .position(10)
                    .mount("/web-designer", "WebDesigner", jsModule)
                )
            );

        logger.info("Web Designer home page launcher registered at /app/web-designer");
        logger.info("Web Designer module setup complete");
    }

    /**
     * Called when the module is being started (after setup).
     */
    @Override
    public void startup(LicenseState activationState) {
        logger.info("Web Designer module starting up - Version 1.0.0 - FIXED ROUTES WITH TYPE_JSON");
        logger.info("Access full-screen mode at: http://localhost:8088/data/webdesigner/standalone");
    }

    /**
     * Called when the module is being shut down.
     * Clean up resources.
     */
    @Override
    public void shutdown() {
        logger.info("Web Designer module shutting down...");
    }

    /**
     * Mount route handlers for the module.
     *
     * Routes are mounted at /data/com.me.webdesigner/* (or /data/webdesigner/* with alias)
     * - API endpoints: /data/webdesigner/api/v1/*
     * - Standalone page: /data/webdesigner/standalone
     */
    @Override
    public void mountRouteHandlers(RouteGroup routes) {
        logger.info("Mounting Web Designer route handlers...");

        // Mount API routes using the WebDesignerApiRoutes helper class
        WebDesignerApiRoutes.mountRoutes(routes);

        // Mount root index page at /data/webdesigner/
        logger.info("Mounting root route at /data/webdesigner/");
        routes.newRoute("/")
            .type(RouteGroup.TYPE_JSON)  // TYPE_JSON required even for HTML responses
            .handler(GatewayHook::handleRoot)
            .mount();

        // Mount standalone full-screen page (no Gateway sidebar)
        logger.info("Mounting standalone route at /data/webdesigner/standalone");
        routes.newRoute("/standalone")
            .type(RouteGroup.TYPE_JSON)  // TYPE_JSON required even for HTML responses
            .handler(GatewayHook::handleStandalone)
            .mount();

        logger.info("Web Designer route handlers mounted:");
        logger.info("  - API: /data/webdesigner/api/v1/*");
        logger.info("  - Standalone: /data/webdesigner/standalone (full-screen mode)");
    }

    /**
     * Specify the folder containing static web resources (React SPA).
     *
     * These files will be served at /res/webdesigner/*
     * The frontend build output is copied here during the Gradle build.
     */
    @Override
    public Optional<String> getMountedResourceFolder() {
        return Optional.of("web");
    }

    /**
     * Get the mount path override for the module.
     * This determines the base URL path for the module.
     *
     * @return "webdesigner" - module will be accessible at:
     *         - Static files: /res/webdesigner/*
     *         - API routes: /data/webdesigner/*
     */
    @Override
    public Optional<String> getMountPathAlias() {
        return Optional.of("webdesigner");
    }

    /**
     * Check if the module is eligible for "trial mode" or free usage.
     *
     * @return true - module is free to use (no licensing required)
     */
    @Override
    public boolean isFreeModule() {
        return true;
    }

    /**
     * Handler for root route "/" - serves the main React app HTML page.
     */
    private static Object handleRoot(com.inductiveautomation.ignition.gateway.dataroutes.RequestContext req,
                                      HttpServletResponse res) throws Exception {
        String html = "<!DOCTYPE html>" +
                      "<html lang=\"en\">" +
                      "<head>" +
                      "<meta charset=\"UTF-8\">" +
                      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                      "<title>Web Designer - Perspective View Editor</title>" +
                      "<style>" +
                      "body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background: #1e1e1e; color: #cccccc; overflow: hidden; }" +
                      "#root { width: 100vw; height: 100vh; }" +
                      "</style>" +
                      "</head>" +
                      "<body>" +
                      "<div id=\"root\"></div>" +
                      "<script src=\"/res/webdesigner/standalone.js\"></script>" +
                      "</body>" +
                      "</html>";

        res.setContentType("text/html");
        res.setStatus(HttpServletResponse.SC_OK);
        res.getWriter().write(html);
        res.getWriter().flush();

        return null;
    }

    /**
     * Handler for /standalone route - serves the full-screen React app HTML page.
     */
    private static Object handleStandalone(com.inductiveautomation.ignition.gateway.dataroutes.RequestContext req,
                                            HttpServletResponse res) throws Exception {
        String html = "<!DOCTYPE html>" +
                      "<html lang=\"en\">" +
                      "<head>" +
                      "<meta charset=\"UTF-8\">" +
                      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                      "<title>Web Designer - Full Screen</title>" +
                      "<style>" +
                      "body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background: #1e1e1e; color: #cccccc; overflow: hidden; }" +
                      "#root { width: 100vw; height: 100vh; }" +
                      "</style>" +
                      "</head>" +
                      "<body>" +
                      "<div id=\"root\"></div>" +
                      "<script src=\"/res/webdesigner/standalone.js\"></script>" +
                      "</body>" +
                      "</html>";

        res.setContentType("text/html");
        res.setStatus(HttpServletResponse.SC_OK);
        res.getWriter().write(html);
        res.getWriter().flush();

        return null;
    }
}
