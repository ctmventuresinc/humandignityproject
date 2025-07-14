export interface FaceDetection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface BoundingBoxProps {
  detection: FaceDetection;
  canvasWidth: number;
  canvasHeight: number;
  videoWidth: number;
  videoHeight: number;
  ctx: CanvasRenderingContext2D;
}

export type BoundingBoxStyle = 'default' | 'mogged' | 'mogging';
