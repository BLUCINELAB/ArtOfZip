(() => {
  const content = window.SpecimenContent;
  if (!content || !Array.isArray(content.modes) || !content.modes.length) {
    console.warn("SpecimenContent not found.");
    return;
  }

  const svgNS = "http://www.w3.org/2000/svg";

  const $ = (s, root = document) => root.querySelector(s);

  const els = {
    body: document.body,
    cursorHalo: $("#cursorHalo"),

    systemLabel: $("#systemLabel"),
    fieldLabel: $("#fieldLabel"),
    modeButton: $("#modeButton"),
    modeButtonLabel: $("#modeButtonLabel"),

    heroKicker: $("#heroKicker"),
    heroTitle: $("#heroTitle"),
    heroDescription: $("#heroDescription"),

    indexCardLabel: $("#indexCardLabel"),
    indexCardList: $("#indexCardList"),
    specCardLabel: $("#specCardLabel"),
    specCardList: $("#specCardList"),

    toplineLeft: $("#toplineLeft"),
    toplineRight: $("#toplineRight"),

    axisLabelY: $("#axisLabelY"),
    axisLabelX: $("#axisLabelX"),

    fieldSvg: $("#fieldSvg"),
    annotationLayer: $("#annotationLayer"),

    gridButton: $("#gridButton"),
    notesButton: $("#notesButton"),
    regenButton: $("#regenButton"),

    entriesLabel: $("#entriesLabel"),
    entriesNote: $("#entriesNote"),
    entryList: $("#entryList"),

    notesLabel: $("#notesLabel"),
    notesCopy: $("#notesCopy"),
    metricsLabel: $("#metricsLabel"),
    metricsGrid: $("#metricsGrid"),
    coordsLabel: $("#coordsLabel"),
    coordsList: $("#coordsList"),

    footerRow: $("#footerRow")
  };

  let currentModeIndex = 0;
  let rafId = null;
  let timeStart = performance.now();
  let scene = null;
  let regenOffset = 0;

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  function buildPairs(container, pairs, className = "mode-item") {
    if (!container) return;
    container.innerHTML = pairs
      .map(
        ([a, b]) =>
          `<div class="${className}"><span class="mode-name">${a}</span><strong>${b}</strong></div>`
      )
      .join("");
  }

  function buildIndexList(container, items) {
    if (!container) return;
    container.innerHTML = items
      .map(
        (item) =>
          `<div class="mode-item"><span class="mode-name">${item}</span><strong>•</strong></div>`
      )
      .join("");
  }

  function buildEntries(entries) {
    els.entryList.innerHTML = entries
      .map(
        (entry) => `
          <article class="entry-card">
            <div class="entry-topline">
              <span>${entry.code}</span>
              <span>${entry.type}</span>
            </div>
            <h3 class="entry-title">${entry.title}</h3>
            <p class="entry-description">${entry.description}</p>
            <div class="entry-line"></div>
            <div class="entry-meta">
              <span>${entry.metaLeft}</span>
              <span>${entry.year}</span>
              <span>${entry.metaRight}</span>
            </div>
          </article>
        `
      )
      .join("");
  }

  function buildAnnotations(annotations) {
    els.annotationLayer.innerHTML = annotations
      .map(
        (item) => `
          <article class="annotation-card" style="left:${item.x}%; top:${item.y}%;">
            <span class="annotation-index">${item.index}</span>
            <span class="annotation-tag">${item.tag}</span>
            <p class="annotation-copy">${item.copy}</p>
          </article>
        `
      )
      .join("");
  }

  function applyMode(mode) {
    els.body.setAttribute("data-mode", mode.id);

    setText(els.systemLabel, "SPECIMEN FIELD");
    setText(els.fieldLabel, mode.field);
    setText(els.modeButtonLabel, mode.label);

    setText(els.heroKicker, mode.kicker);
    els.heroTitle.innerHTML = mode.title.join("<br />");
    setText(els.heroDescription, mode.description);

    setText(els.indexCardLabel, mode.indexLabel);
    buildIndexList(els.indexCardList, mode.indexItems);

    setText(els.specCardLabel, mode.specLabel);
    buildPairs(els.specCardList, mode.specItems);

    setText(els.toplineLeft, `STATE: ${mode.state}`);
    setText(els.toplineRight, `YEAR: ${mode.year}`);

    setText(els.axisLabelY, mode.axisY);
    setText(els.axisLabelX, mode.axisX);

    setText(els.entriesLabel, mode.entriesLabel);
    setText(els.entriesNote, mode.entriesNote);
    buildEntries(mode.entries);

    setText(els.notesLabel, mode.notesLabel);
    setText(els.notesCopy, mode.notesCopy);

    setText(els.metricsLabel, mode.metricsLabel);
    buildPairs(els.metricsGrid, mode.metrics);

    setText(els.coordsLabel, mode.coordsLabel);
    buildPairs(els.coordsList, mode.coords);

    els.footerRow.innerHTML = mode.footer.map((item) => `<span>${item}</span>`).join("");

    buildAnnotations(mode.annotations);
    buildField(mode.visual);
  }

  function nextMode() {
    currentModeIndex = (currentModeIndex + 1) % content.modes.length;
    applyMode(content.modes[currentModeIndex]);
  }

  function toggleGrid() {
    const isOn = els.body.getAttribute("data-grid") !== "off";
    els.body.setAttribute("data-grid", isOn ? "off" : "on");
    els.gridButton.setAttribute("aria-pressed", String(!isOn));
  }

  function toggleNotes() {
    const isOn = els.body.getAttribute("data-notes") !== "off";
    els.body.setAttribute("data-notes", isOn ? "off" : "on");
    els.notesButton.setAttribute("aria-pressed", String(!isOn));
  }

  function seedRand(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  function buildField(visual) {
    cancelAnimationFrame(rafId);
    timeStart = performance.now();

    const width = 1200;
    const height = 1480;
    const cx = width * 0.5;
    const cy = height * 0.5;

    const rand = seedRand(visual.seed + regenOffset * 11);

    els.fieldSvg.innerHTML = "";

    const defs = document.createElementNS(svgNS, "defs");

    const radial = document.createElementNS(svgNS, "radialGradient");
    radial.setAttribute("id", "coreGradient");
    radial.setAttribute("cx", "50%");
    radial.setAttribute("cy", "40%");
    radial.setAttribute("r", "55%");

    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "rgba(255,255,255,0.75)");

    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "55%");
    stop2.setAttribute("stop-color", "rgba(255,255,255,0.12)");

    const stop3 = document.createElementNS(svgNS, "stop");
    stop3.setAttribute("offset", "100%");
    stop3.setAttribute("stop-color", "rgba(255,255,255,0)");

    radial.appendChild(stop1);
    radial.appendChild(stop2);
    radial.appendChild(stop3);
    defs.appendChild(radial);
    els.fieldSvg.appendChild(defs);

    const gCore = document.createElementNS(svgNS, "g");
    const gFlow = document.createElementNS(svgNS, "g");
    const gMesh = document.createElementNS(svgNS, "g");
    const gNodes = document.createElementNS(svgNS, "g");
    const gShards = document.createElementNS(svgNS, "g");

    els.fieldSvg.appendChild(gCore);
    els.fieldSvg.appendChild(gFlow);
    els.fieldSvg.appendChild(gMesh);
    els.fieldSvg.appendChild(gNodes);
    els.fieldSvg.appendChild(gShards);

    const core = document.createElementNS(svgNS, "ellipse");
    core.setAttribute("class", "core-blur");
    core.setAttribute("cx", cx);
    core.setAttribute("cy", cy);
    core.setAttribute("rx", 170 * visual.coreScaleX);
    core.setAttribute("ry", 360 * visual.coreScaleY);
    gCore.appendChild(core);

    const points = [];
    const lineEls = [];
    const nodeEls = [];

    const density = visual.density;
    const rows = Math.floor(density * 1.5);

    for (let y = 0; y < rows; y++) {
      const row = [];
      const ny = y / (rows - 1);

      for (let x = 0; x < density; x++) {
        const nx = x / (density - 1);

        const bodyProfile =
          Math.exp(-Math.pow((ny - 0.2) / 0.12, 2)) * 0.95 +
          Math.exp(-Math.pow((ny - 0.5) / 0.18, 2)) * 0.65 +
          Math.exp(-Math.pow((ny - 0.82) / 0.13, 2)) * 0.9;

        const widthFactor = 36 + bodyProfile * 200;
        const sinWarp = Math.sin(ny * 7.8 + nx * 3.2) * 16;
        const noiseX = (rand() - 0.5) * 28;
        const noiseY = (rand() - 0.5) * 20;

        let px = cx + (nx - 0.5) * widthFactor * 2 + sinWarp + noiseX;
        let py = 120 + ny * 1180 + Math.sin(nx * 4.6 + ny * 5.4) * 12 + noiseY;

        const distToCenter =
          Math.abs(px - cx) / 280 + Math.abs(py - cy) / 520;

        const weight = Math.max(0, 1.15 - distToCenter);

        row.push({
          x: px,
          y: py,
          baseX: px,
          baseY: py,
          nx,
          ny,
          weight,
          signal:
            Math.exp(-Math.pow((ny - 0.56) / 0.13, 2)) *
            Math.exp(-Math.pow((nx - 0.52) / 0.22, 2)),
          drift:
            rand() * Math.PI * 2
        });
      }

      points.push(row);
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < density; x++) {
        const p = points[y][x];

        if (x < density - 1) {
          const q = points[y][x + 1];
          const line = document.createElementNS(svgNS, "path");
          line.setAttribute("class", p.signal > 0.2 || q.signal > 0.2 ? "flow-line signal" : "flow-line");
          line.style.opacity = (visual.lineAlpha + (p.weight + q.weight) * 0.06).toFixed(3);

          const mx = (p.x + q.x) / 2;
          const my = (p.y + q.y) / 2;
          const curve = Math.sin((p.ny + p.nx) * 10) * 8;

          line.setAttribute(
            "d",
            `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} Q ${mx.toFixed(2)} ${(my + curve).toFixed(2)} ${q.x.toFixed(2)} ${q.y.toFixed(2)}`
          );
          gFlow.appendChild(line);
          lineEls.push({ el: line, p, q, type: "h" });
        }

        if (y < rows - 1 && x % 2 === 0) {
          const q = points[y + 1][x];
          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("class", "mesh-line");
          line.style.opacity = visual.meshOpacity.toFixed(3);
          line.setAttribute("x1", p.x.toFixed(2));
          line.setAttribute("y1", p.y.toFixed(2));
          line.setAttribute("x2", q.x.toFixed(2));
          line.setAttribute("y2", q.y.toFixed(2));
          gMesh.appendChild(line);
          lineEls.push({ el: line, p, q, type: "v" });
        }

        if (p.weight > 0.02 && rand() > 0.16) {
          const node = document.createElementNS(svgNS, "circle");
          let cls = "node";
          if (p.signal > 0.28) cls = "node signal";
          else if (p.weight < 0.35) cls = "node minor";

          node.setAttribute("class", cls);
          node.setAttribute("cx", p.x.toFixed(2));
          node.setAttribute("cy", p.y.toFixed(2));
          node.setAttribute(
            "r",
            (0.5 + p.weight * 1.9 * visual.nodeScale + p.signal * 1.6).toFixed(2)
          );
          node.style.opacity = Math.min(0.18 + p.weight * 0.78 + p.signal * visual.signalAlpha, 0.95).toFixed(3);
          gNodes.appendChild(node);
          nodeEls.push({ el: node, p, baseR: parseFloat(node.getAttribute("r")) });
        }

        if (p.signal > 0.18 && rand() > 0.72) {
          const halo = document.createElementNS(svgNS, "circle");
          halo.setAttribute("class", "halo");
          halo.setAttribute("cx", p.x.toFixed(2));
          halo.setAttribute("cy", p.y.toFixed(2));
          halo.setAttribute("r", (12 + p.signal * 34).toFixed(2));
          halo.style.opacity = (0.04 + p.signal * 0.08).toFixed(3);
          gCore.appendChild(halo);
        }
      }
    }

    for (let i = 0; i < visual.layers; i++) {
      const shard = document.createElementNS(svgNS, "path");
      shard.setAttribute("class", "shard");

      const sx = cx + (rand() - 0.5) * 360;
      const sy = cy + (rand() - 0.5) * 760;
      const a = rand() * Math.PI * 2;
      const r1 = 24 + rand() * 80;
      const r2 = 8 + rand() * 30;

      const x1 = sx + Math.cos(a) * r1;
      const y1 = sy + Math.sin(a) * r1;
      const x2 = sx + Math.cos(a + 1.6) * r2;
      const y2 = sy + Math.sin(a + 1.6) * r2;
      const x3 = sx + Math.cos(a + 3.1) * (r1 * 0.7);
      const y3 = sy + Math.sin(a + 3.1) * (r1 * 0.7);

      shard.setAttribute(
        "d",
        `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} Z`
      );

      shard.style.opacity = (0.05 + rand() * 0.08).toFixed(3);
      gShards.appendChild(shard);
    }

    scene = {
      lineEls,
      nodeEls,
      core,
      visual
    };

    animate();
  }

  function animate(now = performance.now()) {
    if (!scene) return;

    const t = (now - timeStart) * 0.001;

    scene.nodeEls.forEach((item) => {
      const dx = Math.sin(t * 0.45 + item.p.drift + item.p.ny * 8) * (1.4 + item.p.signal * 2.8);
      const dy = Math.cos(t * 0.36 + item.p.drift + item.p.nx * 7) * (1.2 + item.p.signal * 2.2);

      const x = item.p.baseX + dx;
      const y = item.p.baseY + dy;
      item.p.x = x;
      item.p.y = y;

      item.el.setAttribute("cx", x.toFixed(2));
      item.el.setAttribute("cy", y.toFixed(2));

      const breath = 1 + Math.sin(t * 1.1 + item.p.drift) * 0.08;
      item.el.setAttribute("r", (item.baseR * breath).toFixed(2));
    });

    scene.lineEls.forEach((item) => {
      if (item.type === "h") {
        const mx = (item.p.x + item.q.x) / 2;
        const my = (item.p.y + item.q.y) / 2;
        const curve = Math.sin(t * 0.7 + item.p.ny * 9 + item.p.nx * 4) * (4 + item.p.signal * 10);

        item.el.setAttribute(
          "d",
          `M ${item.p.x.toFixed(2)} ${item.p.y.toFixed(2)} Q ${mx.toFixed(2)} ${(my + curve).toFixed(2)} ${item.q.x.toFixed(2)} ${item.q.y.toFixed(2)}`
        );
      } else {
        item.el.setAttribute("x1", item.p.x.toFixed(2));
        item.el.setAttribute("y1", item.p.y.toFixed(2));
        item.el.setAttribute("x2", item.q.x.toFixed(2));
        item.el.setAttribute("y2", item.q.y.toFixed(2));
      }
    });

    const driftX = Math.sin(t * 0.13) * 2.4;
    const driftY = Math.cos(t * 0.11) * 1.8;
    const rotate = Math.sin(t * 0.09) * 0.14;

    els.fieldSvg.style.transform = `translate(${driftX}px, ${driftY}px) rotate(${rotate}deg)`;

    rafId = requestAnimationFrame(animate);
  }

  function regenerate() {
    regenOffset += 1;
    applyMode(content.modes[currentModeIndex]);
  }

  function handlePointerMove(e) {
    if (!els.cursorHalo) return;
    els.cursorHalo.style.left = `${e.clientX}px`;
    els.cursorHalo.style.top = `${e.clientY}px`;
  }

  function init() {
    applyMode(content.modes[currentModeIndex]);

    els.modeButton.addEventListener("click", nextMode);
    els.gridButton.addEventListener("click", toggleGrid);
    els.notesButton.addEventListener("click", toggleNotes);
    els.regenButton.addEventListener("click", regenerate);

    document.addEventListener("pointermove", handlePointerMove);

    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (key === "m") nextMode();
      if (key === "g") toggleGrid();
      if (key === "n") toggleNotes();
      if (key === "r") regenerate();
    });

    window.addEventListener("resize", () => {
      applyMode(content.modes[currentModeIndex]);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
