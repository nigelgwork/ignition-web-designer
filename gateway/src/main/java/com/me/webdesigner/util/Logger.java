package com.me.webdesigner.util;

import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Enhanced Logging Utility
 *
 * Provides structured logging with context, performance tracking, and
 * consistent formatting across the Web Designer module.
 *
 * Features:
 * - Structured logging with context
 * - Performance tracking (operation timing)
 * - Request/response logging
 * - Error logging with stack traces
 * - User action logging
 * - Consistent log format
 *
 * Usage:
 * ```java
 * Logger logger = Logger.get(MyClass.class);
 * logger.info("User action", "username", user, "action", "save_view");
 * logger.performance("Save view operation", startTime);
 * ```
 */
public class Logger {

    private final org.slf4j.Logger slf4jLogger;

    private Logger(org.slf4j.Logger slf4jLogger) {
        this.slf4jLogger = slf4jLogger;
    }

    /**
     * Get a logger for a class
     */
    public static Logger get(Class<?> clazz) {
        return new Logger(LoggerFactory.getLogger(clazz));
    }

    /**
     * Log info message with context
     */
    public void info(String message, Object... context) {
        if (slf4jLogger.isInfoEnabled()) {
            slf4jLogger.info(formatMessage(message, context));
        }
    }

    /**
     * Log warning message with context
     */
    public void warn(String message, Object... context) {
        if (slf4jLogger.isWarnEnabled()) {
            slf4jLogger.warn(formatMessage(message, context));
        }
    }

    /**
     * Log error message with context
     */
    public void error(String message, Object... context) {
        if (slf4jLogger.isErrorEnabled()) {
            slf4jLogger.error(formatMessage(message, context));
        }
    }

    /**
     * Log error with exception
     */
    public void error(String message, Throwable throwable, Object... context) {
        if (slf4jLogger.isErrorEnabled()) {
            slf4jLogger.error(formatMessage(message, context), throwable);
        }
    }

    /**
     * Log debug message with context
     */
    public void debug(String message, Object... context) {
        if (slf4jLogger.isDebugEnabled()) {
            slf4jLogger.debug(formatMessage(message, context));
        }
    }

    /**
     * Log trace message with context
     */
    public void trace(String message, Object... context) {
        if (slf4jLogger.isTraceEnabled()) {
            slf4jLogger.trace(formatMessage(message, context));
        }
    }

    /**
     * Log API request
     */
    public void apiRequest(String method, String path, String username, String ip) {
        info("API Request",
            "method", method,
            "path", path,
            "username", username,
            "ip", ip
        );
    }

    /**
     * Log API response
     */
    public void apiResponse(String method, String path, int statusCode, long durationMs) {
        info("API Response",
            "method", method,
            "path", path,
            "status", statusCode,
            "duration_ms", durationMs
        );
    }

    /**
     * Log performance metric
     */
    public void performance(String operation, long startTimeMs) {
        long duration = System.currentTimeMillis() - startTimeMs;
        info("Performance",
            "operation", operation,
            "duration_ms", duration
        );
    }

    /**
     * Log performance with threshold warning
     */
    public void performance(String operation, long startTimeMs, long warningThresholdMs) {
        long duration = System.currentTimeMillis() - startTimeMs;
        if (duration > warningThresholdMs) {
            warn("Slow operation detected",
                "operation", operation,
                "duration_ms", duration,
                "threshold_ms", warningThresholdMs
            );
        } else {
            debug("Performance",
                "operation", operation,
                "duration_ms", duration
            );
        }
    }

    /**
     * Log user action for audit
     */
    public void userAction(String username, String action, String resource, boolean success) {
        info("User Action",
            "username", username,
            "action", action,
            "resource", resource,
            "success", success
        );
    }

    /**
     * Log security event
     */
    public void security(String event, String username, String details, boolean allowed) {
        String level = allowed ? "INFO" : "WARN";
        String message = formatMessage("Security Event",
            "event", event,
            "username", username,
            "details", details,
            "allowed", allowed
        );

        if (allowed) {
            info(message);
        } else {
            warn(message);
        }
    }

    /**
     * Format message with context key-value pairs
     */
    private String formatMessage(String message, Object... context) {
        if (context == null || context.length == 0) {
            return message;
        }

        StringBuilder sb = new StringBuilder(message);
        sb.append(" [");

        for (int i = 0; i < context.length; i += 2) {
            if (i > 0) {
                sb.append(", ");
            }

            String key = String.valueOf(context[i]);
            Object value = (i + 1 < context.length) ? context[i + 1] : null;

            sb.append(key).append("=").append(formatValue(value));
        }

        sb.append("]");
        return sb.toString();
    }

    /**
     * Format value for logging
     */
    private String formatValue(Object value) {
        if (value == null) {
            return "null";
        }

        if (value instanceof String) {
            return "\"" + value + "\"";
        }

        return String.valueOf(value);
    }

    /**
     * Check if info level is enabled
     */
    public boolean isInfoEnabled() {
        return slf4jLogger.isInfoEnabled();
    }

    /**
     * Check if debug level is enabled
     */
    public boolean isDebugEnabled() {
        return slf4jLogger.isDebugEnabled();
    }

    /**
     * Check if trace level is enabled
     */
    public boolean isTraceEnabled() {
        return slf4jLogger.isTraceEnabled();
    }

    /**
     * Get underlying SLF4J logger for advanced use cases
     */
    public org.slf4j.Logger getSlf4j() {
        return slf4jLogger;
    }

    /**
     * Performance timer for convenient timing
     */
    public static class Timer {
        private final long startTime;
        private final String operation;
        private final Logger logger;

        public Timer(Logger logger, String operation) {
            this.logger = logger;
            this.operation = operation;
            this.startTime = System.currentTimeMillis();
            logger.debug("Starting operation", "operation", operation);
        }

        public void stop() {
            logger.performance(operation, startTime);
        }

        public void stopWithWarning(long warningThresholdMs) {
            logger.performance(operation, startTime, warningThresholdMs);
        }
    }

    /**
     * Start a performance timer
     */
    public Timer startTimer(String operation) {
        return new Timer(this, operation);
    }
}
