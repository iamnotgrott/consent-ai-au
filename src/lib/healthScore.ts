import type { Service } from '../types'

export interface HealthBreakdown {
  lowRiskActive: number
  mediumRiskActive: number
  highRiskActive: number
  noExpiryActive: number
  dataCategoryCount: number
}

function collectCategories(services: Service[]) {
  const set = new Set<string>()
  for (const s of services) {
    if (s.status !== 'active') continue
    for (const c of s.dataShared) set.add(c)
  }
  return set.size
}

/**
 * Heuristic 0–100 score: lower when high-risk or indefinite consents pile up.
 */
export function computeConsentHealth(services: Service[]): {
  score: number
  status: 'Strong' | 'Good' | 'Fair' | 'Needs review'
  breakdown: HealthBreakdown
} {
  const active = services.filter((s) => s.status === 'active')
  const low = active.filter((s) => s.riskLevel === 'low').length
  const med = active.filter((s) => s.riskLevel === 'medium').length
  const high = active.filter((s) => s.riskLevel === 'high').length
  const noExp = active.filter((s) => s.expiryDate === null).length
  const cats = collectCategories(services)

  let score = 100
  score -= high * 12
  score -= med * 5
  score -= noExp * 8
  score -= Math.max(0, cats - 5) * 2
  score += Math.min(6, low) * 2

  score = Math.max(0, Math.min(100, Math.round(score)))

  const status: 'Strong' | 'Good' | 'Fair' | 'Needs review' =
    score >= 85 ? 'Strong' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs review'

  return {
    score,
    status,
    breakdown: {
      lowRiskActive: low,
      mediumRiskActive: med,
      highRiskActive: high,
      noExpiryActive: noExp,
      dataCategoryCount: cats,
    },
  }
}
