(function () {
  function bindHeader(header) {
    if (!header || header.dataset.bound === 'true') return;
    header.dataset.bound = 'true';

    const mobilePanel = header.querySelector('[data-moo-site-menu]');
    const openButtons = header.querySelectorAll('[data-moo-site-menu-toggle]');
    const closeButtons = header.querySelectorAll('[data-moo-site-menu-close]');
    const overlayMode = header.dataset.overlay === 'true';

    const openMenu = () => {
      if (!mobilePanel) return;
      mobilePanel.hidden = false;
      document.body.classList.add('moo-site-header-menu-open');
    };

    const closeMenu = () => {
      if (!mobilePanel) return;
      mobilePanel.hidden = true;
      document.body.classList.remove('moo-site-header-menu-open');
    };

    openButtons.forEach((button) => button.addEventListener('click', openMenu));
    closeButtons.forEach((button) => button.addEventListener('click', closeMenu));

    if (mobilePanel) {
      mobilePanel.addEventListener('click', (event) => {
        if (event.target === mobilePanel) closeMenu();
      });
    }

    if (overlayMode) {
      const syncScrolledState = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 28);
      };

      syncScrolledState();
      window.addEventListener('scroll', syncScrolledState, { passive: true });
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 990) {
        closeMenu();
      }
    });
  }

  function initMooSiteHeaders() {
    document.querySelectorAll('[data-moo-site-header]').forEach(bindHeader);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMooSiteHeaders, { once: true });
  } else {
    initMooSiteHeaders();
  }

  document.addEventListener('shopify:section:load', initMooSiteHeaders);
})();
