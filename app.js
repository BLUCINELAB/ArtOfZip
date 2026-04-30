(() => {
  "use strict";

  // ==========================================
  // NEBULA — STARORIGIN SYSTEM LAYER
  // Da visual organism → epistemic field
  // ==========================================

  const systemNote = document.getElementById("systemNote");
  const sitePhase = document.getElementById("sitePhase");
  const phaseFootnote = document.getElementById("phaseFootnote");

  // NEW LIVE METRICS
  let metricsLayer;
  let metrics = {
    presenceDrift: 72.4,
    latencyField: "UNSTABLE",
    memoryDensity: 0.31,
    signalRetention: 0.58,
    observationNode: "NODE_03"
  };

  // PHASE LEXICON UPGRADE
  const notes = {
    listening: "Il sistema osserva prima di rispondere.",
    revealing: "Il campo devia. La presenza modifica la struttura.",
    network: "Una coerenza locale sta emergendo. La stabilità resta temporanea.",
    saturated: "La densità mnemonica supera la soglia. Il sistema accelera.",
    collapse: "Una regione è stata svuotata. La memoria persiste per sottrazione.",
    dormant: "Attività minima. Il campo conserva tracce fredde.",
    wake: "Nuovo disturbo rilevato. Il sistema riapre il flusso."
  };

  // ==========================================
  // METRICS UI
  // ==========================================
  function createMetricsLayer() {
    metricsLayer = document.createElement("div");
    metricsLayer.className = "metrics-layer";

    metricsLayer.innerHTML = `
      <div class="metric-block">
        <span class="metric-label">PRESENCE DRIFT</span>
        <span class="metric-value" id="presenceMetric">72.4%</span>
      </div>

      <div class="metric-block">
        <span class="metric-label">LATENCY FIELD</span>
        <span class="metric-value" id="latencyMetric">UNSTABLE</span>
      </div>

      <div class="metric-block">
        <span class="metric-label">MEMORY DENSITY</span>
        <span class="metric-value" id="memoryMetric">0.31</span>
      </div>
    `;

    document.body.appendChild(metricsLayer);
  }

  function injectMetricsStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .metrics-layer {
        position: fixed;
        right: 2.5rem;
        bottom: 2.2rem;
        z-index: 12;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        pointer-events: none;
        mix-blend-mode: screen;
      }

      .metric-block {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .metric-label {
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.54rem;
        letter-spacing: 0.34em;
        color: rgba(245,240,230,0.22);
      }

      .metric-value {
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.7rem;
        letter-spacing: 0.18em;
        color: rgba(245,240,230,0.58);
      }

      @media (max-width: 780px) {
        .metrics-layer {
          right: 1.2rem;
          bottom: 1.4rem;
          gap: 0.65rem;
        }

        .metric-label {
          font-size: 0.48rem;
        }

        .metric-value {
          font-size: 0.62rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================
  // METRICS UPDATE ENGINE
  // ==========================================
  function updateMetrics(state) {
    // Presence Drift
    metrics.presenceDrift += (state.motionEnergy * 0.028) - 0.012;
    metrics.presenceDrift = clamp(metrics.presenceDrift, 12, 99.2);

    // Memory Density
    metrics.memoryDensity += (state.averageResidue - metrics.memoryDensity) * 0.04;
    metrics.memoryDensity = clamp(metrics.memoryDensity, 0.01, 0.99);

    // Latency Status
    if (state.mode === "SATURATED") metrics.latencyField = "CRITICAL";
    else if (state.mode === "NETWORK") metrics.latencyField = "MAPPING";
    else if (state.mode === "COLLAPSING") metrics.latencyField = "FRACTURED";
    else if (state.mode === "DORMANT") metrics.latencyField = "LOW";
    else metrics.latencyField = "UNSTABLE";

    // UI Apply
    const presence = document.getElementById("presenceMetric");
    const latency = document.getElementById("latencyMetric");
    const memory = document.getElementById("memoryMetric");

    if (presence) presence.textContent = `${metrics.presenceDrift.toFixed(1)}%`;
    if (latency) latency.textContent = metrics.latencyField;
    if (memory) memory.textContent = metrics.memoryDensity.toFixed(2);
  }

  // ==========================================
  // PHASE UI ENHANCED
  // ==========================================
  function applyPhaseToUI(state) {
    document.body.dataset.phase = state.mode.toLowerCase();

    if (sitePhase) {
      sitePhase.textContent = state.mode;
    }

    if (systemNote) {
      systemNote.textContent = notes[state.mode.toLowerCase()] || state.note;
    }

    if (phaseFootnote) {
      phaseFootnote.textContent =
        `phase state · ${state.mode.toLowerCase()} · ${metrics.observationNode.toLowerCase()}`;
    }

    updateMetrics(state);
  }

  // ==========================================
  // SIGNAL DISTORTION EVENTS
  // ==========================================
  function triggerSignalGlitch() {
    document.body.classList.add("signal-glitch");

    setTimeout(() => {
      document.body.classList.remove("signal-glitch");
    }, 180);
  }

  function injectGlitchStyles() {
    const style = document.createElement("style");

    style.textContent = `
      body.signal-glitch .hero-title,
      body.signal-glitch .site-phase {
        text-shadow:
          2px 0 rgba(130,160,220,0.28),
          -2px 0 rgba(210,140,80,0.22),
          0 0 12px rgba(255,255,255,0.08);
      }

      body.signal-glitch .hero-title {
        transform: translateX(1px);
      }
    `;

    document.head.appendChild(style);
  }

  // ==========================================
  // UTILS
  // ==========================================
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // ==========================================
  // PUBLIC INJECTION
  // Hook this into main simulation:
  // window.NebulaStarorigin.applyPhase(state)
  // ==========================================
  window.NebulaStarorigin = {
    applyPhase(state) {
      applyPhaseToUI(state);

      if (
        state.mode === "COLLAPSING" ||
        state.mode === "SATURATED"
      ) {
        if (Math.random() > 0.78) triggerSignalGlitch();
      }
    }
  };

  // ==========================================
  // INIT
  // ==========================================
  function init() {
    injectMetricsStyles();
    injectGlitchStyles();
    createMetricsLayer();
  }

  init();
})();