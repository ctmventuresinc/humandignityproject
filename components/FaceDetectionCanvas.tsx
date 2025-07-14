import { useEffect } from 'react';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { DefaultBoundingBox, MoggedBoundingBox, MoggingBoundingBox } from './BoundingBox';
import { BoundingBoxStyle } from '../types/face-detection';

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  style: BoundingBoxStyle;
}

export const FaceDetectionCanvas = ({ videoRef, canvasRef, style }: FaceDetectionCanvasProps) => {
  const { detections } = useFaceDetection(videoRef.current, canvasRef.current);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        const detection = detections[0]; // Use first detected face

        const boundingBoxProps = {
          detection,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          ctx,
        };

        // Render based on style
        if (style === 'mogged') {
          MoggedBoundingBox(boundingBoxProps);
        } else if (style === 'mogging') {
          MoggingBoundingBox(boundingBoxProps);
        } else {
          DefaultBoundingBox(boundingBoxProps);
        }
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [detections, style, canvasRef, videoRef]);

  return null; // This component doesn't render anything itself
};
