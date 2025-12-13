const friction = 0.99888888888888888;
const restitution = 0.7;

export function updateBall(ball, table, pocket1,pocket2,pocket3,pocket4,pocket5,pocket6, pocketBallCallback) {
    // Apply friction
    ball.velocityX *= friction;
    ball.velocityY *= friction;
    
    // Update position
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Table boundaries collision
    if (ball.x + ball.radius > table.width + table.x - table.cushion) {
        ball.x = table.width + table.x - ball.radius - table.cushion;
        ball.velocityX = -ball.velocityX * restitution;
    }
    if (ball.x - ball.radius < table.x + table.cushion) {
        ball.x = table.x + ball.radius + table.cushion;
        ball.velocityX = -ball.velocityX * restitution;
    }
    if (ball.y + ball.radius > table.height + table.y - table.cushion) {
        ball.y = table.height + table.y - ball.radius - table.cushion;
        ball.velocityY = -ball.velocityY * restitution;
    }
    if (ball.y - ball.radius < table.y + table.cushion) {
        ball.y = table.y + ball.radius + table.cushion;
        ball.velocityY = -ball.velocityY * restitution;
    }
    
    // Pocket collision
    const dx1 = ball.x - pocket1.x;
    const dy1 = ball.y - pocket1.y;
    const dx2 = ball.x - pocket2.x;
    const dy2 = ball.y - pocket2.y;
    const dx3 = ball.x - pocket3.x;
    const dy3 = ball.y - pocket3.y;
    const dx4 = ball.x - pocket4.x;
    const dy4 = ball.y - pocket4.y;
    const dx5 = ball.x - pocket5.x;
    const dy5 = ball.y - pocket5.y;
    const dx6 = ball.x - pocket6.x;
    const dy6 = ball.y - pocket6.y;   
    
    const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    if (distance1 <= ball.radius + 5) {
        pocketBallCallback(ball.id);
        return false; // Ball is pocketed
    }
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (distance2 <= ball.radius + 5) {
        pocketBallCallback(ball.id);
        return false; // Ball is pocketed
    } 
        const distance3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
    if (distance3 <= ball.radius + 5) {
        pocketBallCallback(ball.id);
        return false; // Ball is pocketed
    }
        const distance4 = Math.sqrt(dx4 * dx4 + dy4 * dy4);
    if (distance4 <= ball.radius + 5) {
        pocketBallCallback(ball.id);
        return false; // Ball is pocketed
    }
        const distance5 = Math.sqrt(dx5 * dx5 + dy5 * dy5);
    if (distance5 <= ball.radius + 5) {
        pocketBallCallback(ball.id);
        return false; // Ball is pocketed
    }
        const distance6 = Math.sqrt(dx6 * dx6 + dy6 * dy6);
    if (distance6 <= ball.radius + 5) {
        pocketBallCallback(ball.id);
        return false; // Ball is pocketed
    }
    
    return true; // Ball is still active
}

export function handleBallCollision(ball1, ball2, pocketedBalls) {
    // Skip if either ball is pocketed
    if (pocketedBalls.has(ball1.id) || pocketedBalls.has(ball2.id)) return;
    
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < ball1.radius + ball2.radius && distance > 0) {
        const overlap = (ball1.radius + ball2.radius) - distance;
        const separateX = overlap * (ball1.x - ball2.x) / distance / 2;
        const separateY = overlap * (ball1.y - ball2.y) / distance / 2;
        
        ball1.x += separateX;
        ball1.y += separateY;
        ball2.x -= separateX;
        ball2.y -= separateY;
        
        const normalX = (ball1.x - ball2.x) / distance;
        const normalY = (ball1.y - ball2.y) / distance;
        const tangentX = -normalY;
        const tangentY = normalX;
        
        const nV1 = ball1.velocityX * normalX + ball1.velocityY * normalY;
        const tV1 = ball1.velocityX * tangentX + ball1.velocityY * tangentY;
        const nV2 = ball2.velocityX * normalX + ball2.velocityY * normalY;
        const tV2 = ball2.velocityX * tangentX + ball2.velocityY * tangentY;
        
        const m1 = 2;
        const m2 = 2;
        const totalM = 4;
        const nV1After = (nV1 * (m1 - m2) + 2 * m2 * nV2) / totalM;
        const nV2After = (nV2 * (m2 - m1) + 2 * m1 * nV1) / totalM;
        
        ball1.velocityX = nV1After * normalX + tV1 * tangentX;
        ball1.velocityY = nV1After * normalY + tV1 * tangentY;
        ball2.velocityX = nV2After * normalX + tV2 * tangentX;
        ball2.velocityY = nV2After * normalY + tV2 * tangentY;
    }
}

