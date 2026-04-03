window.SpecimenContent = {
  site: {
    fieldLabel: "METHOD / DREAM / TRACE",
    footer: ["VERSION 2.0", "STATIC / GITHUB PAGES", "METHOD + DREAM + TRACE"],
    prelude: {
      eyebrow: "METHOD / DREAM / TRACE",
      title: "A field for reading a living practice.",
      copy:
        "Non un portfolio lineare, ma un ambiente sensibile. Qui la pratica prende forma come costellazione di cinema, sistemi, ricerca, archivi, immagini e costruzione concreta.",
      button: "ENTER FIELD"
    },
    rituals: [
      ["click", "bring a fragment into focus"],
      ["M", "change lens"],
      ["R", "recompose the field"],
      ["G / L / D / C", "toggle grid, labels, motion, constellation"]
    ],
    coda: {
      title: "I do not separate vision from execution.",
      copy:
        "Mi interessa costruire forme che restino vive sia nel pensiero sia nella realizzazione. Questo sito prova a mostrare proprio quella continuità.",
      pills: ["cinema", "systems", "archives", "creative direction", "digital language", "sensitive production"]
    }
  },

  modes: [
    {
      id: "vision",
      label: "VISION MODE",
      state: "ACTIVE READING",
      year: "2026",
      kicker: "CINEMA / IMAGE / SYSTEM / SENSITIVE DIRECTION",
      title: "I turn artistic chaos into lucid structures without killing its mystery.",
      description:
        "Questa lente legge il lavoro a partire dall'immaginazione, dalla tensione narrativa e dalla capacità di costruire mondi percettivi memorabili.",
      statement:
        "Lavoro nel punto in cui immaginazione, rigore e costruzione sensibile si incontrano. Qui il sito si comporta come un atlante di possibilità e attrazioni.",
      thesis:
        "La mia pratica non nasce da un medium solo. Nasce da una regia di relazioni tra immagine, produzione, testo, spazio e percezione.",
      axisX: "X / IMAGINATION",
      axisY: "Y / NARRATIVE PRESSURE",
      note:
        "Vision Mode misura quanto ogni area del lavoro riesce a generare universo, intensità, desiderio di permanenza e capacità di immaginazione.",
      archiveNote:
        "Questa lettura privilegia i frammenti che producono immaginario, densità simbolica, tensione scenica e forza di attrazione.",
      metrics: [
        ["lens", "vision"],
        ["tone", "cinematic"],
        ["tempo", "expansive"],
        ["risk", "high"]
      ],
      map: {
        xKey: "imagination",
        yKey: "narrative",
        emphasisKey: "presence",
        clusterKey: "research"
      },
      layout: {
        scatterX: 0.34,
        scatterY: 0.3,
        biasX: 0.26,
        biasY: -0.12,
        quantize: false,
        curvature: 0.18
      },
      motion: {
        driftX: 0.8,
        driftY: 0.62,
        sway: 0.55,
        pulse: 0.12,
        bandBase: 0.28,
        bandRange: 0.08,
        bandSpeed: 0.42,
        svgDriftX: 1.8,
        svgDriftY: 1.1,
        echoOpacity: 0.12
      },
      zones: [
        { label: "AURA", x: 0.08, y: 0.18, w: 0.34, h: 0.23 },
        { label: "WORLD", x: 0.48, y: 0.14, w: 0.29, h: 0.24 },
        { label: "IMAGE", x: 0.18, y: 0.56, w: 0.36, h: 0.22 }
      ]
    },

    {
      id: "system",
      label: "SYSTEM MODE",
      state: "ORGANIZED FORCE",
      year: "2026",
      kicker: "PRODUCTION / ARCHITECTURE / DECISION / DELIVERY",
      title: "I build structures that let complex projects remain alive and executable.",
      description:
        "Questa lente mette al centro project management, controllo della complessità, sostenibilità e capacità di trasformare visioni in processi reali.",
      statement:
        "Il sito si fa macchina operativa. Non mostra solo cosa immagino, ma come lo rendo praticabile, condivisibile, coordinato e durevole.",
      thesis:
        "Per me la struttura non è un contenitore neutro. È un gesto estetico e politico: decide cosa può accadere, con quale tenuta e con quale chiarezza.",
      axisX: "X / COMPLEXITY",
      axisY: "Y / CONTROL",
      note:
        "System Mode rende visibile la parte spesso invisibile del lavoro: metodo, coordinamento, gerarchia, progettazione, precisione e affidabilità.",
      archiveNote:
        "Qui emergono i frammenti che tengono insieme calendario, budget, linguaggio, decisioni, mediazione e possibilità di esecuzione.",
      metrics: [
        ["lens", "system"],
        ["tone", "rigorous"],
        ["tempo", "measured"],
        ["risk", "controlled"]
      ],
      map: {
        xKey: "complexity",
        yKey: "control",
        emphasisKey: "method",
        clusterKey: "public"
      },
      layout: {
        scatterX: 0.18,
        scatterY: 0.16,
        biasX: 0.08,
        biasY: 0.02,
        quantize: true,
        curvature: 0.12
      },
      motion: {
        driftX: 0.26,
        driftY: 0.18,
        sway: 0.18,
        pulse: 0.04,
        bandBase: 0.2,
        bandRange: 0.035,
        bandSpeed: 0.32,
        svgDriftX: 0.45,
        svgDriftY: 0.28,
        echoOpacity: 0.06
      },
      zones: [
        { label: "PLAN", x: 0.1, y: 0.16, w: 0.28, h: 0.22 },
        { label: "FLOW", x: 0.46, y: 0.16, w: 0.26, h: 0.22 },
        { label: "FRAME", x: 0.22, y: 0.56, w: 0.34, h: 0.2 }
      ]
    },

    {
      id: "trace",
      label: "TRACE MODE",
      state: "RESIDUAL MEMORY",
      year: "2026",
      kicker: "ARCHIVE / MEMORY / AFTERIMAGE / MATERIAL RESONANCE",
      title: "I treat images, sounds and documents as residues that can still burn.",
      description:
        "Questa lente legge il lavoro come sedimentazione: resti, memorie, superfici, materiali di ricerca, archivi e tracce capaci di riaccendersi.",
      statement:
        "Qui il sito smette di sembrare una mappa funzionale e diventa un campo di sopravvivenze, echi, prove, scarti e materiali che continuano a fare pressione.",
      thesis:
        "L'archivio non è deposito. È materia viva che restituisce ferita, ritorno, vibrazione e possibilità di nuova lettura.",
      axisX: "X / MEMORY",
      axisY: "Y / MATERIAL RESIDUE",
      note:
        "Trace Mode porta in primo piano ciò che resta: la memoria visiva, il documento, la traccia sonora, il bordo, il frammento e il ritorno.",
      archiveNote:
        "Questa lente privilegia i frammenti in cui documento, archivio, resti, dopoimmagini e risonanze diventano ancora materiali attivi.",
      metrics: [
        ["lens", "trace"],
        ["tone", "residual"],
        ["tempo", "deep"],
        ["risk", "latent"]
      ],
      map: {
        xKey: "memory",
        yKey: "residue",
        emphasisKey: "heat",
        clusterKey: "presence"
      },
      layout: {
        scatterX: 0.28,
        scatterY: 0.26,
        biasX: -0.14,
        biasY: 0.16,
        quantize: false,
        curvature: 0.22
      },
      motion: {
        driftX: 0.52,
        driftY: 0.44,
        sway: 0.34,
        pulse: 0.08,
        bandBase: 0.24,
        bandRange: 0.12,
        bandSpeed: 0.24,
        svgDriftX: 0.95,
        svgDriftY: 0.66,
        echoOpacity: 0.15
      },
      zones: [
        { label: "RELIC", x: 0.11, y: 0.18, w: 0.32, h: 0.23 },
        { label: "ASH", x: 0.54, y: 0.2, w: 0.22, h: 0.2 },
        { label: "ECHO", x: 0.2, y: 0.58, w: 0.38, h: 0.22 }
      ]
    }
  ],

  fragments: [
    {
      id: "p01",
      code: "P_01",
      kind: "cinema",
      year: "ongoing",
      title: "Independent Cinema",
      summary:
        "Cuore autoriale del lavoro, dove immagine, tempo, messa in scena e costruzione sensibile si incontrano.",
      reading:
        "Qui il cinema non è solo formato finale. È un principio compositivo che informa anche installazioni, archivi, comunicazione e dispositivi editoriali.",
      line:
        "Il film è il luogo in cui la visione deve reggere sia come intensità simbolica sia come costruzione concreta.",
      tags: ["direction", "narrative", "mise-en-scène"],
      metrics: {
        imagination: 0.95,
        narrative: 0.92,
        complexity: 0.82,
        control: 0.74,
        memory: 0.72,
        residue: 0.58,
        presence: 0.94,
        research: 0.76,
        method: 0.73,
        public: 0.66,
        heat: 0.79
      },
      relations: ["p03", "p04", "p07", "p08"]
    },

    {
      id: "p02",
      code: "P_02",
      kind: "photography",
      year: "ongoing",
      title: "Photography & Still Image",
      summary:
        "Spazio di precisione e sospensione, dove il dettaglio diventa atmosfera e documento insieme.",
      reading:
        "La fotografia agisce come banco di prova del linguaggio. Mi permette di isolare ritmo, luce, superficie e soglia prima, oltre o attorno al racconto.",
      line:
        "La singola immagine è una ferita controllata: ferma il tempo ma lascia uscire una vibrazione.",
      tags: ["stillness", "light", "surface"],
      metrics: {
        imagination: 0.83,
        narrative: 0.58,
        complexity: 0.46,
        control: 0.88,
        memory: 0.9,
        residue: 0.82,
        presence: 0.81,
        research: 0.71,
        method: 0.64,
        public: 0.54,
        heat: 0.73
      },
      relations: ["p01", "p03", "p08"]
    },

    {
      id: "p03",
      code: "P_03",
      kind: "installation",
      year: "ongoing",
      title: "Installative Environments",
      summary:
        "Ambienti in cui immagine, spazio, corpo e attraversamento si intrecciano come esperienza.",
      reading:
        "Qui il lavoro si apre alla dimensione situata. Non mostro solo contenuti: progetto condizioni percettive, soglie d'accesso e dinamiche di presenza.",
      line:
        "L'installazione è cinema espanso: non più schermo davanti allo sguardo, ma spazio che organizza il modo di stare.",
      tags: ["space", "presence", "experience"],
      metrics: {
        imagination: 0.89,
        narrative: 0.71,
        complexity: 0.91,
        control: 0.68,
        memory: 0.77,
        residue: 0.69,
        presence: 0.96,
        research: 0.84,
        method: 0.74,
        public: 0.78,
        heat: 0.82
      },
      relations: ["p01", "p02", "p04", "p09"]
    },

    {
      id: "p04",
      code: "P_04",
      kind: "production",
      year: "ongoing",
      title: "Project Direction & Production",
      summary:
        "Area in cui la complessità viene trasformata in traiettorie, decisioni, calendario, budget e tenuta.",
      reading:
        "La produzione non è il retrobottega del lavoro. È la parte che permette all'intuizione di attraversare il reale senza perdere orientamento.",
      line:
        "Per me coordinare è una forma di regia: significa distribuire energia, non solo controllare risorse.",
      tags: ["coordination", "budget", "execution"],
      metrics: {
        imagination: 0.58,
        narrative: 0.47,
        complexity: 0.97,
        control: 0.96,
        memory: 0.38,
        residue: 0.22,
        presence: 0.55,
        research: 0.63,
        method: 0.98,
        public: 0.72,
        heat: 0.34
      },
      relations: ["p01", "p03", "p05", "p06", "p07"]
    },

    {
      id: "p05",
      code: "P_05",
      kind: "editorial",
      year: "ongoing",
      title: "Editorial Devices",
      summary:
        "Schede, dossier, mappe, sinossi e strutture di racconto che rendono visibili le relazioni tra idee, processi e opere.",
      reading:
        "Questa parte del lavoro costruisce chiarezza senza impoverire. Traduce complessità in strumenti leggibili, condivisibili e orientanti.",
      line:
        "Un buon dossier non serve a semplificare un'opera, ma a darle una soglia di accesso forte.",
      tags: ["writing", "framing", "clarity"],
      metrics: {
        imagination: 0.69,
        narrative: 0.64,
        complexity: 0.86,
        control: 0.9,
        memory: 0.49,
        residue: 0.37,
        presence: 0.61,
        research: 0.82,
        method: 0.95,
        public: 0.83,
        heat: 0.29
      },
      relations: ["p04", "p06", "p07", "p08"]
    },

    {
      id: "p06",
      code: "P_06",
      kind: "cultural",
      year: "ongoing",
      title: "Cultural Communication",
      summary:
        "Zona in cui il lavoro incontra pubblici, istituzioni e contesti, senza ridursi a promozione senz'anima.",
      reading:
        "Non penso la comunicazione come confezione finale. La considero una drammaturgia di accesso che decide come un progetto può essere ricevuto.",
      line:
        "Comunicare bene significa costruire una distanza giusta: abbastanza chiara da orientare, abbastanza aperta da far desiderare.",
      tags: ["publics", "strategy", "mediation"],
      metrics: {
        imagination: 0.54,
        narrative: 0.59,
        complexity: 0.73,
        control: 0.86,
        memory: 0.41,
        residue: 0.24,
        presence: 0.67,
        research: 0.58,
        method: 0.88,
        public: 0.97,
        heat: 0.31
      },
      relations: ["p04", "p05", "p09"]
    },

    {
      id: "p07",
      code: "P_07",
      kind: "research",
      year: "ongoing",
      title: "Research & Teaching",
      summary:
        "Spazio in cui il lavoro riflette su sé stesso, si articola, si trasmette e genera nuove ipotesi.",
      reading:
        "La ricerca non arriva dopo la pratica. È una sua tensione interna. Insegno e studio per riformulare il modo in cui costruisco opere e processi.",
      line:
        "Ogni progetto forte contiene una pedagogia implicita: mostra anche un modo di guardare, pensare e organizzare il sensibile.",
      tags: ["analysis", "transmission", "reflection"],
      metrics: {
        imagination: 0.72,
        narrative: 0.66,
        complexity: 0.78,
        control: 0.84,
        memory: 0.63,
        residue: 0.45,
        presence: 0.59,
        research: 0.98,
        method: 0.89,
        public: 0.68,
        heat: 0.42
      },
      relations: ["p01", "p04", "p05", "p08"]
    },

    {
      id: "p08",
      code: "P_08",
      kind: "archive",
      year: "ongoing",
      title: "Archive & Sensitive Memory",
      summary:
        "Materiali, documenti, prove, resti e immagini che continuano a produrre pensiero e forma.",
      reading:
        "L'archivio è una zona viva della pratica. Non conserva soltanto il passato: riapre possibilità, ritorni, montaggi futuri e risonanze inattese.",
      line:
        "Mi interessa l'archivio quando smette di essere deposito e torna a comportarsi come materia narrativa.",
      tags: ["documents", "memory", "afterimage"],
      metrics: {
        imagination: 0.78,
        narrative: 0.62,
        complexity: 0.57,
        control: 0.61,
        memory: 0.98,
        residue: 0.97,
        presence: 0.74,
        research: 0.9,
        method: 0.56,
        public: 0.48,
        heat: 0.88
      },
      relations: ["p01", "p02", "p05", "p07", "p09"]
    },

    {
      id: "p09",
      code: "P_09",
      kind: "digital",
      year: "ongoing",
      title: "Digital Systems & AI",
      summary:
        "Uso tecnologia, interfacce e sistemi generativi come estensione critica della pratica, non come effetto di moda.",
      reading:
        "Il digitale mi interessa quando diventa linguaggio, alleato operativo e macchina concettuale. Non come ornamento futurista, ma come dispositivo preciso.",
      line:
        "L'innovazione mi interessa solo quando produce nuova leggibilità, nuova forza e nuova possibilità di esperienza.",
      tags: ["interface", "AI", "creative coding"],
      metrics: {
        imagination: 0.86,
        narrative: 0.57,
        complexity: 0.94,
        control: 0.78,
        memory: 0.46,
        residue: 0.33,
        presence: 0.79,
        research: 0.87,
        method: 0.81,
        public: 0.76,
        heat: 0.52
      },
      relations: ["p03", "p04", "p05", "p08"]
    }
  ]
};      }
    },
    {
      id: "sumi",
      label: "SUMI MODE",
      field: "FIELD_09",
      state: "SUSPENSION",
      year: "2026",
      kicker: "INTERVAL / TRACE / RESERVE",
      title: "A field built from reserve and interval.",
      description:
        "La modalità sumi riorienta il materiale lungo l’asse della traccia e della sottrazione. Conta meno ciò che occupa spazio, più ciò che lo trattiene.",
      statement:
        "Ogni frammento viene valutato per capacità di trattenere forma con il minimo gesto. L’assenza diventa criterio, non vuoto.",
      note:
        "Sumi riduce il rumore e fa emergere il ritmo interno del materiale. La board non è più una costellazione: è una respirazione misurata.",
      axisX: "X / RESERVE",
      axisY: "Y / TRACE",
      footer: ["VERSION 0.8", "SUMI / FIELD / JS", "INTERVAL MODE"],
      metrics: [
        ["lens", "subtraction"],
        ["density", "rarefied"],
        ["signal", "faint"],
        ["logic", "interval"]
      ],
      map: {
        xKey: "void",
        yKey: "trace",
        clusterKey: "silence",
        emphasisKey: "discipline",
        contour: "sumi"
      }
    },
    {
      id: "ember",
      label: "EMBER MODE",
      field: "FIELD_10",
      state: "RESIDUAL HEAT",
      year: "2026",
      kicker: "RESIDUE / HEAT / EVIDENCE",
      title: "A field where the archive keeps glowing.",
      description:
        "La modalità ember rilegge gli stessi frammenti come tracce termiche. Non cambia il materiale: cambia il livello di pressione che gli viene riconosciuto.",
      statement:
        "Qui l’archivio smette di sembrare neutro. Le relazioni diventano cicatrici, le concentrazioni diventano prove di intensità.",
      note:
        "Ember non aggiunge dramma ornamentale. Rende visibile il calore già presente nei frammenti e nelle loro prossimità narrative.",
      axisX: "X / HEAT",
      axisY: "Y / RESIDUE",
      footer: ["VERSION 0.8", "EMBER / FIELD / JS", "THERMAL MODE"],
      metrics: [
        ["lens", "evidence"],
        ["density", "compressed"],
        ["signal", "active"],
        ["logic", "residual"]
      ],
      map: {
        xKey: "heat",
        yKey: "residue",
        clusterKey: "signal",
        emphasisKey: "heat",
        contour: "ember"
      }
    }
  ],
  entries: [
    {
      id: "a01",
      code: "A_01",
      slug: "threshold-notes",
      type: "note",
      year: "2026",
      title: "Threshold Notes",
      summary:
        "Appunti sul margine come punto di montaggio, attesa e cambio di stato.",
      detail:
        "Una sequenza di annotazioni che usa la soglia come dispositivo di lettura. Non descrive opere finite: prepara il loro ingresso nel campo.",
      note:
        "Funziona come soglia semantica. Apre il sistema e lo ancora a un gesto curatoriale preciso.",
      tags: ["margin", "editing", "entry point"],
      metrics: {
        silence: 0.78,
        structure: 0.63,
        residue: 0.32,
        heat: 0.26,
        trace: 0.84,
        void: 0.8,
        discipline: 0.74,
        signal: 0.28
      },
      relations: ["a02", "a04", "a08"]
    },
    {
      id: "a02",
      code: "A_02",
      slug: "image-residue-atlas",
      type: "atlas",
      year: "2026",
      title: "Image Residue Atlas",
      summary:
        "Atlante di fotogrammi periferici, bordi, fuori fuoco e residui di scena.",
      detail:
        "Una raccolta di immagini minori trattate come prove, non come scarti. Serve a mostrare come il residuo possa reggere un’immaginazione intera.",
      note:
        "È il nucleo iconografico più denso del sistema. Non spiega il progetto: ne custodisce la materia.",
      tags: ["still", "residue", "archive"],
      metrics: {
        silence: 0.42,
        structure: 0.61,
        residue: 0.91,
        heat: 0.62,
        trace: 0.56,
        void: 0.35,
        discipline: 0.58,
        signal: 0.72
      },
      relations: ["a01", "a03", "a06", "a07"]
    },
    {
      id: "a03",
      code: "A_03",
      slug: "signal-board",
      type: "diagram",
      year: "2026",
      title: "Signal Board",
      summary:
        "Schema relazionale tra scene, note, elementi sonori e intensità percettive.",
      detail:
        "Una board che traduce il materiale in coordinate operative. Tiene insieme immaginario e produzione senza ridurre l’uno all’altra.",
      note:
        "È il frammento più sistemico. Selezionarlo dovrebbe sempre far capire che il progetto è un dispositivo, non solo un’immagine.",
      tags: ["mapping", "production", "system"],
      metrics: {
        silence: 0.34,
        structure: 0.9,
        residue: 0.58,
        heat: 0.44,
        trace: 0.63,
        void: 0.26,
        discipline: 0.88,
        signal: 0.67
      },
      relations: ["a02", "a04", "a05", "a08"]
    },
    {
      id: "a04",
      code: "A_04",
      slug: "voice-fragment-study",
      type: "audio",
      year: "2026",
      title: "Voice Fragment Study",
      summary:
        "Studio su voci spezzate, frasi non concluse e presenze acustiche laterali.",
      detail:
        "Lavora sul frammento sonoro come presenza intermittente. Il contenuto non viene normalizzato: resta esposto nel suo carattere incompleto.",
      note:
        "Introduce temperatura e vulnerabilità. È una voce che non occupa il centro ma cambia il clima dell’intero insieme.",
      tags: ["voice", "fragment", "breath"],
      metrics: {
        silence: 0.61,
        structure: 0.49,
        residue: 0.47,
        heat: 0.78,
        trace: 0.82,
        void: 0.51,
        discipline: 0.46,
        signal: 0.73
      },
      relations: ["a01", "a03", "a06"]
    },
    {
      id: "a05",
      code: "A_05",
      slug: "curatorial-protocol",
      type: "protocol",
      year: "2026",
      title: "Curatorial Protocol",
      summary:
        "Regole minime per ordinare materiali eterogenei senza appiattirne la differenza.",
      detail:
        "Un protocollo operativo che stabilisce soglie, priorità e criteri di vicinanza. Fa da spina dorsale al campo senza diventare norma opaca.",
      note:
        "È il punto in cui il progetto smette di essere solo atmosfera e dimostra di saper prendere decisioni.",
      tags: ["method", "criteria", "sequence"],
      metrics: {
        silence: 0.52,
        structure: 0.95,
        residue: 0.36,
        heat: 0.24,
        trace: 0.42,
        void: 0.48,
        discipline: 0.93,
        signal: 0.31
      },
      relations: ["a03", "a06", "a08"]
    },
    {
      id: "a06",
      code: "A_06",
      slug: "dark-room-index",
      type: "index",
      year: "2026",
      title: "Dark Room Index",
      summary:
        "Indice di prove visive e sonore ordinate per intensità, scarsità e permanenza.",
      detail:
        "L’indice non serve a chiudere il progetto ma a renderlo attraversabile. Ogni voce è una soglia d’accesso a una costellazione più ampia.",
      note:
        "Ha una funzione di orientamento reale. È uno dei luoghi in cui l’utente capisce perché restare nella pagina.",
      tags: ["index", "orientation", "archive"],
      metrics: {
        silence: 0.66,
        structure: 0.77,
        residue: 0.69,
        heat: 0.41,
        trace: 0.58,
        void: 0.62,
        discipline: 0.82,
        signal: 0.54
      },
      relations: ["a02", "a04", "a05", "a07"]
    },
    {
      id: "a07",
      code: "A_07",
      slug: "scar-plate",
      type: "plate",
      year: "2026",
      title: "Scar Plate",
      summary:
        "Lastra visiva trattata come superficie ferita, con picchi di calore e memoria residua.",
      detail:
        "Una composizione che conserva segni di pressione, abrasione e sopravvivenza. È l’elemento più vicino a una prova fisica del campo.",
      note:
        "Porta dentro il sistema una ferita visiva concreta. In ember deve stare vicino al centro della tensione.",
      tags: ["plate", "scar", "evidence"],
      metrics: {
        silence: 0.24,
        structure: 0.53,
        residue: 0.96,
        heat: 0.92,
        trace: 0.38,
        void: 0.16,
        discipline: 0.44,
        signal: 0.95
      },
      relations: ["a02", "a06", "a08"]
    },
    {
      id: "a08",
      code: "A_08",
      slug: "return-loop",
      type: "sequence",
      year: "2026",
      title: "Return Loop",
      summary:
        "Sequenza che rimonta gli stessi materiali per verificare cosa resta e cosa cambia.",
      detail:
        "Un loop di ritorno che misura la capacità dei frammenti di reggere riletture successive. È insieme verifica critica e dispositivo ritmico.",
      note:
        "Tiene insieme archivio e temporalità. È il frammento che più chiaramente lascia una traccia di metodo nel tempo.",
      tags: ["loop", "time", "verification"],
      metrics: {
        silence: 0.57,
        structure: 0.72,
        residue: 0.64,
        heat: 0.57,
        trace: 0.75,
        void: 0.54,
        discipline: 0.69,
        signal: 0.66
      },
      relations: ["a01", "a03", "a05", "a07"]
    }
  ]
};
