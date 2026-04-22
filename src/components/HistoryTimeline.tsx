import { useMemo, useState } from 'react'
import { dataCategoryLabels } from '../data/seed'
import { formatTimestamp } from '../lib/format'
import type { ConsentEvent, Service } from '../types'

const eventVerb: Record<ConsentEvent['type'], string> = {
  granted: 'Consent granted',
  updated: 'Consent updated',
  revoked: 'Access revoked',
  accessed: 'Data accessed',
  modified: 'Consent modified',
}

export function HistoryTimeline({
  events,
  services,
}: {
  events: ConsentEvent[]
  services: Service[]
}) {
  const [q, setQ] = useState('')

  const sorted = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  }, [events])

  const filtered = useMemo(() => {
    const nameFor = (id: string) => services.find((s) => s.id === id)?.name ?? id
    const needle = q.trim().toLowerCase()
    if (!needle) return sorted
    return sorted.filter((ev) => {
      const name = nameFor(ev.serviceId).toLowerCase()
      const detail = (ev.detail ?? '').toLowerCase()
      const type = eventVerb[ev.type].toLowerCase()
      const catStr = (services.find((s) => s.id === ev.serviceId)?.dataShared ?? [])
        .map((c) => dataCategoryLabels[c] ?? c)
        .join(' ')
        .toLowerCase()
      return (
        name.includes(needle) ||
        detail.includes(needle) ||
        type.includes(needle) ||
        catStr.includes(needle)
      )
    })
  }, [sorted, q, services])

  const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? id

  return (
    <div className="rounded-2xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/80 p-6">
      <h3 className="text-sm font-medium text-white">Permission history</h3>
      <p className="mt-1 text-xs text-[var(--color-consent-muted)]">
        Search by service, action, or data category. Append-only log (demo: client-side).
      </p>

      <input
        type="search"
        className="mt-4 w-full rounded-lg border border-[var(--color-consent-border)] bg-[var(--color-consent-bg)] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[var(--color-consent-teal)] focus:outline-none"
        placeholder="Search by service, action, or data type…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Filter history"
      />

      <ol className="mt-5 space-y-0">
        {filtered.map((ev, i) => (
          <li key={ev.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < filtered.length - 1 && (
              <div
                className="absolute left-[7px] top-3 bottom-0 w-px bg-[var(--color-consent-border)]"
                aria-hidden
              />
            )}
            <div
              className={`relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                ev.type === 'revoked'
                  ? 'border-rose-400 bg-rose-500/30'
                  : ev.type === 'updated' || ev.type === 'modified'
                    ? 'border-amber-400 bg-amber-500/30'
                    : ev.type === 'accessed'
                      ? 'border-sky-400 bg-sky-500/30'
                      : 'border-emerald-400 bg-emerald-500/30'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-medium text-white">{serviceName(ev.serviceId)}</span>
                <span className="text-sm text-zinc-400">{eventVerb[ev.type]}</span>
              </div>
              <time
                className="text-xs text-[var(--color-consent-muted)]"
                dateTime={ev.timestamp}
              >
                {formatTimestamp(ev.timestamp)}
              </time>
              {ev.detail && <p className="mt-1 text-sm text-zinc-400">{ev.detail}</p>}
              {ev.type === 'granted' && (
                <p className="mt-1 text-xs text-zinc-500">
                  Categories:{' '}
                  {(services.find((s) => s.id === ev.serviceId)?.dataShared ?? [])
                    .map((c) => dataCategoryLabels[c] ?? c)
                    .join(' · ')}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {filtered.length === 0 && (
        <p className="mt-4 text-center text-sm text-zinc-500">No events match your search.</p>
      )}
    </div>
  )
}
