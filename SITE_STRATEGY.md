# Site strategy — antonzip.it 2026

## Positioning

The canonical identity is **Anton Likht**. “Anton Zip” remains an alternate online name used to connect legacy profiles, not the public headline.

The site presents Anton as an author whose still and moving-image work shares one visual concern: bodies, natural elements and constructed light held in psychologically charged space. Professional proof is present through precise credits rather than a wall of logos.

**antonzip.it** is Anton's author portfolio. **BluCineLab** is a related studio and production structure. The relationship appears in the biography, contact page and structured data, without merging the two identities.

## V1 information architecture

```text
Home
├── Selected 12-image sequence
Photography
├── Extended 16-image sequence
About
├── Concise biography
└── Selected verified credentials
Contact
├── Email
└── Official profiles
```

Future structure:

```text
Selected Work
├── Photography
│   └── /work/{verified-project-slug}
├── Film
├── Art Direction
About
Contact
```

Film and Art Direction are supported conceptually but are not exposed in navigation until titles, credits, stills and a deliberate edit are available.

## Editorial and visual system

- Warm off-white ground, black typography and neutral rules.
- System fonts only: a precise sans-serif interface and a restrained editorial serif for long-form copy.
- Images never carry overlaid interface text.
- Layout alternates wide, portrait and full-width plates to create pace instead of a masonry archive.
- Motion is limited to a short reveal and is fully disabled by `prefers-reduced-motion`.
- No sliders, automatic motion, WebGL, custom cursor or scroll hijacking.

The visual method was informed by the BluCineLab Atlas themes most relevant to Anton—body and silhouette, matter and metamorphosis, natural light and landscape, sequence and narrative—without borrowing the surface style of any single reference.

## Content model

`content/photographs.json` is the source of truth. Each record stores:

- filename and Drive ID;
- dimensions and orientation;
- selected / reserve / excluded status;
- homepage and Photography order;
- layout role, intensity, themes, function and sequence relationship;
- project, title, year, caption and credits, explicitly `null` when unknown;
- descriptive alt text;
- watermark and clean-original requirement.

The build fails if a selected photograph lacks required responsive variants. Tests also reject duplicate order numbers and accidental publication of reserve files.

## SEO and entity strategy

Implemented:

- unique titles and descriptions;
- canonical URLs;
- indexable semantic HTML and heading hierarchy;
- Open Graph and Twitter metadata;
- responsive image dimensions, alt text and preload of the true hero only;
- `robots.txt`, `sitemap.xml`, `llms.txt`, favicon and web manifest;
- `Person`, `WebSite` and `BreadcrumbList` JSON-LD;
- canonical `name: Anton Likht` and `alternateName: Anton Zip`;
- verified `sameAs` links to Instagram, PhotoVogue and LinkedIn;
- explicit relationship to BluCineLab through `memberOf`, not `sameAs`;
- custom 404 and clean public URLs.

No keyword stuffing, hidden text, generic local-photographer copy or unverified client/publication claims are used.

## Performance approach

- static HTML; no framework runtime;
- one CSS file and one sub-kilobyte enhancement script;
- AVIF with JPEG fallback;
- width-specific `srcset` and `sizes`;
- declared dimensions to prevent layout shift;
- eager loading and preload only for `IMG_1104`;
- lazy loading and asynchronous decoding for the remaining photographs;
- no external fonts, trackers, cookies or third-party embeds.

The source files currently have limited resolution—most are 1280 px on the long edge—so the image pipeline never upscales beyond the available width.

## Accessibility

- skip link, semantic header/nav/main/footer landmarks;
- visible keyboard focus and 40 px mobile navigation targets;
- one H1 per page and logical section labels;
- content-specific alt text;
- no essential content dependent on JavaScript;
- reduced-motion and higher-contrast media queries;
- no auto-playing media or focus traps.

## Privacy and analytics

V1 contains no analytics, cookies, form submissions, external font calls or embedded social media. A cookie banner is therefore unnecessary. If measurement becomes necessary, make it a separate decision and prefer a cookieless, privacy-friendly implementation after legal review.

## Deployment and rollback

Current hosting is GitHub Pages through `.github/workflows/deploy-pages.yml`, with `CNAME` set to `antonzip.it`.

- Development branch: `redesign/antonzip-2026`
- Production branch: `main`
- Production deployment trigger: push to `main`
- Rollback: redeploy the last known-good `main` commit or revert the merge commit.

The previous interactive work “Mentre non guardavi” remains fully recoverable in Git history. If retained publicly later, it should move to a dedicated art-project URL after a separate editorial decision.

## Adding a project

1. Confirm a real project title, year, credits and publication permissions.
2. Add clean master files to the protected Drive source folder.
3. Create a project record rather than inventing missing metadata.
4. Generate responsive assets with `scripts/optimize-images.mjs`.
5. Add a `/work/{slug}/` template in `scripts/build-site.mjs`.
6. Add internal links and `BreadcrumbList` data.
7. Run `npm run verify` and inspect desktop and mobile output.

## Post-launch search setup

### Google Search Console

1. Verify the domain property through DNS.
2. Submit `https://antonzip.it/sitemap.xml`.
3. Inspect `/`, `/photography/`, `/about/` and `/contact/`.
4. Request indexing only after the clean originals are live.
5. Monitor canonical selection, Core Web Vitals, image indexing and structured-data warnings for four weeks.
6. Review incoming queries around “Anton Likht”, photography, director/cinematography and Bologna/Italy without rewriting pages around low-quality keyword variants.

### Bing Webmaster Tools

1. Import the verified Search Console property or verify through DNS.
2. Submit the same sitemap.
3. Enable IndexNow only if a later content workflow benefits from frequent project publishing; it is unnecessary for the four-page V1.
4. Check crawl, structured-data and backlink reports monthly during the first quarter.
