(() => {
  "use strict";

  const canvas = document.getElementById("residuoCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  const systemNote = document.getElementById("systemNote");
  const siteState = document.getElementById("siteState");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CONFIG = {
    delayMin: 2600,
    delayMax: 3400,
    lifetime: 9200,
    cleanupMargin: 1200,
    minDistance: 10,
    maxGapMs: 90,
    backgroundFadeAlpha: prefersReducedMotion ? 0.04 : 0.022,
    traceBaseOpacity: 0.42,
    traceWidth: 0.95,
    pulseInterval: 7200,
    maxPoints: 5000,
    touchMinDistance: 14
  };

  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let width = 0;
  let height = 0;
  let rafId = 0;

  const points = [];
  let lastCapture = null;
  let hasInteracted = false;
  let idleSince = performance.now();

  const notes = [
    "Il sistema non risponde subito. Trattiene.",
    "Ogni gesto entra in latenza prima di tornare.",
    "La memoria qui è una linea che si consuma.",
    "Le tracce non sono feedback. Sono residui.",
    "L’ambiente accumula, poi lascia andare."
  ];

  function randomDelay() {
    return CONFIG.delayMin + Math.random() * (CONFIG.delayMax - CONFIG.delayMin);
  }

  function resize() {
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    fillBase();
  }

  function fillBase() {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#080808";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function capture(x, y, isTouch = false) {
    const now = performance.now();
    idleSince = now;
    hasInteracted = true;

    const point = {
      x,
      y,
      t: now,
      revealAt: now + randomDelay()
    };

    if (lastCapture) {
      const minDist = isTouch ? CONFIG.touchMinDistance : CONFIG.minDistance;
      if (distance(point, lastCapture) < minDist) return;
    }

    points.push(point);
    lastCapture = point;

    if (points.length > CONFIG.maxPoints) {
      points.splice(0, points.length - CONFIG.maxPoints);
    }
  }

  function handleMouseMove(event) {
    capture(event.clientX, event.clientY, false);
  }

  function handleTouchMove(event) {
    if (!event.touches || !event.touches.length) return;
    const touch = event.touches[0];
    capture(touch.clientX, touch.clientY, true);
  }

  function handlePointerLeave() {
    lastCapture = null;
  }

  function getSegmentOpacity(p1, p2, now) {
    const age1 = now - p1.revealAt;
    const age2 = now - p2.revealAt;

    if (age1 < 0 || age2 < 0) return 0;

    const fade1 = 1 - age1 / CONFIG.lifetime;
    const fade2 = 1 - age2 / CONFIG.lifetime;

    const opacity = ((fade1 + fade2) * 0.5) * CONFIG.traceBaseOpacity;
    return Math.max(0, Math.min(opacity, CONFIG.traceBaseOpacity));
  }

  function drawAmbientPulse(now) {
    const idleTime = now - idleSince;
    const pulse = Math.sin(now / CONFIG.pulseInterval * Math.PI * 2) * 0.5 + 0.5;

    const alpha = hasInteracted
      ? Math.min(0.028, 0.008 + pulse * 0.008 + Math.min(idleTime / 18000, 1) * 0.01)
      : 0.02;

    const radius = Math.max(width, height) * 0.42;

    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      0,
      width * 0.5,
      height * 0.48,
      radius
    );

    grad.addColorStop(0, `rgba(215, 201, 182, ${alpha})`);
    grad.addColorStop(0.45, `rgba(215, 201, 182, ${alpha * 0.26})`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function render(now) {
    ctx.fillStyle = `rgba(8, 8, 8, ${CONFIG.backgroundFadeAlpha})`;
    ctx.fillRect(0, 0, width, height);

    drawAmbientPulse(now);

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      if (curr.t - prev.t > CONFIG.maxGapMs) continue;

      const opacity = getSegmentOpacity(prev, curr, now);
      if (opacity <= 0) continue;

      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.strokeStyle = `rgba(${CONFIG.trace}, ${opacity})`;
      ctx.lineWidth = CONFIG.traceWidth;
      ctx.stroke();
    }

    cleanup(now);
    updateText(now);

    rafId = requestAnimationFrame(render);
  }

  function cleanup(now) {
    const cutoff = now - (CONFIG.delayMax + CONFIG.lifetime + CONFIG.cleanupMargin);

    let removeCount = 0;
    while (removeCount < points.length && points[removeCount].t < cutoff) {
      removeCount++;
    }

    if (removeCount > 0) {
      points.splice(0, removeCount);
    }
  }

  function updateText(now) {
    if (!systemNote || !siteState) return;

    const idleTime = now - idleSince;
    const visibleCount = points.filter(point => now >= point.revealAt && now <= point.revealAt + CONFIG.lifetime).length;

    if (!hasInteracted) {
      siteState.textContent = "RESIDUO / LISTENING";
      return;
    }

    if (idleTime > 9000 && visibleCount === 0) {
      siteState.textContent = "RESIDUO / DORMANT";
      systemNote.textContent = notes[0];
      return;
    }

    if (visibleCount > 140) {
      siteState.textContent = "RESIDUO / SATURATED";
      systemNote.textContent = notes[3];
      return;
    }

    if (visibleCount > 0) {
      siteState.textContent = "RESIDUO / REVEALING";
      systemNote.textContent = notes[(Math.floor(now / 6000)) % notes.length];
      return;
    }

    siteState.textContent = "RESIDUO / RECORDING";
    systemNote.textContent = notes[1];
  }

  function init() {
    resize();
    fillBase();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    window.addEventListener("blur", handlePointerLeave, { passive: true });

    window.addEventListener(
      "touchmove",
      (event) => {
        handleTouchMove(event);
      },
      { passive: true }
    );

    window.addEventListener(
      "touchend",
      () => {
        lastCapture = null;
      },
      { passive: true }
    );

    rafId = requestAnimationFrame(render);
  }

  init();

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(rafId);
  });
})();
