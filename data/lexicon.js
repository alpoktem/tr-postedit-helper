// Word lists and fixed spellings used by the engine.
// Edit freely: each entry cites the guideline section it comes from.

// §3.4 — the only square-bracket tags allowed.
export const TAGS = ['ııı', 'eee', 'hmm', 'ah', 'ay', 'vay', 'ha', 'haa', 'hah', 'off', 'uff', 'uuu', 'şş', 'pşşt'];

// Core notation — the only angle-bracket tags allowed.
export const ATAGS = ['laugh', 'gasp', 'cough', 'swallow', 'noise', '/noise', 'inaudible'];
export const ATAG_ALIASES = {
  laughter: 'laugh', laughing: 'laugh', gülme: 'laugh', gülüş: 'laugh',
  öksürük: 'cough', öksürme: 'cough', yutkunma: 'swallow', unclear: 'inaudible',
};

// §3.4 — words with meaning: never in brackets.
export const PLAIN_WORDS = [
  'ya', 'yav', 'yani', 'işte', 'şey', 'hani', 'falan', 'filan', 'be', 'hey', 'aynen', 'ki',
  'hıı', 'hı hı', 'ıı hı', 'tamam', 'evet', 'hayır', 'valla', 'vallahi', 'yahu',
];

// English hesitation spellings (§3.4: never use).
export const ENGLISH_HESITATIONS = /^(um+|uh+|uhm+|umm+|erm+|ahem)$/;

// §3.1, §3.11 — fixed spellings. Matched against the lowercased word.
// level: fix = safe, applied silently in green; check = applied, but worth a look.
export const FIXED = [
  { re: /^(?:bi|bir)şey(.*)$/, to: 'bir şey$1', level: 'fix', msg: '“bir şey” is two words (§3.11).' },
  { re: /^bişi$/, to: 'bir şey', level: 'fix', msg: '“bir şey” is two words (§3.1).' },
  { re: /^bşy$/, to: 'bir şey', level: 'fix', msg: 'No texting shorthand (§3.1).' },
  { re: /^herşey(.*)$/, to: 'her şey$1', level: 'fix', msg: '“her şey” is two words (§3.11).' },
  { re: /^hiçbirşey(.*)$/, to: 'hiçbir şey$1', level: 'fix', msg: '“hiçbir şey” (§3.11).' },
  { re: /^yalnış(.*)$/, to: 'yanlış$1', level: 'fix', msg: 'Spelling: yanlış (§3.1).' },
  { re: /^yanlız(.*)$/, to: 'yalnız$1', level: 'fix', msg: 'Spelling: yalnız (§3.1).' },
  { re: /^haftasonu(.*)$/, to: 'hafta sonu$1', level: 'fix', msg: '“hafta sonu” is two words (§3.1).' },
  { re: /^(?:ok|okay|oki|okei|o\.k\.)$/, to: 'okey', level: 'fix', msg: '“OK” is always written okey (§3.1).' },
  { re: /^di[’']?mi$/, to: 'di mi', level: 'fix', msg: 'Write “di mi” as two words (§3.1).' },
  { re: /^(?:n[’']apıyorsun|napıyosun|napıyon|n[’']apıyosun)$/, to: 'napıyorsun', level: 'fix', msg: 'Spelling: napıyorsun (§3.1).' },
  { re: /^(?:n[’']apıyorsunuz|napıyosunuz)$/, to: 'napıyorsunuz', level: 'fix', msg: 'Spelling: napıyorsunuz (§3.1).' },
  { re: /^n[’']apalım$/, to: 'napalım', level: 'fix', msg: 'Spelling: napalım (§3.1).' },
  { re: /^(?:n[’']oldu|nooldu)$/, to: 'noldu', level: 'fix', msg: 'Spelling: noldu (§3.1).' },
  { re: /^nbr$/, to: 'naber', level: 'fix', msg: 'No texting shorthand (§3.1).' },
  { re: /^(?:tmm|taam)$/, to: 'tamam', level: 'fix', msg: 'Spelling: tamam (§3.1).' },
  { re: /^slm$/, to: 'selam', level: 'fix', msg: 'No texting shorthand (§3.1).' },
  { re: /^mrb$/, to: 'merhaba', level: 'fix', msg: 'No texting shorthand (§3.1).' },
  { re: /^(?:tşk|tşkr)$/, to: 'teşekkürler', level: 'fix', msg: 'No texting shorthand (§3.1).' },
  { re: /^flan$/, to: 'falan', level: 'fix', msg: 'Spelling: falan (or filan, as said) (§3.1).' },
  { re: /^valla(?:a+|[’'])$/, to: 'valla', level: 'fix', msg: 'Spelling: valla / vallahi, as said (§3.1).' },
  { re: /^ya{2,}$/, to: 'ya', level: 'fix', msg: 'Do not show stretched sounds: ya (§3.3).' },
  { re: /^yaw$/, to: 'yav', level: 'fix', msg: 'Spelling: yav (§3.1).' },
  { re: /^ağbi(.*)$/, to: 'abi$1', level: 'fix', msg: 'Spelling: abi or ağabey, as said (§3.1).' },
  { re: /^baya+$/, to: 'bayağı', level: 'fix', msg: 'Shortened form: write bayağı (§3.1).' },
  { re: /^nası$/, to: 'nasıl', level: 'fix', msg: 'Shortened form: write nasıl (§3.1).' },
  { re: /^şöle$/, to: 'şöyle', level: 'fix', msg: 'Shortened form: write şöyle (§3.1).' },
  { re: /^böle$/, to: 'böyle', level: 'fix', msg: 'Shortened form: write böyle (§3.1).' },
  { re: /^öle$/, to: 'öyle', level: 'check', msg: 'Shortened form: write öyle (§3.1). Check it isn’t “öle” (from ölmek).' },
  { re: /^bi$/, to: 'bir', level: 'fix', msg: 'Shortened form: write bir (§3.1).' },
  { re: /^dakka(.*)$/, to: 'dakika$1', level: 'fix', msg: 'Shortened form: write dakika (§3.2).' },
  { re: /^tabiki$/, to: 'tabii ki', level: 'fix', msg: 'Spelling: tabii ki (§3.1).' },
  { re: /^tabi$/, to: 'tabii', level: 'check', msg: '“Of course” is tabii (§3.1). tabi means “subject to” — revert if that was meant.' },
  { re: /^farket(.*)$/, to: 'fark et$1', level: 'fix', msg: '“fark etmek” is two words (§3.11).' },
  { re: /^inşaallah$/, to: 'inşallah', level: 'fix', msg: 'GTS spelling: inşallah (§3.10).' },
];

// Two-word sequences that should be joined (§3.11). [first, second, joined, level, msg]
export const JOINS = [
  ['hiç', 'bir', 'hiçbir', 'fix', '“hiçbir” is one word (§3.11).'],
  ['her', 'hangi', 'herhangi', 'fix', '“herhangi” is one word (§3.11).'],
  ['bir', 'kaç', 'birkaç', 'fix', '“birkaç” is one word (§3.11).'],
  ['bir', 'çok', 'birçok', 'check', '“birçok” (many) is one word (§3.11). Revert if it is “bir” + “çok” (a very …).'],
  ['bu', 'gün', 'bugün', 'check', '“bugün” (today) is one word (§3.11). Revert if it is “this day”.'],
];

// Contractions ASR may have expanded (§3.2): a grey reminder to listen.
export const EXPANDED = [
  ['ne', 'oldu', 'noldu'], ['ne', 'yapıyorsun', 'napıyorsun'], ['ne', 'yapalım', 'napalım'],
  ['ne', 'haber', 'naber'], ['değil', 'mi', 'di mi'],
];

// §3.7 — circumflex: unambiguous words, prefix-matched so endings carry over.
export const CIRCUMFLEX = [
  { plain: 'kağıt', hat: 'kâğıt' }, { plain: 'kağıd', hat: 'kâğıd' },
  { plain: 'dükkan', hat: 'dükkân' }, { plain: 'rüzgar', hat: 'rüzgâr' },
  { plain: 'hikaye', hat: 'hikâye' }, { plain: 'imkan', hat: 'imkân' },
  { plain: 'mekan', hat: 'mekân', except: ['mekanik', 'mekaniz'] },
  { plain: 'mahkum', hat: 'mahkûm' },
];

// §3.7 — the same letters spell two words: suggest only, never applied automatically.
export const CIRCUMFLEX_AMBIGUOUS = {
  hala: ['hâlâ', 'hâlâ = still; hala = aunt (§3.7).'],
  kar: ['kâr', 'kâr = profit; kar = snow (§3.7).'],
  milli: ['millî', 'millî when it is the describing word (§3.7).'],
  resmi: ['resmî', 'resmî = official; resmi = his/her picture (§3.7).'],
  askeri: ['askerî', 'askerî = military (adj.); askeri = the soldier (§3.7).'],
  hakim: ['hâkim', 'hâkim = judge / dominant (§3.7).'],
};

// Words ending in -ki that are written as one word (§3.11).
export const KI_WHITELIST = new Set([
  'belki', 'sanki', 'oysaki', 'mademki', 'hâlbuki', 'halbuki', 'meğerki', 'şimdiki', 'yarınki', 'akşamki',
  'sabahki', 'öteki', 'beriki', 'geçenki', 'benimki', 'seninki', 'onunki', 'bizimki', 'sizinki', 'onlarınki',
  'çünkü', 'dünkü', 'bugünkü', 'halki', 'zeki', 'eski', 'ilki', 'tüki', 'kaçki',
]);

// §3.4 day and month names (lowercase except in a full date, §3.8).
export const DAYS = ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi', 'pazar'];
export const MONTHS = ['ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos', 'eylül', 'ekim', 'kasım', 'aralık'];

// Case endings that may follow a name after the apostrophe (§3.8).
export const NAME_SUFFIXES = new Set([
  'a', 'e', 'ya', 'ye', 'ı', 'i', 'u', 'ü', 'yı', 'yi', 'yu', 'yü', 'da', 'de', 'ta', 'te', 'dan', 'den', 'tan', 'ten',
  'ın', 'in', 'un', 'ün', 'nın', 'nin', 'nun', 'nün', 'la', 'le', 'yla', 'yle', 'daki', 'deki', 'taki', 'teki',
  'dır', 'dir', 'dur', 'dür', 'tır', 'tir', 'tur', 'tür', 'lar', 'ler', 'ları', 'leri', 'ydı', 'ydi', 'ydu', 'ydü',
  'dakı', 'nda', 'nde', 'ndan', 'nden', 'na', 'ne', 'nı', 'ni', 'nu', 'nü', 'ca', 'ce',
]);

// §3.5 numbers.
export const NUMBER_WORDS = {
  sıfır: 0, bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9,
  on: 10, yirmi: 20, otuz: 30, kırk: 40, elli: 50, altmış: 60, yetmiş: 70, seksen: 80, doksan: 90,
  yüz: 100, bin: 1000,
};
export const ORDINALS = {
  birinci: 1, ikinci: 2, üçüncü: 3, dördüncü: 4, beşinci: 5, altıncı: 6, yedinci: 7, sekizinci: 8, dokuzuncu: 9,
  onuncu: 10, yirminci: 20, otuzuncu: 30, kırkıncı: 40, ellinci: 50, altmışıncı: 60, yetmişinci: 70,
  sekseninci: 80, doksanıncı: 90, yüzüncü: 100, bininci: 1000,
};
// A number word directly before one of these is counting (prefix match: dakikalık, yaşında …).
export const COUNTERS = [
  'tane', 'adet', 'kişi', 'dakika', 'saniye', 'saat', 'gün', 'hafta', 'ay', 'yıl', 'sene', 'kez', 'defa', 'kere',
  'yaş', 'sayfa', 'kat', 'parça', 'bölüm', 'sınıf', 'çocuk', 'kardeş', 'numara', 'puan', 'metre', 'kilometre',
  'kilo', 'gram', 'litre', 'santim', 'lira', 'dolar', 'avro', 'euro', 'yuro', 'sterlin', 'kuruş', 'milyon', 'milyar',
  'bardak', 'kaşık', 'porsiyon', 'adım', 'katlı', 'odalı', 'tur', 'maç', 'gol', 'derece', 'ev', 'oda',
];
// Currency and units that become symbols when they carry no ending (§3.5).
export const CURRENCY = { lira: { fmt: n => `${n} TL` }, dolar: { fmt: n => `$${n}` }, avro: { fmt: n => `€${n}` }, euro: { fmt: n => `€${n}` }, yuro: { fmt: n => `€${n}` }, sterlin: { fmt: n => `£${n}` } };
export const UNITS = { kilometre: 'km', kilogram: 'kg', kilo: 'kg', gram: 'g', santimetre: 'cm', santim: 'cm', metre: 'm', milimetre: 'mm' };
// Endings allowed on a digit after the apostrophe, when the context makes the number clear.
export const NUMBER_SUFFIX = /^(?:y?[ae]|d[ae]|t[ae]|d[ae]n|t[ae]n|y?[ıiuü]|n[ıiuü]n|[ıiuü]n|s[ıiuü]|l[ae]|yl[ae]|d[ae]ki|t[ae]ki|d[ıiuü]r|t[ıiuü]r|l[ae]r|l[ae]rd[ae]|l[ae]rd[ae]n|n[ae]|nd[ae])$/;
