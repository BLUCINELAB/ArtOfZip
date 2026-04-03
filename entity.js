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
    ambientMeta: $("#ambientMeta"),
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
    inspectorContent: $("#inspectorContent"),
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

    sequenceNote: $("#sequenceNote"),
    beatGrid: $("#beatGrid"),

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

    compact: false,
    narrow: false,
    touchLikely: false,

    scene: null,
    rafId: null,
    haloRafId: null,
    fieldObserver: null,
    revealObserver: null,

    introDismissed: false,
    fieldVisible: true,

    haloX: window.innerWidth * 0.5,
    haloY: window.innerHeight * 0.5,
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.5
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
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

  function chip(text) {
    return `<span class="meta-chip">${text}</span>`;
  }

  function metricList(items) {
    return items
      .map(([key, value]) => `<span>${key}</span><strong>${value}</strong>`)
      .join("");
  }

  function seededRandom(seed) {
    let current = seed % 2147483647;
    if (current <= 0) current += 2147483646;
    return () => (current = (current * 16807) % 2147483647) / 2147483647;
  }

  function createSvgEl(tag, attrs = {}) {
    const element = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    return element;
  }

  function withInspectorFade(fn) {
    const el = dom.inspectorContent;
    if (!el || state.reducedMotion) {
      fn();
      return;
    }

    el.classList.add("fading");
    setTimeout(() => {
      fn();
      el.classList.remove("fading");
    }, 140);
  }

  function withTransition(fn) {
    if (document.startViewTransition && !state.reducedMotion) {
      document.startViewTransition(fn);
    } else {
      fn();
    }
  }

  function updateViewportFlags() {
    state.compact = window.innerWidth <= 920;
    state.narrow = window.innerWidth <= 640;
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

  function directRelations(id) {
    const set = new Set();
    const fragment = entryMap.get(id);
    if (!fragment?.relations) return set;
    fragment.relations.forEach((relatedId) => set.add(relatedId));
    return set;
  }

  function updateHash() {
    const mode = currentMode();
    const fragment = currentFragment();
    history.replaceState(null, "", `#${mode.id}/${fragment.id}`);
  }

  function readHash() {
    const raw = location.hash.replace("#", "");
    if (!raw) return;

    const [modeId, fragmentId] = raw.split("/");
    const modeIdx = data.modes.findIndex((mode) => mode.id === modeId);
    if (modeIdx >= 0) state.modeIndex = modeIdx;
    if (fragmentId && entryMap.has(fragmentId)) state.selectedId = fragmentId;
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
    setHTML(
      dom.codaRow,
      (coda.pills || []).map((item) => `<span class="coda-pill">${item}</span>`).join("")
    );
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
                <span>${fragment.tags?.[0] || fragment.kind}</span>
                <span>${fragment.tags?.[1] || fragment.tags?.[0] || fragment.kind}</span>
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
    setText(dom.ambientMeta, mode.ambient);

    setText(dom.fieldState, `STATE: ${mode.state}`);
    setText(dom.fieldYear, `YEAR: ${mode.year}`);
    setText(dom.axisX, mode.axisX);
    setText(dom.axisY, mode.axisY);
    setText(dom.fieldCaption, mode.note);

    setText(dom.statementText, mode.thesis);
    setText(dom.sequenceNote, mode.sequenceNote);
    setText(dom.archiveNote, mode.archiveNote);

    setHTML(
      dom.footerRow,
      (data.site?.footer || []).map((item) => `<span>${item}</span>`).join("")
    );

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
        chip(state.narrow ? "compact field" : "interactive portrait")
      ].join("")
    );

    dom.modeTabs.querySelectorAll(".mode-tab").forEach((tab, index) => {
      tab.setAttribute("aria-selected", String(index === state.modeIndex));
    });

    dom.body.setAttribute("data-mode", mode.id);
  }

  function renderBeats() {
    const fragment = currentFragment();
    const beats = fragment.beats || [];

    setHTML(
      dom.beatGrid,
      beats
        .map(
          (beat, index) => `
            <article class="beat-card">
              <span class="beat-index">beat ${index + 1}</span>
              <h3 class="beat-title">${beat.title}</h3>
              <p class="beat-copy">${beat.copy}</p>
            </article>
          `
        )
        .join("")
    );
  }

  function sceneProfile() {
    const mode = currentMode();

    return {
      layout: {
        scatterX: mode.layout?.scatterX ?? 0.26,
        scatterY: mode.layout?.scatterY ?? 0.24,
        biasX: mode.layout?.biasX ?? 0,
        biasY: mode.layout?.biasY ?? 0,
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

  function computeBaseNode(fragment, index, rand, width, height, marginX, marginY, profile, mode) {
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
      (rand() - 0.5) * 90 +
      Math.sin(index * 1.37 + state.seedOffset * 0.78) * (8 + cluster * 28);

    const wobbleY =
      (rand() - 0.5) * 68 +
      Math.cos(index * 1.53 + state.seedOffset * 0.71) * (8 + emphasis * 18);

    x += wobbleX * profile.layout.scatterX + profile.layout.biasX * (presence - 0.5) * 136;
    y += wobbleY * profile.layout.scatterY + profile.layout.biasY * (memory - 0.5) * 112;

    if (mode.id === "vision") y -= presence * 18;
    if (mode.id === "system") {
      x = Math.round(x / 22) * 22;
      y = Math.round(y / 22) * 22;
    }
    if (mode.id === "trace") {
      x -= memory * 18;
      y += residue * 16;
    }

    return {
      id: fragment.id,
      fragment,
      anchorX: x,
      anchorY: y,
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
  }

  function relaxNodes(nodes, width, height) {
    const padding = state.narrow ? 96 : 84;
    const iterations = state.narrow ? 220 : 180;
    const pull = state.narrow ? 0.018 : 0.014;
    const minGapBase = state.narrow ? 124 : state.compact ? 108 : 94;

    for (let iter = 0; iter < iterations; iter += 1) {
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const minDist = minGapBase + (a.radius + b.radius) * 0.84;

          if (dist < minDist) {
            const force = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            a.x -= nx * force;
            a.y -= ny * force;
            b.x += nx * force;
            b.y += ny * force;
          }
        }
      }

      nodes.forEach((node) => {
        node.x += (node.anchorX - node.x) * pull;
        node.y += (node.anchorY - node.y) * pull;

        if (node.id === state.selectedId && state.narrow) {
          node.x += (width * 0.56 - node.x) * 0.02;
          node.y += (height * 0.42 - node.y) * 0.02;
        }

        node.x = clamp(node.x, padding, width - padding);
        node.y = clamp(node.y, padding, height - padding);
      });
    }
  }

  function computeScene() {
    const mode = currentMode();
    const profile = sceneProfile();
    const rand = seededRandom((state.modeIndex + 1) * 2843 + (state.seedOffset + 1) * 7331);

    const width = 1360;
    const height = 960;
    const marginX = state.narrow ? 130 : state.compact ? 120 : 112;
    const marginY = state.narrow ? 110 : state.compact ? 100 : 92;

    const nodes = data.fragments.map((fragment, index) =>
      computeBaseNode(fragment, index, rand, width, height, marginX, marginY, profile, mode)
    );

    relaxNodes(nodes, width, height);

    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const relations = [];
    const seen = new Set();

    data.fragments.forEach((fragment) => {
      (fragment.relations || []).forEach((relatedId) => {
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

  function createRipple(svg, cx, cy, radius) {
    const ripple = createSvgEl("circle", {
      class: "node-ripple",
      cx: cx.toFixed(2),
      cy: cy.toFixed(2),
      r: radius.toFixed(2),
      opacity: "0.7"
    });

    svg.appendChild(ripple);

    const start = performance.now();
    const duration = 680;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      ripple.setAttribute("r", String((radius + eased * 54).toFixed(2)));
      ripple.setAttribute("opacity", String(((1 - eased) * 0.7).toFixed(3)));

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        ripple.remove();
      }
    }

    requestAnimationFrame(tick);
  }

  function updateTooltip(clientX, clientY, fragment) {
    if (!dom.fieldTooltip || !dom.fieldBoard) return;

    const tooltip = dom.fieldTooltip;
    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${fragment.title}</strong><br>${fragment.summary}`;

    const rect = dom.fieldBoard.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const left = clamp(clientX - rect.left + 16, 14, rect.width - tooltipRect.width - 14);
    const top = clamp(clientY - rect.top - tooltipRect.height - 16, 14, rect.height - tooltipRect.height - 14);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    if (dom.fieldTooltip) dom.fieldTooltip.hidden = true;
  }

  function shouldShowLabel(nodeId) {
    if (!state.showLabels) return false;
    if (!state.compact) return true;

    const selectedNetwork = relationNetwork(state.selectedId);
    const direct = directRelations(state.selectedId);

    if (nodeId === state.selectedId) return true;
    if (nodeId === state.hoveredId) return true;

    if (state.narrow) {
      return direct.has(nodeId);
    }

    return selectedNetwork.has(nodeId);
  }

  function estimateLabelSize(fragment, forceCompact = false) {
    const title = fragment.title || "";
    const code = fragment.code || "";

    const titleWidth = clamp(title.length * (forceCompact ? 5.8 : 6.8), 48, forceCompact ? 122 : 174);
    const codeWidth = clamp(code.length * 7.2 + 12, 40, 88);
    const width = Math.max(titleWidth, codeWidth);

    return {
      width,
      height: forceCompact ? 26 : 34,
      gap: forceCompact ? 16 : 20
    };
  }

  function circleIntersectsRect(cx, cy, r, rect) {
    const closestX = clamp(cx, rect.x1, rect.x2);
    const closestY = clamp(cy, rect.y1, rect.y2);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < r * r;
  }

  function rectOverlapArea(a, b) {
    const overlapX = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1));
    const overlapY = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
    return overlapX * overlapY;
  }

  function chooseLabelPlacement(item, allNodes, placedRects, width, height) {
    const showCompact = state.compact && item.id !== state.selectedId && item.id !== state.hoveredId;
    const size = estimateLabelSize(item.node.fragment, showCompact);
    const r = item.currentR + size.gap;

    const candidates = [
      {
        name: "right",
        anchor: "start",
        codeX: item.currentX + r,
        codeY: item.currentY - 8,
        titleX: item.currentX + r,
        titleY: item.currentY + 14,
        leadX2: item.currentX + r - 8,
        leadY2: item.currentY
      },
      {
        name: "left",
        anchor: "end",
        codeX: item.currentX - r,
        codeY: item.currentY - 8,
        titleX: item.currentX - r,
        titleY: item.currentY + 14,
        leadX2: item.currentX - r + 8,
        leadY2: item.currentY
      },
      {
        name: "top",
        anchor: "middle",
        codeX: item.currentX,
        codeY: item.currentY - r - 6,
        titleX: item.currentX,
        titleY: item.currentY - r + 12,
        leadX2: item.currentX,
        leadY2: item.currentY - r + 20
      },
      {
        name: "bottom",
        anchor: "middle",
        codeX: item.currentX,
        codeY: item.currentY + r + 4,
        titleX: item.currentX,
        titleY: item.currentY + r + 24,
        leadX2: item.currentX,
        leadY2: item.currentY + r - 8
      }
    ];

    let best = null;

    candidates.forEach((candidate) => {
      const x1 =
        candidate.anchor === "start"
          ? candidate.codeX
          : candidate.anchor === "end"
            ? candidate.codeX - size.width
            : candidate.codeX - size.width * 0.5;

      const rect = {
        x1,
        y1: candidate.codeY - 12,
        x2: x1 + size.width,
        y2: candidate.titleY + 10
      };

      let score = 0;

      if (rect.x1 < 24) score += (24 - rect.x1) * 8;
      if (rect.x2 > width - 24) score += (rect.x2 - (width - 24)) * 8;
      if (rect.y1 < 20) score += (20 - rect.y1) * 10;
      if (rect.y2 > height - 20) score += (rect.y2 - (height - 20)) * 10;

      allNodes.forEach((other) => {
        if (other.id === item.id) return;
        const hit = circleIntersectsRect(
          other.currentX,
          other.currentY,
          other.currentR + (state.compact ? 16 : 18),
          rect
        );
        if (hit) score += 2400;
      });

      placedRects.forEach((otherRect) => {
        score += rectOverlapArea(rect, otherRect) * 2.8;
      });

      const edgeBias =
        candidate.name === "right" && item.currentX > width * 0.72
          ? 120
          : candidate.name === "left" && item.currentX < width * 0.28
            ? 120
            : 0;

      score += edgeBias;

      if (best === null || score < best.score) {
        best = {
          score,
          rect,
          size,
          ...candidate
        };
      }
    });

    return best;
  }

  function solveLabelLayout() {
    if (!state.scene) return;

    const items = [...state.scene.nodeElements].sort((a, b) => {
      const aPriority =
        (a.id === state.selectedId ? 1000 : 0) +
        (a.id === state.hoveredId ? 800 : 0) +
        a.node.emphasis * 100;
      const bPriority =
        (b.id === state.selectedId ? 1000 : 0) +
        (b.id === state.hoveredId ? 800 : 0) +
        b.node.emphasis * 100;
      return bPriority - aPriority;
    });

    const placed = [];

    items.forEach((item) => {
      if (!shouldShowLabel(item.id)) {
        item.labelLayout = null;
        return;
      }

      item.labelLayout = chooseLabelPlacement(
        item,
        state.scene.nodeElements,
        placed,
        state.scene.scene.width,
        state.scene.scene.height
      );

      if (item.labelLayout) {
        placed.push(item.labelLayout.rect);
      }
    });
  }

  function applyNodeVisuals(item, x, y, radius, options) {
    const { active, hovered, linked, dimmed, sceneWidth } = options;
    const motion = state.scene?.scene?.profile?.motion;
    const echoOpacity = motion?.echoOpacity ?? 0.08;

    item.currentX = x;
    item.currentY = y;
    item.currentR = radius;

    item.aura.setAttribute("cx", x.toFixed(2));
    item.aura.setAttribute("cy", y.toFixed(2));
    item.aura.setAttribute("r", (radius * (active ? 2.18 : hovered ? 1.94 : 1.7)).toFixed(2));
    item.aura.style.opacity = (active ? 0.26 : hovered ? 0.2 : 0.11).toFixed(3);

    item.echo.setAttribute("cx", x.toFixed(2));
    item.echo.setAttribute("cy", y.toFixed(2));
    item.echo.setAttribute("r", (radius * (active ? 3.06 : 2.5)).toFixed(2));
    item.echo.style.opacity = (active ? echoOpacity * 1.2 : echoOpacity).toFixed(3);

    item.hit.setAttribute("cx", x.toFixed(2));
    item.hit.setAttribute("cy", y.toFixed(2));
    item.hit.setAttribute("r", (radius + 18).toFixed(2));

    item.core.setAttribute("cx", x.toFixed(2));
    item.core.setAttribute("cy", y.toFixed(2));
    item.core.setAttribute("r", radius.toFixed(2));
    item.core.style.opacity = (0.74 + item.node.emphasis * 0.22).toFixed(3);

    item.ring.setAttribute("cx", x.toFixed(2));
    item.ring.setAttribute("cy", y.toFixed(2));
    item.ring.setAttribute("r", (radius + 7 + (active ? 1.6 : 0)).toFixed(2));

    const layout = item.labelLayout;
    const isVisible = Boolean(layout) && state.showLabels;

    if (layout) {
      item.lead.setAttribute("x1", x.toFixed(2));
      item.lead.setAttribute("y1", y.toFixed(2));
      item.lead.setAttribute("x2", layout.leadX2.toFixed(2));
      item.lead.setAttribute("y2", layout.leadY2.toFixed(2));

      item.code.setAttribute("x", layout.codeX.toFixed(2));
      item.code.setAttribute("y", layout.codeY.toFixed(2));
      item.code.setAttribute("text-anchor", layout.anchor);

      item.title.setAttribute("x", layout.titleX.toFixed(2));
      item.title.setAttribute("y", layout.titleY.toFixed(2));
      item.title.setAttribute("text-anchor", layout.anchor);
    }

    item.code.textContent = item.node.fragment.code;
    item.title.textContent = item.node.fragment.title;

    const codeOpacity = !isVisible
      ? 0
      : active
        ? 0.95
        : hovered
          ? 0.9
          : linked
            ? 0.64
            : dimmed
              ? 0.05
              : 0.5;

    const titleOpacity = !isVisible
      ? 0
      : state.compact && !active && !hovered
        ? linked
          ? 0.34
          : 0.18
        : active
          ? 0.84
          : hovered
            ? 0.74
            : linked
              ? 0.42
              : dimmed
                ? 0.05
                : 0.28;

    item.code.style.opacity = codeOpacity.toFixed(3);
    item.title.style.opacity = titleOpacity.toFixed(3);
    item.lead.style.opacity = isVisible ? (active ? 0.44 : hovered ? 0.34 : linked ? 0.2 : 0.12).toFixed(3) : "0";

    item.group.classList.toggle("active", active);
    item.group.classList.toggle("linked", linked && !active);
    item.group.classList.toggle("hovered", hovered);
    item.group.classList.toggle("dimmed", dimmed);

    if (!state.showLabels) {
      item.code.style.opacity = "0";
      item.title.style.opacity = "0";
      item.lead.style.opacity = "0";
    }

    if (sceneWidth && x > sceneWidth * 0.72 && layout?.name === "right") {
      item.code.setAttribute("text-anchor", "end");
      item.title.setAttribute("text-anchor", "end");
    }
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

  function refreshNodeVisualState() {
    if (!state.scene) return;

    const network = relationNetwork(state.selectedId);
    const hoveredId = state.hoveredId;

    solveLabelLayout();

    state.scene.nodeElements.forEach((item) => {
      const active = item.id === state.selectedId;
      const linked = network.has(item.id);
      const hovered = item.id === hoveredId;
      const dimmed = state.showConstellation ? !linked && !hovered && !active : false;

      applyNodeVisuals(
        item,
        item.currentX ?? item.node.x,
        item.currentY ?? item.node.y,
        item.currentR ?? item.node.radius,
        {
          active,
          hovered,
          linked,
          dimmed,
          sceneWidth: state.scene.scene.width
        }
      );
    });

    state.scene.relationElements.forEach((item, index) => {
      const active =
        item.relation.fromId === state.selectedId || item.relation.toId === state.selectedId;

      const hovered =
        hoveredId &&
        (item.relation.fromId === hoveredId || item.relation.toId === hoveredId);

      const linked = network.has(item.relation.fromId) && network.has(item.relation.toId);
      const dimmed = state.showConstellation ? !linked : false;

      item.el.classList.toggle("active", active);
      item.el.classList.toggle("hovered", Boolean(hovered));
      item.el.classList.toggle("dimmed", dimmed);
      item.el.style.strokeDashoffset = String(index * 14);
    });

    dom.archiveGrid.querySelectorAll(".archive-card").forEach((card) => {
      card.setAttribute("aria-pressed", String(card.dataset.fragmentId === state.selectedId));
    });
  }

  function renderField() {
    const scene = computeScene();
    const svg = dom.fieldSvg;
    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 ${scene.width} ${scene.height}`);

    const defs = createSvgEl("defs");

    const glowFilter = createSvgEl("filter", {
      id: "softGlow",
      x: "-60%",
      y: "-60%",
      width: "220%",
      height: "220%"
    });

    glowFilter.appendChild(createSvgEl("feGaussianBlur", { stdDeviation: "18" }));
    defs.appendChild(glowFilter);
    svg.appendChild(defs);

    const bandGroup = createSvgEl("g");
    const relationGroup = createSvgEl("g");
    const nodeGroup = createSvgEl("g");

    const bandElements = scene.zones.map((zone, index) => {
      const path = createSvgEl("path", {
        class: "field-band",
        d: bandPath(zone, scene.width, scene.height)
      });

      const label = createSvgEl("text", {
        class: "band-label",
        x: 132,
        y: 104 + index * 28
      });

      label.textContent = zone.label;
      bandGroup.appendChild(path);
      bandGroup.appendChild(label);

      return { path, label, phase: index * 0.9 };
    });

    const relationElements = scene.relations.map((relation) => {
      const path = createSvgEl("path", {
        class: "relation-line"
      });
      relationGroup.appendChild(path);
      return { el: path, relation };
    });

    const nodeElements = scene.nodes.map((node) => {
      const group = createSvgEl("g", {
        class: "node-group",
        "data-fragment-id": node.id
      });

      const aura = createSvgEl("circle", {
        class: "node-aura",
        filter: "url(#softGlow)"
      });

      const echo = createSvgEl("circle", {
        class: "node-echo"
      });

      const hit = createSvgEl("circle", {
        class: "node-hit",
        tabindex: "0",
        role: "button",
        "aria-label": `${node.fragment.title}, ${node.fragment.kind}`
      });

      const core = createSvgEl("circle", {
        class: "node-core"
      });

      const ring = createSvgEl("circle", {
        class: "node-ring"
      });

      const lead = createSvgEl("line", {
        class: "node-lead"
      });

      const code = createSvgEl("text", {
        class: "node-label"
      });

      const title = createSvgEl("text", {
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
        lead,
        code,
        title,
        currentX: node.x,
        currentY: node.y,
        currentR: node.radius,
        labelLayout: null
      };

      group.appendChild(aura);
      group.appendChild(echo);
      group.appendChild(lead);
      group.appendChild(hit);
      group.appendChild(core);
      group.appendChild(ring);
      group.appendChild(code);
      group.appendChild(title);

      const focusNode = () => {
        createRipple(svg, item.currentX, item.currentY, item.currentR);
        selectFragment(node.id, false);
      };

      hit.addEventListener("click", focusNode);

      hit.addEventListener("focus", () => {
        state.hoveredId = node.id;
        dom.body.setAttribute("data-node-hovered", "true");
        refreshNodeVisualState();

        const rect = dom.fieldBoard.getBoundingClientRect();
        const x = rect.left + (item.currentX / scene.width) * rect.width;
        const y = rect.top + (item.currentY / scene.height) * rect.height;
        updateTooltip(x, y, node.fragment);
      });

      hit.addEventListener("blur", () => {
        state.hoveredId = null;
        dom.body.setAttribute("data-node-hovered", "false");
        refreshNodeVisualState();
        hideTooltip();
      });

      hit.addEventListener("mouseenter", (event) => {
        state.hoveredId = node.id;
        dom.body.setAttribute("data-node-hovered", "true");
        refreshNodeVisualState();
        updateTooltip(event.clientX, event.clientY, node.fragment);
      });

      hit.addEventListener("mousemove", (event) => {
        updateTooltip(event.clientX, event.clientY, node.fragment);
      });

      hit.addEventListener("mouseleave", () => {
        state.hoveredId = null;
        dom.body.setAttribute("data-node-hovered", "false");
        refreshNodeVisualState();
        hideTooltip();
      });

      hit.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          focusNode();
        }
      });

      nodeGroup.appendChild(group);

      return item;
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
    refreshNodeVisualState();
    startAnimation();
  }

  function renderInspectorBody() {
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
        ...(fragment.tags || []).map((tag) => `<span class="tag">${tag}</span>`),
        ...(fragment.relations || [])
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

  function renderInspector(fade = false) {
    if (fade) {
      withInspectorFade(renderInspectorBody);
    } else {
      renderInspectorBody();
    }
  }

  function renderAll() {
    renderModeText();
    buildArchive();
    renderField();
    renderInspector(false);
    renderBeats();
  }

  function selectFragment(id, scrollCard = false) {
    if (!entryMap.has(id)) return;

    state.selectedId = id;
    refreshNodeVisualState();
    renderInspector(true);
    renderBeats();
    updateHash();

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

    withTransition(() => {
      renderAll();
      updateHash();
    });
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
    refreshNodeVisualState();
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
    refreshNodeVisualState();
  }

  function recompose() {
    state.seedOffset += 1;
    renderField();
    renderInspector(false);
    renderBeats();
  }

  function resetSceneVisuals() {
    if (!state.scene) return;

    dom.fieldSvg.style.transform = "";

    state.scene.nodeElements.forEach((item) => {
      item.currentX = item.node.x;
      item.currentY = item.node.y;
      item.currentR = item.node.radius;
    });

    state.scene.bandElements.forEach((item) => {
      item.path.style.opacity = String(state.scene.scene.profile.motion.bandBase);
      item.label.style.opacity = state.compact ? "0.16" : "1";
    });

    updateRelationPaths();
    refreshNodeVisualState();
  }

  function animate(now) {
    if (!state.scene || state.reducedMotion || !state.showMotion || !state.fieldVisible) {
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
        (state.compact ? 0.12 : 0.18) + Math.sin(t * 0.27 + item.phase) * 0.04
      ).toFixed(3);
    });

    const network = relationNetwork(state.selectedId);
    const hoveredId = state.hoveredId;

    state.scene.nodeElements.forEach((item, index) => {
      const active = item.id === state.selectedId;
      const hovered = item.id === hoveredId;
      const linked = network.has(item.id);
      const dimmed = state.showConstellation ? !linked && !hovered && !active : false;

      const multiplier = active ? 1.24 : hovered ? 1.1 : 1;

      const x =
        item.node.x +
        Math.sin(t * item.node.speed + item.node.phase) * item.node.floatX * motion.driftX * multiplier +
        Math.cos(t * 0.21 + index) * motion.sway;

      const y =
        item.node.y +
        Math.cos(t * item.node.speed * 0.92 + item.node.phase) * item.node.floatY * motion.driftY * multiplier;

      const pulse =
        1 +
        Math.sin(t * (active ? 1.52 : 1.02) + item.node.phase) *
          (active ? motion.pulse : motion.pulse * 0.34) +
        (hovered ? 0.026 : 0);

      const radius = item.node.radius * pulse;

      item.currentX = x;
      item.currentY = y;
      item.currentR = radius;

      item._renderState = { active, hovered, linked, dimmed };
    });

    solveLabelLayout();

    state.scene.nodeElements.forEach((item) => {
      const renderState = item._renderState || {};
      applyNodeVisuals(item, item.currentX, item.currentY, item.currentR, {
        active: Boolean(renderState.active),
        hovered: Boolean(renderState.hovered),
        linked: Boolean(renderState.linked),
        dimmed: Boolean(renderState.dimmed),
        sceneWidth: state.scene.scene.width
      });
    });

    updateRelationPaths();

    state.scene.relationElements.forEach((item, index) => {
      item.el.style.strokeDashoffset = (
        t * (12 + item.relation.strength * 22) + index * 16
      ).toFixed(2);
    });

    state.rafId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    if (state.reducedMotion || !state.showMotion || !state.fieldVisible) {
      resetSceneVisuals();
      return;
    }

    state.rafId = requestAnimationFrame(animate);
  }

  function handlePointer(event) {
    if (state.reducedMotion || state.touchLikely) return;
    state.targetX = event.clientX;
    state.targetY = event.clientY;
  }

  function animateHalo() {
    if (!dom.cursorHalo || state.reducedMotion || state.touchLikely) {
      if (dom.cursorHalo) dom.cursorHalo.style.opacity = "0";
      state.haloRafId = null;
      return;
    }

    state.haloX = lerp(state.haloX, state.targetX, 0.1);
    state.haloY = lerp(state.haloY, state.targetY, 0.1);

    dom.cursorHalo.style.left = `${state.haloX.toFixed(2)}px`;
    dom.cursorHalo.style.top = `${state.haloY.toFixed(2)}px`;

    state.haloRafId = requestAnimationFrame(animateHalo);
  }

  function dismissPrelude() {
    if (state.introDismissed) return;
    state.introDismissed = true;
    dom.body.setAttribute("data-intro", "done");
    dom.prelude?.setAttribute("aria-hidden", "true");
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

  function initFieldObserver() {
    if (!("IntersectionObserver" in window) || !dom.fieldBoard) return;

    state.fieldObserver = new IntersectionObserver(
      ([entry]) => {
        state.fieldVisible = Boolean(entry?.isIntersecting);
        startAnimation();
      },
      { threshold: 0.04 }
    );

    state.fieldObserver.observe(dom.fieldBoard);
  }

  function initSwipe() {
    let startX = 0;
    let startY = 0;

    document.addEventListener(
      "touchstart",
      (event) => {
        state.touchLikely = true;
        if (dom.cursorHalo) dom.cursorHalo.style.opacity = "0";
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (event) => {
        const dx = event.changedTouches[0].clientX - startX;
        const dy = event.changedTouches[0].clientY - startY;

        if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 64) {
          if (dx < 0) {
            nextMode();
          } else {
            setMode(state.modeIndex - 1);
          }
        }
      },
      { passive: true }
    );
  }

  function bindEvents() {
    dom.enterFieldButton?.addEventListener("click", dismissPrelude);
    dom.cycleModeButton?.addEventListener("click", nextMode);
    dom.gridButton?.addEventListener("click", toggleGrid);
    dom.labelsButton?.addEventListener("click", toggleLabels);
    dom.motionButton?.addEventListener("click", toggleMotion);
    dom.constellationButton?.addEventListener("click", toggleConstellation);
    dom.recomposeButton?.addEventListener("click", recompose);

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

      if (key === "arrowright") setMode(state.modeIndex + 1);
      if (key === "arrowleft") setMode(state.modeIndex - 1);
    });

    let resizeRafId = null;
    window.addEventListener("resize", () => {
      if (resizeRafId) cancelAnimationFrame(resizeRafId);

      resizeRafId = requestAnimationFrame(() => {
        updateViewportFlags();
        renderAll();
        resizeRafId = null;
      });
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
      if (event.matches) state.showMotion = false;

      dom.body.setAttribute("data-motion", state.showMotion ? "on" : "off");
      dom.motionButton?.setAttribute("aria-pressed", String(state.showMotion));

      startAnimation();

      if (!state.reducedMotion && !state.haloRafId && !state.touchLikely) {
        state.haloRafId = requestAnimationFrame(animateHalo);
      }
    };

    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", motionListener);
    } else if (typeof prefersReducedMotion.addListener === "function") {
      prefersReducedMotion.addListener(motionListener);
    }

    initSwipe();
  }

  function init() {
    readHash();
    updateViewportFlags();

    dom.body.setAttribute("data-grid", state.showGrid ? "on" : "off");
    dom.body.setAttribute("data-labels", state.showLabels ? "on" : "off");
    dom.body.setAttribute("data-motion", state.showMotion ? "on" : "off");
    dom.body.setAttribute("data-constellation", state.showConstellation ? "on" : "off");
    dom.body.setAttribute("data-node-hovered", "false");

    dom.gridButton?.setAttribute("aria-pressed", String(state.showGrid));
    dom.labelsButton?.setAttribute("aria-pressed", String(state.showLabels));
    dom.motionButton?.setAttribute("aria-pressed", String(state.showMotion));
    dom.constellationButton?.setAttribute("aria-pressed", String(state.showConstellation));

    buildPrelude();
    buildRituals();
    buildModeTabs();
    buildCoda();
    renderAll();
    initRevealObserver();
    bindEvents();
    initFieldObserver();

    if (!state.reducedMotion && dom.cursorHalo && !state.touchLikely) {
      state.haloRafId = requestAnimationFrame(animateHalo);
    }

    if (!location.hash) {
      updateHash();
    }

    window.addEventListener("hashchange", () => {
      const previousMode = state.modeIndex;
      const previousId = state.selectedId;

      readHash();

      if (previousMode !== state.modeIndex) {
        renderAll();
      } else if (previousId !== state.selectedId) {
        refreshNodeVisualState();
        renderInspector(true);
        renderBeats();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
