#!/usr/bin/env node
/**
 * Test AIS Stream connection directly (no proxy).
 * Run: node server/test-ais.js
 */
import WebSocket from 'ws'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
let API_KEY = 'bcc3ddc426b8b153e0070d754b018439dd425e40'
try {
  const env = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  const m = env.match(/VITE_AISSTREAM_API_KEY=(.+)/)
  if (m) API_KEY = m[1].trim()
} catch (_) {}

console.log('Connecting to AIS Stream...')
const ws = new WebSocket('wss://stream.aisstream.io/v0/stream')

ws.on('open', () => {
  console.log('Connected. Sending subscription...')
  ws.send(JSON.stringify({
    APIKey: API_KEY,
    BoundingBoxes: [[[-90, -180], [90, 180]]],
  }))
})

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString())
  if (msg.error) {
    console.error('ERROR:', msg.error)
    process.exit(1)
  }
  if (msg.MessageType === 'PositionReport') {
    const pr = msg.Message?.PositionReport
    if (pr) {
      console.log('OK - Received vessel:', pr.UserID, 'at', pr.Latitude?.toFixed(2), pr.Longitude?.toFixed(2))
      ws.close()
      process.exit(0)
    }
  }
})

ws.on('error', (err) => {
  console.error('Connection error:', err.message)
  process.exit(1)
})

setTimeout(() => {
  console.error('Timeout - no data received in 15s')
  process.exit(1)
}, 15000)
