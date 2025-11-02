package com.me.webdesigner;

import com.inductiveautomation.ignition.common.licensing.LicenseState;
import com.inductiveautomation.ignition.gateway.dataroutes.RouteGroup;
import com.inductiveautomation.ignition.gateway.model.AbstractGatewayModuleHook;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

/**
 * Gateway Hook for Web-Based Perspective Designer Module
 *
 * Version: 0.6.0
 *
 * This module provides a web-based interface for editing Perspective views.
 * It serves a React SPA and provides REST API endpoints for:
 * - Browsing projects and views
 * - Reading and writing view.json files
 * - Browsing tag providers and tags
 * - Introspecting Perspective component registry
 *
 * Security: All API endpoints require authenticated Ignition session
 * and appropriate permissions.
 */
public class GatewayHook extends AbstractGatewayModuleHook {

    private static final Logger logger = LoggerFactory.getLogger(GatewayHook.class);

    private GatewayContext gatewayContext;

    /**
     * Called when the module is first loaded by the Gateway.
     * Initialize the module and store the GatewayContext.
     */
    @Override
    public void setup(GatewayContext context) {
        this.gatewayContext = context;
        logger.info("Web Designer module setup complete");
    }

    /**
     * Called when the module is being started (after setup).
     */
    @Override
    public void startup(LicenseState activationState) {
        logger.info("Web Designer module starting up - Version 0.6.0");
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
     */
    @Override
    public void mountRouteHandlers(RouteGroup routes) {
        logger.info("Mounting Web Designer route handlers...");

        // Mount API routes using the WebDesignerApiRoutes helper class
        WebDesignerApiRoutes.mountRoutes(routes, gatewayContext);

        logger.info("Web Designer route handlers mounted at /data/webdesigner/api/v1/*");
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
}
