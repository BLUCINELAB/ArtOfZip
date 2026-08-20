# Anton Likht — Portfolio 2026

Static editorial portfolio for [antonzip.it](https://antonzip.it).

The site positions Anton Likht as a **Photographer · Director · Visual Artist** and keeps the relationship with BluCineLab present but secondary. It is built as semantic multi-page HTML with no framework, no analytics and only a small progressive-enhancement script.

## Public architecture

- `/` — selected 12-image sequence
- `/photography/` — extended 16-image edit
- `/about/` — concise verified biography and credentials
- `/contact/` — email and official profiles
- `/404.html` — custom not-found page

Film and Art Direction are planned in the content architecture but remain unpublished until a sufficiently strong edit exists.

## Requirements

- Node.js 22 or later
- macOS `sips` and FFmpeg only when regenerating image variants

There are no runtime or build dependencies.

## Commands

```bash
npm run lint
npm test
npm run build
npm run preview
```

The local preview runs at `http://127.0.0.1:4173`.

## Image workflow

The working-source folder is not committed. To regenerate responsive assets:

```bash
node scripts/optimize-images.mjs /absolute/path/to/source-images
```

The script creates AVIF and JPEG variants without cropping. The current committed assets are watermarked PhotoVogue preview files and must be replaced with clean originals before production launch. See [PHOTO_EDIT.md](docs/PHOTO_EDIT.md).

## Content editing

- Site copy, biography, links and verified sources: `content/site.json`
- Image order, status, alt text and editorial notes: `content/photographs.json`
- Layout and typography: `src/styles.css`
- Static page generator: `scripts/build-site.mjs`

See [SITE_STRATEGY.md](SITE_STRATEGY.md) and [CONTENT_GUIDE.md](CONTENT_GUIDE.md) before adding work.

## Review material

- Desktop homepage preview: `docs/previews/home-desktop.jpg`
- Mobile homepage preview: `docs/previews/home-mobile.jpg`
- Visual and technical QA: `docs/QA.md`
- Photography selection and missing originals: `docs/PHOTO_EDIT.md`
- Verified source and external-profile audit: `docs/DIGITAL_PRESENCE_AUDIT.md`

## Deployment and rollback

GitHub Actions verifies and deploys `dist/` to GitHub Pages only from `main`. Development happens on `redesign/antonzip-2026`. The current production version remains recoverable from the pre-redesign `main` commit and no DNS change is required.

Do not merge or deploy to the primary domain until:

1. all 16 selected files are replaced with clean originals;
2. preview review is approved;
3. responsive, accessibility and metadata checks pass against the public preview.
