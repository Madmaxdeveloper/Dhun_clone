# Dhun clone: guess the tune (Part 1)

A from-scratch rebuild of the tune shelf and tune page of Nathaniel School of Music's **Dhun**, written only from looking at the app.
Plain HTML, CSS and JavaScript. No build step, no framework, no downloaded sounds.

**Live:** _add your link here_

## Run it
Open `index.html` in a browser (the handwriting fonts load from Google Fonts, so be online). Or serve the folder:

    npx serve .          # or: python3 -m http.server
    node test.js         # checks note spelling in all 12 keys and that every tune is well-formed

## What it does
- **Tune shelf** (`#/`): a card per tune with its number, title, and 12 dots for the keys you have played. The ★ in the header counts keys played.
- **Tune page** (`#/tune/2`): the handwritten rhythm sticks, the scale number under each note, the swara under that, a time signature, slanted bar lines. Works at desktop and phone width.
- **Play**: a synthesised piano, a count-in, an optional metronome, a tempo slider (🐢 to 🐇) with a reset. The playing note lights up on the sheet and on the piano.
- **12 keys**: pick any key. Numbers and swaras stay put; the note names change and are spelled correctly (F# in G major, never Gb). Default key is **G**. Note names are plain: C, F#, Bb, never C4.
- Scale menu (major, minor, Dorian, Mixolydian, Mayamalavagowla), a "Sing as" menu (s r g or sa re ga), and a Note names toggle.
- A key gets its tick only when you listen right through.

## Adding a tune takes one line
Open `tunes.js` and add a line. No code changes:

    { id: 4, title: "Jingle Bells", meter: "4/4", tempo: 120, tune: "3 3 3h | 3 3 3h | 3 5 1. 2e | 3w" },

A note is its scale number (1 to 7), then `'` for each octave up (`,` for down), then `e` eighth, `h` half, `w` whole (nothing = quarter), then `.` for dotted. Bars are separated by `|`. If a bar has the wrong number of beats, the browser console says which one.

## How the note names are spelled
Degree *n* of a key takes the *n*-th **letter** counting up from the key's own letter (G major: G A B C D E **F**), and the accidental is whatever makes that letter land on the right pitch. So G major gets F# (letter F, sharp), never Gb, and F# major correctly gets E#. It is a few lines in `theory.js` and `test.js` proves all 12 keys.

## Cloning an app whose code I cannot see
I used it for ten minutes, then worked from screenshots: layout, colours, the way the sticks, numbers and swaras line up, and what each control does. I wrote everything myself and never looked at their files. The rhythm sticks are drawn as SVG paths with a tiny repeatable wobble so they look hand-drawn.

## Honest notes
- **Tune 2 (Happy Birthday)** is transcribed from the original's tune page (numbers, swaras and rhythm). **Tunes 1 and 3** are public-domain tunes I entered in the same format; replace them with other shelf tunes by editing one line each.
- I could not see the original's shelf or its star rules, so the shelf layout and the star count (keys played) are my own design.
- Not built: the Mela game map, guitar view, chords, quiz, microphone and rhythm-tapping, homework links.
- The piano sound is synthesised in the browser (a few sine harmonics with a long decay), so it sounds like a soft electric piano rather than a sampled grand.
