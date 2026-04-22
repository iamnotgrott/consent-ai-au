export function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return iso
  }
}

/** Display YYYY-MM-DD in short locale form */
export function formatDateYmd(ymd: string): string {
  try {
    const d = new Date(ymd + 'T12:00:00.000Z')
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(d)
  } catch {
    return ymd
  }
}

/** True if ymd is within the next `days` calendar days. */
export function isExpiringWithinDays(ymd: string, days: number): boolean {
  const end = new Date(ymd + 'T12:00:00.000Z').getTime()
  const now = Date.now()
  const ms = end - now
  return ms > 0 && ms < days * 86_400_000
}
