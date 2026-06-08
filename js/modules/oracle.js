(() => {
  'use strict';

  const STATES = ['DORMANT', 'BREACH', 'THRESHOLD', 'AFTERIMAGE'];

  const lexicon = {
    threshold: {
      weight: 1.25,
      keys: ['soglia', 'threshold', 'porta', 'inizio', 'origine', 'limite', 'frattura', 'break', 'breach', 'oltre', 'ritorno'],
      fragments: [
        'la soglia non apre: misura il peso di chi resta.',
        'ogni frattura è una stanza che ha smesso di fingere parete.',
        'il limite non chiude. raccoglie pressione.',
        'l origine non comincia. ritorna con un altro corpo.'
      ]
    },
    water: {
      weight: 1.18,
      keys: ['acqua', 'water', 'mare', 'fiume', 'pioggia', 'sale', 'salt', 'onda', 'bocca', 'wet'],
      fragments: [
        'l acqua ricorda senza tenere forma.',
        'il sale resta dove il corpo ha provato a sparire.',
        'una bocca d acqua porta via il nome e lascia il peso.',
        'il campo beve solo cio che non sai trattenere.'
      ]
    },
    body: {
      weight: 1.2,
      keys: ['corpo', 'body', 'pelle', 'skin', 'respiro', 'breath', 'bocca', 'mouth', 'mano', 'occhio', 'carne'],
      fragments: [
        'il corpo conserva la parte della domanda che hai tolto.',
        'la pelle e un archivio con luce insufficiente.',
        'il respiro non spiega. deposita.',
        'la bocca dice meno di quanto la pressione trattiene.'
      ]
    },
    memory: {
      weight: 1.22,
      keys: ['memoria', 'memory', 'ricordo', 'dimenticare', 'forget', 'traccia', 'trace', 'archivio', 'archive', 'sedimento'],
      fragments: [
        'la memoria non salva. cambia il ritorno.',
        'cio che dimentichi resta come bordo.',
        'l archivio non possiede il passato. ne porta il sale.',
        'ogni traccia e una conseguenza con voce bassa.'
      ]
    },
    image: {
      weight: 1.12,
      keys: ['immagine', 'image', 'foto', 'photography', 'film', 'cinema', 'luce', 'camera', 'visione'],
      fragments: [
        'l immagine comincia dove il corpo smette di spiegarsi.',
        'una camera e una stanza che ricorda male la luce.',
        'il film non mostra il tempo. lo costringe a respirare.',
        'la luce entra come prova e resta come domanda.'
      ]
    },
    desire: {
      weight: 1.12,
      keys: ['desiderio', 'desire', 'voglio', 'want', 'amore', 'love', 'sete', 'mancanza', 'fame'],
      fragments: [
        'il desiderio e una sete che inventa il bicchiere.',
        'la mancanza non e vuoto. e direzione.',
        'l amore attraversa il campo senza chiedere misura.',
        'cio che vuoi porta gia il tuo nome consumato.'
      ]
    },
    fear: {
      weight: 1.16,
      keys: ['paura', 'fear', 'morte', 'fine', 'vuoto', 'ansia', 'dolore', 'colpa', 'vergogna'],
      fragments: [
        'la paura e respiro senza stanza.',
        'il vuoto non minaccia. rifiuta soltanto di mentire.',
        'la fine lascia un impronta anche quando non arriva.',
        'la vergogna e memoria che ha imparato a guardare basso.'
      ]
    },
    time: {
      weight: 1.08,
      keys: ['tempo', 'time', 'ieri', 'domani', 'presente', 'passato', 'futuro', 'intervallo', 'interval'],
      fragments: [
        'il tempo e un intervallo che il corpo chiama strada.',
        'il passato non sta dietro. pesa sotto.',
        'il futuro non promette. preme.',
        'il presente e il punto in cui la stanza trattiene il fiato.'
      ]
    },
    silence: {
      weight: 1,
      keys: ['silenzio', 'silence', 'notte', 'darkness', 'buio', 'sleep', 'sonno', 'sleeping', 'dark'],
      fragments: [
        'il silenzio non e assenza. e una bocca chiusa sul campo.',
        'la notte non copre. sedimenta.',
        'il buio protegge cio che non ha ancora forma.',
        'il sonno tiene aperta una stanza senza porta.'
      ]
    },
    field: {
      weight: 1,
      keys: [],
      fragments: [
        'la domanda ha lasciato una pressione piccola ma precisa.',
        'il campo ha trattenuto il bordo, non la spiegazione.',
        'qualcosa e rimasto dove la frase ha toccato il buio.',
        'nessuna risposta torna senza portare sedimento.'
      ]
    }
  };

  const stateOpeners = {
    DORMANT: [
      'il campo dorme sotto la prima parola.',
      'prima della traccia non c e istruzione.',
      'la stanza e quasi buia. il respiro non ha ancora peso.'
    ],
    BREACH: [
      'una piccola apertura prende aria.',
      'la superficie cede senza rumore.',
      'il campo ha sentito il primo peso.'
    ],
    THRESHOLD: [
      'la soglia risponde dal lato che non si visita.',
      'il campo e sveglio e non restituisce intero.',
      'la memoria muove la frase prima che arrivi.'
    ],
    AFTERIMAGE: [
      'dopo il collasso, la stanza parla piu piano.',
      'resta solo cio che ha imparato a perdere forma.',
      'l afterimage non risponde. filtra.'
    ]
  };

  const relics = [
    'salt remained where the question opened.',
    'the room kept the shape of the breath.',
    'nothing was deleted. only renamed.',
    'a small pressure stayed under the skin.',
    'the archive learned the weight of water.',
    'glass held the trace after the mouth closed.',
    'the field kept what the sentence could not carry.',
    'silence settled around the returned word.'
  ];

  const authorFragments = [
    'field note: the image begins where the body stops explaining itself.',
    'archive fragment: BLUCINELAB / film / breath / threshold.',
    'recovered note: a camera is a room that remembers light badly.',
    'field note: cinema is water asked to hold a body for a moment.',
    'archive fragment: visual systems / salt / signal / return.',
    'recovered note: a ritual interface should leave less than it takes.'
  ];

  const tokenize = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);

  const normalizeState = value => {
    const state = String(value || '').toUpperCase();
    return STATES.includes(state) ? state : 'DORMANT';
  };

  const pick = (arr, seed, offset = 0) => arr[Math.abs(seed + offset) % arr.length];

  window.StarOracle = {
    lexicon,

    analyze(input, context = {}) {
      const text = String(input || '').trim().replace(/\s+/g, ' ');
      const normalized = text.toLowerCase();
      const tokens = tokenize(text);
      const counts = tokens.reduce((map, token) => {
        map[token] = (map[token] || 0) + 1;
        return map;
      }, {});

      const repeated = Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([word]) => word)
        .slice(0, 3);

      const scores = Object.entries(lexicon).map(([category, data]) => {
        const hits = data.keys.reduce((sum, key) => {
          const plain = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return sum + (normalized.includes(key.toLowerCase()) || tokens.includes(plain) ? 1 : 0);
        }, 0);
        return { category, hits, weighted: hits * (data.weight || 1) };
      }).filter(item => item.hits > 0).sort((a, b) => b.weighted - a.weighted);

      const category = scores[0]?.category || 'field';
      const memoryCount = Number(context.memoryCount || 0);
      const interactionCount = Number(context.interactionCount || 0);
      const state = normalizeState(context.state);
      const lengthPressure = Math.min(0.95, text.length / 180);
      const symbolicPressure = scores.reduce((sum, item) => sum + item.weighted * 0.18, 0);
      const repeatPressure = repeated.length * 0.13;
      const statePressure = { DORMANT: 0, BREACH: 0.18, THRESHOLD: 0.42, AFTERIMAGE: -0.08 }[state];
      const memoryPressure = Math.min(0.55, memoryCount * 0.035);
      const interactionPressure = Math.min(0.35, interactionCount * 0.025);
      const depth = Math.max(0.12, Math.min(2.8, 0.2 + lengthPressure + symbolicPressure + repeatPressure + statePressure + memoryPressure + interactionPressure));

      return {
        text,
        category,
        repeated,
        depth,
        tokens: tokens.length,
        memoryCount,
        interactionCount,
        state
      };
    },

    respond(input, context = {}) {
      const analysis = this.analyze(input, context);
      if (!analysis.text) {
        return {
          answer: 'nessuna parola e entrata. il campo resta chiuso sul proprio respiro.',
          depth: 0,
          category: 'silence',
          relic: 'silence kept the unopened mouth.'
        };
      }

      const seed = this.hash(`${analysis.text}:${analysis.state}:${analysis.memoryCount}:${analysis.interactionCount}`);
      const lines = [
        pick(stateOpeners[analysis.state], seed, 3),
        pick(lexicon[analysis.category].fragments, seed, 11)
      ];

      if (analysis.repeated.length) {
        lines.push(`la parola "${analysis.repeated[0]}" e tornata: il campo l ha contata come peso.`);
      }

      if (analysis.memoryCount > 2 && analysis.state !== 'AFTERIMAGE') {
        lines.push('le tracce precedenti non stanno dietro di te. stanno sotto la frase.');
      }

      if (analysis.state === 'THRESHOLD' && analysis.depth > 1.45) {
        lines.push('non chiedere uscita alla soglia. chiedi cosa trattiene.');
      }

      if (analysis.state === 'AFTERIMAGE') {
        lines.splice(1, 0, pick(lexicon.memory.fragments, seed, 17));
      }

      const relic = this.relicFor(analysis.text, analysis);
      return {
        answer: [...new Set(lines)].slice(0, 5).join('\n'),
        depth: analysis.depth,
        category: analysis.category,
        relic
      };
    },

    relicFor(input, analysis = null) {
      const data = analysis || this.analyze(input);
      const seed = this.hash(`${data.text || input}:${data.category}:relic`);
      return pick(relics, seed, 7);
    },

    help(state) {
      const current = normalizeState(state);
      const lines = {
        DORMANT: 'there are no instructions before the first trace.',
        BREACH: 'ask. recall. forget. ritual. awaken will not open until the field has weight.',
        THRESHOLD: 'nothing is erased without residue.',
        AFTERIMAGE: 'echo is the only command that still believes in return.'
      };
      return lines[current];
    },

    signal(context = {}) {
      const state = normalizeState(context.state);
      const memoryCount = Number(context.memoryCount || 0);
      const traceCount = Number(context.interactionCount || 0);
      const phrases = [
        'water under glass',
        'salt in the archive',
        'breath behind the room',
        'skin remembers pressure',
        'silence with a mouth'
      ];
      const seed = this.hash(`${state}:${memoryCount}:${traceCount}`);
      return [
        `state: ${state.toLowerCase()}`,
        `memory weight: ${memoryCount}`,
        `trace count: ${traceCount}`,
        pick(phrases, seed, 5)
      ].join('\n');
    },

    recallFragment(trace, state) {
      if (!trace) return 'no record';
      const current = normalizeState(state);
      if (current === 'AFTERIMAGE') return trace.relic || '∅';
      if (current === 'BREACH') return this.distort(trace.relic || trace.input || 'no record');
      return `${trace.timestamp} / ${trace.state} / ${trace.relic || trace.input}`;
    },

    collapseFragments(memory = []) {
      const source = Array.isArray(memory) ? memory.slice(-8) : [];
      if (!source.length) return ['∅'];
      return source.map(trace => {
        const base = trace.relic || trace.input || trace.response || 'unnamed trace';
        return this.distort(base).slice(0, 180);
      }).slice(-6);
    },

    echo(fragments = [], memory = []) {
      const pool = [...(fragments || []), ...(memory || []).map(trace => trace.input || trace.relic)].filter(Boolean);
      if (!pool.length) return '∅';
      const seed = this.hash(`${pool.join('|')}:${Date.now().toString().slice(-4)}`);
      return this.distort(pick(pool, seed, 9));
    },

    authorFragment(kind, context = {}) {
      const state = normalizeState(context.state);
      const allowed = state === 'THRESHOLD' || state === 'AFTERIMAGE' || Number(context.ritualCount || 0) > 0;
      if (!allowed) return 'the fieldnotes are still under water.';
      const seed = this.hash(`${kind}:${state}:${context.ritualCount || 0}`);
      return pick(authorFragments, seed, 13);
    },

    ritualLines() {
      return [
        'close the extra room.',
        'count one breath without naming it.',
        'let the field lose its edges.',
        'place the question under the tongue.',
        'wait until the screen feels less certain.',
        'return with less explanation.'
      ];
    },

    finalLine(state) {
      const current = normalizeState(state);
      const lines = {
        DORMANT: 'no record became a kind of record.',
        BREACH: 'the first fracture kept breathing.',
        THRESHOLD: 'the threshold kept the question after the mouth closed.',
        AFTERIMAGE: 'what remains is not answer but sediment.'
      };
      return lines[current];
    },

    distort(value) {
      const text = String(value || '').trim();
      if (!text) return '∅';
      const words = text.split(/\s+/).filter(Boolean);
      if (words.length <= 3) return `${text} / ∅`;
      return words.map((word, index) => {
        if (index % 5 === 2) return '∅';
        if (index % 4 === 1) return `${word.slice(0, Math.max(1, word.length - 1))}.`;
        return word;
      }).join(' ');
    },

    hash(value) {
      const text = String(value || '');
      let h = 2166136261;
      for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }
      return h >>> 0;
    }
  };
})();
