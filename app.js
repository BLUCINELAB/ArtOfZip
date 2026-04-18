(() => {
  "use strict";

  // ---------- NEBULA CORE · organismo narrativo ----------
  const canvas = document.getElementById("nebulaCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const systemNote = document.getElementById("systemNote");
  const sitePhase = document.getElementById("sitePhase");
  const phaseFootnote = document.getElementById("phaseFootnote");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- CONFIGURAZIONE ----------
  const DPR_LIMIT = 2;
  const PALETTE = {
    bg: "#050507",
    text: "240, 235, 225",
    trace: "210, 195, 180",
    electric: "130, 160, 220",
    ember: "210, 140, 80",
    violet: "140, 120, 200"
  };

  const TYPE = {
    EXPLORER: 0,
    AGGREGATOR: 1,
    CONNECTOR: 2,
    COLLAPSER: 3
  };

  const TYPE_META = {
    [TYPE.EXPLORER]: {
      name: "explorer", color: PALETTE.text, baseSize: 1.2, maxSpeed: 1.8, drag: 0.983,
      flowWeight: 1.15, gradWeight: 0.65, cohesion: 0.012, separation: 0.085, noise: 0.34,
      residue: 0.005, heat: 0.003, linkable: false
    },
    [TYPE.AGGREGATOR]: {
      name: "aggregator", color: PALETTE.ember, baseSize: 1.8, maxSpeed: 1.2, drag: 0.978,
      flowWeight: 0.75, gradWeight: 1.1, cohesion: 0.038, separation: 0.078, noise: 0.18,
      residue: 0.012, heat: 0.008, linkable: true
    },
    [TYPE.CONNECTOR]: {
      name: "connector", color: PALETTE.electric, baseSize: 1.5, maxSpeed: 1.45, drag: 0.98,
      flowWeight: 0.92, gradWeight: 0.82, cohesion: 0.014, separation: 0.072, noise: 0.16,
      residue: 0.009, heat: 0.004, linkable: true
    },
    [TYPE.COLLAPSER]: {
      name: "collapser", color: PALETTE.violet, baseSize: 3.4, maxSpeed: 0.72, drag: 0.988,
      flowWeight: 0.34, gradWeight: 1.25, cohesion: 0.006, separation: 0.12, noise: 0.08,
      residue: 0.02, heat: 0.014, linkable: false
    }
  };

  const CONFIG = {
    baseParticleCount: prefersReducedMotion ? 320 : 980,
    maxParticles: prefersReducedMotion ? 460 : 1450,
    fieldScale: prefersReducedMotion ? 34 : 24,
    bucketSize: 74,
    linkRadius: 108,
    collapseRadius: 150,
    collapseCooldownMs: 6200,
    dormancyAfterMs: 10000,
    networkThreshold: 32,
    saturationThreshold: 0.165,
    maxStableLinksPerParticle: 3,
    dtClamp: 1.35
  };

  // ---------- STATO GLOBALE ----------
  let width = 0, height = 0, dpr = 1;
  let rafId = 0, lastTs = performance.now(), simulationTime = 0;

  let fieldCols = 0, fieldRows = 0, cellW = 0, cellH = 0;
  let potential, potentialNext, temperature, temperatureNext, residue, residueNext, flowX, flowY, deadZone;

  let particles = [];
  let links = [];
  const stableLinkMap = new Map();
  const spatialBuckets = new Map();
  const pairUsage = new Map();

  const memoryCanvas = document.createElement("canvas");
  const memoryCtx = memoryCanvas.getContext("2d", { alpha: true });

  const pointer = {
    x: 0, y: 0, px: 0, py: 0, speed: 0,
    active: false, movedAt: performance.now(), stillSince: performance.now()
  };

  const state = {
    mode: "LISTENING",
    note: "Il campo trattiene. La risposta non coincide mai con il gesto.",
    lastEventAt: performance.now(),
    saturationSince: 0,
    collapseUntil: 0,
    dormant: false,
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

  // ---------- UTILITIES ----------
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => min + Math.random() * (max - min);
  const distSq = (ax, ay, bx, by) => (bx - ax) ** 2 + (by - ay) ** 2;
  const hash2 = (x, y, t) => Math.sin(x*0.127 + y*0.173 + t*0.00007) + Math.cos(x*0.093 - y*0.117 - t*0.00005) + Math.sin((x+y)*0.061 + t*0.00011);
  const fieldIndex = (ix, iy) => iy * fieldCols + ix;
  const isInside = (ix, iy) => ix >= 0 && iy >= 0 && ix < fieldCols && iy < fieldRows;
  const wrapX = (x) => x < 0 ? x + width : (x > width ? x - width : x);
  const wrapY = (y) => y < 0 ? y + height : (y > height ? y - height : y);

  // ---------- INIZIALIZZAZIONE ----------
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    memoryCanvas.width = canvas.width;
    memoryCanvas.height = canvas.height;
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
    if (!particles.length) seedParticles();
    else particles.forEach(p => { p.x = wrapX(p.x); p.y = wrapY(p.y); });
  }

  function seedField() {
    const now = performance.now();
    for (let y = 0; y < fieldRows; y++) {
      for (let x = 0; x < fieldCols; x++) {
        const idx = fieldIndex(x, y);
        const n = hash2(x, y, now);
        potential[idx] = n * 0.12;
        temperature[idx] = 0.12 + Math.abs(n) * 0.08;
        residue[idx] = 0;
        flowX[idx] = flowY[idx] = deadZone[idx] = 0;
      }
    }
    memoryCtx.clearRect(0, 0, width, height);
  }

  function spawnParticle(type, x = rand(0, width), y = rand(0, height)) {
    const meta = TYPE_META[type];
    return {
      id: `${type}-${Math.random().toString(36).slice(2, 9)}`,
      type, x, y,
      vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4),
      age: rand(0, 600),
      energy: type === TYPE.COLLAPSER ? rand(0.44, 0.58) : rand(0.5, 1),
      charge: 0, phase: rand(0, Math.PI*2),
      size: meta.baseSize * rand(0.92, 1.18),
      intensity: rand(0.8, 1.15),
      linkCooldown: 0, neighborCount: 0
    };
  }

  function seedParticles() {
    particles = [];
    const total = CONFIG.baseParticleCount;
    const explorers = Math.round(total * 0.48);
    const aggregators = Math.round(total * 0.27);
    const connectors = Math.round(total * 0.25);
    for (let i=0; i<explorers; i++) particles.push(spawnParticle(TYPE.EXPLORER));
    for (let i=0; i<aggregators; i++) particles.push(spawnParticle(TYPE.AGGREGATOR));
    for (let i=0; i<connectors; i++) particles.push(spawnParticle(TYPE.CONNECTOR));
  }

  // ---------- SIMULAZIONE CAMPO ----------
  function depositImpulse(cx, cy, radius, power, heat=0, residueBoost=0) {
    const minX = clamp(Math.floor(cx - radius), 0, fieldCols-1);
    const maxX = clamp(Math.ceil(cx + radius), 0, fieldCols-1);
    const minY = clamp(Math.floor(cy - radius), 0, fieldRows-1);
    const maxY = clamp(Math.ceil(cy + radius), 0, fieldRows-1);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx, dy = y - cy, dsq = dx*dx + dy*dy;
        if (dsq > radius*radius) continue;
        const idx = fieldIndex(x, y);
        const falloff = Math.exp(-dsq / (radius*radius*0.55));
        potential[idx] += power * falloff;
        temperature[idx] += heat * falloff;
        residue[idx] += residueBoost * falloff;
      }
    }
  }

  function updateField(dt, now) {
    for (let i=0; i<deadZone.length; i++) deadZone[i] = Math.max(0, deadZone[i] - 0.008*dt);

    if (pointer.active) {
      const cx = clamp(Math.floor(pointer.x / cellW), 0, fieldCols-1);
      const cy = clamp(Math.floor(pointer.y / cellH), 0, fieldRows-1);
      const speedNorm = clamp(pointer.speed/42, 0, 1.25);
      depositImpulse(cx, cy, 5, 0.035*speedNorm, 0.055+speedNorm*0.02, 0.008);
      if (speedNorm > 0.08) {
        depositImpulse(cx, cy, 6, 0.12*speedNorm, 0.016, 0.006);
        state.lastEventAt = now;
        state.dormant = false;
      }
      if (now - pointer.stillSince > 1700) depositImpulse(cx, cy, 7, -0.032, 0.008, 0.0015);
      if (state.mode === "DORMANT" && speedNorm > 0.05) {
        state.mode = "REVEALING"; state.note = notes.wake; state.lastEventAt = now; state.dormant = false;
      }
    }

    let residueSum = 0;
    for (let y=0; y<fieldRows; y++) {
      const yUp = y===0 ? fieldRows-1 : y-1, yDn = y===fieldRows-1 ? 0 : y+1;
      for (let x=0; x<fieldCols; x++) {
        const xLf = x===0 ? fieldCols-1 : x-1, xRt = x===fieldCols-1 ? 0 : x+1;
        const idx = fieldIndex(x, y);
        const pot = potential[idx], temp = temperature[idx], res = residue[idx], dead = deadZone[idx];
        const lapPot = potential[fieldIndex(xLf,y)] + potential[fieldIndex(xRt,y)] + potential[fieldIndex(x,yUp)] + potential[fieldIndex(x,yDn)] - pot*4;
        const lapTemp = temperature[fieldIndex(xLf,y)] + temperature[fieldIndex(xRt,y)] + temperature[fieldIndex(x,yUp)] + temperature[fieldIndex(x,yDn)] - temp*4;
        const lapRes = residue[fieldIndex(xLf,y)] + residue[fieldIndex(xRt,y)] + residue[fieldIndex(x,yUp)] + residue[fieldIndex(x,yDn)] - res*4;
        const n = hash2(x*0.91, y*0.87, now+simulationTime*1000);
        const ambient = n*0.015 + Math.sin(now*0.00011 + x*0.13 + y*0.09)*0.009;

        let nextRes = res + (lapRes*0.016 + temp*0.0018 - res*0.0068)*dt;
        nextRes = clamp(nextRes*0.9986 - dead*0.012, 0, 1.25);
        let nextTemp = temp + (lapTemp*0.021 + Math.abs(pot)*0.005 + nextRes*0.004 - temp*0.012)*dt;
        nextTemp = clamp(nextTemp + dead*0.004, 0.02, 1.15);
        let nextPot = pot + (lapPot*0.032 + (nextRes-0.15)*0.018 + ambient - pot*0.011)*dt;
        nextPot = clamp(nextPot - dead*0.014, -1.4, 1.4);

        residueNext[idx] = nextRes; temperatureNext[idx] = nextTemp; potentialNext[idx] = nextPot;
        residueSum += nextRes;
      }
    }
    [potential, potentialNext] = [potentialNext, potential];
    [temperature, temperatureNext] = [temperatureNext, temperature];
    [residue, residueNext] = [residueNext, residue];

    for (let y=0; y<fieldRows; y++) {
      for (let x=0; x<fieldCols; x++) {
        const idx = fieldIndex(x, y);
        const dx = (potential[fieldIndex((x+1)%fieldCols, y)] - potential[fieldIndex((x-1+fieldCols)%fieldCols, y)]) * 0.5;
        const dy = (potential[fieldIndex(x, (y+1)%fieldRows)] - potential[fieldIndex(x, (y-1+fieldRows)%fieldRows)]) * 0.5;
        flowX[idx] = (-dy*1.12 + hash2(x*1.13+4, y*1.09-7, now+1200)*0.038) * (1-deadZone[idx]);
        flowY[idx] = (dx*1.12 + hash2(x*1.13+4, y*1.09-7, now+1200)*0.029) * (1-deadZone[idx]);
      }
    }
    state.averageResidue = residueSum / residue.length;
  }

  // ---------- PARTICELLE ----------
  function buildSpatialBuckets() {
    spatialBuckets.clear();
    particles.forEach((p, i) => {
      const bx = Math.floor(p.x / CONFIG.bucketSize), by = Math.floor(p.y / CONFIG.bucketSize);
      const key = `${bx}|${by}`;
      if (!spatialBuckets.has(key)) spatialBuckets.set(key, []);
      spatialBuckets.get(key).push(i);
      p.neighborCount = 0;
    });
  }

  function sampleField(px, py) {
    const gx = clamp(Math.floor(px/cellW), 0, fieldCols-1), gy = clamp(Math.floor(py/cellH), 0, fieldRows-1);
    const idx = fieldIndex(gx, gy);
    return { flowX: flowX[idx], flowY: flowY[idx], potential: potential[idx], temperature: temperature[idx], residue: residue[idx], dead: deadZone[idx] };
  }

  function registerStableLink(aId, bId, dt) {
    const key = aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`;
    const prev = stableLinkMap.get(key) || 0;
    const next = clamp(prev + dt*0.045, 0, 1.35);
    stableLinkMap.set(key, next);
    return next;
  }

  function updateParticles(dt, now) {
    buildSpatialBuckets();
    pairUsage.clear();
    links = [];
    let motionEnergy = 0, collapserCount = 0;

    particles.forEach((p, i) => {
      const meta = TYPE_META[p.type];
      const sample = sampleField(p.x, p.y);
      const bx = Math.floor(p.x / CONFIG.bucketSize), by = Math.floor(p.y / CONFIG.bucketSize);
      let sepX=0, sepY=0, cohX=0, cohY=0, clusterCount=0, highResidueNeighbors=0;
      let bestA=null, bestB=null, bestDistA=Infinity, bestDistB=Infinity;

      for (let oy=-1; oy<=1; oy++) for (let ox=-1; ox<=1; ox++) {
        const bucket = spatialBuckets.get(`${bx+ox}|${by+oy}`);
        if (!bucket) continue;
        for (const j of bucket) {
          if (j===i) continue;
          const q = particles[j];
          const dx = q.x-p.x, dy = q.y-p.y, dsq = dx*dx+dy*dy;
          if (dsq > 155*155) continue;
          const d = Math.sqrt(dsq)||0.0001;
          p.neighborCount++;
          if (d < 26) { const force = (1-d/26)*meta.separation; sepX -= (dx/d)*force; sepY -= (dy/d)*force; }
          if ((q.type===p.type || (p.type===TYPE.CONNECTOR && q.type!==TYPE.COLLAPSER)) && d<82) { cohX+=q.x; cohY+=q.y; clusterCount++; }
          if (q.type!==TYPE.COLLAPSER && d<CONFIG.linkRadius && p.type===TYPE.CONNECTOR && q.type!==TYPE.CONNECTOR) {
            if (d < bestDistA) { bestB=bestA; bestDistB=bestDistA; bestA=q; bestDistA=d; }
            else if (d < bestDistB && (!bestA || q.id!==bestA.id)) { bestB=q; bestDistB=d; }
          }
          if (q.type===TYPE.AGGREGATOR && d<92) highResidueNeighbors++;
        }
      }

      if (clusterCount) { cohX = cohX/clusterCount - p.x; cohY = cohY/clusterCount - p.y; }
      const angleNoise = hash2(p.x*0.022, p.y*0.018, now+p.age*11);
      const jitterX = Math.cos(p.phase+angleNoise)*meta.noise*0.02, jitterY = Math.sin(p.phase-angleNoise)*meta.noise*0.02;
      const gradX = sample.potential*0.032 + sample.residue*0.028 - sample.dead*0.08;
      const gradY = sample.temperature*0.026 - sample.dead*0.06;

      p.vx += sample.flowX*meta.flowWeight*dt + cohX*meta.cohesion*0.0016*dt + sepX*dt + jitterX*dt + gradX*meta.gradWeight*dt;
      p.vy += sample.flowY*meta.flowWeight*dt + cohY*meta.cohesion*0.0016*dt + sepY*dt + jitterY*dt + gradY*meta.gradWeight*dt;

      if (p.type===TYPE.CONNECTOR && bestA && bestB) {
        const midX = (bestA.x+bestB.x)*0.5, midY = (bestA.y+bestB.y)*0.5;
        p.vx += (midX-p.x)*0.00078*dt; p.vy += (midY-p.y)*0.00078*dt;
        const used = pairUsage.get(p.id)||0;
        if (used < CONFIG.maxStableLinksPerParticle) {
          const stability = registerStableLink(bestA.id, bestB.id, dt);
          links.push({ ax:bestA.x, ay:bestA.y, bx:bestB.x, by:bestB.y, opacity: clamp(0.08+stability*0.44+p.energy*0.12,0.08,0.72), stable:stability, pulse:p.phase, hue:PALETTE.electric });
          pairUsage.set(p.id, used+1);
        }
      }

      if (p.type===TYPE.AGGREGATOR && highResidueNeighbors>3) p.energy = clamp(p.energy+0.0045*dt,0,1.4);
      if (p.type===TYPE.COLLAPSER) {
        collapserCount++;
        p.charge += (sample.residue*0.016 + p.neighborCount*0.0012)*dt;
        p.vx*=0.995; p.vy*=0.995;
        if (p.charge>1.22 && now>state.collapseUntil) { triggerCollapse(p.x, p.y, now); p.charge=0.18; }
      }

      const speed = Math.hypot(p.vx, p.vy);
      const maxSpeed = meta.maxSpeed * (1 + sample.temperature*0.06 + (state.mode==="SATURATED"?0.18:0));
      if (speed > maxSpeed) { const s = maxSpeed/speed; p.vx*=s; p.vy*=s; }
      p.vx *= meta.drag; p.vy *= meta.drag;
      p.x = wrapX(p.x + p.vx*dt*1.15); p.y = wrapY(p.y + p.vy*dt*1.15);
      p.age += dt; p.phase += 0.02 + speed*0.012;
      p.energy = clamp(p.energy + (sample.potential*0.008+sample.residue*0.014+sample.temperature*0.003-0.0054-sample.dead*0.014)*dt, 0.03, p.type===TYPE.COLLAPSER?1.8:1.25);
      if (p.type!==TYPE.COLLAPSER && p.energy<0.08) { p.vx*=0.94; p.vy*=0.94; }
      residue[sample.idx] = clamp(residue[sample.idx] + meta.residue*p.intensity*dt, 0, 1.25);
      temperature[sample.idx] = clamp(temperature[sample.idx] + meta.heat*0.2*dt, 0.02, 1.2);
      potential[sample.idx] = clamp(potential[sample.idx] + (p.type===TYPE.AGGREGATOR?0.0022:0.0008)*dt, -1.4, 1.4);
      motionEnergy += speed * p.energy;
    });

    state.motionEnergy = motionEnergy / Math.max(1, particles.length);
    state.visibleLinks = links.length;
    maybeSpawnCollapser(collapserCount, now);
    decayStableLinks(dt);
    rebalancePopulation(now);
  }

  function decayStableLinks(dt) { stableLinkMap.forEach((v,k) => { const n = v - dt*0.009; n<=0 ? stableLinkMap.delete(k) : stableLinkMap.set(k,n); }); }
  function maybeSpawnCollapser(count, now) {
    if (count>=2 || particles.length>=CONFIG.maxParticles || state.averageResidue<0.21 || now<state.collapseUntil-1800 || Math.random()>0.006) return;
    let bestIdx=0, bestVal=0;
    residue.forEach((v,i)=>{ const score=v+temperature[i]*0.2-deadZone[i]*0.5; if(score>bestVal){ bestVal=score; bestIdx=i; } });
    const x = (bestIdx%fieldCols+0.5)*cellW, y = (Math.floor(bestIdx/fieldCols)+0.5)*cellH;
    particles.push(spawnParticle(TYPE.COLLAPSER, x, y));
  }

  function rebalancePopulation(now) {
    if (particles.length < CONFIG.baseParticleCount*0.9) spawnFromMemory(2);
    particles = particles.filter(p => p.type===TYPE.COLLAPSER ? true : (p.energy>0.03 && p.age<2800));
    if (state.averageResidue>0.24 && particles.length<CONFIG.maxParticles && Math.random()<0.035) spawnFromMemory(1);
    while (particles.length < CONFIG.baseParticleCount) particles.push(spawnParticle(Math.random()<0.55?TYPE.EXPLORER:TYPE.CONNECTOR));
  }

  function spawnFromMemory(count) {
    const hotspots = []; residue.forEach((v,i)=>{ if(deadZone[i]<=0.2) hotspots.push({idx:i, value:v+temperature[i]*0.12}); });
    hotspots.sort((a,b)=>b.value-a.value);
    const picks = hotspots.slice(0, Math.max(count*5,12));
    for (let i=0; i<count; i++) {
      const src = picks[Math.floor(Math.random()*picks.length)] || {idx:0};
      const x = ((src.idx%fieldCols)+Math.random())*cellW, y = (Math.floor(src.idx/fieldCols)+Math.random())*cellH;
      const type = Math.random()<0.48 ? TYPE.EXPLORER : (Math.random()<0.76? TYPE.AGGREGATOR : TYPE.CONNECTOR);
      particles.push(spawnParticle(type, x, y));
    }
  }

  function triggerCollapse(x, y, now) {
    const radius = CONFIG.collapseRadius, radiusSq = radius*radius;
    particles.forEach(p => { const dx=p.x-x, dy=p.y-y; if(dx*dx+dy*dy<radiusSq) { const d=Math.sqrt(dx*dx+dy*dy)||0.0001; const falloff=1-d/radius; p.vx+=(dx/d)*falloff*7.2; p.vy+=(dy/d)*falloff*7.2; if(p.type!==TYPE.COLLAPSER) p.energy*=0.62; } });
    const cx = clamp(Math.floor(x/cellW),0,fieldCols-1), cy = clamp(Math.floor(y/cellH),0,fieldRows-1), gr=Math.max(3,Math.round(radius/Math.max(cellW,cellH)));
    for (let gy=cy-gr; gy<=cy+gr; gy++) for (let gx=cx-gr; gx<=cx+gr; gx++) if(isInside(gx,gy)) {
      const idx=fieldIndex(gx,gy), dx=gx-cx, dy=gy-cy, dsq=dx*dx+dy*dy; if(dsq>gr*gr) continue;
      const falloff=1-Math.sqrt(dsq)/gr; potential[idx]*=0.16; temperature[idx]*=0.34; residue[idx]*=0.08; deadZone[idx]=clamp(deadZone[idx]+falloff*0.92,0,1);
    }
    memoryCtx.save(); memoryCtx.globalCompositeOperation="destination-out";
    const grad = memoryCtx.createRadialGradient(x,y,0,x,y,radius*1.1); grad.addColorStop(0,"rgba(0,0,0,0.96)"); grad.addColorStop(0.7,"rgba(0,0,0,0.48)"); grad.addColorStop(1,"rgba(0,0,0,0)");
    memoryCtx.fillStyle=grad; memoryCtx.beginPath(); memoryCtx.arc(x,y,radius*1.1,0,Math.PI*2); memoryCtx.fill(); memoryCtx.restore();
    state.mode="COLLAPSING"; state.note=notes.collapse; state.lastEventAt=now; state.collapseUntil=now+CONFIG.collapseCooldownMs;
  }

  function updateSystemState(now) {
    const idleFor = now - state.lastEventAt;
    state.saturationSince = state.averageResidue > CONFIG.saturationThreshold ? (state.saturationSince||now) : 0;
    if (now < state.collapseUntil) { state.mode="COLLAPSING"; state.note=notes.collapse; }
    else if (state.saturationSince && now-state.saturationSince>3600) { state.mode="SATURATED"; state.note=notes.saturated; state.lastEventAt=now; }
    else if (state.visibleLinks > CONFIG.networkThreshold) { state.mode="NETWORK"; state.note=notes.network; }
    else if (idleFor > CONFIG.dormancyAfterMs && state.motionEnergy<0.6) { state.mode="DORMANT"; state.note=notes.dormant; state.dormant=true; }
    else if (pointer.active || state.averageResidue>0.05) { state.mode="REVEALING"; state.note=notes.revealing; }
    else { state.mode="LISTENING"; state.note=notes.listening; }
    applyPhaseToUI();
  }

  function applyPhaseToUI() {
    document.body.dataset.phase = state.mode.toLowerCase();
    if (sitePhase) sitePhase.textContent = state.mode;
    if (systemNote) systemNote.textContent = state.note;
    if (phaseFootnote) phaseFootnote.textContent = `fase attuale · ${state.mode.toLowerCase()}`;
  }

  // ---------- RENDER ----------
  function drawMemoryFade() {
    memoryCtx.fillStyle = state.mode==="SATURATED" ? "rgba(5,5,7,0.032)" : "rgba(5,5,7,0.052)";
    memoryCtx.fillRect(0,0,width,height);
  }

  function drawParticlesToMemory() {
    drawMemoryFade();
    particles.forEach(p => {
      const meta = TYPE_META[p.type];
      const alpha = p.type===TYPE.COLLAPSER ? 0.05 : meta.residue*2.2;
      const radius = p.type===TYPE.COLLAPSER ? 20 : p.size * (p.type===TYPE.AGGREGATOR?4.6:3.2);
      const grad = memoryCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius);
      grad.addColorStop(0, `rgba(${meta.color}, ${alpha})`); grad.addColorStop(1, "rgba(0,0,0,0)");
      memoryCtx.fillStyle=grad; memoryCtx.beginPath(); memoryCtx.arc(p.x,p.y,radius,0,Math.PI*2); memoryCtx.fill();
    });
  }

  function render(now) {
    drawParticlesToMemory();
    ctx.clearRect(0,0,width,height);
    const grad = ctx.createLinearGradient(0,0,width,height); grad.addColorStop(0,"#070608"); grad.addColorStop(0.5,"#050507"); grad.addColorStop(1,"#08080a");
    ctx.fillStyle=grad; ctx.fillRect(0,0,width,height);
    ctx.save(); ctx.globalCompositeOperation="screen"; ctx.globalAlpha = state.mode==="DORMANT"?0.42:0.68; ctx.drawImage(memoryCanvas,0,0,width,height); ctx.restore();
    if (state.mode==="SATURATED") { ctx.fillStyle=`rgba(${PALETTE.violet},0.04)`; ctx.fillRect(0,0,width,height); }
    ctx.save(); ctx.globalCompositeOperation="screen";
    links.forEach(l => { ctx.beginPath(); ctx.moveTo(l.ax,l.ay); ctx.lineTo(l.bx,l.by); ctx.strokeStyle=`rgba(${l.hue},${l.opacity*(0.78+Math.sin(now*0.003+l.pulse)*0.22)})`; ctx.lineWidth=0.5+l.stable*1.6; ctx.stroke(); });
    particles.forEach(p => {
      const meta = TYPE_META[p.type], speed = Math.hypot(p.vx,p.vy), stretch = 1+clamp(speed/2.4,0,1.8), alpha = clamp(0.16+p.energy*0.42+(p.type===TYPE.COLLAPSER?0.18:0),0.12,0.86);
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.atan2(p.vy,p.vx)||0); ctx.fillStyle=`rgba(${meta.color},${alpha})`; ctx.shadowBlur=p.type===TYPE.COLLAPSER?28:14; ctx.shadowColor=`rgba(${meta.color},${alpha*0.85})`;
      ctx.beginPath(); ctx.ellipse(0,0,p.size*stretch,p.size*0.72,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    });
    ctx.restore();
    if (pointer.active) { const grad = ctx.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,20+clamp(pointer.speed*0.9,0,42)); grad.addColorStop(0,"rgba(240,235,225,0.06)"); grad.addColorStop(1,"rgba(0,0,0,0)"); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(pointer.x,pointer.y,20+clamp(pointer.speed*0.9,0,42),0,Math.PI*2); ctx.fill(); }
  }

  // ---------- LOOP ----------
  function frame(ts) {
    const dt = clamp((ts - lastTs)/16.6667, 0.4, CONFIG.dtClamp);
    lastTs = ts; simulationTime += dt;
    updateField(dt, ts);
    updateParticles(dt, ts);
    updateSystemState(ts);
    render(ts);
    rafId = requestAnimationFrame(frame);
  }

  // ---------- EVENTI ----------
  function onPointerMove(clientX, clientY) {
    const now = performance.now();
    const x = clientX, y = clientY;
    const speed = Math.hypot(x-pointer.x, y-pointer.y);
    pointer.px=pointer.x; pointer.py=pointer.y; pointer.x=x; pointer.y=y; pointer.speed=speed; pointer.active=true; pointer.movedAt=now;
    if (speed>0.35) pointer.stillSince=now;
  }

  function onPointerLeave() { pointer.active = false; pointer.speed = 0; }

  function init() {
    resize();
    window.addEventListener("resize", resize, {passive:true});
    window.addEventListener("mousemove", e => onPointerMove(e.clientX, e.clientY), {passive:true});
    window.addEventListener("touchmove", e => { if(e.touches.length) onPointerMove(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
    window.addEventListener("mouseleave", onPointerLeave); window.addEventListener("blur", onPointerLeave); window.addEventListener("touchend", onPointerLeave);
    rafId = requestAnimationFrame(frame);
  }

  init();
  window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
})();
