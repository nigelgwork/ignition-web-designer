package com.me.webdesigner.util;

import com.inductiveautomation.ignition.common.gson.JsonObject;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.NoSuchFileException;

/**
 * Centralized Error Handling Utility
 *
 * Provides consistent error responses and logging across all API handlers.
 *
 * Features:
 * - Standardized error response format
 * - HTTP status code mapping
 * - Detailed error logging
 * - User-friendly error messages
 * - Development vs Production mode support
 *
 * Usage:
 * ```java
 * try {
 *     // ... handler logic
 * } catch (Exception e) {
 *     return ErrorHandler.handleException(logger, res, e, "reading view file");
 * }
 * ```
 */
public final class ErrorHandler {

    // Private constructor - utility class
    private ErrorHandler() {}

    /**
     * Standard error response format
     */
    public static class ErrorResponse {
        public final int status;
        public final String error;
        public final String message;
        public final String context;

        public ErrorResponse(int status, String error, String message, String context) {
            this.status = status;
            this.error = error;
            this.message = message;
            this.context = context;
        }

        public JsonObject toJson() {
            JsonObject json = new JsonObject();
            json.addProperty("status", status);
            json.addProperty("error", error);
            json.addProperty("message", message);
            if (context != null && !context.isEmpty()) {
                json.addProperty("context", context);
            }
            return json;
        }
    }

    /**
     * Handle exceptions with automatic status code determination
     *
     * @param logger Logger for this handler
     * @param res HttpServletResponse to set status
     * @param e Exception that occurred
     * @param context Human-readable context (e.g., "reading view file", "saving script")
     * @return JsonObject error response
     */
    public static JsonObject handleException(Logger logger, HttpServletResponse res, Exception e, String context) {
        ErrorResponse errorResponse = determineErrorResponse(e, context);
        res.setStatus(errorResponse.status);

        // Log based on severity
        if (errorResponse.status >= 500) {
            logger.error("Error {}: {}", context, e.getMessage(), e);
        } else if (errorResponse.status >= 400) {
            logger.warn("Client error {}: {}", context, e.getMessage());
        } else {
            logger.info("Request issue {}: {}", context, e.getMessage());
        }

        return errorResponse.toJson();
    }

    /**
     * Handle exceptions with custom error message
     */
    public static JsonObject handleException(Logger logger, HttpServletResponse res, Exception e,
                                           String context, String customMessage) {
        ErrorResponse errorResponse = determineErrorResponse(e, context);
        res.setStatus(errorResponse.status);

        if (errorResponse.status >= 500) {
            logger.error("Error {}: {}", context, e.getMessage(), e);
        } else if (errorResponse.status >= 400) {
            logger.warn("Client error {}: {}", context, e.getMessage());
        }

        // Use custom message instead of default
        JsonObject json = errorResponse.toJson();
        json.addProperty("message", customMessage);
        return json;
    }

    /**
     * Create a custom error response
     */
    public static JsonObject createError(HttpServletResponse res, int status, String error,
                                       String message, String context) {
        res.setStatus(status);
        ErrorResponse errorResponse = new ErrorResponse(status, error, message, context);
        return errorResponse.toJson();
    }

    /**
     * Determine appropriate HTTP status and error message from exception type
     */
    private static ErrorResponse determineErrorResponse(Exception e, String context) {
        // File system errors
        if (e instanceof FileNotFoundException || e instanceof NoSuchFileException) {
            return new ErrorResponse(
                HttpServletResponse.SC_NOT_FOUND,
                "Not Found",
                "Resource not found: " + e.getMessage(),
                context
            );
        }

        if (e instanceof AccessDeniedException) {
            return new ErrorResponse(
                HttpServletResponse.SC_FORBIDDEN,
                "Access Denied",
                "Access denied to resource: " + e.getMessage(),
                context
            );
        }

        if (e instanceof IOException) {
            return new ErrorResponse(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "I/O Error",
                "Failed to read or write resource: " + e.getMessage(),
                context
            );
        }

        // JSON parsing errors
        if (e instanceof com.google.gson.JsonSyntaxException) {
            return new ErrorResponse(
                HttpServletResponse.SC_BAD_REQUEST,
                "Invalid JSON",
                "Invalid JSON syntax: " + e.getMessage(),
                context
            );
        }

        if (e instanceof com.google.gson.JsonParseException) {
            return new ErrorResponse(
                HttpServletResponse.SC_BAD_REQUEST,
                "JSON Parse Error",
                "Could not parse JSON: " + e.getMessage(),
                context
            );
        }

        // Validation errors
        if (e instanceof IllegalArgumentException) {
            return new ErrorResponse(
                HttpServletResponse.SC_BAD_REQUEST,
                "Invalid Argument",
                "Invalid request parameter: " + e.getMessage(),
                context
            );
        }

        if (e instanceof IllegalStateException) {
            return new ErrorResponse(
                HttpServletResponse.SC_CONFLICT,
                "Invalid State",
                "Operation cannot be performed: " + e.getMessage(),
                context
            );
        }

        // Security errors
        if (e instanceof SecurityException) {
            return new ErrorResponse(
                HttpServletResponse.SC_FORBIDDEN,
                "Security Violation",
                "Security check failed: " + e.getMessage(),
                context
            );
        }

        // Null pointer and reflection errors (internal server errors)
        if (e instanceof NullPointerException) {
            return new ErrorResponse(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Internal Error",
                "An unexpected error occurred. Please check Gateway logs.",
                context
            );
        }

        if (e instanceof NoSuchMethodException || e instanceof ReflectiveOperationException) {
            return new ErrorResponse(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "API Error",
                "Gateway API method not available. Check Ignition version compatibility.",
                context
            );
        }

        // Default: Internal Server Error
        return new ErrorResponse(
            HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
            "Internal Server Error",
            "An unexpected error occurred: " + e.getMessage(),
            context
        );
    }

    /**
     * Validate required parameter
     *
     * @throws IllegalArgumentException if parameter is null or empty
     */
    public static void requireNonEmpty(String value, String paramName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(paramName + " is required");
        }
    }

    /**
     * Validate required object
     *
     * @throws IllegalArgumentException if object is null
     */
    public static void requireNonNull(Object value, String paramName) {
        if (value == null) {
            throw new IllegalArgumentException(paramName + " is required");
        }
    }

    /**
     * Validate path safety (prevent directory traversal)
     *
     * @throws IllegalArgumentException if path contains dangerous patterns
     */
    public static void validatePath(String path) {
        if (path == null) {
            throw new IllegalArgumentException("Path cannot be null");
        }

        // Normalize path separators
        String normalized = path.replace('\\', '/');

        // Check for directory traversal attempts
        if (normalized.contains("..") || normalized.contains("./") || normalized.startsWith("/")) {
            throw new IllegalArgumentException("Invalid path: directory traversal not allowed");
        }

        // Check for absolute paths on Windows
        if (normalized.matches("^[A-Za-z]:/.*")) {
            throw new IllegalArgumentException("Invalid path: absolute paths not allowed");
        }

        // Check for null bytes (security)
        if (normalized.contains("\0")) {
            throw new IllegalArgumentException("Invalid path: null bytes not allowed");
        }
    }

    /**
     * Validate JSON size (prevent DoS attacks)
     *
     * @throws IllegalArgumentException if JSON exceeds size limit
     */
    public static void validateJsonSize(String json, int maxSizeKb) {
        if (json == null) {
            throw new IllegalArgumentException("JSON cannot be null");
        }

        int sizeKb = json.getBytes().length / 1024;
        if (sizeKb > maxSizeKb) {
            throw new IllegalArgumentException(
                String.format("JSON size (%d KB) exceeds maximum allowed size (%d KB)", sizeKb, maxSizeKb)
            );
        }
    }
}
