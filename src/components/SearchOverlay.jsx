import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { digits, pad2, pick } from '../i18n/format.js';
import { navigate } from '../hooks/useRoute.js';
import { ArrowIcon, CloseIcon, SearchIcon } from './Icons.jsx';

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[ً-ْـ]/g, '') // Arabic diacritics & tatweel
    .replace(/[إأآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

const hit = (field, q) => field && ['ar', 'en'].some((l) => norm(field[l]).includes(q));

export default function SearchOverlay({ onClose }) {
  const { content, ordered, lang, t } = usePortfolio();
  const [query, setQuery] = useState('');
  const input = useRef(null);

  useEffect(() => {
    input.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    const out = [];
    content.categories.forEach((cat, i) => {
      if (hit(cat.title, q)) out.push({ key: cat.id, path: ['work', cat.id], kicker: digits(pad2(i + 1), lang), title: pick(cat.title, lang) });
    });
    ordered.forEach((p) => {
      if (hit(p.title, q) || hit(p.type, q) || hit(p.description, q) || hit(p.subtitle, q)) {
        const i = content.categories.findIndex((c) => c.id === p.categoryId);
        out.push({
          key: p.id,
          path: ['work', p.categoryId, p.id],
          kicker: `${digits(pad2(i + 1), lang)} / ${pick(content.categories[i].title, lang)}`,
          title: pick(p.title, lang),
        });
      }
    });
    return out.slice(0, 8);
  }, [query, content, ordered, lang]);

  const open = (path) => {
    onClose();
    navigate(...path);
  };

  return (
    <div className="search" role="dialog" aria-modal="true" aria-label={t.search}>
      <button type="button" className="search__backdrop" aria-label={t.close} onClick={onClose} />
      <div className="search__panel">
        <div className="wrap">
          <form
            className="search__form"
            onSubmit={(e) => {
              e.preventDefault();
              if (results[0]) open(results[0].path);
            }}
          >
            <SearchIcon size={22} />
            <input
              ref={input}
              className="search__input"
              type="search"
              value={query}
              placeholder={t.searchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t.search}
            />
            <button type="button" className="icon-btn" onClick={onClose} aria-label={t.close}>
              <CloseIcon size={22} />
            </button>
          </form>
          {query.trim() && (
            <ul className="search__results">
              {results.length === 0 && <li className="search__empty">{t.noResults}</li>}
              {results.map((r) => (
                <li key={r.key}>
                  <button type="button" className="wipe" onClick={() => open(r.path)}>
                    <span className="chapter-label">{r.kicker}</span>
                    <span className="search__title">{r.title}</span>
                    <ArrowIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
