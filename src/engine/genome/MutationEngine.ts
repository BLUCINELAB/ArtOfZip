import type { AttentionSnapshot, GenomeValues, SystemState } from '../types'
import type { GenomeEngine } from './GenomeEngine'

const mutableKeys: (keyof GenomeValues)[] = [
  'matterDensity',
  'apparentDepth',
  'organicDeformation',
  'peripheralComplexity',
  'compositionStability',
  'responseDelay',
]

export class MutationEngine {
  private accumulator = 0
  private mutationClock = 0

  update(
    deltaSeconds: number,
    attention: AttentionSnapshot,
    state: SystemState,
    genome: GenomeEngine,
  ) {
    const quietFactor = state === 'QUIESCENT' || state === 'REMEMBERING' ? 1 : 0.12
    this.accumulator += deltaSeconds * quietFactor
    this.mutationClock = Math.max(0, this.mutationClock - deltaSeconds)

    if (this.accumulator < 12) return false
    this.accumulator = 0
    this.mutationClock = 1.8
    const index = Math.floor(
      (attention.ignoredCentroid.x * 13 + attention.ignoredCentroid.y * 7) * mutableKeys.length,
    ) % mutableKeys.length
    const key = mutableKeys[index] ?? 'apparentDepth'
    const direction = attention.ignoredCentroid.y > 0.5 ? 1 : -1
    genome.mutate(key, direction * 0.004)
    return true
  }

  get active() {
    return this.mutationClock > 0
  }
}
