import { useEffect, useRef } from 'react'
import type { EngineSettings } from '../engine/types'

interface InfoPanelProps {
  open: boolean
  settings: EngineSettings
  onClose: () => void
  onSettings: (settings: EngineSettings) => void
  onEraseMemory: () => Promise<void>
}

export function InfoPanel({
  open,
  settings,
  onClose,
  onSettings,
  onEraseMemory,
}: InfoPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  return (
    <aside className={open ? 'info-panel info-panel--open' : 'info-panel'} aria-hidden={!open}>
      <button ref={closeRef} className="panel-close" type="button" onClick={onClose} tabIndex={open ? 0 : -1}>
        Chiudi <span aria-hidden="true">×</span>
      </button>
      <div className="panel-content">
        <p className="panel-index">OPERA DIGITALE / 2026</p>
        <h1>Mentre non guardavi</h1>
        <p className="statement">
          Ciò che viene osservato perde materia. Ciò che resta fuori dallo sguardo
          accumula profondità, memoria e possibilità di riemergere.
        </p>
        <p>
          Il sistema utilizza soltanto posizione, ritmo e pause del puntatore o
          del tocco. Non accede a camera, microfono, identità o posizione geografica.
        </p>

        <fieldset>
          <legend>Condizioni di accesso</legend>
          <label>
            <input
              type="checkbox"
              checked={settings.paused}
              onChange={(event) => onSettings({ ...settings, paused: event.target.checked })}
            />
            Metti in pausa le trasformazioni
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(event) => onSettings({ ...settings, reducedMotion: event.target.checked })}
            />
            Riduci il movimento
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(event) => onSettings({ ...settings, highContrast: event.target.checked })}
            />
            Aumenta il contrasto
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.persistence}
              onChange={(event) => onSettings({ ...settings, persistence: event.target.checked })}
            />
            Conserva residui su questo dispositivo
          </label>
        </fieldset>

        <button className="erase" type="button" onClick={() => void onEraseMemory()}>
          Cancella completamente la memoria locale
        </button>
        <p className="panel-note">Tasto I: informazioni · Esc: chiudi</p>
      </div>
    </aside>
  )
}
