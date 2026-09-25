# Jana Soqati — Portfolio

A designer portfolio in an editorial, printed-page style: cover, About Me,
table of contents, project chapters, and a separate archive for large series.
Arabic is the default language (right-to-left); English is one click away.

## Run it

```bash
npm install
npm run dev        # http://localhost:5178
npm run build      # production files in dist/
```

The `dist/` folder is a static site. No server code is needed.

## Hosting (GitHub Pages)

The site is live at **https://abdullah2036.github.io/Jportfolio/**.

Every push to `main` rebuilds it automatically (`.github/workflows/deploy.yml` builds the
site and publishes `dist/` to the `gh-pages` branch). The update is live about a
minute later. You can follow each run in the repository's **Actions** tab.

```bash
git add -A
git commit -m "Describe the change"
git push
```

If Pages is ever switched off, turn it back on in the repository under
**Settings → Pages → Source: Deploy from a branch → `gh-pages` / `(root)`**.

## Adding your work (Edit Mode)

Open Edit Mode from **"تحرير / Edit"** in the footer, or add `?edit` to the
address (for example `http://localhost:5178/?edit`). It asks for a password:

- The password is `editPassword` in `src/config.js` (starts as `jana2026`). Change it there.
- Once entered, it stays unlocked until that browser tab is closed.
- This is a light lock to keep visitors out of the edit tools. The site has no
  server, so it is not real security. That's fine: edits only ever live in the
  browser that made them, so nobody else can change the published site.

In Edit Mode:

- Every image area shows **+ إضافة صورة**. Click it or drop an image on it.
  Filled images show **استبدال / حذف** (Replace / Remove).
- Click any text to edit it. Arabic and English are stored separately. Switch
  the language in the header to edit the other one.
- On a project page, the settings row lets you switch the layout (**single project**
  or **series**), move the project to another chapter, choose what it counts
  (editions, posters…), show it on the home page, add a new project, or delete it.
- In the archive (**عرض الأرشيف / View Archive**, or **عرض المشروع كاملاً / View Full Project**)
  use **+ إضافة صور** to add many images at once, then set each piece's title,
  month and topic, reorder it, or remove it.
- Contact icons in the About section ask for the email, LinkedIn link and WhatsApp number.
- For a website project (like Eloria Story), paste its address into **رابط الموقع / Website link**
  in the project's settings row. The project then shows a live preview of the site and a
  **زيارة الموقع / Visit the Site** button. Uploading a main image replaces the preview.

## Contact details (placeholders to fill in)

In `src/data/defaultContent.js`, in the `about` section, marked `▼ CONTACT`:

| Field                | What to put                                         | The link it makes                  |
| -------------------- | --------------------------------------------------- | ---------------------------------- |
| `email`              | her email address                                   | `mailto:…` (also the لنتواصل button) |
| `socials.linkedin`   | her full LinkedIn profile URL                       | opens LinkedIn                     |
| `socials.whatsapp`   | WhatsApp number, country code first, digits only (e.g. `9665…`) | `https://wa.me/…` opens a chat |

These are the starting values. Anything changed in Edit Mode (click an icon) overrides them.

Changes save automatically in **this browser only** (images in IndexedDB, text
in localStorage). Nobody else sees them until you publish.

## Publishing: deploy first, then add the work

You can deploy right away. Visitors see the template until real content is published,
and deploying early lets you check the site on a real phone.

1. **Deploy now.** Push to `main` (see Hosting above). It works from a sub-folder
   as-is, because paths are relative and pages use `#/` links.
2. **Add the work.** Open the site with `?edit`, enter the password, and upload images
   and edit text. This can be on the live site or locally with `npm run dev`.
   - Edits are saved in that browser only.
   - They don't carry over between `localhost` and the live address, or between computers.
   - Use **Export / Import** to move them.
3. **Publish the work.** In Edit Mode, click **تصدير / Export** to download `portfolio.json`
   (every image is inside it). Put it at `public/content/portfolio.json`, then commit and
   push. Visitors now see the real portfolio.

Repeat step 3 whenever the content changes. To edit on another computer, use
**استيراد / Import** with the same file.

For very large archives (hundreds of images), a real backend or image host is the
better long-term home. Only `src/store/imageStore.js` needs to change. It
receives a file and returns a URL, and the rest of the site already accepts plain URLs.

## Language & fonts

- Default language, Arabic digits (٠١٢ vs 012), the footer edit link and the petals are in `src/config.js`.
- The line in the header bar (**حيث تزهر الأفكار الهادفة / Where Meaningful Ideas Bloom**) is
  `site.brand` in `src/data/defaultContent.js`. The name itself stays on the cover, in the
  browser tab title and in the footer.
- `?lang=en` or `?lang=ar` in the address opens that language (useful for sharing).
- **Thmanyah (ثمانية)** from https://font.thmanyah.com (free for personal and commercial use)
  is self-hosted in `public/fonts/thmanyah/`: Serif Display for headings, Serif Text
  for reading text, and Sans for labels. The `@font-face` rules are in `src/styles/fonts.css`.
- English uses Noto Serif Display, Newsreader, Jost and Ms Madi (Google Fonts). Arabic
  handwritten accents use Aref Ruqaa.
- All colours, fonts and spacing are variables in `src/styles/tokens.css`.

## Motion

Everything that moves is in `src/styles/motion.css`, `src/components/AmbientPetals.jsx`
and `src/lib/motion.js`.

- **Petals and leaves** drift across the page. They move away from the cursor, react
  to scrolling, and a few fall loose when you click a button, the logo or the cover image.
  Change how many there are with `ambient.density` in `src/config.js`, or turn them off
  with `ambient.petals: false`. Visitors can pause them from the footer.
- **The cover** is layered: clouds drift, the sun glows, the water shimmers, the branches
  sway, and the layers shift in depth as the mouse moves. The name rises in, and the
  handwritten line writes itself.
- **Scrolling**: headings rise out of a soft blur, text columns arrive line by line,
  images unveil and drift in parallax, notes and sprigs sway, and the About polaroid
  settles into place. A hairline under the header shows reading progress, and the nav
  highlights the section you're in.
- **Hover & click**: a "View / عرض" seal follows the cursor over artwork, chapter cards
  tilt toward the cursor, buttons lean toward it and catch a sheen, the viewer grows
  images out of their thumbnail, and moving between pages turns the page.
- **From the client's reference shots** (`src/styles/motion-refs.css`):
  - A preloader, once per visit (add `?intro` to the address to replay it): a blossom
    gathers petal by petal, then scatters into the falling petals as the paper lifts.
    After it, the cover plays in and the header items drop in one by one.
  - Titles roll up out of a mask, and descriptions un-blur word by word.
  - Chapter cards are sorted onto the page from a stack every time the contents come into
    view, and project and edition counts count up.
  - Between About Me and the contents, a window in the page opens out smoothly when it
    comes into view, showing the cover's scene behind the page (it uses the cover photo
    once one is uploaded). The scene stays put while the page glides over it.
  - List rows fill with a burgundy wipe on hover, and a hairline slides under the menu.
  - The series topics light up in turn as you scroll past the artwork, which opens
    out from a card. Once images are tagged with topics, the artwork swaps to match.
  - The cover image stays fixed behind the page as you scroll (like the banner), so it
    glides without any jitter, and the header condenses.
  - The cover's words (علوم · إبداع · ناس · غد ألطف) run across the image like a news
    ticker, and pause while the pointer rests on them. Edit them in Edit Mode.
  - A project's four supporting images sit in a gallery set apart at its foot, and widen
    on hover (accordion). On the home page only the last project shows its gallery; every
    project's own page shows it. Archive pieces arc in.
- **On phones** the mouse effects have touch versions:
  - The cover scene tilts with the phone where the browser allows it, and drifts slowly on its own otherwise.
  - Chapter cards lean as they scroll past, and the gallery images become a swipeable strip.
  - Buttons ripple where they are tapped, and list rows fill while pressed.
  - Tapping the name makes it ripple, and a tap on the paper lets a couple of petals fall.
- Devices set to **reduce motion** get a calm, still version automatically.

## Where things are

| Part of the page            | Component                          | Styles                     |
| --------------------------- | ---------------------------------- | -------------------------- |
| Header, language, search    | `Header`, `LanguageSwitcher`, `SearchOverlay` | `header.css`    |
| 01 Cover                    | `Hero`, `DuskScene`                | `hero.css`                 |
| About Me (after the cover)  | `About`                            | `about.css`                |
| Banner behind the page      | `Vista`                            | `motion-refs.css`          |
| 02 Table of Contents        | `TableOfContents`                  | `contents.css`             |
| 03 Single project           | `ProjectFeature`, `ProjectBar`     | `project.css`              |
| 04 Series / collection      | `ProjectSeries`                    | `project.css`              |
| 05 Archive + image viewer   | `Archive`, `Lightbox`              | `archive.css`              |
| Website preview             | `SitePreview`                      | `project.css`              |
| Edit password card          | `EditLock`                         | `edit.css`                 |
| Image placeholders & upload | `ImageUploader` (`ImageSlot`)      | `base.css`, `edit.css`     |
| Editing tools               | `EditableText`, `ProjectEditor`, `EditBar` | `edit.css`         |
| Content template            | `src/data/defaultContent.js`       |                            |
| Arabic sizing               |                                    | `arabic.css`               |
| Motion & petals             | `AmbientPetals`, `CursorBadge`, `SplitText`, `Parallax` | `motion.css` |
