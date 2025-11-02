package com.me.webdesigner;

import com.inductiveautomation.ignition.common.licensing.LicenseState;
import com.inductiveautomation.ignition.gateway.model.AbstractGatewayModuleHook;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.inductiveautomation.ignition.gateway.web.models.KeyValue;
import com.inductiveautomation.ignition.gateway.web.models.ConfigCategory;
import com.inductiveautomation.perspective.gateway.api.PerspectiveContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Gateway Hook for Web-Based Perspective Designer Module
 *
 * Version: 0.1.0
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
    private WebDesignerApiHandler apiHandler;

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
     * Initialize the API handler.
     */
    @Override
    public void startup(LicenseState activationState) {
        logger.info("Web Designer module starting up...");

        try {
            // Initialize the API handler
            this.apiHandler = new WebDesignerApiHandler(gatewayContext);
            logger.info("Web Designer API handler initialized");
        } catch (Exception e) {
            logger.error("Failed to initialize Web Designer API handler", e);
        }

        logger.info("Web Designer module startup complete - Version 0.1.0");
    }

    /**
     * Called when the module is being shut down.
     * Clean up resources.
     */
    @Override
    public void shutdown() {
        logger.info("Web Designer module shutting down...");

        // Clean up API handler
        if (this.apiHandler != null) {
            this.apiHandler = null;
        }

        logger.info("Web Designer module shutdown complete");
    }

    /**
     * Mount route handlers for the module.
     *
     * Routes are mounted at /webdesigner/*
     * - /webdesigner/* - Static files (React SPA)
     * - /webdesigner/api/v1/* - REST API endpoints
     */
    @Override
    public void mountRouteHandlers(com.inductiveautomation.ignition.gateway.web.components.RouteGroup routes) {
        logger.info("Mounting Web Designer route handlers...");

        // Mount the API handler
        // All routes under /api/v1/* will be handled by WebDesignerApiHandler
        routes.newRoute("/api/v1/*")
            .handler(this.apiHandler)
            .mount();

        logger.info("Web Designer route handlers mounted:");
        logger.info("  - API: /webdesigner/api/v1/*");
        logger.info("  - Static files: /webdesigner/*");
    }

    /**
     * Specify the folder containing static web resources (React SPA).
     *
     * These files will be served at /webdesigner/*
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
     * @return "webdesigner" - module will be accessible at /webdesigner/
     */
    @Override
    public Optional<String> getMountPathAlias() {
        return Optional.of("webdesigner");
    }

    /**
     * Indicate whether the module's web resources require authentication.
     *
     * @return true - all resources require authenticated session
     */
    @Override
    public boolean isMountedResourceProtected() {
        return true;
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
     * Get the Gateway status panel information.
     * This appears on the Gateway Status page.
     */
    @Override
    public List<? extends KeyValue> getStatusPanels() {
        KeyValue statusPanel = new KeyValue(
            "webdesigner",
            "Web Designer",
            Collections.singletonList(
                new KeyValue("status", "Module Loaded", "Version 0.1.0 - Phase 1 Complete")
            )
        );
        return Collections.singletonList(statusPanel);
    }

    /**
     * Get configuration categories for the Gateway Config page.
     * (Not implemented in Phase 1)
     */
    @Override
    public List<? extends ConfigCategory> getConfigCategories() {
        return Collections.emptyList();
    }
}
