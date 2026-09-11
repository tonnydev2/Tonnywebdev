const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 350;
canvas.height = 500;

class Ball {
    constructor() {
        this.x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
        this.y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
        this.radius = 15;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.mass = 1;
        this.fadeAlpha = 1;
        
        // Colors for gradient
        const colors = ['#ff3333', '#3366ff', '#ffcc00', '#33cc33', '#ff66cc'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.darkColor = this.adjustColor(this.color, -30);
        
        // Rolling animation
        this.rotationAngle = 0;
        this.rotationSpeed = 0.1;
    }
    
    adjustColor(color, percent) {
        // Simple color darkening
        return color;
    }
    
    draw() {
        ctx.save();
        
        // Calculate 3D shadow position
        const shadowOffsetY = this.radius * 0.4;
        const shadowScale = 0.8 + (this.y / canvas.height) * 0.4;
        
        // Draw drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x, 
            this.y + shadowOffsetY,
            this.radius * shadowScale, 
            this.radius * 0.3, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Create 3D sphere gradient
        const highlightX = this.x - this.radius * 0.3;
        const highlightY = this.y - this.radius * 0.3;
        const gradient = ctx.createRadialGradient(
            highlightX, highlightY, this.radius * 0.2,
            this.x + this.radius * 0.2, this.y + this.radius * 0.2, this.radius * 1.2
        );
        
        // Perspective-based brightness
        const brightness = 0.6 + (this.y / canvas.height) * 0.4;
        gradient.addColorStop(0, this.lightenColor(this.color, 30));
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 40));
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = this.fadeAlpha;
        
        // Draw ball
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Specular highlight
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.3, 
            this.y - this.radius * 0.3, 
            this.radius * 0.2, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Secondary reflection
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(
            this.x + this.radius * 0.1, 
            this.y + this.radius * 0.2, 
            this.radius * 0.15, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
    
    lightenColor(color, percent) {
        // Simple placeholder - you can implement actual color manipulation
        return color;
    }
    
    darkenColor(color, percent) {
        return color;
    }
    
    update() {
        // 3D Perspective: Size based on Y position
        this.radius = Math.max(8, Math.min(25, (this.y / canvas.height) * 20 + 8));
        
        // Speed scaling for perspective (objects appear slower when far)
        const speedScale = 0.5 + (this.y / canvas.height) * 0.8;
        
        // Apply movement with perspective scaling
        this.x += this.speedX * speedScale;
        this.y += this.speedY * speedScale;
        
        // Fade alpha based on distance
        this.fadeAlpha = 0.6 + (this.y / canvas.height) * 0.4;
        
        // Add slight deceleration for realism
        this.speedX *= 0.999;
        this.speedY *= 0.999;
        
        // Prevent complete stop
        const minSpeed = 0.5;
        const currentSpeed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
        if (currentSpeed < minSpeed && currentSpeed > 0) {
            this.speedX = (this.speedX / currentSpeed) * minSpeed;
            this.speedY = (this.speedY / currentSpeed) * minSpeed;
        }
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.color = '#8B6914';
    }
    
    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        
        // Draw rail shadow for 3D effect
        ctx.strokeStyle = '#5a4510';
        ctx.lineWidth = 2;
        ctx.moveTo(this.x1, this.y1 + 2);
        ctx.lineTo(this.x2, this.y2 + 2);
        ctx.stroke();
    }
}

function drawTable() {
    // Draw table surface with gradient for depth
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a4a2a');
    gradient.addColorStop(0.5, '#2a6a3a');
    gradient.addColorStop(1, '#3a8a4a');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.2, 0);
    ctx.lineTo(canvas.width * 0.8, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw perspective grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for(let i = 1; i < 6; i++) {
        const y = canvas.height * (i / 6);
        const reduction = 0.3 * (1 - y / canvas.height);
        const leftX = canvas.width * (0.2 + reduction);
        const rightX = canvas.width * (0.8 - reduction);
        
        ctx.beginPath();
        ctx.moveTo(leftX, y);
        ctx.lineTo(rightX, y);
        ctx.stroke();
    }
    
    // Vertical perspective lines
    for(let i = 1; i < 4; i++) {
        const factor = i / 4;
        const topX = canvas.width * (0.2 + factor * 0.6);
        const bottomX = canvas.width * factor;
        
        ctx.beginPath();
        ctx.moveTo(topX, 0);
        ctx.lineTo(bottomX, canvas.height);
        ctx.stroke();
    }
}

const balls = [];
for(let i = 0; i < 5; i++) {
    balls.push(new Ball());
}

const lines = [
    new Line(0.2 * canvas.width, 0, 0, canvas.height),
    new Line(0.2 * canvas.width, 0, 0.8 * canvas.width, 0),
    new Line(0.8 * canvas.width, 0, canvas.width, canvas.height),
    new Line(0, canvas.height, canvas.width, canvas.height)
];

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawTable();
    
    balls.forEach(ball => {
        lines.forEach(line => {
            line.draw();
            reflectBallFromLine(ball, line);
        });
        ball.draw();
        ball.update();
    });
    
    for(let i = 0; i < balls.length; i++) {
        for(let j = i + 1; j < balls.length; j++) {
            collisionBallRock(balls[i], balls[j]);
        }
    }
    
    requestAnimationFrame(animate);
}

animate();

// Keep your existing reflectBallFromLine and collisionBallRock functions
// They work perfectly with the 3D modifications!

function reflectBallFromLine(ball, line) {
    // Extract ball properties
    const { x, y, radius, speedX, speedY } = ball;
    
    // Extract line properties
    const { x1, y1, x2, y2 } = line;
    
    // Calculate line vector
    const lineVecX = x2 - x1;
    const lineVecY = y2 - y1;
    
    // Calculate line length
    const lineLength = Math.sqrt(lineVecX * lineVecX + lineVecY * lineVecY);
    
    // If line has zero length, no collision possible
    if (lineLength === 0) return false;
    
    // Normalize line vector
    const lineNormX = lineVecX / lineLength;
    const lineNormY = lineVecY / lineLength;
    
    // Vector from line start to ball center
    const ballToLineX = x - x1;
    const ballToLineY = y - y1;
    
    // Project ball-to-line vector onto line vector
    const projectionLength = ballToLineX * lineNormX + ballToLineY * lineNormY;
    
    // Clamp projection to line segment
    const clampedProjection = Math.max(0, Math.min(lineLength, projectionLength));
    
    // Find closest point on line segment to ball center
    const closestX = x1 + lineNormX * clampedProjection;
    const closestY = y1 + lineNormY * clampedProjection;
    
    // Calculate distance from ball center to closest point on line
    const distanceX = x - closestX;
    const distanceY = y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    // Check if ball is colliding with line (distance <= radius)
    if (distance > radius) return false;
    
    // Calculate normal vector to the line (perpendicular to line direction)
    let normalX, normalY;
    
    // For a perfectly horizontal or vertical line, we can use simple normals
    if (Math.abs(lineVecY) < 0.001) { // Horizontal line
        normalX = 0;
        normalY = y1 < y2 ? -1 : 1;
    } else if (Math.abs(lineVecX) < 0.001) { // Vertical line
        normalX = x1 < x2 ? -1 : 1;
        normalY = 0;
    } else {
        // General case: normal is perpendicular to line direction
        normalX = -lineVecY;
        normalY = lineVecX;
    }
    
    // Normalize the normal vector
    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
    normalX /= normalLength;
    normalY /= normalLength;
    
    // Ensure normal points away from the line (toward the ball)
    const dot = (x - closestX) * normalX + (y - closestY) * normalY;
    if (dot < 0) {
        normalX = -normalX;
        normalY = -normalY;
    }
    
    // Calculate dot product of velocity and normal
    const dotProduct = speedX * normalX + speedY * normalY;
    
    // Reflect velocity vector: v' = v - 2*(v·n)*n
    const reflectionX = speedX - 2 * dotProduct * normalX;
    const reflectionY = speedY - 2 * dotProduct * normalY;
    
    // Update ball velocity with reflection
    ball.speedX = reflectionX;
    ball.speedY = reflectionY;
    
    // Move ball outside collision to prevent sticking
    const overlap = radius - distance;
    ball.x += normalX * overlap * 1.1; // 10% extra to ensure separation
    ball.y += normalY * overlap * 1.1;
    
    return true;
}
function collisionBallRock(ball, rock) {
    const dx = ball.x - rock.x;
    const dy = ball.y - rock.y;
    const distance = Math.hypot(dx, dy);
    const minDist = ball.radius + rock.radius;
    
    if (distance < minDist && distance > 0.001) {
        const nx = dx / distance;
        const ny = dy / distance;
        
        const vRelX = ball.speedX - rock.speedX;
        const vRelY = ball.speedY - rock.speedY;
        const vRelDotN = vRelX * nx + vRelY * ny;
        
        if (vRelDotN < 0) {
            const e = 0.5;
            const impulse = -(1 + e) * vRelDotN / (1/ball.mass + 1/rock.mass);
            ball.speedX += (impulse * nx) / ball.mass;
            ball.speedY += (impulse * ny) / ball.mass;
            rock.speedX -= (impulse * nx) / rock.mass;
            rock.speedY -= (impulse * ny) / rock.mass;
        }
        
        const overlap = minDist - distance;
        const correctionX = nx * overlap * 0.5;
        const correctionY = ny * overlap * 0.5;
        ball.x += correctionX;
        ball.y += correctionY;
        rock.x -= correctionX;
        rock.y -= correctionY;
        return true;
    }
    return false;
}

