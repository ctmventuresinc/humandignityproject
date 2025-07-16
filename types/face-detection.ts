export interface FaceDetection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isSmiling?: boolean;
}

export interface BoundingBoxProps {
  detection: FaceDetection;
  canvasWidth: number;
  canvasHeight: number;
  videoWidth: number;
  videoHeight: number;
  ctx: CanvasRenderingContext2D;
}

export type BoundingBoxStyle = 'default' | 'mogged' | 'mogging' | 'spotlight';

export type DetectionMode = 'solo' | 'duo';
