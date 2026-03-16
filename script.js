"use strict";

(() => {
  const terrainLayer = document.getElementById("terrainLayer");
  const windLayer = document.getElementById("windLayer");
  const eventLayer = document.getElementById("eventLayer");

  const stationName = document.getElementById("stationName");
  const updatedAt = document.getElementById("updatedAt");
  const stateWord = document.getElementById("stateWord");
  const stateSentence = document.getElementById("stateSentence");
  const dominantReading = document.getElementById("dominantReading");
  const pressureReading = document.getElementById("pressureReading");
  const windReading = document.getElementById("windReading");
  const airReading = document.getElementById("airReading");
  const lightReading = document.getElementById("lightReading");
  const lightningReading = document.getElementById("lightningReading");
  const quakeReading = document.getElementById("quakeReading");
  const trendReading = document.getElementById("trendReading");
  const memoryReading = document.getElementById("memoryReading");
  const modeLabel = document.getElementById("modeLabel");
  const ambientLight = document.getElementById("ambientLight");
  const todayTimeline = document.getElementById("todayTimeline");

  const navButtons = document.querySelectorAll(".bottom-nav__item");

  const stateMap = {
    QUIETE: {
      accent: "#d8d2c8",
      sentence: "Pressione stabile, aria nitida, rilievo composto.",
      dominant: "Chiarezza"
    },
    EROSIONE: {
      accent: "#b78f6b",
      sentence: "Il vento incide il suolo e sposta la materia.",
      dominant: "Incisione"
    },
    SATURAZIONE: {
      accent: "#8d9ba5",
      sentence: "Nuvole basse, umidità in aumento, superficie carica.",
      dominant: "Addensamento"
    },
    OPACITÀ: {
      accent: "#a59f90",
      sentence: "La qualità dell’aria vela il paesaggio e riduce il contrasto.",
      dominant: "Velatura"
    },
    SCARICA: {
      accent: "#cf8454",
      sentence: "Evento elettrico recente, accumulo e rilascio.",
      dominant: "Scarica"
    },
    FRATTURA: {
      accent: "#d29a71",
      sentence: "Interferenza tellurica locale, tremore e memoria.",
      dominant: "Frattura"
    },
    CHIAREZZA: {
      accent: "#ebe5dc",
      sentence: "Luce leggibile, contrasto buono, disturbo minimo.",
      dominant: "Chiarezza"
    }
  };

  let currentMode = "now";

  const fakeData = {
    station: "Bologna Urbana",
    pressure: 1018,
    windSpeed: 12,
    windDir: "NE",
    windAngle: 36,
    airQuality: 42,
    cloudCover: 18,
    rain: 0.1,
    lightLevel: 0.72,
    lightDescriptor: "tramonto radente",
    lightning: 3,
    quakeMag: 2.1,
    trend: "risalita lenta",
    memory: "velatura moderata",
    state: "CHIAREZZA"
  };

  function pad(num) {
    return String(num).padStart(2, "0");
  }

  function updateClockStamp() {
    const now = new Date();
    updatedAt.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  function computeState(data) {
    if (data.quakeMag >= 3) return "FRATTURA";
    if (data.lightning >= 4) return "SCARICA";
    if (data.airQuality >= 110) return "OPACITÀ";
    if (data.rain >= 1.5 || data.cloudCover >= 75) return "SATURAZIONE";
    if (data.windSpeed >= 22) return "EROSIONE";
    if (data.airQuality < 50 && data.windSpeed < 9 && data.cloudCover < 30) return "CHIAREZZA";
    return "QUIETE";
  }

  function applyThemeByState(state) {
    const config = stateMap[state] || stateMap.QUIETE;
    document.documentElement.style.setProperty("--state-accent", config.accent);
    stateWord.textContent = state;
    stateSentence.textContent = config.sentence;
    dominantReading.textContent = config.dominant;
  }

  function applyEnvironmentalVariables(data) {
    const blurPx = Math.max(0, Math.min(8, (data.airQuality / 180) * 8));
    const airOpacity = Math.max(0.08, Math.min(0.5, data.airQuality / 320));
    const tilt = `${(data.windAngle - 180) / 90}deg`;
    const terrainScale = currentMode === "today" ? 1.04 : currentMode === "deep" ? 1.02 : 1;
    const contrast = 1 + Math.max(0, (100 - data.airQuality) / 250);

    document.documentElement.style.setProperty("--air-blur", `${blurPx.toFixed(2)}px`);
    document.documentElement.style.setProperty("--air-opacity", airOpacity.toFixed(2));
    document.documentElement.style.setProperty("--terrain-tilt", tilt);
    document.documentElement.style.setProperty("--terrain-scale", String(terrainScale));
    document.documentElement.style.setProperty("--surface-contrast", contrast.toFixed(2));
    document.documentElement.style.setProperty("--luminosity", String(data.lightLevel));

    const lightX = 65 + Math.cos((data.windAngle * Math.PI) / 180) * 10;
    const lightY = 18 + (1 - data.lightLevel) * 40;
    document.documentElement.style.setProperty("--light-x", `${lightX}%`);
    document.documentElement.style.setProperty("--light-y", `${lightY}%`);

    ambientLight.style.opacity = currentMode === "deep" ? "0.65" : "1";
  }

  function createPathD(lineIndex, amplitude, baseY, phase, density) {
    const steps = 14;
    const width = 1600;
    let d = `M 0 ${baseY}`;

    for (let i = 0; i <= steps; i++) {
      const x = (width / steps) * i;
      const t = i / steps;
      const waveA = Math.sin((t * 8) + phase + lineIndex * 0.18) * amplitude;
      const waveB = Math.cos((t * 19) + phase * 0.7 + lineIndex * 0.1) * (amplitude * 0.35);
      const waveC = Math.sin((t * density) + lineIndex * 0.4) * (amplitude * 0.15);
      const y = baseY + waveA + waveB + waveC;

      if (i === 0) {
        d = `M ${x} ${y}`;
      } else {
        d += ` L ${x} ${y}`;
      }
    }

    return d;
  }

  function renderTerrain(data) {
    terrainLayer.innerHTML = "";

    const pressureNorm = Math.max(0, Math.min(1, (data.pressure - 980) / 55));
    const amplitudeBase = 34 + (1 - pressureNorm) * 52 + data.rain * 8;
    const lineCount = currentMode === "deep" ? 10 : 12;
    const phase = Date.now() * 0.00025;

    for (let i = 0; i < lineCount; i++) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const y = 180 + i * 48;
      const amp = amplitudeBase + i * 3 + (data.windSpeed * 0.35);
      const d = createPathD(i, amp, y, phase, 18 + data.windSpeed);
      path.setAttribute("d", d);
      path.setAttribute("stroke-width", (0.9 + i * 0.06).toFixed(2));
      path.setAttribute("opacity", String(0.18 + i * 0.045));
      terrainLayer.appendChild(path);
    }
  }

  function renderWind(data) {
    windLayer.innerHTML = "";

    const lineCount = currentMode === "deep" ? 16 : 24;
    const angleRad = (data.windAngle * Math.PI) / 180;
    const length = 44 + data.windSpeed * 2.2;

    for (let i = 0; i < lineCount; i++) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const x = 80 + (i % 8) * 190 + (i * 7);
      const y = 130 + Math.floor(i / 2) * 48;
      const x2 = x + Math.cos(angleRad) * length;
      const y2 = y + Math.sin(angleRad) * length;
      const bend = data.windSpeed * 0.7;

      const d = `M ${x} ${y} Q ${(x + x2) / 2} ${(y + y2) / 2 + bend} ${x2} ${y2}`;
      path.setAttribute("d", d);
      path.setAttribute("stroke-width", String(0.6 + data.windSpeed / 25));
      path.setAttribute("opacity", String(0.06 + data.windSpeed / 100));
      windLayer.appendChild(path);
    }
  }

  function renderEvents(data) {
    eventLayer.innerHTML = "";

    if (data.lightning > 0) {
      for (let i = 0; i < Math.min(data.lightning, 5); i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const x = 250 + i * 210;
        const top = 160 + (i % 2) * 40;
        const bottom = top + 90 + i * 12;

        line.setAttribute("x1", x);
        line.setAttribute("y1", top);
        line.setAttribute("x2", x - 18 + i * 4);
        line.setAttribute("y2", bottom);
        line.setAttribute("stroke", "rgba(234, 225, 210, 0.55)");
        line.setAttribute("stroke-width", "2.2");
        line.setAttribute("opacity", currentMode === "deep" ? "0.15" : "0.32");
        eventLayer.appendChild(line);
      }
    }

    if (data.quakeMag >= 2) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "1020");
      circle.setAttribute("cy", "540");
      circle.setAttribute("r", String(18 + data.quakeMag * 12));
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", "rgba(207, 132, 84, 0.34)");
      circle.setAttribute("stroke-width", "2");
      eventLayer.appendChild(circle);
    }
  }

  function renderTimeline(data) {
    todayTimeline.innerHTML = "";
    const base = Math.max(26, Math.min(88, (data.pressure - 980) * 1.15));

    for (let i = 0; i < 6; i++) {
      const bar = document.createElement("div");
      bar.className = "timeline__bar";
      const h = base + Math.sin(i * 0.9 + data.windSpeed * 0.08) * 24 + (data.rain * 10);
      bar.style.height = `${Math.max(28, h)}px`;
      bar.style.opacity = `${0.55 + i * 0.06}`;
      todayTimeline.appendChild(bar);
    }
  }

  function updateReadings(data) {
    stationName.textContent = data.station;
    pressureReading.textContent = `${Math.round(data.pressure)} hPa`;
    windReading.textContent = `${Math.round(data.windSpeed)} km/h · ${data.windDir}`;
    airReading.textContent = `AQI ${Math.round(data.airQuality)}`;
    lightReading.textContent = data.lightDescriptor;
    lightningReading.textContent = `${String(data.lightning).padStart(2, "0")} eventi`;
    quakeReading.textContent = `M ${data.quakeMag.toFixed(1)} locale`;
    trendReading.textContent = data.trend;
    memoryReading.textContent = data.memory;
  }

  function updateMode(mode) {
    currentMode = mode;

    navButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.mode === mode);
    });

    if (mode === "now") {
      modeLabel.textContent = "trasmissione viva";
    } else if (mode === "today") {
      modeLabel.textContent = "memoria del giorno";
    } else {
      modeLabel.textContent = "strato lento";
    }

    renderAll(fakeData);
  }

  function renderAll(data) {
    data.state = computeState(data);
    applyThemeByState(data.state);
    applyEnvironmentalVariables(data);
    updateReadings(data);
    renderTerrain(data);
    renderWind(data);
    renderEvents(data);
    renderTimeline(data);
    updateClockStamp();
  }

  function driftData() {
    fakeData.pressure += (Math.random() - 0.5) * 1.4;
    fakeData.windSpeed = Math.max(2, Math.min(34, fakeData.windSpeed + (Math.random() - 0.5) * 4));
    fakeData.airQuality = Math.max(18, Math.min(160, fakeData.airQuality + (Math.random() - 0.5) * 12));
    fakeData.cloudCover = Math.max(0, Math.min(100, fakeData.cloudCover + (Math.random() - 0.5) * 16));
    fakeData.rain = Math.max(0, Math.min(3, fakeData.rain + (Math.random() - 0.5) * 0.8));
    fakeData.lightning = Math.max(0, Math.min(6, Math.round(fakeData.lightning + (Math.random() - 0.5) * 2)));
    fakeData.quakeMag = Math.max(0.8, Math.min(3.8, fakeData.quakeMag + (Math.random() - 0.5) * 0.25));

    const dirAngles = [
      { label: "N", angle: 0 },
      { label: "NE", angle: 45 },
      { label: "E", angle: 90 },
      { label: "SE", angle: 135 },
      { label: "S", angle: 180 },
      { label: "SO", angle: 225 },
      { label: "O", angle: 270 },
      { label: "NO", angle: 315 }
    ];
    const choice = dirAngles[Math.floor(Math.random() * dirAngles.length)];
    fakeData.windDir = choice.label;
    fakeData.windAngle = choice.angle;

    const hour = new Date().getHours();
    if (hour <= 6) {
      fakeData.lightLevel = 0.22;
      fakeData.lightDescriptor = "notte profonda";
    } else if (hour <= 9) {
      fakeData.lightLevel = 0.55;
      fakeData.lightDescriptor = "alba diffusa";
    } else if (hour <= 16) {
      fakeData.lightLevel = 0.85;
      fakeData.lightDescriptor = "luce alta";
    } else if (hour <= 19) {
      fakeData.lightLevel = 0.68;
      fakeData.lightDescriptor = "tramonto radente";
    } else {
      fakeData.lightLevel = 0.3;
      fakeData.lightDescriptor = "dopo luce";
    }
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => updateMode(button.dataset.mode));
  });

  renderAll(fakeData);

  setInterval(() => {
    driftData();
    renderAll(fakeData);
  }, 7000);

  setInterval(updateClockStamp, 1000);
})();
