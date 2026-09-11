import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, motion } from 'framer-motion';

export function AnimatedNumber({
  value,
  duration = 2000,
  className = "",
  format = (val: number) => Math.round(val).toString(),
}: {
  value: number;
  duration?: number;
  className?: string;
  format?: (val: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration,
    bounce: 0,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest);
      }
    });
  }, [springValue, format]);

  return <motion.span ref={ref} className={className} />;
}
