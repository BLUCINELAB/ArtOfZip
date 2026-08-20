import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.resolve(process.argv[2] ?? '/private/tmp/antonzip-source')
const outputDir = path.join(root, 'public', 'images', 'portfolio')
const photos = JSON.parse(await readFile(path.join(root, 'content', 'photographs.json'), 'utf8'))

const imageWidths = (photo) => {
  const maximum = Math.min(photo.width, 1280)
  return [...new Set([480, 720, 960]
    .filter((width) => width <= maximum * 0.88)
    .concat(maximum))]
    .sort((a, b) => a - b)
}

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: 'ignore' })
  child.once('error', reject)
  child.once('exit', (code) => code === 0
    ? resolve()
    : reject(new Error(`${command} exited with code ${code}`)))
})

await mkdir(outputDir, { recursive: true })

for (const photo of photos.filter((item) => item.status === 'selected')) {
  const source = path.join(sourceDir, photo.filename)
  const stem = path.parse(photo.filename).name

  for (const width of imageWidths(photo)) {
    const jpeg = path.join(outputDir, `${stem}-${width}.jpg`)
    const avif = path.join(outputDir, `${stem}-${width}.avif`)

    await run('sips', [
      '--resampleWidth', String(width),
      '--setProperty', 'format', 'jpeg',
      '--setProperty', 'formatOptions', '86',
      source,
      '--out', jpeg
    ])

    await run('ffmpeg', [
      '-loglevel', 'error',
      '-y',
      '-i', source,
      '-vf', `scale=${width}:-2:flags=lanczos,format=yuv420p10le`,
      '-c:v', 'libsvtav1',
      '-crf', '28',
      '-preset', '8',
      avif
    ])
  }
}

console.log(`Optimized selected photographs from ${sourceDir}.`)
