import { describe, expect, it } from 'vitest'
import { AttentionEngine } from './AttentionEngine'

describe('AttentionEngine', () => {
  it('accumulates matter consumption around prolonged observation', () => {
    const engine = new AttentionEngine(12, 8)
    let now = 1000
    engine.input(0.5, 0.5, now)
    for (let index = 0; index < 120; index += 1) {
      now += 16
      engine.input(0.5, 0.5, now)
      engine.update(0.016, now)
    }
    const snapshot = engine.snapshot()
    const center = snapshot.heat[4 * 12 + 6] ?? 0
    const corner = snapshot.heat[0] ?? 0
    expect(center).toBeGreaterThan(0.4)
    expect(center).toBeGreaterThan(corner * 8)
  })

  it('makes stillness richer than frantic movement', () => {
    const engine = new AttentionEngine()
    let now = 1000
    engine.input(0.2, 0.2, now)
    for (let index = 0; index < 250; index += 1) {
      now += 16
      engine.update(0.016, now)
    }
    expect(engine.snapshot().stillness).toBeGreaterThan(3)
  })
})
