import type {
  AttentionSnapshot,
  Genome,
  MemoryResidue,
  SessionMemory,
  SystemState,
} from '../types'
import { IndexedDbStore } from '../persistence/IndexedDbStore'
import { metabolizeMemory } from './ForgettingEngine'

export class MemoryEngine {
  private readonly store = new IndexedDbStore()
  private persistence = true
  private previous: SessionMemory | undefined

  async restore() {
    if (!this.persistence) return undefined
    try {
      const stored = await this.store.read()
      this.previous = stored ? metabolizeMemory(stored) : undefined
      return this.previous
    } catch {
      return undefined
    }
  }

  setPersistence(enabled: boolean) {
    this.persistence = enabled
  }

  async remember(
    attention: AttentionSnapshot,
    genome: Genome,
    state: SystemState,
    sessionDuration: number,
  ) {
    if (!this.persistence) return

    const heat = Array.from(attention.heat)
    const ranked = heat
      .map((intensity, index) => ({ intensity, index }))
      .sort((a, b) => b.intensity - a.intensity)
    const consumedRegions = ranked.slice(0, 12).map((item) => item.index)
    const survivedRegions = ranked.slice(-12).map((item) => item.index)
    const now = Date.now()
    const newResidues: MemoryResidue[] = survivedRegions.slice(0, 6).map((index, order) => ({
      x: ((index % attention.columns) + 0.5) / attention.columns,
      y: (Math.floor(index / attention.columns) + 0.5) / attention.rows,
      intensity: Math.max(0.08, 0.38 - order * 0.04),
      age: 0,
      decayRate: 0.08 + order * 0.015,
      protectedUntil: order === 0 ? now + 86_400_000 : now,
    }))

    const memory: SessionMemory = {
      id: 'local',
      version: 1,
      seed: genome.seed,
      attention: heat,
      columns: attention.columns,
      rows: attention.rows,
      residues: [...(this.previous?.residues ?? []), ...newResidues].slice(-24),
      consumedRegions,
      survivedRegions,
      sessionDuration,
      averageMovement: attention.speed,
      stillnessDuration: attention.stillness,
      visitCount: (this.previous?.visitCount ?? 0) + 1,
      finalState: state,
      genome,
      lastVisit: now,
    }

    try {
      await this.store.write(memory)
      this.previous = memory
    } catch {
      // Persistence failure must not interrupt the artwork.
    }
  }

  async erase() {
    this.previous = undefined
    try {
      await this.store.clear()
    } catch {
      // The in-memory state is already cleared.
    }
  }
}
