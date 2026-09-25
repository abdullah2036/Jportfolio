import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { countLabel, digits, pad2, pick } from '../i18n/format.js';
import { deckle } from '../lib/random.js';
import { href, navigate } from '../hooks/useRoute.js';
import EditableText from './EditableText.jsx';
import ImageSlot, { StoredImage } from './ImageUploader.jsx';
import Reveal from './Reveal.jsx';
import { ArrowIcon, PlusIcon } from './Icons.jsx';
import CountUp from './CountUp.jsx';
import { useParallax, useTilt } from '../hooks/useMotion.js';
import { reducedMotion } from '../lib/motion.js';

// The chapter cards are sorted onto the page like prints on a table: every
// time the contents scroll into view they gather into a loose stack in the
// middle, then leave it one by one, in reading order, for their places.
// Scroll away and they are gathered up again, ready for the next visit.
function sortCards(grid) {
  const cards = [...grid.querySelectorAll('.toc__item')];
  const g = grid.getBoundingClientRect();
  const cx = g.left + g.width / 2;
  const cy = g.top + Math.min(g.height, window.innerHeight * 0.8) / 2;
  const n = cards.length;
  const duration = 1100 + n * 190;
  cards.forEach((card, i) => {
    const r = card.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2) + (i - (n - 1) / 2) * 5;
    const dy = cy - (r.top + r.height / 2) - i * 4;
    const tilt = (i % 2 ? 1 : -1) * (2.5 + ((i * 37) % 7));
    const stack = `translate(${dx}px, ${dy}px) rotate(${tilt}deg) scale(0.74)`;
    const leave = Math.min(0.55, 0.16 + i * (0.42 / Math.max(1, n - 1)));
    card.style.zIndex = String(n - i); // the first chapter sits on top of the stack
    card
      .animate(
        [
          { transform: `${stack} translateY(40px)`, opacity: 0, offset: 0 },
          { transform: stack, opacity: 1, offset: 0.1, easing: 'cubic-bezier(0.3, 0, 0.3, 1)' },
          { transform: stack, opacity: 1, offset: leave, easing: 'cubic-bezier(0.2, 0.8, 0.15, 1)' },
          { transform: 'none', opacity: 1, offset: Math.min(1, leave + 0.45) },
          { transform: 'none', opacity: 1, offset: 1 },
        ],
        { duration }
      )
      .finished.then(
        () => (card.style.zIndex = ''),
        () => (card.style.zIndex = '')
      );
  });
}

function useSortedCards(disabled) {
  const ref = useRef(null);
  const [armed] = useState(() => !disabled && !reducedMotion() && 'IntersectionObserver' in window);
  const [waiting, setWaiting] = useState(armed);

  useEffect(() => {
    const grid = ref.current;
    if (!grid || !armed) return undefined;
    let placed = false;
    const place = () => {
      if (placed) return;
      placed = true;
      sortCards(grid);
      setWaiting(false);
    };
    const gather = () => {
      if (!placed) return;
      placed = false;
      grid.querySelectorAll('.toc__item').forEach((card) => card.getAnimations().forEach((a) => a.cancel()));
      setWaiting(true);
    };
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (e.intersectionRatio >= 0.12) place();
        else if (!e.isIntersecting) gather();
      },
      { threshold: [0, 0.12] }
    );
    io.observe(grid);
    // safety net, in case the browser is slow to report the first view
    const check = setTimeout(() => {
      const r = grid.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.88 && r.bottom > 0) place();
    }, 1500);
    return () => {
      io.disconnect();
      clearTimeout(check);
    };
  }, [armed]);

  return [ref, waiting];
}

// 02 — Table of Contents: one entry per chapter.
export default function TableOfContents() {
  const { content, actions, editing } = usePortfolio();
  const c = content.site.contents;
  const [grid, dealing] = useSortedCards(editing);
  const set = (key) => (value) => actions.setSite(['contents', key], value);

  return (
    <section className="toc" id="contents" data-nav="work">
      <div className="wrap">
        <div className="toc__head">
          <Reveal className="toc__heading">
            <EditableText as="p" className="label" value={c.eyebrow} onChange={set('eyebrow')} />
            <EditableText
              as="h2"
              multiline
              className="display toc__title"
              value={c.title}
              onChange={set('title')}
              motion="roll"
            />
          </Reveal>
          <Reveal className="toc__intro" delay={140}>
            <EditableText as="p" multiline value={c.intro} onChange={set('intro')} motion="words" />
            <span className="toc__rule" aria-hidden="true" />
          </Reveal>
        </div>

        <ol className={`toc__grid ${dealing ? 'is-waiting' : ''}`} ref={grid}>
          {content.categories.map((cat, i) => (
            <TocEntry key={cat.id} category={cat} index={i} />
          ))}
          <Reveal as="li" className="toc__script" delay={380}>
            <EditableText as="p" multiline className="toc__script-text" value={c.script} onChange={set('script')} />
          </Reveal>
        </ol>
      </div>
    </section>
  );
}

function TocEntry({ category, index }) {
  const { content, lang, t, editing, actions } = usePortfolio();
  const projects = content.projects.filter((p) => p.categoryId === category.id);
  const clip = useMemo(() => deckle(index * 17 + 5, { ax: 1.1, ay: 1.9, step: 2.3 }), [index]);

  // Without a chapter cover, borrow the first image found in the chapter.
  const borrowed = useMemo(() => {
    for (const p of projects) {
      const ref = p.image || p.supporting.find(Boolean) || p.items.find((it) => it.image)?.image;
      if (ref) return ref;
    }
    return null;
  }, [projects]);

  const title = pick(category.title, lang);
  const tilt = useTilt({ max: 4, disabled: editing });
  const scrollTilt = useParallax(); // phones: the card leans as it scrolls past

  return (
    <li className="toc__entry" ref={scrollTilt}>
      <div className="toc__item" ref={tilt} data-cursor={editing ? undefined : 'open'}>
        <div className="toc__thumb" style={{ clipPath: clip }}>
          <ImageSlot
            value={category.cover}
            onChange={(ref) => actions.setCategory(category.id, 'cover', ref)}
            fallback={borrowed ? <StoredImage value={borrowed} /> : null}
          />
        </div>
        <div className="toc__text">
          <span className="toc__num">{digits(pad2(index + 1), lang)}</span>
          <EditableText
            as="h3"
            className="toc__name"
            value={category.title}
            onChange={(v) => actions.setCategory(category.id, 'title', v)}
          />
          <CountUp className="toc__count" value={projects.length} render={(n) => countLabel(n, 'project', lang)} />
          {editing && (
            <button
              type="button"
              className="edit-link toc__add"
              onClick={() => navigate('work', category.id, actions.addProject(category.id))}
            >
              <PlusIcon size={14} /> {t.addProject}
            </button>
          )}
        </div>
        <a className="toc__link" href={href('work', category.id)} aria-label={title} data-petals="5">
          <ArrowIcon size={20} />
        </a>
      </div>
    </li>
  );
}
