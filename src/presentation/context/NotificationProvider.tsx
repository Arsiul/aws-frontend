import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { NotificationContext, type AppNotification, type NotifyInput } from './notifications'

const MAX_STORED = 30
const TOAST_DURATION_MS = 4500

/** Notification center + toasts. System alerts (security, regions) are seeded once per id, so a
 *  read or cleared alert does not come back on reload; user actions push new ones via notify(). */
export function NotificationProvider({ children }: PropsWithChildren) {
  const { getSystemAlerts } = useContainer()
  const [notifications, setNotifications] = useLocalStorageState<AppNotification[]>('cloudops.notifications', [])
  const [seenAlertIds, setSeenAlertIds] = useLocalStorageState<string[]>('cloudops.notifications.seen-alerts', [])
  const [toasts, setToasts] = useState<AppNotification[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const seenAtMount = useRef(seenAlertIds)

  useEffect(() => {
    let cancelled = false
    getSystemAlerts.execute().then((alerts) => {
      if (cancelled) return
      const seen = new Set(seenAtMount.current)
      const fresh = alerts.filter((alert) => !seen.has(alert.id))
      if (fresh.length === 0) return
      const createdAt = new Date().toISOString()
      setNotifications((prev) =>
        [
          ...fresh.map((alert) => ({
            id: alert.id,
            title: alert.title,
            message: alert.message,
            tone: alert.severity,
            createdAt,
            read: false,
          })),
          ...prev,
        ].slice(0, MAX_STORED),
      )
      setSeenAlertIds((prev) => [...prev, ...fresh.map((alert) => alert.id)])
    })
    return () => {
      cancelled = true
    }
  }, [getSystemAlerts, setNotifications, setSeenAlertIds])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => clearTimeout(timer))
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const notify = useCallback(
    ({ title, message, tone = 'info' }: NotifyInput) => {
      const notification: AppNotification = {
        id: crypto.randomUUID(),
        title,
        message,
        tone,
        createdAt: new Date().toISOString(),
        read: false,
      }
      setNotifications((prev) => [notification, ...prev].slice(0, MAX_STORED))
      setToasts((prev) => [...prev.slice(-2), notification])
      timers.current.set(
        notification.id,
        setTimeout(() => dismissToast(notification.id), TOAST_DURATION_MS),
      )
    },
    [setNotifications, dismissToast],
  )

  const markAllAsRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true }))),
    [setNotifications],
  )

  const clearAll = useCallback(() => setNotifications([]), [setNotifications])

  const value = useMemo(
    () => ({
      notifications,
      toasts,
      unreadCount: notifications.filter((n) => !n.read).length,
      notify,
      dismissToast,
      markAllAsRead,
      clearAll,
    }),
    [notifications, toasts, notify, dismissToast, markAllAsRead, clearAll],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
