import { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { digits, pad2 } from '../i18n/format.js';
import { reducedMotion } from '../lib/motion.js';
import ImageSlot from './ImageUploader.jsx';
import Reveal from './Reveal.jsx';
import { ChevronIcon, PlusIcon, TrashIcon } from './Icons.jsx';

const isRtl = (el) => getComputedStyle(el).direction === 'rtl';

// A project's supporting images as a gallery carousel at the foot of the
// project: swipe on phones, drag with the mouse, or use the arrows.
// Slides snap into place; a hairline shows how far along you are.
export default function Gallery({ images, title, onChange, onOpen, onAdd, onRemoveFrame }) {
  const { lang, t, editing } = usePortfolio();
  const root = useRef(null);
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  // where we are along the strip: arrows, progress line
  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      const pos = Math.abs(el.scrollLeft);
      root.current?.style.setProperty('--thumb', max > 1 ? el.clientWidth / el.scrollWidth : 1);
      root.current?.style.setProperty('--progress', max > 1 ? Math.min(1, pos / max) : 0);
      setEdges({ start: pos <= 2, end: pos >= max - 2 });
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    const images = el.querySelectorAll('img');
    images.forEach((img) => img.addEventListener('load', queue));
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      images.forEach((img) => img.removeEventListener('load', queue));
    };
  }, [images.length, editing]);

  const slideWidth = () => {
    const el = track.current;
    const slide = el.querySelector('.gallery__slide');
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return slide ? slide.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
  };

  // one slide forward (+1) or back (-1), whichever way the page reads
  const step = (by) => {
    const el = track.current;
    el.scrollBy({
      left: by * slideWidth() * (isRtl(el) ? -1 : 1),
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  };

  // drag with the mouse (touch already swipes natively)
  useEffect(() => {
    const el = track.current;
    if (!el || editing) return undefined;
    let down = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let settle = 0;

    const onDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved) {
        if (Math.abs(dx) < 6) return;
        moved = true;
        clearTimeout(settle);
        el.classList.add('is-dragging');
        el.setPointerCapture?.(e.pointerId);
      }
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      // glide to the nearest slide in the direction of the drag
      const w = slideWidth();
      const sign = isRtl(el) ? -1 : 1;
      const max = el.scrollWidth - el.clientWidth;
      const at = Math.abs(el.scrollLeft) / w;
      const forward = Math.abs(el.scrollLeft) > Math.abs(startScroll);
      const target = Math.min(max, (forward ? Math.ceil(at - 0.15) : Math.floor(at + 0.15)) * w);
      el.scrollTo({ left: Math.max(0, target) * sign, behavior: reducedMotion() ? 'auto' : 'smooth' });
      settle = setTimeout(() => el.classList.remove('is-dragging'), 550);
    };
    // a drag is not a click on the image
    const onClick = (e) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('click', onClick, true);
    return () => {
      clearTimeout(settle);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, [editing]);

  const still = edges.start && edges.end; // everything fits: no need for arrows

  return (
    <Reveal className={`gallery ${still ? 'is-still' : ''}`} ref={root}>
      <div className="gallery__head">
        <h3 className="display gallery__title">{t.gallery}</h3>
        <div className="gallery__nav">
          <button
            type="button"
            className="gallery__arrow"
            onClick={() => step(-1)}
            disabled={edges.start}
            aria-label={t.previous}
          >
            <ChevronIcon dir="start" size={20} />
          </button>
          <button
            type="button"
            className="gallery__arrow"
            onClick={() => step(1)}
            disabled={edges.end}
            aria-label={t.next}
          >
            <ChevronIcon dir="end" size={20} />
          </button>
        </div>
      </div>

      <div className="gallery__track" ref={track} tabIndex={0} role="group" aria-label={t.gallery}>
        {images.map((ref, k) => (
          <figure className="gallery__slide" key={k} style={{ '--i': k }}>
            <ImageSlot value={ref} onChange={onChange(k)} alt={title} onOpen={(rect) => onOpen(ref, rect)} />
            <figcaption className="gallery__num">{digits(pad2(k + 1), lang)}</figcaption>
            {editing && images.length > 1 && (
              <button
                type="button"
                className="gallery__drop"
                onClick={() => onRemoveFrame(k)}
                aria-label={t.removeFrame}
                title={t.removeFrame}
              >
                <TrashIcon size={15} />
              </button>
            )}
          </figure>
        ))}
        {editing && (
          <button type="button" className="gallery__add" onClick={onAdd}>
            <PlusIcon size={20} />
            <span>{t.addFrame}</span>
          </button>
        )}
      </div>

      <div className="gallery__progress" aria-hidden="true">
        <span />
      </div>
    </Reveal>
  );
}
