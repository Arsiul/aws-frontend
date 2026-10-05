import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CostTrendPoint } from '../../../domain/entities'
import { formatCurrency } from '../../../shared/utils/format'
import { useChartPalette } from '../../context/theme'
import { FilterChips } from '../common/FilterChips'

type Range = '3' | '6' | '12'

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
]

function formatAxisTick(value: number): string {
  return value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${Math.round(value)}`
}

interface CostTrendChartProps {
  data: CostTrendPoint[]
}

export function CostTrendChart({ data }: CostTrendChartProps) {
  const palette = useChartPalette()
  const [range, setRange] = useState<Range>('6')
  const visible = data.slice(-Number(range))
  const first = visible[0]?.cost ?? 0
  const last = visible[visible.length - 1]?.cost ?? 0
  const growth = first ? Math.round(((last - first) / first) * 100) : 0

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <FilterChips options={RANGE_OPTIONS} value={range} onChange={setRange} ariaLabel="Rango del gráfico" />
        <p className="text-xs text-text-secondary">
          Variación en el periodo:{' '}
          <span className={`font-semibold ${growth > 0 ? 'text-cost' : 'text-security'}`}>
            {growth > 0 ? '+' : ''}
            {growth}%
          </span>
        </p>
      </div>

      <div className="mt-3">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={visible} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="costTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: palette.tick }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: palette.tick }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAxisTick}
              width={44}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), 'Costo mensual']}
              contentStyle={{
                borderRadius: 12,
                borderColor: palette.tooltipBorder,
                background: palette.tooltipBg,
                color: palette.text,
                fontSize: 13,
              }}
              labelStyle={{ color: palette.text, fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#2563EB"
              strokeWidth={2}
              fill="url(#costTrendFill)"
              activeDot={{ r: 5, strokeWidth: 2, stroke: palette.markerStroke }}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
