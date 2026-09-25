import { useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { imageStore } from '../store/imageStore.js';
import { useImageSrc } from '../hooks/useImageSrc.js';
import { PlusIcon } from './Icons.jsx';

/** A read-only stored image (e.g. a chapter thumbnail borrowed from a project). */
export function StoredImage({ value, alt = '', className = '' }) {
  const src = useImageSrc(value);
  const [loaded, setLoaded] = useState(false);
  if (!src) return <div className="slot__blank" aria-hidden="true" />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`slot__img ${loaded ? 'is-loaded' : ''} ${className}`}
      onLoad={() => setLoaded(true)}
    />
  );
}

/**
 * An image area of the layout.
 * - Visitors see the image, or a quiet paper-toned plate (or `fallback`) when empty.
 * - In Edit Mode: empty areas show "+ Add image"; filled ones show Replace / Remove.
 * Accepts a click on "+" (file picker) or a dropped file.
 */
export default function ImageSlot({
  value,
  onChange,
  fallback = null,
  label,
  alt = '',
  className = '',
  style,
  onOpen,
  cursor = 'view',
  eager = false,
}) {
  const { editing, t } = usePortfolio();
  const src = useImageSrc(value);
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const choose = () => input.current?.click();

  async function accept(files) {
    const file = [...(files || [])].find((f) => f.type.startsWith('image/'));
    if (!file) return;
    setBusy(true);
    try {
      const previous = value;
      const ref = await imageStore.save(file);
      setLoaded(false);
      onChange(ref);
      if (previous) imageStore.remove(previous);
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    const previous = value;
    onChange(null);
    imageStore.remove(previous);
  }

  const filled = Boolean(value);
  const dropProps = editing
    ? {
        onDragOver: (e) => {
          e.preventDefault();
          setOver(true);
        },
        onDragLeave: () => setOver(false),
        onDrop: (e) => {
          e.preventDefault();
          setOver(false);
          accept(e.dataTransfer.files);
        },
      }
    : {};

  const openable = Boolean(onOpen && !editing && filled && src);

  return (
    <div
      className={`slot ${filled ? 'slot--filled' : 'slot--empty'} ${over ? 'slot--over' : ''} ${className}`}
      style={style}
      data-cursor={openable ? cursor : undefined}
      {...dropProps}
    >
      {filled && src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={`slot__img ${loaded ? 'is-loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          onClick={openable ? (e) => onOpen(e.currentTarget.getBoundingClientRect()) : undefined}
          style={openable ? { cursor: 'zoom-in' } : undefined}
        />
      ) : filled ? (
        <div className="slot__blank" aria-hidden="true" />
      ) : (
        fallback || (
          <div className="slot__blank" aria-hidden="true">
            <span className="slot__mark" />
          </div>
        )
      )}

      {editing && (
        <>
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              accept(e.target.files);
              e.target.value = '';
            }}
          />
          {!filled ? (
            <button type="button" className="slot__add" onClick={choose} disabled={busy}>
              <span className="slot__plus">
                <PlusIcon size={20} />
              </span>
              <span className="slot__add-label">{busy ? t.uploading : label || t.addImage}</span>
            </button>
          ) : (
            <div className="slot__tools">
              <button type="button" onClick={choose} disabled={busy}>
                {busy ? t.uploading : t.replace}
              </button>
              <button type="button" onClick={remove}>
                {t.remove}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
