/* ============================================================
   KEYCRAFT PRODUCT DATABASE
   ============================================================ */

const KC_PRODUCTS = [
  { id: 'void-001',   name: 'VOID // 001',   price: 249, category: 'MINIMAL', profile: 'OEM',  material: 'ABS',
    color: '#1a1c22', accent: '#4DE8F0', desc: 'Black translucent cap that glows faint cyan under RGB.', keycode: 'ESC' },
  { id: 'neon-byte',  name: 'NEON // BYTE',  price: 299, category: 'GAMING', profile: 'Cherry', material: 'PBT',
    color: '#1a1030', accent: '#FF3D8A', desc: 'Cyberpunk-inspired cap with etched circuit lines.', keycode: 'W' },
  { id: 'forest-exe', name: 'FOREST.EXE',    price: 279, category: 'NATURE', profile: 'OEM',  material: 'PBT',
    color: '#10231a', accent: '#5CFF9D', desc: 'Nature and pixel-art inspired forest canopy design.', keycode: 'A' },
  { id: 'error-404',  name: 'ERROR_404',     price: 249, category: 'RETRO',  profile: 'SA',   material: 'ABS',
    color: '#231010', accent: '#FF3D8A', desc: 'Retro CRT-error inspired cap with glitch texture.', keycode: 'S' },
  { id: 'moonlight',  name: 'MOONLIGHT',     price: 299, category: 'ART',    profile: 'SA',   material: 'PBT',
    color: '#0f1430', accent: '#9B6BFF', desc: 'Dark celestial design with hand-placed pixel stars.', keycode: 'D' },
  { id: 'sakura-8bit',name: 'SAKURA.8BIT',   price: 289, category: 'ANIME',  profile: 'OEM',  material: 'PBT',
    color: '#2a1420', accent: '#FF7BC4', desc: 'Pixelated cherry blossoms over a dusk-pink base.', keycode: 'F' },
  { id: 'grid-runner',name: 'GRID_RUNNER',   price: 259, category: 'RETRO',  profile: 'Cherry',material: 'ABS',
    color: '#101a24', accent: '#4DE8F0', desc: 'Synthwave grid horizon, classic arcade palette.', keycode: 'G' },
  { id: 'terra-01',   name: 'TERRA // 01',   price: 269, category: 'NATURE', profile: 'OEM',  material: 'PBT',
    color: '#1c2016', accent: '#C7FF5C', desc: 'Topographic contour lines in muted earth tones.', keycode: 'H' },
  { id: 'ronin',      name: 'RONIN',         price: 309, category: 'ANIME',  profile: 'SA',   material: 'PBT',
    color: '#200f0f', accent: '#FF3D8A', desc: 'Ink-brush samurai silhouette, matte finish.', keycode: 'J' },
  { id: 'signal-lost',name: 'SIGNAL_LOST',   price: 249, category: 'ART',    profile: 'Cherry',material: 'ABS',
    color: '#161616', accent: '#9B6BFF', desc: 'Broadcast static rendered as dithered pixel noise.', keycode: 'K' },
  { id: 'reactor',    name: 'REACTOR',       price: 319, category: 'GAMING', profile: 'SA',   material: 'PBT',
    color: '#241505', accent: '#FFC85C', desc: 'Amber warning-light aesthetic, high-vis legend.', keycode: 'L' },
  { id: 'custom-key', name: 'CUSTOM_KEY',    price: 399, category: 'CUSTOM', profile: 'OEM',  material: 'PBT',
    color: '#161A22', accent: '#4DE8F0', desc: 'Design your own from scratch in the Keycap Lab.', keycode: '?', isCustomTemplate: true },
];

function kcGetProduct(id) {
  return KC_PRODUCTS.find(p => p.id === id);
}
