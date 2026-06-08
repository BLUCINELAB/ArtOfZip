# STARORIGIN // ORACLE — Installation v2

Static ritual website in vanilla HTML, CSS, and JavaScript.

This version turns the existing STARORIGIN // ORACLE site into a quieter terminal-based digital installation. The visitor enters a field, writes into it, and leaves local traces. Memory is stored only in the browser and is treated as consequence, not simple storage.

## Structure

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

## States

- `DORMANT`
- `BREACH`
- `THRESHOLD`
- `AFTERIMAGE`

`COLLAPSE` is an event, not a permanent visual phase. It leads into `AFTERIMAGE`.

## Commands

Active commands:

- `help`
- `recall`
- `forget`
- `ritual`
- `awaken`
- `export`
- `signal`
- `collapse`
- `echo`
- `installation`
- `fieldnotes`
- `blucinelab`
- `author`

Deprecated or absorbed commands:

- `share` is not implemented.
- `clear` is treated as `forget`.
- `daily` is absorbed into normal oracle language.
- `reset` is refused and replaced by `collapse`.

## localStorage Keys

- `starorigin_state`
- `starorigin_interaction_count`
- `starorigin_memory`
- `starorigin_forgotten_log`
- `starorigin_afterimage_fragments`
- `starorigin_ritual_count`

Memory is capped at 50 entries with FIFO rotation. All storage access is wrapped in `try/catch`.

## Deployment

1. Upload the contents of this folder to the root of the GitHub Pages repository.
2. Keep `CNAME` in the root. It is preserved as `antonzip.it`.
3. Keep `.nojekyll` in the root.
4. In GitHub repository settings, enable Pages from the intended branch and root folder.

No backend, framework, build step, package manager, external library, CDN, or server process is required.
