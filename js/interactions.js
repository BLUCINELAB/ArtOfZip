/*
  Interazioni generali.
  Doppio click / pressione lunga per pannello profondità.
  ESC per chiusura sezione.
*/

(function () {
  "use strict";

  const surface = document.getElementById("surface");
  const panel = document.getElementById("pannello-profondita");
  const closePanel = document.getElementById("close-panel");
  const closeSection = document.getElementById("close-section");
  const randomCore = document.getElementById("random-core");
  const depthButtons = Array.from(document.querySelectorAll(".depth-option"));
  const scaleButtons = Array.from(document.querySelectorAll(".scale-button"));

  let longPressTimer = null;
  let touchMoved = false;

  function openPanel() {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    const first = panel.querySelector("button");
    if (first) first.focus({ preventScroll: true });
  }

  function closeDepthPanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    surface.focus({ preventScroll: true });
  }

  function isPanelOpen() {
    return panel.classList.contains("is-open");
  }

  surface.addEventListener("dblclick", (event) => {
    if (event.target.closest("button, a, .core-sample")) return;
    openPanel();
  });

  surface.addEventListener("touchstart", () => {
    touchMoved = false;
    window.clearTimeout(longPressTimer);
    longPressTimer = window.setTimeout(() => {
      if (!touchMoved) openPanel();
    }, 500);
  }, { passive: true });

  surface.addEventListener("touchmove", () => {
    touchMoved = true;
    window.clearTimeout(longPressTimer);
  }, { passive: true });

  surface.addEventListener("touchend", () => {
    window.clearTimeout(longPressTimer);
  }, { passive: true });

  closePanel.addEventListener("click", closeDepthPanel);

  depthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      depthButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      const depth = button.dataset.depth || "quaternario";
      window.PsychoApp.strataManager.setDepth(depth);
    });
  });

  scaleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      scaleButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      const scale = button.dataset.scale || "lineare";
      window.PsychoApp.strataManager.setScale(scale);
    });
  });

  randomCore.addEventListener("click", () => {
    closeDepthPanel();
    window.setTimeout(() => {
      window.PsychoApp.strataManager.createRandom();
    }, 260);
  });

  closeSection.addEventListener("click", () => {
    window.PsychoApp.sezione.chiudi();
    surface.focus({ preventScroll: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (window.PsychoApp.sezione.view.classList.contains("is-open")) {
        window.PsychoApp.sezione.chiudi();
        surface.focus({ preventScroll: true });
        return;
      }

      if (isPanelOpen()) {
        closeDepthPanel();
      }
    }

    if ((event.key === "p" || event.key === "P") && document.activeElement === surface) {
      openPanel();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isPanelOpen()) return;

    const clickedPanel = event.target.closest("#pannello-profondita");
    const clickedSurfaceControl = event.target.closest("#sample-question");

    if (!clickedPanel && !clickedSurfaceControl && !event.target.closest(".core-sample")) {
      closeDepthPanel();
    }
  });
})();
