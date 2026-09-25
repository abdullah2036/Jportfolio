import { useMemo } from 'react';
import { rng } from '../lib/random.js';

// The atmospheric dusk seascape used on the cover (and behind the About
// portrait) until a photograph is uploaded. Pure SVG, so it stays crisp at
// any size and weighs almost nothing.
//
// It is built from stacked layers so it can be quietly alive without costing
// anything: clouds drift, the sun breathes, light shimmers on the water and
// the blossom branches sway. On the cover the layers also shift with the
// cursor (--hx / --hy from the Hero) for depth. Motion lives in motion.css.

const petal = (r) =>
  `M0 0 C${-r * 0.55} ${-r * 0.25} ${-r * 0.5} ${-r * 0.92} 0 ${-r} C${r * 0.5} ${-r * 0.92} ${r * 0.55} ${-r * 0.25} 0 0Z`;
const leaf = (w, l) =>
  `M0 0 C${w * 0.6} ${-l * 0.3} ${w * 0.5} ${-l * 0.75} 0 ${-l} C${-w * 0.5} ${-l * 0.75} ${-w * 0.6} ${-l * 0.3} 0 0Z`;

// clusters 0–2 grow from the low branches, 3–4 from the upper spray
const CLUSTERS = [
  { cx: 800, cy: 905, sx: 150, sy: 110, n: 22, min: 20, max: 40, high: false },
  { cx: 870, cy: 760, sx: 70, sy: 90, n: 10, min: 14, max: 26, high: false },
  { cx: 690, cy: 975, sx: 90, sy: 40, n: 8, min: 18, max: 30, high: false },
  { cx: 858, cy: 470, sx: 60, sy: 80, n: 9, min: 9, max: 16, high: true },
  { cx: 800, cy: 585, sx: 40, sy: 40, n: 5, min: 9, max: 14, high: true },
];

function buildBlossoms(seed) {
  const r = rng(seed);
  const flowers = [];
  const leaves = [];
  CLUSTERS.forEach((c) => {
    for (let i = 0; i < c.n; i++) {
      const size = c.min + r() * (c.max - c.min);
      flowers.push({
        x: c.cx + (r() - 0.5) * 2 * c.sx,
        y: c.cy + (r() - 0.5) * 2 * c.sy,
        r: size,
        rot: r() * 72,
        tilt: 0.62 + r() * 0.38,
        tone: r() < 0.55 ? 'a' : 'b',
        blur: size > 34 && r() < 0.6,
        high: c.high,
      });
    }
    for (let i = 0; i < c.n * 1.3; i++) {
      leaves.push({
        x: c.cx + (r() - 0.5) * 2.2 * c.sx,
        y: c.cy + (r() - 0.5) * 2.2 * c.sy,
        w: 8 + r() * 12,
        l: 26 + r() * 40,
        rot: -80 + r() * 160,
        shade: r() < 0.5 ? '#3d3a2b' : '#565039',
        high: c.high,
      });
    }
  });
  flowers.sort((a, b) => a.r - b.r);
  return { flowers, leaves };
}

function buildGlints(seed) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < 84; i++) {
    const t = r();
    const y = 590 + t * t * 330;
    const spread = 18 + t * 120;
    out.push({
      x: 560 + (r() - 0.5) * spread * 2,
      y,
      w: 6 + r() * (40 - t * 20),
      o: (1 - t) * (0.5 + r() * 0.5),
      set: i % 3,
    });
  }
  return out;
}

function Branch({ id, flowers, leaves, stems }) {
  return (
    <>
      <g fill="none" stroke="#3a2a2a" strokeLinecap="round">
        {stems.map(([d, w]) => (
          <path key={d} d={d} strokeWidth={w} />
        ))}
      </g>
      {leaves.map((l, i) => (
        <path
          key={`l${i}`}
          d={leaf(l.w, l.l)}
          fill={l.shade}
          transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}
          opacity=".92"
        />
      ))}
      {flowers.map((f, i) => (
        <g
          key={`f${i}`}
          transform={`translate(${f.x} ${f.y}) rotate(${f.rot}) scale(1 ${f.tilt})`}
          filter={f.blur ? `url(#${id}-dof)` : undefined}
        >
          {[0, 1, 2, 3, 4].map((k) => (
            <path key={k} d={petal(f.r)} fill={`url(#${id}-petal-${f.tone})`} transform={`rotate(${k * 72})`} />
          ))}
          <circle r={f.r * 0.16} fill="#8f3b52" />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <circle key={k} cx={Math.cos(k) * f.r * 0.24} cy={Math.sin(k) * f.r * 0.24} r={f.r * 0.035 + 0.6} fill="#f3d9a0" />
          ))}
        </g>
      ))}
    </>
  );
}

// Every layer shares the same canvas, so they line up exactly.
function Layer({ name, fit, children }) {
  return (
    <svg className={`dusk__layer dusk__layer--${name}`} viewBox="0 0 900 1000" preserveAspectRatio={fit}>
      {children}
    </svg>
  );
}

export default function DuskScene({ variant = 'cover', uid = '', className = '' }) {
  // uid keeps gradient ids unique when the same scene appears twice on a page
  const id = `dusk-${variant}${uid ? `-${uid}` : ''}`;
  const withFlowers = variant === 'cover';
  const blossoms = useMemo(() => buildBlossoms(7), []);
  const glints = useMemo(() => buildGlints(3), []);
  const fit = variant === 'cover' ? 'xMaxYMid slice' : 'xMidYMid slice';

  return (
    <div className={`dusk dusk--${variant} ${className}`} aria-hidden="true">
      <Layer fit={fit} name="sky">
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5d6182" />
            <stop offset=".22" stopColor="#877c9c" />
            <stop offset=".45" stopColor="#c496a7" />
            <stop offset=".72" stopColor="#e9b4ab" />
            <stop offset=".93" stopColor="#f5cdb9" />
          </linearGradient>
          <radialGradient id={`${id}-sun`} cx="560" cy="560" r="320" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff6e6" stopOpacity=".95" />
            <stop offset=".08" stopColor="#ffe6cf" stopOpacity=".75" />
            <stop offset=".35" stopColor="#f6c2b1" stopOpacity=".32" />
            <stop offset="1" stopColor="#f3b9ae" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-sea`} x1="0" y1="585" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e8b6ad" />
            <stop offset=".2" stopColor="#c59aa3" />
            <stop offset=".55" stopColor="#8d7285" />
            <stop offset="1" stopColor="#4f4256" />
          </linearGradient>
          <radialGradient id={`${id}-petal-a`} cx=".5" cy="1" r="1">
            <stop offset="0" stopColor="#b85d77" />
            <stop offset=".3" stopColor="#e7a9b8" />
            <stop offset="1" stopColor="#f9dfe3" />
          </radialGradient>
          <radialGradient id={`${id}-petal-b`} cx=".5" cy="1" r="1">
            <stop offset="0" stopColor="#a8506a" />
            <stop offset=".35" stopColor="#dc93a6" />
            <stop offset="1" stopColor="#f3c9d0" />
          </radialGradient>
          <filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id={`${id}-haze`}>
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
          <filter id={`${id}-dof`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <rect x="-80" y="-60" width="1060" height="680" fill={`url(#${id}-sky)`} />
      </Layer>

      <Layer fit={fit} name="clouds">
        <g filter={`url(#${id}-soft)`}>
          <ellipse cx="760" cy="300" rx="200" ry="26" fill="#8c7894" opacity=".55" />
          <ellipse cx="520" cy="360" rx="230" ry="14" fill="#c897a4" opacity=".55" />
          <ellipse cx="700" cy="405" rx="260" ry="15" fill="#efb2ab" opacity=".8" />
          <ellipse cx="430" cy="432" rx="200" ry="9" fill="#f4c0b2" opacity=".75" />
          <ellipse cx="820" cy="455" rx="190" ry="13" fill="#e6a7a5" opacity=".8" />
          <ellipse cx="610" cy="482" rx="240" ry="8" fill="#fbd6c2" opacity=".85" />
        </g>
      </Layer>

      <Layer fit={fit} name="glow">
        <circle cx="560" cy="560" r="320" fill={`url(#${id}-sun)`} />
        <circle cx="560" cy="557" r="12" fill="#fffaf0" filter={`url(#${id}-haze)`} />
      </Layer>

      <Layer fit={fit} name="haze">
        <g filter={`url(#${id}-soft)`}>
          <ellipse cx="840" cy="528" rx="220" ry="20" fill="#9f8298" opacity=".75" />
          <ellipse cx="690" cy="540" rx="150" ry="10" fill="#b48c9c" opacity=".6" />
        </g>
      </Layer>

      <Layer fit={fit} name="sea">
        <path
          d="M380 585 C460 572 520 566 590 560 C660 552 700 540 760 530 C820 520 860 522 980 526 L980 600 L380 600Z"
          fill="#b391a2"
          opacity=".8"
        />
        <path d="M600 596 C660 586 700 574 750 566 C800 558 850 552 980 556 L980 604 L600 604Z" fill="#8f7188" />
        <rect x="-80" y="588" width="1060" height="480" fill={`url(#${id}-sea)`} />
        <g stroke="#f7d9cc" strokeWidth="1" opacity=".18">
          <path d="M-80 640 H980" />
          <path d="M-80 690 H980" />
          <path d="M-80 760 H980" />
        </g>
      </Layer>

      {[0, 1, 2].map((set) => (
        <Layer key={set} fit={fit} name={`glints dusk__glints--${set}`}>
          <g fill="#fff0e0" filter={`url(#${id}-haze)`}>
            {glints
              .filter((g) => g.set === set)
              .map((g, i) => (
                <rect key={i} x={g.x - g.w / 2} y={g.y} width={g.w} height="1.6" opacity={g.o} />
              ))}
          </g>
        </Layer>
      ))}

      <Layer fit={fit} name="isles">
        <path d="M602 652 c10 -13 28 -16 44 -8 c8 4 13 9 15 14z" fill="#4c3a48" />
        <path d="M662 700 c16 -24 50 -30 72 -12 c9 7 14 12 16 19z" fill="#433240" />
        <path d="M520 720 c8 -9 20 -10 30 -4 c5 3 8 6 9 9z" fill="#4c3a48" opacity=".9" />
        <path
          d="M980 612 C862 614 830 632 800 652 C770 672 748 694 736 724 C760 722 792 728 812 744 C842 764 872 796 980 810Z"
          fill="#3c2b38"
        />
        <path d="M980 612 C862 614 830 632 800 652 C790 659 781 666 773 674 C800 660 845 640 980 636Z" fill="#6b5064" opacity=".6" />
      </Layer>

      {withFlowers && (
        <>
          <Layer fit={fit} name="high">
            <Branch
              id={id}
              flowers={blossoms.flowers.filter((f) => f.high)}
              leaves={blossoms.leaves.filter((l) => l.high)}
              stems={[['M905 430 C880 450 852 480 832 530 C822 556 812 580 800 600', 3]]}
            />
          </Layer>
          <Layer fit={fit} name="near">
            <Branch
              id={id}
              flowers={blossoms.flowers.filter((f) => !f.high)}
              leaves={blossoms.leaves.filter((l) => !l.high)}
              stems={[
                ['M905 1000 C870 920 842 840 850 740 C856 670 878 600 905 540', 5],
                ['M860 1010 C800 960 740 930 660 915', 4],
                ['M850 760 C820 740 800 720 790 690', 3],
              ]}
            />
          </Layer>
        </>
      )}

      <div className="dusk__vignette" />
      <div className="dusk__grain" />
    </div>
  );
}
