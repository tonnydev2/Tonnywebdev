// debug-utils.js
import { RED_PATH, GREEN_PATH, BLUE_PATH, YELLOW_PATH } from './paths.js';
import {canvas,ctx} from './main.js';
th
export function drawAllPaths(ctx) {
  // Draw red path
  drawPath(ctx, RED_PATH, 'red');
  
  // Draw green path
  drawPath(ctx, GREEN_PATH, 'green');
  
  // Draw blue path
  drawPath(ctx, BLUE_PATH, 'blue');
  
  // Draw yellow path
  drawPath(ctx, YELLOW_PATH, 'yellow');
}

function drawPath(ctx, path, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  // Draw lines connecting points
  for (let i = 0; i < path.length - 1; i++) {
    ctx.moveTo(path[i].x, path[i].y);
    ctx.lineTo(path[i + 1].x, path[i + 1].y);
  }
  ctx.stroke();
  
  // Draw points with numbers
  path.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw index number
    ctx.fillStyle = 'black';
    ctx.font = '8px Arial';
    ctx.fillText(index, point.x + 5, point.y - 5);
  });
}

// Log path coordinates for verification
export function logPathCoords() {
  console.log('Red Path Coordinates:');
  RED_PATH.forEach((coord, index) => {
    console.log(`${index}: {x: ${coord.x}, y: ${coord.y}}`);
  });
  
  console.log('\nPath lengths:');
  console.log(`Red: ${RED_PATH.length} positions`);
  console.log(`Green: ${GREEN_PATH.length} positions`);
  console.log(`Blue: ${BLUE_PATH.length} positions`);
  console.log(`Yellow: ${YELLOW_PATH.length} positions`);
}

