import { useEffect, useRef } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import Hero from '../components/Hero.jsx';
import TableOfContents from '../components/TableOfContents.jsx';
import ProjectFeature from '../components/ProjectFeature.jsx';
import ProjectSeries from '../components/ProjectSeries.jsx';
import About from '../components/About.jsx';
import Vista from '../components/Vista.jsx';

const TARGETS = { work: 'contents', about: 'about', contact: 'contact' };

// The home page: cover → about → the torn-open banner → contents → showcased projects.
export default function Home({ target, routeKey }) {
  const { ordered } = usePortfolio();
  const first = useRef(true);
  const showcase = ordered.filter((p) => p.showcase);
  // the image gallery appears once, under the last project on the page
  const lastFeature = showcase.filter((p) => p.layout !== 'series').pop();

  useEffect(() => {
    const id = TARGETS[target];
    const smooth = !first.current;
    first.current = false;
    if (!id) {
      if (smooth) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const raf = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: id === 'contact' ? 'center' : 'start' })
    );
    return () => cancelAnimationFrame(raf);
  }, [target, routeKey]);

  return (
    <>
      <Hero />
      <About />
      <Vista />
      <TableOfContents />
      {showcase.map((p) =>
        p.layout === 'series' ? (
          <ProjectSeries key={p.id} project={p} />
        ) : (
          <ProjectFeature key={p === lastFeature ? `${p.id}:gallery` : p.id} project={p} gallery={p === lastFeature} />
        )
      )}
    </>
  );
}
