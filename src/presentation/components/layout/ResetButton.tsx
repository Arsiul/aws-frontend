import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useActiveSolution } from '../../context/activeSolution'

/** Wipes every saved datum (proposals, costs, region, theme, notifications) after confirmation. */
export function ResetButton() {
  const { resetAll } = useActiveSolution()
  const [isResetting, setIsResetting] = useState(false)

  const handleClick = async () => {
    const confirmed = window.confirm(
      '¿Restablecer todo desde cero?\n\nSe borrarán las propuestas, la solución activa, las estimaciones de costos, la región, el tema y las notificaciones guardadas.',
    )
    if (!confirmed) return
    setIsResetting(true)
    await resetAll()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isResetting}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors duration-200 hover:border-alert/50 hover:bg-alert/10 hover:text-white disabled:opacity-50"
    >
      <RotateCcw size={14} />
      {isResetting ? 'Restableciendo…' : 'Restablecer todo'}
    </button>
  )
}
