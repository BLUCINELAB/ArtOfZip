(() => {
  'use strict';

  const COMMANDS = {
    help: ['help', '/help', ':help', '?'],
    recall: ['recall', '/recall', ':recall', 'memory'],
    forget: ['forget', '/forget', ':forget', 'clear', '/clear', ':clear'],
    ritual: ['ritual', '/ritual', ':ritual'],
    installation: ['installation', '/installation', ':installation', 'install'],
    awaken: ['awaken', 'wake', '/awaken'],
    export: ['export', '/export', ':export'],
    signal: ['signal', '/signal', ':signal'],
    collapse: ['collapse', '/collapse', ':collapse'],
    echo: ['echo', '/echo', ':echo'],
    fieldnotes: ['fieldnotes', 'fieldnote', '/fieldnotes'],
    blucinelab: ['blucinelab', '/blucinelab'],
    author: ['author', '/author'],
    deprecatedReset: ['reset', '/reset', ':reset'],
    deprecatedShare: ['share', '/share', ':share']
  };

  const normalizeState = value => String(value || 'DORMANT').toUpperCase();

  window.StarTerminal = {
    form: null,
    input: null,
    output: null,
    history: [],
    index: -1,
    lastTrace: null,
    pendingCollapse: false,
    ritualRunning: false,
    ritualTimerIds: [],

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
        button.addEventListener('click', () => this.runCommand(button.dataset.command, '', { fromButton: true }));
      });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') this.exitFocusModes();
      });

      this.boot();
    },

    boot() {
      const state = normalizeState(window.StarAnomaly?.state);
      const line = state === 'AFTERIMAGE'
        ? 'afterimage found. the field returns reduced.'
        : 'static field awake enough to listen. no backend. no witness beyond this browser.';
      this.writeSystem('STARORIGIN // ORACLE', line);
    },

    submit(value) {
      const raw = String(value || '').trim();
      if (!raw) return;
      this.input.value = '';
      this.history.push(raw);
      this.index = this.history.length;

      const parsed = this.parseCommand(raw);
      if (parsed) {
        this.runCommand(parsed.command, parsed.args, { raw });
        return;
      }

      this.pendingCollapse = false;
      this.handleQuestion(raw);
    },

    handleQuestion(raw) {
      window.StarMemory?.recordInteraction?.();
      window.StarAnomaly?.ensureBreach?.();

      const context = this.context();
      const result = window.StarOracle.respond(raw, context);
      window.StarAnomaly?.add?.(0.08 + result.depth * 0.22);
      const trace = window.StarMemory?.add(raw, result.answer, {
        ...result,
        state: window.StarAnomaly?.state || context.state
      }) || null;

      this.lastTrace = trace || {
        input: raw,
        response: result.answer,
        timestamp: new Date().toISOString(),
        state: window.StarAnomaly?.state || context.state,
        category: result.category,
        depth: result.depth,
        relic: result.relic
      };

      this.syncMetrics(result);
      this.writeOracle(raw, result.answer, result);
      window.StarAnomaly?.update?.();
      window.StarVisuals?.trace?.(result);
    },

    parseCommand(raw) {
      const value = String(raw || '').toLowerCase().trim().replace(/\s+/g, ' ');
      const plain = value.replace(/^[:/]+/, '');

      if (plain === 'collapse confirm' || plain === 'confirm collapse') {
        return { command: 'collapse', args: 'confirm' };
      }

      const found = Object.entries(COMMANDS).find(([, aliases]) => aliases.includes(value) || aliases.includes(plain));
      if (!found) return null;
      return { command: found[0], args: '' };
    },

    runCommand(command, args = '', options = {}) {
      const state = normalizeState(window.StarAnomaly?.state);
      const shouldCount = !['deprecatedShare', 'awaken'].includes(command);
      if (shouldCount) window.StarMemory?.recordInteraction?.();

      switch (command) {
        case 'help':
          this.writeSystem('HELP', window.StarOracle.help(state));
          break;

        case 'recall':
          this.recall();
          break;

        case 'forget':
          this.forget();
          break;

        case 'ritual':
          this.toggleRitual();
          break;

        case 'installation':
          this.toggleInstallation();
          break;

        case 'awaken':
          this.awaken();
          window.StarMemory?.recordInteraction?.();
          break;

        case 'export':
          this.export();
          break;

        case 'signal':
          this.writeSystem('SIGNAL', window.StarOracle.signal(this.context()));
          break;

        case 'collapse':
          this.collapse(args);
          break;

        case 'echo':
          this.echo();
          break;

        case 'fieldnotes':
        case 'blucinelab':
        case 'author':
          this.author(command);
          break;

        case 'deprecatedReset':
          this.writeSystem('RESET REFUSED', 'reset has no clean door here. collapse is the only return with consequence.');
          break;

        case 'deprecatedShare':
          this.writeSystem('SHARE ABSENT', 'no share leaves this room.');
          break;

        default:
          this.writeSystem('UNKNOWN', options.raw || command);
      }

      window.StarAnomaly?.update?.();
      window.StarMemory?.syncMeta?.();
    },

    breach() {
      window.StarMemory?.recordInteraction?.();
      if (window.StarAnomaly?.ensureBreach?.()) {
        this.writeSystem('BREACH', 'the first touch entered. the field now has a small wound.');
      } else {
        this.writeSystem('FIELD', window.StarOracle.signal(this.context()));
      }
      window.StarAnomaly?.update?.();
    },

    recall() {
      const state = normalizeState(window.StarAnomaly?.state);
      const traces = window.StarMemory?.recent(5) || [];

      if (state === 'DORMANT') {
        this.writeSystem('RECALL', 'no record');
        return;
      }

      if (!traces.length) {
        this.writeSystem('RECALL', 'no record');
        return;
      }

      if (state === 'BREACH') {
        this.writeSystem('RECALL', window.StarOracle.recallFragment(traces[0], state));
        return;
      }

      if (state === 'AFTERIMAGE') {
        setTimeout(() => {
          const fragment = window.StarOracle.recallFragment(traces[0], state) || '∅';
          this.writeSystem('RECALL', fragment);
        }, 620);
        return;
      }

      this.writeSystem('RECALL', traces.slice(0, 3).map(trace => [
        trace.timestamp,
        trace.state,
        trace.relic || trace.input
      ].join(' / ')).join('\n'));
    },

    forget() {
      const state = normalizeState(window.StarAnomaly?.state);
      const result = window.StarMemory?.forgetLast?.(3);
      window.StarAnomaly?.add?.(0.56);
      const removed = result?.removed?.length || 0;
      const line = removed
        ? `${removed} trace${removed === 1 ? '' : 's'} removed. the forgetting was recorded.`
        : 'nothing left, but the choice to forget was recorded.';
      this.writeSystem('FORGET', line);

      if (state === 'THRESHOLD' && (window.StarMemory?.forgottenLog?.length || 0) > 1) {
        this.pendingCollapse = true;
        this.writeSystem('COLLAPSE NEAR', 'the field is thinning. type collapse if you mean to leave an afterimage.');
      }
    },

    awaken() {
      const result = window.StarAnomaly?.awaken?.() || { ok: false, reason: 'missing' };

      if (result.ok && result.changed) {
        this.writeSystem('THRESHOLD', 'the field is awake. the archive now answers with weight.');
        return;
      }

      if (result.ok) {
        const response = window.StarOracle.respond('wake', this.context());
        this.writeOracle('awaken', response.answer, response);
        return;
      }

      if (result.reason === 'afterimage') {
        this.writeSystem('AWAKEN', window.StarOracle.echo(window.StarMemory?.afterimageFragments, window.StarMemory?.traces));
        return;
      }

      if (result.reason === 'weight') {
        this.writeSystem('AWAKEN', 'the word resists. the field needs three valid weights before it opens.');
        return;
      }

      this.writeSystem('AWAKEN', 'there is no waking before the first trace.');
    },

    collapse(args = '') {
      const state = normalizeState(window.StarAnomaly?.state);
      if (state !== 'THRESHOLD') {
        this.writeSystem('COLLAPSE', 'collapse only belongs to the threshold.');
        return;
      }

      const confirmed = args === 'confirm' || this.pendingCollapse;
      if (!confirmed) {
        this.pendingCollapse = true;
        this.writeSystem('COLLAPSE WARNING', 'this will not erase the archive. it will reduce the room and leave afterimage. type collapse again, or type collapse confirm.');
        return;
      }

      const fragments = window.StarOracle.collapseFragments(window.StarMemory?.traces || []);
      window.StarMemory?.setAfterimageFragments?.(fragments);
      window.StarAnomaly?.collapse?.();
      this.pendingCollapse = false;
      this.exitFocusModes(true);
      this.writeSystem('AFTERIMAGE', fragments.join('\n') || '∅');
      window.StarVisuals?.phasePulse?.('AFTERIMAGE');
    },

    echo() {
      const state = normalizeState(window.StarAnomaly?.state);
      if (state !== 'AFTERIMAGE') {
        this.writeSystem('ECHO', 'echo has no room before the afterimage.');
        return;
      }
      this.writeSystem('ECHO', window.StarOracle.echo(window.StarMemory?.afterimageFragments, window.StarMemory?.traces));
    },

    author(command) {
      const fragment = window.StarOracle.authorFragment(command, this.context());
      this.writeSystem(command.toUpperCase(), fragment);
    },

    toggleRitual(force) {
      const active = typeof force === 'boolean' ? force : !this.ritualRunning;
      if (!active) {
        this.endRitual(false);
        return;
      }

      this.ritualRunning = true;
      document.body.classList.add('ritual-mode', 'installation-mode');
      this.input?.focus();
      this.writeSystem('RITUAL', 'the panels withdraw. stay with the interval.');

      const delays = [3600, 14000, 26000, 38000, 51000, 64000];
      const lines = window.StarOracle.ritualLines();
      this.ritualTimerIds = lines.map((line, index) => setTimeout(() => {
        if (this.ritualRunning) this.writeSystem(`RITUAL ${index + 1}`, line);
      }, delays[index]));

      this.ritualTimerIds.push(setTimeout(() => this.endRitual(true), 70000));
    },

    endRitual(completed) {
      this.ritualTimerIds.forEach(id => clearTimeout(id));
      this.ritualTimerIds = [];
      const wasRunning = this.ritualRunning;
      this.ritualRunning = false;
      document.body.classList.remove('ritual-mode');

      if (completed && wasRunning) {
        const count = window.StarMemory?.completeRitual?.() || 0;
        window.StarAnomaly?.reduce?.(0.9);
        this.writeSystem('RITUAL COMPLETE', window.StarOracle.authorFragment('fieldnotes', {
          ...this.context(),
          ritualCount: count
        }));
      } else if (wasRunning) {
        this.writeSystem('RITUAL CLOSED', 'the interval released you before completion.');
      }
    },

    toggleInstallation(force) {
      const active = typeof force === 'boolean' ? force : !document.body.classList.contains('installation-mode');
      document.body.classList.toggle('installation-mode', active);
      if (active) {
        this.input?.focus();
        this.writeSystem('INSTALLATION MODE', 'the room narrows around terminal and field.');
      } else {
        this.writeSystem('INSTALLATION MODE CLOSED', 'the side rooms return.');
      }
    },

    exitFocusModes(silent = false) {
      const hadInstallation = document.body.classList.contains('installation-mode');
      const hadRitual = this.ritualRunning || document.body.classList.contains('ritual-mode');
      if (hadRitual) this.endRitual(false);
      document.body.classList.remove('installation-mode', 'ritual-mode');
      if (!silent && hadInstallation && !hadRitual) {
        this.writeSystem('INSTALLATION MODE CLOSED', 'the side rooms return.');
      }
    },

    export() {
      const text = window.StarMemory?.exportText?.({
        ...this.context(),
        finalLine: window.StarOracle.finalLine(window.StarAnomaly?.state)
      }) || 'STARORIGIN // ORACLE\nno record';
      this.downloadText(text, `starorigin-oracle-${new Date().toISOString().slice(0, 10)}.txt`);
      this.writeSystem('EXPORT', 'a found document was written as .txt. nothing left the browser.');
    },

    context() {
      return {
        state: normalizeState(window.StarAnomaly?.state),
        memoryCount: window.StarMemory?.traces?.length || 0,
        interactionCount: window.StarMemory?.interactionCount || 0,
        ritualCount: window.StarMemory?.ritualCount || 0
      };
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

    writeOracle(question, answer, meta = {}) {
      const message = `${answer}\n\nrelic: ${meta.relic || window.StarOracle.relicFor(question)}`;
      this.addBlock('oracle', question, message, `QUERY · ${meta.category || 'field'} · DEPTH ${Number(meta.depth || 0).toFixed(2)}`);
    },

    writeSystem(title, message) {
      this.addBlock('system', title, message, 'FIELD');
    },

    addBlock(type, title, message, kicker) {
      if (!this.output) return;
      const block = document.createElement('article');
      block.className = `output-block output-${type}`;

      const label = document.createElement('div');
      label.className = 'output-kicker';
      label.textContent = kicker || type;

      const heading = document.createElement('h3');
      heading.textContent = title || 'untitled';

      const body = document.createElement('p');
      body.textContent = String(message || '');

      block.append(label, heading, body);
      this.output.prepend(block);
      while (this.output.children.length > 24) this.output.lastElementChild?.remove();
    }
  };
})();
