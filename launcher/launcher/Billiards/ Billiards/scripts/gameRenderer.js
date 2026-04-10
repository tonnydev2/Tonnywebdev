 import { ballManager } from './ballManager.js';
import { updateBall, handleBallCollision } from './physics.js';
import { drawBall } from './renderBalls.js';

export function renderGame(ctx, table, pocket1,pocket2,pocket3,pocket4,pocket5,pocket6) {
    // Update the active balls list
    ballManager.updateActiveBalls();
    const balls = ballManager.getActiveBalls();
    
    // Update and draw all active balls
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        const isActive = updateBall(
            ball, 
            table, 
            pocket1,
            pocket2,
            pocket3,
            pocket4,
            pocket5,
            pocket6,        
            (id) => ballManager.pocketBall(id)
        );
        
        if (isActive) {
            drawBall(ctx, ball.x, ball.y, ball.radius, ball.color);
        }
    }
    
    // Check collisions between all active balls
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            handleBallCollision(
                balls[i], 
                balls[j], 
                ballManager.pocketedBalls
            );
        }
    }
    
    // Update original ball objects
    ballManager.updateOriginalBalls(balls);
}

// REMOVE EVERYTHING BELOW THIS LINE - THIS CODE BELONGS IN physics.js