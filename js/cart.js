
/* ============================================================
   CART / KEYBOARD PAGE
   ============================================================ */

// Render the entire cart and keyboard page
function kcRenderCartPage() {
  const cart = loadCart();
  const empty = document.getElementById('empty-state');
  const content = document.getElementById('cart-content');
  const detail = document.getElementById('key-detail');

  // Always refresh the cart list, even when empty
  kcRenderCartList(cart);

  if (cart.length === 0) {
    empty.classList.remove('hidden');
    content.classList.add('hidden');
    detail.classList.add('hidden');
    kcUpdateCartBadge();
    return;
  }

  empty.classList.add('hidden');
  content.classList.remove('hidden');

  kcRenderKeyboard(cart);
  kcRenderStatus(cart);
  detail.classList.add('hidden');

  kcUpdateCartBadge();
}

// Refresh cart badge if it exists
function kcUpdateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = String(loadCart().length).padStart(2, '0');
  }
}

/* ============================================================
   CART LIST
   Full list of everything in the cart.
   Duplicate slots are listed separately.
   ============================================================ */

function kcRenderCartList(cart) {
  const wrap = document.getElementById('cart-list-wrap');
  const host = document.getElementById('cart-list');

  if (!wrap || !host) return;

  wrap.classList.toggle('hidden', cart.length === 0);
  host.innerHTML = '';

  cart.forEach(item => {
    const onKeyboard = kcFirstForSlot(cart, item.keySlot) === item;

    const row = document.createElement('div');
    row.className = 'cl-row' + (onKeyboard ? '' : ' queued');

    const slot = document.createElement('span');
    slot.className = 'cl-slot mono';
    slot.textContent = item.keySlot;

    const name = document.createElement('span');
    name.className = 'cl-name';
    name.textContent = item.name + (item.isCustom ? ' · CUSTOM' : '');

    const status = document.createElement('span');
    status.className = 'cl-status label';
    status.textContent = onKeyboard
      ? 'ON KEYBOARD'
      : 'SLOT TAKEN — LISTED ONLY';

    const price = document.createElement('span');
    price.className = 'cl-price mono';
    price.textContent = '₱' + item.price;

    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'btn btn-danger cl-remove';
    rm.textContent = '✕';
    rm.setAttribute('aria-label', 'Remove ' + item.name);

    rm.addEventListener('click', () => {
      kcRemoveItem(item);
    });

    row.append(slot, name, status, price, rm);
    host.appendChild(row);
  });
}

/* ============================================================
   REMOVE INDIVIDUAL KEYCAP
   Used by both the cart list and keyboard detail panel.
   ============================================================ */

function kcRemoveItem(item) {
  const currentCart = loadCart();

  // Make sure the item still exists
  const exists = currentCart.some(
    i => i.cartId === item.cartId
  );

  if (!exists) return;

  removeFromCart(item.cartId);

  playSound('pop');
  sysLog(item.name + ' REMOVED FROM [' + item.keySlot + ']');

  // Refresh keyboard, list, totals, and badge
  kcRenderCartPage();
}

/* ============================================================
   KEYBOARD RENDERING
   First added keycap wins when multiple items share a slot.
   ============================================================ */

function kcRenderKeyboard(cart) {
  const host = document.getElementById('cart-keyboard');

  if (!host) return;

  host.innerHTML = '';

  const byslot = {};

  cart.forEach(item => {
    if (!byslot[item.keySlot]) {
      byslot[item.keySlot] = item;
    }
  });

  KC_KEY_LAYOUT.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'cart-row';

    row.forEach(slot => {
      const item = byslot[slot];

      const keyEl = document.createElement('button');
      keyEl.type = 'button';
      keyEl.className = 'cart-key';

      if (['TAB', 'CAPS', 'SHIFT'].includes(slot)) {
        keyEl.classList.add('wide-' + slot.toLowerCase());
      }

      if (slot === 'SPACE') {
        keyEl.classList.add('wide-space');
      }

      if (item) {
        keyEl.classList.add('installed');

        if (item.isCustom) {
          keyEl.classList.add('custom');
        }

        keyEl.style.setProperty(
          '--key-accent',
          item.accent || '#4DE8F0'
        );

        if (item.isCustom && item.customConfig) {
          kcPaintCustomKey(keyEl, slot, item);
        } else {
          keyEl.textContent = slot === 'SPACE'
            ? item.name.slice(0, 10)
            : slot;

          if (item.productId) {
            keyEl.dataset.design = item.productId;
          }
        }

        keyEl.setAttribute(
          'aria-label',
          slot + ' — ' + item.name
        );

      } else {
        keyEl.textContent = slot === 'SPACE' ? '' : slot;

        keyEl.setAttribute(
          'aria-label',
          slot + ' — empty slot'
        );
      }

      keyEl.addEventListener('click', () => {
        kcPressKey(keyEl, slot, item);
      });

      rowEl.appendChild(keyEl);
    });

    host.appendChild(rowEl);
  });
}

/* ============================================================
   CUSTOM KEYCAP DESIGN
   Draw colour, text, font, and uploaded image.
   ============================================================ */

function kcPaintCustomKey(keyEl, slot, item) {
  const cfg = item.customConfig;

  keyEl.classList.add('has-design');

  keyEl.style.backgroundColor =
    cfg.bgColor || item.color;

  if (cfg.imageData) {
    const img = document.createElement('img');

    img.className = 'ck-img';
    img.alt = '';
    img.src = cfg.imageData;

    img.style.transform =
      `translate(${cfg.imgX || 0}%, ${cfg.imgY || 0}%) ` +
      `scale(${(cfg.imgScale || 100) / 100}) ` +
      `rotate(${cfg.imgRotate || 0}deg)`;

    keyEl.appendChild(img);
  }

  const text = document.createElement('span');

  text.className = 'ck-text';

  const label = cfg.text || slot;

  text.textContent = label;
  text.style.color = cfg.textColor || '';
  text.style.fontFamily = cfg.font || '';

  text.style.fontSize =
    Math.max(
      6,
      Math.min(
        12,
        Math.floor(40 / Math.max(1, label.length))
      )
    ) + 'px';

  keyEl.appendChild(text);

  const tag = document.createElement('span');

  tag.className = 'ck-slot';
  tag.textContent = slot;

  keyEl.appendChild(tag);
}

/* ============================================================
   KEY INTERACTION
   ============================================================ */

function kcPressKey(keyEl, slot, item) {
  keyEl.classList.add('pressed');

  playSound(
    item
      ? (item.customConfig?.sound || 'thock')
      : 'soft'
  );

  setTimeout(() => {
    keyEl.classList.remove('pressed');
  }, 130);

  kcShowKeyDetail(slot, item);
}

/* ============================================================
   KEY DETAIL PANEL
   ============================================================ */

function kcShowKeyDetail(slot, item) {
  const panel = document.getElementById('key-detail');

  panel.classList.remove('hidden');

  if (!item) {
    panel.innerHTML = `
      <div class="kd-empty">[ ${slot} ] — EMPTY SLOT</div>
      <div class="kd-meta">
        NO KEYCAP INSTALLED AT THIS POSITION.
      </div>
    `;

    return;
  }

  const configLine =
    item.isCustom && item.customConfig
      ? `${item.customConfig.material} •
         ${item.customConfig.profile} •
         SOUND: ${(item.customConfig.sound || 'thock').toUpperCase()}`
      : 'STANDARD KEYCAP';

  const queued = loadCart().filter(
    i => i.keySlot === slot && i.cartId !== item.cartId
  ).length;

  const queuedLine = queued
    ? `<div class="kd-meta">
         +${queued} MORE CAP${queued > 1 ? 'S' : ''}
         FOR THIS KEY — SEE CART LIST BELOW
       </div>`
    : '';

  panel.innerHTML = `
    <div class="kd-name">
      [ ${slot} ] ${item.name}
    </div>

    <div class="kd-meta">
      ${configLine}
    </div>

    ${queuedLine}

    <div class="kd-price">
      ₱${item.price}
    </div>

    <button class="btn btn-danger" id="remove-key-btn">
      [ REMOVE KEYCAP ]
    </button>
  `;

  document
    .getElementById('remove-key-btn')
    .addEventListener('click', () => {
      kcRemoveItem(item);
    });
}

/* ============================================================
   CART STATUS / TOTALS
   ============================================================ */

function kcRenderStatus(cart) {
  const t = cartTotals(cart);

  document.getElementById('stat-count').textContent =
    String(t.count).padStart(2, '0');

  document.getElementById('stat-custom').textContent =
    String(t.customCount).padStart(2, '0');

  document.getElementById('stat-base').textContent =
    '₱' + t.baseTotal.toLocaleString();

  document.getElementById('stat-customfee').textContent =
    '₱' + t.customizationTotal.toLocaleString();

  document.getElementById('stat-total').textContent =
    '₱' + t.total.toLocaleString();
}

/* ============================================================
   CHECKOUT
   ============================================================ */

function kcOpenCheckout() {
  const cart = loadCart();

  if (cart.length === 0) return;

  const t = cartTotals(cart);

  playSound('click');

  const body = document.getElementById('checkout-body');

  body.innerHTML = `
    <h2>ORDER SUMMARY</h2>

    ${cart.map(i => `
      <div class="co-summary-row">
        <span>[${i.keySlot}] ${i.name}</span>
        <span>₱${i.price}</span>
      </div>
    `).join('')}

    <div class="co-total">
      <span>TOTAL</span>
      <span>₱${t.total.toLocaleString()}</span>
    </div>

    <button
      class="btn btn-primary"
      id="place-order-btn"
      style="width:100%;margin-top:14px;"
    >
      [ PLACE ORDER ]
    </button>
  `;

  document
    .getElementById('place-order-btn')
    .addEventListener('click', kcPlaceOrder);

  document
    .getElementById('checkout-modal')
    .classList.remove('hidden');
}

/* ============================================================
   PLACE ORDER
   ============================================================ */

function kcPlaceOrder() {
  // Prevent checkout with an empty cart
  if (loadCart().length === 0) return;

  playSound('success');

  const body = document.getElementById('checkout-body');

  // Show confirmation first
  body.innerHTML = `
    <div class="order-complete">
      <div class="pixel-confetti">▓▒░ ░▒▓</div>

      <div class="oc-title">
        ORDER COMPLETE
      </div>

      <p>
        YOUR KEYCAPS HAVE BEEN CRAFTED.
      </p>

      <button class="btn btn-primary" id="oc-done-btn">
        [ DONE ]
      </button>
    </div>
  `;

  document
    .getElementById('oc-done-btn')
    .addEventListener('click', () => {

      // Clear cart only after confirmation
      clearCart();

      document
        .getElementById('checkout-modal')
        .classList.add('hidden');

      // Refresh the entire page
      kcRenderCartPage();

      sysLog('KEYBOARD CONFIGURATION SAVED');
    });
}

/* ============================================================
   PAGE INITIALIZATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  kcRenderCartPage();

  // Checkout button
  document
    .getElementById('checkout-btn')
    .addEventListener('click', kcOpenCheckout);

  // Close checkout modal
  document
    .getElementById('checkout-close')
    .addEventListener('click', () => {
      document
        .getElementById('checkout-modal')
        .classList.add('hidden');
    });

  // Close modal by clicking outside
  document
    .getElementById('checkout-modal')
    .addEventListener('click', (e) => {
      if (e.target.id === 'checkout-modal') {
        document
          .getElementById('checkout-modal')
          .classList.add('hidden');
      }
    });

  // Clear entire keyboard and cart
  document
    .getElementById('clear-btn')
    .addEventListener('click', () => {

      if (loadCart().length === 0) return;

      clearCart();

      playSound('pop');
      sysLog('KEYBOARD CLEARED');

      // Refresh everything immediately
      kcRenderCartPage();
    });
});
