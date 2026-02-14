import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { mockShips } from '../data/mockShips'
import Logo from '../components/Logo'
import './Enterprise.css'

const getScoreColor = (score) => {
  if (score <= 30) return 'var(--navis-safe)'
  if (score <= 60) return 'var(--navis-warning)'
  return 'var(--navis-danger)'
}

export default function Enterprise() {
  const navigate = useNavigate()
  const [riskTolerance, setRiskTolerance] = useState(60)
  const [selectedShip, setSelectedShip] = useState(null)

  const flaggedShips = mockShips.filter(s => s.suspicionScore >= riskTolerance)
  const fleetSummary = {
    total: mockShips.length,
    flagged: flaggedShips.length,
    lowRisk: mockShips.filter(s => s.suspicionScore <= 30).length,
    highRisk: mockShips.filter(s => s.suspicionScore > 60).length,
  }

  const project = (lat, lng) => {
    const x = ((lng + 180) / 360) * 100
    const y = 50 - (lat / 180) * 50
    return { x, y }
  }

  return (
    <div className="enterprise">
      <header className="enterprise-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <div className="header-brand">
          <Logo size={36} animated={false} />
          <h1>Enterprise Fleet Dashboard</h1>
        </div>
      </header>

      <div className="enterprise-content">
        <div className="enterprise-main">
          <motion.div
            className="dashboard-cards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="stat-card">
              <span className="stat-value">{fleetSummary.total}</span>
              <span className="stat-label">Total Vessels</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: 'var(--navis-warning)' }}>{fleetSummary.flagged}</span>
              <span className="stat-label">Flagged (≥{riskTolerance})</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: 'var(--navis-safe)' }}>{fleetSummary.lowRisk}</span>
              <span className="stat-label">Low Risk</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: 'var(--navis-danger)' }}>{fleetSummary.highRisk}</span>
              <span className="stat-label">High Risk</span>
            </div>
          </motion.div>

          <div className="risk-slider-section">
            <label>Risk Tolerance Threshold</label>
            <input
              type="range"
              min="0"
              max="100"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(Number(e.target.value))}
              className="risk-slider"
            />
            <span className="risk-value">{riskTolerance}</span>
          </div>

          <div className="fleet-map">
            <svg viewBox="0 0 100 50" className="world-map" preserveAspectRatio="xMidYMid meet">
              <path
                d="M 5 25 Q 15 20 25 22 Q 35 24 45 20 Q 55 18 65 22 Q 75 25 85 20 Q 92 18 95 25 L 95 45 L 5 45 Z"
                fill="var(--navis-surface-elevated)"
                stroke="var(--navis-border)"
                strokeWidth="0.3"
                opacity="0.5"
              />
              {mockShips.map((ship) => {
                const { x, y } = project(ship.lat, ship.lng)
                const isFlagged = ship.suspicionScore >= riskTolerance
                return (
                  <circle
                    key={ship.id}
                    cx={x}
                    cy={y}
                    r={isFlagged ? 1.2 : 0.6}
                    fill={getScoreColor(ship.suspicionScore)}
                    opacity={isFlagged ? 1 : 0.5}
                    className="ship-blip"
                    onClick={() => setSelectedShip(selectedShip?.id === ship.id ? null : ship)}
                  />
                )
              })}
            </svg>
          </div>
        </div>

        <div className="enterprise-sidebar">
          <div className="sidebar-section">
            <h3>Flagged Vessels</h3>
            <div className="flagged-list">
              {flaggedShips.slice(0, 15).map((ship) => (
                <div
                  key={ship.id}
                  className={`flagged-item ${selectedShip?.id === ship.id ? 'selected' : ''}`}
                  onClick={() => setSelectedShip(ship)}
                >
                  <span className="score-dot" style={{ background: getScoreColor(ship.suspicionScore) }} />
                  <div>
                    <strong>{ship.name}</strong>
                    <span>{ship.suspicionScore} • {ship.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedShip && (
            <motion.div
              className="vessel-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h3>Vessel Detail</h3>
              <div className="detail-row">
                <span>Name</span>
                <strong>{selectedShip.name}</strong>
              </div>
              <div className="detail-row">
                <span>MMSI</span>
                <strong>{selectedShip.mmsi}</strong>
              </div>
              <div className="detail-row">
                <span>Suspicion Score</span>
                <strong style={{ color: getScoreColor(selectedShip.suspicionScore) }}>{selectedShip.suspicionScore}</strong>
              </div>
              <div className="detail-row">
                <span>Position</span>
                <strong>{selectedShip.lat.toFixed(2)}°, {selectedShip.lng.toFixed(2)}°</strong>
              </div>
              <div className="detail-row">
                <span>Speed</span>
                <strong>{selectedShip.speed} kn</strong>
              </div>
              {selectedShip.anomalies?.length > 0 && (
                <div className="anomalies">
                  <span>Why flagged</span>
                  <ul>
                    {selectedShip.anomalies.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
