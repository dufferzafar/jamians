<script setup>
import { computed } from 'vue'

const props = defineProps({
  student: {
    type: Object,
    required: true
  },
  currentLocation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

// Generate initials from name
const initials = computed(() => {
  if (!props.student?.name) return '?'
  return props.student.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Check if has LinkedIn
const hasLinkedIn = computed(() => {
  return props.student?.linkedin && props.student.linkedin.length > 0
})

// Format timeline for display
const timeline = computed(() => {
  return props.student?.timeline || []
})

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return ''
  // Handle different formats
  if (/^\d{4}$/.test(dateStr)) return dateStr
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [year, month] = dateStr.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(month) - 1]} ${year}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }
  return dateStr
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-xl w-80 max-h-[80vh] flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white relative">
      <button 
        @click="emit('close')"
        class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Avatar -->
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
          {{ initials }}
        </div>
        <div>
          <h2 class="text-lg font-semibold">{{ student.name }}</h2>
          <p class="text-blue-100 text-sm">{{ student.rollNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Current Location -->
    <div v-if="currentLocation" class="px-4 py-3 bg-gray-50 border-b">
      <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Location</div>
      <div class="font-medium text-gray-800">
        <span v-if="currentLocation.unknown">
          <span class="text-gray-400">Unknown</span>
          <span class="text-gray-400 text-sm"> • Last known: Jamia (2016)</span>
        </span>
        <span v-else>
          <span v-if="currentLocation.city && !['', 'unknown', 'Unknown'].includes(currentLocation.city.trim())">
            {{ currentLocation.city }}, {{ currentLocation.country }}
          </span>
          <span v-else>
            {{ currentLocation.country }}
          </span>
        </span>
      </div>
      <div v-if="currentLocation.comment && !currentLocation.unknown" class="text-sm text-gray-600 mt-1">
        {{ currentLocation.comment }}
      </div>
    </div>

    <!-- LinkedIn Link -->
    <div v-if="hasLinkedIn" class="px-4 py-2 border-b">
      <a 
        :href="student.linkedin" 
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
        View LinkedIn Profile
      </a>
    </div>

    <!-- Timeline -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="text-xs text-gray-500 uppercase tracking-wide mb-3">Timeline</div>
      
      <div v-if="timeline.length === 0" class="text-gray-400 text-sm italic">
        No location history available
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="(entry, index) in timeline" 
          :key="index"
          class="relative pl-6 pb-4 border-l-2 border-blue-200 last:border-l-0 last:pb-0"
        >
          <!-- Timeline dot -->
          <div class="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500"></div>
          
          <!-- Entry content -->
          <div class="text-xs text-gray-500 mb-1">{{ formatDate(entry.dateStr) }}</div>
          <div class="font-medium text-gray-800">
            {{ entry.city }}, {{ entry.country }}
          </div>
          <div v-if="entry.comment" class="text-sm text-gray-600 mt-0.5">
            {{ entry.comment }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
