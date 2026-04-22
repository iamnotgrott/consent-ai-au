const DEFAULT_STORE = 'http://127.0.0.1:3847'

function getBase() {
  return new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      resolve(DEFAULT_STORE)
      return
    }
    chrome.storage.local.get({ storeUrl: DEFAULT_STORE }, (o) => {
      resolve((o && o.storeUrl) || DEFAULT_STORE)
    })
  })
}

function showErr(msg) {
  const el = document.getElementById('err')
  if (!el) return
  el.textContent = msg
  el.hidden = !msg
}

function appendLine(parent, className, text) {
  const d = document.createElement('div')
  if (className) d.className = className
  d.textContent = text
  parent.appendChild(d)
}

function renderList(detections) {
  const list = document.getElementById('list')
  const empty = document.getElementById('empty')
  if (!list || !empty) return
  list.replaceChildren()
  if (!detections || detections.length === 0) {
    empty.textContent = 'No detections yet. Browse a site with a cookie banner or click Accept.'
    empty.hidden = false
    list.hidden = true
    return
  }
  empty.hidden = true
  list.hidden = false
  const sorted = [...detections].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
  for (const d of sorted.slice(0, 20)) {
    const li = document.createElement('li')
    appendLine(li, 'kind', String(d.kind || ''))
    appendLine(li, undefined, (d.pageTitle || d.origin || '').slice(0, 80))
    const originLine = (d.origin || '') + ' · ' + (d.timestamp || '').replace('T', ' ').slice(0, 19)
    appendLine(li, 'meta', originLine)
    appendLine(li, 'meta', (d.snippet || '').slice(0, 200))
    list.appendChild(li)
  }
}

async function load() {
  showErr('')
  const base = (await getBase()).replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/api/detections`, { method: 'GET' })
    if (!res.ok) {
      showErr(`Store returned ${res.status}. Start the server: npm run dev:demo (port 3847).`)
      const elEmpty = document.getElementById('empty')
      if (elEmpty) {
        elEmpty.textContent = ''
        elEmpty.hidden = true
      }
      return
    }
    const data = await res.json()
    const d = data && data.detections ? data.detections : []
    const oldEmpty = document.getElementById('empty')
    if (oldEmpty) {
      oldEmpty.textContent = ''
      oldEmpty.hidden = true
    }
    renderList(d)
  } catch (e) {
    showErr(e instanceof Error ? e.message : String(e))
    const elEmpty = document.getElementById('empty')
    if (elEmpty) {
      elEmpty.textContent = ''
      elEmpty.hidden = true
    }
  }
}

void load()
