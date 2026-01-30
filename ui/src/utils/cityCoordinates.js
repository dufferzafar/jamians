// City coordinates lookup
// This will be expanded as needed or replaced with geocoding API

const CITY_COORDS = {
  // India
  'delhi,india': [77.2090, 28.6139],
  'new delhi,india': [77.2090, 28.6139],
  'bangalore,india': [77.5946, 12.9716],
  'bengaluru,india': [77.5946, 12.9716],
  'mumbai,india': [72.8777, 19.0760],
  'hyderabad,india': [78.4867, 17.3850],
  'pune,india': [73.8567, 18.5204],
  'chennai,india': [80.2707, 13.0827],
  'kolkata,india': [88.3639, 22.5726],
  'ahmedabad,india': [72.5714, 23.0225],
  'jaipur,india': [75.7873, 26.9124],
  'kanpur,india': [80.3569, 26.4499],
  'lucknow,india': [80.9462, 26.8467],
  'chandigarh,india': [76.7794, 30.7333],
  'noida,india': [77.3910, 28.5355],
  'gurgaon,india': [77.0266, 28.4595],
  'gurugram,india': [77.0266, 28.4595],
  'faridabad,india': [77.3164, 28.4595],
  
  // USA
  'san francisco,usa': [-122.4194, 37.7749],
  'new york,usa': [-74.0060, 40.7128],
  'seattle,usa': [-122.3321, 47.6062],
  'austin,usa': [-97.7431, 30.2672],
  'boston,usa': [-71.0589, 42.3601],
  'los angeles,usa': [-118.2437, 34.0522],
  'chicago,usa': [-87.6298, 41.8781],
  'san jose,usa': [-121.8863, 37.3382],
  'mountain view,usa': [-122.0838, 37.3861],
  'palo alto,usa': [-122.1430, 37.4419],
  
  // UK
  'london,uk': [-0.1276, 51.5074],
  'manchester,uk': [-2.2426, 53.4808],
  'birmingham,uk': [-1.8904, 52.4862],
  'cambridge,uk': [0.1218, 52.2053],
  'oxford,uk': [-1.2577, 51.7520],
  
  // Europe
  'berlin,germany': [13.4050, 52.5200],
  'munich,germany': [11.5820, 48.1351],
  'amsterdam,netherlands': [4.9041, 52.3676],
  'paris,france': [2.3522, 48.8566],
  'dublin,ireland': [-6.2603, 53.3498],
  'zurich,switzerland': [8.5417, 47.3769],
  
  // Middle East
  'dubai,uae': [55.2708, 25.2048],
  'abu dhabi,uae': [54.3773, 24.4539],
  'riyadh,saudi arabia': [46.6753, 24.7136],
  'doha,qatar': [51.5310, 25.2854],
  
  // Asia
  'singapore,singapore': [103.8198, 1.3521],
  'tokyo,japan': [139.6917, 35.6895],
  'hong kong,hong kong': [114.1694, 22.3193],
  'shanghai,china': [121.4737, 31.2304],
  'beijing,china': [116.4074, 39.9042],
  'bangkok,thailand': [100.5018, 13.7563],
  'kuala lumpur,malaysia': [101.6869, 3.1390],
  
  // Australia
  'sydney,australia': [151.2093, -33.8688],
  'melbourne,australia': [144.9631, -37.8136],
  
  // Canada
  'toronto,canada': [-79.3832, 43.6532],
  'vancouver,canada': [-123.1207, 49.2827],
}

// Jamia Millia Islamia - default for unknown locations
export const JAMIA_COORDS = [77.2809, 28.5616]

/**
 * Get coordinates for a city/country pair
 * @param {string} city 
 * @param {string} country 
 * @returns {[number, number]} [longitude, latitude]
 */
export function getCityCoordinates(city, country) {
  if (!city || !country) {
    return null
  }
  
  const key = `${city.toLowerCase().trim()},${country.toLowerCase().trim()}`
  return CITY_COORDS[key] || null
}

/**
 * Get coordinates, falling back to Jamia for unknown
 */
export function getCityCoordinatesOrDefault(city, country) {
  return getCityCoordinates(city, country) || JAMIA_COORDS
}

export default CITY_COORDS
