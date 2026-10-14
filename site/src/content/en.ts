/**
 * PAUSE STUDIO site copy (English) — pairs one to one with ko.ts. index.ts checks that every export has the same shape,
 * so a missing item breaks the build instead of showing Korean on the English page.
 * Style rules (same as ko.ts): no dashes, hyphens, asterisks or reference marks in on screen text. A '\n' inside a sentence is a deliberate line break.
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
  title: 'PAUSE Studio | Custom Websites & AI Video Ads for Korean Businesses in the US & New Zealand',
  description:
    'Custom website design and AI video ads for Korean businesses in the United States and New Zealand. Built personally by the founder, a one time build cost and a basic monthly fee of $0.',
  keywords: 'PAUSE Studio, pausestudio, pause8studio, Korean web design agency, website design for Korean businesses, Korean American business website, Korean business website, web design Los Angeles, web design New York, web design Auckland, web design New Zealand, custom website design, small business website, responsive website, ecommerce website, booking website, AI video ads, AI commercial video production, short form video ads, Reels ad production, bilingual website design, Korean English website',
  canonical: 'https://pause8studio.com/en',
  siteName: 'PAUSE Studio',
  ogTitle: 'PAUSE Studio | Website Design & AI Video Ads',
  ogDescription: 'Custom websites built personally by the founder, and AI video ads made from a single photo. Pay once, with a monthly fee of $0.',
  ogImage: 'https://pause8studio.com/og-20261013.jpg',
  ogImageAlt: 'Pause Studio logo with the words: we design the first impression of your brand, a branding studio for Korean businesses',
  aboutEn: 'PAUSE Studio is a bilingual branding studio based in Auckland, building custom websites and AI video ads for Korean businesses across the United States and New Zealand.',
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
  videoPause: 'Pause video', videoPlay: 'Play video', switchLang: 'Language', switchTo: '한국어', autoNote: 'Showing the English site.',
};

export const hero = {
  eyebrow: 'A branding studio for Korean businesses',
  titleLines: ['Brands people choose', 'are presented differently.'],
  titleLinesMobile: ['Brands people choose', 'are presented', 'differently.'],
  sub: ['From websites to AI video ads,', 'we shape every moment your brand meets a customer.'],
  services: [
    { index: '01', name: 'Website design', lead: 'Pay once, $0 basic monthly fee', desc: 'Maintenance and web hosting included free', href: '#website' },
    { index: '02', name: 'AI video ads', lead: 'No shoot, just the photos you already have', desc: 'Landscape and vertical ads, delivered together', href: '#video' },
  ],
};

const cat = [
  'Travel and study abroad agency', 'Homemade cakes', 'Korean restaurant', 'Auckland local travel agency', 'Fast food franchise', 'Fast food franchise',
  'Hospice', 'Contemporary tattoo studio', 'Hair salon', 'Health supplements', 'Taxi booking and dispatch platform', 'Travel agency', 'Travel agency',
  'Toss fintech partner app', 'Toss fintech partner app', 'Toss fintech partner app', 'Refrigeration and freezing equipment',
];
export const work = {
  eyebrow: 'PORTFOLIO',
  title: ['Real websites', 'we have built.'],
  lead: 'Every screen is a live screen from a client site. Click to see it larger.',
  view: 'View',
  items: ko.work.items.map((it, i): WorkItem => ({ ...it, category: cat[i] })),
  next: { kicker: 'NEXT REFERENCE', title: 'Your brand is\nour next reference.' },
};

export const why = {
  eyebrow: 'PHILOSOPHY & VALUE',
  title: 'WHY PAUSE?',
  letter: [
    'Hand your site to a big agency and it becomes one project among many. Here, the founder builds it personally, start to finish. No account managers rotating in and out, and no subcontracting.',
    'And you pay for the build once. There is no basic monthly fee to PAUSE Studio.',
    "That does not mean \"paid once, on your own.\" Quite the opposite. If a contracted feature breaks or the server has a problem, I take care of it myself at no extra cost. I charge for the build once, but I look after your site as if it were my own.",
  ],
  signatureLabel: 'PAUSE STUDIO Founder',
  pillars: [
    { title: 'Custom brand design', desc: "We do not assemble templates. We design every screen from scratch around your brand's mood and character." },
    { title: 'Basic monthly fee $0', desc: 'There is no monthly fee to PAUSE Studio after launch. Maintenance and web hosting are included free in every plan.' },
    { title: 'Built by the founder', desc: 'From the first call to design, development and final review, the founder takes part personally. No account managers rotating in and out, no subcontracting.' },
    { title: 'A site you can manage', desc: 'As easy as a blog or Instagram. Edit the text, images, products and prices you are given access to.' },
    { title: 'Clear ownership', desc: 'Your domain is registered in your name where possible, and your content, data and the contracted deliverables are clearly yours.' },
    { title: 'Website and video ads in one place', desc: 'We build your website and AI video ads with the same brand direction. No need to find separate vendors.' },
  ],
};

export const who = {
  eyebrow: 'FOR YOU',
  title: ['Made for', 'owners like you'],
  lead: 'A way of building for owners who want to cut fixed monthly costs and show the true value of their brand.',
  items: [
    'You believe a website is the first impression that decides how much people trust a brand',
    'You are tired of yearly management, upkeep and hosting bills',
    'You want a design that is truly yours, not a template',
    'You need a design that feels natural in both Korean and English',
    'You are looking for a business partner for the long run',
    'You want to turn the photos you already have into video ads',
  ],
};

export const chapters = {
  website: { index: 'CHAPTER 01', word: 'WEBSITE', ko: 'Website design', lead: 'Zero management and maintenance fees, a model you will not find anywhere else.\nFrom the first screen to the last button that leads to an inquiry,\nwe design it from scratch around your brand.', em: 'Zero management and maintenance fees' },
  video: { index: 'CHAPTER 02', word: 'AI VIDEO AD', ko: 'AI video ads', lead: 'No shoot, just the photos you already have.\nFrom planning to editing and sound, we deliver a finished video ad.', em: 'just the photos you already have' },
};

export const currencyChip: Txt = { NZD: 'Prices in NZD', USD: 'Prices in USD' };

const compareLabels = ['Travel and study abroad agency', 'Homemade cakes'];
export const compare = {
  eyebrow: 'BEFORE / AFTER',
  title: ['Template', 'Tailored'],
  lead: 'The same content can carry very different brand value depending on how it is shown.\nSlide the handle in the middle left and right to compare.',
  before: 'BEFORE',
  beforeSub: 'If it were built with a common template',
  after: 'AFTER',
  afterSub: 'A real site built by PAUSE',
  handle: 'Compare position',
  cases: ko.compare.cases.map((c, i): CompareCase => ({ ...c, label: compareLabels[i] })),
};

export const plans = {
  starter: {
    name: 'STARTER', ko: 'Basic', price: '1,990',
    target: 'For brands that need a custom website to introduce their business and turn visitors into inquiries',
    features: ['Up to 5 pages', 'Responsive design (mobile optimized)', 'Custom brand design', 'Basic pages such as About, Services and Location', 'Contact form and email integration', 'Basic SEO setup', 'SSL security certificate'],
  },
  business: {
    name: 'BUSINESS', ko: 'Business', price: '4,490', suffix: 'and up',
    target: 'For businesses that want product and inventory management, bookings, orders and online payments in one site, to run customer service and sales efficiently',
    only: ['Up to 10 pages', 'Product and inventory management system', 'Booking, ordering and online payments', 'Customer management (order history, member management)'],
    base: ['Responsive design (mobile optimized)', 'Custom brand design', 'Contact form and email integration', 'Basic SEO setup', 'SSL security certificate'],
  },
  enterprise: {
    name: 'ENTERPRISE', ko: 'Corporate', price: 'Custom quote',
    target: 'For companies that need a custom built website with AI workflow automation (AX), external system integrations and other advanced features for complex operations',
    only: ['Custom page structure (unlimited if needed)', 'AI workflow automation (AX)', 'Member and customer data management', 'External system integrations (ERP, POS, CRM and more)', 'Custom feature development'],
    base: ['Responsive design (mobile optimized)', 'Custom brand design', 'Contact form and email integration', 'Advanced SEO setup', 'SSL security certificate'],
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
  banner: ['Make the brand stand out.', 'No monthly fees.'],
  cut: ['monthly fees', ''] as [string, string],
  bannerLead: 'We build a website that fits your brand direction and business goals.\nPlanning, design and development, all in one go.',
  targetLabel: 'Best for',
  baseLabel: 'Included',
  plans: [
    { key: 'starter', name: P.starter.name, type: P.starter.ko, price: P.starter.price, target: P.starter.target, addsTitle: 'What is included', adds: P.starter.features },
    { key: 'business', name: P.business.name, type: P.business.ko, price: P.business.price, suffix: P.business.suffix, target: P.business.target, featured: true, addsTitle: 'Only in BUSINESS', adds: P.business.only, base: P.business.base },
    { key: 'enterprise', name: P.enterprise.name, type: P.enterprise.ko, price: P.enterprise.price, target: P.enterprise.target, addsTitle: 'Only in ENTERPRISE', adds: P.enterprise.only, base: P.enterprise.base },
  ] as Plan[],
  featuredBadge: 'Bookings and payments',
  freeTitle: ['Included free', 'with every plan'],
  free: [
    { title: 'Free maintenance', note: 'So contracted features keep working' },
    { title: 'Free management', note: 'No monthly management fee' },
    { title: 'Free web hosting', note: 'We talk first only if traffic grows far beyond normal' },
  ],
  notesTitle: 'Additional notes',
  notes: [
    { NZD: 'Amounts above are in New Zealand dollars (NZD). The actual contract currency follows the country where your business is based, and we confirm the currency and total on the quote first.', USD: 'Amounts above are in US dollars (USD). The actual contract currency follows the country where your business is based, and we confirm the currency and total on the quote first.' },
    'Extra pages, specific feature development and external system integrations may be quoted separately.',
    'Production time depends on project size and usually takes 2 to 6 weeks.',
    'Hosting is free by default. We only discuss a hosting setup and extra cost if traffic and server usage go far beyond the free allowance.',
    'After a detailed consultation, we propose the best setup for your business.',
    'External service costs such as your domain are separate.',
  ] as Txt[],
};

export const fee = {
  eyebrow: 'MONTHLY FEE',
  title: ['PAUSE Studio', 'Monthly fee $0'],
  cut: 'Monthly fee',
  lead: 'There is no monthly fee to PAUSE Studio after your website is built.\nWe tell you plainly what is free and when costs can arise.',
  freeTitle: 'All free',
  free: ['Website maintenance', 'Website management', 'Web hosting', 'Server issue checks', 'Guidance on using the admin tools'],
  extraTitle: 'Only when needed, separate',
  extra: [
    { title: 'Domain', desc: 'Registration and renewal costs' },
    { title: 'External service fees', desc: 'Card processing fees, paid platforms and APIs, extra servers' },
    { title: 'New work', desc: 'New pages and features, major design changes or a full redesign' },
    { title: 'Content entry service', desc: 'When you want us to keep posting text and photos for you' },
  ],
  notes: [
    'Fixing existing features and building new ones are different jobs.\nIf extra cost is needed, we always agree on it beforehand.',
    'Web hosting is free for ordinary website operation.\nUnlimited traffic and storage and 24 hour emergency response are not included by default.',
  ],
  calc: {
    title: 'Calculate your total cost',
    lead: 'Enter a quote you received from another company.\nThe longer the period, the bigger the difference.',
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
    note: 'The PAUSE Studio side uses the price of the plan you choose, and BUSINESS is a starting price. External service costs such as a domain are separate on both sides, so they are left out of the calculation.',
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
    { id: '01', title: '1:1 planning and consultation', highlight: 'Finding what matters most', desc: 'We start with a conversation that deeply understands your business and works out the solution you need most.' },
    { id: '02', title: 'Clear, secure payment', highlight: 'Upfront payment', desc: 'Once the quote is confirmed by scope of work, you pay the production fee upfront and we start building right away.' },
    { id: '03', title: 'Custom design and development', highlight: 'Precise custom development', desc: "We carry your brand's mood and strengths into the screens and the code." },
    { id: '04', title: 'Careful review and feedback', highlight: 'Two formal design revisions', desc: 'We polish even the smallest details together. Production errors or missing contracted features are fixed regardless of the number of rounds.' },
    { id: '05', title: 'Safe handover and completion', highlight: 'Basic monthly fee $0', desc: 'We hand over the admin tools you can edit with, along with organized contracted materials. After that there is no monthly fee.' },
  ],
};

export const film = {
  eyebrow: 'SAMPLE WORKS',
  title: ['One ordinary photo', 'becomes an ad.'],
  lead: 'This is how the ordinary photos you send us are transformed.\nBoth are sample ads PAUSE planned and made itself.',
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
  heading: ['From concept to final cut,', 'we deliver a ready to use ad.'],
  frame: ['ready to use ad', '.'] as [string, string],
  lead: 'We understand your business and product, plan the ad concept and message, then use AI generation and professional editing to make an ad you can actually use.',
  formats: {
    kicker: 'Included in every video plan',
    title: 'Landscape and vertical,\nat no extra cost.',
    desc: 'We rebuild the same ad for each screen. We do not simply crop; we adjust the layout and caption position separately so key subjects and text are never cut off.',
    items: [
      { ratio: '16:9', name: 'Landscape', size: '1920 × 1080', use: 'Website, YouTube, landscape ads' },
      { ratio: '9:16', name: 'Vertical', size: '1080 × 1920', use: 'Reels, TikTok, Shorts, Stories' },
    ],
  },
  plans: [
    {
      key: 'short', name: 'AI SHORT AD', price: '490',
      tagline: "An ad that delivers your brand's core in 15 seconds",
      desc: 'A short video suited to social ads and product or service promotion. Includes planning, AI production and editing.',
      specs: [['Length', 'Up to 15 sec'], ['Format', 'Landscape and vertical (2)'], ['Short cut', 'None'], ['Revisions', '1 formal revision'], ['Deliverables', '2 MP4 files']],
    },
    {
      key: 'brand', name: 'AI BRAND AD', price: '890', featured: true, badge: 'Flagship',
      tagline: 'A 30 second ad that delivers your brand message with more polish',
      desc: 'A planned video ad for promoting brands, products and services. From storyboard to sound, with a 15 second short cut included.',
      specs: [['Length', 'Up to 30 sec'], ['Format', 'Landscape and vertical (2)'], ['Short cut', 'One 15 sec cut'], ['Revisions', '2 formal revisions'], ['Deliverables', '3 MP4 files']],
    },
    {
      key: 'hero', name: 'AI HERO FILM', price: '1,490', suffix: 'and up',
      tagline: 'A premium AI video that captures your brand image',
      desc: 'For homepage heroes, brand introductions and new product campaigns. Brand concept planning, color grading and sound are all provided.',
      specs: [['Length', 'Up to 60 sec'], ['Format', 'Landscape and vertical (2)'], ['Short cut', 'One 30 sec cut'], ['Revisions', '2 formal revisions'], ['Deliverables', '3 MP4 files']],
    },
  ] as VideoPlan[],
  includedTitle: 'Included in all three',
  included: ['Ad concept, copy and script planning', 'AI image and video generation and scene editing', 'Color, music and sound editing', 'AI voiceover and captions if needed', 'Logo and call to action', 'Full HD MP4 delivery', 'Commercial use rights within the contracted scope'],
  monthly: {
    key: 'monthly', name: 'MONTHLY CREATIVE', price: '2,490', suffix: '/mo', label: 'Optional monthly service',
    tagline: 'Video ads you need steadily, at a fixed monthly price',
    desc: 'We produce 4 AI video ads a month for one brand. Separate from the website fee ($0), this is a recurring video service you choose only when you want it.',
    specs: ['4 videos a month, up to 30 sec each', 'Landscape and vertical for every video (8 MP4 files a month)', '1 formal revision per video', 'Prepaid monthly, no minimum contract'],
    note: 'Tell us before the next payment and production ends after that. Unused videos do not carry over to the next month.',
  },
  revisions: "One revision means the feedback you gather in a single review round. Landscape and vertical versions are revised together, so the count does not double, and PAUSE's own mistakes are fixed regardless of the count.",
  addons: {
    title: 'Add on pricing',
    toggle: 'See add on pricing',
    note: 'Delivering both landscape and vertical has no extra charge. For difficult work, we give you a quote before the contract.',
    rows: [
      ['Extra edit for 1:1 or 4:5 format', '90', '/format'],
      ['Clean version without captions', '50', 'and up'],
      ['Different opening using existing scenes', '150', 'and up'],
      ['Opening that needs newly generated scenes', '250', 'and up'],
      ['Extra short cut from an existing video', '150', 'and up'],
      ['Additional language version', '150', 'and up'],
      ['1 extra revision for AI SHORT AD', '100', ''],
      ['1 extra revision for AI BRAND AD and HERO FILM', '150', ''],
      ['4K upscale output', '120', 'and up'],
      ['Complex product and character consistency work', '250', 'and up'],
      ['48 hour rush production (when possible)', '+30% of production fee', ''],
      ['Complex lip sync and per language scene regeneration', 'Custom quote', ''],
      ['A full rework of the ad for each language and market', 'Custom quote', ''],
      ['Voice actor recording, live shoots, difficult new scenes', 'Quoted separately', ''],
    ] as [string, string, string][],
  },
  stepsTitle: 'How we work',
  steps: [
    { id: '01', title: 'Consultation', desc: 'We confirm your brand, product, ad goal and where the video will be used.' },
    { id: '02', title: 'Quote and scope', desc: 'We settle length, concept, language, format, short cut, revisions, cost and schedule.' },
    { id: '03', title: 'Script approval', desc: 'You approve the core message and ad content first, and we provide a storyboard if needed.' },
    { id: '04', title: 'AI video production', desc: 'We build and edit scenes from your brand materials.' },
    { id: '05', title: 'Review and revisions', desc: 'We send a draft for review and revise as many times as contracted.' },
    { id: '06', title: 'Final delivery', desc: 'We deliver landscape and vertical finals and the short cut as Full HD MP4.' },
  ],
  scheduleTitle: 'Until the first draft',
  schedule: [['AI SHORT AD', '5 to 7 business days'], ['AI BRAND AD', '7 to 10 business days'], ['AI HERO FILM', '10 to 15 business days'], ['MONTHLY CREATIVE', 'Schedule agreed monthly']] as [string, string][],
  scheduleNote: 'Estimated time after materials and concept are confirmed. It can change with feedback and scene difficulty, so any date that must be met, like an event day, is fixed before the contract.',
  notesTitle: 'Good to know',
  notes: [
    'Ad account management and ad spend are separate services. We do not guarantee views or sales growth.',
    'The standard deliverable is the final MP4 file. Editing project files and raw generated material are not included by default.',
    "To show a real product's logo and shape accurately, we need product photos. We use the real photos and logo you send first.",
    "We use a real person's face or voice only with their consent, and we do not make AI testimonial videos that look like real reviews.",
    'You may use the final video digitally and commercially within the contracted scope. Music, outside sources and likenesses follow their own license terms.',
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
        { q: 'Are there really no extra costs later?', a: 'Maintenance, management and web hosting are included free in every plan, so there is no monthly fee to PAUSE Studio. Where costs can arise, such as domain registration and renewal, card processing fees, paid outside services and new pages or features, we tell you at the quote stage.' },
        { q: 'Do I really pay the build cost only once?', a: 'Yes. You pay the build cost once, upfront. Web hosting is free within the free allowance, and you can edit designated content such as text and photos yourself with the admin tools, so there is no need to pay a monthly fee.' },
        { q: 'Which plan should I choose?', a: 'STARTER suits a website that introduces your brand and services and takes inquiries. BUSINESS suits one that runs product and inventory management, bookings, orders and online payments. ENTERPRISE suits AI workflow automation (AX) or integration with outside systems such as ERP, POS and CRM. If you are not sure, we suggest the right setup in a free consultation.' },
        { q: 'Can I have both a website and video ads made?', a: 'Yes. We can build your website and AI video ads in the same brand direction. We quote the combined work by adding up the price of each product.' },
        { q: 'How long does it take?', a: 'It depends on project size, and usually takes 2 to 6 weeks.' },
        { q: 'What happens to the free maintenance if the company ever disappears?', a: 'This is the question we get asked most. Free maintenance and the waived management fee are not a contractual default, they are a benefit PAUSE Studio provides as a service. Even if PAUSE Studio ever closes, the ownership of your website content, data and the contracted deliverables stays with you, and you can keep it maintained and running through another developer or hosting company using the handover materials. Of course, we plan to be around for a long time so that never happens.' },
        { q: 'Who owns the website?', a: 'The website is your asset. We state clearly your rights to your content, data and the contracted deliverables, and provide a handover so another developer can run it if needed. Shared development code, open source, outside platforms and paid licenses follow their own contracts and license terms.' },
        { q: 'What if I later want to move to someone else or manage it myself?', a: 'We register your domain in your name where possible, and hand over the contracted materials so another developer can take over. Of course, we will stay with you to the end so that is never needed.' },
        { q: 'How many design revisions are included?', a: 'Within the contract, we provide 2 formal design revisions. Feedback you gather and send in one round counts as one revision. PAUSE Studio production errors and missing or malfunctioning contracted features are fixed regardless of the count. A complete change to an approved design, new pages or features and a full restructuring cost extra.' },
        { q: 'Can I hire you from overseas?', a: 'Yes. Based in Auckland, we build websites and video ads for Korean business owners in New Zealand, the United States and elsewhere. Prices on the homepage show the same numbers in the currency of the country you visit from, and are not converted by exchange rate. The actual contract currency is confirmed on the quote, based on the country where your business is located.' },
        { q: 'Will communication be a problem from overseas, such as New Zealand or the US?', a: 'Not at all. We communicate in whatever way suits you best: Zoom video meetings, phone, KakaoTalk or email. We can work in Korean or English, whichever you prefer.' },
        { q: 'Can you build a multilingual site?', a: 'Yes, we can design with multilingual layouts and typefaces in mind. The base price covers one content language. Additional language pages, professional translation and native review are quoted separately by scope.' },
        { q: 'Is search engine optimization (SEO) included?', a: 'Yes, in every plan. STARTER and BUSINESS include basic SEO such as metadata, a sitemap and structured data so you show up well on Google and Naver, and ENTERPRISE includes advanced SEO.' },
        { q: 'How do the domain and hosting work?', a: 'We register the domain in your name where possible, and domain registration and renewal costs are separate. Web hosting is free in every plan, and we only discuss a hosting setup and extra cost if traffic and server usage go far beyond the free allowance.' },
      ] as Faq[],
    },
    {
      key: 'video', label: 'AI video ads',
      items: [
        { q: 'Is it a video made with AI?', a: 'Yes. We make video ads with AI generation technology and professional planning and editing. We do not hand over raw AI output; we build the concept and message for the ad and edit the final video.' },
        { q: 'Can I get a mobile version too?', a: 'Yes. Every video plan includes both landscape (16:9) and vertical (9:16) videos. You get a landscape video for your website and YouTube and a vertical video for Reels and Shorts together.' },
        { q: 'Can I use it for Instagram Reels?', a: 'Yes. You can use the vertical video we provide directly for vertical content such as Reels and Shorts. Approval by each ad platform and running the ads are separate.' },
        { q: 'Are the landscape and vertical versions different videos?', a: 'They are two versions of the same ad concept and message, each composed for its screen. If you want a different ad content as well, separate production may be needed.' },
        { q: 'Can I request changes after it is finished?', a: 'Yes. Depending on the plan, we provide 1 or 2 formal revisions. Landscape and vertical are revised together, so the count does not double. Completely changing an approved ad concept may need a separate quote.' },
        { q: 'Can you make one without real product photos?', a: 'It depends on the product and the accuracy you need. A simple concept video can be made with AI, but if you need to show a product shape and logo accurately, we need product photos or materials.' },
        { q: 'May I use an AI video commercially as an ad?', a: 'We provide digital commercial use of the final deliverable as set out in the contract. Music, outside sources, likenesses and similar follow their own license terms.' },
        { q: 'Do the videos include music and voice?', a: 'Yes. Where needed, we include music, AI voiceover and captions. Real voice actor recording or special voice direction may be quoted separately.' },
        { q: 'Can you make ads in Korean?', a: 'Yes. We produce in one language set out in the contract, such as Korean or English, and additional language versions are quoted separately.' },
        { q: 'Is it 4K?', a: 'The standard delivery format is Full HD. If you need 4K, we guide you on upscaling separately depending on the source resolution and production method.' },
        { q: 'Do you also shoot footage?', a: 'AI video ad plans do not include on location shooting. We can use footage you send, and projects that need separate shooting get a custom quote.' },
        { q: 'Do you run the ads for me?', a: 'The base product is a video ad production service. Ad account management and ad spend are a separate service, quoted separately.' },
        { q: 'Is MONTHLY CREATIVE different from the website management fee?', a: 'Yes, it is a completely different service. The basic monthly website fee stays at $0, and MONTHLY CREATIVE is a recurring video production plan you choose only if you need video ads steadily and want it.' },
      ] as Faq[],
    },
  ],
};

export const manifesto = {
  kicker: 'We never just do what we are told',
  lines: ['We treat your business', 'like it is our own.'],
  statement: 'We think first about what you really need, and we suggest it first.',
  sign: 'PAUSE STUDIO Founder',
};

export const contactSection = {
  windowLabel: 'Private 1:1 consultation',
  status: 'Open for new projects',
  title: { lead: 'Those', burden: 'monthly website fees?', tail: '', free: 'Let them go.' },
  desc: ['We openly review what you now spend on your website and', ' propose a switch to ', 'a self managed model', ' with no basic monthly fee. We can help with both websites and AI video ads.'],
  channelsNote: ['No matter the time zone or distance, we stay in touch the way you prefer: ', 'Zoom video calls, phone, KakaoTalk or email', '.'],
  phone: { title: 'Phone consultation', hint: 'Tap to choose between calling and texting.', call: 'Call', sms: 'Send a text', copy: 'Copy number', copied: 'Number copied' },
  kakao: { title: 'KakaoTalk inquiries', idLabel: 'KakaoTalk ID', qrLabel: 'Kakao QR scan', hint: 'Add the ID and message us, or scan the QR code.' },
  email: { title: 'Email', label: 'Show email address', hint: 'You can also send quotes and materials by email.' },
};

export const consult = {
  title: 'Free consultation request',
  steps: ['Type', 'Basic info', 'Details', 'Review'],
  types: [
    { value: 'Website design', label: 'Website design', desc: 'STARTER · BUSINESS · from brand introductions to booking, ordering and payments' },
    { value: 'AI video ads', label: 'AI video ads', desc: 'Video ads made from the photos you have, landscape and vertical together' },
    { value: 'Website + AI video ads', label: 'Both together', desc: 'A website and video ads in the same tone' },
    { value: 'AI automation & custom development', label: 'AI automation & custom development', desc: 'ENTERPRISE · AI automation (AX) · external system integrations' },
  ],
  fields: {
    company: 'Company / brand name', name: 'Name', email: 'Email', phone: 'Phone', country: 'Country of your business', industry: 'Industry', currentSite: 'Current website',
    countries: ['New Zealand', 'United States', 'South Korea', 'Other'],
    phoneCode: 'Country code', phoneCodes: [['+64', 'New Zealand +64'], ['+1', 'United States +1'], ['+82', 'South Korea +82'], ['', 'Other']] as [string, string][],
    product: 'Plan of interest', products: ['STARTER · Basic', 'BUSINESS · Business', 'ENTERPRISE · Corporate', 'Not sure yet'],
    needs: 'Pages and features you need', needOptions: ['About and services', 'Location', 'Gallery and portfolio', 'Contact form and email integration', 'Booking', 'Online ordering and payments', 'Product and inventory management', 'Member and customer management', 'Extra language pages', 'Admin tools'],
    itemCount: 'Number of pages or products (roughly)', bookingPay: 'Booking or payment services you use', integrations: 'Systems you need to connect',
    videoProduct: 'Video plan of interest', videoProducts: ['AI SHORT AD · 15 sec', 'AI BRAND AD · 30 sec', 'AI HERO FILM · 60 sec', 'MONTHLY CREATIVE · 4 per month', 'Not sure yet'],
    videoUse: 'Where you will use the video', videoUses: ['Website', 'Social ads', 'In store screens', 'Other'],
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
  success: { title: 'Your request has been received.', desc: 'We will review it and contact you directly at the details you left.' },
  failure: {
    title: 'Sending failed.',
    desc: 'We could not send it because of a network problem. Please send the same content using one of the options below.',
    mail: 'Send with your email app', copy: 'Copy content', copied: 'Copied', kakao: 'Message us on KakaoTalk',
  },
  errors: { name: 'Please enter your name.', email: 'Please check your email address.', type: 'Please choose a type of consultation.', files: 'Attachments can total up to 4MB. Please email larger files.' },
};

export const footer = {
  emailLabel: 'Email',
  emailReveal: 'Show email',
  legalLink: 'Legal notice',
  legal: [
    'Legal notice: Pause Studio provides professional web design, development and video ad production services. We do not guarantee any particular business result, traffic or revenue. Once a website is deployed, all sales are final and non refundable.',
    'Free maintenance applies only while the company operates the service, and is an extra service provided without separate charge. Even if the service ends, your rights to your content, data and the contracted deliverables are not affected.',
  ],
  copyright: '© 2026 PAUSE STUDIO. All Rights Reserved.',
};
