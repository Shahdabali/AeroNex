import { useEffect, useRef, memo } from 'react';

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (val: number) => string;
}

export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  duration = 260,
  className = '',
  format = (val: number) => Math.round(val).toString(),
}: AnimatedNumberProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(value);
  const rafIdRef = useRef<number | null>(null);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;

    // Check for reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startVal = prevValueRef.current;
    const targetVal = value;

    if (prefersReducedMotion || startVal === targetVal) {
      node.textContent = formatRef.current(targetVal);
      prevValueRef.current = targetVal;
      return;
    }

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);

      const currentInterp = startVal + (targetVal - startVal) * easedProgress;
      node.textContent = formatRef.current(currentInterp);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        node.textContent = formatRef.current(targetVal);
        prevValueRef.current = targetVal;
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [value, duration]);

  // Initial text content on first render
  return (
    <span 
      ref={spanRef} 
      className={`tabular-nums inline-block font-mono ${className}`}
    >
      {format(value)}
    </span>
  );
});
