 // pawns.js - Enhanced with 3D effects and no spacing for same-color pawns
import { 
  RED_PATH, GREEN_PATH, BLUE_PATH, YELLOW_PATH,
  isSafePosition, isInHomeStretch, HOME_STRETCH_START,
  CELL_SIZE, places 
} from './constants.js';

// At the bottom of main.js, add this export
export const homegap = 207;
export const positions = [
  [
    [50,150], [90,190], [50,190], [90,150]  // Red positions
  ],
  [
    [50 + homegap,150], [90 + homegap,190], [50 + homegap,190], [90 + homegap,150]  // Green positions
  ],
  [
    [50,150 + homegap], [90,190 + homegap], [50,190 + homegap], [90,150 + homegap]  // Blue positions
  ],
  [
    [50 + homegap,150 + homegap], [90 + homegap,190 + homegap], [50 + homegap,190 + homegap], [90 + homegap,150 + homegap]  // Yellow positions
  ]
];
export class Pawn {
  constructor(x, y, color, id) {
    this.x = x;
    this.y = y;
    this.baseRadius = 12; // Slightly larger for 3D effect
    this.radius = this.baseRadius;
    this.color = color;
    this.id = id;
    
    // Movement properties
    this.positionIndex = -1; // -1 = in home, 0+ = on board
    this.path = this.getPathForColor(color);
    this.isInHome = true;
    this.isInHomeStretch = false;
    this.isFinished = false;
    this.homeX = x;
    this.homeY = y;
    
    // For stacking - NO SPACING for same color pawns
    this.stackOffsetX = 0;
    this.stackOffsetY = 0;
    this.zIndex = 0;
    this.pawnsInSameCell = 0;
    
    // Animation properties
    this.isAnimating = false;
    this.animationSteps = [];
    this.currentAnimationStep = 0;
    this.animationSpeed = 100; // ms per step
    this.animationInterval = null;
    
    // Pulse effect properties
    this.isPulsing = false;
    this.pulsePhase = 0;
    this.pulseSpeed = 0.05;
    
    // Stacking properties
    this.stackCount = 0; // Number of pawns in this stack
    
    // 3D effect properties
    this.highlightAngle = Math.PI / 4; // Light from top-left
    this.highlightSize = 6;
    this.shadowSize = 4;
  }
  
  getPathForColor(color) {
    switch(color) {
      case 'red': return RED_PATH;
      case 'green': return GREEN_PATH;
      case 'blue': return BLUE_PATH;
      case 'yellow': return YELLOW_PATH;
      default: return [];
    }
  }
  
  // Main move function - returns true if move was valid
  move(steps) {
    console.log(`[Pawn ${this.color}-${this.id}] move(${steps}) called. In home: ${this.isInHome}, Position: ${this.positionIndex}`);
    
    if (this.isFinished) {
      console.log(`[Pawn ${this.color}-${this.id}] Already finished!`);
      return false;
    }
    
    // Handle moving from home
    if (this.isInHome) {
      return this.moveFromHome(steps);
    }
    
    // Handle moving on board
    return this.moveOnBoard(steps);
  }
  
  moveFromHome(steps) {
    if (steps !== 6) {
      console.log(`[Pawn ${this.color}-${this.id}] Needs 6 to move from home, got ${steps}`);
      return false;
    }
    
    console.log(`[Pawn ${this.color}-${this.id}] Moving out of home with 6`);
    
    // Instantly move to position 0 (starting point)
    this.isInHome = false;
    this.positionIndex = 0;
    
    if (this.positionIndex < this.path.length) {
      const pos = this.path[this.positionIndex];
      this.x = pos.x;
      this.y = pos.y;
    }
    
    this.resetStackOffset();
    
    console.log(`[Pawn ${this.color}-${this.id}] Now at position 0`);
    
    // Dispatch event for moving out of home
    this.dispatchMoveComplete();
    
    return true;
  }
  
  moveOnBoard(steps) {
    const newIndex = this.positionIndex + steps;
    
    // Check if move is valid
    if (newIndex >= this.path.length) {
      console.log(`[Pawn ${this.color}-${this.id}] Cannot move ${steps} steps (would exceed path length ${this.path.length})`);
      return false;
    }
    
    // Check home stretch exact roll
    if (this.isInHomeStretch && newIndex >= this.path.length) {
      console.log(`[Pawn ${this.color}-${this.id}] Needs exact roll to finish in home stretch`);
      return false;
    }
    
    // Prepare and start animation
    this.prepareAnimation(steps, newIndex);
    this.startAnimation();
    
    // Update final position
    this.positionIndex = newIndex;
    
    // Check home stretch
    if (this.positionIndex >= HOME_STRETCH_START && !this.isInHomeStretch) {
      this.isInHomeStretch = true;
      console.log(`[Pawn ${this.color}-${this.id}] Entered home stretch!`);
    }
    
    // Check if finished
    if (this.positionIndex === this.path.length - 1) {
      this.isFinished = true;
      console.log(`[Pawn ${this.color}-${this.id}] Finished!`);
    }
    
    console.log(`[Pawn ${this.color}-${this.id}] Moving ${steps} steps to position ${this.positionIndex}`);
    return true;
  }
  
  prepareAnimation(steps, targetIndex) {
    this.animationSteps = [];
    
    // Collect all intermediate positions
    for (let i = 1; i <= steps; i++) {
      const stepIndex = this.positionIndex + i;
      if (stepIndex < this.path.length) {
        const pos = this.path[stepIndex];
        this.animationSteps.push({
          x: pos.x,
          y: pos.y,
          positionIndex: stepIndex
        });
      }
    }
    
    this.currentAnimationStep = 0;
    this.isAnimating = true;
  }
  
  startAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    
    this.animationInterval = setInterval(() => {
      this.animateStep();
    }, this.animationSpeed);
  }
  
  animateStep() {
    if (this.currentAnimationStep >= this.animationSteps.length) {
      this.finishAnimation();
      return;
    }
    
    const step = this.animationSteps[this.currentAnimationStep];
    this.x = step.x + this.stackOffsetX;
    this.y = step.y + this.stackOffsetY;
    this.currentAnimationStep++;
  }
  
  finishAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    
    // Set final position
    if (this.positionIndex < this.path.length) {
      const pos = this.path[this.positionIndex];
      this.x = pos.x + this.stackOffsetX;
      this.y = pos.y + this.stackOffsetY;
    }
    
    this.isAnimating = false;
    this.animationSteps = [];
    this.currentAnimationStep = 0;
    
    console.log(`[Pawn ${this.color}-${this.id}] Animation complete at position ${this.positionIndex}`);
    
    // Dispatch completion event
    this.dispatchMoveComplete();
  }
  // In pawns.js, add this method to the Pawn class
// In your Pawn class in pawns.js, add this method:
getHomePosition() {
  
  
  const homePositions = {
    'red': [],
    'green': [],
    'blue': [],
    'yellow': []
  };
  
  // Map your positions to colors
  // positions[0] = red
  if (positions[0]) {
    positions[0].forEach(pos => {
      homePositions['red'].push({ x: pos[0], y: pos[1] });
    });
  }
  
  // positions[1] = green  
  if (positions[1]) {
    positions[1].forEach(pos => {
      homePositions['green'].push({ x: pos[0], y: pos[1] });
    });
  }
  
  // positions[2] = blue
  if (positions[2]) {
    positions[2].forEach(pos => {
      homePositions['blue'].push({ x: pos[0], y: pos[1] });
    });
  }
  
  // You need to add yellow positions to your positions array
  // For now, we'll calculate them based on the pattern
  if (!positions[3]) {
    // Calculate yellow positions (bottom right corner)
    const yellowX = 50 + homegap;
    const yellowY = 150 + homegap;
    homePositions['yellow'] = [
      { x: yellowX, y: yellowY },
      { x: yellowX + 40, y: yellowY + 40 },
      { x: yellowX, y: yellowY + 40 },
      { x: yellowX + 40, y: yellowY }
    ];
  } else if (positions[3]) {
    positions[3].forEach(pos => {
      homePositions['yellow'].push({ x: pos[0], y: pos[1] });
    });
  }
  
  // Get the specific home position for this pawn based on its ID
  // Assuming pawn IDs are like 'red-0', 'red-1', etc.
  const pawnIndex = parseInt(this.id);
  
  if (homePositions[this.color] && homePositions[this.color][pawnIndex]) {
    return homePositions[this.color][pawnIndex];
  }
  
  // Fallback to first position if index not found
  return homePositions[this.color]?.[0] || { x: this.x, y: this.y };
}
  dispatchMoveComplete() {
    const event = new CustomEvent('pawnMoveComplete', {
      detail: {
        color: this.color,
        pawnId: this.id,
        positionIndex: this.positionIndex,
        isFinished: this.isFinished,
        isInHome: this.isInHome
      }
    });
    document.dispatchEvent(event);
  }
  
  getCellId() {
    if (this.isInHome || this.isFinished) {
      return `home_${this.color}_${this.id}`;
    }
    
    if (this.positionIndex >= 0 && this.positionIndex < this.path.length) {
      const pos = this.path[this.positionIndex];
      const gridX = Math.round(pos.x / CELL_SIZE);
      const gridY = Math.round(pos.y / CELL_SIZE);
      return `${gridX}_${gridY}`;
    }
    
    return null;
  }
  
  sendToHome() {
    // Stop any animation
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
      this.isAnimating = false;
    }
    
    this.isInHome = true;
    this.positionIndex = -1;
    this.x = this.homeX;
    this.y = this.homeY;
    this.isInHomeStretch = false;
    this.isFinished = false;
    this.resetStackOffset();
    this.stackCount = 0;
    
    console.log(`[Pawn ${this.color}-${this.id}] Sent back to home`);
  }
  
  canBeCaptured() {
    if (this.isInHome || this.isInHomeStretch || this.isFinished || this.isAnimating) {
      return false;
    }
    
    return !isSafePosition(this.positionIndex);
  }
  
  // Stacking methods - NO SPACING for same color pawns
  setStackOffset(index, totalInCell) {
    this.stackCount = totalInCell;
    
    // NO SPACING - same color pawns stay exactly on top of each other
    if (totalInCell <= 1) {
      this.stackOffsetX = 0;
      this.stackOffsetY = 0;
    } else {
      // For multiple pawns of same color, don't add spacing
      this.stackOffsetX = 0;
      this.stackOffsetY = 0;
      
      // Only add slight offset for different colored pawns
      if (index > 0) {
        // This would be for different colors, but we're not implementing that
      }
    }
    
    // Update position with offset
    if (this.positionIndex >= 0 && this.positionIndex < this.path.length) {
      const pos = this.path[this.positionIndex];
      this.x = pos.x + this.stackOffsetX;
      this.y = pos.y + this.stackOffsetY;
    }
  }
  
  resetStackOffset() {
    this.stackOffsetX = 0;
    this.stackOffsetY = 0;
    this.zIndex = 0;
    this.stackCount = 0;
  }
  
  setZIndex(zIndex) {
    this.zIndex = zIndex;
  }
  
  updatePulseEffect() {
    if (this.isPulsing) {
      this.pulsePhase += this.pulseSpeed;
      const pulseScale = Math.sin(this.pulsePhase) * 0.3 + 1; // 0.7 to 1.3
      this.radius = this.baseRadius * pulseScale;
    } else {
      this.radius = this.baseRadius;
    }
  }
  
  isPointInside(x, y) {
    if (this.isAnimating) return false;
    
    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.radius;
  }
  
  // Helper function to get lighter color
  getLighterColor(color, amount = 0.3) {
    const colorMap = {
      'red': '#ff6b6b',
      'green': '#51cf66',
      'blue': '#339af0',
      'yellow': '#ffd43b'
    };
    return colorMap[color] || color;
  }
  
  // Helper function to get darker color
  getDarkerColor(color, amount = 0.3) {
    const colorMap = {
      'red': '#c92a2a',
      'green': '#2b8a3e',
      'blue': '#1864ab',
      'yellow': '#e67700'
    };
    return colorMap[color] || color;
  }
  
  draw3DEffect(ctx) {
    // Draw main pawn body with gradient
    const gradient = ctx.createRadialGradient(
      this.x - this.highlightSize/2, 
      this.y - this.highlightSize/2, 
      0,
      this.x, 
      this.y, 
      this.radius
    );
    
    // Add gradient for 3D effect
    gradient.addColorStop(0, this.getLighterColor(this.color));
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, this.getDarkerColor(this.color));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw highlight (simulating light from top-left)
    const highlightGradient = ctx.createRadialGradient(
      this.x - this.highlightSize/2, 
      this.y - this.highlightSize/2, 
      0,
      this.x - this.highlightSize/2, 
      this.y - this.highlightSize/2, 
      this.highlightSize
    );
    
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(
      this.x - this.highlightSize/2, 
      this.y - this.highlightSize/2, 
      this.highlightSize, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    // Draw outline/shinny stroke
    ctx.strokeStyle = this.getLighterColor(this.color, 0.5);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw shadow on opposite side
    const shadowGradient = ctx.createRadialGradient(
      this.x + this.shadowSize/2, 
      this.y + this.shadowSize/2, 
      0,
      this.x + this.shadowSize/2, 
      this.y + this.shadowSize/2, 
      this.shadowSize
    );
    
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(
      this.x + this.shadowSize/2, 
      this.y + this.shadowSize/2, 
      this.shadowSize, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
  
  draw(ctx) {
    ctx.save();
    
    // Update pulse effect
    this.updatePulseEffect();
    
    // Set shadow for depth
    if (this.isAnimating) {
      const pulse = Math.sin(Date.now() / 100) * 0.2 + 1;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15 * pulse;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else if (this.isPulsing) {
      // Stronger pulse for valid pawns
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else {
      // Regular shadow for 3D effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    // Draw 3D pawn
    this.draw3DEffect(ctx);
    
    // Draw stacking number if multiple pawns in same cell
    if (this.stackCount > 1) {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text shadow for better readability
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(this.stackCount.toString(), this.x, this.y);
      
      // Reset text shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Home stretch indicator - golden ring
    if (this.isInHomeStretch && !this.isFinished) {
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'gold';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    
    // Finished indicator - star effect
    if (this.isFinished) {
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'gold';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      
      // Draw a star
      const spikes = 5;
      const outerRadius = this.radius + 4;
      const innerRadius = this.radius - 2;
      
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const xPos = this.x + Math.cos(angle) * radius;
        const yPos = this.y + Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      }
      
      ctx.closePath();
      ctx.stroke();
    }
    
    ctx.restore();
  }
}
// Create pawn instances
const pawnRed1 = new Pawn(places.homeRed1[0], places.homeRed1[1], 'red', 0);
const pawnRed2 = new Pawn(places.homeRed2[0], places.homeRed2[1], 'red', 1);
const pawnRed3 = new Pawn(places.homeRed3[0], places.homeRed3[1], 'red', 2);
const pawnRed4 = new Pawn(places.homeRed4[0], places.homeRed4[1], 'red', 3);

const pawnGreen1 = new Pawn(places.homeGreen1[0], places.homeGreen1[1], 'green', 0);
const pawnGreen2 = new Pawn(places.homeGreen2[0], places.homeGreen2[1], 'green', 1);
const pawnGreen3 = new Pawn(places.homeGreen3[0], places.homeGreen3[1], 'green', 2);
const pawnGreen4 = new Pawn(places.homeGreen4[0], places.homeGreen4[1], 'green', 3);

const pawnBlue1 = new Pawn(places.homeBlue1[0], places.homeBlue1[1], 'blue', 0);
const pawnBlue2 = new Pawn(places.homeBlue2[0], places.homeBlue2[1], 'blue', 1);
const pawnBlue3 = new Pawn(places.homeBlue3[0], places.homeBlue3[1], 'blue', 2);
const pawnBlue4 = new Pawn(places.homeBlue4[0], places.homeBlue4[1], 'blue', 3);

const pawnYellow1 = new Pawn(places.homeYellow1[0], places.homeYellow1[1], 'yellow', 0);
const pawnYellow2 = new Pawn(places.homeYellow2[0], places.homeYellow2[1], 'yellow', 1);
const pawnYellow3 = new Pawn(places.homeYellow3[0], places.homeYellow3[1], 'yellow', 2);
const pawnYellow4 = new Pawn(places.homeYellow4[0], places.homeYellow4[1], 'yellow', 3);


export const redPawns = [pawnRed1, pawnRed2, pawnRed3, pawnRed4];
export const greenPawns = [pawnGreen1, pawnGreen2, pawnGreen3, pawnGreen4];
export const bluePawns = [pawnBlue1, pawnBlue2, pawnBlue3, pawnBlue4];
export const yellowPawns = [pawnYellow1, pawnYellow2, pawnYellow3, pawnYellow4];