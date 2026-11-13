import { fix } from './engine.js';

// The full guideline is not public. Locally it sits next to this folder; on the published
// site the link is hidden unless FULL_GUIDE_PUBLIC_URL is set.
const FULL_GUIDE_LOCAL = '../tur_Latn_TR_annex.html';
const FULL_GUIDE_PUBLIC_URL = '';
const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
const FULL_GUIDE_URL = isLocal ? FULL_GUIDE_LOCAL : FULL_GUIDE_PUBLIC_URL;

const $ = id => document.getElementById(id);
const editEl = $('edit'), outEl = $('output'), notesEl = $('notes');
const pop = $('pop');

// ---------- storage (best effort) ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem(`ph.${k}`); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(`ph.${k}`, JSON.stringify(v)); } catch { /* private mode */ } },
};

const state = {
  ignore: new Set(store.get('ignore', [])),
  accept: new Set(store.get('accept', [])),
  names: store.get('names', ''),
  orig: store.get('orig', ''), // the ASR text as first pasted: the baseline for the diff
  result: null,
};
const extraNames = () => state.names.split('\n').map(s => s.trim()).filter(Boolean);
const run = text => fix(text, { ignore: state.ignore, accept: state.accept, extraNames: extraNames() });
const saveChoices = () => { store.set('ignore', [...state.ignore]); store.set('accept', [...state.accept]); };

// ---------- init ----------
if (FULL_GUIDE_URL) $('full-guide').href = FULL_GUIDE_URL; else $('full-guide').hidden = true;
editEl.value = store.get('edit', '');
$('names').value = state.names;
updateNamesCount();

// ---------- original (diff baseline) ----------
const wordCount = s => (s.trim() ? s.trim().split(/\s+/).length : 0);
function setOrig(text) {
  state.orig = text;
  store.set('orig', text);
  $('orig-view').textContent = text;
  updateOrigBar();
}
function updateOrigBar() {
  const has = !!state.orig.trim();
  $('orig-status').textContent = has ? `Original saved · ${wordCount(state.orig)} words` : (editEl.value.trim() ? 'No original saved, so the diff is off' : '');
  $('orig-show').hidden = !has;
  $('orig-set').hidden = has || !editEl.value.trim();
  if (!has) $('orig-view').hidden = true;
  $('orig-show').textContent = $('orig-view').hidden ? 'View original' : 'Hide original';
  $('diff-toggle').disabled = !has;
}
$('orig-show').onclick = () => { $('orig-view').hidden = !$('orig-view').hidden; updateOrigBar(); };
$('orig-set').onclick = () => setOrig(editEl.value);
$('orig-view').textContent = state.orig;

// Pasting into an empty edit box saves that paste as the original.
editEl.addEventListener('paste', () => {
  if (editEl.value.trim()) return;
  setTimeout(() => {
    setOrig(editEl.value);
    store.set('edit', editEl.value);
    update();
    editEl.setSelectionRange(0, 0);
    editEl.scrollTop = 0;
    toast('Original saved for the diff');
  }, 0);
});

// ---------- edit box ----------
let timer;
editEl.addEventListener('input', () => {
  store.set('edit', editEl.value);
  updateOrigBar();
  clearTimeout(timer);
  timer = setTimeout(update, 120);
});

// ---------- final box ----------
$('diff-toggle').onchange = update;
$('back-to-edit').onclick = () => {
  if (!state.result) return;
  editEl.value = state.result.text;
  store.set('edit', editEl.value);
  update();
  toast('Your edit now holds the corrected text');
};
$('copy').onclick = async () => {
  if (!state.result) return;
  try { await navigator.clipboard.writeText(state.result.text); toast('Copied'); }
  catch {
    const ta = document.createElement('textarea'); ta.value = state.result.text; document.body.append(ta); ta.select();
    document.execCommand('copy'); ta.remove(); toast('Copied');
  }
};
$('new-rec').onclick = () => {
  if (editEl.value && !confirm('Clear the text and the saved original for a new recording?')) return;
  editEl.value = '';
  state.ignore.clear(); state.accept.clear(); saveChoices();
  store.set('edit', '');
  $('diff-toggle').checked = false;
  setOrig('');
  update(); editEl.focus();
};
$('names').addEventListener('input', e => {
  state.names = e.target.value; store.set('names', state.names); updateNamesCount();
  clearTimeout(timer); timer = setTimeout(update, 300);
});
function updateNamesCount() { const n = extraNames().length; $('names-count').textContent = n ? `(${n})` : ''; }

// ---------- rendering ----------
const LEVEL_RANK = { warn: 5, suggest: 4, check: 3, fix: 2, info: 1 };
const topLevel = notes => notes.reduce((a, n) => (LEVEL_RANK[n.level] > LEVEL_RANK[a] ? n.level : a), 'info');

function update() {
  hidePop();
  const r = run(editEl.value);
  state.result = r;
  if ($('diff-toggle').checked && state.orig.trim()) renderDiff(state.orig, r.text);
  else renderOutput(r);
  renderNotes(r);
  const c = { fix: 0, check: 0, suggest: 0, warn: 0, info: 0 };
  r.notes.forEach(n => c[n.level]++);
  $('summary').textContent = editEl.value.trim()
    ? `${c.fix + c.check} fixed · ${c.check + c.suggest} to check · ${c.warn} need you`
    : '';
}

function renderOutput(r) {
  outEl.replaceChildren();
  for (const { sep, tok, idx } of r.segs) {
    if (sep) outEl.append(sep);
    const notes = tok.notes;
    const isTag = tok.type === 'tag' || tok.type === 'atag';
    if (!notes.length && !tok.deleted) {
      if (isTag) { const s = document.createElement('span'); s.className = 'tagtok'; s.textContent = tok.text; outEl.append(s); }
      else outEl.append(tok.text);
      continue;
    }
    if (tok.deleted && !notes.length) continue;
    const s = document.createElement('span');
    s.className = `mk lv-${topLevel(notes)}${tok.deleted ? ' del' : ''}${isTag ? ' tagtok' : ''}`;
    s.dataset.idx = idx;
    s.textContent = tok.deleted ? notes[0].from : tok.text;
    s.title = notes.map(n => n.msg).join('\n');
    if (tok.deleted && tok.type === 'word') outEl.append(' '); // struck-out punctuation sits tight against its word
    outEl.append(s);
  }
}

function renderNotes(r) {
  notesEl.replaceChildren();
  const order = ['warn', 'suggest', 'check', 'info'];
  const list = r.notes.filter(n => n.level !== 'fix').sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level) || a.start - b.start);
  $('notes-count').textContent = list.length ? `${list.length}` : '';
  for (const n of list) {
    const li = document.createElement('li');
    const dot = document.createElement('span'); dot.className = `dot ${n.level}`;
    const what = document.createElement('span'); what.className = 'what';
    what.textContent = n.to && n.to !== n.from ? `${n.from} → ${n.to}` : n.from;
    const msg = document.createElement('span'); msg.className = 'msg'; msg.textContent = n.msg;
    li.append(dot, what, msg);
    li.onclick = () => { selectInEditor(n.start, n.end); flashMark(n.idx); };
    notesEl.append(li);
  }
}

function selectInEditor(start, end) {
  editEl.focus();
  editEl.setSelectionRange(start, end);
  // scroll the textarea roughly to the selection
  const before = editEl.value.slice(0, start).split('\n').length;
  const lh = parseFloat(getComputedStyle(editEl).lineHeight) || 24;
  editEl.scrollTop = Math.max(0, (before - 3) * lh);
}
function flashMark(idx) {
  const el = outEl.querySelector(`[data-idx="${idx}"]`);
  if (!el) return;
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}

// ---------- popover ----------
outEl.addEventListener('click', e => {
  const s = e.target.closest('.mk');
  if (!s || !state.result) return;
  showPop(s, state.result.tokens[+s.dataset.idx]);
  e.stopPropagation();
});
document.addEventListener('click', e => { if (!pop.contains(e.target)) hidePop(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePop(); });

function btn(label, fn, primary = false) {
  const b = document.createElement('button');
  b.className = primary ? 'primary small' : 'small';
  b.textContent = label;
  b.onclick = ev => { ev.stopPropagation(); fn(); };
  return b;
}

function showPop(anchor, tok) {
  pop.replaceChildren();
  for (const n of tok.notes) {
    const row = document.createElement('div'); row.className = 'row';
    const chg = document.createElement('div'); chg.className = 'chg';
    chg.textContent = n.to !== undefined && n.to !== n.from ? `${n.from} → ${n.to || '(removed)'}` : n.from;
    const msg = document.createElement('div'); msg.className = 'msg'; msg.textContent = n.msg;
    const btns = document.createElement('div'); btns.className = 'btns';
    if (n.level === 'suggest') {
      btns.append(btn(`Use “${n.alt}”`, () => { state.accept.add(n.key); state.ignore.delete(n.key); saveChoices(); update(); }, true));
      btns.append(btn('Dismiss', () => { state.ignore.add(n.key); saveChoices(); update(); }));
    } else if (n.level === 'fix' || n.level === 'check') {
      if (n.accepted) btns.append(btn('Undo', () => { state.accept.delete(n.key); saveChoices(); update(); }));
      else btns.append(btn(`Keep “${n.from}”`, () => { state.ignore.add(n.key); saveChoices(); update(); }));
    } else {
      btns.append(btn('Dismiss', () => { state.ignore.add(n.key); saveChoices(); update(); }));
    }
    if (n.rule === 'case-after-tag' || n.rule === 'name-apostrophe' || n.rule === 'date') {
      const name = n.from.split('’')[0];
      btns.append(btn(`“${name}” is a name`, () => {
        state.names = (state.names.trim() ? `${state.names.trim()}\n` : '') + name;
        $('names').value = state.names; store.set('names', state.names); updateNamesCount(); update();
      }));
    }
    btns.append(btn('Find in my text', () => { hidePop(); selectInEditor(tok.start, tok.end); }));
    row.append(chg, msg, btns);
    pop.append(row);
  }
  pop.hidden = false;
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  const left = Math.min(Math.max(8, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - w - 8);
  pop.style.left = `${left}px`;
  pop.style.top = `${r.bottom + window.scrollY + 6}px`;
}
function hidePop() { pop.hidden = true; }

// ---------- diff vs ASR ----------
function renderDiff(a, b) {
  outEl.replaceChildren();
  const A = a.split(/(\s+)/).filter(x => x.trim()), B = b.split(/(\s+)/).filter(x => x.trim());
  const n = A.length, m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0;
  const push = (cls, t) => {
    if (outEl.childNodes.length) outEl.append(' ');
    if (!cls) outEl.append(t);
    else { const s = document.createElement('span'); s.className = cls; s.textContent = t; outEl.append(s); }
  };
  while (i < n || j < m) {
    if (i < n && j < m && A[i] === B[j]) { push('', B[j]); i++; j++; }
    else if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) { push('d-ins', B[j]); j++; }
    else { push('d-del', A[i]); i++; }
  }
  }

// ---------- toast ----------
let toastTimer;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 1600);
}

// first render, once everything above is defined
updateOrigBar();
update();
