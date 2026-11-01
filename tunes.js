// THE TUNE LIBRARY. One line per tune. To add a fourth tune, add one line here. No other file changes.
//   tune:  bars separated by |   note = scale number 1-7, then ' (octave up) or , (octave down),
//          then e = eighth, h = half, w = whole (nothing = quarter), then . for dotted.
//   oct:   optional, shifts the whole tune up (1) or down (-1) an octave so it sits comfortably.
window.TUNES = [
  { id: 1, title: "Twinkle, Twinkle, Little Star", meter: "4/4", tempo: 100, oct: 1, tune: "1 1 5 5 | 6 6 5h | 4 4 3 3 | 2 2 1h | 5 5 4 4 | 3 3 2h | 5 5 4 4 | 3 3 2h | 1 1 5 5 | 6 6 5h | 4 4 3 3 | 2 2 1h" },
  { id: 2, title: "Happy Birthday", meter: "3/4", tempo: 100, tune: "5e 5e | 6 5 1' | 7h 5e 5e | 6 5 2' | 1'h 5e 5e | 5' 3' 1' | 7 6 4'e 4'e | 3' 1' 2' | 1'h" },
  { id: 3, title: "Mary Had a Little Lamb", meter: "4/4", tempo: 110, oct: 1, tune: "3 2 1 2 | 3 3 3h | 2 2 2h | 3 5 5h | 3 2 1 2 | 3 3 3 3 | 2 2 3 2 | 1w" },
];
