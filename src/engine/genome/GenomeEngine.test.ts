import { describe, expect, it } from 'vitest'
import { GenomeEngine } from './GenomeEngine'

describe('GenomeEngine', () => {
  it('mutates slowly without leaving aesthetic bounds', () => {
    const genome = new GenomeEngine()
    genome.mutate('meanDarkness', -100)
    expect(genome.current.values.meanDarkness).toBe(0.82)
    genome.mutate('alarmIntensity', 100)
    expect(genome.current.values.alarmIntensity).toBe(0.28)
  })
})
