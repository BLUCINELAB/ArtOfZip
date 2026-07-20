import type { MemoryResidue, SessionMemory } from '../types'

const DAY = 86_400_000

export const decayResidue = (residue: MemoryResidue, elapsedDays: number): MemoryResidue => ({
  ...residue,
  age: residue.age + elapsedDays,
  intensity: Date.now() < residue.protectedUntil
    ? residue.intensity
    : residue.intensity * Math.exp(-residue.decayRate * elapsedDays),
})

export const metabolizeMemory = (
  memory: SessionMemory,
  now = Date.now(),
): SessionMemory => {
  const elapsedDays = Math.max(0, (now - memory.lastVisit) / DAY)
  const residueCandidates = memory.residues
    .map((residue) => decayResidue(residue, elapsedDays))
    .filter((residue) => residue.intensity > 0.035)

  const merged: MemoryResidue[] = []
  for (const residue of residueCandidates) {
    const related = merged.find(
      (item) => Math.hypot(item.x - residue.x, item.y - residue.y) < 0.09,
    )
    if (related) {
      const total = related.intensity + residue.intensity
      related.x = (related.x * related.intensity + residue.x * residue.intensity) / total
      related.y = (related.y * related.intensity + residue.y * residue.intensity) / total
      related.intensity = Math.min(1, total * 0.72)
      related.age = Math.max(related.age, residue.age)
    } else {
      merged.push({ ...residue })
    }
  }

  const attentionDecay = Math.exp(-elapsedDays * memory.genome.values.forgettingRate)

  return {
    ...memory,
    attention: memory.attention.map((value) => value * attentionDecay),
    residues: merged.slice(0, 24),
  }
}
