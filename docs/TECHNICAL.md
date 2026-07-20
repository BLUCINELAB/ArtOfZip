# Architettura tecnica

## Flusso principale

`AttentionEngine` campiona posizione, velocità, permanenza, pressione e immobilità in una griglia normalizzata. La griglia diventa una texture monocanale letta dallo shader. Le zone con maggiore attenzione perdono contrasto e dettaglio; quelle ignorate ricevono complessità periferica durante l’immobilità.

`SystemStateMachine` deriva gli stati `DORMANT`, `SENSING`, `WITHDRAWING`, `REVEALING`, `REMEMBERING`, `DEFENSIVE`, `ABSENT`, `QUIESCENT` e `MUTATING`. Lo stato influenza il renderer, la tipografia e il colore d’allarme.

`MemoryEngine` usa IndexedDB. Conserva esclusivamente seed, griglia dell’attenzione, residui astratti, parametri del genoma, tempi aggregati e stato finale. `ForgettingEngine` applica decadimento temporale, fonde residui vicini ed elimina tracce deboli.

`GenomeEngine` mantiene venti parametri entro limiti estetici rigidi. `MutationEngine` modifica soltanto piccole quantità durante quiescenza o ricordo. Le mutazioni non possono distruggere la composizione.

`VisualRenderer` usa Three.js soltanto come livello WebGL. La scena contiene un unico piano e uno shader GLSL originale; non contiene modelli, fotografie, texture remote o asset protetti.

`PerformanceManager` seleziona qualità high, balanced o reduced usando capacità iniziali e frame rate osservato. Il device pixel ratio è limitato.

## Assenza e ritorno

La Page Visibility API registra la durata dell’assenza. Al ritorno, profondità e complessità periferica ricevono una mutazione limitata e la macchina entra temporaneamente in `REMEMBERING`.

## Offline

Il service worker usa una cache locale dello stesso dominio. Dopo che le risorse sono state caricate almeno una volta, l’opera può riaprirsi senza rete. In sviluppo il service worker non viene registrato.

## Debug

La modalità è disponibile soltanto con il server di sviluppo:

```text
http://localhost:5173/?debug=1
```

Mostra stato, frame rate, qualità, pressione, immobilità, memorie, residui e mappa dell’attenzione. Non è inclusa visivamente nella build di produzione.

## Estensione futura

Una memoria collettiva può essere aggiunta implementando un nuovo adapter con la stessa responsabilità di `IndexedDbStore`. Il motore visivo non richiede modifiche.
