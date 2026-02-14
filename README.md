# Navis — Maritime AI Copilot

Real-time vessel intelligence platform that analyzes live AIS ship data and assigns suspicion scores based on behavioral anomalies and route deviation.

## Features

- **Landing** — Smooth animated entry with options to view all ships, enterprise dashboard, or captain radar
- **View All Ships** — Live world map (Leaflet) with real AIS vessel positions from [AIS Stream](https://aisstream.io). Color-coded ship markers; click any vessel for an animated detail panel (MMSI, position, speed, course, status, callsign).
- **Enterprise** — Fleet planning & tracking with risk tolerance slider, flagged vessel list, and explainable vessel details
- **Captain Radar** — Near geotile radar view of nearby ships, risk sensitivity control, vessel detail panel, and emergency call button

## Setup

1. Get an API key from [aisstream.io/apikeys](https://aisstream.io/apikeys)
2. Copy `.env.example` to `.env` and set `VITE_AISSTREAM_API_KEY`
3. **Note:** AIS Stream does not allow direct browser connections. The dev server runs a proxy (`server/ais-proxy.js`) that connects to AIS Stream and relays data to the frontend.

## Run

```bash
npm install
npm run dev
```

This starts both the AIS proxy (port 3002) and Vite (port 5173). The frontend connects directly to the proxy at ws://localhost:3002/ais.

**Python proxy (alternative):** If the Node proxy has issues, use the Python version (same logic as the working Colab script):
```bash
npm run dev:python
```

**Troubleshooting:**
- Test AIS connection: `node server/test-ais.js`
- Check proxy health: http://localhost:3002/health

Open [http://localhost:5173](http://localhost:5173)
