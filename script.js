/* =========================================================
   Lampo d'Autore — script.js
   Live clock · Animated counters · Tab nav · Swipe · Live data
   ========================================================= */

"use strict";

(function () {

  /* ── DOM ────────────────────────────────────────────────── */
  const liveClock    = document.getElementById("live-clock");
  const statusIndex  = document.getElementById("status-index");
  const riskTime     = document.getElementById("risk-time");
  const signalsTag   = document.getElementById("signals-update");

  const tabs    = Array.from(document.querySelectorAll(".bottom-nav__item"));
  const panels  = Array.from(document.querySelectorAll(".tab-panel"));

  /* ── LIVE CLOCK ─────────────────────────────────────────── */
  function updateClock() {
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, "0");
    const mm  = String(now.getMinutes()).padStart(2, "0");
    const ss  = String(now.getSeconds()).padStart(2, "0");
    if (liveClock) liveClock.textContent = `${hh}:${mm}:${ss}`;
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ── ANIMATED COUNTERS ──────────────────────────────────── */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10) || 0;
    const prefix   = el.dataset.prefix   || "";
    const suffix   = el.dataset.suffix   || "";
    const duration = 1200;
    const start    = performance.now();

    if (prefersReduced) {
      el.textContent = prefix + target + suffix;
      return;
    }

    function tick(now) {
      const elapsed  = Math.min(now - start, duration);
      const progress = elapsed / duration;
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const value = Math.round(ease * target);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* Observe elements entering viewport */
  function initCounters() {
    const counters = document.querySelectorAll(".counter[data-target]");
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = "1";
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
  }

  initCounters();

  /* ── TAB NAVIGATION ─────────────────────────────────────── */
  let currentTab = 0;

  function activateTab(index, animate = true) {
    if (index === currentTab) return;

    const prevIndex  = currentTab;
    const direction  = index > prevIndex ? 1 : -1;
    currentTab       = index;

    // Update tabs
    tabs.forEach((btn, i) => {
      const active = i === index;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    // Hide old panel
    const oldPanel = panels[prevIndex];
    const newPanel = panels[index];

    oldPanel.classList.remove("active");

    if (!prefersReduced && animate) {
      oldPanel.style.transform = `translateX(${direction * -28}px)`;
      oldPanel.style.opacity   = "0";
      setTimeout(() => {
        oldPanel.setAttribute("hidden", "");
        oldPanel.style.transform = "";
        oldPanel.style.opacity   = "";
      }, 220);

      newPanel.removeAttribute("hidden");
      newPanel.style.transform = `translateX(${direction * 28}px)`;
      newPanel.style.opacity   = "0";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          newPanel.style.transition = "transform 220ms cubic-bezier(.22,1,.36,1), opacity 220ms ease";
          newPanel.style.transform  = "translateX(0)";
          newPanel.style.opacity    = "1";
          newPanel.classList.add("active");
          setTimeout(() => {
            newPanel.style.transition = "";
            newPanel.style.transform  = "";
            newPanel.style.opacity    = "";
          }, 240);
        });
      });
    } else {
      oldPanel.setAttribute("hidden", "");
      newPanel.removeAttribute("hidden");
      newPanel.classList.add("active");
    }

    // Animate counters in the revealed panel
    newPanel.querySelectorAll(".counter[data-target]:not([data-animated])").forEach(el => {
      el.dataset.animated = "1";
      animateCounter(el);
    });
  }

  tabs.forEach((btn, i) => {
    btn.addEventListener("click", () => activateTab(i));
  });

  /* ── SWIPE (touch) ──────────────────────────────────────── */
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    // Only horizontal swipe if horizontal > vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      if (dx < 0 && currentTab < tabs.length - 1) {
        activateTab(currentTab + 1);
      } else if (dx > 0 && currentTab > 0) {
        activateTab(currentTab - 1);
      }
    }
  }, { passive: true });

  /* Keyboard arrow navigation */
  document.addEventListener("keydown", e => {
    if (e.target.closest(".bottom-nav")) {
      if (e.key === "ArrowRight" && currentTab < tabs.length - 1) {
        activateTab(currentTab + 1);
        tabs[currentTab].focus();
        e.preventDefault();
      }
      if (e.key === "ArrowLeft" && currentTab > 0) {
        activateTab(currentTab - 1);
        tabs[currentTab].focus();
        e.preventDefault();
      }
    }
  });

  /* ── LIVE DATA SIMULATION ───────────────────────────────── */
  const SIGNALS = [
    { range: [58, 78], el: null },
    { range: [34, 52], el: null },
    { range: [84, 96], el: null },
  ];

  const signalCounters = document.querySelectorAll("#panel-signals .counter[data-target]");
  const signalBars     = document.querySelectorAll(".signal-bar-fill");

  function randomInRange(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  function formatTime(addMinutes = 0) {
    const d = new Date(Date.now() + addMinutes * 60000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // Update forecast index every 8s
  function updateIndex() {
    const val = randomInRange(72, 96);
    if (statusIndex) {
      const strong = statusIndex.querySelector("strong");
      if (strong) strong.textContent = val;
    }
  }

  // Pulse signal values occasionally
  function pulseSignals() {
    SIGNALS.forEach((sig, i) => {
      const newVal = randomInRange(sig.range[0], sig.range[1]);
      const counter = signalCounters[i];
      const bar     = signalBars[i];

      if (counter) {
        counter.dataset.target = newVal;
        counter.dataset.animated = ""; // allow re-animation
        animateCounter(counter);
      }
      if (bar) {
        bar.style.setProperty("--fill", newVal + "%");
      }
    });

    if (signalsTag) {
      signalsTag.textContent = "updated " + formatTime();
    }
  }

  // Update risk time every 5 min
  function updateRiskTime() {
    if (riskTime) riskTime.textContent = formatTime(randomInRange(8, 90));
  }

  updateIndex();
  updateRiskTime();

  setInterval(updateIndex,   8000);
  setInterval(pulseSignals,  6000);
  setInterval(updateRiskTime, 120000);

  /* ── HAPTIC FEEDBACK (if available) ────────────────────── */
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      if (navigator.vibrate) navigator.vibrate(8);
    });
  });

})();
