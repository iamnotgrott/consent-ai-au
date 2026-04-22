import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_PORT = 3847
const HOST = '127.0.0.1'
const DATA_DIR = path.join(__dirname, '..', 'data')
const DATA_FILE = path.join(DATA_DIR, 'detections.json')

const ALLOWED_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173'])

function corsForRequest(req) {
  const origin = req.headers.origin
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'http://localhost:5173'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function readStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed.detections)) return parsed
  } catch {
    // missing or invalid
  }
  return { detections: [] }
}

function writeStore(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function sendJson(res, status, body, req) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsForRequest(req),
  })
  res.end(JSON.stringify(body))
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsForRequest(req))
    res.end()
    return
  }

  const u = new URL(req.url || '/', `http://${HOST}`)

  if (u.pathname === '/api/detections' && req.method === 'GET') {
    const store = readStore()
    sendJson(res, 200, store, req)
    return
  }

  if (u.pathname === '/api/detections' && req.method === 'POST') {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      let payload
      try {
        const text = Buffer.concat(chunks).toString('utf8') || '{}'
        payload = JSON.parse(text)
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON' }, req)
        return
      }

      const store = readStore()
      const list = store.detections
      const incoming = { ...payload }
      if (!incoming.id) {
        incoming.id = `det-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      }
      if (!incoming.timestamp) {
        incoming.timestamp = new Date().toISOString()
      }

      const idx = list.findIndex((d) => d.id === incoming.id)
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...incoming, updatedAt: new Date().toISOString() }
      } else {
        list.push(incoming)
      }
      store.detections = list
      writeStore(store)
      sendJson(res, 201, { ok: true, detection: incoming }, req)
    })
    return
  }

  sendJson(res, 404, { error: 'Not found' }, req)
})

server.listen(DEFAULT_PORT, HOST, () => {
  console.log(`[detections-server] http://${HOST}:${DEFAULT_PORT} (data: ${DATA_FILE})`)
})
