import { useEffect } from "react";
import { useFaceDetection } from "../hooks/useFaceDetection";
import {
  DefaultBoundingBox,
  MoggedBoundingBox,
  MoggingBoundingBox,
  SpotlightBoundingBox,
  WaitingBoundingBox,
} from "./BoundingBox";
import { BoundingBoxStyle, DetectionMode } from "../types/face-detection";

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  style: BoundingBoxStyle;
  mode: DetectionMode;
  face1State?: "calculating" | "mogging" | "mogged";
  face2State?: "calculating" | "mogging" | "mogged";
}

export const FaceDetectionCanvas = ({
  videoRef,
  canvasRef,
  style,
  mode,
  face1State,
  face2State,
}: FaceDetectionCanvasProps) => {
  const { detections } = useFaceDetection(videoRef.current, canvasRef.current);
  
  // Calculate smile status for parent component
  const smilingFaces = detections.filter(detection => detection.isSmiling);
  const smileStatus = detections.length > 0 ? (smilingFaces.length > 0 ? 'smiling' : 'not_smiling') : 'no_faces';
  
  // Pass smile status to parent via a custom event or callback
  useEffect(() => {
    const event = new CustomEvent('smileStatusChange', { detail: smileStatus });
    window.dispatchEvent(event);
  }, [smileStatus]);

  // Pass face detection status to parent
  useEffect(() => {
    const event = new CustomEvent('faceDetectionChange', { detail: detections });
    window.dispatchEvent(event);
  }, [detections]);

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
          
          const boundingBoxProps = {
            detection,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            ctx,
          };
          
          WaitingBoundingBox(boundingBoxProps);
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
              // Use individual face states for duo mode
              if (i === 0) {
                // Face 1 state
                const currentFace1State = face1State || "calculating";
                if (currentFace1State === "calculating") {
                  DefaultBoundingBox(boundingBoxProps);
                } else if (currentFace1State === "mogging") {
                  MoggingBoundingBox(boundingBoxProps);
                } else {
                  MoggedBoundingBox(boundingBoxProps);
                }
              } else if (i === 1) {
                // Face 2 state
                const currentFace2State = face2State || "calculating";
                if (currentFace2State === "calculating") {
                  DefaultBoundingBox(boundingBoxProps);
                } else if (currentFace2State === "mogging") {
                  MoggingBoundingBox(boundingBoxProps);
                } else {
                  MoggedBoundingBox(boundingBoxProps);
                }
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
