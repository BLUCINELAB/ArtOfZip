import { describe, expect, it } from 'vitest'
import { createDefaultGenome } from '../genome/defaultGenome'
import type { AttentionSnapshot } from '../types'
import { MemoryEngine } from './MemoryEngine'

const attention: AttentionSnapshot = {
  heat: new Float32Array([0.9, 0.4, 0.1, 0]),
  columns: 2,
  rows: 2,
  pointer: { x: 0.5, y: 0.5 },
  pointerActive: true,
  speed: 0.1,
  dwell: 2,
  stillness: 7,
  observationPressure: 0.3,
  ignoredCentroid: { x: 0.7, y: 0.7 },
  returns: 0,
}

describe('MemoryEngine', () => {
  it('persists, restores and completely erases local residues', async () => {
    const writer = new MemoryEngine()
    await writer.erase()
    await writer.remember(attention, createDefaultGenome(0.42), 'REVEALING', 18)

    const reader = new MemoryEngine()
    const restored = await reader.restore()
    expect(restored?.attention[0]).toBeCloseTo(0.9)
    expect(restored?.residues.length).toBeGreaterThan(0)
    expect(restored?.seed).toBe(0.42)

    await reader.erase()
    expect(await new MemoryEngine().restore()).toBeUndefined()
  })
})
