/**
 * PAUSE STUDIO site copy (English) — pairs one to one with ko.ts. index.ts checks that every export has the same shape,
 * so a missing item breaks the build instead of showing Korean on the English page.
 * Style rules (same as ko.ts): no dashes, hyphens, asterisks or reference marks in on screen text. A '\n' inside a sentence is a deliberate line break.
 * Audience (2026-10-22): the Korean page speaks to Korean businesses; the English page speaks to any business in NZ and the US,
 * written so it reads naturally to a native speaker. Working in English and Korean stays as a strength, not as the target.
 * Notes for the owner to confirm are listed in docs/EN_PLAN.md.
 */
import type { CompareCase, FilmSample, Plan, VideoPlan, WorkItem, Faq, Txt } from './ko';
import * as ko from './ko';

export { byCur, currencySymbol } from './ko';
export type { Cur, Txt } from './ko';
export { contact } from './ko';

export const meta = {
  lang: 'en',
  locale: 'en_US', altLocale: 'ko_KR', path: '/en', altPath: '/', altLang: 'ko',
  title: 'PAUSE Studio | Custom Website Design & AI Video Ads in New Zealand & the US',
  description:
    'Custom websites and AI video ads, built personally by the founder. Pay once for the build, with a $0 basic monthly fee. Based in Auckland, working with businesses across New Zealand and the United States.',
  keywords: 'PAUSE Studio, pausestudio, pause8studio, branding studio, web design agency, custom website design, business website design, web design Auckland, web design New Zealand, web design Los Angeles, web design New York, website with no monthly fee, responsive website, ecommerce website, booking website, AI video ads, AI commercial video production, short form video ads, Reels ad production, bilingual website design, Korean English website',
  canonical: 'https://pause8studio.com/en',
  siteName: 'PAUSE Studio',
  ogTitle: 'PAUSE Studio | Website Design & AI Video Ads',
  ogDescription: 'Custom websites built personally by the founder, and AI video ads made from the photos you already have. Pay once, with a $0 basic monthly fee.',
  ogImage: 'https://pause8studio.com/og-en-20261022.jpg',
  ogImageAlt: 'Pause Studio logo with the words: Look the part. Get chosen. Custom websites and AI video ads',
  aboutEn: 'PAUSE Studio is a branding studio based in Auckland, building custom websites and AI video ads for businesses across New Zealand and the United States. We work in English and Korean.',
  googleSiteVerification: 'YRTNSno7nYptgfm08ZthTl09DUbhS9NT6hKgg9iOQ4U',
};

export const nav = [
  { href: '#work', label: 'Portfolio' },
  { href: '#website', label: 'Website design' },
  { href: '#video', label: 'AI video ads' },
  { href: '#faq', label: 'FAQ' },
];

export const cta = {
  header: 'Contact',
  consult: 'Free consultation',
  kakao: 'Chat on KakaoTalk',
  free: 'Free consultation',
};

export const ui = {
  skip: 'Skip to main content', home: 'Back to the top of PAUSE Studio', navMain: 'Main menu', navMobile: 'Mobile menu', menu: 'Menu', menuClose: 'Close menu',
  newWindow: '(opens in a new window)', servicesAria: 'Services', openChat: 'KakaoTalk open chat', openChatGo: 'Message us on open chat',
  lightbox: 'View work larger', lbClose: 'Close', lbPrev: 'Previous work', lbNext: 'Next work',
  workOpen: 'View {ref} {cat} larger', workShot: '{ref} {cat} website screen', workVideo: '{ref} {cat} website screen recording',
  signAria: 'PAUSE STUDIO founder signature', sampleTabs: 'Sample ads', compareVideo: '{label} · screen recording of a real site built by PAUSE',
  faqTabs: 'Question categories', faqCount: '{n} questions', qrAlt: '{label}: KakaoTalk ID {id}',
  honeypot: 'Company website (leave blank)', progress: 'Progress', askType: 'What kind of consultation do you need?', typeAria: 'Consultation type', confirm: 'Please review what you are sending', sentFrom: 'Sent from',
  videoPause: 'Pause video', videoPlay: 'Play video', switchLang: 'Language', switchTo: '한국어', autoNote: "You're viewing the English site.",
};

// Hero (2026-10-22, chosen by the owner): eyebrow hook + a short two line title. The mobile third line is empty on purpose
export const hero = {
  eyebrow: 'First impressions take 50 milliseconds.',
  titleLines: ['Look the part.', 'Get chosen.'],
  titleLinesMobile: ['Look the part.', 'Get chosen.', ''],
  sub: ['From websites to AI video ads,', 'we shape how customers see your brand.'],
  services: [
    { index: '01', name: 'Website design', lead: 'Pay once, $0 basic monthly fee', desc: 'Maintenance and hosting included free', href: '#website' },
    { index: '02', name: 'AI video ads', lead: 'No shoot needed, just the photos you have', desc: 'Landscape and vertical versions, both included', href: '#video' },
  ],
};

const cat = [
  'Travel and study abroad agency', 'Homemade cakes', 'Korean restaurant', 'Auckland local travel agency', 'Fast food franchise', 'Fast food franchise',
  'Hospice', 'Contemporary tattoo studio', 'Hair salon', 'Health supplements', 'Taxi booking and dispatch platform', 'Travel agency', 'Travel agency',
  'Toss fintech partner app', 'Toss fintech partner app', 'Toss fintech partner app', 'Refrigeration and freezing equipment',
];
export const work = {
  eyebrow: 'PORTFOLIO',
  title: ['Real websites', "we've built."],
  lead: 'Every screen here comes from a live client site. Click any of them to see it up close.',
  view: 'View',
  items: ko.work.items.map((it, i): WorkItem => ({ ...it, category: cat[i] })),
  next: { kicker: 'NEXT PROJECT', title: 'Your brand could be\nour next project.' },
};

export const why = {
  eyebrow: 'PHILOSOPHY & VALUE',
  title: 'WHY PAUSE?',
  letter: [
    'Hand your site to a big agency and it becomes one project among many. Here, I build it myself, from start to finish. No rotating account managers, and no outsourcing.',
    'You pay for the build once. After that, there is no basic monthly fee to PAUSE Studio.',
    "That doesn't mean you're on your own once you've paid. Quite the opposite. If a feature we built stops working or the server has a problem, I fix it myself at no extra cost. I charge for the build once, but I look after your site like it's my own.",
  ],
  signatureLabel: 'PAUSE STUDIO Founder',
  pillars: [
    { title: 'Custom brand design', desc: "We don't use templates. Every screen is designed from scratch around your brand's look and personality." },
    { title: '$0 basic monthly fee', desc: 'There is no monthly fee to PAUSE Studio after launch. Maintenance and hosting are included free on every plan.' },
    { title: 'Built by the founder', desc: 'From the first call through design, development and final review, the founder is personally involved. No rotating account managers, no outsourcing.' },
    { title: 'A site you can manage', desc: 'If you can post on Instagram, you can update your site. Edit the text, images, products and prices you have access to.' },
    { title: 'Clear ownership', desc: 'Your domain is registered in your name wherever possible, and your content, data and contracted deliverables are clearly yours.' },
    { title: 'Website and video ads in one place', desc: 'Your website and AI video ads share one brand direction. No need to juggle separate vendors.' },
  ],
};

export const who = {
  eyebrow: 'FOR YOU',
  title: ['Made for', 'owners like you'],
  lead: 'For owners who want to cut fixed monthly costs and show what their brand is really worth.',
  items: [
    'You see your website as the first impression that decides whether people trust your brand',
    "You're tired of paying every year for management, upkeep and hosting",
    'You want a design that is truly yours, not a template',
    'You need a site that works beautifully in more than one language',
    "You're looking for a partner for the long run",
    'You want to turn the photos you already have into video ads',
  ],
};

export const chapters = {
  website: { index: 'CHAPTER 01', word: 'WEBSITE', ko: 'Website design', lead: "Zero management and maintenance fees. A model you won't find anywhere else.\nFrom the first screen to the button that brings in the inquiry,\nwe design every part around your brand.", em: 'Zero management and maintenance fees' },
  video: { index: 'CHAPTER 02', word: 'AI VIDEO AD', ko: 'AI video ads', lead: 'No shoot needed, just the photos you already have.\nFrom concept to editing and sound, we deliver a finished ad.', em: 'just the photos you already have' },
};

export const currencyChip: Txt = { NZD: 'Prices in NZD', USD: 'Prices in USD' };

const compareLabels = ['Travel and study abroad agency', 'Homemade cakes'];
export const compare = {
  eyebrow: 'BEFORE / AFTER',
  title: ['Template', 'Tailored'],
  lead: 'The same content can feel worlds apart depending on how it is presented.\nDrag the handle in the middle to compare.',
  before: 'BEFORE',
  beforeSub: 'The same site on a generic template',
  after: 'AFTER',
  afterSub: 'The real site, built by PAUSE',
  handle: 'Compare position',
  cases: ko.compare.cases.map((c, i): CompareCase => ({ ...c, label: compareLabels[i] })),
};

export const plans = {
  starter: {
    name: 'STARTER', ko: 'Basic', price: '1,990',
    target: 'For brands that need a custom site to introduce the business and turn visitors into inquiries',
    features: ['Up to 5 pages', 'Responsive design (mobile optimized)', 'Custom brand design', 'Core pages such as About, Services and Location', 'Contact form with email delivery', 'Basic SEO setup', 'SSL security certificate'],
  },
  business: {
    name: 'BUSINESS', ko: 'Business', price: '4,490', suffix: 'and up',
    target: 'For businesses that want products, inventory, bookings, orders and online payments in one place, so service and sales run smoothly',
    only: ['Up to 10 pages', 'Product and inventory management', 'Bookings, orders and online payments', 'Customer management (order history, members)'],
    base: ['Responsive design (mobile optimized)', 'Custom brand design', 'Contact form with email delivery', 'Basic SEO setup', 'SSL security certificate'],
  },
  enterprise: {
    name: 'ENTERPRISE', ko: 'Corporate', price: 'Custom quote',
    target: 'For companies with complex operations that need AI workflow automation, system integrations and other advanced features, built to order',
    only: ['Custom page structure (unlimited if needed)', 'AI workflow automation', 'Member and customer data management', 'System integrations (ERP, POS, CRM and more)', 'Custom feature development'],
    base: ['Responsive design (mobile optimized)', 'Custom brand design', 'Contact form with email delivery', 'Advanced SEO setup', 'SSL security certificate'],
  },
};
const P = plans;

export const consultPreset: Record<string, { type: string; field?: string; value?: string }> = {
  starter: { type: 'Website design', field: 'product', value: 'STARTER · Basic' },
  business: { type: 'Website design', field: 'product', value: 'BUSINESS · Business' },
  enterprise: { type: 'AI automation & custom development' },
  short: { type: 'AI video ads', field: 'videoProduct', value: 'AI SHORT AD · 15 sec' },
  brand: { type: 'AI video ads', field: 'videoProduct', value: 'AI BRAND AD · 30 sec' },
  hero: { type: 'AI video ads', field: 'videoProduct', value: 'AI HERO FILM · 60 sec' },
  monthly: { type: 'AI video ads', field: 'videoProduct', value: 'MONTHLY CREATIVE · 4 per month' },
  video: { type: 'AI video ads' },
};

export const pricing = {
  eyebrow: 'PRICING',
  title: 'Website pricing',
  banner: ['Make your brand stand out.', 'Without the monthly fees.'],
  cut: ['monthly fees', ''] as [string, string],
  bannerLead: 'A website built around your brand and your business goals.\nStrategy, design and development, all under one roof.',
  targetLabel: 'Best for',
  baseLabel: 'Included',
  plans: [
    { key: 'starter', name: P.starter.name, type: P.starter.ko, price: P.starter.price, target: P.starter.target, addsTitle: "What's included", adds: P.starter.features },
    { key: 'business', name: P.business.name, type: P.business.ko, price: P.business.price, suffix: P.business.suffix, target: P.business.target, featured: true, addsTitle: 'Only in BUSINESS', adds: P.business.only, base: P.business.base },
    { key: 'enterprise', name: P.enterprise.name, type: P.enterprise.ko, price: P.enterprise.price, target: P.enterprise.target, addsTitle: 'Only in ENTERPRISE', adds: P.enterprise.only, base: P.enterprise.base },
  ] as Plan[],
  featuredBadge: 'Bookings and payments',
  freeTitle: ['Included free', 'with every plan'],
  free: [
    { title: 'Free maintenance', note: 'Keeps contracted features working' },
    { title: 'Free management', note: 'No monthly management fee' },
    { title: 'Free web hosting', note: "We'll only talk if traffic grows far beyond normal" },
  ],
  notesTitle: 'Notes',
  notes: [
    { NZD: 'Prices above are in New Zealand dollars (NZD). Your contract currency is based on where your business is located, and we confirm the currency and total on your quote before anything else.', USD: 'Prices above are in US dollars (USD). Your contract currency is based on where your business is located, and we confirm the currency and total on your quote before anything else.' },
    'Extra pages, custom features and outside system integrations may be quoted separately.',
    'Timelines depend on project size, and usually run 2 to 6 weeks.',
    'Hosting is free by default. We only discuss a different hosting setup and extra cost if traffic and server usage go far beyond the free allowance.',
    "After a detailed consultation, we'll recommend the best setup for your business.",
    'Outside costs such as your domain are separate.',
  ] as Txt[],
};

export const fee = {
  eyebrow: 'MONTHLY FEE',
  title: ['PAUSE Studio', 'Monthly fee: $0'],
  cut: 'Monthly fee',
  lead: "Once your site is built, there is no monthly fee to PAUSE Studio.\nHere's exactly what's free, and when costs can come up.",
  freeTitle: 'Included free',
  free: ['Website maintenance', 'Website management', 'Web hosting', 'Server troubleshooting', 'Help with the admin tools'],
  extraTitle: 'Separate, only if needed',
  extra: [
    { title: 'Domain', desc: 'Registration and renewal costs' },
    { title: 'Outside service fees', desc: 'Card processing fees, paid platforms and APIs, extra servers' },
    { title: 'New work', desc: 'New pages and features, major design changes or a full redesign' },
    { title: 'Content updates', desc: 'If you want us to keep posting text and photos for you' },
  ],
  notes: [
    "Fixing existing features and building new ones are different jobs.\nIf there's an extra cost, we always agree on it first.",
    'Hosting is free for normal website use.\nUnlimited traffic, unlimited storage and 24/7 emergency support are not included.',
  ],
  calc: {
    title: 'Compare your total cost',
    lead: 'Enter a quote from another agency.\nThe longer the period, the bigger the gap.',
    otherLabel: 'Other agency',
    inputHint: 'Enter yours',
    placeholder: 'Enter amount',
    pauseLabel: 'PAUSE Studio',
    setupLabel: 'Setup fee',
    monthlyLabel: 'Monthly fee (maintenance included)',
    defaults: { setup: 500, monthly: 150, years: 5 },
    yearsLabel: 'Period',
    totalLabel: 'total cost',
    saveLabel: 'You save with PAUSE Studio',
    unit: ' years',
    unitOne: ' year',
    planLabel: 'Choose a plan',
    plans: [
      { key: 'starter', label: 'STARTER', price: 1990 },
      { key: 'business', label: 'BUSINESS', price: 4490, suffix: 'and up' },
    ] as { key: string; label: string; price: number; suffix?: string }[],
    vs: 'VS',
    note: 'The PAUSE Studio side uses the price of the plan you choose, and BUSINESS is a starting price. Outside costs such as a domain apply to both sides, so they are left out.',
  },
  ledger: {
    head: ['PAUSE STUDIO', 'BASIC MONTHLY FEE'],
    months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    totalLabel: '1 year total',
    aria: 'PAUSE Studio basic monthly fee: $0 every month from January to December, $0 for the year',
    from: 100,
    capFrom: 'Other agencies charge',
    capTo: 'PAUSE Studio instead',
  },
};

export const process = {
  eyebrow: 'PROCESS',
  title: ['From vision', 'to reality'],
  subtitle: 'How we build your website',
  steps: [
    { id: '01', title: '1:1 consultation and planning', highlight: 'Finding what matters most', desc: 'We start with a conversation to understand your business in depth and pin down what you need most.' },
    { id: '02', title: 'Clear, secure payment', highlight: 'Paid upfront', desc: 'Once the scope and quote are confirmed, you pay the build fee upfront and we get started right away.' },
    { id: '03', title: 'Custom design and development', highlight: 'Built from scratch', desc: "We bring your brand's look and strengths into every screen and every line of code." },
    { id: '04', title: 'Careful review and feedback', highlight: 'Two rounds of design revisions', desc: 'We refine every detail together. Production errors or missing contracted features are fixed no matter how many rounds it takes.' },
    { id: '05', title: 'Handover and launch', highlight: '$0 basic monthly fee', desc: "We hand over admin tools you can edit with, along with organized contract materials. After that, there's no monthly fee." },
  ],
};

export const film = {
  eyebrow: 'SAMPLE WORKS',
  title: ['One ordinary photo', 'becomes an ad.'],
  lead: "Here's what happens to the everyday photos you send us.\nBoth are sample ads, planned and produced by PAUSE.",
  before: 'BEFORE',
  beforeSub: 'The photo you send us',
  after: 'AFTER',
  samples: [
    { ...ko.film.samples[0], industry: 'Pause Studio cream', type: 'UGC video ad', beforeAlt: 'Photo of a pink cream jar', videoLabel: 'In a bedroom, a woman shows a pink Pause Studio cream jar to the camera, scoops the gel cream with her fingers, spreads it and applies it to her cheek' },
    { ...ko.film.samples[1], industry: 'Skincare shop', type: 'UGC video ad', beforeAlt: 'Photo of a dropper bottle on an office desk, taken with a phone', videoLabel: 'In a sunset glow room, a woman holding a SOOM serum bottle tucks her hair behind her ear, taps the label with her nail, then looks into the lens and smiles' },
  ] as FilmSample[],
  play: 'Play',
  pause: 'Pause',
};

export const videoPricing = {
  eyebrow: 'PRICING',
  title: 'AI video ad pricing',
  heading: ['From concept to final cut,', 'we deliver ads ready to run.'],
  frame: ['ready to run', '.'] as [string, string],
  lead: 'We get to know your business and product, plan the concept and message, then combine AI generation with professional editing to make an ad you can actually use.',
  formats: {
    kicker: 'Included in every video plan',
    title: 'Landscape and vertical,\nat no extra cost.',
    desc: "We rebuild each ad for each screen. We don't just crop it; we adjust the layout and caption placement so key subjects and text never get cut off.",
    items: [
      { ratio: '16:9', name: 'Landscape', size: '1920 × 1080', use: 'Website, YouTube, landscape ads' },
      { ratio: '9:16', name: 'Vertical', size: '1080 × 1920', use: 'Reels, TikTok, Shorts, Stories' },
    ],
  },
  plans: [
    {
      key: 'short', name: 'AI SHORT AD', price: '490',
      tagline: "Your brand's core message in 15 seconds",
      desc: 'A short video for social ads and product or service promotion. Includes planning, AI production and editing.',
      specs: [['Length', 'Up to 15 sec'], ['Format', 'Landscape and vertical (2)'], ['Cutdown', 'None'], ['Revisions', '1 round'], ['Deliverables', '2 MP4 files']],
    },
    {
      key: 'brand', name: 'AI BRAND AD', price: '890', featured: true, badge: 'Flagship',
      tagline: 'A polished 30 second ad for your brand message',
      desc: 'A fully planned ad for brands, products and services. From storyboard to sound, with a 15 second cutdown included.',
      specs: [['Length', 'Up to 30 sec'], ['Format', 'Landscape and vertical (2)'], ['Cutdown', 'One 15 sec cut'], ['Revisions', '2 rounds'], ['Deliverables', '3 MP4 files']],
    },
    {
      key: 'hero', name: 'AI HERO FILM', price: '1,490', suffix: 'and up',
      tagline: 'A premium AI film that captures your brand',
      desc: 'For homepage heroes, brand introductions and product launches. Includes brand concept planning, color grading and sound.',
      specs: [['Length', 'Up to 60 sec'], ['Format', 'Landscape and vertical (2)'], ['Cutdown', 'One 30 sec cut'], ['Revisions', '2 rounds'], ['Deliverables', '3 MP4 files']],
    },
  ] as VideoPlan[],
  includedTitle: 'Included in all three',
  included: ['Ad concept, copy and script', 'AI image and video generation, scene editing', 'Color, music and sound editing', 'AI voiceover and captions as needed', 'Logo and call to action', 'Full HD MP4 delivery', 'Commercial use rights within the contracted scope'],
  monthly: {
    key: 'monthly', name: 'MONTHLY CREATIVE', price: '2,490', suffix: '/mo', label: 'Optional monthly service',
    tagline: 'A steady flow of video ads, at a fixed monthly price',
    desc: "Four AI video ads a month for one brand. It's separate from your website (still a $0 monthly fee): an optional video service you choose only if you want it.",
    specs: ['4 videos a month, up to 30 sec each', 'Landscape and vertical for every video (8 MP4 files a month)', '1 round of revisions per video', 'Prepaid monthly, no minimum term'],
    note: 'Let us know before your next payment, and production stops after that. Unused videos do not roll over.',
  },
  revisions: "One round of revisions covers all the feedback you collect in a single review. Landscape and vertical are revised together, so it doesn't count twice, and mistakes on our side are fixed regardless of the count.",
  addons: {
    title: 'Optional extras',
    toggle: 'See pricing for extras',
    note: 'Landscape and vertical versions are always included at no extra charge. For complex work, we quote before the contract.',
    rows: [
      ['Extra 1:1 or 4:5 version', '90', '/format'],
      ['Clean version without captions', '50', 'and up'],
      ['Alternate opening from existing scenes', '150', 'and up'],
      ['Alternate opening with new scenes', '250', 'and up'],
      ['Extra cutdown from an existing video', '150', 'and up'],
      ['Additional language version', '150', 'and up'],
      ['Extra revision round, AI SHORT AD', '100', ''],
      ['Extra revision round, AI BRAND AD and HERO FILM', '150', ''],
      ['4K upscale', '120', 'and up'],
      ['Complex product or character consistency', '250', 'and up'],
      ['48 hour rush (when available)', '+30% of production fee', ''],
      ['Complex lip sync or regenerating scenes per language', 'Custom quote', ''],
      ['Full rework for each language and market', 'Custom quote', ''],
      ['Voice actors, live shoots, complex new scenes', 'Quoted separately', ''],
    ] as [string, string, string][],
  },
  stepsTitle: 'How we work',
  steps: [
    { id: '01', title: 'Consultation', desc: 'We go over your brand, product, ad goal and where the video will run.' },
    { id: '02', title: 'Quote and scope', desc: 'We agree on length, concept, language, format, cutdown, revisions, cost and timeline.' },
    { id: '03', title: 'Script approval', desc: 'You sign off on the core message and script first, with a storyboard if needed.' },
    { id: '04', title: 'AI video production', desc: 'We build and edit scenes from your brand materials.' },
    { id: '05', title: 'Review and revisions', desc: 'We send a draft for review and revise as agreed in the contract.' },
    { id: '06', title: 'Final delivery', desc: 'We deliver the landscape and vertical finals and the cutdown as Full HD MP4 files.' },
  ],
  scheduleTitle: 'Time to first draft',
  schedule: [['AI SHORT AD', '5 to 7 business days'], ['AI BRAND AD', '7 to 10 business days'], ['AI HERO FILM', '10 to 15 business days'], ['MONTHLY CREATIVE', 'Schedule agreed monthly']] as [string, string][],
  scheduleNote: 'Estimated from when materials and concept are confirmed. Feedback and scene complexity can change it, so any hard deadline, like an event date, is locked in before the contract.',
  notesTitle: 'Good to know',
  notes: [
    'Ad account management and ad spend are separate services. We do not guarantee views or sales.',
    'The standard deliverable is the final MP4 file. Editing project files and raw generated footage are not included.',
    "To show your product's logo and shape accurately, we need product photos. We always work from the real photos and logo you send first.",
    "We only use a real person's face or voice with their consent, and we never make AI testimonials that pass as real reviews.",
    'You may use the final video commercially in digital channels within the contracted scope. Music, outside sources and likenesses follow their own license terms.',
  ],
};

export const faq = {
  eyebrow: 'FAQ',
  title: ['Your questions,', 'answered.'],
  gather: 'answered.',
  tabsHint: 'Pick a topic',
  tabs: [
    {
      key: 'web', label: 'Website',
      items: [
        { q: 'Are there really no extra costs later?', a: "Maintenance, management and hosting are included free on every plan, so there is no monthly fee to PAUSE Studio. Anything that could cost extra, such as domain registration and renewal, card processing fees, paid outside services, or new pages and features, we'll point out in the quote." },
        { q: 'Do I really pay for the build only once?', a: "Yes. You pay for the build once, upfront. Hosting is free within the free allowance, and you can edit content like text and photos yourself in the admin tools, so there's no need for a monthly fee." },
        { q: 'Which plan should I choose?', a: "STARTER suits a site that introduces your brand and services and takes inquiries. BUSINESS suits one that handles products, inventory, bookings, orders and online payments. ENTERPRISE suits AI workflow automation or connecting outside systems such as ERP, POS and CRM. If you're not sure, we'll recommend the right setup in a free consultation." },
        { q: 'Can you make both my website and video ads?', a: 'Yes. We can build your website and AI video ads in the same brand direction. The quote is simply the price of each added together.' },
        { q: 'How long does it take?', a: 'It depends on project size, and usually takes 2 to 6 weeks.' },
        { q: 'What happens to free maintenance if PAUSE Studio ever closes?', a: "This is the question we're asked most. Free maintenance and the waived management fee are not contractual obligations; they are a service PAUSE Studio provides. Even if PAUSE Studio ever closes, your website content, data and contracted deliverables stay yours, and the handover materials let another developer or hosting company keep it running. Of course, we plan to be around for a long time." },
        { q: 'Who owns the website?', a: 'The website is your asset. We clearly set out your rights to your content, data and contracted deliverables, and provide handover materials so another developer can run it if needed. Shared development code, open source, outside platforms and paid licenses follow their own contracts and license terms.' },
        { q: 'What if I want to switch providers or manage it myself later?', a: "We register your domain in your name wherever possible, and hand over the contracted materials so another developer can take over. Of course, we'd love to stay with you the whole way." },
        { q: 'How many design revisions are included?', a: 'The contract includes 2 rounds of design revisions. All the feedback you collect and send in one go counts as one round. Production errors on our side and missing or broken contracted features are fixed regardless of the count. Completely changing an approved design, new pages or features, or a full restructure cost extra.' },
        { q: 'Do you work with clients outside New Zealand?', a: 'Yes. We are based in Auckland and work with businesses in New Zealand, the United States and beyond. Prices on this site show the same numbers in the currency of the country you visit from; they are not exchange rate conversions. Your contract currency is confirmed on the quote, based on where your business is located.' },
        { q: 'How do we communicate if we are in different countries?', a: 'Easily. We work the way that suits you best: Zoom calls, phone, email or KakaoTalk. We work in English or Korean, whichever you prefer.' },
        { q: 'Can you build a multilingual site?', a: 'Yes. We can design with multilingual layouts and typefaces in mind. The base price covers one content language. Additional language pages, professional translation and native review are quoted separately by scope.' },
        { q: 'Is search engine optimization (SEO) included?', a: 'Yes, on every plan. STARTER and BUSINESS include basic SEO such as metadata, a sitemap and structured data so you show up well on Google, and ENTERPRISE includes advanced SEO.' },
        { q: 'How do the domain and hosting work?', a: 'We register the domain in your name wherever possible, and domain registration and renewal costs are separate. Hosting is free on every plan, and we only discuss a different setup and extra cost if traffic and server usage go far beyond the free allowance.' },
      ] as Faq[],
    },
    {
      key: 'video', label: 'AI video ads',
      items: [
        { q: 'Are the videos made with AI?', a: "Yes. We make video ads with AI generation plus professional planning and editing. We don't hand over raw AI output; we develop the concept and message for the ad and edit the final video." },
        { q: 'Can I get a mobile version too?', a: 'Yes. Every video plan includes both landscape (16:9) and vertical (9:16) versions. You get a landscape video for your website and YouTube, and a vertical video for Reels and Shorts.' },
        { q: 'Can I use it for Instagram Reels?', a: 'Yes. The vertical video works directly for Reels, Shorts and other vertical formats. Approval by each ad platform and running the ads are separate.' },
        { q: 'Are the landscape and vertical versions different videos?', a: 'They are two versions of the same concept and message, each composed for its screen. If you want different content in each, that may need separate production.' },
        { q: 'Can I request changes after it is finished?', a: "Yes. Depending on the plan, you get 1 or 2 rounds of revisions. Landscape and vertical are revised together, so it doesn't count twice. Completely changing an approved concept may need a separate quote." },
        { q: 'Can you make one without real product photos?', a: 'It depends on the product and how accurate it needs to be. A simple concept video can be made with AI, but to show a product shape and logo accurately, we need product photos or materials.' },
        { q: 'Can I use an AI video commercially as an ad?', a: 'Yes. Commercial use of the final video in digital channels is granted as set out in the contract. Music, outside sources, likenesses and the like follow their own license terms.' },
        { q: 'Do the videos include music and voice?', a: 'Yes. Where needed, we include music, AI voiceover and captions. Real voice actor recording or special voice direction may be quoted separately.' },
        { q: 'Can you make ads in other languages?', a: 'Yes. Each project is produced in one language set in the contract, such as English or Korean, and additional language versions are quoted separately.' },
        { q: 'Do you deliver in 4K?', a: "The standard delivery format is Full HD. If you need 4K, we'll advise on upscaling separately, depending on the source resolution and production method." },
        { q: 'Do you also shoot footage?', a: 'AI video ad plans do not include location shoots. We can use footage you send us, and projects that need a shoot get a custom quote.' },
        { q: 'Do you run the ads for me?', a: 'Our core service is video ad production. Ad account management and ad spend are a separate service, quoted separately.' },
        { q: 'Is MONTHLY CREATIVE different from a website management fee?', a: 'Yes, it is a completely different service. Your basic monthly website fee stays at $0. MONTHLY CREATIVE is a recurring video plan you choose only if you want a steady flow of video ads.' },
      ] as Faq[],
    },
  ],
};

export const manifesto = {
  kicker: "We don't just take orders",
  lines: ['We treat your business', "like it's our own."],
  statement: 'We think about what you actually need, and we bring it to you before you have to ask.',
  sign: 'PAUSE STUDIO Founder',
};

export const contactSection = {
  windowLabel: 'Private 1:1 consultation',
  status: 'Open for new projects',
  title: { lead: 'Those', burden: 'monthly website fees?', tail: '', free: 'Let them go.' },
  desc: ["We'll take an honest look at what you spend on your website now and", ' show you how to switch to ', 'a site you manage yourself', ', with no basic monthly fee. We can help with websites and AI video ads alike.'],
  channelsNote: ['Whatever your time zone, we stay in touch the way you prefer: ', 'Zoom calls, phone, email or KakaoTalk', '.'],
  phone: { title: 'Phone', hint: 'Tap to choose between calling and texting.', call: 'Call', sms: 'Send a text', copy: 'Copy number', copied: 'Number copied' },
  kakao: { title: 'KakaoTalk', idLabel: 'KakaoTalk ID', qrLabel: 'Kakao QR scan', hint: 'Add the ID and message us, or scan the QR code.' },
  email: { title: 'Email', label: 'Show email address', hint: 'You can also send quotes and materials by email.' },
};

export const consult = {
  title: 'Free consultation request',
  steps: ['Type', 'Basic info', 'Details', 'Review'],
  types: [
    { value: 'Website design', label: 'Website design', desc: 'STARTER · BUSINESS · from brand introductions to bookings, orders and payments' },
    { value: 'AI video ads', label: 'AI video ads', desc: 'Video ads made from the photos you have, landscape and vertical together' },
    { value: 'Website + AI video ads', label: 'Both together', desc: 'A website and video ads in the same tone' },
    { value: 'AI automation & custom development', label: 'AI automation & custom development', desc: 'ENTERPRISE · AI automation · system integrations' },
  ],
  fields: {
    company: 'Company / brand name', name: 'Name', email: 'Email', phone: 'Phone', country: 'Country of your business', industry: 'Industry', currentSite: 'Current website',
    countries: ['New Zealand', 'United States', 'South Korea', 'Other'],
    phoneCode: 'Country code', phoneCodes: [['+64', 'New Zealand +64'], ['+1', 'United States +1'], ['+82', 'South Korea +82'], ['', 'Other']] as [string, string][],
    product: 'Plan of interest', products: ['STARTER · Basic', 'BUSINESS · Business', 'ENTERPRISE · Corporate', 'Not sure yet'],
    needs: 'Pages and features you need', needOptions: ['About and services', 'Location', 'Gallery and portfolio', 'Contact form with email delivery', 'Bookings', 'Online ordering and payments', 'Product and inventory management', 'Member and customer management', 'Extra language pages', 'Admin tools'],
    itemCount: 'Number of pages or products (roughly)', bookingPay: 'Booking or payment services you use', integrations: 'Systems you need to connect',
    videoProduct: 'Video plan of interest', videoProducts: ['AI SHORT AD · 15 sec', 'AI BRAND AD · 30 sec', 'AI HERO FILM · 60 sec', 'MONTHLY CREATIVE · 4 per month', 'Not sure yet'],
    videoUse: 'Where the video will run', videoUses: ['Website', 'Social ads', 'Screens in store', 'Other'],
    photos: 'Photos and images you have', photosHint: 'Roughly how many, and what kind (products, store, packaging and so on)',
    mood: 'Mood and reference videos',
    automation: 'Work you want to automate', systems: 'Systems you use (POS, CRM and so on)',
    timeline: 'When you want to start or launch', message: 'Your message',
    messageHint: 'Tell us what you have in mind. Feel free to add reference sites or a timeline.', interest: 'Plan of interest',
    files: 'Attach reference files', filesHint: 'Images, PDF, documents, ZIP, up to 4MB total. Send larger files by email.',
    privacy: 'The information you send is used only for consultations and quotes.',
  },
  buttons: { next: 'Next', prev: 'Back', submit: 'Send request', close: 'Close', done: 'OK' },
  required: 'Required',
  sending: 'Sending…',
  success: { title: 'Your request has been received.', desc: "We'll review it and get back to you directly using the details you left." },
  failure: {
    title: 'Sending failed.',
    desc: "We couldn't send it because of a network problem. Please send the same message using one of the options below.",
    mail: 'Send with your email app', copy: 'Copy message', copied: 'Copied', kakao: 'Message us on KakaoTalk',
  },
  errors: { name: 'Please enter your name.', email: 'Please check your email address.', type: 'Please choose a type of consultation.', files: 'Attachments can total up to 4MB. Please email larger files.' },
};

export const footer = {
  emailLabel: 'Email',
  emailReveal: 'Show email',
  legalLink: 'Legal notice',
  legal: [
    'Legal notice: Pause Studio provides professional web design, development and video ad production services. We do not guarantee any particular business result, traffic or revenue. Once a website is deployed, all sales are final and nonrefundable.',
    'Free maintenance applies only while the company operates the service, and is an extra service provided without separate charge. Even if the service ends, your rights to your content, data and the contracted deliverables are not affected.',
  ],
  copyright: '© 2026 PAUSE STUDIO. All Rights Reserved.',
};
