/* ============================================================
   KEYCRAFT THEME — light / dark toggle (moon & sun)
   - Dark is the default (the original KeyCraft look).
   - The choice is saved in localStorage and shared by every page.
   - Load this file in <head> so the theme is applied before the
     page paints (no flash of the wrong theme).
   ============================================================ */

(function () {
  const KC_THEME_KEY = 'keycraft_theme';

  function kcReadTheme() {
    try {
      const v = localStorage.getItem(KC_THEME_KEY);
      return v === 'light' || v === 'dark' ? v : 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function kcApplyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const isLight = theme === 'light';
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      btn.setAttribute('title', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    });
  }

  function kcSetTheme(theme, animate) {
    if (animate) {
      /* briefly enable colour transitions so the swap feels smooth */
      document.documentElement.classList.add('theme-anim');
      setTimeout(() => document.documentElement.classList.remove('theme-anim'), 450);
    }
    try { localStorage.setItem(KC_THEME_KEY, theme); } catch (e) { /* private mode */ }
    kcApplyTheme(theme);
  }

  /* Same markup as the toggle written in every page's nav bar */
  const KC_TOGGLE_HTML =
    '<span class="tt-knob" aria-hidden="true"></span>' +
    '<svg class="tt-icon tt-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/></svg>' +
    '<svg class="tt-icon tt-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.9 1.9M16.8 16.8l1.9 1.9M5.3 18.7l1.9-1.9M16.8 7.2l1.9-1.9"/></svg>';

  /* apply immediately (script runs in <head>) */
  kcApplyTheme(kcReadTheme());

  document.addEventListener('DOMContentLoaded', () => {
    /* Safety net: any page without a toggle in its nav gets one */
    if (!document.querySelector('.theme-toggle')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-toggle';
      btn.innerHTML = KC_TOGGLE_HTML;
      const navRight = document.querySelector('.nav-right');
      if (navRight) {
        navRight.insertBefore(btn, navRight.firstChild);
      } else {
        btn.classList.add('floating');
        document.body.appendChild(btn);
      }
    }

    kcApplyTheme(kcReadTheme());

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        kcSetTheme(next, true);
        if (typeof playSound === 'function') playSound('click');
      });
    });
  });

  /* keep other open tabs in sync */
  window.addEventListener('storage', (e) => {
    if (e.key === KC_THEME_KEY) kcApplyTheme(kcReadTheme());
  });

  window.kcSetTheme = kcSetTheme;
})();
