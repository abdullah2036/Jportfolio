// The starting template. Every text field is { ar, en }; every image field is
// an image reference (null = empty placeholder). All of it can be edited from
// the site in Edit Mode, so this file only matters for a fresh browser.

const L = (ar, en) => ({ ar, en });

export const CATEGORIES = [
  { id: 'identity', title: L('الهوية البصرية', 'Identity'), cover: null },
  { id: 'campaigns', title: L('الحملات', 'Campaigns'), cover: null },
  { id: 'editorial', title: L('التصميم التحريري', 'Editorial'), cover: null },
  { id: 'events', title: L('الفعاليات والإعلام', 'Events & Media'), cover: null },
  { id: 'independent', title: L('أعمال مستقلة', 'Independent Work'), cover: null },
  { id: 'innovation', title: L('الابتكار والإبداع', 'Innovation & Creativity'), cover: null },
];

const TOPICS = [
  { id: 'science', label: L('العلوم', 'Science') },
  { id: 'culture', label: L('الثقافة', 'Culture') },
  { id: 'student-life', label: L('الحياة الطلابية', 'Student Life') },
  { id: 'sustainability', label: L('الاستدامة', 'Sustainability') },
  { id: 'innovation', label: L('الابتكار', 'Innovation') },
];

// Science Club Times: 24 editions, newest first (Issue 24 — Apr 2024).
const issues = Array.from({ length: 24 }, (_, i) => {
  const n = 24 - i;
  const d = new Date(Date.UTC(2024, 3 - i, 1));
  const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  return {
    id: `sct-${n}`,
    image: null,
    title: L(`العدد ${n}`, `Issue ${n}`),
    date: ym,
    topic: TOPICS[i % TOPICS.length].id,
  };
});

export function blankProject(categoryId, overrides = {}) {
  return {
    id: overrides.id || `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    categoryId,
    layout: 'feature',
    showcase: false,
    title: L('عنوان المشروع', 'Project Title'),
    type: L('نوع المشروع', 'Project Type'),
    year: String(new Date().getFullYear()),
    description: L(
      'مقدّمة قصيرة عن المشروع: الفكرة التي انطلق منها، ولمن صُمّم، وما الذي سعى إلى تغييره.',
      'A short introduction to the project: the idea behind it, who it was for, and what it set out to change.'
    ),
    role: L('إدارة فنية · تصميم · إنتاج', 'Art Direction · Design · Production'),
    image: null,
    supporting: [null, null, null, null],
    // series-only fields (kept when switching layouts)
    subtitle: L('وصف قصير للسلسلة', 'A short series line'),
    note: L('سطرٌ\nقصير\nيلخّص\nالفكرة.', 'A short\nline that\nholds the\nidea.'),
    topics: [],
    unit: 'piece',
    items: [],
    link: '', // for websites and online work
    ...overrides,
  };
}

export const defaultContent = {
  version: 1,
  site: {
    name: L('جنى سقطي', 'Jana Soqati'),
    tagline: L('من الفكرة إلى المعنى', 'From Ideas to Meaning'),
    hero: {
      eyebrow: L('من الفكرة إلى المعنى', 'Ideas to Meaning'),
      title: L('جنى سقطي', 'Jana\nSoqati'),
      script: L('لغد\nأكثر إشراقاً', 'For a\nBrighter\nTomorrow'),
      tags: L('علوم\nإبداع\nناس\nغد ألطف', 'Science\nCreativity\nPeople\nA Kinder Tomorrow'),
      image: null,
    },
    contents: {
      eyebrow: L('تصفّح ملف الأعمال', 'Explore the Portfolio'),
      title: L('فهرس\nالمحتويات', 'Table of\nContents'),
      intro: L(
        'وسائطُ مختلفة، وغايةٌ واحدة. استكشافٌ لنقطة التقاء العلم والإبداع والإعلام والأثر الإنساني.',
        'Different mediums. A common purpose. Exploring the intersection of science, creativity, media, and human impact.'
      ),
      script: L('المعنى يسكن\nما بين السطور.', 'Meaning lives\nin the in-between.'),
    },
    about: {
      eyebrow: L('نبذة عني', 'About Me'),
      title: L('أفكار، وناس،\nوغد ألطف', 'Ideas, People\nand a Kinder\nTomorrow'),
      lead: L(
        'طالبة كيمياء صناعية ومصمّمة، أصنع مرئياتٍ وتجاربَ وأفكاراً مدروسة من أجل غدٍ أكثر معنى.',
        'Industrial Chemistry student & designer creating thoughtful visuals, experiences, and ideas for a more meaningful tomorrow.'
      ),
      focus: L('كيمياء صناعية\nإعلام\nتصميم\nقيادة', 'Industrial Chemistry\nMedia\nDesign\nLeadership'),
      bio: L(
        'أنا جنى — طالبة كيمياء صناعية، شغوفة بالتصميم والإعلام والقيادة. أستمتع بتحويل الأفكار إلى مرئيات واضحة وتجارب منظّمة وأثرٍ ذي معنى.\n\nتجذبني المساحات التي يلتقي فيها العلم بالإبداع، والأعمال التي تُعلِّم وتُلهم وتجمع الناس.',
        "I'm Jana — an industrial chemistry student with a strong interest in design, media, and leadership. I enjoy turning ideas into clear visuals, organized experiences, and meaningful impact.\n\nI'm drawn to the spaces where science meets creativity — and to work that informs, inspires, and brings people together."
      ),
      note: L('أفكار\nطيّبة،\nوناس\nأجمل', 'Good\nIdeas\nBrighter\nPeople'),
      thanks: L('شكراً\nلوجودك هنا.', 'Thank you\nfor being here.'),
      portrait: null,
      // ▼ CONTACT — replace these three placeholders with the real details
      //   (or click each icon in Edit Mode to change them from the site)
      email: 'janahani1425@gmail.com', //  her email address
      socials: {
        linkedin: 'https://www.linkedin.com/in/jana-soqati-755734297', //  her LinkedIn profile URL
        whatsapp: '966532245549', //  WhatsApp number, country code first, digits only
      },
    },
  },
  categories: CATEGORIES,
  projects: [
    blankProject('identity', {
      id: 'identity-1',
      type: L('هوية بصرية', 'Visual Identity'),
      role: L('إدارة فنية · تصميم الشعار · دليل الهوية', 'Art Direction · Logo Design · Guidelines'),
    }),
    blankProject('campaigns', {
      id: 'cleaner-brighter-tomorrow',
      showcase: true,
      title: L('غد أنظف وأكثر إشراقاً', 'A Cleaner Brighter Tomorrow'),
      type: L('حملة بصرية', 'Brand Campaign'),
      year: '2024',
      description: L(
        'حملة بصرية تشجّع على الخيارات المستدامة بلغةٍ ناعمة ومتفائلة تضع الإنسان في المركز؛ تمزج الطبيعة بالحرف وباللحظات الحقيقية لتُلهم مستقبلاً أنظف وأكثر إشراقاً.',
        'A visual campaign promoting sustainable choices through a soft, optimistic, and human-centered lens. Blending nature, typography, and real moments to inspire a cleaner, brighter future.'
      ),
      role: L('إدارة فنية · تصميم بصري · مواد الحملة', 'Art Direction · Visual Design · Campaign Assets'),
    }),
    blankProject('editorial', {
      id: 'science-club-times',
      layout: 'series',
      showcase: true,
      title: L('صحيفة نادي العلوم', 'Science Club Times'),
      type: L('سلسلة تحريرية', 'Editorial Series'),
      year: '2022–2024',
      subtitle: L('إصدار طلابي', 'A Student Publication'),
      description: L(
        'سلسلة تحريرية ممتدّة تستكشف العلم والمجتمع والحياة الطلابية. من اكتشافات البحث العلمي إلى القصص الإنسانية، يحوّل كل إصدار الأفكار المعقّدة إلى مرئيات واضحة وجاذبة.',
        'A long-form editorial series exploring science, society, and student life. From research breakthroughs to human stories, each edition brings complex ideas into clear, engaging visuals.'
      ),
      role: L('رئاسة التحرير الفني · التصميم · الإخراج', 'Art Editor · Design · Layout'),
      note: L('فضول\nاليوم،\nوغد\nألطف.','Curiosity\ntoday.\nA kinder\ntomorrow.'),
      topics: TOPICS,
      unit: 'edition',
      items: issues,
    }),
    blankProject('events', {
      id: 'events-1',
      type: L('تغطية فعالية', 'Event & Media'),
      role: L('تصوير · تصميم · محتوى رقمي', 'Photography · Design · Digital Content'),
    }),
    blankProject('independent', {
      id: 'independent-1',
      type: L('مشروع شخصي', 'Personal Project'),
      role: L('فكرة · تصميم · تنفيذ', 'Concept · Design · Execution'),
    }),
    blankProject('innovation', {
      id: 'eloria-story',
      showcase: true,
      title: L('إلوريا ستوري', 'Eloria Story'),
      type: L('منصة رقمية', 'Digital Platform'),
      year: '2025',
      description: L(
        'منصة رقمية لكاتبة عربية تنشر فيها رواياتها وتديرها: مكتبة، واقتباسات، وتنبيهات بالفصول الجديدة، بهوية أدبية هادئة تحت شعار «حكايات تُكتب لتبقى».',
        'A digital home for an Arabic author to publish and manage her novels: a library, quotes and new-chapter alerts, in a calm literary identity under the line "Stories written to endure."'
      ),
      role: L('فكرة · تصميم تجربة المستخدم · هوية بصرية', 'Concept · UX Design · Visual Identity'),
      // a live website: shown as a preview, with a "Visit the Site" button
      link: 'https://abdullah2036.github.io/eloriaprojectV2/',
    }),
  ],
};
