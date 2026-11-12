/* ============================================================
   KEYCRAFT CART STORE
   Single source of truth for cart data in localStorage.
   Shared by marketplace.js, customize.js and cart.js.
   ============================================================ */

const KC_CART_KEY = 'keycraft_cart';

/* The physical layout the cart keyboard renders. Each entry is a
   key label; items are auto-assigned to the first empty slot. */
const KC_KEY_LAYOUT = [
  ['ESC','1','2','3','4','5','6','7','8','9','0'],
  ['TAB','Q','W','E','R','T','Y','U','I','O','P'],
  ['CAPS','A','S','D','F','G','H','J','K','L'],
  ['SHIFT','Z','X','C','V','B','N','M'],
  ['SPACE'],
];
const KC_ALL_SLOTS = KC_KEY_LAYOUT.flat();

function loadCart() {
  try {
    const raw = localStorage.getItem(KC_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/* Returns true on success, false if the browser refused (e.g. storage full). */
function saveCart(cart) {
  try {
    localStorage.setItem(KC_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('KeyCraft: could not save cart.', e);
    return false;
  }
  updateCartBadge();
  return true;
}

/* Why the last addToCart() returned null: 'FULL' or 'STORAGE' */
let kcCartError = null;

function kcNextFreeSlot(cart, preferred) {
  const used = new Set(cart.map(i => i.keySlot));
  if (preferred && !used.has(preferred)) return preferred;
  return KC_ALL_SLOTS.find(slot => !used.has(slot)) || null;
}

/**
 * addToCart(item) — item: { productId, isCustom, name, price, preferredSlot, customConfig }
 * Optional item.forceSlot: put the key on exactly that slot even if it is already
 * taken (used by the Keycap Lab). The keyboard shows the FIRST cap added to a slot;
 * later ones stay in the cart list.
 * Returns the stored cart entry, or null (see kcCartError).
 */
function addToCart(item) {
  kcCartError = null;
  const cart = loadCart();
  const forced = item.forceSlot && KC_ALL_SLOTS.includes(item.forceSlot) ? item.forceSlot : null;
  const slot = forced || kcNextFreeSlot(cart, item.preferredSlot);
  if (!slot) { kcCartError = 'FULL'; return null; }
  const entry = {
    cartId: 'k_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    productId: item.productId || null,
    isCustom: !!item.isCustom,
    name: item.name,
    price: item.price,
    accent: item.accent || '#4DE8F0',
    color: item.color || '#161A22',
    keySlot: slot,
    customConfig: item.customConfig || null,
  };
  cart.push(entry);
  if (!saveCart(cart)) { kcCartError = 'STORAGE'; return null; }
  return entry;
}

/* The cap actually shown on a keyboard slot = the first one added to it. */
function kcFirstForSlot(cart, slot) {
  return (cart || loadCart()).find(i => i.keySlot === slot) || null;
}

function removeFromCart(cartId) {
  const cart = loadCart().filter(i => i.cartId !== cartId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function cartTotals(cart) {
  cart = cart || loadCart();
  const base = cart.filter(i => !i.isCustom).reduce((s, i) => s + i.price, 0);
  const customBase = cart.filter(i => i.isCustom).length * 399;
  const customExtra = cart.filter(i => i.isCustom).reduce((s, i) => s + (i.price - 399), 0);
  return {
    count: cart.length,
    customCount: cart.filter(i => i.isCustom).length,
    baseTotal: base + customBase,
    customizationTotal: Math.max(0, customExtra),
    total: cart.reduce((s, i) => s + i.price, 0),
  };
}

function updateCartBadge() {
  const count = loadCart().length;
  document.querySelectorAll('.cart-badge b').forEach(el => {
    el.textContent = String(count).padStart(2, '0');
  });
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
