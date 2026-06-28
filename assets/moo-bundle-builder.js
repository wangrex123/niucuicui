(() => {
  class MooBundleBuilder {
    constructor(root) {
      this.root = root;
      this.submitButton = root.querySelector('[data-bundle-submit]');
      this.submitLabel = root.querySelector('[data-bundle-submit-label]');
      this.status = root.querySelector('[data-bundle-status]');
      this.count = root.querySelector('[data-bundle-count]');
      this.total = root.querySelector('[data-bundle-total]');
      this.selectedList = root.querySelector('[data-bundle-selected-list]');
      this.cards = Array.from(root.querySelectorAll('[data-bundle-item]'));

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

    getActiveItems() {
      return this.cards
        .map((card) => {
          const toggle = card.querySelector('[data-bundle-toggle]');
          const qtyInput = card.querySelector('[data-bundle-quantity]');
          const variantId = card.dataset.variantId;
          const price = Number(card.dataset.price || 0);
          const title = card.dataset.productTitle || 'Selected product';
          const url = card.dataset.productUrl || '#';
          const available = card.dataset.available === 'true';
          const quantity = Math.max(1, Number(qtyInput?.value || 1));

          if (!toggle || !toggle.checked || !variantId || !available) return null;

          return {
            card,
            variantId,
            price,
            title,
            url,
            quantity,
            lineTotal: price * quantity,
          };
        })
        .filter(Boolean);
    }

    updateSummary() {
      const items = this.getActiveItems();
      const quantityCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

      if (this.count) this.count.textContent = String(quantityCount);
      if (this.total) this.total.textContent = this.formatMoney(total);

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
        this.submitButton.disabled = !items.length;
      }
    }

    escapeHtml(value) {
      const div = document.createElement('div');
      div.textContent = value;
      return div.innerHTML;
    }

    handleClick(event) {
      const increase = event.target.closest('[data-bundle-increase]');
      const decrease = event.target.closest('[data-bundle-decrease]');

      if (!increase && !decrease) return;

      const qtyInput = event.target.closest('[data-bundle-qty]')?.querySelector('[data-bundle-quantity]');
      if (!qtyInput) return;

      event.preventDefault();
      const current = Math.max(1, Number(qtyInput.value || 1));
      qtyInput.value = increase ? current + 1 : Math.max(1, current - 1);
      this.updateSummary();
    }

    handleChange(event) {
      if (event.target.matches('[data-bundle-toggle], [data-bundle-quantity]')) {
        if (event.target.matches('[data-bundle-quantity]')) {
          const sanitized = Math.max(1, Number(event.target.value || 1));
          event.target.value = sanitized;
        }
        this.updateSummary();
      }
    }

    setStatus(message, isError = false) {
      if (!this.status) return;
      this.status.hidden = !message;
      this.status.textContent = message || '';
      this.status.style.color = isError ? '#ffb198' : '#9ce8ab';
    }

    async handleSubmit() {
      const items = this.getActiveItems();
      if (!items.length || !this.submitButton) return;

      const defaultLabel = this.submitButton.dataset.defaultLabel || this.submitLabel?.textContent || 'Add selected to cart';
      this.submitButton.dataset.defaultLabel = defaultLabel;
      this.submitButton.disabled = true;
      if (this.submitLabel) this.submitLabel.textContent = 'Adding...';
      this.setStatus('');

      try {
        const cartDrawer = document.querySelector('cart-drawer');
        const body = {
          items: items.map((item) => ({
            id: Number(item.variantId),
            quantity: item.quantity,
          })),
        };

        if (cartDrawer && typeof cartDrawer.getSectionsToRender === 'function') {
          body.sections = cartDrawer.getSectionsToRender().map((section) => section.id);
          body.sections_url = window.location.pathname;
        }

        const response = await fetch(`${window.routes?.cart_add_url || '/cart/add'}.js`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });

        const parsed = await response.json();
        if (!response.ok || parsed.status) {
          throw new Error(parsed.description || parsed.message || 'Could not add bundle to cart.');
        }

        if (cartDrawer && parsed.sections && typeof cartDrawer.renderContents === 'function') {
          cartDrawer.renderContents({
            id: items[0].variantId,
            sections: parsed.sections,
          });
          this.setStatus('Bundle added. Your cart is open.');
        } else {
          this.setStatus('Bundle added. Redirecting to cart...');
          window.location.href = window.routes?.cart_url || '/cart';
          return;
        }

        if (this.submitLabel) this.submitLabel.textContent = 'Added';
        window.setTimeout(() => {
          if (this.submitLabel) this.submitLabel.textContent = defaultLabel;
          this.submitButton.disabled = false;
          this.updateSummary();
        }, 1200);
      } catch (error) {
        this.setStatus(error.message || 'Could not add bundle to cart.', true);
        if (this.submitLabel) this.submitLabel.textContent = defaultLabel;
        this.submitButton.disabled = false;
        this.updateSummary();
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
