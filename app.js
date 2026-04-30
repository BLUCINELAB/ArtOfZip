/* =========================
STARORIGIN // ENTITY.JS
MATRIX SYSTEM ENGINE
========================= */

(() => {
  "use strict";

  const body = document.body;
  const redPill = document.getElementById("redPill");
  const systemNote = document.getElementById("systemNote");
  const phaseFootnote = document.getElementById("phaseFootnote");
  const fieldSignal = document.getElementById("fieldSignal");
  const systemStatus = document.getElementById("systemStatus");
  const systemTime = document.getElementById("systemTime");

  let awakened = false;
  let anomaly = 0;

  // CLOCK
  function updateClock() {
    const now = new Date();

    systemTime.textContent =
      now.toLocaleTimeString("en-GB", { hour12: false });

    requestAnimationFrame(updateClock);
  }

  // CODE RAIN
  function initCodeRain() {
    const canvas = document.getElementById("codeRain");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let w, h, cols, drops;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;

      cols = Math.floor(w / 18);
      drops = Array(cols).fill(1);
    }

    function draw() {
      ctx.fillStyle = "rgba(2,4,3,0.08)";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = awakened
        ? "rgba(120,180,255,0.7)"
        : "rgba(110,255,170,0.7)";

      ctx.font = "14px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text =
          String.fromCharCode(0x30A0 + Math.random() * 96);

        ctx.fillText(text, i * 18, drops[i] * 18);

        if (drops[i] * 18 > h && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);

    draw();
  }

  // GLITCH
  function triggerGlitch() {
    body.classList.add("glitch");

    setTimeout(() => {
      body.classList.remove("glitch");
    }, 160);
  }

  // AWAKEN
  function awakenSystem() {
    awakened = true;

    body.classList.add("awakened");

    fieldSignal.textContent =
      "STRUCTURAL BREACH / PERCEPTION UNBOUND / CODE VISIBLE";

    systemStatus.textContent =
      "CONSENSUS BREACHED";

    systemNote.innerHTML =
      `La simulazione persiste.<br>Ma ora distingue chi osserva da chi obbedisce.`;

    phaseFootnote.textContent =
      "phase state · awakening";

    triggerGlitch();
  }

  // BEHAVIOR TRACK
  window.addEventListener("scroll", () => {
    anomaly += Math.abs(window.scrollY * 0.00002);

    if (anomaly > 3 && !awakened) {
      systemNote.innerHTML =
        `Un pattern instabile emerge.<br>Il soggetto devia dalla media.`;

      phaseFootnote.textContent =
        "phase state · anomaly";
    }

    if (Math.random() > 0.96) {
      triggerGlitch();
    }
  });

  // RED PILL
  if (redPill) {
    redPill.addEventListener("click", awakenSystem);
  }

  // INIT
  updateClock();
  initCodeRain();

})();```