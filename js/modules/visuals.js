(() => {
  'use strict';

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.StarVisuals = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    drops: [],
    raf: 0,
    chars: '01アイウエオカキクケコサシスセソタチツテトナニ∅◈⊕⊗▲▼◆░▒▓ORACLEMEMORIACODEREALTÀTEMPOANIMASOGLIA',

    init() {
      this.canvas = document.getElementById('codeRain');
      this.ctx = this.canvas?.getContext('2d', { alpha: true }) || null;
      if (this.ctx && !reduceMotion()) {
        this.resize();
        window.addEventListener('resize', () => this.resize(), { passive: true });
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) cancelAnimationFrame(this.raf);
          else this.loop();
        });
        this.loop();
      } else if (this.canvas) {
        this.canvas.style.display = 'none';
      }

      this.cursor();
      this.reveal();
      this.clock();
      this.bindAmbientAnomaly();
      if (!reduceMotion()) document.body.classList.add('breathing');
    },

    resize() {
      if (!this.canvas || !this.ctx) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.floor(this.width * ratio);
      this.canvas.height = Math.floor(this.height * ratio);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const colWidth = this.width < 640 ? 28 : 22;
      const cols = Math.max(1, Math.floor(this.width / colWidth));
      this.drops = Array.from({ length: cols }, () => Math.random() * -this.height);
    },

    loop() {
      if (!this.ctx || document.hidden || reduceMotion()) return;
      const ctx = this.ctx;
      const awakened = document.body.classList.contains('awakened');
      ctx.fillStyle = 'rgba(2, 3, 8, 0.07)';
      ctx.fillRect(0, 0, this.width, this.height);

      const base = awakened ? [140, 92, 255] : [77, 255, 206];
      const colWidth = this.width < 640 ? 28 : 22;
      ctx.font = `${this.width < 640 ? 11 : 12}px ui-monospace, monospace`;

      for (let i = 0; i < this.drops.length; i++) {
        const char = this.chars[Math.floor(Math.random() * this.chars.length)];
        const x = i * colWidth;
        const y = this.drops[i];
        const alpha = awakened ? 0.26 + Math.random() * 0.52 : 0.18 + Math.random() * 0.38;
        ctx.fillStyle = `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${alpha})`;
        ctx.fillText(char, x, y);
        this.drops[i] += awakened ? 21 : 15;
        if (this.drops[i] > this.height + 40 && Math.random() > 0.965) this.drops[i] = Math.random() * -160;
      }

      this.raf = requestAnimationFrame(() => this.loop());
    },

    cursor() {
      const cursor = document.getElementById('cursor');
      const dot = document.getElementById('cursorDot');
      if (!window.matchMedia('(pointer: fine)').matches || reduceMotion()) {
        document.body.style.cursor = 'auto';
        if (cursor) cursor.style.display = 'none';
        if (dot) dot.style.display = 'none';
        return;
      }

      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      let dx = x;
      let dy = y;

      window.addEventListener('mousemove', event => {
        x = event.clientX;
        y = event.clientY;
      }, { passive: true });

      const tick = () => {
        dx += (x - dx) * 0.14;
        dy += (y - dy) * 0.14;
        if (cursor) {
          cursor.style.left = `${x}px`;
          cursor.style.top = `${y}px`;
        }
        if (dot) {
          dot.style.left = `${dx}px`;
          dot.style.top = `${dy}px`;
        }
        requestAnimationFrame(tick);
      };
      tick();

      document.querySelectorAll('button, input, .panel, a').forEach(el => {
        el.addEventListener('mouseenter', () => cursor?.classList.add('large'));
        el.addEventListener('mouseleave', () => cursor?.classList.remove('large'));
      });
    },

    reveal() {
      requestAnimationFrame(() => {
        document.querySelectorAll('.title-line').forEach(line => line.classList.add('visible'));
      });

      const introDelay = reduceMotion() ? 0 : 720;
      setTimeout(() => document.getElementById('ritualRule')?.classList.add('visible'), introDelay);
      setTimeout(() => document.getElementById('heroCopy')?.classList.add('visible'), introDelay + 160);
      setTimeout(() => {
        document.getElementById('heroMeta')?.classList.add('visible');
        document.getElementById('breachButton')?.classList.add('visible');
      }, introDelay + 300);

      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.panel').forEach(panel => panel.classList.add('visible'));
        return;
      }

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.panel').forEach(panel => observer.observe(panel));
    },

    clock() {
      const target = document.getElementById('systemTime');
      const tick = () => {
        if (target) target.textContent = new Date().toLocaleTimeString('it-IT', { hour12: false });
      };
      tick();
      setInterval(tick, 1000);
    },

    bindAmbientAnomaly() {
      let lastScroll = window.scrollY;
      let lastBump = 0;
      window.addEventListener('scroll', () => {
        const now = performance.now();
        if (now - lastBump < 300) return;
        const delta = Math.abs(window.scrollY - lastScroll);
        lastScroll = window.scrollY;
        if (delta > 60) {
          window.StarAnomaly?.add(0.006);
          lastBump = now;
        }
      }, { passive: true });

      window.addEventListener('pointerdown', event => {
        if (event.isPrimary !== false) window.StarAnomaly?.add(0.012);
      }, { passive: true });
    },

    glitch() {
      if (reduceMotion()) return;
      document.body.classList.add('glitch');
      setTimeout(() => document.body.classList.remove('glitch'), 130);
    },

    flash() {
      if (reduceMotion()) return;
      const flash = document.getElementById('breachFlash');
      if (!flash) return;
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 170);
    }
  };
})();
