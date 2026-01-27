<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const emit = defineEmits(['studentClick'])

const mapContainer = ref(null)
let map = null
let popup = null

// Jamia Millia Islamia coordinates (default center)
const JAMIA_COORDS = [77.2809, 28.5616]

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    // Carto Positron - light, clean style (free)
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: JAMIA_COORDS,
    zoom: 2,
    minZoom: 2,  // Prevent world from repeating
    maxZoom: 18
  })

  // Add navigation controls (zoom buttons)
  map.addControl(new maplibregl.NavigationControl(), 'top-right')

  // Create popup for hover tooltips
  popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 15
  })

  // When map loads, we'll add data sources and layers here
  map.on('load', () => {
    console.log('Map loaded')
    
    // Add a source for student locations (empty for now)
    map.addSource('students', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    })

    // Clustered circles layer
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'students',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#3b82f6',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,   // radius for count < 10
          10, 25,  // radius 25 for count >= 10
          30, 30   // radius 30 for count >= 30
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    })

    // Cluster count labels
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'students',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    })

    // Individual student dots
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'students',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['get', 'unknown'], '#9ca3af',  // grey for unknown location
          '#3b82f6'  // blue for known location
        ],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    })

    // Click on cluster to zoom in
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
      const clusterId = features[0].properties.cluster_id
      map.getSource('students').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        })
      })
    })

    // Click on individual student dot
    map.on('click', 'unclustered-point', (e) => {
      const feature = e.features[0]
      const props = feature.properties
      emit('studentClick', {
        name: props.name,
        roll: props.roll,
        linkedin: props.linkedin,
        city: props.city,
        country: props.country,
        comment: props.comment,
        unknown: props.unknown
      })
    })

    // Hover tooltip for clusters
    map.on('mouseenter', 'clusters', (e) => {
      map.getCanvas().style.cursor = 'pointer'
      const features = e.features[0]
      const count = features.properties.point_count
      
      popup
        .setLngLat(features.geometry.coordinates)
        .setHTML(`<div class="font-medium">${count} people</div>`)
        .addTo(map)
    })

    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })

    // Hover tooltip for individual dots
    map.on('mouseenter', 'unclustered-point', (e) => {
      map.getCanvas().style.cursor = 'pointer'
      const props = e.features[0].properties
      const coords = e.features[0].geometry.coordinates.slice()
      
      // Build tooltip HTML
      const locationText = props.unknown === true || props.unknown === 'true'
        ? 'Location unknown'
        : `${props.city}, ${props.country}`
      
      const html = `
        <div class="text-sm">
          <div class="font-semibold">${props.name}</div>
          <div class="text-gray-600">${locationText}</div>
        </div>
      `
      
      popup
        .setLngLat(coords)
        .setHTML(html)
        .addTo(map)
    })

    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })
  })
})

onUnmounted(() => {
  if (popup) popup.remove()
  if (map) map.remove()
})

// Method to update student data (will be called from parent)
const updateStudents = (geojsonData) => {
  if (map && map.getSource('students')) {
    map.getSource('students').setData(geojsonData)
  }
}

// Expose method to parent
defineExpose({ updateStudents })
</script>

<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>

<style>
/* Popup styling */
.maplibregl-popup-content {
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.maplibregl-popup-tip {
  border-top-color: white;
}
</style>
