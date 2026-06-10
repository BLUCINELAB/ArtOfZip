# Gabinetto di Psicostratigrafia

Sito-organismo statico per `antonzip.it`.

Non è un portfolio. È uno strumento di esplorazione archeologica della mente creativa. Pensieri, progetti e frammenti vengono trattati come sedimenti: il visitatore non naviga, preleva un carotaggio.

## Tecnologie

- HTML5
- CSS3
- JavaScript vanilla
- Canvas 2D
- SVG noise inline
- Nessuna libreria esterna
- Compatibile con GitHub Pages

## Struttura file

```txt
/
├── index.html
├── CNAME
├── css/
│   ├── reset.css
│   ├── stratigraphy.css
│   └── core.css
├── js/
│   ├── core-simulation.js
│   ├── strata-manager.js
│   ├── carotaggio.js
│   ├── sezione-sottile.js
│   └── interactions.js
└── README.md
```

## Come usarlo

1. Apri `index.html` in locale per testare.
2. Clicca o tocca la superficie minerale per generare una carota.
3. Clicca uno strato della carota per aprire la sezione sottile.
4. Doppio click sulla superficie, oppure pressione lunga da mobile, per aprire il pannello profondità.
5. Premi `ESC` per chiudere la sezione o il pannello.

## Deploy su GitHub Pages

1. Carica tutti i file nella root del repository.
2. Vai su `Settings → Pages`.
3. Source: `Deploy from a branch`.
4. Branch: `main`, folder: `/root`.
5. Il file `CNAME` contiene già `antonzip.it`.

## DNS per antonzip.it

Record A:

```txt
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Record CNAME:

```txt
www → blucinelab.github.io
```

Se il nome utente/organizzazione GitHub cambia, aggiorna il CNAME `www` nel pannello DNS.
