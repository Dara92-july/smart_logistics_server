/**
 * Geospatial utilities for African logistics
 * Uses Haversine formula for distance calculations
 */

const R = 6371 // Earth's radius in kilometers

export const getDistance = (point1, point2) => {
  const [lon1, lat1] = point1
  const [lon2, lat2] = point2

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  return getDistance([lon1, lat1], [lon2, lat2])
}

export const toRad = (value) => {
  return value * Math.PI / 180
}

// Estimate travel time based on African urban conditions
export const estimateTravelTime = (distanceKm, vehicle = 'bike', traffic = 'moderate') => {
  const speeds = {
    bike: { light: 25, moderate: 18, heavy: 12 },
    van: { light: 40, moderate: 25, heavy: 15 },
    truck: { light: 35, moderate: 22, heavy: 14 }
  }

  const speed = speeds[vehicle]?.[traffic] || 18
  const baseTime = (distanceKm / speed) * 60 // minutes

  // Add buffer for stops, traffic lights, etc.
  const buffer = Math.ceil(distanceKm / 2) * 3 // 3 min per 2km

  return Math.round(baseTime + buffer)
}

// Check if point is within radius
export const isWithinRadius = (center, point, radiusKm) => {
  return getDistance(center, point) <= radiusKm
}

// Generate GeoJSON LineString from coordinates
export const generateRouteGeoJSON = (coordinates) => {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates
    },
    properties: {}
  }
}

// Nigerian address formatter
export const formatNigerianAddress = (address) => {
  const commonAbbreviations = {
    'str': 'Street',
    'rd': 'Road',
    'ave': 'Avenue',
    'cres': 'Crescent',
    'est': 'Estate',
    'close': 'Close'
  }

  let formatted = address.toLowerCase()
  Object.entries(commonAbbreviations).forEach(([abbr, full]) => {
    formatted = formatted.replace(new RegExp(`\b${abbr}\b`, 'g'), full)
  })

  return formatted.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
