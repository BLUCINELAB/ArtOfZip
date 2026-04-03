(() => {
  const data = window.SpecimenContent;

  if (!data || !Array.isArray(data.modes) || !Array.isArray(data.entries)) {
    console.warn("SpecimenContent not available.");
    return;
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const $ = (selector, root = document) => root.querySelector(selector);

  const dom = {
    body: document.body,
    cursorHalo: $("#cursorHalo"),
    fieldLabel: $("#fieldLabel"),
    cycleModeButton: $("#cycleModeButton"),
    cycleModeLabel: $("#cycleModeLabel"),
    heroKicker: $("#heroKicker"),
    heroTitle: $("#heroTitle"),
    heroDescription: $("#heroDescription"),
    modeStatement: $("#modeStatement"),
    modeTabs: $("#modeTabs"),
    workspaceMeta: $("#workspaceMeta"),
    boardState: $("#boardState"),
    boardYear: $("#boardYear"),
    axisLabelX: $("#axisLabelX"),
    axisLabelY: $("#axisLabelY"),
    fieldSvg: $("#fieldSvg"),
    boardView: $("#boardView"),
    fieldTooltip: $("#fieldTooltip"),
    gridButton: $("#gridButton"),
    labelsButton: $("#labelsButton"),
    motionButton: $("#motionButton"),
    reshuffleButton: $("#reshuffleButton"),
    archiveGrid: $("#archiveGrid"),
    archiveNote: $("#archiveNote"),
    systemNote: $("#systemNote"),
    metricsList: $("#metricsList"),
    coordsList: $("#coordsList"),
    footerRow: $("#footerRow"),
    inspectorStatus: $("#inspectorStatus"),
    inspectorCode: $("#inspectorCode"),
    inspectorEntryTitle: $("#inspectorEntryTitle"),
    inspectorSummary: $("#inspectorSummary"),
    inspectorMeta: $("#inspectorMeta"),
    inspectorRelations: $("#inspectorRelations"),
    inspectorNote: $("#inspectorNote")
  };

  const state = {
    modeIndex: 0,
    selectedId: data.entries[0]?.id || null,
    seedOffset: 0,
    showGrid: true,
    showLabels: true,
    showMotion: !prefersReducedMotion.matches,
    reducedMotion: prefersReducedMotion.matches,
    scene: null,
    rafId: null,
    hoverId: null
  };

  const entryMap = new Map(data.entries.map((entry) => [entry.id, entry]));

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function setHTML(element, value) {
    if (element) element.innerHTML = value;
  }

  function seededRandom(seed) {
    let current = seed % 2147483647;
    if (current <= 0) current += 2147483646;
    return () => (current = (current * 16807) % 2147483647) / 2147483647;
  }

  function entryValue(entry, key) {
    return entry.metrics[key] ?? 0;
  }

  function currentMode() {
    return data.modes[state.modeIndex];
  }

  function currentEntry() {
    return entryMap.get(state.selectedId) || data.entries[0];
  }

  function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function formatMetric(value) {
    return value.toFixed(2);
  }

  function createMetricList(items) {
    return items
      .map(([key, value]) => `<span>${key}</span><strong>${value}</strong>`)
      .join("");
  }

  function createMetaChip(text) {
    return `<span class="meta-chip">${text}</span>`;
  }

  function buildModeTabs() {
    dom.modeTabs.innerHTML = data.modes
      .map(
        (mode, index) => `
          <button
            class="mode-tab"
            type="button"
            role="tab"
            id="mode-tab-${mode.id}"
            aria-selected="${index === state.modeIndex ? "true" : "false"}"
            aria-controls="workspaceTitle"
            data-mode-index="${index}"
          >
            ${mode.label}
          </button>
        `
      )
      .join("");

    dom.modeTabs.querySelectorAll(".mode-tab").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.modeIndex);
        setMode(index);
      });
    });
  }

  function buildArchive() {
    dom.archiveGrid.innerHTML = data.entries
      .map((entry) => {
        const active = entry.id === state.selectedId;
        return `
          <button
            class="archive-card"
            type="button"
            data-entry-id="${entry.id}"
            aria-pressed="${active ? "true" : "false"}"
          >
            <div class="archive-card-top">
              <span>${entry.code}</span>
              <span>${entry.type}</span>
            </div>
            <h3 class="archive-card-title">${entry.title}</h3>
            <p class="archive-card-summary">${entry.summary}</p>
            <div class="archive-divider" aria-hidden="true"></div>
            <div class="archive-card-meta">
              <span>${entry.year}</span>
              <span>${entry.tags[0]}</span>
              <span>${entry.tags[1] || entry.tags[0]}</span>
            </div>
          </button>
        `;
      })
      .join("");

    dom.archiveGrid.querySelectorAll(".archive-card").forEach((button) => {
      button.addEventListener("click", () => selectEntry(button.dataset.entryId, true));
    });
  }

  function uniqueRelations(entry) {
    return entry.relations
      .map((id) => entryMap.get(id))
      .filter(Boolean);
  }

  function computeModeMetrics(mode) {
    const xValues = data.entries.map((entry) => entryValue(entry, mode.map.xKey));
    const yValues = data.entries.map((entry) => entryValue(entry, mode.map.yKey));
    const emphasisValues = data.entries.map((entry) => entryValue(entry, mode.map.emphasisKey));

    return [
      ["entries", String(data.entries.length)],
      ["x avg", formatMetric(average(xValues))],
      ["y avg", formatMetric(average(yValues))],
      ["focus", formatMetric(average(emphasisValues))],
      ...mode.metrics
    ];
  }

  function computeNodeData(mode) {
    const width = 1200;
    const height = 980;
    const marginX = 124;
    const marginY = 96;
    const rand = seededRandom((state.modeIndex + 1) * 1009 + (state.seedOffset + 1) * 9173);

    const nodes = data.entries.map((entry, index) => {
      const xBase = entryValue(entry, mode.map.xKey);
      const yBase = entryValue(entry, mode.map.yKey);
      const cluster = entryValue(entry, mode.map.clusterKey);
      const emphasis = entryValue(entry, mode.map.emphasisKey);
      const signal = entryValue(entry, "signal");
      const jitterX = (rand() - 0.5) * 60 + Math.sin(index * 1.73 + state.seedOffset) * 18;
      const jitterY = (rand() - 0.5) * 54 + Math.cos(index * 1.51 + state.seedOffset) * 16;
      const x = marginX + xBase * (width - marginX * 2) + jitterX * (0.24 + cluster * 0.18);
      const y = height - marginY - yBase * (height - marginY * 2) + jitterY * (0.18 + emphasis * 0.2);
      const radius = 8 + emphasis * 13;

      return {
        id: entry.id,
        entry,
        x: clamp(x, 80, width - 80),
        y: clamp(y, 72, height - 72),
        radius,
        emphasis,
        cluster,
        signal,
        labelDx: x > width * 0.68 ? -18 : 18,
        labelAnchor: x > width * 0.68 ? "end" : "start",
        phase: rand() * Math.PI * 2
      };
    });

    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const relations = [];
    const relationKeys = new Set();

    data.entries.forEach((entry) => {
      entry.relations.forEach((relatedId) => {
        const from = nodeMap.get(entry.id);
        const to = nodeMap.get(relatedId);
        if (!from || !to) return;
        const key = [entry.id, relatedId].sort().join(":");
        if (relationKeys.has(key)) return;
        relationKeys.add(key);
        relations.push({
          key,
          from,
          to,
          signal: Math.max(from.signal, to.signal),
          active: state.selectedId === from.id || state.selectedId === to.id
        });
      });
    });

    return { width, height, nodes, relations };
  }

  function buildSmoothPath(points) {
    if (points.length < 2) return "";
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const current = points[i];
      const controlX = ((prev.x + current.x) / 2).toFixed(2);
      d += ` Q ${controlX} ${prev.y.toFixed(2)} ${controlX} ${((prev.y + current.y) / 2).toFixed(2)}`;
      d += ` T ${current.x.toFixed(2)} ${current.y.toFixed(2)}`;
    }

    return d;
  }

  function computeContours(nodes, mode) {
    const sortedByX = [...nodes].sort((a, b) => a.x - b.x);
    const high = sortedByX.filter((node) => node.emphasis >= 0.6);
    const mid = sortedByX.filter((node) => node.emphasis >= 0.42 && node.emphasis < 0.6);
    const low = sortedByX.filter((node) => node.emphasis < 0.42);
    const groups = [high, mid, low].filter((group) => group.length >= 2);

    return groups.map((group, index) => {
      const yShift = index === 0 ? -20 : index === 1 ? 0 : 18;
      const points = group.map((node, pointIndex) => ({
        x: node.x,
        y: clamp(
          node.y + yShift + Math.sin(pointIndex * 1.3 + state.seedOffset + index) * 10,
          64,
          916
        )
      }));

      return {
        path: buildSmoothPath(points),
        className: `contour ${mode.map.contour === "ember" && index === 0 ? "signal" : ""}`,
        phase: index * 0.6 + state.seedOffset * 0.2
      };
    });
  }

  function createSvgNode(tag, attributes = {}) {
    const element = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    return element;
  }

  function relationPath(relation) {
    const { from, to } = relation;
    const controlX = (from.x + to.x) / 2;
    const controlY = (from.y + to.y) / 2 - 34 + Math.abs(from.x - to.x) * 0.04;
    return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
  }

  function updateTooltipPosition(x, y, title, description) {
    const tooltip = dom.fieldTooltip;
    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${title}</strong><br>${description}`;

    const containerRect = dom.boardView.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = clamp(x - containerRect.left + 18, 16, containerRect.width - tooltipRect.width - 16);
    const top = clamp(y - containerRect.top - tooltipRect.height - 14, 16, containerRect.height - tooltipRect.height - 16);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    dom.fieldTooltip.hidden = true;
  }

  function renderField() {
    const mode = currentMode();
    const geometry = computeNodeData(mode);
    const contours = computeContours(geometry.nodes, mode);
    const svg = dom.fieldSvg;

    svg.innerHTML = "";

    const defs = createSvgNode("defs");
    const radial = createSvgNode("radialGradient", {
      id: "fieldGlow",
      cx: "50%",
      cy: "48%",
      r: "58%"
    });

    [
      { offset: "0%", color: "rgba(255,255,255,0.12)" },
      { offset: "60%", color: "rgba(255,255,255,0.03)" },
      { offset: "100%", color: "rgba(255,255,255,0)" }
    ].forEach((stop) => {
      const element = createSvgNode("stop", {
        offset: stop.offset,
        "stop-color": stop.color
      });
      radial.appendChild(element);
    });

    defs.appendChild(radial);
    svg.appendChild(defs);

    const glow = createSvgNode("ellipse", {
      cx: geometry.width * 0.52,
      cy: geometry.height * 0.48,
      rx: 280,
      ry: 220,
      fill: "url(#fieldGlow)"
    });
    svg.appendChild(glow);

    const contourGroup = createSvgNode("g");
    const relationGroup = createSvgNode("g");
    const haloGroup = createSvgNode("g");
    const nodeGroup = createSvgNode("g");

    const contourElements = contours.map((contour) => {
      const path = createSvgNode("path", {
        d: contour.path,
        class: contour.className
      });
      contourGroup.appendChild(path);
      return { el: path, phase: contour.phase };
    });

    const relationElements = geometry.relations.map((relation) => {
      const path = createSvgNode("path", {
        d: relationPath(relation),
        class: `relation-line ${relation.signal > 0.72 ? "signal" : ""} ${relation.active ? "active" : ""}`
      });
      relationGroup.appendChild(path);
      return { el: path, relation };
    });

    const haloElements = [];
    const nodeElements = [];

    geometry.nodes.forEach((node) => {
      const group = createSvgNode("g", {
        class: `node-group ${node.id === state.selectedId ? "active" : ""}`,
        "data-entry-id": node.id
      });

      const halo = createSvgNode("circle", {
        class: "halo",
        cx: node.x.toFixed(2),
        cy: node.y.toFixed(2),
        r: (node.radius * 1.9).toFixed(2)
      });
      halo.style.opacity = (0.05 + node.emphasis * 0.14).toFixed(3);
      haloGroup.appendChild(halo);
      haloElements.push({ el: halo, baseR: node.radius * 1.9, phase: node.phase, entryId: node.id });

      const hit = createSvgNode("circle", {
        class: "node-hit",
        cx: node.x.toFixed(2),
        cy: node.y.toFixed(2),
        r: (node.radius + 16).toFixed(2),
        tabindex: "0",
        role: "button",
        "aria-label": `${node.entry.title}, ${node.entry.type}, ${node.entry.year}`
      });

      const core = createSvgNode("circle", {
        class: `node-core ${node.signal >= 0.72 ? "signal" : ""}`,
        cx: node.x.toFixed(2),
        cy: node.y.toFixed(2),
        r: node.radius.toFixed(2)
      });
      core.style.opacity = (0.72 + node.emphasis * 0.24).toFixed(3);

      const ring = createSvgNode("circle", {
        class: "node-ring",
        cx: node.x.toFixed(2),
        cy: node.y.toFixed(2),
        r: (node.radius + 6).toFixed(2)
      });

      const label = createSvgNode("text", {
        class: "node-label",
        x: (node.x + node.labelDx).toFixed(2),
        y: (node.y - 8).toFixed(2),
        "text-anchor": node.labelAnchor
      });
      label.textContent = node.entry.code;

      const note = createSvgNode("text", {
        class: "node-note",
        x: (node.x + node.labelDx).toFixed(2),
        y: (node.y + 10).toFixed(2),
        "text-anchor": node.labelAnchor
      });
      note.textContent = node.entry.title;

      hit.addEventListener("click", () => selectEntry(node.id, true));
      hit.addEventListener("focus", () => {
        state.hoverId = node.id;
        showTooltipForNode(node);
      });
      hit.addEventListener("blur", () => {
        state.hoverId = null;
        hideTooltip();
      });
      hit.addEventListener("mouseenter", () => {
        state.hoverId = node.id;
      });
      hit.addEventListener("mouseleave", () => {
        state.hoverId = null;
        hideTooltip();
      });
      hit.addEventListener("mousemove", (event) => {
        showTooltipForNode(node, event.clientX, event.clientY);
      });
      hit.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectEntry(node.id, true);
        }
      });

      group.appendChild(hit);
      group.appendChild(core);
      group.appendChild(ring);
      group.appendChild(label);
      group.appendChild(note);
      nodeGroup.appendChild(group);

      nodeElements.push({
        id: node.id,
        node,
        group,
        hit,
        core,
        ring,
        label,
        note,
        baseRadius: node.radius
      });
    });

    svg.appendChild(contourGroup);
    svg.appendChild(relationGroup);
    svg.appendChild(haloGroup);
    svg.appendChild(nodeGroup);

    state.scene = {
      geometry,
      contourElements,
      relationElements,
      haloElements,
      nodeElements
    };

    startAnimation();
  }

  function showTooltipForNode(node, clientX, clientY) {
    if (!clientX || !clientY) {
      const rect = dom.boardView.getBoundingClientRect();
      const x = rect.left + (node.x / 1200) * rect.width;
      const y = rect.top + (node.y / 980) * rect.height;
      updateTooltipPosition(x, y, node.entry.title, node.entry.summary);
      return;
    }

    updateTooltipPosition(clientX, clientY, node.entry.title, node.entry.summary);
  }

  function updateInspector() {
    const entry = currentEntry();
    const mode = currentMode();
    const node = state.scene?.geometry.nodes.find((item) => item.id === entry.id);

    setText(dom.inspectorCode, entry.code);
    setText(dom.inspectorEntryTitle, entry.title);
    setText(dom.inspectorSummary, entry.detail);
    setText(dom.inspectorNote, entry.note);
    setText(dom.inspectorStatus, `${mode.label}`);
    dom.inspectorStatus.classList.add("active");

    const metaItems = [
      ["type", entry.type],
      ["year", entry.year],
      ["x", formatMetric(entryValue(entry, mode.map.xKey))],
      ["y", formatMetric(entryValue(entry, mode.map.yKey))],
      ["focus", formatMetric(entryValue(entry, mode.map.emphasisKey))],
      ["links", String(entry.relations.length)]
    ];
    setHTML(dom.inspectorMeta, createMetricList(metaItems));

    dom.inspectorRelations.innerHTML = [
      ...entry.tags.map((tag) => `<span class="tag">${tag}</span>`),
      ...uniqueRelations(entry).map((related) => `<button class="relation-pill" type="button" data-related-id="${related.id}">${related.code}</button>`)
    ].join("");

    dom.inspectorRelations.querySelectorAll("[data-related-id]").forEach((button) => {
      button.addEventListener("click", () => selectEntry(button.dataset.relatedId, true));
    });

    const coords = [
      [mode.map.xKey, formatMetric(entryValue(entry, mode.map.xKey))],
      [mode.map.yKey, formatMetric(entryValue(entry, mode.map.yKey))],
      ["field", mode.field],
      ["state", mode.state.toLowerCase()],
      ["node x", node ? String(Math.round(node.x)) : "—"],
      ["node y", node ? String(Math.round(node.y)) : "—"]
    ];

    setHTML(dom.coordsList, createMetricList(coords));
  }

  function updateArchiveSelection() {
    dom.archiveGrid.querySelectorAll(".archive-card").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.entryId === state.selectedId));
    });
  }

  function updateNodeSelection() {
    if (!state.scene) return;

    state.scene.nodeElements.forEach((item) => {
      item.group.classList.toggle("active", item.id === state.selectedId);
    });

    state.scene.relationElements.forEach((item) => {
      const active = item.relation.from.id === state.selectedId || item.relation.to.id === state.selectedId;
      item.el.classList.toggle("active", active);
    });
  }

  function selectEntry(entryId, scrollIntoView = false) {
    if (!entryMap.has(entryId)) return;
    state.selectedId = entryId;
    updateInspector();
    updateArchiveSelection();
    updateNodeSelection();

    if (scrollIntoView) {
      const activeCard = dom.archiveGrid.querySelector(`[data-entry-id="${entryId}"]`);
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }

  function updateModeText() {
    const mode = currentMode();

    dom.body.setAttribute("data-mode", mode.id);
    setText(dom.fieldLabel, mode.field);
    setText(dom.cycleModeLabel, mode.label);
    setText(dom.heroKicker, mode.kicker);
    setText(dom.heroTitle, mode.title);
    setText(dom.heroDescription, mode.description);
    setText(dom.modeStatement, mode.statement);
    setText(dom.boardState, `STATE: ${mode.state}`);
    setText(dom.boardYear, `YEAR: ${mode.year}`);
    setText(dom.axisLabelX, mode.axisX);
    setText(dom.axisLabelY, mode.axisY);
    setText(dom.archiveNote, "L’archivio non replica la board: la rende verificabile. Qui ogni elemento conserva titolo, tipo, anno e funzione nel sistema.");
    setText(dom.systemNote, mode.note);
    setHTML(dom.metricsList, createMetricList(computeModeMetrics(mode)));
    setHTML(dom.footerRow, mode.footer.map((item) => `<span>${item}</span>`).join(""));
    setHTML(
      dom.workspaceMeta,
      [
        createMetaChip(mode.label),
        createMetaChip(mode.axisX),
        createMetaChip(mode.axisY),
        createMetaChip(`${data.entries.length} entries`)
      ].join("")
    );

    dom.modeTabs.querySelectorAll(".mode-tab").forEach((button, index) => {
      button.setAttribute("aria-selected", String(index === state.modeIndex));
    });
  }

  function renderAll() {
    updateModeText();
    buildArchive();
    renderField();
    updateInspector();
    updateArchiveSelection();
  }

  function setMode(index) {
    state.modeIndex = index;
    state.seedOffset = 0;
    renderAll();
  }

  function nextMode() {
    const nextIndex = (state.modeIndex + 1) % data.modes.length;
    setMode(nextIndex);
  }

  function toggleGrid() {
    state.showGrid = !state.showGrid;
    dom.body.setAttribute("data-grid", state.showGrid ? "on" : "off");
    dom.gridButton.setAttribute("aria-pressed", String(state.showGrid));
  }

  function toggleLabels() {
    state.showLabels = !state.showLabels;
    dom.body.setAttribute("data-labels", state.showLabels ? "on" : "off");
    dom.labelsButton.setAttribute("aria-pressed", String(state.showLabels));
  }

  function toggleMotion() {
    state.showMotion = !state.showMotion;
    dom.body.setAttribute("data-motion", state.showMotion ? "on" : "off");
    dom.motionButton.setAttribute("aria-pressed", String(state.showMotion));
    startAnimation();
  }

  function reshuffle() {
    state.seedOffset += 1;
    renderField();
    updateInspector();
    updateArchiveSelection();
  }

  function animate(now) {
    if (!state.scene || state.reducedMotion || !state.showMotion) {
      dom.fieldSvg.style.transform = "";
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
      return;
    }

    const t = now * 0.001;
    const activeId = state.selectedId;

    dom.fieldSvg.style.transform = `translate(${(Math.sin(t * 0.22) * 1.2).toFixed(2)}px, ${(Math.cos(t * 0.2) * 0.8).toFixed(2)}px)`;

    state.scene.haloElements.forEach((item) => {
      const isActive = item.entryId === activeId;
      const pulse = 1 + Math.sin(t * (isActive ? 1.8 : 1.1) + item.phase) * (isActive ? 0.12 : 0.04);
      item.el.setAttribute("r", (item.baseR * pulse).toFixed(2));
    });

    state.scene.nodeElements.forEach((item) => {
      const isActive = item.id === activeId;
      const radius = item.baseRadius * (1 + Math.sin(t * 1.6 + item.node.phase) * (isActive ? 0.06 : 0.02));
      item.core.setAttribute("r", radius.toFixed(2));
      item.ring.setAttribute("r", (radius + 6 + (isActive ? 1.4 : 0)).toFixed(2));
    });

    state.scene.contourElements.forEach((item, index) => {
      item.el.style.opacity = (0.48 + Math.sin(t * 0.6 + item.phase + index) * 0.1).toFixed(3);
    });

    state.rafId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    if (state.reducedMotion || !state.showMotion) {
      dom.fieldSvg.style.transform = "";
      return;
    }

    state.rafId = requestAnimationFrame(animate);
  }

  function handlePointerMove(event) {
    if (!dom.cursorHalo || state.reducedMotion) return;
    dom.cursorHalo.style.left = `${event.clientX}px`;
    dom.cursorHalo.style.top = `${event.clientY}px`;
  }

  function bindEvents() {
    dom.cycleModeButton.addEventListener("click", nextMode);
    dom.gridButton.addEventListener("click", toggleGrid);
    dom.labelsButton.addEventListener("click", toggleLabels);
    dom.motionButton.addEventListener("click", toggleMotion);
    dom.reshuffleButton.addEventListener("click", reshuffle);

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key === "m") nextMode();
      if (key === "g") toggleGrid();
      if (key === "l") toggleLabels();
      if (key === "d") toggleMotion();
      if (key === "r") reshuffle();
    });

    window.addEventListener("resize", () => {
      renderField();
      updateInspector();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (state.rafId) cancelAnimationFrame(state.rafId);
        state.rafId = null;
      } else {
        startAnimation();
      }
    });

    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", (event) => {
        state.reducedMotion = event.matches;
        if (event.matches) state.showMotion = false;
        dom.body.setAttribute("data-motion", state.showMotion ? "on" : "off");
        dom.motionButton.setAttribute("aria-pressed", String(state.showMotion));
        startAnimation();
      });
    } else if (typeof prefersReducedMotion.addListener === "function") {
      prefersReducedMotion.addListener((event) => {
        state.reducedMotion = event.matches;
        if (event.matches) state.showMotion = false;
        dom.body.setAttribute("data-motion", state.showMotion ? "on" : "off");
        dom.motionButton.setAttribute("aria-pressed", String(state.showMotion));
        startAnimation();
      });
    }
  }

  function init() {
    buildModeTabs();
    dom.body.setAttribute("data-grid", state.showGrid ? "on" : "off");
    dom.body.setAttribute("data-labels", state.showLabels ? "on" : "off");
    dom.body.setAttribute("data-motion", state.showMotion ? "on" : "off");
    dom.gridButton.setAttribute("aria-pressed", String(state.showGrid));
    dom.labelsButton.setAttribute("aria-pressed", String(state.showLabels));
    dom.motionButton.setAttribute("aria-pressed", String(state.showMotion));
    renderAll();
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
