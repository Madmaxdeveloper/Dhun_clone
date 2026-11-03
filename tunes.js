// THE TUNE LIBRARY. One line per tune. To add a fourth tune, add one line here. No other file changes.
//   tune:  bars separated by |   a / starts a new row (optional)   note = scale number 1-7, then ' (octave up) or , (octave down),
//          then e = eighth, h = half, w = whole (nothing = quarter), then . for dotted.
//   oct:   shifts the whole tune up (1) or down (-1) an octave. With oct: 1, number 1 in key G is the G above middle C, as on the original's staff.
//   theme: "mint" (default) or "rose" = the card, title and stick colours.   category, stars, starsDescription, starsToWin: optional, shown on the shelf card.
window.TUNES = [
  { id: 2, title: "Happy Birthday", meter: "3/4", tempo: 100, oct: 1, theme: "mint", category: "Popular", stars: 2, starsDescription: "and not one clue. Brilliant.", tune: "5e 5e | 6 5 1' | 7h 5e 5e | 6 5 2' | 1'h 5e 5e / 5' 3' 1' | 7 6 4'e 4'e | 3' 1' 2' | 1'h" },
  { id: 3, title: "Twinkle Twinkle Little Star", meter: "4/4", tempo: 96, oct: 1, theme: "rose", starsToWin: 2, tune: "1 1 5 5 | 6 6 5h | 4 4 3 3 | 2 2 1h / 5 5 4 4 | 3 3 2h | 5 5 4 4 | 3 3 2h / 1 1 5 5 | 6 6 5h | 4 4 3 3 | 2 2 1h" },
  { id: 6, title: "Frère Jacques", meter: "4/4", tempo: 104, oct: 1, theme: "mint", tune: "1 2 3 1 | 1 2 3 1 | 3 4 5h | 3 4 5h / 5e 6e 5e 4e 3 1 | 5e 6e 5e 4e 3 1 | 1 5, 1h | 1 5, 1h" },
];