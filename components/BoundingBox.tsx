import { BoundingBoxProps } from "../types/face-detection";

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

// Helper function to draw scanning line animation
const drawScanningLine = (
  ctx: CanvasRenderingContext2D,
  scaledX: number,
  scaledY: number,
  scaledWidth: number,
  scaledHeight: number,
  color: string
) => {
  // Check if face detection has started
  const faceDetectionStarted = window.localStorage.getItem(
    "faceDetectionStarted"
  );
  if (!faceDetectionStarted) return;

  const startTime = parseInt(faceDetectionStarted);
  const now = Date.now();
  const countdownDuration = 3000; // 3 seconds countdown
  const scanDuration = 1000; // 1 second scan
  const waitDuration = 3000; // 3 seconds wait
  const totalCycle = countdownDuration + scanDuration + waitDuration; // 7 seconds total

  const timeInCycle = (now - startTime) % totalCycle;
  
  const wasScanning = window.localStorage.getItem("currentlyScanning") === "true";
  const isCountdown = timeInCycle <= countdownDuration;
  const isScanning = timeInCycle > countdownDuration && timeInCycle <= countdownDuration + scanDuration;
  const isResult = timeInCycle > countdownDuration + scanDuration;

  // Detect scan start - generate fresh stats
  if (isScanning && !wasScanning) {
    window.localStorage.setItem("currentlyScanning", "true");
    window.dispatchEvent(new CustomEvent("scanStart"));
    
    // Determine if this cycle will be mogging or mogged
    const willBeMogging = Math.random() > 0.5;
    
    let freshStats: string[];
    
    if (willBeMogging) {
      // 2 from objectiveGood + 1 from funnyGood
      const obj1 = objectiveGood[Math.floor(Math.random() * objectiveGood.length)];
      const obj2 = objectiveGood[Math.floor(Math.random() * objectiveGood.length)];
      const funny1 = funnyGood[Math.floor(Math.random() * funnyGood.length)];
      
      freshStats = [
        generateStat(obj1, true, Math.floor(Math.random() * 1000)),
        generateStat(obj2, true, Math.floor(Math.random() * 1000)),
        generateStat(funny1, true, Math.floor(Math.random() * 1000))
      ];
    } else {
      // 2 from funnyBad + 1 from objectiveBad
      const funny1 = funnyBad[Math.floor(Math.random() * funnyBad.length)];
      const funny2 = funnyBad[Math.floor(Math.random() * funnyBad.length)];
      const obj1 = objectiveBad[Math.floor(Math.random() * objectiveBad.length)];
      
      freshStats = [
        generateStat(funny1, false, Math.floor(Math.random() * 1000)),
        generateStat(funny2, false, Math.floor(Math.random() * 1000)),
        generateStat(obj1, false, Math.floor(Math.random() * 1000))
      ];
    }
    
    window.localStorage.setItem("currentCycleStats", JSON.stringify(freshStats));
    window.localStorage.setItem("willBeMogging", willBeMogging.toString());
  }

  // Detect scan end
  if (!isScanning && wasScanning) {
    window.localStorage.setItem("currentlyScanning", "false");
    window.dispatchEvent(new CustomEvent("scanEnd"));
  }

  // Get current stats if they exist
  const storedStats = window.localStorage.getItem("currentCycleStats");
  const cycleStats = storedStats ? JSON.parse(storedStats) : null;

  // Draw countdown text during countdown period
  if (isCountdown) {
    const countdownNumber = Math.ceil((countdownDuration - timeInCycle) / 1000); // 3, 2, 1

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
    const scanProgress = (timeInCycle - countdownDuration) / scanDuration; // 0 to 1 during scan
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

    // Draw loading phrase below the bounding box during scanning
    // Use the current scan cycle number to get a different phrase each cycle
    const scanCycleNumber = Math.floor((now - startTime) / totalCycle);
    const phraseIndex = (startTime + scanCycleNumber * 1337) % loadingPhrases.length;
    const loadingPhrase = loadingPhrases[phraseIndex];
    
    const centerX = scaledX + scaledWidth / 2;
    
    ctx.font = "bold 32px Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(loadingPhrase, centerX, scaledY + scaledHeight + 120);
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

  // Add scanning line animation
  drawScanningLine(ctx, scaledX, scaledY, scaledWidth, scaledHeight, "#00FFFF");
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

  // Add scanning line animation and countdown
  drawScanningLine(ctx, scaledX, scaledY, scaledWidth, scaledHeight, "#FF073A");
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

  // Add scanning line animation and countdown
  drawScanningLine(ctx, scaledX, scaledY, scaledWidth, scaledHeight, "#03FF07");
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
