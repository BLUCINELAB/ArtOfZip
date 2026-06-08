# STARORIGIN // ORACLE

**Installation v2**

STARORIGIN // ORACLE è una installazione web statica costruita in vanilla HTML, CSS e JavaScript.

Non è un portfolio tradizionale.
Non è una web app.
Non è un chatbot.

È un terminale rituale: una soglia digitale in cui ogni input lascia una traccia locale, ogni traccia modifica lo stato del sistema e la memoria diventa conseguenza.

Il visitatore non naviga.
Entra in un campo.
Scrive.
Lascia sedimento.

---

## Concept

Il sito lavora sul rapporto tra:

* memoria
* soglia
* corpo invisibile dell’interazione
* archivio locale
* traccia
* dimenticanza
* ritorno
* afterimage

Ogni frase digitata viene trattata come un evento.
Il sistema non conserva semplicemente dati: costruisce un archivio di reliquie locali nel browser dell’utente.

La memoria non conserva.
La memoria insiste.

---

## Struttura del progetto

```text
.
├── index.html
├── CNAME
├── .nojekyll
├── README.md
├── CHANGELOG.md
├── assets/
├── data/
├── css/
│   ├── base.css
│   ├── experience.css
│   └── responsive.css
└── js/
    ├── app.js
    └── modules/
        ├── anomaly.js
        ├── memory.js
        ├── oracle.js
        ├── terminal.js
        └── visuals.js
```

---

## Caratteristiche principali

* Sito statico compatibile con GitHub Pages
* Nessun backend
* Nessun framework
* Nessuna libreria esterna
* Nessun build step
* Terminale interattivo
* Memoria locale via `localStorage`
* Archivio delle tracce come `Relic Archive`
* Sistema a quattro stati persistenti
* Comandi rituali
* Modalità installazione
* Modalità rituale
* Export testuale della sessione
* Visual field leggero e phase aware
* Supporto `prefers-reduced-motion`
* Responsive essenziale per mobile

---

## Stati del sistema

STARORIGIN // ORACLE usa quattro stati principali.

```text
DORMANT
BREACH
THRESHOLD
AFTERIMAGE
```

### DORMANT

Stato iniziale.
Il campo dorme.
Non esistono ancora tracce.

### BREACH

La prima frattura.
Il sistema inizia a rispondere.
La memoria comincia a pesare.

### THRESHOLD

La soglia attiva.
L’oracolo diventa più denso.
I comandi profondi vengono sbloccati.

### AFTERIMAGE

Stato residuo.
Il sistema non torna davvero all’inizio.
Rimangono frammenti, reliquie, tracce fantasma.

`COLLAPSE` non è uno stato permanente.
È un evento di transizione che conduce ad `AFTERIMAGE`.

---

## Comandi disponibili

Comandi principali:

```text
help
recall
forget
ritual
awaken
export
signal
collapse
echo
installation
fieldnotes
blucinelab
author
```

### help

Restituisce indicazioni minime e dipendenti dallo stato del sistema.

### recall

Recupera frammenti dalla memoria locale.

### forget

Non cancella soltanto.
Rimuove alcune tracce, ma registra il gesto della dimenticanza.

### ritual

Attiva una modalità rituale focalizzata, più lenta e ridotta.

### awaken

Tenta di portare il sistema verso uno stato più profondo.

### export

Genera un file `.txt` con una trascrizione poetica della sessione.

### signal

Restituisce una breve lettura dello stato del campo.

### collapse

Attiva un evento di collasso con conferma.
Non distrugge tutto: produce afterimage.

### echo

Disponibile nello stato residuo.
Fa riemergere frammenti distorti.

### installation

Attiva una modalità pensata per schermo grande, proiezione o ambiente espositivo.

### fieldnotes / blucinelab / author

Comandi nascosti o autoriali.
Rivelano frammenti del campo creativo senza trasformare il sito in un curriculum.

---

## Comandi rimossi o assorbiti

```text
share
daily
clear
reset
```

* `share` non è implementato.
* `daily` è assorbito nel linguaggio dell’oracolo.
* `clear` viene trattato come `forget`.
* `reset` viene rifiutato: il sistema privilegia `collapse`, perché ogni ritorno deve avere conseguenza.

---

## Memoria locale

La memoria è salvata solo nel browser dell’utente tramite `localStorage`.

Chiavi principali:

```text
starorigin_state
starorigin_interaction_count
starorigin_memory
starorigin_forgotten_log
starorigin_afterimage_fragments
starorigin_ritual_count
```

Ogni traccia significativa viene salvata come oggetto:

```text
{
  input,
  response,
  timestamp,
  state,
  category,
  depth,
  relic
}
```

La memoria è limitata a 50 elementi con rotazione FIFO.
Tutti gli accessi a `localStorage` sono protetti con `try/catch`.

---

## Relic Archive

L’archivio non è una lista cronologica neutra.

Ogni elemento diventa una reliquia composta da:

* frammento dell’input
* frase residua
* stato del sistema
* categoria simbolica
* profondità
* timestamp

L’obiettivo non è archiviare dati.
L’obiettivo è rendere visibile il peso delle interazioni.

---

## Visual System

Il sistema visivo è stato ridotto e reso più silenzioso.

Non domina più una pioggia di codice.
Il campo visivo reagisce agli stati:

* `DORMANT`: presenza minima
* `BREACH`: prima vibrazione del campo
* `THRESHOLD`: tracce più leggibili
* `AFTERIMAGE`: rarefazione e residuo

Il canvas viene ridotto o disattivato su mobile e con `prefers-reduced-motion`.

---

## Accessibilità

Il progetto mantiene:

* skip link
* input da tastiera
* stati focus visibili
* terminal output con `aria-live`
* fallback per riduzione movimento
* layout responsive
* nessuna dipendenza esterna

---

## Deployment su GitHub Pages

1. Caricare tutti i contenuti della cartella nella root del repository GitHub.
2. Assicurarsi che `index.html` sia nella root.
3. Mantenere `CNAME` nella root.
4. Mantenere `.nojekyll` nella root.
5. Andare in `Settings > Pages`.
6. Impostare la sorgente su branch principale e cartella `/root`.
7. Attendere la pubblicazione di GitHub Pages.

Il dominio configurato è:

```text
antonzip.it
```

---

## Note tecniche

Il progetto non richiede:

```text
npm
node
build
server
backend
framework
CDN
database
```

È sufficiente caricare i file statici su GitHub Pages.

---

## File principali

### `index.html`

Struttura dell’esperienza, terminale, pannelli, archivio e collegamento ai moduli JS.

### `css/base.css`

Sistema visivo principale, layout, tipografia, pannelli e terminale.

### `css/experience.css`

Layer esperienziale: stati, texture, installazione, ritual mode, motion.

### `css/responsive.css`

Adattamenti per tablet e mobile.

### `js/modules/memory.js`

Gestione memoria locale, archivio, forgotten log, afterimage fragments ed export.

### `js/modules/oracle.js`

Analisi dell’input e generazione delle risposte rituali.

### `js/modules/anomaly.js`

Gestione stati, trace pressure, gauge e transizioni.

### `js/modules/visuals.js`

Campo visivo, canvas, cursor, clock e reazioni visuali.

### `js/modules/terminal.js`

Gestione input, comandi, terminal output, ritual mode e installation mode.

### `js/app.js`

Inizializzazione generale del sistema.

---

## Criterio artistico

Il progetto deve sembrare:

```text
un’opera che accade dentro un sito
```

non:

```text
un sito decorato come un’opera
```

Ogni nuova modifica dovrebbe rispettare questa regola.

Meno effetto.
Più conseguenza.
Meno interfaccia.
Più traccia.
