# Jamians - Project Plan

## Project Vision

A web app to visualize where 74 BTech 2012-2016 classmates from Jamia Millia Islamia have been over the past decade. The main interface is an interactive world map with dots representing each person, and a timeline slider to see how people moved around the world since graduation.

**Target URL:** `2016.jamians.in` (eventually)  
**Initial hosting:** GitHub Pages

---

## Requirements & Decisions

### Core Features

| Feature | Decision |
|---------|----------|
| **Map** | World map with dots for each person |
| **Timeline** | Slider from July 2016 → Today (Jan 2026) |
| **Timeline controls** | Play/pause, manual scrub, quick jump buttons (2016, 2018, 2020, etc.) |
| **Dot behavior** | Clustered when zoomed out (shows count), spread when zoomed in |
| **Click action** | Opens panel with: name, initials avatar, full timeline, LinkedIn link |
| **Search** | Filter by name |
| **Mobile** | Responsive design, should work on phones |

### Data Model

| Aspect | Decision |
|--------|----------|
| **Unique ID** | Roll number (e.g., `12-CSS-01`) |
| **Time format** | Flexible: `"2016"`, `"2016-07"`, or `"2016-07-15"` |
| **Location** | City + Country (separate fields) |
| **Entry type** | Point-in-time snapshots (not date ranges) |
| **Comments** | Optional per-entry comment about what they were up to |
| **Unknown location** | Grey dot at Jamia with tooltip "Last known: Jamia (2016)" |
| **Avatars** | Initials (Shadab Zafar → SZ) |

### Data Storage

| Aspect | Decision |
|--------|----------|
| **Format** | YAML files |
| **Location** | `data/2016/{roll}-{firstname}.yaml` |
| **History** | Git tracks all changes |
| **Multi-batch** | Folder structure supports future batches (`data/2017/`, etc.) |

### Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Vue 3 + Vite | Familiar, modern, fast builds |
| Map | MapLibre GL JS | Free, WebGL (smooth animations), no API key needed |
| Styling | Tailwind CSS | Rapid UI development |
| Geocoding | Nominatim (OpenStreetMap) | Free, cached at build time |
| Hosting | GitHub Pages | Free, simple |
| Deployment | Manual for now | Automation later if needed |

### Visual Design

| Aspect | Decision |
|--------|----------|
| **Map style** | Light/clean (Carto Positron or similar) |
| **Timeline** | Simple functional slider |
| **Overall feel** | Clean, modern |

---

## Data Schema

### File Structure

```
data/
└── 2016/                         # Graduation year
    ├── 12-CSS-01-shadab.yaml
    ├── 12-CSS-02-amit.yaml
    └── ...
```

### YAML Format

```yaml
# data/2016/12-CSS-01-shadab.yaml

roll_number: "12-CSS-01"
name: "Shadab Zafar"
linkedin: "https://linkedin.com/in/shadabzafar"

timeline:
  - date: "2016-07"
    city: "Delhi"
    country: "India"
    comment: "Started at Adobe"

  - date: "2018-03"
    city: "Bangalore"
    country: "India"
    comment: "Moved to Flipkart"

  - date: "2020"
    city: "Singapore"
    country: "Singapore"
```

### Rules

- `date`: Flexible format - year only, month/year, or full date
- `timeline: []` (empty) → grey dot at Jamia
- `linkedin`: Optional, can be empty string
- `comment`: Optional, can be omitted entirely

---

## Project Structure

```
jamians/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── WorldMap.vue         # MapLibre map with dots
│   │   ├── TimelineSlider.vue   # Play/pause, scrub, quick jumps
│   │   ├── PersonCard.vue       # Detail panel on click
│   │   ├── SearchBar.vue        # Search by name
│   │   └── Avatar.vue           # Initials avatar (SZ)
│   ├── composables/
│   │   └── useStudentData.js    # Load & process YAML data
│   ├── utils/
│   │   └── geocode.js           # City → coordinates lookup
│   ├── App.vue
│   └── main.js
├── data/
│   └── 2016/
│       └── *.yaml               # Student data files
├── scripts/
│   └── geocode-cities.js        # Build script to cache coordinates
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation
- [x] Create Plan.md
- [x] Set up Vue 3 + Vite project
- [x] Configure Tailwind CSS
- [x] Create basic layout (map area + timeline below)
- [x] Add MapLibre with light basemap
- [x] Create sample YAML files (8 people)

### Phase 2: Core Map
- [x] Load YAML data at build time
- [x] Display dots on map for each person
- [x] Implement clustering (zoom-aware)
- [x] Style dots (color, size)

### Phase 3: Timeline
- [x] Build timeline slider component
- [x] Connect slider to map (filter dots by date)
- [x] Implement dot position changes based on timeline
- [x] Add play/pause animation
- [x] Add quick jump buttons

### Phase 4: Interaction
- [x] Implement hover tooltips
- [x] Build person detail panel (click to open)
- [x] Add search functionality
- [x] Handle unknown locations (grey dots at Jamia)

### Phase 5: Polish
- [ ] Mobile responsive layout
- [ ] Smooth animations for dot movement
- [ ] Loading states
- [ ] Error handling
- [ ] README documentation

### Phase 6: Deploy
- [ ] Configure Vite for GitHub Pages
- [ ] Manual build & deploy to `gh-pages` branch

---

## Key Coordinates

| Location | Latitude | Longitude | Notes |
|----------|----------|-----------|-------|
| Jamia Millia Islamia | 28.5616 | 77.2809 | Default for unknown locations |

---

## Open Questions (To Decide During Build)

1. **Dot colors**: All same color, or vary by region?
2. **Animation speed**: How fast should play mode advance?
3. **Mobile layout**: Stack map above timeline, or different arrangement?

---

## Context

- **Batch**: BTech 2012-2016 from Jamia Millia Islamia
- **Class size**: 74 students
- **Roll numbers**: 12-CSS-01 to 12-CSS-74
- **Time span**: 10 years (2016-2026)
- **Contributors**: Primarily Shadab + a few others
- **Update frequency**: Initial bulk entry, then rare updates
