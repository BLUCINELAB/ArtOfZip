import type { AttentionSnapshot, DebugMetrics } from '../engine/types'

interface DebugLayerProps {
  metrics: DebugMetrics
  attention: AttentionSnapshot | null
}

export function DebugLayer({ metrics, attention }: DebugLayerProps) {
  return (
    <aside className="debug-layer" aria-label="Debug engine">
      <p>{metrics.state} · {metrics.fps.toFixed(0)} FPS · {metrics.quality}</p>
      <p>pressure {metrics.pressure.toFixed(3)} · still {metrics.stillness.toFixed(2)}s</p>
      <p>memory {metrics.activeMemories} · residues {metrics.residues}</p>
      {attention && (
        <div
          className="debug-grid"
          style={{ gridTemplateColumns: `repeat(${attention.columns}, 1fr)` }}
        >
          {Array.from(attention.heat).map((value, index) => (
            <i key={index} style={{ opacity: value }} />
          ))}
        </div>
      )}
    </aside>
  )
}
