window.SpecimenContent = {
  modes: [
    {
      id: "quiet",
      label: "QUIET MODE",
      field: "FIELD_05",
      state: "OBSERVATION",
      year: "2026",
      kicker: "ARCHIVE / FIELD / SPECIMEN",
      title: ["A quiet", "exhibition", "system."],
      description:
        "A public test space for traces, studies, fragments and measured atmospheres. Not a portfolio. A living curatorial field.",
      indexLabel: "INDEX",
      indexItems: [
        "01 / specimen field",
        "02 / annotation drift",
        "03 / archive residue",
        "04 / reading protocol",
        "05 / spatial memory",
        "06 / suspended signal"
      ],
      specLabel: "SPEC",
      specItems: [
        ["mode", "quiet"],
        ["density", "low"],
        ["motion", "subtle"],
        ["tone", "measured"],
        ["status", "open"],
        ["logic", "curatorial"]
      ],
      axisY: "AXIS / Y",
      axisX: "FIELD / CENTRAL",
      notesLabel: "READING NOTES",
      notesCopy:
        "The interface behaves like an exhibition plate. It does not explain a finished work. It stages a way of reading unfinished matter.",
      metricsLabel: "SYSTEM METRICS",
      metrics: [
        ["density", "0.42"],
        ["drift", "0.08"],
        ["noise", "0.02"],
        ["state", "stable"],
        ["heat", "0.14"],
        ["signal", "low"]
      ],
      coordsLabel: "COORDINATES",
      coords: [
        ["X", "118.24"],
        ["Y", "08.93"],
        ["STATE", "archive"],
        ["MODE", "quiet"],
        ["YEAR", "2026"],
        ["FIELD", "05"]
      ],
      footer: ["VERSION 0.4", "HTML / CSS / JS", "PUBLIC TEST FIELD"],
      entriesLabel: "ARCHIVE ENTRIES",
      entriesNote:
        "Small studies, visual residues and speculative interfaces collected as an open sequence.",
      entries: [
        {
          code: "E_01",
          type: "study",
          year: "2026",
          title: "Silent Mesh",
          description:
            "A restrained field of filaments and pressure points behaving like a paused diagram.",
          metaLeft: "density low",
          metaRight: "status open"
        },
        {
          code: "E_02",
          type: "note",
          year: "2026",
          title: "Curatorial Drift",
          description:
            "An interface that accumulates atmosphere before utility, then slowly becomes structure.",
          metaLeft: "drift subtle",
          metaRight: "phase beta"
        },
        {
          code: "E_03",
          type: "specimen",
          year: "2026",
          title: "Reading Apparatus",
          description:
            "Labels, measures and coordinates used as framing devices, not as explanatory captions.",
          metaLeft: "tone quiet",
          metaRight: "mode archive"
        }
      ],
      annotations: [
        {
          index: "[01]",
          tag: "SPECIMEN / DORMANT",
          copy: "Primary cluster retained in low signal state.",
          x: 73,
          y: 17
        },
        {
          index: "[02]",
          tag: "TRACE / RETAINED",
          copy: "Annotation used as reading device, not explanation.",
          x: 10,
          y: 44
        },
        {
          index: "[03]",
          tag: "DRIFT / 0.08°",
          copy: "Minimal motion preserves the object as field, not animation.",
          x: 70,
          y: 76
        }
      ],
      visual: {
        seed: 1,
        density: 24,
        layers: 38,
        pulse: 0.16,
        lineAlpha: 0.16,
        signalAlpha: 0.2,
        nodeScale: 1.0,
        meshOpacity: 0.12,
        coreScaleX: 0.8,
        coreScaleY: 1.06
      }
    },
    {
      id: "sumi",
      label: "SUMI MODE",
      field: "FIELD_06",
      state: "SUSPENSION",
      year: "2026",
      kicker: "MA / TRACE / APPARATUS",
      title: ["A measured", "field of", "intervals."],
      description:
        "More silence, more reserve, less declaration. A digital surface that works through tension, pause and subtraction.",
      indexLabel: "INDEX",
      indexItems: [
        "01 / void interval",
        "02 / suspended line",
        "03 / pale cluster",
        "04 / note reserve",
        "05 / held tension",
        "06 / low heat"
      ],
      specLabel: "SPEC",
      specItems: [
        ["mode", "sumi"],
        ["density", "rarefied"],
        ["motion", "still"],
        ["tone", "minimal"],
        ["status", "held"],
        ["logic", "interval"]
      ],
      axisY: "VERTICAL / TRACE",
      axisX: "FIELD / INTERVAL",
      notesLabel: "READING NOTES",
      notesCopy:
        "This mode uses absence as structure. Space is not empty. It is measured reserve. Form appears through restraint, not saturation.",
      metricsLabel: "SYSTEM METRICS",
      metrics: [
        ["density", "0.28"],
        ["drift", "0.05"],
        ["noise", "0.01"],
        ["state", "held"],
        ["heat", "0.07"],
        ["signal", "faint"]
      ],
      coordsLabel: "COORDINATES",
      coords: [
        ["X", "084.11"],
        ["Y", "17.02"],
        ["STATE", "suspended"],
        ["MODE", "sumi"],
        ["YEAR", "2026"],
        ["FIELD", "06"]
      ],
      footer: ["VERSION 0.4", "MA / TRACE / JS", "SILENT CURATORIAL MODE"],
      entriesLabel: "ARCHIVE ENTRIES",
      entriesNote:
        "Fragments reduced to their minimum readable tension.",
      entries: [
        {
          code: "S_01",
          type: "field",
          year: "2026",
          title: "Reserve Structure",
          description:
            "A surface that keeps most of its force in withheld density and delayed emergence.",
          metaLeft: "density low",
          metaRight: "signal faint"
        },
        {
          code: "S_02",
          type: "plate",
          year: "2026",
          title: "Pale Notation",
          description:
            "Diagrammatic traces stripped of excess until they approach a visual whisper.",
          metaLeft: "motion still",
          metaRight: "state held"
        },
        {
          code: "S_03",
          type: "note",
          year: "2026",
          title: "Interval Logic",
          description:
            "A curatorial interface informed by pause, asymmetry and dry elegance.",
          metaLeft: "tone minimal",
          metaRight: "phase active"
        }
      ],
      annotations: [
        {
          index: "[01]",
          tag: "RESERVE / ACTIVE",
          copy: "Signal reduced to preserve edge, spacing and breath.",
          x: 72,
          y: 15
        },
        {
          index: "[02]",
          tag: "FIELD / PAUSED",
          copy: "The note appears as a margin event rather than a central command.",
          x: 8,
          y: 46
        },
        {
          index: "[03]",
          tag: "DRIFT / 0.05°",
          copy: "Almost still, but never inert.",
          x: 69,
          y: 77
        }
      ],
      visual: {
        seed: 2,
        density: 20,
        layers: 32,
        pulse: 0.1,
        lineAlpha: 0.12,
        signalAlpha: 0.12,
        nodeScale: 0.82,
        meshOpacity: 0.08,
        coreScaleX: 0.7,
        coreScaleY: 1.0
      }
    },
    {
      id: "ember",
      label: "EMBER MODE",
      field: "FIELD_07",
      state: "HEAT TRACE",
      year: "2026",
      kicker: "ARCHIVE / SCAR / EMBER",
      title: ["A dark", "curatorial", "residue."],
      description:
        "A restrained surface with a retained burn inside it. Not spectacle, but thermal memory held in the archive.",
      indexLabel: "INDEX",
      indexItems: [
        "01 / ember trace",
        "02 / thermal residue",
        "03 / scar cluster",
        "04 / dark plate",
        "05 / retained fracture",
        "06 / signal wound"
      ],
      specLabel: "SPEC",
      specItems: [
        ["mode", "ember"],
        ["density", "medium"],
        ["motion", "latent"],
        ["tone", "residual"],
        ["status", "warm"],
        ["logic", "evidence"]
      ],
      axisY: "THERMAL / Y",
      axisX: "FIELD / RESIDUE",
      notesLabel: "READING NOTES",
      notesCopy:
        "Warmth is treated here as evidence, not decoration. The system keeps a small wound open so the surface does not become neutral.",
      metricsLabel: "SYSTEM METRICS",
      metrics: [
        ["density", "0.51"],
        ["drift", "0.09"],
        ["noise", "0.03"],
        ["state", "warm"],
        ["heat", "0.32"],
        ["signal", "active"]
      ],
      coordsLabel: "COORDINATES",
      coords: [
        ["X", "126.91"],
        ["Y", "09.44"],
        ["STATE", "residual"],
        ["MODE", "ember"],
        ["YEAR", "2026"],
        ["FIELD", "07"]
      ],
      footer: ["VERSION 0.4", "HTML / CSS / JS", "RESIDUAL HEAT MODE"],
      entriesLabel: "ARCHIVE ENTRIES",
      entriesNote:
        "More scar, more memory, more retained heat within the same system shell.",
      entries: [
        {
          code: "M_01",
          type: "residue",
          year: "2026",
          title: "Inner Burn",
          description:
            "A denser central body with signal accents that behave like evidence of pressure.",
          metaLeft: "heat medium",
          metaRight: "state warm"
        },
        {
          code: "M_02",
          type: "fragment",
          year: "2026",
          title: "Scar Plate",
          description:
            "A dark visual field interrupted by selective warmth and concentrated particulate matter.",
          metaLeft: "signal active",
          metaRight: "phase open"
        },
        {
          code: "M_03",
          type: "study",
          year: "2026",
          title: "Residual Archive",
          description:
            "The archive as something that keeps glowing after the event has passed.",
          metaLeft: "tone residual",
          metaRight: "logic evidence"
        }
      ],
      annotations: [
        {
          index: "[01]",
          tag: "EMBER / LOW GLOW",
          copy: "Central region holds more thermal pressure and denser connective matter.",
          x: 72,
          y: 16
        },
        {
          index: "[02]",
          tag: "TRACE / SCARRED",
          copy: "Warm nodes appear as remnants, not ornaments.",
          x: 9,
          y: 43
        },
        {
          index: "[03]",
          tag: "DRIFT / 0.09°",
          copy: "Residual motion maintains a living burn inside the plate.",
          x: 69,
          y: 78
        }
      ],
      visual: {
        seed: 3,
        density: 26,
        layers: 42,
        pulse: 0.2,
        lineAlpha: 0.18,
        signalAlpha: 0.3,
        nodeScale: 1.06,
        meshOpacity: 0.14,
        coreScaleX: 0.86,
        coreScaleY: 1.1
      }
    }
  ]
};
