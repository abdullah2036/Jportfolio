import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { imageStore } from '../store/imageStore.js';
import { countLabel, digits, formatMonth, pick, yearOf } from '../i18n/format.js';
import EditableText from './EditableText.jsx';
import CountUp from './CountUp.jsx';
import ImageSlot from './ImageUploader.jsx';
import { ArrowBackIcon, ChevronIcon, CloseIcon, PlusIcon, TrashIcon } from './Icons.jsx';

// 05 — The archive: every piece of a project, in a calm grid, on its own layer.
export default function Archive() {
  const { overlay, content } = usePortfolio();
  const project = overlay && content?.projects.find((p) => p.id === overlay.projectId);
  if (!project) return null;
  return <ArchiveLayer key={project.id} project={project} initialTopic={overlay.topic || ''} />;
}

function useLockScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
    };
  }, []);
}

function ArchiveLayer({ project, initialTopic }) {
  const { lang, t, editing, actions, closeArchive, openViewer, viewer } = usePortfolio();
  const [year, setYear] = useState('');
  const [topic, setTopic] = useState(initialTopic);
  const [closing, setClosing] = useState(false);
  const dialog = useRef(null);
  useLockScroll();

  const close = () => {
    setClosing(true);
    setTimeout(closeArchive, 320);
  };

  useEffect(() => {
    dialog.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !viewer && !e.target.isContentEditable) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const items = project.items;
  const years = useMemo(
    () => [...new Set(items.map((it) => yearOf(it.date)).filter(Boolean))].sort().reverse(),
    [items]
  );
  const topics = editing ? project.topics : project.topics.filter((tp) => items.some((it) => it.topic === tp.id));
  const visible = items.filter((it) => (!year || yearOf(it.date) === year) && (!topic || it.topic === topic));

  const caption = (it) => [pick(it.title, lang), formatMonth(it.date, lang)].filter(Boolean).join(' — ');
  const withImages = visible.filter((it) => it.image);
  const slides = withImages.map((it) => ({ image: it.image, caption: caption(it) }));
  const title = pick(project.title, lang);
  const isSeries = project.layout === 'series';
  // columns on this screen, so pieces can arc in from their side of the grid
  const cols = window.innerWidth > 1100 ? 5 : window.innerWidth > 820 ? 4 : window.innerWidth > 560 ? 3 : 2;
  const arc = (k) => ({ '--i': Math.min(k, 14), '--col': (k % cols) - (cols - 1) / 2 });

  return (
    <div
      className={`archive ${closing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — ${isSeries ? t.archive : t.fullProject}`}
      ref={dialog}
      tabIndex={-1}
    >
      <div className="archive__scroll">
        <div className="archive__inner">
          <div className="archive__bar">
            <button type="button" className="archive__back" onClick={close}>
              <ArrowBackIcon size={17} /> {t.back}
            </button>
            <div className="archive__bar-end">
              <CountUp
                className="label archive__count"
                value={items.length}
                duration={900}
                render={(n) => countLabel(n, project.unit, lang)}
              />
              <button type="button" className="archive__close" onClick={close} aria-label={t.close}>
                <CloseIcon size={22} />
              </button>
            </div>
          </div>

          <div className="archive__head">
            <h2 className="archive__title">
              {title} <span>— {isSeries ? t.archive : t.fullProject}</span>
            </h2>
            {(years.length > 0 || topics.length > 0) && (
              <div className="archive__filters">
                {years.length > 0 && (
                  <FilterSelect
                    value={year}
                    onChange={setYear}
                    label={t.allYears}
                    options={years.map((y) => [y, digits(y, lang)])}
                  />
                )}
                {topics.length > 0 && (
                  <FilterSelect
                    value={topic}
                    onChange={setTopic}
                    label={t.allTopics}
                    options={topics.map((tp) => [tp.id, pick(tp.label, lang)])}
                  />
                )}
              </div>
            )}
          </div>

          <ul className="archive__grid" key={`${year}|${topic}`}>
            {editing && (
              <li className="archive__item" style={arc(0)}>
                <AddImagesTile onAdd={(refs) => actions.addItems(project.id, refs)} />
              </li>
            )}
            {visible.map((it, k) => (
              <li key={it.id} className="archive__item" style={arc(editing ? k + 1 : k)}>
                <figure>
                  <div className="archive__frame">
                    {editing || !it.image ? (
                      <ImageSlot
                        value={it.image}
                        onChange={(ref) => actions.setItem(project.id, it.id, { image: ref })}
                        alt={caption(it)}
                      />
                    ) : (
                      <button
                        type="button"
                        className="archive__open"
                        data-cursor="view"
                        onClick={(e) =>
                          openViewer(slides, withImages.indexOf(it), e.currentTarget.getBoundingClientRect())
                        }
                        aria-label={caption(it) || t.image}
                      >
                        <ImageSlot value={it.image} alt={caption(it)} />
                      </button>
                    )}
                  </div>
                  <figcaption className="archive__caption">
                    <EditableText
                      className="archive__cap-title"
                      value={it.title}
                      onChange={(v) => actions.setItem(project.id, it.id, { title: v })}
                      placeholder={t.image}
                    />
                    {editing ? (
                      <ItemTools project={project} item={it} />
                    ) : (
                      <span className="archive__cap-date">{formatMonth(it.date, lang)}</span>
                    )}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          {!visible.length && !editing && (
            <p className="archive__empty">{items.length ? t.emptyFilter : t.emptyArchive}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, label, options }) {
  return (
    <label className="archive__select">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{label}</option>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
      <ChevronIcon dir="down" size={15} />
    </label>
  );
}

function ItemTools({ project, item }) {
  const { lang, t, actions } = usePortfolio();
  const index = project.items.findIndex((it) => it.id === item.id);
  return (
    <span className="archive__tools">
      <input
        type="month"
        value={item.date || ''}
        onChange={(e) => actions.setItem(project.id, item.id, { date: e.target.value })}
        aria-label="date"
      />
      {project.topics.length > 0 && (
        <select
          value={item.topic || ''}
          onChange={(e) => actions.setItem(project.id, item.id, { topic: e.target.value })}
        >
          <option value="">{t.noTopic}</option>
          {project.topics.map((tp) => (
            <option key={tp.id} value={tp.id}>
              {pick(tp.label, lang)}
            </option>
          ))}
        </select>
      )}
      <span className="archive__tool-row">
        <button type="button" disabled={index === 0} onClick={() => actions.moveItem(project.id, item.id, -1)} aria-label={t.moveEarlier} title={t.moveEarlier}>
          <ChevronIcon dir="start" size={15} />
        </button>
        <button type="button" disabled={index === project.items.length - 1} onClick={() => actions.moveItem(project.id, item.id, 1)} aria-label={t.moveLater} title={t.moveLater}>
          <ChevronIcon dir="end" size={15} />
        </button>
        <button type="button" onClick={() => actions.removeItem(project.id, item.id)} aria-label={t.remove} title={t.remove}>
          <TrashIcon size={15} />
        </button>
      </span>
    </span>
  );
}

// "+ Add images": several files at once, from the picker or dropped in.
function AddImagesTile({ onAdd }) {
  const { t, lang } = usePortfolio();
  const input = useRef(null);
  const [progress, setProgress] = useState(null);
  const [over, setOver] = useState(false);

  async function accept(fileList) {
    const files = [...(fileList || [])].filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const refs = [];
    for (let i = 0; i < files.length; i++) {
      setProgress(`${digits(i + 1, lang)} / ${digits(files.length, lang)}`);
      refs.push(await imageStore.save(files[i]));
    }
    setProgress(null);
    onAdd(refs);
  }

  return (
    <div
      className={`archive__add ${over ? 'is-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        accept(e.dataTransfer.files);
      }}
    >
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          accept(e.target.files);
          e.target.value = '';
        }}
      />
      <button type="button" onClick={() => input.current?.click()} disabled={Boolean(progress)}>
        <span className="slot__plus">
          <PlusIcon size={20} />
        </span>
        <span>{progress ? `${t.uploading} ${progress}` : t.addImages}</span>
      </button>
    </div>
  );
}
