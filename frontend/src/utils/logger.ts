/**
 * Frontend Logging Utility
 *
 * Provides structured logging with context, performance tracking, and
 * consistent formatting for the frontend application.
 *
 * Features:
 * - Structured logging with context
 * - Log levels (debug, info, warn, error)
 * - Performance tracking
 * - User action tracking
 * - Console grouping for related logs
 * - Optional remote logging (future)
 *
 * Usage:
 * ```ts
 * logger.info('View loaded', { viewName: 'MainView', componentCount: 10 })
 * const timer = logger.startTimer('Save operation')
 * // ... do work
 * timer.stop()
 * ```
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogContext {
  [key: string]: any
}

class Logger {
  private level: LogLevel = LogLevel.INFO
  private prefix: string = '[WebDesigner]'

  /**
   * Set the log level (messages below this level will not be logged)
   */
  setLevel(level: LogLevel): void {
    this.level = level
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.level
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log('debug', message, context)
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      this.log('info', message, context)
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.WARN) {
      this.log('warn', message, context)
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
    if (this.level <= LogLevel.ERROR) {
      const fullContext = {
        ...context,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      }
      this.log('error', message, fullContext)
    }
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      timestamp: new Date().toISOString(),
      ...context,
    })
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, durationMs: number, context?: LogContext): void {
    const level = status >= 400 ? 'warn' : 'info'
    this[level](`API Response: ${method} ${url} - ${status}`, {
      method,
      url,
      status,
      durationMs,
      timestamp: new Date().toISOString(),
      ...context,
    })
  }

  /**
   * Log API error
   */
  apiError(method: string, url: string, error: any, context?: LogContext): void {
    this.error(`API Error: ${method} ${url}`, error, {
      method,
      url,
      timestamp: new Date().toISOString(),
      ...context,
    })
  }

  /**
   * Log user action
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      action,
      timestamp: new Date().toISOString(),
      ...context,
    })
  }

  /**
   * Log performance metric
   */
  performance(operation: string, durationMs: number, context?: LogContext): void {
    const level = durationMs > 1000 ? 'warn' : 'debug'
    this[level](`Performance: ${operation}`, {
      operation,
      durationMs,
      timestamp: new Date().toISOString(),
      ...context,
    })
  }

  /**
   * Start a performance timer
   */
  startTimer(operation: string): Timer {
    return new Timer(this, operation)
  }

  /**
   * Start a console group (for related logs)
   */
  group(label: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.group(`${this.prefix} ${label}`)
    }
  }

  /**
   * End a console group
   */
  groupEnd(): void {
    if (this.level <= LogLevel.DEBUG) {
      console.groupEnd()
    }
  }

  /**
   * Internal logging method
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString()
    const formattedMessage = `${this.prefix} [${level.toUpperCase()}] ${message}`

    if (context && Object.keys(context).length > 0) {
      console[level](formattedMessage, context)
    } else {
      console[level](formattedMessage)
    }

    // Future: Send to remote logging service
    // if (level === 'error') {
    //   this.sendToRemote(level, message, context)
    // }
  }

  /**
   * Future: Send logs to remote logging service
   */
  // private sendToRemote(level: string, message: string, context?: LogContext): void {
  //   // TODO: Implement remote logging
  //   // Could send to Gateway audit log or external service
  // }
}

/**
 * Performance timer class
 */
export class Timer {
  private startTime: number
  private operation: string
  private logger: Logger

  constructor(logger: Logger, operation: string) {
    this.logger = logger
    this.operation = operation
    this.startTime = performance.now()
    this.logger.debug(`Starting: ${operation}`)
  }

  /**
   * Stop the timer and log the duration
   */
  stop(context?: LogContext): void {
    const duration = performance.now() - this.startTime
    this.logger.performance(this.operation, duration, context)
  }

  /**
   * Get elapsed time without stopping
   */
  elapsed(): number {
    return performance.now() - this.startTime
  }
}

/**
 * Singleton logger instance
 */
const logger = new Logger()

// Set log level based on environment
if (process.env.NODE_ENV === 'development') {
  logger.setLevel(LogLevel.DEBUG)
} else {
  logger.setLevel(LogLevel.INFO)
}

export default logger

// Export convenience functions
export const debug = (message: string, context?: LogContext) => logger.debug(message, context)
export const info = (message: string, context?: LogContext) => logger.info(message, context)
export const warn = (message: string, context?: LogContext) => logger.warn(message, context)
export const error = (message: string, err?: Error | any, context?: LogContext) => logger.error(message, err, context)
export const userAction = (action: string, context?: LogContext) => logger.userAction(action, context)
export const performance = (operation: string, durationMs: number, context?: LogContext) =>
  logger.performance(operation, durationMs, context)
export const startTimer = (operation: string) => logger.startTimer(operation)
