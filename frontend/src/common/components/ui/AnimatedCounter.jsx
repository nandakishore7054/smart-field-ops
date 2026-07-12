import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

export function AnimatedCounter({ value, duration = 1.5, className = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView && typeof value === 'number') {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        
        // Easing function: easeOutExpo
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        setDisplayValue(Math.floor(easeProgress * value));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };
      window.requestAnimationFrame(step);
    } else if (typeof value !== 'number') {
      setDisplayValue(value);
    }
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
