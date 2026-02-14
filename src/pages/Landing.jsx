import { motion } from 'framer-motion'
import '../styles/landing.css'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const stats = [
  { value: '137', label: 'Piracy incidents in 2025', sub: 'Up 18% from 2024 (ICC IMB)' },
  { value: '35%', label: 'Increase in Q1 2025', sub: 'Singapore Strait saw 27 incidents alone' },
  { value: '46', label: 'Crew taken hostage', sub: '25 kidnapped across Gulf of Guinea' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="landing-grid" />
        <div className="landing-glow" />
      </div>

      <header className="landing-header">
        <div className="header-brand">
          <Logo size={40} animated={false} />
          <span>Navis</span>
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={() => navigate('/enterprise')} title="Fleet planning & tracking">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Enterprise
          </button>
          <button className="header-btn" onClick={() => navigate('/captain')} title="Radar & risk analysis">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
            Captain
          </button>
        </div>
      </header>

      <main className="landing-main">
        <motion.div
          className="landing-hero"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.h1 variants={fadeUp} className="hero-title">
            Real-time vessel intelligence
          </motion.h1>
          <motion.p variants={fadeUp} className="hero-subtitle">
            Track every ship on Earth. Identify threats before they escalate. Protect your crew and cargo.
          </motion.p>
          <motion.button
            variants={fadeUp}
            className="hero-cta"
            onClick={() => navigate('/ships')}
          >
            <span className="cta-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
            </span>
            View All Ships
          </motion.button>
        </motion.div>

        <motion.section
          className="landing-stats"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="stats-heading">Why maritime protection matters</h2>
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-sub">{stat.sub}</span>
              </div>
            ))}
          </div>
          <p className="stats-cta">
            Real-time AIS tracking and AI-powered anomaly detection help crews and fleet operators identify suspicious vessels, avoid high-risk corridors, and respond faster when danger is imminent.
          </p>
        </motion.section>
      </main>
    </div>
  )
}
