import { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { finePointer, reducedMotion } from '../lib/motion.js';

// A small burgundy seal that follows the cursor over artwork ("عرض" / "View")
// and chapters ("افتح" / "Open"). Mouse and trackpad only.
export default function CursorBadge() {
  const { t, editing } = usePortfolio();
  const el = useRef(null);
  const [label, setLabel] = useState('');
  const active = !editing && finePointer() && !reducedMotion();

  useEffect(() => {
    if (!active) return undefined;
    document.documentElement.classList.add('has-cursor');
    const pos = { x: -200, y: -200, tx: -200, ty: -200 };
    let raf = 0;
    let current = '';

    const tick = () => {
      pos.x += (pos.tx - pos.x) * 0.22;
      pos.y += (pos.ty - pos.y) * 0.22;
      if (el.current) el.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = Math.abs(pos.tx - pos.x) + Math.abs(pos.ty - pos.y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };

    const move = (e) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      const host = e.target.closest?.('[data-cursor]');
      const next = host ? host.dataset.cursor : '';
      if (next !== current) {
        current = next;
        setLabel(next);
        if (next && pos.x < -100) {
          pos.x = pos.tx;
          pos.y = pos.ty;
        }
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const hide = () => {
      current = '';
      setLabel('');
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', hide);
    window.addEventListener('scroll', hide, { passive: true });
    return () => {
      document.documentElement.classList.remove('has-cursor');
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('scroll', hide);
    };
  }, [active]);

  if (!active) return null;
  return (
    <div ref={el} className={`cursor-badge ${label ? 'is-on' : ''}`} aria-hidden="true">
      <span>{label ? t.cursor[label] : ''}</span>
    </div>
  );
}
