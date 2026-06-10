/*
  Sezione Sottile
  Genera un campione minerale su Canvas 2D.
  L'algoritmo usa poligoni irregolari growth-based, microfratture e fossili.
*/

(function () {
  "use strict";

  class SezioneSottile {
    constructor(canvas, view, tooltip) {
      this.canvas = canvas;
      this.view = view;
      this.tooltip = tooltip;
      this.ctx = canvas.getContext("2d", { alpha: false });
      this.fossils = [];
      this.currentSeed = 0;
      this.currentLayerInfo = null;

      this.handleMove = this.handleMove.bind(this);
      this.handleLeave = this.handleLeave.bind(this);

      this.canvas.addEventListener("mousemove", this.handleMove);
      this.canvas.addEventListener("mouseleave", this.handleLeave);
      this.canvas.addEventListener("touchstart", (event) => {
        const touch = event.touches[0];
        if (touch) this.handleMove(touch);
      }, { passive: true });
    }

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      return {
        width: rect.width,
        height: rect.height,
        dpr
      };
    }

    genera(seed, layerInfo) {
      this.currentSeed = seed >>> 0;
      this.currentLayerInfo = layerInfo || {};
      this.fossils = [];

      this.view.classList.add("is-open");
      this.view.setAttribute("aria-hidden", "false");
      document.body.style.cursor = "auto";

      const title = document.getElementById("thin-section-title");
      const coordinates = document.getElementById("section-coordinates");

      if (title) {
        title.textContent = this.currentLayerInfo.fossilContent || `strato ${this.currentLayerInfo.geologicName || "non classificato"}`;
      }

      if (coordinates) {
        coordinates.textContent = `campione ${this.currentLayerInfo.depthLabel || "ignoto"} / x:${this.currentLayerInfo.x || 0} y:${this.currentLayerInfo.y || 0} / seed:${seed.toString(16)}`;
      }

      requestAnimationFrame(() => this.draw(seed));
    }

    draw(seed) {
      const random = window.PsychoCore.mulberry32(seed);
      const { width, height } = this.resizeCanvas();
      const ctx = this.ctx;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      this.drawMineralGrains(ctx, random, width, height);
      this.drawMicrofractures(ctx, random, width, height);
      this.drawOpaqueInclusions(ctx, random, width, height);
      this.drawFossils(ctx, random, width, height, seed);
      this.drawPolarizationVignette(ctx, width, height);
    }

    drawMineralGrains(ctx, random, width, height) {
      const count = window.PsychoCore.intRange(random, 220, 430);
      const palette = window.PsychoCore.thinSectionPalette;

      for (let i = 0; i < count; i += 1) {
        const cx = window.PsychoCore.range(random, -20, width + 20);
        const cy = window.PsychoCore.range(random, -20, height + 20);
        const radius = window.PsychoCore.range(random, 10, Math.max(28, Math.min(width, height) * 0.07));
        const sides = window.PsychoCore.intRange(random, 4, 9);
        const rotation = random() * Math.PI * 2;
        const color = window.PsychoCore.pick(random, palette);
        const alpha = window.PsychoCore.range(random, 0.52, 0.94);

        ctx.save();
        ctx.beginPath();

        for (let p = 0; p < sides; p += 1) {
          const angle = rotation + (p / sides) * Math.PI * 2;
          const jitter = window.PsychoCore.range(random, 0.48, 1.18);
          const x = cx + Math.cos(angle) * radius * jitter;
          const y = cy + Math.sin(angle) * radius * jitter;

          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();

        const gradient = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.2);
        gradient.addColorStop(0, this.withAlpha("#ffffff", 0.18));
        gradient.addColorStop(0.38, this.withAlpha(color, alpha));
        gradient.addColorStop(1, this.withAlpha("#000000", 0.25));

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.lineWidth = window.PsychoCore.range(random, 0.35, 1.35);
        ctx.strokeStyle = this.withAlpha("#ffffff", window.PsychoCore.range(random, 0.08, 0.34));
        ctx.stroke();

        if (random() < 0.34) {
          ctx.clip();
          this.drawInternalLamellae(ctx, random, cx, cy, radius, color);
        }

        ctx.restore();
      }
    }

    drawInternalLamellae(ctx, random, cx, cy, radius, color) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(window.PsychoCore.range(random, 0, Math.PI));
      ctx.strokeStyle = this.withAlpha("#ffffff", 0.12);
      ctx.lineWidth = 0.6;

      const lines = window.PsychoCore.intRange(random, 3, 9);

      for (let i = -lines; i <= lines; i += 1) {
        const y = (i / lines) * radius;
        ctx.beginPath();
        ctx.moveTo(-radius * 1.2, y + window.PsychoCore.range(random, -2, 2));
        ctx.bezierCurveTo(
          -radius * 0.4,
          y + window.PsychoCore.range(random, -6, 6),
          radius * 0.4,
          y + window.PsychoCore.range(random, -6, 6),
          radius * 1.2,
          y + window.PsychoCore.range(random, -2, 2)
        );
        ctx.stroke();
      }

      ctx.restore();
    }

    drawMicrofractures(ctx, random, width, height) {
      const cracks = window.PsychoCore.intRange(random, 12, 28);

      for (let i = 0; i < cracks; i += 1) {
        let x = window.PsychoCore.range(random, -30, width + 30);
        let y = window.PsychoCore.range(random, -30, height + 30);
        const steps = window.PsychoCore.intRange(random, 4, 11);

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let s = 0; s < steps; s += 1) {
          const nx = x + window.PsychoCore.range(random, -70, 70);
          const ny = y + window.PsychoCore.range(random, -70, 70);
          const cx = (x + nx) / 2 + window.PsychoCore.range(random, -28, 28);
          const cy = (y + ny) / 2 + window.PsychoCore.range(random, -28, 28);

          ctx.quadraticCurveTo(cx, cy, nx, ny);

          if (random() < 0.34) {
            ctx.save();
            ctx.moveTo(nx, ny);
            ctx.lineTo(nx + window.PsychoCore.range(random, -30, 30), ny + window.PsychoCore.range(random, -30, 30));
            ctx.restore();
          }

          x = nx;
          y = ny;
        }

        ctx.strokeStyle = this.withAlpha("#f4efe8", window.PsychoCore.range(random, 0.18, 0.44));
        ctx.lineWidth = window.PsychoCore.range(random, 0.5, 2.2);
        ctx.stroke();
      }
    }

    drawOpaqueInclusions(ctx, random, width, height) {
      const inclusions = window.PsychoCore.intRange(random, 22, 48);

      for (let i = 0; i < inclusions; i += 1) {
        const x = window.PsychoCore.range(random, 0, width);
        const y = window.PsychoCore.range(random, 0, height);
        const w = window.PsychoCore.range(random, 8, 44);
        const h = window.PsychoCore.range(random, 4, 20);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(window.PsychoCore.range(random, -0.8, 0.8));
        ctx.fillStyle = this.withAlpha("#000000", window.PsychoCore.range(random, 0.35, 0.75));

        if (random() < 0.5) {
          ctx.fillRect(-w / 2, -h / 2, w, h);
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (random() < 0.28) {
          ctx.font = `${window.PsychoCore.intRange(random, 7, 12)}px Courier New`;
          ctx.fillStyle = this.withAlpha("#f6f1ea", 0.22);
          ctx.fillText(window.PsychoCore.pick(random, ["010", "ERR", "mem", "tag", "cut", "∴", "{ }"]), -w / 2, h / 2 + 10);
        }

        ctx.restore();
      }
    }

    drawFossils(ctx, random, width, height, seed) {
      const count = window.PsychoCore.intRange(random, 10, 26);

      for (let i = 0; i < count; i += 1) {
        const fossilSeed = (seed + i * 1013904223) >>> 0;
        const local = window.PsychoCore.mulberry32(fossilSeed);
        const x = window.PsychoCore.range(local, 34, width - 34);
        const y = window.PsychoCore.range(local, 34, height - 34);
        const r = window.PsychoCore.range(local, 10, 34);
        const type = window.PsychoCore.pick(local, ["gear", "letter", "face", "circuit", "spiral"]);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(window.PsychoCore.range(local, -Math.PI, Math.PI));
        ctx.strokeStyle = this.withAlpha("#f6f1ea", window.PsychoCore.range(local, 0.42, 0.82));
        ctx.fillStyle = this.withAlpha("#0a0a0a", 0.28);
        ctx.lineWidth = window.PsychoCore.range(local, 0.7, 1.8);

        if (type === "gear") this.drawGear(ctx, local, r);
        if (type === "letter") this.drawLetter(ctx, local, r);
        if (type === "face") this.drawFace(ctx, local, r);
        if (type === "circuit") this.drawCircuit(ctx, local, r);
        if (type === "spiral") this.drawSpiral(ctx, local, r);

        ctx.restore();

        this.fossils.push({
          x,
          y,
          r: r * 1.3,
          text: window.PsychoCore.fossilPhrase(fossilSeed)
        });
      }
    }

    drawGear(ctx, random, r) {
      const teeth = window.PsychoCore.intRange(random, 7, 12);

      ctx.beginPath();
      for (let i = 0; i < teeth * 2; i += 1) {
        const rr = i % 2 === 0 ? r : r * 0.72;
        const a = (i / (teeth * 2)) * Math.PI * 2;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawLetter(ctx, random, r) {
      ctx.font = `${Math.round(r * 1.45)}px Courier New`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = this.withAlpha("#f6f1ea", 0.66);
      ctx.fillText(window.PsychoCore.pick(random, ["A", "Z", "M", "∴", "ψ", "λ", "0"]), 0, 0);
    }

    drawFace(ctx, random, r) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.58, r, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-r * 0.2, -r * 0.1, r * 0.06, 0, Math.PI * 2);
      ctx.arc(r * 0.2, -r * 0.1, r * 0.06, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 0.18, r * 0.32);
      ctx.quadraticCurveTo(0, r * 0.44, r * 0.18, r * 0.32);
      ctx.stroke();
    }

    drawCircuit(ctx, random, r) {
      const branches = window.PsychoCore.intRange(random, 4, 8);
      for (let i = 0; i < branches; i += 1) {
        const a = (i / branches) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a) * r + Math.cos(a + 0.7) * r * 0.32, Math.sin(a) * r + Math.sin(a + 0.7) * r * 0.32);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawSpiral(ctx, random, r) {
      ctx.beginPath();
      for (let i = 0; i < 70; i += 1) {
        const t = i / 70;
        const a = t * Math.PI * 6;
        const rr = t * r;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    drawPolarizationVignette(ctx, width, height) {
      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.1,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72
      );

      gradient.addColorStop(0, "rgba(255,255,255,0.04)");
      gradient.addColorStop(0.72, "rgba(0,0,0,0.08)");
      gradient.addColorStop(1, "rgba(0,0,0,0.66)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    handleMove(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      let active = null;

      for (const fossil of this.fossils) {
        const dx = fossil.x - x;
        const dy = fossil.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < fossil.r) {
          active = fossil;
          break;
        }
      }

      if (active) {
        this.tooltip.textContent = active.text;
        this.tooltip.style.left = `${event.clientX}px`;
        this.tooltip.style.top = `${event.clientY}px`;
        this.tooltip.classList.add("is-visible");
        this.tooltip.setAttribute("aria-hidden", "false");
      } else {
        this.handleLeave();
      }
    }

    handleLeave() {
      this.tooltip.classList.remove("is-visible");
      this.tooltip.setAttribute("aria-hidden", "true");
    }

    chiudi() {
      this.view.classList.remove("is-open");
      this.view.setAttribute("aria-hidden", "true");
      this.handleLeave();

      if (window.matchMedia("(pointer: fine)").matches) {
        document.body.style.cursor = "none";
      }
    }

    withAlpha(hex, alpha) {
      const normalized = hex.replace("#", "");
      const bigint = parseInt(normalized, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  window.SezioneSottile = SezioneSottile;
})();
