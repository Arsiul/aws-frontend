import { createContext, useContext } from 'react'

export type NotificationTone = 'success' | 'info' | 'warning' | 'critical'

export interface AppNotification {
  id: string
  title: string
  message?: string
  tone: NotificationTone
  createdAt: string
  read: boolean
}

export interface NotifyInput {
  title: string
  message?: string
  tone?: NotificationTone
}

export interface NotificationContextValue {
  notifications: AppNotification[]
  toasts: AppNotification[]
  unreadCount: number
  notify: (input: NotifyInput) => void
  dismissToast: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within a <NotificationProvider>')
  return ctx
}
