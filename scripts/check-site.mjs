import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const photos = JSON.parse(await readFile(path.join(root, 'content', 'photographs.json'), 'utf8'))
const site = JSON.parse(await readFile(path.join(root, 'content', 'site.json'), 'utf8'))

const errors = []
const expectedStatuses = new Set(['selected', 'reserve', 'excluded'])
const filenames = new Set()

const checkUniqueOrder = (property) => {
  const values = photos.map((photo) => photo[property]).filter((value) => value !== null)
  const unique = new Set(values)
  if (values.length !== unique.size) errors.push(`${property} contains duplicate values.`)
  if (values.length > 0) {
    const expected = Array.from({ length: values.length }, (_, index) => index + 1)
    if (expected.some((value) => !unique.has(value))) errors.push(`${property} must be contiguous from 1.`)
  }
}

for (const photo of photos) {
  if (filenames.has(photo.filename)) errors.push(`Duplicate filename: ${photo.filename}`)
  filenames.add(photo.filename)
  if (!expectedStatuses.has(photo.status)) errors.push(`Invalid status for ${photo.filename}.`)
  if (!photo.alt || photo.alt.length < 25) errors.push(`Alt text is too short for ${photo.filename}.`)
  if (!photo.width || !photo.height) errors.push(`Missing dimensions for ${photo.filename}.`)
  if (photo.status !== 'selected' && photo.photographyOrder !== null) errors.push(`${photo.filename} is not selected but has a photography order.`)
  if (photo.homeOrder !== null && photo.status !== 'selected') errors.push(`${photo.filename} is on the homepage but is not selected.`)
  if (photo.homeOrder !== null && !photo.layoutHome) errors.push(`Missing home layout for ${photo.filename}.`)
  if (photo.photographyOrder !== null && !photo.layoutPhotography) errors.push(`Missing photography layout for ${photo.filename}.`)
  if (!photo.watermark || !photo.cleanOriginalRequired) errors.push(`Watermark replacement flag missing for ${photo.filename}.`)
}

checkUniqueOrder('homeOrder')
checkUniqueOrder('photographyOrder')

if (photos.length !== 20) errors.push(`Expected 20 source photographs; found ${photos.length}.`)
if (photos.filter((photo) => photo.homeOrder !== null).length !== 12) errors.push('Homepage must contain 12 photographs.')
if (photos.filter((photo) => photo.photographyOrder !== null).length !== 16) errors.push('Photography must contain 16 photographs.')
if (site.siteUrl !== 'https://antonzip.it') errors.push('Canonical site URL must remain https://antonzip.it.')
if (!site.email || !site.email.includes('@')) errors.push('A valid contact email is required.')
if (!site.profiles.some((profile) => profile.label === 'PhotoVogue' && profile.sameAs)) errors.push('PhotoVogue sameAs profile is required.')

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exitCode = 1
} else {
  console.log(`Content checks passed for ${photos.length} photographs.`)
}
