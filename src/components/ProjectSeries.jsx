import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolio, useChapter } from '../store/PortfolioContext.jsx';
import { countLabel, digits, pad2, pick } from '../i18n/format.js';
import { deckle, uid } from '../lib/random.js';
import EditableText from './EditableText.jsx';
import ImageSlot, { StoredImage } from './ImageUploader.jsx';
import Button from './Button.jsx';
import Reveal from './Reveal.jsx';
import ProjectBar from './ProjectBar.jsx';
import Parallax from './Parallax.jsx';
import { PaperNote, Sprig } from './Paper.jsx';
import { CloseIcon, PlusIcon } from './Icons.jsx';
import CountUp from './CountUp.jsx';
import { reducedMotion } from '../lib/motion.js';

// As the artwork scrolls past, the topics light up one after another and a
// hairline fills beside them — a small scroll-told story of the series.
// Writes --story (0…1) on the panel; returns the topic in focus.
function useTopicStory(count, disabled) {
  const block = useRef(null);
  const panel = useRef(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!count || disabled || reducedMotion()) return undefined;
    let raf = 0;
    let last = -2;
    const measure = () => {
      raf = 0;
      const el = block.current;
      if (!el) return;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5 + r.height)));
      panel.current?.style.setProperty('--story', p.toFixed(4));
      const next = p <= 0 ? -1 : Math.min(count - 1, Math.floor(p * count));
      if (next !== last) {
        last = next;
        setActive(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [count, disabled]);

  return { block, panel, active };
}

// 04 — A large body of work (a publication, a poster series…): one cover
// artwork up front, everything else waits in the archive.
export default function ProjectSeries({ project, showBar = false }) {
  const { lang, t, editing, actions, openArchive } = usePortfolio();
  const { index, category } = useChapter(project.categoryId);
  const set = (key) => (value) => actions.setProject(project.id, { [key]: value });
  const panelClip = useMemo(
    () => deckle(41, { ax: 1.6, ay: 0.9, step: 1.8, edges: lang === 'ar' ? 'tr' : 'tl' }),
    [lang],
  );

  const setTopic = (id, label) =>
    actions.setProject(project.id, (p) => ({ topics: p.topics.map((tp) => (tp.id === id ? { ...tp, label } : tp)) }));
  const removeTopic = (id) =>
    actions.setProject(project.id, (p) => ({
      topics: p.topics.filter((tp) => tp.id !== id),
      items: p.items.map((it) => (it.topic === id ? { ...it, topic: '' } : it)),
    }));
  const addTopic = () =>
    actions.setProject(project.id, (p) => ({
      topics: [...p.topics, { id: uid('tp'), label: { ar: t.addTopic, en: t.addTopic } }],
    }));

  const cover = project.image || project.items.find((it) => it.image)?.image || null;
  const story = useTopicStory(project.topics.length, editing);
  const [hovered, setHovered] = useState(-1);
  const focus = hovered >= 0 ? hovered : story.active;
  const focusTopic = focus >= 0 ? project.topics[focus] : null;
  const focusImage =
    !editing && focusTopic ? project.items.find((it) => it.topic === focusTopic.id && it.image)?.image : null;

  return (
    <section className="series" data-nav="work">
      <div className="wrap">
        {showBar && <ProjectBar project={project} />}

        <div className="series__top">
          <Reveal className="series__intro" stagger>
            <p className="chapter-label">
              <b>{digits(pad2(index + 1), lang)}</b> / {pick(category?.title, lang)}
            </p>
            <EditableText
              as="h2"
              className="display series__title"
              value={project.title}
              onChange={set('title')}
              motion="roll"
            />
            <p className="series__meta">
              {project.items.length > 0 && (
                <>
                  <CountUp value={project.items.length} render={(n) => countLabel(n, project.unit, lang)} />
                  <span className="dot" aria-hidden="true">
                    ·
                  </span>
                </>
              )}
              <EditableText value={project.subtitle} onChange={set('subtitle')} />
            </p>
            <EditableText
              as="p"
              multiline
              className="series__desc"
              value={project.description}
              onChange={set('description')}
              motion="words"
            />
            <Button onClick={() => openArchive(project.id)}>{t.viewArchive}</Button>
          </Reveal>

          <Reveal className="series__aside" delay={160}>
            <Parallax className="series__float">
              <PaperNote className="series__note" rotate={-1.5} seed={29}>
                <EditableText
                  as="p"
                  multiline
                  className="series__note-text"
                  value={project.note}
                  onChange={set('note')}
                />
              </PaperNote>
              <Sprig className="series__sprig" seed={13} />
            </Parallax>
          </Reveal>
        </div>

        <div className="series__bottom" ref={story.block}>
          <Reveal
            className="series__media"
            data-cursor={editing ? undefined : 'archive'}
            onClick={editing ? undefined : () => openArchive(project.id)}
          >
            <Parallax depth={5}>
              <ImageSlot
                value={project.image}
                onChange={set('image')}
                alt={pick(project.title, lang)}
                fallback={!project.image && cover ? <StoredImage value={cover} /> : null}
              />
              {focusImage && (
                <div className="series__swap" key={focusImage}>
                  <StoredImage value={focusImage} />
                </div>
              )}
            </Parallax>
          </Reveal>
          <Reveal
            as="aside"
            className="series__topics"
            delay={200}
            style={{ clipPath: panelClip }}
            ref={story.panel}
            onMouseLeave={() => setHovered(-1)}
          >
            <span className="series__story" aria-hidden="true" />
            <ul>
              {project.topics.map((tp, k) => (
                <li key={tp.id} className={!editing && focus === k ? 'is-active' : ''}>
                  {editing ? (
                    <>
                      <EditableText value={tp.label} onChange={(v) => setTopic(tp.id, v)} />
                      <button
                        type="button"
                        className="series__topic-remove"
                        onClick={() => removeTopic(tp.id)}
                        aria-label={t.remove}
                      >
                        <CloseIcon size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="wipe"
                      onMouseEnter={() => setHovered(k)}
                      onFocus={() => setHovered(k)}
                      onClick={() => openArchive(project.id, { topic: tp.id })}
                    >
                      {pick(tp.label, lang)}
                    </button>
                  )}
                </li>
              ))}
              {editing && (
                <li>
                  <button type="button" className="edit-link" onClick={addTopic}>
                    <PlusIcon size={13} /> {t.addTopic}
                  </button>
                </li>
              )}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
