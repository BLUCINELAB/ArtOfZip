import type { Genome } from '../types'

export const createDefaultGenome = (seed = Math.random()): Genome => ({
  version: 1,
  seed,
  values: {
    matterDensity: 0.64,
    apparentDepth: 0.81,
    attentionSensitivity: 0.72,
    stillnessSensitivity: 0.78,
    withdrawalRate: 0.58,
    emergenceRate: 0.34,
    tracePersistence: 0.67,
    forgettingRate: 0.09,
    geometricRigidity: 0.46,
    organicDeformation: 0.57,
    textScarcity: 0.84,
    grainIntensity: 0.31,
    anomalyFrequency: 0.12,
    responseDelay: 0.62,
    defensiveTendency: 0.38,
    quiescentTendency: 0.7,
    alarmIntensity: 0.16,
    meanDarkness: 0.91,
    peripheralComplexity: 0.73,
    compositionStability: 0.82,
  },
})
