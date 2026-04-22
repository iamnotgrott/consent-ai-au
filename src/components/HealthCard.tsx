import type { HealthBreakdown } from '../lib/healthScore'

const CIRC = 2 * Math.PI * 56

export function HealthCard({
  score,
  status,
  breakdown,
}: {
  score: number
  status: string
  breakdown: HealthBreakdown
}) {
  const offset = CIRC * (1 - score / 100)
  const stroke =
    score >= 70 ? 'var(--color-consent-teal)' : score >= 50 ? 'var(--color-consent-warn)' : '#f87171'

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/90 p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-consent-muted)]">
        Consent health score
      </p>
      <div className="relative h-[140px] w-[140px]">
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          <circle cx="70" cy="70" r="56" fill="none" stroke="#1e2230" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r="56"
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset,stroke] duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-bold text-white">{score}</span>
          <span className="text-xs text-[var(--color-consent-muted)]">{status}</span>
        </div>
      </div>
      <dl className="w-full space-y-1.5 border-t border-[var(--color-consent-border)] pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-consent-muted)]">Low-risk active</span>
          <span className="font-mono text-[var(--color-consent-success)]">
            {breakdown.lowRiskActive}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-consent-muted)]">Medium-risk active</span>
          <span className="font-mono text-amber-300">{breakdown.mediumRiskActive}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-consent-muted)]">High-risk active</span>
          <span className="font-mono text-rose-300">{breakdown.highRiskActive}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-consent-muted)]">No expiry date</span>
          <span className="font-mono text-rose-300">{breakdown.noExpiryActive}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-consent-muted)]">Data categories (unique)</span>
          <span className="font-mono text-sky-300">{breakdown.dataCategoryCount}</span>
        </div>
      </dl>
    </div>
  )
}
