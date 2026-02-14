import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getShipsNearPosition } from '../data/mockShips'
import Logo from '../components/Logo'
import './Captain.css'

const getScoreColor = (score) => {
  if (score <= 30) return '#6bcb77'
  if (score <= 60) return '#ffd93d'
  return '#ff6b6b'
}

// Captain's ship position (simulated - Gulf of Aden)
const CAPTAIN_POS = { lat: 12.5, lng: 44.2 }

export default function Captain() {
  const navigate = useNavigate()
  const [nearbyShips, setNearbyShips] = useState([])
  const [selectedShip, setSelectedShip] = useState(null)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [riskTolerance, setRiskTolerance] = useState(50)
  useEffect(() => {
    const ships = getShipsNearPosition(CAPTAIN_POS.lat, CAPTAIN_POS.lng, 25)
    setNearbyShips(ships)
  }, [])

  // Convert lat/lng to radar polar coordinates (relative to captain position)
  const toRadarCoords = (ship) => {
    const dLat = (ship.lat - CAPTAIN_POS.lat) * 60 // nm per degree
    const dLng = (ship.lng - CAPTAIN_POS.lng) * 60 * Math.cos(CAPTAIN_POS.lat * Math.PI / 180)
    const dist = Math.sqrt(dLat ** 2 + dLng ** 2)
    const maxDist = 25 // nm
    const r = Math.min(1, dist / maxDist) * 90 // 90% of radar radius
    const angle = Math.atan2(dLng, dLat) * (180 / Math.PI) + 90
    const rad = (angle * Math.PI) / 180
    const cx = 50 + r * Math.cos(rad)
    const cy = 50 + r * Math.sin(rad)
    return { cx, cy, dist, r: Math.max(1, (100 - r) / 8) }
  }

  return (
    <div className={`captain ${emergencyMode ? 'emergency' : ''}`}>
      <header className="captain-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <div className="header-brand">
          <Logo size={36} animated={false} />
          <h1>Captain Radar</h1>
        </div>
        <div className="header-status">
          <span className="live-dot" />
          {nearbyShips.length} vessels in range
        </div>
      </header>

      <div className="captain-content">
        <div className="radar-section">
          <motion.div
            className="radar-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <svg viewBox="0 0 100 100" className="radar-svg">
              {/* Radar circles */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,212,170,0.2)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0,212,170,0.15)" strokeWidth="0.3" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(0,212,170,0.1)" strokeWidth="0.3" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(0,212,170,0.08)" strokeWidth="0.3" />

              {/* Sweep line - wrapped in g for rotation around center */}
              <g className="radar-sweep" style={{ transformOrigin: '50px 50px' }}>
                <line
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="5"
                  stroke="rgba(0,212,170,0.5)"
                  strokeWidth="0.5"
                />
              </g>

              {/* Center (own ship) */}
              <circle cx="50" cy="50" r="2" fill="var(--navis-accent)" />
              <text x="50" y="48" textAnchor="middle" fontSize="3" fill="var(--navis-accent)">YOU</text>

              {/* Nearby vessels as blips */}
              {nearbyShips.map((ship) => {
                const { cx, cy, r } = toRadarCoords(ship)
                const color = getScoreColor(ship.suspicionScore)
                const isHighRisk = ship.suspicionScore >= riskTolerance
                return (
                  <g
                    key={ship.id}
                    className="radar-blip"
                    onClick={() => setSelectedShip(selectedShip?.id === ship.id ? null : ship)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHighRisk ? r + 0.5 : r}
                      fill={color}
                      stroke={isHighRisk ? color : 'none'}
                      strokeWidth={isHighRisk ? 0.5 : 0}
                      opacity={isHighRisk ? 1 : 0.8}
                    />
                  </g>
                )
              })}
            </svg>
          </motion.div>

          <div className="radar-legend">
            <span><i style={{ background: 'var(--navis-safe)' }} /> Safe</span>
            <span><i style={{ background: 'var(--navis-warning)' }} /> Caution</span>
            <span><i style={{ background: 'var(--navis-danger)' }} /> High Risk</span>
          </div>
        </div>

        <div className="captain-sidebar">
          <div className="risk-control">
            <label>Risk sensitivity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(Number(e.target.value))}
              className="risk-slider"
            />
            <span>{riskTolerance}</span>
          </div>

          <div className="nearby-list">
            <h3>Nearby Vessels</h3>
            {nearbyShips
              .sort((a, b) => b.suspicionScore - a.suspicionScore)
              .map((ship) => (
                <div
                  key={ship.id}
                  className={`nearby-item ${selectedShip?.id === ship.id ? 'selected' : ''} ${ship.suspicionScore >= riskTolerance ? 'high-risk' : ''}`}
                  onClick={() => setSelectedShip(ship)}
                >
                  <span className="blip" style={{ background: getScoreColor(ship.suspicionScore) }} />
                  <div>
                    <strong>{ship.name}</strong>
                    <span>{ship.suspicionScore} • {ship.type} • {ship.dist?.toFixed(1) || '—'} nm</span>
                  </div>
                </div>
              ))}
          </div>

          {selectedShip && (
            <motion.div
              className="vessel-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3>Why flagged</h3>
              {selectedShip.anomalies?.length > 0 ? (
                <ul>
                  {selectedShip.anomalies.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p>Within normal behavioral parameters.</p>
              )}
            </motion.div>
          )}

          <button
            className={`emergency-btn ${emergencyMode ? 'active' : ''}`}
            onClick={() => setEmergencyMode(!emergencyMode)}
          >
            <span className="emergency-icon">⚠</span>
            {emergencyMode ? 'Emergency Active' : 'Emergency Call'}
          </button>
        </div>
      </div>
    </div>
  )
}
