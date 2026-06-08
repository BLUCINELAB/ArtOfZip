# Changelog

## Installation v2

### Modified Files

- `index.html`
- `README.md`
- `css/base.css`
- `css/experience.css`
- `css/responsive.css`
- `js/modules/memory.js`
- `js/modules/oracle.js`
- `js/modules/anomaly.js`
- `js/modules/visuals.js`
- `js/modules/terminal.js`

### New Files

- `.nojekyll`
- `CHANGELOG.md`

### Preserved Files

- `CNAME` preserved exactly with `antonzip.it`.
- Existing folder structure preserved.
- `js/app.js` preserved.
- `assets/` and `data/` preserved.

### Changed HTML IDs

No existing HTML IDs were removed or renamed.

Preserved IDs:

`codeRain`, `breachFlash`, `cursor`, `cursorDot`, `gaugeFill`, `gaugeNumber`, `systemStatus`, `systemTime`, `fieldSignal`, `heroTitle`, `ritualRule`, `heroCopy`, `heroMeta`, `oracleState`, `questionCount`, `coherenceValue`, `breachButton`, `sessionCode`, `terminalForm`, `oracleInput`, `terminalOutput`, `traceDot`, `systemNote`, `depthValue`, `categoryValue`, `memoryValue`, `phaseFoot`, `archiveList`.

### State And Memory

- Replaced the previous anomaly/awakened model with four persistent phases: `DORMANT`, `BREACH`, `THRESHOLD`, `AFTERIMAGE`.
- Added collapse as a confirmation-based event that stores afterimage fragments instead of deleting memory.
- Added localStorage keys requested by the prompt:
  - `starorigin_state`
  - `starorigin_interaction_count`
  - `starorigin_memory`
  - `starorigin_forgotten_log`
  - `starorigin_afterimage_fragments`
  - `starorigin_ritual_count`
- Memory entries now use `{ input, response, timestamp, state, category, depth, relic }`.
- Memory cap is 50 entries with FIFO rotation.
- Legacy `starorigin_oracle_memory_v1` can be migrated if present.

### Commands

- Kept or implemented: `help`, `recall`, `forget`, `ritual`, `awaken`, `export`, `signal`, `collapse`, `echo`.
- Added: `installation`, `fieldnotes`, `blucinelab`, `author`.
- Removed from visible controls: `share`, `daily`, `clear`, `reset`.
- `share` is not implemented.
- `clear` maps to `forget`.
- `daily` is absorbed into ordinary oracle responses.
- `reset` is refused and points toward collapse as the consequential transition.

### Visual System

- Replaced dominant code rain with sparse phase-aware field fragments.
- Canvas respects reduced motion and pauses when the page is hidden.
- Mobile disables the canvas field.
- Glitch is reduced to short transition pulses.
- Added afterimage and installation-mode reductions.

### Accessibility And Compatibility

- Preserved skip link, keyboard input, focus states, and `aria-live` terminal output.
- Kept static GitHub Pages compatibility.
- No backend, framework, build step, package manager, external library, CDN, or `node_modules`.

### Warnings

- The source folder in Downloads was preserved as backup; this deliverable is the upgraded copy.
- The original project did not include `.nojekyll`; this copy creates it.
- JavaScript syntax checks were run successfully before sandbox policy blocked further executable local tests.
- Browser and localhost verification could not be completed inside this turn because the sandbox rejected both `file://` browser loading and local server execution.
