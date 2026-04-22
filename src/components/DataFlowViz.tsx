import { useMemo, useState } from 'react'
import { dataCategoryLabels } from '../data/seed'
import type { DataCategory, RiskLevel, Service } from '../types'
import { RiskBadge } from './RiskBadge'

type MapFilter = 'all' | RiskLevel | 'geo' | 'financial' | 'medical'

function matchesMapFilter(s: Service, f: MapFilter): boolean {
  if (f === 'all') return true
  if (f === 'geo') return s.dataShared.includes('location')
  if (f === 'financial') return s.dataShared.includes('financial')
  if (f === 'medical') return s.dataShared.includes('medical')
  if (f === 'low' || f === 'medium' || f === 'high') return s.riskLevel === f
  return true
}

export function DataFlowViz({
  services,
  showEdges = true,
}: {
  services: Service[]
  showEdges?: boolean
}) {
  const [mapFilter, setMapFilter] = useState<MapFilter>('all')

  const visible = useMemo(
    () => services.filter((s) => matchesMapFilter(s, mapFilter)),
    [services, mapFilter],
  )

  return (
    <div className="rounded-2xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/80 p-6">
      <h3 className="text-sm font-medium text-white">Data flow map</h3>
      <p className="mt-1 text-xs text-[var(--color-consent-muted)]">
        Who receives which categories from you (demo — static integration mockups).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ['all', 'All'],
            ['high', 'High risk'],
            ['medium', 'Medium risk'],
            ['low', 'Low risk'],
            ['geo', 'Geolocation'],
            ['financial', 'Financial'],
            ['medical', 'Medical'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMapFilter(id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              mapFilter === id
                ? 'border-[var(--color-consent-teal)] bg-[var(--color-consent-teal)]/15 text-[var(--color-consent-teal)]'
                : 'border-[var(--color-consent-border)] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative mt-6 flex flex-col items-center gap-6 md:flex-row md:items-stretch md:justify-center md:gap-10">
        <div className="flex shrink-0 flex-col items-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-[var(--color-consent-teal)]/50 bg-[var(--color-consent-teal)]/10 text-center">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-consent-muted)]">
                Data subject
              </div>
              <div className="mt-1 text-lg font-semibold text-white">You</div>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-2xl flex-col gap-4 md:flex-1">
          {visible.length === 0 && (
            <p className="text-sm text-zinc-500">No services match this filter.</p>
          )}
          {visible.map((svc) => {
            const active = svc.status === 'active'
            return (
              <div
                key={svc.id}
                className={`relative flex flex-1 items-stretch gap-3 rounded-xl border p-3 md:min-h-[5rem] ${
                  active
                    ? 'border-[var(--color-consent-border)] bg-[var(--color-consent-bg)]/50'
                    : 'border-dashed border-zinc-600 bg-zinc-900/40 opacity-70'
                }`}
              >
                {showEdges && (
                  <div
                    className="hidden w-8 shrink-0 items-center justify-center md:flex"
                    aria-hidden
                  >
                    <div className="h-px w-full bg-gradient-to-r from-[var(--color-consent-teal)]/50 to-transparent" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {svc.icon && <span aria-hidden>{svc.icon}</span>}
                    <span className="font-medium text-white">{svc.name}</span>
                    <RiskBadge level={svc.riskLevel} title={svc.riskReason} />
                    {!active && (
                      <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300">
                        Revoked
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-consent-muted)]">{svc.shortLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {svc.dataShared.map((t: DataCategory) => (
                      <span
                        key={t}
                        className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300"
                      >
                        {dataCategoryLabels[t] ?? t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-6 text-xs text-[var(--color-consent-muted)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-consent-success)]" /> Low risk
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Medium risk
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> High risk
        </span>
      </div>
    </div>
  )
}
