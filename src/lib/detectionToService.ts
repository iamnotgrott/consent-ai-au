import { servicesSeed } from '../data/seed'
import type { DataCategory, RiskLevel, Service, ServiceCategory, StoredDetection } from '../types'

const HIGH_RISK = /financial|biometric|health|medical|ssn|passport|credit|payment|bank/i
const MEDIUM_RISK = /location|gps|address|email|phone|track|analytic|market/i
const PERSONAL = /name|identit|email|account|phone|address|profile|personal/i
const BEHAVIORAL = /cookie|analytic|track|behave|engagement|session/i
const LOCATION = /location|geo|gps|map/i
const FINANCIAL = /payment|financ|card|bank|transact|billing/i
const BIOMETRIC = /biometric|fingerprint|face|voice|iris/i
const MEDICAL = /medical|health|diagn|prescription|patient/i
const GOVERNMENT = /govern|tax|nation|id verif|civil|state/i
const EDUCATION = /educ|course|school|univers|student|learn/i

function inferDataShared(text: string): DataCategory[] {
  const t = text.slice(0, 2000)
  const out: DataCategory[] = []
  if (PERSONAL.test(t)) out.push('personal', 'contact')
  if (BEHAVIORAL.test(t)) out.push('behavioral')
  if (LOCATION.test(t)) out.push('location')
  if (FINANCIAL.test(t)) out.push('financial')
  if (BIOMETRIC.test(t)) out.push('biometric')
  if (MEDICAL.test(t)) out.push('medical')
  if (GOVERNMENT.test(t)) out.push('government')
  if (EDUCATION.test(t)) out.push('education')
  if (out.length === 0) out.push('personal', 'behavioral')
  return Array.from(new Set(out))
}

function inferRisk(text: string): { level: RiskLevel; reason: string } {
  const t = text.slice(0, 2000)
  if (HIGH_RISK.test(t)) {
    return { level: 'high', reason: 'Snippet or page flags sensitive or financial/health data.' }
  }
  if (MEDIUM_RISK.test(t)) {
    return { level: 'medium', reason: 'Location, contact, or tracking-related language in capture.' }
  }
  return { level: 'low', reason: 'Heuristic: generic consent or banner; review the snippet.' }
}

function inferCategory(d: StoredDetection): ServiceCategory {
  const t = `${d.snippet} ${d.url} ${d.pageTitle}`.toLowerCase()
  if (EDUCATION.test(t)) return 'education'
  if (GOVERNMENT.test(t)) return 'government'
  if (MEDICAL.test(t)) return 'medical'
  if (FINANCIAL.test(t)) return 'financial'
  return 'commerce'
}

function shortHost(origin: string): string {
  try {
    return new URL(origin).hostname.replace(/^www\./, '')
  } catch {
    return origin.replace(/\/$/, '')
  }
}

const KIND_LABEL: Record<StoredDetection['kind'], string> = {
  cookie_banner: 'Cookie / consent UI',
  consent_click: 'Accept / agree click',
  terms_surface: 'Policy / terms surface',
}

/**
 * Map a stored browser detection into a `Service` for the Consent OS UI.
 * IDs are `ext-…` so they stay distinct from seed data.
 */
export function detectionIdToServiceId(detectionId: string): string {
  return `ext-${detectionId}`
}

export function detectionToService(d: StoredDetection): Service {
  const id = detectionIdToServiceId(d.id)
  const host = shortHost(d.origin)
  const name = d.pageTitle?.trim() ? `${d.pageTitle.slice(0, 60)}` : host
  const combined = `${d.snippet} ${d.url} ${d.pageTitle}`
  const { level, reason } = inferRisk(combined)
  const dataShared = inferDataShared(combined)
  const category = inferCategory(d)
  const day = d.timestamp.slice(0, 10)

  return {
    id,
    name: name.length > 50 ? name.slice(0, 47) + '…' : name,
    shortLabel: KIND_LABEL[d.kind],
    category,
    status: 'active',
    dataShared,
    summary: `Browser capture: ${KIND_LABEL[d.kind]} on ${host}. Heuristic risk ${level}.`,
    riskLevel: level,
    riskReason: reason,
    legalText: d.snippet || 'No snippet stored for this capture.',
    plainText: `Observed: ${KIND_LABEL[d.kind]}. ${d.snippet ? `Excerpt: ${d.snippet.slice(0, 500)}` : 'Open the page URL in context for full text.'}`,
    expiryDate: null,
    whyAccepted: 'Recorded by the Consent OS browser extension (local demo) when a consent-related surface or click matched heuristics.',
    context: `Origin: ${d.origin}\nURL: ${d.url}`,
    icon: '🔌',
    timeline: [
      {
        date: day,
        text: `Detection recorded by extension (${d.kind})`,
        kind: 'granted',
      },
    ],
  }
}

export function isExtensionServiceId(id: string): boolean {
  return id.startsWith('ext-')
}

const SEED_SERVICE_IDS = new Set(servicesSeed.map((s) => s.id))

/**
 * Replaces prior extension rows with a fresh list from the API, keeps seed
 * services and preserves `revoked` for extension-originated IDs when still present in API.
 */
export function mergeServicesWithDetections(previous: Service[], detections: StoredDetection[]): Service[] {
  const seed = previous.filter((s) => SEED_SERVICE_IDS.has(s.id))
  const revoked = new Map(
    previous
      .filter((s) => isExtensionServiceId(s.id) && s.status === 'revoked')
      .map((s) => [s.id, true] as const),
  )
  const ext = detections.map(detectionToService).map((s) =>
    revoked.has(s.id) ? { ...s, status: 'revoked' as const } : s,
  )
  return [...seed, ...ext]
}
