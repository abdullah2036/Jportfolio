import { CONFIG } from '../config.js';
import { defaultContent } from '../data/defaultContent.js';
import { imageStore } from './imageStore.js';

const clone = (v) => JSON.parse(JSON.stringify(v));

// placeholder contact values from earlier versions of the template
const OLD_PLACEHOLDERS = new Set([
  'your-email@example.com',
  'https://www.linkedin.com/in/your-profile',
  '966500000000',
]);

// Which template projects this content has already "met". A project added to
// the template later joins older saved content once; a project the owner
// deleted stays deleted.
const templateIds = () => defaultContent.projects.map((p) => p.id);
const withSeen = (content) => ({ ...content, seenTemplate: templateIds() });

// Keep older saved content working if the template gains new fields.
function normalize(data) {
  const base = clone(defaultContent);
  if (!data || typeof data !== 'object' || !Array.isArray(data.projects)) return withSeen(base);
  const site = {
    ...base.site,
    ...data.site,
    hero: { ...base.site.hero, ...data.site?.hero },
    contents: { ...base.site.contents, ...data.site?.contents },
    about: {
      ...base.site.about,
      ...data.site?.about,
      socials: { ...base.site.about.socials, ...data.site?.about?.socials },
    },
  };
  // Contact details: a saved value that is empty (or an old placeholder) falls
  // back to the one in defaultContent.js, so filling them in there always
  // shows up. A real value typed in Edit Mode still wins.
  const unset = (v) => !v || OLD_PLACEHOLDERS.has(String(v).trim());
  if (unset(site.about.email)) site.about.email = base.site.about.email;
  Object.keys(base.site.about.socials).forEach((key) => {
    if (unset(site.about.socials[key])) site.about.socials[key] = base.site.about.socials[key];
  });

  const categories = base.categories.map((c) => ({
    ...c,
    ...(data.categories || []).find((d) => d.id === c.id),
  }));
  const projects = data.projects.map((p) => ({
    supporting: [null, null, null, null],
    items: [],
    topics: [],
    unit: 'piece',
    link: '',
    ...p,
  }));
  const seen = new Set(data.seenTemplate || data.projects.map((p) => p.id));
  const saved = new Set(data.projects.map((p) => p.id));
  base.projects.forEach((p) => {
    if (!seen.has(p.id) && !saved.has(p.id)) projects.push(p);
  });
  return withSeen({ version: 1, site, categories, projects });
}

/** Local edits first, then published content (/public/content), then the template. */
export async function loadContent() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    /* fall through */
  }
  try {
    const res = await fetch(CONFIG.bakedContentUrl, { cache: 'no-cache' });
    if (res.ok && (res.headers.get('content-type') || '').includes('json')) {
      return normalize(await res.json());
    }
  } catch {
    /* no published content */
  }
  return withSeen(clone(defaultContent));
}

/** Returns false when the browser refuses to store more. */
export function saveContent(content) {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(content));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedContent() {
  try {
    localStorage.removeItem(CONFIG.storageKey);
  } catch {
    /* ignore */
  }
}

export const freshContent = () => withSeen(clone(defaultContent));

// Walk every image reference in the content tree.
async function mapImages(content, fn) {
  const out = clone(content);
  const swap = async (obj, key) => {
    if (obj[key]) obj[key] = await fn(obj[key]);
  };
  await swap(out.site.hero, 'image');
  await swap(out.site.about, 'portrait');
  for (const c of out.categories) await swap(c, 'cover');
  for (const p of out.projects) {
    await swap(p, 'image');
    for (let i = 0; i < p.supporting.length; i++) {
      if (p.supporting[i]) p.supporting[i] = await fn(p.supporting[i]);
    }
    for (const item of p.items) await swap(item, 'image');
  }
  return out;
}

export function collectImages(node, acc = []) {
  if (!node) return acc;
  if (typeof node === 'string') {
    if (imageStore.isLocal(node)) acc.push(node);
  } else if (Array.isArray(node)) node.forEach((n) => collectImages(n, acc));
  else if (typeof node === 'object') Object.values(node).forEach((n) => collectImages(n, acc));
  return acc;
}

export async function exportContent(content) {
  const portable = await mapImages(content, (ref) => imageStore.toPortable(ref));
  const blob = new Blob([JSON.stringify(portable)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portfolio.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** Move inlined (data URL) images into the local image store. */
export function internalizeImages(content) {
  return mapImages(content, (ref) =>
    typeof ref === 'string' && ref.startsWith('data:') ? imageStore.fromDataUrl(ref) : ref
  );
}

export async function importContent(file) {
  const data = JSON.parse(await file.text());
  if (!data || !Array.isArray(data.projects)) throw new Error('Not a portfolio file');
  return internalizeImages(normalize(data));
}
