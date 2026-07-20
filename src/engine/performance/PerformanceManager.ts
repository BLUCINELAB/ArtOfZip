import type { QualityLevel } from '../types'

export class PerformanceManager {
  private samples: number[] = []
  private level: QualityLevel

  constructor(reducedMotion = false) {
    const memory = navigator.deviceMemory ?? 4
    const cores = navigator.hardwareConcurrency ?? 4
    this.level = reducedMotion || memory <= 2 || cores <= 2
      ? 'reduced'
      : memory >= 8 && cores >= 6
        ? 'high'
        : 'balanced'
  }

  sample(deltaSeconds: number) {
    if (deltaSeconds <= 0 || deltaSeconds > 1) return this.level
    this.samples.push(1 / deltaSeconds)
    if (this.samples.length < 90) return this.level

    const average = this.samples.reduce((sum, value) => sum + value, 0) / this.samples.length
    this.samples = []
    if (average < 27) this.level = 'reduced'
    else if (average < 48 && this.level === 'high') this.level = 'balanced'
    return this.level
  }

  get quality() {
    return this.level
  }

  get pixelRatioLimit() {
    if (this.level === 'high') return 1.75
    if (this.level === 'balanced') return 1.25
    return 1
  }
}

declare global {
  interface Navigator {
    deviceMemory?: number
  }
}
