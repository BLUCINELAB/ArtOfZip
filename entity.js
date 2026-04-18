(() => {
  "use strict";

  const canvas = document.getElementById("residuoCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  const systemNote = document.getElementById("systemNote");
  const siteState = document.getElementById("siteState");
  const signalReadout = document.getElementById("signalReadout");
  const densityReadout = document.getElementById("densityReadout");
  const modeReadout = document.getElementById("modeReadout");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DPR_LIMIT = 2;
  const PALETTE = {
    bg: "#050505",
    bgLift: "rgba(255,255,255,0.018)",
    text: "236, 229, 219",
    trace: "214, 200, 184",
    violet: "118, 102, 180",
    cyan: "104, 168, 188",
    amber: "208, 146, 92"
  };

  const TYPE = {
    EXPLORER: 0,
    AGGREGATOR: 1,
    CONNECTOR: 2,
    COLLAPSER: 3
  };

  const TYPE_META = {
    [TYPE.EXPLORER]: {
      name: "explorer",
      color: PALETTE.text,
      baseSize: 1.2,
      maxSpeed: 1.8,
      drag: 0.983,
      flowWeight: 1.15,
      gradWeight: 0.65,
      cohesion: 0.012,
      separation: 0.085,
      noise: 0.34,
      residue: 0.005,
      heat: 0.003,
      linkable: false
    },
    [TYPE.AGGREGATOR]: {
      name: "aggregator",
      color: PALETTE.amber,
      baseSize: 1.8,
      maxSpeed: 1.2,
      drag: 0.978,
      flowWeight: 0.75,
      gradWeight: 1.1,
      cohesion: 0.038,
      separation: 0.078,
      noise: 0.18,
      residue: 0.012,
      heat: 0.008,
      linkable: true
    },
    [TYPE.CONNECTOR]: {
      name: "connector",
      color: PALETTE.cyan,
      baseSize: 1.5,
      maxSpeed: 1.45,
      drag: 0.98,
      flowWeight: 0.92,
      gradWeight: 0.82,
      cohesion: 0.014,
      separation: 0.072,
      noise: 0.16,
      residue: 0.009,
      heat: 0.004,
      linkable: true
    },
    [TYPE.COLLAPSER]: {
      name: "collapser",
      color: PALETTE.violet,
      baseSize: 3.4,
      maxSpeed: 0.72,
      drag: 0.988,
      flowWeight: 0.34,
      gradWeight: 1.25,
      cohesion: 0.006,
      separation: 0.12,
      noise: 0.08,
      residue: 0.02,
      heat: 0.014,
      linkable: false
    }
  };

  const CONFIG = {
    baseParticleCount: prefersReducedMotion ? 320 : 980,
    maxParticles: prefersReducedMotion ? 460 : 1450,
    fieldScale: prefersReducedMotion ? 34 : 24,
    bucketSize: 74,
    linkRadius: 108,
    linkPersistRadius: 86,
    pointerHeatRadius: 5,
    pointerWaveRadius: 6,
    pointerRepelRadius: 7,
    collapseRadius: 150,
    collapseCooldownMs: 6200,
    dormancyAfterMs: 10000,
    networkThreshold: 32,
    saturationThreshold: 0.165,
    maxStableLinksPerParticle: 3,
    dtClamp: 1.35,
    readoutInterval: 140
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let lastTs = performance.now();
  let simulationTime = 0;
  let frameCount = 0;

  let fieldCols = 0;
  let fieldRows = 0;
  let cellW = 0;
  let cellH = 0;

  let potential = new Float32Array(0);
  let potentialNext = new Float32Array(0);
  let temperature = new Float32Array(0);
  let temperatureNext = new Float32Array(0);
  let residue = new Float32Array(0);
  let residueNext = new Float32Array(0);
  let flowX = new Float32Array(0);
  let flowY = new Float32Array(0);
  let deadZone = new Float32Array(0);

  let particles = [];
  let links = [];
  const stableLinkMap = new Map();
  const spatialBuckets = new Map();
  const pairUsage = new Map();

  const memoryCanvas = document.createElement("canvas");
  const memoryCtx = memoryCanvas.getContext("2d", { alpha: true });

  const pointer = {
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    speed: 0,
    active: false,
    movedAt: performance.now(),
    stillSince: performance.now()
  };

  const state = {
    mode: "LISTENING",
    note: "Il campo trattiene. La risposta non coincide mai con il gesto.",
    lastEventAt: performance.now(),
    saturationSince: 0,
    collapseUntil: 0,
    dormant: false,
    lastReadoutAt: 0,
    averageResidue: 0,
    visibleLinks: 0,
    motionEnergy: 0
  };

  const notes = {
    listening: "Il sistema respira da solo. Il gesto entra solo come disturbo.",
    revealing: "Il campo si piega. Le entità non obbediscono: deviano.",
    network: "Una rete temporanea sta prendendo coerenza. Non è stabile.",
    saturated: "La memoria locale supera la soglia. Il sistema accelera.",
    collapse: "Un collassatore ha svuotato una regione. Il silenzio resta impresso.",
    dormant: "Fase di bassa attività. Il campo si raffredda ma non si spegne.",
    wake: "Il primo disturbo riapre il flusso. Le linee tornano dal fondo."
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function distSq(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    return dx * dx + dy * dy;
  }

  function hash2(x, y, t) {
    return Math.sin(x * 0.127 + y * 0.173 + t * 0.00007)
      + Math.cos(x * 0.093 - y * 0.117 - t * 0.00005)
      + Math.sin((x + y) * 0.061 + t * 0.00011);
  }

  function fieldIndex(ix, iy) {
    return iy * fieldCols + ix;
  }

  function isInside(ix, iy) {
    return ix >= 0 && iy >= 0 && ix < fieldCols && iy < fieldRows;
  }

  function wrapX(x) {
    if (x < 0) return x + width;
    if (x > width) return x - width;
    return x;
  }

  function wrapY(y) {
    if (y < 0) return y + height;
    if (y > height) return y - height;
    return y;
  }

  function resize() {
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, DPR_LIMIT));
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    memoryCanvas.width = Math.round(width * dpr);
    memoryCanvas.height = Math.round(height * dpr);
    memoryCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fieldCols = Math.max(40, Math.round(width / CONFIG.fieldScale));
    fieldRows = Math.max(28, Math.round(height / CONFIG.fieldScale));
    cellW = width / fieldCols;
    cellH = height / fieldRows;

    const size = fieldCols * fieldRows;
    potential = new Float32Array(size);
    potentialNext = new Float32Array(size);
    temperature = new Float32Array(size);
    temperatureNext = new Float32Array(size);
    residue = new Float32Array(size);
    residueNext = new Float32Array(size);
    flowX = new Float32Array(size);
    flowY = new Float32Array(size);
    deadZone = new Float32Array(size);

    seedField();
    if (!particles.length) {
      seedParticles();
    } else {
      particles.forEach((p) => {
        p.x = wrapX(p.x / Math.max(1, p.worldW || width) * width);
        p.y = wrapY(p.y / Math.max(1, p.worldH || height) * height);
        p.worldW = width;
        p.worldH = height;
      });
    }
  }

  function seedField() {
    const now = performance.now();
    for (let y = 0; y < fieldRows; y += 1) {
      for (let x = 0; x < fieldCols; x += 1) {
        const idx = fieldIndex(x, y);
        const n = hash2(x, y, now);
        potential[idx] = n * 0.12;
        temperature[idx] = 0.12 + Math.abs(n) * 0.08;
        residue[idx] = 0;
        flowX[idx] = 0;
        flowY[idx] = 0;
        deadZone[idx] = 0;
      }
    }
    memoryCtx.clearRect(0, 0, width, height);
  }

  function spawnParticle(type, x = rand(0, width), y = rand(0, height)) {
    const meta = TYPE_META[type];
    return {
      id: `${type}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      x,
      y,
      vx: rand(-0.4, 0.4),
      vy: rand(-0.4, 0.4),
      age: rand(0, 600),
      energy: type === TYPE.COLLAPSER ? rand(0.44, 0.58) : rand(0.5, 1),
      charge: 0,
      phase: rand(0, Math.PI * 2),
      size: meta.baseSize * rand(0.92, 1.18),
      intensity: rand(0.8, 1.15),
      linkCooldown: 0,
      neighborCount: 0,
      worldW: width,
      worldH: height
    };
  }

  function seedParticles() {
    particles = [];
    const total = CONFIG.baseParticleCount;
    const explorers = Math.round(total * 0.48);
    const aggregators = Math.round(total * 0.27);
    const connectors = Math.round(total * 0.25);

    for (let i = 0; i < explorers; i += 1) particles.push(spawnParticle(TYPE.EXPLORER));
    for (let i = 0; i < aggregators; i += 1) particles.push(spawnParticle(TYPE.AGGREGATOR));
    for (let i = 0; i < connectors; i += 1) particles.push(spawnParticle(TYPE.CONNECTOR));
  }

  function depositImpulse(cx, cy, radius, power, heat = 0, residueBoost = 0) {
    const minX = clamp(Math.floor(cx - radius), 0, fieldCols - 1);
    const maxX = clamp(Math.ceil(cx + radius), 0, fieldCols - 1);
    const minY = clamp(Math.floor(cy - radius), 0, fieldRows - 1);
    const maxY = clamp(Math.ceil(cy + radius), 0, fieldRows - 1);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        const dsq = dx * dx + dy * dy;
        if (dsq > radius * radius) continue;
        const idx = fieldIndex(x, y);
        const falloff = Math.exp(-dsq / Math.max(1, radius * radius * 0.55));
        potential[idx] += power * falloff;
        temperature[idx] += heat * falloff;
        residue[idx] += residueBoost * falloff;
      }
    }
  }

  function coolDeadZones(dt) {
    for (let i = 0; i < deadZone.length; i += 1) {
      deadZone[i] = Math.max(0, deadZone[i] - 0.008 * dt);
    }
  }

  function updatePointerField(dt, now) {
    if (!pointer.active) return;
    const cx = clamp(Math.floor(pointer.x / cellW), 0, fieldCols - 1);
    const cy = clamp(Math.floor(pointer.y / cellH), 0, fieldRows - 1);
    const speedNorm = clamp(pointer.speed / 42, 0, 1.25);

    depositImpulse(cx, cy, CONFIG.pointerHeatRadius, 0.035 * speedNorm, 0.055 + speedNorm * 0.02, 0.008);

    if (speedNorm > 0.08) {
      depositImpulse(cx, cy, CONFIG.pointerWaveRadius, 0.12 * speedNorm, 0.016, 0.006);
      state.lastEventAt = now;
      state.dormant = false;
    }

    const stillFor = now - pointer.stillSince;
    if (stillFor > 1700) {
      depositImpulse(cx, cy, CONFIG.pointerRepelRadius, -0.032, 0.008, 0.0015);
    }

    if (state.mode === "DORMANT" && speedNorm > 0.05) {
      state.mode = "REVEALING";
      state.note = notes.wake;
      state.lastEventAt = now;
      state.dormant = false;
    }
  }

  function updateField(dt, now) {
    coolDeadZones(dt);
    updatePointerField(dt, now);

    let residueSum = 0;

    for (let y = 0; y < fieldRows; y += 1) {
      const yUp = y === 0 ? fieldRows - 1 : y - 1;
      const yDn = y === fieldRows - 1 ? 0 : y + 1;

      for (let x = 0; x < fieldCols; x += 1) {
        const xLf = x === 0 ? fieldCols - 1 : x - 1;
        const xRt = x === fieldCols - 1 ? 0 : x + 1;
        const idx = fieldIndex(x, y);

        const idxL = fieldIndex(xLf, y);
        const idxR = fieldIndex(xRt, y);
        const idxU = fieldIndex(x, yUp);
        const idxD = fieldIndex(x, yDn);

        const pot = potential[idx];
        const temp = temperature[idx];
        const res = residue[idx];
        const dead = deadZone[idx];

        const lapPot = potential[idxL] + potential[idxR] + potential[idxU] + potential[idxD] - pot * 4;
        const lapTemp = temperature[idxL] + temperature[idxR] + temperature[idxU] + temperature[idxD] - temp * 4;
        const lapRes = residue[idxL] + residue[idxR] + residue[idxU] + residue[idxD] - res * 4;

        const n = hash2(x * 0.91, y * 0.87, now + simulationTime * 1000);
        const ambient = n * 0.015 + Math.sin(now * 0.00011 + x * 0.13 + y * 0.09) * 0.009;

        let nextRes = res + (lapRes * 0.016 + temp * 0.0018 - res * 0.0068) * dt;
        nextRes *= 0.9986;
        nextRes = clamp(nextRes - dead * 0.012, 0, 1.25);

        let nextTemp = temp + (lapTemp * 0.021 + Math.abs(pot) * 0.005 + nextRes * 0.004 - temp * 0.012) * dt;
        nextTemp = clamp(nextTemp + dead * 0.004, 0.02, 1.15);

        let nextPot = pot + (lapPot * 0.032 + (nextRes - 0.15) * 0.018 + ambient - pot * 0.011) * dt;
        nextPot = clamp(nextPot - dead * 0.014, -1.4, 1.4);

        residueNext[idx] = nextRes;
        temperatureNext[idx] = nextTemp;
        potentialNext[idx] = nextPot;
        residueSum += nextRes;
      }
    }

    [potential, potentialNext] = [potentialNext, potential];
    [temperature, temperatureNext] = [temperatureNext, temperature];
    [residue, residueNext] = [residueNext, residue];

    for (let y = 0; y < fieldRows; y += 1) {
      const yUp = y === 0 ? fieldRows - 1 : y - 1;
      const yDn = y === fieldRows - 1 ? 0 : y + 1;

      for (let x = 0; x < fieldCols; x += 1) {
        const xLf = x === 0 ? fieldCols - 1 : x - 1;
        const xRt = x === fieldCols - 1 ? 0 : x + 1;

        const idx = fieldIndex(x, y);
        const dx = (potential[fieldIndex(xRt, y)] - potential[fieldIndex(xLf, y)]) * 0.5;
        const dy = (potential[fieldIndex(x, yDn)] - potential[fieldIndex(x, yUp)]) * 0.5;
        const curlNoise = hash2(x * 1.13 + 4, y * 1.09 - 7, now + 1200);
        const drift = temperature[idx] * 0.12 + residue[idx] * 0.08;

        flowX[idx] = (-dy * 1.12 + curlNoise * 0.038 + Math.sin(now * 0.00008 + y * 0.22) * 0.012) * (1 - deadZone[idx]);
        flowY[idx] = (dx * 1.12 + curlNoise * 0.029 + Math.cos(now * 0.00009 + x * 0.24) * 0.012) * (1 - deadZone[idx]);

        flowX[idx] += drift * 0.002;
        flowY[idx] -= drift * 0.001;
      }
    }

    state.averageResidue = residueSum / residue.length;
  }

  function buildSpatialBuckets() {
    spatialBuckets.clear();
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const bx = Math.floor(p.x / CONFIG.bucketSize);
      const by = Math.floor(p.y / CONFIG.bucketSize);
      const key = `${bx}|${by}`;
      let bucket = spatialBuckets.get(key);
      if (!bucket) {
        bucket = [];
        spatialBuckets.set(key, bucket);
      }
      bucket.push(i);
      p.neighborCount = 0;
    }
  }

  function sampleField(px, py) {
    const gx = clamp(Math.floor(px / cellW), 0, fieldCols - 1);
    const gy = clamp(Math.floor(py / cellH), 0, fieldRows - 1);
    const idx = fieldIndex(gx, gy);
    return {
      ix: gx,
      iy: gy,
      idx,
      flowX: flowX[idx],
      flowY: flowY[idx],
      potential: potential[idx],
      temperature: temperature[idx],
      residue: residue[idx],
      dead: deadZone[idx]
    };
  }

  function registerStableLink(aId, bId, dt) {
    const key = aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`;
    const prev = stableLinkMap.get(key) || 0;
    const next = clamp(prev + dt * 0.045, 0, 1.35);
    stableLinkMap.set(key, next);
    return next;
  }

  function decayStableLinks(dt) {
    stableLinkMap.forEach((value, key) => {
      const next = value - dt * 0.009;
      if (next <= 0) {
        stableLinkMap.delete(key);
      } else {
        stableLinkMap.set(key, next);
      }
    });
  }

  function updateParticles(dt, now) {
    buildSpatialBuckets();
    pairUsage.clear();
    links = [];

    let motionEnergy = 0;
    let collapserCount = 0;

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const meta = TYPE_META[p.type];
      const sample = sampleField(p.x, p.y);

      const bx = Math.floor(p.x / CONFIG.bucketSize);
      const by = Math.floor(p.y / CONFIG.bucketSize);

      let sepX = 0;
      let sepY = 0;
      let cohX = 0;
      let cohY = 0;
      let clusterCount = 0;
      let highResidueNeighbors = 0;

      let bestA = null;
      let bestB = null;
      let bestDistA = Infinity;
      let bestDistB = Infinity;

      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          const bucket = spatialBuckets.get(`${bx + ox}|${by + oy}`);
          if (!bucket) continue;

          for (let b = 0; b < bucket.length; b += 1) {
            const j = bucket[b];
            if (j === i) continue;
            const q = particles[j];
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const dsq = dx * dx + dy * dy;
            if (dsq > 155 * 155) continue;

            const d = Math.sqrt(dsq) || 0.0001;
            p.neighborCount += 1;

            if (d < 26) {
              const force = (1 - d / 26) * meta.separation;
              sepX -= (dx / d) * force;
              sepY -= (dy / d) * force;
            }

            if (q.type === p.type || (p.type === TYPE.CONNECTOR && q.type !== TYPE.COLLAPSER)) {
              if (d < 82) {
                cohX += q.x;
                cohY += q.y;
                clusterCount += 1;
              }
            }

            if (q.type !== TYPE.COLLAPSER && d < CONFIG.linkRadius) {
              if (p.type === TYPE.CONNECTOR && q.type !== TYPE.CONNECTOR) {
                if (d < bestDistA) {
                  bestB = bestA;
                  bestDistB = bestDistA;
                  bestA = q;
                  bestDistA = d;
                } else if (d < bestDistB && (!bestA || q.id !== bestA.id)) {
                  bestB = q;
                  bestDistB = d;
                }
              }
            }

            if (q.type === TYPE.AGGREGATOR && d < 92) {
              highResidueNeighbors += 1;
            }
          }
        }
      }

      if (clusterCount > 0) {
        cohX = cohX / clusterCount - p.x;
        cohY = cohY / clusterCount - p.y;
      }

      const angleNoise = hash2(p.x * 0.022, p.y * 0.018, now + p.age * 11);
      const jitterX = Math.cos(p.phase + angleNoise) * meta.noise * 0.02;
      const jitterY = Math.sin(p.phase - angleNoise) * meta.noise * 0.02;

      const gradX = sample.potential * 0.032 + sample.residue * 0.028 - sample.dead * 0.08;
      const gradY = sample.temperature * 0.026 - sample.dead * 0.06;

      p.vx += sample.flowX * meta.flowWeight * dt;
      p.vy += sample.flowY * meta.flowWeight * dt;
      p.vx += cohX * meta.cohesion * 0.0016 * dt + sepX * dt + jitterX * dt;
      p.vy += cohY * meta.cohesion * 0.0016 * dt + sepY * dt + jitterY * dt;
      p.vx += gradX * meta.gradWeight * dt;
      p.vy += gradY * meta.gradWeight * dt;

      if (p.type === TYPE.CONNECTOR && bestA && bestB) {
        const midX = (bestA.x + bestB.x) * 0.5;
        const midY = (bestA.y + bestB.y) * 0.5;
        p.vx += (midX - p.x) * 0.00078 * dt;
        p.vy += (midY - p.y) * 0.00078 * dt;

        const localKey = p.id;
        const used = pairUsage.get(localKey) || 0;
        if (used < CONFIG.maxStableLinksPerParticle) {
          const stability = registerStableLink(bestA.id, bestB.id, dt);
          const opacity = clamp(0.08 + stability * 0.44 + p.energy * 0.12, 0.08, 0.72);
          links.push({
            ax: bestA.x,
            ay: bestA.y,
            bx: bestB.x,
            by: bestB.y,
            opacity,
            stable: stability,
            pulse: p.phase,
            hue: PALETTE.cyan
          });
          pairUsage.set(localKey, used + 1);
        }
      }

      if (p.type === TYPE.AGGREGATOR && highResidueNeighbors > 3) {
        p.energy = clamp(p.energy + 0.0045 * dt, 0, 1.4);
      }

      if (p.type === TYPE.COLLAPSER) {
        collapserCount += 1;
        p.charge += (sample.residue * 0.016 + p.neighborCount * 0.0012) * dt;
        p.vx *= 0.995;
        p.vy *= 0.995;
        if (p.charge > 1.22 && now > state.collapseUntil) {
          triggerCollapse(p.x, p.y, now);
          p.charge = 0.18;
        }
      }

      const speed = Math.hypot(p.vx, p.vy);
      const maxSpeed = meta.maxSpeed * (1 + sample.temperature * 0.06 + (state.mode === "SATURATED" ? 0.18 : 0));
      if (speed > maxSpeed) {
        const s = maxSpeed / speed;
        p.vx *= s;
        p.vy *= s;
      }

      p.vx *= meta.drag;
      p.vy *= meta.drag;
      p.x = wrapX(p.x + p.vx * dt * 1.15);
      p.y = wrapY(p.y + p.vy * dt * 1.15);
      p.age += dt;
      p.phase += 0.02 + speed * 0.012;

      const energyDelta = (sample.potential * 0.008 + sample.residue * 0.014 + sample.temperature * 0.003 - 0.0054 - sample.dead * 0.014) * dt;
      p.energy = clamp(p.energy + energyDelta, 0.03, p.type === TYPE.COLLAPSER ? 1.8 : 1.25);

      if (p.type !== TYPE.COLLAPSER && p.energy < 0.08) {
        p.vx *= 0.94;
        p.vy *= 0.94;
      }

      residue[sample.idx] = clamp(residue[sample.idx] + meta.residue * p.intensity * dt, 0, 1.25);
      temperature[sample.idx] = clamp(temperature[sample.idx] + meta.heat * 0.2 * dt, 0.02, 1.2);
      potential[sample.idx] = clamp(potential[sample.idx] + (p.type === TYPE.AGGREGATOR ? 0.0022 : 0.0008) * dt, -1.4, 1.4);

      motionEnergy += speed * p.energy;
    }

    state.motionEnergy = motionEnergy / Math.max(1, particles.length);
    state.visibleLinks = links.length;

    maybeSpawnCollapser(collapserCount, now);
    decayStableLinks(dt);
    rebalancePopulation(now);
  }

  function maybeSpawnCollapser(collapserCount, now) {
    if (collapserCount >= 2) return;
    if (particles.length >= CONFIG.maxParticles) return;
    if (state.averageResidue < 0.21) return;
    if (now < state.collapseUntil - 1800) return;
    if (Math.random() > 0.006) return;

    let bestIdx = 0;
    let bestValue = 0;
    for (let i = 0; i < residue.length; i += 1) {
      const score = residue[i] + temperature[i] * 0.2 - deadZone[i] * 0.5;
      if (score > bestValue) {
        bestValue = score;
        bestIdx = i;
      }
    }

    const x = (bestIdx % fieldCols + 0.5) * cellW;
    const y = (Math.floor(bestIdx / fieldCols) + 0.5) * cellH;
    particles.push(spawnParticle(TYPE.COLLAPSER, x, y));
    state.lastEventAt = now;
  }

  function rebalancePopulation(now) {
    if (particles.length < CONFIG.baseParticleCount * 0.9 && Math.random() < 0.08) {
      spawnFromMemory(2);
    }

    particles = particles.filter((p) => {
      if (p.type === TYPE.COLLAPSER) return true;
      if (p.energy <= 0.03 && p.age > 120) return false;
      if (p.age > 2800 && p.energy < 0.1) return false;
      return true;
    });

    if (state.averageResidue > 0.24 && particles.length < CONFIG.maxParticles && Math.random() < 0.035) {
      spawnFromMemory(1);
    }

    if (particles.length < CONFIG.baseParticleCount) {
      while (particles.length < CONFIG.baseParticleCount) {
        particles.push(spawnParticle(Math.random() < 0.55 ? TYPE.EXPLORER : TYPE.CONNECTOR));
      }
    }

    if (state.averageResidue < 0.08 && state.motionEnergy < 0.58 && now - state.lastEventAt > 9000 && Math.random() < 0.045) {
      spawnFromMemory(3);
      state.lastEventAt = now;
    }
  }

  function spawnFromMemory(count) {
    const hotspots = [];
    for (let i = 0; i < residue.length; i += 1) {
      if (deadZone[i] > 0.2) continue;
      hotspots.push({ idx: i, value: residue[i] + temperature[i] * 0.12 });
    }
    hotspots.sort((a, b) => b.value - a.value);
    const picks = hotspots.slice(0, Math.max(count * 5, 12));

    for (let i = 0; i < count; i += 1) {
      const source = picks[Math.floor(Math.random() * picks.length)] || { idx: 0 };
      const x = ((source.idx % fieldCols) + Math.random()) * cellW;
      const y = (Math.floor(source.idx / fieldCols) + Math.random()) * cellH;
      const typeRoll = Math.random();
      const type = typeRoll < 0.48 ? TYPE.EXPLORER : typeRoll < 0.76 ? TYPE.AGGREGATOR : TYPE.CONNECTOR;
      particles.push(spawnParticle(type, x, y));
    }
  }

  function triggerCollapse(x, y, now) {
    const radius = CONFIG.collapseRadius;
    const radiusSq = radius * radius;

    particles.forEach((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      const dsq = dx * dx + dy * dy;
      if (dsq > radiusSq) return;
      const d = Math.sqrt(dsq) || 0.0001;
      const falloff = 1 - d / radius;
      p.vx += (dx / d) * falloff * 7.2;
      p.vy += (dy / d) * falloff * 7.2;
      if (p.type !== TYPE.COLLAPSER) {
        p.energy *= 0.62;
      }
    });

    const cx = clamp(Math.floor(x / cellW), 0, fieldCols - 1);
    const cy = clamp(Math.floor(y / cellH), 0, fieldRows - 1);
    const gridRadius = Math.max(3, Math.round(radius / Math.max(cellW, cellH)));

    for (let gy = cy - gridRadius; gy <= cy + gridRadius; gy += 1) {
      for (let gx = cx - gridRadius; gx <= cx + gridRadius; gx += 1) {
        if (!isInside(gx, gy)) continue;
        const idx = fieldIndex(gx, gy);
        const dx = gx - cx;
        const dy = gy - cy;
        const dsq = dx * dx + dy * dy;
        if (dsq > gridRadius * gridRadius) continue;
        const falloff = 1 - Math.sqrt(dsq) / gridRadius;
        potential[idx] *= 0.16;
        temperature[idx] *= 0.34;
        residue[idx] *= 0.08;
        deadZone[idx] = clamp(deadZone[idx] + falloff * 0.92, 0, 1);
      }
    }

    memoryCtx.save();
    memoryCtx.globalCompositeOperation = "destination-out";
    const gradient = memoryCtx.createRadialGradient(x, y, 0, x, y, radius * 1.1);
    gradient.addColorStop(0, "rgba(0,0,0,0.96)");
    gradient.addColorStop(0.7, "rgba(0,0,0,0.48)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    memoryCtx.fillStyle = gradient;
    memoryCtx.beginPath();
    memoryCtx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
    memoryCtx.fill();
    memoryCtx.restore();

    state.mode = "COLLAPSING";
    state.note = notes.collapse;
    state.lastEventAt = now;
    state.collapseUntil = now + CONFIG.collapseCooldownMs;
  }

  function updateSystemState(now) {
    const idleFor = now - state.lastEventAt;

    if (state.averageResidue > CONFIG.saturationThreshold) {
      state.saturationSince = state.saturationSince || now;
    } else {
      state.saturationSince = 0;
    }

    if (now < state.collapseUntil) {
      state.mode = "COLLAPSING";
      state.note = notes.collapse;
      return;
    }

    if (state.saturationSince && now - state.saturationSince > 3600) {
      state.mode = "SATURATED";
      state.note = notes.saturated;
      state.lastEventAt = now;
      return;
    }

    if (state.visibleLinks > CONFIG.networkThreshold) {
      state.mode = "NETWORK";
      state.note = notes.network;
      return;
    }

    if (idleFor > CONFIG.dormancyAfterMs && state.motionEnergy < 0.6) {
      state.mode = "DORMANT";
      state.note = notes.dormant;
      state.dormant = true;
      return;
    }

    if (pointer.active || state.averageResidue > 0.05) {
      state.mode = "REVEALING";
      state.note = notes.revealing;
      return;
    }

    state.mode = "LISTENING";
    state.note = notes.listening;
  }

  function drawMemoryFade() {
    memoryCtx.save();
    memoryCtx.globalCompositeOperation = "source-over";
    memoryCtx.fillStyle = state.mode === "SATURATED"
      ? "rgba(5, 5, 5, 0.032)"
      : "rgba(5, 5, 5, 0.052)";
    memoryCtx.fillRect(0, 0, width, height);
    memoryCtx.restore();
  }

  function drawParticlesToMemory() {
    drawMemoryFade();

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const meta = TYPE_META[p.type];
      const alpha = p.type === TYPE.COLLAPSER ? 0.05 : meta.residue * 2.2;
      const radius = p.type === TYPE.COLLAPSER ? 20 : p.size * (p.type === TYPE.AGGREGATOR ? 4.6 : 3.2);

      const gradient = memoryCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      gradient.addColorStop(0, `rgba(${meta.color}, ${alpha})`);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      memoryCtx.fillStyle = gradient;
      memoryCtx.beginPath();
      memoryCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      memoryCtx.fill();
    }
  }

  function drawBackground(now) {
    ctx.clearRect(0, 0, width, height);

    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, "#070606");
    base.addColorStop(0.45, "#050505");
    base.addColorStop(1, "#080707");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.48, height * 0.44, 0, width * 0.48, height * 0.44, Math.max(width, height) * 0.65);
    glow.addColorStop(0, state.mode === "SATURATED"
      ? "rgba(116, 104, 178, 0.11)"
      : "rgba(214, 200, 184, 0.05)");
    glow.addColorStop(0.55, "rgba(102, 166, 186, 0.035)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = state.mode === "DORMANT" ? 0.42 : 0.68;
    ctx.drawImage(memoryCanvas, 0, 0, width, height);
    ctx.restore();

    if (state.mode === "SATURATED") {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(${PALETTE.violet}, ${0.03 + Math.sin(now * 0.006) * 0.01})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  function drawLinks(now) {
    if (!links.length) return;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (let i = 0; i < links.length; i += 1) {
      const link = links[i];
      const pulse = 0.78 + Math.sin(now * 0.003 + link.pulse) * 0.22;
      const lineAlpha = link.opacity * pulse;
      ctx.strokeStyle = `rgba(${link.hue}, ${lineAlpha})`;
      ctx.lineWidth = 0.5 + link.stable * 1.6;
      ctx.beginPath();
      ctx.moveTo(link.ax, link.ay);
      ctx.lineTo(link.bx, link.by);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawParticles(now) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const meta = TYPE_META[p.type];
      const speed = Math.hypot(p.vx, p.vy);
      const stretch = 1 + clamp(speed / 2.4, 0, 1.8);
      const alpha = clamp(0.16 + p.energy * 0.42 + (p.type === TYPE.COLLAPSER ? 0.18 : 0), 0.12, 0.86);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.vy, p.vx) || 0);
      ctx.fillStyle = `rgba(${meta.color}, ${alpha})`;
      ctx.shadowBlur = p.type === TYPE.COLLAPSER ? 28 : 14;
      ctx.shadowColor = `rgba(${meta.color}, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * stretch, p.size * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPointerWake() {
    if (!pointer.active) return;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const radius = 20 + clamp(pointer.speed * 0.9, 0, 42);
    const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
    gradient.addColorStop(0, "rgba(236, 229, 219, 0.06)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawFieldVeil(now) {
    ctx.save();
    ctx.globalAlpha = state.mode === "DORMANT" ? 0.08 : 0.12;
    const stripe = ctx.createLinearGradient(0, 0, width, 0);
    stripe.addColorStop(0, `rgba(${PALETTE.violet}, 0)`);
    stripe.addColorStop(0.5, `rgba(${PALETTE.trace}, ${0.04 + Math.sin(now * 0.0014) * 0.015})`);
    stripe.addColorStop(1, `rgba(${PALETTE.cyan}, 0)`);
    ctx.fillStyle = stripe;
    ctx.fillRect(0, height * 0.18, width, 1);
    ctx.restore();
  }

  function render(now) {
    drawParticlesToMemory();
    drawBackground(now);
    drawLinks(now);
    drawParticles(now);
    drawPointerWake();
    drawFieldVeil(now);
  }

  function updateReadout(now) {
    if (now - state.lastReadoutAt < CONFIG.readoutInterval) return;
    state.lastReadoutAt = now;

    if (siteState) siteState.textContent = `RESIDUO / ${state.mode}`;
    if (systemNote) systemNote.textContent = state.note;
    if (signalReadout) signalReadout.textContent = (state.averageResidue * 100).toFixed(1);
    if (densityReadout) densityReadout.textContent = String(particles.length).padStart(4, "0");
    if (modeReadout) modeReadout.textContent = state.visibleLinks.toString().padStart(2, "0");
  }

  function frame(ts) {
    const dt = clamp((ts - lastTs) / 16.6667, 0.4, CONFIG.dtClamp);
    lastTs = ts;
    simulationTime += dt;
    frameCount += 1;

    updateField(dt, ts);
    updateParticles(dt, ts);
    updateSystemState(ts);
    render(ts);
    updateReadout(ts);

    rafId = requestAnimationFrame(frame);
  }

  function onPointerMove(clientX, clientY) {
    const now = performance.now();
    const x = clientX;
    const y = clientY;
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    const speed = Math.hypot(dx, dy);

    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = x;
    pointer.y = y;
    pointer.speed = speed;
    pointer.active = true;
    pointer.movedAt = now;

    if (speed > 0.35) {
      pointer.stillSince = now;
    }
  }

  function onPointerLeave() {
    pointer.active = false;
    pointer.speed = 0;
  }

  function init() {
    resize();
    lastTs = performance.now();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (!e.touches || !e.touches.length) return;
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener("mouseleave", onPointerLeave, { passive: true });
    window.addEventListener("blur", onPointerLeave, { passive: true });
    window.addEventListener("touchend", onPointerLeave, { passive: true });

    rafId = requestAnimationFrame(frame);
  }

  init();
  window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
})();
