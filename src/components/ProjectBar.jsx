import { usePortfolio } from '../store/PortfolioContext.jsx';
import { href } from '../hooks/useRoute.js';
import { ArrowBackIcon, ChevronIcon } from './Icons.jsx';

export const projectHref = (p) => href('work', p.categoryId, p.id);

// "← Back to Work" … "‹ Previous   Next ›"
export default function ProjectBar({ project }) {
  const { ordered, t } = usePortfolio();
  const i = ordered.findIndex((p) => p.id === project.id);
  const count = ordered.length;
  const prev = ordered[(i - 1 + count) % count];
  const next = ordered[(i + 1) % count];

  return (
    <nav className="project-bar" aria-label={t.backToWork}>
      <a className="text-link" href={href('work')}>
        <ArrowBackIcon size={17} />
        {t.backToWork}
      </a>
      {count > 1 && (
        <div className="project-bar__pager">
          <a className="text-link" href={projectHref(prev)} rel="prev">
            <ChevronIcon dir="start" size={16} />
            {t.previous}
          </a>
          <a className="text-link" href={projectHref(next)} rel="next">
            {t.next}
            <ChevronIcon dir="end" size={16} />
          </a>
        </div>
      )}
    </nav>
  );
}
