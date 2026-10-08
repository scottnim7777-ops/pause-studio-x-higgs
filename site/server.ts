/**
 * PAUSE STUDIO 서버: 정적 파일 + 상담 신청(/api/contact)
 * - 메일: SMTP(SMTP_HOST/PORT/USER/PASS) → 실패하거나 설정이 없으면 FormSubmit으로 대신 보냄(기존 사이트와 같은 방식)
 * - 성공을 확인했을 때만 { ok: true } (화면은 이것을 받아야 '접수 완료'를 보여줌)
 * - 보안: TLS 인증서 검증을 끄지 않음, 상담 내용·연락처를 로그나 파일에 남기지 않음, 같은 곳에서 짧은 시간에 너무 많이 보내면 거절
 */
import express, { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import path from 'node:path';
import fs from 'node:fs';
import { consult } from './src/content/ko';

const PORT = Number(process.env.PORT || 3000);
const TO = process.env.CONTACT_TO || 'scottnim7777@gmail.com';
const DIST = path.resolve(process.env.STATIC_DIR || 'dist');
const PROD = process.env.NODE_ENV === 'production';
const MAX_TOTAL = 25 * 1024 * 1024;

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
const F = consult.fields as Record<string, string | string[]>;
const ORDER: [string, string][] = [
  ['consultType', '상담 종류'],
  ...['company', 'name', 'email', 'phone', 'country', 'industry', 'currentSite', 'product', 'needs', 'itemCount', 'bookingPay', 'integrations',
    'videoUse', 'videoLength', 'photos', 'mood', 'automation', 'systems', 'timeline', 'message']
    .map((k): [string, string] => [k, String(F[k])]),
];
const clean = (v: unknown, max = 5000) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
const oneLine = (v: unknown, max = 120) => clean(v, max).replace(/[\r\n]+/g, ' ');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function compose(body: Record<string, unknown>) {
  const rows: [string, string][] = [];
  for (const [key, label] of ORDER) {
    const v = body[key];
    const val = Array.isArray(v) ? v.map((x) => clean(x, 200)).filter(Boolean).join(', ') : clean(v);
    if (val) rows.push([label, val]);
  }
  const type = oneLine(body.consultType, 60) || '상담';
  const name = oneLine(body.name, 60) || '이름 없음';
  const email = oneLine(body.email, 200);
  const page = oneLine(body._page, 300);
  const text = [`${consult.title}`, '', ...rows.map(([k, v]) => `■ ${k}\n${v}`), '', `보낸 페이지: ${page || '-'}`, `받은 시각: ${new Date().toISOString()}`].join('\n');
  return { subject: `[브랜딩 상담] ${type} · ${name}`, text, rows, replyTo: EMAIL_RE.test(email) ? email : undefined };
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
    fd.append('_template', 'box');
    fd.append('_captcha', 'false');
    if (m.replyTo) fd.append('_replyto', m.replyTo);
    m.rows.forEach(([k, v]) => fd.append(k, v));
    files.forEach((f) => fd.append('attachment', new Blob([new Uint8Array(f.buffer)], { type: f.mimetype }), f.originalname));
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TO)}`, { method: 'POST', body: fd, headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000) });
    const data = await res.json().catch(() => ({})) as { success?: string | boolean; message?: string };
    const ok = res.ok && String(data.success) === 'true';
    if (!ok) console.error('FormSubmit 실패:', res.status, oneLine(data.message, 200));
    return ok;
  } catch (err) {
    console.error('FormSubmit 오류:', (err as Error).message);
    return false;
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
  const ok = (await viaSmtp(m, files)) || (await viaFormSubmit(m, files));
  console.log(`상담 신청: ${ok ? '전송됨' : '전송 실패'} (${oneLine(body.consultType, 40) || '-'}, 첨부 ${files.length}개)`);
  res.status(ok ? 200 : 502).json({ ok });
});

app.get('/api/health', (_req, res) => { res.json({ ok: true }); });

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

async function start() {
  if (!PROD) {
    // 개발: Vite가 index.html·스크립트·스타일을 바로 처리
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error(`빌드 결과가 없습니다: ${DIST} (npm run build)`);
    app.use(express.static(DIST, {
      index: 'index.html',
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
  app.listen(PORT, '0.0.0.0', () => console.log(`http://localhost:${PORT}`));
}

start().catch((err) => { console.error(err); process.exit(1); });
