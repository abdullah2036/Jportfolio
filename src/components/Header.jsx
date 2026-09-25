import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { pick } from '../i18n/format.js';
import { href, navigate, useRoute } from '../hooks/useRoute.js';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import ScrollProgress from './ScrollProgress.jsx';
import SearchOverlay from './SearchOverlay.jsx';
import { CloseIcon, MenuIcon, SearchIcon } from './Icons.jsx';

// Which part of the page is under the reading line (a third down the screen).
function useActiveSection(onProjectPage) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (onProjectPage) {
      setActive('work');
      return undefined;
    }
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let found = '';
      document.querySelectorAll('main [data-nav]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) found = el.dataset.nav;
      });
      setActive(found);
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
  }, [onProjectPage]);
  return active;
}

export default function Header() {
  const { content, lang, t } = usePortfolio();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const parts = useRoute();
  const active = useActiveSection(parts[0] === 'work' && Boolean(parts[1]));
  const nav = useRef(null);
  const ink = useRef(null);
  const [hovered, setHovered] = useState('');
  const inkTarget = hovered || active;

  // the hairline under the menu glides to whatever you point at, then back
  useLayoutEffect(() => {
    const place = () => {
      const link = inkTarget && nav.current?.querySelector(`[data-key="${inkTarget}"]`);
      if (!ink.current) return;
      if (!link) {
        ink.current.style.opacity = '0';
        return;
      }
      ink.current.style.opacity = '1';
      ink.current.style.width = `${link.offsetWidth}px`;
      ink.current.style.transform = `translateX(${link.offsetLeft}px)`;
    };
    place();
    document.fonts?.ready.then(place);
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [inkTarget, lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  const links = [
    ['', t.nav.home],
    ['about', t.nav.about],
    ['work', t.nav.work],
    ['contact', t.nav.contact],
  ];

  const go = (e, path) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-menu' : ''}`}>
      <div className="site-header__inner wrap">
        <a className="site-header__logo" href={href()} onClick={(e) => go(e, '')} data-petals="6">
          {pick(content.site.brand || content.site.name, lang)}
        </a>

        <nav className="site-header__nav" aria-label={t.menu} ref={nav} onMouseLeave={() => setHovered('')}>
          <span className="nav-ink" ref={ink} aria-hidden="true" />
          {links.map(([path, label], i) => (
            <a
              key={path || 'home'}
              data-key={path || 'home'}
              style={{ '--i': i }}
              href={href(path)}
              onMouseEnter={() => setHovered(path || 'home')}
              onClick={(e) => go(e, path)}
              className={active === (path || 'home') ? 'is-active' : ''}
              aria-current={active === (path || 'home') ? 'true' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="site-header__tools">
          <LanguageSwitcher className="site-header__lang" />
          <button type="button" className="icon-btn" aria-label={t.search} onClick={() => setSearchOpen(true)}>
            <SearchIcon size={19} />
          </button>
          <button
            type="button"
            className="icon-btn site-header__menu-btn"
            aria-label={t.menu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>
      <ScrollProgress />

      {menuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-menu__nav wrap">
            {links.map(([path, label], i) => (
              <a
                key={path || 'home'}
                href={href(path)}
                onClick={(e) => go(e, path)}
                className="display"
                style={{ '--i': i }}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mobile-menu__foot wrap">
            <LanguageSwitcher />
          </div>
        </div>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
