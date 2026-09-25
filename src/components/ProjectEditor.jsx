import { usePortfolio } from '../store/PortfolioContext.jsx';
import { pick } from '../i18n/format.js';
import { NOUNS, UNIT_KEYS } from '../i18n/strings.js';
import { navigate } from '../hooks/useRoute.js';
import { PlusIcon, TrashIcon } from './Icons.jsx';

const unitName = (key, lang) => (NOUNS[key][lang][lang === 'ar' ? 'few' : 'other'] || '').replace('{n} ', '');

// Project settings, shown above a project only in Edit Mode.
export default function ProjectEditor({ project }) {
  const { content, lang, t, actions } = usePortfolio();
  const set = (patch) => actions.setProject(project.id, patch);

  return (
    <div className="project-editor wrap" role="group" aria-label={t.editing}>
      <div className="project-editor__row">
        <span className="project-editor__field">
          <span className="label">{t.layout}</span>
          <span className="seg">
            <button type="button" aria-pressed={project.layout === 'feature'} onClick={() => set({ layout: 'feature' })}>
              {t.layoutFeature}
            </button>
            <button type="button" aria-pressed={project.layout === 'series'} onClick={() => set({ layout: 'series' })}>
              {t.layoutSeries}
            </button>
          </span>
        </span>

        <label className="project-editor__field">
          <span className="label">{t.moveTo}</span>
          <select
            value={project.categoryId}
            onChange={(e) => {
              actions.moveProjectTo(project.id, e.target.value);
              navigate('work', e.target.value, project.id);
            }}
          >
            {content.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {pick(c.title, lang)}
              </option>
            ))}
          </select>
        </label>

        <label className="project-editor__field">
          <span className="label">{t.unit}</span>
          <select value={project.unit} onChange={(e) => set({ unit: e.target.value })}>
            {UNIT_KEYS.map((k) => (
              <option key={k} value={k}>
                {unitName(k, lang)}
              </option>
            ))}
          </select>
        </label>

        <label className="project-editor__field project-editor__link">
          <span className="label">{t.websiteLink}</span>
          <input
            type="url"
            dir="ltr"
            placeholder="https://"
            value={project.link || ''}
            onChange={(e) => set({ link: e.target.value.trim() })}
          />
        </label>

        <label className="project-editor__field project-editor__check">
          <input type="checkbox" checked={project.showcase} onChange={(e) => set({ showcase: e.target.checked })} />
          <span>{t.showOnHome}</span>
        </label>

        <span className="project-editor__spacer" />

        <button
          type="button"
          className="edit-link"
          onClick={() => navigate('work', project.categoryId, actions.addProject(project.categoryId))}
        >
          <PlusIcon size={14} /> {t.addProject}
        </button>
        <button
          type="button"
          className="edit-link edit-link--danger"
          onClick={() => {
            if (!window.confirm(t.confirmDeleteProject)) return;
            actions.removeProject(project.id);
            navigate('work', project.categoryId);
          }}
        >
          <TrashIcon size={14} /> {t.deleteProject}
        </button>
      </div>
    </div>
  );
}
