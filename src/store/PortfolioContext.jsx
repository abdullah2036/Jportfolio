import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CONFIG } from '../config.js';
import { UI } from '../i18n/strings.js';
import { blankProject } from '../data/defaultContent.js';
import { imageStore } from './imageStore.js';
import {
  clearSavedContent,
  collectImages,
  exportContent,
  freshContent,
  importContent,
  internalizeImages,
  loadContent,
  saveContent,
} from './persistence.js';
import { uid } from '../lib/random.js';

const PortfolioCtx = createContext(null);

function setIn(obj, [key, ...rest], value) {
  if (key === undefined) return value;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[key] = setIn(obj?.[key], rest, value);
  return copy;
}

function readLang() {
  // ?lang=en / ?lang=ar in the address wins (handy for sharing a link).
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl === 'ar' || fromUrl === 'en') return fromUrl;
  try {
    const saved = localStorage.getItem(CONFIG.langKey);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  return CONFIG.defaultLang;
}

export function PortfolioProvider({ children }) {
  const [content, setContent] = useState(null);
  const [lang, setLangState] = useState(readLang);
  // Edit Mode is behind a small password (config.js). Once unlocked it stays
  // open for this browser tab; ?edit in the address asks for the password.
  const unlocked = () => {
    try {
      return sessionStorage.getItem(CONFIG.unlockKey) === '1';
    } catch {
      return false;
    }
  };
  const asksForEdit = new URLSearchParams(location.search).has('edit');
  const [editing, setEditingState] = useState(() => asksForEdit && unlocked());
  const [lockOpen, setLockOpen] = useState(() => asksForEdit && !unlocked());
  const [storageOk, setStorageOk] = useState(true);
  const [overlay, setOverlay] = useState(null); // { projectId }
  const [viewer, setViewer] = useState(null); // { slides: [{ image, caption }], index, origin }
  const [petals, setPetalsState] = useState(() => {
    try {
      return localStorage.getItem(CONFIG.petalsKey) !== 'off' && CONFIG.ambient.petals;
    } catch {
      return CONFIG.ambient.petals;
    }
  });
  const dirty = useRef(false);
  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    loadContent().then(setContent);
  }, []);

  // Only the owner's edits are written to this browser, so visitors keep
  // seeing the published content.
  useEffect(() => {
    if (!content || !dirty.current) return undefined;
    const t = setTimeout(() => setStorageOk(saveContent(content)), 250);
    return () => clearTimeout(t);
  }, [content]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(CONFIG.langKey, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle('is-editing', editing);
  }, [editing]);

  const setPetals = useCallback((on) => {
    setPetalsState(on);
    try {
      localStorage.setItem(CONFIG.petalsKey, on ? 'on' : 'off');
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((fn) => {
    dirty.current = true;
    setContent((c) => fn(c));
  }, []);

  const setEditing = useCallback(
    async (on) => {
      setEditingState(on);
      // Published content carries inlined images; move them into this
      // browser's image store before editing so saves stay small.
      if (on && contentRef.current && JSON.stringify(contentRef.current).includes('"data:image')) {
        const local = await internalizeImages(contentRef.current);
        update(() => local);
      }
    },
    [update]
  );

  const requestEdit = useCallback(() => {
    if (unlocked()) setEditing(true);
    else setLockOpen(true);
  }, [setEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const tryUnlock = useCallback(
    (password) => {
      if (password !== CONFIG.editPassword) return false;
      try {
        sessionStorage.setItem(CONFIG.unlockKey, '1');
      } catch {
        /* ignore */
      }
      setLockOpen(false);
      setEditing(true);
      return true;
    },
    [setEditing]
  );

  const actions = useMemo(() => {
    const setProject = (id, patch) =>
      update((c) => ({
        ...c,
        projects: c.projects.map((p) =>
          p.id === id ? { ...p, ...(typeof patch === 'function' ? patch(p) : patch) } : p
        ),
      }));

    return {
      setSite: (path, value) => update((c) => setIn(c, ['site', ...path], value)),

      setCategory: (id, key, value) =>
        update((c) => ({
          ...c,
          categories: c.categories.map((cat) => (cat.id === id ? { ...cat, [key]: value } : cat)),
        })),

      setProject,

      addProject(categoryId) {
        const project = blankProject(categoryId, {
          id: uid('p'),
          title: { ar: UI.ar.newProjectTitle, en: UI.en.newProjectTitle },
        });
        update((c) => {
          const projects = [...c.projects];
          let at = projects.length;
          for (let i = projects.length - 1; i >= 0; i--) {
            if (projects[i].categoryId === categoryId) {
              at = i + 1;
              break;
            }
          }
          projects.splice(at, 0, project);
          return { ...c, projects };
        });
        return project.id;
      },

      removeProject(id) {
        const project = contentRef.current?.projects.find((p) => p.id === id);
        collectImages(project).forEach((ref) => imageStore.remove(ref));
        update((c) => ({ ...c, projects: c.projects.filter((p) => p.id !== id) }));
      },

      moveProjectTo(id, categoryId) {
        update((c) => {
          const project = c.projects.find((p) => p.id === id);
          const rest = c.projects.filter((p) => p.id !== id);
          return { ...c, projects: [...rest, { ...project, categoryId }] };
        });
      },

      addItems(projectId, refs) {
        const items = refs.map((image) => ({
          id: uid('it'),
          image,
          title: { ar: '', en: '' },
          date: '',
          topic: '',
        }));
        setProject(projectId, (p) => ({ items: [...p.items, ...items] }));
      },

      setItem(projectId, itemId, patch) {
        setProject(projectId, (p) => ({
          items: p.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
        }));
      },

      removeItem(projectId, itemId) {
        const item = contentRef.current?.projects
          .find((p) => p.id === projectId)
          ?.items.find((it) => it.id === itemId);
        if (item?.image) imageStore.remove(item.image);
        setProject(projectId, (p) => ({ items: p.items.filter((it) => it.id !== itemId) }));
      },

      moveItem(projectId, itemId, dir) {
        setProject(projectId, (p) => {
          const items = [...p.items];
          const i = items.findIndex((it) => it.id === itemId);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= items.length) return {};
          [items[i], items[j]] = [items[j], items[i]];
          return { items };
        });
      },

      async reset() {
        await imageStore.clear();
        clearSavedContent();
        dirty.current = false;
        setContent(freshContent());
      },

      exportAll: () => exportContent(contentRef.current),

      async importAll(file) {
        const data = await importContent(file);
        update(() => data);
      },
    };
  }, [update]);

  // Projects in reading order: chapter by chapter.
  const ordered = useMemo(() => {
    if (!content) return [];
    return content.categories.flatMap((cat) => content.projects.filter((p) => p.categoryId === cat.id));
  }, [content]);

  const value = useMemo(
    () => ({
      content,
      lang,
      setLang: setLangState,
      t: UI[lang],
      editing,
      setEditing,
      storageOk,
      actions,
      ordered,
      overlay,
      openArchive: (projectId, options = {}) => setOverlay({ projectId, ...options }),
      closeArchive: () => setOverlay(null),
      viewer,
      // origin: the thumbnail's DOMRect, so the image can grow out of it
      openViewer: (slides, index = 0, origin = null) => setViewer({ slides, index, origin }),
      setViewerIndex: (index) => setViewer((v) => (v ? { ...v, index } : v)),
      closeViewer: () => setViewer(null),
      petals,
      setPetals,
      lockOpen,
      requestEdit,
      tryUnlock,
      closeLock: () => setLockOpen(false),
    }),
    [
      content,
      lang,
      editing,
      setEditing,
      storageOk,
      actions,
      ordered,
      overlay,
      viewer,
      petals,
      setPetals,
      lockOpen,
      requestEdit,
      tryUnlock,
    ]
  );

  return <PortfolioCtx.Provider value={value}>{children}</PortfolioCtx.Provider>;
}

export function usePortfolio() {
  return useContext(PortfolioCtx);
}

// Chapter number ("01") and title for a category id.
export function useChapter(categoryId) {
  const { content } = usePortfolio();
  const index = content.categories.findIndex((c) => c.id === categoryId);
  return { index, category: content.categories[index] };
}
