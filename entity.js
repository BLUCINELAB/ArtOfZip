(() => {
  "use strict";

  const canvas = document.getElementById("residuoCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  const systemNote = document.getElementById("systemNote");
  const siteState = document.getElementById("siteState");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CONFIG = {
    delayMin: 2100,
    delayMax: 4200,
    lifetimeMin: 7600,
    lifetimeMax: 11800,
    cleanupMargin: 1400,
    minDistance: 9,
    touchMinDistance: 14,
    maxGapMs: 92,
    maxSpatialGap: 68,
    backgroundFadeAlpha: prefersReducedMotion ? 0.05 : 0.02,
    traceBaseOpacity: 0.34,
    traceWidthMin: 0.7,
    traceWidthMax: 1.55,
    pulseInterval: 9000,
    maxPoints: 5200,
    collapseThreshold: 190,
    collapseDuration: 5200,
    depthParallax: prefersReducedMotion ? 0.35 : 1.6,
    driftAmplitude: prefersReducedMotion ? 0.45 : 2.6,
    echoChance: prefersReducedMotion ? 0.04 : 0.11,
    echoOffset: 10,
    echoOpacity: 0.12,
    motionWindowMs: 180,
    motionDecay: 0.93,
    idleCalmMs: 13000,
    cleanupBatchMax: 140
  };

  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let width = 0;
  let height = 0;
  let rafId = 0;
  let lastNow = performance.now();

  const points = [];
  let lastCapture = null;
  let lastPointer = null;
  let pointerInfluence = { x: 0, y: 0 };
  let hasInteracted = false;
  let idleSince = performance.now();
  let motionEnergy = 0;
  let visibleCount = 0;

  const activity = [];
  const collapseState = {
    active: false,
    start: 0
  };

  const notes = [
    "Il sistema non risponde subito. Trattiene.",
    "Ogni gesto entra in latenza prima di tornare.",
    "La memoria qui non è statica. Deriva lentamente.",
    "Le tracce non sono feedback. Sono residui in migrazione.",
    "Quando la memoria eccede, il campo perde orientamento."
  ];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function fract(v) {
    return v - Math.floor(v);
  }

  function hash2(x, y) {
    return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
  }

  function noise2D(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;

    const a = hash2(xi, yi);
    const b = hash2(xi + 1, yi);
    const c = hash2(xi, yi + 1);
    const d = hash2(xi + 1, yi + 1);

    const ux = xf * xf * (3 - 2 * xf);
    const uy = yf * yf * (3 - 2 * yf);

    return lerp(
      lerp(a, b, ux),
      lerp(c, d, ux),
      uy
    );
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function getAdaptiveDelay() {
    const intensity = clamp(motionEnergy, 0, 1);
    return lerp(CONFIG.delayMax, CONFIG.delayMin, intensity);
  }

  function getAdaptiveLifetime(depth) {
    const depthBias = lerp(0.88, 1.16, depth);
    const activityBias = lerp(0.92, 1.08, clamp(motionEnergy, 0, 1));
    return lerp(CONFIG.lifetimeMin, CONFIG.lifetimeMax, depth) * depthBias * activityBias;
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

  function registerMotion(now, speed) {
    activity.push({ t: now, v: speed });
    while (activity.length && now - activity[0].t > CONFIG.motionWindowMs) {
      activity.shift();
    }

    let sum = 0;
    for (let i = 0; i < activity.length; i++) {
      sum += activity[i].v;
    }

    const avg = activity.length ? sum / activity.length : 0;
    motionEnergy = clamp(avg / 38, 0, 1);
  }

  function capture(x, y, isTouch = false) {
    const now = performance.now();
    idleSince = now;
    hasInteracted = true;

    const pointRef = { x, y };
    if (lastCapture) {
      const minDist = isTouch ? CONFIG.touchMinDistance : CONFIG.minDistance;
      const dist = distance(pointRef, lastCapture);
      if (dist < minDist) return;

      const dt = Math.max(16, now - lastCapture.t);
      registerMotion(now, dist / (dt / 16.6667));
    } else {
      registerMotion(now, 0);
    }

    lastPointer = { x, y, t: now };

    const depth = Math.random();
    const revealAt = now + getAdaptiveDelay() * lerp(0.84, 1.18, 1 - depth);
    const point = {
      x,
      y,
      t: now,
      revealAt,
      lifetime: getAdaptiveLifetime(depth),
      depth,
      seed: Math.random() * 1000,
      driftPhase: Math.random() * Math.PI * 2,
      velocityX: (Math.random() - 0.5) * 0.16,
      velocityY: (Math.random() - 0.5) * 0.16,
      echo: Math.random() < CONFIG.echoChance,
      echoPhase: Math.random() * Math.PI * 2,
      localBend: (Math.random() - 0.5) * 0.35
    };

    points.push(point);
    lastCapture = pointRef;
    lastCapture.t = now;

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
    lastPointer = null;
  }

  function getSegmentOpacity(p1, p2, now) {
    const age1 = now - p1.revealAt;
    const age2 = now - p2.revealAt;

    if (age1 < 0 || age2 < 0) return 0;

    const fade1 = 1 - age1 / p1.lifetime;
    const fade2 = 1 - age2 / p2.lifetime;

    const depthMix = lerp(0.84, 1.18, (p1.depth + p2.depth) * 0.5);
    const opacity = ((fade1 + fade2) * 0.5) * CONFIG.traceBaseOpacity * depthMix;
    return clamp(opacity, 0, CONFIG.traceBaseOpacity * 1.3);
  }

  function getPointState(point, now, collapseProgress) {
    const age = now - point.revealAt;
    if (age < 0 || age > point.lifetime) return null;

    const lifeT = clamp(age / point.lifetime, 0, 1);
    const fade = 1 - lifeT;
    const driftLife = easeOutQuart(1 - lifeT);

    const time = now * 0.00026;
    const fieldScaleA = 0.0038 + point.depth * 0.0024;
    const fieldScaleB = 0.0064 + point.depth * 0.0012;

    const n1 = noise2D(
      point.x * fieldScaleA + point.seed + time,
      point.y * fieldScaleA + point.seed * 0.7
    );
    const n2 = noise2D(
      point.x * fieldScaleB + point.seed * 1.4,
      point.y * fieldScaleB + point.seed + time * 0.8
    );

    const angle = (n1 * Math.PI * 2) + point.driftPhase;
    const driftAmp = CONFIG.driftAmplitude * lerp(0.35, 1, point.depth) * driftLife;
    const organicX = Math.cos(angle) * driftAmp + (n2 - 0.5) * driftAmp * 1.4;
    const organicY = Math.sin(angle) * driftAmp + (n1 - 0.5) * driftAmp * 1.4;

    let px = point.x + organicX + point.velocityX * age * 0.015;
    let py = point.y + organicY + point.velocityY * age * 0.015;

    const parallaxStrength = CONFIG.depthParallax * lerp(0.2, 1, point.depth);
    px += pointerInfluence.x * parallaxStrength;
    py += pointerInfluence.y * parallaxStrength;

    if (collapseState.active) {
      const cx = width * 0.5;
      const cy = height * 0.5;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy) || 1;

      const radialPull = easeInOutCubic(collapseProgress) * lerp(0.12, 0.34, point.depth);
      const swirl = (noise2D(point.seed * 2.1, collapseProgress * 4 + point.depth * 8) - 0.5) * 1.9;
      const tangentX = -dy / dist;
      const tangentY = dx / dist;
      const warp = easeInOutCubic(collapseProgress) * 24 * (0.2 + point.depth * 0.8);
      const uneven = smoothstep(0.12, 1, collapseProgress) * (0.5 + hash2(point.seed, point.depth) * 0.8);

      px = lerp(px, cx, radialPull * uneven) + tangentX * swirl * warp;
      py = lerp(py, cy, radialPull * uneven) + tangentY * swirl * warp;

      const crunch = smoothstep(0.45, 1, collapseProgress) * 8;
      px += (noise2D(point.seed * 3.2, time * 3.2) - 0.5) * crunch;
      py += (noise2D(time * 3.8, point.seed * 1.7) - 0.5) * crunch;
    }

    return {
      x: px,
      y: py,
      fade,
      lifeT
    };
  }

  function drawAmbientPulse(now, collapseProgress) {
    const idleTime = now - idleSince;
    const pulse = Math.sin(now / CONFIG.pulseInterval * Math.PI * 2) * 0.5 + 0.5;
    const activeBias = hasInteracted
      ? Math.min(0.026, 0.007 + pulse * 0.007 + Math.min(idleTime / CONFIG.idleCalmMs, 1) * 0.01)
      : 0.018;

    const collapseDim = collapseState.active
      ? lerp(1, 0.52, easeInOutCubic(collapseProgress))
      : 1;

    const alpha = activeBias * collapseDim;
    const radius = Math.max(width, height) * lerp(0.36, 0.46, pulse);

    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      0,
      width * 0.5,
      height * 0.48,
      radius
    );

    grad.addColorStop(0, `rgba(215, 201, 182, ${alpha})`);
    grad.addColorStop(0.48, `rgba(215, 201, 182, ${alpha * 0.2})`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function drawSegments(now, collapseProgress) {
    let currentVisible = 0;
    const baseR = 208;
    const baseG = 194;
    const baseB = 176;
    const warmR = 216;
    const warmG = 186;
    const warmB = 166;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      if (curr.t - prev.t > CONFIG.maxGapMs) continue;

      const prevState = getPointState(prev, now, collapseProgress);
      const currState = getPointState(curr, now, collapseProgress);

      if (!prevState || !currState) continue;

      currentVisible++;

      const spatialGap = Math.hypot(currState.x - prevState.x, currState.y - prevState.y);
      if (spatialGap > CONFIG.maxSpatialGap) continue;

      let opacity = getSegmentOpacity(prev, curr, now);
      if (opacity <= 0) continue;

      const depthMix = (prev.depth + curr.depth) * 0.5;
      const layerOpacity = lerp(0.72, 1.18, depthMix);
      opacity *= layerOpacity;

      if (collapseState.active) {
        const vanishCurve = 1 - smoothstep(0.34, 1, collapseProgress);
        const localFrag = 0.6 + hash2(prev.seed, curr.seed) * 0.8;
        opacity *= vanishCurve * localFrag;
        if (opacity <= 0.002) continue;
      }

      const warmT = collapseState.active ? smoothstep(0.08, 0.9, collapseProgress) : 0;
      const r = Math.round(lerp(baseR, warmR, warmT));
      const g = Math.round(lerp(baseG, warmG, warmT));
      const b = Math.round(lerp(baseB, warmB, warmT));

      ctx.beginPath();
      ctx.moveTo(prevState.x, prevState.y);

      const midX = (prevState.x + currState.x) * 0.5 + (curr.localBend * 4);
      const midY = (prevState.y + currState.y) * 0.5 - (prev.localBend * 4);
      ctx.quadraticCurveTo(midX, midY, currState.x, currState.y);

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.lineWidth = lerp(CONFIG.traceWidthMin, CONFIG.traceWidthMax, depthMix);
      ctx.stroke();

      const shouldEcho =
        (prev.echo || curr.echo) &&
        !collapseState.active &&
        (prevState.lifeT > 0.24 || currState.lifeT > 0.24);

      if (shouldEcho) {
        const echoLife = Math.max(prevState.fade, currState.fade);
        const echoOffsetX = Math.cos(now * 0.001 + prev.echoPhase) * CONFIG.echoOffset * 0.35;
        const echoOffsetY = Math.sin(now * 0.0012 + curr.echoPhase) * CONFIG.echoOffset * 0.35;

        ctx.beginPath();
        ctx.moveTo(prevState.x + echoOffsetX, prevState.y + echoOffsetY);
        ctx.quadraticCurveTo(
          midX + echoOffsetX * 1.2,
          midY + echoOffsetY * 1.2,
          currState.x + echoOffsetX,
          currState.y + echoOffsetY
        );
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${CONFIG.echoOpacity * echoLife})`;
        ctx.lineWidth = Math.max(0.45, lerp(CONFIG.traceWidthMin, CONFIG.traceWidthMax, depthMix) * 0.72);
        ctx.stroke();
      }
    }

    visibleCount = currentVisible;
  }

  function cleanup(now) {
    const cutoff = now - (CONFIG.delayMax + CONFIG.lifetimeMax + CONFIG.cleanupMargin);
    let removeCount = 0;

    while (
      removeCount < points.length &&
      points[removeCount].t < cutoff &&
      removeCount < CONFIG.cleanupBatchMax
    ) {
      removeCount++;
    }

    if (removeCount > 0) {
      points.splice(0, removeCount);
    }
  }

  function updateText(now) {
    if (!systemNote || !siteState) return;

    const idleTime = now - idleSince;

    if (collapseState.active) {
      siteState.textContent = "RESIDUO / COLLAPSING";
      systemNote.textContent = "La memoria si torce su se stessa. Il campo perde orientamento.";
      return;
    }

    if (!hasInteracted) {
      siteState.textContent = "RESIDUO / LISTENING";
      systemNote.textContent = notes[0];
      return;
    }

    if (idleTime > 9000 && visibleCount === 0) {
      siteState.textContent = "RESIDUO / DORMANT";
      systemNote.textContent = "Dopo il collasso resta una calma imperfetta.";
      return;
    }

    if (visibleCount > 150) {
      siteState.textContent = "RESIDUO / SATURATED";
      systemNote.textContent = notes[4];
      return;
    }

    if (visibleCount > 0) {
      siteState.textContent = motionEnergy > 0.56
        ? "RESIDUO / AGITATED"
        : "RESIDUO / REVEALING";
      systemNote.textContent = notes[(Math.floor(now / 5600)) % notes.length];
      return;
    }

    siteState.textContent = "RESIDUO / RECORDING";
    systemNote.textContent = notes[1];
  }

  function render(now) {
    const dt = Math.min(32, now - lastNow);
    lastNow = now;

    motionEnergy *= Math.pow(CONFIG.motionDecay, dt / 16.6667);

    if (lastPointer) {
      const nx = (lastPointer.x - width * 0.5) / Math.max(width, 1);
      const ny = (lastPointer.y - height * 0.5) / Math.max(height, 1);
      pointerInfluence.x = lerp(pointerInfluence.x, nx * 8, 0.06);
      pointerInfluence.y = lerp(pointerInfluence.y, ny * 8, 0.06);
    } else {
      pointerInfluence.x = lerp(pointerInfluence.x, 0, 0.05);
      pointerInfluence.y = lerp(pointerInfluence.y, 0, 0.05);
    }

    if (!collapseState.active && visibleCount > CONFIG.collapseThreshold) {
      collapseState.active = true;
      collapseState.start = now;
    }

    let collapseProgress = 0;
    if (collapseState.active) {
      collapseProgress = clamp((now - collapseState.start) / CONFIG.collapseDuration, 0, 1);
    }

    ctx.fillStyle = `rgba(8, 8, 8, ${CONFIG.backgroundFadeAlpha})`;
    ctx.fillRect(0, 0, width, height);

    drawAmbientPulse(now, collapseProgress);
    drawSegments(now, collapseProgress);

    if (collapseState.active && collapseProgress >= 1) {
      points.length = 0;
      lastCapture = null;
      collapseState.active = false;
      visibleCount = 0;
    }

    if (!collapseState.active) {
      cleanup(now);
    }

    updateText(now);
    rafId = requestAnimationFrame(render);
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
        lastPointer = null;
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
