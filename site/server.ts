/**
 * PAUSE STUDIO 서버: 정적 파일 + 상담 신청(/api/contact)
 * - 메일: SMTP(SMTP_HOST/PORT/USER/PASS) → 실패하거나 설정이 없으면 FormSubmit으로 대신 보냄(기존 사이트와 같은 방식)
 * - 성공을 확인했을 때만 { ok: true } (화면은 이것을 받아야 '접수 완료'를 보여줌)
 * - 누락 방지(2026-10-12 사용자: 문의가 절대 빠지면 안 됨): 메일을 보내기 전에 먼저 비공개 저장소(Vercel Blob, private)에 신청서·첨부를 저장.
 *   메일이 실패해도 신청 내용은 남고, 화면은 '전송 실패'(메일 앱·복사·카카오톡)를 보여 손님이 다른 길로도 보낼 수 있게 함
 * - SMTP가 있으면 손님에게 '접수되었습니다' 확인 메일도 보냄
 * - 배포: Vercel(scripts/vercel.mjs가 정적 파일 + 이 서버를 함수 하나로 묶음). 그 밖의 Node 환경은 npm start
 * - 보안: TLS 인증서 검증을 끄지 않음, 상담 내용·연락처를 로그에 남기지 않음(저장소는 비공개), 같은 곳에서 짧은 시간에 너무 많이 보내면 거절
 * - 통화: 첫 화면(/)을 줄 때 방문자 공인 IP(또는 배포 환경의 국가 헤더)로 고른다 — 뉴질랜드만 NZD, 그 밖의 나라와 판별 실패는 USD
 *   (src/geo/currency.ts). IP는 판별에만 쓰고 기록하지 않는다. 배포 후 확인: /api/currency
 */
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import { put } from '@vercel/blob';
import crypto from 'node:crypto';
import multer from 'multer';
import nodemailer from 'nodemailer';
import path from 'node:path';
import fs from 'node:fs';
import { consult } from './src/content/ko';
import { detectCurrency, geoHeaders, overrideFrom, withCurrency } from './src/geo/currency';

const PORT = Number(process.env.PORT || 3000);
// 상담 메일 받는 주소(2026-10-08 사용자: info@pause8studio.com). 배포 환경에서 CONTACT_TO로 바꿀 수 있음
const TO = process.env.CONTACT_TO || 'info@pause8studio.com';
const DIST = path.resolve(process.env.STATIC_DIR || 'dist');
const PROD = process.env.NODE_ENV === 'production';
/** 통화: 믿을 수 있는 국가 헤더(GEO_HEADER, 없으면 Vercel·App Engine만) · ?cur 덮어쓰기는 개발 또는 CURRENCY_OVERRIDE=1일 때만 */
const GEO = geoHeaders();
const ALLOW_CUR_OVERRIDE = !PROD || process.env.CURRENCY_OVERRIDE === '1';
console.log(`통화 판별: ${GEO.length ? `국가 헤더(${GEO.join(', ')}) → ` : ''}뉴질랜드 IP 목록 → 그 밖은 USD${ALLOW_CUR_OVERRIDE ? ' · ?cur 확인용 덮어쓰기 켜짐' : ''}`);
// Vercel 함수는 요청 본문이 4.5MB까지라 첨부 합계 4MB(화면 안내 문구·src/ts/consult.ts와 같음)
const MAX_TOTAL = 4 * 1024 * 1024;

const app = express();
app.disable('x-powered-by');
// 배포 환경의 프록시(로드밸런서) 뒤에서 실제 접속 주소를 알기 위함. 프록시가 없으면 TRUST_PROXY=false
const tp = process.env.TRUST_PROXY ?? '1';
app.set('trust proxy', /^\d+$/.test(tp) ? Number(tp) : tp === 'true' ? true : tp === 'false' ? false : tp);

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

/* ── 메일 보내기 */
const smtpPort = Number(process.env.SMTP_PORT || 587);
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  : null;
console.log(transporter ? `메일: SMTP(${process.env.SMTP_HOST}:${smtpPort})` : '메일: SMTP 설정 없음 → FormSubmit 사용');

/** 받은 항목 이름 → 메일에 쓸 이름(화면 문구와 같음) */
const F = consult.fields as unknown as Record<string, string | string[]>;
const ORDER: [string, string][] = [
  ['consultType', '상담 종류'],
  // 메일에서 누구인지·어떻게 연락할지가 먼저 보이게(2026-10-12 사용자: 양식을 보기 좋게)
  ...['name', 'phone', 'email', 'company', 'country', 'interest', 'message']
    .map((k): [string, string] => [k, String(F[k])]),
];
const clean = (v: unknown, max = 5000) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
const oneLine = (v: unknown, max = 120) => clean(v, max).replace(/[\r\n]+/g, ' ');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function compose(body: Record<string, unknown>) {
  const rows: [string, string][] = [];
  for (const [key, label] of ORDER) {
    const v = body[key];
    let val = Array.isArray(v) ? v.map((x) => clean(x, 200)).filter(Boolean).join(', ') : clean(v);
    if (key === 'phone' && val && oneLine(body.phoneCode, 6)) val = `${oneLine(body.phoneCode, 6)} ${val}`; // 국가번호 + 번호
    if (val) rows.push([label, val]);
  }
  const type = oneLine(body.consultType, 60) || '상담';
  const name = oneLine(body.name, 60) || '이름 없음';
  const email = oneLine(body.email, 200);
  const page = oneLine(body._page, 300);
  const company = oneLine(body.company, 60);
  const at = new Date().toLocaleString('ko-KR', { timeZone: 'Pacific/Auckland', dateStyle: 'long', timeStyle: 'short' });
  rows.push(['받은 시각', `${at} (뉴질랜드)`]);
  if (page) rows.push(['보낸 페이지', page]);
  const text = [`${consult.title}`, '', ...rows.map(([k, v]) => `■ ${k}\n${v}`)].join('\n');
  // 제목 앞 💻(2026-10-12 사용자: 메일함에서 눈에 잘 띄게)
  return { subject: `💻 [PAUSE 상담] ${type} · ${name}${company ? ` (${company})` : ''}`, text, rows, replyTo: EMAIL_RE.test(email) ? email : undefined };
}

async function viaSmtp(m: ReturnType<typeof compose>, files: Express.Multer.File[]) {
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: `"PAUSE Studio 상담" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: TO,
      replyTo: m.replyTo,
      subject: m.subject,
      text: m.text,
      attachments: files.map((f) => ({ filename: f.originalname, content: f.buffer, contentType: f.mimetype })),
    });
    return true;
  } catch (err) {
    console.error('SMTP 전송 실패:', (err as Error).message); // 내용은 남기지 않음
    return false;
  }
}

async function viaFormSubmit(m: ReturnType<typeof compose>, files: Express.Multer.File[]) {
  try {
    const fd = new FormData();
    fd.append('_subject', m.subject);
    fd.append('_template', 'table');
    fd.append('_captcha', 'false');
    if (m.replyTo) fd.append('_replyto', m.replyTo);
    m.rows.forEach(([k, v]) => fd.append(k.replace(/ /g, ' '), v)); // 띄어쓰기가 밑줄로 바뀌지 않게(src/ts/consult.ts와 같음)
    files.forEach((f) => fd.append('attachment', new Blob([new Uint8Array(f.buffer)], { type: f.mimetype }), f.originalname));
    // FormSubmit은 어느 페이지에서 왔는지(Referer)가 없으면 거절하는 경우가 있어 사이트 주소를 붙임
    const site = process.env.SITE_URL || 'https://pause8studio.com';
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TO)}`, { method: 'POST', body: fd, headers: { Accept: 'application/json', Referer: `${site}/`, Origin: site }, signal: AbortSignal.timeout(30000) });
    const data = await res.json().catch(() => ({})) as { success?: string | boolean; message?: string };
    const ok = res.ok && String(data.success) === 'true';
    if (!ok) console.error('FormSubmit 실패:', res.status, oneLine(data.message, 200));
    return ok;
  } catch (err) {
    console.error('FormSubmit 오류:', (err as Error).message);
    return false;
  }
}

/** 메일보다 먼저 저장(누락 방지). 저장소가 연결되어 있지 않으면(로컬 등) 건너뜀 */
async function store(id: string, m: ReturnType<typeof compose>, files: Express.Multer.File[]) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  try {
    const day = id.slice(0, 10);
    await Promise.all(files.map((f, i) => put(`inquiries/${day}/${id}/${i + 1}-${f.originalname.replace(/[^\w.\-가-힣]/g, '_').slice(-80)}`, f.buffer, { access: 'private', contentType: f.mimetype, addRandomSuffix: false })));
    await put(`inquiries/${day}/${id}/inquiry.json`, JSON.stringify({ id, subject: m.subject, replyTo: m.replyTo, rows: m.rows, files: files.map((f) => f.originalname), text: m.text }, null, 2), { access: 'private', contentType: 'application/json', addRandomSuffix: false });
    return true;
  } catch (err) {
    console.error('신청서 저장 실패:', (err as Error).message);
    return false;
  }
}

/** 손님에게 접수 확인 메일(SMTP가 있을 때만, 실패해도 신청 결과에는 영향 없음) */
async function receipt(m: ReturnType<typeof compose>) {
  if (!transporter || !m.replyTo) return;
  try {
    await transporter.sendMail({
      from: `"PAUSE Studio" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: m.replyTo,
      replyTo: TO,
      subject: '[PAUSE Studio] 상담 신청이 접수되었습니다',
      text: ['안녕하세요, PAUSE Studio입니다.', '', '보내주신 상담 신청이 잘 접수되었습니다. 내용을 확인한 뒤 남겨주신 연락처로 직접 연락드리겠습니다.', '', '— 보내주신 내용 —', ...m.rows.map(([k, v]) => `■ ${k}\n${v}`), '', `급하신 경우: 카카오톡 cosmic0809 · ${TO}`].join('\n'),
    });
  } catch (err) {
    console.error('접수 확인 메일 실패:', (err as Error).message);
  }
}

/* ── 같은 곳에서 10분에 8번까지 */
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 8;
};

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_TOTAL, files: 10, fields: 60, fieldSize: 20000 } });

app.post('/api/contact', (req, res, next) => {
  if (limited(req.ip || 'unknown')) { res.status(429).json({ ok: false, code: 'rate_limited' }); return; }
  next();
}, upload.array('attachment', 10), async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (clean(body._hp)) { res.json({ ok: true }); return; } // 자동 입력 프로그램: 조용히 버림
  if (!oneLine(body.name) || !EMAIL_RE.test(oneLine(body.email, 200))) { res.status(400).json({ ok: false, code: 'invalid' }); return; }
  if (files.reduce((a, f) => a + f.size, 0) > MAX_TOTAL) { res.status(413).json({ ok: false, code: 'too_large' }); return; }
  const m = compose(body);
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
  const saved = await store(id, m, files);
  const ok = (await viaSmtp(m, files)) || (await viaFormSubmit(m, files));
  if (ok) await receipt(m);
  console.log(`상담 신청 ${id}: 저장 ${saved ? '됨' : '안 됨'} · 메일 ${ok ? '전송됨' : '전송 실패'} (${oneLine(body.consultType, 40) || '-'}, 첨부 ${files.length}개)`);
  // 메일이 안 나갔으면 손님 브라우저가 FormSubmit으로 직접 보내도록 정리된 내용을 돌려줌(FormSubmit은 서버에서 보내면 403으로 막음)
  // 실패도 200으로: 앞단 Cloudflare가 5xx 응답 본문을 자기 오류 화면으로 바꿔 relay가 사라지기 때문(2026-10-12 실제로 겪음)
  res.status(200).json(ok ? { ok } : { ok, saved, relay: { to: TO, subject: m.subject, replyTo: m.replyTo, rows: m.rows } });
});

app.get('/api/health', (_req, res) => { res.json({ ok: true }); });
/** 배포 후 확인용: 이 접속이 어떤 통화로 보이는지와 판별 근거만(IP 등 개인 정보는 돌려주지 않음) */
app.get('/api/currency', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(detectCurrency(req.headers, req.ip, GEO));
});

// 업로드 크기 초과 등
app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  void _next;
  if (err instanceof multer.MulterError) {
    res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ ok: false, code: err.code });
    return;
  }
  console.error('API 오류:', (err as Error)?.message);
  res.status(500).json({ ok: false });
});

/** 첫 화면: 방문자마다 통화가 달라 공용 캐시(CDN)에 저장하지 않게 하고, 처음부터 맞는 통화로 보낸다(바뀌며 깜빡이지 않게) */
function sendPage(req: Request, res: Response, html: string) {
  res.setHeader('Cache-Control', 'private, no-cache');
  const cur = overrideFrom(req.query.cur, ALLOW_CUR_OVERRIDE) ?? detectCurrency(req.headers, req.ip, GEO).currency;
  res.type('html').send(withCurrency(html, cur));
}

async function setup(): Promise<Express> {
  if (!PROD) {
    // 개발: Vite가 index.html·스크립트·스타일을 바로 처리(첫 화면만 통화 표시를 넣어 직접 보냄)
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.get(['/', '/index.html'], async (req, res, next) => {
      try {
        sendPage(req, res, await vite.transformIndexHtml(req.originalUrl, fs.readFileSync(path.resolve('index.html'), 'utf8')));
      } catch (err) { next(err); }
    });
    app.use(vite.middlewares);
  } else {
    if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error(`빌드 결과가 없습니다: ${DIST} (npm run build)`);
    const page = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
    withCurrency(page, 'NZD'); // 시작할 때 한 번 확인(통화 표시를 넣을 자리가 없으면 바로 알림)
    app.get(['/', '/index.html'], (req, res) => sendPage(req, res, page));
    app.use(express.static(DIST, {
      index: false,
      setHeaders(res, file) {
        const rel = path.relative(DIST, file).split(path.sep).join('/');
        if (rel.startsWith('assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        else if (rel.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
        else res.setHeader('Cache-Control', 'public, max-age=604800');
      },
    }));
    // 예전 주소(/promo-image 등)는 첫 화면으로. 파일 요청(확장자 있음)은 404
    app.use((req, res) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.status(404).end(); return; }
      if (path.extname(req.path)) { res.status(404).type('text/plain').send('Not found'); return; }
      res.redirect(301, '/');
    });
  }
  return app;
}

/** Vercel 함수(scripts/vercel.mjs)는 이 약속을 받아 요청을 넘김. 그 밖에서는 바로 포트를 염 */
export const ready = setup();
if (!process.env.VERCEL) {
  ready.then((a) => a.listen(PORT, '0.0.0.0', () => console.log(`http://localhost:${PORT}`))).catch((err) => { console.error(err); process.exit(1); });
}
