 export class CueStick {
    constructor() {
        // Cue stick properties
        this.x = 0;
        this.y = 0;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.length = 100;
        this.thickness = 8;
        this.color = '#8B4513'; // Brown wood color
        this.tipColor = '#D2691E'; // Slightly lighter brown for tip
        this.tipRadius = 10;
        
        // Drag state
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.currentBall = null;
        
        // Power calculation
        this.maxPower = 20;
        this.power = 0;
        
        // Bind methods for event listeners
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Initialize event listeners
        this.initializeEvents();
    }
    
    initializeEvents() {
        // Mouse events
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        
        // Touch events
        document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd);
        document.addEventListener('touchcancel', this.handleTouchEnd);
    }
    
    // Mouse event handlers
    handleMouseDown(event) {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.startDragging(x, y);
    }
    
    handleMouseMove(event) {
        if (!this.isDragging) return;
        
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.updateDrag(x, y);
    }
    
    handleMouseUp(event) {
        if (!this.isDragging) return;
        
        event.preventDefault();
        this.release();
    }
    
    // Touch event handlers
    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length !== 1) return;
        
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.startDragging(x, y);
    }
    
    handleTouchMove(event) {
        if (!this.isDragging || event.touches.length !== 1) return;
        
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.updateDrag(x, y);
    }
    
    handleTouchEnd(event) {
        if (!this.isDragging) return;
        
        event.preventDefault();
        this.release();
    }
    
    // Common drag logic
    startDragging(x, y) {
        // Find if we're clicking near a ball
        this.currentBall = this.findNearestBall(x, y);
        
        if (this.currentBall) {
            this.isDragging = true;
            this.dragStartX = x;
            this.dragStartY = y;
            this.x = this.currentBall.x;
            this.y = this.currentBall.y;
            this.updateCuePosition(x, y);
        }
    }
    
    updateDrag(x, y) {
        if (!this.currentBall) return;
        
        this.updateCuePosition(x, y);
        
        // Calculate power based on drag distance
        const dx = x - this.dragStartX;
        const dy = y - this.dragStartY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Power increases with distance, capped at maxPower
        this.power = Math.min(distance / 10, this.maxPower);
    }
    
    release() {
        if (!this.currentBall || !this.isDragging) return;
        
        if (this.power > 0.5) { // Minimum power threshold
            // Calculate direction vector from drag end to start (pulling back then releasing)
            const dx = this.dragStartX - this.endX;
            const dy = this.dragStartY - this.endY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Apply velocity to the ball
                this.currentBall.velocityX = (dx / distance) * this.power;
                this.currentBall.velocityY = (dy / distance) * this.power;
                
                console.log(`Shot ball with power: ${this.power.toFixed(2)}, velocity: (${this.currentBall.velocityX.toFixed(2)}, ${this.currentBall.velocityY.toFixed(2)})`);
            }
        }
        
        // Reset cue stick
        this.reset();
    }
    
    updateCuePosition(x, y) {
        if (!this.currentBall) return;
        
        this.endX = x;
        this.endY = y;
        
        // Calculate angle from ball to drag point
        const dx = this.currentBall.x - x;
        const dy = this.currentBall.y - y;
        const angle = Math.atan2(dy, dx);
        
        // Calculate cue stick start position (opposite direction from drag)
        this.startX = this.currentBall.x + Math.cos(angle) * this.length;
        this.startY = this.currentBall.y + Math.sin(angle) * this.length;
    }
    
    findNearestBall(x, y, balls) {
        if (!balls || balls.length === 0) return null;
        
        let nearestBall = null;
        let minDistance = Infinity;
        
        for (const ball of balls) {
            const dx = ball.x - x;
            const dy = ball.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If click is within ball radius + some margin
            if (distance < ball.radius + 20 && distance < minDistance) {
                minDistance = distance;
                nearestBall = ball;
            }
        }
        
        return nearestBall;
    }
    
    setCurrentBall(ball) {
        this.currentBall = ball;
        if (ball) {
            this.x = ball.x;
            this.y = ball.y;
            this.isDragging = true;
        }
    }
    
    update(balls) {
        // If we're not dragging but have a current ball, update position
        if (this.currentBall && !this.isDragging) {
            this.x = this.currentBall.x;
            this.y = this.currentBall.y;
        }
        
        // Find nearest ball for initial targeting
        if (!this.currentBall && balls) {
            // Optional: Auto-target the nearest ball to mouse position
            // This can be enabled if you want auto-aim
        }
    }
    
    draw(ctx) {
        if (!this.currentBall || !this.isDragging) return;
        
        ctx.save();
        
        // Draw cue stick line
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color;
        ctx.stroke();
        
        // Draw cue tip (at the end that touches the ball)
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, this.tipRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.tipColor;
        ctx.fill();
        
        // Draw power indicator (visual feedback)
        if (this.power > 0) {
            const powerPercentage = this.power / this.maxPower;
            
            // Draw power bar
            ctx.fillStyle = this.getPowerColor(powerPercentage);
            ctx.fillRect(
                this.endX - 20, 
                this.endY - 30, 
                40 * powerPercentage, 
                10
            );
            
            // Draw power text
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `Power: ${this.power.toFixed(1)}`, 
                this.endX, 
                this.endY - 40
            );
        }
        
        // Draw aim line (dashed line showing direction)
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(this.currentBall.x, this.currentBall.y);
        const dx = this.currentBall.x - this.endX;
        const dy = this.currentBall.y - this.endY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const extendX = this.currentBall.x + (dx / distance) * 50;
        const extendY = this.currentBall.y + (dy / distance) * 50;
        ctx.lineTo(extendX, extendY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.restore();
    }
    
    getPowerColor(powerPercentage) {
        // Green (low power) -> Yellow -> Red (high power)
        if (powerPercentage < 0.3) return '#4CAF50'; // Green
        if (powerPercentage < 0.7) return '#FFC107'; // Yellow
        return '#F44336'; // Red
    }
    
    reset() {
        this.isDragging = false;
        this.currentBall = null;
        this.power = 0;
        this.dragStartX = 0;
        this.dragStartY = 0;
    }
    
    // Cleanup method to remove event listeners
    destroy() {
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
        document.removeEventListener('touchcancel', this.handleTouchEnd);
    }
}6