import type { ConsentEvent, DataShare, Service } from '../types'

export const servicesSeed: Service[] = [
  {
    id: 'srv-edu',
    name: 'EduPlatform',
    shortLabel: 'Education platform',
    category: 'education',
    status: 'active',
    dataShared: ['personal', 'education', 'contact', 'behavioral'],
    summary:
      'Uses your name, email, and learning activity for progress, certificates, and course personalization.',
    riskLevel: 'low',
    riskReason: 'Limited to learning data you expect on a school-style platform.',
    legalText:
      'By accepting, you authorize EduPlatform LLC to collect, process, store, and transfer your personal identification data, email address, and learning behavioral data including session duration, quiz responses, module completion, and engagement metrics, as outlined in Schedule A of the Data Processing Agreement (DPA v3.2).',
    plainText:
      'EduPlatform collects your name, email, and how you use the platform — what you watch, quiz scores, and study duration. They use this to personalize your learning. Expires Nov 2026.',
    expiryDate: '2026-11-14',
    whyAccepted:
      'Accepted to enroll in the Advanced Data Science course. Required for progress tracking, session recording, and certificate issuance.',
    context: '12-month subscription. Data shared with course instructors only.',
    icon: '🎓',
    timeline: [
      { date: '2024-11-14', text: 'Consent granted during course enrollment', kind: 'granted' },
      { date: '2024-11-15', text: 'First data collection: account created, email verified', kind: 'info' },
      { date: '2026-01-10', text: 'Learning analytics shared with course instructor', kind: 'access' },
      { date: '2026-04-15', text: 'Session recorded — Module 3, 45 minutes', kind: 'access' },
    ],
  },
  {
    id: 'srv-gov',
    name: 'GovPortal',
    shortLabel: 'Government digital services',
    category: 'government',
    status: 'active',
    dataShared: ['personal', 'government', 'contact', 'biometric', 'financial', 'location'],
    summary:
      'Accesses national ID, address, biometrics, tax and travel data for state services; no end date by default—review carefully.',
    riskLevel: 'high',
    riskReason: 'High sensitivity: ID, biometrics, and broad state-held categories—no expiry set.',
    legalText:
      'Pursuant to Law No. 7/2022 on Digital Public Services, you consent to collection and processing of your identification data including national registration number, residential address, biometric identifiers (fingerprint, facial geometry), and financial records for state services delivery and regulatory compliance.',
    plainText:
      'GovPortal accesses your national ID, home address, fingerprint/face data, and tax records. No expiry date — runs until revoked. Biometrics are the most sensitive category.',
    expiryDate: null,
    whyAccepted:
      'Required for digital civil services: tax, ID renewal, and border-related authorization. No opt-out alternative for full services.',
    context:
      'No expiry set — consider periodic review. Biometric data may be shared with border and law-enforcement systems per mandate.',
    icon: '🏛️',
    timeline: [
      { date: '2024-09-03', text: 'Consent granted — mandatory for portal registration', kind: 'granted' },
      { date: '2024-09-03', text: 'National ID and address verified', kind: 'info' },
      { date: '2024-09-10', text: 'Biometric data (fingerprint) enrolled', kind: 'warning' },
      { date: '2026-04-08', text: 'Biometric data shared with border control API', kind: 'access' },
      { date: '2026-04-19', text: 'National ID verified for document service request', kind: 'access' },
    ],
  },
  {
    id: 'srv-delivery',
    name: 'DeliveryApp',
    shortLabel: 'Commerce & delivery',
    category: 'commerce',
    status: 'active',
    dataShared: ['personal', 'contact', 'location', 'financial', 'behavioral'],
    summary:
      'Real-time GPS, addresses, order history, and payment method; data may be shared with partner analytics providers.',
    riskLevel: 'medium',
    riskReason: 'Location plus spending patterns; check sharing scope and partners.',
    legalText:
      'You grant DeliveryApp Inc. and its affiliated logistics partners the right to access real-time geolocation data, delivery address records, purchase history, and associated behavioral data for service fulfilment, route optimization, and targeted communications, including sharing with third-party analytics providers.',
    plainText:
      'DeliveryApp tracks your GPS in real time, knows your addresses, and sees what you order. They may share with partner companies for logistics and marketing. Check expiry below.',
    expiryDate: '2026-04-28',
    whyAccepted:
      'Accepted at first checkout to enable delivery tracking, address auto-fill, and payment processing.',
    context: 'Expires soon — only renew if you still use the service. Review partner sharing in settings.',
    icon: '📦',
    timeline: [
      { date: '2026-01-22', text: 'Consent granted at first checkout', kind: 'granted' },
      { date: '2026-01-22', text: 'Payment method stored, addresses saved', kind: 'info' },
      { date: '2026-04-10', text: 'Data sharing extended to additional partner companies', kind: 'warning' },
      { date: '2026-04-18', text: 'Real-time GPS tracked for 47 minutes during delivery', kind: 'access' },
    ],
  },
  {
    id: 'srv-health',
    name: 'HealthApp',
    shortLabel: 'Medical & wearables',
    category: 'medical',
    status: 'active',
    dataShared: ['personal', 'medical', 'biometric', 'contact'],
    summary:
      'Stores diagnoses, prescriptions, medical history, and wearable biometrics. Highest sensitivity — revoke if unused.',
    riskLevel: 'high',
    riskReason: 'Health + biometrics; insurers or APIs may access per your consent and law.',
    legalText:
      'You authorize HealthApp Medical Technologies to collect, store, and process your personal health information including diagnoses, prescriptions, complete medical history, wearable sensor telemetry, and biometric measurements under applicable health data rules, with retention per policy.',
    plainText:
      'HealthApp stores your medical history, medications, and smartwatch data (heart rate, sleep, steps). Most sensitive data type. No expiry by default—revoke if inactive.',
    expiryDate: null,
    whyAccepted:
      'Accepted to sync smartwatch data and store prescriptions for reminders and GP integration.',
    context: 'Insurance verification may access records. Review access log regularly.',
    icon: '🏥',
    timeline: [
      { date: '2024-08-10', text: 'Consent granted — wearable sync + prescription storage', kind: 'granted' },
      { date: '2024-08-10', text: 'Biometric wearable data sync initiated', kind: 'info' },
      { date: '2024-11-20', text: 'GP appointment history integrated', kind: 'info' },
      { date: '2026-04-03', text: 'Medical records accessed by insurance verification API', kind: 'access' },
      { date: '2026-04-20', text: 'Biometric data accessed (heart rate, sleep patterns)', kind: 'access' },
    ],
  },
  {
    id: 'srv-bank',
    name: 'BankApp',
    shortLabel: 'Open banking & finance',
    category: 'financial',
    status: 'active',
    dataShared: ['personal', 'government', 'financial', 'contact'],
    summary:
      'Open banking: balances, full transaction history, credit and income data for budgeting and offers.',
    riskLevel: 'medium',
    riskReason: 'Full financial picture; regulated but broad.',
    legalText:
      'By continuing, you authorize BankApp Financial Services to access Open Banking data including account balances, complete transaction history, income data, and credit assessment scoring via regulated APIs for personal finance and product recommendations.',
    plainText:
      'BankApp can see every transaction, your balance, credit score, and income. Used to offer you financial products. Review expiry.',
    expiryDate: '2026-12-01',
    whyAccepted:
      'Accepted to enable Open Banking: budgeting, savings suggestions, and credit monitoring under applicable frameworks.',
    context: 'One-year rolling term. Scope limited to financial data — no location or health.',
    icon: '💳',
    timeline: [
      { date: '2024-12-01', text: 'Consent granted for Open Banking access', kind: 'granted' },
      { date: '2024-12-01', text: 'Account linked, transaction history imported', kind: 'info' },
      { date: '2026-02-15', text: 'Credit score accessed for loan eligibility check', kind: 'access' },
      { date: '2026-04-17', text: 'Transaction history exported to partner analytics', kind: 'access' },
    ],
  },
  {
    id: 'srv-city',
    name: 'CityPass',
    shortLabel: 'Municipal transit',
    category: 'municipal',
    status: 'active',
    dataShared: ['personal', 'location', 'behavioral'],
    summary: 'Transit routes and usage for tap-to-ride; data anonymized after 30 days per local rules.',
    riskLevel: 'low',
    riskReason: 'Limited scope; anonymization and no broad third-party sharing in policy.',
    legalText:
      'You consent to use of your transit usage data by CityPass Municipal Authority for transport optimization and urban planning. Data is anonymized within 30 days of collection where stated in the municipal program.',
    plainText:
      'CityPass knows which bus/metro routes you use and when. Anonymized after 30 days for city planning. Low third-party risk.',
    expiryDate: '2027-02-14',
    whyAccepted: 'Accepted for personalized transit pass and tap-to-ride on public transport.',
    context: 'Low risk, renewable term. No marketing partners in this program.',
    icon: '🏙️',
    timeline: [
      { date: '2026-02-14', text: 'Consent granted — monthly transit pass enrollment', kind: 'granted' },
      { date: '2026-02-14', text: 'Card linked, tap-to-ride activated', kind: 'info' },
      { date: '2026-03-22', text: 'Usage data aggregated for city planning report', kind: 'access' },
    ],
  },
]

export const eventsSeed: ConsentEvent[] = [
  { id: 'ev-1', timestamp: '2024-11-14T10:00:00.000Z', type: 'granted', serviceId: 'srv-edu', detail: 'Consent accepted during course enrollment.' },
  { id: 'ev-2', timestamp: '2024-12-01T12:00:00.000Z', type: 'granted', serviceId: 'srv-bank', detail: 'Open Banking consent granted.' },
  { id: 'ev-3', timestamp: '2026-01-22T16:00:00.000Z', type: 'granted', serviceId: 'srv-delivery', detail: 'Delivery and location consent granted at checkout.' },
  { id: 'ev-4', timestamp: '2026-02-14T08:00:00.000Z', type: 'granted', serviceId: 'srv-city', detail: 'Municipal transit program enrolled.' },
  { id: 'ev-5', timestamp: '2026-04-10T11:00:00.000Z', type: 'modified', serviceId: 'srv-delivery', detail: 'Data sharing scope extended to additional partners.' },
  { id: 'ev-6', timestamp: '2026-04-18T19:00:00.000Z', type: 'accessed', serviceId: 'srv-delivery', detail: 'Real-time geolocation tracked during delivery (47 min).' },
  { id: 'ev-7', timestamp: '2026-04-20T07:00:00.000Z', type: 'accessed', serviceId: 'srv-health', detail: 'Biometric data accessed (heart rate, sleep patterns).' },
  { id: 'ev-8', timestamp: '2026-04-19T14:00:00.000Z', type: 'accessed', serviceId: 'srv-gov', detail: 'National ID verified for document service request.' },
  { id: 'ev-9', timestamp: '2026-04-17T13:00:00.000Z', type: 'accessed', serviceId: 'srv-bank', detail: 'Transaction history exported to partner analytics engine.' },
  { id: 'ev-10', timestamp: '2026-04-08T12:00:00.000Z', type: 'accessed', serviceId: 'srv-gov', detail: 'Biometric data shared with border control system API.' },
  { id: 'ev-11', timestamp: '2026-04-03T09:00:00.000Z', type: 'accessed', serviceId: 'srv-health', detail: 'Medical records accessed by insurance verification system.' },
  { id: 'ev-12', timestamp: '2026-04-15T10:00:00.000Z', type: 'accessed', serviceId: 'srv-edu', detail: 'Learning session recorded — Module 3, 45 minutes.' },
]

function deepCopyService(s: Service): Service {
  return {
    ...s,
    dataShared: [...s.dataShared],
    timeline: s.timeline.map((t) => ({ ...t })),
  }
}

function deepCopyEvent(e: ConsentEvent): ConsentEvent {
  return { ...e }
}

/** Fresh deep copy for initial load or “Reset demo” */
export function getInitialAppSnapshot() {
  return {
    services: servicesSeed.map(deepCopyService),
    events: eventsSeed.map(deepCopyEvent),
  }
}

/** Initial snapshot for app state and "Reset demo" */
export const initialAppSnapshot = getInitialAppSnapshot()

/** @deprecated use initialAppSnapshot.services */
export const initialServices = initialAppSnapshot.services
/** @deprecated use initialAppSnapshot.events */
export const initialConsentEvents = initialAppSnapshot.events

export const dataShares: DataShare[] = servicesSeed.map((s) => ({
  id: `ds-${s.id}`,
  toServiceId: s.id,
  dataTypes: [...s.dataShared],
}))

/** Pretty labels for data categories (plain language) */
export const dataCategoryLabels: Record<string, string> = {
  personal: 'Name & profile',
  education: 'Learning activity & grades',
  government: 'Verified ID & civil records',
  financial: 'Payment & banking data',
  location: 'Location (incl. real-time when enabled)',
  contact: 'Email & phone',
  biometric: 'Biometrics & wearable signals',
  medical: 'Health & medical records',
  behavioral: 'Usage & engagement behavior',
}
