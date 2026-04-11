
export class TouchVisualizer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.touchPoints = [];
    this.enabled = true;
    
    this.duration = options.duration || 500;
    this.radius = options.radius || 10;
  }
  
  recordClick(x, y) {
    
    this.touchPoints.push({
      x: x,
      y: y,
      time: Date.now()
    });
    
    // Keep only recent points
    if (this.touchPoints.length > 15) {
      this.touchPoints.shift();
    }
  }
  
  recordTouch(x, y) {
    this.recordClick(x, y);
  }
  
  draw() {
    
    const now = Date.now();
    
    // Remove expired points
    this.touchPoints = this.touchPoints.filter(point => 
      now - point.time < this.duration
    );
    
    // Draw points
    this.touchPoints.forEach(point => {
      const age = now - point.time;
      const progress = age / this.duration;
      const opacity = 1 - progress;
      const radius = this.radius * (1 - progress * 0.5);
      
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
      this.ctx.fill();
      this.ctx.strokeStyle = `rgba(0, 150, 255, ${opacity * 0.6})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();
    });
  }
  
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  
  clear() {
    this.touchPoints = [];
  }
}