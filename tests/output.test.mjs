import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve(import.meta.dirname, '..')

test('generated home page exposes semantic identity and performance hints', async () => {
  const html = await readFile(path.join(root, 'dist', 'index.html'), 'utf8')
  assert.match(html, /<h1 id="home-title"><span>Anton<\/span><br> <span>Likht<\/span><\/h1>/)
  assert.match(html, /application\/ld\+json/)
  assert.match(html, /fetchpriority="high"/)
  assert.match(html, /rel="canonical" href="https:\/\/antonzip\.it\/"/)
  assert.doesNotMatch(html, /react|three|webgl/i)
})

test('structured data is valid JSON and identifies Anton consistently', async () => {
  const files = ['index.html', 'photography/index.html', 'about/index.html', 'contact/index.html']
  for (const file of files) {
    const html = await readFile(path.join(root, 'dist', file), 'utf8')
    const json = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1]
    assert.ok(json, `Missing structured data in ${file}`)
    const schemas = JSON.parse(json)
    const person = schemas.find((schema) => schema['@type'] === 'Person')
    assert.equal(person?.name, 'Anton Likht')
    assert.equal(person?.alternateName, 'Anton Zip')
  }
})

test('published photography markup includes alt text and intrinsic dimensions', async () => {
  const files = ['index.html', 'photography/index.html']
  for (const file of files) {
    const html = await readFile(path.join(root, 'dist', file), 'utf8')
    const images = [...html.matchAll(/<img\s+([\s\S]*?)>/g)].map((match) => match[1])
    assert.ok(images.length > 0)
    for (const attributes of images) {
      assert.match(attributes, /\balt="[^"]+"/)
      assert.match(attributes, /\bwidth="\d+"/)
      assert.match(attributes, /\bheight="\d+"/)
    }
  }
})

test('generated pages have unique titles and canonical URLs', async () => {
  const files = ['index.html', 'photography/index.html', 'about/index.html', 'contact/index.html']
  const titles = new Set()
  const canonicals = new Set()
  for (const file of files) {
    const html = await readFile(path.join(root, 'dist', file), 'utf8')
    titles.add(html.match(/<title>([^<]+)<\/title>/)?.[1])
    canonicals.add(html.match(/rel="canonical" href="([^"]+)"/)?.[1])
  }
  assert.equal(titles.size, files.length)
  assert.equal(canonicals.size, files.length)
})

test('robots and sitemap expose only canonical public pages', async () => {
  const robots = await readFile(path.join(root, 'dist', 'robots.txt'), 'utf8')
  const sitemap = await readFile(path.join(root, 'dist', 'sitemap.xml'), 'utf8')
  assert.match(robots, /Sitemap: https:\/\/antonzip\.it\/sitemap\.xml/)
  assert.match(sitemap, /https:\/\/antonzip\.it\/photography\//)
  assert.doesNotMatch(sitemap, /404/)
})
