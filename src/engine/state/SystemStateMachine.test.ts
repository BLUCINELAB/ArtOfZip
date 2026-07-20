import { describe, expect, it } from 'vitest'
import type { AttentionSnapshot } from '../types'
import { SystemStateMachine } from './SystemStateMachine'

const snapshot = (overrides: Partial<AttentionSnapshot> = {}): AttentionSnapshot => ({
  heat: new Float32Array(4),
  columns: 2,
  rows: 2,
  pointer: { x: 0.5, y: 0.5 },
  pointerActive: true,
  speed: 0,
  dwell: 0,
  stillness: 0,
  observationPressure: 0,
  ignoredCentroid: { x: 0.5, y: 0.5 },
  returns: 0,
  ...overrides,
})

describe('SystemStateMachine', () => {
  it('enters revealing after sustained stillness', () => {
    const machine = new SystemStateMachine()
    machine.update(snapshot(), 1000, 4, false)
    expect(machine.update(snapshot({ stillness: 5 }), 1400, 4.4, false)).toBe('REVEALING')
  })

  it('defends itself from frantic movement', () => {
    const machine = new SystemStateMachine()
    machine.update(snapshot(), 1000, 4, false)
    expect(machine.update(snapshot({ speed: 2 }), 1400, 4.4, false)).toBe('DEFENSIVE')
  })

  it('continues as absent when the tab is hidden', () => {
    const machine = new SystemStateMachine()
    expect(machine.update(snapshot(), 1000, 5, true)).toBe('ABSENT')
  })
})
