import { useMemo } from 'react';
import { deckle, rng } from '../lib/random.js';

// A small torn paper note, slightly rotated, with a soft cast shadow.
export function PaperNote({ children, seed = 3, rotate = -2, className = '' }) {
  const clip = useMemo(() => deckle(seed, { ax: 2.4, ay: 1.8, step: 2.1 }), [seed]);
  return (
    <div className={`note ${className}`} style={{ '--rot': `${rotate}deg` }}>
      <div className="note__sheet" style={{ clipPath: clip }}>
        {children}
      </div>
    </div>
  );
}

// A strip of translucent washi tape.
export function Tape({ className = '', rotate = 8 }) {
  return <span className={`tape ${className}`} style={{ '--rot': `${rotate}deg` }} aria-hidden="true" />;
}

// A dried flower sprig (the small botanical accent in the reference).
export function Sprig({ className = '', seed = 11 }) {
  const parts = useMemo(() => {
    const r = rng(seed);
    const stems = [
      'M62 356 C70 300 78 250 92 200 C104 156 120 110 150 40',
      'M92 200 C70 180 52 160 40 128',
      'M104 160 C130 150 150 132 166 104',
      'M84 246 C110 236 128 222 142 200',
      'M120 110 C104 92 96 74 94 52',
      'M78 280 C58 270 44 252 36 232',
    ];
    const tips = [
      [150, 40], [40, 128], [166, 104], [142, 200], [94, 52], [36, 232],
      [128, 70], [60, 160], [150, 124], [120, 214], [110, 90], [50, 250],
    ];
    const heads = [];
    tips.forEach(([x, y]) => {
      const n = 3 + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) {
        heads.push({
          x: x + (r() - 0.5) * 30,
          y: y + (r() - 0.5) * 26,
          s: 2.6 + r() * 3.2,
          bud: r() < 0.35,
          rot: r() * 72,
          tone: r() < 0.5 ? '#e3c6ba' : '#d3ac9e',
        });
      }
    });
    return { stems, heads };
  }, [seed]);

  return (
    <svg className={`sprig ${className}`} viewBox="0 0 200 360" aria-hidden="true">
      <g fill="none" stroke="#7d5c4d" strokeWidth="1.3" strokeLinecap="round">
        {parts.stems.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g stroke="#8a6656" strokeWidth=".7" fill="none" opacity=".8">
        {parts.heads.map((h, i) => (
          <path key={i} d={`M${h.x} ${h.y} L${h.x + (100 - h.x) * 0.06} ${h.y + 7}`} />
        ))}
      </g>
      {parts.heads.map((h, i) =>
        h.bud ? (
          <ellipse key={i} cx={h.x} cy={h.y} rx={h.s * 0.55} ry={h.s * 0.8} fill="#9b6b5b" transform={`rotate(${h.rot} ${h.x} ${h.y})`} />
        ) : (
          <g key={i} transform={`translate(${h.x} ${h.y}) rotate(${h.rot})`}>
            {[0, 1, 2, 3, 4].map((k) => (
              <ellipse key={k} cx="0" cy={-h.s * 0.62} rx={h.s * 0.42} ry={h.s * 0.62} fill={h.tone} transform={`rotate(${k * 72})`} />
            ))}
            <circle r={h.s * 0.32} fill="#a26f5f" />
          </g>
        )
      )}
    </svg>
  );
}
