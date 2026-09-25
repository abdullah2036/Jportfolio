// Image storage adapter.
//
// The rest of the site only ever sees an image *reference* (a string):
//   "idb:xxxx"         an image stored in this browser (IndexedDB)
//   "https://…", "/…"  an image hosted anywhere (CDN, backend, /public)
//   "data:image/…"     an inlined image (used by exported content files)
//
// To move to a real backend later, change `save()` to upload the file and
// return its URL, and `remove()` to delete it. Nothing else needs to change.

import { CONFIG } from '../config.js';

const DB_NAME = 'jana-portfolio';
const STORE = 'images';
const urlCache = new Map();

let dbPromise;
function openDb() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB unavailable'));
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function run(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const isLocal = (ref) => typeof ref === 'string' && ref.startsWith('idb:');

// Downscale very large photos so the browser store (and exports) stay light.
async function prepare(file) {
  if (!/^image\/(jpeg|png|webp|avif|heic|heif)$/i.test(file.type)) return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const max = CONFIG.maxImageEdge;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
    bitmap.close?.();
    return file;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const toBlob = (type) => new Promise((r) => canvas.toBlob(r, type, CONFIG.imageQuality));
  let blob = await toBlob('image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg');
  return blob && blob.size < file.size ? blob : file;
}

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const imageStore = {
  /** Store a File/Blob and return its reference. */
  async save(file) {
    const blob = await prepare(file);
    const ref = `idb:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    try {
      await run('readwrite', (s) => s.put(blob, ref));
      urlCache.set(ref, URL.createObjectURL(blob));
      return ref;
    } catch {
      // No IndexedDB (rare private modes): keep the image inline instead.
      return blobToDataUrl(blob);
    }
  },

  /** Synchronous lookup for already-resolved references. */
  peek(ref) {
    if (!ref) return null;
    return isLocal(ref) ? urlCache.get(ref) ?? null : ref;
  },

  /** Resolve a reference to something an <img src> can use. */
  async url(ref) {
    if (!ref) return null;
    if (!isLocal(ref)) return ref;
    if (urlCache.has(ref)) return urlCache.get(ref);
    try {
      const blob = await run('readonly', (s) => s.get(ref));
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      urlCache.set(ref, url);
      return url;
    } catch {
      return null;
    }
  },

  async remove(ref) {
    if (!isLocal(ref)) return;
    try {
      await run('readwrite', (s) => s.delete(ref));
    } catch {
      /* already gone */
    }
    const url = urlCache.get(ref);
    if (url) URL.revokeObjectURL(url);
    urlCache.delete(ref);
  },

  async clear() {
    try {
      await run('readwrite', (s) => s.clear());
    } catch {
      /* nothing stored */
    }
    urlCache.forEach((url) => URL.revokeObjectURL(url));
    urlCache.clear();
  },

  /** For export: turn a local reference into a portable data URL. */
  async toPortable(ref) {
    if (!isLocal(ref)) return ref;
    try {
      const blob = await run('readonly', (s) => s.get(ref));
      return blob ? blobToDataUrl(blob) : null;
    } catch {
      return null;
    }
  },

  /** For import: store an inlined data URL locally and return its reference. */
  async fromDataUrl(dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();
    return this.save(blob);
  },

  isLocal,
};
