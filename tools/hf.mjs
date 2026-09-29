#!/usr/bin/env node
// Higgsfield REST API 클라이언트 (공식 SDK higgsfield-js v2와 같은 규약)
//  - POST https://api.higgsfield.ai/{endpoint}  본문 = 입력 파라미터(JSON)
//  - GET  /requests/{request_id}/status  → queued | in_progress | completed | failed | nsfw
//  - 인증: Authorization: Key KEY_ID:KEY_SECRET  (HF_CREDENTIALS, 또는 .env.local)
// 규칙: 자격 증명은 출력하지 않는다. 같은 label로 두 번 제출하지 않는다(유료 중복 방지).
//       제출 응답을 못 받은 경우(타임아웃 등) 'submission_unknown'으로 기록하고 자동 재시도하지 않는다.
// 사용: NODE_USE_ENV_PROXY=1 node tools/hf.mjs <command> ...
//   submit <label> <endpoint> <input.json> [--note "..."]
//   status <label>          한 번 조회
//   wait <label> [maxSec]   끝날 때까지 폴링(기본 900초)
//   download <label>        결과 파일을 higgsfield/raw/<label>/ 에 저장(sha256 기록)
//   upload <file>           /files/generate-upload-url → PUT, public_url 기록
//   list                    기록된 작업 요약
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const JOBS = path.join(ROOT, 'higgsfield', 'jobs');
const RAW = path.join(ROOT, 'higgsfield', 'raw');
const UPLOADS = path.join(ROOT, 'higgsfield', 'uploads.json');
const BASE = process.env.HF_BASE_URL || 'https://api.higgsfield.ai';

function credentials() {
  let c = process.env.HF_CREDENTIALS;
  if (!c && process.env.HF_API_KEY && process.env.HF_API_SECRET) c = `${process.env.HF_API_KEY}:${process.env.HF_API_SECRET}`;
  if (!c) {
    const f = path.join(ROOT, '.env.local');
    if (fs.existsSync(f)) {
      const m = fs.readFileSync(f, 'utf8').match(/^HF_CREDENTIALS=(.+)$/m);
      if (m) c = m[1].trim();
    }
  }
  if (!c || !c.includes(':')) throw new Error('HF_CREDENTIALS(KEY_ID:KEY_SECRET)가 없습니다. 환경 변수나 .env.local에 설정하세요.');
  return c;
}

async function api(method, url, body, { timeoutMs = 120000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url.startsWith('http') ? url : BASE + url, {
      method,
      headers: { Authorization: `Key ${credentials()}`, 'Content-Type': 'application/json', 'User-Agent': 'pause-studio-renewal/1.0' },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 2000) }; }
    if (!res.ok) {
      const hint = { 400: '잘못된 입력', 401: '자격 증명 오류', 403: '잔액 부족', 422: '파라미터 검증 실패' }[res.status] || 'API 오류';
      const err = new Error(`${hint} (HTTP ${res.status}): ${JSON.stringify(data.detail ?? data).slice(0, 800)}`);
      err.status = res.status; err.data = data; throw err;
    }
    return data;
  } finally { clearTimeout(t); }
}

const jobPath = (label) => path.join(JOBS, `${label}.json`);
const readJob = (label) => JSON.parse(fs.readFileSync(jobPath(label), 'utf8'));
const writeJob = (label, job) => { fs.mkdirSync(JOBS, { recursive: true }); fs.writeFileSync(jobPath(label), JSON.stringify(job, null, 2) + '\n'); };
const now = () => new Date().toISOString();

async function submit(label, endpoint, inputFile, note) {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(label)) throw new Error('label은 영문·숫자·._- 만 사용');
  if (fs.existsSync(jobPath(label))) {
    const j = readJob(label);
    throw new Error(`이미 제출 기록이 있는 label입니다(${j.status}, request_id=${j.request_id ?? '없음'}). 중복 유료 제출을 막기 위해 중단합니다.`);
  }
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const job = { label, endpoint, input, note: note || '', submitted_at: now(), status: 'submitting', history: [] };
  writeJob(label, job); // 제출 전에 먼저 기록 → 응답 유실 시에도 흔적이 남음
  try {
    const r = await api('POST', `/${endpoint.replace(/^\//, '')}`, input, { timeoutMs: 180000 });
    Object.assign(job, { status: r.status, request_id: r.request_id, status_url: r.status_url, cancel_url: r.cancel_url, response: r });
    job.history.push({ at: now(), status: r.status });
    writeJob(label, job);
    console.log(JSON.stringify({ label, request_id: r.request_id, status: r.status }));
  } catch (e) {
    job.status = e.status ? 'rejected' : 'submission_unknown';
    job.error = String(e.message);
    job.history.push({ at: now(), status: job.status, error: job.error });
    writeJob(label, job);
    throw new Error(`${job.status}: ${e.message}${job.status === 'submission_unknown' ? ' — 제출 여부 불명. 재제출하지 말고 콘솔에서 확인할 것.' : ''}`);
  }
}

async function status(label) {
  const job = readJob(label);
  if (!job.request_id) throw new Error(`request_id 없음(status=${job.status})`);
  const r = await api('GET', `/requests/${job.request_id}/status`);
  job.status = r.status; job.response = r; job.checked_at = now();
  if (job.history.at(-1)?.status !== r.status) job.history.push({ at: now(), status: r.status });
  writeJob(label, job);
  return job;
}

async function wait(label, maxSec = 900) {
  const t0 = Date.now(); let delay = 4000;
  for (;;) {
    let job;
    try { job = await status(label); }
    catch (e) { if (e.status && e.status < 500) throw e; console.error(`조회 일시 오류, 재조회: ${e.message}`); }
    if (job && ['completed', 'failed', 'nsfw', 'canceled', 'cancelled'].includes(job.status)) {
      console.log(JSON.stringify({ label, status: job.status, images: job.response.images?.length ?? 0, video: !!job.response.video }));
      return job;
    }
    if ((Date.now() - t0) / 1000 > maxSec) { console.log(JSON.stringify({ label, status: job?.status, note: '대기 시간 초과 — 작업은 계속 진행 중일 수 있음. 재제출 금지, 나중에 status로 확인.' })); return job; }
    await new Promise((r) => setTimeout(r, delay)); delay = Math.min(delay * 1.4, 20000);
  }
}

async function download(label) {
  const job = readJob(label);
  if (job.status !== 'completed') throw new Error(`완료되지 않은 작업(status=${job.status})`);
  const urls = [...(job.response.images || []).map((i) => i.url), ...(job.response.video ? [job.response.video.url] : [])];
  const dir = path.join(RAW, label); fs.mkdirSync(dir, { recursive: true });
  job.files = [];
  for (const [i, u] of urls.entries()) {
    const res = await fetch(u);
    if (!res.ok) throw new Error(`다운로드 실패 HTTP ${res.status}: ${u}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = (new URL(u).pathname.match(/\.(png|jpe?g|webp|mp4|mov|webm|gif)$/i)?.[1] || (res.headers.get('content-type') || '').split('/')[1] || 'bin').toLowerCase();
    const f = path.join(dir, `${label}_${String(i + 1).padStart(2, '0')}.${ext}`);
    fs.writeFileSync(f, buf);
    job.files.push({ file: path.relative(ROOT, f), url: u, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex') });
  }
  job.downloaded_at = now(); writeJob(label, job);
  console.log(JSON.stringify(job.files.map((x) => x.file)));
}

async function upload(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const type = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', mp4: 'video/mp4' }[ext];
  if (!type) throw new Error('지원 형식: png jpg webp mp4');
  const r = await api('POST', '/files/generate-upload-url', { content_type: type });
  const put = await fetch(r.upload_url, { method: 'PUT', headers: { 'Content-Type': type }, body: fs.readFileSync(file) });
  if (!put.ok) throw new Error(`업로드 실패 HTTP ${put.status}`);
  const log = fs.existsSync(UPLOADS) ? JSON.parse(fs.readFileSync(UPLOADS, 'utf8')) : [];
  log.push({ file: path.relative(ROOT, path.resolve(file)), public_url: r.public_url, uploaded_at: now() });
  fs.writeFileSync(UPLOADS, JSON.stringify(log, null, 2) + '\n');
  console.log(r.public_url);
}

function list() {
  if (!fs.existsSync(JOBS)) return console.log('기록 없음');
  for (const f of fs.readdirSync(JOBS).filter((x) => x.endsWith('.json')).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(JOBS, f), 'utf8'));
    console.log(`${j.label.padEnd(28)} ${String(j.status).padEnd(18)} ${j.request_id ?? '-'}  ${j.endpoint}`);
  }
}

const [cmd, ...a] = process.argv.slice(2);
const noteIdx = a.indexOf('--note');
const note = noteIdx >= 0 ? a.splice(noteIdx, 2)[1] : '';
const run = { submit: () => submit(a[0], a[1], a[2], note), status: async () => { const j = await status(a[0]); console.log(JSON.stringify({ label: j.label, status: j.status })); }, wait: () => wait(a[0], Number(a[1] || 900)), download: () => download(a[0]), upload: () => upload(a[0]), list: async () => list() }[cmd];
if (!run) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 16).join('\n')); process.exit(1); }
run().catch((e) => { console.error(String(e.message).replace(/Key [^\s"]+/g, 'Key ***')); process.exit(1); });
