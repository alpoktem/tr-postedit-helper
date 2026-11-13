// Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fix } from '../js/engine.js';

const out = s => fix(s).text;
const cases = (name, pairs) => test(name, () => {
  for (const [input, want] of pairs) assert.equal(out(input), want, `input: ${input}`);
});

cases('shorthand hesitations and capitals', [
  ['Kahve koyarım. eee Kalktıktan sonra', 'Kahve koyarım. [Eee] kalktıktan sonra'],
  ['ııı Aslında ezilmiş leblebi.', '[Iıı] aslında ezilmiş leblebi.'],
  ['kokusunu ııı değiştiririm', 'Kokusunu [ııı] değiştiririm'],
  ['Hmm, Fena fikir değil.', '[Hmm], fena fikir değil.'],
  ['Mehmet eeee geldi.', 'Mehmet [eee] geldi.'],
  ['bir [hmm] eee maaş', 'Bir [hmm] [eee] maaş'],
  ['ııı Mehmet Bey geldi.', '[Iıı] Mehmet Bey geldi.'],
  ['Susun ama artık, şşş!', 'Susun ama artık, [şş]!'],
  ['*vay! Cem Yılmaz mı o?', '[Vay]! Cem Yılmaz mı o?'],
  ['İyice de kabardı, *ha?', 'İyice de kabardı, [ha]?'],
  ['çalışırdık. *cough Böyle ağzımızdan', 'Çalışırdık. <cough> Böyle ağzımızdan'],
  ['*laugh iyice de kabardı', '<laugh> İyice de kabardı'],
]);

cases('tag normalization (§3.4)', [
  ['[ıııı] önce sağa', '[Iıı] önce sağa'],
  ['sonra [ıı] önce', 'Sonra [ııı] önce'],
  ['[İıı], bence', '[Iıı], bence'],
  ['[Hmmm], fena fikir değil.', '[Hmm], fena fikir değil.'],
  ['[Ya] bence [ııı] haklısın.', 'Ya bence [ııı] haklısın.'],
  ['Evet, [yani], ne bileyim', 'Evet, yani, ne bileyim'],
  ['[Hey] minik!', 'Hey minik!'],
  ['Iı hı, anlıyorum.', 'Iı hı, anlıyorum.'],
  ['Hı hı, kesinlikle katılıyorum.', 'Hı hı, kesinlikle katılıyorum.'],
  ['E, ne yapalım?', 'E, ne yapalım?'],
]);

cases('ellipsis is always removed (§3.6)', [
  ['teras tenteyle... Tüm o altındaki', 'Teras tenteyle. Tüm o altındaki'],
  ['veya işte… meşrubat', 'Veya işte. Meşrubat'],
  ['Bilmiyorum...', 'Bilmiyorum.'],
  ['Gerçekten mi?... Tamam.', 'Gerçekten mi? Tamam.'],
  ['...ve sonra', 'Ve sonra'],
]);

cases('typography (§3.6, §3.7)', [
  ["Ayşe'nin kitabı", 'Ayşe’nin kitabı'],
  ["2025'te geldi", '2025’te geldi'],
  ['"Kalkan balığı" dedi.', '“Kalkan balığı” dedi.'],
  ['evet , tamam .', 'Evet, tamam.'],
  ['Türk-Alman ilişkileri', 'Türk‐Alman ilişkileri'],
  ['Adı Ce-Ca-Canan.', 'Adı Ce- Ca- Canan.'],
  ['Gel- geliyorum.', 'Gel- geliyorum.'],
  ['Istanbul’a gidiyoruz.', 'İstanbul’a gidiyoruz.'],
  ['Sen ciddi misin?!', 'Sen ciddi misin!?'],
  ['Bence öyle; yani evet.', 'Bence öyle, yani evet.'],
  ['Haaarika.', 'Harika.'],
  ['Çoook güzel!', 'Çok güzel!'],
]);

cases('spelling and joint forms (§3.1, §3.11)', [
  ['bişey yok', 'Bir şey yok'],
  ['herşey yolunda', 'Her şey yolunda'],
  ['tabi ki gelirim', 'Tabii ki gelirim'],
  ['yalnış anladın', 'Yanlış anladın'],
  ['haftasonu gel', 'Hafta sonu gel'],
  ['ok, tamam', 'Okey, tamam'],
  ['Güzel, dimi?', 'Güzel, di mi?'],
  ['Yarın geliyom.', 'Yarın geliyorum.'],
  ['geliyo musun', 'Geliyor musun'],
  ['yapıcam bunu', 'Yapacağım bunu'],
  ['geleceğini değil gelceğini', 'Geleceğini değil geleceğini'],
  ['yarın gidicem', 'Yarın gideceğim'],
  ['bi dakka, geliyom', 'Bir dakika, geliyorum'],
  ['baya güzel', 'Bayağı güzel'],
  ['Geliyormusun?', 'Geliyor musun?'],
  ['Hazırmısınız?', 'Hazır mısınız?'],
  ['Bilmiyorumki.', 'Bilmiyorum ki.'],
  ['Duydumki gelmişsin.', 'Duydum ki gelmişsin.'],
  ['hiç bir şey', 'Hiçbir şey'],
  ['farkettim', 'Fark ettim'],
  ['rüzgar alıyor', 'Rüzgâr alıyor'],
  ['kağıtları getir', 'Kâğıtları getir'],
  ['dükkana gittim', 'Dükkâna gittim'],
  ['Mehmet bey geldi', 'Mehmet Bey geldi'],
  ['Fatma hanım', 'Fatma Hanım'],
  ['whatsapp’tan yazdım', 'WhatsApp’tan yazdım'],
  ['Akşam Netflixte izledim.', 'Akşam Netflix’te izledim.'],
]);

cases('things that must NOT change', [
  ['Ancak sıcak bir gün.', 'Ancak sıcak bir gün.'],
  ['Hocam, milyon kere söyledim.', 'Hocam, milyon kere söyledim.'],
  ['Radyo açıktı.', 'Radyo açıktı.'],
  ['Belki evdeki seninki.', 'Belki evdeki seninki.'],
  ['Bir fırtına geldi.', 'Bir fırtına geldi.'],
  ['Bir bakayım.', 'Bir bakayım.'],
  ['İkimiz de geldik, üçer üçer.', 'İkimiz de geldik, üçer üçer.'],
  ['Fiyatı yirmi beş elli.', 'Fiyatı yirmi beş elli.'],
  ['Boyu bir altmış sekiz.', 'Boyu bir altmış sekiz.'],
  ['yirmi lira elli', 'Yirmi lira elli'],
  ['İstanbullu bir arkadaş', 'İstanbullu bir arkadaş'],
  ['Heyecan vardı.', 'Heyecan vardı.'],
  ['Çarşamba günü geldi.', 'Çarşamba günü geldi.'],
  ['Kahvemi içerim.', 'Kahvemi içerim.'],
  ['Onlarca kişi, yüzlerce ev.', 'Onlarca kişi, yüzlerce ev.'],
  ['{see you tomorrow!} dedi.', '{see you tomorrow!} dedi.'],
  ['Masanın altı temiz.', 'Masanın altı temiz.'],
  ['Taksiye bin.', 'Taksiye bin.'],
]);

cases('numbers (§3.5)', [
  ['İki tane terasım var.', '2 tane terasım var.'],
  ['on dakikalık spor', '10 dakikalık spor'],
  ['yüzde yirmi indirim', '%20 indirim'],
  ['saat beşte geldi', 'Saat 5’te geldi'],
  ['bin dokuz yüz yetmiş dört', '1974'],
  ['üçüncü kat', '3. kat'],
  ['beş yüz lira', '500 TL'],
  ['beş yüz dolar', '$500'],
  ['saatte seksen kilometre', 'Saatte 80 km'],
  ['iki bin lira', '2.000 TL'],
  ['iki buçuk milyon', '2 buçuk milyon'],
  ['kırk iki yaşında', '42 yaşında'],
  ['iki üç dakika', 'İki üç dakika'],
]);

cases('mid-sentence day/month names', [
  ['Geçen Çarşamba geldi.', 'Geçen çarşamba geldi.'],
  ['bir ocak iki bin yirmi beş', '1 Ocak 2025'],
]);

// ---- the 9 sample post-edits ----
// Real recordings stay out of the repo. Point SAMPLES at a local file to run these:
//   SAMPLES=../sample_post-edits.txt node --test tests/
// Format: blocks of “Proposed transcription … Post-edited transcription …”.
const here = fileURLToPath(new URL('.', import.meta.url));
const samplesPath = process.env.SAMPLES || `${here}../../sample_post-edits.txt`;
let raw = '';
try { raw = readFileSync(samplesPath, 'utf8'); } catch { /* no local samples */ }
const pairs = raw.split('Proposed transcription').slice(1).map(b => {
  const [asr, pe] = b.split('Post-edited transcription');
  return { asr: asr.trim(), pe: pe.trim() };
});
const skip = pairs.length ? false : `no sample file at ${samplesPath}`;

test('post-edits pass through unchanged (idempotent)', { skip }, () => {
  for (const { pe } of pairs) assert.equal(out(pe), pe);
});

test('post-edits typed with bare shorthand come out right', { skip }, () => {
  for (const { pe } of pairs) {
    // Simulate typing: [Eee] ama → eee Ama (ASR capital left in), [ııı] → ııı
    const typed = pe.replace(/\[(\p{L}+)\](\s+)(\p{L})/gu, (m, tag, sp, ch) => {
      const lower = tag.toLocaleLowerCase('tr');
      const startTag = tag !== lower;
      return lower + sp + (startTag ? ch.toLocaleUpperCase('tr') : ch);
    }).replace(/\[(\p{L}+)\]/gu, (m, tag) => tag.toLocaleLowerCase('tr'));
    assert.equal(out(typed), pe, `typed: ${typed}`);
  }
});

test('ASR first pass: no ellipsis survives, output is stable', { skip }, () => {
  for (const { asr } of pairs) {
    const r = fix(asr);
    assert.ok(!/…|\.\.\./.test(r.text), r.text);
    assert.equal(out(r.text), r.text, 'second pass changes nothing');
  }
});

cases('counter words need a real ending', [
  ['iki ayrı ev', 'İki ayrı ev'],
  ['Yeni bir eve taşındık.', 'Yeni bir eve taşındık.'],
  ['yaklaşık bir saat', 'Yaklaşık bir saat'],
  ['iki evde kaldım', '2 evde kaldım'],
]);

cases('leftover capitals and titles with endings', [
  ['Çünkü teras tenteyle ııı Tüm o altındaki', 'Çünkü teras tenteyle [ııı] tüm o altındaki'],
  ['Dün eee Mehmet geldi.', 'Dün [eee] Mehmet geldi.'],
  ["Mehmet bey'e yazdım.", 'Mehmet Bey’e yazdım.'],
]);

cases('field reports', [
  ['Yanına bir de sebze. Patlıcan. Patlıcan alalım.', 'Yanına bir de sebze. Patlıcan. Patlıcan alalım.'],
  ['patlıcanlar, patlıcanı', 'Patlıcanlar, patlıcanı'],
  ['Vay, süper plan.', '[Vay], süper plan.'],
  ['vaaay be', '[Vay] be'],
  ['Uff. Şimdi ne alsak?', '[Uff] şimdi ne alsak?'],
  ['[Haa]! Bu [ııı] bayağı ilginç.', '[Haa]! Bu [ııı] bayağı ilginç.'],
  ['Bu benim ilk gezim [off]. Böyle olmamalıydı. [Off].', 'Bu benim ilk gezim [off]. Böyle olmamalıydı. [Off].'],
  ['yarın gelicem', 'Yarın geleceğim'],
]);

cases('loan word off is not a sigh', [
  ['Bazı günlerinizi off günler olarak belirleriz.', 'Bazı günlerinizi off günler olarak belirleriz.'],
  ['inanamıyorum ki ben *off bu benim ilk gezim', 'İnanamıyorum ki ben [off] bu benim ilk gezim'],
  ['offf çok yoruldum', '[Off] çok yoruldum'],
]);
