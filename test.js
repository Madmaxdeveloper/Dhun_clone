// node test.js : checks spelling in all 12 keys, transposing, and that every tune in tunes.js is well-formed.
const assert = require('assert'); global.window = {};
const T = require('./theory.js'); require('./tunes.js');
const MAJOR = { C: 'C D E F G A B', Db: 'Db Eb F Gb Ab Bb C', D: 'D E F# G A B C#', Eb: 'Eb F G Ab Bb C D', E: 'E F# G# A B C# D#', F: 'F G A Bb C D E',
  'F#': 'F# G# A# B C# D# E#', G: 'G A B C D E F#', Ab: 'Ab Bb C Db Eb F G', A: 'A B C# D E F# G#', Bb: 'Bb C D Eb F G A', B: 'B C# D# E F# G# A#' };
for (const k of T.KEYS) assert.deepStrictEqual(T.spellScale(k, 'major').join(' '), MAJOR[k], `major scale in ${k}`);
assert.ok(!T.spellScale('G').includes('Gb') && T.spellScale('G')[6] === 'F#', 'F# in G major, never Gb');
assert.strictEqual(T.spellScale('F#')[6], 'E#', 'E# (not F) in F# major');
assert.strictEqual(T.spellScale('Bb')[3], 'Eb');
for (const k of T.KEYS) for (const s of Object.keys(T.SCALES)) { const l = T.spellScale(k, s).map((n) => n[0]); assert.strictEqual(new Set(l).size, 7, `${k} ${s}: 7 different letters`); }
assert.deepStrictEqual(T.spellScale('G', 'mayamalavagowla'), ['G', 'Ab', 'B', 'C', 'D', 'Eb', 'F#']);
const hb = window.TUNES.find((t) => t.title === 'Happy Birthday'), p = T.parseTune(hb.tune, hb.meter);
assert.strictEqual(p.notes.length, 25); assert.strictEqual(p.total, 24); assert.deepStrictEqual(p.warnings, []);
assert.strictEqual(T.noteMidi('G', 'major', 5, 0), 62, 'first note is D'); assert.strictEqual(T.noteMidi('G', 'major', 1, 1), 67, "1' is G");
assert.strictEqual(T.nameForMidi(66, 'G', 'major'), 'F#'); assert.strictEqual(T.nameForMidi(66, 'Db', 'major'), 'Gb');
const base = p.notes.map((n) => T.noteMidi('G', 'major', n.deg, n.oct)); // moving to another key shifts every note by the same amount
for (const k of T.KEYS) { const m = p.notes.map((n) => T.noteMidi(k, 'major', n.deg, n.oct)); const sh = m[0] - base[0];
  assert.ok(m.every((x, i) => x - base[i] === sh), `${k}: same tune, just moved`); assert.ok(m.every((x) => x >= 48 && x <= 90), `${k}: sensible range`); }
for (const t of window.TUNES) { const r = T.parseTune(t.tune, t.meter); assert.deepStrictEqual(r.warnings, [], `${t.title}: ${r.warnings}`); }
assert.strictEqual(new Set(window.TUNES.map((t) => t.id)).size, window.TUNES.length, 'tune ids are unique');
console.log('ALL TESTS PASSED (' + window.TUNES.length + ' tunes, 12 keys)');
