import { useLayoutEffect, useRef } from 'react';
import { usePortfolio } from '../store/PortfolioContext.jsx';
import { pick } from '../i18n/format.js';
import SplitText, { SplitWords } from './SplitText.jsx';

const supportsPlaintext = (() => {
  try {
    const el = document.createElement('div');
    el.contentEditable = 'plaintext-only';
    return el.contentEditable === 'plaintext-only';
  } catch {
    return false;
  }
})();

/**
 * Text that becomes editable in Edit Mode.
 * `value` is either { ar, en } (edits the current language) or a plain string.
 * `display` / `parse` convert between stored and shown text (e.g. digits).
 * `motion` (view mode only): 'roll' for headings, 'words' / 'words-auto' for
 * paragraphs — see SplitText.
 */
export default function EditableText({
  value,
  onChange,
  as: Tag = 'span',
  multiline = false,
  display,
  parse,
  className = '',
  placeholder,
  motion,
  ...rest
}) {
  const { lang, editing } = usePortfolio();
  const ref = useRef(null);
  const localized = value !== null && typeof value === 'object';
  const raw = localized ? pick(value, lang, { fallback: !editing }) : value ?? '';
  const shown = display ? display(raw) : raw;
  const canEdit = editing && typeof onChange === 'function';
  const hint = placeholder ?? (localized ? pick(value, lang) : '');

  useLayoutEffect(() => {
    const el = ref.current;
    if (canEdit && el && document.activeElement !== el && el.innerText !== shown) el.innerText = shown;
  });

  if (!canEdit) {
    if (motion === 'roll' && shown) {
      return <SplitText key="view" as={Tag} className={className} text={shown} lang={lang} variant="roll" {...rest} />;
    }
    if ((motion === 'words' || motion === 'words-auto') && shown) {
      return (
        <SplitWords key="view" as={Tag} className={className} text={shown} auto={motion === 'words-auto'} {...rest} />
      );
    }
    return (
      <Tag key="view" className={className} {...rest}>
        {shown}
      </Tag>
    );
  }

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    let text = el.innerText.replace(/ /g, ' ');
    text = multiline ? text.replace(/\n{3,}/g, '\n\n').trim() : text.replace(/\s*\n\s*/g, ' ').trim();
    if (parse) text = parse(text);
    if (localized) {
      if (text !== (value[lang] || '')) onChange({ ...value, [lang]: text });
    } else if (text !== (value ?? '')) {
      onChange(text);
    }
  };

  return (
    <Tag
      key="edit"
      ref={ref}
      className={`${className} editable`}
      contentEditable={supportsPlaintext ? 'plaintext-only' : 'true'}
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={hint}
      onBlur={commit}
      onClick={(e) => {
        // Editing text inside a link/button must not trigger it.
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.currentTarget.innerText = shown;
          e.currentTarget.blur();
        } else if (e.key === 'Enter' && !multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, multiline ? text : text.replace(/\s*\n\s*/g, ' '));
      }}
      {...rest}
    />
  );
}
