(() => {
  'use strict';

  const STATES = ['DORMANT', 'BREACH', 'THRESHOLD', 'AFTERIMAGE'];
  const CIRC = 150.8;
  const MAX = 9.99;

  const normalizeState = value => {
    const state = String(value || '').toUpperCase();
    return STATES.includes(state) ? state : 'DORMANT';
  };

  window.StarAnomaly = {
    state: 'DORMANT',
    value: 0.03,
    volatility: 0,
    awakened: false,

    init() {
      this.state = normalizeState(window.StarMemory?.getState?.() || 'DORMANT');
      this.applyState(false);
      this.update();
    },

    add(amount) {
      const delta = Number(amount || 0);
      if (!Number.isFinite(delta)) return;
      this.volatility = Math.max(0, Math.min(3.2, this.volatility + delta));
      this.update();
    },

    set(value) {
      const next = Number(value || 0);
      if (!Number.isFinite(next)) return;
      this.volatility = Math.max(0, Math.min(3.2, next));
      this.update();
    },

    reduce(amount = 0.7) {
      this.volatility = Math.max(0, this.volatility - Number(amount || 0));
      this.update();
    },

    ensureBreach() {
      if (this.state !== 'DORMANT') return false;
      this.setState('BREACH', true);
      return true;
    },

    awaken() {
      const count = window.StarMemory?.interactionCount || 0;
      if (this.state === 'DORMANT') return { ok: false, reason: 'dormant' };
      if (this.state === 'AFTERIMAGE') return { ok: false, reason: 'afterimage' };
      if (this.state === 'THRESHOLD') return { ok: true, changed: false };
      if (count < 3) return { ok: false, reason: 'weight', count };
      this.setState('THRESHOLD', true);
      return { ok: true, changed: true };
    },

    collapse() {
      if (this.state !== 'THRESHOLD') return false;
      this.setState('AFTERIMAGE', true);
      this.volatility = Math.max(0.2, this.volatility * 0.32);
      this.update();
      return true;
    },

    reset() {
      this.setState('DORMANT', false);
      this.volatility = 0;
      this.update();
    },

    setState(state, animated = false) {
      this.state = normalizeState(state);
      window.StarMemory?.setState?.(this.state);
      this.applyState(animated);
      this.update();
    },

    applyState(animated) {
      const body = document.body;
      const html = document.documentElement;
      const phase = this.state.toLowerCase();
      this.awakened = this.state === 'THRESHOLD';

      html.setAttribute('data-phase', phase);
      body.classList.remove('state-dormant', 'state-breach', 'state-threshold', 'state-afterimage', 'awakened', 'glitch');
      body.classList.add(`state-${phase}`);
      body.classList.toggle('awakened', this.awakened);

      if (animated) window.StarVisuals?.phasePulse?.(this.state);
    },

    calculateValue() {
      const memory = window.StarMemory?.traces?.length || 0;
      const forgotten = window.StarMemory?.forgottenLog?.length || 0;
      const afterimage = window.StarMemory?.afterimageFragments?.length || 0;
      const base = {
        DORMANT: 0.03,
        BREACH: 1.28,
        THRESHOLD: 5.18,
        AFTERIMAGE: 1.76
      }[this.state] || 0.03;
      return Math.max(0.03, Math.min(MAX, base + memory * 0.1 + forgotten * 0.32 + afterimage * 0.08 + this.volatility));
    },

    update() {
      this.value = this.calculateValue();
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
      if (coherence) coherence.textContent = `${Math.max(0, 100 - this.value * 7.8).toFixed(2)}%`;
      if (state) state.textContent = this.state;
      if (phase) phase.textContent = `phase · ${this.state.toLowerCase()}`;
      if (traceDot) traceDot.classList.toggle('active', this.value >= 1.3 || this.state === 'THRESHOLD');

      const copy = {
        DORMANT: {
          status: 'ORACLE ASLEEP',
          field: 'DORMANT FIELD / NO RECORD / WAITING FOR BREATH',
          note: 'Il campo dorme. Nessuna traccia ha ancora preso peso.'
        },
        BREACH: {
          status: 'BREACH OPEN',
          field: 'BREACH / FIRST TRACE / LOW PRESSURE',
          note: 'La superficie ha ceduto appena. Il campo comincia a trattenere conseguenza.'
        },
        THRESHOLD: {
          status: 'THRESHOLD AWAKE',
          field: 'THRESHOLD / MEMORY WEIGHT / RETURN ALTERED',
          note: 'La soglia e aperta. L archivio non registra soltanto: modifica il ritorno.'
        },
        AFTERIMAGE: {
          status: 'AFTERIMAGE',
          field: 'AFTERIMAGE / RESIDUE / REDUCED FIELD',
          note: 'Qualcosa e accaduto. Resta una stanza piu vuota, con tracce piu lente.'
        }
      }[this.state];

      if (status) status.textContent = copy.status;
      if (field) field.textContent = copy.field;
      if (note) note.textContent = copy.note;
    }
  };
})();
