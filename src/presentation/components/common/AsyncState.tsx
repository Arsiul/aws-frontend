import { AlertTriangle, Loader2 } from 'lucide-react'

export function LoadingState({ label = 'Cargando información…' }: { label?: string }) {
  return (
    <div className="flex animate-fadeIn items-center justify-center gap-2 rounded-card border border-border bg-card py-12 text-sm text-text-secondary shadow-card">
      <Loader2 size={18} className="animate-spin text-brand" />
      {label}
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex animate-fadeInUp items-center gap-2 rounded-card border border-alert/30 bg-alert/5 p-4 text-sm text-alert">
      <AlertTriangle size={18} />
      {message}
    </div>
  )
}
