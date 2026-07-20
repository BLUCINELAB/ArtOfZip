const CACHE = 'mentre-non-guardavi-v3'

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    const rootUrl = new URL('./', self.registration.scope)
    const documentResponse = await fetch(rootUrl)
    const documentText = await documentResponse.clone().text()
    await cache.put(rootUrl, documentResponse)

    const references = Array.from(
      documentText.matchAll(/(?:src|href)="([^"]+)"/g),
      (match) => new URL(match[1], rootUrl),
    ).filter((url) => url.origin === rootUrl.origin)

    for (const resourceUrl of references) {
      const response = await fetch(resourceUrl)
      const source = resourceUrl.pathname.endsWith('.js')
        ? await response.clone().text()
        : ''
      await cache.put(resourceUrl, response)

      const dynamicImports = Array.from(
        source.matchAll(/import\(["'`](\.\/[^"'`]+\.js)["'`]\)/g),
        (match) => new URL(match[1], resourceUrl),
      )
      await Promise.all(dynamicImports.map(async (url) => {
        const dynamicResponse = await fetch(url)
        await cache.put(url, dynamicResponse)
      }))
    }
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(
      keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
    )
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) return

  const update = async () => {
    const response = await fetch(event.request)
    if (response.ok) {
      const cache = await caches.open(CACHE)
      await cache.put(event.request, response.clone())
    }
    return response
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request)
    if (cached) {
      if (self.navigator.onLine) {
        event.waitUntil(update().catch(() => undefined))
      }
      return cached
    }
    return update()
  })())
})
