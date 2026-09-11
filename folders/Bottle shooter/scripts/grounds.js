export class Grounds {
    constructor(canvas, ctx, x, y) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 25;
        this.color = '#27ae60';
        this.speedX = 0;
        this.speedY = 0;
        this.mass = 20;
        this.isStatic = true;
        this.angle = 0;
    }
    
    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Wood texture lines
        this.ctx.strokeStyle = '#1e8449';
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 5, this.y + 5);
        this.ctx.lineTo(this.x + this.width - 5, this.y + 5);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 5, this.y + this.height - 5);
        this.ctx.lineTo(this.x + this.width - 5, this.y + this.height - 5);
        this.ctx.stroke();
    }
    
    getCenter() {
        return { x: this.x + this.width/2, y: this.y + this.height/2 };
    }
    
    getClosestPointToCircle(circleX, circleY) {
        const center = this.getCenter();
        const cos = Math.cos(-this.angle);
        const sin = Math.sin(-this.angle);
        
        const localX = (circleX - center.x) * cos - (circleY - center.y) * sin;
        const localY = (circleX - center.x) * sin + (circleY - center.y) * cos;
        
        const halfW = this.width/2;
        const halfH = this.height/2;
        const closestX = Math.max(-halfW, Math.min(localX, halfW));
        const closestY = Math.max(-halfH, Math.min(localY, halfH));
        
        const worldX = center.x + (closestX * Math.cos(this.angle) - closestY * Math.sin(this.angle));
        const worldY = center.y + (closestX * Math.sin(this.angle) + closestY * Math.cos(this.angle));
        
        return { x: worldX, y: worldY, localX: closestX, localY: closestY };
    }
}