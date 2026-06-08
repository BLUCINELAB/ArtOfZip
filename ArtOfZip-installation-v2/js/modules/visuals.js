(() => {
  'use strict';

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = () => window.matchMedia('(max-width: 700px)').matches;

  const words = [
    'threshold', 'water', 'breath', 'body', 'trace', 'weight', 'interval',
    'dissolution', 'field', 'sediment', 'mouth', 'skin', 'darkness',
    'return', 'archive', 'salt', 'glass', 'room', 'signal', 'silence',
    'afterimage', 'fracture', 'memory', 'pressure', 'sleep', 'wake'
  ];

  const configs = {
    DORMANT: { count: 14, alpha: 0.05, speed: 0.018, fade: 0.12 },
    BREACH: { count: 24, alpha: 0.11, speed: 0.045, fade: 0.1 },
    THRESHOLD: { count: 42, alpha: 0.16, speed: 0.075, fade: 0.08 },
    AFTERIMAGE: { count: 18, alpha: 0.07, speed: 0.022, fade: 0.14 }
  };

  const currentState = () => String(window.StarAnomaly?.state || 'DORMANT').toUpperCase();

  window.StarVisuals = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    particles: [],
    raf: 0,
    particleTarget: 0,

    init() {
      this.canvas = document.getElementById('codeRain');
      this.ctx = this.canvas?.getContext('2d', { alpha: true }) || null;

      if (this.ctx && !reduceMotion() && !smallScreen()) {
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
      this.bindAmbientTrace();
    },

    resize() {
      if (!this.canvas || !this.ctx) return;
      if (smallScreen()) {
        this.canvas.style.display = 'none';
        cancelAnimationFrame(this.raf);
        return;
      }

      this.canvas.style.display = 'block';
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.floor(this.width * ratio);
      this.canvas.height = Math.floor(this.height * ratio);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.ensureParticles(true);
    },

    ensureParticles(force = false) {
      const state = currentState();
      const config = configs[state] || configs.DORMANT;
      const target = Math.max(8, Math.floor(config.count * Math.min(1.4, this.width / 1400)));
      if (!force && target === this.particleTarget && this.particles.length) return;
      this.particleTarget = target;
      this.particles = Array.from({ length: target }, () => this.createParticle(true));
    },

    createParticle(scatter = false) {
      return {
        x: Math.random() * this.width,
        y: scatter ? Math.random() * this.height : this.height + Math.random() * 80,
        word: words[Math.floor(Math.random() * words.length)],
        alpha: 0.45 + Math.random() * 0.55,
        drift: -0.08 + Math.random() * 0.16,
        size: 10 + Math.random() * 5
      };
    },

    loop() {
      if (!this.ctx || document.hidden || reduceMotion() || smallScreen()) return;
      const state = currentState();
      const config = configs[state] || configs.DORMANT;
      this.ensureParticles();

      const ctx = this.ctx;
      ctx.fillStyle = `rgba(2, 3, 7, ${config.fade})`;
      ctx.fillRect(0, 0, this.width, this.height);

      const color = {
        DORMANT: '196, 222, 242',
        BREACH: '120, 216, 190',
        THRESHOLD: '223, 191, 122',
        AFTERIMAGE: '177, 188, 202'
      }[state] || '196, 222, 242';

      this.particles.forEach((particle, index) => {
        ctx.font = `${particle.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.fillStyle = `rgba(${color}, ${config.alpha * particle.alpha})`;
        ctx.fillText(particle.word, particle.x, particle.y);
        particle.y -= config.speed * (10 + index % 7);
        particle.x += particle.drift;

        if (particle.y < -24 || particle.x < -160 || particle.x > this.width + 160) {
          this.particles[index] = this.createParticle(false);
        }
      });

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
        dx += (x - dx) * 0.12;
        dy += (y - dy) * 0.12;
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

      const introDelay = reduceMotion() ? 0 : 320;
      setTimeout(() => document.getElementById('ritualRule')?.classList.add('visible'), introDelay);
      setTimeout(() => document.getElementById('heroCopy')?.classList.add('visible'), introDelay + 120);
      setTimeout(() => {
        document.getElementById('heroMeta')?.classList.add('visible');
        document.getElementById('breachButton')?.classList.add('visible');
      }, introDelay + 220);

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
      }, { threshold: 0.08 });

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

    bindAmbientTrace() {
      let lastBump = 0;
      window.addEventListener('pointerdown', event => {
        const now = performance.now();
        if (event.isPrimary === false || now - lastBump < 900) return;
        window.StarAnomaly?.add?.(0.01);
        lastBump = now;
      }, { passive: true });
    },

    trace(result = {}) {
      if (reduceMotion()) return;
      const state = currentState();
      if (state === 'DORMANT') return;
      this.phasePulse(state, Math.min(0.22, 0.08 + Number(result.depth || 0) * 0.03));
    },

    phasePulse(state, opacity = 0.14) {
      if (reduceMotion()) return;
      const flash = document.getElementById('breachFlash');
      if (!flash) return;
      flash.style.setProperty('--flash-opacity', String(opacity));
      flash.dataset.phase = String(state || currentState()).toLowerCase();
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 170);
      this.ensureParticles(true);
    },

    glitch() {
      this.phasePulse(currentState(), 0.1);
    },

    flash() {
      this.phasePulse(currentState(), 0.16);
    }
  };
})();
