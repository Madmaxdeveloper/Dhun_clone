// node test.js : checks spelling in all 12 keys, transposing, and that every tune in tunes.js is well-formed.
const assert = require('assert'); global.window = {};
const T = require('./theory.js'); require('./tunes.js');
const MAJOR = { C: 'C D E F G A B', 'C#': 'C# D# E# F# G# A# B#', D: 'D E F# G A B C#', Eb: 'Eb F G Ab Bb C D', E: 'E F# G# A B C# D#', F: 'F G A Bb C D E',
  'F#': 'F# G# A# B C# D# E#', G: 'G A B C D E F#', Ab: 'Ab Bb C Db Eb F G', A: 'A B C# D E F# G#', Bb: 'Bb C D Eb F G A', B: 'B C# D# E F# G# A#' };
for (const k of T.KEYS) assert.deepStrictEqual(T.spellScale(k, 'major').join(' '), MAJOR[k], `major scale in ${k}`);
assert.ok(!T.spellScale('G').includes('Gb') && T.spellScale('G')[6] === 'F#', 'F# in G major, never Gb');
assert.strictEqual(T.spellScale('F#')[6], 'E#', 'E# (not F) in F# major');
assert.strictEqual(T.spellScale('Bb')[3], 'Eb'); assert.deepStrictEqual(T.KEYS, ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'], 'the brief\'s 12 keys');
for (const k of T.KEYS) for (const s of Object.keys(T.SCALES)) { const l = T.spellScale(k, s).map((n) => n[0]); assert.strictEqual(new Set(l).size, 7, `${k} ${s}: 7 different letters`); }
assert.deepStrictEqual(T.spellScale('G', 'mayamalavagowla'), ['G', 'Ab', 'B', 'C', 'D', 'Eb', 'F#']);
const hb = window.TUNES.find((t) => t.title === 'Happy Birthday'), p = T.parseTune(hb.tune, hb.meter);
assert.strictEqual(p.notes.length, 25); assert.strictEqual(p.total, 24); assert.deepStrictEqual(p.warnings, []);
assert.strictEqual(T.noteMidi('G', 'major', 5, 0), 62, 'first note is D'); assert.strictEqual(T.noteMidi('G', 'major', 1, 1), 67, "1' is G");
assert.strictEqual(T.nameForMidi(66, 'G', 'major'), 'F#'); assert.strictEqual(T.nameForMidi(66, 'C#', 'major'), 'F#'); assert.strictEqual(T.nameForMidi(66, 'Db', 'major'), 'Gb'); // Db still spells right if ever added
const base = p.notes.map((n) => T.noteMidi('G', 'major', n.deg, n.oct)); // moving to another key shifts every note by the same amount
for (const k of T.KEYS) { const m = p.notes.map((n) => T.noteMidi(k, 'major', n.deg, n.oct)); const sh = m[0] - base[0];
  assert.ok(m.every((x, i) => x - base[i] === sh), `${k}: same tune, just moved`); assert.ok(m.every((x) => x >= 48 && x <= 90), `${k}: sensible range`); }
for (const t of window.TUNES) { const r = T.parseTune(t.tune, t.meter); assert.deepStrictEqual(r.warnings, [], `${t.title}: ${r.warnings}`); }
assert.strictEqual(new Set(window.TUNES.map((t) => t.id)).size, window.TUNES.length, 'tune ids are unique');
// checks against what the original shows on screen
assert.strictEqual(p.bars.filter((b) => b.endsLine).length, 1, 'Happy Birthday is two rows');
assert.strictEqual(T.noteMidi('G', 'major', 5, 0, hb.oct), 74, 'HB opens on D above middle C (D5), as on the original staff'); assert.strictEqual(T.noteMidi('G', 'major', 1, 1, hb.oct), 79, "1' is G5");
const tw = window.TUNES.find((t) => t.title === 'Twinkle Twinkle Little Star'), tp = T.parseTune(tw.tune, tw.meter);
assert.strictEqual(tp.notes.length, 42); assert.strictEqual(tp.bars.filter((b) => b.endsLine).length, 2, 'three rows of four bars'); assert.strictEqual(tw.tempo, 96);
assert.strictEqual(T.noteMidi('G', 'major', tp.notes[0].deg, tp.notes[0].oct, tw.oct), 67, 'Twinkle starts on G4, as on the original staff');
for (const k of T.KEYS) for (const t of window.TUNES) T.parseTune(t.tune, t.meter).notes.forEach((n) => { const m = T.noteMidi(k, 'major', n.deg, n.oct, t.oct); assert.ok(m >= 48 && m <= 96, `${t.title} in ${k}: ${m} is out of range`); });
const fj = window.TUNES.find((t) => t.title === 'Frère Jacques'), fp = T.parseTune(fj.tune, fj.meter);
assert.strictEqual(fp.notes.length, 32); assert.strictEqual(fp.total, 32, 'eight bars of four beats'); assert.deepStrictEqual(fp.warnings, []); assert.strictEqual(fj.tempo, 104);
assert.strictEqual(fp.notes.filter((n) => n.beamNext).length, 4, 'four beamed pairs of eighths');
assert.strictEqual(window.TUNES.length, 3, 'three tunes, all from the original');
console.log('ALL TESTS PASSED (' + window.TUNES.length + ' tunes, 12 keys)');
