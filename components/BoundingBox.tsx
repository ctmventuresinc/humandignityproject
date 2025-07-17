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
  ctx.lineWidth = 5;
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
  ctx.lineWidth = 5;
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
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;
  
  const scaledX = detection.box.x * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;
  
  // Neon red bounding box with crisp glow
  ctx.strokeStyle = '#FF073A';
  ctx.lineWidth = 5;
  
  // Create glow effect with multiple strokes
  ctx.shadowColor = '#FF073A';
  ctx.shadowBlur = 5;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
  ctx.shadowBlur = 0;
  
  // Draw label underneath box
  const labelX = scaledX;
  const labelY = scaledY + scaledHeight + 20;
  const labelWidth = scaledWidth;
  const labelHeight = 80;
  
  // Draw translucent rounded background with glow
  ctx.fillStyle = 'rgba(255, 7, 58, 0.4)'; // Semi-transparent red
  ctx.shadowColor = '#FF073A';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 16);
  ctx.fill();
  
  // Draw white text with glow
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#FF073A';
  ctx.shadowBlur = 3;
  ctx.fillText('MOGGED', labelX + labelWidth/2, labelY + labelHeight/2);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
};

export const MoggingBoundingBox = ({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx }: BoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;
  
  const scaledX = detection.box.x * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;
  
  // Neon green bounding box with crisp glow
  ctx.strokeStyle = '#03FF07';
  ctx.lineWidth = 5;
  
  // Create glow effect with multiple strokes
  ctx.shadowColor = '#03FF07';
  ctx.shadowBlur = 5;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
  ctx.shadowBlur = 0;
  
  // Draw label underneath box
  const labelX = scaledX;
  const labelY = scaledY + scaledHeight + 20;
  const labelWidth = scaledWidth;
  const labelHeight = 80;
  
  // Draw translucent rounded background with glow
  ctx.fillStyle = 'rgba(3, 255, 7, 0.4)'; // Semi-transparent green
  ctx.shadowColor = '#03FF07';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 16);
  ctx.fill();
  
  // Draw white text with glow
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#03FF07';
  ctx.shadowBlur = 3;
  ctx.fillText('MOGGING', labelX + labelWidth/2, labelY + labelHeight/2);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
};

export const WaitingBoundingBox = ({ detection, canvasWidth, canvasHeight, videoWidth, videoHeight, ctx }: BoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;
  
  const scaledX = detection.box.x * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;
  
  // Neon purple bounding box
  ctx.strokeStyle = '#9D00FF';
  ctx.lineWidth = 5;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
  
  // Draw neon green text underneath box (no background)
  const labelX = scaledX;
  const labelY = scaledY + scaledHeight + 60; // Position for text
  
  // Draw neon green text with glow effect
  ctx.fillStyle = '#00FF00';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add glow effect by drawing text multiple times with different alphas
  ctx.shadowColor = '#00FF00';
  ctx.shadowBlur = 20;
  ctx.fillText('WAITING FOR PLAYER 2', labelX + scaledWidth/2, labelY);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
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
