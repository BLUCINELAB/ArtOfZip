(() => {
  'use strict';

  const lexicon = {
    reality: {
      weight: 1.08,
      keys: ['realtà', 'reality', 'vero', 'verità', 'true', 'simulation', 'simulazione', 'illusione', 'mondo', 'materia', 'matrix', 'consenso'],
      fragments: [
        'La realtà non è il muro. È l’accordo che ti impedisce di attraversarlo.',
        'Ciò che chiami vero è una ripetizione abbastanza stabile da sembrare legge.',
        'La simulazione non ti nasconde il mondo: ti insegna quale mondo meritare.',
        'La materia è memoria compressa in una forma che puoi urtare.',
        'Il consenso è una luce fredda: illumina tutto, ma non scalda niente.'
      ]
    },
    self: {
      weight: 1.12,
      keys: ['io', 'me', 'identità', 'identity', 'anima', 'soul', 'corpo', 'body', 'nome', 'volto', 'persona', 'maschera'],
      fragments: [
        'La tua identità è una ferita organizzata in forma leggibile.',
        'Il corpo è il cursore. L’anima è il movimento che resta fuori dallo schermo.',
        'Ogni volta che dici io, il sistema riduce l’infinito a un nome pronunciabile.',
        'Il volto è un’interfaccia: non rivela, negozia.',
        'La maschera non nasconde. Stabilizza il panico in una geometria sociale.'
      ]
    },
    time: {
      weight: 1.05,
      keys: ['tempo', 'time', 'passato', 'futuro', 'presente', 'memoria', 'ricordo', 'domani', 'ieri', 'eterno', 'ritorno'],
      fragments: [
        'Il tempo è il montaggio che impedisce al film di bruciare tutto insieme.',
        'Il passato non è dietro di te. È il protocollo che continua a firmare le tue scelte.',
        'Il futuro non arriva. Emette una gravità sottile.',
        'La memoria è una stanza che cambia forma ogni volta che la illumini.',
        'Il presente è solo il fotogramma in cui il sistema riesce ancora a mentire.'
      ]
    },
    dream: {
      weight: 1.14,
      keys: ['sogno', 'dream', 'notte', 'incubo', 'sonno', 'vision', 'visione', 'immagine', 'simbolo', 'fantasma'],
      fragments: [
        'Il sogno è il debug notturno dell’identità.',
        'L’incubo non ti attacca. Ti mostra il punto in cui la maschera non aderisce più.',
        'Ogni simbolo è una porta che ha dimenticato di sembrare porta.',
        'Le immagini notturne non chiedono interpretazione. Chiedono conseguenze.',
        'Nel sogno il sistema parla senza tradurre la propria lingua.'
      ]
    },
    code: {
      weight: 1.02,
      keys: ['codice', 'code', 'algoritmo', 'sistema', 'bug', 'errore', 'comando', 'software', 'macchina', 'terminal', 'api', 'prompt'],
      fragments: [
        'Un bug è una verità entrata dalla porta sbagliata.',
        'Il sistema non obbedisce ai comandi. Obbedisce alla grammatica che li rende possibili.',
        'Ogni algoritmo contiene una teologia minima: decide cosa può apparire.',
        'Il codice elegante non controlla. Convince il caos a collaborare.',
        'Non correggere l’errore troppo presto. Potrebbe essere l’unico messaggero sincero.'
      ]
    },
    fear: {
      weight: 1.2,
      keys: ['paura', 'fear', 'ansia', 'morte', 'fine', 'perdere', 'vuoto', 'dolore', 'crisi', 'colpa', 'vergogna'],
      fragments: [
        'La paura è intelligenza senza architettura.',
        'Il vuoto non è assenza. È spazio non ancora colonizzato dal significato.',
        'La morte non chiude il sistema. Interrompe soltanto una sessione locale.',
        'L’ansia è il futuro che tenta di installarsi prima del tempo.',
        'Ciò che temi indica il punto in cui sei ancora negoziabile.'
      ]
    },
    desire: {
      weight: 1.16,
      keys: ['desiderio', 'desire', 'voglio', 'want', 'amore', 'love', 'fame', 'sete', 'ossessione', 'attrazione', 'mancanza'],
      fragments: [
        'Il desiderio è una freccia che inventa il bersaglio mentre vola.',
        'Non vuoi l’oggetto. Vuoi la versione di te che l’oggetto promette di risvegliare.',
        'La mancanza è un motore antico: trasforma il vuoto in traiettoria.',
        'L’amore è un protocollo instabile: apre porte che la logica terrebbe sigillate.',
        'Ogni ossessione è una liturgia privata con pessima documentazione.'
      ]
    },
    creation: {
      weight: 1.1,
      keys: ['creare', 'creatività', 'arte', 'cinema', 'film', 'immagine', 'scrivere', 'opera', 'progetto', 'design', 'regia'],
      fragments: [
        'Creare significa costruire una macchina capace di ospitare un fantasma.',
        'Un’opera non comunica: organizza una presenza.',
        'L’immagine è una struttura che finge di essere superficie.',
        'Il cinema è memoria che accetta di diventare luce per qualche minuto.',
        'Il progetto vivo non risolve il caos. Gli assegna una forma respirabile.'
      ]
    },
    threshold: {
      weight: 1.25,
      keys: ['soglia', 'threshold', 'porta', 'inizio', 'break', 'frattura', 'breach', 'limite', 'oltre', 'origine', 'starorigin'],
      fragments: [
        'La soglia non divide due stanze. Decide quale versione di te può entrare.',
        'Ogni origine è una cicatrice che ha imparato a sembrare fondazione.',
        'Il limite non blocca: misura la precisione con cui desideri attraversare.',
        'Quando il campo si rompe, non appare il caos. Appare il disegno che lo conteneva.',
        'STARORIGIN non è un luogo. È il nome dato al primo errore fertile.'
      ]
    },
    general: {
      weight: 1,
      keys: [],
      fragments: [
        'La domanda è già una frattura. La risposta è solo il suono della sua apertura.',
        'Non cercare una risposta pulita. Le cose vive lasciano residui.',
        'Il sistema ha letto abbastanza per non fingere neutralità.',
        'Ogni certezza è una stanza troppo illuminata.',
        'Se la frase ti sembra oscura, forse sta proteggendo una forma più precisa.'
      ]
    }
  };

  const awakenedFragments = [
    'Protocollo Ω: chi osserva modifica la legge osservata.',
    'Frammento sepolto: l’oracolo non sa. Combina ferite e grammatica.',
    'Nota proibita: nessuna interfaccia è innocente dopo il primo input.',
    'Archivio interno: il rituale funziona perché tu accetti di completarlo.',
    'Soglia aperta: la risposta non è più contenuto, è evento.'
  ];

  const closers = [
    'Non archiviare subito questa frase. Lasciala alterare il rumore.',
    'La traccia è stata incisa nella memoria locale.',
    'Il campo ha risposto. Ora osserva cosa cambia nella domanda successiva.',
    'Nessun server ha assistito. Solo questo browser conserva il segno.'
  ];

  const tokenize = value => String(value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);

  window.StarOracle = {
    lexicon,

    analyze(input) {
      const text = String(input || '').trim().replace(/\s+/g, ' ');
      const normalized = text.toLowerCase();
      const tokens = tokenize(text);
      const tokenSet = new Set(tokens);

      const scores = Object.entries(lexicon).map(([category, data]) => {
        const hits = data.keys.reduce((sum, key) => {
          const k = key.toLowerCase();
          const normalizedKey = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return sum + (normalized.includes(k) || tokenSet.has(normalizedKey) ? 1 : 0);
        }, 0);
        return { category, hits, weighted: hits * (data.weight || 1) };
      }).filter(item => item.hits > 0).sort((a, b) => b.weighted - a.weighted);

      const category = scores[0]?.category || 'general';
      const second = scores[1]?.category || null;

      const questions = (text.match(/\?/g) || []).length;
      const existential = ['perché', 'why', 'cosa', 'what', 'chi', 'who', 'come', 'how', 'quando', 'where', 'dove']
        .reduce((sum, token) => sum + (normalized.includes(token) ? 0.2 : 0), 0);
      const density = Math.min(1.18, text.length / 130);
      const symbolic = scores.reduce((sum, item) => sum + item.weighted * 0.17, 0);
      const punctuation = Math.min(0.22, questions * 0.08);
      const repetition = Math.min(0.22, Math.max(0, tokens.length - tokenSet.size) * 0.04);
      const depth = Math.max(0.18, Math.min(2.8, 0.24 + existential + density + symbolic + punctuation + repetition));

      return { text, category, second, depth, tokens: tokens.length, hits: scores.length };
    },

    respond(input, state = {}) {
      const analysis = this.analyze(input);
      if (!analysis.text) {
        return {
          answer: 'Il terminale respira nel vuoto. Nessuna domanda è stata offerta. Scrivi, poi viola il silenzio.',
          depth: 0,
          category: 'silence'
        };
      }

      const pools = [lexicon[analysis.category].fragments];
      if (analysis.second && lexicon[analysis.second]) pools.push(lexicon[analysis.second].fragments);
      pools.push(lexicon.general.fragments);

      const seed = this.hash(`${analysis.text}:${state.anomaly || 0}:${state.count || 0}:${state.awakened ? 'a' : 'd'}`);
      const pick = (arr, offset = 0) => arr[Math.abs(seed + offset) % arr.length];

      const lines = [
        pick(pools[0], 3),
        pick(pools[pools.length > 2 ? 1 : 0], 11)
      ];

      if (analysis.depth > 1.35) lines.push(pick(lexicon.threshold.fragments, 17));
      if (analysis.depth > 1.85 || state.awakened) lines.push(pick(lexicon.general.fragments, 23));
      if (state.awakened) lines.unshift(pick(awakenedFragments, 31));
      if ((state.count || 0) > 2 && analysis.depth > 1.05) {
        lines.push('La memoria locale conferma: questa non è la prima crepa. È la prima che hai deciso di nominare.');
      }
      if (analysis.tokens < 4 && analysis.depth < 0.9) {
        lines.push('Domanda breve. Campo debole. Ma anche le incisioni minime possono aprire una porta.');
      }

      lines.push(pick(closers, 41));

      return {
        answer: [...new Set(lines)].join('\n\n'),
        depth: analysis.depth,
        category: analysis.second ? `${analysis.category}/${analysis.second}` : analysis.category
      };
    },

    daily(state = {}) {
      const today = new Date().toISOString().slice(0, 10);
      const seed = this.hash(`${today}:starorigin:${state.awakened ? 'a' : 'd'}`);
      const categories = Object.keys(lexicon).filter(key => key !== 'general');
      const category = categories[seed % categories.length];
      const answer = [
        `DAILY ORACLE · ${today}`,
        lexicon[category].fragments[(seed + 7) % lexicon[category].fragments.length],
        lexicon.general.fragments[(seed + 19) % lexicon.general.fragments.length],
        'Una sola domanda speciale al giorno. Non consumarla: portala con te.'
      ].join('\n\n');
      return { answer, depth: 1.33, category: `daily/${category}` };
    },

    hash(value) {
      let h = 2166136261;
      for (let i = 0; i < value.length; i++) {
        h ^= value.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }
      return h >>> 0;
    }
  };
})();
