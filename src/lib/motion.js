// Shared motion helpers. Everything here switches itself off for people who
// ask their device for reduced motion.

const media = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches;

export const reducedMotion = () => media('(prefers-reduced-motion: reduce)');
export const finePointer = () => media('(hover: hover) and (pointer: fine)');
export const touchScreen = () => !finePointer();

/** Ask the petal layer for a small burst at a screen position. */
export function burstPetals(x, y, count = 8) {
  window.dispatchEvent(new CustomEvent('petals:burst', { detail: { x, y, count } }));
}

// ---------- scroll-linked parallax ----------
// One scroll listener for the whole page. Each registered element receives
//   --par  : -1 (above centre) … 0 (centred) … 1 (below centre)
//   --seen : 0 → 1 as it travels from the bottom edge to the top edge

const items = new Set();
let queued = false;

function measure() {
  queued = false;
  const vh = window.innerHeight;
  items.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -120 || r.top > vh + 120) return;
    const par = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
    const seen = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    el.style.setProperty('--par', par.toFixed(4));
    el.style.setProperty('--seen', seen.toFixed(4));
  });
}

function schedule() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(measure);
  }
}

export function watchParallax(el) {
  if (!el || reducedMotion()) return () => {};
  items.add(el);
  if (items.size === 1) {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }
  schedule();
  return () => {
    items.delete(el);
    if (!items.size) {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    }
  };
}

/** Re-measure after layout changes (route change, images loading…). */
export const refreshParallax = schedule;

/**
 * Marks an element data-away while it is off screen, so CSS can pause the
 * animations inside it (nobody is looking, so the device can rest).
 */
export function pauseWhenAway(el) {
  if (!el || !('IntersectionObserver' in window)) return () => {};
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) el.removeAttribute('data-away');
      else el.setAttribute('data-away', '');
    },
    { rootMargin: '150px 0px' }
  );
  io.observe(el);
  return () => io.disconnect();
}

