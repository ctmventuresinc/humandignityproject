import { useEffect } from "react";
import { useFaceDetection } from "../hooks/useFaceDetection";
import {
  DefaultBoundingBox,
  MoggedBoundingBox,
  MoggingBoundingBox,
  SpotlightBoundingBox,
} from "./BoundingBox";
import { BoundingBoxStyle, DetectionMode } from "../types/face-detection";

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  style: BoundingBoxStyle;
  mode: DetectionMode;
}

export const FaceDetectionCanvas = ({
  videoRef,
  canvasRef,
  style,
  mode,
}: FaceDetectionCanvasProps) => {
  const { detections } = useFaceDetection(videoRef.current, canvasRef.current);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        // Determine how many faces to process based on mode
        const facesToProcess =
          mode === "solo" ? 1 : Math.min(detections.length, 2);

        // Handle duo mode with only one face
        if (mode === "duo" && detections.length === 1) {
          const detection = detections[0];
          
          // Calculate face box position (same as MoggingBoundingBox)
          const scaleX = canvas.width / video.videoWidth;
          const scaleY = canvas.height / video.videoHeight;
          const scaledX = detection.box.x * scaleX;
          const scaledY = detection.box.y * scaleY;
          const scaledWidth = detection.box.width * scaleX;
          const scaledHeight = detection.box.height * scaleY;
          
          // Gray bounding box
          ctx.strokeStyle = '#808080';
          ctx.lineWidth = 3;
          ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
          
          // Draw "waiting for player 2..." label underneath gray box
          const labelX = scaledX;
          const labelY = scaledY + scaledHeight + 20;
          const labelWidth = scaledWidth; // Match bounding box width
          const labelHeight = 80; // Much larger height
          
          // Draw rounded gray background
          ctx.fillStyle = '#808080';
          ctx.beginPath();
          ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 16);
          ctx.fill();
          
          // Draw white text - MUCH larger and all caps
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 40px Arial'; // MUCH larger font
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('WAITING FOR PLAYER 2...', labelX + labelWidth/2, labelY + labelHeight/2);
        } else {
          // Normal processing for other cases
          for (let i = 0; i < facesToProcess; i++) {
            const detection = detections[i];

            const boundingBoxProps = {
              detection,
              canvasWidth: canvas.width,
              canvasHeight: canvas.height,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              ctx,
            };

            // Render based on style and face index
            if (mode === "duo") {
              // Face 1 = mogging, Face 2 = mogged for testing
              if (i === 0) {
                MoggingBoundingBox(boundingBoxProps);
              } else if (i === 1) {
                MoggedBoundingBox(boundingBoxProps);
              }
            } else {
              // Solo mode - use selected style
              if (style === "mogged") {
                MoggedBoundingBox(boundingBoxProps);
              } else if (style === "mogging") {
                MoggingBoundingBox(boundingBoxProps);
              } else if (style === "spotlight") {
                SpotlightBoundingBox(boundingBoxProps);
              } else {
                DefaultBoundingBox(boundingBoxProps);
              }
            }
          }
        }
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [detections, style, mode, canvasRef, videoRef]);

  return null; // This component doesn't render anything itself
};
