// Dhun clone: shelf + tune page. Plain JavaScript, no build step.
(() => {
'use strict';
const { KEYS, SCALES, SARGAM, SYLL, spellScale, noteMidi, nameForMidi, parseTune } = Theory;
const TUNES = window.TUNES;
const $ = (s, r = document) => r.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- saved settings (localStorage can be blocked, so every access is guarded) ----
const store = {
  get(k, d) { try { const v = localStorage.getItem('dhun:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('dhun:' + k, JSON.stringify(v)); } catch { /* ignore */ } },
};
const state = { key: store.get('key', 'G'), scale: store.get('scale', 'major'), sing: store.get('sing', 'letters'),
  swaras: store.get('swaras', true), names: store.get('names', false), metro: store.get('metro', true), played: store.get('played', {}) };
if (!KEYS.includes(state.key)) state.key = 'G';          // house rule: default key is G
if (!SCALES[state.scale]) state.scale = 'major';
const save = (k) => store.set(k, state[k]);
const keysDone = (id) => Object.keys(state.played[id] || {}).length;
const starCount = () => TUNES.reduce((a, t) => a + keysDone(t.id), 0);
const updateStars = () => { $('#starCount').textContent = starCount(); };
const swaraText = (n) => (state.sing === 'syllables' ? SYLL : SARGAM)[n.deg - 1] + (n.oct > 0 ? "'".repeat(n.oct) : '');
const numText = (n) => n.deg + (n.oct > 0 ? "'".repeat(n.oct) : n.oct < 0 ? ','.repeat(-n.oct) : '');

// ---- header ----
$('#singAs').value = state.sing;
$('#singAs').onchange = (e) => { state.sing = e.target.value; save('sing'); cur && cur.redraw(); };
$('#reset').onclick = () => { if (confirm('Clear your played keys and stars?')) { state.played = {}; save('played'); updateStars(); route(); } };
updateStars();

// ---- router ----
let cur = null, session = null, ctx = null;
function route() {
  stopPlay();
  const m = /^#\/tune\/(\d+)/.exec(location.hash);
  m && TUNES.some((t) => t.id === +m[1]) ? renderTune(+m[1]) : renderShelf();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

// ---- shelf ----
function renderShelf() {
  cur = null;
  $('#main').innerHTML = `<section class="shelf-head"><h1 class="hand">First Tunes &amp; Rhymes <small>key of G</small></h1>
    <p class="muted">${TUNES.length} tunes. Pick one, guess it, hear it, then play it in all 12 keys.</p></section>
    <div class="shelf">${TUNES.map((t) => {
      const done = state.played[t.id] || {}, n = Object.keys(done).length;
      return `<a class="card" href="#/tune/${t.id}"><span class="num hand">${t.id}</span><span><b class="title hand">${esc(t.title)}</b>
        <small>${esc(t.meter)} · G major</small><span class="dots" aria-hidden="true">${KEYS.map((k) => `<i class="${done[k] ? 'on' : ''}"></i>`).join('')}</span>
        <small>${n > 0 ? '★ ' : ''}${n} of 12 keys${n === 12 ? ' ♛' : ''}</small></span></a>`;
    }).join('')}</div>`;
}

// ---- tune page ----
function renderTune(id) {
  const t = TUNES.find((x) => x.id === id), parsed = parseTune(t.tune, t.meter);
  parsed.warnings.forEach((w) => console.warn(`Tune ${id}: ${w}`));
  const [num, den] = t.meter.split('/').map(Number), dots = den === 8 ? num / 3 : num, clickEvery = den === 8 ? 1.5 : 1;
  const idx = TUNES.indexOf(t), prev = TUNES[idx - 1], next = TUNES[idx + 1];
  let tempo = store.get('tempo:' + id, t.tempo);
  const shift = t.oct || 0, midi = (n) => noteMidi(state.key, state.scale, n.deg, n.oct, shift);

  $('#main').innerHTML = `
    <div class="navbtns"><a class="pill" href="#/">← Back to the mela</a><a class="pill" href="#/">← All tunes</a></div>
    <section class="titlecard"><span class="bignum hand">${t.id}</span><div><h1 class="hand">${esc(t.title)}</h1>
      <div class="muted" id="sub"></div><p class="blurb">A new tune for you. Listen and follow the numbers, then try it in another key.</p></div></section>
    <div class="sheet" id="sheet"></div><div class="rule"></div>
    <div class="controls">
      <button class="play" id="play">▶ Play</button><span class="dots" id="dots">${'<i></i>'.repeat(dots)}</span>
      <div class="tempo"><span>🐢</span><input id="tempo" type="range" min="40" max="200" value="${tempo}" aria-label="Tempo"><span>🐇</span>
        <span id="tempoLbl"></span><button class="pill" id="tempoReset">↺ ${t.tempo}</button></div>
      <label>Key <select id="keySel">${KEYS.map((k) => `<option${k === state.key ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
      <label>Scale <select id="scaleSel">${Object.entries(SCALES).map(([k, s]) => `<option value="${k}"${k === state.scale ? ' selected' : ''}>${s.label}</option>`).join('')}</select></label>
    </div>
    <div class="toggles">
      <button class="tg" data-t="swaras">Swaras</button><button class="tg" data-t="metro">Metronome</button><button class="tg" data-t="names">Note names</button>
    </div>
    <div class="scalebar" id="chips"></div>
    <p class="hint">The numbers and swaras never change. Only the note names do, spelled correctly for the key you choose. Coloured keys belong to this melody.</p>
    <svg class="piano" id="piano" role="img" aria-label="Piano keyboard"></svg>
    <p class="progress" id="progress"></p>
    <div class="pager">${prev ? `<a class="pill" href="#/tune/${prev.id}">← Tune ${prev.id}</a>` : '<span></span>'}${next ? `<a class="pill" href="#/tune/${next.id}">Tune ${next.id} →</a>` : '<span></span>'}</div>`;

  // --- notation: the rhythm sticks, with numbers, swaras (and note names) lined up under each note ---
  const jit = (s) => { const x = Math.sin(s * 12.9898) * 43758.5453; return (x - Math.floor(x) - 0.5) * 2.2; };   // tiny, repeatable wobble = hand-drawn feel
  function drawSheet() {
    const box = $('#sheet'), W = Math.max(300, box.clientWidth), narrow = W < 560, padL = narrow ? 30 : 62, pad = 12;
    const maxLen = Math.max(...parsed.bars.map((b) => b.len));
    // wide screens: roomy spacing (about 5 bars a row, like the original); phones: squeeze so two bars fit a row
    const BW = narrow ? Math.max(34, Math.min(66, (W - padL - 4 * pad) / (2 * maxLen))) : Math.max(38, Math.min(80, (W - padL - 2 * pad - 6) / maxLen));
    const rows = []; let row = [], x = padL;
    for (const b of parsed.bars) { const w = b.len * BW + 2 * pad; if (x + w > W - 4 && row.length) { rows.push(row); row = []; x = padL; } row.push({ b, x, w }); x += w; }
    if (row.length) rows.push(row);
    const rowH = state.names ? 190 : 156, svg = sv('svg', { viewBox: `0 0 ${W} ${rows.length * rowH + 6}`, role: 'img', 'aria-label': 'Rhythm, scale numbers and swaras' });
    const sty = (n) => Math.max(18, Math.min(30, n * 0.5));
    rows.forEach((r, ri) => {
      const top = ri * rowH + 16, sTop = top + 8, sBot = top + 56, numY = top + 104, swY = top + 136, nmY = top + 168;
      if (ri === 0) { const tsx = narrow ? 13 : 26, tss = narrow ? 'font-size:32px' : ''; svg.append(sv('text', { class: 't-ts', x: tsx, y: top + 38, style: tss }, num), sv('text', { class: 't-ts', x: tsx, y: top + 80, style: tss }, den)); }
      r.forEach(({ b, x: mx, w }, bi) => {
        b.notes.forEach((n) => {
          const cx = mx + pad + n.rel * BW + BW * 0.28, s = n.idx * 7.7;
          svg.append(sv('rect', { class: 'hl', 'data-i': n.idx, x: cx - 22, y: top - 4, width: 44, height: rowH - (state.names ? 18 : 34), rx: 10 }));
          const g = sv('g', {});
          if (n.dur < 4) g.append(sv('path', { class: 'stk', d: `M${cx} ${sTop} Q${cx + jit(s)} ${(sTop + sBot) / 2} ${cx} ${sBot}` }));
          if (n.dur >= 2 && n.dur < 4) g.append(sv('ellipse', { class: 'stk', cx: cx - 5, cy: sBot + 4, rx: 10, ry: 6.5, transform: `rotate(-22 ${cx - 5} ${sBot + 4})` }));
          else if (n.dur >= 4) g.append(sv('ellipse', { class: 'stk', cx, cy: sBot - 8, rx: 13, ry: 8.5, transform: `rotate(-18 ${cx} ${sBot - 8})` }));
          else g.append(sv('path', { class: 'stk', d: `M${cx} ${sBot} Q${cx - 6 + jit(s + 1)} ${sBot + 6} ${cx - 13} ${sBot + 15}` }));        // the little foot of a short note
          if (n.eighth && !n.beamNext && !n.beamPrev) g.append(sv('path', { class: 'stk', d: `M${cx} ${sTop} Q${cx + 8} ${sTop + 4} ${cx + 13} ${sTop + 16}` }));
          if (n.beamNext) { const nx = b.notes[b.notes.indexOf(n) + 1], cx2 = mx + pad + nx.rel * BW + BW * 0.28; g.append(sv('path', { class: 'stk beam', d: `M${cx - 2} ${sTop} L${cx2 + 2} ${sTop + jit(s + 2) * 0.5}` })); }
          if (Math.abs(n.dur % 1 - 0.5) < 1e-9 && n.dur > 1) g.append(sv('circle', { class: 'stkfill', cx: cx + 15, cy: sBot + 6, r: 2.6 }));      // dotted note
          svg.append(g, sv('text', { class: 't-num', x: cx, y: numY, style: `font-size:${sty(BW)}px` }, numText(n)));
          if (state.swaras) svg.append(sv('text', { class: 't-sw', x: cx, y: swY, style: `font-size:${sty(BW)}px` }, swaraText(n)));
          if (state.names) svg.append(sv('text', { class: 't-nm', x: cx, y: nmY }, nameForMidi(midi(n), state.key, state.scale)));
        });
        const ex = mx + w, last = ri === rows.length - 1 && bi === r.length - 1;      // slanted hand-drawn bar lines
        svg.append(sv('path', { class: 'bar-l', d: `M${ex + 3} ${top - 2} L${ex - 5} ${top + 118}` }));
        if (last) svg.append(sv('path', { class: 'bar-l', style: 'stroke-width:6', d: `M${ex + 10} ${top - 2} L${ex + 2} ${top + 118}` }));
      });
    });
    box.replaceChildren(svg);
  }

  // --- key chips + piano ---
  function drawKeys() {
    const names = spellScale(state.key, state.scale);
    $('#sub').textContent = `${t.meter} · ${state.key} ${SCALES[state.scale].name}`;
    $('#chips').innerHTML = `<b>${state.key} ${SCALES[state.scale].name}</b>` + names.map((n, i) => `<span class="chip">${n}<small>${i + 1}</small></span>`).join('');
    const mids = parsed.notes.map(midi), inTune = new Set(mids), lo = 12 * Math.floor(Math.min(...mids) / 12), hi = 12 * Math.floor(Math.max(...mids) / 12) + 11;
    const whites = []; for (let m = lo; m <= hi; m++) if ([0, 2, 4, 5, 7, 9, 11].includes(m % 12)) whites.push(m);
    const W = 36, H = 170, BWd = 22, BH = 104, svg = $('#piano'); svg.replaceChildren(); svg.setAttribute('viewBox', `0 0 ${whites.length * W} ${H}`);
    whites.forEach((m, i) => { const g = sv('g', { class: 'pk' + (inTune.has(m) ? ' mel' : ''), 'data-m': m }), nm = nameForMidi(m, state.key, state.scale);
      g.append(sv('rect', { x: i * W + 1, y: 1, width: W - 2, height: H - 2, rx: 4 })); if (nm) g.append(sv('text', { x: i * W + W / 2, y: H - 14 }, nm)); svg.append(g); });
    for (let m = lo; m <= hi; m++) if ([1, 3, 6, 8, 10].includes(m % 12)) {
      const wi = whites.indexOf(m - 1), nm = nameForMidi(m, state.key, state.scale), g = sv('g', { class: 'pk blk' + (inTune.has(m) ? ' mel' : ''), 'data-m': m });
      g.append(sv('rect', { x: (wi + 1) * W - BWd / 2, y: 1, width: BWd, height: BH, rx: 3 })); if (nm) g.append(sv('text', { x: (wi + 1) * W, y: BH - 12 }, nm)); svg.append(g);
    }
    svg.querySelectorAll('.pk').forEach((k) => k.addEventListener('click', () => { audio(); const c = ctx; pianoNote(c.destination, +k.dataset.m, c.currentTime, 0.9); }));   // tap a key to hear it
  }
  function updateProgress() {
    const n = keysDone(id);
    $('#progress').innerHTML = `<b>Keys played: ${n} of 12.</b> Listen to it right through and that key gets a tick. Collect all 12 keys for the crown ♛${n === 12 ? ' (you have it!)' : ''}.`;
  }
  const tempoWord = (b) => (b < 60 ? 'slow' : b < 90 ? 'easy' : b < 120 ? 'walking' : b < 150 ? 'brisk' : 'fast');
  const showTempo = () => { $('#tempoLbl').textContent = `♩ = ${tempo} · ${tempoWord(tempo)}`; };
  const syncToggles = () => document.querySelectorAll('.tg').forEach((b) => b.setAttribute('aria-pressed', state[b.dataset.t]));
  const redraw = () => { drawSheet(); drawKeys(); };
  cur = { redraw, tune: t, parsed, midi, dots, clickEvery, getTempo: () => tempo, updateProgress };
  redraw(); showTempo(); syncToggles(); updateProgress();

  $('#keySel').onchange = (e) => { state.key = e.target.value; save('key'); stopPlay(); redraw(); };
  $('#scaleSel').onchange = (e) => { state.scale = e.target.value; save('scale'); stopPlay(); redraw(); };
  $('#tempo').oninput = (e) => { tempo = +e.target.value; store.set('tempo:' + id, tempo); showTempo(); };
  $('#tempoReset').onclick = () => { tempo = t.tempo; $('#tempo').value = tempo; store.set('tempo:' + id, tempo); showTempo(); };
  document.querySelectorAll('.tg').forEach((b) => (b.onclick = () => { state[b.dataset.t] = !state[b.dataset.t]; save(b.dataset.t); syncToggles(); if (b.dataset.t !== 'metro') drawSheet(); }));
  $('#play').onclick = () => (session ? stopPlay() : startPlay());
  clearTimeout(renderTune.rz); window.onresize = () => { clearTimeout(renderTune.rz); renderTune.rz = setTimeout(() => cur && drawSheet(), 120); };
}

// ---- sound: a small synthesised piano (no downloads), plus a metronome click ----
function audio() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; }
function pianoNote(dest, m, t, dur) {
  const c = ctx, f = 440 * Math.pow(2, (m - 69) / 12), g = c.createGain(), lp = c.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(9000, f * 10), t); lp.frequency.exponentialRampToValueAtTime(Math.max(700, f * 2.2), t + 1.2);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.32, t + 0.006);
  g.gain.setTargetAtTime(0.07, t + 0.006, 0.75);            // the long slow fade of a struck string
  g.gain.setTargetAtTime(0, t + dur, 0.09);                 // the damper falls when the note ends
  [[1, 1, 0], [2, 0.5, 0], [3, 0.26, 0], [4, 0.13, 0], [5, 0.06, 0], [1, 0.45, 4]].forEach(([h, a, det]) => {
    const o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.value = f * h; o.detune.value = det; og.gain.value = a;
    o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 1);
  });
  lp.connect(g); g.connect(dest);
}
function clickSound(dest, t, accent) {
  const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = accent ? 1500 : 1000; o.type = 'square';
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(accent ? 0.12 : 0.07, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.06);
}
function startPlay() {
  if (!cur) return; stopPlay();
  const c = audio(), { tune: t, parsed, midi, dots, clickEvery } = cur, sec = 60 / cur.getTempo(), master = c.createGain(); master.connect(c.destination);
  const t0 = c.currentTime + 0.15, base = t0 + dots * clickEvery * sec, pickup = parsed.bars[0].len < parsed.barLen - 1e-9 ? parsed.bars[0].len : 0;
  if (state.metro) {
    for (let k = 0; k < dots; k++) clickSound(master, t0 + k * clickEvery * sec, k === 0);
    for (let b = 0; b < parsed.total; b += clickEvery) clickSound(master, base + b * sec, (((b - pickup) % parsed.barLen) + parsed.barLen) % parsed.barLen < 1e-9);
  }
  parsed.notes.forEach((n) => pianoNote(master, midi(n), base + n.start * sec, n.dur * sec));
  session = { master, t0, base, sec, raf: 0, last: -1, done: false, key: state.key };
  $('#play').textContent = '■ Stop';
  const tick = () => {
    if (!session) return; const now = c.currentTime, S = session;
    const ci = now < S.base ? Math.floor((now - S.t0) / (clickEvery * S.sec)) : -1;
    document.querySelectorAll('#dots i').forEach((d, i) => d.classList.toggle('on', i === ci));
    const beat = (now - S.base) / S.sec; let cn = -1;
    if (beat >= 0) for (const n of parsed.notes) if (beat >= n.start && beat < n.start + n.dur) { cn = n.idx; break; }
    if (cn !== S.last) {
      document.querySelectorAll('.hl.on, .pk.on').forEach((e) => e.classList.remove('on'));
      if (cn >= 0) { document.querySelector(`.hl[data-i="${cn}"]`)?.classList.add('on'); document.querySelector(`.pk[data-m="${midi(parsed.notes[cn])}"]`)?.classList.add('on'); }
      S.last = cn;
    }
    if (beat > parsed.total + 0.3) { finish(); return; }
    S.raf = requestAnimationFrame(tick);
  };
  session.raf = requestAnimationFrame(tick);
}
function finish() {            // reached the end: listened right through, so this key gets its tick
  if (!session) return; const k = session.key, id = cur && cur.tune.id; stopPlay();
  if (id) { (state.played[id] = state.played[id] || {})[k] = 1; save('played'); updateStars(); cur.updateProgress(); }
}
function stopPlay() {
  if (!session) return; const S = session; session = null; cancelAnimationFrame(S.raf);
  try { S.master.gain.setTargetAtTime(0, ctx.currentTime, 0.03); setTimeout(() => S.master.disconnect(), 300); } catch { /* ignore */ }
  document.querySelectorAll('.hl.on, .pk.on, #dots i.on').forEach((e) => e.classList.remove('on'));
  const p = $('#play'); if (p) p.textContent = '▶ Play';
}
route();
})();
