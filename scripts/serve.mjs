import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'

const root = path.resolve(process.argv[2] ?? 'dist')
const port = Number(process.argv[3] ?? 4173)
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
}

const resolveFile = async (urlPath) => {
  const safePath = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '')
  let file = path.join(root, safePath)
  if (!path.extname(file)) file = path.join(file, 'index.html')
  try {
    if ((await stat(file)).isFile()) return file
  } catch {}
  return path.join(root, '404.html')
}

const server = http.createServer(async (request, response) => {
  const file = await resolveFile(request.url ?? '/')
  const statusCode = file.endsWith('404.html') ? 404 : 200
  const extension = path.extname(file).toLowerCase()
  response.writeHead(statusCode, {
    'Content-Type': mime[extension] ?? 'application/octet-stream',
    'Cache-Control': 'no-store'
  })
  createReadStream(file).pipe(response)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Preview available at http://127.0.0.1:${port}`)
})
