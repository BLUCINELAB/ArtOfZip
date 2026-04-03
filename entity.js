(() => {
  const content = window.SpecimenContent;
  if (!content || !Array.isArray(content.modes) || !content.modes.length) {
    console.warn("SpecimenContent not found.");
    return;
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const els = {
    body: document.body,
    systemLabel: $(".system-label"),
    systemMeta: $$(".system-meta"),
    eyebrow: $(".eyebrow"),
    heroTitle: $(".hero-title"),
    heroText: $(".hero-text"),
    sideBlocks: $$(".side-block"),
    board: $("#specimenBoard"),
    boardWrap: $("#specimen-svg-wrap"),
    boardLabels: $$(".board-label"),
    notes: $$(".note"),
    markers: $$(".marker"),
    gridOverlay: $("#gridOverlay"),
    gridToggle: $("#gridToggle"),
    notesLabel: $(".apparatus-left .apparatus-label"),
    notesText: $(".apparatus-text"),
    microGrid: $(".micro-grid"),
    coordsLabel: $(".apparatus-right .apparatus-label"),
    coordsMono: $$(".apparatus-right .apparatus-mono"),
    footerMeta: $$(".footer-meta span"),
    topbar: $(".topbar")
  };

  let modeIndex = 0;
  let resizeTimer = null;
  let animationFrame = null;
  let scene = null;
  let gridVisible = true;

  function ensureModeButton() {
    if ($("#modeToggle")) return $("#modeToggle");

    const button = document.createElement("button");
    button.id = "modeToggle";
    button.type = "button";
    button.className = "grid-toggle mode-toggle";
    button.setAttribute("aria-label", "Change curatorial mode");
    button.innerHTML = `
      <span class="toggle-dot" aria-hidden="true"></span>
      <span class="toggle-label">MODE</span>
    `;

    if (els.board) {
      els.board.appendChild(button);
      button.style.left = "auto";
      button.style.right = "18px";
      button.style.bottom = "18px";
    }

    return button;
  }

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  function setHTML(el, value) {
    if (el) el.innerHTML = value;
  }

  function applyMode(mode) {
    els.body.classList.remove("theme-quiet", "theme-sumi", "theme-ember");
    els.body.classList.add(mode.themeClass);

    setText(els.systemLabel, "SPECIMEN INTERFACE");
    if (els.systemMeta[0]) setText(els.systemMeta[0], mode.field);
    if (els.systemMeta[1]) setText(els.systemMeta[1], `STATE: ${mode.state}`);
    if (els.systemMeta[2]) setText(els.systemMeta[2], `YEAR: ${mode.year}`);

    setText(els.eyebrow, mode.eyebrow);
    setHTML(els.heroTitle, mode.title.join("<br />"));
    setText(els.heroText, mode.text);

    if (els.sideBlocks[0]) {
      const title = $(".side-title", els.sideBlocks[0]);
      const list = $(".side-list", els.sideBlocks[0]);
      setText(title, mode.sideIndexTitle);
      if (list) {
        list.innerHTML = mode.sideIndex.map(item => `<li>${item}</li>`).join("");
      }
    }

    if (els.sideBlocks[1]) {
      const title = $(".side-title", els.sideBlocks[1]);
      setText(title, mode.sideSpecTitle);

      const ps = $$("p", els.sideBlocks[1]);
      ps.forEach(p => p.remove());

      mode.sideSpec.forEach(line => {
        const p = document.createElement("p");
        p.textContent = line;
        els.sideBlocks[1].appendChild(p);
      });
    }

    setText(els.notesLabel, mode.notesLabel);
    setText(els.notesText, mode.notesText);
    setText(els.coordsLabel, mode.coordinatesLabel);

    els.coordsMono.forEach((el, i) => {
      setText(el, mode.coordinates[i] || "");
    });

    if (els.microGrid) {
      els.microGrid.innerHTML = mode.microGrid
        .map(pair => `<span>${pair[0]}</span><span>${pair[1]}</span>`)
        .join("");
    }

    els.boardLabels.forEach((el, i) => {
      setText(el, mode.boardLabels[i] || "");
    });

    els.footerMeta.forEach((el, i) => {
      setText(el, mode.footer[i] || "");
    });

    els.notes.forEach((note, i) => {
      const data = mode.noteItems[i];
      if (!data) return;
      const indexEl = $(".note-index", note);
      const textEl = $(".note-text", note);
      setText(indexEl, data.index);
      setText(textEl, data.text);
      note.classList.remove("revealed");
      requestAnimationFrame(() => {
        setTimeout(() => note.classList.add("revealed"), 120 + i * 120);
      });
    });

    els.markers.forEach((marker, i) => {
      const point = mode.markers[i];
      if (!point) return;
      marker.style.left = `${point.x}%`;
      marker.style.top = `${point.y}%`;
    });

    const modeButton = ensureModeButton();
    $(".toggle-label", modeButton).textContent = mode.label;

    buildScene(mode.mesh);
  }

  function seededNoise(x, y, seed = 1) {
    const v = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
    return v - Math.floor(v);
  }

  function buildScene(meshConfig) {
    cancelAnimationFrame(animationFrame);

    if (!els.boardWrap) return;

    const rect = els.boardWrap.getBoundingClientRect();
    const width = Math.max(300, rect.width);
    const height = Math.max(420, rect.height);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "specimen-svg");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const haloLayer = document.createElementNS(svgNS, "g");
    const lineLayer = document.createElementNS(svgNS, "g");
    const secondaryLayer = document.createElementNS(svgNS, "g");
    const nodeLayer = document.createElementNS(svgNS, "g");

    svg.appendChild(haloLayer);
    svg.appendChild(secondaryLayer);
    svg.appendChild(lineLayer);
    svg.appendChild(nodeLayer);

    const cols = meshConfig.pointsX;
    const rows = meshConfig.pointsY;
    const paddingX = width * 0.16;
    const paddingY = height * 0.06;
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;

    const points = [];
    const pointEls = [];
    const haloEls = [];
    const horizontalEls = [];
    const verticalEls = [];
    const diagonalEls = [];

    const centerX = width * 0.5;

    function clusterInfluence(nx, ny) {
      let influence = 0;
      for (const cluster of meshConfig.clusters) {
        const dx = nx - cluster.x;
        const dy = ny - cluster.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normalized = Math.max(0, 1 - dist / cluster.radius);
        influence += normalized * cluster.strength;
      }
      return influence;
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const nx = x / (cols - 1);
        const ny = y / (rows - 1);

        const waveA = Math.sin(ny * Math.PI * 2.8 + 0.8) * 26;
        const waveB = Math.sin(ny * Math.PI * 7.2 + nx * 3.4) * 8;
        const spinePull = Math.exp(-Math.pow((nx - 0.5) / 0.22, 2)) * 54;
        const asymmetry = Math.sin(ny * 8.0 + nx * 5.0) * 12;
        const noise = (seededNoise(nx * 8, ny * 8, 3) - 0.5) * meshConfig.jitter * 2;
        const cluster = clusterInfluence(nx, ny);

        let px = paddingX + nx * usableW;
        let py = paddingY + ny * usableH;

        const curve =
          Math.sin(ny * Math.PI * 2.2 + 0.35) * waveA +
          waveB +
          asymmetry;

        const inward = (0.5 - Math.abs(nx - 0.5)) * spinePull;

        px += curve * (nx < 0.5 ? -0.55 : 0.55);
        px += (0.5 - nx) * inward;
        px += noise;

        py += Math.sin(nx * Math.PI * 3.0 + ny * 4.0) * 5;
        py += cluster * 12;

        const point = {
          baseX: px,
          baseY: py,
          x: px,
          y: py,
          nx,
          ny,
          cluster,
          noise: seededNoise(nx * 12, ny * 12, 9)
        };

        row.push(point);

        if (cluster > 0.08) {
          const halo = document.createElementNS(svgNS, "circle");
          halo.setAttribute("class", "halo");
          halo.setAttribute("cx", px.toFixed(2));
          halo.setAttribute("cy", py.toFixed(2));
          halo.setAttribute("r", (cluster * 12 + 2).toFixed(2));
          halo.style.opacity = Math.min(meshConfig.accentAlpha + cluster * 0.06, 0.16).toFixed(3);
          haloLayer.appendChild(halo);
          haloEls.push({ el: halo, point });
        }

        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("class", cluster > 0.8 ? "node soft" : "node");
        circle.setAttribute("cx", px.toFixed(2));
        circle.setAttribute("cy", py.toFixed(2));

        const radius = Math.max(
          0.42,
          (0.45 + cluster * 1.35 + point.noise * 0.25) * meshConfig.nodeScale
        );

        circle.setAttribute("r", radius.toFixed(2));
        circle.style.opacity = Math.min(0.18 + cluster * 0.75, 0.92).toFixed(3);

        nodeLayer.appendChild(circle);
        pointEls.push({ el: circle, point, radius });

      }
      points.push(row);
    }

    function makeLine(cls, p1, p2, layer, opacity) {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("class", cls);
      line.setAttribute("x1", p1.x.toFixed(2));
      line.setAttribute("y1", p1.y.toFixed(2));
      line.setAttribute("x2", p2.x.toFixed(2));
      line.setAttribute("y2", p2.y.toFixed(2));
      line.style.opacity = opacity.toFixed(3);
      layer.appendChild(line);
      return line;
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const p = points[y][x];

        if (x < cols - 1) {
          const right = points[y][x + 1];
          const op = Math.min(meshConfig.lineAlpha + (p.cluster + right.cluster) * 0.08, 0.42);
          const line = makeLine("mesh-line", p, right, lineLayer, op);
          horizontalEls.push({ el: line, a: p, b: right });
        }

        if (y < rows - 1) {
          const down = points[y + 1][x];
          const op = Math.min(meshConfig.lineAlpha + (p.cluster + down.cluster) * 0.06, 0.34);
          const line = makeLine("mesh-line secondary", p, down, secondaryLayer, op);
          verticalEls.push({ el: line, a: p, b: down });
        }

        if (x < cols - 1 && y < rows - 1 && (x + y) % 2 === 0) {
          const diag = points[y + 1][x + 1];
          const op = Math.min(meshConfig.secondaryAlpha + (p.cluster + diag.cluster) * 0.05, 0.2);
          const line = makeLine("mesh-line secondary", p, diag, secondaryLayer, op);
          diagonalEls.push({ el: line, a: p, b: diag });
        }
      }
    }

    els.boardWrap.innerHTML = "";
    els.boardWrap.appendChild(svg);

    scene = {
      svg,
      points,
      pointEls,
      haloEls,
      horizontalEls,
      verticalEls,
      diagonalEls,
      width,
      height,
      meshConfig,
      startedAt: performance.now()
    };

    animate();
  }

  function animate(now = performance.now()) {
    if (!scene) return;

    const t = (now - scene.startedAt) * 0.001;

    for (const row of scene.points) {
      for (const p of row) {
        const driftX =
          Math.sin(t * 0.55 + p.ny * 6.0 + p.noise * 3.0) *
          scene.meshConfig.drift *
          (0.35 + p.cluster * 0.25);

        const driftY =
          Math.cos(t * 0.45 + p.nx * 5.0 + p.noise * 2.0) *
          scene.meshConfig.drift *
          0.4 *
          (0.25 + p.cluster * 0.25);

        const pulse =
          Math.sin(t * 1.3 + p.ny * 11.0 + p.cluster * 2.0) *
          scene.meshConfig.pulse *
          p.cluster *
          16;

        p.x = p.baseX + driftX + pulse * (p.nx < 0.5 ? -0.4 : 0.4);
        p.y = p.baseY + driftY;
      }
    }

    scene.pointEls.forEach(item => {
      item.el.setAttribute("cx", item.point.x.toFixed(2));
      item.el.setAttribute("cy", item.point.y.toFixed(2));

      const breathing =
        1 + Math.sin(t * 1.6 + item.point.noise * 10 + item.point.cluster) * 0.08;
      item.el.setAttribute("r", (item.radius * breathing).toFixed(2));
    });

    scene.haloEls.forEach(item => {
      item.el.setAttribute("cx", item.point.x.toFixed(2));
      item.el.setAttribute("cy", item.point.y.toFixed(2));
    });

    [...scene.horizontalEls, ...scene.verticalEls, ...scene.diagonalEls].forEach(item => {
      item.el.setAttribute("x1", item.a.x.toFixed(2));
      item.el.setAttribute("y1", item.a.y.toFixed(2));
      item.el.setAttribute("x2", item.b.x.toFixed(2));
      item.el.setAttribute("y2", item.b.y.toFixed(2));
    });

    if (scene.svg) {
      const overallDriftX = Math.sin(t * 0.18) * 2.2;
      const overallDriftY = Math.cos(t * 0.12) * 1.4;
      const rotate = Math.sin(t * 0.1) * 0.22;
      scene.svg.style.transform = `translate(${overallDriftX}px, ${overallDriftY}px) rotate(${rotate}deg)`;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function nextMode() {
    modeIndex = (modeIndex + 1) % content.modes.length;
    applyMode(content.modes[modeIndex]);
  }

  function toggleGrid() {
    gridVisible = !gridVisible;
    if (els.gridOverlay) {
      els.gridOverlay.classList.toggle("hidden", !gridVisible);
    }
    if (els.gridToggle) {
      els.gridToggle.setAttribute("aria-pressed", String(gridVisible));
    }
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      applyMode(content.modes[modeIndex]);
    }, 120);
  }

  function initInteractions() {
    if (els.gridToggle) {
      els.gridToggle.addEventListener("click", toggleGrid);
    }

    const modeButton = ensureModeButton();
    modeButton.addEventListener("click", nextMode);

    window.addEventListener("resize", onResize);

    document.addEventListener("keydown", event => {
      if (event.key.toLowerCase() === "g") toggleGrid();
      if (event.key.toLowerCase() === "m") nextMode();
    });

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            els.notes.forEach((note, i) => {
              setTimeout(() => note.classList.add("revealed"), 80 + i * 120);
            });
          }
        });
      },
      { threshold: 0.35 }
    );

    if (els.board) observer.observe(els.board);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initInteractions();
    applyMode(content.modes[modeIndex]);
  });
})();
