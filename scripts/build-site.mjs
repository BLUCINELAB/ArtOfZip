import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const publicDir = path.join(root, 'public')
const assetsDir = path.join(dist, 'assets')
const imagesDir = path.join(publicDir, 'images', 'portfolio')

const site = JSON.parse(await readFile(path.join(root, 'content', 'site.json'), 'utf8'))
const photos = JSON.parse(await readFile(path.join(root, 'content', 'photographs.json'), 'utf8'))
const assetVersion = '20260820'

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const absoluteUrl = (pathname) => new URL(pathname, site.siteUrl).href
const photoStem = (photo) => path.parse(photo.filename).name

const imageWidths = (photo) => {
  const maximum = Math.min(photo.width, 1280)
  return [...new Set([480, 720, 960]
    .filter((width) => width <= maximum * 0.88)
    .concat(maximum))]
    .sort((a, b) => a - b)
}

const imagePath = (photo, width, extension) => (
  `/images/portfolio/${photoStem(photo)}-${width}.${extension}`
)

const imageMarkup = (photo, { eager = false, index = 0, surface = 'home' } = {}) => {
  const widths = imageWidths(photo)
  const largest = widths.at(-1)
  const layout = surface === 'home' ? photo.layoutHome : photo.layoutPhotography
  const sizes = layout?.includes('portrait')
    ? '(max-width: 768px) 90vw, 43vw'
    : layout === 'full'
      ? '100vw'
      : '(max-width: 768px) 100vw, 76vw'
  const avifSrcset = widths.map((width) => `${imagePath(photo, width, 'avif')} ${width}w`).join(', ')
  const jpegSrcset = widths.map((width) => `${imagePath(photo, width, 'jpg')} ${width}w`).join(', ')
  const order = surface === 'home' ? photo.homeOrder : photo.photographyOrder

  return `
    <figure class="sequence-figure layout-${escapeHtml(layout)}" data-reveal>
      <picture>
        <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">
        <img
          src="${imagePath(photo, largest, 'jpg')}"
          srcset="${jpegSrcset}"
          sizes="${sizes}"
          width="${photo.width}"
          height="${photo.height}"
          alt="${escapeHtml(photo.alt)}"
          loading="${eager ? 'eager' : 'lazy'}"
          decoding="${eager ? 'sync' : 'async'}"
          fetchpriority="${eager ? 'high' : 'auto'}"
        >
      </picture>
      <figcaption class="sequence-marker">
        <span>${String(order ?? index + 1).padStart(2, '0')}</span>
        <span>Selected photography</span>
      </figcaption>
    </figure>`
}

const navMarkup = (pathname) => site.navigation.map((item) => {
  const current = item.href === pathname
  return `<li><a href="${item.href}"${current ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a></li>`
}).join('')

const headerMarkup = (pathname) => `
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <a class="site-name" href="/" aria-label="Anton Likht, home">Anton Likht</a>
    <nav class="site-nav" aria-label="Primary navigation">
      <ul>${navMarkup(pathname)}</ul>
    </nav>
  </header>`

const footerMarkup = () => `
  <footer class="site-footer">
    <span>${escapeHtml(site.location)}</span>
    <div class="footer-links">
      <a href="mailto:${escapeHtml(site.email)}">Email</a>
      <a href="https://www.instagram.com/anton_zip" rel="me">Instagram</a>
    </div>
    <span>© 2026 Anton Likht</span>
  </footer>`

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${site.siteUrl}/#person`,
  name: 'Anton Likht',
  alternateName: 'Anton Zip',
  url: `${site.siteUrl}/`,
  jobTitle: 'Photographer, Director and Visual Artist',
  description: site.description,
  email: `mailto:${site.email}`,
  homeLocation: {
    '@type': 'Place',
    name: 'Bologna, Italy'
  },
  knowsAbout: [
    'Photography',
    'Editorial photography',
    'Film direction',
    'Cinematography',
    'Visual art'
  ],
  sameAs: site.profiles.filter((profile) => profile.sameAs).map((profile) => profile.href),
  memberOf: {
    '@type': 'Organization',
    name: 'BluCineLab',
    url: 'https://blucinelab.it'
  }
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${site.siteUrl}/#website`,
  url: `${site.siteUrl}/`,
  name: site.siteName,
  inLanguage: 'en',
  publisher: { '@id': `${site.siteUrl}/#person` }
}

const breadcrumbSchema = (title, pathname) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${site.siteUrl}/`
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: title,
      item: absoluteUrl(pathname)
    }
  ]
})

const pageDocument = ({ title, description, pathname, body, robots = 'index,follow', breadcrumb = true }) => {
  const canonical = absoluteUrl(pathname)
  const schemas = [personSchema, websiteSchema]
  if (breadcrumb && pathname !== '/') schemas.push(breadcrumbSchema(title, pathname))
  const hero = photos.find((photo) => photo.homeOrder === 1)
  const heroLargest = imageWidths(hero).at(-1)
  const fullTitle = pathname === '/' ? 'Anton Likht — Photographer, Director & Visual Artist' : `${title} — Anton Likht`

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f4f2ed">
  <meta name="color-scheme" content="light">
  <meta name="robots" content="${robots}">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/styles.css?v=${assetVersion}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Anton Likht">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absoluteUrl(imagePath(hero, heroLargest, 'jpg'))}">
  <meta property="og:image:width" content="${hero.width}">
  <meta property="og:image:height" content="${hero.height}">
  <meta property="og:image:alt" content="${escapeHtml(hero.alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${absoluteUrl(imagePath(hero, heroLargest, 'jpg'))}">
  ${pathname === '/' ? `<link rel="preload" as="image" href="${imagePath(hero, heroLargest, 'avif')}" imagesrcset="${imageWidths(hero).map((width) => `${imagePath(hero, width, 'avif')} ${width}w`).join(', ')}" imagesizes="(max-width: 768px) 100vw, 84vw" type="image/avif">` : ''}
  <script type="application/ld+json">${JSON.stringify(schemas)}</script>
  <script src="/assets/main.js?v=${assetVersion}" defer></script>
</head>
<body>
${headerMarkup(pathname)}
${body}
${footerMarkup()}
</body>
</html>`
}

const homePhotos = photos.filter((photo) => photo.homeOrder !== null).sort((a, b) => a.homeOrder - b.homeOrder)
const photographyPhotos = photos.filter((photo) => photo.photographyOrder !== null).sort((a, b) => a.photographyOrder - b.photographyOrder)

const homeBody = `
  <main id="main-content">
    <section class="intro" aria-labelledby="home-title">
      <h1 id="home-title"><span>Anton</span><br> <span>Likht</span></h1>
      <div class="intro-meta">
        <p class="intro-role">${escapeHtml(site.role)}</p>
        <p class="intro-location">${escapeHtml(site.availability)}</p>
      </div>
    </section>
    <section class="sequence" aria-label="Selected photographic sequence">
      ${homePhotos.map((photo, index) => imageMarkup(photo, { eager: index === 0, index, surface: 'home' })).join('')}
    </section>
  </main>`

const photographyBody = `
  <main id="main-content">
    <section class="page-intro" aria-labelledby="photography-title">
      <h1 id="photography-title">Photo&shy;graphy</h1>
      <div class="page-intro-copy">
        <p>Bodies, natural elements and constructed light held in a single visual field.</p>
        <p class="microcopy">Selected work · Bologna, Italy</p>
      </div>
    </section>
    <section class="sequence" aria-label="Photography portfolio">
      ${photographyPhotos.map((photo, index) => imageMarkup(photo, { eager: index === 0, index, surface: 'photography' })).join('')}
    </section>
  </main>`

const aboutBody = `
  <main id="main-content" class="about-page">
    <section class="about-lead" aria-labelledby="about-title">
      <p class="eyebrow">${escapeHtml(site.about.eyebrow)}</p>
      <h1 class="about-title" id="about-title">${escapeHtml(site.about.heading)}</h1>
    </section>
    <section class="about-body" aria-label="Biography and selected credentials">
      <div class="bio">
        ${site.about.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      </div>
      <dl class="credentials">
        ${site.about.credentials.map((credential) => `
          <div class="credential">
            <dt>${escapeHtml(credential.label)}</dt>
            <dd><a href="${escapeHtml(credential.href)}">${escapeHtml(credential.value)} <span aria-hidden="true">↗</span></a></dd>
          </div>`).join('')}
      </dl>
    </section>
  </main>`

const contactLinks = [
  { label: site.email, href: `mailto:${site.email}` },
  ...site.profiles
]

const contactBody = `
  <main id="main-content" class="contact-page">
    <h1 class="contact-title">Start a conversation.</h1>
    <section class="contact-details" aria-label="Contact details">
      <p class="contact-intro">For editorial, commissioned and moving-image projects in Italy and internationally.</p>
      <ul class="contact-list">
        ${contactLinks.map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('')}
      </ul>
    </section>
  </main>`

const notFoundBody = `
  <main id="main-content" class="not-found">
    <div>
      <p class="eyebrow">404 · Not found</p>
      <h1>Outside the frame.</h1>
      <p><a href="/">Return to selected work</a></p>
    </div>
  </main>`

const pages = [
  {
    output: 'index.html',
    title: 'Home',
    description: site.description,
    pathname: '/',
    body: homeBody,
    breadcrumb: false
  },
  {
    output: 'photography/index.html',
    title: 'Photography',
    description: 'Selected photography by Anton Likht: bodies, natural elements, editorial portraiture and constructed light.',
    pathname: '/photography/',
    body: photographyBody
  },
  {
    output: 'about/index.html',
    title: 'About',
    description: 'About Anton Likht, a photographer, director and visual artist based in Bologna, Italy.',
    pathname: '/about/',
    body: aboutBody
  },
  {
    output: 'contact/index.html',
    title: 'Contact',
    description: 'Contact Anton Likht for editorial photography, commissioned image-making and moving-image projects.',
    pathname: '/contact/',
    body: contactBody
  },
  {
    output: '404.html',
    title: 'Page not found',
    description: 'The requested page could not be found.',
    pathname: '/404.html',
    body: notFoundBody,
    robots: 'noindex,follow',
    breadcrumb: false
  }
]

const requiredImages = photographyPhotos.flatMap((photo) => imageWidths(photo).flatMap((width) => [
  path.join(imagesDir, `${photoStem(photo)}-${width}.jpg`),
  path.join(imagesDir, `${photoStem(photo)}-${width}.avif`)
]))

for (const file of requiredImages) {
  try {
    await stat(file)
  } catch {
    throw new Error(`Missing optimized image: ${path.relative(root, file)}`)
  }
}

await rm(dist, { recursive: true, force: true })
await mkdir(assetsDir, { recursive: true })
await cp(publicDir, dist, { recursive: true })
await cp(path.join(root, 'src', 'styles.css'), path.join(assetsDir, 'styles.css'))
await cp(path.join(root, 'src', 'main.js'), path.join(assetsDir, 'main.js'))

for (const page of pages) {
  const output = path.join(dist, page.output)
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(output, pageDocument(page))
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter((page) => page.robots !== 'noindex,follow').map((page) => `  <url>
    <loc>${absoluteUrl(page.pathname)}</loc>
    <lastmod>2026-08-20</lastmod>
  </url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${site.siteUrl}/sitemap.xml
`

const llms = `# Anton Likht

> Photographer, Director and Visual Artist based in Bologna, Italy.

Official website: ${site.siteUrl}/
Photography: ${site.siteUrl}/photography/
Biography: ${site.siteUrl}/about/
Contact: ${site.siteUrl}/contact/

Verified profiles:
- PhotoVogue: https://www.vogue.com/photovogue/photographers/188548
- Instagram: https://www.instagram.com/anton_zip
- LinkedIn: https://www.linkedin.com/in/anton-likht-30457170

Related studio:
- BluCineLab: https://blucinelab.it

Anton Likht is the primary professional name. Anton Zip is an alternate online identity.
`

await writeFile(path.join(dist, 'sitemap.xml'), sitemap)
await writeFile(path.join(dist, 'robots.txt'), robots)
await writeFile(path.join(dist, 'llms.txt'), llms)
await writeFile(path.join(dist, '.nojekyll'), '')

console.log(`Built ${pages.length} pages and ${photographyPhotos.length} selected photographs.`)
