const screen1 = document.querySelector('.screen1');
const screen2 = document.querySelector('.screen2');
const startBtn = document.querySelector('.start');
const scoreEl = document.querySelector('.score');
const bestScoreEl = document.querySelector('.bestScore');
const pauseBtn = document.querySelector('.pause');
const changer = document.querySelector('.changer');
const canvas = document.querySelector('.gameContainer');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.8;

// Global variables
let launcherTiles = [];
let gridTiles = [];
let columns = [];
let particles = [];
let floatingTexts = [];
const columnNumber = 5;
const columnWidth = 60;
const launcherRad = 50;
let touchX, touchY;
let isClicked = false;
let isCollidedWithGrid = false;
let isProcessing = false;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let isPaused = false;
let gameOver = false;
let combo = 0;
let lastMatchTime = 0;
let clickedIndex = -1;
let numPos = 1;
let initialCount = false;

// Initialize best score display
bestScoreEl.textContent = bestScore;

function createColor(num) {
    const colors = {
        2: '#00FF78',
        4: '#00FFFF',
        8: '#0072FF',
        16: '#9100FF',
        32: '#FF7F4C',
        64: '#FF3D4C',
        128: '#FF00FF',
        256: '#FFFF00',
        512: '#FFD700',
        1024: '#FF6B6B',
        2048: '#4E882C',
        4096: '#FF1493',
        8192: '#00FF00'
    };
    return colors[num] || '#FFFFFF';
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 5 + 2;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.02;
        this.gravity = 0.2;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += this.gravity;
        this.life -= this.decay;
        this.radius *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1;
        this.velocity = { x: 0, y: -3 };
        this.scale = 0;
        this.targetScale = 1;
    }

    update() {
        this.y += this.velocity.y;
        this.velocity.y *= 0.95;
        this.life -= 0.02;
        this.scale += (this.targetScale - this.scale) * 0.1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${Math.floor(30 * this.scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class Column {
    constructor(x, index) {
        this.x = x;
        this.y = 5;
        this.width = columnWidth;
        this.height = canvas.height - launcherRad * 3;
        this.color = 'rgba(225,225,225,0.6)';
        this.index = index;
        this.highlight = 0;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        if (this.highlight > 0) {
            ctx.fillStyle = `rgba(255,255,255,${this.highlight})`;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            this.highlight -= 0.05;
        }
        
        // Column border
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Launcher {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - launcherRad;
        this.radius = launcherRad;
        this.color = 'rgba(225,225,225,0.7)';
        this.pulse = 0;
    }
    
    draw() {
        this.pulse += 0.05;
        const pulseRadius = this.radius + Math.sin(this.pulse) * 2;
        
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

const launcher = new Launcher();

class Tile {
    constructor(pos = 1, color, text) {
        this.x = launcher.x - (launcher.radius / 2);
        this.pos = pos;
        this.width = columnWidth;
        this.height = columnWidth;
        this.y = this.pos === 1 ? launcher.y - this.height + (launcher.radius * 1.5) : launcher.y - (launcher.radius * 1.5);
        this.color = color;
        this.text = text;
        this.target = null;
        this.timer = 0;
        this.reached = false;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        this.opacity = 1;
        this.merged = false;
        this.landed = false;
        this.movingDown = false;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.scale(this.scaleX, this.scaleY);
        ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
        
        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Main tile
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.shadowColor = 'transparent';
        
        // Border glow
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Inner gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
        
        ctx.restore();
    }
    
    update(myTarget) {
        // Set target if provided
        if (myTarget && !this.target) {
            this.target = myTarget;
        }
        
        // Move towards target horizontally
        if (this.target && !this.reached) {
            const targetX = this.target.x;
            
            if (Math.abs(targetX - this.x) > 5) {
                this.x += targetX > this.x ? 5 : -5;
            } else {
                this.x = targetX;
                this.reached = true;
                this.movingDown = true;
                
                // Create new launcher tile
                if (launcherTiles.includes(this)) {
                    createTile(null, 'launcher');
                    if (launcherTiles.length > 1) {
                        launcherTiles[1].pos = 0;
                        launcherTiles[1].y = launcher.y - (launcher.radius * 1.5);
                    }
                }
            }
        }
        
        // Move down after reaching target column
        if (this.reached && this.target && !this.landed && this.movingDown) {
            const landingY = this.findLandingPosition();
            
            if (this.y < landingY) {
                this.y += 5;
                if (this.y > landingY) {
                    this.y = landingY;
                }
            } else {
                this.y = landingY;
                this.landed = true;
                this.movingDown = false;
                isClicked = false;
                
                // Add to grid tiles if not already there
                if (!gridTiles.includes(this)) {
                    gridTiles.push(this);
                }
                
                // Remove from launcher tiles
                const launcherIndex = launcherTiles.indexOf(this);
                if (launcherIndex > -1) {
                    launcherTiles.splice(launcherIndex, 1);
                }
                
                // Landing animation
                this.scaleX = 1.2;
                this.scaleY = 1.2;
                
                // Check for matches after landing
                setTimeout(() => {
                    this.checkMatches();
                }, 50);
            }
        }
        
        // Animation updates
        if (this.scaleX > 1) {
            this.scaleX -= 0.05;
            this.scaleY -= 0.05;
            if (this.scaleX < 1) {
                this.scaleX = 1;
                this.scaleY = 1;
            }
        }
    }
    
    findLandingPosition() {
        // Start from the top of the column
        let landingY = columns[0].y;
        
        // Find the column this tile is in
        let targetColumn = null;
        for (let i = 0; i < columns.length; i++) {
            if (Math.abs(this.x - columns[i].x) < columnWidth / 2) {
                targetColumn = columns[i];
                break;
            }
        }
        
        if (!targetColumn) return columns[0].y;
        
        // Check for existing tiles in this column
        let tilesInColumn = [];
        for (let i = 0; i < gridTiles.length; i++) {
            const otherTile = gridTiles[i];
            if (otherTile !== this && 
                Math.abs(otherTile.x - targetColumn.x) < columnWidth / 2) {
                tilesInColumn.push(otherTile);
            }
        }
        
        // Sort tiles by Y position (top to bottom)
        tilesInColumn.sort((a, b) => a.y - b.y);
        
        // Find the first gap or return the top if column is empty
        if (tilesInColumn.length === 0) {
            return targetColumn.y;
        }
        
        // Check if there's a gap at the top
        if (tilesInColumn[0].y > targetColumn.y + columnWidth) {
            return targetColumn.y;
        }
        
        // Find the landing position
        for (let i = 0; i < tilesInColumn.length; i++) {
            const tile = tilesInColumn[i];
            
            // If this is the last tile, place after it
            if (i === tilesInColumn.length - 1) {
                const nextY = tile.y + tile.height;
                // Check if this exceeds column height
                if (nextY + this.height <= targetColumn.y + targetColumn.height) {
                    return nextY;
                }
                return targetColumn.y + targetColumn.height - this.height;
            }
            
            // Check for gap between tiles
            const nextTile = tilesInColumn[i + 1];
            const gapAfterThis = nextTile.y - (tile.y + tile.height);
            
            if (gapAfterThis >= this.height) {
                return tile.y + tile.height;
            }
        }
        
        // Default: return top of column
        return targetColumn.y;
    }
    
    checkMatches() {
        // Check for matches with adjacent tiles
        for (let i = 0; i < gridTiles.length; i++) {
            if (gridTiles[i] === this) continue;
            
            if (collision(this, gridTiles[i]) && this.text === gridTiles[i].text) {
                getMatch();
                break;
            }
        }
    }
}

function createColumns() {
    columns = [];
    let gap = 8;
    for (let i = 0; i < columnNumber; i++) {
        columns.push(new Column((columnWidth * i) + gap * i + 1, i));
    }
}

function generateRandomTile() {
    const choices = [2, 4, 8, 16];
    const pick = choices[Math.floor(Math.random() * choices.length)];
    return pick;
}

function collision(first, second) {
    return !(
        first.x + first.width < second.x ||
        first.x > second.x + second.width ||
        first.y + first.height < second.y ||
        first.y > second.y + second.height
    );
}

function createMatchAnimation(x, y, value) {
    // Create particles
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, createColor(value)));
    }
    
    // Create floating text
    floatingTexts.push(new FloatingText(x, y, `+${value}`, '#FFD700'));
    
    // Update score
    score += value;
    scoreEl.textContent = score;
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        bestScoreEl.textContent = bestScore;
        localStorage.setItem('bestScore', bestScore);
    }
    
    // Combo system
    const currentTime = Date.now();
    if (currentTime - lastMatchTime < 2000) {
        combo++;
        if (combo > 1) {
            floatingTexts.push(new FloatingText(x, y - 40, `Combo x${combo}!`, '#FF6B6B'));
        }
    } else {
        combo = 1;
    }
    lastMatchTime = currentTime;
}

function getMatch() {
    let matched = true;
    let matchFound = false;
    
    while (matched) {
        matched = false;
        
        for (let i = 0; i < gridTiles.length; i++) {
            for (let j = i + 1; j < gridTiles.length; j++) {
                if (collision(gridTiles[i], gridTiles[j]) && 
                    gridTiles[i].text === gridTiles[j].text) {
                    
                    const newX = Math.min(gridTiles[i].x, gridTiles[j].x);
                    const newY = Math.min(gridTiles[i].y, gridTiles[j].y);
                    const newValue = gridTiles[i].text + gridTiles[j].text;
                    const centerX = newX + columnWidth / 2;
                    const centerY = newY + columnWidth / 2;
                    
                    // Create match animation
                    createMatchAnimation(centerX, centerY, newValue);
                    
                    // Highlight the column
                    const columnIndex = Math.floor(newX / (columnWidth + 8));
                    if (columns[columnIndex]) {
                        columns[columnIndex].highlight = 0.5;
                    }
                    
                    const higherIndex = Math.max(i, j);
                    const lowerIndex = Math.min(i, j);
                    
                    // Remove matched tiles
                    gridTiles.splice(higherIndex, 1);
                    gridTiles.splice(lowerIndex, 1);
                    
                    // Create new merged tile
                    createGridTileWithAnimation(newValue, newX, newY);
                    
                    matched = true;
                    matchFound = true;
                    break;
                }
            }
            if (matched) break;
        }
    }
    
    // After matching, update all tile positions to fill gaps
    updateTilePositions();
    
    return matchFound;
}

function updateTilePositions() {
    // For each column, sort tiles and reposition them
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex];
        let tilesInColumn = [];
        
        // Collect tiles in this column
        for (let i = 0; i < gridTiles.length; i++) {
            if (Math.abs(gridTiles[i].x - column.x) < columnWidth / 2) {
                tilesInColumn.push(gridTiles[i]);
            }
        }
        
        // Sort by Y position
        tilesInColumn.sort((a, b) => a.y - b.y);
        
        // Reposition tiles
        let currentY = column.y;
        for (let i = 0; i < tilesInColumn.length; i++) {
            const tile = tilesInColumn[i];
            if (Math.abs(tile.y - currentY) > 1) {
                // Animate to new position
                tile.targetY = currentY;
                animateTileToPosition(tile, currentY);
            }
            currentY += tile.height;
        }
    }
}

function animateTileToPosition(tile, targetY) {
    const animationInterval = setInterval(() => {
        if (Math.abs(tile.y - targetY) > 2) {
            tile.y += tile.y < targetY ? 2 : -2;
        } else {
            tile.y = targetY;
            clearInterval(animationInterval);
        }
    }, 16);
}

function createGridTileWithAnimation(num, x, y) {
    setTimeout(() => {
        const tile = new Tile(1, createColor(num), num);
        tile.x = x;
        tile.y = y;
        tile.scaleX = 0;
        tile.scaleY = 0;
        tile.merged = true;
        tile.landed = true;
        
        gridTiles.push(tile);
        
        // Bounce animation
        let scale = 0;
        const bounceAnimation = setInterval(() => {
            scale += 0.1;
            if (scale <= 1.2) {
                tile.scaleX = scale;
                tile.scaleY = scale;
            } else if (scale <= 1.5) {
                tile.scaleX = 1.2 - (scale - 1.2) * 0.5;
                tile.scaleY = 1.2 - (scale - 1.2) * 0.5;
            } else {
                tile.scaleX = 1;
                tile.scaleY = 1;
                clearInterval(bounceAnimation);
            }
        }, 16);
    }, 50);
}

function createGridTile(num, x, y) {
    const tile = new Tile(1, createColor(num), num);
    tile.x = x;
    tile.y = y;
    tile.scaleX = 0;
    tile.scaleY = 0;
    tile.landed = true;
    
    setTimeout(() => {
        gridTiles.push(tile);
        
        // Pop-in animation
        let scale = 0;
        const popAnimation = setInterval(() => {
            scale += 0.1;
            if (scale <= 1.1) {
                tile.scaleX = scale;
                tile.scaleY = scale;
            } else if (scale <= 1.3) {
                tile.scaleX = 1.1 - (scale - 1.1) * 0.5;
                tile.scaleY = 1.1 - (scale - 1.1) * 0.5;
            } else {
                tile.scaleX = 1;
                tile.scaleY = 1;
                clearInterval(popAnimation);
            }
        }, 16);
    }, 5);
}

function createTile(randNum, pos, x, y) {
    const tiles = [2, 4, 8, 16, 32, 64, 128];
    const num = Math.floor(Math.random() * tiles.length);
    if (!randNum) randNum = tiles[num];
    const color = createColor(randNum);
    if (!initialCount) numPos = 0;
    const tile = new Tile(numPos, color, randNum);
    if (pos === 'launcher') launcherTiles.push(tile);
    initialCount = true;
    numPos = 1;
}

function handleGame() {
    if (isPaused || gameOver) return;
    
    // Draw columns
    columns.forEach(col => {
        col.draw();
        if (clicked(col)) {
            clickedIndex = Array.from(columns).indexOf(col);
        }
    });
    
    // Draw launcher
    launcher.draw();
    
    // Draw launcher tiles
    launcherTiles.forEach(tl => {
        tl.draw();
    });
    
    // Draw grid tiles
    gridTiles.forEach(tl => {
        tl.draw();
    });
    
    // Update and draw particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Update and draw floating texts
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);
    floatingTexts.forEach(ft => {
        ft.update();
        ft.draw();
    });
    
    // Handle tile launching
    if (isClicked && launcherTiles.length > 0 && clickedIndex >= 0) {
        const tag = columns[clickedIndex];
        if (tag) {
            launcherTiles[0].update(tag);
        }
    }
    
    // Check game over condition - only if tiles block the launcher area
    checkGameOver();
}

function checkGameOver() {
    // Check if any column is completely filled up to the launcher area
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        let hasTileNearLauncher = false;
        
        for (let j = 0; j < gridTiles.length; j++) {
            const tile = gridTiles[j];
            if (Math.abs(tile.x - column.x) < columnWidth / 2 &&
                tile.y <= launcher.y - launcher.radius) {
                hasTileNearLauncher = true;
                break;
            }
        }
        
        if (!hasTileNearLauncher) {
            return; // At least one column has space
        }
    }
    
    // All columns are blocked
    gameOver = true;
    showGameOver();
}

function showGameOver() {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(`Best: ${bestScore}`, canvas.width / 2, canvas.height / 2 + 60);
    
    ctx.font = '18px Arial';
    ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 110);
    ctx.restore();
}

function restartGame() {
    launcherTiles = [];
    gridTiles = [];
    particles = [];
    floatingTexts = [];
    score = 0;
    combo = 0;
    gameOver = false;
    isClicked = false;
    clickedIndex = -1;
    initialCount = false;
    scoreEl.textContent = score;
    
    for (let i = 0; i < 2; i++) {
        createTile(null, 'launcher');
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleGame();
    requestAnimationFrame(animate);
}

// Initialize game
createColumns();
for (let i = 0; i < 2; i++) {
    createTile(null, 'launcher');
}
animate();

function clicked(element) {
    return (touchX >= element.x && touchX <= element.x + element.width &&
            touchY >= element.y && touchY <= element.y + element.height);
}

function getClickedCol() {
    return columns[clickedIndex];
}

// Event listeners
canvas.addEventListener('click', (e) => {
    if (gameOver) {
        restartGame();
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    touchX = e.x - rect.left;
    touchY = e.y - rect.top;
    
    // Only set isClicked if we actually clicked a column
    for (let i = 0; i < columns.length; i++) {
        if (clicked(columns[i])) {
            clickedIndex = i;
            isClicked = true;
            break;
        }
    }
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
});

startBtn.addEventListener('click', () => {
    screen1.style.display = 'none';
    screen2.style.display = 'block';
    restartGame();
});

window.addEventListener('resize', (e) => {
    canvas.width = e.currentTarget.innerWidth * 0.85;
    canvas.height = e.currentTarget.innerHeight * 0.8;
    createColumns();
});