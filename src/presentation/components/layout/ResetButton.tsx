import { Eraser, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useActiveSolution } from '../../context/activeSolution'

const WIPED = 'propuestas, solución activa, estimaciones de costos, región, tema y notificaciones'

/** Two ways to start over: an empty workspace to fill by hand, or back to the example data. */
export function ResetButton() {
  const { startBlank, resetAll } = useActiveSolution()
  const [busy, setBusy] = useState(false)

  const run = async (message: string, action: () => Promise<void>) => {
    if (!window.confirm(message)) return
    setBusy(true)
    await action()
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          run(
            `¿Empezar en blanco?\n\nSe borrarán ${WIPED}, y no se mostrará ningún dato de ejemplo: solo el catálogo de AWS y sus regiones para que lo llenes tú.`,
            startBlank,
          )
        }
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-white/20 disabled:opacity-50"
      >
        <Eraser size={14} />
        Empezar en blanco
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          run(`¿Restaurar los datos de ejemplo?\n\nSe borrarán ${WIPED}, y volverán los datos de referencia.`, resetAll)
        }
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors duration-200 hover:border-white/30 hover:text-white disabled:opacity-50"
      >
        <RotateCcw size={14} />
        {busy ? 'Restableciendo…' : 'Restaurar datos de ejemplo'}
      </button>
    </div>
  )
}
