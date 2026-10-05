import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CategoryCost, ServiceCategory } from '../../../domain/entities'
import { formatCurrency } from '../../../shared/utils/format'
import { useChartPalette } from '../../context/theme'
import { SERVICE_CATEGORY_LABELS } from '../../labels'
import { CHART_COLORS } from './chartColors'

interface CostByCategoryChartProps {
  data: CategoryCost[]
  onSelectCategory?: (category: ServiceCategory) => void
}

export function CostByCategoryChart({ data, onSelectCategory }: CostByCategoryChartProps) {
  const palette = useChartPalette()
  const chartData = data.map((d) => ({ ...d, label: SERVICE_CATEGORY_LABELS[d.category] }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: palette.tick }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: palette.tick }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${Math.round(v)}`}
          width={44}
        />
        <Tooltip
          cursor={{ fill: palette.grid, opacity: 0.4 }}
          formatter={(value) => [formatCurrency(Number(value), 2), 'Costo mensual']}
          contentStyle={{
            borderRadius: 12,
            borderColor: palette.tooltipBorder,
            background: palette.tooltipBg,
            color: palette.text,
            fontSize: 13,
          }}
          labelStyle={{ color: palette.text, fontWeight: 600 }}
        />
        <Bar
          dataKey="cost"
          radius={[8, 8, 0, 0]}
          maxBarSize={56}
          onClick={(_, index) => onSelectCategory?.(chartData[index].category)}
          style={{ cursor: onSelectCategory ? 'pointer' : 'default' }}
          animationDuration={600}
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
