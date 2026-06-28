(function () {
  function setComparePrice(root, value) {
    const compare = root.querySelector('[data-moo-compare-price]');
    if (!compare) return;

    if (value) {
      compare.textContent = value;
      compare.hidden = false;
    } else {
      compare.textContent = '';
      compare.hidden = true;
    }
  }

  function bindMooProductPage(root) {
    if (!root || root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';

    const mainImage = root.querySelector('[data-moo-main-image]');
    const thumbButtons = root.querySelectorAll('[data-moo-thumb]');
    const quantityInput = root.querySelector('.moo-pdp-quantity input[name="quantity"]');
    const minusButton = root.querySelector('[data-moo-qty-minus]');
    const plusButton = root.querySelector('[data-moo-qty-plus]');
    const variantSelect = root.querySelector('[data-moo-variant-select]');
    const variantInput = root.querySelector('[data-moo-variant-id]');
    const submitButton = root.querySelector('.moo-pdp-submit');
    const submitLabel = submitButton?.querySelector('span');
    const price = root.querySelector('[data-moo-price]');

    thumbButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (mainImage) {
          mainImage.src = button.dataset.src;
          mainImage.alt = button.dataset.alt || mainImage.alt;
        }

        thumbButtons.forEach((thumb) => thumb.classList.remove('is-active'));
        button.classList.add('is-active');
      });
    });

    if (minusButton && quantityInput) {
      minusButton.addEventListener('click', () => {
        const current = Number(quantityInput.value) || 1;
        quantityInput.value = Math.max(1, current - 1);
      });
    }

    if (plusButton && quantityInput) {
      plusButton.addEventListener('click', () => {
        const current = Number(quantityInput.value) || 1;
        quantityInput.value = current + 1;
      });
    }

    if (variantSelect && variantInput) {
      variantSelect.addEventListener('change', () => {
        const selected = variantSelect.options[variantSelect.selectedIndex];
        const isAvailable = selected.dataset.available === 'true';

        variantInput.value = selected.value;

        if (price && selected.dataset.price) {
          price.textContent = selected.dataset.price;
        }

        setComparePrice(root, selected.dataset.compare || '');

        if (submitButton) {
          submitButton.disabled = !isAvailable;
        }

        if (submitLabel) {
          submitLabel.textContent = isAvailable ? 'Add to cart' : 'Sold out';
        }

        if (mainImage && selected.dataset.featured) {
          mainImage.src = selected.dataset.featured;
          mainImage.alt = selected.dataset.featuredAlt || mainImage.alt;
        }
      });
    }
  }

  function init() {
    document.querySelectorAll('[data-moo-product-root]').forEach(bindMooProductPage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', init);
})();
