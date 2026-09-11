// bottles.js
export class Bottles {
    constructor(canvas, ctx, x, ground) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ground = ground;
        this.x = x;
        this.height = 60;
        this.y = this.ground.y - this.height;
        this.width = 30;
        this.image = bottleImg;
        this.color = '#00FF93';
        this.speedX = 0;
        this.speedY = 0;
        this.mass = 2;
        this.restitution = 0.3;
        this.isStatic = false;
        
        // Rotation physics
        this.angle = 0;
        this.angularVelocity = 0;
        this.angularDamping = 0.95;
        this.momentOfInertia = this.mass * (this.width * this.width + this.height * this.height) / 12;
        
        // State management
        this.isFallen = false;
        this.isStanding = true;
        this.isLeaning = false;
        this.stabilityThreshold = 0.2;
        this.fallenAngle = Math.PI / 2;
        this.timeStanding = 0;
        this.stableTimeRequired = 10;
        this.leanThreshold = 0.15;
        
        // For rendering and collision
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        
        // Bind methods
        this.getCenter = this.getCenter.bind(this);
        this.getClosestPointToCircle = this.getClosestPointToCircle.bind(this);
        this.getRotatedCorners = this.getRotatedCorners.bind(this);
        this.getBounds = this.getBounds.bind(this);
    }
    
    draw() {
        this.ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.angle);
        
        // Bottle body
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(-this.width/2,-this.height/2,this.width,this.height);
        this.ctx.drawImage(this.image,-this.width / 2, -this.height / 2, this.width, this.height);
        this.ctx.restore();
    }
    
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    getBounds() {
        const corners = this.getRotatedCorners();
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        corners.forEach(corner => {
            minX = Math.min(minX, corner.x);
            maxX = Math.max(maxX, corner.x);
            minY = Math.min(minY, corner.y);
            maxY = Math.max(maxY, corner.y);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            center: this.getCenter()
        };
    }
    
    getRotatedCorners() {
        const center = this.getCenter();
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        
        const corners = [
            { x: -this.halfWidth, y: -this.halfHeight },
            { x: this.halfWidth, y: -this.halfHeight },
            { x: this.halfWidth, y: this.halfHeight },
            { x: -this.halfWidth, y: this.halfHeight }
        ];
        
        return corners.map(corner => ({
            x: center.x + (corner.x * cos - corner.y * sin),
            y: center.y + (corner.x * sin + corner.y * cos)
        }));
    }
    
    getClosestPointToCircle(circleX, circleY) {
        const center = this.getCenter();
        const cos = Math.cos(-this.angle);
        const sin = Math.sin(-this.angle);
        
        const localX = (circleX - center.x) * cos - (circleY - center.y) * sin;
        const localY = (circleX - center.x) * sin + (circleY - center.y) * cos;
        
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        const closestX = Math.max(-halfW, Math.min(localX, halfW));
        const closestY = Math.max(-halfH, Math.min(localY, halfH));
        
        const worldX = center.x + (closestX * Math.cos(this.angle) - closestY * Math.sin(this.angle));
        const worldY = center.y + (closestX * Math.sin(this.angle) + closestY * Math.cos(this.angle));
        
        return { x: worldX, y: worldY, localX: closestX, localY: closestY };
    }
    
    onGround() {
        const bounds = this.getBounds();
        return (bounds.y + bounds.height >= this.ground.y && 
                bounds.y <= this.ground.y + this.ground.height && 
                bounds.x + bounds.width >= this.ground.x && 
                bounds.x <= this.ground.x + this.ground.width);
    }
    
        
    update() {
    // Apply gravity only if not on ground platform
    if (!this.onGround()) {
        this.speedY += 0.3;
    } else {
        this.speedY = 0;
    }
    
    // Apply velocities
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Check leaning state
    this.isLeaning = Math.abs(this.angle) > this.leanThreshold;
    
    // Handle rotation - ONLY if leaning or fallen
    if (!this.isFallen) {
        if (this.isLeaning || !this.onGround()) {
            this.angle += this.angularVelocity;
            this.angularVelocity *= this.angularDamping;
        } else {
            this.angularVelocity = 0;
        }
        
        if (Math.abs(this.angle) > this.stabilityThreshold) {
            this.isStanding = false;
            this.timeStanding = 0;
            
            if (Math.abs(this.angle) > this.fallenAngle * 0.8) {
                this.isFallen = true;
                this.angle = Math.sign(this.angle) * this.fallenAngle;
                this.angularVelocity = 0;
            }
        } else {
            this.timeStanding++;
            
            if (this.timeStanding > this.stableTimeRequired && this.onGround()) {
                this.isStanding = true;
                this.angle = 0;
                this.angularVelocity = 0;
            }
        }
    } else {
        this.angularVelocity = 0;
        if (Math.abs(this.angle) > this.fallenAngle) {
            this.angle = Math.sign(this.angle) * this.fallenAngle;
        }
    }
    
    // ========== CANVAS BOTTOM COLLISION ==========
    const bounds = this.getBounds();
    
    // Check if bottle is hitting the canvas bottom
    if (bounds.y + bounds.height >= this.canvas.height) {
        // Calculate penetration
        const penetration = (bounds.y + bounds.height) - this.canvas.height;
        
        // Push bottle up
        this.y -= penetration;
        
        // Bounce with energy loss
        this.speedY *= -this.restitution;
        
        // Apply friction when on ground
        this.speedX *= 0.95;
        
        // Stop if moving very slowly
        if (Math.abs(this.speedY) < 0.5) {
            this.speedY = 0;
        }
        
        // Add some stability when on bottom
        if (Math.abs(this.angle) < 0.3) {
            this.angularVelocity *= 0.9;
        }
        
        // If bottle is on its side, prevent sinking
        if (this.isFallen) {
            // Adjust rotation to lay flat on ground
            const targetAngle = Math.sign(this.angle) * this.fallenAngle;
            this.angle = this.angle * 0.8 + targetAngle * 0.2;
        }
    }
    
    // ========== CANVAS LEFT/RIGHT WALL COLLISION ==========
    if (bounds.x < 0) {
        const penetration = -bounds.x;
        this.x += penetration;
        this.speedX *= -this.restitution * 0.5; // Reduced bounce for walls
    }
    
    if (bounds.x + bounds.width > this.canvas.width) {
        const penetration = (bounds.x + bounds.width) - this.canvas.width;
        this.x -= penetration;
        this.speedX *= -this.restitution * 0.5;
    }
    
    // ========== CANVAS TOP COLLISION (rare but possible) ==========
    if (bounds.y < 0) {
        const penetration = -bounds.y;
        this.y += penetration;
        this.speedY *= -this.restitution * 0.3;
    }
    
    // Friction on ground platform
    if (this.onGround()) {
        this.speedX *= 0.98;
        if (Math.abs(this.speedX) < 0.1) this.speedX = 0;
        
        if (this.isLeaning) {
            this.angularVelocity *= 0.95;
        }
        
        if (this.isStanding && Math.abs(this.angularVelocity) < 0.005) {
            this.angularVelocity = 0;
            this.angle = 0;
        }
    }
    
    // Air resistance
    if (!this.onGround() && bounds.y + bounds.height < this.canvas.height - 10) {
        this.speedX *= 0.995;
    }
    
    // Prevent bottles from going too far off-screen (cleanup)
    if (bounds.y > this.canvas.height + 100) {
        // Bottle is way below screen, clamp it
        this.y = this.canvas.height - this.height;
        this.speedY = 0;
    }
}        
}

// Ball vs Rectangle collision
export function collisionBallRect(ball, rect) {
    if (!rect.getCenter || !rect.getClosestPointToCircle) {
        return false;
    }
    
    const center = rect.getCenter();
    const closest = rect.getClosestPointToCircle(ball.x, ball.y);
    
    const dx = ball.x - closest.x;
    const dy = ball.y - closest.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < ball.radius && distance > 0.001) {
        const nx = dx / distance;
        const ny = dy / distance;
        
        const collisionPoint = { x: closest.x, y: closest.y };
        const r1x = collisionPoint.x - center.x;
        const r1y = collisionPoint.y - center.y;
        
        const rectVelAtPoint = {
            x: (rect.speedX || 0) - (rect.angularVelocity || 0) * r1y,
            y: (rect.speedY || 0) + (rect.angularVelocity || 0) * r1x
        };
        
        const vrelX = ball.speedX - rectVelAtPoint.x;
        const vrelY = ball.speedY - rectVelAtPoint.y;
        const vrelDotN = vrelX * nx + vrelY * ny;
        
        if (vrelDotN < 0) {
            const e = 0.5;
            const r1CrossN = r1x * ny - r1y * nx;
            let invMassSum = (1/ball.mass) + (1/rect.mass);
            
            if (!rect.isFallen) {
                invMassSum += (r1CrossN * r1CrossN) / rect.momentOfInertia;
            }
            
            const j = -(1 + e) * vrelDotN / invMassSum;
            
            ball.speedX += (j * nx) / ball.mass;
            ball.speedY += (j * ny) / ball.mass;
            
            if (!rect.isStatic) {
                rect.speedX -= (j * nx) / rect.mass;
                rect.speedY -= (j * ny) / rect.mass;
                
                if (!rect.isFallen) {
                    rect.angularVelocity -= (j * r1CrossN) / rect.momentOfInertia;
                    
                    const hitHeight = closest.localY;
                    if (hitHeight < -rect.height * 0.3) {
                        rect.angularVelocity *= 1.5;
                        rect.isLeaning = true;
                    }
                }
            }
        }
        
        const overlap = ball.radius - distance;
        const correctionX = nx * overlap;
        const correctionY = ny * overlap;
        
        if (!rect.isStatic) {
            const totalMass = ball.mass + rect.mass;
            const ballRatio = rect.mass / totalMass;
            const rectRatio = ball.mass / totalMass;
            
            ball.x += correctionX * ballRatio;
            ball.y += correctionY * ballRatio;
            rect.x -= correctionX * rectRatio;
            rect.y -= correctionY * rectRatio;
        } else {
            ball.x += correctionX;
            ball.y += correctionY;
        }
        
        return true;
    }
    return false;
}

// Fixed Rectangle vs Rectangle collision using SAT
export function collisionWithRect(rect1, rect2) {
    if (!rect1 || !rect2) return false;
    if (!rect1.getRotatedCorners || !rect2.getRotatedCorners) return false;
    
    const corners1 = rect1.getRotatedCorners();
    const corners2 = rect2.getRotatedCorners();
    
    // Build axes from edges
    const axes = [];
    
    // Helper to add perpendicular axis
    const addAxis = (p1, p2) => {
        const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
        const length = Math.hypot(edge.x, edge.y);
        if (length > 0.001) {
            axes.push({ x: -edge.y / length, y: edge.x / length });
        }
    };
    
    // Add normals from rect1 edges
    for (let i = 0; i < 4; i++) {
        addAxis(corners1[i], corners1[(i + 1) % 4]);
    }
    
    // Add normals from rect2 edges
    for (let i = 0; i < 4; i++) {
        addAxis(corners2[i], corners2[(i + 1) % 4]);
    }
    
    let minOverlap = Infinity;
    let collisionNormal = { x: 0, y: 0 };
    
    // Check each axis for overlap
    for (let axis of axes) {
        let min1 = Infinity, max1 = -Infinity;
        let min2 = Infinity, max2 = -Infinity;
        
        corners1.forEach(corner => {
            const proj = corner.x * axis.x + corner.y * axis.y;
            min1 = Math.min(min1, proj);
            max1 = Math.max(max1, proj);
        });
        
        corners2.forEach(corner => {
            const proj = corner.x * axis.x + corner.y * axis.y;
            min2 = Math.min(min2, proj);
            max2 = Math.max(max2, proj);
        });
        
        const overlap = Math.min(max1, max2) - Math.max(min1, min2);
        
        if (overlap <= 0.001) {
            return false; // No collision on this axis
        }
        
        if (overlap < minOverlap) {
            minOverlap = overlap;
            collisionNormal = axis;
        }
    }
    
    // Ensure normal points from rect1 to rect2
    const center1 = rect1.getCenter();
    const center2 = rect2.getCenter();
    const dirX = center2.x - center1.x;
    const dirY = center2.y - center1.y;
    
    if (dirX * collisionNormal.x + dirY * collisionNormal.y < 0) {
        collisionNormal.x = -collisionNormal.x;
        collisionNormal.y = -collisionNormal.y;
    }
    
    // Position correction - separate the bottles
    const correction = minOverlap * 0.5;
    
    if (!rect1.isStatic) {
        rect1.x -= collisionNormal.x * correction;
        rect1.y -= collisionNormal.y * correction;
    }
    
    if (!rect2.isStatic) {
        rect2.x += collisionNormal.x * correction;
        rect2.y += collisionNormal.y * correction;
    }
    
    // Velocity response
    const vrelX = (rect2.speedX || 0) - (rect1.speedX || 0);
    const vrelY = (rect2.speedY || 0) - (rect1.speedY || 0);
    const vrelDotN = vrelX * collisionNormal.x + vrelY * collisionNormal.y;
    
    if (vrelDotN < 0) {
        const e = Math.min(rect1.restitution || 0.3, rect2.restitution || 0.3);
        let denominator = 0;
        
        if (!rect1.isStatic) denominator += 1/rect1.mass;
        if (!rect2.isStatic) denominator += 1/rect2.mass;
        
        if (denominator > 0) {
            const impulse = -(1 + e) * vrelDotN / denominator;
            
            if (!rect1.isStatic) {
                rect1.speedX -= impulse * collisionNormal.x / rect1.mass;
                rect1.speedY -= impulse * collisionNormal.y / rect1.mass;
                
                // Add rotational effect on collision
                const impactPoint = {
                    x: center1.x - collisionNormal.x * rect1.width/2,
                    y: center1.y - collisionNormal.y * rect1.height/2
                };
                const rx = impactPoint.x - center1.x;
                const ry = impactPoint.y - center1.y;
                const torque = rx * collisionNormal.y - ry * collisionNormal.x;
                
                if (!rect1.isFallen) {
                    rect1.angularVelocity += torque * impulse / rect1.momentOfInertia * 0.1;
                    if (Math.abs(rect1.angularVelocity) > 0.01) {
                        rect1.isLeaning = true;
                    }
                }
            }
            
            if (!rect2.isStatic) {
                rect2.speedX += impulse * collisionNormal.x / rect2.mass;
                rect2.speedY += impulse * collisionNormal.y / rect2.mass;
                
                const impactPoint = {
                    x: center2.x + collisionNormal.x * rect2.width/2,
                    y: center2.y + collisionNormal.y * rect2.height/2
                };
                const rx = impactPoint.x - center2.x;
                const ry = impactPoint.y - center2.y;
                const torque = rx * (-collisionNormal.y) - ry * (-collisionNormal.x);
                
                if (!rect2.isFallen) {
                    rect2.angularVelocity += torque * impulse / rect2.momentOfInertia * 0.1;
                    if (Math.abs(rect2.angularVelocity) > 0.01) {
                        rect2.isLeaning = true;
                    }
                }
            }
        }
    }
    
    return true;
}