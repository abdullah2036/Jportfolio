import { useCallback, useEffect, useRef, useState } from 'react';

// Marks its content .is-in once it scrolls into view; CSS decides how things
// arrive (fade, stagger, rolling titles, words un-blurring…).
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  stagger = false,
  className = '',
  style,
  children,
  ref: outerRef,
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  // keep our own handle and still hand the element to a parent that asked
  const setRef = useCallback(
    (el) => {
      ref.current = el;
      if (typeof outerRef === 'function') outerRef(el);
      else if (outerRef) outerRef.current = el;
    },
    [outerRef]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }
    // Safety net: whatever is already on screen (or already scrolled past)
    // shows without waiting for the observer, so no section can stay blank.
    const onScreen = () => el.getBoundingClientRect().top < window.innerHeight * 0.96;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    io.observe(el);
    const check = () => {
      if (onScreen()) {
        setShown(true);
        io.disconnect();
        window.removeEventListener('scroll', onScroll);
      }
    };
    const first = requestAnimationFrame(check);
    const later = setTimeout(check, 1200);
    let queued = 0;
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(() => ((queued = 0), check()));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(first);
      cancelAnimationFrame(queued);
      clearTimeout(later);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <Tag
      ref={setRef}
      className={`reveal ${stagger ? 'reveal--stagger' : ''} ${shown ? 'is-in' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
