import { FaceDetection } from '../types/face-detection';

interface TrackedFace {
  id: number;
  detection: FaceDetection;
  lastSeen: number;
  confidence: number;
}

export class FaceTracker {
  private trackedFaces: TrackedFace[] = [];
  private nextId = 0;
  private readonly maxDistance = 100; // Maximum distance to consider same face
  private readonly maxAge = 30; // Frames to keep a face alive without detection

  private calculateDistance(face1: FaceDetection, face2: FaceDetection): number {
    const centerX1 = face1.box.x + face1.box.width / 2;
    const centerY1 = face1.box.y + face1.box.height / 2;
    const centerX2 = face2.box.x + face2.box.width / 2;
    const centerY2 = face2.box.y + face2.box.height / 2;
    
    return Math.sqrt(
      Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2)
    );
  }

  private calculateOverlap(face1: FaceDetection, face2: FaceDetection): number {
    const box1 = face1.box;
    const box2 = face2.box;
    
    const left = Math.max(box1.x, box2.x);
    const right = Math.min(box1.x + box1.width, box2.x + box2.width);
    const top = Math.max(box1.y, box2.y);
    const bottom = Math.min(box1.y + box1.height, box2.y + box2.height);
    
    if (left < right && top < bottom) {
      const overlapArea = (right - left) * (bottom - top);
      const area1 = box1.width * box1.height;
      const area2 = box2.width * box2.height;
      return overlapArea / Math.min(area1, area2);
    }
    
    return 0;
  }

  updateFaces(detections: FaceDetection[]): TrackedFace[] {
    const currentFrame = Date.now();
    
    // Mark all faces as not seen this frame
    this.trackedFaces.forEach(face => face.lastSeen++);
    
    // Process each detection
    detections.forEach(detection => {
      let bestMatch: TrackedFace | null = null;
      let bestScore = Infinity;
      
      // Find the best matching existing face
      this.trackedFaces.forEach(trackedFace => {
        const distance = this.calculateDistance(detection, trackedFace.detection);
        const overlap = this.calculateOverlap(detection, trackedFace.detection);
        
        // Score based on distance and overlap
        const score = distance - (overlap * 50); // Favor high overlap
        
        if (score < bestScore && distance < this.maxDistance) {
          bestScore = score;
          bestMatch = trackedFace;
        }
      });
      
      if (bestMatch) {
        // Update existing face
        bestMatch.detection = detection;
        bestMatch.lastSeen = 0;
        bestMatch.confidence = Math.min(bestMatch.confidence + 0.1, 1.0);
      } else {
        // Create new face
        this.trackedFaces.push({
          id: this.nextId++,
          detection,
          lastSeen: 0,
          confidence: 0.5
        });
      }
    });
    
    // Remove old faces
    this.trackedFaces = this.trackedFaces.filter(face => face.lastSeen < this.maxAge);
    
    // Sort by confidence and ID to maintain consistent ordering
    this.trackedFaces.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence; // Higher confidence first
      }
      return a.id - b.id; // Earlier ID first for tie-breaking
    });
    
    return this.trackedFaces.slice(0, 2); // Return max 2 faces
  }

  reset() {
    this.trackedFaces = [];
    this.nextId = 0;
  }
}
