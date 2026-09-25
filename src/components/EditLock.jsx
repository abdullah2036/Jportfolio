import { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { EditIcon } from './Icons.jsx';

// The small paper card that asks for the edit password.
export default function EditLock() {
  const { lockOpen } = usePortfolio();
  if (!lockOpen) return null;
  return <LockCard />;
}

function LockCard() {
  const { t, tryUnlock, closeLock } = usePortfolio();
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    input.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeLock();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeLock]);

  const submit = (e) => {
    e.preventDefault();
    if (tryUnlock(value)) return;
    setWrong(true);
    setValue('');
    input.current?.focus();
  };

  return (
    <div className="lock" role="dialog" aria-modal="true" aria-labelledby="lock-title">
      <button type="button" className="lock__backdrop" aria-label={t.cancel} onClick={closeLock} />
      <form className={`lock__card ${wrong ? 'is-wrong' : ''}`} onSubmit={submit}>
        <p className="lock__title" id="lock-title">
          <EditIcon size={16} /> {t.editPortfolio}
        </p>
        <p className="lock__hint">{t.passwordHint}</p>
        <label className="lock__field">
          <span className="sr-only">{t.password}</span>
          <input
            ref={input}
            type="password"
            autoComplete="current-password"
            placeholder={t.password}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setWrong(false);
            }}
          />
        </label>
        {wrong && (
          <p className="lock__error" role="alert">
            {t.wrongPassword}
          </p>
        )}
        <div className="lock__actions">
          <button type="button" className="lock__cancel" onClick={closeLock}>
            {t.cancel}
          </button>
          <button type="submit" className="btn lock__enter">
            {t.unlock}
          </button>
        </div>
      </form>
    </div>
  );
}
