// Music theory for the Dhun clone. No DOM here, so Node can test it.
const Theory = (() => {
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], NAT = [0, 2, 4, 5, 7, 9, 11];
  const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];   // the 12 keys, spelled the way a musician writes them
  const SCALES = {
    major: { label: 'Major · original', name: 'major', steps: [0, 2, 4, 5, 7, 9, 11] },
    minor: { label: 'Minor', name: 'minor', steps: [0, 2, 3, 5, 7, 8, 10] },
    dorian: { label: 'Dorian', name: 'Dorian', steps: [0, 2, 3, 5, 7, 9, 10] },
    mixolydian: { label: 'Mixolydian', name: 'Mixolydian', steps: [0, 2, 4, 5, 7, 9, 10] },
    mayamalavagowla: { label: 'Mayamalavagowla', name: 'Mayamalavagowla', steps: [0, 1, 4, 5, 7, 8, 11] },
  };
  const SARGAM = ['s', 'r', 'g', 'm', 'p', 'd', 'n'], SYLL = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'];

  const parseKey = (k) => { const li = LETTERS.indexOf(k[0]); const a = k[1] === '#' ? 1 : k[1] === 'b' ? -1 : 0; return { li, pc: (NAT[li] + a + 12) % 12 }; };
  const accStr = (n) => (n > 0 ? '#'.repeat(n) : 'b'.repeat(-n));

  // SPELLING RULE: degree n of a scale uses the n-th LETTER counting up from the key's letter
  // (G major: G A B C D E F), then the accidental is whatever makes that letter hit the right pitch.
  // That is why G major has F# (letter F, sharp), never Gb, and F# major has E#, not F.
  function spellScale(key, scale = 'major') {
    const { li, pc } = parseKey(key);
    return SCALES[scale].steps.map((st, i) => {
      const L = (li + i) % 7;
      let d = (((pc + st) % 12) - NAT[L] + 12) % 12; if (d > 6) d -= 12;
      return LETTERS[L] + accStr(d);
    });
  }
  // Tonic sits near G3 (MIDI 55), within a 12-semitone window so every key stays in a comfortable range.
  const tonicMidi = (key) => 55 + (((parseKey(key).pc - 7 + 18) % 12) - 6);
  const noteMidi = (key, scale, deg, oct = 0, shift = 0) => tonicMidi(key) + SCALES[scale].steps[deg - 1] + 12 * (oct + shift);
  function nameForMidi(midi, key, scale) {
    const { pc } = parseKey(key), names = spellScale(key, scale), p = ((midi % 12) + 12) % 12;
    const i = SCALES[scale].steps.findIndex((st) => (pc + st) % 12 === p);
    return i < 0 ? null : names[i];
  }

  // TUNE FORMAT: one string. Bars are separated by |. A note is its scale number 1-7,
  // then ' for each octave up (or , for down), then e = eighth, h = half, w = whole (none = quarter), then . = dotted.
  function parseTune(str, meter) {
    const [num, den] = meter.split('/').map(Number), barLen = (num * 4) / den, DUR = { e: 0.5, h: 2, w: 4 };
    const bars = [], notes = [], warnings = []; let t = 0;
    str.split('|').map((s) => s.trim()).filter(Boolean).forEach((barStr, bi) => {
      const bar = { notes: [], len: 0 };
      barStr.split(/\s+/).forEach((tok) => {
        const m = /^([1-7])('*|,*)([ehw]?)(\.?)$/.exec(tok);
        if (!m) throw new Error(`Bad note "${tok}" in bar ${bi + 1}`);
        const dur = (DUR[m[3]] || 1) * (m[4] ? 1.5 : 1);
        const n = { deg: +m[1], oct: (m[2][0] === "'" ? 1 : -1) * m[2].length || 0, dur, start: t, rel: bar.len, eighth: m[3] === 'e', idx: notes.length };
        bar.notes.push(n); notes.push(n); bar.len += dur; t += dur;
      });
      bars.push(bar);
    });
    for (const bar of bars) bar.notes.forEach((n, i, a) => {            // beam two eighths that sit in the same beat
      const x = a[i + 1];
      if (n.eighth && x && x.eighth && !n.beamPrev && n.rel % 1 === 0 && Math.floor(x.rel) === n.rel) { n.beamNext = true; x.beamPrev = true; }
    });
    bars.forEach((b, i) => { if (i > 0 && i < bars.length - 1 && Math.abs(b.len - barLen) > 1e-9) warnings.push(`bar ${i + 1} has ${b.len} beats, expected ${barLen}`); });
    if (bars.length > 1) { const a = bars[0].len, z = bars[bars.length - 1].len; if (a < barLen - 1e-9 && Math.abs(a + z - barLen) > 1e-9) warnings.push(`pickup (${a}) + last bar (${z}) should add to ${barLen}`); }
    return { bars, notes, total: t, barLen, warnings };
  }
  return { KEYS, SCALES, SARGAM, SYLL, spellScale, tonicMidi, noteMidi, nameForMidi, parseTune, parseKey };
})();
if (typeof module !== 'undefined') module.exports = Theory;
