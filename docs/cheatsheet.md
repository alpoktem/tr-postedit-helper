# Turkish ASR post-editing: cheat sheet

Nov 12, 2026 · @Alp

The full guideline is long, but most corrections fall into the eight areas below. When in doubt, the full Turkish page and the TDK dictionary at [sozluk.gov.tr](https://sozluk.gov.tr/) decide.

## Before you start

**Turn on a Turkish spellchecker in your browser.** In Chrome: Settings › Languages › Spell check, add Turkish. It catches dropped letters (*cok* for *çok*) and shortened spellings that slipped through. If every word in the box gets a red underline, the spellchecker is set to the wrong language. It won't check circumflexes, apostrophes or tags, so the rules below still apply.

**Set up the curly apostrophe ’ before your first file** (see section 4). You'll need it constantly.

## 1. Write what was said, in official spelling

Keep the speaker's words, word order and grammar, even when they are not standard. Never rewrite into formal Turkish. But spell each word the official way, not the way it sounded.

A single word said in a shortened way gets the full spelling:

| Heard | Write |
| --- | --- |
| gelicem, yapıcam | geleceğim, yapacağım |
| gelceğini | geleceğini |
| geliyom, geliyo | geliyorum, geliyor |
| bi, nası, şöle, baya | bir, nasıl, şöyle, bayağı |

Two words fused into one keep the fused form, but only these: **napıyorsun, napalım, noldu, naber, di mi**. The rest of the word is still spelled in full (*napıyorsun*, not *napıyosun*). If the speaker said both words, write both.

ASR often expands a contraction the speaker really used (*ne oldu* for *noldu*), or uses *-le* where the speaker said *ile*. Listen and match the audio.

## 2. Square brackets: hesitations and exclamations, fixed list only

Square brackets hold hesitations plus a fixed set of exclamations and calls (like \[ha\] at the end of a question, \[haa\] for "oh, I see", \[pşşt\] to call someone). ASR usually drops them, so most of your work here is adding them back. Use only these tags, one per sound, whatever its length:

`[ııı]` `[eee]` `[hmm]` `[ah]` `[ay]` `[vay]` `[ha]` `[haa]` `[hah]` `[off]` `[uff]` `[uuu]` `[şş]` `[pşşt]`

Listen for which vowel it is: `[ııı]` and `[eee]` are different tags. A sound not on the list (such as *ıım*) gets the closest tag, usually `[ııı]`. Note it with the recording ID for the language lead. Never invent a new tag.

These words have meaning and are **never** bracketed: *ya, yav, yani, işte, şey, hani, falan, be, e, hey, aynen*, and the yes-sounds *hıı, hı hı, ıı hı*.

The split follows the list, not a clear logic: *ıı hı* (affirmation) is a plain word, but *dikkat et \[ha\]* is bracketed. Learn the two lists rather than trying to reason it out.

Noises like a cough go in angle brackets. Use only these:

| Tag | Use for |
| --- | --- |
| `<laugh>` | Laughter; words said while laughing are written as usual |
| `<gasp>` | A sudden breath in, usually from surprise |
| `<cough>` | Coughing |
| `<swallow>` | Swallowing |
| `<noise>` … `</noise>` | Any other noise as loud as the speech: open where it starts, close where it ends |
| `<inaudible>` | Speech that is unclear, muffled or can't be heard |

## 3. Capitals around tags

This is the most common slip. A tag that starts a sentence takes the capital, and the word after it stays **lowercase**. Inside a sentence, the tag is all lowercase.

| Correct | Wrong |
| --- | --- |
| \[Eee\] ama artık yapmıyorlar. | \[Eee\] Ama artık yapmıyorlar. |
| \[Iıı\] aslında ezilmiş leblebi. | \[ııı\] Aslında ezilmiş leblebi. |
| çalışırdık. \<cough> Böyle ağzımızdan | çalışırdık. \<cough> böyle ağzımızdan |

Sound tags in angle brackets work the other way: the word after them keeps its capital. Always leave a space between a tag and the next word.

## 4. Characters your keyboard gets wrong

**Apostrophe.** Use the curly ’ (U+2019), never the straight '. It goes before an ending on a name, digit, symbol or abbreviation: *Ayşe’nin, İstanbul’a, 2025’te, %20’si, THY’ye*. On a Mac, hold Option+Shift and press the same key that gives ‘ with Option alone. If you can't find it, turn on "Show Input menu in menu bar" in Keyboard settings, open the Keyboard Viewer and hold Option+Shift to see where ’ is. Check that you get ’ (a raised comma) and not ‘ (an upside-down one).

**Circumflex (â).** Write it exactly where the TDK dictionary does, and nowhere else. ASR usually drops it. The ones you will meet most:

| Write | Not |
| --- | --- |
| hâlâ (still) | hala (= aunt) |
| kâr (profit) | kar (= snow) |
| kâğıt, dükkân, rüzgâr, hikâye, imkân | kağıt, dükkan, rüzgar, hikaye, imkan |
| millî, resmî, askerî (adjectives) | milli, resmi, askeri |

If a word feels like it might take a hat, look it up on [sozluk.gov.tr](https://sozluk.gov.tr/). Never use a hat to show a long vowel.

**Never** use the ellipsis (…) or three dots, or straight quotes. Quotes are “ ”.

## 5. Numbers

A number word that counts becomes a digit, even when it looks odd: *2 tane terasım var*, *10 dakikalık*. The exception is *bir*: it is a digit only when the speaker is really counting or measuring (*sadece 1 kitap, 2 değil*, *1 kg*). When it means "a", "just" or "once", or sits in a set phrase, it stays a word: *bir fırtına, bir bakayım, bir şey, bir daha*.

| Speaker says | Write |
| --- | --- |
| iki virgül beş | 2,5 |
| bin | 1.000 (but years: 2025) |
| yüzde yirmi | %20 |
| beş yüz lira / beş yüz dolar | 500 TL / $500 |
| üçüncü kat | 3. kat |
| saat beşte | saat 5’te |
| iki buçuk milyon | 2 buçuk milyon |

Amounts with a unit left out stay entirely in words: *yirmi beş elli*, *bir altmış sekiz*. Words like *ikimiz*, *üçer üçer*, *onlarca* also stay words.

## 6. Separate small words and spelling traps

*mi/mı/mu/mü*, *de/da* meaning "also", and *ki* meaning "that" are separate words: *Geliyor musun? Ben de geldim. Canan da geliyor mu? Bilmiyorum ki.* For *de/da*, take it out: if the sentence still works, it is separate.

| Write | Not |
| --- | --- |
| bir şey, her şey | bişey, birşey, herşey |
| tabii, tabii ki | tabi, tabi ki |
| bayağı | baya |
| yanlış / yalnız | yalnış / yanlız |
| hafta sonu | haftasonu |
| okey | OK, okay, oki |
| Mehmet Bey, Fatma Hanım | Mehmet bey, Fatma hanım |
| çarşamba, ocak (1 Ocak 2025 in a full date) | Çarşamba, Ocak |

## 7. False starts, stammers and repeated words

ASR usually cleans these away. Put them back exactly as heard.

| What you hear | Write |
| --- | --- |
| Broken-off word, then the full word | Ben ona gö- göre gelirim. |
| Stammer on the start of a word | Ke- Ke- Kenan |
| Break inside the endings | geliyor- geliyorduk |
| A whole word said again | ben ben ben, gerçekten gerçekten |
| Recording ends mid-word | Bu hafta sonu ora— |

A broken-off part ends with a plain hyphen and **always a space** after it: *gö- göre*, never *gö-göre*. A whole word said again gets no hyphen and no comma. The long dash — is only for a recording that cuts off; if the speaker trails off, use no dots, just the mark that fits (or a hesitation tag).

Don't confuse this with the joining hyphen in compound names (*Türk‐Alman*). That is a different character (U+2010) with no space after it, and you will rarely need it.

## 8. Foreign words, punctuation, and when unsure

A whole stretch in another language goes in curly brackets: *{see you tomorrow!}*. Established loans (*mail, online, süper, okey*) stay plain, and so do names, with the apostrophe before endings: *Netflix’te, WhatsApp’tan*.

Allowed marks: `. , ? ! :` plus quotes “ ” and the apostrophe ’. No semicolons, no ellipsis, no pauses marked. A question shown only by rising intonation still gets a ?. Add commas where they help reading, for example before *yani* or *ama* between clauses.

Transcribe the audio, not what you know was meant. If a word is clipped or missing in the recording, do not add it back. If a recording is badly cut or distorted, use the problem flags in the tool. For anything not covered here, check the full Turkish page, then collect the question with the recording ID for the language lead's weekly batch.
