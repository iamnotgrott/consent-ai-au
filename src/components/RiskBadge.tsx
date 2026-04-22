import type { RiskLevel } from '../types'

const styles: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  high: 'bg-rose-500/15 text-rose-200 border-rose-500/35',
}

const short: Record<RiskLevel, string> = {
  low: 'Low risk',
  medium: 'Medium',
  high: 'High exposure',
}

export function RiskBadge({
  level,
  title,
}: {
  level: RiskLevel
  title: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${styles[level]}`}
      title={title}
    >
      {short[level]}
    </span>
  )
}
