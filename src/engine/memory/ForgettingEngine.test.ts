import { describe, expect, it } from 'vitest'
import { createDefaultGenome } from '../genome/defaultGenome'
import type { SessionMemory } from '../types'
import { metabolizeMemory } from './ForgettingEngine'

const DAY = 86_400_000

const memory = (lastVisit: number): SessionMemory => ({
  id: 'local',
  version: 1,
  seed: 0.3,
  attention: [1, 0.5, 0.2, 0],
  columns: 2,
  rows: 2,
  residues: [
    { x: 0.2, y: 0.2, intensity: 0.8, age: 0, decayRate: 0.1, protectedUntil: 0 },
    { x: 0.23, y: 0.22, intensity: 0.5, age: 0, decayRate: 0.1, protectedUntil: 0 },
  ],
  consumedRegions: [0],
  survivedRegions: [3],
  sessionDuration: 20,
  averageMovement: 0.2,
  stillnessDuration: 6,
  visitCount: 1,
  finalState: 'QUIESCENT',
  genome: createDefaultGenome(0.3),
  lastVisit,
})

describe('ForgettingEngine', () => {
  it('decays attention and fuses nearby residues', () => {
    const now = Date.now()
    const result = metabolizeMemory(memory(now - 10 * DAY), now)
    expect(result.attention[0]).toBeLessThan(1)
    expect(result.residues).toHaveLength(1)
    expect(result.residues[0]?.intensity).toBeGreaterThan(0)
  })
})
