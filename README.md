# Turkish post-edit helper

A small browser tool for post-editing Turkish (tur_Latn_TR) ASR transcriptions under the
speech-benchmark guidelines. Paste the ASR text, edit while you listen, copy the result.

**Use it:** https://alpoktem.github.io/tr-postedit-helper/

## How it works

1. Paste the ASR transcription into **Your edit**. That first paste is kept as the original for the diff.
2. Edit while you listen. Type hesitations bare (`eee`, `ııı`, `hmm`, `uff`) and the tags that are also
   words with a star (`*ay`, `*ha`, `*haa`, `*hah`, `*ah`, `*off`, `*laugh`, `*cough`, `*noise` … `*/noise`).
3. **Final** shows the corrected text live. Click a mark to keep the original or apply a suggestion.
   **Copy** puts the final text on the clipboard.

Marks: green = fixed, yellow = fixed but check, dashed = suggestion (not applied), red = needs you,
grey = reminder.

What it handles: tag capitals (`[Eee] ama`, `[Iıı] aslında`), tag normalization, ellipsis removal,
curly apostrophe and quotes, spacing, fixed spellings (bir şey, tabii, di mi, bayağı …), shortened
forms (geliyom → geliyorum, yapıcam → yapacağım), mı/mi and ki separation, circumflex (rüzgâr, kâğıt),
Bey/Hanım, name apostrophes, numbers (2 tane, %20, saat 5’te, 500 TL, 3. kat).

It cannot hear the audio: de/da vs -de/-da, ne oldu vs noldu, ile vs -le, and commas stay your call.

## Editing the word lists

- `data/names.js` — names, places, brands kept capitalized. Names that are also ordinary words go in `AMBIGUOUS`.
- `data/lexicon.js` — fixed spellings, circumflex words, number words, tag lists.

Each user can also add names in **My names** on the page (saved in their browser only).

## Tests

```
npm test
```

To also run the checks on real post-edits kept outside the repo:

```
SAMPLES=/path/to/sample_post-edits.txt npm test
```

Everything runs in the browser; no text leaves the page.
