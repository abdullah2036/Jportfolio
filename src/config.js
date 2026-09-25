// Site-wide switches. Everything visual lives in src/styles/tokens.css.
export const CONFIG = {
  defaultLang: 'ar',
  // Arabic-Indic digits (٠١٢٣) in the Arabic version. Set to false for 0123.
  arabicDigits: true,
  // Shows the small "Edit portfolio" link in the footer. You can always open
  // edit mode by adding ?edit to the address, e.g. https://site.com/?edit
  showEditEntry: true,
  // ▼ EDIT PASSWORD — change it here. A light lock that keeps visitors out of
  //   the edit tools; it is not bank-grade security (the site has no server).
  editPassword: 'jana2026',
  unlockKey: 'jana-portfolio/unlocked',
  storageKey: 'jana-portfolio/content/v1',
  langKey: 'jana-portfolio/lang',
  petalsKey: 'jana-portfolio/petals',
  // Drifting petals & leaves. density: 1 = default, 0.5 = fewer, 1.5 = more.
  // Visitors can pause them from the footer; reduced-motion devices never see them.
  ambient: { petals: true, density: 1.05 },
  // Optional published content (exported from edit mode) placed in /public/content/.
  bakedContentUrl: 'content/portfolio.json',
  // Uploaded images are resized to this long edge before they are stored.
  maxImageEdge: 2400,
  imageQuality: 0.88,
};
