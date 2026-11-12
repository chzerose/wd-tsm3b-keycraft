/* ============================================================
   HERO KEYBOARD — index.html only
   ============================================================ */

const KC_HERO_ROWS = [
  { keys: ['ESC','1','2','3','4','5','6','7','8','9','0'], },
  { keys: ['TAB','Q','W','E','R','T','Y','U','I','O','P'], },
  { keys: ['CAPS','A','S','D','F','G','H','J','K','L'], },
  { keys: ['SHIFT','Z','X','C','V','B','N','M'], },
  { keys: ['SPACE'], },
];

function kcRenderHeroKeyboard() {
  const host = document.getElementById('hero-keyboard');
  if (!host) return;
  KC_HERO_ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'hero-row';
    row.keys.forEach(k => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hero-key';
      if (k === 'SPACE') btn.classList.add('wide-space');
      if (['TAB','CAPS','SHIFT'].includes(k)) btn.classList.add('wide-' + k.toLowerCase());
      btn.textContent = k === 'SPACE' ? '' : k;
      btn.setAttribute('aria-label', 'Key ' + k);
      btn.addEventListener('click', () => kcPressHeroKey(btn, k));
      rowEl.appendChild(btn);
    });
    host.appendChild(rowEl);
  });
}

function kcPressHeroKey(btn, label) {
  btn.classList.add('pressed');
  playSound('thock');
  const readout = document.getElementById('hero-readout');
  if (readout) readout.textContent = 'LAST KEY: ' + label;
  setTimeout(() => btn.classList.remove('pressed'), 140);
}

document.addEventListener('DOMContentLoaded', kcRenderHeroKeyboard);
