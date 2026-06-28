(() => {
  class MooBundleBuilder {
    constructor(root) {
      this.root = root;
      this.minimumBundleQty = Number(root.dataset.bundleMin || 2);
      this.discountRate = Number(root.dataset.bundleDiscountRate || 0.1);
      this.submitButton = root.querySelector('[data-bundle-submit]');
      this.submitLabel = root.querySelector('[data-bundle-submit-label]');
      this.status = root.querySelector('[data-bundle-status]');
      this.count = root.querySelector('[data-bundle-count]');
      this.subtotal = root.querySelector('[data-bundle-subtotal]');
      this.savings = root.querySelector('[data-bundle-savings]');
      this.total = root.querySelector('[data-bundle-total]');
      this.unlock = root.querySelector('[data-bundle-unlock]');
      this.selectedList = root.querySelector('[data-bundle-selected-list]');
      this.cards = Array.from(root.querySelectorAll('[data-bundle-item]'));
      this.presetButtons = Array.from(root.querySelectorAll('[data-bundle-preset]'));

      this.handleClick = this.handleClick.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

      root.addEventListener('click', this.handleClick);
      root.addEventListener('change', this.handleChange);
      this.submitButton?.addEventListener('click', this.handleSubmit);

      this.updateSummary();
    }

    formatMoney(cents) {
      const amount = Number(cents || 0) / 100;
      try {
        return new Intl.NumberFormat(document.documentElement.lang || 'en-US', {
          style: 'currency',
          currency: window.Shopify?.currency?.active || 'USD',
        }).format(amount);
      } catch (error) {
        return `$${amount.toFixed(2)}`;
      }
    }

    escapeHtml(value) {
      const div = document.createElement('div');
      div.textContent = value;
      return div.innerHTML;
    }

    getSelectedItems() {
      return this.cards
        .map((card) => {
          const qtyInput = card.querySelector('[data-bundle-quantity]');
          const variantId = card.dataset.variantId;
          const price = Number(card.dataset.price || 0);
          const title = card.dataset.productTitle || 'Selected product';
          const url = card.dataset.productUrl || '#';
          const handle = card.dataset.productHandle || '';
          const available = card.dataset.available === 'true';
          const quantity = Math.max(0, Number(qtyInput?.value || 0));

          if (!variantId || !available || quantity < 1) return null;

          return {
            card,
            variantId,
            price,
            title,
            url,
            handle,
            quantity,
            lineTotal: price * quantity,
          };
        })
        .filter(Boolean);
    }

    getSummaryState() {
      const items = this.getSelectedItems();
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
      const savings = itemCount >= this.minimumBundleQty ? Math.round(subtotal * this.discountRate) : 0;
      const total = subtotal - savings;

      return { items, itemCount, subtotal, savings, total };
    }

    updateUnlockMessage(itemCount) {
      if (!this.unlock) return;

      if (itemCount === 0) {
        this.unlock.textContent = 'Select products to build your bundle.';
      } else if (itemCount === 1) {
        this.unlock.textContent = 'Add 1 more bag to unlock 10% off.';
      } else {
        this.unlock.textContent = 'Bundle unlocked - 10% off applies in cart/checkout.';
      }
    }

    updateSummary() {
      const { items, itemCount, subtotal, savings, total } = this.getSummaryState();

      if (this.count) this.count.textContent = String(itemCount);
      if (this.subtotal) this.subtotal.textContent = this.formatMoney(subtotal);
      if (this.savings) this.savings.textContent = this.formatMoney(savings);
      if (this.total) this.total.textContent = this.formatMoney(total);
      this.updateUnlockMessage(itemCount);

      if (this.selectedList) {
        if (!items.length) {
          this.selectedList.innerHTML = '<p class="moo-bundle-summary__selected-empty">Select products to build your bundle.</p>';
        } else {
          this.selectedList.innerHTML = items
            .map(
              (item) => `
                <div class="moo-bundle-summary__selected-item">
                  <div>
                    <div class="moo-bundle-summary__selected-name">${this.escapeHtml(item.title)}</div>
                    <div class="moo-bundle-summary__selected-meta">Qty ${item.quantity}</div>
                  </div>
                  <strong>${this.formatMoney(item.lineTotal)}</strong>
                </div>
              `
            )
            .join('');
        }
      }

      if (this.submitButton) {
        this.submitButton.disabled = itemCount < this.minimumBundleQty;
      }
    }

    setStatus(message, isError = false) {
      if (!this.status) return;
      this.status.hidden = !message;
      this.status.textContent = message || '';
      this.status.style.color = isError ? '#ffb198' : '#9ce8ab';
    }

    setPresetQuantities(holyQty, honeyQty) {
      this.cards.forEach((card) => {
        const qtyInput = card.querySelector('[data-bundle-quantity]');
        if (!qtyInput || qtyInput.disabled) return;

        if (card.dataset.productHandle === 'moo-steak-chips-holy-heat') {
          qtyInput.value = Math.max(0, Number(holyQty || 0));
        }

        if (card.dataset.productHandle === 'moo-steak-chips-honey-blaze') {
          qtyInput.value = Math.max(0, Number(honeyQty || 0));
        }
      });

      this.updateSummary();
    }

    handleClick(event) {
      const increase = event.target.closest('[data-bundle-increase]');
      const decrease = event.target.closest('[data-bundle-decrease]');
      const preset = event.target.closest('[data-bundle-preset]');

      if (preset) {
        event.preventDefault();
        this.presetButtons.forEach((button) => button.classList.toggle('is-active', button === preset));
        this.setPresetQuantities(preset.dataset.holyQty, preset.dataset.honeyQty);
        return;
      }

      if (!increase && !decrease) return;

      const qtyInput = event.target.closest('[data-bundle-qty]')?.querySelector('[data-bundle-quantity]');
      if (!qtyInput || qtyInput.disabled) return;

      event.preventDefault();
      const current = Math.max(0, Number(qtyInput.value || 0));
      qtyInput.value = increase ? current + 1 : Math.max(0, current - 1);
      this.presetButtons.forEach((button) => button.classList.remove('is-active'));
      this.updateSummary();
    }

    handleChange(event) {
      if (event.target.matches('[data-bundle-quantity]')) {
        const sanitized = Math.max(0, Number(event.target.value || 0));
        event.target.value = sanitized;
        this.presetButtons.forEach((button) => button.classList.remove('is-active'));
        this.updateSummary();
      }
    }

    async handleSubmit() {
      if (!this.submitButton) return;

      const { items, itemCount } = this.getSummaryState();
      if (itemCount < this.minimumBundleQty) {
        this.setStatus(`Select at least ${this.minimumBundleQty} bags to add your bundle.`, true);
        return;
      }

      const defaultLabel = this.submitButton.dataset.defaultLabel || this.submitLabel?.textContent || 'Add selected to cart';
      this.submitButton.dataset.defaultLabel = defaultLabel;
      this.submitButton.disabled = true;
      if (this.submitLabel) this.submitLabel.textContent = 'Adding...';
      this.setStatus('');

      try {
        const cartDrawer = document.querySelector('cart-drawer');
        const cartUrl = window.routes?.cart_url || '/cart';
        const body = {
          items: items.map((item) => ({
            id: Number(item.variantId),
            quantity: item.quantity,
          })),
        };

        const response = await fetch(`${window.routes?.cart_add_url || '/cart/add'}.js`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(body),
        });

        const parsed = await response.json();
        if (!response.ok || parsed.status) {
          throw new Error(parsed.description || parsed.message || 'Could not add bundle to cart.');
        }

        if (window.MooCartUI?.updateMooHeaderCartCount) {
          window.MooCartUI.updateMooHeaderCartCount(parsed.item_count || 0);
        }

        if (cartDrawer && typeof cartDrawer.renderContents === 'function' && window.MooCartUI?.fetchCartStateWithSections) {
          try {
            const refreshedCart = await window.MooCartUI.fetchCartStateWithSections();
            if (!refreshedCart?.sections?.['cart-drawer']) {
              throw new Error('Cart drawer sections did not refresh.');
            }

            if (window.MooCartUI?.applyCartSectionState) {
              window.MooCartUI.applyCartSectionState(refreshedCart);
            }

            cartDrawer.renderContents({
              ...refreshedCart,
              id: items[0].variantId,
            });
            this.setStatus('Bundle added. Your cart is open.');
          } catch (drawerError) {
            console.error('[MOO] Bundle drawer render failed.', drawerError);
            window.location.href = cartUrl;
            return;
          }
        } else {
          window.location.href = cartUrl;
          return;
        }

        if (this.submitLabel) this.submitLabel.textContent = 'Added';
      } catch (error) {
        console.error('[MOO] Bundle add to cart failed.', error);
        this.setStatus(error.message || 'Could not add bundle to cart.', true);
      } finally {
        window.setTimeout(() => {
          if (this.submitLabel) this.submitLabel.textContent = defaultLabel;
          this.updateSummary();
        }, 1200);
      }
    }
  }

  function initMooBundleBuilders() {
    document.querySelectorAll('[data-moo-bundle-builder]').forEach((root) => {
      if (root.dataset.mooBundleReady === 'true') return;
      root.dataset.mooBundleReady = 'true';
      new MooBundleBuilder(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMooBundleBuilders, { once: true });
  } else {
    initMooBundleBuilders();
  }

  document.addEventListener('shopify:section:load', initMooBundleBuilders);
})();
