import { useEffect, useRef } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { CONFIG } from '../config.js';
import { reducedMotion, touchScreen } from '../lib/motion.js';

// Sakura petals, small leaves and the odd whole blossom drifting across the
// portfolio. A single canvas, a few dozen sprites: light enough to always run.
//   • the cursor (or a finger on a phone) pushes them aside and stirs a breeze
//   • scrolling moves them with a little depth
//   • clicks on [data-petals] elements shake a few loose; on a phone, a tap
//     on the paper itself lets a couple fall too

const SPRITE = 72;

function petalPath() {
  const p = new Path2D();
  p.moveTo(0, 1);
  p.bezierCurveTo(-1.02, 0.52, -0.88, -0.62, -0.3, -0.98);
  p.lineTo(0, -0.78);
  p.lineTo(0.3, -0.98);
  p.bezierCurveTo(0.88, -0.62, 1.02, 0.52, 0, 1);
  p.closePath();
  return p;
}

function leafPath() {
  const p = new Path2D();
  p.moveTo(0, 1);
  p.bezierCurveTo(0.62, 0.45, 0.5, -0.45, 0, -1);
  p.bezierCurveTo(-0.5, -0.45, -0.62, 0.45, 0, 1);
  p.closePath();
  return p;
}

function sprite(draw) {
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE;
  const g = c.getContext('2d');
  g.translate(SPRITE / 2, SPRITE / 2);
  g.scale(SPRITE * 0.45, SPRITE * 0.45);
  draw(g);
  return c;
}

function buildSprites() {
  const petal = petalPath();
  const leaf = leafPath();
  const petals = [
    ['#e59bb0', '#f4c4cf', '#fdeef1'],
    ['#d98aa0', '#efb6c3', '#fbe2e7'],
    ['#efb6c2', '#f8d7de', '#fff5f6'],
  ].map(([base, mid, tip]) =>
    sprite((g) => {
      const grad = g.createLinearGradient(0, 1, 0, -1);
      grad.addColorStop(0, base);
      grad.addColorStop(0.5, mid);
      grad.addColorStop(1, tip);
      g.fillStyle = grad;
      g.fill(petal);
      g.strokeStyle = 'rgba(176, 80, 110, 0.22)';
      g.lineWidth = 0.035;
      g.beginPath();
      g.moveTo(0, 0.9);
      g.quadraticCurveTo(0.06, 0.1, 0, -0.62);
      g.stroke();
    })
  );
  const leaves = [
    ['#6c6a43', '#9c9c69'],
    ['#7d6f4a', '#b4a878'],
  ].map(([dark, light]) =>
    sprite((g) => {
      const grad = g.createLinearGradient(-0.5, 1, 0.5, -1);
      grad.addColorStop(0, dark);
      grad.addColorStop(1, light);
      g.fillStyle = grad;
      g.fill(leaf);
      g.strokeStyle = 'rgba(255, 250, 220, 0.3)';
      g.lineWidth = 0.04;
      g.beginPath();
      g.moveTo(0, 0.95);
      g.quadraticCurveTo(0.08, 0, 0, -0.9);
      g.stroke();
    })
  );
  const blossoms = [0, 1].map((v) =>
    sprite((g) => {
      for (let k = 0; k < 5; k++) {
        g.save();
        g.rotate((k * Math.PI * 2) / 5);
        g.translate(0, -0.5);
        g.scale(0.5, 0.5);
        const grad = g.createLinearGradient(0, 1, 0, -1);
        grad.addColorStop(0, v ? '#d9869d' : '#e8a3b5');
        grad.addColorStop(1, v ? '#fbe0e6' : '#fff2f4');
        g.fillStyle = grad;
        g.fill(petal);
        g.restore();
      }
      g.fillStyle = '#b4536d';
      g.beginPath();
      g.arc(0, 0, 0.15, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#f2d17c';
      for (let k = 0; k < 7; k++) {
        g.beginPath();
        g.arc(Math.cos(k) * 0.22, Math.sin(k) * 0.22, 0.045, 0, Math.PI * 2);
        g.fill();
      }
    })
  );
  return { petals, leaves, blossoms };
}

const rand = (a, b) => a + Math.random() * (b - a);

export default function AmbientPetals() {
  const { lang, petals: enabled, overlay, viewer } = usePortfolio();
  const canvas = useRef(null);
  const state = useRef({ paused: false, dir: 1 });

  state.current.paused = Boolean(overlay || viewer);
  state.current.dir = lang === 'ar' ? -1 : 1;

  useEffect(() => {
    if (!enabled || reducedMotion()) return undefined;
    const cv = canvas.current;
    const ctx = cv.getContext('2d');
    const sprites = buildSprites();
    const shared = state.current;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let target = 0;
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    let fade = 0;
    const flakes = [];
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0 };
    let scrollY = window.scrollY;
    let scrollKick = 0;

    const pick = () => {
      const r = Math.random();
      if (r < 0.7) return { kind: 'petal', img: sprites.petals[(Math.random() * 3) | 0], size: rand(9, 17) };
      if (r < 0.88) return { kind: 'leaf', img: sprites.leaves[(Math.random() * 2) | 0], size: rand(11, 19) };
      return { kind: 'blossom', img: sprites.blossoms[(Math.random() * 2) | 0], size: rand(13, 20) };
    };

    const spawn = (anywhere, extra = {}) => {
      const z = rand(0.6, 1.15);
      const upwind = shared.dir > 0 ? rand(-0.25, 0.85) : rand(0.15, 1.25);
      const f = {
        ...pick(),
        z,
        x: anywhere ? rand(0, w) : upwind * w,
        y: anywhere ? rand(-0.1 * h, h) : rand(-60, -20),
        rot: rand(0, Math.PI * 2),
        spin: rand(-1.1, 1.1),
        fall: rand(16, 34),
        swayA: rand(10, 26),
        swayF: rand(0.5, 1.2),
        swayP: rand(0, Math.PI * 2),
        flipF: rand(0.8, 2.2),
        flipP: rand(0, Math.PI * 2),
        ix: 0,
        iy: 0,
        t: rand(0, 20),
        alpha: rand(0.72, 0.95),
        life: Infinity,
        ...extra,
      };
      f.size *= z;
      return f;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      target = Math.round(Math.min(26, Math.max(7, (w * h) / 62000)) * (CONFIG.ambient?.density ?? 1));
      while (flakes.filter((f) => f.life === Infinity).length < target) flakes.push(spawn(true));
    };

    const onMove = (e) => {
      const now = performance.now();
      const dt = Math.max(16, now - mouse.t) / 1000;
      if (mouse.t) {
        mouse.vx = (e.clientX - mouse.x) / dt;
        mouse.vy = (e.clientY - mouse.y) / dt;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.t = now;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onTouch = (e) => {
      const t = e.touches[0];
      if (t) onMove(t);
    };
    let touchTimer = 0;
    const onTouchEnd = () => {
      clearTimeout(touchTimer);
      touchTimer = setTimeout(onLeave, 300);
    };
    const onClick = (e) => {
      const host = e.target.closest?.('[data-petals]');
      let { clientX: x, clientY: y } = e;
      if (host && !x && !y) {
        // keyboard "click": start from the middle of the element
        const r = host.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
      if (host) {
        onBurst({ detail: { x, y, count: Number(host.dataset.petals) || 6 } });
      } else if (
        touchScreen() &&
        !e.target.closest?.('a, button, input, select, textarea, label, [contenteditable], .archive, .viewer')
      ) {
        onBurst({ detail: { x, y, count: 3 } });
      }
    };
    const onScroll = () => {
      const y = window.scrollY;
      scrollKick += y - scrollY;
      scrollY = y;
    };
    const onBurst = (e) => {
      const { x, y, count = 8 } = e.detail || {};
      const room = 70 - flakes.length;
      for (let i = 0; i < Math.min(count, room); i++) {
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const speed = rand(90, 240);
        flakes.push(
          spawn(false, {
            x,
            y,
            ix: Math.cos(a) * speed,
            iy: Math.sin(a) * speed,
            spin: rand(-4, 4),
            life: rand(4.5, 7.5),
            alpha: 0.95,
          })
        );
      }
      if (!raf) loop(performance.now());
    };

    const step = (dt) => {
      clock += dt;
      fade = Math.min(1, fade + dt / 1.8);
      const breeze = (14 + Math.sin(clock * 0.13) * 9 + Math.sin(clock * 0.41) * 5) * shared.dir;
      const kick = scrollKick;
      scrollKick = 0;
      const mouseFresh = performance.now() - mouse.t < 120;

      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        f.t += dt;

        // the cursor pushes flakes away, and a quick stroke stirs a breeze
        const dx = f.x - mouse.x;
        const dy = f.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150) {
          const d = Math.sqrt(d2) || 1;
          const push = (1 - d / 150) * 520 * dt;
          f.ix += (dx / d) * push;
          f.iy += (dy / d) * push;
          f.spin += (dx > 0 ? 1 : -1) * push * 0.01;
          if (mouseFresh) {
            f.ix += mouse.vx * 0.035 * (1 - d / 150);
            f.iy += mouse.vy * 0.035 * (1 - d / 150);
          }
        }

        const drag = Math.pow(0.18, dt);
        f.ix *= drag;
        f.iy = f.iy * drag + (f.life !== Infinity ? 40 * dt : 0);
        f.spin *= Math.pow(0.7, dt);
        if (Math.abs(f.spin) < 0.25) f.spin += (f.spin >= 0 ? 0.25 : -0.25) * dt;

        f.x += (breeze * f.z + Math.sin(f.t * f.swayF + f.swayP) * f.swayA + f.ix) * dt;
        f.y += (f.fall * f.z + f.iy) * dt - kick * 0.35 * f.z;
        f.rot += f.spin * dt;

        if (f.life !== Infinity) f.life -= dt;
        const gone = f.y > h + 40 || f.y < -h * 0.6 || f.x < -60 || f.x > w + 60;
        if (f.life <= 0 || gone) {
          if (f.life === Infinity) {
            const live = flakes.filter((x) => x.life === Infinity).length;
            if (live <= target) flakes[i] = spawn(false);
            else flakes.splice(i, 1);
          } else {
            flakes.splice(i, 1);
          }
        }
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        const flip = Math.cos(f.t * f.flipF + f.flipP);
        const sx = flip < 0 ? Math.min(-0.14, flip) : Math.max(0.14, flip);
        const life = f.life === Infinity ? 1 : Math.min(1, f.life / 1.2);
        ctx.globalAlpha = f.alpha * fade * life * (flip < 0 ? 0.86 : 1);
        const c = Math.cos(f.rot);
        const s = Math.sin(f.rot);
        ctx.setTransform(dpr * c * sx, dpr * s * sx, -dpr * s, dpr * c, dpr * f.x, dpr * f.y);
        ctx.drawImage(f.img, -f.size / 2, -f.size / 2, f.size, f.size);
      }
      ctx.globalAlpha = 1;
    };

    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (shared.paused || document.hidden) {
        raf = 0;
        return;
      }
      step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    const wake = () => {
      if (!raf && !shared.paused && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('petals:burst', onBurst);
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', wake);
    const wakeTimer = setInterval(wake, 500);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(wakeTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('petals:burst', onBurst);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('click', onClick);
      clearTimeout(touchTimer);
      document.removeEventListener('visibilitychange', wake);
      ctx.clearRect(0, 0, cv.width, cv.height);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvas} className="petals" aria-hidden="true" />;
}
