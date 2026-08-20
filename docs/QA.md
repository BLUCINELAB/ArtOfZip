# V1 quality assurance

Review date: 20 August 2026.

## Scope

The local production build was inspected in Chromium at 1440 × 900 and 390 × 844. The Home, Photography, About and Contact routes were loaded through the same static server used by `npm run preview`.

## Visual and responsive review

- Home: typography, hero, sequence rhythm, captions and sticky desktop navigation inspected.
- Photography: mobile title wrapping, introductory copy, first image and sequence transition inspected.
- About: long display heading, biography measure and evidence links inspected on mobile.
- Contact: single-column mobile layout, contact rows and footer transition inspected.
- No horizontal overflow was found on any public route at 390 px.
- Full-page browser stitching can repeat lazy-loaded frames while it scrolls; viewport captures and the live DOM confirm that the rendered sequence contains one instance of each figure.

Review captures:

- `docs/previews/home-desktop.jpg`
- `docs/previews/home-mobile.jpg`

## Browser and document checks

- One H1 and one canonical URL per page.
- Correct active navigation state on all four public routes.
- No duplicate IDs.
- No browser console errors or warnings.
- Home contains 12 figures; Photography contains 16.
- Every image has descriptive alt text and intrinsic width/height.
- Off-screen images remain intentionally unloaded until approached because native lazy loading is active.
- Navigation between all public pages was exercised through visible links.

## Accessibility checks

- Semantic header, navigation, main and footer landmarks are present.
- A skip link precedes the site header.
- Focus styles are explicitly defined for keyboard users.
- Mobile navigation targets have a minimum height of 44 px.
- Motion is disabled when `prefers-reduced-motion` is active.
- Higher-contrast colors are supplied for `prefers-contrast: more`.
- The site remains complete and readable without the progressive reveal script.

## Performance and privacy checks

- Static HTML with no application framework runtime.
- Homepage HTML: 16,714 bytes; CSS: 10,306 bytes; progressive-enhancement JavaScript: 636 bytes.
- Complete deploy artifact: 14 MB, including the responsive AVIF and JPEG library for 16 selected photographs.
- No external fonts, analytics, trackers, cookies or embeds.
- AVIF sources with JPEG fallback, responsive `srcset` and accurate `sizes`.
- Only the true hero is preloaded and assigned high fetch priority.
- Remaining images use native lazy loading and asynchronous decoding.
- Source dimensions cap the generated variants; the pipeline never upscales.

Core Web Vitals and a final Lighthouse report must be collected from the public preview after the branch is pushed, because local timings do not include GitHub Pages, DNS, TLS or real network latency.

## Automated verification

- Content validation: passed for all 20 reviewed source photographs.
- Test suite: 9 passed, 0 failed.
- Structured data parses as valid JSON and retains the canonical/alternate identity pair.
- Generated pages have unique titles and canonical URLs.
- `git diff --check`: no whitespace errors.

## Release blockers

1. Replace the 16 selected PhotoVogue preview files with clean, approved originals.
2. Recover titles, years, project names and credits where available.
3. Review a public branch preview.
4. Run public Lighthouse and link/metadata checks.
5. Obtain explicit approval before merging to `main` or changing production.
