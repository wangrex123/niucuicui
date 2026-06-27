
    let loadProgress = 0;
    const loaderCounter = document.getElementById('loaderCounter');
    const loaderBar = document.getElementById('loaderBar');
    function updateLoader() {
      loadProgress += Math.random() * 12 + 6;
      if (loadProgress > 100) loadProgress = 100;
      loaderCounter.textContent = String(Math.floor(loadProgress)).padStart(2, '0');
      loaderBar.style.width = loadProgress + '%';
      if (loadProgress < 100) {
        setTimeout(updateLoader, 180 + Math.random() * 200);
      } else {
        setTimeout(() => {
          document.getElementById('loader').classList.add('done');
          initAnimations();
        }, 400);
      }
    }
    window.addEventListener('load', () => { setTimeout(updateLoader, 300); });

    // GSAP
    function initHeroFall() {
      const layer = document.getElementById('heroFallLayer');
      if (!layer || layer.dataset.ready === 'true') return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const fallAssets = {
        pepperA: './hero-fall-pepper-a.png',
        pepperB: './hero-fall-pepper-b.png',
            chipA: './hero-fall-chip-a-v2.png',
            chipB: './hero-fall-chip-b-v2.png',
            chipC: './hero-fall-chip-c-v2.png'
      };

      const assetPool = [
            { type: 'chip', asset: fallAssets.chipA, ratio: 249 / 98 },
            { type: 'chip', asset: fallAssets.chipB, ratio: 216 / 96 },
            { type: 'chip', asset: fallAssets.chipC, ratio: 201 / 77 },
        { type: 'pepper', asset: fallAssets.pepperA, ratio: 69 / 300 },
        { type: 'pepper', asset: fallAssets.pepperB, ratio: 77 / 273 }
      ];
      const seeded = (seed) => () => {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      const rand = seeded(20260505);
      const range = (min, max) => min + (max - min) * rand();
      const pick = (list) => list[Math.floor(rand() * list.length)];
      const sign = () => (rand() < 0.5 ? -1 : 1);
      const weightedAsset = () => {
        const r = rand();
        if (r < 0.28) return assetPool[0];
        if (r < 0.5) return assetPool[1];
        if (r < 0.68) return assetPool[2];
        if (r < 0.84) return assetPool[3];
        return assetPool[4];
      };
      const depthBands = window.innerWidth < 768
        ? [
            { name: 'background', count: 10, placement: 'free', chipWidth: [14, 28], pepperWidth: [6, 10], blur: [2.3, 4.4], opacity: [0.14, 0.24], saturate: [0.72, 0.9], contrast: [0.9, 1], brightness: [0.72, 0.9], hue: [-15, -5], scale: [0.86, 1], fall: [0.44, 0.78], float: [9, 14], floatX: [3, 10], floatY: [-12, -4], drift: [0.012, 0.036], rotateSpan: [18, 46], x: [2, 98], y: [0, 86], spacingX: 8, spacingY: 10, zIndex: 1 },
            { name: 'focus', count: 8, placement: 'free', chipWidth: [20, 40], pepperWidth: [7, 13], blur: [0.08, 0.62], opacity: [0.3, 0.52], saturate: [1.04, 1.24], contrast: [1.02, 1.12], brightness: [0.98, 1.12], hue: [-4, 5], scale: [0.92, 1.08], fall: [0.58, 0.92], float: [7, 12], floatX: [5, 16], floatY: [-18, -6], drift: [0.018, 0.05], rotateSpan: [28, 72], x: [6, 94], y: [4, 82], spacingX: 11, spacingY: 12, zIndex: 2 },
            { name: 'foreground', count: 5, placement: 'edge', chipWidth: [30, 54], pepperWidth: [9, 16], blur: [1.2, 3.2], opacity: [0.18, 0.32], saturate: [0.9, 1.08], contrast: [0.98, 1.06], brightness: [0.82, 1], hue: [-8, 2], scale: [1, 1.14], fall: [0.78, 1.08], float: [6, 10], floatX: [8, 24], floatY: [-20, -8], drift: [0.026, 0.07], rotateSpan: [36, 88], x: [-10, 110], y: [0, 94], spacingX: 16, spacingY: 16, zIndex: 3 }
          ]
        : [
            { name: 'background', count: 18, placement: 'free', chipWidth: [14, 32], pepperWidth: [6, 11], blur: [2.4, 4.8], opacity: [0.14, 0.25], saturate: [0.7, 0.9], contrast: [0.9, 1], brightness: [0.72, 0.88], hue: [-16, -5], scale: [0.86, 1], fall: [0.42, 0.76], float: [9, 15], floatX: [4, 12], floatY: [-16, -5], drift: [0.012, 0.04], rotateSpan: [18, 50], x: [0, 98], y: [0, 88], spacingX: 7, spacingY: 8, zIndex: 1 },
            { name: 'focus', count: 14, placement: 'free', chipWidth: [20, 46], pepperWidth: [7, 15], blur: [0.06, 0.62], opacity: [0.32, 0.56], saturate: [1.05, 1.25], contrast: [1.02, 1.13], brightness: [0.98, 1.14], hue: [-4, 5], scale: [0.92, 1.1], fall: [0.58, 0.94], float: [7, 12], floatX: [6, 18], floatY: [-18, -6], drift: [0.018, 0.056], rotateSpan: [28, 78], x: [5, 95], y: [4, 84], spacingX: 10, spacingY: 11, zIndex: 2 },
            { name: 'foreground', count: 8, placement: 'edge', chipWidth: [32, 66], pepperWidth: [10, 19], blur: [1.3, 3.5], opacity: [0.18, 0.34], saturate: [0.9, 1.1], contrast: [0.98, 1.07], brightness: [0.82, 1], hue: [-8, 2], scale: [1, 1.18], fall: [0.78, 1.12], float: [6, 10], floatX: [9, 26], floatY: [-24, -9], drift: [0.026, 0.076], rotateSpan: [36, 92], x: [-12, 110], y: [-2, 96], spacingX: 15, spacingY: 16, zIndex: 3 }
          ];
      const placed = [];
      const canPlace = (x, y, spacingX, spacingY) => placed.every((p) => !(Math.abs(p.x - x) < (p.spacingX + spacingX) * 0.5 && Math.abs(p.y - y) < (p.spacingY + spacingY) * 0.5));
      const placeFree = (band) => {
        let x = range(band.x[0], band.x[1]);
        let y = range(band.y[0], band.y[1]);
        for (let attempt = 0; attempt < 36; attempt += 1) {
          x = range(band.x[0], band.x[1]);
          y = range(band.y[0], band.y[1]);
          if (canPlace(x, y, band.spacingX, band.spacingY)) break;
        }
        placed.push({ x, y, spacingX: band.spacingX, spacingY: band.spacingY });
        return { x, y };
      };
      const placeEdge = (band) => {
        let x = range(band.x[0], band.x[1]);
        let y = range(band.y[0], band.y[1]);
        for (let attempt = 0; attempt < 32; attempt += 1) {
          const region = rand();
          if (region < 0.34) {
            x = range(-12, 16);
            y = range(2, 88);
          } else if (region < 0.68) {
            x = range(84, 108);
            y = range(-2, 90);
          } else {
            x = range(8, 94);
            y = range(68, 96);
          }
          if (canPlace(x, y, band.spacingX, band.spacingY)) break;
        }
        placed.push({ x, y, spacingX: band.spacingX, spacingY: band.spacingY });
        return { x, y };
      };
      const buildConfig = (band) => {
        const asset = band.name === 'foreground'
          ? pick(assetPool.filter((item) => item.type === 'chip').concat(assetPool.filter((item) => item.type === 'pepper')))
          : weightedAsset();
        const width = range(...(asset.type === 'chip' ? band.chipWidth : band.pepperWidth));
        const placement = band.placement === 'edge' ? placeEdge(band) : placeFree(band);
        const rotateStart = range(-22, 22);
        const rotateEnd = rotateStart + sign() * range(...band.rotateSpan);
        return {
          type: asset.type,
          asset: asset.asset,
          x: placement.x,
          y: placement.y,
          width,
          height: width / asset.ratio,
          fall: range(...band.fall),
          drift: sign() * range(...band.drift),
          rotateStart,
          rotateEnd,
          scale: range(...band.scale),
          opacity: range(...band.opacity),
          blur: range(...band.blur),
          saturate: range(...band.saturate),
          contrast: range(...band.contrast),
          brightness: range(...band.brightness),
          hue: range(...band.hue),
          float: range(...band.float),
          floatX: sign() * range(...band.floatX),
          floatY: range(...band.floatY),
          floatRotateStart: range(-4, 1),
          floatRotateEnd: range(1, 7),
          zIndex: band.zIndex
        };
      };
      const activeConfigs = depthBands.flatMap((band) => Array.from({ length: band.count }, () => buildConfig(band)));

      activeConfigs.forEach((cfg, index) => {
        const item = document.createElement('div');
        item.className = `hero-fall-item ${cfg.type}`;
        item.style.left = `${cfg.x}%`;
        item.style.top = `${cfg.y}%`;
        item.style.setProperty('--item-width', `${cfg.width}px`);
        item.style.setProperty('--item-height', `${cfg.height}px`);
        item.style.setProperty('--item-opacity', cfg.opacity);
        item.style.setProperty('--item-blur', `${cfg.blur}px`);
        item.style.setProperty('--item-hue', `${cfg.hue}deg`);
        item.style.setProperty('--item-saturate', cfg.saturate);
        item.style.setProperty('--item-contrast', cfg.contrast);
        item.style.setProperty('--item-brightness', cfg.brightness);
        item.style.setProperty('--float-duration', `${cfg.float}s`);
        item.style.setProperty('--float-x', `${cfg.floatX}px`);
        item.style.setProperty('--float-y', `${cfg.floatY}px`);
        item.style.setProperty('--float-rotate-start', `${cfg.floatRotateStart}deg`);
        item.style.setProperty('--float-rotate-end', `${cfg.floatRotateEnd}deg`);
        item.style.zIndex = String(cfg.zIndex);

        const shape = document.createElement('span');
        shape.className = 'hero-fall-shape';
        shape.style.animationDelay = `-${(index % 5) * 1.2}s`;
        const img = document.createElement('img');
        img.className = 'hero-fall-image';
        img.src = cfg.asset;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.decoding = 'async';
        shape.appendChild(img);
        item.appendChild(shape);
        layer.appendChild(item);

        gsap.set(item, { xPercent: -50, yPercent: -50, rotate: cfg.rotateStart, scale: cfg.scale, opacity: cfg.opacity });

        if (!prefersReducedMotion) {
          gsap.to(item, {
            y: () => window.innerHeight * cfg.fall,
            x: () => window.innerWidth * cfg.drift,
            rotate: cfg.rotateEnd,
            ease: 'none',
            scrollTrigger: {
              trigger: '#hero',
              start: 'top top',
              end: 'bottom+=60% top',
              scrub: 1.1,
              invalidateOnRefresh: true
            }
          });
        }
      });

      layer.dataset.ready = 'true';
    }


    function initAnimations() {
      gsap.registerPlugin(ScrollTrigger);
      document.querySelectorAll('.reveal-text').forEach((el, i) => { setTimeout(() => el.classList.add('active'), 200 + i * 150); });
      initHeroFall();
      gsap.from('.hero-product', { opacity: 0, x: 80, duration: 1.5, delay: 0.3, ease: 'power3.out' });
      ScrollTrigger.create({ start: 'top -80', onUpdate: (self) => { if (self.scroll() > 80) { document.getElementById('mainNav').classList.add('scrolled'); } else { document.getElementById('mainNav').classList.remove('scrolled'); } } });

      // Horizontal scroll flavors only when a section explicitly opts into that behavior.
      const hContainer = document.getElementById('horizontalContainer');
      const hSection = document.getElementById('flavors');
      if (hContainer && hSection && hSection.dataset.mode === 'horizontal') {
        gsap.to(hContainer, { x: () => -(hContainer.scrollWidth - window.innerWidth), ease: 'none', scrollTrigger: { trigger: hSection, start: 'top top', end: () => '+=' + (hContainer.scrollWidth - window.innerWidth), pin: true, scrub: 1.5, invalidateOnRefresh: true } });
      }

      // Process timeline from v9.
      const steps = ['#step1', '#step2', '#step3', '#step4'];
      steps.forEach((step, i) => { ScrollTrigger.create({ trigger: '#process', start: () => `${18 + i * 20}% top`, end: () => `${38 + i * 20}% top`, onEnter: () => { document.querySelector(step).classList.add('active'); document.getElementById('bg' + (i+1)).classList.add('active'); }, onLeaveBack: () => { document.querySelector(step).classList.remove('active'); document.getElementById('bg' + (i+1)).classList.remove('active'); } }); });
      ScrollTrigger.create({ trigger: '#process', start: 'top top', end: 'bottom bottom', onUpdate: (self) => { document.getElementById('processLineFill').style.height = (self.progress * 100) + '%'; } });

      // Testimonials
      const track = document.getElementById('testimonialTrack');
      let trackX = 0; let isPaused = false;
      track.addEventListener('mouseenter', () => isPaused = true);
      track.addEventListener('mouseleave', () => isPaused = false);
      function animateTrack() { if (!isPaused) { trackX -= 0.4; const halfWidth = track.scrollWidth / 2; if (Math.abs(trackX) >= halfWidth) trackX = 0; track.style.transform = `translateX(${trackX}px)`; } requestAnimationFrame(animateTrack); }
      animateTrack();
    }
    // Video
    function playVideo() { document.getElementById('videoPoster').classList.add('hidden'); const video = document.getElementById('mainVideo'); video.play().catch(() => {}); }

(function () {
  function bindMooLandingInteractions() {
    const menu = document.getElementById('mobileMenu');
    document.querySelectorAll('[data-moo-menu-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        if (menu) menu.classList.toggle('hidden');
      });
    });

    document.querySelectorAll('[data-moo-menu-close]').forEach((button) => {
      button.addEventListener('click', () => {
        if (menu) menu.classList.add('hidden');
      });
    });

    document.querySelectorAll('[data-moo-video-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const poster = document.getElementById('videoPoster');
        const video = document.getElementById('mainVideo');
        if (poster) poster.classList.add('hidden');
        if (video) video.play().catch(() => {});
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindMooLandingInteractions, { once: true });
  } else {
    bindMooLandingInteractions();
  }

  document.addEventListener('shopify:section:load', bindMooLandingInteractions);
})();

