import { useEffect, useMemo, useRef } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { pick } from '../i18n/format.js';
import { tear, tearHorizontal } from '../lib/random.js';
import { burstPetals, finePointer, pauseWhenAway, reducedMotion } from '../lib/motion.js';
import { navigate } from '../hooks/useRoute.js';
import EditableText from './EditableText.jsx';
import ImageSlot from './ImageUploader.jsx';
import DuskScene from './DuskScene.jsx';
import Button from './Button.jsx';
import SplitText from './SplitText.jsx';
import { ChevronIcon } from './Icons.jsx';

// Depth and scroll drift for the cover. Writes CSS variables only:
//   --hx / --hy  where the scene leans, -1…1 (eased): the cursor on a
//                computer; on a phone the phone's tilt where the browser
//                shares it, otherwise a slow drift of its own
//   --sy         how far the cover has scrolled, in px
function useCoverMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return undefined;
    const aim = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    let raf = 0;

    const tick = () => {
      now.x += (aim.x - now.x) * 0.06;
      now.y += (aim.y - now.y) * 0.06;
      el.style.setProperty('--hx', now.x.toFixed(4));
      el.style.setProperty('--hy', now.y.toFixed(4));
      raf = Math.abs(aim.x - now.x) + Math.abs(aim.y - now.y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      aim.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      aim.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      aim.x = 0;
      aim.y = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    let scrollRaf = 0;
    const scroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const y = Math.min(window.scrollY, el.offsetHeight + 200);
        el.style.setProperty('--sy', y.toFixed(1));
      });
    };

    // phones
    let gyro = false;
    let visible = true;
    let drift = 0;
    const start = performance.now();
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const onTilt = (e) => {
      if (e.gamma == null || e.beta == null) return;
      gyro = true;
      aim.x = clamp(e.gamma / 22);
      aim.y = clamp((e.beta - 40) / 22);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const wander = (now) => {
      drift = 0;
      if (!visible) return;
      if (!gyro) {
        const t = (now - start) / 1000;
        aim.x = Math.sin(t * 0.35) * 0.55;
        aim.y = Math.cos(t * 0.27) * 0.35;
        if (!raf) raf = requestAnimationFrame(tick);
      }
      drift = requestAnimationFrame(wander);
    };
    let io;

    if (finePointer()) {
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
    } else {
      window.addEventListener('deviceorientation', onTilt);
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !drift) drift = requestAnimationFrame(wander);
      });
      io.observe(el);
    }
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      cancelAnimationFrame(drift);
      io?.disconnect();
      window.removeEventListener('deviceorientation', onTilt);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
    };
  }, []);
  return ref;
}

// 01 — Cover. Torn paper sheet over an atmospheric image.
export default function Hero() {
  const { content, lang, t, editing, actions } = usePortfolio();
  const hero = content.site.hero;
  const about = content.site.about;
  const set = (key) => (value) => actions.setSite(['hero', key], value);
  // the short introduction under the name is the About Me title + line
  const setAbout = (key) => (value) => actions.setSite(['about', key], value);
  const rtl = lang === 'ar';
  const ref = useCoverMotion();
  useEffect(() => pauseWhenAway(ref.current), [ref]);

  const edge = useMemo(() => tear(17, { from: 47, to: 70, rtl }), [rtl]);
  const edgeSmall = useMemo(() => tearHorizontal(23, { at: 3 }), []);

  const goWork = (e) => {
    e.preventDefault();
    navigate('work');
  };

  // "scroll to begin" leads to the next chapter: About
  const goAbout = (e) => {
    e.preventDefault();
    navigate('about');
  };

  // tap (or click) the name and it ripples, shaking a few petals loose
  const wave = (e) => {
    const el = e.currentTarget;
    el.classList.remove('is-waving');
    void el.offsetWidth;
    el.classList.add('is-waving');
    burstPetals(e.clientX, e.clientY, 5);
    e.stopPropagation();
  };

  return (
    <section className="hero" id="cover" ref={ref} data-nav="home">
      <div className="hero__media" data-petals={editing ? undefined : 12}>
        <div className="hero__media-inner">
          <ImageSlot
            value={hero.image}
            onChange={set('image')}
            fallback={<DuskScene variant="cover" />}
            alt=""
            eager
          />
        </div>
        {editing ? (
          <EditableText as="p" multiline className="hero__tags" value={hero.tags} onChange={set('tags')} />
        ) : (
          <p className="hero__tags">
            {pick(hero.tags, lang)
              .split('\n')
              .map((line, i, all) => (
                <span key={i} className={i === all.length - 1 ? 'is-strong' : ''} style={{ '--i': i }}>
                  {line}
                </span>
              ))}
          </p>
        )}
      </div>

      <div
        className="hero__sheet"
        aria-hidden="true"
        style={{
          '--tear': edge.paper,
          '--tear-rim': edge.rim,
          '--tear-sm': edgeSmall.paper,
          '--tear-sm-rim': edgeSmall.rim,
        }}
      >
        <div className="hero__rim" />
        <div className="hero__paper" />
      </div>

      <div className="hero__content wrap">
        <div className="hero__copy">
          <EditableText as="p" className="label hero__eyebrow" value={hero.eyebrow} onChange={set('eyebrow')} />
          {editing ? (
            <EditableText as="h1" multiline className="display hero__title" value={hero.title} onChange={set('title')} />
          ) : (
            <SplitText
              as="h1"
              className="display hero__title"
              text={pick(hero.title, lang)}
              lang={lang}
              delay={250}
              onClick={wave}
            />
          )}
          <EditableText
            as="p"
            multiline
            className="display hero__tagline"
            value={about.title}
            onChange={setAbout('title')}
          />
          <EditableText
            as="p"
            multiline
            className="hero__lead"
            value={about.lead}
            onChange={setAbout('lead')}
            motion="words-auto"
          />
          <Button href="#/work" onClick={goWork} className="hero__cta" data-petals="8">
            {t.explorePortfolio}
          </Button>
        </div>

        <EditableText as="p" multiline className="script hero__script" value={hero.script} onChange={set('script')} />

        <a className="hero__scroll" href="#/about" onClick={goAbout}>
          <span className="hero__scroll-line" />
          <span className="hero__scroll-dot">
            <ChevronIcon dir="down" size={16} />
          </span>
          <span className="label hero__scroll-text">
            {t.scroll}
            <br />
            {t.toBegin}
          </span>
        </a>
      </div>
    </section>
  );
}
