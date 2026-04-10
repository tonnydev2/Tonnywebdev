export class PoolTable {
    constructor(image) {
        this.width = 300;
        this.height = 550;
        this.x = 25;
        this.y = 50;
        this.cushion = 35;
        this.image = image;
    }
    
    draw(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback if image is not loaded
            ctx.fillStyle = '#1a5';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

