import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'

const server = spawn('npm', ['run', 'preview'], { stdio: 'inherit' })

for (let attempt = 0; attempt < 50; attempt += 1) {
  try {
    const response = await fetch('http://127.0.0.1:4173/')
    if (response.ok) break
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const launchOptions = executablePath
  ? { executablePath, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  : {}
const browser = await chromium.launch(launchOptions)

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
await desktop.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await desktop.waitForTimeout(9_000)
await desktop.screenshot({ path: '/tmp/mng-desktop-law.png', fullPage: true })
await desktop.waitForTimeout(7_000)
await desktop.screenshot({ path: '/tmp/mng-desktop-stillness.png', fullPage: true })

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
})
await mobile.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await mobile.waitForTimeout(9_000)
await mobile.screenshot({ path: '/tmp/mng-mobile-law.png', fullPage: true })

await browser.close()
server.kill('SIGTERM')
