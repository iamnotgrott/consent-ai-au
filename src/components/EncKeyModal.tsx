export function EncKeyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enc-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)] p-6 shadow-xl">
        <h2 id="enc-modal-title" className="text-lg font-semibold text-white">
          Encryption in this demo
        </h2>
        <p className="mt-2 text-sm text-[var(--color-consent-muted)]">
          The <strong className="text-zinc-300">Security</strong> tab runs real Web Crypto: ECDH
          (P-256), HKDF-SHA-256, AES-256-GCM, and optional RSA-OAEP-2048. Key material shown here is
          illustrative; live output appears after you run the demo.
        </p>
        <dl className="mt-4 space-y-2 rounded-lg border border-[var(--color-consent-teal)]/25 bg-black/30 p-3 font-mono text-[11px] text-[var(--color-consent-teal)]/90">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Local encryption</dt>
            <dd>AES-256-GCM</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Key agreement</dt>
            <dd>ECDH P-256</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Key derivation</dt>
            <dd>HKDF-SHA-256</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Optional wrap</dt>
            <dd>RSA-OAEP-2048</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-zinc-500">
          No keys are sent to a server in this prototype — everything runs in your browser tab.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-zinc-600 py-2.5 text-sm text-white hover:bg-white/5"
        >
          Close
        </button>
      </div>
    </div>
  )
}
