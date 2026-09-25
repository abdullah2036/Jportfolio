import { useParallax } from '../hooks/useMotion.js';

// Wraps an image area so the picture drifts slightly slower than the page.
// depth: how far it drifts, as a % of its height.
export default function Parallax({ depth = 7, className = '', children }) {
  const ref = useParallax();
  return (
    <div ref={ref} className={`parallax ${className}`} style={{ '--depth': `${depth}%` }}>
      {children}
    </div>
  );
}
