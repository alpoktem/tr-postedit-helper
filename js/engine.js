// Turkish ASR post-edit checker — the correction engine.
// Pure functions, no DOM: runs in the browser and in Node (tests).
//
//   fix(text, opts) → { text, segs, notes }
//
// Note levels:
//   fix     – applied; safe (green)
//   check   – applied; have a look (yellow)
//   suggest – NOT applied; click to apply (yellow outline)
//   warn    – nothing changed; needs the audio or a decision (red)
//   info    – reminder (grey)

import * as L from '../data/lexicon.js';
import * as N from '../data/names.js';

// ---------- helpers ----------
const trL = s => s.toLocaleLowerCase('tr-TR');
const trU = s => s.toLocaleUpperCase('tr-TR');
const capFirst = s => (s ? trU(s[0]) + s.slice(1) : s);
const lowFirst = s => (s ? trL(s[0]) + s.slice(1) : s);
const isUpperStart = s => /^\p{Lu}/u.test(s);
const isAllCaps = s => /\p{L}.*\p{L}/u.test(s) && s === trU(s);
const VOWELS = 'aeıioöuü';
const BACK = 'aıou';
const lastVowel = s => { for (let i = s.length - 1; i >= 0; i--) { const c = trL(s[i]); if (VOWELS.includes(c)) return c; } return null; };
const isBack = s => BACK.includes(lastVowel(s) || 'e');
const matchCase = (orig, repl) => (orig.length > 1 && isAllCaps(orig) ? trU(repl) : isUpperStart(orig) ? capFirst(repl) : repl);
// Key that ignores I/İ/ı/i confusion — for spotting Istanbul → İstanbul.
const dotKey = s => trL(s).replace(/ı/g, 'i');

// ---------- name index ----------
let BASE_NAMES = null;
function nameIndex(extra = []) {
  if (!BASE_NAMES) {
    BASE_NAMES = { lower: new Map(), dot: new Map() };
    for (const n of N.ALL_NAMES) {
      BASE_NAMES.lower.set(trL(n), n);
      const k = dotKey(n);
      BASE_NAMES.dot.set(k, BASE_NAMES.dot.has(k) && BASE_NAMES.dot.get(k) !== n ? null : n);
    }
  }
  const lower = new Map(BASE_NAMES.lower);
  for (const n of extra) if (n && n.trim()) lower.set(trL(n.trim()), n.trim());
  const ambiguous = new Set([...N.AMBIGUOUS].map(trL));
  const brands = new Map(N.BRAND_LIST.map(b => [trL(b), b]));
  return { lower, dot: BASE_NAMES.dot, ambiguous, brands, extra: new Set(extra.map(trL)) };
}

// ---------- tokenizer ----------
const WORD_CH = String.raw`[\p{L}\p{M}\p{N}%$€£¥&]`;
const TOKEN_RE = new RegExp([
  String.raw`(?<foreign>\{[^}]*\})`,
  String.raw`(?<tag>\[[^\]\n]*\])`,
  String.raw`(?<atag><\/?[\p{L}]+>)`,
  String.raw`(?<short>\*\/?\p{L}+)`,
  String.raw`(?<nl>\n+)`,
  String.raw`(?<sp>[^\S\n]+)`,
  String.raw`(?<ell>\.{2,}|…)`,
  String.raw`(?<word>${WORD_CH}(?:${WORD_CH}|['’‘](?=[\p{L}\p{N}])|[‐\-](?=\p{L})|(?<=\p{N})[.,:](?=\p{N}))*(?:-(?=\s|$|[,.?!]))?)`,
  String.raw`(?<punct>[.,?!:;"“”«»()\[\]{}<>—–\-'‘’/])`,
  String.raw`(?<other>[\s\S])`,
].join('|'), 'gu');

export function tokenize(text) {
  const toks = [];
  for (const m of text.matchAll(TOKEN_RE)) {
    const type = Object.keys(m.groups).find(k => m.groups[k] !== undefined);
    if (type === 'sp') continue;
    toks.push({ type, text: m[0], start: m.index, end: m.index + m[0].length, notes: [] });
  }
  return toks;
}

// ---------- context ----------
function makeCtx(opts) {
  const ignore = opts.ignore || new Set();
  const accept = opts.accept || new Set();
  const ctx = {
    names: nameIndex(opts.extraNames || []),
    key: (rule, from) => `${rule}|${trL(from)}`,
    // `from` lets a note describe a whole phrase (e.g. “beş yüz lira”) while living on one token.
    change(tok, rule, level, to, msg, from = tok.text) {
      if (to === tok.text) return false;
      const key = ctx.key(rule, from);
      if (ignore.has(key)) return false;
      tok.notes.push({ level, rule, msg, from, to, key, accepted: accept.has(key) });
      tok.text = to;
      return true;
    },
    suggest(tok, rule, alt, msg, from = tok.text) {
      const key = ctx.key(rule, from);
      if (accept.has(key)) return ctx.change(tok, rule, 'check', alt, msg, from);
      if (ignore.has(key)) return false;
      tok.notes.push({ level: 'suggest', rule, msg, from, to: alt, alt, key });
      return false;
    },
    del(tok, rule, level, msg, silent = false) {
      const key = ctx.key(rule, tok.text);
      if (ignore.has(key)) return false;
      if (!silent) tok.notes.push({ level, rule, msg, from: tok.text, to: '', key });
      tok.deleted = true;
      return true;
    },
    note(tok, level, rule, msg) {
      const key = ctx.key(rule, tok.text);
      if (ignore.has(key)) return;
      tok.notes.push({ level, rule, msg, from: tok.text, to: tok.text, key });
    },
    isName(word) {
      const w = word.split('’')[0];
      return ctx.names.lower.has(trL(w));
    },
  };
  return ctx;
}

const live = toks => toks.filter(t => !t.deleted);
function nextSig(toks, i) { for (let j = i + 1; j < toks.length; j++) if (!toks[j].deleted) return toks[j]; return null; }
function prevSig(toks, i) { for (let j = i - 1; j >= 0; j--) if (!toks[j].deleted) return toks[j]; return null; }
const isWord = t => t && t.type === 'word';
const isEnd = t => t && t.type === 'punct' && ['.', '?', '!'].includes(t.text);

// Mark which word/tag starts a sentence (start of a line, or after . ? !).
function markStarts(toks) {
  let start = true;
  let prevWord = null;
  let tagOpen = false; // a sentence-initial tag is waiting for its word
  const L2 = live(toks);
  for (let i = 0; i < L2.length; i++) {
    const t = L2[i];
    t.sStart = false;
    if (t.type === 'nl') { start = true; tagOpen = false; continue; }
    if (t.type === 'punct') {
      if (isEnd(t)) {
        // "3. kat": a period after a digit followed by a lowercase word is an ordinal, not a sentence end.
        const nx = L2[i + 1];
        const ordinal = t.text === '.' && prevWord && /^\p{N}+$/u.test(prevWord.text) && nx && isWord(nx) && !isUpperStart(nx.text);
        if (!ordinal) start = true;
      }
      continue;
    }
    if (t.type === 'atag') continue; // noise tags don't change the sentence position
    if (t.type === 'word' || t.type === 'tag' || t.type === 'foreign' || t.type === 'short') {
      t.sStart = start;
      t.postTag = t.type === 'word' && tagOpen;
      tagOpen = t.type === 'tag' ? (start || tagOpen) : false;
      start = false;
      if (t.type === 'word') prevWord = t;
    }
  }
}

// ---------- pass: characters ----------
function passChars(toks, ctx) {
  for (const t of toks) {
    if (t.type !== 'word') continue;
    const nfc = t.text.normalize('NFC').replace(/i̇/g, 'i');
    if (nfc !== t.text) t.text = nfc;
    const fixed = t.text
      .replace(/ș/g, 'ş').replace(/Ș/g, 'Ş').replace(/ǧ/g, 'ğ').replace(/Ǧ/g, 'Ğ')
      .replace(/['‘]/g, '’');
    if (fixed !== t.text) ctx.change(t, 'chars', 'fix', fixed, 'Typography: curly apostrophe ’ (U+2019) and Turkish ş/ğ (§3.7).');

    // Hyphens inside a word: compound (U+2010) or stammer (dash + space).
    if (/\p{L}-\p{L}/u.test(t.text)) {
      const parts = t.text.split('-');
      const last = trL(parts[parts.length - 1]);
      const stammer = parts.slice(0, -1).every(p => p && trL(p)[0] === last[0] && p.length < last.length);
      if (stammer) ctx.change(t, 'stammer', 'check', parts.join('- '), 'Broken-off word: dash + space (Ke- Ke- Kenan) (§3.12). Revert if it is a compound.');
      else ctx.change(t, 'hyphen', 'fix', t.text.replace(/(?<=\p{L})-(?=\p{L})/gu, '‐'), 'Inside a word use the hyphen ‐ (U+2010) (§3.7).');
    }

    // Istanbul → İstanbul, İşık → Işık (I/İ mix-up on a known name).
    const base = t.text.split('’')[0];
    const canon = ctx.names.dot.get(dotKey(base));
    if (canon && canon !== base && trL(canon) !== trL(base) && dotKey(canon) === dotKey(base)) {
      ctx.change(t, 'dotted-i', 'fix', canon + t.text.slice(base.length), 'Dotted/undotted i: İ is the capital of i, I of ı (§3.7).');
    }
  }
}

// ---------- pass: shorthand and tags ----------
function canonTag(raw) {
  const x = trL(raw).replace(/\s+/g, '');
  if (/^[ıi]+$/.test(x) && x.includes('ı')) return 'ııı';
  if (/^ı+$/.test(x)) return 'ııı';
  if (/^e{2,}$/.test(x)) return 'eee';
  if (/^h*m+$/.test(x) && x.length >= 2) return 'hmm';
  if (/^a+h+$/.test(x)) return 'ah';
  if (/^a+y+$/.test(x)) return 'ay';
  if (/^v+a+y+$/.test(x)) return 'vay';
  if (x === 'ha') return 'ha';
  if (/^ha{2,}$/.test(x)) return 'haa';
  if (/^ha+h+$/.test(x)) return 'hah';
  if (/^o+f+$/.test(x)) return 'off';
  if (/^u+f+$/.test(x)) return 'uff';
  if (/^u{2,}$/.test(x)) return 'uuu';
  if (/^ş+$/.test(x)) return 'şş';
  if (/^p+s*ş+t*$/.test(x)) return 'pşşt';
  return null;
}

// Bare shorthand typed without brackets. Only sounds that are never words.
function bareToTag(w, next) {
  if (/^e{2,}$/.test(w)) return ['eee'];
  if (/^ı{2,}$/.test(w)) return next && trL(next.text) === 'hı' ? null : ['ııı'];
  if (/^(h+m+|m{2,})$/.test(w)) return ['hmm'];
  if (/^va+y+$/.test(w)) return ['vay'];
  if (/^u{3,}$/.test(w)) return ['uuu'];
  if (/^ş{2,}$/.test(w)) return ['şş'];
  if (/^pş+t+$/.test(w)) return ['pşşt'];
  if (/^of{3,}$/.test(w)) return ['off']; // plain “off” is also the loan word (off günler): type *off
  if (/^uf{2,}$/.test(w)) return ['uff'];
  if (/^ı+m+$/.test(w)) return ['ııı', 'Sound not on the list: closest tag used. Note the recording ID for the language lead (§3.4).'];
  if (/^e+[mh]+$/.test(w)) return ['eee', 'Sound not on the list: closest tag used. Note the recording ID for the language lead (§3.4).'];
  return null;
}

function passTags(toks, ctx) {
  const atagCanon = n => (L.ATAGS.includes(n) ? n : L.ATAG_ALIASES[n] || null);
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.type === 'word') {
      const w = trL(t.text);
      const r = bareToTag(w, nextSig(toks, i));
      if (r) {
        if (ctx.change(t, 'shorthand', 'fix', `[${r[0]}]`, 'Hesitation tagged (§3.4).')) {
          t.type = 'tag'; t.canon = r[0];
          if (r[1]) ctx.note(t, 'info', 'closest-tag', r[1]);
        }
      } else if (L.ENGLISH_HESITATIONS.test(w)) {
        ctx.note(t, 'warn', 'english-hes', 'English hesitation spelling: use [ııı], [eee] or [hmm] (§3.4).');
      }
      continue;
    }
    if (t.type === 'short') {
      const name = trL(t.text.slice(1));
      const tag = canonTag(name);
      const at = atagCanon(name);
      if (tag && !at) { ctx.change(t, 'shorthand', 'fix', `[${tag}]`, 'Tag from shorthand.'); t.type = 'tag'; t.canon = tag; }
      else if (at) { ctx.change(t, 'shorthand', 'fix', `<${at}>`, 'Noise tag from shorthand.'); t.type = 'atag'; }
      else ctx.note(t, 'warn', 'unknown-short', `Unknown shorthand “${t.text}”. Tags: ${L.TAGS.join(' ')} · noises: ${L.ATAGS.join(' ')}`);
      continue;
    }
    if (t.type === 'tag') {
      const inner = trL(t.text.slice(1, -1).trim()).replace(/\s+/g, ' ');
      if (L.PLAIN_WORDS.includes(inner) || inner === 'e') {
        const word = t.text.slice(1, -1).trim();
        if (ctx.change(t, 'unbracket', inner === 'e' ? 'check' : 'fix', word, `“${inner}” has a meaning: plain word, never in brackets (§3.4).`)) t.type = 'word';
        continue;
      }
      if (L.ENGLISH_HESITATIONS.test(inner)) { ctx.note(t, 'warn', 'english-hes', 'English hesitation spelling: use [ııı], [eee] or [hmm] (§3.4).'); continue; }
      const c = canonTag(inner);
      if (!c) { ctx.note(t, 'warn', 'unknown-tag', `Not on the tag list. Use the closest of: ${L.TAGS.join(' ')}. Never invent tags (§3.4).`); continue; }
      t.canon = c;
      if (inner !== c) ctx.change(t, 'tag-norm', 'fix', `[${c}]`, 'One tag per sound, whatever its length (§3.4).');
      continue;
    }
    if (t.type === 'atag') {
      const name = trL(t.text.replace(/[<>]/g, ''));
      const slash = name.startsWith('/') ? '/' : '';
      const c = atagCanon(name.replace('/', ''));
      if (!c) ctx.note(t, 'warn', 'unknown-atag', `Unknown noise tag. Allowed: ${L.ATAGS.map(a => `<${a}>`).join(' ')}`);
      else ctx.change(t, 'atag-norm', 'fix', `<${slash}${c}>`, 'Noise tag normalized.');
    }
  }
}

// ---------- pass: punctuation ----------
function passPunct(toks, ctx) {
  let quoteOpen = false;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.deleted) continue;
    if (t.type === 'nl') { quoteOpen = false; continue; }
    if (t.type === 'ell') {
      const p = prevSig(toks, i), n = nextSig(toks, i);
      if (!p || p.type === 'nl' || (p.type === 'punct' && /[.?!,:]/.test(p.text)) || (n && n.type === 'punct' && /[.?!,:]/.test(n.text))) {
        ctx.del(t, 'ellipsis', 'fix', 'Ellipsis removed: never used (§3.6).');
      } else {
        t.type = 'punct';
        ctx.change(t, 'ellipsis', 'check', '.', 'Ellipsis is never used (§3.6). Replaced with a full stop — check: hesitation ([ııı]/[eee])? comma? the sentence goes on?');
      }
      continue;
    }
    if (t.type !== 'punct') continue;
    const n = nextSig(toks, i);
    switch (t.text) {
      case ';': ctx.change(t, 'semicolon', 'check', ',', 'No semicolons (§3.6). Comma or full stop?'); break;
      case '"': ctx.change(t, 'quotes', 'fix', quoteOpen ? '”' : '“', 'Curly quotes “ ” (§3.6).'); quoteOpen = !quoteOpen; break;
      case '“': quoteOpen = true; break;
      case '”': quoteOpen = false; break;
      case '«': ctx.change(t, 'quotes', 'fix', '“', 'Curly quotes “ ” (§3.6).'); break;
      case '»': ctx.change(t, 'quotes', 'fix', '”', 'Curly quotes “ ” (§3.6).'); break;
      case '?':
        if (n && n.type === 'punct' && n.text === '!') { ctx.change(t, 'interrobang', 'fix', '!', 'Surprised question is written !? (§3.6).'); n.text = '?'; }
        break;
      case ',': case '.':
        if (n && n.type === 'punct' && n.text === t.text) ctx.del(n, 'double-punct', 'fix', 'Doubled mark removed.');
        break;
      case '—': case '–': case '-':
        if (!n || n.type === 'nl') { if (t.text !== '—') ctx.change(t, 'cutoff', 'check', '—', 'Recording cut off: long dash — (§3.6). Remove it if the file ends after a full word.'); }
        else ctx.note(t, 'warn', 'dash', 'Dashes are not used for pauses or asides (§3.6). Use a comma, a hesitation tag, or nothing.');
        break;
      case '(': case ')': case '/':
        ctx.note(t, 'warn', 'bad-punct', `“${t.text}” is not allowed here (§3.6).`);
        break;
      default: break;
    }
  }
}

// ---------- pass: lexical ----------
const LAZY_YO = { '': 'yor', m: 'yorum', n: 'yorsun', z: 'yoruz', sun: 'yorsun', sunuz: 'yorsunuz', lar: 'yorlar', du: 'yordu', dum: 'yordum', dun: 'yordun', duk: 'yorduk', dunuz: 'yordunuz', muş: 'yormuş', sa: 'yorsa', sam: 'yorsam', san: 'yorsan', sak: 'yorsak' };
const LAZY_YO_RE = /^(.*[ıiuü])yo(m|n|z|sun|sunuz|lar|du|dum|dun|duk|dunuz|muş|sa|sam|san|sak)?$/;
// No -can/-cen (yapıcan → yapacaksın): it collides with nouns such as patlıcan.
const FUT1 = /^(.*[^aeıioöuü\s’])([ıiuü])c([ae])(m|z|k|ğ)(.*)$/;   // yapıcam, gelicem, yapıcak
const FUT2 = /^(.*[^aeıioöuü\s’])c([ae])(m|ğ)(.*)$/;                // yapcam, gelceğini
const NO_FUTURE = new Set(['ancak', 'kucak', 'bucak', 'sıcak', 'ılıcak', 'patlıcan']);

function futureFix(lw) {
  let m = lw.match(FUT1), stem, pers, rest;
  if (m) { [, stem, , , pers, rest] = m; }
  else if ((m = lw.match(FUT2))) { [, stem, , pers, rest] = m; }
  else return null;
  if (stem.length < 2 || !lastVowel(stem) || NO_FUTURE.has(lw)) return null;
  const back = isBack(stem);
  const base = stem + (back ? 'aca' : 'ece');
  if (pers === 'm') return rest ? null : base + (back ? 'ğım' : 'ğim');
  if (pers === 'z') return rest ? null : base + (back ? 'ğız' : 'ğiz');
  return base + pers + rest; // k / ğ + whatever follows
}

const MI_RE = /^(.{2,}?)(m[ıiuü])(sın|sin|sun|sün|sınız|siniz|sunuz|sünüz|yım|yim|yum|yüm|yız|yiz|yuz|yüz|ydı|ydi|ydu|ydü|ymış|ymiş|ymuş|ymüş|)$/;
const MI_VOWEL = { a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u', ö: 'ü', ü: 'ü' };
const KI_VERB = /(yor|yorum|yorsun|yoruz|d[ıiuü]|d[ıiuü]m|d[ıiuü]n|d[ıiuü]k|m[ıiuü]ş|m[ıiuü]şt[ıiuü]|r[ıiuü]m|ar[ıiuü]m|er[ıiuü]m|ırım|irim|urum|ürüm|amam|emem|mıyorum|miyorum)$/;

function passLexical(toks, ctx) {
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.deleted || t.type !== 'word') continue;
    const lw = trL(t.text);
    if (ctx.names.lower.has(lw) && isUpperStart(t.text) && !t.sStart) continue; // a known name mid-sentence

    // fixed spellings
    let done = false;
    for (const f of L.FIXED) {
      if (f.re.test(lw)) {
        ctx.change(t, 'spelling', f.level, matchCase(t.text, lw.replace(f.re, f.to)), f.msg);
        done = true; break;
      }
    }
    if (done) continue;

    // circumflex
    for (const c of L.CIRCUMFLEX) {
      if (lw.startsWith(c.plain) && !(c.except || []).some(e => lw.startsWith(e))) {
        ctx.change(t, 'circumflex', 'fix', matchCase(t.text, c.hat + lw.slice(c.plain.length)), `Circumflex as in the TDK dictionary: ${c.hat} (§3.7).`);
        done = true; break;
      }
    }
    if (done) continue;
    if (L.CIRCUMFLEX_AMBIGUOUS[lw]) {
      const [alt, msg] = L.CIRCUMFLEX_AMBIGUOUS[lw];
      ctx.suggest(t, 'circumflex-amb', matchCase(t.text, alt), msg);
      continue;
    }

    // lazy pronunciations: geliyo(m), yapıcam, gelceğini
    let m = lw.match(LAZY_YO_RE);
    if (m) { ctx.change(t, 'lazy', 'fix', matchCase(t.text, m[1] + LAZY_YO[m[2] || '']), 'Write the full form: -yor (§3.1).'); continue; }
    const fut = !ctx.isName(t.text) && futureFix(lw);
    if (fut) { ctx.change(t, 'lazy', 'check', matchCase(t.text, fut), 'Write the full form: -acak/-ecek (§3.1).'); continue; }

    // question word mı/mi/mu/mü glued on
    m = lw.match(MI_RE);
    if (m) {
      const [, stem, mi, pers] = m;
      const nx = nextSig(toks, i);
      const harmonic = MI_VOWEL[lastVowel(stem)] === mi[1];
      if (harmonic && (pers || (nx && nx.type === 'punct' && nx.text === '?'))) {
        const orig = t.text;
        ctx.change(t, 'mi', 'check', `${orig.slice(0, stem.length)} ${mi}${pers}`, 'The question word mı/mi/mu/mü is a separate word (§3.11).');
        continue;
      }
    }

    // ki glued on after a verb
    if (lw.endsWith('ki') && lw.length > 4 && !L.KI_WHITELIST.has(lw) && !/(d|t)[ae]ki$/.test(lw) && !t.text.includes('’')) {
      const stem = lw.slice(0, -2);
      if (KI_VERB.test(stem)) {
        ctx.change(t, 'ki', 'check', `${t.text.slice(0, -2)} ki`, '“ki” (that / emphasis) is a separate word (§3.11).');
        continue;
      }
    }

    // stretched letters: çoook → çok
    if (/(\p{L})\1\1/u.test(lw)) {
      ctx.change(t, 'stretched', 'check', t.text.replace(/(\p{L})\1{2,}/gu, '$1'), 'Do not show stretched sounds (§3.3).');
      continue;
    }

    // brand case: whatsapp → WhatsApp, instagramda → Instagram’da
    const [lwBase, ...lwRest] = lw.split('’');
    const brandBase = lwRest.length && ctx.names.brands.get(lwBase);
    if (brandBase && !t.text.startsWith(brandBase) && !N.BRAND_NO_AUTOCASE.has(lwBase)) { ctx.change(t, 'brand', 'fix', `${brandBase}’${lwRest.join('’')}`, 'Brand spelling (§3.8).'); continue; }
    const brand = ctx.names.brands.get(lw);
    if (brand && brand !== t.text && !N.BRAND_NO_AUTOCASE.has(lw)) { ctx.change(t, 'brand', 'fix', brand, 'Brand spelling (§3.8).'); continue; }
    if (!t.text.includes('’')) {
      for (const [bk, b] of ctx.names.brands) {
        if (lw.length > bk.length && lw.startsWith(bk) && L.NAME_SUFFIXES.has(lw.slice(bk.length)) && (isUpperStart(t.text) || !N.BRAND_NO_AUTOCASE.has(bk))) {
          ctx.change(t, 'brand', 'check', `${b}’${lw.slice(bk.length)}`, 'Ending on a name takes the apostrophe ’ (§3.8).');
          break;
        }
      }
    }
  }
}

// Two-word joins and contraction reminders.
function passPairs(toks, ctx) {
  for (let i = 0; i < toks.length; i++) {
    const a = toks[i];
    if (a.deleted || a.type !== 'word') continue;
    const b = nextSig(toks, i);
    if (!isWord(b)) continue;
    const la = trL(a.text), lb = trL(b.text);
    for (const [x, y, joined, level, msg] of L.JOINS) {
      if (la === x && (lb === y || (lb.startsWith(y) && y !== 'çok' && y !== 'gün'))) {
        if (ctx.change(a, 'join', level, matchCase(a.text, joined + lb.slice(y.length)), msg)) b.deleted = true;
      }
    }
    if (!a.deleted && !b.deleted) {
      for (const [x, y, short] of L.EXPANDED) {
        if (la === x && lb === y) ctx.note(a, 'info', 'expanded', `Listen: did the speaker say “${short}”? ASR often writes the long form (§3.2).`);
      }
      if ((lb === 'ta' || lb === 'te') && !isUpperStart(b.text)) {
        ctx.suggest(b, 'ta-te', lb === 'ta' ? 'da' : 'de', '“also” is always de/da, never te/ta (§3.11). Ignore if it is “ta” (all the way: ta İstanbul’dan).');
      }
    }
  }
}

// ---------- pass: numbers ----------
const numVal = w => L.NUMBER_WORDS[w];
const magnitude = v => (v >= 1000 ? 4 : v >= 100 ? 3 : v >= 10 ? 2 : 1);
// A counter word with an ending (dakikalık, yaşında, katta) — but not a different word (ayrı, evet).
const COUNTER_END = /^(?:l[ıiuü]k.*|[ıiuü]n.*|y?[ıiuü]|y?[ae]|d[ae]|t[ae]|d[ae]n|t[ae]n|s[ıiuü]|l[ae]r.*|nd[ae]|n[ıiuü]|da|de)$/;
const isCounter = w => w && L.COUNTERS.some(c => w === c || (w.startsWith(c) && COUNTER_END.test(w.slice(c.length))));
const STRONG_ONE = ['tane', 'adet', 'kilo', 'kilogram', 'gram', 'metre', 'kilometre', 'litre', 'lira', 'dolar', 'avro', 'euro', 'sterlin', 'kuruş'];
const fmtThousands = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function splitNumberWord(lw) {
  if (numVal(lw) !== undefined) return { v: numVal(lw), suffix: '' };
  if (L.ORDINALS[lw] !== undefined) return { v: L.ORDINALS[lw], ordinal: true, suffix: '' };
  // number word + ending (beşte, yirmisi)
  for (const [w, v] of Object.entries(L.NUMBER_WORDS)) {
    if (lw.startsWith(w) && lw.length > w.length) {
      const suf = lw.slice(w.length);
      if (L.NUMBER_SUFFIX.test(suf)) return { v, suffix: suf };
    }
  }
  return null;
}

function passNumbers(toks, ctx) {
  const L2 = live(toks);
  let i = 0;
  while (i < L2.length) {
    const t = L2[i];
    if (!isWord(t) || trL(t.text) === 'yüzde') { i++; continue; } // yüzde = percent word, not yüz+de
    // collect a valid run of number words
    const run = [];
    let j = i, ok = true;
    while (j < L2.length && isWord(L2[j])) {
      const p = splitNumberWord(trL(L2[j].text));
      if (!p) break;
      if (run.length) {
        const prev = run[run.length - 1].p;
        if (prev.suffix || prev.ordinal) break;
        const a = magnitude(prev.v), b = magnitude(p.v);
        const mult = (p.v === 100 || p.v === 1000) && a < b;
        if (!(a > b || mult)) { ok = false; break; }
      }
      run.push({ tok: L2[j], p });
      j++;
      if (p.suffix || p.ordinal) break;
    }
    if (!run.length) { i++; continue; }
    const nx = L2[j];
    const pv = L2[i - 1];
    const nxLw = isWord(nx) ? trL(nx.text) : '';
    // Left-out unit (yirmi beş elli, bir altmış sekiz): an invalid continuation or a following number → leave as words.
    if (!ok || (isWord(nx) && splitNumberWord(nxLw))) { i = j + 1; continue; }
    const last = run[run.length - 1].p;
    let total = 0, cur = 0;
    for (const { p } of run) {
      if (p.v === 100) cur = (cur || 1) * 100;
      else if (p.v === 1000) { total += (cur || 1) * 1000; cur = 0; }
      else cur += p.v;
    }
    total += cur;
    const pvLw = isWord(pv) ? trL(pv.text) : '';
    const nx1Lw = isWord(L2[j + 1]) ? trL(L2[j + 1].text) : '';
    const counter = isCounter(nxLw) || (nxLw === 'buçuk' && isCounter(nx1Lw));
    const dateMonth = L.MONTHS.includes(nxLw);
    const afterSaat = pvLw === 'saat';
    const afterYuzde = pvLw === 'yüzde';
    const multi = run.length >= 2;
    const lone1 = run.length === 1 && total === 1 && !last.ordinal && !dateMonth;
    const first = run[0].tok;

    // currency / unit word right after, with an amount after it (yirmi lira elli) → leave
    const nx2 = L2[j + 1];
    if (counter && isWord(nx2) && splitNumberWord(trL(nx2.text)) && (L.CURRENCY[nxLw] || L.UNITS[nxLw])) { i = j + 2; continue; }

    if (lone1 && !STRONG_ONE.includes(nxLw)) { i = j; continue; }
    let trigger = counter || afterSaat || afterYuzde || multi || dateMonth;
    if (last.suffix && !(afterSaat || afterYuzde || multi)) trigger = false;
    if (last.ordinal) trigger = isWord(nx) && nxLw !== 'olarak';
    if (!trigger) { i = j; continue; }

    const isYear = !counter && !last.ordinal && total >= 1000 && total <= 2100 && multi;
    const digits = isYear || total < 1000 ? String(total) : fmtThousands(total);
    let out = last.ordinal ? `${digits}.` : digits;
    if (last.suffix) out += `’${last.suffix}`;

    let msg = 'Number words that count become digits (§3.5).';
    const yuzde = afterYuzde && !last.ordinal;
    if (yuzde) { out = `%${out}`; msg = 'Percent: %20 (§3.5).'; }
    // currency / units without an ending → symbol
    let unitTok = null;
    if (!yuzde && !last.suffix && !last.ordinal && isWord(nx) && (L.CURRENCY[nxLw] || L.UNITS[nxLw])) {
      unitTok = nx;
      out = L.CURRENCY[nxLw] ? L.CURRENCY[nxLw].fmt(digits) : `${digits} ${L.UNITS[nxLw]}`;
      msg = 'Currency and units: 500 TL, $500, €10, 5 km (§3.5).';
    }
    const phrase = (yuzde ? `${pv.text} ` : '') + run.map(r => r.tok.text).join(' ') + (unitTok ? ` ${unitTok.text}` : '');
    const applied = lone1
      ? ctx.suggest(first, 'number', out, '“bir” is a digit only when counting or measuring (1 kitap, 2 değil · 1 kg). Otherwise keep the word (§3.5).', phrase)
      : ctx.change(first, 'number', 'check', out, msg, phrase);
    if (applied) {
      run.slice(1).forEach(r => { r.tok.deleted = true; });
      if (unitTok) unitTok.deleted = true;
      if (yuzde) pv.deleted = true;
    }
    i = j + (unitTok ? 1 : 0);
  }
}

// ---------- pass: titles, days, months ----------
function passTitles(toks, ctx) {
  const L2 = live(toks);
  for (let i = 0; i < L2.length; i++) {
    const t = L2[i];
    if (!isWord(t)) continue;
    const lw = trL(t.text);
    const pv = L2[i - 1];
    const m = lw.match(/^(bey|hanım)(.*)$/);
    if (m && isWord(pv) && isUpperStart(pv.text) && !t.text.startsWith(capFirst(m[1]) + (m[2] ? '’' : ''))) {
      if (m[2].startsWith('’')) ctx.change(t, 'title', 'fix', capFirst(m[1]) + m[2], 'Bey/Hanım after a name start with a capital (§3.8).');
      else if (m[2] && !['efendi'].includes(m[2])) ctx.change(t, 'title', 'check', `${capFirst(m[1])}’${m[2]}`, 'Bey/Hanım after a name: capital, and ’ before an ending (§3.8).');
      else if (!m[2]) ctx.change(t, 'title', 'fix', capFirst(m[1]), 'Bey/Hanım after a name start with a capital (§3.8).');
      continue;
    }
    const isMonth = L.MONTHS.includes(lw), isDay = L.DAYS.includes(lw);
    if (!isMonth && !isDay) continue;
    const prevDigit = isWord(pv) && /^\p{N}+$/u.test(pv.text);
    const prevYear = isWord(pv) && /^\p{N}{4}$/u.test(pv.text);
    if (isMonth && prevDigit) { ctx.change(t, 'date', 'fix', capFirst(t.text), 'Month in a full date starts with a capital: 1 Ocak 2025 (§3.8).'); continue; }
    if (isDay && prevYear) { ctx.change(t, 'date', 'fix', capFirst(t.text), 'Day after a full date starts with a capital (§3.8).'); continue; }
    if (isUpperStart(t.text) && !t.sStart && !t.afterTag) {
      ctx.change(t, 'date', 'check', lowFirst(t.text), 'Day and month names are lowercase except in a full date (§3.8). Revert if it is a name.');
    }
  }
}

// ---------- pass: apostrophe on names ----------
function passNameApostrophe(toks, ctx) {
  for (const t of live(toks)) {
    if (!isWord(t) || t.sStart || t.afterTag || !isUpperStart(t.text) || t.text.includes('’')) continue;
    const lw = trL(t.text);
    if (ctx.names.lower.has(lw)) continue;
    let best = null;
    for (let k = lw.length - 1; k >= 2; k--) {
      const stem = lw.slice(0, k);
      const name = ctx.names.lower.get(stem);
      if (name && !ctx.names.ambiguous.has(stem) && L.NAME_SUFFIXES.has(lw.slice(k))) { best = [name, lw.slice(k)]; break; }
    }
    if (best) ctx.change(t, 'name-apostrophe', 'check', `${best[0]}’${best[1]}`, 'An ending on a name takes the apostrophe ’ (§3.8). Revert if this is an institution name or a derived word (İstanbullu).');
  }
}

// ---------- pass: capitals ----------
function protectedName(t, ctx, capsElsewhere) {
  const w = t.text;
  if (w.includes('’')) return 'apostrophe';
  if (isAllCaps(w) && w.length > 1) return 'acronym';
  const lw = trL(w);
  if (ctx.names.extra.has(lw)) return 'name';
  if (ctx.names.lower.has(lw)) return ctx.names.ambiguous.has(lw) ? 'ambiguous' : 'name';
  if (capsElsewhere.has(lw)) return 'elsewhere';
  return null;
}

function passCase(toks, ctx) {
  markStarts(toks);
  const L2 = live(toks);
  // words capitalized in the middle of a sentence somewhere in the text → probably names
  const afterTag = new Set(L2.filter((t, k) => isWord(t) && L2[k - 1] && L2[k - 1].type === 'tag'));
  const capsElsewhere = new Set(L2.filter(t => isWord(t) && !t.sStart && !t.postTag && !afterTag.has(t) && isUpperStart(t.text)).map(t => trL(t.text)));
  let pendingLower = false;
  let midTag = false;
  for (const t of L2) {
    if (t.deleted) continue;
    if (t.type === 'nl') { pendingLower = false; midTag = false; continue; }
    // A sentence end that survived ([Haa]! Bu …, or a full stop the user chose to keep) starts a new sentence.
    if (isEnd(t)) { pendingLower = false; midTag = false; continue; }
    if (t.type === 'tag' && t.canon) {
      const want = t.sStart ? `[${capFirst(t.canon)}]` : `[${t.canon}]`;
      if (t.text !== want) ctx.change(t, 'tag-case', 'fix', want, t.sStart ? 'Tag starting a sentence takes the capital: [Eee], [Iıı] (§3.4).' : 'Tag inside a sentence is lowercase (§3.4).');
      if (t.sStart) {
        pendingLower = true;
        // "Uff. Şimdi …" → "[Uff] şimdi …": ASR's full stop after a sentence-starting tag goes.
        const k = L2.indexOf(t);
        const p = L2[k + 1], w = L2[k + 2];
        if (p && p.type === 'punct' && p.text === '.' && w && (isWord(w) || w.type === 'tag')) {
          ctx.del(p, 'tag-period', 'check', 'Full stop after a sentence-starting tag removed; the sentence goes on (§3.4).');
        }
      } else if (!pendingLower) midTag = true;
      continue;
    }
    if (t.type === 'foreign') { pendingLower = false; midTag = false; continue; }
    if (!isWord(t)) { if (t.type !== 'atag') midTag = false; continue; }
    if (midTag) {
      // "tenteyle [ııı] Tüm": a capital left over from ASR after a tag inside a sentence
      midTag = false;
      t.afterTag = true;
      if (isUpperStart(t.text) && !/^\p{N}/u.test(t.text) && !protectedName(t, ctx, capsElsewhere)) {
        ctx.change(t, 'case-after-tag', 'check', lowFirst(t.text), 'Inside a sentence, the word after a tag is lowercase. Revert if a new sentence starts here (then add a full stop).');
      }
      continue;
    }
    if (pendingLower) {
      pendingLower = false;
      t.afterTag = true;
      if (!isUpperStart(t.text) || /^\p{N}/u.test(t.text)) continue;
      const why = protectedName(t, ctx, capsElsewhere);
      if (!why) ctx.change(t, 'case-after-tag', 'fix', lowFirst(t.text), 'After a sentence-starting tag the next word is lowercase (§3.4).');
      else if (why === 'ambiguous' || why === 'elsewhere') ctx.suggest(t, 'case-after-tag', lowFirst(t.text), `Kept the capital: “${t.text}” may be a name. Lowercase it if it is an ordinary word (§3.4).`);
      continue;
    }
    if (t.sStart && /^\p{Ll}/u.test(t.text)) {
      ctx.change(t, 'sentence-case', 'fix', capFirst(t.text), 'A sentence starts with a capital.');
    }
  }
}

// ---------- pass: validation ----------
const ALLOWED_WORD = /^[a-zçğıöşüâîûA-ZÇĞIİÖŞÜÂÎÛ0-9’‐\-.,:%$€£¥& ]+$/;
function passValidate(toks, ctx) {
  let noise = 0, lastNoise = null;
  for (const t of live(toks)) {
    if (t.type === 'atag') {
      if (t.text === '<noise>') { noise++; lastNoise = t; }
      if (t.text === '</noise>') { noise--; lastNoise = t; if (noise < 0) { ctx.note(t, 'warn', 'noise', '</noise> without an opening <noise>.'); noise = 0; } }
    }
    if (t.type === 'other' && !/\s/.test(t.text)) ctx.note(t, 'warn', 'char', `Character “${t.text}” (U+${t.text.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}) is not allowed (§3.7).`);
    if (t.type !== 'word') continue;
    if (ALLOWED_WORD.test(t.text)) continue;
    const base = trL(t.text.split('’')[0]);
    const known = ctx.names.lower.has(base) || [...ctx.names.brands.keys()].some(b => base.startsWith(b));
    if (known) continue;
    const odd = [...new Set(t.text.replace(/[a-zçğıöşüâîûA-ZÇĞIİÖŞÜÂÎÛ0-9’‐\-.,:%$€£¥&]/g, ''))].join('');
    if (/^[qwxQWX]+$/.test(odd)) ctx.note(t, 'info', 'qwx', 'q/w/x: fine in names and brands. If this is a foreign stretch, put it in { } (§3.7, §3.10).');
    else ctx.note(t, 'warn', 'char', `Letter(s) “${odd}” are not Turkish. Fine inside a name; otherwise check (§3.7).`);
  }
  if (noise > 0 && lastNoise) ctx.note(lastNoise, 'warn', 'noise', '<noise> opened but never closed with </noise>.');
}

// ---------- render ----------
const CLOSE = new Set(['.', ',', '?', '!', ':', ';', '”', '’', ')', '—']);
const OPEN = new Set(['“', '(', '‘']);
export function render(toks) {
  let text = '';
  const segs = [];
  let prev = null;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.deleted) { segs.push({ sep: '', tok: t, idx: i }); continue; }
    if (t.type === 'nl') { text += t.text; segs.push({ sep: '', tok: t, idx: i }); prev = t; continue; }
    const needSpace = text.length && !text.endsWith('\n') && !CLOSE.has(t.text) && !(prev && OPEN.has(prev.text));
    const sep = needSpace ? ' ' : '';
    text += sep;
    t.outStart = text.length;
    text += t.text;
    t.outEnd = text.length;
    segs.push({ sep, tok: t, idx: i });
    prev = t;
  }
  return { text, segs };
}

// ---------- main ----------
export function fix(input, opts = {}) {
  const ctx = makeCtx(opts);
  const toks = tokenize(input);
  passChars(toks, ctx);
  passTags(toks, ctx);
  passPunct(toks, ctx);
  markStarts(toks);
  passPairs(toks, ctx);
  passLexical(toks, ctx);
  passNumbers(toks, ctx);
  passCase(toks, ctx);          // sets afterTag, used below
  passTitles(toks, ctx);
  passNameApostrophe(toks, ctx);
  passValidate(toks, ctx);
  const { text, segs } = render(toks);
  const notes = [];
  toks.forEach((t, idx) => t.notes.forEach(n => notes.push({ ...n, idx, start: t.start, end: t.end })));
  return { text, segs, notes, tokens: toks };
}

export const _internal = { trL, trU, capFirst, canonTag, futureFix, markStarts };
