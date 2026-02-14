import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import { useAISStream } from '../hooks/useAISStream'
import { ShipMarker } from '../components/ShipMarker'
import { mockShips } from '../data/mockShips'
import Logo from '../components/Logo'
import 'leaflet/dist/leaflet.css'
import './AllShips.css'

const getScoreColor = (vessel) => {
  const score = vessel.suspicionScore ?? (() => {
    const sog = vessel.sog ?? 0
    const age = vessel.lastUpdate ? (Date.now() - vessel.lastUpdate) / 60000 : 999
    let s = 20
    if (sog > 20) s += 15
    if (sog < 1 && vessel.navStatus !== 1 && vessel.navStatus !== 5) s += 20
    if (age > 30) s += 25
    if (age > 60) s += 20
    return s
  })()
  if (score <= 30) return 'var(--navis-safe)'
  if (score <= 60) return 'var(--navis-warning)'
  return 'var(--navis-danger)'
}

export default function AllShips() {
  const navigate = useNavigate()
  const { vessels, connected, error } = useAISStream()
  const [selectedVessel, setSelectedVessel] = useState(null)

  // Show mock data immediately when no real AIS data; replace with live data when it arrives
  const displayVessels = vessels.length > 0 ? vessels : mockShips
  const isDemo = vessels.length === 0 && displayVessels.length > 0

  const sortedVessels = useMemo(
    () => [...displayVessels].sort((a, b) => (b.sog ?? b.suspicionScore ?? 0) - (a.sog ?? a.suspicionScore ?? 0)).slice(0, 30),
    [displayVessels]
  )

  return (
    <div className="all-ships">
      <header className="all-ships-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="header-brand">
          <Logo size={36} animated={false} />
          <h1>All Vessels</h1>
        </div>
        <div className="header-stats">
          <span>{displayVessels.length} vessels</span>
          <span className={`live-dot ${connected ? 'connected' : ''}`} />
          {connected ? 'Live' : isDemo ? 'Demo' : error || 'Connecting...'}
        </div>
      </header>

      <div className="all-ships-content">
        <div className="map-container">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="world-map-leaflet"
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {displayVessels.map((vessel) => (
              <ShipMarker
                key={vessel.mmsi}
                vessel={vessel}
                color={getScoreColor(vessel)}
                onClick={setSelectedVessel}
              />
            ))}
          </MapContainer>
        </div>

        <div className="ships-panel">
          <div className="panel-header">
            <h2>Vessel List</h2>
            <div className="score-legend">
              <span><i style={{ background: 'var(--navis-safe)' }} /> Low</span>
              <span><i style={{ background: 'var(--navis-warning)' }} /> Medium</span>
              <span><i style={{ background: 'var(--navis-danger)' }} /> High</span>
            </div>
          </div>
          <div className="ships-list">
            {displayVessels.length === 0 && (
              <div className="ships-empty">
                {error ? (
                  <p>{error}</p>
                ) : (
                  <p>Connecting to AIS stream... Vessels will appear as data arrives.</p>
                )}
              </div>
            )}
            {sortedVessels.map((vessel) => (
              <motion.div
                key={vessel.mmsi}
                className={`ship-row ${selectedVessel?.mmsi === vessel.mmsi ? 'selected' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedVessel(vessel)}
              >
                <span
                  className="score-dot"
                  style={{ background: getScoreColor(vessel) }}
                />
                <div className="ship-info">
                  <strong>{vessel.name || `MMSI ${vessel.mmsi}`}</strong>
                  <span>{vessel.navStatusText || vessel.type || '—'} • {(vessel.sog ?? vessel.speed)?.toFixed(1) ?? '—'} kn</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="panel-actions">
            <button className="nav-btn" onClick={() => navigate('/enterprise')}>
              Enterprise Dashboard →
            </button>
            <button className="nav-btn" onClick={() => navigate('/captain')}>
              Captain Radar →
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedVessel && (
          <motion.div
            className="vessel-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVessel(null)}
          >
            <motion.div
              className="vessel-modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="vessel-modal-close" onClick={() => setSelectedVessel(null)}>
                ×
              </button>
              <div className="vessel-modal-header">
                <span
                  className="vessel-modal-dot"
                  style={{ background: getScoreColor(selectedVessel) }}
                />
                <h2>{selectedVessel.name || `MMSI ${selectedVessel.mmsi}`}</h2>
                <p className="vessel-modal-mmsi">MMSI: {selectedVessel.mmsi ?? selectedVessel.id}</p>
              </div>
              <div className="vessel-modal-stats">
                <div className="vessel-stat">
                  <span className="label">Position</span>
                  <span className="value">
                    {selectedVessel.lat?.toFixed(4)}°, {selectedVessel.lng?.toFixed(4)}°
                  </span>
                </div>
                <div className="vessel-stat">
                  <span className="label">Speed</span>
                  <span className="value">{(selectedVessel.sog ?? selectedVessel.speed)?.toFixed(1) ?? '—'} kn</span>
                </div>
                <div className="vessel-stat">
                  <span className="label">Course</span>
                  <span className="value">{selectedVessel.cog?.toFixed(0) ?? '—'}°</span>
                </div>
                <div className="vessel-stat">
                  <span className="label">Heading</span>
                  <span className="value">{selectedVessel.heading ?? '—'}°</span>
                </div>
                <div className="vessel-stat">
                  <span className="label">Status</span>
                  <span className="value">{selectedVessel.navStatusText || '—'}</span>
                </div>
                {selectedVessel.callsign && (
                  <div className="vessel-stat">
                    <span className="label">Callsign</span>
                    <span className="value">{selectedVessel.callsign}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
