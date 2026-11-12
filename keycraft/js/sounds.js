/* ============================================================
   KEYCRAFT SOUND SYSTEM
   All sounds are synthesized locally with the Web Audio API —
   no external audio files, no network requests.
   Respects the SOUND ON/OFF toggle, stored in localStorage.
   ============================================================ */

const KC_SOUND_KEY = 'keycraft_sound_enabled';
let kcAudioCtx = null;

function kcSoundEnabled() {
  const v = localStorage.getItem(KC_SOUND_KEY);
  return v === null ? true : v === 'true';
}

function kcSetSoundEnabled(on) {
  localStorage.setItem(KC_SOUND_KEY, on ? 'true' : 'false');
  document.querySelectorAll('.sound-toggle').forEach(btn => {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.querySelector('.label-text') && (btn.querySelector('.label-text').textContent = on ? 'SOUND: ON' : 'SOUND: OFF');
  });
}

function kcCtx() {
  if (!kcAudioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    kcAudioCtx = new AC();
  }
  if (kcAudioCtx.state === 'suspended') kcAudioCtx.resume();
  return kcAudioCtx;
}

/* Each profile is a tiny synthesized envelope. Kept short & quiet
   so repeated key presses never become annoying. */
const KC_SOUND_PROFILES = {
  click:   { type: 'square',   freq: 720,  dur: 0.04, gain: 0.05 },
  thock:   { type: 'sine',     freq: 160,  dur: 0.09, gain: 0.09 },
  clack:   { type: 'triangle', freq: 340,  dur: 0.06, gain: 0.07 },
  pop:     { type: 'sine',     freq: 500,  dur: 0.05, gain: 0.06, pitchUp: true },
  soft:    { type: 'sine',     freq: 300,  dur: 0.08, gain: 0.04 },
  retro:   { type: 'square',   freq: 220,  dur: 0.1,  gain: 0.06, arpeggio: [220, 330] },
  laser:   { type: 'sawtooth', freq: 900,  dur: 0.12, gain: 0.05, pitchDown: true },
  success: { type: 'sine',     freq: 500,  dur: 0.12, gain: 0.07, arpeggio: [500, 700, 900] },
  error:   { type: 'sawtooth', freq: 140,  dur: 0.15, gain: 0.08, pitchDown: true },
};

function kcPlayTone({ type, freq, dur, gain, pitchUp, pitchDown }, startOffset = 0) {
  const ctx = kcCtx();
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (pitchUp) osc.frequency.exponentialRampToValueAtTime(freq * 1.8, t0 + dur);
  if (pitchDown) osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/**
 * playSound(name) — the single entry point used across the site.
 * Example: playSound('thock'), playSound('success')
 */
function playSound(name) {
  if (!kcSoundEnabled()) return;
  const profile = KC_SOUND_PROFILES[name] || KC_SOUND_PROFILES.click;
  try {
    if (profile.arpeggio) {
      profile.arpeggio.forEach((f, i) => kcPlayTone({ ...profile, freq: f }, i * 0.05));
    } else {
      kcPlayTone(profile);
    }
  } catch (e) {
    /* audio can fail silently (autoplay policy) — site still works */
  }
}

/* Wire up any .sound-toggle buttons present on the page */
function kcInitSoundToggle() {
  const on = kcSoundEnabled();
  document.querySelectorAll('.sound-toggle').forEach(btn => {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const labelEl = btn.querySelector('.label-text');
    if (labelEl) labelEl.textContent = on ? 'SOUND: ON' : 'SOUND: OFF';
    btn.addEventListener('click', () => {
      const next = !kcSoundEnabled();
      kcSetSoundEnabled(next);
      if (next) playSound('click');
    });
  });
}

document.addEventListener('DOMContentLoaded', kcInitSoundToggle);
