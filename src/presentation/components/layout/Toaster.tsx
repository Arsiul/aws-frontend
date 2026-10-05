import { X } from 'lucide-react'
import { useNotifications } from '../../context/notifications'
import { NOTIFICATION_COLORS, NOTIFICATION_ICONS } from './notificationStyles'

export function Toaster() {
  const { toasts, dismissToast } = useNotifications()

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 right-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96 print:hidden"
    >
      {toasts.map((toast) => {
        const Icon = NOTIFICATION_ICONS[toast.tone]
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full animate-slideInRight gap-3 rounded-card border border-border bg-card p-4 shadow-xl"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${NOTIFICATION_COLORS[toast.tone]}`}
            >
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-xs text-text-secondary">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Cerrar notificación"
              className="h-6 w-6 shrink-0 rounded-md text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            >
              <X size={14} className="mx-auto" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
