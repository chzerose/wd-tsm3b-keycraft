/* ============================================================
   MARKETPLACE — product grid, filtering, sorting, modal, add-to-cart
   ============================================================ */

let kcActiveFilter = 'ALL';
let kcActiveSort = 'default';

function kcFilteredProducts() {
  let list = KC_PRODUCTS.slice();
  if (kcActiveFilter !== 'ALL') list = list.filter(p => p.category === kcActiveFilter);
  if (kcActiveSort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (kcActiveSort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (kcActiveSort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function kcRenderGrid() {
  const grid = document.getElementById('product-grid');
  const countEl = document.getElementById('result-count');
  const list = kcFilteredProducts();
  countEl.textContent = String(list.length).padStart(2, '0');
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<div class="no-results">NO KEYCAPS MATCH THIS FILTER //</div>';
    return;
  }

  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'keycap-card';
    card.innerHTML = `
      <div class="keycap-face" data-design="${p.id}" style="background:${p.color}; color:${p.accent}; border-color:${p.accent}55;">
        <span class="keycode">${p.keycode}</span>
      </div>
      <div class="keycap-info">
        <div class="name">${p.name}</div>
        <div class="meta">${p.material} • ${p.profile} PROFILE</div>
        <div class="desc">${p.desc}</div>
        <div class="price">₱${p.price}</div>
      </div>
      <button class="btn add-btn" data-id="${p.id}">${p.isCustomTemplate ? '[ GO TO LAB ]' : '[ ADD TO CART ]'}</button>
    `;
    // open detail modal when clicking the face
    card.querySelector('.keycap-face').addEventListener('click', () => kcOpenModal(p, card));
    card.querySelector('.name').addEventListener('click', () => kcOpenModal(p, card));

    const addBtn = card.querySelector('.add-btn');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (p.isCustomTemplate) {
        window.location.href = 'customize.html';
        return;
      }
      kcHandleAddToCart(p, addBtn, card);
    });

    grid.appendChild(card);
  });
}

function kcHandleAddToCart(p, btn, card) {
  const entry = addToCart({
    productId: p.id, isCustom: false, name: p.name, price: p.price,
    preferredSlot: p.keycode, accent: p.accent, color: p.color,
  });
  if (!entry) {
    sysLog('KEYBOARD FULL — NO EMPTY SLOTS', true);
    playSound('error');
    return;
  }
  card.classList.add('pressed');
  setTimeout(() => card.classList.remove('pressed'), 140);
  playSound('pop');
  kcFlyToCart(card.querySelector('.keycap-face'));
  btn.textContent = '[ ADDED ✓ ]';
  btn.classList.add('added');
  sysLog('KEYCAP DETECTED — ' + p.name + ' INSTALLED AT [' + entry.keySlot + ']');
  setTimeout(() => { btn.textContent = '[ ADD TO CART ]'; btn.classList.remove('added'); }, 1400);
}

/* visually "pop" the keycap out of its card and fly it toward the cart badge */
function kcFlyToCart(sourceEl) {
  const target = document.getElementById('cart-badge-target');
  if (!sourceEl || !target) return;
  const srcRect = sourceEl.getBoundingClientRect();
  const tgtRect = target.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'flying-pop';
  ghost.style.left = srcRect.left + srcRect.width / 2 - 18 + 'px';
  ghost.style.top = srcRect.top + srcRect.height / 2 - 18 + 'px';
  document.body.appendChild(ghost);
  requestAnimationFrame(() => {
    const dx = tgtRect.left + tgtRect.width / 2 - (srcRect.left + srcRect.width / 2);
    const dy = tgtRect.top + tgtRect.height / 2 - (srcRect.top + srcRect.height / 2);
    ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
    ghost.style.opacity = '0';
  });
  setTimeout(() => ghost.remove(), 550);
}

function kcOpenModal(p) {
  playSound('click');
  const modal = document.getElementById('product-modal');
  document.getElementById('modal-body').innerHTML = `
    <div class="keycap-face" data-design="${p.id}" style="background:${p.color}; color:${p.accent}; border-color:${p.accent}55;">
      <span class="keycode">${p.keycode}</span>
    </div>
    <div class="name">${p.name}</div>
    <div class="meta">${p.material} • ${p.profile} PROFILE • ${p.category}</div>
    <div class="desc">${p.desc}</div>
    <div class="price">₱${p.price}</div>
    <button class="btn btn-primary" id="modal-add-btn">${p.isCustomTemplate ? '[ GO TO LAB ]' : '[ ADD TO CART ]'}</button>
  `;
  document.getElementById('modal-add-btn').addEventListener('click', () => {
    if (p.isCustomTemplate) { window.location.href = 'customize.html'; return; }
    const entry = addToCart({ productId: p.id, isCustom: false, name: p.name, price: p.price, preferredSlot: p.keycode, accent: p.accent, color: p.color });
    if (!entry) { sysLog('KEYBOARD FULL — NO EMPTY SLOTS', true); playSound('error'); return; }
    playSound('success');
    sysLog('KEYCAP DETECTED — ' + p.name + ' INSTALLED AT [' + entry.keySlot + ']');
    kcCloseModal();
  });
  modal.classList.remove('hidden');
}

function kcCloseModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  kcRenderGrid();

  document.querySelectorAll('.filter-switch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-switch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      kcActiveFilter = btn.dataset.filter;
      playSound('click');
      kcRenderGrid();
    });
  });

  document.getElementById('sort-select').addEventListener('change', (e) => {
    kcActiveSort = e.target.value;
    kcRenderGrid();
  });

  document.getElementById('modal-close').addEventListener('click', kcCloseModal);
  document.getElementById('product-modal').addEventListener('click', (e) => {
    if (e.target.id === 'product-modal') kcCloseModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') kcCloseModal();
  });
});
