 const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 350;
canvas.height = 300;

// Sound effects (you'll need to add these audio files to your project)
const sounds = {
    flap: new Audio('flap.wav'),
    score: new Audio('score.wav'),
    gameOver: new Audio('game-over.wav')
};

// Preload sounds and set volume
Object.values(sounds).forEach(sound => {
    sound.volume = 0.3;
    sound.preload = 'auto';
});

class Player {
    constructor(game) {
        this.game = game;
        this.width = 60;
        this.height = 44;
        this.x = 350 - this.width;
        this.y = 220;
        this.color = 'red';
        this.weight = 1;
        this.frameX = 0;
        this.maxFrame = 4;
        this.vy = 0;
        this.interval = 50;
        this.frameTimer = 0;
        this.image = img;
    }
    update(deltaTime) {
        if (this.frameTimer > this.interval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        this.y += this.vy;
        if (this.y < 0) this.y = 0;
        if (this.y > 300 - this.height) this.y = 300 - this.height;
        this.vy += 0.5;
    }
    
    flap() {
        this.vy = -10;
        // Play flap sound
        sounds.flap.currentTime = 0;
        sounds.flap.play().catch(e => console.log('Audio play failed:', e));
    }
    
    draw() {
        ctx.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        ctx.fill();
    }
    onGround() {
        return this.y >= 300 - this.height;
    }
}

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.speed = 5;
        this.pipeInterval = Math.random() * 2000 + 4000;
        this.pipeTimer = 0;
        this.player = new Player(this);
        this.pipes = [new Pipe(this)];
        this.gameOver = false;
        this.score = 0;
        this.passedPipes = new Set(); // Track which pipes we've already scored
        this.gameStarted = false;
        this.nextPipeId = 0; // Unique ID counter for pipes
        
        // Add click handler for flapping
        this.setupControls();
    }
    
    setupControls() {
        canvas.addEventListener('click', () => {
            if (!this.gameOver) {
                if (!this.gameStarted) {
                    this.gameStarted = true;
                }
                this.player.flap();
            }
        });
        
        // Spacebar support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.gameOver) {
                if (!this.gameStarted) {
                    this.gameStarted = true;
                }
                this.player.flap();
                e.preventDefault(); // Prevent spacebar from scrolling
            }
            
            // Restart game with Enter key
            if (e.code === 'Enter' && this.gameOver) {
                this.restart();
            }
        });
    }
    
    update(deltaTime) {
        if (this.gameOver || !this.gameStarted) return;
        
        this.player.update(deltaTime);
        this.pipes.forEach(pipe => {
            pipe.update(deltaTime);
        });
        
        // Check for collisions
        this.checkCollisions();
        
        // Update score and check for passed pipes
        this.updateScore();
        
        // Remove pipes that are off screen
        this.pipes = this.pipes.filter(pipe => !pipe.markedForDeletion);
        
        if (this.pipeTimer > this.pipeInterval) {
            this.pipeTimer = 0;
            this.pipes.push(new Pipe(this, this.nextPipeId++));
        } else {
            this.pipeTimer += deltaTime;
        }
    }
    
    checkCollisions() {
        this.pipes.forEach(pipe => {
            if (this.collision(this.player, pipe)) {
                this.gameOver = true;
                // Play game over sound
                sounds.gameOver.currentTime = 0;
                sounds.gameOver.play().catch(e => console.log('Audio play failed:', e));
            }
        });
    }
    
    updateScore() {
        this.pipes.forEach(pipe => {
            // Score when the pipe's right edge passes the player's left edge
            // And we haven't scored this pipe yet
            if (pipe.x + pipe.width < this.player.x && !this.passedPipes.has(pipe.id)) {
                this.passedPipes.add(pipe.id);
                this.score++;
                // Play score sound
                sounds.score.currentTime = 0;
                sounds.score.play().catch(e => console.log('Audio play failed:', e));
                console.log(`Score updated: ${this.score}, Pipe ID: ${pipe.id}`);
            }
        });
    }
    
    collision(player, pipe) {
        // Player boundaries (with slight padding for better gameplay)
        const playerLeft = player.x + 5;
        const playerRight = player.x + player.width - 5;
        const playerTop = player.y + 5;
        const playerBottom = player.y + player.height - 5;
        
        // Bottom pipe boundaries
        const bottomPipeLeft = pipe.x;
        const bottomPipeRight = pipe.x + pipe.width;
        const bottomPipeTop = pipe.y + pipe.gapDown;
        const bottomPipeBottom = pipe.y + pipe.height;
        
        // Top pipe boundaries
        const topPipeLeft = pipe.x;
        const topPipeRight = pipe.x + pipe.width;
        const topPipeTop = pipe.top - pipe.gapUp;
        const topPipeBottom = pipe.top + pipe.height - pipe.gapUp;
        
        // Check collision with bottom pipe
        const collisionWithBottomPipe = 
            playerRight > bottomPipeLeft &&
            playerLeft < bottomPipeRight &&
            playerBottom > bottomPipeTop &&
            playerTop < bottomPipeBottom;
        
        // Check collision with top pipe
        const collisionWithTopPipe = 
            playerRight > topPipeLeft &&
            playerLeft < topPipeRight &&
            playerBottom > topPipeTop &&
            playerTop < topPipeBottom;
        
        return collisionWithBottomPipe || collisionWithTopPipe;
    }
            
    draw() {
        this.player.draw();
        this.pipes.forEach(pipe => {
            pipe.draw();
        });
        
        // Draw score
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Score: ${this.score}`, this.width / 2, 30);
        
        // Draw start message
        if (!this.gameStarted) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('Click or Press Space to Start', this.width / 2, this.height / 2);
        }
        
        // Draw game over message
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.width, this.height);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px Arial';
            ctx.fillText('Game Over!', this.width / 2, this.height / 2 - 30);
            
            ctx.font = '20px Arial';
            ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 10);
            
            ctx.font = '16px Arial';
            ctx.fillText('Click to Play Again', this.width / 2, this.height / 2 + 50);
        }
    }
    
    restart() {
        this.gameOver = false;
        this.gameStarted = true;
        this.score = 0;
        this.passedPipes.clear();
        this.pipes = [new Pipe(this, this.nextPipeId++)];
        this.player = new Player(this);
        this.pipeTimer = 0;
        this.nextPipeId = 0;
    }
}

class Pipe {
    constructor(game, id) {
        this.game = game;
        this.id = id; // Use the provided ID for scoring tracking
        this.random = Math.random();
        this.x = 0; // Start from the right edge
        this.y = 150;
        this.top = -150;
        this.gapUp = 0;
        this.gapDown = 0;
        this.width = 50;
        this.height = 300;
        this.color = 'blue';
        this.markedForDeletion = false;
        
        // Set gap based on random value
        if (this.random > 0.5) {
            this.gapUp = this.random * 50 + 100;
        } else {
            this.gapDown = this.random * 50 + 100;
        }
    }
    
    update(deltaTime) {
        this.x += this.game.speed;
        
        // Mark for deletion when off screen
        if (this.x > this.game.width) {
            this.markedForDeletion = true;
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y + this.gapDown, this.width, this.height);
        ctx.fill();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.top - this.gapUp, this.width, this.height);
        ctx.fill();
    }
}

const game = new Game(canvas.width, canvas.height);
console.log(game);
let lastTime = 0;

function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw();
    game.update(deltaTime);
    
    requestAnimationFrame(animate);
}
animate(0);

// Add click handler for restarting game
canvas.addEventListener('click', () => {
    if (game.gameOver) {
        game.restart();
    }
});