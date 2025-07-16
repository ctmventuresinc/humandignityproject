# Human Dignity Project - Agent Instructions

## Active Project: Face Detection Camera App

## Commands
- **Dev**: `npm run dev --turbopack` - Development server  
- **Build**: `npm run build` - Production build
- **Lint**: `npm run lint` - ESLint checks

## Project Architecture
- **Framework**: Next.js 15 with App Router (TypeScript)
- **Face Detection**: face-api.js with TinyFaceDetector model
- **Styling**: CSS Modules (no Tailwind)
- **Camera**: WebRTC getUserMedia API

## Face Detection System

### Current Configuration
```typescript
// In app/page.tsx
const boundingBoxStyle: BoundingBoxStyle = 'mogging'; 
const detectionMode: DetectionMode = 'duo';
```

### Bounding Box Styles
- **`'default'`** - Clean green bounding box (no label)
- **`'mogged'`** - Red bounding box with "MOGGED" label
- **`'mogging'`** - Green bounding box (#20C65F) with "MOGGING" label  
- **`'spotlight'`** - Green overlay with circular face cutout

### Detection Modes
- **`'solo'`** - Shows bounding box for 1 face only
- **`'duo'`** - Shows bounding boxes for up to 2 faces simultaneously

### Duo Mode Behavior
When in duo mode, style settings are overridden for testing:
- **Face 1** (first detected) = Green "MOGGING" label
- **Face 2** (second detected) = Red "MOGGED" label

### Key Features
- **Face Tracking** - Maintains consistent face IDs to prevent switching
- **Smoothing** - Anti-jitter system for stable bounding boxes
- **Text Cycling** - Rotating text messages overlay on video
- **Mobile Optimized** - Square video frame, mobile-first design

### Architecture Components
- **`hooks/useFaceDetection.ts`** - Face detection logic with tracking
- **`components/BoundingBox.tsx`** - Rendering functions for different styles
- **`components/FaceDetectionCanvas.tsx`** - Canvas orchestration
- **`utils/faceTracker.ts`** - Face ID tracking and matching
- **`utils/smoothing.ts`** - Bounding box smoothing algorithms

### Models
- **Face Detection Model**: TinyFaceDetector (188KB)
- **Model Location**: `/public/models/`
- **Detection Library**: face-api.js

## Code Standards
- **TypeScript**: Functional components, explicit types
- **CSS Modules**: Component-scoped styling
- **Mobile-First**: Square video layout, touch-optimized
- **Modular**: Separated concerns across hooks/components/utils
