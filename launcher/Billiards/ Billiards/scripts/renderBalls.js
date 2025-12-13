export function drawBall(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a small white circle for a 3D effect
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x - radius/3, y - radius/3, radius/3, 0, Math.PI * 2);
    ctx.fill();
}

