import { useRef } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';

// The one small strip that appears in Edit Mode. Everything else is edited in place.
export default function EditBar() {
  const { editing, setEditing, storageOk, actions, t } = usePortfolio();
  const file = useRef(null);
  if (!editing) return null;

  const finish = () => {
    setEditing(false);
    const url = new URL(location.href);
    if (url.searchParams.has('edit')) {
      url.searchParams.delete('edit');
      history.replaceState(null, '', url);
    }
  };

  return (
    <div className="editbar" role="toolbar" aria-label={t.editing}>
      <span className="editbar__status">
        <span className="editbar__dot" aria-hidden="true" />
        <strong>{t.editing}</strong>
        <span className={`editbar__hint ${storageOk ? '' : 'is-warning'}`}>
          {storageOk ? t.savedLocally : t.storageFull}
        </span>
      </span>
      <span className="editbar__actions">
        <button type="button" onClick={actions.exportAll}>
          {t.export}
        </button>
        <button type="button" onClick={() => file.current?.click()}>
          {t.import}
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            try {
              await actions.importAll(f);
              window.alert(t.importDone);
            } catch {
              window.alert(t.importFailed);
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t.confirmReset)) actions.reset();
          }}
        >
          {t.reset}
        </button>
        <button type="button" className="editbar__done" onClick={finish}>
          {t.done}
        </button>
      </span>
    </div>
  );
}
