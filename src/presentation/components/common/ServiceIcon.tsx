import type { LucideProps } from 'lucide-react'
import { createElement } from 'react'
import { resolveIcon } from './iconRegistry'

/** Renders the Lucide icon named in the service data without creating a component during render. */
export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  return createElement(resolveIcon(name), props)
}
