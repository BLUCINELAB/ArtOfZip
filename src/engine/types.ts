export type SystemState =
  | 'DORMANT'
  | 'SENSING'
  | 'WITHDRAWING'
  | 'REVEALING'
  | 'REMEMBERING'
  | 'DEFENSIVE'
  | 'ABSENT'
  | 'QUIESCENT'
  | 'MUTATING'

export type QualityLevel = 'high' | 'balanced' | 'reduced'

export interface AttentionSnapshot {
  heat: Float32Array
  columns: number
  rows: number
  pointer: { x: number; y: number }
  pointerActive: boolean
  speed: number
  dwell: number
  stillness: number
  observationPressure: number
  ignoredCentroid: { x: number; y: number }
  returns: number
}

export interface GenomeValues {
  matterDensity: number
  apparentDepth: number
  attentionSensitivity: number
  stillnessSensitivity: number
  withdrawalRate: number
  emergenceRate: number
  tracePersistence: number
  forgettingRate: number
  geometricRigidity: number
  organicDeformation: number
  textScarcity: number
  grainIntensity: number
  anomalyFrequency: number
  responseDelay: number
  defensiveTendency: number
  quiescentTendency: number
  alarmIntensity: number
  meanDarkness: number
  peripheralComplexity: number
  compositionStability: number
}

export interface Genome {
  version: number
  seed: number
  values: GenomeValues
}

export interface MemoryResidue {
  x: number
  y: number
  intensity: number
  age: number
  decayRate: number
  protectedUntil: number
}

export interface SessionMemory {
  id: 'local'
  version: number
  seed: number
  attention: number[]
  columns: number
  rows: number
  residues: MemoryResidue[]
  consumedRegions: number[]
  survivedRegions: number[]
  sessionDuration: number
  averageMovement: number
  stillnessDuration: number
  visitCount: number
  finalState: SystemState
  genome: Genome
  lastVisit: number
}

export interface EngineSettings {
  persistence: boolean
  paused: boolean
  highContrast: boolean
  reducedMotion: boolean
}

export interface DebugMetrics {
  fps: number
  quality: QualityLevel
  state: SystemState
  pressure: number
  stillness: number
  activeMemories: number
  residues: number
  genome: GenomeValues
}
