import { useMagnetic } from '../hooks/useMotion.js';
import { reducedMotion } from '../lib/motion.js';
import { ArrowIcon, ExternalIcon } from './Icons.jsx';

// A soft ring of light spreads from where the button was pressed
// (finger or mouse), so every tap gets an answer.
function ripple(e) {
  if (reducedMotion()) return;
  const btn = e.currentTarget;
  const r = btn.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2.4;
  const dot = document.createElement('span');
  dot.className = 'btn__ripple';
  dot.style.width = dot.style.height = `${size}px`;
  dot.style.left = `${e.clientX - r.left - size / 2}px`;
  dot.style.top = `${e.clientY - r.top - size / 2}px`;
  btn.appendChild(dot);
  dot
    .animate(
      [
        { transform: 'scale(0)', opacity: 0.42 },
        { transform: 'scale(1)', opacity: 0 },
      ],
      { duration: 700, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
    )
    .finished.finally(() => dot.remove());
}

// The burgundy button ("Explore the Portfolio →"). Leans toward the
// cursor, catches a sheen on hover, ripples when pressed and sheds a few
// petals when clicked.
// `external` opens the link in a new tab and shows a ↗ instead of →.
export default function Button({ href, onClick, children, className = '', external = false, ...rest }) {
  const ref = useMagnetic();
  const Icon = external ? ExternalIcon : ArrowIcon;
  const inner = (
    <>
      <span className="btn__label">{children}</span>
      <span className="btn__arrow-wrap" aria-hidden="true">
        <Icon className="btn__arrow" size={17} />
      </span>
    </>
  );
  const linkProps = external ? { target: '_blank', rel: 'noreferrer' } : {};
  const props = {
    ref,
    className: `btn ${className}`,
    onClick,
    onPointerDown: ripple,
    'data-petals': 6,
    ...linkProps,
    ...rest,
  };
  return href ? (
    <a href={href} {...props}>
      {inner}
    </a>
  ) : (
    <button type="button" {...props}>
      {inner}
    </button>
  );
}
