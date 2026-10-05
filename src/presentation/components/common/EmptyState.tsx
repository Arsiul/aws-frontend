import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

/** Shown in a blank workspace where a module has nothing of the user's yet. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex animate-fadeIn flex-col items-center gap-3 rounded-card border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon size={24} />
      </span>
      <div className="max-w-md">
        <p className="text-lg font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
      {action}
    </div>
  )
}
