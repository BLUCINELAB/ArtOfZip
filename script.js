let contradictions = [];
let currentFilter = "all";
let currentOpenId = null;
let particles = [];
let pulsePhase = 0;
let canvasDrawQueue = [];
let isDrawing = false;

const bootScreen = document.getElementById("bootScreen");
const bootBar = document.getElementById("bootBar");
const bootPercent = document.getElementById("bootPercent");
const bootReady = document.getElementById("bootReady");

const heroCounter = document.getElementById("heroCounter");
const heroTitle = document.getElementById("heroTitle");
const heroLine1 = document.getElementById("heroLine1");
const heroLine2 = document.getElementById("heroLine2");
const heroLine3 = document.getElementById("heroLine3");
const heroLine4 = document.getElementById("heroLine4");

const cardsGrid = document.getElementById("cardsGrid");
const gridCount = document.getElementById("gridCount");
const filterButtons = document.querySelectorAll(".cmd-link");

const detailPanel = document.getElementById("detailPanel");
const detailOverlay = document.getElementById("detailOverlay");
const closeDetailBtn = document.getElementById("closeDetailBtn");

const detailCategory = document.getElementById("detailCategory");
const detailTitle = document.getElementById("detailTitle");
const detailSubtitle = document.getElementById("detailSubtitle");
const detailCodeA = document.getElementById("detailCodeA");
const detailCodeB = document.getElementById("detailCodeB");
const detailTagline = document.getElementById("detailTagline");
const detailLeftLabel = document.getElementById("detailLeftLabel");
const detailLeftValue = document.getElementById("detailLeftValue");
const detailRightLabel = document.getElementById("detailRightLabel");
const detailRightValue = document.getElementById("detailRightValue");
const detailInsight = document.getElementById("detailInsight");
const detailNote = document.getElementById("detailNote");
const detailCanvas = document.getElementById("detailCanvas");
const detailCtx = detailCanvas.getContext("2d");

const commandPalette = document.getElementById("commandPalette");
const commandInput = document.getElementById("commandInput");
const commandHints = document.getElementById("commandHints");

const particlesCanvas = document.getElementById("particlesCanvas");
const particlesCtx = particlesCanvas.getContext("2d");

async function loadData() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("data.json not found");
    contradictions = await response.json();
    startBootSequence();
  } catch (error) {
    console.error("Errore caricamento dati:", error);
    bootReady.textContent = "ERRORE. Caricare data.json";
    bootReady.style.opacity = "1";
  }
}

function startBootSequence() {
  let value = 0;
  const duration = 2800;
  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const raw = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - raw, 2.2);
    value = Math.floor(eased * 100);

    bootBar.style.width = `${value}%`;
    bootPercent.textContent = `${value}%`;

    if (raw < 1) {
      requestAnimationFrame(animate);
    } else {
      bootReady.style.opacity = "1";
      setTimeout(() => {
        bootScreen.classList.add("hidden");
        initScene();
      }, 450);
    }
  }

  requestAnimationFrame(animate);
}

function initScene() {
  animateHeroCounter();
  typeHeroLines();
  renderCards(true);
  initParticles();
  setupEvents();

  setTimeout(() => {
    window.scrollTo({ top: 40, behavior: "smooth" });
  }, 700);
}

function animateHeroCounter() {
  let value = 12;
  heroCounter.textContent = value;

  const interval = setInterval(() => {
    value--;
    heroCounter.textContent = String(Math.max(value, 6)).padStart(2, "0");
    if (value <= 6) clearInterval(interval);
  }, 170);
}

function typeText(el, text, speed = 28, callback) {
  el.textContent = "";
  let i = 0;

  function step() {
    el.textContent += text.charAt(i);
    i++;
    if (i < text.length) {
      setTimeout(step, speed);
    } else if (callback) {
      callback();
    }
  }

  step();
}

function typeHeroLines() {
  typeText(heroLine1, "Sistema analizzato.", 28, () => {
    typeText(heroLine2, `Contraddizioni rilevate: ${contradictions.length}.`, 22, () => {
      typeText(heroLine3, "Paradossi irrisolti: ∞.", 22, () => {
        typeText(heroLine4, "Leggi i dati. Non faranno senso. Perfetto.", 20);
      });
    });
  });
}

function getFilteredData() {
  return contradictions.filter(item => {
    return currentFilter === "all" ? true : item.category === currentFilter;
  });
}

function renderCards(withEntryAnimation = false) {
  const filtered = getFilteredData();
  gridCount.textContent = String(filtered.length).padStart(2, "0");

  cardsGrid.innerHTML = "";

  filtered.forEach((item, index) => {
    const card = document.createElement("article");
    const shapeClass = `card-${((index % 6) + 1)}`;
    card.className = `contradiction-card ${shapeClass}`;
    if (withEntryAnimation) card.classList.add("is-showing");

    card.style.setProperty("--card-a", item.colorA);
    card.style.setProperty("--card-b", item.colorB);
    card.dataset.id = String(item.id);
    card.dataset.category = item.category;
    card.tabIndex = 0;

    card.innerHTML = `
      <div class="card-top">
        <div class="card-code">${item.codeA} / ${item.codeB}</div>
        <div class="card-id">0${item.id}</div>
      </div>

      <h3 class="card-title">${item.title.replace("\n", "<br>")}</h3>
      <p class="card-subtitle">${item.subtitle}</p>
      <p class="card-tagline">${item.tagline}</p>

      <div class="card-metrics">
        <div class="card-metric">
          <span class="card-metric-label">${item.leftLabel}</span>
          <strong class="card-metric-value a" data-target="${item.leftValue}" data-display="${item.leftDisplay}">0</strong>
        </div>
        <div class="card-metric">
          <span class="card-metric-label">${item.rightLabel}</span>
          <strong class="card-metric-value b" data-target="${item.rightValue}" data-display="${item.rightDisplay}">0</strong>
        </div>
      </div>

      <div class="card-chart">
        <canvas width="560" height="180" data-chart-id="${item.id}"></canvas>
      </div>

      <div class="card-foot">
        <span>${item.category}</span>
        <span class="card-open-hint">apri nodo</span>
      </div>
    `;

    cardsGrid.appendChild(card);
  });

  animateCardNumbers();
  scheduleChartDraws();
  bindCardEvents();
}

function scheduleChartDraws() {
  const filtered = getFilteredData();
  const canvases = cardsGrid.querySelectorAll("canvas[data-chart-id]");

  canvasDrawQueue = Array.from(canvases).map(canvas => {
    const id = Number(canvas.dataset.chartId);
    const item = filtered.find(entry => entry.id === id);
    return { canvas, item, isVisible: false };
  });

  checkVisibleCanvases();
}

function checkVisibleCanvases() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const canvas = entry.target;
      const queueItem = canvasDrawQueue.find(q => q.canvas === canvas);
      if (queueItem) {
        queueItem.isVisible = entry.isIntersecting;
        if (entry.isIntersecting) {
          drawMiniChart(canvas, queueItem.item);
        }
      }
    });
  }, { threshold: 0.1 });

  canvasDrawQueue.forEach(q => observer.observe(q.canvas));
}

function drawMiniChart(canvas, item) {
  if (!item) return;
  const ctx = canvas.getContext("2d");
  drawSensorChart(ctx, canvas, item, false);
}

function animateCardNumbers() {
  const els = cardsGrid.querySelectorAll(".card-metric-value");

  els.forEach(el => {
    const target = Number(el.dataset.target);
    const display = el.dataset.display || String(target);
    const suffix = display.replace(/[0-9]/g, "").replace("+", "");
    const hasPlus = display.includes("+");

    let current = 0;
    const duration = 760;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.floor(eased * target);

      let shown = `${current}${suffix}`;
      if (hasPlus) shown = `+${current}${suffix}`;

      el.textContent = shown;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = display;
      }
    }

    requestAnimationFrame(frame);
  });
}

function drawSensorChart(ctx, canvas, item, isDetail) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const padding = isDetail ? 48 : 18;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;

  const seriesA = generateSeries(item.leftValue, isDetail ? 8 : 6, true);
  const seriesB = generateSeries(item.rightValue, isDetail ? 8 : 6, false);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
    ctx.stroke();
  }

  drawAreaLine(ctx, seriesA, padding, chartW, chartH, item.colorA);
  drawAreaLine(ctx, seriesB, padding, chartW, chartH, item.colorB);

  if (isDetail) {
    ctx.fillStyle = "rgba(233,247,238,0.54)";
    ctx.font = "20px IBM Plex Mono";
    ctx.textAlign = "left";
    ctx.fillText(item.leftLabel, padding, 26);

    ctx.textAlign = "right";
    ctx.fillText(item.rightLabel, w - padding, 26);
  }
}

function drawAreaLine(ctx, series, padding, chartW, chartH, color) {
  const stepX = chartW / (series.length - 1);
  const points = series.map((value, index) => {
    const x = padding + index * stepX;
    const y = padding + chartH - (value / 100) * chartH;
    return { x, y, value };
  });

  const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartH);
  gradient.addColorStop(0, hexToRgba(color, 0.35));
  gradient.addColorStop(1, hexToRgba(color, 0.01));

  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.lineTo(points[points.length - 1].x, padding + chartH);
  ctx.lineTo(points[0].x, padding + chartH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  points.forEach((p, i) => {
    const pulse = 1 + Math.sin(pulsePhase + i * 0.8) * 0.18;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.2 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, 0.14);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
}

function generateSeries(base, length, primary) {
  const values = [];
  for (let i = 0; i < length; i++) {
    const drift = primary ? i * 1.7 : i * 1.1;
    const wave = primary ? Math.sin(i * 1.2) * 5 : Math.cos(i * 1.35) * 4;
    let value = base - 14 + drift + wave;
    if (i === length - 1) value = base;
    value = Math.max(8, Math.min(96, value));
    values.push(value);
  }
  return values;
}

function bindCardEvents() {
  const cards = cardsGrid.querySelectorAll(".contradiction-card");

  cards.forEach(card => {
    const open = () => {
      const id = Number(card.dataset.id);
      openDetail(id, card);
    };

    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function openDetail(id, sourceCard = null) {
  const item = contradictions.find(entry => entry.id === id);
  if (!item) return;

  currentOpenId = id;

  if (sourceCard) {
    sourceCard.style.transition = "transform 260ms ease, opacity 260ms ease, filter 260ms ease";
    sourceCard.style.transform = "translateY(-18px) scale(1.03)";
    sourceCard.style.opacity = "0";
    sourceCard.style.filter = "blur(8px)";
    setTimeout(() => {
      sourceCard.style.transform = "";
      sourceCard.style.opacity = "";
      sourceCard.style.filter = "";
    }, 300);
  }

  detailPanel.classList.remove("closing");
  detailPanel.classList.add("active");
  detailPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");

  detailCategory.textContent = item.category;
  detailTitle.innerHTML = item.title.replace("\n", "<br>");
  detailTitle.dataset.text = item.title.replace("\n", " ");
  detailSubtitle.textContent = item.subtitle;

  detailCodeA.textContent = item.codeA;
  detailCodeB.textContent = item.codeB;
  detailTagline.textContent = item.tagline;

  detailLeftLabel.textContent = item.leftLabel;
  detailRightLabel.textContent = item.rightLabel;
  detailLeftValue.textContent = item.leftDisplay;
  detailRightValue.textContent = item.rightDisplay;

  detailLeftValue.style.color = item.colorA;
  detailRightValue.style.color = item.colorB;

  revealWords(detailInsight, item.insight);
  revealWords(detailNote, item.note, 24);

  setTimeout(() => {
    resizeAndDrawDetail(item);
  }, 120);
}

function closeDetail() {
  if (!detailPanel.classList.contains("active")) return;

  detailPanel.classList.add("closing");
  detailPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");

  setTimeout(() => {
    detailPanel.classList.remove("active", "closing");
  }, 300);
}

function revealWords(el, text, speed = 20) {
  el.classList.add("reveal-word");
  el.innerHTML = "";
  const words = text.split(" ");

  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = `${word} `;
    span.style.animationDelay = `${index * speed}ms`;
    el.appendChild(span);
  });
}

function resizeAndDrawDetail(item) {
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = detailCanvas.clientWidth;
  const cssHeight = 420;

  detailCanvas.width = cssWidth * ratio;
  detailCanvas.height = cssHeight * ratio;
  detailCanvas.style.height = `${cssHeight}px`;

  detailCtx.setTransform(1, 0, 0, 1, 0, 0);
  detailCtx.scale(ratio, ratio);

  drawSensorChart(detailCtx, { width: cssWidth, height: cssHeight }, item, true);
}

function changeFilter(nextFilter) {
  if (currentFilter === nextFilter) return;
  currentFilter = nextFilter;

  filterButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === nextFilter);
  });

  const oldCards = [...cardsGrid.querySelectorAll(".contradiction-card")];
  oldCards.forEach(card => card.classList.add("is-hiding"));

  setTimeout(() => {
    renderCards(true);
    flashBackground();
  }, 280);
}

function flashBackground() {
  document.body.animate(
    [
      { filter: "brightness(1)" },
      { filter: "brightness(1.08)" },
      { filter: "brightness(1)" }
    ],
    {
      duration: 320,
      easing: "ease"
    }
  );
}

function navigateOpen(delta) {
  if (currentOpenId == null) return;

  const sorted = contradictions.map(item => item.id);
  const index = sorted.indexOf(currentOpenId);
  const nextIndex = (index + delta + sorted.length) % sorted.length;
  openDetail(sorted[nextIndex]);
}

function setupEvents() {
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => changeFilter(btn.dataset.filter));
  });

  detailOverlay.addEventListener("click", closeDetail);
  closeDetailBtn.addEventListener("click", closeDetail);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (commandPalette.classList.contains("active")) {
        closeCommandMode();
      } else {
        closeDetail();
      }
    }

    if (event.key === "/") {
      const active = document.activeElement;
      const isTyping = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
      if (!isTyping) {
        event.preventDefault();
        openCommandMode();
      }
    }

    if (/^[1-6]$/.test(event.key)) {
      const id = Number(event.key);
      openDetail(id);
    }

    if (event.key === "ArrowRight" && detailPanel.classList.contains("active")) {
      navigateOpen(1);
    }

    if (event.key === "ArrowLeft" && detailPanel.classList.contains("active")) {
      navigateOpen(-1);
    }
  });

  commandInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const value = commandInput.value.trim().toLowerCase();

      const map = {
        all: "all",
        social: "sociale",
        work: "lavoro",
        env: "ambiente",
        media: "media"
      };

      if (map[value]) {
        changeFilter(map[value]);
        closeCommandMode();
        return;
      }

      if (/^[1-6]$/.test(value)) {
        openDetail(Number(value));
        closeCommandMode();
        return;
      }

      handleCommandEasterEgg(value);
    }
  });

  window.addEventListener("resize", () => {
    resizeParticles();

    if (detailPanel.classList.contains("active") && currentOpenId != null) {
      const item = contradictions.find(entry => entry.id === currentOpenId);
      if (item) resizeAndDrawDetail(item);
    }
  });

  requestAnimationFrame(animationLoop);
}

function handleCommandEasterEgg(cmd) {
  const responses = {
    help: "Comandi: all, social, work, env, media, 1-6, help, theme, scroll, system, data",
    theme: "Tema: Cyberpunk Matrix Dune. Neon verde, dati veri, contraddizioni viscerali.",
    scroll: "Scorrimento abilitato. Lungo verso il caos. Alto verso il quieto.",
    system: `Atlante v2.1 | ${contradictions.length} nodi | Status: ONLINE`,
    data: `Dati caricati: ${contradictions.length} contraddizioni. Fonti: demo strutturale.`,
    status: "ONLINE | Tutti i sistemi attivi | Paradossi rilevati: ∞",
    glitch: "∆GLITCH∆ > G£|≠CH > GLITCH > OK",
  };

  const response = responses[cmd] || `Comando '${cmd}' non riconosciuto. Digita 'help'.`;
  commandHints.textContent = response;
  commandHints.style.color = cmd === "glitch" ? "var(--red)" : "var(--text-dim)";
}

function openCommandMode() {
  commandPalette.classList.add("active");
  commandPalette.setAttribute("aria-hidden", "false");
  commandInput.value = "";
  commandHints.textContent = "Comandi: all, social, work, env, media, 1-6, help";
  commandHints.style.color = "var(--text-dim)";
  setTimeout(() => commandInput.focus(), 30);
}

function closeCommandMode() {
  commandPalette.classList.remove("active");
  commandPalette.setAttribute("aria-hidden", "true");
}

function initParticles() {
  resizeParticles();
  particles = Array.from({ length: 26 }, () => ({
    x: Math.random() * particlesCanvas.width,
    y: Math.random() * particlesCanvas.height,
    r: Math.random() * 1.8 + 0.6,
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.08,
    a: Math.random() * 0.5 + 0.15
  }));
}

function resizeParticles() {
  const ratio = window.devicePixelRatio || 1;
  particlesCanvas.width = window.innerWidth * ratio;
  particlesCanvas.height = window.innerHeight * ratio;
  particlesCanvas.style.width = `${window.innerWidth}px`;
  particlesCanvas.style.height = `${window.innerHeight}px`;
  particlesCtx.setTransform(1, 0, 0, 1, 0, 0);
  particlesCtx.scale(ratio, ratio);
}

function animationLoop() {
  pulsePhase += 0.05;
  drawParticles();

  canvasDrawQueue.forEach(q => {
    if (q.isVisible && q.item) {
      drawMiniChart(q.canvas, q.item);
    }
  });

  if (detailPanel.classList.contains("active") && currentOpenId != null) {
    const item = contradictions.find(entry => entry.id === currentOpenId);
    if (item) {
      resizeAndDrawDetail(item);
    }
  }

  requestAnimationFrame(animationLoop);
}

function drawParticles() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  particlesCtx.clearRect(0, 0, w, h);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;

    particlesCtx.beginPath();
    particlesCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    particlesCtx.fillStyle = `rgba(26,255,77,${p.a})`;
    particlesCtx.fill();
  });
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

loadData();
