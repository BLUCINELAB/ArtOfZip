window.SpecimenContent = {
  modes: [
    {
      id: "quiet",
      label: "QUIET MODE",
      themeClass: "theme-quiet",
      year: "2026",
      field: "FIELD_03",
      state: "OBSERVATION",
      eyebrow: "ARCHIVE / FIELD / SPECIMEN",
      title: ["A quiet", "exhibition", "system."],
      text:
        "A public test space for traces, studies, fragments and measured atmospheres. Not a portfolio. A living curatorial field.",
      sideIndexTitle: "INDEX",
      sideIndex: [
        "01 / specimen field",
        "02 / annotation drift",
        "03 / archive state",
        "04 / spatial residue",
        "05 / reading protocol"
      ],
      sideSpecTitle: "SPEC",
      sideSpec: [
        "mode: quiet",
        "density: low",
        "motion: subtle",
        "behavior: observational"
      ],
      notesLabel: "READING NOTES",
      notesText:
        "The page behaves like an exhibition plate. Elements do not explain the work, they frame a way of reading it.",
      coordinatesLabel: "COORDINATES",
      coordinates: [
        "X: 118.24 / Y: 08.93",
        "STATE: ARCHIVE",
        "MODE: QUIET"
      ],
      microGrid: [
        ["density", "0.42"],
        ["drift", "0.08"],
        ["noise", "0.02"],
        ["state", "stable"]
      ],
      boardLabels: ["AXIS / Y", "FIELD / CENTRAL", "ANNOTATION / ACTIVE"],
      footer: ["VERSION 0.3", "HTML / CSS / JS", "PUBLIC TEST FIELD"],
      noteItems: [
        { index: "[01]", text: "SPECIMEN / DORMANT" },
        { index: "[02]", text: "TRACE / RETAINED" },
        { index: "[03]", text: "DRIFT / 0.08°" }
      ],
      markers: [
        { x: 30, y: 31 },
        { x: 56, y: 49 },
        { x: 43, y: 66 }
      ],
      mesh: {
        pointsX: 21,
        pointsY: 32,
        jitter: 10,
        drift: 10,
        pulse: 0.18,
        nodeScale: 1.0,
        lineAlpha: 0.22,
        secondaryAlpha: 0.12,
        accentAlpha: 0.05,
        clusters: [
          { x: 0.50, y: 0.24, radius: 0.13, strength: 1.1 },
          { x: 0.47, y: 0.54, radius: 0.19, strength: 0.95 },
          { x: 0.55, y: 0.79, radius: 0.15, strength: 1.05 }
        ]
      }
    },
    {
      id: "sumi",
      label: "SUMI MODE",
      themeClass: "theme-sumi",
      year: "2026",
      field: "FIELD_04",
      state: "SUSPENSION",
      eyebrow: "MA / TRACE / APPARATUS",
      title: ["A measured", "field of", "intervals."],
      text:
        "More silence, more spacing, less declaration. The interface behaves like a suspended notation surface.",
      sideIndexTitle: "INDEX",
      sideIndex: [
        "01 / void interval",
        "02 / subtle node",
        "03 / suspended line",
        "04 / pale structure",
        "05 / reading pause"
      ],
      sideSpecTitle: "SPEC",
      sideSpec: [
        "mode: sumi",
        "density: rarefied",
        "motion: almost still",
        "behavior: meditative"
      ],
      notesLabel: "READING NOTES",
      notesText:
        "Space is not empty here. It is measured reserve. The form appears through restraint, not through saturation.",
      coordinatesLabel: "COORDINATES",
      coordinates: [
        "X: 084.11 / Y: 17.02",
        "STATE: SUSPENDED",
        "MODE: SUMI"
      ],
      microGrid: [
        ["density", "0.28"],
        ["drift", "0.05"],
        ["noise", "0.01"],
        ["state", "held"]
      ],
      boardLabels: ["VERTICAL / TRACE", "FIELD / INTERVAL", "NOTE / LOW SIGNAL"],
      footer: ["VERSION 0.3", "MA / TRACE / JS", "SILENT CURATORIAL MODE"],
      noteItems: [
        { index: "[01]", text: "RESERVE / ACTIVE" },
        { index: "[02]", text: "FIELD / PAUSED" },
        { index: "[03]", text: "DRIFT / 0.05°" }
      ],
      markers: [
        { x: 35, y: 28 },
        { x: 55, y: 47 },
        { x: 49, y: 71 }
      ],
      mesh: {
        pointsX: 18,
        pointsY: 28,
        jitter: 7,
        drift: 7,
        pulse: 0.11,
        nodeScale: 0.85,
        lineAlpha: 0.18,
        secondaryAlpha: 0.08,
        accentAlpha: 0.03,
        clusters: [
          { x: 0.51, y: 0.23, radius: 0.11, strength: 0.9 },
          { x: 0.48, y: 0.56, radius: 0.16, strength: 0.8 },
          { x: 0.53, y: 0.80, radius: 0.12, strength: 0.88 }
        ]
      }
    },
    {
      id: "ember",
      label: "EMBER MODE",
      themeClass: "theme-ember",
      year: "2026",
      field: "FIELD_05",
      state: "HEAT TRACE",
      eyebrow: "ARCHIVE / SCAR / EMBER",
      title: ["A dark", "curatorial", "residue."],
      text:
        "A restrained surface with an inner burn. Not spectacle, but a retained thermal memory within the archive.",
      sideIndexTitle: "INDEX",
      sideIndex: [
        "01 / ember trace",
        "02 / thermal residue",
        "03 / retained cluster",
        "04 / dark plate",
        "05 / evidence line"
      ],
      sideSpecTitle: "SPEC",
      sideSpec: [
        "mode: ember",
        "density: medium",
        "motion: latent",
        "behavior: residual"
      ],
      notesLabel: "READING NOTES",
      notesText:
        "The system keeps a small wound open. Warmth is used as evidence, not decoration.",
      coordinatesLabel: "COORDINATES",
      coordinates: [
        "X: 126.91 / Y: 09.44",
        "STATE: RESIDUAL",
        "MODE: EMBER"
      ],
      microGrid: [
        ["density", "0.51"],
        ["drift", "0.09"],
        ["noise", "0.03"],
        ["state", "warm"]
      ],
      boardLabels: ["THERMAL / Y", "FIELD / RESIDUE", "ANNOTATION / EMBER"],
      footer: ["VERSION 0.3", "HTML / CSS / JS", "RESIDUAL HEAT MODE"],
      noteItems: [
        { index: "[01]", text: "EMBER / LOW GLOW" },
        { index: "[02]", text: "TRACE / SCARRED" },
        { index: "[03]", text: "DRIFT / 0.09°" }
      ],
      markers: [
        { x: 31, y: 33 },
        { x: 57, y: 51 },
        { x: 44, y: 69 }
      ],
      mesh: {
        pointsX: 20,
        pointsY: 30,
        jitter: 9,
        drift: 9,
        pulse: 0.2,
        nodeScale: 1.05,
        lineAlpha: 0.24,
        secondaryAlpha: 0.13,
        accentAlpha: 0.07,
        clusters: [
          { x: 0.50, y: 0.24, radius: 0.12, strength: 1.15 },
          { x: 0.47, y: 0.55, radius: 0.18, strength: 1.0 },
          { x: 0.54, y: 0.80, radius: 0.14, strength: 1.1 }
        ]
      }
    }
  ]
};
