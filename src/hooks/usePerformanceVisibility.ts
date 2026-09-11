import { useState, useEffect, type RefObject } from 'react';

export interface PerformanceVisibilityState {
  isDocumentVisible: boolean;
  isInView: boolean;
  prefersReducedMotion: boolean;
  shouldAnimate: boolean;
}

export function usePerformanceVisibility<T extends HTMLElement = HTMLElement>(
  targetRef?: RefObject<T | null>,
  options: IntersectionObserverInit = { rootMargin: '100px 0px 100px 0px', threshold: 0.05 }
): PerformanceVisibilityState {
  const [isDocumentVisible, setIsDocumentVisible] = useState(() => {
    return typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
  });

  const [isInView, setIsInView] = useState(true);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  useEffect(() => {
    if (!targetRef?.current || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const node = targetRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, options.rootMargin, options.threshold]);

  const shouldAnimate = isDocumentVisible && isInView && !prefersReducedMotion;

  return {
    isDocumentVisible,
    isInView,
    prefersReducedMotion,
    shouldAnimate,
  };
}
