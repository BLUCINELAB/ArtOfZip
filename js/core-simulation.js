/*
  Core Simulation
  Contiene PRNG deterministico, seed da coordinate, palette, mappe temporali
  e frasi fossili. Tutto viene esposto sotto window.PsychoCore.
*/

(function () {
  "use strict";

  const DEPTHS = {
    quaternario: {
      label: "Quaternario",
      age: "0.0—2.6 Ma",
      density: 0.76,
      compression: 0.86,
      fossilChance: 0.34,
      seedOffset: 101
    },
    cretaceo: {
      label: "Cretaceo",
      age: "66—145 Ma",
      density: 1.05,
      compression: 1.12,
      fossilChance: 0.48,
      seedOffset: 271
    },
    archeano: {
      label: "Archeano",
      age: "2.5—4.0 Ga",
      density: 1.28,
      compression: 1.36,
      fossilChance: 0.62,
      seedOffset: 809
    }
  };

  const mineralPalette = [
    "#d4c5b9",
    "#c4b5a8",
    "#b79d8b",
    "#a89080",
    "#8c6e5d",
    "#755443",
    "#5c3d2e",
    "#3f3028",
    "#e1d4bd",
    "#9f8976"
  ];

  const coreLayerPalettes = {
    argilla: ["#d4c5b9", "#c4b0a4", "#a89080"],
    sabbia: ["#e1d4bd", "#d8c59c", "#bc9d6e"],
    ghiaia: ["#8c6e5d", "#6f5b52", "#b9a99a"],
    lignite: ["#3d3029", "#251e1b", "#5c3d2e"],
    calcite: ["#eee3d1", "#d5c7b4", "#b2a390"],
    ossidiana: ["#1e1a18", "#302722", "#5c3d2e"],
    cenere: ["#a8a19a", "#8f8780", "#6e675f"]
  };

  const thinSectionPalette = [
    "#ff2d2d",
    "#ff6b35",
    "#ffd23f",
    "#4ecdc4",
    "#6c5ce7",
    "#a29bfe",
    "#f72585",
    "#2ec4b6",
    "#ff9f1c",
    "#b8f2e6"
  ];

  const minerals = [
    "quarzo",
    "feldspato",
    "mica",
    "olivina",
    "calcite",
    "pirite",
    "granato",
    "zircone",
    "ematite",
    "clorite"
  ];

  const concepts = [
    "intuizione",
    "dubbio",
    "codice",
    "silenzio",
    "struttura",
    "caos",
    "memoria",
    "attesa",
    "errore",
    "visione",
    "montaggio",
    "respiro"
  ];

  const emotions = [
    "malinconia",
    "urgenza",
    "quiete",
    "vertigine",
    "stupore",
    "noia",
    "fame",
    "pressione",
    "lucidità",
    "sonno",
    "attrito"
  ];

  const fossilMarks = ["", "⊙", "⌁", "∴", "◌", "⟡", "⌬", "⋯", "◇", "∵"];

  function mulberry32(seed) {
    let t = seed >>> 0;

    return function random() {
      t += 0x6D2B79F5;
      let x = t;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(value) {
    let hash = 2166136261;

    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function seedFromCoordinates(x, y, depthName, scaleName) {
    const depth = DEPTHS[depthName] || DEPTHS.quaternario;
    const base = `${Math.round(x)}:${Math.round(y)}:${depthName}:${scaleName}`;
    return (hashString(base) + depth.seedOffset) >>> 0;
  }

  function pick(random, array) {
    return array[Math.floor(random() * array.length) % array.length];
  }

  function range(random, min, max) {
    return min + random() * (max - min);
  }

  function intRange(random, min, max) {
    return Math.floor(range(random, min, max + 1));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mapCoordinatesToTemporalDepth(x, y, width, height, depthName, scaleName) {
    const nx = clamp(x / Math.max(width, 1), 0, 1);
    const ny = clamp(y / Math.max(height, 1), 0, 1);

    let temporal = nx * 0.64 + (1 - ny) * 0.36;
    let semanticDensity = ny * 0.7 + Math.abs(nx - 0.5) * 0.3;

    if (scaleName === "emotiva") {
      temporal = Math.pow(temporal, 0.65);
      semanticDensity = 0.45 + Math.sin(nx * Math.PI) * 0.4;
    }

    if (scaleName === "caotica") {
      temporal = Math.abs(Math.sin((nx * 7.13 + ny * 3.77) * Math.PI));
      semanticDensity = Math.abs(Math.cos((ny * 5.2 - nx * 1.9) * Math.PI));
    }

    const depth = DEPTHS[depthName] || DEPTHS.quaternario;

    return {
      temporal,
      semanticDensity,
      layerCount: Math.round(6 + temporal * 3 + semanticDensity * 4 + depth.density * 2),
      compression: depth.compression,
      fossilChance: depth.fossilChance + semanticDensity * 0.14,
      label: depth.label,
      age: depth.age
    };
  }

  function fossilPhrase(seed) {
    const random = mulberry32(seed);
    const mineral = pick(random, minerals);
    const concept = pick(random, concepts);
    const emotion = pick(random, emotions);

    const templates = [
      `${mineral} di ${concept} in matrice di ${emotion}`,
      `microfrattura di ${concept} riempita da ${mineral}`,
      `inclusione opaca: ${emotion} compressa in ${concept}`,
      `fenocristallo di ${concept} con bordi di ${emotion}`,
      `lamina di ${mineral} attraversata da ${concept}`,
      `fossile guida: ${concept} sotto pressione di ${emotion}`
    ];

    return pick(random, templates);
  }

  function patternFor(name) {
    const encoded = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <filter id="n">
          <feTurbulence type="fractalNoise" baseFrequency="${name === "sabbia" ? 0.95 : 0.58}" numOctaves="${name === "ghiaia" ? 2 : 4}" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="64" height="64" filter="url(#n)" opacity="0.42"/>
        <path d="M0 ${12 + name.length} C18 3, 29 28, 64 11 M0 ${38 - name.length} C18 48, 44 26, 64 43" stroke="black" stroke-opacity="0.20" fill="none" stroke-width="1"/>
      </svg>
    `);

    return `url("data:image/svg+xml,${encoded}")`;
  }

  window.PsychoCore = {
    DEPTHS,
    mineralPalette,
    coreLayerPalettes,
    thinSectionPalette,
    minerals,
    concepts,
    emotions,
    fossilMarks,
    mulberry32,
    hashString,
    seedFromCoordinates,
    pick,
    range,
    intRange,
    clamp,
    mapCoordinatesToTemporalDepth,
    fossilPhrase,
    patternFor
  };
})();
