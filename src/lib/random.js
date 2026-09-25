// Small deterministic helpers so torn / deckled edges look hand-made
// but never change between renders.

export function rng(seed = 1) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const pct = (pts) =>
  `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',')})`;

// A rectangle with rough, deckled edges (for thumbnails, notes, frames).
// ax / ay are the maximum bite into the sheet, in % of width / height.
export function deckle(seed, { ax = 1.2, ay = 1.2, step = 2.4, edges = 'trbl' } = {}) {
  const r = rng(seed);
  const has = (e) => edges.includes(e);
  const bite = (a, on) => (on ? r() * a : 0);
  const next = () => step * (0.45 + r());
  const pts = [];
  for (let x = 0; x < 100; x += next()) pts.push([x, bite(ay, has('t'))]);
  for (let y = 0; y < 100; y += next()) pts.push([100 - bite(ax, has('r')), y]);
  for (let x = 100; x > 0; x -= next()) pts.push([x, 100 - bite(ay, has('b'))]);
  for (let y = 100; y > 0; y -= next()) pts.push([bite(ax, has('l')), y]);
  return pct(pts);
}

// The big diagonal tear of the cover page. Returns the paper sheet and the
// lighter fibrous rim that peeks out from under it.
export function tear(seed, { from = 46, to = 74, rtl = false, curve = 1.15 } = {}) {
  const r = rng(seed);
  const rimR = rng(seed + 7);
  const p1 = r() * 6.28;
  const p2 = r() * 6.28;
  const edge = [];
  let wander = 0;
  for (let y = 0; y <= 100.01; y += 0.35 + r() * 0.55) {
    const t = Math.pow(y / 100, curve);
    wander = wander * 0.9 + (r() - 0.5) * 0.42;
    const sway = Math.sin(y * 0.09 + p1) * 1.1 + Math.sin(y * 0.23 + p2) * 0.45;
    const fibre = (r() - 0.5) * (r() < 0.12 ? 0.7 : 0.22);
    edge.push([from + (to - from) * t + sway + wander + fibre, Math.min(y, 100)]);
  }
  if (edge[edge.length - 1][1] < 100) edge.push([edge[edge.length - 1][0], 100]);

  const top = [];
  for (let x = 0; x < edge[0][0]; x += 0.8 + r() * 1.4) top.push([x, 0.15 + r() * 0.55]);

  const paper = [[0, 100], ...top, ...edge];
  let rimWander = 0;
  const rim = [
    [0, 100],
    [0, 0],
    ...edge.map(([x, y]) => {
      rimWander = rimWander * 0.75 + (rimR() - 0.5) * 0.35;
      return [x + 0.55 + Math.abs(rimWander) * 1.6 + rimR() * 0.28, y];
    }),
  ];

  const flip = (pts) => (rtl ? pts.map(([x, y]) => [100 - x, y]) : pts);
  return { paper: pct(flip(paper)), rim: pct(flip(rim)) };
}

// A horizontal tear (used on small screens where the cover stacks):
// the paper covers everything below the torn line.
export function tearHorizontal(seed, { at = 92 } = {}) {
  const r = rng(seed);
  const rimR = rng(seed + 3);
  const edge = [];
  let wob = 0;
  for (let x = 0; x <= 100.01; x += 0.9 + r() * 1.4) {
    wob = wob * 0.8 + (r() - 0.5) * 1.3;
    edge.push([Math.min(x, 100), at + wob + (r() - 0.5) * 0.8]);
  }
  const paper = [[100, 100], [0, 100], ...edge];
  const rim = [[100, 100], [0, 100], ...edge.map(([x, y]) => [x, y - 0.5 - rimR() * 1.2])];
  return { paper: pct(paper), rim: pct(rim) };
}

export function uid(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${rand}`;
}
