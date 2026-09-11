import { canvas, ctx, catap, updateHUD } from './main.js';
export class Ball {
    constructor(canvas) {
        this.x = catap.x + catap.width/2;
        this.y = catap.y - 20;
        this.radius = 18;
        this.color = '#e74c3c';
        this.origX = this.x;
        this.origY = this.y;
        this.speedY = 0;
        this.speedX = 0;
        this.gravity = 0.5;
        this.isDragging = false;
        this.launched = false;
        this.isOnGround = false;
        this.isOnCatap = true;
        this.mass = 2;
        this.trajectory = [];
        this.restitution = 0.6;
        this.stopped = false;
        this.creationTime = Date.now();
        this.shouldRemove = false;
        this.fadeAlpha = 1.0;
    }
    
    draw() {
        // Handle fading out
        if (this.shouldRemove) {
            this.fadeAlpha *= 0.95;
            if (this.fadeAlpha < 0.05) {
                return; // Don't draw when almost invisible
            }
        }
        
        ctx.save();
        ctx.globalAlpha = this.fadeAlpha;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        if (this.isDragging && !this.launched) {
            ctx.beginPath();
            ctx.strokeStyle = "#f1c40f";
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.moveTo(this.origX, this.origY);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
            
            drawTrajectory(this);
        }
        ctx.restore();
    }
    
    update() {
        if (this.shouldRemove) return;
        
        if (!this.isDragging && !this.isOnCatap) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity;
        }
        
        // Only bottom edge collision
        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius;
            this.speedY *= -this.restitution;
            if (Math.abs(this.speedY) < 2) this.speedY = 0;
        }
        // Check if ball has stopped
        if (!this.isDragging && !this.isOnCatap && this.launched &&
            Math.abs(this.speedX) < 0.5 && Math.abs(this.speedY) < 0.5 && 
            this.y + this.radius >= canvas.height - 5) {
            this.stopped = true;
            
            // Mark for removal after a long delay (8 seconds)
            const timeSinceCreation = Date.now() - this.creationTime;
            if (timeSinceCreation > 8000 && this.launched) {
                this.shouldRemove = true;
            }
        }
    }
    reset() {
        this.x = catap.x + catap.width/2;
        this.y = catap.y - 20;
        this.speedX = 0;
        this.speedY = 0;
        this.isOnCatap = true;
        this.launched = false;
        this.trajectory = [];
        this.stopped = false;
        this.shouldRemove = false;
        this.fadeAlpha = 1.0;
        this.creationTime = Date.now();
    }
}
export function drawTrajectory(ball) {
    if (!ball.isDragging) return;
    
    ball.trajectory = [];
    let simX = ball.x;
    let simY = ball.y;
    const vel = calculateBallVel(ball);
    let simSpeedX = vel.vx;
    let simSpeedY = vel.vy;
    
    for (let i = 0; i < 40; i++) {
        simSpeedY += ball.gravity;
        simX += simSpeedX;
        simY += simSpeedY;
        
        if (simY + ball.radius > canvas.height) {
            ball.trajectory.push({ x: simX, y: canvas.height - ball.radius });
            break;
        }
        
        ball.trajectory.push({ x: simX, y: simY });
    }
    
    if (ball.trajectory.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.7)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(ball.x, ball.y);
        
        ball.trajectory.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
export function launchBall(ball) {
    if (!ball.isDragging) return;
    
    const vel = calculateBallVel(ball);
    ball.speedX = vel.vx;
    ball.speedY = vel.vy;
    ball.isDragging = false;
    ball.launched = true;
    ball.isOnCatap = false;
    ball.trajectory = [];
    updateHUD();
}
export function calculateBallVel(ball) {
    const maxSpeed = 28;
    const dragFactor = 0.18;
    const dragX = ball.x - ball.origX;
    const dragY = ball.y - ball.origY;
    
    const launchX = -dragX;
    const launchY = -dragY;
    
    const dist = Math.hypot(launchX, launchY);
    if (dist > 1) {
        const nx = launchX / dist;
        const ny = launchY / dist;
        const speed = Math.min(dist * dragFactor, maxSpeed);
        return { vx: nx * speed, vy: ny * speed };
    }
    return { vx: 0, vy: 0 };
}
export function dragBall(ball,x,y) {
    const maxDragDist = 150;
    const center = { x: ball.origX, y: ball.origY };
    const dx = x - center.x;
    const dy = y - center.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist > maxDragDist) {
        const angle = Math.atan2(dy, dx);
        ball.x = center.x + Math.cos(angle) * maxDragDist;
        ball.y = center.y + Math.sin(angle) * maxDragDist;
    } else {
        ball.x = x;
        ball.y = y;
    }
}

