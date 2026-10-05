import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { CostLineItem } from '../../../domain/entities'
import { formatCurrency } from '../../../shared/utils/format'
import { useChartPalette } from '../../context/theme'
import { FilterChips } from '../common/FilterChips'
import { CHART_COLORS } from './chartColors'

type Period = 'monthly' | 'annual'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'annual', label: 'Anual' },
]

interface CostDistributionChartProps {
  items: CostLineItem[]
}

/** Donut + clickable legend: hovering or clicking a slice/row highlights it and shows its share. */
export function CostDistributionChart({ items }: CostDistributionChartProps) {
  const palette = useChartPalette()
  const [period, setPeriod] = useState<Period>('monthly')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Same service added twice is summed into one slice.
  const totals = new Map<string, number>()
  for (const item of items) {
    const value = period === 'monthly' ? item.monthlyCost : item.annualCost
    totals.set(item.serviceName, (totals.get(item.serviceName) ?? 0) + value)
  }
  const data = [...totals.entries()].map(([name, value]) => ({ name, value }))
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-text-secondary">
        Agrega servicios a la estimación para ver la distribución de costos.
      </div>
    )
  }

  const active = activeIndex !== null ? data[activeIndex] : null
  const toggle = (index: number) => setActiveIndex((current) => (current === index ? null : index))

  return (
    <div>
      <div className="print:hidden">
        <FilterChips options={PERIOD_OPTIONS} value={period} onChange={setPeriod} ariaLabel="Periodo" />
      </div>

      <div className="mt-4 grid grid-cols-1 items-center gap-6 md:grid-cols-2">
        <div className="relative">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                stroke={palette.tooltipBg}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onClick={(_, index) => toggle(index)}
                style={{ cursor: 'pointer', outline: 'none' }}
                animationDuration={500}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                    style={{ transition: 'opacity 0.2s ease', outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), 2)}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: palette.tooltipBorder,
                  background: palette.tooltipBg,
                  fontSize: 13,
                }}
                itemStyle={{ color: palette.text }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="max-w-[110px] truncate text-[11px] uppercase tracking-wide text-text-secondary">
              {active ? active.name : 'Total'}
            </p>
            <p className="text-lg font-bold text-text-primary">{formatCurrency(active ? active.value : total)}</p>
            {active && (
              <p className="text-xs font-medium text-brand">{Math.round((active.value / total) * 100)}%</p>
            )}
          </div>
        </div>

        <ul className="space-y-1.5" onMouseLeave={() => setActiveIndex(null)}>
          {data.map((entry, index) => (
            <li key={entry.name}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => toggle(index)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200 ${
                  activeIndex === index ? 'bg-brand/10' : 'hover:bg-background'
                }`}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-text-primary">{entry.name}</span>
                <span className="text-xs text-text-secondary">{Math.round((entry.value / total) * 100)}%</span>
                <span className="w-20 text-right font-semibold text-text-primary">{formatCurrency(entry.value)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
