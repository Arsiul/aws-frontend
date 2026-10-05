import { createContext, useContext, type PropsWithChildren } from 'react'
import { container, type Container } from './container'

const DIContext = createContext<Container | null>(null)

export function DIProvider({ children }: PropsWithChildren) {
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>
}

/** Presentation-layer hooks call this instead of importing the container directly,
 *  keeping the dependency direction explicit: presentation -> DI context -> infrastructure. */
export function useContainer(): Container {
  const ctx = useContext(DIContext)
  if (!ctx) {
    throw new Error('useContainer must be used within a <DIProvider>')
  }
  return ctx
}
