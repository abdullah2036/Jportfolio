import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PortfolioProvider } from './store/PortfolioContext.jsx';
import App from './App.jsx';

import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/contents.css';
import './styles/project.css';
import './styles/archive.css';
import './styles/about.css';
import './styles/arabic.css';
import './styles/motion.css';
import './styles/motion-refs.css';
import './styles/edit.css';

if (document.startViewTransition) document.documentElement.classList.add('has-vt');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PortfolioProvider>
      <App />
    </PortfolioProvider>
  </StrictMode>
);
// Development helper: ?shot=<selector> brings that element to the top of the
// page (used for design review screenshots). Never runs in the built site.
if (import.meta.env.DEV) {
  const target = new URLSearchParams(location.search).get('shot');
  if (target) {
    const still = document.createElement('style');
    still.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
    document.head.appendChild(still);
    const go = () => {
      const el = document.querySelector(target);
      const header = document.querySelector('.site-header')?.offsetHeight || 0;
      if (!el) return;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - header);
      window.dispatchEvent(new Event('scroll'));
    };
    // after fonts settle, so the layout (and the position) is final
    Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]).then(() => setTimeout(go, 500));
  }
}
