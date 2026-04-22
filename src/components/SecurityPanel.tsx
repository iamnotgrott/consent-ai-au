import { useCallback, useState } from 'react'
import { runWebCryptoDemo } from '../lib/webCryptoDemo'
import { getInitialAppSnapshot } from '../data/seed'
import type { Service } from '../types'

function honestWhereBox() {
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-sm text-zinc-300">
      <p className="font-medium text-sky-200">What runs in this browser demo</p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
        The interactive panel below uses the Web Cryptography API (<code>crypto.subtle</code>) — real
        ECDH (P-256), HKDF, AES-256-GCM, and optional RSA-OAEP-2048. It does <strong>not</strong> use
        Secure Enclave, Face ID, or a device TEE; those would apply to a production native
        &quot;gatekeeper&quot; build. The narrative above describes the <em>intended</em> end-state;
        the buttons prove the standard primitives.
      </p>
    </div>
  )
}

function blocks() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/80 p-4">
        <p className="text-xs font-semibold text-[var(--color-consent-teal)]">Symmetric</p>
        <h3 className="mt-1 text-sm font-semibold text-white">The safe — local encryption</h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          AES-256-GCM protects at-rest consent snapshots and history on-device. In production, a
          random key and envelope encryption reduce blast radius.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {['AES-256-GCM', 'Client-side', 'High throughput'].map((c) => (
            <span
              key={c}
              className="rounded border border-zinc-700 bg-zinc-900/50 px-2 py-0.5 font-mono text-[10px] text-zinc-400"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/80 p-4">
        <p className="text-xs font-semibold text-violet-300">Asymmetric</p>
        <h3 className="mt-1 text-sm font-semibold text-white">The key — agree &amp; verify</h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          ECDH (P-256) establishes a shared secret; RSA-OAEP-2048 can wrap a storage key for blind
          transport. Challenge signing in production is often done with passkeys or platform keys.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {['ECDH P-256', 'RSA-OAEP-2048', 'HKDF-SHA-256'].map((c) => (
            <span
              key={c}
              className="rounded border border-zinc-700 bg-zinc-900/50 px-2 py-0.5 font-mono text-[10px] text-zinc-400"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-[var(--color-consent-border)] bg-[var(--color-consent-surface)]/80 p-4">
        <p className="text-xs font-semibold text-amber-300">Physical gate</p>
        <h3 className="mt-1 text-sm font-semibold text-white">The trigger — in production</h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Biometrics and Secure Enclave / StrongBox bind signing to a device. In this web demo we use
          the browser’s crypto engine only; say that on stage in one sentence.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {['WebAuthn (proposed)', 'OS keystore (native)', 'No biometric in PWA alone'].map((c) => (
            <span
              key={c}
              className="rounded border border-zinc-700 bg-zinc-900/50 px-2 py-0.5 font-mono text-[10px] text-zinc-400"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function breachBox() {
  return (
    <div className="rounded-xl border border-[var(--color-consent-teal)]/30 bg-[var(--color-consent-teal)]/5 p-5">
      <h3 className="text-sm font-semibold text-white">Why this helps after a breach (conceptual)</h3>
      <ul className="mt-3 space-y-2 text-sm text-zinc-400">
        <li>
          <span className="text-rose-400">×</span> A leaked <strong className="text-zinc-300">public
          key</strong> cannot decrypt past ciphertexts.
        </li>
        <li>
          <span className="text-rose-400">×</span> Stolen <strong className="text-zinc-300">encrypted
          blobs</strong> require the key material that stayed on your side of the key agreement.
        </li>
        <li>
          <span className="text-emerald-400">✓</span> A design that <strong className="text-zinc-300">
            never sends plaintext</strong> to the log server is easier to show than to backtrack in
          court.
        </li>
      </ul>
    </div>
  )
}

export function SecurityPanel() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const onRun = useCallback(async (includeRsa: boolean) => {
    setLoading(true)
    setErr(null)
    setResult(null)
    try {
      const snap = getInitialAppSnapshot()
      const payload = JSON.stringify(
        { services: snap.services.map(summarize), generatedAt: new Date().toISOString() },
        null,
        0,
      )
      const res = await runWebCryptoDemo(payload, includeRsa)
      if (!res.ok) {
        setErr(res.error)
        return
      }
      const lines: string[] = []
      lines.push('── Live Web Crypto (real primitives) ──')
      for (const s of res.steps) {
        lines.push(`${s.title}\n  ${s.detail}`)
      }
      lines.push(`ECDH: ${res.ecdhCurve}`)
      lines.push(`AES: ${res.aes}`)
      lines.push(`HKDF: ${res.hkdf}`)
      if (res.rsa) {
        lines.push(`RSA: ${res.rsa.label}`)
        lines.push(`Wrapped key (hex preview): ${res.rsa.wrappedAesKeyHex.slice(0, 64)}…`)
      }
      lines.push(`IV ‖ ciphertext (hex preview): ${res.ivAndCiphertextHex.slice(0, 80)}…`)
      lines.push('Round-trip decrypt: OK (matches original JSON).')
      setResult(lines.join('\n\n'))
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Hybrid security story</h2>
        <p className="mt-1 text-sm text-[var(--color-consent-muted)]">
          Symmetric + asymmetric + (in native apps) hardware-backed identity. Below: honest scope +
          a working browser crypto demo.
        </p>
      </div>

      {honestWhereBox()}

      {blocks()}

      <div>
        <h3 className="text-sm font-semibold text-zinc-300">Authentication flow (narrative)</h3>
        <ol className="mt-3 space-y-3 text-sm text-zinc-400">
          <li>
            <strong className="text-zinc-200">1. Request</strong> — an external system sends a
            challenge; no bulk personal data in that round trip.
          </li>
          <li>
            <strong className="text-zinc-200">2. Unlock</strong> — user proves presence (in native:
            biometrics; in web: your session or WebAuthn).
          </li>
          <li>
            <strong className="text-zinc-200">3. Sign / derive</strong> — key material is used once to
            sign or to derive encryption keys.
          </li>
          <li>
            <strong className="text-zinc-200">4. Access</strong> — verifier checks without learning
            long-lived secrets.
          </li>
        </ol>
      </div>

      {breachBox()}

      <div className="rounded-xl border border-[var(--color-consent-border)] bg-zinc-950/40 p-4">
        <h3 className="text-sm font-semibold text-white">Interactive: Web Crypto proof</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Runs ECDH P-256 → HKDF-SHA-256 → AES-256-GCM on a JSON snapshot. RSA-2048 generation can
          take 1–2s on the first run.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => onRun(false)}
            className="rounded-lg border border-[var(--color-consent-teal)]/50 bg-[var(--color-consent-teal)]/15 px-4 py-2 text-sm font-medium text-[var(--color-consent-teal)] hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Running…' : 'Run demo (no RSA wait)'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onRun(true)}
            className="rounded-lg border border-zinc-600 bg-zinc-800/80 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700/80 disabled:opacity-50"
          >
            {loading ? 'Running…' : 'Full pipeline + RSA-2048 wrap'}
          </button>
        </div>
        {err && (
          <p className="mt-3 whitespace-pre-wrap rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 font-mono text-xs text-rose-200">
            {err}
          </p>
        )}
        {result && (
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--color-consent-border)] bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-[var(--color-consent-teal)]/90">
            {result}
          </pre>
        )}
      </div>
    </div>
  )
}

function summarize(s: Service) {
  return { id: s.id, name: s.name, risk: s.riskLevel, status: s.status }
}
