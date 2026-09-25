import { useEffect, useRef, useState } from 'react';

// A small paper note that slides up at the bottom of the screen.
// Anywhere in the app: showToast({ text, action: { label, href } })
export function showToast(detail) {
  window.dispatchEvent(new CustomEvent('toast', { detail }));
}

export default function Toast() {
  const [note, setNote] = useState(null);
  const timer = useRef(0);

  useEffect(() => {
    const onToast = (e) => {
      clearTimeout(timer.current);
      setNote({ ...e.detail, key: Date.now() });
      timer.current = setTimeout(() => setNote(null), 5000);
    };
    window.addEventListener('toast', onToast);
    return () => {
      window.removeEventListener('toast', onToast);
      clearTimeout(timer.current);
    };
  }, []);

  if (!note) return null;
  return (
    <div className="toast" role="status" key={note.key}>
      <span>{note.text}</span>
      {note.action && (
        <a className="toast__action" href={note.action.href} target="_blank" rel="noreferrer">
          {note.action.label}
        </a>
      )}
    </div>
  );
}
