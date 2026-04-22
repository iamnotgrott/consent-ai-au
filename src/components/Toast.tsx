import { useEffect } from 'react'

export function Toast({
  message,
  show,
  onDismiss,
  durationMs = 3200,
}: {
  message: string
  show: boolean
  onDismiss: () => void
  durationMs?: number
}) {
  useEffect(() => {
    if (!show) return
    const t = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(t)
  }, [show, durationMs, onDismiss])

  if (!show) return null
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex max-w-sm items-center gap-2 rounded-xl border border-zinc-600 bg-zinc-900/95 px-4 py-3 text-sm text-zinc-100 shadow-2xl backdrop-blur-sm">
      <span aria-hidden>✓</span>
      {message}
    </div>
  )
}
