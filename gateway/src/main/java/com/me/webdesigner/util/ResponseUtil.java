package com.me.webdesigner.util;

import com.inductiveautomation.ignition.common.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.UUID;

/**
 * Response utility for creating JSON responses and calculating ETags.
 *
 * Provides centralized response handling for all API endpoints.
 */
public final class ResponseUtil {

    private static final Logger logger = LoggerFactory.getLogger(ResponseUtil.class);

    // Private constructor - utility class
    private ResponseUtil() {
    }

    /**
     * Create a JSON error response.
     *
     * @param status The HTTP status code
     * @param message The error message
     * @return JSON error response
     */
    public static JsonObject createErrorResponse(int status, String message) {
        JsonObject error = new JsonObject();
        error.addProperty("error", message);
        error.addProperty("status", status);
        return error;
    }

    /**
     * Calculate SHA-256 hash for ETag generation.
     */
    public static String calculateHash(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            logger.error("Error calculating hash", e);
            return UUID.randomUUID().toString(); // Fallback to random UUID
        }
    }
}
