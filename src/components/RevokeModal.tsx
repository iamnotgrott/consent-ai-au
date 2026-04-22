import type { Service } from '../types'

export function RevokeModal({
  service,
  onConfirm,
  onCancel,
}: {
  service: Service
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="revoke-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)] p-6 shadow-xl">
        <h2 id="revoke-title" className="text-lg font-semibold text-white">
          Revoke access?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-consent-muted)]">
          This will mark your consent for{' '}
          <span className="font-medium text-white">{service.name}</span> as revoked in Consent
          OS. In a full deployment, we would notify the service and enforce removal per policy.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--color-consent-border)] px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500"
          >
            Revoke access
          </button>
        </div>
      </div>
    </div>
  )
}
