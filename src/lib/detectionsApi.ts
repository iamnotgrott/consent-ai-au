import type { StoredDetection } from '../types'

const DEFAULT_BASE = 'http://127.0.0.1:3847'

export function getLocalStoreBaseUrl(): string {
  return import.meta.env.VITE_LOCAL_STORE_URL?.trim() || DEFAULT_BASE
}

export async function fetchDetections(): Promise<StoredDetection[]> {
  const base = getLocalStoreBaseUrl()
  const res = await fetch(`${base}/api/detections`, { method: 'GET' })
  if (!res.ok) throw new Error(`Store HTTP ${res.status}`)
  const data: unknown = await res.json()
  if (data && typeof data === 'object' && 'detections' in data) {
    const d = (data as { detections: unknown }).detections
    if (Array.isArray(d)) return d as StoredDetection[]
  }
  return []
}
