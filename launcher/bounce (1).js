 const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');

// Get slider elements
const gravitySlider = document.getElementById('gravitySlider');
const restitutionSlider = document.getElementById('restitutionSlider');
const airResistanceSlider = document.getElementById('airResistanceSlider');

// Get value display elements
const gravityValue = document.getElementById('gravityValue');
const restitutionValue = document.getElementById('restitutionValue');
const airResistanceValue = document.getElementById('airResistanceValue');

// Ball 1 (Blue) - Draggable with touch
const ball1 = {
    x: 100,
    y: 100,
    radius: 25,
    velocityX: 4,
    velocityY: 0,
    color: '#4cc9f0',
    name: 'Blue Ball',
    isDragging: false
};

// Ball 2 (Green) - Perfectly elastic (restitution = 1.0)
const ball2 = {
    x: 300,
    y: 100,
    radius: 25,
    velocityX: -4,
    velocityY: 0,
    color: '#4ade80',
    name: 'Green Ball (Elastic)',
    isDragging: false
};

// Physics parameters with initial values
let gravity = 0.5;
let restitution = 0.8;
let airResistance = 0.01;

// Update display values
gravityValue.textContent = gravity;
restitutionValue.textContent = restitution;
airResistanceValue.textContent = airResistance;

// Event listeners for sliders
gravitySlider.addEventListener('input', function() {
    gravity = parseFloat(this.value);
    gravityValue.textContent = gravity;
});

restitutionSlider.addEventListener('input', function() {
    restitution = parseFloat(this.value);
    restitutionValue.textContent = restitution;
});

airResistanceSlider.addEventListener('input', function() {
    airResistance = parseFloat(this.value);
    airResistanceValue.textContent = airResistance;
});

// Function to draw a ball
function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    
    // Create gradient for the ball
    const gradient = ctx.createRadialGradient(
        ball.x - 10, ball.y - 10, 5,
        ball.x, ball.y, ball.radius
    );
    
    if (ball.color === '#4cc9f0') {
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, ball.color);
        gradient.addColorStop(1, '#1e3a8a');
    } else {
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, ball.color);
        gradient.addColorStop(1, '#166534');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add highlight to the ball
    ctx.beginPath();
    ctx.arc(ball.x - 8, ball.y - 8, ball.radius / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
    
    // Draw ball outline (thicker if being dragged)
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.strokeStyle = ball.color === '#4cc9f0' ? '#1e3a8a' : '#166534';
    ctx.lineWidth = ball.isDragging ? 4 : 2;
    ctx.stroke();
    
    // Draw ball label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(ball.name, ball.x, ball.y - ball.radius - 10);
}

// Function to draw the ground
function drawGround() {
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Add texture to ground
    ctx.fillStyle = '#4a5568';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - 20, 10, 5);
    }
}

// Enhanced drag function that sets initial velocity
function drag(ball) {
    const rect = canvas.getBoundingClientRect();
    let isDragging = false;
    let lastX, lastY;
    let lastTime;
    
    // Touchstart event
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        
        // Check if touch is within the ball
        const dx = touchX - ball.x;
        const dy = touchY - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= ball.radius) {
            ball.x = touchX;
            ball.y = touchY;
            ball.isDragging = true;
            isDragging = true;
            lastX = touchX;
            lastY = touchY;
            lastTime = Date.now();
            
            // Reset velocity when starting to drag
            ball.velocityX = 0;
            ball.velocityY = 0;
            
            console.log(`Started dragging ${ball.name}`);
        }
    }, { passive: false });
    
    // Touchmove event
    canvas.addEventListener('touchmove', (e) => {
        
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        
        ball.x = touchX;
        ball.y = touchY;
        
        // Calculate velocity based on movement
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > 0) {
            ball.velocityX = (touchX - lastX) / (deltaTime / 16.67); // Normalize to 60fps
            ball.velocityY = (touchY - lastY) / (deltaTime / 16.67);
        }
        
        lastX = touchX;
        lastY = touchY;
        lastTime = currentTime;
    }, { passive: false });
    
    // Touchend event
    canvas.addEventListener('touchend', (e) => {
        if (ball.isDragging) {
            console.log(`Drag ended on ${ball.name} - Final velocity:`, 
                       `(${ball.velocityX.toFixed(2)}, ${ball.velocityY.toFixed(2)})`);
            ball.isDragging = false;
            isDragging = false;
        }
    });
    
    // Touchcancel event
    canvas.addEventListener('touchcancel', (e) => {
        if (ball.isDragging) {
            console.log(`Drag cancelled on ${ball.name}`);
            ball.isDragging = false;
            isDragging = false;
        }
    });
    
    // Mousedown event for desktop
    canvas.addEventListener('mousedown', (e) => {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const dx = mouseX - ball.x;
        const dy = mouseY - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
            ball.x = mouseX;
            ball.y = mouseY;
            ball.isDragging = true;
            isDragging = true;
            lastX = mouseX;
            lastY = mouseY;
            lastTime = Date.now();
            
            ball.velocityX = 0;
            ball.velocityY = 0;
            
            console.log(`Started dragging ${ball.name} with mouse`);
        
    });
    
    // Mousemove event for desktop
    canvas.addEventListener('mousemove', (e) => {
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        ball.x = mouseX;
        ball.y = mouseY;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > 0) {
            ball.velocityX = (mouseX - lastX) / (deltaTime / 16.67);
            ball.velocityY = (mouseY - lastY) / (deltaTime / 16.67);
        }
        
        lastX = mouseX;
        lastY = mouseY;
        lastTime = currentTime;
    });
    
    // Mouseup event for desktop
    canvas.addEventListener('mouseup', (e) => {
        if (ball.isDragging) {
            console.log(`Mouse drag ended on ${ball.name} - Final velocity:`, 
                       `(${ball.velocityX.toFixed(2)}, ${ball.velocityY.toFixed(2)})`);
            ball.isDragging = false;
            isDragging = false;
        }
    });
}

// Function to handle ball-to-ball collision
function handleBallCollision(ballA, ballB) {
    // Calculate distance between balls
    const dx = ballB.x - ballA.x;
    const dy = ballB.y - ballA.y; 
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if balls are colliding
    if (distance < ballA.radius + ballB.radius && distance > 0) {
        // Calculate collision normal
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate relative velocity
        const dvx = ballB.velocityX - ballA.velocityX;
        const dvy = ballB.velocityY - ballA.velocityY;
        
        // Calculate relative velocity along the normal
        const speed = dvx * nx + dvy * ny;
        
        // Only resolve if balls are moving towards each other
        if (speed < 0) {
            // Calculate impulse (using restitution average for mixed collisions)
            const avgRestitution = (restitution + 1.0) / 2;
            const impulse = 2 * speed / (1 + 1); // Assuming equal mass (1)
            
            // Apply impulse to velocities
            ballA.velocityX += impulse * nx * avgRestitution;
            ballA.velocityY += impulse * ny * avgRestitution;
            ballB.velocityX -= impulse * nx * avgRestitution;
            ballB.velocityY -= impulse * ny * avgRestitution;
            
            // Separate balls to prevent sticking
            const overlap = (ballA.radius + ballB.radius - distance) / 2;
            ballA.x -= overlap * nx;
            ballA.y -= overlap * ny;
            ballB.x += overlap * nx;
            ballB.y += overlap * ny;
            
            console.log(`Ball collision! Speed: ${speed.toFixed(2)}`);
        }
    }
}

// Initialize dragging for both balls
drag(ball1);
drag(ball2);

// Function to update ball position based on physics
function updateBall(ball, ballRestitution = restitution) {
    // Skip physics updates if ball is being dragged
    if (ball.isDragging) {
        return;
    }
    
    // Apply gravity to vertical velocity
    ball.velocityY += gravity;
    
    // Apply air resistance (damping) to both velocities
    ball.velocityX *= (1 - airResistance);
    ball.velocityY *= (1 - airResistance);
    
    // Update position based on velocity
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Border collision detection
    // Right wall
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.velocityX = -ball.velocityX * ballRestitution;
    }
    
    // Left wall
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.velocityX = -ball.velocityX * ballRestitution;
    }
    
    // Ground (with 20px padding for visual ground)
    if (ball.y + ball.radius > canvas.height - 20) {
        ball.y = canvas.height - 20 - ball.radius;
        ball.velocityY = -ball.velocityY * ballRestitution;
        
        // Prevent tiny bounces for non-elastic balls
        if (ballRestitution < 1.0 && Math.abs(ball.velocityY) < 0.5) {
            ball.velocityY = 0;
        }
    }
    
    // Ceiling
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.velocityY = -ball.velocityY * ballRestitution;
    }
    
    // Ensure velocity doesn't get too small (except for perfect elasticity)
    if (ballRestitution < 1.0) {
        if (Math.abs(ball.velocityX) < 0.1) ball.velocityX = 0;
        if (Math.abs(ball.velocityY) < 0.1) ball.velocityY = 0;
    }
}

// Function to draw velocity vectors for a ball
function drawVectors(ball) {
    const vectorScale = 5;
    
    // Only draw vectors for moving balls
    if (Math.abs(ball.velocityX) > 0.1 || Math.abs(ball.velocityY) > 0.1) {
        // Draw velocity vector
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(
            ball.x + ball.velocityX * vectorScale,
            ball.y + ball.velocityY * vectorScale
        );
        ctx.strokeStyle = ball.color === '#4cc9f0' ? '#f72585' : '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw vector arrowhead
        const angle = Math.atan2(ball.velocityY, ball.velocityX);
        const arrowLength = 8;
        ctx.beginPath();
        ctx.moveTo(
            ball.x + ball.velocityX * vectorScale,
            ball.y + ball.velocityY * vectorScale
        );
        ctx.lineTo(
            ball.x + ball.velocityX * vectorScale - arrowLength * Math.cos(angle - Math.PI/6),
            ball.y + ball.velocityY * vectorScale - arrowLength * Math.sin(angle - Math.PI/6)
        );
        ctx.lineTo(
            ball.x + ball.velocityX * vectorScale - arrowLength * Math.cos(angle + Math.PI/6),
            ball.y + ball.velocityY * vectorScale - arrowLength * Math.sin(angle + Math.PI/6)
        );
        ctx.closePath();
        ctx.fillStyle = ball.color === '#4cc9f0' ? '#f72585' : '#10b981';
        ctx.fill();
    }
}

// Function to draw stats
function drawStats() {
    ctx.fillStyle = '#ccc';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    
    // Ball 1 stats
    ctx.fillStyle = '#4cc9f0';
    ctx.fillText(`Blue Ball Velocity: (${ball1.velocityX.toFixed(2)}, ${ball1.velocityY.toFixed(2)})`, 20, 30);
    if (ball1.isDragging) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('DRAGGING', 20, 45);
    }
    
    // Ball 2 stats
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`Green Ball Velocity: (${ball2.velocityX.toFixed(2)}, ${ball2.velocityY.toFixed(2)})`, 20, 70);
    if (ball2.isDragging) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('DRAGGING', 20, 85);
    }
    
    // Physics parameters
    ctx.fillStyle = '#ccc';
    ctx.fillText(`Gravity: ${gravity}`, 20, 110);
    ctx.fillText(`Restitution (Blue): ${restitution}`, 20, 130);
    ctx.fillText(`Restitution (Green): 1.0`, 20, 150);
    ctx.fillText(`Air Resistance: ${airResistance}`, 20, 170);
    
    // Instructions
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Drag either ball to set its velocity!', 20, canvas.height - 50);
}

// Main animation loop
function animate() {
    // Clear canvas with a fade effect for motion trails
    ctx.fillStyle = 'rgba(15, 21, 37, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update balls with different restitutions
    updateBall(ball1, restitution); // Blue ball uses slider restitution
    updateBall(ball2, 1.0); // Green ball is perfectly elastic
    
    // Handle ball-to-ball collision
    handleBallCollision(ball1, ball2);
    
    // Draw everything
    drawGround();
    drawBall(ball1);
    drawBall(ball2);
    drawVectors(ball1);
    drawVectors(ball2);
    drawStats();
    
    // Request next frame
    requestAnimationFrame(animate);
}

// Start the animation
animate();

// Reset ball positions on click (outside of balls)
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Check which ball was clicked (if any)
    const dx1 = clickX - ball1.x;
    const dy1 = clickY - ball1.y;
    const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    
    const dx2 = clickX - ball2.x;
    const dy2 = clickY - ball2.y;
    const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    
    // Don't reset if clicked on a ball (handled by drag functions)
    if (distance1 > ball1.radius && distance2 > ball2.radius) {
        // Clicked elsewhere - reset both balls
        ball1.x = 100;
        ball1.y = 100;
        ball1.velocityX = 4;
        ball1.velocityY = 0;
        ball1.isDragging = false;
        
        ball2.x = 300;
        ball2.y = 100;
        ball2.velocityX = -4;
        ball2.velocityY = 0;
        ball2.isDragging = false;
    }
});