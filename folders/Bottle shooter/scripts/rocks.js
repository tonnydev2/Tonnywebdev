import {restitution} from './main.js';
export class Rocks{
    constructor(canvas,ctx,x){
        this.canvas = canvas;
        this.x = x;
        this.y = this.canvas.height/2;
        this.radius = Math.random() * 5 + 25;
        this.color = 'orange';
        this.ctx = ctx;
        this.speedX = 1;
        this.speedY = 1;
        this.mass = 0.1 * this.radius;
        this.gravity = 0.5;
        this.restitution = 0.7;
        
    }
    draw(){
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2);
        this.ctx.fill();
    }
     update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        
        // Air resistance
        this.speedX *= 0.99;
        
        // Ground collision
        if (this.y + this.radius >= this.canvas.height) {
            this.y = this.canvas.height - this.radius;
            this.speedY *= -this.restitution;
            if (Math.abs(this.speedY) < 1.8) {
                this.speedY = 0;
                
            }
        }
    }
}

export function collision(ball1,ball2){
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    
    const dist = Math.hypot(dx,dy);
    if(dist <= ball1.radius + ball2.radius){
        const nx = dx/dist;
        const ny = dy/dist;
        
        const overlap = ((ball1.radius + ball2.radius) - dist);
        ball1.x += overlap * nx * 0.5;
        ball1.y += overlap * ny * 0.5;
        ball2.x -= overlap * nx * 0.5;
        ball2.y -= overlap * ny * 0.5;
        
        const relVelX = ball1.speedX - ball2.speedX;
        const relVelY = ball1.speedY - ball2.speedY;
        
        const relVelXn = relVelX * nx;
        const relVelYn = relVelY * ny;
        const relVel = relVelXn + relVelYn;
        const e = 0.8;
        if(relVel < 0){
        const impulse = -(1 + e) * relVel/(1/ ball1.mass + 1/ball2.mass);
        
        ball1.speedX = ball1.speedX + (impulse * nx)/ball1.mass;
        ball1.speedY = ball1.speedY + (impulse * ny)/ball1.mass;
        ball2.speedX = ball2.speedX - (impulse * nx)/ball2.mass;
        ball2.speedY = ball2.speedY - (impulse * ny)/ball2.mass;
        }
    };

}

