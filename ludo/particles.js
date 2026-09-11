// particles.js - Particle system for captures and finishes
export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 3 + 2;
    this.speedX = Math.random() * 6 - 3;
    this.speedY = Math.random() * 6 - 3;
    this.life = 1.0;
    this.decay = Math.random() * 0.02 + 0.01;
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
    this.size *= 0.98;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }
  
  createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }
  
  createTrail(x, y, targetX, targetY, color, count = 15) {
    const dx = (targetX - x) / count;
    const dy = (targetY - y) / count;
    
    for (let i = 0; i < count; i++) {
      const particle = new Particle(x + dx * i, y + dy * i, color);
      particle.speedX = 0;
      particle.speedY = 0;
      particle.decay = 0.02;
      this.particles.push(particle);
    }
  }
  
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  draw(ctx) {
    this.particles.forEach(particle => particle.draw(ctx));
  }
}