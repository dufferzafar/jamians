import { ref, computed } from 'vue'
import { parse as parseYaml } from 'yaml'
import { getCityCoordinates, JAMIA_COORDS } from '../utils/cityCoordinates'

// Import all YAML files from data/2016 directory
const yamlFiles = import.meta.glob('/data/2016/*.yaml', { query: '?raw', import: 'default', eager: true })

/**
 * Parse a date string into a Date object
 * Handles: "2016", "2016-07", "2016-07-15"
 */
function parseFlexibleDate(dateStr) {
  if (!dateStr) return null
  
  const str = String(dateStr)
  
  // Full date: 2016-07-15
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(str)
  }
  
  // Month/year: 2016-07
  if (/^\d{4}-\d{2}$/.test(str)) {
    return new Date(`${str}-01`)
  }
  
  // Year only: 2016
  if (/^\d{4}$/.test(str)) {
    return new Date(`${str}-01-01`)
  }
  
  return null
}

/**
 * Load and process all student data
 */
export function useStudentData() {
  const students = ref([])
  const loading = ref(true)
  const error = ref(null)

  // Parse all YAML files
  try {
    const parsed = Object.entries(yamlFiles).map(([path, content]) => {
      const data = parseYaml(content)
      
      // Process timeline entries
      const timeline = (data.timeline || []).map(entry => ({
        date: parseFlexibleDate(entry.date),
        dateStr: entry.date,
        city: entry.city,
        country: entry.country,
        comment: entry.comment || '',
        coordinates: getCityCoordinates(entry.city, entry.country)
      })).filter(e => e.date !== null)
      
      // Sort timeline by date
      timeline.sort((a, b) => a.date - b.date)
      
      return {
        rollNumber: data.roll_number,
        name: data.name,
        linkedin: data.linkedin || '',
        timeline,
        // Has known location if any timeline entry has coordinates
        hasKnownLocation: timeline.some(t => t.coordinates !== null)
      }
    })
    
    students.value = parsed
    loading.value = false
  } catch (e) {
    error.value = e.message
    loading.value = false
  }

  /**
   * Add small offsets to features at the same location so they don't overlap
   */
  const spreadOverlappingPoints = (features) => {
    // Group by coordinate string
    const groups = {}
    features.forEach((f, idx) => {
      const key = f.geometry.coordinates.join(',')
      if (!groups[key]) groups[key] = []
      groups[key].push(idx)
    })
    
    // For groups with multiple points, spread them in a circle
    const OFFSET = 0.003 // ~300m offset for visibility
    Object.values(groups).forEach(indices => {
      if (indices.length <= 1) return
      
      const count = indices.length
      indices.forEach((idx, i) => {
        const angle = (2 * Math.PI * i) / count
        const [lng, lat] = features[idx].geometry.coordinates
        features[idx].geometry.coordinates = [
          lng + OFFSET * Math.cos(angle),
          lat + OFFSET * Math.sin(angle)
        ]
      })
    })
    
    return features
  }

  /**
   * Get student locations at a specific date as GeoJSON
   */
  const getLocationsAtDate = (targetDate) => {
    const features = students.value.map(student => {
      // Find the most recent location before or on the target date
      let location = null
      let locationEntry = null
      
      for (const entry of student.timeline) {
        if (entry.date <= targetDate && entry.coordinates) {
          location = entry.coordinates
          locationEntry = entry
        }
      }
      
      // If no location found, use Jamia (unknown)
      const isUnknown = location === null
      const coords = location ? [...location] : [...JAMIA_COORDS] // Clone to avoid mutation
      
      return {
        type: 'Feature',
        properties: {
          name: student.name,
          roll: student.rollNumber,
          linkedin: student.linkedin,
          unknown: isUnknown,
          city: locationEntry?.city || 'Delhi',
          country: locationEntry?.country || 'India',
          comment: locationEntry?.comment || (isUnknown ? 'Last known: Jamia (2016)' : ''),
          dateStr: locationEntry?.dateStr || '2016'
        },
        geometry: {
          type: 'Point',
          coordinates: coords
        }
      }
    })
    
    // Spread out overlapping points
    spreadOverlappingPoints(features)
    
    return {
      type: 'FeatureCollection',
      features
    }
  }

  /**
   * Get the full timeline for a specific student
   */
  const getStudentTimeline = (rollNumber) => {
    return students.value.find(s => s.rollNumber === rollNumber)
  }

  /**
   * Search students by name
   */
  const searchStudents = (query) => {
    if (!query) return students.value
    const lower = query.toLowerCase()
    return students.value.filter(s => 
      s.name.toLowerCase().includes(lower)
    )
  }

  return {
    students,
    loading,
    error,
    getLocationsAtDate,
    getStudentTimeline,
    searchStudents
  }
}
