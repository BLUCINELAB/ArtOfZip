window.SpecimenContent = {
  site: {
    fieldLabel: "METHOD / DREAM / TRACE",
    footer: ["VERSION 3.0", "STATIC / GITHUB PAGES", "METHOD + DREAM + TRACE"],
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
      sequenceNote:
        "Qui il frammento selezionato viene letto come una piccola scena: comparsa, intensificazione, permanenza.",
      archiveNote:
        "Questa lettura privilegia i frammenti che producono immaginario, densità simbolica, tensione scenica e forza di attrazione.",
      ambient:
        "Vision Mode apre il campo, allunga il respiro, aumenta il bagliore e lascia che i nodi sembrino quasi stelle operative.",
      axisX: "X / IMAGINATION",
      axisY: "Y / NARRATIVE PRESSURE",
      note:
        "La lente attiva dilata il campo: qui ogni frammento viene misurato per intensità percettiva, pressione narrativa e capacità di generare universo.",
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
      sequenceNote:
        "Qui il frammento è letto come una catena di decisioni: assetto, tenuta, esecuzione.",
      archiveNote:
        "Qui emergono i frammenti che tengono insieme calendario, budget, linguaggio, decisioni, mediazione e possibilità di esecuzione.",
      ambient:
        "System Mode raffredda il campo, riduce la deriva, rende i legami più leggibili e porta la complessità a una forma governabile.",
      axisX: "X / COMPLEXITY",
      axisY: "Y / CONTROL",
      note:
        "La lente attiva compatta il campo: qui ogni frammento viene misurato per complessità, controllo, affidabilità e forza di metodo.",
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
      sequenceNote:
        "Qui il frammento selezionato viene letto come residuo attivo: deposito, ritorno, combustione lenta.",
      archiveNote:
        "Questa lente privilegia i frammenti in cui documento, archivio, resti, dopoimmagini e risonanze diventano ancora materiali attivi.",
      ambient:
        "Trace Mode abbassa la luce frontale, lascia più alone, più eco, più lentezza: il campo sembra ricordare prima di parlare.",
      axisX: "X / MEMORY",
      axisY: "Y / MATERIAL RESIDUE",
      note:
        "La lente attiva rende il campo più residuale: qui ogni frammento viene misurato per memoria, traccia, risonanza e capacità di ritornare.",
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
      beats: [
        {
          title: "Threshold",
          copy:
            "L'immagine appare come soglia: non introduce soltanto un racconto, ma imposta da subito una temperatura di mondo."
        },
        {
          title: "Pressure",
          copy:
            "Il lavoro cinematografico concentra ritmo, materia e decisione fino a rendere leggibile una tensione che altrove resta diffusa."
        },
        {
          title: "Persistence",
          copy:
            "Quando funziona, il film non finisce sullo schermo: continua a organizzare memoria, linguaggio e desiderio di ritorno."
        }
      ],
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
      beats: [
        {
          title: "Fixing",
          copy:
            "La fotografia trattiene l'istante abbastanza a lungo da far emergere ciò che nel flusso resterebbe invisibile."
        },
        {
          title: "Surface",
          copy:
            "La luce diventa materiale critico: non descrive soltanto le cose, ma ne misura densità, distanza e temperatura."
        },
        {
          title: "Afterimage",
          copy:
            "Una volta guardata, l'immagine continua a operare come resto attivo, quasi più forte del suo stesso momento di apparizione."
        }
      ],
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
      beats: [
        {
          title: "Entry",
          copy:
            "Il corpo entra in un dispositivo che non si limita a mostrare, ma costruisce già una postura, un ritmo, una relazione."
        },
        {
          title: "Immersion",
          copy:
            "Lo spazio smette di essere cornice e diventa montaggio vivo: presenza, orientamento e durata vengono ridisegnati."
        },
        {
          title: "Exit Residue",
          copy:
            "Anche dopo l'uscita, l'ambiente continua a lavorare come memoria corporale e come diagramma di esperienza."
        }
      ],
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
      beats: [
        {
          title: "Architecture",
          copy:
            "Ogni progetto viene aperto come sistema: priorità, margini, rischi e risorse entrano in una stessa sintassi operativa."
        },
        {
          title: "Tension Control",
          copy:
            "Coordinare non significa neutralizzare il caos, ma contenerlo abbastanza da lasciarlo ancora produttivo."
        },
        {
          title: "Delivery",
          copy:
            "La riuscita non è solo esecuzione corretta: è il punto in cui metodo e qualità sensibile smettono di apparire separati."
        }
      ],
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
      beats: [
        {
          title: "Framing",
          copy:
            "Il dispositivo editoriale definisce una soglia d'ingresso: stabilisce cosa può essere letto e in quale ordine di intensità."
        },
        {
          title: "Legibility",
          copy:
            "La complessità non viene ridotta, ma articolata. La pagina diventa luogo di montaggio e di allineamento percettivo."
        },
        {
          title: "Transmission",
          copy:
            "Quando regge, un supporto editoriale continua a lavorare come interfaccia mentale ben oltre il suo uso immediato."
        }
      ],
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
      beats: [
        {
          title: "Address",
          copy:
            "Ogni progetto deve trovare il suo modo di rivolgersi ai pubblici senza tradire la propria densità interna."
        },
        {
          title: "Mediation",
          copy:
            "La mediazione culturale non addomestica: costruisce condizioni di accesso che mantengono attiva la complessità."
        },
        {
          title: "Reception",
          copy:
            "Il risultato non è la semplice visibilità, ma una ricezione più attenta, più giusta, più disponibile alla permanenza."
        }
      ],
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
      beats: [
        {
          title: "Question",
          copy:
            "La ricerca apre il progetto da dentro: trasforma intuizioni implicite in domande operative, condivisibili, criticabili."
        },
        {
          title: "Transmission",
          copy:
            "L'insegnamento non replica forme già date, ma rende leggibili i processi che fanno nascere quelle forme."
        },
        {
          title: "Return",
          copy:
            "Quello che viene studiato e trasmesso rientra poi nella pratica come nuova precisione, nuovo rischio, nuova ipotesi."
        }
      ],
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
      beats: [
        {
          title: "Deposit",
          copy:
            "I materiali entrano nell'archivio come residui, ma non perdono energia: trattengono ancora un margine di combustione."
        },
        {
          title: "Reactivation",
          copy:
            "La lettura archiviale non è neutra: riattiva scarti, dettagli, documenti e prove come nuove possibilità di montaggio."
        },
        {
          title: "Future Memory",
          copy:
            "Quando il resto torna a vibrare, l'archivio smette di essere passato e diventa materiale per ciò che ancora non esiste."
        }
      ],
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
      beats: [
        {
          title: "Interface",
          copy:
            "La superficie digitale non è un contenitore neutro: decide in che modo il pensiero diventa accesso, attrito, esperienza."
        },
        {
          title: "Systemic Intelligence",
          copy:
            "Gli strumenti generativi diventano interessanti solo quando aiutano a vedere, ordinare o aprire complessità reale."
        },
        {
          title: "Critical Extension",
          copy:
            "Il digitale conta quando estende la pratica senza sostituirla: come macchina critica, non come semplice spettacolo."
        }
      ],
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
};
