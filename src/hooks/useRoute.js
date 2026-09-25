import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { reducedMotion } from '../lib/motion.js';

// Tiny hash router:
//   #/                      home
//   #/work | #/about | #/contact   home, scrolled to that chapter
//   #/work/<chapter>        first project of a chapter
//   #/work/<chapter>/<id>   a single project
const read = () => location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);

// Which "page" a route shows. Moving between pages turns the page (view
// transition); moving within the home page just scrolls.
export const pageKey = (parts) => (parts[0] === 'work' && parts[1] ? parts.slice(0, 3).join('/') : 'home');

let current = read();
const listeners = new Set();

function publish(next) {
  current = next;
  listeners.forEach((fn) => fn(next));
}

function onHashChange() {
  const next = read();
  const turning = pageKey(next) !== pageKey(current);
  if (turning && document.startViewTransition && !reducedMotion() && !document.hidden) {
    document.documentElement.dataset.transition = 'page';
    const vt = document.startViewTransition(() => flushSync(() => publish(next)));
    vt.ready.catch(() => {});
    vt.finished.finally(() => delete document.documentElement.dataset.transition);
  } else {
    publish(next);
  }
}

window.addEventListener('hashchange', onHashChange);

export function useRoute() {
  const [parts, setParts] = useState(current);
  useEffect(() => {
    listeners.add(setParts);
    setParts(current);
    return () => listeners.delete(setParts);
  }, []);
  return parts;
}

export const href = (...parts) => `#/${parts.filter(Boolean).join('/')}`;

export function navigate(...parts) {
  const next = href(...parts);
  if (location.hash === next) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = next;
}
