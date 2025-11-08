package com.me.webdesigner.util;

import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Security utility for authentication and authorization checks.
 *
 * Provides centralized security validation for all API endpoints.
 */
public final class SecurityUtil {

    private static final Logger logger = LoggerFactory.getLogger(SecurityUtil.class);

    // Private constructor - utility class
    private SecurityUtil() {
    }

    /**
     * Check authentication and authorization for a request.
     * Returns 401 if not authenticated (without WWW-Authenticate header to avoid browser popup).
     * Users should already be authenticated via Gateway login before accessing this module.
     *
     * @param req The servlet request
     * @param res The HTTP response
     * @param context The Gateway context
     * @param requireDesigner Whether to require Designer role
     * @return A string representing the user, or null if unauthorized
     */
    public static String checkAuth(HttpServletRequest req, HttpServletResponse res, GatewayContext context, boolean requireDesigner) {
        try {
            // Try to get authenticated user from Gateway session
            // This works with Ignition's built-in authentication
            java.security.Principal principal = req.getUserPrincipal();

            if (principal == null) {
                // No authenticated user - return 401 without WWW-Authenticate header
                // (Don't trigger browser basic auth popup - user should already be logged into Gateway)
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                logger.debug("Unauthenticated request from {}", req.getRemoteAddr());
                return null;
            }

            String username = principal.getName();
            logger.debug("Authenticated request from user: {}", username);

            // TODO: Check for Designer role if requireDesigner is true
            // For now, any authenticated user can access

            return username;

        } catch (Exception e) {
            logger.error("Error checking authentication", e);
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return null;
        }
    }

    /**
     * Validate input string against potential injection attacks.
     */
    public static boolean isValidInput(String input) {
        if (input == null || input.trim().isEmpty()) {
            return false;
        }
        // Check for path traversal attempts
        if (input.contains("..") || input.contains("\\")) {
            return false;
        }
        // Check length (max 255 characters)
        if (input.length() > 255) {
            return false;
        }
        return true;
    }

    /**
     * Log audit event.
     */
    public static void logAudit(GatewayContext context, String action, String username, String remoteAddr,
                                  String details, boolean success) {
        // TODO: Implement actual audit logging when tested on live Gateway
        // Expected: context.getAuditManager().audit(auditRecord)
        logger.info("AUDIT: {} by {} from {} - {} (success: {})", action, username, remoteAddr, details, success);
    }
}
