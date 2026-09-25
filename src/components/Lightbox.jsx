import { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { useImageSrc } from '../hooks/useImageSrc.js';
import { digits } from '../i18n/format.js';
import { reducedMotion } from '../lib/motion.js';
import { ChevronIcon, CloseIcon } from './Icons.jsx';

// The large image viewer: the first image grows out of the thumbnail that was
// clicked; previous / next slide in from their side. Keys, swipe, Esc.
export default function Lightbox() {
  const { viewer } = usePortfolio();
  if (!viewer || !viewer.slides.length) return null;
  return <Viewer />;
}

function Viewer() {
  const { viewer, setViewerIndex, closeViewer, lang, t } = usePortfolio();
  const { slides, index, origin } = viewer;
  const slide = slides[index];
  const count = slides.length;
  const rtl = lang === 'ar';
  const touch = useRef(null);
  const root = useRef(null);
  const direction = useRef(0);
  const firstIndex = useRef(index);
  const [closing, setClosing] = useState(false);

  const go = (step) => {
    direction.current = step;
    setViewerIndex((index + step + count) % count);
  };

  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(closeViewer, reducedMotion() ? 0 : 260);
  };

  useEffect(() => {
    root.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(rtl ? -1 : 1);
      if (e.key === 'ArrowLeft') go(rtl ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const growFrom = index === firstIndex.current && direction.current === 0 ? origin : null;

  return (
    <div
      className={`viewer ${closing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={slide.caption || t.image}
      tabIndex={-1}
      ref={root}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 50) go((dx < 0) !== rtl ? 1 : -1);
      }}
    >
      <button type="button" className="viewer__backdrop" onClick={close} aria-label={t.close} />
      <button type="button" className="viewer__close" onClick={close} aria-label={t.close}>
        <CloseIcon size={24} />
      </button>

      <figure className="viewer__stage">
        <ViewerImage
          key={`${slide.image}-${index}`}
          refValue={slide.image}
          alt={slide.caption}
          origin={growFrom}
          from={direction.current}
          rtl={rtl}
        />
        <figcaption className="viewer__caption" key={`c${index}`}>
          <span>{slide.caption}</span>
          {count > 1 && (
            <span className="viewer__count">
              {digits(index + 1, lang)} {t.of} {digits(count, lang)}
            </span>
          )}
        </figcaption>
      </figure>

      {count > 1 && (
        <>
          <button type="button" className="viewer__nav viewer__nav--prev" onClick={() => go(-1)} aria-label={t.previous}>
            <ChevronIcon dir="start" size={30} />
          </button>
          <button type="button" className="viewer__nav viewer__nav--next" onClick={() => go(1)} aria-label={t.next}>
            <ChevronIcon dir="end" size={30} />
          </button>
        </>
      )}
    </div>
  );
}

function ViewerImage({ refValue, alt, origin, from, rtl }) {
  const src = useImageSrc(refValue);
  const [loaded, setLoaded] = useState(false);
  if (!src) return <div className="viewer__img viewer__img--empty" />;

  const onLoad = (e) => {
    setLoaded(true);
    const img = e.currentTarget;
    if (reducedMotion()) return;
    if (origin) {
      // FLIP: start exactly over the thumbnail, then grow into place
      const r = img.getBoundingClientRect();
      const scale = origin.width / r.width;
      const dx = origin.left + origin.width / 2 - (r.left + r.width / 2);
      const dy = origin.top + origin.height / 2 - (r.top + r.height / 2);
      img.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.4 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    } else if (from) {
      const side = (from > 0 ? 1 : -1) * (rtl ? -1 : 1);
      img.animate(
        [
          { transform: `translateX(${side * 60}px) rotate(${side * 0.6}deg)`, opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    }
  };

  return <img src={src} alt={alt} className={`viewer__img ${loaded ? 'is-loaded' : ''}`} onLoad={onLoad} />;
}
