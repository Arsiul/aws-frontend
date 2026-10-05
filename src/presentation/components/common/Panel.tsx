import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  icon?: LucideIcon
  iconClassName?: string
  description?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}

/** Card section with an 18 px / 600 subtitle, the building block of every module page. */
export function Panel({
  title,
  icon: Icon,
  iconClassName = 'text-brand',
  description,
  action,
  className = '',
  children,
}: PanelProps) {
  return (
    <section className={`rounded-card border border-border bg-card p-5 shadow-card ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            {Icon && <Icon size={18} className={`shrink-0 ${iconClassName}`} />}
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
