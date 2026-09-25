import { useLayoutEffect, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { ExternalIcon } from './Icons.jsx';

// A live, scaled-down look at a website project inside a quiet browser frame
// (the same frames as the design reference). The page is shown at desktop
// width and shrunk to fit; clicking anywhere opens the real site.
const DESKTOP = 1280;

export default function SitePreview({ url, title, className = '' }) {
  const { t } = usePortfolio();
  const screen = useRef(null);
  const [fit, setFit] = useState({ scale: 0.5, height: 1600 });
  const [loaded, setLoaded] = useState(false);
  const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  useLayoutEffect(() => {
    const el = screen.current;
    if (!el) return undefined;
    const measure = () => {
      const scale = el.clientWidth / DESKTOP;
      setFit({ scale, height: Math.ceil(el.clientHeight / scale) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`site-preview ${loaded ? 'is-loaded' : ''} ${className}`}>
      <div className="site-preview__bar" aria-hidden="true">
        <span className="site-preview__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="site-preview__url" dir="ltr">
          {host}
        </span>
        <span className="label site-preview__live">{t.livePreview}</span>
      </div>
      <div className="site-preview__screen" ref={screen}>
        <iframe
          src={url}
          title={title}
          loading="lazy"
          tabIndex={-1}
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          style={{ width: DESKTOP, height: fit.height, transform: `scale(${fit.scale})` }}
          onLoad={() => setLoaded(true)}
        />
        <a
          className="site-preview__open"
          href={url}
          target="_blank"
          rel="noreferrer"
          data-cursor="visit"
          aria-label={`${t.visitSite}: ${title}`}
        >
          <span className="site-preview__hint">
            {t.visitSite} <ExternalIcon size={15} />
          </span>
        </a>
      </div>
    </div>
  );
}
