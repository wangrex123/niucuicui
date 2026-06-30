(function () {
  const DISMISS_KEY = 'mooPromoDismissedAt';
  const SESSION_KEY = 'mooPromoShown';

  function getStorageItem(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setStorageItem(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch (error) {
      // Ignore storage write issues and let the popup behave as session-only.
    }
  }

  function getDismissExpiryHours(root) {
    const hours = Number(root.dataset.dismissHours || 24);
    return Number.isFinite(hours) && hours > 0 ? hours : 24;
  }

  function shouldSkipPopup(root) {
    const path = window.location.pathname || '';
    if (window.Shopify?.designMode) return true;
    if (path === '/cart' || path.startsWith('/checkouts/') || path.startsWith('/checkout')) return true;
    if (getStorageItem(window.sessionStorage, SESSION_KEY) === 'true') return true;

    const dismissedAt = Number(getStorageItem(window.localStorage, DISMISS_KEY) || 0);
    const expiryWindow = getDismissExpiryHours(root) * 60 * 60 * 1000;
    if (dismissedAt && Date.now() - dismissedAt < expiryWindow) return true;

    return false;
  }

  function waitUntilReadyToShow(root) {
    let attempts = 0;

    return new Promise((resolve) => {
      const check = () => {
        const cartDrawerOpen = document.querySelector('cart-drawer.active');
        const modalOpen = document.body.classList.contains('overflow-hidden') || document.body.classList.contains('moo-site-header-menu-open');

        if (!cartDrawerOpen && !modalOpen) {
          resolve(true);
          return;
        }

        attempts += 1;
        if (attempts > 8) {
          resolve(false);
          return;
        }

        window.setTimeout(check, 700);
      };

      check();
    });
  }

  function showPopup(root) {
    setStorageItem(window.sessionStorage, SESSION_KEY, 'true');
    root.hidden = false;

    window.requestAnimationFrame(() => {
      root.classList.add('is-visible');
    });
  }

  function dismissPopup(root) {
    setStorageItem(window.localStorage, DISMISS_KEY, String(Date.now()));
    setStorageItem(window.sessionStorage, SESSION_KEY, 'true');
    root.classList.remove('is-visible');

    window.setTimeout(() => {
      root.hidden = true;
    }, 240);
  }

  function bindPopup(root) {
    if (!root || root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';

    const dismissButtons = root.querySelectorAll('[data-moo-promo-dismiss]');
    const cta = root.querySelector('[data-moo-promo-cta]');
    const delay = Number(root.dataset.delayMs || 2600);

    dismissButtons.forEach((button) => {
      button.addEventListener('click', () => dismissPopup(root));
    });

    cta?.addEventListener('click', () => {
      setStorageItem(window.localStorage, DISMISS_KEY, String(Date.now()));
      setStorageItem(window.sessionStorage, SESSION_KEY, 'true');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && root.classList.contains('is-visible')) {
        dismissPopup(root);
      }
    });

    const startTimer = () => {
      if (shouldSkipPopup(root)) return;

      window.setTimeout(async () => {
        if (shouldSkipPopup(root)) return;

        const ready = await waitUntilReadyToShow(root);
        if (!ready || shouldSkipPopup(root)) return;

        showPopup(root);
      }, delay);
    };

    if (document.readyState === 'complete') {
      startTimer();
    } else {
      window.addEventListener('load', startTimer, { once: true });
    }
  }

  function initPromoPopups() {
    document.querySelectorAll('[data-moo-promo-popup]').forEach(bindPopup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPromoPopups, { once: true });
  } else {
    initPromoPopups();
  }

  document.addEventListener('shopify:section:load', initPromoPopups);
})();
