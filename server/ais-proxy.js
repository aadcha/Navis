/**
 * AIS Stream WebSocket Proxy
 * Browser connections to aisstream.io are not supported (CORS).
 * This server connects to AIS Stream and relays data to the frontend.
 */
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import WebSocket from 'ws'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const AIS_WS_URL = 'wss://stream.aisstream.io/v0/stream'
const PROXY_PORT = 3002

let API_KEY = 'bcc3ddc426b8b153e0070d754b018439dd425e40'
try {
  const env = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  const m = env.match(/VITE_AISSTREAM_API_KEY=(.+)/)
  if (m) API_KEY = m[1].trim()
} catch (_) {}

const server = createServer()

// HTTP handlers - don't open /ais in browser; it's a WebSocket endpoint
server.on('request', (req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', port: PROXY_PORT }))
    return
  }
  if (req.url === '/' || req.url === '/ais') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('AIS WebSocket proxy. Connect via ws://localhost:' + PROXY_PORT + '/ais — or use the Navis app.')
    return
  }
})

const wss = new WebSocketServer({ server, path: '/ais' })

wss.on('connection', (clientWs, req) => {
  console.log('[Proxy] Client connected from', req.socket.remoteAddress)

  const aisSocket = new WebSocket(AIS_WS_URL)
  const connectionTimeout = setTimeout(() => {
    if (aisSocket.readyState !== WebSocket.OPEN) {
      console.error('[Proxy] AIS Stream connection timeout')
      try {
        clientWs.send(JSON.stringify({ error: 'AIS Stream connection timeout' }))
      } catch (_) {}
    }
  }, 10000)

  aisSocket.on('open', () => {
    clearTimeout(connectionTimeout)
    console.log('[Proxy] Connected to AIS Stream, sending subscription')
    aisSocket.send(JSON.stringify({
      APIKey: API_KEY,
      BoundingBoxes: [[[-90, -180], [90, 180]]],
    }))
  })

  aisSocket.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      try {
        const msg = JSON.parse(data.toString())
        if (msg.error) {
          console.error('[Proxy] AIS error:', msg.error)
        }
        clientWs.send(data)
      } catch (_) {
        clientWs.send(data)
      }
    }
  })

  aisSocket.on('error', (err) => {
    console.error('[Proxy] AIS Stream error:', err.message)
    if (clientWs.readyState === WebSocket.OPEN) {
      try {
        clientWs.send(JSON.stringify({ error: `AIS Stream: ${err.message}` }))
      } catch (_) {}
    }
  })

  aisSocket.on('close', (code, reason) => {
    clearTimeout(connectionTimeout)
    if (code !== 1000) {
      console.log('[Proxy] AIS closed:', code, reason?.toString())
    }
    try {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close()
      }
    } catch (_) {}
  })

  clientWs.on('close', () => {
    clearTimeout(connectionTimeout)
    try {
      aisSocket.close()
    } catch (_) {}
  })

  clientWs.on('error', (err) => {
    console.error('[Proxy] Client error:', err.message)
  })
})

server.on('error', (err) => {
  console.error('[Proxy] Server error:', err.message)
})

server.listen(PROXY_PORT, () => {
  console.log(`[Proxy] ws://localhost:${PROXY_PORT}/ais  |  Health: http://localhost:${PROXY_PORT}/health`)
})
