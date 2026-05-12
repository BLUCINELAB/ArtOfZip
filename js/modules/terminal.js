(() => {
  'use strict';

  const COMMAND_ALIASES = {
    help: ['help', '/help', ':help', '?'],
    recall: ['recall', '/recall', ':recall', 'memory'],
    clear: ['clear', '/clear', ':clear', 'cls'],
    forget: ['forget', '/forget', ':forget', 'purge'],
    export: ['export', '/export', ':export'],
    awaken: ['awaken', 'wake', 'redpill', 'breach', '/awaken'],
    reset: ['reset', '/reset', ':reset'],
    ritual: ['ritual', '/ritual', ':ritual', 'fullscreen'],
    share: ['share', '/share', ':share'],
    daily: ['daily', '/daily', ':daily', 'today']
  };

  window.StarTerminal = {
    form: null,
    input: null,
    output: null,
    history: [],
    index: -1,
    lastTrace: null,

    init() {
      this.form = document.getElementById('terminalForm');
      this.input = document.getElementById('oracleInput');
      this.output = document.getElementById('terminalOutput');
      if (!this.form || !this.input || !this.output) return;

      this.form.addEventListener('submit', event => {
        event.preventDefault();
        this.submit(this.input.value);
      });

      this.input.addEventListener('keydown', event => this.historyNav(event));

      document.querySelectorAll('[data-command]').forEach(button => {
        button.addEventListener('click', () => this.runCommand(button.dataset.command));
      });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && document.body.classList.contains('ritual-mode')) {
          this.toggleRitual(false);
        }
      });

      this.boot();
    },

    boot() {
      this.writeSystem(
        'ORACLE BOOT SEQUENCE',
        'Sistema statico caricato. Nessuna rete. Nessun backend. Solo memoria locale, linguaggio e anomalia.\nDigita una domanda oppure usa help.'
      );
    },

    submit(value) {
      const raw = String(value || '').trim();
      if (!raw) return;
      this.input.value = '';
      this.history.push(raw);
      this.index = this.history.length;

      const command = this.normalizeCommand(raw);
      if (command) return this.runCommand(command);

      const state = {
        anomaly: window.StarAnomaly?.value || 0,
        awakened: window.StarAnomaly?.awakened || false,
        count: window.StarMemory?.traces.length || 0
      };

      const result = window.StarOracle.respond(raw, state);
      window.StarAnomaly?.add(0.18 + result.depth * 0.34);
      const trace = window.StarMemory?.add(raw, result.answer, result) || null;
      this.lastTrace = trace || { question: raw, answer: result.answer, ...result, createdAt: new Date().toISOString() };
      this.syncMetrics(result);
      this.writeOracle(raw, result.answer, result);
      window.StarVisuals?.glitch();
    },

    normalizeCommand(raw) {
      const value = String(raw || '').toLowerCase().trim();
      const found = Object.entries(COMMAND_ALIASES).find(([, aliases]) => aliases.includes(value));
      return found?.[0] || null;
    },

    runCommand(command) {
      switch (command) {
        case 'help':
          this.writeSystem('COMMANDS', [
            'help · mostra i comandi',
            'recall · richiama le ultime tracce',
            'daily · genera l’oracolo del giorno',
            'share · esporta l’ultima risposta come card PNG',
            'ritual · entra/esci dalla modalità fullscreen rituale',
            'export · scarica archivio .txt',
            'clear · pulisce il terminale',
            'forget · cancella la memoria locale',
            'awaken / breach · attraversa la soglia',
            'reset · riporta anomalia e rituale allo stato iniziale'
          ].join('\n'));
          break;

        case 'recall': {
          const traces = window.StarMemory?.recent(5) || [];
          if (!traces.length) this.writeSystem('RECALL', 'Archivio vuoto. Nessuna traccia da richiamare.');
          else this.writeSystem('RECALL', traces.map((t, i) =>
            `${i + 1}. ${t.question}\n   → ${t.answer.slice(0, 180)}${t.answer.length > 180 ? '…' : ''}`
          ).join('\n\n'));
          break;
        }

        case 'daily':
          this.daily();
          break;

        case 'share':
          this.share();
          break;

        case 'ritual':
          this.toggleRitual();
          break;

        case 'export':
          this.export();
          break;

        case 'clear':
          this.output.innerHTML = '';
          this.writeSystem('TERMINAL CLEARED', 'Il campo visivo è stato ripulito. La memoria locale resta intatta.');
          break;

        case 'forget':
          window.StarMemory?.clear();
          this.writeSystem('MEMORY PURGED', 'Archivio locale cancellato. Il sistema ricorda solo il vuoto lasciato dall’operazione.');
          break;

        case 'awaken':
          this.breach();
          break;

        case 'reset':
          this.reset();
          break;

        default:
          this.writeSystem('UNKNOWN COMMAND', `Comando non riconosciuto: ${command}`);
      }
    },

    daily() {
      const today = new Date().toISOString().slice(0, 10);
      const key = `starorigin_oracle_daily_${today}`;
      let result;
      try {
        const stored = localStorage.getItem(key);
        result = stored ? JSON.parse(stored) : null;
      } catch (_) {
        result = null;
      }

      if (!result) {
        result = window.StarOracle.daily({
          awakened: window.StarAnomaly?.awakened || false
        });
        try { localStorage.setItem(key, JSON.stringify(result)); } catch (_) {}
      }

      const question = `daily oracle // ${today}`;
      const trace = window.StarMemory?.add(question, result.answer, result) || null;
      this.lastTrace = trace || { question, answer: result.answer, ...result, createdAt: new Date().toISOString() };
      window.StarAnomaly?.add(0.44);
      this.syncMetrics(result);
      this.writeOracle(question, result.answer, result);
    },

    breach() {
      window.StarAnomaly?.awaken();
      this.writeSystem('THRESHOLD BREACHED', 'Il colore della legge è cambiato. Le risposte successive useranno il livello awakened.');
    },

    reset() {
      window.StarAnomaly?.reset();
      this.toggleRitual(false);
      this.syncMetrics({ depth: 0, category: 'none' });
      this.writeSystem('SYSTEM RESET', 'Anomalia azzerata. Awakened disattivato. La memoria locale non è stata cancellata.');
    },

    toggleRitual(force) {
      const active = typeof force === 'boolean' ? force : !document.body.classList.contains('ritual-mode');
      document.body.classList.toggle('ritual-mode', active);
      if (active) {
        this.input?.focus();
        this.writeSystem('RITUAL MODE', 'I pannelli laterali sono stati oscurati. Rimangono terminale, campo visivo e memoria del gesto. Premi Esc o digita ritual per uscire.');
      } else {
        this.writeSystem('RITUAL MODE CLOSED', 'Il sistema torna alla forma completa.');
      }
    },

    export() {
      const text = window.StarMemory?.exportText() || 'STARORIGIN // ORACLE\nNO DATA';
      this.downloadText(text, `starorigin-oracle-${new Date().toISOString().slice(0, 10)}.txt`);
      this.writeSystem('EXPORT COMPLETE', 'Archivio scaricato come file .txt. Nessun dato è stato inviato fuori dal browser.');
    },

    share() {
      const trace = this.lastTrace || window.StarMemory?.recent(1)?.[0];
      if (!trace) {
        this.writeSystem('SHARE FAILED', 'Non esiste ancora una risposta da trasformare in card. Interroga prima l’oracolo.');
        return;
      }

      const canvas = document.createElement('canvas');
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const w = 1400;
      const h = 1400;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);

      const awakened = window.StarAnomaly?.awakened || false;
      const accent = awakened ? '#8c5cff' : '#4dffce';
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#020308');
      bg.addColorStop(0.52, awakened ? '#070414' : '#03100d');
      bg.addColorStop(1, '#010205');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = this.hexToRgba(accent, 0.52);
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 70, w - 140, h - 140);

      ctx.fillStyle = this.hexToRgba(accent, 0.92);
      ctx.font = '700 28px ui-monospace, Menlo, monospace';
      ctx.fillText('STARORIGIN // ORACLE', 110, 140);
      ctx.font = '20px ui-monospace, Menlo, monospace';
      ctx.fillStyle = 'rgba(226,244,255,0.52)';
      ctx.fillText(`CATEGORY ${trace.category || 'unknown'} · DEPTH ${Number(trace.depth || 0).toFixed(2)}`, 110, 185);

      ctx.font = '700 54px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(226,244,255,0.95)';
      this.wrap(ctx, String(trace.question || 'untitled'), 110, 285, 1180, 62, 4);

      ctx.font = '30px ui-monospace, Menlo, monospace';
      ctx.fillStyle = 'rgba(196,222,242,0.78)';
      this.wrap(ctx, String(trace.answer || '').replace(/\n+/g, ' / '), 110, 560, 1180, 48, 11);

      ctx.fillStyle = this.hexToRgba(accent, 0.75);
      ctx.font = '18px ui-monospace, Menlo, monospace';
      ctx.fillText('ALL ANSWERS ARE LOCAL · NO BACKEND · NO WITNESSES', 110, 1280);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `starorigin-oracle-card-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      this.writeSystem('SHARE CARD EXPORTED', 'Ultima risposta esportata come PNG locale. Nessun dato è uscito dal browser.');
    },

    downloadText(text, filename) {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },

    historyNav(event) {
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      if (!this.history.length) return;
      event.preventDefault();
      if (event.key === 'ArrowUp') this.index = Math.max(0, this.index - 1);
      if (event.key === 'ArrowDown') this.index = Math.min(this.history.length, this.index + 1);
      this.input.value = this.history[this.index] || '';
      requestAnimationFrame(() => this.input.setSelectionRange(this.input.value.length, this.input.value.length));
    },

    syncMetrics(result) {
      const depth = document.getElementById('depthValue');
      const category = document.getElementById('categoryValue');
      if (depth) depth.textContent = Number(result.depth || 0).toFixed(2);
      if (category) category.textContent = result.category || 'none';
    },

    writeOracle(question, answer, meta) {
      this.addBlock('oracle', `
        <div class="output-kicker">QUERY · ${this.escape(meta.category)} · DEPTH ${Number(meta.depth || 0).toFixed(2)}</div>
        <h3>${this.escape(question)}</h3>
        <p>${this.escape(answer).replace(/\n/g, '<br>')}</p>
      `);
    },

    writeSystem(title, message) {
      this.addBlock('system', `
        <div class="output-kicker">SYSTEM</div>
        <h3>${this.escape(title)}</h3>
        <p>${this.escape(message).replace(/\n/g, '<br>')}</p>
      `);
    },

    addBlock(type, html) {
      const block = document.createElement('article');
      block.className = `output-block output-${type}`;
      block.innerHTML = html;
      this.output.prepend(block);
      while (this.output.children.length > 22) this.output.lastElementChild?.remove();
    },

    wrap(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
      const words = text.split(/\s+/).filter(Boolean);
      let line = '';
      let drawn = 0;

      for (let i = 0; i < words.length; i += 1) {
        const word = words[i];
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          const isLastLine = drawn >= maxLines - 1;
          ctx.fillText(isLastLine ? `${line}…` : line, x, y);
          drawn += 1;
          if (isLastLine) return;
          y += lineHeight;
          line = word;
        } else {
          line = test;
        }
      }

      if (line && drawn < maxLines) ctx.fillText(line, x, y);
    },

    hexToRgba(hex, alpha) {
      const value = hex.replace('#', '');
      const r = parseInt(value.slice(0, 2), 16);
      const g = parseInt(value.slice(2, 4), 16);
      const b = parseInt(value.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    escape(value) {
      return String(value).replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      })[char]);
    }
  };
})();
