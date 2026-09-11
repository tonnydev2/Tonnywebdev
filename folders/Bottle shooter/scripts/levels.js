import { canvas,ctx,catap } from './main.js';
import { Grounds } from './grounds.js';
import { Bottles } from './bottles.js';
import { Rocks } from './rocks.js';


export function buildLevel(levelNum, currentBall, activeBalls, bottles, rocks, grounds) {
    bottles.length = 0;
    rocks.length = 0;
    grounds.length = 0;
    
    // Main ground platform
    const mainGround = new Grounds(canvas, ctx, canvas.width * 0.5, canvas.height * 0.75);
    mainGround.width = 200;
    mainGround.height = 25;
    grounds.push(mainGround);
    
    switch(levelNum) {
        case 1:
            // Place bottles on ground
            for (let i = 0; i < 3; i++) {
                const bottle = new Bottles(canvas, ctx, mainGround.x + 60 + i * 60, mainGround);
                bottle.speedX = 0;
                bottle.speedY = 0;
                bottle.angularVelocity = 0;
                bottles.push(bottle);
            }
            // Place rocks on ground
            rocks.push(new Rocks(canvas, ctx, mainGround.x + 10, mainGround.y - 20));
            rocks[0].speedX = 0;
            rocks[0].speedY = 0;
            break;
            
        case 2:
            const barrier = new Grounds(canvas, ctx, canvas.width * 0.8, canvas.height * 0.46);
            barrier.width = 20;
            barrier.height = 120;
            barrier.color = '#7f8c8d';
            grounds.push(barrier);
            
            for (let i = 0; i < 4; i++) {
                const bottle = new Bottles(canvas, ctx, mainGround.x + 1 + i * 45, mainGround);
                bottle.speedX = 0;
                bottle.speedY = 0;
                bottles.push(bottle);
            }
            const rock1 = new Rocks(canvas, ctx, mainGround.x - 40, mainGround.y - 20);
            rock1.speedX = 0;
            rock1.speedY = 0;
            rocks.push(rock1);
            
            const rock2 = new Rocks(canvas, ctx, mainGround.x + 60, mainGround.y - 20);
            rock2.speedX = 0;
            rock2.speedY = 0;
            break;
            
        case 3:
            const platform2 = new Grounds(canvas, ctx, canvas.width * 0.75, canvas.height * 0.6);
            platform2.width = 140;
            platform2.height = 25;
            grounds.push(platform2);
        
            const barrier3 = new Grounds(canvas, ctx, platform2.x + platform2.width, platform2.y - 120);
            barrier3.width = 20;
            barrier3.height = 120;
            barrier3.color = '#7f8c8d';
            grounds.push(barrier3);
            
            for (let i = 0; i < 2; i++) {
                const bottle1 = new Bottles(canvas, ctx, mainGround.x + 5 + i * 50, mainGround);
                bottle1.speedX = 0;
                bottle1.speedY = 0;
                bottles.push(bottle1);
                
                const bottle2 = new Bottles(canvas, ctx, platform2.x - 30 + i * 50, platform2);
                bottle2.speedX = 0;
                bottle2.speedY = 0;
                bottles.push(bottle2);
            }
             
            
            const rock3 = new Rocks(canvas, ctx, mainGround.x - 20, mainGround.y - 20);
            rock3.speedX = 0;
            rock3.speedY = 0;
            rocks.push(rock3);
            break;
        case 4:
            const platform4 = new Grounds(canvas, ctx, mainGround.x , mainGround.y - 150);
            platform4.width = 140;
            platform4.height = 25;
            grounds.push(platform4);
        const barrier4 = new Grounds(canvas, ctx, platform4.x + platform4.width + 100, platform4.y - 105);
            barrier4.width = 20;
            barrier4.height = 120;
            barrier4.color = '#7f8c8d';
            grounds.push(barrier4);
        
        const barrier5 = new Grounds(canvas, ctx, platform4.x - 20, platform4.y - 20);
            barrier5.width = 20;
            barrier5.height = 120;
            barrier5.color = '#7f8c8d';
            grounds.push(barrier5);
        
        for (let i = 0; i < 2; i++) {
                const bottleA = new Bottles(canvas, ctx, mainGround.x + 100 + i * 50, mainGround);
                bottleA.speedX = 0;
                bottleA.speedY = 0;
                bottles.push(bottleA);
                
                const bottleB = new Bottles(canvas, ctx, platform4.x + 5 + i * 50, platform4);
                bottleB.speedX = 0;
                bottleB.speedY = 0;
                bottles.push(bottleB);
            }
        break;
        case 5:
 																	mainGround.x += 80;
        for(let i=0; i<3; i++){
            const bottle = new Bottles(canvas,ctx,mainGround.x + 50 * i, mainGround);
            bottles.push(bottle);
        }
        catap.x = canvas.width * 0.45;
        catap.y = canvas.height * 0.4;
        const platform = new Grounds(canvas,ctx,0.1 * canvas.width, mainGround.y);
        grounds.push(platform);
        for(let i=0; i<3; i++){
            const bottle1 = new Bottles(canvas,ctx,platform.x + 50 * i, platform);
            bottles.push(bottle1);
        }
        const rock = new Rocks(canvas,ctx,mainGround.x + 50 * 3);
        rocks.push(rock);
        const barrier6 = new Grounds(canvas, ctx, platform.x - 70, platform.y - 150);
            barrier6.width = 20;
            barrier6.height = 120;
            barrier6.color = '#7f8c8d';
            grounds.push(barrier6);
        break;
            
        default:
            for (let i = 0; i < 3; i++) {
                const bottle = new Bottles(canvas, ctx, mainGround.x - 50 + i * 50, mainGround);
                bottle.speedX = 0;
                bottle.speedY = 0;
                bottles.push(bottle);
            }
    }
}

