(() => {
  'use strict';

  const KEY = 'starorigin_oracle_memory_v1';
  const LIMIT = 60;

  window.StarMemory = {
    traces: [],
    session: Math.random().toString(36).slice(2, 8).toUpperCase(),

    init() {
      this.load();
      this.render();
      this.syncMeta();
    },

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        this.traces = Array.isArray(parsed) ? parsed.slice(0, LIMIT) : [];
      } catch (_) {
        this.traces = [];
      }
    },

    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.traces.slice(0, LIMIT)));
      } catch (_) {}
      this.render();
      this.syncMeta();
    },

    add(question, answer, meta = {}) {
      const trace = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        question: String(question || '').slice(0, 260),
        answer: String(answer || '').slice(0, 900),
        depth: Number(meta.depth || 0),
        category: meta.category || 'unknown',
        createdAt: new Date().toISOString()
      };
      this.traces.unshift(trace);
      this.traces = this.traces.slice(0, LIMIT);
      this.save();
      return trace;
    },

    clear() {
      this.traces = [];
      try { localStorage.removeItem(KEY); } catch (_) {}
      this.render();
      this.syncMeta();
    },

    recent(n = 5) {
      return this.traces.slice(0, n);
    },

    exportText() {
      if (!this.traces.length) return 'STARORIGIN // ORACLE\nNO TRACES RECORDED';
      const header = [
        'STARORIGIN // ORACLE',
        'LOCAL MEMORY EXPORT',
        `SESSION: ${this.session}`,
        `TRACES: ${this.traces.length}`,
        `EXPORTED: ${new Date().toISOString()}`
      ].join('\n');

      const body = this.traces.map((trace, index) => [
        `#${this.traces.length - index} · ${trace.createdAt}`,
        `QUESTION: ${trace.question}`,
        `CATEGORY: ${trace.category}`,
        `DEPTH: ${Number(trace.depth || 0).toFixed(2)}`,
        `ANSWER:\n${trace.answer}`
      ].join('\n')).join('\n\n---\n\n');

      return `${header}\n\n===\n\n${body}`;
    },

    render() {
      const list = document.getElementById('archiveList');
      if (!list) return;

      if (!this.traces.length) {
        list.innerHTML = '<p class="empty">Nessuna domanda salvata. La memoria è vuota.</p>';
        return;
      }

      list.innerHTML = this.recent(6).map(trace => `
        <article class="archive-item" title="${this.escape(trace.category)} · ${Number(trace.depth || 0).toFixed(2)}">
          <strong>${this.escape(trace.question)}</strong>
          <span>${this.escape(trace.answer).slice(0, 210)}${trace.answer.length > 210 ? '…' : ''}</span>
          <small>${this.escape(trace.category)} · ${Number(trace.depth || 0).toFixed(2)}</small>
        </article>
      `).join('');
    },

    syncMeta() {
      const count = this.traces.length;
      const questionCount = document.getElementById('questionCount');
      const memoryValue = document.getElementById('memoryValue');
      const sessionCode = document.getElementById('sessionCode');
      if (questionCount) questionCount.textContent = String(count);
      if (memoryValue) memoryValue.textContent = `${count} ${count === 1 ? 'trace' : 'traces'}`;
      if (sessionCode) sessionCode.textContent = `SESSION ${this.session}`;
    },

    escape(value) {
      return String(value).replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      })[char]);
    }
  };
})();
