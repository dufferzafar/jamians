# Jamians - Where Are They Now?

An interactive world map that tracks where classmates from Jamia Millia Islamia (BTech CS 2012-2016) have been since graduation.

## Features

- **Interactive World Map** - Visualize 74 classmates' locations on a clean, light-themed map
- **Timeline Slider** - Scrub through time from July 2016 to present day
- **Play/Pause Animation** - Watch dots move around the world as time progresses
- **Quick Jump Buttons** - Jump to specific years (2016, 2018, 2020, etc.)
- **Clustering** - Dots cluster when zoomed out, spread when zoomed in
- **Search** - Find classmates by name
- **Person Details** - Click any dot to see full timeline, LinkedIn profile, and journey history
- **Movement Trails** - See a person's complete journey with animated airplane icons along the path

## Tech Stack

- **Vue 3** + **Vite** - Frontend framework
- **MapLibre GL JS** - Map rendering (free, no API key needed)
- **Tailwind CSS** - Styling
- **YAML** - Student data storage

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/dufferzafar/jamians.git
cd jamians

# Install dependencies
cd ui
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
cd ui
npm run build
```

The built files will be in `ui/dist/` ready for deployment.

## Adding Student Data

Student data is stored as YAML files in `ui/data/2016/`.

### File Naming Convention

```
{roll}-{firstname}.yaml
```

Example: `12-CSS-59-shadab.yaml`

### YAML Schema

```yaml
roll_number: "12-CSS-59"
name: "Shadab Zafar"
linkedin: "https://linkedin.com/in/dufferzafar"

timeline:
  - date: "2016-07"
    city: "Noida"
    country: "India"
    comment: "Started at Adobe"

  - date: "2019-07"
    city: "Gurgaon"
    country: "India"
    comment: "Joined Tower Research Capital"

  - date: "2020-03"
    city: "Delhi"
    country: "India"
    comment: "Moved back home"
```

### Date Formats

All these formats are supported:
- `"2016"` - Year only
- `"2016-07"` - Month and year
- `"2016-07-15"` - Full date

### Unknown Location

If someone's location is unknown, leave the timeline empty:

```yaml
roll_number: "12-CSS-XX"
name: "Unknown Person"
linkedin: ""

timeline: []
```

They'll appear as a grey dot at Jamia Millia Islamia (Delhi).

## Adding New Cities

If a city isn't recognized, add it to `ui/src/utils/cityCoordinates.js`:

```javascript
'cityname,country': [longitude, latitude],
```

Example:
```javascript
'kanpur,india': [80.3319, 26.4499],
```