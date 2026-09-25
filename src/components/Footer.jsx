import { CONFIG } from '../config.js';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { digits, pick } from '../i18n/format.js';
import { reducedMotion } from '../lib/motion.js';
import { EditIcon, BlossomIcon } from './Icons.jsx';

export default function Footer() {
  const { content, lang, t, editing, requestEdit, petals, setPetals } = usePortfolio();
  return (
    <footer className="colophon">
      <div className="wrap colophon__inner">
        <span className="label">
          {pick(content.site.name, lang)} — {pick(content.site.tagline, lang)}
        </span>
        <span className="colophon__end">
          {CONFIG.ambient.petals && !reducedMotion() && (
            <button
              type="button"
              className={`colophon__petals label ${petals ? 'is-on' : ''}`}
              onClick={() => setPetals(!petals)}
              aria-pressed={petals}
            >
              <BlossomIcon size={15} /> {petals ? t.petalsOn : t.petalsOff}
            </button>
          )}
          {CONFIG.showEditEntry && !editing && (
            <button type="button" className="colophon__edit label" onClick={requestEdit}>
              <EditIcon size={13} /> {t.editPortfolio}
            </button>
          )}
          <span className="label">© {digits(new Date().getFullYear(), lang)}</span>
        </span>
      </div>
    </footer>
  );
}
