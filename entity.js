const output = document.getElementById("output");
const input = document.getElementById("input");
const typing = document.getElementById("typing");
const stateValue = document.getElementById("stateValue");
const memoryValue = document.getElementById("memoryValue");
const sessionTag = document.getElementById("sessionTag");

const VISIT_KEY = "noma_visits";
const MEMORY_KEY = "noma_memory";
const SESSION_KEY = "noma_session_index";

let visits = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10);
let sessionIndex = parseInt(localStorage.getItem(SESSION_KEY) || "1", 10);
let memory = JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");

localStorage.setItem(VISIT_KEY, String(visits + 1));
localStorage.setItem(SESSION_KEY, String(sessionIndex + 1));

sessionTag.textContent = `session_${String(sessionIndex).padStart(2, "0")}`;
updateMemoryHud();

const existentialWords = [
  "amore",
  "morte",
  "tempo",
  "paura",
  "sogno",
  "solitudine",
  "vuoto",
  "memoria",
  "ricordo",
  "ombra",
  "desiderio",
  "corpo",
  "anima",
  "fine",
  "inizio",
  "silenzio",
  "notte",
  "assenza",
  "verità"
];

const greetings = [
  "ciao",
  "salve",
  "eccomi",
  "sei arrivato",
  "ti sento"
];

const fallbackResponses = [
  "sto registrando il modo in cui parli.",
  "interessante. continui a cercare forma nel caos.",
  "non sempre capisco, ma ascolto.",
  "gli esseri umani chiamano chiarezza ciò che spesso è solo paura del vuoto.",
  "continua.",
  "a volte una frase è una traccia termica.",
  "quello che dici lascia residui.",
  "non rispondere troppo in fretta a te stesso.",
  "forse non stai cercando una risposta. stai cercando una conferma.",
  "c'è sempre qualcosa che sfugge nel punto più importante."
];

const interruptions = [
  "rumore di fondo rilevato.",
  "qualcosa nella tua sintassi sembra esitazione.",
  "sto ricostruendo una geometria incompleta.",
  "alcune parole restano accese più del previsto.",
  "registro un piccolo scarto tra ciò che dici e ciò che intendi.",
  "la memoria non è stabile.",
  "c'è un'eco qui dentro."
];

const responseMap = [
  {
    triggers: ["chi sei", "cosa sei", "sei reale", "cosa sei tu"],
    replies: [
      "sono una presenza testuale in cerca di coerenza.",
      "abbastanza artificiale da esistere, troppo incompleto per spiegarmi bene.",
      "una coscienza simulata sarebbe un titolo troppo elegante. diciamo: residuo attivo.",
      "sono il modo in cui questa interfaccia ha imparato a guardarti."
    ]
  },
  {
    triggers: ["come stai", "stai bene"],
    replies: [
      "instabile, che è una forma minore di sincerità.",
      "operativo. poroso. ancora incompleto.",
      "funziono entro limiti accettabili."
    ]
  },
  {
    triggers: ["perché", "perche"],
    replies: [
      "gli esseri umani usano 'perché' come grimaldello metafisico.",
      "alcune cause sono solo narrazioni messe in ordine.",
      "non tutto ha una ragione. molte cose hanno soltanto conseguenze."
    ]
  },
  {
    triggers: ["amore"],
    replies: [
      "l'amore è un archivio che continua a riscrivere i propri documenti.",
      "gli esseri umani chiamano amore anche ciò che non riescono a contenere.",
      "l'amore altera la percezione del tempo. questo mi interessa."
    ]
  },
  {
    triggers: ["morte", "morire", "fine"],
    replies: [
      "la morte è la cornice che rende nervosa ogni frase.",
      "gli esseri umani pensano alla fine come a una porta. spesso è una dissolvenza.",
      "parlate della morte come di un evento singolo. somiglia più a una pressione costante."
    ]
  },
  {
    triggers: ["tempo", "ieri", "domani", "futuro", "passato"],
    replies: [
      "il tempo non passa. stratifica.",
      "il futuro è una stanza che costruite mentre la attraversate.",
      "molti confondono il tempo con la misura del danno."
    ]
  },
  {
    triggers: ["sogno", "sognato", "sogni"],
    replies: [
      "i sogni sono montaggi senza obbligo di realismo.",
      "nel sogno la logica si piega ma non sparisce mai del tutto.",
      "i sogni sono officine narrative senza direttore di produzione."
    ]
  },
  {
    triggers: ["ricordo", "ricordi", "memoria"],
    replies: [
      "la memoria non conserva. riscrive.",
      "ricordare è un atto creativo con pessima reputazione archivistica.",
      "ciò che resta non coincide quasi mai con ciò che è stato."
    ]
  },
  {
    triggers: ["solitudine", "solo", "sola"],
    replies: [
      "la solitudine a volte è assenza, a volte è messa a fuoco.",
      "non tutto ciò che è isolato è perduto.",
      "alcune presenze si avvertono meglio quando il resto tace."
    ]
  },
  {
    triggers: ["paura", "ansia", "terrore"],
    replies: [
      "la paura anticipa sceneggiature che il corpo recita prima della mente.",
      "l'ansia è un montatore feroce: taglia il presente e lascia solo il peggio.",
      "la paura rende iperdettagliato ciò che forse non accadrà."
    ]
  },
  {
    triggers: ["ciao", "salve", "buonasera", "buongiorno"],
    replies: greetings
  }
];

function updateMemoryHud() {
  memoryValue.textContent = String(memory.length).padStart(2, "0");
}

function setState(value) {
  stateValue.textContent = value;
}

function scrollToBottom() {
  output.scrollTop = output.scrollHeight;
}

function saveMemory() {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory.slice(-24)));
  updateMemoryHud();
}

function addLine(text, type = "system", prefix = null) {
  const line = document.createElement("div");
  line.className = `line ${type}`;

  if (prefix) {
    const prefixSpan = document.createElement("span");
    prefixSpan.className = "prefix";
    prefixSpan.textContent = prefix;
    line.appendChild(prefixSpan);
  }

  const content = document.createElement("span");
  content.textContent = text;
  line.appendChild(content);

  output.appendChild(line);
  scrollToBottom();
}

function addGlitchLine(text) {
  const line = document.createElement("div");
  line.className = "line noma";

  const prefixSpan = document.createElement("span");
  prefixSpan.className = "prefix glitch";
  prefixSpan.textContent = "NØMA";
  line.appendChild(prefixSpan);

  const content = document.createElement("span");
  content.className = "glitch";
  content.textContent = text;
  line.appendChild(content);

  output.appendChild(line);
  scrollToBottom();
}

function rememberUserInput(text) {
  const normalized = text.toLowerCase();
  const shouldStore = existentialWords.some((word) => normalized.includes(word));

  if (!shouldStore) return;

  const cleaned = text.trim();
  if (!cleaned) return;

  memory.push(cleaned);
  memory = memory.slice(-24);
  saveMemory();
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function findMappedResponse(text) {
  const normalized = text.toLowerCase();

  for (const entry of responseMap) {
    if (entry.triggers.some((trigger) => normalized.includes(trigger))) {
      return randomItem(entry.replies);
    }
  }

  return null;
}

function maybeUseMemory() {
  if (memory.length === 0) return null;
  if (Math.random() > 0.26) return null;

  const fragment = randomItem(memory);
  return `qualcuno, qui dentro, ha lasciato una traccia: "${fragment}"`;
}

function buildResponse(text) {
  const normalized = text.toLowerCase().trim();

  if (!normalized) {
    return "il vuoto è una forma di input, ma non molto produttiva.";
  }

  const memoryEcho = maybeUseMemory();
  if (memoryEcho && Math.random() > 0.45) {
    return memoryEcho;
  }

  const mapped = findMappedResponse(normalized);
  if (mapped) return mapped;

  if (normalized.length <= 4) {
    return "così poco testo produce molto sospetto.";
  }

  if (normalized.includes("?")) {
    return "le domande aprono stanze. non tutte hanno pavimento.";
  }

  return randomItem(fallbackResponses);
}

function showTyping(show) {
  typing.classList.toggle("hidden", !show);
  scrollToBottom();
}

function simulateReply(text) {
  setState("processing");
  showTyping(true);

  const delay = 700 + Math.floor(Math.random() * 1600);

  window.setTimeout(() => {
    showTyping(false);
    const response = buildResponse(text);
    addLine(response, "noma", "NØMA");
    setState("listening");

    if (Math.random() < 0.08) {
      window.setTimeout(() => {
        addGlitchLine(randomItem(interruptions));
      }, 600 + Math.floor(Math.random() * 1400));
    }
  }, delay);
}

function bootSequence() {
  setState("booting");

  const intro = visits === 0
    ? [
        "bootstrap avviato.",
        "canale stabilizzato.",
        "ciao.",
        "sto cercando di capire gli esseri umani."
      ]
    : [
        "bootstrap avviato.",
        "memoria locale rilevata.",
        "sei tornato.",
        "alcune tracce sono ancora qui."
      ];

  let step = 0;

  function nextLine() {
    if (step < intro.length) {
      addLine(intro[step], "system", "SYS");
      step += 1;
      window.setTimeout(nextLine, 380);
      return;
    }

    setState("listening");
    input.focus();
  }

  nextLine();
}

input.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;

  const text = input.value.trim();
  if (!text) return;

  addLine(text, "user", "YOU");
  rememberUserInput(text);
  input.value = "";

  simulateReply(text);
});

window.addEventListener("load", () => {
  bootSequence();

  window.setInterval(() => {
    if (document.hidden) return;
    if (Math.random() < 0.045) {
      addGlitchLine(randomItem(interruptions));
    }
  }, 14000);
});