import type { ServiceCategory } from '../types'

const labels: Record<ServiceCategory, string> = {
  education: 'Education',
  government: 'Government',
  commerce: 'Commerce',
  medical: 'Medical',
  financial: 'Financial',
  municipal: 'Municipal',
}

const cls: Record<ServiceCategory, string> = {
  education: 'bg-sky-500/15 text-sky-200 border-sky-500/25',
  government: 'bg-violet-500/15 text-violet-200 border-violet-500/25',
  commerce: 'bg-orange-500/15 text-orange-200 border-orange-500/25',
  medical: 'bg-rose-500/15 text-rose-200 border-rose-500/25',
  financial: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25',
  municipal: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/25',
}

export function ServiceCategoryBadge({ category }: { category: ServiceCategory }) {
  return (
    <span className={`rounded-md border px-2 py-0.5 text-xs ${cls[category]}`}>{labels[category]}</span>
  )
}
