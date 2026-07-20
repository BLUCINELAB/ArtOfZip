import { useEffect, useState } from 'react'
import './App.css'
import { CanvasFallback } from './components/CanvasFallback'
import { InfoPanel } from './components/InfoPanel'
import { DebugLayer } from './debug/DebugLayer'
import { TypographyLayer } from './engine/typography/TypographyLayer'
import { useArtworkEngine } from './hooks/useArtworkEngine'

function App() {
  const [infoOpen, setInfoOpen] = useState(false)
  const {
    canvasRef,
    renderMode,
    systemState,
    elapsed,
    visitCount,
    attentionSnapshot,
    debugMetrics,
    debugEnabled,
    settings,
    setSettings,
    eraseMemory,
  } = useArtworkEngine()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'i' && !event.metaKey && !event.ctrlKey) {
        setInfoOpen((open) => !open)
      }
      if (event.key === 'Escape') setInfoOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main
      className={`artwork artwork--${systemState.toLowerCase()}`}
      data-state={systemState}
      data-render-mode={renderMode}
    >
      {renderMode !== 'fallback' && (
        <canvas
          ref={canvasRef}
          className="visual-canvas"
          data-renderer="webgl"
          aria-hidden="true"
        />
      )}
      {renderMode === 'fallback' && (
        <CanvasFallback
          reducedMotion={settings.reducedMotion}
          highContrast={settings.highContrast}
        />
      )}
      <TypographyLayer
        elapsed={elapsed}
        state={systemState}
        visitCount={visitCount}
      />

      <button
        className="info-trigger"
        type="button"
        aria-label="Informazioni e accessibilità"
        aria-expanded={infoOpen}
        onClick={() => setInfoOpen(true)}
      >
        <span aria-hidden="true" />
      </button>

      <InfoPanel
        open={infoOpen}
        settings={settings}
        onClose={() => setInfoOpen(false)}
        onSettings={setSettings}
        onEraseMemory={eraseMemory}
      />

      <p className="sr-only" aria-live="polite">
        {settings.paused
          ? 'Trasformazioni in pausa.'
          : `Il campo è nello stato ${systemState.toLowerCase()}.`}
      </p>

      {debugEnabled && (
        <DebugLayer metrics={debugMetrics} attention={attentionSnapshot} />
      )}
    </main>
  )
}

export default App
