import { useEffect, useRef, useState } from "react";

interface PerformanceMetrics {
  renderTime: number;
  renderCount: number;
  lastRenderTime: number;
}

/**
 * Hook to monitor component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const renderStartTime = useRef(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    renderCount: 0,
    lastRenderTime: 0,
  });

  useEffect(() => {
    renderCount.current += 1;
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    setMetrics({
      renderCount: renderCount.current,
      renderTime,
      lastRenderTime: renderEndTime,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Performance] ${componentName} - Render #${renderCount.current} took ${renderTime.toFixed(2)}ms`
      );
    }
  });

  // Mark render start
  renderStartTime.current = performance.now();

  return metrics;
}

/**
 * Hook to debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to throttle a function
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      lastRun.current = now;
      return callback(...args);
    }
  }) as T;
}

/**
 * Hook to measure page load performance
 */
export function usePageLoadMetrics() {
  const [metrics, setMetrics] = useState<{
    pageLoadTime: number;
    domContentLoadedTime: number;
    timeToInteractive: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        setMetrics({
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoadedTime:
            navigation.domContentLoadedEventEnd - navigation.fetchStart,
          timeToInteractive:
            navigation.domInteractive - navigation.fetchStart,
        });
      }
    };

    // Measure after page fully loads
    if (document.readyState === "complete") {
      measurePerformance();
    } else {
      window.addEventListener("load", measurePerformance);
      return () => window.removeEventListener("load", measurePerformance);
    }
  }, []);

  return metrics;
}

/**
 * Hook to detect slow renders
 */
export function useSlowRenderDetector(
  threshold = 16, // 16ms = 60fps
  componentName: string
) {
  const renderStartTime = useRef(0);

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;

    if (renderTime > threshold && process.env.NODE_ENV === "development") {
      console.warn(
        `[Slow Render] ${componentName} took ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
  });

  renderStartTime.current = performance.now();
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return isIntersecting;
}

/**
 * Hook to measure API call performance
 */
export function useApiPerformance() {
  const logApiCall = (
    endpoint: string,
    startTime: number,
    success: boolean
  ) => {
    const duration = performance.now() - startTime;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API] ${endpoint} - ${success ? "✓" : "✗"} ${duration.toFixed(2)}ms`
      );
    }

    // You can send this to analytics service
    return duration;
  };

  return { logApiCall };
}

/**
 * Hook to track memory usage (Chrome only)
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // @ts-ignore - performance.memory is Chrome-specific
    if (!performance.memory) {
      console.warn("Memory monitoring not supported in this browser");
      return;
    }

    const checkMemory = () => {
      // @ts-ignore
      const memory = performance.memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      });
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5s

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}
