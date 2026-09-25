import { useEffect } from 'react';
import { usePortfolio } from './store/PortfolioContext.jsx';
import { pageKey, useRoute } from './hooks/useRoute.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Archive from './components/Archive.jsx';
import Lightbox from './components/Lightbox.jsx';
import EditBar from './components/EditBar.jsx';
import AmbientPetals from './components/AmbientPetals.jsx';
import CursorBadge from './components/CursorBadge.jsx';
import Preloader from './components/Preloader.jsx';
import EditLock from './components/EditLock.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import Work from './pages/Work.jsx';
import { pick } from './i18n/format.js';

export default function App() {
  const { content, lang } = usePortfolio();
  const parts = useRoute();

  useEffect(() => {
    if (content) document.title = `${pick(content.site.name, lang)} — ${pick(content.site.tagline, lang)}`;
  }, [content, lang]);

  if (!content) return <div className="boot" aria-busy="true" />;

  const isWork = parts[0] === 'work' && parts[1];
  const page = pageKey(parts);

  return (
    <>
      <Header />
      <main key={page} className="page-enter">
        {isWork ? (
          <Work categoryId={parts[1]} projectId={parts[2]} />
        ) : (
          <Home target={parts[0]} routeKey={parts} />
        )}
      </main>
      <Footer />
      <Archive />
      <Lightbox />
      <EditBar />
      <AmbientPetals />
      <CursorBadge />
      <Preloader />
      <EditLock />
      <Toast />
    </>
  );
}
