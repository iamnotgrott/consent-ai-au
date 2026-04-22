import { useMemo, useState } from 'react'
import { dataCategoryLabels } from '../data/seed'
import { formatDateYmd } from '../lib/format'
import type { Service } from '../types'
import { RiskBadge } from './RiskBadge'
import { ServiceCategoryBadge } from './ServiceCategoryBadge'

type AgrFilter = 'all' | 'active' | 'revoked' | 'high' | 'noexpiry'

function matchesFilter(s: Service, f: AgrFilter): boolean {
  if (f === 'all') return true
  if (f === 'active') return s.status === 'active'
  if (f === 'revoked') return s.status === 'revoked'
  if (f === 'high') return s.status === 'active' && s.riskLevel === 'high'
  if (f === 'noexpiry') return s.status === 'active' && s.expiryDate === null
  return true
}

const dotClass: Record<string, string> = {
  granted: 'bg-emerald-400',
  info: 'bg-sky-400',
  warning: 'bg-amber-400',
  access: 'bg-violet-400',
  revoke: 'bg-rose-400',
  update: 'bg-amber-400',
}

export function AgreementsPanel({
  services,
  onRequestRevoke,
}: {
  services: Service[]
  onRequestRevoke: (service: Service) => void
}) {
  const [filter, setFilter] = useState<AgrFilter>('all')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(services[0]?.id ?? null)
  const [textMode, setTextMode] = useState<Record<string, 'legal' | 'plain'>>({})

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return services.filter((s) => {
      if (!matchesFilter(s, filter)) return false
      if (!needle) return true
      const blob = [
        s.name,
        s.shortLabel,
        s.plainText,
        s.legalText,
        s.whyAccepted,
        s.context,
        ...s.dataShared,
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(needle)
    })
  }, [services, filter, q])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">All agreements</h2>
        <p className="mt-1 text-sm text-[var(--color-consent-muted)]">
          Every consent — switch between plain language and legal text, with full timeline per
          service.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {(
          [
            ['all', 'All'],
            ['active', 'Active'],
            ['revoked', 'Revoked'],
            ['high', 'High risk'],
            ['noexpiry', 'No expiry'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === id
                ? 'border-[var(--color-consent-teal)] bg-[var(--color-consent-teal)]/15 text-[var(--color-consent-teal)]'
                : 'border-[var(--color-consent-border)] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search agreements…"
          className="min-w-0 flex-1 rounded-lg border border-[var(--color-consent-border)] bg-[var(--color-consent-bg)] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[var(--color-consent-teal)] focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((s) => {
          const open = openId === s.id
          const mode = textMode[s.id] ?? 'plain'
          const active = s.status === 'active'
          return (
            <div
              key={s.id}
              className={`overflow-hidden rounded-2xl border transition-colors ${
                active
                  ? 'border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/90'
                  : 'border-dashed border-zinc-600 bg-zinc-900/30 opacity-80'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : s.id)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl"
                  aria-hidden
                >
                  {s.icon ?? '📋'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{s.name}</span>
                    <ServiceCategoryBadge category={s.category} />
                    <RiskBadge level={s.riskLevel} title={s.riskReason} />
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
                        active
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                      }`}
                    >
                      {active ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-consent-muted)]">{s.shortLabel}</p>
                </div>
                <span className="text-zinc-500">{open ? '▲' : '▼'}</span>
              </button>

              {open && (
                <div className="space-y-4 border-t border-[var(--color-consent-border)] px-4 pb-4 pt-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-black/25 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Granted</p>
                      <p className="font-mono text-sm text-zinc-300">
                        {s.timeline[0]?.date
                          ? formatDateYmd(s.timeline[0].date)
                          : '—'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-black/25 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Expires</p>
                      <p className="font-mono text-sm text-zinc-300">
                        {s.expiryDate ? formatDateYmd(s.expiryDate) : 'None (indefinite)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTextMode((p) => ({ ...p, [s.id]: 'plain' }))
                      }}
                      className={`rounded-md px-2 py-1 text-xs ${
                        mode === 'plain'
                          ? 'bg-[var(--color-consent-teal)]/20 text-[var(--color-consent-teal)]'
                          : 'text-zinc-500'
                      }`}
                    >
                      Plain language
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTextMode((p) => ({ ...p, [s.id]: 'legal' }))
                      }}
                      className={`rounded-md px-2 py-1 text-xs ${
                        mode === 'legal'
                          ? 'bg-violet-500/20 text-violet-200'
                          : 'text-zinc-500'
                      }`}
                    >
                      Legal text
                    </button>
                  </div>

                  <div
                    className={`rounded-lg border-l-2 p-3 text-sm leading-relaxed ${
                      mode === 'legal'
                        ? 'border-zinc-600 text-zinc-400'
                        : 'border-[var(--color-consent-teal)] text-zinc-200'
                    }`}
                  >
                    {mode === 'legal' ? s.legalText : s.plainText}
                  </div>

                  <div className="rounded-lg border-l-2 border-[var(--color-consent-teal)]/50 bg-black/20 p-3 text-sm text-zinc-300">
                    <strong className="text-[var(--color-consent-teal)]">Why you accepted: </strong>
                    {s.whyAccepted}
                  </div>

                  <p className="text-xs text-zinc-500">{s.context}</p>

                  <div className="flex flex-wrap gap-1">
                    {s.dataShared.map((c) => (
                      <span
                        key={c}
                        className="rounded border border-[var(--color-consent-border)] bg-zinc-900/50 px-2 py-0.5 text-[10px] text-zinc-400"
                      >
                        {dataCategoryLabels[c] ?? c}
                      </span>
                    ))}
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">
                      Timeline
                    </p>
                    <ul className="space-y-2">
                      {s.timeline.map((t, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <div className="flex flex-col items-center">
                            <span
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass[t.kind] ?? 'bg-zinc-500'}`}
                            />
                            {i < s.timeline.length - 1 && (
                              <span className="mt-0.5 h-full min-h-[12px] w-px grow bg-[var(--color-consent-border)]" />
                            )}
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-zinc-500">
                              {formatDateYmd(t.date)}
                            </p>
                            <p className="text-zinc-300">{t.text}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {active && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onRequestRevoke(s)}
                        className="rounded-lg border border-zinc-600 bg-zinc-800/80 px-4 py-2 text-xs text-zinc-300 hover:border-rose-500/50 hover:text-rose-200"
                      >
                        Revoke this consent
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-zinc-500">No agreements match your filters.</p>
      )}
    </div>
  )
}
