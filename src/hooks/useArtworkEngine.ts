import { useCallback, useEffect, useRef, useState } from 'react'
import { AccessibilityManager } from '../engine/accessibility/AccessibilityManager'
import { AttentionEngine } from '../engine/attention/AttentionEngine'
import { GenomeEngine } from '../engine/genome/GenomeEngine'
import { MutationEngine } from '../engine/genome/MutationEngine'
import { MemoryEngine } from '../engine/memory/MemoryEngine'
import { PerformanceManager } from '../engine/performance/PerformanceManager'
import { SystemStateMachine } from '../engine/state/SystemStateMachine'
import type {
  AttentionSnapshot,
  DebugMetrics,
  EngineSettings,
  SystemState,
} from '../engine/types'
import type { VisualRenderer as VisualRendererType } from '../engine/visual/VisualRenderer'
import { createDefaultGenome } from '../engine/genome/defaultGenome'

type RenderMode = 'pending' | 'webgl' | 'fallback'

const defaultDebug: DebugMetrics = {
  fps: 0,
  quality: 'balanced',
  state: 'DORMANT',
  pressure: 0,
  stillness: 0,
  activeMemories: 0,
  residues: 0,
  genome: createDefaultGenome(0.5).values,
}

export function useArtworkEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const memoryRef = useRef<MemoryEngine | null>(null)
  const accessibilityRef = useRef<AccessibilityManager | null>(null)
  const [renderMode, setRenderMode] = useState<RenderMode>('pending')
  const [systemState, setSystemState] = useState<SystemState>('DORMANT')
  const [elapsed, setElapsed] = useState(0)
  const [visitCount, setVisitCount] = useState(1)
  const [attentionSnapshot, setAttentionSnapshot] = useState<AttentionSnapshot | null>(null)
  const [debugMetrics, setDebugMetrics] = useState<DebugMetrics>(defaultDebug)
  const [settings, setSettingsState] = useState<EngineSettings>(() => ({
    persistence: localStorage.getItem('mng-private') !== 'true',
    paused: false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: more)').matches,
  }))
  const settingsRef = useRef(settings)

  useEffect(() => {
    settingsRef.current = settings
    memoryRef.current?.setPersistence(settings.persistence)
    localStorage.setItem('mng-private', String(!settings.persistence))
  }, [settings])

  const setSettings = useCallback((next: EngineSettings) => {
    setSettingsState(next)
  }, [])

  const eraseMemory = useCallback(async () => {
    await memoryRef.current?.erase()
    setVisitCount(1)
  }, [])

  useEffect(() => {
    const accessibility = new AccessibilityManager()
    accessibilityRef.current = accessibility
    const unsubscribe = accessibility.subscribe(() => {
      setSettingsState((current) => ({
        ...current,
        reducedMotion: accessibility.reducedMotion,
        highContrast: accessibility.highContrast,
      }))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let animationFrame = 0
    let renderer: VisualRendererType | undefined
    let lastSnapshot: AttentionSnapshot | undefined
    let lastState: SystemState = 'DORMANT'
    let lastAbsence = 0
    let hiddenAt = 0
    let saveMemory = () => Promise.resolve()

    const memoryEngine = new MemoryEngine()
    memoryRef.current = memoryEngine
    memoryEngine.setPersistence(settingsRef.current.persistence)

    const bootstrap = async () => {
      const restored = await memoryEngine.restore()
      if (cancelled) return

      const attentionEngine = new AttentionEngine(
        restored?.columns ?? 32,
        restored?.rows ?? 20,
        restored?.attention,
      )
      const genomeEngine = new GenomeEngine(restored?.genome)
      const mutationEngine = new MutationEngine()
      const stateMachine = new SystemStateMachine()
      const performanceManager = new PerformanceManager(settingsRef.current.reducedMotion)
      const memoryAnchor = restored?.residues[0]
        ? { x: restored.residues[0].x, y: restored.residues[0].y }
        : { x: 0.18 + genomeEngine.current.seed * 0.31, y: 0.68 }

      setVisitCount((restored?.visitCount ?? 0) + 1)

      try {
        const { VisualRenderer } = await import('../engine/visual/VisualRenderer')
        renderer = new VisualRenderer(canvas, attentionEngine.columns, attentionEngine.rows)
        setRenderMode('webgl')
      } catch {
        renderer = undefined
        setRenderMode('fallback')
      }

      const startedAt = performance.now()
      let previousFrame = startedAt
      let lastUiUpdate = 0
      let lastPersist = 0

      saveMemory = async () => {
        if (!lastSnapshot) return
        await memoryEngine.remember(
          lastSnapshot,
          genomeEngine.current,
          lastState,
          (performance.now() - startedAt) / 1000,
        )
      }

      const normalizedInput = (event: PointerEvent, pressed: boolean) => {
        attentionEngine.input(
          event.clientX / Math.max(window.innerWidth, 1),
          event.clientY / Math.max(window.innerHeight, 1),
          performance.now(),
          pressed,
        )
      }

      const onMove = (event: PointerEvent) => normalizedInput(event, event.buttons > 0)
      const onDown = (event: PointerEvent) => normalizedInput(event, true)
      const onUp = (event: PointerEvent) => normalizedInput(event, false)
      const onLeave = () => attentionEngine.leave()
      const onVisibility = () => {
        if (document.hidden) {
          hiddenAt = Date.now()
          if (lastSnapshot) {
            lastState = stateMachine.update(
              lastSnapshot,
              performance.now(),
              (performance.now() - startedAt) / 1000,
              true,
            )
            setSystemState('ABSENT')
          }
          void saveMemory()
        } else if (hiddenAt > 0) {
          lastAbsence = Math.max(0, (Date.now() - hiddenAt) / 1000)
          hiddenAt = 0
          attentionEngine.markReturn()
          stateMachine.markReturn(performance.now(), lastAbsence * 1000)
          const mutation = Math.min(0.018, lastAbsence / 100_000)
          genomeEngine.mutate('apparentDepth', mutation)
          genomeEngine.mutate('peripheralComplexity', mutation * 0.7)
        }
      }
      const onPageHide = () => void saveMemory()

      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onDown, { passive: true })
      window.addEventListener('pointerup', onUp, { passive: true })
      window.addEventListener('pointerleave', onLeave, { passive: true })
      document.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('pagehide', onPageHide)

      const frame = (now: number) => {
        if (cancelled) return
        const rawDelta = Math.min(0.1, Math.max(0, (now - previousFrame) / 1000))
        const delta = settingsRef.current.paused ? 0 : rawDelta
        previousFrame = now
        const sessionElapsed = (now - startedAt) / 1000
        const snapshot = delta > 0
          ? attentionEngine.update(delta, now)
          : attentionEngine.snapshot()
        lastSnapshot = snapshot

        let nextState = stateMachine.update(
          snapshot,
          now,
          sessionElapsed,
          document.hidden,
          mutationEngine.active,
        )
        const mutated = !settingsRef.current.paused
          && mutationEngine.update(delta, snapshot, nextState, genomeEngine)
        if (mutated) {
          nextState = stateMachine.update(snapshot, now, sessionElapsed, false, true)
        }
        lastState = nextState

        const quality = performanceManager.sample(rawDelta)
        if (renderer && !document.hidden) {
          renderer.render({
            time: settingsRef.current.paused ? previousFrame / 1000 : sessionElapsed,
            attention: snapshot,
            genome: genomeEngine.current,
            state: nextState,
            quality,
            pixelRatio: Math.min(window.devicePixelRatio, performanceManager.pixelRatioLimit),
            absence: lastAbsence,
            reducedMotion: settingsRef.current.reducedMotion,
            highContrast: settingsRef.current.highContrast,
            memoryAnchor,
          })
        }

        if (now - lastUiUpdate > 250) {
          lastUiUpdate = now
          setElapsed(sessionElapsed)
          setSystemState(nextState)
          setAttentionSnapshot(snapshot)
          setDebugMetrics({
            fps: rawDelta > 0 ? 1 / rawDelta : 0,
            quality,
            state: nextState,
            pressure: snapshot.observationPressure,
            stillness: snapshot.stillness,
            activeMemories: restored?.attention.filter((value) => value > 0.08).length ?? 0,
            residues: restored?.residues.length ?? 0,
            genome: genomeEngine.current.values,
          })
        }

        if (now - lastPersist > 12_000) {
          lastPersist = now
          void saveMemory()
        }

        animationFrame = requestAnimationFrame(frame)
      }

      animationFrame = requestAnimationFrame(frame)

      return () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointerleave', onLeave)
        document.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('pagehide', onPageHide)
      }
    }

    let removeListeners: (() => void) | undefined
    void bootstrap().then((cleanup) => {
      removeListeners = cleanup
      if (cancelled) cleanup?.()
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrame)
      removeListeners?.()
      renderer?.dispose()
      void saveMemory()
    }
  }, [])

  const debugEnabled = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('debug') === '1'

  return {
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
  }
}
