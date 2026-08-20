# Content guide

## Public voice

Write in clear international English. Prefer concrete roles, materials, places and verified credits. Keep sentences short enough to scan, but avoid advertising slogans.

Do not use generic phrases such as “visual storyteller”, “capturing moments”, “timeless imagery”, “where art meets creativity” or “passionate photographer”.

## Identity rules

- Primary public name: **Anton Likht**
- Alternate online identity: **Anton Zip**
- Public role line: **Photographer · Director · Visual Artist**
- Base: **Bologna, Italy**
- BluCineLab: related studio/production structure, never a substitute for Anton's author identity

Use `sameAs` only for a profile proven to represent the same person. Use an organization relationship for BluCineLab.

## Evidence standard

- “Featured on PhotoVogue” is supported.
- “One image listed in Best of PhotoVogue” is supported.
- Do not write “published by Vogue” from the current evidence.
- Keep Pop Corn and Il viaggio in the internal source audit; do not foreground them in the public V1 biography or credentials.
- Blow Up Academy can be described as a teaching role.
- Treat the supplied 2026 CV as a current self-authored discovery source. Use it to identify stronger leads, but verify named productions, institutions and publications independently before foregrounding them.
- Do not publish National Geographic, IED, exhibition, festival-selection, client or award claims until a direct source proves the exact wording.

If a fact is missing, use `null` in the content model and `TO RECOVER` in working documents. Never create a plausible title, year, location, model name, stylist or client.

## Photography records

Required fields for a new public image:

- `filename`
- `driveId`
- `width` and `height`
- `orientation`
- `status`
- public order and layout
- `alt`
- watermark status

Add `title`, `year`, `project`, `caption` and `credits` only from a primary source or Anton's explicit confirmation.

## Alt text

Describe the visible image and its significant spatial relationship in one sentence. Do not interpret emotion, gender, identity or intention unless the information is verified and necessary. Avoid “image of” and filenames.

Good: “A figure holds a small light above their head in a dark wooded landscape at night.”

Avoid: “A mysterious woman performs a ritual in an enchanted forest.”

## Image handling

- Never remove the PhotoVogue watermark with AI, retouching or crop.
- Never change grading, contrast, saturation or artistic crop during web export.
- Preserve the source aspect ratio and embedded color profile where possible.
- Export AVIF and JPEG variants only from the clean approved master.
- Keep Drive originals separate from generated web assets.

## Updating the biography

Keep the biography below roughly 130 words unless the page gains a distinct CV/Selected Credits section. Every named institution or credit should be traceable to a stored source. Review all `sameAs` links whenever a profile URL changes.

## Publishing checklist

1. Verify spelling, role and year from the source.
2. Confirm image and subject permissions.
3. Confirm the file is clean and high resolution.
4. Write factual alt text.
5. Run `npm run lint` and `npm test`.
6. Check mobile sequence independently from desktop.
7. Review Open Graph output and canonical URL.
