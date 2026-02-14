import L from 'leaflet'
import { Marker } from 'react-leaflet'

// Create custom ship icon - small colored diamond
const createShipIcon = (color) =>
  L.divIcon({
    html: `<div class="ship-marker-icon" style="--ship-color:${color}">
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="var(--ship-color)" stroke="rgba(0,0,0,0.5)" stroke-width="1"/>
      </svg>
    </div>`,
    className: 'ship-marker-wrapper',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

export function ShipMarker({ vessel, color, onClick }) {
  if (!vessel?.lat || !vessel?.lng) return null

  return (
    <Marker
      position={[vessel.lat, vessel.lng]}
      icon={createShipIcon(color)}
      eventHandlers={{ click: () => onClick(vessel) }}
    />
  )
}
