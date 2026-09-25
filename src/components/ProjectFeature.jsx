import { usePortfolio, useChapter } from '../store/PortfolioContext.jsx';
import { digits, latinDigits, pad2, pick } from '../i18n/format.js';
import EditableText from './EditableText.jsx';
import ImageSlot from './ImageUploader.jsx';
import Button from './Button.jsx';
import Reveal from './Reveal.jsx';
import ProjectBar from './ProjectBar.jsx';
import Parallax from './Parallax.jsx';
import { useCenterFocus } from '../hooks/useMotion.js';
import SitePreview from './SitePreview.jsx';

// 03 — A single project: dominant artwork, story beside it, and its other
// images in a gallery set apart at the foot. On the home page only the last
// project shows its gallery (see Home.jsx); a project's own page always does.
export default function ProjectFeature({ project, gallery = true }) {
  const { lang, t, editing, actions, openArchive, openViewer } = usePortfolio();
  const { index, category } = useChapter(project.categoryId);
  const strip = useCenterFocus('.feature__support-item'); // phones: a swipeable strip
  const set = (key) => (value) => actions.setProject(project.id, { [key]: value });
  const setSupporting = (k) => (ref) =>
    actions.setProject(project.id, (p) => ({ supporting: p.supporting.map((x, j) => (j === k ? ref : x)) }));

  const title = pick(project.title, lang);
  const images = [project.image, ...project.supporting].filter(Boolean);
  const slides = images.map((image) => ({ image, caption: title }));
  const openAt = (ref, rect) => openViewer(slides, Math.max(0, images.indexOf(ref)), rect);

  const viewFull = () => {
    if (project.items.length || editing || !slides.length) openArchive(project.id);
    else openViewer(slides, 0);
  };
  // a website with nothing uploaded yet is shown live instead of an empty frame
  const showSite = Boolean(project.link) && !project.image && !editing;
  const showFull = editing || !project.link || project.items.length > 0 || slides.length > 0;

  return (
    <section className="feature" data-nav="work">
      <div className="wrap">
        <ProjectBar project={project} />

        <div className="feature__main">
          <Reveal className="feature__media reveal-image">
            {showSite ? (
              <SitePreview url={project.link} title={title} />
            ) : (
              <Parallax depth={6}>
                <ImageSlot
                  value={project.image}
                  onChange={set('image')}
                  alt={title}
                  onOpen={(rect) => openAt(project.image, rect)}
                />
              </Parallax>
            )}
          </Reveal>

          <Reveal className="feature__info" stagger>
            <p className="chapter-label">
              <b>{digits(pad2(index + 1), lang)}</b> / {pick(category?.title, lang)}
            </p>
            <EditableText
              as="h2"
              className="display feature__title"
              value={project.title}
              onChange={set('title')}
              motion="roll"
            />
            <p className="feature__meta">
              <EditableText value={project.type} onChange={set('type')} />
              <span className="dot" aria-hidden="true">
                ·
              </span>
              <EditableText
                value={project.year}
                onChange={set('year')}
                display={(v) => digits(v, lang)}
                parse={latinDigits}
              />
            </p>
            <EditableText
              as="p"
              multiline
              className="feature__desc"
              value={project.description}
              onChange={set('description')}
              motion="words"
            />
            <h3 className="feature__role-label">{t.myRole}</h3>
            <EditableText as="p" className="feature__role" value={project.role} onChange={set('role')} />
            <div className="feature__ctas">
              {showFull && (
                <Button onClick={viewFull} className="feature__cta">
                  {t.viewFullProject}
                </Button>
              )}
              {project.link && (
                <Button href={project.link} external className={showFull ? 'btn--ghost' : ''}>
                  {t.visitSite}
                </Button>
              )}
            </div>
          </Reveal>
        </div>

        {gallery && (
          <div className="feature__gallery">
            <Reveal as="h3" className="display feature__gallery-title">
              {t.gallery}
            </Reveal>
            <div className="feature__support" ref={strip}>
              {project.supporting.map((ref, k) => (
                <Reveal key={k} delay={k * 110} className="feature__support-item reveal-image">
                  <Parallax depth={4}>
                    <ImageSlot
                      value={ref}
                      onChange={setSupporting(k)}
                      alt={title}
                      onOpen={(rect) => openAt(ref, rect)}
                    />
                  </Parallax>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
