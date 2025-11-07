/**
 * Performance Optimization Utilities
 *
 * Provides utilities for optimizing React component performance:
 * - Memoization helpers
 * - Debouncing and throttling
 * - Performance monitoring
 * - Lazy loading helpers
 */

import { useCallback, useEffect, useRef, useMemo } from 'react'

/**
 * Debounce a function call
 * Useful for expensive operations like API calls on user input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle a function call
 * Useful for high-frequency events like scroll or resize
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for previous value (useful for comparison)
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * Hook for stable callback reference
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args)
  }, []) as T
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)

    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    return result
  }) as T
}

/**
 * Deep equality check (use sparingly - expensive)
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}

/**
 * Shallow equality check (faster than deep)
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}

/**
 * Batch state updates (React 18 auto-batches, but useful for React 17)
 */
export function batchUpdates(callback: () => void): void {
  // In React 18, this is automatic
  // For React 17, would use ReactDOM.unstable_batchedUpdates
  callback()
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }): number {
  if (typeof window.requestIdleCallback !== 'undefined') {
    return window.requestIdleCallback(callback, options)
  } else {
    // Fallback to setTimeout
    return setTimeout(callback, 1) as unknown as number
  }
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallback(id: number): void {
  if (typeof window.cancelIdleCallback !== 'undefined') {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * Measure render performance
 */
export function measureRenderTime(componentName: string, callback: () => void): void {
  const start = performance.now()
  callback()
  const end = performance.now()
  const duration = end - start

  if (duration > 16.67) {
    // Longer than 1 frame (60fps)
    console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms (> 16.67ms)`)
  }
}

/**
 * Hook to measure component render count (debugging)
 */
export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current += 1
    console.log(`[Render Count] ${componentName}: ${renderCount.current}`)
  })

  return renderCount.current
}

/**
 * Hook to log why component re-rendered (debugging)
 */
export function useWhyDidYouUpdate(componentName: string, props: Record<string, any>): void {
  const previousProps = useRef<Record<string, any>>()

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props })
      const changedProps: Record<string, { from: any; to: any }> = {}

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          }
        }
      })

      if (Object.keys(changedProps).length > 0) {
        console.log(`[Why Updated] ${componentName}:`, changedProps)
      }
    }

    previousProps.current = props
  })
}

/**
 * Virtualization helper - calculate visible items in a list
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = Math.min(totalItems, start + visibleCount + overscan * 2)

  return { start, end }
}

/**
 * Lazy load component with retry logic
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries: number = 3
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let lastError: any

    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport()
      } catch (error) {
        lastError = error
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }

    throw lastError
  })
}

// Fix for useDebounce (missing React import)
import React from 'react'
