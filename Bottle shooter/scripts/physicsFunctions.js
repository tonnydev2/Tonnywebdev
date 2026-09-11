export function detectCollision(ball, line) {
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

export function collisionBallGround(ball, ground) {
    const closestX = Math.max(ground.x, Math.min(ball.x, ground.x + ground.width));
    const closestY = Math.max(ground.y, Math.min(ball.y, ground.y + ground.height));
    
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    const distance = Math.hypot(dx, dy);
    
    if (distance < ball.radius) {
        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = ball.radius - distance;
        ball.x += nx * overlap;
        ball.y += ny * overlap;
        
        const vRelDotN = ball.speedX * nx + ball.speedY * ny;
        if (vRelDotN < 0) {
            ball.speedX -= vRelDotN * nx * (1 + ball.restitution);
            ball.speedY -= vRelDotN * ny * (1 + ball.restitution);
            if (ny < -0.5) ball.speedX *= 0.95;
        }
        return true;
    }
    return false;
}
export function collisionBallRock(ball, rock) {
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
export function collisionBottleGround(bottle, ground) {
    const bounds = bottle.getBounds();
    
    if (bounds.x + bounds.width > ground.x && bounds.x < ground.x + ground.width &&
        bounds.y + bounds.height > ground.y && bounds.y < ground.y + ground.height) {
        
        const overlapLeft = (bounds.x + bounds.width) - ground.x;
        const overlapRight = (ground.x + ground.width) - bounds.x;
        const overlapTop = (bounds.y + bounds.height) - ground.y;
        const overlapBottom = (ground.y + ground.height) - bounds.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapTop && bottle.speedY >= 0) {
            bottle.y -= overlapTop;
            bottle.speedY = 0;
            bottle.speedX *= 0.98;
            if (Math.abs(bottle.angle) < 0.1) bottle.angularVelocity *= 0.9;
        } else if (minOverlap === overlapBottom) {
            bottle.y += overlapBottom;
            bottle.speedY = Math.abs(bottle.speedY) * 0.3;
        } else if (minOverlap === overlapLeft) {
            bottle.x -= overlapLeft;
            bottle.speedX = Math.abs(bottle.speedX) * 0.3;
        } else if (minOverlap === overlapRight) {
            bottle.x += overlapRight;
            bottle.speedX = -Math.abs(bottle.speedX) * 0.3;
        }
        return true;
    }
    return false;
}
export function collisionBottleRock(bottle, rock) {
    const closest = bottle.getClosestPointToCircle(rock.x, rock.y);
    const dx = rock.x - closest.x;
    const dy = rock.y - closest.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < rock.radius && distance > 0.001) {
        const nx = dx / distance;
        const ny = dy / distance;
        
        const bottleCenter = bottle.getCenter();
        const rx = closest.x - bottleCenter.x;
        const ry = closest.y - bottleCenter.y;
        
        const bottleVelAtPoint = {
            x: bottle.speedX - bottle.angularVelocity * ry,
            y: bottle.speedY + bottle.angularVelocity * rx
        };
        
        const vRelX = rock.speedX - bottleVelAtPoint.x;
        const vRelY = rock.speedY - bottleVelAtPoint.y;
        const vRelDotN = vRelX * nx + vRelY * ny;
        
        if (vRelDotN < 0) {
            const e = 0.4;
            const rCrossN = rx * ny - ry * nx;
            let invMassSum = 1/rock.mass + 1/bottle.mass;
            if (!bottle.isFallen) invMassSum += (rCrossN * rCrossN) / bottle.momentOfInertia;
            
            const impulse = -(1 + e) * vRelDotN / invMassSum;
            rock.speedX += (impulse * nx) / rock.mass;
            rock.speedY += (impulse * ny) / rock.mass;
            bottle.speedX -= (impulse * nx) / bottle.mass;
            bottle.speedY -= (impulse * ny) / bottle.mass;
            if (!bottle.isFallen) {
                bottle.angularVelocity -= (impulse * rCrossN) / bottle.momentOfInertia;
                bottle.isLeaning = true;
            }
        }
        
        const overlap = rock.radius - distance;
        const correctionX = nx * overlap;
        const correctionY = ny * overlap;
        const totalMass = rock.mass + bottle.mass;
        rock.x += correctionX * (bottle.mass / totalMass);
        rock.y += correctionY * (bottle.mass / totalMass);
        bottle.x -= correctionX * (rock.mass / totalMass);
        bottle.y -= correctionY * (rock.mass / totalMass);
        return true;
    }
    return false;
}
export function collisionRockGround(rock, ground) {
    const closestX = Math.max(ground.x, Math.min(rock.x, ground.x + ground.width));
    const closestY = Math.max(ground.y, Math.min(rock.y, ground.y + ground.height));
    
    const dx = rock.x - closestX;
    const dy = rock.y - closestY;
    const distance = Math.hypot(dx, dy);
    
    if (distance < rock.radius) {
        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = rock.radius - distance;
        rock.x += nx * overlap;
        rock.y += ny * overlap;
        
        const vRelDotN = rock.speedX * nx + rock.speedY * ny;
        if (vRelDotN < 0) {
            rock.speedX -= vRelDotN * nx * 0.5;
            rock.speedY -= vRelDotN * ny * 0.5;
        }
        if (ny < -0.5) rock.speedX *= 0.95;
        return true;
    }
    return false;
}

