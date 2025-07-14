import { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { FaceDetection } from '../types/face-detection';
import { BoundingBoxSmoother } from '../utils/smoothing';

export const useFaceDetection = (
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null
) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detections, setDetections] = useState<FaceDetection[]>([]);
  const smootherRef = useRef<BoundingBoxSmoother>(new BoundingBoxSmoother(0.7, 3));

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

        const mappedDetections: FaceDetection[] = faceDetections.map((detection) => {
          // Apply smoothing to reduce jitter
          const smoothedBox = smootherRef.current.smooth({
            x: detection.box.x,
            y: detection.box.y,
            width: detection.box.width,
            height: detection.box.height,
          });

          return {
            box: smoothedBox,
          };
        });

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
      // Reset smoother when component unmounts
      smootherRef.current.reset();
    };
  }, [isModelLoaded, video, canvas]);

  return { detections, isModelLoaded };
};
