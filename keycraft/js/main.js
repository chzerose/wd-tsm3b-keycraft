/* ============================================================
   KEYCRAFT MAIN — shared across every page
   ============================================================ */

/** sysLog(message, isError) — small terminal-style toast, bottom right */
function sysLog(message, isError = false) {
  let host = document.getElementById('sys-log');
  if (!host) {
    host = document.createElement('div');
    host.id = 'sys-log';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = 'sys-msg' + (isError ? ' error' : '');
  el.textContent = '> ' + message;
  host.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

/** Boot / loading screen — only shown once per browser session */
function kcRunBootScreen() {
  const boot = document.getElementById('boot-screen');
  if (!boot) return;
  if (sessionStorage.getItem('keycraft_booted')) {
    boot.classList.add('hide');
    return;
  }
  const fill = document.getElementById('boot-bar-fill');
  requestAnimationFrame(() => { if (fill) fill.style.width = '100%'; });
  setTimeout(() => {
    boot.classList.add('hide');
    sessionStorage.setItem('keycraft_booted', '1');
  }, 950);
}

/** Mobile nav burger toggle */
function kcInitNav() {
  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.navlinks');
  if (burger && links) {
    burger.addEventListener('click', () => {
      links.classList.toggle('open');
      playSound('click');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  kcRunBootScreen();
  kcInitNav();
  updateCartBadge();
});
