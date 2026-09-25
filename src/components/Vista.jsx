import { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { StoredImage } from './ImageUploader.jsx';
import DuskScene from './DuskScene.jsx';

// A banner between About and the contents: the cover's scene, seen through a
// window in the page. The scene is fixed to the screen, so the page glides
// over it. When the banner comes into view the window opens out smoothly
// (a timed animation, not tied to the scroll) and plays again on the next visit.
// While the banner is off screen the scene is removed from the page entirely.
export default function Vista() {
  const { content } = usePortfolio();
  const hero = content.site.hero;
  const box = useRef(null);
  const [near, setNear] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    let queued = 0;
    const check = () => {
      queued = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setNear(r.bottom > -200 && r.top < vh + 200);
      const seen = Math.min(r.bottom, vh) - Math.max(r.top, 0); // visible height
      if (seen > Math.min(r.height, vh) * 0.3) setOpen(true);
      else if (r.bottom < 0 || r.top > vh) setOpen(false); // fully gone: ready to play again
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
    <div className={`vista ${near ? 'is-near' : ''} ${open ? 'is-open' : ''}`} aria-hidden="true" ref={box}>
      <div className="vista__window">
        <div className="vista__scene">
          <div className="vista__zoom">
            {hero.image ? <StoredImage value={hero.image} /> : <DuskScene variant="cover" uid="vista" />}
          </div>
        </div>
      </div>
    </div>
  );
}
