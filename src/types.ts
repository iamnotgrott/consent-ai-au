/** Data category labels for plain-language consent summaries */
export type DataCategory =
  | 'personal'
  | 'education'
  | 'government'
  | 'financial'
  | 'location'
  | 'contact'
  | 'biometric'
  | 'medical'
  | 'behavioral'

export type ServiceCategory =
  | 'education'
  | 'government'
  | 'commerce'
  | 'medical'
  | 'financial'
  | 'municipal'

export type RiskLevel = 'low' | 'medium' | 'high'

export type ConsentStatus = 'active' | 'revoked'

export type ServiceTimelineKind = 'granted' | 'info' | 'warning' | 'access' | 'revoke' | 'update'

export interface ServiceTimelineEntry {
  date: string
  text: string
  kind: ServiceTimelineKind
}

export interface Service {
  id: string
  name: string
  /** Short org / product label */
  shortLabel: string
  category: ServiceCategory
  status: ConsentStatus
  /** Human-readable list of what is shared */
  dataShared: DataCategory[]
  /** One-line plain-language summary */
  summary: string
  riskLevel: RiskLevel
  /** Short copy for risk badge */
  riskReason: string
  /** Full legal-style clause (Agreements + toggle) */
  legalText: string
  /** Plain-language explanation (Agreements + dashboard expand) */
  plainText: string
  /** ISO date (YYYY-MM-DD) or null = indefinite */
  expiryDate: string | null
  /** Why the user accepted (narrative) */
  whyAccepted: string
  /** Extra context, incl. review hints */
  context: string
  timeline: ServiceTimelineEntry[]
  /** Optional emoji for cards */
  icon?: string
}

export type ConsentEventType = 'granted' | 'updated' | 'revoked' | 'accessed' | 'modified'

export interface ConsentEvent {
  id: string
  timestamp: string // ISO
  type: ConsentEventType
  serviceId: string
  /** Optional detail line */
  detail?: string
}

/** Edge in the data-flow graph: user is implicit source */
export interface DataShare {
  id: string
  toServiceId: string
  /** Data types flowing along this link */
  dataTypes: DataCategory[]
}

export interface AppSnapshot {
  services: Service[]
  events: ConsentEvent[]
}

/** Row persisted by the local detections server / reported by the extension */
export type DetectionKind = 'cookie_banner' | 'consent_click' | 'terms_surface'

export interface StoredDetection {
  id: string
  origin: string
  pageTitle: string
  kind: DetectionKind
  snippet: string
  url: string
  timestamp: string
  selector?: string
  updatedAt?: string
}
