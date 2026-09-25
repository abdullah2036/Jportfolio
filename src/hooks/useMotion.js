import { useEffect, useRef } from 'react';
import { finePointer, reducedMotion, watchParallax } from '../lib/motion.js';

/** Scroll parallax: the element gets --par / --seen CSS variables. */
export function useParallax() {
  const ref = useRef(null);
  useEffect(() => watchParallax(ref.current), []);
  return ref;
}

/**
 * A gentle 3D tilt that follows the cursor. Sets --rx / --ry (degrees) and
 * --mx / --my (-1…1) on the element; CSS decides what to do with them.
 */
export function useTilt({ max = 5, disabled = false } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled || reducedMotion() || !finePointer()) return undefined;
    let frame = 0;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const my = ((e.clientY - r.top) / r.height) * 2 - 1;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--mx', mx.toFixed(3));
        el.style.setProperty('--my', my.toFixed(3));
        el.style.setProperty('--rx', `${(-my * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(mx * max).toFixed(2)}deg`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      ['--mx', '--my', '--rx', '--ry'].forEach((v) => el.style.removeProperty(v));
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(frame);
    };
  }, [max, disabled]);
  return ref;
}

/** The element leans a few pixels toward the cursor (buttons). */
export function useMagnetic(strength = 0.22, limit = 8) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !finePointer()) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const dx = Math.max(-limit, Math.min(limit, (e.clientX - (r.left + r.width / 2)) * strength));
      const dy = Math.max(-limit, Math.min(limit, (e.clientY - (r.top + r.height / 2)) * strength));
      el.style.setProperty('--pull-x', `${dx.toFixed(1)}px`);
      el.style.setProperty('--pull-y', `${dy.toFixed(1)}px`);
    };
    const leave = () => {
      el.style.removeProperty('--pull-x');
      el.style.removeProperty('--pull-y');
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength, limit]);
  return ref;
}

/**
 * For a horizontal strip that scrolls on phones: the child nearest the
 * middle is marked data-center="1" so CSS can bring it forward.
 */
export function useCenterFocus(selector) {
  const ref = useRef(null);
  useEffect(() => {
    const strip = ref.current;
    if (!strip || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.target.dataset.center = e.intersectionRatio > 0.6 ? '1' : '0')),
      { root: strip, threshold: [0, 0.6, 1] }
    );
    strip.querySelectorAll(selector).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector]);
  return ref;
}
