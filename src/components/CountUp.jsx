import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../lib/motion.js';

// A number that counts up the first time it comes into view
// ("24 Editions" rolls 1 → 24). `render` turns the number into the label.
export default function CountUp({ value, render, duration = 1300, className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => (reducedMotion() || value <= 1 ? value : 1));
  const played = useRef(false);

  useEffect(() => {
    if (played.current || reducedMotion() || value <= 1) {
      setShown(value);
      return undefined;
    }
    const el = ref.current;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        played.current = true;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(Math.max(1, Math.round(eased * value)));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={`count-up ${className}`}>
      <span className="sr-only">{render(value)}</span>
      <span aria-hidden="true">{render(shown)}</span>
    </span>
  );
}
