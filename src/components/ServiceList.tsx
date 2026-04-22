import { useMemo, useState } from 'react'
import { dataCategoryLabels } from '../data/seed'
import { formatDateYmd, isExpiringWithinDays } from '../lib/format'
import type { DataCategory, Service } from '../types'
import { RiskBadge } from './RiskBadge'
import { ServiceCategoryBadge } from './ServiceCategoryBadge'

const FP_COLORS = [
  '#6366f1',
  '#00c9a7',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#8b5cf6',
  '#3b82f6',
  '#ec4899',
]

function fingerprintBars(id: string) {
  let s = 0
  for (let i = 0; i < id.length; i++) s += id.charCodeAt(i)
  return Array.from({ length: 14 }, (_, i) => (
    <div
      key={i}
      className="h-1.5 flex-1 rounded-sm opacity-80"
      style={{ background: FP_COLORS[(s * (i + 7) * 13 + i * 31) % FP_COLORS.length] }}
    />
  ))
}

export function ServiceList({
  services,
  onRequestRevoke,
  expandedId,
  onToggleExpand,
}: {
  services: Service[]
  onRequestRevoke: (service: Service) => void
  expandedId: string | null
  onToggleExpand: (id: string) => void
}) {
  const [textMode, setTextMode] = useState<Record<string, 'legal' | 'plain'>>({})

  const modeFor = (id: string) => textMode[id] ?? 'plain'

  const setMode = (id: string, m: 'legal' | 'plain') => {
    setTextMode((prev) => ({ ...prev, [id]: m }))
  }

  const sorted = useMemo(
    () =>
      [...services].sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 }
        return order[a.riskLevel] - order[b.riskLevel] || a.name.localeCompare(b.name)
      }),
    [services],
  )

  return (
    <div className="space-y-3">
      {sorted.map((svc) => {
        const expanded = expandedId === svc.id
        const active = svc.status === 'active'
        const exp = svc.expiryDate
        const expiring = exp ? isExpiringWithinDays(exp, 8) : false
        const mode = modeFor(svc.id)
        return (
          <article
            key={svc.id}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              active
                ? 'border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/90'
                : 'border-dashed border-zinc-600 bg-zinc-900/30'
            }`}
          >
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {svc.icon && <span aria-hidden>{svc.icon}</span>}
                  <h3 className="text-base font-semibold text-white">{svc.name}</h3>
                  <ServiceCategoryBadge category={svc.category} />
                  {!active && (
                    <span className="rounded-md bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                      Revoked
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--color-consent-muted)]">{svc.shortLabel}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge level={svc.riskLevel} title={svc.riskReason} />
                  <span className="text-xs text-zinc-500" title={svc.riskReason}>
                    {svc.riskReason}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {svc.dataShared.map((d: DataCategory) => (
                    <span
                      key={d}
                      className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300"
                    >
                      {dataCategoryLabels[d] ?? d}
                    </span>
                  ))}
                </div>
                {active && exp && (
                  <p
                    className={`text-xs font-mono ${
                      expiring ? 'text-amber-300' : 'text-zinc-500'
                    }`}
                  >
                    Expires: {formatDateYmd(exp)}
                    {expiring && ' — soon'}
                  </p>
                )}
                {active && !exp && (
                  <p className="text-xs font-mono text-rose-300/90">No expiry set — review recommended</p>
                )}
                <div className="flex gap-0.5 pt-1" aria-hidden>
                  {fingerprintBars(svc.id)}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={() => onToggleExpand(svc.id)}
                  className="text-sm font-medium text-[var(--color-consent-teal)] hover:brightness-110"
                >
                  {expanded ? 'Hide details' : 'Details & summary'}
                </button>
                {active ? (
                  <button
                    type="button"
                    onClick={() => onRequestRevoke(svc)}
                    className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20"
                  >
                    Revoke access
                  </button>
                ) : (
                  <span className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-500">
                    No active access
                  </span>
                )}
              </div>
            </div>
            {expanded && (
              <div className="space-y-3 border-t border-[var(--color-consent-border)] bg-black/20 px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-[var(--color-consent-muted)]">View as:</span>
                  <button
                    type="button"
                    onClick={() => setMode(svc.id, 'plain')}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      mode === 'plain'
                        ? 'bg-[var(--color-consent-teal)]/20 text-[var(--color-consent-teal)]'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Plain language
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(svc.id, 'legal')}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      mode === 'legal'
                        ? 'bg-violet-500/20 text-violet-200'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Legal text
                  </button>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    mode === 'legal' ? 'text-zinc-400' : 'text-zinc-200'
                  }`}
                >
                  {mode === 'legal' ? svc.legalText : svc.plainText}
                </p>
                <p className="text-xs text-[var(--color-consent-muted)]">
                  <span className="font-medium text-zinc-500">Why accepted: </span>
                  {svc.whyAccepted}
                </p>
                <p className="text-xs text-zinc-500">{svc.context}</p>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
