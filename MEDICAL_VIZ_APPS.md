# Medical Visualization Suite

A single integrated app with 6 interactive medical visualization views demonstrating clinical use cases for anatomical diagrams + data visualization + GenAI integration.

## Overview

**App Path:** `/apps/medical-viz`

All 6 visualization types are accessible via tab navigation within a single app for a cohesive user experience.

## Views (Tabs)

### 1. 📊 ACR Dashboard
Visualize ACR imaging appropriateness scores (1-9) across body regions using ECharts `registerMap()` pattern.

**Features:**
- External SVG map registration (proper ECharts pattern)
- Interactive bar charts with anatomical highlighting
- ECharts `dispatchAction` for highlight/downplay
- 6 clinical scenarios (PE, chest pain, headache, back pain, abdominal pain, trauma)
- Color-coded appropriateness ratings

**Technology:**
- ECharts geo component with SVG map
- Bidirectional interaction (chart ↔ anatomy)
- Named SVG regions matched to data

### 2. 🔍 Multi-Region Clinical
Compare imaging appropriateness across multiple organ systems for complex presentations.

**Scenarios:**
- Sepsis (unknown source)
- Polytrauma (MVA)
- Cancer staging (lung)
- Systemic lupus (flare)
- Metastatic disease

**Features:**
- Multi-system evaluation visualization
- Bar chart showing priority by region
- Region-specific recommendations with modality details

### 3. ☢️ Radiation Exposure
Visualize radiation doses by body region for patient safety (ALARA principle).

**Comparisons:**
- Chest/abdominal/head imaging options
- Pediatric considerations
- Polytrauma workup

**Features:**
- Color-coded dose levels (green=none, red=high)
- Radiation context (background, flight equivalents)
- Visual exposure highlighting on body diagram
- Pediatric-specific warnings

### 4. 👥 Patient Education
Explain imaging plans using visual anatomy and plain-language explanations.

**Patient scenarios:**
- Chest pain evaluation
- Severe headache workup
- Abdominal pain assessment
- Back pain with numbness

**Features:**
- Plain-language explanations
- "What to expect" instructions
- Preparation steps
- Patient-friendly terminology
- Visual highlighting of imaged areas

### 5. 🎯 Procedure Planning
Interventional radiology planning with target anatomy and approach visualization.

**Procedures:**
- Liver biopsy
- Thyroid nodule biopsy
- Native kidney biopsy
- Lung nodule biopsy

**Features:**
- Visual approach path overlays
- Entry point markers on anatomy
- Risk assessments
- Step-by-step preparation checklist
- Toggle approach visibility

### 6. ⚖️ Comparative Analysis
Side-by-side comparison of imaging strategies for different clinical contexts.

**Comparisons:**
- Acute vs chronic back pain
- Typical migraine vs thunderclap headache
- Pediatric vs adult appendicitis
- PE workup: pregnant vs not pregnant

**Features:**
- Side-by-side ECharts
- Clinical rationale explanations
- Teaching points for medical education
- Context-dependent strategy visualization

## Technical Implementation

### Architecture
- Single React app with tab-based navigation
- 6 view components under `src/apps/medical-viz/views/`
- Shared anatomical SVG resources
- ECharts integration with proper `registerMap()` pattern

### Stack
- React + TypeScript
- ECharts 5.x for interactive visualizations
- External SVG maps (body-diagram.svg)
- Tailwind CSS for styling
- React Router integration

### Key Pattern (ACR Dashboard)
```typescript
// Load and register SVG map
fetch('/assets/body-diagram.svg')
  .then(response => response.text())
  .then(svgText => {
    echarts.registerMap('body_diagram', { svg: svgText });
  });

// Use geo component
geo: {
  map: 'body_diagram',
  emphasis: { itemStyle: { areaColor: '#667eea' } }
}

// Highlight on hover using dispatchAction
chart.on('mouseover', (params) => {
  chart.dispatchAction({
    type: 'highlight',
    geoIndex: 0,
    name: params.data.region
  });
});
```

## Integration with RadChat

These visualization patterns can be integrated into RadChat:

1. **API Endpoint**: Add `/visualize/acr` that returns structured data
2. **Chat Triggers**: "show me this visually" → launches visualization
3. **GenAI Enhancement**:
   - Hover tooltips with AI-generated explanations
   - "Why is CT appropriate here?" → contextual answer
   - Patient-friendly translation of medical terms
4. **Real-time Data**: Pull ACR criteria based on clinical scenarios
5. **Comparative Views**: "Compare acute vs chronic back pain imaging"
6. **Education Mode**: Resident teaching with side-by-side scenarios

## Navigation

- Access via gallery: Click "Medical Visualization" card
- Use tabs to switch between 6 views
- ESC key returns to gallery
- Each view maintains independent state

## Development

```bash
npm run dev              # Start dev server
npm run build            # Build for production
```

App registered at `/apps/medical-viz` with manifest:
```json
{
  "name": "Medical Visualization",
  "description": "Interactive anatomical diagrams for clinical decision support",
  "tech": ["React", "TypeScript", "ECharts"]
}
```
