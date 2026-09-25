import { useEffect, useMemo, useRef, useState } from 'react';
import { burstPetals, reducedMotion } from '../lib/motion.js';
import { rng } from '../lib/random.js';

// The opening of the portfolio: five petals drift together into a blossom,
// it turns once, then scatters into the falling petals as the paper sheet
// lifts away and the cover plays in. Once per visit (add ?intro to replay).

const SEEN = 'jana-portfolio/intro';
const PETAL = 'M0 0 C-13 -6 -12 -24 -4 -30 L0 -26 L4 -30 C12 -24 13 -6 0 0Z';

function shouldPlay() {
  const q = new URLSearchParams(location.search);
  if (q.has('intro')) return true;
  if (reducedMotion() || q.has('edit') || q.has('shot')) return false;
  try {
    return sessionStorage.getItem(SEEN) !== '1';
  } catch {
    return true;
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// jagged bottom edge for the lifting sheet
function tornBottom(seed) {
  const r = rng(seed);
  const pts = ['0% 0%', '100% 0%'];
  for (let x = 100; x >= 0; x -= 1.2 + r() * 1.6) pts.push(`${x.toFixed(2)}% ${(97.2 + r() * 2.6).toFixed(2)}%`);
  pts.push('0% 98%');
  return `polygon(${pts.join(',')})`;
}

export default function Preloader() {
  const [phase, setPhase] = useState(shouldPlay() ? 'in' : 'done');
  const mark = useRef(null);
  const edge = useMemo(() => tornBottom(5), []);
  const scatter = useMemo(() => {
    const r = rng(12);
    return [0, 1, 2, 3, 4].map(() => ({
      x: `${(r() - 0.5) * 70}vmin`,
      y: `${(r() - 0.5) * 60}vmin`,
      r: `${(r() - 0.5) * 540}deg`,
    }));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (phase === 'done') {
      root.classList.remove('is-loading');
      return undefined;
    }
    root.classList.add('is-loading');
    let cancelled = false;
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(1600)]);
    Promise.all([fonts, wait(1900)]).then(async () => {
      if (cancelled) return;
      setPhase('out');
      try {
        sessionStorage.setItem(SEEN, '1');
      } catch {
        /* ignore */
      }
      const r = mark.current?.getBoundingClientRect();
      if (r) burstPetals(r.left + r.width / 2, r.top + r.height / 2, 16);
      await wait(260);
      root.classList.remove('is-loading');
      await wait(1000);
      if (!cancelled) setPhase('done');
    });
    return () => {
      cancelled = true;
    };
  }, [phase === 'done']); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'done') return null;

  return (
    <div className={`preloader is-${phase}`} aria-hidden="true">
      <div className="preloader__sheet" style={{ clipPath: edge }} />
      <div className="preloader__center">
        <svg className="preloader__mark" viewBox="-40 -40 80 80" ref={mark}>
          <defs>
            <linearGradient id="preloader-petal" x1="0" y1="0" x2="0" y2="-30" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#b85d77" />
              <stop offset=".45" stopColor="#e3a2b3" />
              <stop offset="1" stopColor="#f8dde3" />
            </linearGradient>
          </defs>
          <g className="preloader__bloom">
            {scatter.map((s, i) => (
              <g
                key={i}
                className="preloader__petal"
                style={{ '--x': s.x, '--y': s.y, '--r': s.r, '--i': i }}
              >
                <path d={PETAL} transform={`rotate(${i * 72})`} fill="url(#preloader-petal)" />
              </g>
            ))}
            <circle className="preloader__heart" r="4.2" fill="#8f3b52" />
          </g>
        </svg>
        <span className="preloader__line" />
      </div>
    </div>
  );
}
