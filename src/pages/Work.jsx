import { useLayoutEffect } from 'react';
import { usePortfolio, useChapter } from '../store/PortfolioContext.jsx';
import { digits, pad2, pick } from '../i18n/format.js';
import { href, navigate } from '../hooks/useRoute.js';
import ProjectFeature from '../components/ProjectFeature.jsx';
import ProjectSeries from '../components/ProjectSeries.jsx';
import ProjectEditor from '../components/ProjectEditor.jsx';
import { ArrowBackIcon, PlusIcon } from '../components/Icons.jsx';

// A chapter of the portfolio, one project at a time.
export default function Work({ categoryId, projectId }) {
  const { ordered, editing } = usePortfolio();
  const { index, category } = useChapter(categoryId);
  const inChapter = ordered.filter((p) => p.categoryId === categoryId);
  const project = inChapter.find((p) => p.id === projectId) || inChapter[0];

  // before paint, so a page turn reveals the new page from its top
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [categoryId, projectId]);

  if (!category) {
    return (
      <section className="empty-chapter wrap">
        <a className="text-link" href={href('work')}>
          <ArrowBackIcon size={17} />
        </a>
      </section>
    );
  }

  return (
    <div className="work-page">
      {editing && project && <ProjectEditor project={project} />}
      {!project && <EmptyChapter category={category} index={index} />}
      {project?.layout === 'series' && <ProjectSeries project={project} showBar />}
      {project && project.layout !== 'series' && <ProjectFeature project={project} />}
      {project && (inChapter.length > 1 || editing) && (
        <ChapterIndex category={category} index={index} projects={inChapter} current={project.id} />
      )}
    </div>
  );
}

function EmptyChapter({ category, index }) {
  const { lang, t, editing, actions } = usePortfolio();
  return (
    <section className="empty-chapter">
      <div className="wrap">
        <nav className="project-bar">
          <a className="text-link" href={href('work')}>
            <ArrowBackIcon size={17} />
            {t.backToWork}
          </a>
        </nav>
        <p className="chapter-label">
          <b>{digits(pad2(index + 1), lang)}</b> / {t.chapter}
        </p>
        <h2 className="display empty-chapter__title">{pick(category.title, lang)}</h2>
        <p className="empty-chapter__text">{editing ? t.emptyChapterEdit : t.comingSoon}</p>
        {editing && (
          <button
            type="button"
            className="add-card"
            onClick={() => navigate('work', category.id, actions.addProject(category.id))}
          >
            <span className="slot__plus">
              <PlusIcon size={20} />
            </span>
            {t.addProject}
          </button>
        )}
      </div>
    </section>
  );
}

function ChapterIndex({ category, index, projects, current }) {
  const { lang, t, editing, actions } = usePortfolio();
  return (
    <section className="chapter-index">
      <div className="wrap">
        <div className="chapter-index__head">
          <span className="label">{t.inThisChapter}</span>
          <span className="chapter-label">
            <b>{digits(pad2(index + 1), lang)}</b> / {pick(category.title, lang)}
          </span>
        </div>
        <ol className="chapter-index__list">
          {projects.map((p, k) => (
            <li key={p.id} className={p.id === current ? 'is-current' : ''}>
              <a
                className="wipe"
                href={href('work', category.id, p.id)}
                aria-current={p.id === current ? 'page' : undefined}
              >
                <span className="chapter-index__num">{digits(pad2(k + 1), lang)}</span>
                <span className="chapter-index__title">{pick(p.title, lang)}</span>
                <span className="chapter-index__meta">
                  {pick(p.type, lang)} · {digits(p.year, lang)}
                </span>
              </a>
            </li>
          ))}
          {editing && (
            <li>
              <button
                type="button"
                className="edit-link"
                onClick={() => navigate('work', category.id, actions.addProject(category.id))}
              >
                <PlusIcon size={14} /> {t.addProject}
              </button>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
