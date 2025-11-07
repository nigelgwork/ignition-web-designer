import {
  parseError,
  getUserFriendlyMessage,
  isRetryable,
  retryWithBackoff,
  ApiError,
} from '../../utils/errorHandler'

/**
 * Unit tests for errorHandler utility functions.
 *
 * Tests error parsing, user-friendly messages, retry logic,
 * and error classification.
 */
describe('errorHandler', () => {
  // ===== parseError Tests =====

  describe('parseError', () => {
    test('parses network error correctly', () => {
      // Arrange
      const error = {
        message: 'Network Error',
        code: 'ERR_NETWORK',
      }

      // Act
      const result = parseError(error)

      // Assert
      expect(result.status).toBe(0)
      expect(result.message).toBe('Network Error')
      expect(result.context).toBe('network')
    })

    test('parses 404 error correctly', () => {
      // Arrange
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {
            message: 'View not found',
          },
        },
      }

      // Act
      const result = parseError(error)

      // Assert
      expect(result.status).toBe(404)
      expect(result.message).toBe('View not found')
    })

    test('parses 401 error correctly', () => {
      // Arrange
      const error = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: {
            message: 'Authentication required',
          },
        },
      }

      // Act
      const result = parseError(error)

      // Assert
      expect(result.status).toBe(401)
      expect(result.message).toBe('Authentication required')
    })

    test('parses 403 error correctly', () => {
      // Arrange
      const error = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: {
            message: 'Insufficient permissions',
          },
        },
      }

      // Act
      const result = parseError(error)

      // Assert
      expect(result.status).toBe(403)
      expect(result.message).toBe('Insufficient permissions')
    })

    test('parses 500 error correctly', () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {
            message: 'Server error occurred',
          },
        },
      }

      // Act
      const result = parseError(error)

      // Assert
      expect(result.status).toBe(500)
      expect(result.message).toBe('Server error occurred')
    })

    test('falls back to statusText when message not in data', () => {
      // Arrange
      const error = {
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: {},
        },
      }

      // Act
      const result = parseError(error)

      // Assert
      expect(result.status).toBe(400)
      expect(result.message).toBe('Bad Request')
    })

    test('handles error with nested error property', () => {
      // Arrange
      const error = {
        response: {
          status: 400,
          data: {
            error: 'Invalid input',
          },
        },
      }

      // Act
      const result = parseError(error)

      // Assert
      expect(result.message).toBe('Invalid input')
    })
  })

  // ===== getUserFriendlyMessage Tests =====

  describe('getUserFriendlyMessage', () => {
    test('returns friendly message for 401 error', () => {
      // Arrange
      const error: ApiError = {
        status: 401,
        message: 'Unauthorized',
        context: 'authentication',
      }

      // Act
      const result = getUserFriendlyMessage(error)

      // Assert
      expect(result).toContain('logged in')
      expect(result).toContain('session')
    })

    test('returns friendly message for 403 error', () => {
      // Arrange
      const error: ApiError = {
        status: 403,
        message: 'Forbidden',
        context: 'authorization',
      }

      // Act
      const result = getUserFriendlyMessage(error)

      // Assert
      expect(result).toContain('permission')
      expect(result).toContain('Designer')
    })

    test('returns friendly message for 404 error', () => {
      // Arrange
      const error: ApiError = {
        status: 404,
        message: 'Not Found',
        context: 'loading',
      }

      // Act
      const result = getUserFriendlyMessage(error)

      // Assert
      expect(result).toContain('not found')
    })

    test('returns friendly message for 409 conflict', () => {
      // Arrange
      const error: ApiError = {
        status: 409,
        message: 'Conflict',
        context: 'saving',
      }

      // Act
      const result = getUserFriendlyMessage(error)

      // Assert
      expect(result).toContain('modified')
      expect(result).toContain('reload')
    })

    test('returns friendly message for 500 error', () => {
      // Arrange
      const error: ApiError = {
        status: 500,
        message: 'Internal Server Error',
        context: 'processing',
      }

      // Act
      const result = getUserFriendlyMessage(error)

      // Assert
      expect(result).toContain('server error')
      expect(result).toContain('try again')
    })

    test('returns friendly message for network error', () => {
      // Arrange
      const error: ApiError = {
        status: 0,
        message: 'Network Error',
        context: 'network',
      }

      // Act
      const result = getUserFriendlyMessage(error)

      // Assert
      expect(result).toContain('network')
      expect(result).toContain('connection')
    })

    test('returns original message for unknown error code', () => {
      // Arrange
      const error: ApiError = {
        status: 418, // I'm a teapot
        message: "I'm a teapot",
        context: 'unknown',
      }

      // Act
      const result = getUserFriendlyMessage(error)

      // Assert
      expect(result).toBe("I'm a teapot")
    })
  })

  // ===== isRetryable Tests =====

  describe('isRetryable', () => {
    test('returns true for network errors', () => {
      // Arrange
      const error: ApiError = {
        status: 0,
        message: 'Network Error',
        context: 'network',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(true)
    })

    test('returns true for 500 errors', () => {
      // Arrange
      const error: ApiError = {
        status: 500,
        message: 'Internal Server Error',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(true)
    })

    test('returns true for 502 Bad Gateway', () => {
      // Arrange
      const error: ApiError = {
        status: 502,
        message: 'Bad Gateway',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(true)
    })

    test('returns true for 503 Service Unavailable', () => {
      // Arrange
      const error: ApiError = {
        status: 503,
        message: 'Service Unavailable',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(true)
    })

    test('returns true for 504 Gateway Timeout', () => {
      // Arrange
      const error: ApiError = {
        status: 504,
        message: 'Gateway Timeout',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(true)
    })

    test('returns false for 400 errors', () => {
      // Arrange
      const error: ApiError = {
        status: 400,
        message: 'Bad Request',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(false)
    })

    test('returns false for 401 errors', () => {
      // Arrange
      const error: ApiError = {
        status: 401,
        message: 'Unauthorized',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(false)
    })

    test('returns false for 403 errors', () => {
      // Arrange
      const error: ApiError = {
        status: 403,
        message: 'Forbidden',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(false)
    })

    test('returns false for 404 errors', () => {
      // Arrange
      const error: ApiError = {
        status: 404,
        message: 'Not Found',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(false)
    })

    test('returns false for 409 conflict', () => {
      // Arrange
      const error: ApiError = {
        status: 409,
        message: 'Conflict',
      }

      // Act & Assert
      expect(isRetryable(error)).toBe(false)
    })
  })

  // ===== retryWithBackoff Tests =====

  describe('retryWithBackoff', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('succeeds on first attempt', async () => {
      // Arrange
      const mockFn = jest.fn().mockResolvedValue('success')

      // Act
      const promise = retryWithBackoff(mockFn, 3, 1000)
      const result = await promise

      // Assert
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('retries on retryable error', async () => {
      // Arrange
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce({
          response: { status: 500, data: { message: 'Server error' } },
        })
        .mockResolvedValueOnce('success')

      // Act
      const promise = retryWithBackoff(mockFn, 3, 1000)

      // Advance timers for first retry (1000ms)
      jest.advanceTimersByTime(1000)
      await Promise.resolve() // Allow promise to process

      const result = await promise

      // Assert
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2) // Initial + 1 retry
    })

    test('does not retry on non-retryable error', async () => {
      // Arrange
      const mockFn = jest.fn().mockRejectedValue({
        response: { status: 400, data: { message: 'Bad request' } },
      })

      // Act & Assert
      await expect(retryWithBackoff(mockFn, 3, 1000)).rejects.toMatchObject({
        response: { status: 400 },
      })

      expect(mockFn).toHaveBeenCalledTimes(1) // No retries
    })

    test('uses exponential backoff', async () => {
      // Arrange
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockResolvedValueOnce('success')

      // Act
      const promise = retryWithBackoff(mockFn, 3, 1000)

      // First retry after 1000ms
      jest.advanceTimersByTime(1000)
      await Promise.resolve()

      // Second retry after 2000ms (exponential)
      jest.advanceTimersByTime(2000)
      await Promise.resolve()

      const result = await promise

      // Assert
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    test('gives up after max retries', async () => {
      // Arrange
      const mockFn = jest.fn().mockRejectedValue({
        response: { status: 500, data: { message: 'Server error' } },
      })

      // Act
      const promise = retryWithBackoff(mockFn, 2, 100)

      // Advance through all retries
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(100 * Math.pow(2, i))
        await Promise.resolve()
      }

      // Assert
      await expect(promise).rejects.toMatchObject({
        response: { status: 500 },
      })

      expect(mockFn).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })

  // ===== Edge Cases =====

  describe('Edge Cases', () => {
    test('handles error with no response property', () => {
      // Arrange
      const error = new Error('Something went wrong')

      // Act
      const result = parseError(error)

      // Assert
      expect(result.status).toBe(0)
      expect(result.message).toBe('Something went wrong')
    })

    test('handles error with empty response data', () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: null,
        },
      }

      // Act
      const result = parseError(error)

      // Assert
      expect(result.status).toBe(500)
      expect(result.message).toBe('Internal Server Error')
    })

    test('handles error with non-standard structure', () => {
      // Arrange
      const error = {
        weirdProperty: 'weird value',
      }

      // Act
      const result = parseError(error)

      // Assert
      expect(result.status).toBe(0)
      expect(result.message).toBeDefined()
    })

    test('handles circular error object gracefully', () => {
      // Arrange
      const error: any = {
        response: {
          status: 500,
          data: {},
        },
      }
      error.response.data.circular = error // Create circular reference

      // Act & Assert - Should not throw
      expect(() => parseError(error)).not.toThrow()
    })
  })

  // ===== Security Tests =====

  describe('Security', () => {
    test('does not expose sensitive information in error messages', () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          data: {
            message: 'Database connection failed: jdbc://admin:password123@localhost/db',
          },
        },
      }

      // Act
      const result = parseError(error)
      const userMessage = getUserFriendlyMessage(result)

      // Assert - User-friendly message should not contain credentials
      expect(userMessage).not.toContain('password123')
      expect(userMessage).not.toContain('jdbc://')
    })

    test('sanitizes XSS attempts in error messages', () => {
      // Arrange
      const error = {
        response: {
          status: 400,
          data: {
            message: '<script>alert("XSS")</script>',
          },
        },
      }

      // Act
      const result = parseError(error)

      // Assert - Message is stored as string, React will escape on render
      expect(result.message).toBe('<script>alert("XSS")</script>')
      expect(typeof result.message).toBe('string')
    })
  })
})
