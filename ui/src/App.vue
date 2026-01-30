<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import WorldMap from './components/WorldMap.vue'
import PersonCard from './components/PersonCard.vue'
import { useStudentData } from './composables/useStudentData'

const mapRef = ref(null)
const { students, loading, error, getLocationsAtDate, getStudentTimeline, searchStudents } = useStudentData()

// Timeline state
const START_YEAR = 2016
const END_YEAR = 2026
const currentYear = ref(END_YEAR)
const currentMonth = ref(1) // January
const isPlaying = ref(false)
let playInterval = null

// Selected student for detail panel
const selectedStudent = ref(null)
const selectedStudentLocation = ref(null)

// Search state
const searchQuery = ref('')
const showSearch = ref(false)
const searchInput = ref(null)

// Focus search input when opened
watch(showSearch, (isOpen) => {
  if (isOpen) {
    setTimeout(() => {
      searchInput.value?.focus()
    }, 50)
  }
})

// Computed current date
const currentDate = computed(() => {
  return new Date(currentYear.value, currentMonth.value - 1, 1)
})

// Format date for display
const currentDateDisplay = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[currentMonth.value - 1]} ${currentYear.value}`
})

// Filtered students for search
const filteredStudents = computed(() => {
  return searchStudents(searchQuery.value)
})

// Slider value (0-100 representing the timeline)
const sliderValue = computed({
  get() {
    const totalMonths = (END_YEAR - START_YEAR) * 12
    const currentMonths = (currentYear.value - START_YEAR) * 12 + (currentMonth.value - 1)
    return (currentMonths / totalMonths) * 100
  },
  set(val) {
    const totalMonths = (END_YEAR - START_YEAR) * 12
    const targetMonths = Math.round((val / 100) * totalMonths)
    currentYear.value = START_YEAR + Math.floor(targetMonths / 12)
    currentMonth.value = (targetMonths % 12) + 1
  }
})

// Update map when date changes
watch(currentDate, (newDate) => {
  updateMap()
})

// Update map with current locations
function updateMap() {
  if (mapRef.value && students.value.length > 0) {
    const geojson = getLocationsAtDate(currentDate.value)
    mapRef.value.updateStudents(geojson)
  }
}

// Load data when component mounts
onMounted(() => {
  // Wait for map to be ready, then update
  setTimeout(updateMap, 1500)
})

// Also update when students load
watch(students, () => {
  setTimeout(updateMap, 500)
})

// Handle student click from map
function handleStudentClick(locationData) {
  const student = getStudentTimeline(locationData.roll)
  if (student) {
    selectedStudent.value = student
    selectedStudentLocation.value = {
      city: locationData.city,
      country: locationData.country,
      comment: locationData.comment,
      unknown: locationData.unknown === true || locationData.unknown === 'true'
    }
    // Show trail for selected student
    if (mapRef.value) {
      mapRef.value.showTrail(student.timeline)
    }
  }
}

// Close detail panel
function closeDetailPanel() {
  selectedStudent.value = null
  selectedStudentLocation.value = null
  // Clear trail
  if (mapRef.value) {
    mapRef.value.clearTrail()
  }
}

// Select student from search
function selectStudentFromSearch(student) {
  selectedStudent.value = student
  // Get current location for this student
  const geojson = getLocationsAtDate(currentDate.value)
  const feature = geojson.features.find(f => f.properties.roll === student.rollNumber)
  if (feature) {
    selectedStudentLocation.value = {
      city: feature.properties.city,
      country: feature.properties.country,
      comment: feature.properties.comment,
      unknown: feature.properties.unknown
    }
  }
  // Show trail for selected student
  if (mapRef.value) {
    mapRef.value.showTrail(student.timeline)
  }
  showSearch.value = false
  searchQuery.value = ''
}

// Play/Pause functionality
function togglePlay() {
  if (isPlaying.value) {
    stopPlaying()
  } else {
    startPlaying()
  }
}

function startPlaying() {
  isPlaying.value = true
  playInterval = setInterval(() => {
    // Advance by 1 month
    if (currentMonth.value < 12) {
      currentMonth.value++
    } else {
      currentMonth.value = 1
      currentYear.value++
    }
    
    // Stop at the end
    if (currentYear.value >= END_YEAR && currentMonth.value >= 1) {
      currentYear.value = END_YEAR
      currentMonth.value = 1
      stopPlaying()
    }
  }, 200) // 200ms per month = ~2 seconds per year
}

function stopPlaying() {
  isPlaying.value = false
  if (playInterval) {
    clearInterval(playInterval)
    playInterval = null
  }
}

// Quick jump to year
function jumpToYear(year) {
  stopPlaying()
  currentYear.value = year
  currentMonth.value = 1
}

// Quick jump buttons
const quickJumpYears = [2016, 2018, 2020, 2022, 2024, 2026]
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm px-4 py-3 flex items-center justify-between z-10">
      <h1 class="text-xl font-semibold text-gray-800">Jamians of 2016</h1>
      
      <!-- Search -->
      <div class="relative">
        <button 
          @click="showSearch = !showSearch"
          class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="hidden sm:inline">Search</span>
        </button>
        
        <!-- Search dropdown -->
        <div 
          v-if="showSearch"
          @click.stop
          class="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border z-50"
        >
          <div class="p-2">
            <input 
              v-model="searchQuery"
              ref="searchInput"
              type="text"
              placeholder="Search by name..."
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="max-h-64 overflow-y-auto overscroll-contain">
            <button
              v-for="student in filteredStudents"
              :key="student.rollNumber"
              @click="selectStudentFromSearch(student)"
              class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 cursor-pointer"
            >
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                {{ student.name.split(' ').map(w => w[0]).join('').slice(0, 2) }}
              </div>
              <div class="min-w-0">
                <div class="font-medium text-gray-800 truncate">{{ student.name }}</div>
                <div class="text-xs text-gray-500">{{ student.rollNumber }}</div>
              </div>
            </button>
            <div v-if="filteredStudents.length === 0" class="px-4 py-3 text-gray-500 text-sm">
              No students found
            </div>
          </div>
        </div>
        
        <!-- Click outside to close search -->
        <div 
          v-if="showSearch" 
          class="fixed inset-0 -z-10"
          @click="showSearch = false"
        ></div>
      </div>
      
      <div class="text-sm text-gray-500 hidden sm:block">
        BTech CS 2012-2016 • {{ students.length }} students
      </div>
    </header>

    <!-- Loading/Error states -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <p class="text-gray-500">Loading student data...</p>
    </div>
    
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <p class="text-red-500">Error: {{ error }}</p>
    </div>

    <!-- Map Area -->
    <main v-else class="flex-1 relative">
      <WorldMap ref="mapRef" @studentClick="handleStudentClick" />
      
      <!-- Date overlay on map -->
      <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
        <div class="text-2xl font-bold text-gray-800">{{ currentDateDisplay }}</div>
      </div>
      
      <!-- Person detail panel -->
      <div 
        v-if="selectedStudent"
        class="absolute top-4 right-4 z-20"
      >
        <PersonCard 
          :student="selectedStudent"
          :currentLocation="selectedStudentLocation"
          @close="closeDetailPanel"
        />
      </div>
    </main>

    <!-- Timeline -->
    <footer class="bg-white shadow-inner px-4 py-4 z-10">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-3">
          <!-- Play/Pause button -->
          <button 
            @click="togglePlay"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors flex-shrink-0"
          >
            <!-- Play icon -->
            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            <!-- Pause icon -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Slider -->
          <div class="flex-1">
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="0.5"
              v-model.number="sliderValue"
              @input="stopPlaying"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          
          <!-- Current date display -->
          <div class="text-sm font-medium text-gray-700 w-24 text-right flex-shrink-0">
            {{ currentDateDisplay }}
          </div>
        </div>
        
        <!-- Quick jump buttons -->
        <div class="flex justify-center gap-2">
          <button 
            v-for="year in quickJumpYears" 
            :key="year"
            @click="jumpToYear(year)"
            :class="[
              'px-3 py-1 text-xs rounded-full transition-colors',
              currentYear === year 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            ]"
          >
            {{ year }}
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Custom slider thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
</style>
