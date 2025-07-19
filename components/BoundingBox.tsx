import { BoundingBoxProps } from "../types/face-detection";
import { TimelineStep } from "../types/timeline";

interface LabeledBoundingBoxProps extends BoundingBoxProps {
  color: string;
  text: string;
}

const loadingPhrases = [
  "Analyzing mog potential...",
  "Calculating mogging ratios...", 
  "Determining who's mogging who...",
  "Measuring jaw angles...",
  "Evaluating mog status...",
  "Processing mog levels..."
];

const objectiveBad = [
  "weak chin", "receding hairline", "predator eyes", "bad skin", "weak jawline"
];

const funnyBad = [
  "no sex appeal", "watches ig reels", "social anxiety", 
"incel", "uses hinge",
];

const objectiveGood = [
  "jaw dominance", "hunter eyes", "bone structure", "nice nose", "golden ratio", 
  "cheekbones", "jaw angle", "chad energy",
];

const funnyGood = [
  "has 401k",  "has sex", "fucks", "doesnt listen to travis scott",
  "alpha vibes", "aura", "rizz", "gyatt", "potentially gay", "zesty", "voted for zohran"
];

// Generate random stat with number between 1-9
const generateStat = (category: string, isPositive: boolean, seed: number) => {
  const randomNum = (seed % 9) + 1; // 1-9
  const sign = isPositive ? "+" : "-";
  return `${sign}${randomNum} ${category}`;
};

// Helper function to draw timeline-based content
const drawTimelineContent = (
  ctx: CanvasRenderingContext2D,
  scaledX: number,
  scaledY: number,
  scaledWidth: number,
  scaledHeight: number,
  color: string,
  timelineStep: TimelineStep
) => {
  // Get timeline state from localStorage
  const timelineState = window.localStorage.getItem("timelineState");
  if (!timelineState) return;

  const { currentStep } = JSON.parse(timelineState);
  
  const isCountdown = currentStep.startsWith('countdown_');
  const isScanning = currentStep === 'scanning';
  const isResult = currentStep === 'result_display';

  // Get current stats if they exist
  const storedStats = window.localStorage.getItem("currentCycleStats");
  const cycleStats = storedStats ? JSON.parse(storedStats) : null;

  // Draw countdown text during countdown period
  if (isCountdown) {
    // Extract countdown number from step name (countdown_3 -> 3)
    const countdownNumber = parseInt(currentStep.split('_')[1]);

    // Only show countdown if it's 3, 2, or 1
    if (countdownNumber >= 1 && countdownNumber <= 3) {
      // Calculate center position
      const centerX = scaledX + scaledWidth / 2;
      const centerY = scaledY + scaledHeight / 2;

      // The Canvas API doesn't understand CSS variables, so we read the font family from the DOM.
      const cinzelFontFamily = getComputedStyle(document.body)
        .getPropertyValue("--font-cinzel")
        .trim();

      // Use Cinzel font (medieval style), falling back to a generic serif if the variable isn't found.
      ctx.font = `bold 200px ${cinzelFontFamily || "serif"}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw text without glow
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(countdownNumber.toString(), centerX, centerY);

      // Show stats during countdown if they exist (but not for calculating state)
      if (color !== "#00FFFF" && cycleStats) { // Don't show for cyan calculating state
        const statsX = scaledX + scaledWidth + 20;
        const statsStartY = scaledY + 20;
        
        ctx.font = "bold 24px Helvetica, Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = color;
        
        // Show all 3 stats during countdown
        cycleStats.forEach((stat: string, index: number) => {
          ctx.fillText(stat, statsX, statsStartY + (index * 35));
        });
      }
    }
  }

  // Draw scanning line during scan period
  if (isScanning) {
    // Create animated scan line from top to bottom over time
    const scanStartTime = window.localStorage.getItem('scanStartTime');
    const now = Date.now();
    
    if (!scanStartTime) {
      // First time scanning - set start time and pick random phrase
      window.localStorage.setItem('scanStartTime', now.toString());
      const phraseIndex = Math.floor(Math.random() * loadingPhrases.length);
      window.localStorage.setItem('currentScanPhrase', loadingPhrases[phraseIndex]);
    }
    
    const startTime = parseInt(scanStartTime || now.toString());
    const elapsed = now - startTime;
    const scanDuration = 3000; // 3 seconds for full scan
    const scanProgress = Math.min(elapsed / scanDuration, 1); // 0 to 1
    
    const lineY = scaledY + scanProgress * scaledHeight;

    // Draw white scanning line with opacity and glow
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(scaledX, lineY);
    ctx.lineTo(scaledX + scaledWidth, lineY);
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Draw the same loading phrase throughout scanning
    const loadingPhrase = window.localStorage.getItem('currentScanPhrase') || loadingPhrases[0];
    
    const centerX = scaledX + scaledWidth / 2;
    
    ctx.font = "bold 32px Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(loadingPhrase, centerX, scaledY + scaledHeight + 120);
  } else {
    // Clear scan timing when not scanning
    if (window.localStorage.getItem('scanStartTime')) {
      window.localStorage.removeItem('scanStartTime');
      window.localStorage.removeItem('currentScanPhrase');
    }
  }
  
  // During result period, show stats to the right of bounding box
  if (isResult && color !== "#00FFFF" && cycleStats) { // Don't show for cyan calculating state
    // Draw stats to the right of bounding box
    const statsX = scaledX + scaledWidth + 20;
    const statsStartY = scaledY + 20;
    
    ctx.font = "bold 24px Helvetica, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = color; // Use same color as bounding box
    
    // Show all 3 stats during result period
    cycleStats.forEach((stat: string, index: number) => {
      ctx.fillText(stat, statsX, statsStartY + (index * 35));
    });
  }
};

export const DefaultBoundingBox = ({
  detection,
  canvasWidth,
  canvasHeight,
  videoWidth,
  videoHeight,
  ctx,
}: BoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;

  // Flip X coordinate for mirror effect
  const scaledX =
    canvasWidth - detection.box.x * scaleX - detection.box.width * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;

  // Cyan bounding box for calculating state
  ctx.strokeStyle = "#00FFFF";
  ctx.lineWidth = 5;

  // Create glow effect
  ctx.shadowColor = "#00FFFF";
  ctx.shadowBlur = 5;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
  ctx.shadowBlur = 0;

  // Draw label underneath box
  const labelX = scaledX;
  const labelY = scaledY + scaledHeight + 20;
  const labelWidth = scaledWidth;
  const labelHeight = 80;

  // Draw translucent rounded background with glow
  ctx.fillStyle = "rgba(0, 255, 255, 0.4)";
  ctx.shadowColor = "#00FFFF";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 16);
  ctx.fill();

  // Draw white text with glow
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#00FFFF";
  ctx.shadowBlur = 3;
  ctx.fillText(
    "CALCULATING",
    labelX + labelWidth / 2,
    labelY + labelHeight / 2
  );

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Add timeline content
  drawTimelineContent(ctx, scaledX, scaledY, scaledWidth, scaledHeight, "#00FFFF", "calculating");
};

export const LabeledBoundingBox = ({
  detection,
  canvasWidth,
  canvasHeight,
  videoWidth,
  videoHeight,
  ctx,
  color,
  text,
}: LabeledBoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;

  // Flip X coordinate for mirror effect
  const scaledX =
    canvasWidth - detection.box.x * scaleX - detection.box.width * scaleX;
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
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 40px Arial"; // MUCH larger font
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, labelX + labelWidth / 2, labelY + labelHeight / 2);
};

export const MoggedBoundingBox = ({
  detection,
  canvasWidth,
  canvasHeight,
  videoWidth,
  videoHeight,
  ctx,
}: BoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;

  // Flip X coordinate for mirror effect
  const scaledX =
    canvasWidth - detection.box.x * scaleX - detection.box.width * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;

  // Neon red bounding box with crisp glow
  ctx.strokeStyle = "#FF073A";
  ctx.lineWidth = 5;

  // Create glow effect with multiple strokes
  ctx.shadowColor = "#FF073A";
  ctx.shadowBlur = 5;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
  ctx.shadowBlur = 0;

  // Draw label underneath box
  const labelX = scaledX;
  const labelY = scaledY + scaledHeight + 20;
  const labelWidth = scaledWidth;
  const labelHeight = 80;

  // Draw translucent rounded background with glow
  ctx.fillStyle = "rgba(255, 7, 58, 0.4)"; // Semi-transparent red
  ctx.shadowColor = "#FF073A";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 16);
  ctx.fill();

  // Draw white text with glow
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#FF073A";
  ctx.shadowBlur = 3;
  ctx.fillText("MOGGED", labelX + labelWidth / 2, labelY + labelHeight / 2);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Add timeline content and countdown
  drawTimelineContent(ctx, scaledX, scaledY, scaledWidth, scaledHeight, "#FF073A", "result_display");
};

export const MoggingBoundingBox = ({
  detection,
  canvasWidth,
  canvasHeight,
  videoWidth,
  videoHeight,
  ctx,
}: BoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;

  // Flip X coordinate for mirror effect
  const scaledX =
    canvasWidth - detection.box.x * scaleX - detection.box.width * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;

  // Neon green bounding box with crisp glow
  ctx.strokeStyle = "#03FF07";
  ctx.lineWidth = 5;

  // Create glow effect with multiple strokes
  ctx.shadowColor = "#03FF07";
  ctx.shadowBlur = 5;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
  ctx.shadowBlur = 0;

  // Draw label underneath box
  const labelX = scaledX;
  const labelY = scaledY + scaledHeight + 20;
  const labelWidth = scaledWidth;
  const labelHeight = 80;

  // Draw translucent rounded background with glow
  ctx.fillStyle = "rgba(3, 255, 7, 0.4)"; // Semi-transparent green
  ctx.shadowColor = "#03FF07";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 16);
  ctx.fill();

  // Draw white text with glow
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#03FF07";
  ctx.shadowBlur = 3;
  ctx.fillText("MOGGING", labelX + labelWidth / 2, labelY + labelHeight / 2);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Add timeline content and countdown
  drawTimelineContent(ctx, scaledX, scaledY, scaledWidth, scaledHeight, "#03FF07", "result_display");
};

export const WaitingBoundingBox = ({
  detection,
  canvasWidth,
  canvasHeight,
  videoWidth,
  videoHeight,
  ctx,
}: BoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;

  // Flip X coordinate for mirror effect
  const scaledX =
    canvasWidth - detection.box.x * scaleX - detection.box.width * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;

  // Neon purple bounding box
  ctx.strokeStyle = "#9D00FF";
  ctx.lineWidth = 5;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

  // Draw neon green text underneath box (no background)
  const labelX = scaledX;
  const labelY = scaledY + scaledHeight + 60; // Position for text

  // Draw neon green text with glow effect
  ctx.fillStyle = "#00FF00";
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Add glow effect by drawing text multiple times with different alphas
  ctx.shadowColor = "#00FF00";
  ctx.shadowBlur = 20;
  ctx.fillText("WAITING FOR PLAYER 2", labelX + scaledWidth / 2, labelY);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;


};

export const SpotlightBoundingBox = ({
  detection,
  canvasWidth,
  canvasHeight,
  videoWidth,
  videoHeight,
  ctx,
}: BoundingBoxProps) => {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;

  // Flip X coordinate for mirror effect
  const scaledX =
    canvasWidth - detection.box.x * scaleX - detection.box.width * scaleX;
  const scaledY = detection.box.y * scaleY;
  const scaledWidth = detection.box.width * scaleX;
  const scaledHeight = detection.box.height * scaleY;

  // Fill entire canvas with green overlay
  ctx.fillStyle = "#00FF00";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Create a circular spotlight around the face (more natural than rectangle)
  const centerX = scaledX + scaledWidth / 2;
  const centerY = scaledY + scaledHeight / 2;
  const radius = Math.max(scaledWidth, scaledHeight) / 2 + 20; // Add some padding

  // Use composite operation to "cut out" the face area for spotlight effect
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();

  // Reset composite operation
  ctx.globalCompositeOperation = "source-over";
};
