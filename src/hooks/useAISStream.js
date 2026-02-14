import { useState, useEffect, useRef, useCallback } from 'react'

// Connect via our backend proxy (browser can't connect directly to aisstream.io)
// Use same-origin URL so Vite proxies the WebSocket - avoids device/network restrictions
const getAISWsUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ais`
}

// Navigational status codes (AIS)
const NAV_STATUS = {
  0: 'Under way using engine',
  1: 'At anchor',
  2: 'Not under command',
  3: 'Restricted manoeuvrability',
  4: 'Constrained by draught',
  5: 'Moored',
  6: 'Aground',
  7: 'Engaged in fishing',
  8: 'Under way sailing',
  15: 'Undefined',
}

export function useAISStream(apiKey) {
  const [vessels, setVessels] = useState(new Map())
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const vesselsRef = useRef(new Map())

  const updateVessel = useCallback((mmsi, data) => {
    vesselsRef.current.set(mmsi, {
      ...vesselsRef.current.get(mmsi),
      ...data,
      mmsi,
      lastUpdate: Date.now(),
    })
  }, [])

  useEffect(() => {
    const socket = new WebSocket(getAISWsUrl())
    wsRef.current = socket

    socket.addEventListener('open', () => {
      setConnected(true)
      setError(null)
      // Subscription is handled by the proxy server; no subscription from client
    })

    socket.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.error) {
          setError(msg.error)
          return
        }
        const type = msg.MessageType
        const payload = msg.Message
        const meta = msg.MetaData || msg.Metadata

        const handlePositionReport = (pr, mmsi) => {
          if (!mmsi) return
          updateVessel(mmsi, {
            lat: pr.Latitude ?? meta?.latitude,
            lng: pr.Longitude ?? meta?.longitude,
            sog: pr.Sog ?? 0,
            cog: pr.Cog ?? 0,
            heading: pr.TrueHeading ?? pr.Cog,
            navStatus: pr.NavigationalStatus,
            navStatusText: NAV_STATUS[pr.NavigationalStatus] ?? 'Unknown',
            timestamp: pr.Timestamp,
            name: meta?.ShipName ?? pr.Name,
          })
        }

        if (type === 'PositionReport' && payload?.PositionReport) {
          const pr = payload.PositionReport
          handlePositionReport(pr, pr.UserID ?? meta?.MMSI)
        } else if (type === 'ExtendedClassBPositionReport' && payload?.ExtendedClassBPositionReport) {
          const pr = payload.ExtendedClassBPositionReport
          handlePositionReport(pr, pr.UserID ?? meta?.MMSI)
        } else if (type === 'StandardClassBPositionReport' && payload?.StandardClassBPositionReport) {
          const pr = payload.StandardClassBPositionReport
          handlePositionReport(pr, pr.UserID ?? meta?.MMSI)
        } else if (type === 'ShipStaticData' && payload?.ShipStaticData) {
          const sd = payload.ShipStaticData
          const mmsi = sd.UserID ?? meta?.MMSI
          if (!mmsi) return
          updateVessel(mmsi, {
            name: sd.Name?.trim() || `MMSI ${mmsi}`,
            callsign: sd.CallSign?.trim(),
          })
        } else if (type === 'StaticDataReport' && payload?.StaticDataReport) {
          const sd = payload.StaticDataReport
          const mmsi = sd.UserID
          if (!mmsi) return

          const reportA = sd.ReportA
          const reportB = sd.ReportB
          const name = reportA?.Name ?? reportB?.Name
          const callsign = reportA?.CallSign ?? reportA?.Callsign ?? reportB?.CallSign ?? reportB?.Callsign
          const shipType = reportA?.ShipType ?? reportB?.ShipType

          updateVessel(mmsi, {
            name: name?.trim() || `MMSI ${mmsi}`,
            callsign: callsign?.trim(),
            shipType,
          })
        }
      } catch (_) {}
    })

    const flush = () => {
      if (vesselsRef.current.size > 0) {
        setVessels(new Map(vesselsRef.current))
      }
    }

    const interval = setInterval(flush, 500)

    socket.addEventListener('close', () => {
      setConnected(false)
      clearInterval(interval)
    })

    socket.addEventListener('error', () => {
      setError('Connection failed')
    })

    return () => {
      clearInterval(interval)
      socket.close()
      wsRef.current = null
    }
  }, [updateVessel])

  return {
    vessels: Array.from(vessels.values()),
    connected,
    error,
  }
}
