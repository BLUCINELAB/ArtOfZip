import type { SystemState } from '../types'

interface TypographyLayerProps {
  elapsed: number
  state: SystemState
  visitCount: number
}

export const selectTypographyEvent = (
  elapsed: number,
  state: SystemState,
  visitCount: number,
) => {
  if (elapsed >= 8 && elapsed < 19) return 'Ciò che guardi si ritira.'
  if (state === 'REMEMBERING' && elapsed > 5) {
    return visitCount > 1
      ? 'L’assenza ha continuato a lavorare.'
      : 'È cambiato mentre non guardavi.'
  }
  if ((state === 'REVEALING' || state === 'QUIESCENT') && elapsed > 22 && elapsed < 39) {
    return 'Ciò che ignori continua a formarsi.'
  }
  if (state === 'QUIESCENT' && elapsed > 68 && elapsed < 82) {
    return 'Qualcosa è rimasto fuori dal tuo sguardo.'
  }
  return ''
}

export function TypographyLayer({ elapsed, state, visitCount }: TypographyLayerProps) {
  const message = selectTypographyEvent(elapsed, state, visitCount)

  return (
    <div className="typography-layer" aria-live="polite" aria-atomic="true">
      <div className="monument" aria-hidden="true">
        <span className="monument__while">MENTRE</span>
        <span className="monument__unseen">NON GUARDAVI</span>
      </div>
      <p className={message ? 'law law--visible' : 'law'}>{message}</p>
      <div className="coordinates" aria-hidden="true">
        <span>MN/G 01</span>
        <span>CAMPO PERCETTIVO</span>
      </div>
    </div>
  )
}
