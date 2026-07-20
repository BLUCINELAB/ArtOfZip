import type { Genome, GenomeValues } from '../types'
import { createDefaultGenome } from './defaultGenome'

const limits: Record<keyof GenomeValues, readonly [number, number]> = {
  matterDensity: [0.42, 0.82],
  apparentDepth: [0.62, 0.94],
  attentionSensitivity: [0.5, 0.9],
  stillnessSensitivity: [0.58, 0.94],
  withdrawalRate: [0.38, 0.82],
  emergenceRate: [0.18, 0.58],
  tracePersistence: [0.44, 0.86],
  forgettingRate: [0.04, 0.2],
  geometricRigidity: [0.25, 0.72],
  organicDeformation: [0.35, 0.78],
  textScarcity: [0.72, 0.96],
  grainIntensity: [0.16, 0.48],
  anomalyFrequency: [0.04, 0.22],
  responseDelay: [0.42, 0.82],
  defensiveTendency: [0.2, 0.64],
  quiescentTendency: [0.52, 0.88],
  alarmIntensity: [0.06, 0.28],
  meanDarkness: [0.82, 0.96],
  peripheralComplexity: [0.48, 0.88],
  compositionStability: [0.68, 0.94],
}

export class GenomeEngine {
  private genome: Genome

  constructor(genome = createDefaultGenome()) {
    this.genome = structuredClone(genome)
  }

  get current(): Genome {
    return structuredClone(this.genome)
  }

  mutate(key: keyof GenomeValues, delta: number) {
    const [min, max] = limits[key]
    const current = this.genome.values[key]
    this.genome.values[key] = Math.min(max, Math.max(min, current + delta))
  }

  reset(seed = this.genome.seed) {
    this.genome = createDefaultGenome(seed)
  }
}
