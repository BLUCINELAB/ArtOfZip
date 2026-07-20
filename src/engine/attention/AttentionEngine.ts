import type { AttentionSnapshot } from '../types'

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value))

export class AttentionEngine {
  readonly columns: number
  readonly rows: number
  private readonly heat: Float32Array
  private pointer = { x: 0.5, y: 0.5 }
  private previousPointer = { x: 0.5, y: 0.5 }
  private pointerActive = false
  private pressed = false
  private lastInputAt = 0
  private speed = 0
  private dwell = 0
  private stillness = 0
  private returns = 0

  constructor(columns = 32, rows = 20, initialHeat?: readonly number[]) {
    this.columns = columns
    this.rows = rows
    this.heat = new Float32Array(columns * rows)
    if (initialHeat) {
      initialHeat.slice(0, this.heat.length).forEach((value, index) => {
        this.heat[index] = clamp(value)
      })
    }
  }

  input(x: number, y: number, now: number, pressed = false) {
    const next = { x: clamp(x), y: clamp(y) }
    const dt = this.lastInputAt > 0 ? Math.max((now - this.lastInputAt) / 1000, 1 / 240) : 1 / 60
    const distance = Math.hypot(
      next.x - this.previousPointer.x,
      next.y - this.previousPointer.y,
    )

    this.speed = clamp(distance / dt, 0, 4)
    if (distance < 0.008) this.dwell += dt
    else this.dwell = Math.max(0, this.dwell - dt * 1.8)

    this.pointer = next
    this.previousPointer = next
    this.pointerActive = true
    this.pressed = pressed
    this.lastInputAt = now
  }

  leave() {
    this.pointerActive = false
    this.pressed = false
  }

  markReturn() {
    this.returns += 1
  }

  update(deltaSeconds: number, now: number): AttentionSnapshot {
    const sinceInput = this.lastInputAt > 0 ? (now - this.lastInputAt) / 1000 : Infinity
    this.speed *= Math.exp(-deltaSeconds * 8)

    if (sinceInput > 0.28 || this.speed < 0.025) {
      this.stillness = Math.min(90, this.stillness + deltaSeconds)
      this.dwell = Math.min(30, this.dwell + deltaSeconds * 0.18)
    } else {
      this.stillness = Math.max(0, this.stillness - deltaSeconds * 2.4)
    }

    const radius = this.pressed ? 0.16 : 0.105
    const attentionGain = (this.pressed ? 0.95 : 0.48) * deltaSeconds
    const persistence = Math.exp(-deltaSeconds * 0.018)

    for (let row = 0; row < this.rows; row += 1) {
      for (let column = 0; column < this.columns; column += 1) {
        const index = row * this.columns + column
        const current = this.heat[index] ?? 0
        let next = current * persistence
        if (this.pointerActive) {
          const cellX = (column + 0.5) / this.columns
          const cellY = (row + 0.5) / this.rows
          const distance = Math.hypot(cellX - this.pointer.x, cellY - this.pointer.y)
          const influence = Math.exp(-(distance * distance) / (radius * radius))
          next += influence * attentionGain
        }
        this.heat[index] = clamp(next)
      }
    }

    return this.snapshot()
  }

  snapshot(): AttentionSnapshot {
    let weight = 0
    let ignoredX = 0
    let ignoredY = 0

    for (let row = 0; row < this.rows; row += 1) {
      for (let column = 0; column < this.columns; column += 1) {
        const index = row * this.columns + column
        const ignored = 1 - (this.heat[index] ?? 0)
        weight += ignored
        ignoredX += ((column + 0.5) / this.columns) * ignored
        ignoredY += ((row + 0.5) / this.rows) * ignored
      }
    }

    const pressure = clamp(
      this.dwell * 0.055 + this.speed * 0.16 + (this.pressed ? 0.32 : 0),
    )

    return {
      heat: this.heat,
      columns: this.columns,
      rows: this.rows,
      pointer: { ...this.pointer },
      pointerActive: this.pointerActive,
      speed: this.speed,
      dwell: this.dwell,
      stillness: this.stillness,
      observationPressure: pressure,
      ignoredCentroid: weight > 0
        ? { x: ignoredX / weight, y: ignoredY / weight }
        : { x: 0.5, y: 0.5 },
      returns: this.returns,
    }
  }
}
