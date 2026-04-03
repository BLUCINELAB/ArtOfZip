(() => {
  const data = window.SpecimenContent;

  if (!data || !Array.isArray(data.modes) || !Array.isArray(data.fragments)) {
    console.warn("SpecimenContent missing or invalid.");
    return;
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const TAU = Math.PI * 2;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const entryMap = new Map(data.fragments.map((fragment) => [fragment.id, fragment]));
  const startingModeIndex = data.modes.findIndex((mode) => mode.id === document.body.dataset.mode);

  const $ = (selector, root = document) => root.querySelector(selector);

  const dom = {
    body: document.body,
    prelude: $("#sitePrelude"),
    preludeEyebrow: $("#preludeEyebrow"),
    preludeTitle: $("#preludeTitle"),
    preludeCopy: $("#preludeCopy"),
    enterFieldButton: $("#enterFieldButton"),
    cursorHalo: $("#cursorHalo"),

    mastheadField: $("#mastheadField"),
    cycleModeButton: $("#cycleModeButton"),
    cycleModeLabel: $("#cycleModeLabel"),

    heroKicker: $("#heroKicker"),
    heroTitle: $("#heroTitle"),
    heroDescription: $("#heroDescription"),
    modeStatement: $("#modeStatement"),
    modeTabs: $("#modeTabs"),
    ritualList: $("#ritualList"),

    metaRow: $("#metaRow"),
    fieldState: $("#fieldState"),
    fieldYear: $("#fieldYear"),
    axisX: $("#axisX"),
    axisY: $("#axisY"),
    fieldBoard: $("#fieldBoard"),
    fieldSvg: $("#fieldSvg"),
    fieldTooltip: $("#fieldTooltip"),
    fieldCaption: $("#fieldCaption"),

    gridButton: $("#gridButton"),
    labelsButton: $("#labelsButton"),
    motionButton: $("#motionButton"),
    constellationButton: $("#constellationButton"),
    recomposeButton: $("#recomposeButton"),

    inspectorStatus: $("#inspectorStatus"),
    inspectorCode: $("#inspectorCode"),
    inspectorHeading: $("#inspectorHeading"),
    inspectorSummary: $("#inspectorSummary"),
    inspectorGrid: $("#inspectorGrid"),
    inspectorReading: $("#inspectorReading"),
    inspectorConnections: $("#inspectorConnections"),
    manifestLine: $("#manifestLine"),

    statementText: $("#statementText"),
    metricsList: $("#metricsList"),
    coordsList: $("#coordsList"),

    archiveNote: $("#archiveNote"),
    archiveGrid: $("#archiveGrid"),

    codaTitle: $("#codaTitle"),
    codaText: $("#codaText"),
    codaRow: $("#codaRow"),

    footerRow: $("#footerRow")
  };

  const state = {
    modeIndex: startingModeIndex >= 0 ? startingModeIndex : 0,
    selectedId: data.fragments[0]?.id ?? null,
    hoveredId: null,
    seedOffset: 0,
    showGrid: true,
    showLabels: true,
    showMotion: !prefersReducedMotion.matches,
    showConstellation: true,
    reducedMotion: prefersReducedMotion.matches,
    scene: null,
    rafId: null,
    revealObserver: null,
    introDismissed: false
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function setHTML(element, value) {
    if (element) element.innerHTML = value;
  }

  function currentMode() {
    return data.modes[state.modeIndex] || data.modes[0];
  }

  function currentFragment() {
    return entryMap.get(state.selectedId) || data.fragments[0];
  }

  function metricValue(fragment, key) {
    const value = fragment?.metrics?.[key];
    return typeof value === "number" ? value : 0;
  }

  function formatMetric(value) {
    return typeof value === "number" ? value.toFixed(2) : String(value);
  }

  function seededRandom(seed) {
    let current = seed % 2147483647;
    if (current <= 0) current += 2147483646;
    return () => (current = (current * 16807) % 2147483647) / 2147483647;
  }

  function chip(text) {
    return `<span class="meta-chip">${text}</span>`;
  }

  function metricList(items) {
    return items
      .map(([key, value]) => `<span>${key}</span><strong>${value}</strong>`)
      .join("");
  }

  function relationNetwork(id) {
    const set = new Set([id]);
    if (!state.scene?.scene?.relations) return set;

    state.scene.scene.relations.forEach((relation) => {
      if (relation.fromId === id || relation.toId === id) {
        set.add(relation.fromId);
        set.add(relation.toId);
      }
    });

    return set;
  }

  function buildPrelude() {
    const prelude = data.site?.prelude;
    if (!prelude) return;

    setText(dom.preludeEyebrow, prelude.eyebrow);
    setText(dom.preludeTitle, prelude.title);
    setText(dom.preludeCopy, prelude.copy);
    setText(dom.enterFieldButton, prelude.button);
  }

  function buildRituals() {
    const rituals = data.site?.rituals || [];
    setHTML(
      dom.ritualList,
      rituals
        .map(
          ([key, copy]) => `
            <div class="ritual-item">
              <span class="ritual-key">${key}</span>
              <span class="ritual-copy">${copy}</span>
            </div>
          `
        )
        .join("")
    );
  }

  function buildCoda() {
    const coda = data.site?.coda;
    if (!coda) return;

    setText(dom.codaTitle, coda.title);
    setText(dom.codaText, coda.copy);
    setHTML(dom.codaRow, (coda.pills || []).map((item) => `<span class="coda-pill">${item}</span>`).join(""));
  }

  function buildModeTabs() {
    setHTML(
      dom.modeTabs,
      data.modes
        .map(
          (mode, index) => `
            <button
              class="mode-tab"
              type="button"
              role="tab"
              data-mode-index="${index}"
              aria-selected="${index === state.modeIndex ? "true" : "false"}"
            >
              ${mode.label}
            </button>
          `
        )
        .join("")
    );

    dom.modeTabs.querySelectorAll(".mode-tab").forEach((button) => {
      button.addEventListener("click", () => setMode(Number(button.dataset.modeIndex)));
    });
  }

  function buildArchive() {
    setHTML(
      dom.archiveGrid,
      data.fragments
        .map((fragment) => {
          const active = fragment.id === state.selectedId;
          return `
            <button
              class="archive-card"
              type="button"
              data-fragment-id="${fragment.id}"
              aria-pressed="${active ? "true" : "false"}"
            >
              <div class="archive-card-top">
                <span>${fragment.code}</span>
                <span>${fragment.kind}</span>
              </div>

              <h3 class="archive-card-title">${fragment.title}</h3>
              <p class="archive-card-summary">${fragment.summary}</p>

              <div class="archive-divider" aria-hidden="true"></div>

              <div class="archive-card-meta">
                <span>${fragment.year}</span>
                <span>${fragment.tags[0]}</span>
                <span>${fragment.tags[1] || fragment.tags[0]}</span>
              </div>
            </button>
          `;
        })
        .join("")
    );

    dom.archiveGrid.querySelectorAll(".archive-card").forEach((button) => {
      button.addEventListener("click", () => selectFragment(button.dataset.fragmentId, true));
    });
  }

  function renderModeText() {
    const mode = currentMode();

    setText(dom.mastheadField, data.site?.fieldLabel || "METHOD / DREAM / TRACE");
    setText(dom.cycleModeLabel, mode.label);
    setText(dom.heroKicker, mode.kicker);
    setText(dom.heroTitle, mode.title);
    setText(dom.heroDescription, mode.description);
    setText(dom.modeStatement, mode.statement);

    setText(dom.fieldState, `STATE: ${mode.state}`);
    setText(dom.fieldYear, `YEAR: ${mode.year}`);
    setText(dom.axisX, mode.axisX);
    setText(dom.axisY, mode.axisY);
    setText(dom.fieldCaption, mode.note);

    setText(dom.statementText, mode.thesis);
    setText(dom.archiveNote, mode.archiveNote);

    setHTML(dom.footerRow, (data.site?.footer || []).map((item) => `<span>${item}</span>`).join(""));

    const xValues = data.fragments.map((fragment) => metricValue(fragment, mode.map.xKey));
    const yValues = data.fragments.map((fragment) => metricValue(fragment, mode.map.yKey));
    const focusValues = data.fragments.map((fragment) => metricValue(fragment, mode.map.emphasisKey));

    setHTML(
      dom.metricsList,
      metricList([
        ["entries", String(data.fragments.length)],
        ["x avg", formatMetric(mean(xValues))],
        ["y avg", formatMetric(mean(yValues))],
        ["focus", formatMetric(mean(focusValues))],
        ...mode.metrics
      ])
    );

    setHTML(
      dom.metaRow,
      [
        chip(mode.label),
        chip(mode.axisX),
        chip(mode.axisY),
        chip("interactive portrait")
      ].join("")
    );

    dom.modeTabs.querySelectorAll(".mode-tab").forEach((tab, index) => {
      tab.setAttribute("aria-selected", String(index === state.modeIndex));
    });

    dom.body.setAttribute("data-mode", mode.id);
  }

  function sceneProfile() {
    const mode = currentMode();

    return {
      layout: {
        scatterX: mode.layout?.scatterX ?? 0.26,
        scatterY: mode.layout?.scatterY ?? 0.24,
        biasX: mode.layout?.biasX ?? 0,
        biasY: mode.layout?.biasY ?? 0,
        quantize: Boolean(mode.layout?.quantize),
        curvature: mode.layout?.curvature ?? 0.16
      },
      motion: {
        driftX: mode.motion?.driftX ?? 0.4,
        driftY: mode.motion?.driftY ?? 0.3,
        sway: mode.motion?.sway ?? 0.25,
        pulse: mode.motion?.pulse ?? 0.06,
        bandBase: mode.motion?.bandBase ?? 0.24,
        bandRange: mode.motion?.bandRange ?? 0.04,
        bandSpeed: mode.motion?.bandSpeed ?? 0.3,
        svgDriftX: mode.motion?.svgDriftX ?? 0.6,
        svgDriftY: mode.motion?.svgDriftY ?? 0.35,
        echoOpacity: mode.motion?.echoOpacity ?? 0.08
      }
    };
  }

  function computeScene() {
    const mode = currentMode();
    const profile = sceneProfile();
    const rand = seededRandom((state.modeIndex + 1) * 2843 + (state.seedOffset + 1) * 7331);

    const width = 1320;
    const height = 940;
    const marginX = 110;
    const marginY = 92;

    const nodes = data.fragments.map((fragment, index) => {
      const xBase = metricValue(fragment, mode.map.xKey);
      const yBase = metricValue(fragment, mode.map.yKey);
      const cluster = metricValue(fragment, mode.map.clusterKey);
      const emphasis = metricValue(fragment, mode.map.emphasisKey);
      const presence = metricValue(fragment, "presence");
      const memory = metricValue(fragment, "memory");
      const residue = metricValue(fragment, "residue");

      let x = marginX + xBase * (width - marginX * 2);
      let y = height - marginY - yBase * (height - marginY * 2);

      const wobbleX =
        (rand() - 0.5) * 84 +
        Math.sin(index * 1.37 + state.seedOffset * 0.8) * (8 + cluster * 28);

      const wobbleY =
        (rand() - 0.5) * 66 +
        Math.cos(index * 1.51 + state.seedOffset * 0.7) * (8 + emphasis * 18);

      x += wobbleX * profile.layout.scatterX + profile.layout.biasX * (presence - 0.5) * 140;
      y += wobbleY * profile.layout.scatterY + profile.layout.biasY * (memory - 0.5) * 120;

      if (mode.id === "vision") {
        y -= presence * 18;
      }

      if (mode.id === "system") {
        x = Math.round(x / 28) * 28;
        y = Math.round(y / 28) * 28;
      }

      if (mode.id === "trace") {
        x -= memory * 20;
        y += residue * 16;
      }

      x = clamp(x, 88, width - 88);
      y = clamp(y, 82, height - 82);

      return {
        id: fragment.id,
        fragment,
        x,
        y,
        radius: 11 + emphasis * 14,
        emphasis,
        cluster,
        phase: rand() * TAU,
        speed: 0.45 + rand() * 0.55,
        floatX: 4 + cluster * 11,
        floatY: 3 + emphasis * 9
      };
    });

    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const relations = [];
    const seen = new Set();

    data.fragments.forEach((fragment) => {
      fragment.relations.forEach((relatedId) => {
        const a = nodeMap.get(fragment.id);
        const b = nodeMap.get(relatedId);
        if (!a || !b) return;

        const key = [a.id, b.id].sort().join(":");
        if (seen.has(key)) return;
        seen.add(key);

        relations.push({
          key,
          fromId: a.id,
          toId: b.id,
          strength: (a.emphasis + b.emphasis) / 2
        });
      });
    });

    return {
      width,
      height,
      nodes,
      relations,
      zones: mode.zones || [],
      profile
    };
  }

  function relationPath(from, to) {
    const curvature = state.scene?.scene?.profile?.layout?.curvature ?? 0.16;
    const dx = Math.abs(to.x - from.x);
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2 - 30 - dx * curvature;
    return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} Q ${mx.toFixed(2)} ${my.toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
  }

  function createSvg(tag, attrs = {}) {
    const element = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    return element;
  }

  function bandPath(zone, width, height) {
    const x = zone.x * width;
    const y = zone.y * height;
    const w = zone.w * width;
    const h = zone.h * height;

    return `
      M ${x.toFixed(2)} ${(y + h * 0.14).toFixed(2)}
      Q ${(x + w * 0.16).toFixed(2)} ${y.toFixed(2)} ${(x + w * 0.5).toFixed(2)} ${(y + h * 0.12).toFixed(2)}
      T ${(x + w).toFixed(2)} ${(y + h * 0.2).toFixed(2)}
      Q ${(x + w * 0.84).toFixed(2)} ${(y + h * 0.72).toFixed(2)} ${(x + w * 0.54).toFixed(2)} ${(y + h).toFixed(2)}
      T ${x.toFixed(2)} ${(y + h * 0.74).toFixed(2)}
      Q ${(x + w * 0.06).toFixed(2)} ${(y + h * 0.42).toFixed(2)} ${x.toFixed(2)} ${(y + h * 0.14).toFixed(2)}
    `;
  }

  function updateTooltip(clientX, clientY, fragment) {
    const tooltip = dom.fieldTooltip;
    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${fragment.title}</strong><br>${fragment.summary}`;

    const rect = dom.fieldBoard.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const left = clamp(clientX - rect.left + 18, 16, rect.width - tooltipRect.width - 16);
    const top = clamp(clientY - rect.top - tooltipRect.height - 16, 16, rect.height - tooltipRect.height - 16);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    dom.fieldTooltip.hidden = true;
  }

  function applyNodeVisuals(item, x, y, radius, { active, hovered }) {
    const modeMotion = state.scene?.scene?.profile?.motion;
    const echoOpacity = modeMotion?.echoOpacity ?? 0.08;
    const anchor = x > state.scene.scene.width * 0.72 ? "end" : "start";
    const dx = anchor === "end" ? -20 : 20;

    item.currentX = x;
    item.currentY = y;
    item.currentR = radius;

    item.aura.setAttribute("cx", x.toFixed(2));
    item.aura.setAttribute("cy", y.toFixed(2));
    item.aura.setAttribute("r", (radius * (active ? 2.16 : hovered ? 1.94 : 1.72)).toFixed(2));
    item.aura.style.opacity = (active ? 0.26 : hovered ? 0.2 : 0.12).toFixed(3);

    item.echo.setAttribute("cx", x.toFixed(2));
    item.echo.setAttribute("cy", y.toFixed(2));
    item.echo.setAttribute("r", (radius * (active ? 3.16 : 2.56)).toFixed(2));
    item.echo.style.opacity = (active ? echoOpacity * 1.2 : echoOpacity).toFixed(3);

    item.hit.setAttribute("cx", x.toFixed(2));
    item.hit.setAttribute("cy", y.toFixed(2));
    item.hit.setAttribute("r", (radius + 18).toFixed(2));

    item.core.setAttribute("cx", x.toFixed(2));
    item.core.setAttribute("cy", y.toFixed(2));
    item.core.setAttribute("r", radius.toFixed(2));
    item.core.style.opacity = (0.76 + item.node.emphasis * 0.2).toFixed(3);

    item.ring.setAttribute("cx", x.toFixed(2));
    item.ring.setAttribute("cy", y.toFixed(2));
    item.ring.setAttribute("r", (radius + 7 + (active ? 1.6 : 0)).toFixed(2));

    item.code.setAttribute("x", (x + dx).toFixed(2));
    item.code.setAttribute("y", (y - 8).toFixed(2));
    item.code.setAttribute("text-anchor", anchor);
    item.code.textContent = item.node.fragment.code;

    item.title.setAttribute("x", (x + dx).toFixed(2));
    item.title.setAttribute("y", (y + 14).toFixed(2));
    item.title.setAttribute("text-anchor", anchor);
    item.title.textContent = item.node.fragment.title;
  }

  function updateRelationPaths() {
    if (!state.scene) return;

    const live = new Map(
      state.scene.nodeElements.map((item) => [
        item.id,
        { x: item.currentX ?? item.node.x, y: item.currentY ?? item.node.y }
      ])
    );

    state.scene.relationElements.forEach((item, index) => {
      const from = live.get(item.relation.fromId);
      const to = live.get(item.relation.toId);
      if (!from || !to) return;

      item.el.setAttribute("d", relationPath(from, to));
      item.el.style.opacity = (0.12 + item.relation.strength * 0.28).toFixed(3);
      item.el.style.strokeDashoffset = String(index * 14);
    });
  }

  function renderField() {
    const scene = computeScene();
    const svg = dom.fieldSvg;
    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 ${scene.width} ${scene.height}`);

    const defs = createSvg("defs");

    const glowFilter = createSvg("filter", {
      id: "softGlow",
      x: "-60%",
      y: "-60%",
      width: "220%",
      height: "220%"
    });

    glowFilter.appendChild(createSvg("feGaussianBlur", { stdDeviation: "18" }));
    defs.appendChild(glowFilter);

    svg.appendChild(defs);

    const bandGroup = createSvg("g");
    const relationGroup = createSvg("g");
    const nodeGroup = createSvg("g");

    const bandElements = scene.zones.map((zone, index) => {
      const path = createSvg("path", {
        class: "field-band",
        d: bandPath(zone, scene.width, scene.height)
      });

      const label = createSvg("text", {
        class: "band-label",
        x: 132,
        y: 104 + index * 28
      });

      label.textContent = zone.label;
      bandGroup.appendChild(path);
      bandGroup.appendChild(label);

      return { path, label, phase: index * 0.9 };
    });

    const nodeElements = scene.nodes.map((node, index) => {
      const group = createSvg("g", {
        class: "node-group",
        "data-fragment-id": node.id
      });

      const aura = createSvg("circle", {
        class: "node-aura",
        filter: "url(#softGlow)"
      });

      const echo = createSvg("circle", {
        class: "node-echo"
      });

      const hit = createSvg("circle", {
        class: "node-hit",
        tabindex: "0",
        role: "button",
        "aria-label": `${node.fragment.title}, ${node.fragment.kind}`
      });

      const core = createSvg("circle", {
        class: "node-core"
      });

      const ring = createSvg("circle", {
        class: "node-ring"
      });

      const code = createSvg("text", {
        class: "node-label"
      });

      const title = createSvg("text", {
        class: "node-note"
      });

      const item = {
        id: node.id,
        node,
        group,
        aura,
        echo,
        hit,
        core,
        ring,
        code,
        title,
        currentX: node.x,
        currentY: node.y,
        currentR: node.radius
      };

      applyNodeVisuals(item, node.x, node.y, node.radius, {
        active: node.id === state.selectedId,
        hovered: false
      });

      const focusNode = () => selectFragment(node.id, false);

      hit.addEventListener("click", focusNode);
      hit.addEventListener("focus", () => {
        state.hoveredId = node.id;
        syncSelection();

        const rect = dom.fieldBoard.getBoundingClientRect();
        const x = rect.left + (item.currentX / scene.width) * rect.width;
        const y = rect.top + (item.currentY / scene.height) * rect.height;
        updateTooltip(x, y, node.fragment);
      });

      hit.addEventListener("blur", () => {
        state.hoveredId = null;
        syncSelection();
        hideTooltip();
      });

      hit.addEventListener("mouseenter", (event) => {
        state.hoveredId = node.id;
        syncSelection();
        updateTooltip(event.clientX, event.clientY, node.fragment);
      });

      hit.addEventListener("mousemove", (event) => {
        updateTooltip(event.clientX, event.clientY, node.fragment);
      });

      hit.addEventListener("mouseleave", () => {
        state.hoveredId = null;
        syncSelection();
        hideTooltip();
      });

      hit.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          focusNode();
        }
      });

      group.appendChild(aura);
      group.appendChild(echo);
      group.appendChild(hit);
      group.appendChild(core);
      group.appendChild(ring);
      group.appendChild(code);
      group.appendChild(title);

      nodeGroup.appendChild(group);

      return item;
    });

    const relationElements = scene.relations.map((relation) => {
      const path = createSvg("path", {
        class: "relation-line"
      });

      relationGroup.appendChild(path);
      return { el: path, relation };
    });

    svg.appendChild(bandGroup);
    svg.appendChild(relationGroup);
    svg.appendChild(nodeGroup);

    state.scene = {
      scene,
      bandElements,
      relationElements,
      nodeElements
    };

    updateRelationPaths();
    syncSelection();
    startAnimation();
  }

  function syncSelection() {
    if (!state.scene) return;

    const network = relationNetwork(state.selectedId);
    const hoveredId = state.hoveredId;

    state.scene.nodeElements.forEach((item) => {
      const active = item.id === state.selectedId;
      const linked = network.has(item.id);
      const hovered = item.id === hoveredId;
      const dimmed = state.showConstellation ? !linked : false;

      item.group.classList.toggle("active", active);
      item.group.classList.toggle("linked", linked && !active);
      item.group.classList.toggle("hovered", hovered);
      item.group.classList.toggle("dimmed", dimmed);
    });

    state.scene.relationElements.forEach((item) => {
      const active =
        item.relation.fromId === state.selectedId || item.relation.toId === state.selectedId;

      const hovered =
        hoveredId &&
        (item.relation.fromId === hoveredId || item.relation.toId === hoveredId);

      const linked =
        network.has(item.relation.fromId) && network.has(item.relation.toId);

      const dimmed = state.showConstellation ? !linked : false;

      item.el.classList.toggle("active", active);
      item.el.classList.toggle("hovered", Boolean(hovered));
      item.el.classList.toggle("dimmed", dimmed);
    });

    dom.archiveGrid.querySelectorAll(".archive-card").forEach((card) => {
      card.setAttribute("aria-pressed", String(card.dataset.fragmentId === state.selectedId));
    });
  }

  function renderInspector() {
    const mode = currentMode();
    const fragment = currentFragment();
    const node = state.scene?.nodeElements.find((item) => item.id === fragment.id);

    setText(dom.inspectorStatus, mode.label);
    setText(dom.inspectorCode, fragment.code);
    setText(dom.inspectorHeading, fragment.title);
    setText(dom.inspectorSummary, fragment.summary);
    setText(dom.inspectorReading, fragment.reading);
    setText(dom.manifestLine, fragment.line);

    setHTML(
      dom.inspectorGrid,
      metricList([
        ["kind", fragment.kind],
        ["year", fragment.year],
        [mode.map.xKey, formatMetric(metricValue(fragment, mode.map.xKey))],
        [mode.map.yKey, formatMetric(metricValue(fragment, mode.map.yKey))],
        ["presence", formatMetric(metricValue(fragment, "presence"))],
        ["method", formatMetric(metricValue(fragment, "method"))]
      ])
    );

    setHTML(
      dom.inspectorConnections,
      [
        ...fragment.tags.map((tag) => `<span class="tag">${tag}</span>`),
        ...fragment.relations
          .map((id) => entryMap.get(id))
          .filter(Boolean)
          .map(
            (related) =>
              `<button class="relation-pill" type="button" data-related-id="${related.id}">${related.code}</button>`
          )
      ].join("")
    );

    dom.inspectorConnections.querySelectorAll("[data-related-id]").forEach((button) => {
      button.addEventListener("click", () => selectFragment(button.dataset.relatedId, true));
    });

    setHTML(
      dom.coordsList,
      metricList([
        [mode.map.xKey, formatMetric(metricValue(fragment, mode.map.xKey))],
        [mode.map.yKey, formatMetric(metricValue(fragment, mode.map.yKey))],
        ["heat", formatMetric(metricValue(fragment, "heat"))],
        ["research", formatMetric(metricValue(fragment, "research"))],
        ["node x", node ? Math.round(node.currentX ?? node.node.x) : "—"],
        ["node y", node ? Math.round(node.currentY ?? node.node.y) : "—"]
      ])
    );
  }

  function renderAll() {
    renderModeText();
    buildArchive();
    renderField();
    renderInspector();
  }

  function selectFragment(id, scrollCard) {
    if (!entryMap.has(id)) return;

    state.selectedId = id;
    syncSelection();
    renderInspector();

    if (scrollCard) {
      const card = dom.archiveGrid.querySelector(`[data-fragment-id="${id}"]`);
      if (card) {
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest"
        });
      }
    }
  }

  function setMode(index) {
    state.modeIndex = (index + data.modes.length) % data.modes.length;
    state.seedOffset = 0;
    state.hoveredId = null;
    hideTooltip();
    renderAll();
  }

  function nextMode() {
    setMode(state.modeIndex + 1);
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

  function toggleConstellation() {
    state.showConstellation = !state.showConstellation;
    dom.body.setAttribute("data-constellation", state.showConstellation ? "on" : "off");
    dom.constellationButton.setAttribute("aria-pressed", String(state.showConstellation));
    syncSelection();
  }

  function recompose() {
    state.seedOffset += 1;
    renderField();
    renderInspector();
  }

  function resetSceneVisuals() {
    if (!state.scene) return;

    dom.fieldSvg.style.transform = "";

    state.scene.nodeElements.forEach((item) => {
      applyNodeVisuals(item, item.node.x, item.node.y, item.node.radius, {
        active: item.id === state.selectedId,
        hovered: item.id === state.hoveredId
      });
    });

    state.scene.bandElements.forEach((item) => {
      item.path.style.opacity = String(state.scene.scene.profile.motion.bandBase);
      item.label.style.opacity = "1";
    });

    updateRelationPaths();
  }

  function animate(now) {
    if (!state.scene || state.reducedMotion || !state.showMotion) {
      if (state.rafId) cancelAnimationFrame(state.rafId);
      state.rafId = null;
      resetSceneVisuals();
      return;
    }

    const t = now * 0.001;
    const motion = state.scene.scene.profile.motion;

    dom.fieldSvg.style.transform = `translate(${(Math.sin(t * 0.23) * motion.svgDriftX).toFixed(2)}px, ${(Math.cos(t * 0.19) * motion.svgDriftY).toFixed(2)}px)`;

    state.scene.bandElements.forEach((item, index) => {
      item.path.style.opacity = (
        motion.bandBase +
        Math.sin(t * motion.bandSpeed + item.phase + index) * motion.bandRange
      ).toFixed(3);

      item.label.style.opacity = (
        0.18 + Math.sin(t * 0.27 + item.phase) * 0.04
      ).toFixed(3);
    });

    state.scene.nodeElements.forEach((item, index) => {
      const active = item.id === state.selectedId;
      const hovered = item.id === state.hoveredId;
      const multiplier = active ? 1.26 : hovered ? 1.12 : 1;

      const x =
        item.node.x +
        Math.sin(t * item.node.speed + item.node.phase) * item.node.floatX * motion.driftX * multiplier +
        Math.cos(t * 0.21 + index) * motion.sway;

      const y =
        item.node.y +
        Math.cos(t * item.node.speed * 0.92 + item.node.phase) * item.node.floatY * motion.driftY * multiplier;

      const pulse =
        1 +
        Math.sin(t * (active ? 1.55 : 1.02) + item.node.phase) *
          (active ? motion.pulse : motion.pulse * 0.36) +
        (hovered ? 0.028 : 0);

      const radius = item.node.radius * pulse;

      applyNodeVisuals(item, x, y, radius, { active, hovered });
    });

    updateRelationPaths();

    state.scene.relationElements.forEach((item, index) => {
      item.el.style.strokeDashoffset = (
        (t * (12 + item.relation.strength * 22)) + index * 16
      ).toFixed(2);
    });

    state.rafId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    if (state.reducedMotion || !state.showMotion) {
      resetSceneVisuals();
      return;
    }

    state.rafId = requestAnimationFrame(animate);
  }

  function handlePointer(event) {
    if (!dom.cursorHalo || state.reducedMotion) return;
    dom.cursorHalo.style.left = `${event.clientX}px`;
    dom.cursorHalo.style.top = `${event.clientY}px`;
  }

  function dismissPrelude() {
    if (state.introDismissed) return;
    state.introDismissed = true;
    dom.body.setAttribute("data-intro", "done");
    dom.prelude.setAttribute("aria-hidden", "true");
  }

  function initRevealObserver() {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    state.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          state.revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    elements.forEach((element) => state.revealObserver.observe(element));
  }

  function bindEvents() {
    dom.enterFieldButton.addEventListener("click", dismissPrelude);
    dom.cycleModeButton.addEventListener("click", nextMode);
    dom.gridButton.addEventListener("click", toggleGrid);
    dom.labelsButton.addEventListener("click", toggleLabels);
    dom.motionButton.addEventListener("click", toggleMotion);
    dom.constellationButton.addEventListener("click", toggleConstellation);
    dom.recomposeButton.addEventListener("click", recompose);

    document.addEventListener("pointermove", handlePointer);

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if (key === "escape") dismissPrelude();
      if (key === "m") nextMode();
      if (key === "g") toggleGrid();
      if (key === "l") toggleLabels();
      if (key === "d") toggleMotion();
      if (key === "c") toggleConstellation();
      if (key === "r") recompose();
    });

    window.addEventListener("resize", () => {
      renderField();
      renderInspector();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (state.rafId) cancelAnimationFrame(state.rafId);
        state.rafId = null;
      } else {
        startAnimation();
      }
    });

    const motionListener = (event) => {
      state.reducedMotion = event.matches;

      if (event.matches) {
        state.showMotion = false;
      }

      dom.body.setAttribute("data-motion", state.showMotion ? "on" : "off");
      dom.motionButton.setAttribute("aria-pressed", String(state.showMotion));
      startAnimation();
    };

    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", motionListener);
    } else if (typeof prefersReducedMotion.addListener === "function") {
      prefersReducedMotion.addListener(motionListener);
    }
  }

  function init() {
    dom.body.setAttribute("data-grid", state.showGrid ? "on" : "off");
    dom.body.setAttribute("data-labels", state.showLabels ? "on" : "off");
    dom.body.setAttribute("data-motion", state.showMotion ? "on" : "off");
    dom.body.setAttribute("data-constellation", state.showConstellation ? "on" : "off");

    dom.gridButton.setAttribute("aria-pressed", String(state.showGrid));
    dom.labelsButton.setAttribute("aria-pressed", String(state.showLabels));
    dom.motionButton.setAttribute("aria-pressed", String(state.showMotion));
    dom.constellationButton.setAttribute("aria-pressed", String(state.showConstellation));

    buildPrelude();
    buildRituals();
    buildModeTabs();
    buildCoda();
    renderAll();
    initRevealObserver();
    bindEvents();

    const introDelay = state.reducedMotion ? 220 : 1650;
    window.setTimeout(dismissPrelude, introDelay);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
