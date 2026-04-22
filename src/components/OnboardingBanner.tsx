import { useState } from 'react'

export function OnboardingBanner({ message }: { message: string }) {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-[var(--color-consent-teal)]/35 bg-gradient-to-r from-[var(--color-consent-teal)]/10 to-violet-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <p className="text-sm text-zinc-200">
        <strong className="text-[var(--color-consent-teal)]">Alert:</strong> {message}
      </p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="shrink-0 self-end text-zinc-500 hover:text-zinc-300 sm:self-auto"
        aria-label="Dismiss alert"
      >
        ×
      </button>
    </div>
  )
}
