/** Default local Consent OS detections store (see server/detections-server.mjs). */
const DEFAULT_STORE = 'http://127.0.0.1:3847'

function storeBase() {
  return (typeof chrome !== 'undefined' && chrome.storage?.local)
    ? new Promise((resolve) => {
        chrome.storage.local.get({ storeUrl: DEFAULT_STORE }, (o) => resolve(o.storeUrl || DEFAULT_STORE))
      })
    : Promise.resolve(DEFAULT_STORE)
}

/**
 * @param {string} path e.g. '/api/detections'
 */
async function storeUrl(path) {
  const base = (await storeBase()).replace(/\/$/, '')
  return `${base}${path}`
}

async function postDetection(payload) {
  const u = await storeUrl('/api/detections')
  const res = await fetch(u, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Store ${res.status}: ${t}`)
  }
  return res.json()
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'COS_DETECTION' && msg.payload) {
    const p = { ...msg.payload }
    if (!p.timestamp) p.timestamp = new Date().toISOString()
    postDetection(p)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((e) => {
        console.warn('[Consent OS ext]', e)
        sendResponse({ ok: false, error: e instanceof Error ? e.message : String(e) })
        chrome.storage?.local.set({
          lastError: e instanceof Error ? e.message : String(e),
          lastErrorTime: new Date().toISOString(),
        })
      })
    return true
  }
  if (msg && msg.type === 'COS_GET_STORE_BASE') {
    storeBase()
      .then((base) => sendResponse({ base }))
      .catch((e) => sendResponse({ base: DEFAULT_STORE, error: String(e) }))
    return true
  }
  return false
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage?.local.get({ storeUrl: null }, (o) => {
    if (!o.storeUrl) chrome.storage?.local.set({ storeUrl: DEFAULT_STORE })
  })
})
