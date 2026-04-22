import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AgreementsPanel } from './components/AgreementsPanel'
import { DataFlowViz } from './components/DataFlowViz'
import { EncKeyModal } from './components/EncKeyModal'
import { HealthCard } from './components/HealthCard'
import { HistoryTimeline } from './components/HistoryTimeline'
import { OnboardingBanner } from './components/OnboardingBanner'
import { RevokeModal } from './components/RevokeModal'
import { SecurityPanel } from './components/SecurityPanel'
import { ServiceList } from './components/ServiceList'
import { Toast } from './components/Toast'
import { getInitialAppSnapshot } from './data/seed'
import {
  detectionIdToServiceId,
  detectionToService,
  mergeServicesWithDetections,
} from './lib/detectionToService'
import { fetchDetections } from './lib/detectionsApi'
import { isExpiringWithinDays } from './lib/format'
import { computeConsentHealth } from './lib/healthScore'
import type { ConsentEvent, Service, StoredDetection } from './types'

type Tab = 'dashboard' | 'flow' | 'history' | 'agreements' | 'security'

function loadSnapshot() {
  return getInitialAppSnapshot()
}

export default function App() {
  /** Snapshot “now” once per mount so 30d window is stable (avoids impure Date.now in render). */
  const [now] = useState(() => Date.now())
  const [tab, setTab] = useState<Tab>('dashboard')
  const [services, setServices] = useState<Service[]>(() => loadSnapshot().services)
  const [events, setEvents] = useState<ConsentEvent[]>(() => loadSnapshot().events)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<Service | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [encOpen, setEncOpen] = useState(false)
  const [bridgeOnline, setBridgeOnline] = useState<boolean | null>(null)

  const lastDetectionsRef = useRef<StoredDetection[]>([])
  const knownExtEventIdsRef = useRef<Set<string>>(new Set())

  const health = useMemo(() => computeConsentHealth(services), [services])

  const activeCount = useMemo(
    () => services.filter((s) => s.status === 'active').length,
    [services],
  )

  const highRiskActive = useMemo(
    () => services.filter((s) => s.status === 'active' && s.riskLevel === 'high').length,
    [services],
  )

  const expiringSoon = useMemo(
    () =>
      services.filter(
        (s) => s.status === 'active' && s.expiryDate && isExpiringWithinDays(s.expiryDate, 8),
      ).length,
    [services],
  )

  const accessEvents30d = useMemo(() => {
    const cut = now - 30 * 86_400_000
    return events.filter((e) => {
      if (e.type !== 'accessed') return false
      return new Date(e.timestamp).getTime() > cut
    }).length
  }, [events, now])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
  }, [])

  const resetDemo = useCallback(() => {
    const next = loadSnapshot()
    const d = lastDetectionsRef.current
    const extServices: Service[] = d.map((det) => {
      const s = detectionToService(det)
      return { ...s, status: 'active' as const }
    })
    setServices([...next.services, ...extServices])
    const extEvents: ConsentEvent[] = d.map((det) => ({
      id: `ev-ext-${det.id}`,
      timestamp: det.timestamp,
      type: 'granted' as const,
      serviceId: detectionIdToServiceId(det.id),
      detail: `Browser extension (file snapshot): ${det.kind} on ${det.origin}`,
    }))
    setEvents([...next.events, ...extEvents])
    knownExtEventIdsRef.current = new Set(d.map((x) => x.id))
    setExpandedId(null)
    setTab('dashboard')
    setRevokeTarget(null)
    setToast('Demo data reset to seed state. Extension file data kept; merged on top of seed.')
  }, [])

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const d = await fetchDetections()
        if (cancelled) return
        setBridgeOnline(true)
        lastDetectionsRef.current = d
        setServices((prev) => mergeServicesWithDetections(prev, d))
        setEvents((prev) => {
          const added: ConsentEvent[] = []
          for (const det of d) {
            if (knownExtEventIdsRef.current.has(det.id)) continue
            knownExtEventIdsRef.current.add(det.id)
            added.push({
              id: `ev-ext-${det.id}`,
              timestamp: det.timestamp,
              type: 'granted',
              serviceId: detectionIdToServiceId(det.id),
              detail: `Browser extension reported: ${det.kind} on ${det.origin}`,
            })
          }
          if (added.length === 0) return prev
          return [...added, ...prev]
        })
      } catch {
        if (!cancelled) setBridgeOnline(false)
      }
    }
    void tick()
    const id = window.setInterval(tick, 2500)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const confirmRevoke = useCallback(() => {
    if (!revokeTarget) return
    const sid = revokeTarget.id
    setServices((prev) =>
      prev.map((s) => (s.id === sid ? { ...s, status: 'revoked' as const } : s)),
    )
    const newEvent: ConsentEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date().toISOString(),
      type: 'revoked',
      serviceId: sid,
      detail: 'Access revoked from the Consent OS dashboard (demo).',
    }
    setEvents((prev) => [newEvent, ...prev])
    setRevokeTarget(null)
    setTab('history')
    showToast(`Revoked: ${revokeTarget.name}`)
  }, [revokeTarget, showToast])

  const revokeAllHighRisk = useCallback(() => {
    const targets = services.filter((s) => s.status === 'active' && s.riskLevel === 'high')
    if (targets.length === 0) {
      showToast('No high-risk active consents to revoke.')
      return
    }
    if (
      !window.confirm(
        `Revoke all ${targets.length} high-risk active consent(s)? This updates the demo state only.`,
      )
    ) {
      return
    }
    const ids = new Set(targets.map((t) => t.id))
    setServices((prev) =>
      prev.map((s) => (ids.has(s.id) ? { ...s, status: 'revoked' as const } : s)),
    )
    const now = new Date().toISOString()
    const newEvents: ConsentEvent[] = targets.map((t) => ({
      id: `ev-${Date.now()}-${t.id}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: now,
      type: 'revoked' as const,
      serviceId: t.id,
      detail: 'Batch high-risk revoke from Consent OS dashboard (demo).',
    }))
    setEvents((prev) => [...newEvents, ...prev])
    setTab('history')
    showToast(`Revoked ${targets.length} high-risk consent(s).`)
  }, [services, showToast])

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-consent-teal)]/90">
              Case #1 · hackwithiq
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Consent OS</h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-consent-muted)]">
              One place to read consents, trace history, see data flow, and revoke — with a
              browser-native crypto proof in Security.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setEncOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-consent-teal)]/40 bg-[var(--color-consent-teal)]/10 px-3 py-1.5 font-mono text-xs text-[var(--color-consent-teal)] hover:bg-[var(--color-consent-teal)]/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-consent-teal)]/40" />
                <span className="relative h-2 w-2 rounded-full bg-[var(--color-consent-teal)]" />
              </span>
              AES-256-GCM
            </button>
            <span className="rounded-lg bg-white/5 px-3 py-1.5 text-zinc-300">
              Active: <strong className="text-white">{activeCount}</strong>
            </span>
            <button
              type="button"
              onClick={resetDemo}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            >
              Reset demo
            </button>
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-5xl flex-wrap gap-1 border-t border-[var(--color-consent-border)] px-2"
          aria-label="Sections"
        >
          {(
            [
              ['dashboard', 'Dashboard'],
              ['flow', 'Data map'],
              ['history', 'History'],
              ['agreements', 'Agreements'],
              ['security', 'Security'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative -mb-px border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                tab === id
                  ? 'border-[var(--color-consent-teal)] text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {bridgeOnline === false && (
        <div
          className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-100"
          role="status"
        >
          Local detections bridge offline (is{' '}
          <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-xs">npm run dev:demo</code>{' '}
          running? Store URL must match the extension, default{' '}
          <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-xs">127.0.0.1:3847</code>).
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {tab === 'dashboard' && (
          <section aria-labelledby="dash-heading" className="space-y-4">
            <OnboardingBanner message="GovPortal and HealthApp have high-risk, indefinite consents. DeliveryApp expires soon—review the Dashboard and Agreements. New rows from the browser extension appear when the local bridge is running." />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr]">
              <HealthCard
                score={health.score}
                status={health.status}
                breakdown={health.breakdown}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/80 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-consent-muted)]">
                    Active consents
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold text-[var(--color-consent-success)]">
                    {activeCount}
                  </p>
                  <p className="text-xs text-zinc-500">of {services.length} total (in seed)</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/80 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-consent-muted)]">
                    High-risk active
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold text-rose-300">{highRiskActive}</p>
                  <p className="text-xs text-zinc-500">broad or sensitive data</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/80 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-consent-muted)]">
                    Access events (30d)
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold text-white">
                    {accessEvents30d}
                  </p>
                  <p className="text-xs text-zinc-500">“accessed” in history (demo log)</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/80 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-consent-muted)]">
                    Expiring soon
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold text-amber-200">
                    {expiringSoon}
                  </p>
                  <p className="text-xs text-zinc-500">within 8 days</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 id="dash-heading" className="text-lg font-semibold text-white">
                  Active consents
                </h2>
                <p className="mt-1 text-sm text-[var(--color-consent-muted)]">
                  Open a card for plain vs legal text. Revoke updates state and appends to history.
                </p>
              </div>
              <button
                type="button"
                onClick={revokeAllHighRisk}
                className="shrink-0 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20"
              >
                Revoke all high-risk
              </button>
            </div>
            <ServiceList
              services={services}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
              onRequestRevoke={setRevokeTarget}
            />
          </section>
        )}

        {tab === 'flow' && (
          <section aria-labelledby="flow-heading" className="space-y-4">
            <div>
              <h2 id="flow-heading" className="text-lg font-semibold text-white">
                Where your data goes
              </h2>
              <p className="mt-1 text-sm text-[var(--color-consent-muted)]">
                Filter by risk or category. Revoked services stay visible in a faded state.
              </p>
            </div>
            <DataFlowViz services={services} />
          </section>
        )}

        {tab === 'history' && (
          <section aria-labelledby="hist-heading">
            <h2 id="hist-heading" className="sr-only">
              Permission history
            </h2>
            <HistoryTimeline events={events} services={services} />
          </section>
        )}

        {tab === 'agreements' && (
          <section aria-labelledby="agr-heading" className="space-y-4">
            <h2 id="agr-heading" className="sr-only">
              All agreements
            </h2>
            <AgreementsPanel services={services} onRequestRevoke={setRevokeTarget} />
          </section>
        )}

        {tab === 'security' && (
          <section aria-labelledby="sec-heading" className="space-y-4">
            <h2 id="sec-heading" className="sr-only">
              Security
            </h2>
            <SecurityPanel />
          </section>
        )}
      </main>

      <footer className="border-t border-[var(--color-consent-border)] py-6 text-center text-xs text-zinc-500">
        Consent OS MVP — demo data only, no real integrations. Web Crypto runs locally in this
        browser tab.
      </footer>

      {revokeTarget && (
        <RevokeModal
          service={revokeTarget}
          onCancel={() => setRevokeTarget(null)}
          onConfirm={confirmRevoke}
        />
      )}

      {encOpen && <EncKeyModal onClose={() => setEncOpen(false)} />}

      <Toast message={toast ?? ''} show={!!toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
