import { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { FaceDetection } from '../types/face-detection';
import { BoundingBoxSmoother } from '../utils/smoothing';
import { FaceTracker } from '../utils/faceTracker';

export const useFaceDetection = (
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null
) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detections, setDetections] = useState<FaceDetection[]>([]);
  const smoothersRef = useRef<BoundingBoxSmoother[]>([]);
  const faceTrackerRef = useRef<FaceTracker>(new FaceTracker());

  useEffect(() => {
    if (!video || !canvas) return;

    const loadModels = async () => {
      try {
        console.log('Loading face detection models...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setIsModelLoaded(true);
        console.log('Face detection models loaded successfully');
      } catch (error) {
        console.log('Failed to load models:', error);
      }
    };

    loadModels();
  }, [video, canvas]);

  useEffect(() => {
    if (!isModelLoaded || !video || !canvas) return;

    let animationId: number;

    const detectFaces = async () => {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationId = requestAnimationFrame(detectFaces);
        return;
      }

      try {
        const faceDetections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );

        // Convert to our format first
        const rawDetections: FaceDetection[] = faceDetections.map((detection) => ({
          box: {
            x: detection.box.x,
            y: detection.box.y,
            width: detection.box.width,
            height: detection.box.height,
          },
        }));

        // Use face tracker to maintain consistent IDs
        const trackedFaces = faceTrackerRef.current.updateFaces(rawDetections);

        // Apply smoothing to tracked faces
        const mappedDetections: FaceDetection[] = trackedFaces.map((trackedFace, index) => {
          // Ensure we have a smoother for this face index
          if (!smoothersRef.current[index]) {
            smoothersRef.current[index] = new BoundingBoxSmoother(0.7, 3);
          }

          // Apply smoothing to reduce jitter
          const smoothedBox = smoothersRef.current[index].smooth({
            x: trackedFace.detection.box.x,
            y: trackedFace.detection.box.y,
            width: trackedFace.detection.box.width,
            height: trackedFace.detection.box.height,
          });

          return {
            box: smoothedBox,
          };
        });

        // Add debugging
        console.log(`Tracked ${trackedFaces.length} faces:`, trackedFaces.map((tf, i) => ({ 
          id: tf.id,
          index: i,
          confidence: Math.round(tf.confidence * 100) / 100,
          x: Math.round(tf.detection.box.x), 
          y: Math.round(tf.detection.box.y), 
          w: Math.round(tf.detection.box.width), 
          h: Math.round(tf.detection.box.height) 
        })));

        setDetections(mappedDetections);
      } catch (error) {
        console.log('Detection error:', error);
      }

      animationId = requestAnimationFrame(detectFaces);
    };

    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      detectFaces();
    } else {
      video.addEventListener('loadeddata', detectFaces);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      video.removeEventListener('loadeddata', detectFaces);
      // Reset all smoothers and tracker when component unmounts
      smoothersRef.current.forEach(smoother => smoother.reset());
      smoothersRef.current = [];
      faceTrackerRef.current.reset();
    };
  }, [isModelLoaded, video, canvas]);

  return { detections, isModelLoaded };
};
