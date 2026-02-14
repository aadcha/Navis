// Mock AIS vessel data with suspicion scores (0-100)
// Scores: 0-30 green (low), 31-60 yellow (medium), 61-100 red (high)

export const generateMockShips = (count = 80) => {
  const shipTypes = ['Cargo', 'Tanker', 'Container', 'Fishing', 'Passenger', 'Pleasure', 'Unknown'];
  const flags = ['LR', 'PA', 'MH', 'SG', 'GR', 'CY', 'BS', 'HK', 'NO', 'US'];
  const names = [
    'Pacific Star', 'Ocean Spirit', 'Northern Wind', 'Southern Cross',
    'Atlantic Queen', 'Maritime Glory', 'Blue Horizon', 'Sea Guardian',
    'Coral Princess', 'Titan Explorer', 'Polar Dawn', 'Tropical Breeze',
    'Arctic Voyager', 'Pacific Dawn', 'Ocean Explorer', 'Star Navigator',
    'Golden Horizon', 'Silver Wave', 'Crystal Sea', 'Emerald Star'
  ];

  const shippingCorridors = [
    { lat: 25, lng: 55, radius: 200 },   // Persian Gulf
    { lat: 1.3, lng: 103.8, radius: 150 }, // Singapore
    { lat: 30.5, lng: 32.3, radius: 100 }, // Suez
    { lat: 35.9, lng: -5.3, radius: 120 }, // Gibraltar
    { lat: 22.3, lng: 114.2, radius: 80 },  // Hong Kong
    { lat: 51.9, lng: 4.5, radius: 100 },   // Rotterdam
    { lat: 33.7, lng: -118.3, radius: 90 }, // LA
    { lat: -6.1, lng: 106.9, radius: 100 }, // Jakarta
  ];

  const ships = [];
  // Add cluster near Gulf of Aden for captain radar demo
  const gulfCluster = [
    { lat: 12.8, lng: 44.5 }, { lat: 12.2, lng: 43.9 }, { lat: 12.5, lng: 45.1 },
    { lat: 11.9, lng: 44.2 }, { lat: 13.1, lng: 44.0 }, { lat: 12.4, lng: 43.5 },
    { lat: 12.7, lng: 44.8 }, { lat: 12.0, lng: 44.6 }, { lat: 12.9, lng: 43.8 },
    { lat: 11.5, lng: 44.3 }, { lat: 13.0, lng: 44.5 }, { lat: 12.3, lng: 45.0 },
  ];
  for (let i = 0; i < Math.min(12, count); i++) {
    const pos = gulfCluster[i];
    const suspicionScore = Math.round(20 + Math.random() * 70);
    ships.push({
      id: `MMSI-GULF-${i}`,
      name: names[i % names.length] + ` ${i + 1}`,
      mmsi: 200000000 + i,
      lat: pos.lat + (Math.random() - 0.5) * 0.5,
      lng: pos.lng + (Math.random() - 0.5) * 0.5,
      speed: Math.round((5 + Math.random() * 12) * 10) / 10,
      heading: Math.round(Math.random() * 360),
      type: shipTypes[Math.floor(Math.random() * shipTypes.length)],
      flag: flags[Math.floor(Math.random() * flags.length)],
      suspicionScore,
      lastUpdate: new Date().toISOString(),
      anomalies: suspicionScore > 60 ? ['Route deviation', 'Unusual speed', 'EEZ proximity'].slice(0, 1 + Math.floor(Math.random() * 2)) : [],
    });
  }
  for (let i = 12; i < count; i++) {
    const lat = -60 + Math.random() * 120;
    const lng = -180 + Math.random() * 360;
    
    // Calculate base suspicion: farther from corridors = higher
    let baseScore = 20 + Math.random() * 40;
    const nearestCorridor = shippingCorridors.reduce((min, c) => {
      const d = Math.sqrt((lat - c.lat) ** 2 + ((lng - c.lng) / 2) ** 2) * 111;
      return d < min.d ? { d, ...c } : min;
    }, { d: Infinity });
    if (nearestCorridor.d > 500) baseScore += 25;
    else if (nearestCorridor.d > 200) baseScore += 15;

    const suspicionScore = Math.min(100, Math.round(baseScore + (Math.random() - 0.3) * 30));
    const speed = Math.round((2 + Math.random() * 18) * 10) / 10;
    const heading = Math.round(Math.random() * 360);

    ships.push({
      id: `MMSI-${100000000 + i}`,
      name: names[i % names.length] + (i > 19 ? ` ${Math.floor(i / 20) + 1}` : ''),
      mmsi: 100000000 + i,
      lat,
      lng,
      speed,
      heading,
      type: shipTypes[Math.floor(Math.random() * shipTypes.length)],
      flag: flags[Math.floor(Math.random() * flags.length)],
      suspicionScore: Math.max(0, Math.min(100, suspicionScore)),
      lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      anomalies: suspicionScore > 60 ? [
        'Route deviation from expected corridor',
        'Unusual speed variance',
        'Proximity to high-risk EEZ'
      ].slice(0, 1 + Math.floor(Math.random() * 2)) : [],
    });
  }
  return ships;
};

export const mockShips = generateMockShips(80);

// Get ships near a position (for radar view) - dist in nautical miles
export const getShipsNearPosition = (lat, lng, radiusNm = 50) => {
  return mockShips
    .map(s => {
      const dLat = (s.lat - lat) * 60; // 1 deg lat ≈ 60 nm
      const dLng = (s.lng - lng) * 60 * Math.cos(lat * Math.PI / 180);
      const dist = Math.sqrt(dLat ** 2 + dLng ** 2);
      return { ...s, dist };
    })
    .filter(s => s.dist < radiusNm);
};
