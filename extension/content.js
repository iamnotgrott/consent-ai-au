/* Heuristic capture of cookie/consent UI and likely “accept” clicks. */

const BANNER_KEY = (origin) => `cosExt_banner_${origin}`
const lastClick = { t: 0, label: '' }

function post(payload) {
  if (!chrome.runtime?.id) return
  chrome.runtime.sendMessage({ type: 'COS_DETECTION', payload }, () => {
    if (chrome.runtime.lastError) {
      // ignore
    }
  })
}

function isVisible(el) {
  if (!(el instanceof Element)) return false
  const st = globalThis.getComputedStyle(el)
  if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false
  const r = el.getBoundingClientRect()
  return r.width > 8 && r.height > 8
}

const KEYWORD =
  /cookie|consent|gdpr|ccpa|privacy|policy|agree|terms|трек|файл.*cookie|соглас/i

function firstBannerLike() {
  const candidates = document.querySelectorAll(
    'div,section,aside,dialog,form,[role="dialog"],[class*="cookie" i],[class*="consent" i],[id*="cookie" i],[id*="consent" i]',
  )
  for (const el of candidates) {
    if (!isVisible(el)) continue
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim()
    if (t.length < 20 || t.length > 4000) continue
    if (!KEYWORD.test(t)) continue
    return { el, snippet: t.slice(0, 600) }
  }
  return null
}

function maybeSendBanner() {
  const origin = location.origin
  try {
    if (sessionStorage.getItem(BANNER_KEY(origin))) return
  } catch {
    // private mode
  }
  const hit = firstBannerLike()
  if (!hit) return
  try {
    sessionStorage.setItem(BANNER_KEY(origin), '1')
  } catch {
    // ignore
  }
  const rawId = btoa(unescape(encodeURIComponent(`${origin}::${hit.snippet.slice(0, 80)}`)))
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 24)
  const id = `det-banner-${rawId}`
  post({
    id,
    origin,
    pageTitle: document.title || origin,
    kind: 'cookie_banner',
    snippet: hit.snippet,
    url: location.href,
    selector: 'heuristic:banner',
  })
}

function onClick(ev) {
  const el = ev.target
  if (!(el instanceof Element)) return
  const raw = (el.textContent || '').replace(/\s+/g, ' ').trim()
  const text = raw.slice(0, 80)
  if (!text) return
  const match =
    /^accept( all)?$/i.test(text) ||
    /^agree( all)?$/i.test(text) ||
    /^i agree/i.test(text) ||
    /^allow( all| cookies)?$/i.test(text) ||
    /^ok(,)?$/i.test(text)
  if (!match) return
  const now = Date.now()
  if (text === lastClick.label && now - lastClick.t < 2000) return
  if (now - lastClick.t < 400) return
  lastClick.t = now
  lastClick.label = text
  const id = `det-click-${now}-${Math.random().toString(36).slice(2, 8)}`
  post({
    id,
    origin: location.origin,
    pageTitle: document.title || location.origin,
    kind: 'consent_click',
    snippet: `Click: “${text}”`,
    url: location.href,
    selector: (el.id && `#${el.id}`) || el.tagName,
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(maybeSendBanner, 500)
  })
} else {
  setTimeout(maybeSendBanner, 500)
}

let _obsLast = 0
const obs = new MutationObserver(() => {
  const n = Date.now()
  if (n - _obsLast < 1200) return
  _obsLast = n
  maybeSendBanner()
})
if (document.documentElement) {
  obs.observe(document.documentElement, { childList: true, subtree: true })
}

document.addEventListener('click', onClick, true)
