(() => {
  "use strict";

  const canvas = document.getElementById("residuoCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  const systemNote = document.getElementById("systemNote");
  const siteState  = document.getElementById("siteState");

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CONFIG = {
    delayMin:            2900,
    delayMax:            3700,
    lifetime:            11400,
    cleanupMargin:       1400,
    minDistance:         9,
    touchMinDistance:    13,
    maxGapMs:            85,
    backgroundFadeAlpha: prefersReducedMotion ? 0.038 : 0.018,
    traceBaseOpacity:    0.46,
    traceWidthMin:       0.7,
    traceWidthMax:       1.6,
    pulseInterval:       7400,
    maxPoints:           5000,
    trace:               "208, 194, 176",
  };

  let dpr    = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let width  = 0;
  let height = 0;
  let rafId  = 0;

  const points    = [];
  let lastCapture = null;
  let hasInteracted = false;
  let idleSince     = performance.now();

  const notes = [
    "Il sistema non risponde subito. Trattiene.",
    "Ogni gesto entra in latenza prima di tornare.",
    "La memoria qui è una linea che si consuma.",
    "Le tracce non sono feedback. Sono residui.",
    "L'ambiente accumula, poi lascia andare.",
    "Il collasso non è un errore. È la fine del ciclo.",
  ];

  /* ─── helpers ─────────────────────────────────────────────────────── */

  function randomDelay() {
    return CONFIG.delayMin + Math.random() * (CONFIG.delayMax - CONFIG.delayMin);
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /* ─── resize ──────────────────────────────────────────────────────── */

  function resize() {
    dpr    = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    width  = window.innerWidth;
    height = window.innerHeight;

    canvas.width  = Math.round(width  * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width  = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap  = "round";

    fillBase();
  }

  function fillBase() {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#060606";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  /* ─── capture ─────────────────────────────────────────────────────── */

  function capture(x, y, isTouch = false) {
    const now = performance.now();
    idleSince     = now;
    hasInteracted = true;

    const minDist = isTouch ? CONFIG.touchMinDistance : CONFIG.minDistance;

    if (lastCapture && dist({ x, y }, lastCapture) < minDist) return;

    const speed = lastCapture
      ? dist({ x, y }, lastCapture) / Math.max(1, now - lastCapture.t)
      : 0;

    const point = {
      x,
      y,
      t:        now,
      revealAt: now + randomDelay(),
      speed,
    };

    points.push(point);
    lastCapture = point;

    if (points.length > CONFIG.maxPoints) {
      points.splice(0, points.length - CONFIG.maxPoints);
    }
  }

  /* ─── event handlers ──────────────────────────────────────────────── */

  function handleMouseMove(e) {
    capture(e.clientX, e.clientY, false);
  }

  function handleTouchMove(e) {
    if (!e.touches?.length) return;
    capture(e.touches[0].clientX, e.touches[0].clientY, true);
  }

  function handlePointerLeave() {
    lastCapture = null;
  }

  /* ─── rendering ───────────────────────────────────────────────────── */

  function segmentOpacity(p1, p2, now) {
    const age1 = now - p1.revealAt;
    const age2 = now - p2.revealAt;
    if (age1 < 0 || age2 < 0) return 0;

    const fade = ((1 - age1 / CONFIG.lifetime) + (1 - age2 / CONFIG.lifetime)) * 0.5;
    return Math.max(0, Math.min(fade * CONFIG.traceBaseOpacity, CONFIG.traceBaseOpacity));
  }

  function segmentWidth(p1, p2) {
    const avgSpeed = ((p1.speed ?? 0) + (p2.speed ?? 0)) * 0.5;
    // slow movement → thicker trace; fast → thinner
    const t = Math.min(1, avgSpeed * 14);
    return CONFIG.traceWidthMax - t * (CONFIG.traceWidthMax - CONFIG.traceWidthMin);
  }

  function drawAmbientPulse(now) {
    const idleTime = now - idleSince;
    const pulse    = Math.sin(now / CONFIG.pulseInterval * Math.PI * 2) * 0.5 + 0.5;

    const alpha = hasInteracted
      ? Math.min(0.028, 0.007 + pulse * 0.009 + Math.min(idleTime / 18000, 1) * 0.012)
      : 0.018;

    const radiusBase = Math.max(width, height) * 0.42;
    const radius     = radiusBase * (0.95 + pulse * 0.1);

    const grad = ctx.createRadialGradient(
      width  * 0.5, height * 0.47, 0,
      width  * 0.5, height * 0.47, radius
    );
    grad.addColorStop(0,    `rgba(215, 200, 180, ${alpha})`);
    grad.addColorStop(0.42, `rgba(215, 200, 180, ${alpha * 0.22})`);
    grad.addColorStop(1,    "rgba(0, 0, 0, 0)");

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function render(now) {
    ctx.fillStyle = `rgba(6, 6, 6, ${CONFIG.backgroundFadeAlpha})`;
    ctx.fillRect(0, 0, width, height);

    drawAmbientPulse(now);

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      if (curr.t - prev.t > CONFIG.maxGapMs) continue;

      const opacity = segmentOpacity(prev, curr, now);
      if (opacity <= 0) continue;

      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.strokeStyle = `rgba(${CONFIG.trace}, ${opacity})`;
      ctx.lineWidth   = segmentWidth(prev, curr);
      ctx.stroke();
    }

    cleanup(now);
    updateText(now);

    rafId = requestAnimationFrame(render);
  }

  /* ─── cleanup ─────────────────────────────────────────────────────── */

  function cleanup(now) {
    const cutoff = now - (CONFIG.delayMax + CONFIG.lifetime + CONFIG.cleanupMargin);
    let i = 0;
    while (i < points.length && points[i].t < cutoff) i++;
    if (i > 0) points.splice(0, i);
  }

  /* ─── state text ──────────────────────────────────────────────────── */

  function updateText(now) {
    if (!systemNote || !siteState) return;

    const idleTime     = now - idleSince;
    const visibleCount = points.filter(
      p => now >= p.revealAt && now <= p.revealAt + CONFIG.lifetime
    ).length;

    if (!hasInteracted) {
      siteState.textContent = "RESIDUO / LISTENING";
      return;
    }

    if (visibleCount > 280) {
      siteState.textContent   = "RESIDUO / COLLAPSING";
      systemNote.textContent  = notes[5];
      return;
    }

    if (visibleCount > 140) {
      siteState.textContent   = "RESIDUO / SATURATED";
      systemNote.textContent  = notes[3];
      return;
    }

    if (visibleCount > 0) {
      siteState.textContent  = "RESIDUO / REVEALING";
      systemNote.textContent = notes[Math.floor(now / 6200) % notes.length];
      return;
    }

    if (idleTime > 9000) {
      siteState.textContent  = "RESIDUO / DORMANT";
      systemNote.textContent = notes[0];
      return;
    }

    siteState.textContent  = "RESIDUO / RECORDING";
    systemNote.textContent = notes[1];
  }

  /* ─── init ────────────────────────────────────────────────────────── */

  function init() {
    resize();
    fillBase();

    window.addEventListener("resize",     resize,            { passive: true });
    window.addEventListener("mousemove",  handleMouseMove,   { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    window.addEventListener("blur",       handlePointerLeave, { passive: true });

    window.addEventListener("touchmove", handleTouchMove,     { passive: true });
    window.addEventListener("touchend",  handlePointerLeave,  { passive: true });

    rafId = requestAnimationFrame(render);
  }

  init();

  window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
})();
