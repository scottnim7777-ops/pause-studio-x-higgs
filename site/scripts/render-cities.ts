/**
 * 미국 도시별 영어 안내 페이지: en/web-design-<도시>/index.html (scripts/render.ts 가 부른다)
 * 주소는 뉴질랜드 그대로 두고, 미국 도시를 '서비스 대상 지역'으로 사실대로 적는다(현지 업체인 척하지 않음).
 * 문구 규칙은 en.ts와 같다: 화면 글에 줄표·하이픈·별표·참고표를 쓰지 않는다.
 * 사실 약속(가격·기간·관리비)은 src/content/en.ts의 요금·안내와 같은 값만 쓴다.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'https://pause8studio.com';
const WA = 'https://wa.me/64204887198?text=Hi%20PAUSE%20Studio%2C%20I%27d%20like%20to%20ask%20about%20a%20website%20project.';
const MAIL = 'info@pause8studio.com';

export type City = {
  slug: string; name: string; short: string; region: string;
  headline: string[]; intro: string; local: string;
};

export const cities: City[] = [
  {
    slug: 'web-design-los-angeles', name: 'Los Angeles', short: 'LA', region: 'California',
    headline: ['Websites that make', 'Los Angeles businesses', 'look the part.'],
    intro: 'Salons, restaurants, clinics, studios and shops compete for attention on every block of Los Angeles. A site that looks like everyone else\'s template makes that harder. We design each one from scratch around your brand.',
    local: 'From Santa Monica to Pasadena and everywhere between, we build your site entirely online, and we can write it in English, Korean or both.',
  },
  {
    slug: 'web-design-new-york', name: 'New York', short: 'NYC', region: 'New York',
    headline: ['Websites that make', 'New York businesses', 'look the part.'],
    intro: 'In New York, a customer compares you with three other businesses in the time it takes to cross the street. Your website is the first impression, and it has to hold up on a phone. We design each one from scratch around your brand.',
    local: 'Whether your business is in Manhattan, Brooklyn, Queens or Long Island, we build your site entirely online, and we can write it in English, Korean or both.',
  },
  {
    slug: 'web-design-atlanta', name: 'Atlanta', short: 'ATL', region: 'Georgia',
    headline: ['Websites that make', 'Atlanta businesses', 'look the part.'],
    intro: 'From Midtown to the Gwinnett County suburbs, Atlanta businesses are growing fast, and so is the competition for the first click. A site that looks like a template does not help you stand out. We design each one from scratch around your brand.',
    local: 'Whether you are in Midtown, Buckhead or the suburbs, we build your site entirely online, and we can write it in English, Korean or both.',
  },
];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `
@font-face{font-family:'PS Display';src:url('/fonts/ps-display-latin.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'PS Text EN';src:url('/fonts/ps-text-en.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'PS Text EN';src:url('/fonts/ps-text-en-bold.woff2') format('woff2');font-weight:700;font-style:normal;font-display:swap}
:root{--ink:#0C0C0B;--ink-card:#1A1917;--cream:#FCEED8;--cream-2:rgba(252,238,216,.82);--cream-3:rgba(252,238,216,.58);--cream-line:rgba(252,238,216,.2);--paper:#EFE8DC;--on-paper:#141311;--on-paper-2:rgba(20,19,17,.76);--paper-line:rgba(20,19,17,.16);
--f-display:'PS Display','Helvetica Neue',Arial,sans-serif;--f-text:'PS Text EN','Helvetica Neue',Arial,sans-serif;
--gutter:clamp(20px,5.2vw,100px);--sec-pad:clamp(72px,8vw,150px);--ease:cubic-bezier(.2,.7,.1,1)}
*{box-sizing:border-box;margin:0}
html{background:var(--ink);color:var(--cream);-webkit-text-size-adjust:100%}
body{font-family:var(--f-text);font-size:clamp(16.5px,.96vw,19px);line-height:1.7;background:var(--ink)}
a{color:inherit}
.wrap{max-width:1320px;margin:0 auto;padding:0 var(--gutter)}
:focus-visible{outline:2px solid var(--cream);outline-offset:3px}
.paper :focus-visible{outline-color:var(--on-paper)}
.skip{position:absolute;left:-999px;top:8px;background:var(--cream);color:var(--ink);padding:10px 14px;z-index:9}.skip:focus{left:8px}
header.top{display:flex;align-items:center;justify-content:space-between;gap:20px;height:clamp(68px,6vw,104px);padding:0 var(--gutter)}
header.top img{display:block;height:clamp(26px,2.2vw,38px);width:auto}
.link{font-size:clamp(14.5px,.8vw,16px);text-decoration:underline;text-underline-offset:8px;text-decoration-color:var(--cream-line);transition:text-decoration-color .4s var(--ease)}
.link:hover{text-decoration-color:var(--cream)}
.hero{padding:clamp(56px,7vw,130px) 0 var(--sec-pad)}
.eyebrow{display:flex;align-items:center;gap:14px;font-family:var(--f-display);font-size:clamp(13px,.78vw,15px);letter-spacing:.16em;text-transform:uppercase;color:var(--cream-2)}
.eyebrow::before{content:"";width:34px;height:1px;background:currentColor}
h1,h2,h3{font-family:var(--f-display);font-weight:400;letter-spacing:-.012em;word-spacing:.12em;text-wrap:balance}
h1{font-size:clamp(42px,5.6vw,108px);line-height:1.04;margin-top:clamp(22px,2.4vw,40px)}
h1 span{display:block}
h2{font-size:clamp(34px,3.6vw,68px);line-height:1.1}
h3{font-size:clamp(22px,1.6vw,30px);line-height:1.25}
.lead{max-width:44em;margin-top:clamp(24px,2.6vw,44px);font-size:clamp(18px,1.3vw,25px);color:var(--cream-2);text-wrap:pretty}
.local{max-width:44em;margin-top:18px;color:var(--cream-3);text-wrap:pretty}
.btns{display:flex;flex-wrap:wrap;gap:16px;margin-top:clamp(32px,3.4vw,56px)}
.btn{display:inline-flex;align-items:center;justify-content:space-between;gap:28px;min-height:clamp(56px,3.96vw,76px);padding:0 clamp(22px,1.8vw,34px);font-weight:700;font-size:clamp(16px,1.1vw,21px);text-decoration:none;border:1px solid var(--cream-line);transition:background .45s var(--ease),color .45s var(--ease)}
.btn.main{background:var(--cream);color:var(--ink);border-color:var(--cream)}
.btn.main:hover{background:#fff7e8}
.btn:not(.main):hover{background:var(--cream);color:var(--ink)}
.btn i{display:block;width:28px;height:1px;background:currentColor;position:relative;transition:transform .45s var(--ease)}
.btn i::after{content:"";position:absolute;right:0;top:-4px;width:8px;height:8px;border-top:1px solid currentColor;border-right:1px solid currentColor;transform:rotate(45deg)}
.btn:hover i{transform:translateX(6px)}
section{padding:var(--sec-pad) 0}
.paper{background:var(--paper);color:var(--on-paper)}
.paper .eyebrow{color:var(--on-paper-2)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:clamp(36px,3.6vw,64px);border-top:1px solid var(--paper-line)}
.grid>div{padding:28px 28px 32px 0;border-bottom:1px solid var(--paper-line)}
.grid p{margin-top:12px;color:var(--on-paper-2);text-wrap:pretty}
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:clamp(36px,3.6vw,64px)}
.plan{background:var(--ink-card);border:1px solid var(--cream-line);padding:clamp(24px,2vw,38px)}
.plan.hl{background:var(--cream);color:var(--ink);border-color:var(--cream)}
.plan .nm{font-family:var(--f-display);letter-spacing:.14em;font-size:14px;color:var(--cream-3)}
.plan.hl .nm{color:rgba(12,12,11,.66)}
.plan .pr{font-family:var(--f-display);font-size:clamp(34px,3vw,56px);line-height:1.1;margin-top:14px}
.plan .pr small{font-size:.42em;letter-spacing:.06em;margin-right:6px}
.plan p{margin-top:14px;color:var(--cream-2);text-wrap:pretty;font-size:clamp(15.5px,.9vw,17.5px)}
.plan.hl p{color:rgba(12,12,11,.78)}
.note{margin-top:28px;color:var(--cream-3);font-size:clamp(14.5px,.8vw,16px);max-width:52em;text-wrap:pretty}
.faq{margin-top:clamp(32px,3vw,52px);border-top:1px solid var(--paper-line)}
.faq details{border-bottom:1px solid var(--paper-line)}
.faq summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:24px;padding:24px 0;font-family:var(--f-display);font-size:clamp(20px,1.5vw,28px);line-height:1.3}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-size:1.4em;line-height:1;transition:transform .4s var(--ease)}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq details p{padding:0 0 26px;max-width:48em;color:var(--on-paper-2);text-wrap:pretty}
.other{display:flex;flex-wrap:wrap;gap:8px 28px;margin-top:22px}
footer{border-top:1px solid var(--cream-line);padding:44px 0 56px;color:var(--cream-3);font-size:clamp(14.5px,.8vw,16px)}
footer .wrap{display:flex;flex-wrap:wrap;gap:12px 48px;justify-content:space-between}
footer address{font-style:normal}
@media (max-width:900px){.grid,.plans{grid-template-columns:1fr}.grid>div{padding-right:0}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

const faqOf = (c: City) => [
  { q: `Do you work with businesses in ${c.name} even though you are based in Auckland?`, a: `Yes. PAUSE Studio is based in Auckland, New Zealand, and every project is done online. We talk by message, WhatsApp and video call, and Auckland is roughly a day ahead of the US, so we agree on call times that suit you. We do not have an office in ${c.name}, and we do not visit in person.` },
  { q: 'How much does a website cost?', a: 'STARTER begins at USD $1,990 and BUSINESS, which adds bookings, orders and online payments, begins at USD $4,490. ENTERPRISE projects are quoted to order. After a free consultation we confirm the total and currency on your quote before anything else.' },
  { q: 'Is there a monthly fee?', a: 'No. You pay for the build once, and there is no basic monthly fee to PAUSE Studio. Maintenance and hosting are included free on every plan. Outside costs such as your domain are separate.' },
  { q: 'Can my website be in both English and Korean?', a: 'Yes. We build and write in both languages, so your site can work for every customer you serve.' },
  { q: 'How long does it take?', a: 'Timelines depend on the size of the project and usually run 2 to 6 weeks.' },
];

function page(c: City): string {
  const url = `${ROOT}/en/${c.slug}`;
  const title = `Web Design for ${c.name} Businesses | PAUSE Studio`;
  const desc = `Custom website design for ${c.name} businesses, built personally by the founder. Pay once, $0 basic monthly fee. Based in Auckland, working online in English and Korean.`;
  const faq = faqOf(c);
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service', '@id': `${url}#service`, name: `Website design for ${c.name} businesses`, serviceType: 'Website design',
        description: desc, url, provider: { '@id': `${ROOT}/#studio` },
        areaServed: { '@type': 'City', name: c.name, containedInPlace: { '@type': 'AdministrativeArea', name: c.region } },
      },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PAUSE Studio', item: `${ROOT}/en` },
        { '@type': 'ListItem', position: 2, name: `Web design for ${c.name}`, item: url },
      ] },
      { '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };
  const others = cities.filter((o) => o.slug !== c.slug).map((o) => `<a class="link" href="/en/${o.slug}">Web design for ${esc(o.name)}</a>`).join('');
  const arrow = '<i aria-hidden="true"></i>';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}"><link rel="alternate" hreflang="x-default" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:url" content="${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${ROOT}/og-en-20261022.jpg"><meta property="og:site_name" content="PAUSE Studio"><meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0C0C0B">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/ps-display-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>
<header class="top">
  <a href="/en" aria-label="PAUSE Studio home"><img src="/brand/logo-cream.svg" alt="PAUSE Studio" width="160" height="32"></a>
  <a class="link" href="/en">See the full site</a>
</header>
<main id="main">
<section class="hero" aria-labelledby="h1">
  <div class="wrap">
    <p class="eyebrow">Web design · ${esc(c.name)}</p>
    <h1 id="h1">${c.headline.map((l) => `<span>${esc(l)}</span>`).join('')}</h1>
    <p class="lead">${esc(c.intro)}</p>
    <p class="local">${esc(c.local)}</p>
    <div class="btns">
      <a class="btn main" href="${WA}" target="_blank" rel="noopener">Message us on WhatsApp ${arrow}</a>
      <a class="btn" href="mailto:${MAIL}">Email ${MAIL} ${arrow}</a>
    </div>
  </div>
</section>
<section class="paper" aria-labelledby="why">
  <div class="wrap">
    <p class="eyebrow">What you get</p>
    <h2 id="why" style="margin-top:22px">Built by the founder,<br>for your brand.</h2>
    <div class="grid">
      <div><h3>Custom brand design</h3><p>We do not use templates. Every screen is designed from scratch around your brand's look and personality.</p></div>
      <div><h3>$0 basic monthly fee</h3><p>There is no monthly fee to PAUSE Studio after launch. Maintenance and hosting are included free on every plan.</p></div>
      <div><h3>Built by the founder</h3><p>From the first call through design, development and final review, the founder is personally involved. No rotating account managers, no outsourcing.</p></div>
      <div><h3>Works on every phone</h3><p>Responsive design, basic SEO setup and an SSL security certificate come with every plan.</p></div>
      <div><h3>Bookings, orders, payments</h3><p>Need customers to book, order or pay online? The BUSINESS plan puts it all in one place.</p></div>
      <div><h3>English and Korean</h3><p>We build and write in both languages, so your site works for every customer you serve.</p></div>
    </div>
  </div>
</section>
<section aria-labelledby="price">
  <div class="wrap">
    <p class="eyebrow">Pricing</p>
    <h2 id="price" style="margin-top:22px">Pay once.<br>No basic monthly fee.</h2>
    <div class="plans">
      <div class="plan"><p class="nm">STARTER</p><p class="pr"><small>USD $</small>1,990</p><p>Up to 5 pages for brands that need a custom site to introduce the business and turn visitors into inquiries.</p></div>
      <div class="plan hl"><p class="nm">BUSINESS</p><p class="pr"><small>USD $</small>4,490 <small>and up</small></p><p>Up to 10 pages, with product and inventory management, bookings, orders and online payments.</p></div>
      <div class="plan"><p class="nm">ENTERPRISE</p><p class="pr">Custom quote</p><p>For companies with complex operations that need AI workflow automation or system integrations, built to order.</p></div>
    </div>
    <p class="note">Prices are in US dollars. We confirm the currency and total on your quote after a free consultation. Extra pages and custom features may be quoted separately. Outside costs such as your domain are separate.</p>
  </div>
</section>
<section class="paper" aria-labelledby="faqh">
  <div class="wrap">
    <p class="eyebrow">Questions</p>
    <h2 id="faqh" style="margin-top:22px">Before you reach out</h2>
    <div class="faq">
${faq.map((f) => `      <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')}
    </div>
  </div>
</section>
<section aria-labelledby="cta">
  <div class="wrap">
    <h2 id="cta">Tell us about your<br>${esc(c.name)} business.</h2>
    <p class="lead">The first consultation is free. Send a message and we will reply with a suggested setup.</p>
    <div class="btns">
      <a class="btn main" href="${WA}" target="_blank" rel="noopener">Message us on WhatsApp ${arrow}</a>
      <a class="btn" href="/en#contact">Free consultation form ${arrow}</a>
    </div>
    <p class="note" style="margin-top:44px">Also serving</p>
    <div class="other">${others}<a class="link" href="/en">PAUSE Studio, all services</a></div>
  </div>
</section>
</main>
<footer>
  <div class="wrap">
    <address>PAUSE Studio<br>75 Victoria Street West, Auckland 1010, New Zealand</address>
    <p>${MAIL}<br>WhatsApp +64 20 488 7198</p>
  </div>
</footer>
</body>
</html>
`;
}

export function renderCities(root: string) {
  for (const c of cities) {
    const file = path.join(root, 'en', c.slug, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const html = page(c);
    fs.writeFileSync(file, html);
    console.log(`en/${c.slug}/index.html ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
  }
}
