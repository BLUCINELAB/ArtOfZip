window.SpecimenContent = {
  site: {
    name: "Specimen Field",
    version: "0.8",
    footer: ["VERSION 0.8", "HTML / CSS / JS", "FIELD READY"]
  },
  modes: [
    {
      id: "quiet",
      label: "QUIET MODE",
      field: "FIELD_08",
      state: "OBSERVATION",
      year: "2026",
      kicker: "ARCHIVE / FIELD / READING DEVICE",
      title: "A field that lets the archive become legible.",
      description:
        "La modalità quiet organizza l’archivio per grado di silenzio e tenuta strutturale. Qui il materiale viene osservato prima di essere interpretato.",
      statement:
        "Il campo privilegia la leggibilità: meno enfasi, più relazione, più distanza critica tra segno e spettacolo.",
      note:
        "Quiet non raffredda il progetto: gli dà una disciplina. I frammenti emergono come appunti tenuti insieme da una struttura di lettura.",
      axisX: "X / SILENCE",
      axisY: "Y / STRUCTURE",
      footer: ["VERSION 0.8", "QUIET / FIELD / JS", "READING MODE"],
      metrics: [
        ["lens", "observation"],
        ["density", "measured"],
        ["signal", "restrained"],
        ["logic", "curatorial"]
      ],
      map: {
        xKey: "silence",
        yKey: "structure",
        clusterKey: "discipline",
        emphasisKey: "residue",
        contour: "quiet"
      }
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
