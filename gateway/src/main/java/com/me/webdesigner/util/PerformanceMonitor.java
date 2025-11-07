package com.me.webdesigner.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Performance Monitoring Utility
 *
 * Tracks performance metrics for backend operations:
 * - Operation timing
 * - Call counts
 * - Average/min/max durations
 * - Slow operation detection
 *
 * Usage:
 * ```java
 * PerformanceMonitor.Timer timer = PerformanceMonitor.start("Load projects");
 * // ... do work
 * timer.stop();
 * ```
 */
public final class PerformanceMonitor {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceMonitor.class);

    private static final Map<String, OperationStats> stats = new ConcurrentHashMap<>();

    // Threshold for slow operation warning (milliseconds)
    private static final long SLOW_OPERATION_THRESHOLD_MS = 1000;

    // Private constructor - utility class
    private PerformanceMonitor() {}

    /**
     * Operation statistics
     */
    public static class OperationStats {
        private final String operation;
        private final AtomicLong callCount = new AtomicLong(0);
        private final AtomicLong totalDuration = new AtomicLong(0);
        private volatile long minDuration = Long.MAX_VALUE;
        private volatile long maxDuration = Long.MIN_VALUE;

        public OperationStats(String operation) {
            this.operation = operation;
        }

        public void recordDuration(long durationMs) {
            callCount.incrementAndGet();
            totalDuration.addAndGet(durationMs);

            // Update min/max (not atomic, but good enough for stats)
            if (durationMs < minDuration) {
                minDuration = durationMs;
            }
            if (durationMs > maxDuration) {
                maxDuration = durationMs;
            }
        }

        public long getCallCount() {
            return callCount.get();
        }

        public long getAverageDuration() {
            long count = callCount.get();
            return count > 0 ? totalDuration.get() / count : 0;
        }

        public long getMinDuration() {
            return minDuration == Long.MAX_VALUE ? 0 : minDuration;
        }

        public long getMaxDuration() {
            return maxDuration == Long.MIN_VALUE ? 0 : maxDuration;
        }

        public String getOperation() {
            return operation;
        }

        @Override
        public String toString() {
            return String.format("Operation[%s] calls=%d, avg=%dms, min=%dms, max=%dms",
                operation, getCallCount(), getAverageDuration(), getMinDuration(), getMaxDuration());
        }
    }

    /**
     * Performance timer
     */
    public static class Timer {
        private final String operation;
        private final long startTime;
        private boolean stopped = false;

        private Timer(String operation) {
            this.operation = operation;
            this.startTime = System.currentTimeMillis();
        }

        /**
         * Stop the timer and record the duration
         */
        public long stop() {
            if (stopped) {
                return 0;
            }

            stopped = true;
            long duration = System.currentTimeMillis() - startTime;

            // Record stats
            OperationStats operationStats = stats.computeIfAbsent(operation, OperationStats::new);
            operationStats.recordDuration(duration);

            // Warn on slow operations
            if (duration > SLOW_OPERATION_THRESHOLD_MS) {
                logger.warn("Slow operation detected: {} took {}ms (threshold: {}ms)",
                    operation, duration, SLOW_OPERATION_THRESHOLD_MS);
            } else {
                logger.debug("Operation completed: {} in {}ms", operation, duration);
            }

            return duration;
        }

        /**
         * Stop with custom threshold
         */
        public long stopWithThreshold(long thresholdMs) {
            if (stopped) {
                return 0;
            }

            stopped = true;
            long duration = System.currentTimeMillis() - startTime;

            // Record stats
            OperationStats operationStats = stats.computeIfAbsent(operation, OperationStats::new);
            operationStats.recordDuration(duration);

            // Warn on slow operations
            if (duration > thresholdMs) {
                logger.warn("Slow operation detected: {} took {}ms (threshold: {}ms)",
                    operation, duration, thresholdMs);
            } else {
                logger.debug("Operation completed: {} in {}ms", operation, duration);
            }

            return duration;
        }

        /**
         * Get elapsed time without stopping
         */
        public long elapsed() {
            return System.currentTimeMillis() - startTime;
        }
    }

    /**
     * Start timing an operation
     */
    public static Timer start(String operation) {
        return new Timer(operation);
    }

    /**
     * Get statistics for an operation
     */
    public static OperationStats getStats(String operation) {
        return stats.get(operation);
    }

    /**
     * Get all statistics
     */
    public static Map<String, OperationStats> getAllStats() {
        return new ConcurrentHashMap<>(stats);
    }

    /**
     * Reset statistics for an operation
     */
    public static void resetStats(String operation) {
        stats.remove(operation);
    }

    /**
     * Reset all statistics
     */
    public static void resetAllStats() {
        stats.clear();
    }

    /**
     * Log all statistics
     */
    public static void logAllStats() {
        if (stats.isEmpty()) {
            logger.info("No performance statistics recorded");
            return;
        }

        logger.info("=== Performance Statistics ===");
        stats.values().forEach(stat -> logger.info(stat.toString()));
    }

    /**
     * Get statistics summary
     */
    public static String getStatsSummary() {
        if (stats.isEmpty()) {
            return "No performance statistics recorded";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Performance Statistics:\n");
        stats.values().forEach(stat -> {
            sb.append("  ").append(stat.toString()).append("\n");
        });
        return sb.toString();
    }
}
