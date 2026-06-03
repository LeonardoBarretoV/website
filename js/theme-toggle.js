(function() {
  const storageKey = 'site-theme';
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const docEl = document.documentElement;
  const metaTheme = document.getElementById('meta-theme-color');

  function currentTheme() {
    return docEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function setTheme(nextTheme) {
    if (typeof window.__setPreferredTheme === 'function') {
      window.__setPreferredTheme(nextTheme);
    } else {
      docEl.setAttribute('data-theme', nextTheme);
      docEl.style.colorScheme = nextTheme === 'dark' ? 'dark' : 'light';
      try { localStorage.setItem(storageKey, nextTheme); } catch (err) {}
    }
    if (metaTheme) {
      metaTheme.setAttribute('content', nextTheme === 'dark' ? '#0f1419' : '#fff6e3');
    }
  }

  function updateToggle(theme) {
    const isDark = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.dataset.mode = theme;
    toggle.classList.toggle('theme-toggle--dark', isDark);
  }

  updateToggle(currentTheme());

  window.addEventListener('site-theme-change', function(event) {
    var detailTheme = event && event.detail && (event.detail.theme === 'dark' || event.detail.theme === 'light')
      ? event.detail.theme : currentTheme();
    updateToggle(detailTheme);
  });

  toggle.addEventListener('click', function() {
    const nextTheme = currentTheme() === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    updateToggle(nextTheme);
  });

  const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', function(event) {
      let stored = null;
      try { stored = localStorage.getItem(storageKey); } catch (err) {}
      if (stored === 'dark' || stored === 'light') return;
      const nextTheme = event.matches ? 'dark' : 'light';
      setTheme(nextTheme);
      updateToggle(nextTheme);
    });
  }
})();
