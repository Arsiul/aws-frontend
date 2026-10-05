import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

/** Module title: 28–32 px / 700 as the design spec asks for the main heading. */
export function PageHeader({ icon: Icon, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon size={22} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-text-primary sm:text-[32px]">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
      </div>
      {action && <div className="flex flex-wrap items-center gap-2 print:hidden">{action}</div>}
    </div>
  )
}
