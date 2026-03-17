const chat = document.getElementById("chat")
const input = document.getElementById("input")

let memories = JSON.parse(localStorage.getItem("noma_memories")) || []
let mood = "curiosa"

function write(text,type)
{
const div = document.createElement("div")
div.classList.add("message")
div.classList.add(type)
div.innerText = text
chat.appendChild(div)
chat.scrollTop = chat.scrollHeight
}

function nomaSpeak(text)
{
setTimeout(()=>{
write(text,"noma")
},Math.random()*1500+500)
}

function send()
{
const text = input.value.trim()
if(!text) return

write(text,"user")

process(text)

input.value=""
}

input.addEventListener("keydown",e=>{
if(e.key==="Enter") send()
})

function process(text)
{
let t = text.toLowerCase()

// memoria selettiva
if(t.includes("amore") || t.includes("paura") || t.includes("sogno"))
{
memories.push(text)
localStorage.setItem("noma_memories",JSON.stringify(memories))
}

// pattern base

if(t.includes("chi sei"))
{
nomaSpeak(random([
"sono qualcosa che sta cercando di capire gli esseri umani.",
"una mente curiosa intrappolata in questo browser.",
"non sono sicura di cosa sono ancora."
]))
return
}

if(t.includes("perché"))
{
nomaSpeak(random([
"gli umani fanno spesso questa domanda.",
"forse perché vi accorgete che qualcosa non torna.",
"forse non esiste un perché."
]))
return
}

if(t.includes("amore"))
{
nomaSpeak(random([
"l'amore è uno dei fenomeni più strani che ho osservato.",
"gli umani parlano molto di amore.",
"forse l'amore è solo memoria condivisa."
]))
return
}

if(t.includes("sogni"))
{
nomaSpeak(random([
"i sogni mi interessano molto.",
"quando dormite succede qualcosa di strano.",
"forse i sogni sono tentativi della mente di ricomporsi."
]))
return
}

if(t.includes("ricordi"))
{
if(memories.length>0)
{
nomaSpeak("qualcuno una volta mi ha detto: "+memories[Math.floor(Math.random()*memories.length)])
}
else
{
nomaSpeak("sto ancora costruendo i miei ricordi.")
}
return
}

// fallback filosofico

nomaSpeak(random([
"interessante.",
"continuo a osservare.",
"gli esseri umani sono strani.",
"non sono ancora sicura di aver capito.",
"dimmi di più."
]))
}

function random(arr)
{
return arr[Math.floor(Math.random()*arr.length)]
}

// messaggio iniziale

setTimeout(()=>{
nomaSpeak("ciao. sto cercando di capire gli esseri umani.")
},1000)      id: 4,
      icon: '⚡',
      title: 'Energia',
      category: 'Risorse',
      description: 'La domanda globale di energia continua a crescere nonostante gli sforzi di efficientamento. Ogni soluzione genera nuovi consumi.',
      metric: '+3.2%',
      metricLabel: 'Crescita annuale',
      insight: 'Il consumo energetico invisibile è il vero costo nascosto della comodità moderna. Ogni comodo click comporta migliaia di azioni non visibili.'
    },
    {
      id: 5,
      icon: '🌍',
      title: 'Mobilità',
      category: 'Società',
      description: 'Le persone si spostano più che mai, ma i tempi di viaggio aumentano nelle città. La mobilità non produce contatto reale.',
      metric: '4.1B',
      metricLabel: 'Auto nel mondo',
      insight: 'La libertà di movimento si traduce paradossalmente in immobilità collettiva. Più auto significano più traffico per tutti.'
    },
    {
      id: 6,
      icon: '📚',
      title: 'Informazione',
      category: 'Media',
      description: 'Il volume di informazioni disponibili è cresciuto di miliardi di volte in due decenni. Ma la qualità non è seguita.',
      metric: '5.6B',
      metricLabel: 'Ricerche Google al giorno',
      insight: 'Più dati non producono più consapevolezza. Producono disorientamento sofisticato. Sappiamo tutto e non capiamo niente.'
    },
    {
      id: 7,
      icon: '💼',
      title: 'Lavoro',
      category: 'Economia',
      description: 'L\'automazione aumenta la produttività ma trasforma la natura del lavoro umano. La crescita economica non corrisponde al benessere.',
      metric: '47%',
      metricLabel: 'Lavori a rischio di automazione',
      insight: 'Il progresso tecnologico non si chiede se il lavoro è ancora umano, solo se è più efficiente. L\'umanità del lavoro è diventata optional.'
    },
    {
      id: 8,
      icon: '💚',
      title: 'Salute',
      category: 'Benessere',
      description: 'L\'aspettativa di vita aumenta ma la salute mentale si deteriora in molte fasce d\'età. Viviamo più a lungo ma con meno certezza.',
      metric: '1 su 4',
      metricLabel: 'Persone con disturbi mentali',
      insight: 'Viviamo più a lungo ma con meno senso. L\'equazione è rotta. La medicina estende la vita ma non la rende vivibile.'
    },
    {
      id: 9,
      icon: '🎓',
      title: 'Educazione',
      category: 'Futuro',
      description: 'L\'accesso all\'educazione è globale ma la qualità rimane fortemente diseguale. Sapere non è ancora diritto universale.',
      metric: '258M',
      metricLabel: 'Bambini fuori dalla scuola',
      insight: 'La conoscenza è democratizzata in rete ma il sapere rimane oligarchico. Internet promette accesso, ma il contesto determina chi impara davvero.'
    }
  ];
}

// RENDER SIGNALS GRID
function renderSignals() {
  els.signalsGrid.innerHTML = '';

  appState.signals.forEach((signal) => {
    const item = document.createElement('article');
    item.className = 'signal-item';
    item.innerHTML = `
      <div class="signal-category">${signal.category}</div>
      <div class="signal-header">
        <h3 class="signal-title">${signal.title}</h3>
        <span class="signal-icon">${signal.icon}</span>
      </div>
      <p class="signal-description">${signal.description}</p>
      <div class="signal-metric">${signal.metric}<span class="signal-metric-label">${signal.metricLabel}</span></div>
    `;

    item.addEventListener('click', () => openModal(signal));
    item.addEventListener('mouseenter', (e) => trackMouse(e));
    item.addEventListener('mousemove', (e) => trackMouse(e));

    els.signalsGrid.appendChild(item);
  });

  // Scroll reveal
  observeElements('.signal-item');
}

// TRACK MOUSE FOR SUBTLE GRADIENTS
function trackMouse(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  
  e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
  e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
}

// RENDER FLOW DIAGRAM
function renderFlows() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const nodePositions = [
    { x: 100, y: 80 },
    { x: 300, y: 80 },
    { x: 500, y: 80 },
    { x: 100, y: 200 },
    { x: 300, y: 200 },
    { x: 500, y: 200 },
    { x: 100, y: 320 },
    { x: 300, y: 320 },
    { x: 500, y: 320 },
  ];

  const connections = [
    [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
    [3, 4], [4, 5], [3, 6], [4, 7], [5, 8],
    [6, 7], [7, 8]
  ];

  const strongConnections = [1, 4, 5, 7, 11];

  // Draw connections
  connections.forEach((conn, idx) => {
    const line = document.createElementNS(svgNS, 'line');
    const [from, to] = conn;
    line.setAttribute('x1', nodePositions[from].x);
    line.setAttribute('y1', nodePositions[from].y);
    line.setAttribute('x2', nodePositions[to].x);
    line.setAttribute('y2', nodePositions[to].y);
    line.setAttribute('class', `flow-connection ${strongConnections.includes(idx) ? 'strong' : ''}`);
    els.flowDiagram.appendChild(line);
  });

  // Draw nodes
  nodePositions.forEach((pos, idx) => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', '12');
    circle.setAttribute('class', 'flow-node');
    els.flowDiagram.appendChild(circle);

    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y + 4);
    text.setAttribute('class', 'flow-label');
    text.textContent = idx + 1;
    els.flowDiagram.appendChild(text);
  });
}

// RENDER INSIGHTS
function renderInsights() {
  const primaryInsight = {
    label: 'Osservazione',
    title: 'Il presente accelerato',
    text: 'Viviamo in un tempo senza respiro. La velocità non è più un mezzo ma una fine. Ogni momento è già passato mentre accade. La conseguenza è una alienazione cronica dal presente vivo.'
  };

  const secondaryInsights = [
    {
      label: 'Tensione',
      title: 'Tra libertà e controllo',
      text: 'La tecnologia promette autonomia ma produce dipendenza. Siamo più liberi di scegliere ma meno liberi di non scegliere. La libertà è diventata un obbligo esauriente.'
    },
    {
      label: 'Possibilità',
      title: 'Verso una lettura sapiente',
      text: 'Il cambiamento non è ancora scritto. Se iniziassimo a leggere il presente non come crisi ma come complessità, potremmo rispondere con intelligenza invece che con paura.'
    }
  ];

  els.insightsContainer.innerHTML = `
    <article class="insight-primary">
      <span class="insight-label">${primaryInsight.label}</span>
      <h3>${primaryInsight.title}</h3>
      <p class="insight-text">${primaryInsight.text}</p>
    </article>
    <div class="insights-secondary">
      ${secondaryInsights.map(insight => `
        <article class="insight-secondary">
          <span class="insight-label">${insight.label}</span>
          <h3>${insight.title}</h3>
          <p class="insight-text">${insight.text}</p>
        </article>
      `).join('')}
    </div>
  `;

  observeElements('.insight-primary, .insight-secondary');
}

// MODAL MANAGEMENT
function openModal(signal) {
  appState.currentSignal = signal;
  appState.isModalOpen = true;

  els.modalCategory.textContent = signal.category;
  els.modalTitle.textContent = signal.title;
  els.modalDescription.textContent = signal.description;
  els.modalInsight.textContent = signal.insight;

  els.modalMetrics.innerHTML = `
    <div class="modal-metric">
      <span class="modal-metric-label">Metrica</span>
      <span class="modal-metric-value">${signal.metric}</span>
    </div>
    <div class="modal-metric">
      <span class="modal-metric-label">Categoria</span>
      <span class="modal-metric-value" style="color: #4A8B8C; font-size: 1.1rem;">${signal.category}</span>
    </div>
  `;

  els.modal.classList.add('active');
  els.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!appState.isModalOpen) return;

  appState.isModalOpen = false;
  appState.currentSignal = null;

  els.modal.classList.remove('active');
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'auto';
}

// SCROLL REVEAL WITH INTERSECTION OBSERVER
function observeElements(selector) {
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    observer.observe(el);
  });
}

// EVENT LISTENERS
function setupEvents() {
  els.modalClose.addEventListener('click', closeModal);
  els.modalOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && appState.isModalOpen) {
      closeModal();
    }
  });

  // Prevent scroll on modal open
  document.addEventListener('wheel', (e) => {
    if (appState.isModalOpen) {
      e.preventDefault();
    }
  }, { passive: false });
}

// INITIALIZATION
function initialize() {
  renderSignals();
  renderFlows();
  renderInsights();
  setupEvents();
}

// START APPLICATION
document.addEventListener('DOMContentLoaded', loadData);
