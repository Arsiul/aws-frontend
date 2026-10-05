import { useCallback, useEffect, useMemo, type PropsWithChildren } from 'react'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { ThemeContext, type Theme } from './theme'

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: PropsWithChildren) {
  // Same storage key the inline script in index.html reads to avoid a flash on load.
  const [theme, setTheme] = useLocalStorageState<Theme>('cloudops.theme', systemTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [setTheme])
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
