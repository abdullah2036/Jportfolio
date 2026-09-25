import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { tearHorizontal } from '../lib/random.js';
import { useParallax } from '../hooks/useMotion.js';
import { StoredImage } from './ImageUploader.jsx';
import DuskScene from './DuskScene.jsx';

// A banner between About and the contents: as you scroll, two torn paper
// curtains slide apart and reveal the cover's scene *behind* the page. The
// scene is fixed to the screen, so the page seems to glide over it.
// Only transforms move (smooth on phones too); while the banner is off
// screen the scene is removed from the page entirely.
export default function Vista() {
  const { content } = usePortfolio();
  const hero = content.site.hero;
  const section = useParallax(); // --seen drives how far the curtains have parted
  const box = useRef(null);
  const [near, setNear] = useState(false);
  const edgeTop = useMemo(() => tearHorizontal(71, { at: 8 }), []);
  const edgeBottom = useMemo(() => tearHorizontal(83, { at: 8 }), []);

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    let queued = 0;
    const check = () => {
      queued = 0;
      const r = el.getBoundingClientRect();
      setNear(r.bottom > -200 && r.top < window.innerHeight + 200);
    };
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      className={`vista ${near ? 'is-near' : ''}`}
      aria-hidden="true"
      ref={(el) => {
        section.current = el;
        box.current = el;
      }}
    >
      <div className="vista__window">
        <div className="vista__scene">
          {hero.image ? <StoredImage value={hero.image} /> : <DuskScene variant="cover" uid="vista" />}
        </div>
      </div>
      <div className="vista__curtains">
        <div className="vista__panel vista__panel--top">
          <span className="vista__rim" style={{ clipPath: edgeTop.rim }} />
          <span className="vista__paper" style={{ clipPath: edgeTop.paper }} />
        </div>
        <div className="vista__panel vista__panel--bottom">
          <span className="vista__rim" style={{ clipPath: edgeBottom.rim }} />
          <span className="vista__paper" style={{ clipPath: edgeBottom.paper }} />
        </div>
      </div>
    </div>
  );
}
