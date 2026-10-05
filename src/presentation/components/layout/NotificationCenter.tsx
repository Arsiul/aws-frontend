import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatDateTime } from '../../../shared/utils/format'
import { useNotifications } from '../../context/notifications'
import { NOTIFICATION_COLORS, NOTIFICATION_ICONS } from './notificationStyles'

export function NotificationCenter() {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Notificaciones${unreadCount ? ` (${unreadCount} sin leer)` : ''}`}
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-background hover:text-brand"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] animate-scaleIn items-center justify-center rounded-full bg-alert px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 top-16 z-40 animate-scaleIn rounded-card border border-border bg-card shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Notificaciones</p>
              <p className="text-xs text-text-secondary">
                {unreadCount ? `${unreadCount} sin leer` : 'Todo al día'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                title="Marcar todas como leídas"
                className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-background hover:text-brand disabled:opacity-40"
              >
                <CheckCheck size={16} />
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={notifications.length === 0}
                title="Limpiar notificaciones"
                className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-background hover:text-alert disabled:opacity-40"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <ul className="scrollbar-thin max-h-96 divide-y divide-border overflow-y-auto">
            {notifications.length === 0 && (
              <li className="flex flex-col items-center gap-2 px-4 py-10 text-sm text-text-secondary">
                <BellOff size={22} />
                No hay notificaciones
              </li>
            )}
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.tone]
              return (
                <li
                  key={notification.id}
                  className={`flex gap-3 px-4 py-3 transition-colors ${notification.read ? '' : 'bg-brand/5'}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${NOTIFICATION_COLORS[notification.tone]}`}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                    {notification.message && (
                      <p className="mt-0.5 text-xs text-text-secondary">{notification.message}</p>
                    )}
                    <p className="mt-1 text-[11px] text-text-secondary/80">{formatDateTime(notification.createdAt)}</p>
                  </div>
                  {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
