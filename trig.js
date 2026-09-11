const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const particles = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
		const restitution = 0.8;
// Store original positions for proportional resizing
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;

window.addEventListener('resize', e => {
    const oldWidth = canvasWidth;
    const oldHeight = canvasHeight;
    
    canvasWidth = e.currentTarget.innerWidth;
    canvasHeight = e.currentTarget.innerHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Adjust all particles proportionally to new canvas size
    const widthRatio = canvasWidth / oldWidth;
    const heightRatio = canvasHeight / oldHeight;
    
    for(let particle of particles) {
        // Scale position proportionally
        particle.x *= widthRatio;
        particle.y *= heightRatio;
        
        // Keep particles within bounds
        particle.x = Math.max(particle.radius, Math.min(particle.x, canvasWidth - particle.radius));
        particle.y = Math.max(particle.radius, Math.min(particle.y, canvasHeight - particle.radius));
    }
});

class Particle {
    constructor() {
        this.radius = 30;
        this.x = Math.random() * (canvasWidth - this.radius * 2) + this.radius;
        this.y = Math.random() * (canvasHeight - this.radius * 2) + this.radius;
        this.color = 'white';
        this.angle = 0;
        this.speedX = 5;
    				  this.speedY = 0;
    				  this.gravity = 0.5;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,246,0,0.2)';
        ctx.arc(this.x-2,this.y-2,28,0,2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,246,0,0.4)';
        ctx.arc(this.x-11,this.y-13,8,0,2*Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'pink';
        ctx.moveTo(this.x,this.y);
        ctx.lineTo(this.x + this.speedX*5, this.y + this.speedY*5);
        
    }
    isPointInside(x,y){
    				const dx = this.x - x;
    				const dy = this.y - y;
    				const distance = Math.sqrt(dx * dx + dy * dy);
    				return distance <= this.radius;
    }
    update() {
        this.x += this.speedX;
    				  this.y += this.speedY;
    				  this.speedY += this.gravity;
        if(this.x + this.radius >= canvasWidth || this.x - this.radius <= 0) {
            this.speedX *= -(1 * restitution);
            // Ensure particle stays within bounds
            this.x = Math.max(this.radius, Math.min(this.x, canvasWidth - this.radius));
        }
    				if(this.y + this.radius >= canvasHeight || this.y - this.radius <= 0) {
            this.speedY *= -(1 * restitution);
            // Ensure particle stays within bounds
            this.y = Math.max(this.radius, Math.min(this.y, canvasHeight - this.radius));
        }
    }
}

let x, y;
let firstTime, lastTime, time;
let dx1, dx2, dy1, dy2;
let speedX, speedY;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
    firstTime = Date.now();
    dx1 = x;
    dy1 = y;
    for(let i=0; i<particles.length; i++){
        for(let j=i+1; j<particles.length; j++){
    if(particles[i].isPointInside(x,y)) particles[i].isDragging = true;
    if(particles[j].isPointInside(x,y)) particles[j].isDragging = true;
    // Reset velocities when starting to drag
    particles[i].velocityX = particles[i].velocityX = 0;
    particles[i].velocityY = particles[i].velocityY = 0;
        }
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
    for(let i=0; i<particles.length; i++){
        for(let j=i+1; j<particles.length; j++){

    // Move ball with finger during drag
    if (particles[i].isDragging) {
        particles[i].x = x;
        particles[i].y = y;
    }else if (particles[i].isDragging){
				  				particles[i].x = x;
				  				particles[i].y = y;
    }
        }
				  }
});

canvas.addEventListener('touchend', (e) => {
    const rect = canvas.getBoundingClientRect();
    lastTime = Date.now();
    time = (lastTime - firstTime) / 10;
    dx2 = x;
    dy2 = y;
    
    // Calculate velocities based on drag distance and time
    speedX = ((dx2 - dx1) / time) || 0;
    speedY = ((dy2 - dy1) / time) || 0;
    for(let i=0; i<particles.length; i++){
        if(particles[i].isPointInside(x,y)){
            particles[i].speedX = speedX;
            particles[i].speedY = speedY;
        }
    }
    isDragging = false;
});


for(let i = 0; i < 2; i++) {
    particles.push(new Particle());
}

function handleParticles() {
    for(let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
    				for(let j=i+1; j < particles.length; j++){
    								handleCollision(particles[i],particles[j]);
    				}
    }
}
let hue = 0;
function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#FFF600';
    ctx.beginPath();
    ctx.arc(0,0,40,0,2*Math.PI);
    ctx.fill();
    ctx.fillStyle = '#884300';
    ctx.fillRect(0,0.9*canvas.height,canvas.width,100);
    handleParticles();
    requestAnimationFrame(animate);
}

function handleCollision(ballA,ballB){
				const dx = ballA.x - ballB.x;
				const dy = ballA.y - ballB.y;
				const distance = Math.hypot(dx,dy);
		if		(distance <= ballA.radius + ballB.radius){
		    const nx = dx/distance;
		   		const ny = dy/distance;
		    hue+= 50;
		    ballA.color = 'green';
		    ballB.color = 'red';
								const overlap = ballA.radius + ballB.radius - distance;
		    const factor = 0.5;
								ballA.x -= overlap * factor;
								ballB.x += overlap * factor;
								ballA.y -= overlap * factor;
								ballB.y += overlap * factor;
						
						const relVelocity = ((ballA.speedX - ballB.speedX) * nx) + ((ballA.speedY - ballB.speedY) * ny);
						if(relVelocity < 0){
						const m1 = 1,m2 = 1;
						    const avrgRestitution = (restitution + 1)/2;
						const impulse = -((1+avrgRestitution) * (relVelocity))/((1/m1) + (1/m2));
		    const newSpeedX1 = ballA.speedX + (impulse * nx)/m1;
		    const newSpeedY1 = ballA.speedY + (impulse * ny)/m1;
		    const newSpeedX2 = ballB.speedX - (impulse * nx)/m2;
		    const newSpeedY2 = ballB.speedY - (impulse * ny)/m2;
		    ballA.speedX = newSpeedX1;
		    ballA.speedY = newSpeedY1;
		    ballB.speedX = newSpeedX2;
		    ballB.speedY = newSpeedY2;
						}
		    
				}
}
animate();