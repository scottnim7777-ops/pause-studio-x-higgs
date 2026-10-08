/**
 * 브랜딩 무료 상담 신청(모달)
 * - 상담 종류: 웹사이트 제작 · AI 광고영상 · 둘 다 함께 · AI 업무 자동화/맞춤 개발 → 종류에 맞는 질문만 보여줌
 * - 서비스·요금 버튼에서 열면 종류(와 상품)를 미리 골라 둠(data-type · data-field · data-value)
 * - 열고 닫을 때와 단계를 넘길 때 짧은 움직임(앞으로/뒤로 방향)
 * - 서버(/api/contact)가 실제로 성공(2xx + ok)을 돌려줄 때만 '접수 완료'. 실패하면 메일 앱·복사·카카오톡으로 같은 내용을 보낼 수 있게
 */
import { consult as C, contact } from '../content/ko';
import { animateCancel, closeDialog, closeMenu } from './ui';

const MAX_BYTES = 25 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** 상담 종류(문구 파일의 순서) → 보여줄 상세 질문 묶음 */
const DETAILS: Record<string, string[]> = Object.fromEntries(
  C.types.map((t, i) => [t.value, [['web'], ['film'], ['web', 'film'], ['ax']][i] ?? []]),
);

export function initConsult() {
  const dlg = document.querySelector<HTMLDialogElement>('#consult');
  const form = dlg?.querySelector<HTMLFormElement>('[data-consult-form]');
  if (!dlg || !form || typeof dlg.showModal !== 'function') return; // 오래된 브라우저: 버튼이 문의 섹션으로 이동
  const q = <T extends Element = HTMLElement>(s: string) => form.querySelector<T>(s);
  const qa = <T extends Element = HTMLElement>(s: string) => [...form.querySelectorAll<T>(s)];
  const stepsEl = qa('[data-step]');
  const prog = qa('.cs-prog li');
  const btnPrev = q<HTMLButtonElement>('[data-cs-prev]')!;
  const btnNext = q<HTMLButtonElement>('[data-cs-next]')!;
  const btnSubmit = q<HTMLButtonElement>('[data-cs-submit]')!;
  const foot = q('[data-cs-foot]')!;
  const body = q('.cs-body')!;
  const submitLabel = btnSubmit.querySelector('.lb')!;
  let step: number | 'done' | 'fail' = 0;
  let sending = false;
  let plain = ''; // 요약(메일·복사용)

  // 오류 문구 연결(화면 읽기 프로그램이 함께 읽도록)
  qa<HTMLElement>('.fld').forEach((f, i) => {
    const ctl = f.querySelector<HTMLInputElement>('input:not([type=checkbox]):not([type=radio]), textarea');
    const err = f.querySelector<HTMLElement>('.err');
    if (ctl && err) { err.id = `cs-err-${i}`; ctl.setAttribute('aria-describedby', err.id); }
  });

  const typeValue = () => q<HTMLInputElement>('input[name="consultType"]:checked')?.value ?? '';

  function showDetails() {
    const want = DETAILS[typeValue()] ?? [];
    qa<HTMLElement>('[data-detail]').forEach((d) => {
      const key = d.dataset.detail!;
      const on = key === 'common' || want.includes(key);
      d.hidden = !on;
      // 숨긴 질문은 보내지 않음(다른 종류를 골랐다가 바꿔도 섞이지 않게)
      d.querySelectorAll<HTMLInputElement>('input, textarea, select').forEach((el) => { el.disabled = !on; });
    });
  }

  function setError(el: Element | null, msg: string) {
    if (!el) return;
    const fld = el.closest('.fld') ?? el.parentElement;
    const err = (el.matches('.err') ? el : fld?.querySelector('.err')) as HTMLElement | null;
    if (err) { err.textContent = msg; err.hidden = !msg; }
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validate(n: number): boolean {
    let first: HTMLElement | null = null;
    const fail = (el: HTMLElement | null, msg: string) => { setError(el, msg); if (!first && el) first = el; };
    if (n === 0) {
      const err = q('[data-err="type"]');
      if (!typeValue()) fail(err, C.errors.type); else setError(err, '');
      if (first) { q<HTMLInputElement>('input[name="consultType"]')?.focus(); return false; }
    }
    if (n === 1) {
      const name = q<HTMLInputElement>('input[name="name"]')!;
      const email = q<HTMLInputElement>('input[name="email"]')!;
      name.value = name.value.trim(); email.value = email.value.trim();
      if (!name.value) fail(name, C.errors.name); else setError(name, '');
      if (!EMAIL_RE.test(email.value)) fail(email, C.errors.email); else setError(email, '');
    }
    if (n === 2) {
      const files = q<HTMLInputElement>('input[type="file"]')!;
      const total = [...(files.files ?? [])].reduce((a, f) => a + f.size, 0);
      if (total > MAX_BYTES) fail(files, C.errors.files); else setError(files, '');
    }
    if (first) (first as HTMLElement).focus();
    return !first;
  }

  /** 요약: 화면에 보이는 질문 순서대로(라벨은 화면 문구 그대로) */
  function summary(): { rows: [string, string][]; text: string } {
    const rows: [string, string][] = [['상담 종류', typeValue()]];
    const steps = [q('[data-step="1"]')!, q('[data-step="2"]')!];
    steps.forEach((st) => st.querySelectorAll<HTMLElement>('.fld').forEach((f) => {
      if (f.closest('[hidden]')) return;
      const labelEl = f.querySelector(':scope > legend, :scope > span');
      const label = (labelEl?.firstChild?.textContent ?? labelEl?.textContent ?? '').trim();
      let value = '';
      const checks = [...f.querySelectorAll<HTMLInputElement>('input[type=checkbox]:checked, input[type=radio]:checked')];
      if (checks.length) value = checks.map((c) => c.value).join(', ');
      const ctl = f.querySelector<HTMLInputElement>('input:not([type=checkbox]):not([type=radio]), textarea');
      if (ctl && !ctl.disabled) {
        if (ctl.type === 'file') value = [...(ctl.files ?? [])].map((x) => `${x.name} (${(x.size / 1024 / 1024).toFixed(1)}MB)`).join(', ');
        else value = ctl.value.trim();
      }
      if (label && value) rows.push([label, value]);
    }));
    const text = [`[${C.title}]`, ...rows.map(([k, v]) => `${k}: ${v}`), '', `보낸 곳: ${location.origin}${location.pathname}`].join('\n');
    return { rows, text };
  }

  function renderSummary() {
    const { rows, text } = summary();
    plain = text;
    const dl = q('[data-summary]')!;
    dl.replaceChildren(...rows.map(([k, v]) => {
      const div = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      div.append(dt, dd);
      return div;
    }));
  }

  function goto(n: number | 'done' | 'fail') {
    form!.dataset.dir = typeof n === 'number' && typeof step === 'number' && n < step ? 'b' : 'f';
    step = n;
    stepsEl.forEach((s) => { s.hidden = s.dataset.step !== String(n); });
    const num = typeof n === 'number' ? n : 4;
    prog.forEach((li, i) => {
      if (i === num) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      li.classList.toggle('done', i < num);
    });
    foot.hidden = typeof n !== 'number';
    btnPrev.hidden = n === 0 || typeof n !== 'number';
    btnNext.hidden = n === 3;
    btnSubmit.hidden = n !== 3;
    if (n === 2) showDetails();
    if (n === 3) renderSummary();
    if (n === 'fail') prepareFallback();
    body.scrollTop = 0;
    const cur = stepsEl.find((s) => !s.hidden);
    const target = n === 3 || typeof n !== 'number'
      ? cur?.querySelector<HTMLElement>('h3')
      : cur?.querySelector<HTMLElement>('input:not([disabled]):not([type=hidden]), textarea:not([disabled])');
    if (target) {
      if (target.tagName === 'H3') target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }

  function reset() {
    form!.reset();
    qa('.err').forEach((e) => { e.textContent = ''; e.hidden = true; });
    qa('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
    showDetails();
  }

  function open(type?: string, field?: string, value?: string) {
    closeMenu();
    if (step === 'done') reset();
    if (type) {
      const r = qa<HTMLInputElement>('input[name="consultType"]').find((x) => x.value === type);
      if (r) r.checked = true;
    }
    if (field && value) {
      const p = qa<HTMLInputElement>(`input[name="${CSS.escape(field)}"]`).find((x) => x.value === value);
      if (p) p.checked = true;
    }
    showDetails();
    dlg!.showModal();
    document.documentElement.classList.add('modal-open');
    goto(type && typeValue() ? 1 : 0);
    form!.dataset.dir = 'f';
  }

  async function send() {
    if (sending) return;
    sending = true;
    btnSubmit.setAttribute('aria-busy', 'true');
    const prevLabel = submitLabel.textContent;
    submitLabel.textContent = C.sending;
    const fd = new FormData();
    for (const [k, v] of new FormData(form!)) {
      if (v instanceof File && !v.name && v.size === 0) continue; // 첨부 없음
      fd.append(k, v);
    }
    fd.append('_page', `${location.origin}${location.pathname}`);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 60000);
    let ok = false;
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: fd, headers: { Accept: 'application/json' }, signal: ctrl.signal });
      const data = await res.json().catch(() => ({}));
      ok = res.ok && (data as { ok?: boolean }).ok === true;
    } catch { ok = false; }
    clearTimeout(timer);
    sending = false;
    btnSubmit.removeAttribute('aria-busy');
    submitLabel.textContent = prevLabel;
    goto(ok ? 'done' : 'fail');
  }

  function prepareFallback() {
    const mail = q<HTMLAnchorElement>('[data-cs-mail]');
    if (mail) {
      const subject = `[${C.title}] ${typeValue()}`;
      const bodyText = plain.length > 1800 ? `${plain.slice(0, 1800)}\n…` : plain;
      mail.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    }
  }

  async function copy(btn: HTMLButtonElement) {
    const lb = btn.querySelector('.lb')!;
    const before = lb.textContent;
    let done = false;
    try { await navigator.clipboard.writeText(plain); done = true; } catch {
      const ta = document.createElement('textarea');
      ta.value = plain; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      form!.append(ta); ta.select();
      try { done = document.execCommand('copy'); } catch { done = false; }
      ta.remove();
    }
    if (done) { lb.textContent = C.failure.copied; setTimeout(() => { lb.textContent = before; }, 2200); }
  }

  /* ── 이벤트 */
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLElement>('[data-consult]');
    if (!a) return;
    e.preventDefault();
    open(a.dataset.type, a.dataset.field, a.dataset.value);
  });
  btnNext.addEventListener('click', () => { if (typeof step === 'number' && validate(step)) goto(step + 1); });
  btnPrev.addEventListener('click', () => { if (typeof step === 'number' && step > 0) goto(step - 1); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (typeof step !== 'number') return;
    if (step < 3) { if (validate(step)) goto(step + 1); return; }
    if (q<HTMLInputElement>('input[name="_hp"]')?.value) { goto('done'); return; } // 자동 입력 프로그램
    send();
  });
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'consultType') { setError(q('[data-err="type"]'), ''); showDetails(); }
    if (t.type === 'file') validate(2);
  });
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.getAttribute('aria-invalid') === 'true') setError(t, '');
  });
  dlg.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t === dlg || t.closest('[data-cs-close]')) closeDialog(dlg);
    const cp = t.closest<HTMLButtonElement>('[data-cs-copy]');
    if (cp) copy(cp);
  });
  animateCancel(dlg);
  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('modal-open');
    if (step === 'done') { reset(); goto(0); }
  });
  showDetails();
}
