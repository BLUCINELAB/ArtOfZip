# STARORIGIN // ORACLE — Enhanced

Rituale digitale statico in vanilla HTML, CSS e JavaScript.

## Funzioni principali

- Terminale interattivo con risposte procedurali locali
- Motore `oracle.js` potenziato con categorie simboliche estese
- Gauge di anomalia legato alla profondità della domanda
- Stato `awakened` persistente via localStorage
- Memoria locale con archivio e export testuale
- Comandi: `help`, `daily`, `ritual`, `share`, `recall`, `export`, `clear`, `forget`, `awaken`, `reset`
- Modalità rituale fullscreen senza pannelli laterali
- Export card PNG locale dell’ultima risposta
- Canvas code rain semantico con rispetto di `prefers-reduced-motion`
- Cursor custom desktop, fallback touch/mobile
- Responsive, accessibile, GitHub Pages ready
- Nessun backend, nessuna libreria, nessun build step

## Deploy GitHub Pages

1. Carica tutti i file nella root del repository.
2. Vai su Settings → Pages.
3. Source: Deploy from branch.
4. Branch: `main`, folder: `/root`.
5. Mantieni `CNAME` se usi `antonzip.it`.

## Struttura

```text
.
├── index.html
├── CNAME
├── README.md
├── .nojekyll
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

## Note operative

Non cambiare gli ID HTML collegati ai moduli JS senza aggiornare i rispettivi file. Il cuore creativo è `js/modules/oracle.js`; il cuore interattivo è `js/modules/terminal.js`.
