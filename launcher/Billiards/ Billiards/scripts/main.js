 import { PoolTable } from './poolTable.js';
import { pocket, drawPocket } from './pocket.js';
import { renderGame } from './gameRenderer.js';

// Canvas setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 350;
canvas.height = 700;

// Create a fallback image for the pool table
const tableImage = new Image();
tableImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjU1MCIgdmlld0JveD0iMCAwIDMwMCA1NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNTUwIiBmaWxsPSIjMGE0Ii8+Cjwvc3ZnPg=='; // Green color fallback

// Create pool table
const table = new PoolTable(tableImage);

// Animation loop
function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pool table
    table.draw(ctx);
    
    // Draw pocket
    drawPocket(ctx, pocket);
    
    // Render game (balls and physics)
    renderGame(ctx, table, pocket);
    
    // Continue animation
    requestAnimationFrame(animate);
}

// Start the animation when the image loads
tableImage.onload = () => {
    animate();
};

// Start even if image fails to load
tableImage.onerror = () => {
    console.log('Image failed to load, using fallback');
    animate();
};

// Also start immediately in case image is already loaded
if (tableImage.complete) {
    animate();
}