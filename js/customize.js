/* ============================================================
   KEYCAP LAB — live customization + add custom keycap to cart
   ============================================================ */

const KC_LAB_BASE_PRICE = 399;
const KC_LAB_IMAGE_FEE = 50;

let kcLab = {
  imageData: null,
  imgScale: 100, imgRotate: 0, imgX: 0, imgY: 0,
  text: 'KEY',
  textColor: '#ECEFF4',
  font: "'Press Start 2P', monospace",
  bgColor: '#161A22',
  accentColor: '#4DE8F0',
  profile: 'OEM',
  material: 'ABS',
  sound: 'thock',
  slot: 'ESC',
};
let kcTextTouched = false;

function kcUpdatePreview() {
  const top = document.getElementById('k3d-top');
  const keycap = document.getElementById('keycap-preview');
  const img = document.getElementById('k3d-image');
  const textEl = document.getElementById('k3d-text');

  keycap.style.setProperty('--kc-bg', kcLab.bgColor);
  keycap.style.setProperty('--kc-accent', kcLab.accentColor);

  if (kcLab.imageData) {
    img.src = kcLab.imageData;
    img.hidden = false;
    img.style.transform = `translate(${kcLab.imgX}%, ${kcLab.imgY}%) scale(${kcLab.imgScale / 100}) rotate(${kcLab.imgRotate}deg)`;
  } else {
    img.hidden = true;
  }

  textEl.textContent = kcLab.text || '';
  textEl.style.color = kcLab.textColor;
  textEl.style.fontFamily = kcLab.font;

  const price = KC_LAB_BASE_PRICE + (kcLab.imageData ? KC_LAB_IMAGE_FEE : 0);
  document.getElementById('lab-price').textContent = '₱' + price;
}

function kcTestKeycap() {
  const keycap = document.getElementById('keycap-preview');
  keycap.classList.add('pressed');
  playSound(kcLab.sound);
  setTimeout(() => keycap.classList.remove('pressed'), 130);
}

document.addEventListener('DOMContentLoaded', () => {
  kcUpdatePreview();

  document.getElementById('keycap-preview').addEventListener('click', kcTestKeycap);

  // --- image upload ---
  document.getElementById('img-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      kcLab.imageData = ev.target.result;
      document.getElementById('image-controls').hidden = false;
      kcUpdatePreview();
      sysLog('IMAGE LOADED');
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('img-clear').addEventListener('click', () => {
    kcLab.imageData = null;
    document.getElementById('img-upload').value = '';
    document.getElementById('image-controls').hidden = true;
    kcUpdatePreview();
  });
  ['img-scale', 'img-rotate', 'img-x', 'img-y'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
      const map = { 'img-scale': 'imgScale', 'img-rotate': 'imgRotate', 'img-x': 'imgX', 'img-y': 'imgY' };
      kcLab[map[id]] = Number(e.target.value);
      kcUpdatePreview();
    });
  });

  // --- text ---
  document.getElementById('key-text').addEventListener('input', (e) => {
    kcLab.text = e.target.value.toUpperCase();
    kcTextTouched = true;
    kcUpdatePreview();
  });
  document.getElementById('text-color').addEventListener('input', (e) => {
    kcLab.textColor = e.target.value;
    kcUpdatePreview();
  });
  document.getElementById('font-select').addEventListener('change', (e) => {
    kcLab.font = e.target.value;
    kcUpdatePreview();
  });

  // --- color / background ---
  document.getElementById('bg-color').addEventListener('input', (e) => {
    kcLab.bgColor = e.target.value;
    kcUpdatePreview();
  });
  document.getElementById('accent-color').addEventListener('input', (e) => {
    kcLab.accentColor = e.target.value;
    kcUpdatePreview();
  });

  // --- profile / material pills ---
  document.getElementById('profile-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    document.querySelectorAll('#profile-row .pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    kcLab.profile = btn.dataset.profile;
    playSound('click');
  });
  document.getElementById('material-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    document.querySelectorAll('#material-row .pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    kcLab.material = btn.dataset.material;
    playSound('click');
  });

  // --- sound choice ---
  document.getElementById('sound-options').addEventListener('change', (e) => {
    kcLab.sound = e.target.value;
    playSound(kcLab.sound);
  });
  document.getElementById('test-sound-btn').addEventListener('click', kcTestKeycap);

  // --- key slot dropdown (searchable) ---
  kcInitSlotCombo();

  // --- add to cart ---
  document.getElementById('add-custom-btn').addEventListener('click', async () => {
    const price = KC_LAB_BASE_PRICE + (kcLab.imageData ? KC_LAB_IMAGE_FEE : 0);
    const name = 'CUSTOM_' + (kcLab.text ? kcLab.text.slice(0, 6) : kcLab.slot);
    const config = { ...kcLab };
    if (config.imageData) config.imageData = await kcShrinkImage(config.imageData, 160);
    const before = loadCart();
    const taken = kcFirstForSlot(before, kcLab.slot);
    const entry = addToCart({
      isCustom: true,
      name,
      price,
      accent: kcLab.accentColor,
      color: kcLab.bgColor,
      forceSlot: kcLab.slot,
      customConfig: config,
    });
    if (!entry) {
      sysLog(kcCartError === 'STORAGE'
        ? 'COULD NOT SAVE — BROWSER STORAGE FULL (TRY A SMALLER IMAGE)'
        : 'KEYBOARD FULL — NO EMPTY SLOTS', true);
      playSound('error');
      return;
    }
    playSound('success');
    if (taken) {
      sysLog('[' + entry.keySlot + '] ALREADY IN USE — ' + name + ' LISTED IN CART ONLY');
    } else {
      sysLog('CONFIG SAVED — ' + name + ' INSTALLED AT [' + entry.keySlot + ']');
    }
    kcRefreshSlotUI();
  });
});


/* ------------------------------------------------------------
   Shrink an uploaded image before it goes into localStorage
   (full-size photos are what made "add to cart" silently fail).
   ------------------------------------------------------------ */
function kcShrinkImage(dataUrl, maxSide) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      try { resolve(c.toDataURL('image/webp', 0.8)); } catch (e) { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/* ------------------------------------------------------------
   Searchable key-slot dropdown (only keys that exist on the keyboard)
   ------------------------------------------------------------ */
function kcSlotInfo(slot) {
  const first = kcFirstForSlot(loadCart(), slot);
  return first ? 'TAKEN · ' + first.name : 'EMPTY';
}

function kcRefreshSlotUI() {
  const note = document.getElementById('slot-note');
  const first = kcFirstForSlot(loadCart(), kcLab.slot);
  note.textContent = first
    ? '[' + kcLab.slot + '] ALREADY HAS ' + first.name + '. THIS CAP WILL BE LISTED IN YOUR CART, BUT THE KEYBOARD KEEPS THE FIRST ONE.'
    : '[' + kcLab.slot + '] IS EMPTY — YOUR CAP WILL SHOW ON THE KEYBOARD.';
  note.classList.toggle('warn', !!first);
}

function kcSelectSlot(slot) {
  kcLab.slot = slot;
  document.getElementById('slot-search').value = slot;
  if (!kcTextTouched) {           // preview follows the chosen letter until the player types their own text
    kcLab.text = slot;
    kcUpdatePreview();
  }
  kcRefreshSlotUI();
}

function kcInitSlotCombo() {
  const input = document.getElementById('slot-search');
  const list = document.getElementById('slot-list');
  const arrow = document.getElementById('slot-arrow');
  let active = -1;
  let shown = [];

  const cart = loadCart();
  kcLab.slot = kcNextFreeSlot(cart) || KC_ALL_SLOTS[0];
  kcSelectSlot(kcLab.slot);

  function render(filter) {
    const q = (filter || '').trim().toUpperCase();
    shown = KC_ALL_SLOTS.filter(k => !q || k.includes(q));
    shown.sort((a, b) => (b.startsWith(q) ? 1 : 0) - (a.startsWith(q) ? 1 : 0) || KC_ALL_SLOTS.indexOf(a) - KC_ALL_SLOTS.indexOf(b));
    list.innerHTML = '';
    if (!shown.length) {
      const li = document.createElement('li');
      li.className = 'combo-empty';
      li.textContent = 'NO SUCH KEY ON THIS KEYBOARD';
      list.appendChild(li);
    }
    shown.forEach((k, i) => {
      const li = document.createElement('li');
      li.id = 'slot-opt-' + i;
      li.setAttribute('role', 'option');
      li.className = 'combo-opt' + (k === kcLab.slot ? ' selected' : '');
      li.innerHTML = '<b></b><span></span>';
      li.firstChild.textContent = k;
      li.lastChild.textContent = kcSlotInfo(k);
      li.addEventListener('mousedown', e => { e.preventDefault(); choose(k); });
      list.appendChild(li);
    });
    active = shown.length ? 0 : -1;
    highlight();
  }
  function highlight() {
    list.querySelectorAll('.combo-opt').forEach((el, i) => el.classList.toggle('active', i === active));
    const el = list.querySelectorAll('.combo-opt')[active];
    if (el) { el.scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', el.id); }
  }
  function open(filter) { render(filter); list.hidden = false; input.setAttribute('aria-expanded', 'true'); }
  function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.value = kcLab.slot; }
  function choose(k) { kcSelectSlot(k); playSound('click'); list.hidden = true; input.setAttribute('aria-expanded', 'false'); }

  input.addEventListener('focus', () => { input.select(); open(''); });
  input.addEventListener('input', () => open(input.value));
  input.addEventListener('blur', close);
  arrow.addEventListener('mousedown', e => { e.preventDefault(); list.hidden ? (input.focus(), open('')) : close(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) open(''); else { active = Math.min(shown.length - 1, active + 1); highlight(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); highlight(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (!list.hidden && shown[active]) choose(shown[active]); }
    else if (e.key === 'Escape') { close(); }
  });
}
