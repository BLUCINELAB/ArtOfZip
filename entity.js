const wrap = document.getElementById("specimen-svg-wrap");
const gridOverlay = document.getElementById("gridOverlay");
const gridToggle = document.getElementById("gridToggle");
const specimenBoard = document.getElementById("specimenBoard");
const notes = document.querySelectorAll(".note");

let gridVisible = true;
let driftAnimationId = null;
let resizeTimeout = null;
let pointerFrame = null;

function setupGridToggle() {
  if (!gridToggle || !gridOverlay) return;

  gridToggle.addEventListener("click", () => {
    gridVisible = !gridVisible;
    gridOverlay.classList.toggle("hidden", !gridVisible);
    gridToggle.setAttribute("aria-pressed", String(gridVisible));
  });
}

function setupRevealObserver() {
  if (!("IntersectionObserver" in window)) {
    notes.forEach((note) => note.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "20px"
    }
  );

  notes.forEach((note) => observer.observe(note));
}

function createSpecimenSVG() {
  const width = wrap.clientWidth;
  const height = wrap.clientHeight;

  if (!width || !height) return;

  const points = [];
  const cols = 9;
  const rows = 14;
  const seed = 0.618;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const t = (y / rows) * Math.PI * 2 * seed;
      const u = (x / cols) * Math.PI * 2 * (seed * 1.3);

      const offsetX = Math.sin(t * 1.7 + u) * 18 + Math.cos(u * 2.2) * 12;
      const offsetY = Math.cos(u * 1.9 + t) * 16 + Math.sin(t * 1.4) * 14;

      let px = width * 0.2 + x * (width * 0.067) + offsetX;
      let py = height * 0.12 + y * (height * 0.054) + offsetY;

      px = Math.min(width - 20, Math.max(20, px));
      py = Math.min(height - 20, Math.max(20, py));

      points.push({ x: px, y: py });
    }
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", "specimen-svg");

  const halosGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const linesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  points.forEach((p, i) => {
    if (i % 5 === 0) {
      const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      halo.setAttribute("cx", p.x);
      halo.setAttribute("cy", p.y);
      halo.setAttribute("r", 16 + (i % 3) * 5);
      halo.setAttribute("class", "halo");
      halosGroup.appendChild(halo);
    }
  });

  for (let i = 0; i < points.length; i += 1) {
    const p1 = points[i];
    const row = Math.floor(i / cols);
    const col = i % cols;

    if (col + 1 < cols) {
      const p2 = points[i + 1];
      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      line.setAttribute(
        "d",
        `M ${p1.x} ${p1.y} Q ${(p1.x + p2.x) / 2} ${((p1.y + p2.y) / 2) - 10} ${p2.x} ${p2.y}`
      );
      line.setAttribute("class", "mesh-line");
      linesGroup.appendChild(line);
    }

    if (row + 1 < rows) {
      const p3 = points[i + cols];
      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      line.setAttribute(
        "d",
        `M ${p1.x} ${p1.y} Q ${(p1.x + p3.x) / 2 + 12} ${(p1.y + p3.y) / 2} ${p3.x} ${p3.y}`
      );
      line.setAttribute("class", row % 2 === 0 ? "mesh-line secondary" : "mesh-line");
      linesGroup.appendChild(line);
    }
  }

  points.forEach((p, i) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    node.setAttribute("cx", p.x);
    node.setAttribute("cy", p.y);
    node.setAttribute("r", i % 7 === 0 ? 3.2 : 1.8);
    node.setAttribute("class", i % 9 === 0 ? "node soft" : "node");
    nodesGroup.appendChild(node);
  });

  svg.appendChild(halosGroup);
  svg.appendChild(linesGroup);
  svg.appendChild(nodesGroup);

  wrap.innerHTML = "";
  wrap.appendChild(svg);
}

function animateSVGDrift() {
  const svg = wrap.querySelector(".specimen-svg");
  if (!svg) return;

  if (driftAnimationId) {
    cancelAnimationFrame(driftAnimationId);
  }

  let t = 0;

  const tick = () => {
    t += 0.003;
    const x = Math.sin(t) * 2.4;
    const y = Math.cos(t * 0.7) * 3.2;
    svg.style.transform = `translate(${x}px, ${y}px)`;
    driftAnimationId = requestAnimationFrame(tick);
  };

  tick();
}

function setupPointerResponse() {
  if (!specimenBoard) return;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  const applyPointerEffect = () => {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    notes.forEach((note) => {
      const baseTransform = note.classList.contains("revealed") ? "translateY(0px)" : "translateY(6px)";
      note.style.transform = `${baseTransform} translate(${currentX}px, ${currentY}px)`;
    });

    pointerFrame = requestAnimationFrame(applyPointerEffect);
  };

  specimenBoard.addEventListener("mousemove", (event) => {
    const rect = specimenBoard.getBoundingClientRect();
    const mx = (event.clientX - rect.left) / rect.width;
    const my = (event.clientY - rect.top) / rect.height;

    targetX = (mx - 0.5) * 3.2;
    targetY = (my - 0.5) * 2.4;
  });

  specimenBoard.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });

  applyPointerEffect();
}

function rebuildSystem() {
  createSpecimenSVG();
  animateSVGDrift();
}

window.addEventListener("load", () => {
  setupGridToggle();
  setupRevealObserver();
  setupPointerResponse();
  rebuildSystem();
});

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    rebuildSystem();
  }, 150);
});

window.addEventListener("beforeunload", () => {
  if (driftAnimationId) cancelAnimationFrame(driftAnimationId);
  if (pointerFrame) cancelAnimationFrame(pointerFrame);
});
