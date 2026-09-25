import { flushSync } from 'react-dom';
import { usePortfolio } from '../store/PortfolioContext.jsx';

// عربي / EN — a quiet two-way switch. Uses a cross-fade where supported.
export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = usePortfolio();

  const choose = (next) => {
    if (next === lang) return;
    const apply = () => flushSync(() => setLang(next));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduce && !document.hidden) {
      // The cross-fade can be skipped by the browser; the switch still happens.
      document.startViewTransition(apply).ready.catch(() => {});
    } else {
      apply();
    }
  };

  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language / اللغة">
      <button type="button" lang="ar" aria-pressed={lang === 'ar'} onClick={() => choose('ar')}>
        عربي
      </button>
      <span className="lang-switch__sep" aria-hidden="true" />
      <button type="button" lang="en" aria-pressed={lang === 'en'} onClick={() => choose('en')}>
        EN
      </button>
    </div>
  );
}
