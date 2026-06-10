/*
  Carotaggio
  Gestisce il prelievo sulla superficie e il passaggio dagli strati
  alla sezione sottile.
*/

(function () {
  "use strict";

  const surface = document.getElementById("surface");
  const rippleLayer = document.getElementById("ripple-layer");
  const coreContainer = document.getElementById("carota-container");
  const cursor = document.getElementById("custom-cursor");
  const sampleQuestion = document.getElementById("sample-question");
  const sectionView = document.getElementById("thin-section-view");
  const sectionCanvas = document.getElementById("sezione-sottile");
  const tooltip = document.getElementById("tooltip");

  const strataManager = new window.StrataManager(coreContainer);
  const sezione = new window.SezioneSottile(sectionCanvas, sectionView, tooltip);

  window.PsychoApp = window.PsychoApp || {};
  window.PsychoApp.strataManager = strataManager;
  window.PsychoApp.sezione = sezione;

  function createRipple(x, y) {
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    rippleLayer.appendChild(ripple);

    window.setTimeout(() => ripple.remove(), 900);
  }

  function sampleAt(clientX, clientY) {
    const rect = surface.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return;
    }

    if (cursor) {
      cursor.classList.add("is-sampling");
      window.setTimeout(() => cursor.classList.remove("is-sampling"), 320);
    }

    createRipple(x, y);

    window.setTimeout(() => {
      strataManager.createAt(x, y);
    }, 760);
  }

  function isInteractiveTarget(target) {
    return Boolean(target.closest("button, a, .depth-panel, .core-sample, .thin-section-view"));
  }

  surface.addEventListener("click", (event) => {
    if (isInteractiveTarget(event.target)) return;
    sampleAt(event.clientX, event.clientY);
  });

  sampleQuestion.addEventListener("click", () => {
    sampleAt(window.innerWidth * 0.5, window.innerHeight * 0.5);
  });

  coreContainer.addEventListener("click", (event) => {
    const stratum = event.target.closest(".stratum");
    if (!stratum) return;

    const seed = Number(stratum.dataset.seed || "0") >>> 0;
    let layerInfo = {};

    try {
      layerInfo = JSON.parse(stratum.dataset.layer || "{}");
    } catch (error) {
      layerInfo = {};
    }

    sezione.genera(seed, layerInfo);
  });

  window.addEventListener("resize", () => {
    if (sectionView.classList.contains("is-open")) {
      sezione.draw(sezione.currentSeed);
    }
  });

  if (cursor && window.matchMedia("(pointer: fine)").matches) {
    surface.addEventListener("mouseenter", () => cursor.classList.add("is-visible"));
    surface.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));

    surface.addEventListener("mousemove", (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
  }

  surface.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      sampleAt(window.innerWidth * 0.5, window.innerHeight * 0.5);
    }
  });
})();
