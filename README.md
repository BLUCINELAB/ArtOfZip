# Mentre non guardavi

**While You Weren’t Looking**

Installazione artistica digitale interattiva e contemplativa, 2026.

> Ciò che guardi si ritira.  
> Ciò che ignori continua a formarsi.

Il sito è l’opera. Non contiene portfolio, navigazione, obiettivi o una narrazione da completare. Il visitatore esercita una pressione temporanea su un campo che possiede memoria, dimenticanza e un proprio ritmo.

## Territorio concettuale

L’opera indaga attenzione come consumo, osservazione come modifica, memoria come trasformazione e sopravvivenza di ciò che rimane fuori campo. La malinconia cibernetica e il rapporto tra corpo, identità e sistema appartengono al suo territorio culturale, senza utilizzare immagini, simboli, font o interfacce provenienti da opere esistenti.

## Requisiti

Node.js 22 o successivo e npm 10 o successivo.

## Avvio locale

```bash
npm install
npm run dev
```

Aprire `http://localhost:5173`.

## Verifica

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

Il test end to end richiede Chromium:

```bash
npx playwright install chromium
npm run test:e2e
```

## Architettura

Il motore è suddiviso in moduli indipendenti:

1. `AttentionEngine` costruisce la mappa non invasiva dell’attenzione
2. `SystemStateMachine` governa presenza, ritiro, difesa, assenza e ricordo
3. `MemoryEngine` conserva residui anonimi in IndexedDB
4. `ForgettingEngine` applica decadimento, fusione e rimozione
5. `GenomeEngine` limita l’identità parametrica dell’opera
6. `MutationEngine` introduce variazioni lente tra le sessioni
7. `VisualRenderer` traduce il sistema in uno shader GLSL procedurale
8. `TypographyLayer` tratta il testo come evento raro
9. `AccessibilityManager` integra preferenze e alternative percettive
10. `PerformanceManager` adatta qualità, frame rate e pixel ratio

Approfondimento in [docs/TECHNICAL.md](docs/TECHNICAL.md).

## Memoria locale

La memoria contiene soltanto dati astratti: seed, celle osservate o ignorate, durate aggregate, residui, stato finale e valori estetici. Non registra identità, testo digitato, cronologia, immagini, audio o posizione geografica.

Le tracce hanno intensità, età e velocità di decadimento. Tracce vicine possono fondersi; quelle deboli scompaiono. Alcuni residui possono rimanere temporaneamente protetti e riemergere deformati.

Premere `I` per aprire il pannello. Da qui è possibile:

1. Disattivare la persistenza
2. Cancellare completamente la memoria
3. Ridurre il movimento
4. Aumentare il contrasto
5. Mettere in pausa le trasformazioni

Dettagli in [docs/PRIVACY.md](docs/PRIVACY.md).

## Genoma estetico

Il genoma controlla densità, profondità, sensibilità, velocità di ritiro ed emersione, persistenza, dimenticanza, rigidità, organicità, rarità del testo, grana, anomalie, ritardo, difesa, quiescenza, allarme, oscurità e stabilità.

I valori iniziali sono in `src/engine/genome/defaultGenome.ts`. I limiti invalicabili sono in `src/engine/genome/GenomeEngine.ts`. Modificare i primi per calibrare l’opera; modificare i secondi soltanto dopo test visivi completi.

Le frasi rare sono selezionate in `src/engine/typography/TypographyLayer.tsx`.

## Modalità debug

Disponibile soltanto in sviluppo:

```text
http://localhost:5173/?debug=1
```

Mostra stato, frame rate, livello di qualità, memoria, pressione, immobilità, genoma e griglia dell’attenzione.

## GitHub Pages

Il progetto usa percorsi relativi e funziona sia alla radice sia sotto il nome del repository.

1. Creare un repository GitHub vuoto chiamato `mentre-non-guardavi`
2. Eseguire i comandi indicati sotto nella cartella del progetto
3. Aprire `Settings`, quindi `Pages`
4. In `Build and deployment`, scegliere `GitHub Actions`
5. Attendere il completamento del workflow `Deploy to GitHub Pages`

```bash
git init
git add .
git commit -m "Publish Mentre non guardavi"
git branch -M main
git remote add origin https://github.com/NOME-UTENTE/mentre-non-guardavi.git
git push -u origin main
```

Il workflow verifica typecheck, lint, test e build prima di pubblicare `dist`.

## Dominio personalizzato

1. Copiare `CNAME.example` in `public/CNAME`
2. Sostituire il contenuto con il dominio reale
3. Configurare il record DNS verso GitHub Pages
4. In `Settings > Pages`, inserire lo stesso dominio e attivare HTTPS
5. Eseguire nuovamente il push

## Limiti tecnici

La memoria è locale al browser e non passa tra dispositivi. Le schede in background vengono rallentate dal browser; la trasformazione durante l’assenza è quindi calcolata al ritorno. Il fallback Canvas 2D preserva la legge artistica, ma possiede meno dettaglio dello shader WebGL. Il funzionamento offline richiede almeno una visita completa con rete disponibile.

## Documentazione

1. [Nota artistica](docs/ARTISTIC-NOTE.md)
2. [Architettura tecnica](docs/TECHNICAL.md)
3. [Accessibilità](docs/ACCESSIBILITY.md)
4. [Privacy](docs/PRIVACY.md)
5. [Direzioni visive confrontate](docs/VISUAL-DIRECTIONS.md)

## Licenza

Codice distribuito con licenza MIT. Titolo, nota artistica e identità dell’opera restano attribuiti ad Anton Likht.
