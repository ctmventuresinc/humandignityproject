import { BoundingBoxProps } from '../types/face-detection';

interface LabeledBoundingBoxProps extends BoundingBoxProps {
  color: string;
  text: string;
}

export const DefaultBoundingBox = ({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx }: BoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;
  
  const scaledX = detection.box.x * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;
  
  // Green bounding box
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 3;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
};

export const LabeledBoundingBox = ({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx, color, text }: LabeledBoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;
  
  const scaledX = detection.box.x * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;
  
  // Colored bounding box
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
  
  // Draw label underneath box
  const labelX = scaledX;
  const labelY = scaledY + scaledHeight + 20;
  const labelWidth = scaledWidth; // Match bounding box width
  const labelHeight = 80; // Much larger height
  
  // Draw rounded background
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 16);
  ctx.fill();
  
  // Draw white text - MUCH larger and all caps
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 40px Arial'; // MUCH larger font
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, labelX + labelWidth/2, labelY + labelHeight/2);
};

export const MoggedBoundingBox = ({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx }: BoundingBoxProps) => {
  return LabeledBoundingBox({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx, color: '#FF0000', text: 'MOGGED' });
};

export const MoggingBoundingBox = ({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx }: BoundingBoxProps) => {
  return LabeledBoundingBox({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx, color: '#20C65F', text: 'MOGGING' });
};

export const WaitingBoundingBox = ({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx }: BoundingBoxProps) => {
  return LabeledBoundingBox({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx, color: '#808080', text: 'WAITING FOR PLAYER 2...' });
};

export const SpotlightBoundingBox = ({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx }: BoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;
  
  const scaledX = detection.box.x * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;
  
  // Fill entire canvas with green overlay
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Create a circular spotlight around the face (more natural than rectangle)
  const centerX = scaledX + scaledWidth / 2;
  const centerY = scaledY + scaledHeight / 2;
  const radius = Math.max(scaledWidth, scaledHeight) / 2 + 20; // Add some padding
  
  // Use composite operation to "cut out" the face area for spotlight effect
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
};
