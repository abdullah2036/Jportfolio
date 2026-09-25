// Text split into pieces so it can move in piece by piece.
//
// <SplitText>  headings. Latin splits into letters; Arabic splits into words
//              only, so letters stay joined the way the script needs them.
//              variant "rise": blurs up on load (the cover name)
//              variant "roll": rolls up out of a mask once an ancestor is .is-in
// <SplitWords> paragraphs, word by word, un-blurring once an ancestor is .is-in
//              (or straight away with auto).
//
// Screen readers get the plain sentence; the pieces are hidden from them.

export default function SplitText({
  text,
  lang,
  as: Tag = 'span',
  className = '',
  delay = 0,
  step,
  variant = 'rise',
  ...rest
}) {
  const byLetter = lang !== 'ar';
  const gap = step ?? (byLetter ? 38 : 110);
  let n = 0;

  return (
    <Tag className={`split split--${variant} ${className}`} {...rest}>
      <span className="sr-only">{text}</span>
      {text.split('\n').map((line, li) => (
        <span className="split__line" key={li} aria-hidden="true">
          {line.split(/(\s+)/).map((word, wi) => {
            if (!word) return null;
            if (/^\s+$/.test(word)) return <span key={wi}> </span>;
            const pieces = byLetter ? [...word] : [word];
            return (
              <span className="split__word" key={wi}>
                {pieces.map((piece, ci) => {
                  const i = n++;
                  return (
                    <span className="split__piece" key={ci} style={{ '--d': `${delay + i * gap}ms`, '--n': i }}>
                      {piece}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

export function SplitWords({ text, as: Tag = 'p', className = '', delay = 0, auto = false, ...rest }) {
  let n = 0;
  return (
    <Tag
      className={`words ${auto ? 'words--auto' : ''} ${className}`}
      style={{ '--words-delay': `${delay}ms` }}
      {...rest}
    >
      <span className="sr-only">{text}</span>
      {text.split(/(\s+)/).map((part, i) =>
        !part ? null : /^\s+$/.test(part) ? (
          part
        ) : (
          <span className="words__w" key={i} aria-hidden="true" style={{ '--w': n++ }}>
            {part}
          </span>
        )
      )}
    </Tag>
  );
}
