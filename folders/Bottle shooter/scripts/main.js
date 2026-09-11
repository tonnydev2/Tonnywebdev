import { Rocks, collision as rockCollision } from './rocks.js';
import { Bottles, collisionBallRect, collisionWithRect } from './bottles.js';
import { Grounds } from './grounds.js';
import { detectCollision as lineCollision, collisionBallGround, collisionBallRock, collisionBottleGround, collisionBottleRock, collisionRockGround } from './physicsFunctions.js';
import { Ball, drawTrajectory, launchBall, calculateBallVel, dragBall } from './ball.js';
import { buildLevel } from './levels.js';
export const canvas = document.getElementById('canvas1');
export const ctx = canvas.getContext('2d');
const uiOverlay = document.getElementById('ui-overlay');

// ========== GAME STATES ==========
const GameState = {
    INTRO: 'intro',
    LEVEL_SELECT: 'levelSelect',
    PLAYING: 'playing',
    LEVEL_COMPLETE: 'levelComplete',
    GAME_OVER: 'gameOver',
}
let currentState = GameState.INTRO;
let currentLevel = 1;
let unlockedLevels = 1;
const MAX_LEVELS = 6;

// Ball management
let ballsRemaining = 3;
const MAX_BALLS = 3;

// ========== ORIENTATION HANDLING ==========
function checkOrientation() {
    if (window.innerHeight > window.innerWidth) {
        if (!document.getElementById('orientationAlert')) {
            const alert = document.createElement('div');
            alert.id = 'orientationAlert';
            alert.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                background: rgba(0,0,0,0.9);
                color: white;
                text-align: center;
                padding: 15px;
                font-size: 18px;
                z-index: 1000;
                pointer-events: none;
                font-family: Arial, sans-serif;
            `;
            alert.textContent = '↻ Please rotate your device to landscape for better experience';
            document.body.appendChild(alert);
        }
    } else {
        const alert = document.getElementById('orientationAlert');
        if (alert) alert.remove();
    }
}

checkOrientation();
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

// ========== CANVAS RESIZE ==========
function resizeCanvas() {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
        const widthRatio = canvas.width / oldWidth;
        const heightRatio = canvas.height / oldHeight;
        
        if (currentBall) {
            currentBall.x *= widthRatio;
            currentBall.y *= heightRatio;
            currentBall.origX = catap.x * widthRatio;
            currentBall.origY = catap.y * heightRatio;
        }
        
        rocks.forEach(rock => {
            rock.x *= widthRatio;
            rock.y *= heightRatio;
        });
        
        catap.x *= widthRatio;
        catap.y *= heightRatio;
        
        bottles.forEach(bottle => {
            bottle.x *= widthRatio;
            bottle.y *= heightRatio;
        });
        
        grounds.forEach(g => {
            g.x *= widthRatio;
            g.y *= heightRatio;
        });
        
        if (currentBall) {
            currentBall.x = Math.max(currentBall.radius, Math.min(currentBall.x, canvas.width - currentBall.radius));
            currentBall.y = Math.max(currentBall.radius, Math.min(currentBall.y, canvas.height - currentBall.radius));
        }
    
    checkOrientation();
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', resizeCanvas);

// ========== UI MANAGEMENT ==========
function showScreen(screenId) {
    document.querySelectorAll('.ui-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }
    
    const hud = document.getElementById('game-hud');
    if (hud) {
        hud.classList.toggle('hidden', currentState !== GameState.PLAYING);
    }
}

function createUIScreens() {
    uiOverlay.innerHTML = `
        <div id="intro-screen" class="ui-screen">
            <h1 class="game-title">BOTTLE SHOOTER</h1>
            <p class="game-subtitle">Drag the ball, aim, and release to knock bottles off platforms!</p>
            <button class="ui-button green" id="play-btn">PLAY</button>
        </div>
        
        <div id="level-select-screen" class="ui-screen hidden">
            <h1 class="game-title">SELECT LEVEL</h1>
            <div class="level-grid" id="level-grid"></div>
            <button class="ui-button red" id="back-to-intro-btn">BACK</button>
        </div>
        
        <div id="level-complete-screen" class="ui-screen hidden">
            <h1 class="game-title">LEVEL COMPLETE!</h1>
            <button class="ui-button green" id="next-level-btn">NEXT LEVEL</button>
            <button class="ui-button" id="level-select-btn">LEVEL SELECT</button>
        </div>
        
        <div id="game-over-screen" class="ui-screen hidden">
            <h1 class="game-title">GAME OVER</h1>
            <p class="game-subtitle">No balls remaining!</p>
            <button class="ui-button green" id="retry-level-btn">RETRY</button>
            <button class="ui-button" id="game-over-menu-btn">LEVEL SELECT</button>
        </div>
        
        <div id="game-hud" class="hidden">
            <div class="hud">
                <div>Level: <span id="hud-level">1</span></div>
                <div>Bottles: <span id="hud-bottles">0</span></div>
                <div>Balls: <span id="hud-balls">3</span></div>
            </div>
            <div class="hud-buttons">
                <button class="ui-button orange hud-btn" id="reset-btn">↻</button>
                <button class="ui-button red hud-btn" id="menu-btn">≡</button>
            </div>
        </div>
    `;
    
    const levelGrid = document.getElementById('level-grid');
    for (let i = 1; i <= MAX_LEVELS; i++) {
        const btn = document.createElement('button');
        btn.className = `ui-button level-btn ${i > unlockedLevels ? 'locked' : 'green'}`;
        btn.textContent = i;
        if (i <= unlockedLevels) {
            btn.onclick = () => {
                currentLevel = i;
                startLevel(currentLevel);
            };
        }
        levelGrid.appendChild(btn);
    }
    
    document.getElementById('play-btn').onclick = () => {
        currentState = GameState.LEVEL_SELECT;
        updateLevelButtons();
        showScreen('level-select-screen');
    };
    
    document.getElementById('back-to-intro-btn').onclick = () => {
        currentState = GameState.INTRO;
        showScreen('intro-screen');
    };
    
    document.getElementById('next-level-btn').onclick = () => {
        if (currentLevel < MAX_LEVELS) {
            currentLevel++;
            startLevel(currentLevel);
        } else {
            currentState = GameState.LEVEL_SELECT;
            showScreen('level-select-screen');
        }
    };
    
    document.getElementById('level-select-btn').onclick = () => {
        currentState = GameState.LEVEL_SELECT;
        showScreen('level-select-screen');
    };
    
    document.getElementById('retry-level-btn').onclick = () => {
        startLevel(currentLevel);
    };
    
    document.getElementById('game-over-menu-btn').onclick = () => {
        currentState = GameState.LEVEL_SELECT;
        showScreen('level-select-screen');
    };
    
    document.getElementById('reset-btn').onclick = () => {
        resetLevel();
    };
    
    document.getElementById('menu-btn').onclick = () => {
        currentState = GameState.LEVEL_SELECT;
        showScreen('level-select-screen');
        updateLevelButtons();
    };
}

function updateLevelButtons() {
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach((btn, index) => {
        const level = index + 1;
        if (level <= unlockedLevels) {
            btn.classList.remove('locked');
            btn.classList.add('green');
            btn.onclick = () => {
                currentLevel = level;
                startLevel(currentLevel);
            };
        } else {
            btn.classList.add('locked');
            btn.classList.remove('green');
            btn.onclick = null;
        }
    });
}

export function updateHUD() {
    const levelSpan = document.getElementById('hud-level');
    const bottlesSpan = document.getElementById('hud-bottles');
    const ballsSpan = document.getElementById('hud-balls');
    if (levelSpan) levelSpan.textContent = currentLevel;
    if (bottlesSpan) bottlesSpan.textContent = bottles.length;
    if (ballsSpan) ballsSpan.textContent = ballsRemaining;
}

// ========== GAME OBJECTS ==========
export const catap = {
    x: 0.2 * canvas.width,
    y: canvas.height * 0.7,
    width: 30,
    height: 120,
    color: '#8B4513'
};
let currentBall = null;
let activeBalls = []; // Track all active balls for collision
let bottles = [];
let rocks = [];
let grounds = [];

export const restitution = 0.8;

function drawCatap() {
    // Main catapult body
    ctx.fillStyle = catap.color;
    ctx.fillRect(catap.x, catap.y, catap.width, catap.height);
    
    // Base
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(catap.x - 10, catap.y + catap.height - 15, catap.width + 20, 15);
    
    // Wheels
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(catap.x - 5, catap.y + catap.height + 5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(catap.x + catap.width + 5, catap.y + catap.height + 5, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Spoon/cup
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.ellipse(catap.x + catap.width/2, catap.y - 10, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Rubber band indicators
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(catap.x, catap.y + 10);
    ctx.lineTo(catap.x + catap.width/2, catap.y - 5);
    ctx.lineTo(catap.x + catap.width, catap.y + 10);
    ctx.stroke();
}

// ========== GLOBAL GAME OBJECTS ==========
 

// ========== LEVEL DEFINITIONS ==========

            
            

// ========== COLLISION FUNCTIONS ==========

function handleAllCollisions() {
    // Process all active balls
    activeBalls.forEach(ball => {
        if (ball.shouldRemove) return;
        
        grounds.forEach(g => collisionBallGround(ball, g));
        bottles.forEach(b => collisionBallRect(ball, b));
        rocks.forEach(r => collisionBallRock(ball, r));
    });
    
    // Bottle vs Bottle collisions
    for (let i = 0; i < bottles.length; i++) {
        for (let j = i + 1; j < bottles.length; j++) {
            collisionWithRect(bottles[i], bottles[j]);
        }
    }
    
    // Bottle vs Ground collisions
    bottles.forEach(b => grounds.forEach(g => collisionBottleGround(b, g)));
    
    // Bottle vs Rock collisions
    bottles.forEach(b => {
        rocks.forEach(r => collisionBottleRock(b, r));
    });
    
    // Rock vs Rock collisions
    for (let i = 0; i < rocks.length; i++) {
        for (let j = i + 1; j < rocks.length; j++) {
            rockCollision(rocks[i], rocks[j]);
        }
    }
    
    // Rock vs Ground collisions
    rocks.forEach(r => grounds.forEach(g => collisionRockGround(r, g)));
    
    // Bottom boundary for rocks
    rocks.forEach(rock => {
        if (rock.y + rock.radius > canvas.height) { 
            rock.y = canvas.height - rock.radius; 
            rock.speedY *= -0.5; 
        }
    });
}

 function checkLevelComplete() {
    // Check if all bottles have fallen off
    const fallenBottles = bottles.filter(b => {
        const bounds = b.getBounds();
        const isOnBottomFloor = bounds.y + bounds.height >= canvas.height - 50;
        const isSlow = Math.abs(b.speedX) < 1 && Math.abs(b.speedY) < 1;
        return isOnBottomFloor && isSlow;
    });
    
    if (fallenBottles.length === bottles.length && bottles.length > 0) {
        if (currentLevel === unlockedLevels && currentLevel < MAX_LEVELS) {
            unlockedLevels = Math.max(unlockedLevels, currentLevel + 1);
            updateLevelButtons();
        }
        currentState = GameState.LEVEL_COMPLETE;
        showScreen('level-complete-screen');
        return true;
    }
    
    // Check if out of balls AND all active balls have stopped
    const allBallsStopped = activeBalls.every(ball => 
        ball.stopped || ball.shouldRemove || ball.isOnCatap
    );
    
    if (ballsRemaining <= 0 && allBallsStopped) {
        const stillStanding = bottles.filter(b => {
            const bounds = b.getBounds();
            return bounds.y + bounds.height < canvas.height - 15;
        });
        
        if (stillStanding.length > 0) {
            currentState = GameState.GAME_OVER;
            showScreen('game-over-screen');
        }
    }
    
    return false;
}

// ========== INPUT HANDLING ==========
let x, y;

function handleInputStart(clientX, clientY) {
    if (currentState !== GameState.PLAYING) return;
    
    // Check if we have a ball on catapult
    const catapultBall = activeBalls.find(b => b.isOnCatap && !b.launched);
    if (!catapultBall) return;
    
    const rect = canvas.getBoundingClientRect();
    x = clientX - rect.left;
    y = clientY - rect.top;
    
    const dist = Math.hypot(x - catapultBall.x, y - catapultBall.y);
    if (dist < catapultBall.radius + 50) {
        catapultBall.isDragging = true;
        currentBall = catapultBall; // Set as current for dragging
    }
}

function handleInputMove(clientX, clientY) {
    if (currentState !== GameState.PLAYING || !currentBall || !currentBall.isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    x = clientX - rect.left;
    y = clientY - rect.top;
    dragBall(currentBall,x,y);
}

function handleInputEnd() {
    if (currentState === GameState.PLAYING && currentBall && currentBall.isDragging) {
        launchBall(currentBall);
        ballsRemaining--;
        updateHUD();
        
        // Spawn new ball on catapult after delay
        setTimeout(() => {
            if (currentState === GameState.PLAYING && ballsRemaining > 0) {
                const newBall = new Ball(canvas);
                activeBalls.push(newBall);
                updateHUD();
            }
        }, 300); // Small delay before new ball appears
        
        currentBall = null; // Clear current ball reference
    }
}

canvas.addEventListener('touchstart', e => { e.preventDefault(); handleInputStart(e.touches[0].clientX, e.touches[0].clientY); }, {passive: false});
canvas.addEventListener('touchmove', e => { e.preventDefault(); handleInputMove(e.touches[0].clientX, e.touches[0].clientY); }, {passive: false});
canvas.addEventListener('touchend', e => { e.preventDefault(); handleInputEnd(); }, {passive: false});
canvas.addEventListener('mousedown', e => handleInputStart(e.clientX, e.clientY));
canvas.addEventListener('mousemove', e => handleInputMove(e.clientX, e.clientY));
canvas.addEventListener('mouseup', () => handleInputEnd());

// ========== LEVEL MANAGEMENT ==========
function startLevel(level) {function checkLevelComplete() {
    // Check if all bottles have fallen off
    const fallenBottles = bottles.filter(b => {
        const bounds = b.getBounds();
        const isOnBottomFloor = bounds.y + bounds.height >= canvas.height - 15;
        const isSlow = Math.abs(b.speedX) < 1 && Math.abs(b.speedY) < 1;
        return isOnBottomFloor && isSlow;
    });
    
    if (fallenBottles.length === bottles.length && bottles.length > 0) {
        if (currentLevel === unlockedLevels && currentLevel < MAX_LEVELS) {
            unlockedLevels = Math.max(unlockedLevels, currentLevel + 1);
            updateLevelButtons();
        }
        currentState = GameState.LEVEL_COMPLETE;
        showScreen('level-complete-screen');
        return true;
    }
    
    // Check if out of balls AND all active balls have stopped
    const allBallsStopped = activeBalls.every(ball => 
        ball.stopped || ball.shouldRemove || ball.isOnCatap
    );
    
    if (ballsRemaining <= 0 && allBallsStopped) {
        const stillStanding = bottles.filter(b => {
            const bounds = b.getBounds();
            return bounds.y + bounds.height < canvas.height - 15;
        });
        
        if (stillStanding.length > 0) {
            currentState = GameState.GAME_OVER;
            showScreen('game-over-screen');
        }
    }
    
    return false;
}
    buildLevel(level, currentBall, activeBalls, bottles,rocks, grounds);
    ballsRemaining = MAX_BALLS;
    activeBalls = []; // Clear existing balls
    
    // Create initial ball on catapult
    const initialBall = new Ball(canvas);
    activeBalls.push(initialBall);
    
    currentState = GameState.PLAYING;
    showScreen('game-hud');
    updateHUD();
}

function resetLevel() {
    buildLevel(currentLevel, currentBall, activeBalls, bottles, rocks, grounds);
    ballsRemaining = MAX_BALLS;
    activeBalls = [new Ball(canvas)];
    currentBall = null;
    updateHUD();
}

// ========== ANIMATION LOOP ==========
function animate() {
    if (currentState === GameState.PLAYING) {
        // Update all active balls
        activeBalls = activeBalls.filter(ball => {
            ball.update();
            
            // Remove balls that have faded out
            if (ball.shouldRemove && ball.fadeAlpha < 0.05) {
                return false;
            }
            return true;
        });
        
        rocks.forEach(r => r.update());
        bottles.forEach(b => b.update());
        
        handleAllCollisions();
        checkLevelComplete();
        updateHUD();
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw floor
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    
    if ((currentState === GameState.PLAYING || currentState === GameState.LEVEL_COMPLETE || currentState === GameState.GAME_OVER)) {
        grounds.forEach(g => g.draw());
        drawCatap();
        rocks.forEach(r => r.draw());
        bottles.forEach(b => b.draw());
        
        // Draw all active balls
        activeBalls.forEach(ball => ball.draw());
    }
    
    requestAnimationFrame(animate);
}

// Initialize
createUIScreens();
currentBall = new Ball(canvas);
animate();