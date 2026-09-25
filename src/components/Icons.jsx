// Thin-line icons drawn to match the site's hairline style.
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.35,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ size = 18, className = '', children, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`icon ${className}`}
      aria-hidden="true"
      focusable="false"
      {...stroke}
      {...rest}
    >
      {children}
    </svg>
  );
}

// Points "forward" (right in English, left in Arabic).
export const ArrowIcon = ({ className = '', ...p }) => (
  <Svg className={`flip-rtl ${className}`} {...p}>
    <path d="M4 12h15M14 7l5 5-5 5" />
  </Svg>
);

// Points "back".
export const ArrowBackIcon = ({ className = '', ...p }) => (
  <Svg className={`flip-rtl ${className}`} {...p}>
    <path d="M20 12H5M10 7l-5 5 5 5" />
  </Svg>
);

export const ChevronIcon = ({ dir = 'end', className = '', ...p }) => (
  <Svg className={`${dir === 'down' ? '' : 'flip-rtl'} ${className}`} {...p}>
    {dir === 'down' && <path d="M7 10l5 5 5-5" />}
    {dir === 'end' && <path d="M10 7l5 5-5 5" />}
    {dir === 'start' && <path d="M14 7l-5 5 5 5" />}
  </Svg>
);

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.2" />
    <path d="M20 20l-4.4-4.4" />
  </Svg>
);

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const MenuIcon = (p) => (
  <Svg {...p}>
    <path d="M4 8h16M4 16h16" />
  </Svg>
);

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="M4 7l8 6 8-6" />
  </Svg>
);

export const LinkedinIcon = (p) => (
  <Svg {...p} strokeWidth="0" fill="currentColor">
    <path d="M5.2 9.2h2.9V19H5.2zM6.65 4.8a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4zM10.2 9.2H13v1.35h.04c.39-.74 1.35-1.52 2.78-1.52 2.97 0 3.52 1.96 3.52 4.5V19h-2.9v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.59V19h-2.9z" />
  </Svg>
);

export const WhatsappIcon = (p) => (
  <Svg {...p}>
    <path d="M4.6 19.4l1.1-3.7a8 8 0 1 1 3 2.8z" />
    <path d="M9.4 8.3c.3-.4.7-.4 1-.3l.8 1.8c.1.3 0 .6-.2.8l-.5.5c.5 1.1 1.4 2 2.5 2.5l.5-.5c.2-.2.5-.3.8-.2l1.8.8c.1.4 0 .8-.4 1-1 .6-2.1.5-3.1-.1-1.5-.9-2.7-2.1-3.6-3.6-.6-1-.6-2.1.1-3z" />
  </Svg>
);

export const ExternalIcon = ({ className = '', ...p }) => (
  <Svg className={`flip-rtl ${className}`} {...p}>
    <path d="M9 5H5.5A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20h12a1.5 1.5 0 0 0 1.5-1.5V15" />
    <path d="M13 4h7v7M20 4l-9 9" />
  </Svg>
);

export const EditIcon = (p) => (
  <Svg {...p}>
    <path d="M4.5 19.5l1-4L15.8 5.2a1.9 1.9 0 012.7 0l.3.3a1.9 1.9 0 010 2.7L8.5 18.5z" />
    <path d="M13.8 7.2l3 3" />
  </Svg>
);

export const BlossomIcon = (p) => (
  <Svg {...p}>
    {[0, 72, 144, 216, 288].map((a) => (
      <path key={a} d="M12 12c-2.2-1.6-2.6-4.6-.9-6.6.4.5.6.9.9 1.3.3-.4.5-.8.9-1.3 1.7 2 1.3 5-.9 6.6z" transform={`rotate(${a} 12 12)`} />
    ))}
  </Svg>
);

export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />
  </Svg>
);
