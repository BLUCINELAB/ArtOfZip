import { expect, test } from '@playwright/test'

test('runs the production field without console or shader errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('./')
  await page.waitForTimeout(1_500)
  await expect(page.locator('main.artwork')).toHaveAttribute('data-render-mode', /webgl|fallback/)
  expect(errors).toEqual([])
})

test('enters the artwork without a conventional interface', async ({ page }) => {
  await page.goto('./')
  const artwork = page.locator('main.artwork')
  await expect(artwork).toBeVisible()
  await expect(page.locator('canvas.visual-canvas')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Informazioni e accessibilità' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Mentre non guardavi' })).toBeHidden()
})

test('offers privacy and accessibility controls', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Informazioni e accessibilità' }).click()
  await expect(page.getByRole('heading', { name: 'Mentre non guardavi' })).toBeVisible()
  await page.getByLabel('Riduci il movimento').check()
  await page.getByLabel('Aumenta il contrasto').check()
  await page.getByLabel('Conserva residui su questo dispositivo').uncheck()
  await expect(page.getByLabel('Riduci il movimento')).toBeChecked()
})

test('preserves the artwork through the Canvas 2D fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (contextId, ...args) {
      if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
        return null
      }
      return Reflect.apply(original, this, [contextId, ...args])
    } as typeof original
  })
  await page.goto('./')
  await expect(page.locator('main.artwork')).toHaveAttribute('data-render-mode', 'fallback')
  await expect(page.locator('canvas[data-renderer="canvas-fallback"]')).toBeVisible()
})

test('serves every production resource without a network connection', async ({ page, context }) => {
  await page.goto('./')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  const cachedEntries = await page.evaluate(async () => {
    const keys = await caches.keys()
    const entries = await Promise.all(keys.map(async (key) => (
      await caches.open(key).then((cache) => cache.keys())
    )))
    return entries.flat().map((request) => request.url)
  })
  expect(cachedEntries.length).toBeGreaterThanOrEqual(5)
  await context.setOffline(true)
  await page.waitForTimeout(100)
  const offlineResponses = await page.evaluate(async (urls) => {
    const results: boolean[] = []
    for (const url of urls) {
      try {
        results.push((await fetch(url)).ok)
      } catch {
        results.push(false)
      }
    }
    return results
  }, cachedEntries)
  expect(offlineResponses.every(Boolean)).toBe(true)
  await context.setOffline(false)
})

test('responds to pointer pressure without navigation', async ({ page }) => {
  await page.goto('./')
  const artwork = page.locator('main.artwork')
  const box = await artwork.boundingBox()
  expect(box).not.toBeNull()
  if (box) {
    await page.mouse.move(box.width * 0.55, box.height * 0.48)
    await page.mouse.down()
    await page.waitForTimeout(650)
    await page.mouse.up()
  }
  await expect(artwork).toHaveAttribute('data-state', /SENSING|WITHDRAWING|DEFENSIVE|REVEALING/)
})
