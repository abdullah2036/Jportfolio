import { usePortfolio } from '../store/PortfolioContext.jsx';
import { pick } from '../i18n/format.js';
import EditableText from './EditableText.jsx';
import { SplitWords } from './SplitText.jsx';
import ImageSlot from './ImageUploader.jsx';
import DuskScene from './DuskScene.jsx';
import Button from './Button.jsx';
import Reveal from './Reveal.jsx';
import { PaperNote, Sprig, Tape } from './Paper.jsx';
import { LinkedinIcon, MailIcon, WhatsappIcon } from './Icons.jsx';
import { useParallax } from '../hooks/useMotion.js';
import { showToast } from './Toast.jsx';
import { useEffect } from 'react';
import { pauseWhenAway } from '../lib/motion.js';

// Contact shortcuts. The values live in src/data/defaultContent.js
// (about.email, about.socials) and can be changed from Edit Mode.
const digitsOnly = (v) => String(v || '').replace(/\D/g, '');
const CONTACTS = [
  ['email', MailIcon, (about) => about.email, (v) => `mailto:${v}`],
  ['linkedin', LinkedinIcon, (about) => about.socials.linkedin, (v) => (/^https?:\/\//.test(v) ? v : `https://${v}`)],
  ['whatsapp', WhatsappIcon, (about) => about.socials.whatsapp, (v) => `https://wa.me/${digitsOnly(v)}`],
];

// 06 — About / Contact: the closing page of the portfolio.
export default function About() {
  const { content, lang, t, editing, actions } = usePortfolio();
  const about = content.site.about;
  const set = (key) => (value) => actions.setSite(['about', key], value);
  const mailto = about.email ? `mailto:${about.email}` : null;
  const collage = useParallax();
  useEffect(() => pauseWhenAway(collage.current), [collage]);

  // Email: many computers have no mail app set up, so "mailto" alone can do
  // nothing. The address is also copied, with a one-click Gmail option.
  const onEmail = () => {
    if (!about.email) return;
    navigator.clipboard?.writeText(about.email).catch(() => {});
    showToast({
      text: t.emailCopied.replace('{email}', about.email),
      action: {
        label: t.openGmail,
        href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(about.email)}`,
      },
    });
  };

  const askLink = (key, current) => {
    const question =
      key === 'email' ? t.emailPrompt : key === 'whatsapp' ? t.whatsappPrompt : `${t.social[key]} — ${t.linkPrompt}`;
    const answer = window.prompt(question, current || '');
    if (answer === null) return;
    const value = key === 'whatsapp' ? digitsOnly(answer) : answer.trim();
    if (key === 'email') actions.setSite(['about', 'email'], value);
    else actions.setSite(['about', 'socials', key], value);
  };

  const links = CONTACTS.map(([key, Icon, read, toUrl]) => {
    const raw = read(about);
    return [key, Icon, raw ? toUrl(raw) : null, raw];
  });

  return (
    <section className="about" id="about" data-nav="about">
      <div className="wrap about__grid">
        <div className="about__text">
          <Reveal>
            <EditableText
              as="h2"
              className="display about__title"
              value={about.eyebrow}
              onChange={set('eyebrow')}
              motion="roll"
            />
          </Reveal>
          <Reveal delay={80} className="about__intro">
            {editing ? (
              <EditableText as="p" multiline className="about__focus" value={about.focus} onChange={set('focus')} />
            ) : (
              <ul className="about__focus" aria-label={t.focusLabel}>
                {pick(about.focus, lang)
                  .split('\n')
                  .filter(Boolean)
                  .map((field, i) => (
                    <li key={i} style={{ '--i': i }}>
                      {field}
                    </li>
                  ))}
              </ul>
            )}
          </Reveal>
          <Reveal delay={120}>
            {editing ? (
              <EditableText as="div" multiline className="about__bio prose" value={about.bio} onChange={set('bio')} />
            ) : (
              <div className="about__bio">
                {pick(about.bio, lang)
                  .split(/\n\s*\n/)
                  .map((para, i) => (
                    <SplitWords key={i} text={para} delay={i * 450} />
                  ))}
              </div>
            )}
          </Reveal>
          <Reveal delay={200} className="about__actions">
            <Button href={mailto || '#/contact'} onClick={mailto ? onEmail : undefined} data-petals="10">
              {t.letsConnect}
            </Button>
            <ul className="about__social" id="contact">
              {links.map(([key, Icon, url, raw]) => (
                <li key={key}>
                  {editing ? (
                    <button
                      type="button"
                      className={`about__icon ${raw ? '' : 'is-unset'}`}
                      onClick={() => askLink(key, raw)}
                      title={t.social[key]}
                    >
                      <Icon size={21} />
                    </button>
                  ) : url ? (
                    <a
                      className="about__icon"
                      href={url}
                      target={key === 'email' ? undefined : '_blank'}
                      rel="noreferrer"
                      aria-label={t.social[key]}
                      onClick={key === 'email' ? onEmail : undefined}
                    >
                      <Icon size={21} />
                    </a>
                  ) : (
                    <span className="about__icon" aria-label={t.social[key]} role="img">
                      <Icon size={21} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="about__visual" delay={150}>
          <div className="about__collage" ref={collage}>
            <div className="about__frame">
              <ImageSlot
                value={about.portrait}
                onChange={set('portrait')}
                fallback={<DuskScene variant="portrait" />}
                alt={pick(content.site.name, lang)}
              />
              <Tape className="about__tape" rotate={7} />
            </div>
            <Sprig className="about__sprig" seed={5} />
            <PaperNote className="about__note" rotate={-3} seed={9}>
              <EditableText as="p" multiline className="about__note-text" value={about.note} onChange={set('note')} />
            </PaperNote>
            <p className="about__thanks">
              <span className="about__thanks-line" aria-hidden="true" />
              <EditableText multiline className="script" value={about.thanks} onChange={set('thanks')} />
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
