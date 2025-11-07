package com.me.webdesigner;

import com.inductiveautomation.ignition.common.gson.JsonObject;
import com.inductiveautomation.ignition.gateway.dataroutes.RouteGroup;
import com.inductiveautomation.perspective.gateway.api.SessionScope;
import com.inductiveautomation.perspective.gateway.comm.Routes;
import com.me.webdesigner.handlers.ComponentHandler;
import com.me.webdesigner.handlers.ProjectHandler;
import com.me.webdesigner.handlers.ScriptHandler;
import com.me.webdesigner.handlers.TagHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.EnumSet;

import static com.inductiveautomation.ignition.gateway.dataroutes.HttpMethod.PUT;

/**
 * REST API Routes for Web Designer Module
 *
 * Version: 0.20.0 - Refactored Architecture
 *
 * This class serves as a thin coordinator that mounts routes and delegates to specialized handlers.
 *
 * Handles all API requests at /data/webdesigner/api/v1/*
 *
 * Security: All endpoints require:
 * 1. Authenticated Ignition Gateway session (inherited from home page launcher)
 * 2. Appropriate permissions checked in handlers (Designer role or custom permissions)
 * 3. Input validation and sanitization
 *
 * Features:
 * - GET /api/v1/projects - List all projects (with authentication)
 * - GET /api/v1/projects/{name}/views - List Perspective views (with authorization)
 * - GET /api/v1/projects/{name}/view?path=... - Get view.json content (with ETag)
 * - PUT /api/v1/projects/{name}/view?path=... - Save view.json (with optimistic concurrency)
 * - GET /api/v1/tags - List tag providers
 * - GET /api/v1/tags/{provider}?path=... - Browse tags
 * - GET /api/v1/perspective/components - Get component catalog
 * - GET /api/v1/projects/{name}/scripts - List all scripts
 * - GET /api/v1/projects/{name}/script?path=... - Get script content
 * - PUT /api/v1/projects/{name}/script?path=... - Save script
 *
 * All write operations are audit logged.
 *
 * Architecture:
 * - ProjectHandler - Manages project and view endpoints
 * - TagHandler - Manages tag browsing endpoints
 * - ComponentHandler - Manages component catalog endpoint
 * - ScriptHandler - Manages script endpoints
 * - SecurityUtil - Provides authentication and authorization utilities
 * - ResponseUtil - Provides JSON response helpers
 */
public final class WebDesignerApiRoutes {

    private static final Logger logger = LoggerFactory.getLogger(WebDesignerApiRoutes.class);

    // Private constructor - this is a utility class with static methods only
    private WebDesignerApiRoutes() {
    }

    /**
     * Mount all API routes for the Web Designer module.
     *
     * @param routes The RouteGroup to mount routes on
     */
    public static void mountRoutes(RouteGroup routes) {
        logger.info("Mounting Web Designer API routes...");

        // Test endpoint to verify routing works
        // Access control: Gateway session (any authenticated user)
        routes.newRoute("/test")
            .type(RouteGroup.TYPE_JSON)
            .handler((req, res) -> {
                JsonObject response = new JsonObject();
                response.addProperty("status", "ok");
                response.addProperty("message", "Web Designer module is running");
                response.addProperty("version", "0.20.0");
                return response;
            })
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // === Project & View Routes (ProjectHandler) ===

        // GET /api/v1/projects - List all projects
        routes.newRoute("/api/v1/projects")
            .type(RouteGroup.TYPE_JSON)
            .handler(ProjectHandler::handleGetProjects)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/projects/{name}/views - List views in a project
        routes.newRoute("/api/v1/projects/*/views")
            .type(RouteGroup.TYPE_JSON)
            .handler(ProjectHandler::handleGetProjectViews)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/projects/{name}/view?path=... - Get specific view
        routes.newRoute("/api/v1/projects/*/view")
            .type(RouteGroup.TYPE_JSON)
            .handler(ProjectHandler::handleGetView)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // PUT /api/v1/projects/{name}/view?path=... - Save view
        routes.newRoute("/api/v1/projects/*/view")
            .type(RouteGroup.TYPE_JSON)
            .method(PUT)
            .handler(ProjectHandler::handlePutView)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // === Tag Routes (TagHandler) ===

        // GET /api/v1/tags - List tag providers
        routes.newRoute("/api/v1/tags")
            .type(RouteGroup.TYPE_JSON)
            .handler(TagHandler::handleGetTagProviders)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/tags/{provider}?path=... - Browse tags
        routes.newRoute("/api/v1/tags/*")
            .type(RouteGroup.TYPE_JSON)
            .handler(TagHandler::handleBrowseTags)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // === Component Routes (ComponentHandler) ===

        // GET /api/v1/perspective/components - Get component catalog
        routes.newRoute("/api/v1/perspective/components")
            .type(RouteGroup.TYPE_JSON)
            .handler(ComponentHandler::handleGetComponents)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // === Script Routes (ScriptHandler) ===

        // GET /api/v1/projects/{name}/scripts - List all scripts in a project
        routes.newRoute("/api/v1/projects/*/scripts")
            .type(RouteGroup.TYPE_JSON)
            .handler(ScriptHandler::handleGetScripts)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // GET /api/v1/projects/{name}/script?path=... - Get specific script
        routes.newRoute("/api/v1/projects/*/script")
            .type(RouteGroup.TYPE_JSON)
            .handler(ScriptHandler::handleGetScript)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        // PUT /api/v1/projects/{name}/script?path=... - Save script
        routes.newRoute("/api/v1/projects/*/script")
            .type(RouteGroup.TYPE_JSON)
            .method(PUT)
            .handler(ScriptHandler::handlePutScript)
            .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
            .mount();

        logger.info("Mounted Web Designer API routes:");
        logger.info("  - GET  /data/webdesigner/test");
        logger.info("  - GET  /data/webdesigner/api/v1/projects");
        logger.info("  - GET  /data/webdesigner/api/v1/projects/{name}/views");
        logger.info("  - GET  /data/webdesigner/api/v1/projects/{name}/view");
        logger.info("  - PUT  /data/webdesigner/api/v1/projects/{name}/view");
        logger.info("  - GET  /data/webdesigner/api/v1/tags");
        logger.info("  - GET  /data/webdesigner/api/v1/tags/{provider}");
        logger.info("  - GET  /data/webdesigner/api/v1/perspective/components");
        logger.info("  - GET  /data/webdesigner/api/v1/projects/{name}/scripts");
        logger.info("  - GET  /data/webdesigner/api/v1/projects/{name}/script");
        logger.info("  - PUT  /data/webdesigner/api/v1/projects/{name}/script");
    }
}
