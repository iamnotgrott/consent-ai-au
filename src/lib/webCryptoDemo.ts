/**
 * Browser Web Crypto proof-of-concept: ECDH (P-256) → HKDF → AES-256-GCM,
 * plus optional RSA-OAEP-2048 wrapping of the exported AES key.
 * All client-side; suitable for a pitch demo, not a security audit.
 */

const HKDF_INFO = new TextEncoder().encode('consent-os-webcrypto-v1')

export interface DemoStep {
  title: string
  detail: string
}

export interface WebCryptoDemoSuccess {
  ok: true
  steps: DemoStep[]
  /** Hex-encoded 12-byte IV + AES-GCM ciphertext (tag appended by Web Crypto) */
  ivAndCiphertextHex: string
  /** Round-trip check */
  plaintextUtf8: string
  ecdhCurve: 'P-256 (ECDH — DH-style key agreement in the browser)'
  aes: 'AES-256-GCM'
  hkdf: 'HKDF-SHA-256 (derives a storage key from the ECDH shared secret)'
  rsa: {
    label: 'RSA-OAEP-2048 (wraps the AES key for transport narrative)'
    /** Hex of wrapped 32-byte raw AES key */
    wrappedAesKeyHex: string
  } | null
  /** First 32 hex chars of SPKI for display */
  rsaPublicKeyFingerprint?: string
}

export interface WebCryptoDemoFailure {
  ok: false
  error: string
}

export type WebCryptoDemoResult = WebCryptoDemoSuccess | WebCryptoDemoFailure

function bufToHex(b: ArrayBuffer | Uint8Array): string {
  const u8 = b instanceof ArrayBuffer ? new Uint8Array(b) : b
  return [...u8].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function hexPreview(hex: string, n = 32): string {
  return hex.length <= n ? hex : `${hex.slice(0, n)}…`
}

/**
 * Run the full pipeline on `plaintextUtf8` (e.g. JSON snapshot).
 * @param includeRsa if false, skips RSA generation (faster) — use true for full story.
 */
export async function runWebCryptoDemo(
  plaintextUtf8: string,
  includeRsa = true,
): Promise<WebCryptoDemoResult> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    return { ok: false, error: 'Web Crypto API not available in this context.' }
  }

  const steps: DemoStep[] = []

  try {
    // 1) ECDH key pairs (Alice = local user, Bob = other party; same device for demo)
    const algoEcdh: EcKeyGenParams = { name: 'ECDH', namedCurve: 'P-256' }
    const [alice, bob] = await Promise.all([
      subtle.generateKey(algoEcdh, true, ['deriveBits', 'deriveKey']),
      subtle.generateKey(algoEcdh, true, ['deriveBits', 'deriveKey']),
    ])

    const aliceSpki = await subtle.exportKey('spki', alice.publicKey)
    const bobSpki = await subtle.exportKey('spki', bob.publicKey)

    steps.push({
      title: '1 · ECDH key pairs (P-256)',
      detail: `Two ephemeral key pairs. Alice SPKI: ${hexPreview(bufToHex(aliceSpki))} · Bob SPKI: ${hexPreview(bufToHex(bobSpki))}`,
    })
    steps.push({
      title: '2 · Shared secret (same as Bob deriving with Alice’s public key)',
      detail:
        'Both parties would compute the same shared bits over an open channel. Here we run deriveBits as Alice with Bob’s public key.',
    })

    const sharedBits = await subtle.deriveBits(
      { name: 'ECDH', public: bob.publicKey },
      alice.privateKey!,
      256,
    )

    steps.push({
      title: '3 · Shared secret bits',
      detail: `deriveBits(256) → ${hexPreview(bufToHex(sharedBits), 24)} (preview)`,
    })

    // HKDF: import raw as HKDF input key
    const hkdfBase = await subtle.importKey('raw', sharedBits, { name: 'HKDF' }, false, [
      'deriveKey',
    ])

    const salt = new Uint8Array(16)
    globalThis.crypto.getRandomValues(salt)

    const aesKey = await subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info: HKDF_INFO,
      },
      hkdfBase,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )

    steps.push({
      title: '4 · Derive AES-256-GCM key (HKDF-SHA-256)',
      detail: 'Derives a symmetric key from the ECDH output — this is a common “real world” pattern.',
    })

    const iv = new Uint8Array(12)
    globalThis.crypto.getRandomValues(iv)
    const plainBytes = new TextEncoder().encode(plaintextUtf8)
    const enc = await subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plainBytes)

    steps.push({
      title: '5 · AES-256-GCM encrypt (consent snapshot)',
      detail: 'IV 12 bytes + ciphertext + tag (Web Crypto returns single buffer).',
    })

    const dec = await subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, enc)
    const roundTrip = new TextDecoder().decode(dec)
    if (roundTrip !== plaintextUtf8) {
      return { ok: false, error: 'Decrypted payload mismatch (demo integrity check failed).' }
    }

    const ivAndCipher = new Uint8Array(iv.length + enc.byteLength)
    ivAndCipher.set(iv, 0)
    ivAndCipher.set(new Uint8Array(enc), iv.length)
    const ivAndCiphertextHex = bufToHex(ivAndCipher)

    let rsa: WebCryptoDemoSuccess['rsa'] = null
    let rsaPublicKeyFingerprint: string | undefined

    if (includeRsa) {
      const rsaPair = await subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
      )

      const rawAes = await subtle.exportKey('raw', aesKey)
      const spkiRsa = await subtle.exportKey('spki', rsaPair.publicKey)
      rsaPublicKeyFingerprint = hexPreview(bufToHex(spkiRsa), 32)

      const wrapped = await subtle.wrapKey(
        'raw',
        aesKey,
        rsaPair.publicKey,
        { name: 'RSA-OAEP' },
      )

      // Prove unwrap
      const unwrapped = await subtle.unwrapKey(
        'raw',
        wrapped,
        rsaPair.privateKey!,
        { name: 'RSA-OAEP' },
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
      )
      const check = await subtle.decrypt(
        { name: 'AES-GCM', iv },
        unwrapped,
        enc,
      )
      if (new TextDecoder().decode(check) !== plaintextUtf8) {
        return { ok: false, error: 'RSA unwrap did not produce a working AES key.' }
      }

      steps.push({
        title: '6 · RSA-OAEP-2048 (wrap the AES key)',
        detail: `The AES key (${rawAes.byteLength} bytes) is wrapped for a “blind store / transport” story. Unwrap verified locally. SPKI hash preview: ${rsaPublicKeyFingerprint}`,
      })

      rsa = {
        label: 'RSA-OAEP-2048 (wraps the AES key for transport narrative)',
        wrappedAesKeyHex: bufToHex(wrapped),
      }
    } else {
      steps.push({
        title: '6 · RSA-OAEP (skipped)',
        detail: 'Re-run with includeRsa=true for RSA-2048 key generation + wrap/unwrap.',
      })
    }

    return {
      ok: true,
      steps,
      ivAndCiphertextHex,
      plaintextUtf8: roundTrip,
      ecdhCurve: 'P-256 (ECDH — DH-style key agreement in the browser)',
      aes: 'AES-256-GCM',
      hkdf: 'HKDF-SHA-256 (derives a storage key from the ECDH shared secret)',
      rsa,
      rsaPublicKeyFingerprint,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: msg }
  }
}
