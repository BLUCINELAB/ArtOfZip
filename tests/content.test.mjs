import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve(import.meta.dirname, '..')
const photos = JSON.parse(await readFile(path.join(root, 'content', 'photographs.json'), 'utf8'))
const site = JSON.parse(await readFile(path.join(root, 'content', 'site.json'), 'utf8'))

test('publishes a deliberate 12-image homepage and 16-image photography edit', () => {
  assert.equal(photos.filter((photo) => photo.homeOrder !== null).length, 12)
  assert.equal(photos.filter((photo) => photo.photographyOrder !== null).length, 16)
  assert.equal(photos.filter((photo) => photo.status === 'reserve').length, 3)
  assert.equal(photos.filter((photo) => photo.status === 'excluded').length, 1)
})

test('keeps unknown editorial metadata explicitly null', () => {
  for (const photo of photos) {
    assert.equal(photo.title, null)
    assert.equal(photo.year, null)
    assert.equal(photo.project, null)
    assert.equal(photo.credits, null)
  }
})

test('marks every PhotoVogue preview as requiring a clean original', () => {
  for (const photo of photos) {
    assert.equal(photo.watermark, true)
    assert.equal(photo.cleanOriginalRequired, true)
  }
})

test('uses Anton Likht as the canonical identity', () => {
  assert.equal(site.siteName, 'Anton Likht')
  assert.equal(site.siteUrl, 'https://antonzip.it')
  assert.match(site.role, /Photographer/)
})
