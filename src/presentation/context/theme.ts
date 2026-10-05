import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a <ThemeProvider>')
  return ctx
}

/** SVG charts and the map take colors as attributes, not classes, so they read them from here. */
const CHART_PALETTES = {
  light: {
    grid: '#E2E8F0',
    tick: '#64748B',
    tooltipBg: '#FFFFFF',
    tooltipBorder: '#E2E8F0',
    text: '#1E293B',
    land: '#E2E8F0',
    landStroke: '#F8FAFC',
    markerStroke: '#FFFFFF',
  },
  dark: {
    grid: '#1E293B',
    tick: '#94A3B8',
    tooltipBg: '#0F172A',
    tooltipBorder: '#334155',
    text: '#F1F5F9',
    land: '#1E293B',
    landStroke: '#020617',
    markerStroke: '#0F172A',
  },
} as const

export type ChartPalette = (typeof CHART_PALETTES)[Theme]

export function useChartPalette(): ChartPalette {
  return CHART_PALETTES[useTheme().theme]
}
