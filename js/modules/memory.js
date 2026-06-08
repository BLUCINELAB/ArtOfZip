(() => {
  'use strict';

  const LIMIT = 50;
  const KEYS = {
    state: 'starorigin_state',
    interactionCount: 'starorigin_interaction_count',
    memory: 'starorigin_memory',
    forgottenLog: 'starorigin_forgotten_log',
    afterimageFragments: 'starorigin_afterimage_fragments',
    ritualCount: 'starorigin_ritual_count',
    legacyMemory: 'starorigin_oracle_memory_v1'
  };

  const STATES = ['DORMANT', 'BREACH', 'THRESHOLD', 'AFTERIMAGE'];

  const safeJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  };

  const safeText = (key, fallback) => {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (_) {
      return fallback;
    }
  };

  const safeSet = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (_) {}
  };

  const safeSetJSON = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  };

  const normalizeState = value => {
    const state = String(value || '').toUpperCase();
    return STATES.includes(state) ? state : 'DORMANT';
  };

  const clip = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);

  const makeSession = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  window.StarMemory = {
    keys: KEYS,
    traces: [],
    forgottenLog: [],
    afterimageFragments: [],
    interactionCount: 0,
    ritualCount: 0,
    session: makeSession(),

    init() {
      this.load();
      this.render();
      this.syncMeta();
    },

    load() {
      const storedState = normalizeState(safeText(KEYS.state, 'DORMANT'));
      safeSet(KEYS.state, storedState);

      const loadedMemory = safeJSON(KEYS.memory, []);
      this.traces = Array.isArray(loadedMemory) ? this.normalizeTraces(loadedMemory) : [];

      if (!this.traces.length) {
        const legacy = safeJSON(KEYS.legacyMemory, []);
        if (Array.isArray(legacy) && legacy.length) this.traces = this.migrateLegacy(legacy);
      }

      const forgotten = safeJSON(KEYS.forgottenLog, []);
      this.forgottenLog = Array.isArray(forgotten) ? forgotten.slice(-LIMIT) : [];

      const fragments = safeJSON(KEYS.afterimageFragments, []);
      this.afterimageFragments = Array.isArray(fragments) ? fragments.slice(-LIMIT) : [];

      this.interactionCount = Math.max(0, parseInt(safeText(KEYS.interactionCount, '0'), 10) || 0);
      this.ritualCount = Math.max(0, parseInt(safeText(KEYS.ritualCount, '0'), 10) || 0);

      this.persistAll();
    },

    normalizeTraces(items) {
      return items.slice(-LIMIT).map(item => ({
        input: clip(item.input || item.question, 280),
        response: clip(item.response || item.answer, 900),
        timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
        state: normalizeState(item.state),
        category: clip(item.category || 'field', 40),
        depth: Number(item.depth || 0),
        relic: clip(item.relic || window.StarOracle?.relicFor?.(item.input || item.question) || 'the room kept a small pressure.', 160)
      })).filter(item => item.input || item.response || item.relic);
    },

    migrateLegacy(items) {
      return this.normalizeTraces(items.slice(0, LIMIT).reverse().map(item => ({
        input: item.question,
        response: item.answer,
        timestamp: item.createdAt,
        state: 'BREACH',
        category: item.category,
        depth: item.depth,
        relic: 'a previous trace learned a quieter name.'
      })));
    },

    persistAll() {
      safeSetJSON(KEYS.memory, this.traces.slice(-LIMIT));
      safeSetJSON(KEYS.forgottenLog, this.forgottenLog.slice(-LIMIT));
      safeSetJSON(KEYS.afterimageFragments, this.afterimageFragments.slice(-LIMIT));
      safeSet(KEYS.interactionCount, String(this.interactionCount));
      safeSet(KEYS.ritualCount, String(this.ritualCount));
    },

    getState() {
      return normalizeState(safeText(KEYS.state, 'DORMANT'));
    },

    setState(state) {
      safeSet(KEYS.state, normalizeState(state));
    },

    recordInteraction() {
      this.interactionCount += 1;
      safeSet(KEYS.interactionCount, String(this.interactionCount));
      this.syncMeta();
      return this.interactionCount;
    },

    add(input, response, meta = {}) {
      const trace = {
        input: clip(input, 280),
        response: clip(response, 900),
        timestamp: new Date().toISOString(),
        state: normalizeState(meta.state || this.getState()),
        category: clip(meta.category || 'field', 40),
        depth: Number(meta.depth || 0),
        relic: clip(meta.relic || window.StarOracle?.relicFor?.(input) || 'salt remained where the question opened.', 160)
      };

      this.traces.push(trace);
      while (this.traces.length > LIMIT) this.traces.shift();
      safeSetJSON(KEYS.memory, this.traces);
      this.render();
      this.syncMeta();
      return trace;
    },

    forgetLast(count = 3) {
      const removed = this.traces.splice(Math.max(0, this.traces.length - count), count);
      const event = {
        timestamp: new Date().toISOString(),
        state: this.getState(),
        removedCount: removed.length,
        message: `the visitor chose to forget at ${new Date().toISOString()}`
      };
      this.forgottenLog.push(event);
      while (this.forgottenLog.length > LIMIT) this.forgottenLog.shift();
      this.persistAll();
      this.render();
      this.syncMeta();
      return { removed, event };
    },

    completeRitual() {
      this.ritualCount += 1;
      safeSet(KEYS.ritualCount, String(this.ritualCount));
      return this.ritualCount;
    },

    setAfterimageFragments(fragments) {
      const cleaned = (Array.isArray(fragments) ? fragments : [])
        .map(item => clip(item, 180))
        .filter(Boolean)
        .slice(-LIMIT);
      this.afterimageFragments = cleaned;
      safeSetJSON(KEYS.afterimageFragments, this.afterimageFragments);
      this.syncMeta();
      return this.afterimageFragments;
    },

    addAfterimageFragment(fragment) {
      const value = clip(fragment, 180);
      if (!value) return this.afterimageFragments;
      this.afterimageFragments.push(value);
      while (this.afterimageFragments.length > LIMIT) this.afterimageFragments.shift();
      safeSetJSON(KEYS.afterimageFragments, this.afterimageFragments);
      return this.afterimageFragments;
    },

    recent(n = 5) {
      return this.traces.slice(-n).reverse();
    },

    exportText(context = {}) {
      const state = normalizeState(context.state || this.getState());
      const lines = [
        'STARORIGIN // ORACLE',
        'RITUAL TRANSCRIPT / LOCAL MEMORY',
        '',
        `date: ${new Date().toISOString()}`,
        `session: ${this.session}`,
        `state: ${state}`,
        `interactions: ${this.interactionCount}`,
        `memory weight: ${this.traces.length}`,
        `ritual count: ${this.ritualCount}`,
        '',
        'SELECTED TRACES'
      ];

      const traces = this.recent(12);
      if (!traces.length) lines.push('no record');
      traces.forEach((trace, index) => {
        lines.push(
          '',
          `trace ${index + 1}`,
          `time: ${trace.timestamp}`,
          `state: ${trace.state}`,
          `category: ${trace.category}`,
          `depth: ${Number(trace.depth || 0).toFixed(2)}`,
          `input: ${trace.input}`,
          `relic: ${trace.relic}`,
          `oracle: ${trace.response}`
        );
      });

      lines.push('', 'FORGOTTEN EVENTS');
      if (!this.forgottenLog.length) lines.push('none');
      this.forgottenLog.slice(-12).reverse().forEach(event => {
        lines.push(`${event.timestamp} / ${event.state} / removed ${event.removedCount}`);
      });

      lines.push('', 'AFTERIMAGE FRAGMENTS');
      if (!this.afterimageFragments.length) lines.push('none');
      this.afterimageFragments.slice(-12).reverse().forEach(fragment => lines.push(fragment));

      lines.push('', 'FINAL ORACLE LINE');
      lines.push(context.finalLine || window.StarOracle?.finalLine?.(state) || 'the field keeps the part that could not return.');

      return lines.join('\n');
    },

    render() {
      const list = document.getElementById('archiveList');
      if (!list) return;

      list.replaceChildren();

      if (!this.traces.length) {
        const empty = document.createElement('p');
        empty.className = 'empty';
        empty.textContent = 'Nessuna reliquia. Il campo non ha ancora trattenuto peso.';
        list.appendChild(empty);
        return;
      }

      this.recent(9).forEach(trace => {
        const item = document.createElement('article');
        item.className = 'archive-item';

        const input = document.createElement('strong');
        input.textContent = trace.input || 'unspoken input';

        const relic = document.createElement('span');
        relic.textContent = trace.relic || 'the trace remained without name.';

        const meta = document.createElement('small');
        meta.textContent = `${trace.state} · ${trace.category} · ${this.formatTime(trace.timestamp)}`;

        item.append(input, relic, meta);
        list.appendChild(item);
      });
    },

    syncMeta() {
      const count = this.traces.length;
      const questionCount = document.getElementById('questionCount');
      const memoryValue = document.getElementById('memoryValue');
      const sessionCode = document.getElementById('sessionCode');
      if (questionCount) questionCount.textContent = String(this.interactionCount);
      if (memoryValue) memoryValue.textContent = `${count} ${count === 1 ? 'trace' : 'traces'}`;
      if (sessionCode) sessionCode.textContent = `SESSION ${this.session}`;
    },

    formatTime(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return 'undated';
      return date.toLocaleString('it-IT', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
})();
