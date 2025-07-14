export interface SmoothedBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class BoundingBoxSmoother {
  private previousBox: SmoothedBox | null = null;
  private readonly smoothingFactor: number; // 0.0 = no smoothing, 1.0 = maximum smoothing
  private readonly minimumMovement: number; // Ignore changes smaller than this

  constructor(smoothingFactor: number = 0.7, minimumMovement: number = 2) {
    this.smoothingFactor = smoothingFactor;
    this.minimumMovement = minimumMovement;
  }

  smooth(newBox: SmoothedBox): SmoothedBox {
    if (!this.previousBox) {
      this.previousBox = { ...newBox };
      return newBox;
    }

    // Calculate the distance moved
    const deltaX = Math.abs(newBox.x - this.previousBox.x);
    const deltaY = Math.abs(newBox.y - this.previousBox.y);
    const deltaWidth = Math.abs(newBox.width - this.previousBox.width);
    const deltaHeight = Math.abs(newBox.height - this.previousBox.height);

    // If the movement is too small, ignore it (reduces micro-jitter)
    if (deltaX < this.minimumMovement && 
        deltaY < this.minimumMovement && 
        deltaWidth < this.minimumMovement && 
        deltaHeight < this.minimumMovement) {
      return this.previousBox;
    }

    // Apply exponential moving average smoothing
    const smoothedBox: SmoothedBox = {
      x: this.previousBox.x * this.smoothingFactor + newBox.x * (1 - this.smoothingFactor),
      y: this.previousBox.y * this.smoothingFactor + newBox.y * (1 - this.smoothingFactor),
      width: this.previousBox.width * this.smoothingFactor + newBox.width * (1 - this.smoothingFactor),
      height: this.previousBox.height * this.smoothingFactor + newBox.height * (1 - this.smoothingFactor),
    };

    this.previousBox = smoothedBox;
    return smoothedBox;
  }

  reset() {
    this.previousBox = null;
  }
}
