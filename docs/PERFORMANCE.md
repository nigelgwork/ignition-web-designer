# Performance Optimization Guide

This document outlines performance optimizations implemented in the Web Designer and best practices for maintaining performance.

## Performance Utilities

### Frontend (`frontend/src/utils/performance.ts`)

**Debouncing & Throttling:**
```typescript
import { debounce, throttle, useDebounce } from './utils/performance'

// Debounce API calls on user input
const debouncedSearch = debounce(searchFunction, 300)

// Throttle scroll events
const throttledScroll = throttle(handleScroll, 100)

// Hook for debounced value
const debouncedSearchTerm = useDebounce(searchTerm, 300)
```

**Memoization:**
```typescript
import { memoize, shallowEqual, deepEqual } from './utils/performance'

// Memoize expensive computations
const expensiveCalc = memoize((data) => {
  // ... expensive operation
})

// Use React.memo with custom comparison
const MyComponent = React.memo(Component, shallowEqual)
```

**Performance Monitoring:**
```typescript
import { measureRenderTime, useRenderCount, useWhyDidYouUpdate } from './utils/performance'

// Measure render performance
measureRenderTime('MyComponent', () => {
  // render logic
})

// Debug render counts
const renderCount = useRenderCount('MyComponent')

// Debug why component re-rendered
useWhyDidYouUpdate('MyComponent', props)
```

**Virtualization:**
```typescript
import { calculateVisibleRange } from './utils/performance'

// For large lists, render only visible items
const { start, end } = calculateVisibleRange(scrollTop, containerHeight, itemHeight, totalItems)
const visibleItems = items.slice(start, end)
```

### Backend (`gateway/src/main/java/com/me/webdesigner/util/PerformanceMonitor.java`)

**Operation Timing:**
```java
PerformanceMonitor.Timer timer = PerformanceMonitor.start("Load projects");
// ... do work
timer.stop(); // Logs if > 1000ms

// Custom threshold
timer.stopWithThreshold(500); // Warn if > 500ms
```

**Statistics:**
```java
// Get stats for an operation
OperationStats stats = PerformanceMonitor.getStats("Load projects");
System.out.println("Average: " + stats.getAverageDuration() + "ms");

// Log all stats
PerformanceMonitor.logAllStats();

// Reset stats
PerformanceMonitor.resetAllStats();
```

## Optimization Strategies

### 1. Component Optimization

**Use React.memo:**
```typescript
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>
}, shallowEqual)
```

**Use useMemo for expensive computations:**
```typescript
const sortedData = useMemo(() => {
  return data.sort(compareFn)
}, [data])
```

**Use useCallback for stable function references:**
```typescript
const handleClick = useCallback(() => {
  onClick(id)
}, [id, onClick])
```

### 2. State Management

**Minimize re-renders:**
- Keep state as local as possible
- Use separate stores for unrelated data
- Use selectors to access only needed data

**Example with Zustand:**
```typescript
// Bad: causes re-render on any store change
const store = useStore()

// Good: only re-renders when selectedComponent changes
const selectedComponent = useStore(state => state.selectedComponent)
```

### 3. Bundle Optimization

**Current bundle size: 350KB**

**Lazy loading:**
```typescript
import { lazyWithRetry } from './utils/performance'

const HeavyComponent = lazyWithRetry(() => import('./HeavyComponent'))
```

**Code splitting:**
- Split by route
- Split by feature
- Lazy load modals and dialogs

### 4. Network Optimization

**API calls:**
- Debounce user input (300ms)
- Cache responses when appropriate
- Use ETag for conditional requests
- Batch multiple requests

**Example:**
```typescript
const debouncedFetch = debounce(async (query) => {
  const response = await apiClient.get(`/search?q=${query}`)
  // ... handle response
}, 300)
```

### 5. Rendering Optimization

**Virtualization for long lists:**
- Implement virtual scrolling for 100+ items
- Use `calculateVisibleRange()` utility
- Render only visible items + overscan

**Canvas optimization:**
- Use requestAnimationFrame for animations
- Batch DOM updates
- Avoid layout thrashing

### 6. Backend Optimization

**File I/O:**
- Use buffered readers/writers
- Close resources properly
- Cache file metadata

**JSON parsing:**
- Use streaming parsers for large files
- Limit JSON size (see ErrorHandler.validateJsonSize)

**Database queries:**
- Use connection pooling (Ignition handles this)
- Limit result sets
- Use indexes appropriately

## Performance Targets

### Frontend

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load | < 2s | ~1.5s |
| Bundle Size | < 500KB | 350KB ✓ |
| Time to Interactive | < 3s | ~2s |
| Render Time (60fps) | < 16.67ms | ~10ms avg |

### Backend

| Operation | Target | Notes |
|-----------|--------|-------|
| List Projects | < 500ms | Depends on project count |
| List Views | < 500ms | Depends on view count |
| Load View | < 200ms | Depends on view size |
| Save View | < 500ms | Includes validation |
| Load Scripts | < 300ms | Depends on script count |
| Load Queries | < 300ms | Depends on query count |

## Monitoring

### Frontend Performance API

```typescript
// Measure component mount time
const mountStart = performance.now()
useEffect(() => {
  const mountEnd = performance.now()
  console.log(`Mount time: ${mountEnd - mountStart}ms`)
}, [])

// Use Performance Observer
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(entry.name, entry.duration)
  })
})
observer.observe({ entryTypes: ['measure'] })
```

### Backend Monitoring

```java
// Use PerformanceMonitor throughout handlers
PerformanceMonitor.Timer timer = PerformanceMonitor.start("Operation name");
try {
  // ... operation
} finally {
  timer.stop();
}

// Periodic stats logging (in GatewayHook)
executorService.scheduleAtFixedRate(() -> {
  PerformanceMonitor.logAllStats();
}, 0, 1, TimeUnit.HOURS);
```

## Common Performance Issues

### 1. Excessive Re-renders

**Symptoms:**
- Slow UI interactions
- High CPU usage
- Laggy scrolling

**Solutions:**
- Use React.memo
- Use useCallback/useMemo
- Split components
- Use useWhyDidYouUpdate to debug

### 2. Large Bundle Size

**Symptoms:**
- Slow initial load
- High network usage

**Solutions:**
- Code splitting
- Lazy loading
- Remove unused dependencies
- Use production builds

### 3. Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Slow performance after extended use

**Solutions:**
- Clean up event listeners
- Cancel timers in useEffect cleanup
- Clear intervals
- Abort pending API calls

### 4. Slow API Responses

**Symptoms:**
- Long wait times
- Timeout errors

**Solutions:**
- Add caching
- Optimize queries
- Use pagination
- Implement streaming for large data

## Best Practices

### Frontend

1. **Avoid inline functions in render:**
   ```typescript
   // Bad
   <button onClick={() => handleClick(id)}>Click</button>

   // Good
   const onClick = useCallback(() => handleClick(id), [id])
   <button onClick={onClick}>Click</button>
   ```

2. **Use key prop correctly:**
   ```typescript
   // Bad: index as key
   items.map((item, i) => <Item key={i} />)

   // Good: stable ID
   items.map(item => <Item key={item.id} />)
   ```

3. **Lazy load images:**
   ```typescript
   <img loading="lazy" src={src} alt={alt} />
   ```

4. **Use CSS for animations when possible:**
   - CSS transitions are hardware-accelerated
   - Avoid animating layout properties
   - Use transform and opacity

### Backend

1. **Use try-with-resources:**
   ```java
   try (FileReader reader = new FileReader(file)) {
     // ... use reader
   } // Automatically closed
   ```

2. **Limit result sets:**
   ```java
   // Always specify limits
   paths.limit(1000).forEach(...)
   ```

3. **Use appropriate log levels:**
   ```java
   // Debug for detailed logs
   logger.debug("Processing view: {}", viewPath);

   // Info for important events
   logger.info("User saved view: {}", viewPath);
   ```

4. **Cache expensive operations:**
   ```java
   private final Map<String, CachedData> cache = new ConcurrentHashMap<>();
   ```

## Future Optimizations

### Frontend
- [ ] Implement virtual scrolling for component tree
- [ ] Add service worker for offline support
- [ ] Implement progressive web app features
- [ ] Add bundle analyzer
- [ ] Implement code splitting by route

### Backend
- [ ] Implement response caching
- [ ] Add database query optimization
- [ ] Implement batch operations
- [ ] Add compression for large responses
- [ ] Implement streaming for large files

## Measuring Impact

### Before Optimization
Document baseline metrics:
- Bundle size
- Load time
- Render time
- API response time

### After Optimization
Measure improvements:
- % reduction in bundle size
- % improvement in load time
- Frame rate improvements
- API response time improvements

### Tools

**Frontend:**
- Chrome DevTools Performance tab
- Lighthouse
- React DevTools Profiler
- webpack-bundle-analyzer

**Backend:**
- Ignition Gateway logs
- PerformanceMonitor stats
- Java VisualVM
- JProfiler

---

**Last Updated:** 2025-11-07
**Version:** 0.27.0
