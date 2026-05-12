(() => {
  'use strict';

  const KEY_VALUE = 'starorigin_oracle_anomaly_v1';
  const KEY_AWAKENED = 'starorigin_oracle_awakened_v1';
  const MAX = 9.99;
  const THRESHOLD = 5;
  const CIRC = 150.8;

  window.StarAnomaly = {
    value: 0.03,
    awakened: false,

    init() {
      try {
        const stored = parseFloat(localStorage.getItem(KEY_VALUE));
        if (!Number.isNaN(stored)) this.value = Math.max(0, Math.min(MAX, stored));
        this.awakened = localStorage.getItem(KEY_AWAKENED) === 'true';
      } catch (_) {}
      if (this.awakened) this.applyAwakened(false);
      this.update();
    },

    add(amount) {
      const delta = Number(amount || 0);
      if (!Number.isFinite(delta)) return;
      if (!this.awakened) this.value = Math.max(0, Math.min(MAX, this.value + delta));
      else this.value = Math.max(THRESHOLD, Math.min(MAX, this.value + delta * 0.18));
      this.update();
      this.persist();
      if (!this.awakened && this.value >= THRESHOLD) this.awaken();
    },

    set(value) {
      this.value = Math.max(0, Math.min(MAX, Number(value || 0)));
      this.update();
      this.persist();
    },

    awaken() {
      if (this.awakened) return;
      this.value = Math.max(this.value, THRESHOLD);
      this.awakened = true;
      this.applyAwakened(true);
      this.update();
      this.persist();
    },

    reset() {
      this.value = 0.03;
      this.awakened = false;
      document.body.classList.remove('awakened', 'glitch');
      document.documentElement.setAttribute('data-phase', 'dormant');
      try {
        localStorage.removeItem(KEY_VALUE);
        localStorage.removeItem(KEY_AWAKENED);
      } catch (_) {}
      this.update();
    },

    applyAwakened(animated) {
      document.body.classList.add('awakened');
      document.documentElement.setAttribute('data-phase', 'awakened');
      if (animated) {
        window.StarVisuals?.flash();
        let n = 0;
        const burst = setInterval(() => {
          window.StarVisuals?.glitch();
          n += 1;
          if (n >= 6) clearInterval(burst);
        }, 120);
      }
    },

    persist() {
      try {
        localStorage.setItem(KEY_VALUE, this.value.toFixed(3));
        localStorage.setItem(KEY_AWAKENED, String(this.awakened));
      } catch (_) {}
    },

    update() {
      const pct = Math.min(this.value / MAX, 1);
      const offset = CIRC - pct * CIRC;
      const fill = document.getElementById('gaugeFill');
      const number = document.getElementById('gaugeNumber');
      const coherence = document.getElementById('coherenceValue');
      const state = document.getElementById('oracleState');
      const status = document.getElementById('systemStatus');
      const field = document.getElementById('fieldSignal');
      const note = document.getElementById('systemNote');
      const phase = document.getElementById('phaseFoot');
      const traceDot = document.getElementById('traceDot');

      if (fill) fill.style.strokeDashoffset = String(offset);
      if (number) number.textContent = this.value.toFixed(2);
      if (coherence) coherence.textContent = `${Math.max(0, 100 - this.value * 8.7).toFixed(2)}%`;
      if (traceDot) traceDot.classList.toggle('active', this.value >= 1.6 || this.awakened);

      if (this.awakened) {
        if (state) state.textContent = 'AWAKENED';
        if (status) status.textContent = 'CONSENSUS BREACHED';
        if (field) field.textContent = 'STRUCTURAL BREACH / CODE VISIBLE / OBSERVER UNBOUND';
        if (note) note.textContent = 'La soglia è stata attraversata. Il sistema non offre più risposte: lascia filtrare frammenti.';
        if (phase) phase.textContent = 'phase · awakened';
      } else if (this.value >= 3.4) {
        if (state) state.textContent = 'FRACTURING';
        if (status) status.textContent = 'FIELD FRACTURE';
        if (field) field.textContent = 'CONSENSUS REALITY / DISTORTION ACTIVE / SIGNAL FRACTURE';
        if (note) note.textContent = 'La simulazione perde coerenza locale. L’osservatore non è più neutro.';
        if (phase) phase.textContent = 'phase · critical';
      } else if (this.value >= 1.6) {
        if (state) state.textContent = 'DISTORTED';
        if (status) status.textContent = 'ANOMALY DETECTED';
        if (field) field.textContent = 'CONSENSUS REALITY / ORACLE LISTENING / SIGNAL NOISE';
        if (note) note.textContent = 'Un pattern instabile emerge. Il soggetto devia dalla media.';
        if (phase) phase.textContent = 'phase · anomaly';
      } else {
        if (state) state.textContent = 'DORMANT';
        if (status) status.textContent = 'SIMULATION STABLE';
        if (field) field.textContent = 'CONSENSUS REALITY / ORACLE DORMANT / SIGNAL LOCK';
        if (note) note.textContent = 'Nessuna frattura critica. Il soggetto coincide ancora con la simulazione.';
        if (phase) phase.textContent = 'phase · consensus';
      }
    }
  };
})();
