import type { AttentionSnapshot, SystemState } from '../types'

export class SystemStateMachine {
  private state: SystemState = 'DORMANT'
  private stateSince = 0
  private returnSignalUntil = 0

  get current() {
    return this.state
  }

  markReturn(now: number, absenceDuration: number) {
    this.returnSignalUntil = now + Math.min(8000, 1800 + absenceDuration * 0.2)
  }

  update(
    attention: AttentionSnapshot,
    now: number,
    elapsed: number,
    hidden: boolean,
    mutationActive = false,
  ): SystemState {
    let next: SystemState

    if (hidden) next = 'ABSENT'
    else if (elapsed < 3) next = 'DORMANT'
    else if (now < this.returnSignalUntil) next = 'REMEMBERING'
    else if (mutationActive) next = 'MUTATING'
    else if (attention.speed > 1.45) next = 'DEFENSIVE'
    else if (attention.observationPressure > 0.52) next = 'WITHDRAWING'
    else if (attention.stillness > 16) next = 'QUIESCENT'
    else if (attention.stillness > 3.2) next = 'REVEALING'
    else next = 'SENSING'

    if (next !== this.state && now - this.stateSince > 180) {
      this.state = next
      this.stateSince = now
    }

    return this.state
  }
}
