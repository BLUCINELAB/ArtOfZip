(() => {
  "use strict";

  const canvas = document.getElementById("nebulaCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const sitePhase = document.getElementById("sitePhase");
  const systemNote = document.getElementById("systemNote");
  const phaseFootnote = document.getElementById("phaseFootnote");

  if (!canvas || !ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR_LIMIT = 2;
  const POINTER_RADIUS = 160;
  const LINK_DISTANCE = reduceMotion ? 72 : 108;
  const COLORS = {
    core: "210, 195, 180",
    electric: "130, 160, 220",
    ember: "210, 140, 80",
    violet: "140, 120, 200",
    text: "245, 240, 230"
  };

  const PHASES = {
    listening: "Il campo trattiene. La risposta non coincide mai con il gesto.",
    revealing: "Il gesto piega il flusso. La traccia si rende leggibile per frammenti.",
    network: "Una rete temporanea si tende tra elementi dispersi. Resta instabile.",
    saturated: "La memoria locale si addensa. Il campo accelera e si colora.",
    dormant: "La superficie rallenta. Nulla si spegne davvero: tutto resta in attesa."
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let rafId = 0;
  let lastTime = performance.now();
  let lastInteractionAt = performance.now();
  let activePhase = "listening";

  const pointer = {
    x: 0,
    y: 0,
    speed: 0,
    active: false
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function particleCount() {
    const base = width < 720 ? 90 : width < 1200 ? 140 : 190;
    return reduceMotion ? Math.round(base * 0.6) : base;
  }

  function paletteFor(index) {
    const palettes = [COLORS.core, COLORS.electric, COLORS.ember, COLORS.violet];
    return palettes[index % palettes.length];
  }

  function makeParticle(index) {
    return {
      x: random(0, width),
      y: random(0, height),
      vx: random(-0.4, 0.4),
      vy: random(-0.4, 0.4),
      size: random(0.8, 2.4),
      hue: paletteFor(index),
      seed: random(0, Math.PI * 2)
    };
  }

  function seedParticles() {
    particles = Array.from({ length: particleCount() }, (_, index) => makeParticle(index));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    seedParticles();
  }

  function updatePointer(x, y) {
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    pointer.speed = Math.hypot(dx, dy);
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
    lastInteractionAt = performance.now();
  }

  function releasePointer() {
    pointer.active = false;
    pointer.speed *= 0.8;
  }

  function updateParticles(time, delta) {
    let averageSpeed = 0;

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const driftX = Math.sin((p.y + time * 0.018) * 0.006 + p.seed) * 0.055;
      const driftY = Math.cos((p.x - time * 0.015) * 0.005 - p.seed) * 0.05;
      const centerX = (width * 0.5 - p.x) * 0.000015;
      const centerY = (height * 0.5 - p.y) * 0.000015;

      p.vx += (driftX + centerX) * delta;
      p.vy += (driftY + centerY) * delta;

      if (pointer.active) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const distance = Math.hypot(dx, dy) || 1;

        if (distance < POINTER_RADIUS) {
          const force = (1 - distance / POINTER_RADIUS) * (0.02 + clamp(pointer.speed / 120, 0, 0.12));
          p.vx += (dx / distance) * force * delta;
          p.vy += (dy / distance) * force * delta;
        }
      }

      p.vx *= reduceMotion ? 0.985 : 0.992;
      p.vy *= reduceMotion ? 0.985 : 0.992;

      const maxSpeed = reduceMotion ? 0.9 : 1.55;
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > maxSpeed) {
        const ratio = maxSpeed / speed;
        p.vx *= ratio;
        p.vy *= ratio;
      }

      p.x += p.vx * delta;
      p.y += p.vy * delta;

      if (p.x < -16) p.x = width + 16;
      if (p.x > width + 16) p.x = -16;
      if (p.y < -16) p.y = height + 16;
      if (p.y > height + 16) p.y = -16;

      averageSpeed += speed;
    }

    return averageSpeed / particles.length;
  }

  function drawBackgroundFade() {
    const alpha = reduceMotion ? 0.16 : 0.09;
    ctx.fillStyle = `rgba(5, 5, 8, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  }

  function drawPointerAura() {
    if (!pointer.active) return;

    const radius = 26 + clamp(pointer.speed * 0.75, 0, 60);
    const aura = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
    aura.addColorStop(0, "rgba(245, 240, 230, 0.08)");
    aura.addColorStop(1, "rgba(245, 240, 230, 0)");

    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawParticles(time) {
    let connections = 0;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];

      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);

        if (distance > LINK_DISTANCE) continue;

        const opacity = clamp(1 - distance / LINK_DISTANCE, 0, 1) * (reduceMotion ? 0.14 : 0.22);
        const pulse = 0.86 + Math.sin(time * 0.002 + i * 0.11 + j * 0.07) * 0.14;

        ctx.strokeStyle = `rgba(${COLORS.electric}, ${opacity * pulse})`;
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        connections += 1;
      }
    }

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const speed = Math.hypot(p.vx, p.vy);
      const stretch = 1 + clamp(speed / 1.6, 0, 1.1);
      const alpha = clamp(0.22 + speed * 0.22, 0.22, 0.7);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.vy, p.vx) || 0);
      ctx.fillStyle = `rgba(${p.hue}, ${alpha})`;
      ctx.shadowBlur = 16;
      ctx.shadowColor = `rgba(${p.hue}, ${alpha * 0.75})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * stretch, p.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    drawPointerAura();

    return connections;
  }

  function setPhase(nextPhase) {
    if (activePhase === nextPhase) return;
    activePhase = nextPhase;
    document.body.dataset.phase = nextPhase;
    if (sitePhase) sitePhase.textContent = nextPhase.toUpperCase();
    if (systemNote) systemNote.textContent = PHASES[nextPhase];
    if (phaseFootnote) phaseFootnote.textContent = `fase attuale · ${nextPhase}`;
  }

  function resolvePhase(averageSpeed, connections) {
    const idleFor = performance.now() - lastInteractionAt;

    if (idleFor > 7000 && averageSpeed < 0.2) return "dormant";
    if (connections > particles.length * 1.8) return "network";
    if (pointer.active && pointer.speed > 10 && averageSpeed > 0.44) return "saturated";
    if (pointer.active || averageSpeed > 0.28) return "revealing";
    return "listening";
  }

  function frame(time) {
    const delta = clamp((time - lastTime) / 16.6667, 0.75, 1.3);
    lastTime = time;

    drawBackgroundFade();
    const averageSpeed = updateParticles(time, delta);
    const connections = drawParticles(time);
    setPhase(resolvePhase(averageSpeed, connections));

    if (!pointer.active) {
      pointer.speed *= 0.94;
    }

    rafId = requestAnimationFrame(frame);
  }

  function attachEvents() {
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", (event) => updatePointer(event.clientX, event.clientY), { passive: true });
    window.addEventListener("touchmove", (event) => {
      if (!event.touches[0]) return;
      updatePointer(event.touches[0].clientX, event.touches[0].clientY);
    }, { passive: true });
    window.addEventListener("mouseleave", releasePointer, { passive: true });
    window.addEventListener("touchend", releasePointer, { passive: true });
    window.addEventListener("blur", releasePointer, { passive: true });
    window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId), { passive: true });
  }

  function init() {
    resize();
    attachEvents();
    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, width, height);
    setPhase("listening");
    rafId = requestAnimationFrame(frame);
  }

  init();
})();
