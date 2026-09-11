const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize',(e)=>{
    canvas.width = e.currentTarget.innerWidth;
    canvas.height = e.currentTarget.innerHeight;
});
class Line{
    constructor(){
        this.startX = canvas.width/2;
        this.startY = canvas.height/2;
        this.endX = 300;
        this.endY = 300;
        this.speedX = 0;
        this.speedY = 0;
        this.angle = 0;
        this.angularSpeed = 0.05;
    }
    draw(){
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'green';
        ctx.moveTo(this.startX,this.startY);
        ctx.lineTo(this.endX,this.endY);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(this.startX,this.startY,10,0,2*Math.PI);
        ctx.fill();
    }
    getVelocityAtPoint(pointX, pointY){
        // For pivoting line, velocity is purely rotational
        const dx = pointX - this.startX;
        const dy = pointY - this.startY;
        
        // Tangential velocity = angular velocity × radius
        const tangentialSpeed = Math.sqrt(dx * dx + dy * dy) * this.angularSpeed;
        const angle = Math.atan2(dy, dx) + Math.PI/2; // Perpendicular
        
        return {
            x: Math.cos(angle) * tangentialSpeed,
            y: Math.sin(angle) * tangentialSpeed
        };
    }
    update(){
        this.angle += this.angularSpeed;
        this.endX = this.startX  + Math.cos(this.angle) * 200; 
        this.endY = this.startY  + Math.sin(this.angle) * 200;
        this.startX += this.speedX;
        this.endX += this.speedX;
        this.startY += this.speedY;
        this.endY += this.speedY;
        if(this.endX >= canvas.width || this.startX <= 0){
            this.speedX *= -1;
        }else if(this.startX >= canvas.width || this.endX <= 0){
            this.speedX *= -1;
        }
        if(this.endY >= canvas.height || this.startY <= 0){
            this.speedY *= -1;
        }else if(this.startY >= canvas.height || this.endY <= 0){
            this.speedY *= -1;
        }
    }
}
class Ball{
    constructor(){
        this.x = 100;
        this.y = 100;
        this.radius = 20;
        this.color = 'blue';
        this.velocityX = 1;
        this.velocityY = 0;
        this.gravity = 0.3;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x,this.y,this.radius,0,2 * Math.PI);
        ctx.fill();
    }
    update(){
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        if(this.x >= canvas.width - this.radius || this.x < this.radius){
            this.x = this.x < this.radius ? this.radius : canvas.width - this.radius;
            this.velocityX *= -0.8;
        }
         if(this.y >= canvas.height - this.radius || this.y < this.radius){
             this.y = this.y < this.radius ? this.radius : canvas.height - this.radius;
            this.velocityY *= -0.8;
        }
    }
}
const line = new Line();
const ball = new Ball();

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ball.draw();
    line.draw();
    ball.update();
    line.update();
    detectCollision(); 
    requestAnimationFrame(animate);
}

 function detectCollision() {
    const { startX, startY, endX, endY, angularSpeed, speedX,  speedY} = line;
    const { x, y, radius } = ball;
    const v = [endX - startX, endY - startY];
    const w = [x - startX, y - startY];
    const d1 = v[0] * w[0] + v[1] * w[1];
    const d2 = v[0] ** 2 + v[1] ** 2;
    const t = d1 / d2;

    let closestPoint;
    if (t < 0) closestPoint = { x: startX, y: startY };
    else if (t > 1) closestPoint = { x: endX, y: endY };
    else closestPoint = { x: startX + t * v[0], y: startY + t * v[1] };

    // Vector from closest point to ball center
    const dx = x - closestPoint.x;
    const dy = y - closestPoint.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
     const DX = startX - closestPoint.x;
     const DY = startY - closestPoint.y;
    const vel = line.getVelocityAtPoint(DX,DY);
    if (dist <= radius) {
        // Normal (pointing from closest point to ball)
        const nx = dx / dist;
        const ny = dy / dist;

        // Penetration depth
        const penetration = radius - dist;

        // Separate ball
        ball.x += nx * penetration;
        ball.y += ny * penetration;

        // Dot product of velocity with normal
        const vDotN = (ball.velocityX - vel.x) * nx + (ball.velocityY - vel.y) * ny;

        // Coefficient of restitution
        const e = 0.7;
         
        // Reflect velocity
        ball.velocityX  = (ball.velocityX - vel.x) - (1 + e) * vDotN * nx;
        ball.velocityY = (ball.velocityY - vel.y) - (1 + e) * vDotN * ny;
    }
}
let firstTime;
let lastTime;
let initialDist;
let finalDist;
canvas.addEventListener('touchstart',(e)=>{
   initialDist = {
       x: e.touches[0].clientX,
       y: e.touches[0].clientY,
   };
    ball.velocityX = 0;
    ball.velocityY = 0;
    ball.x = initialDist.x;
    ball.y = initialDist.y;
    
    firstTime = Date.now();
    
});
canvas.addEventListener('touchmove',(e)=>{
    finalDist = {
       x: e.touches[0].clientX,
       y: e.touches[0].clientY,
   };
     
    ball.x = finalDist.x;
    ball.y = finalDist.y;
    lastTime = Date.now();
    const deltaTime = lastTime-firstTime;
   if(deltaTime > 0){
       ball.velocityX = (finalDist.x - initialDist.x)/(deltaTime/20);
       ball.velocityY = (finalDist.y - initialDist.y)/(deltaTime/20);
   }  
});
canvas.addEventListener('touchend',()=>{
    
});
animate();