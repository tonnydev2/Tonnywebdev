window.addEventListener('load',()=>{
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const baseWidth = 384;
const baseHeight = 582;

let score = 0;
const gameOverSound = new Audio();
gameOverSound.src = 'gameOver.wav';

let gameOver = false;
class Game {
    constructor(width, height, ratioX = canvas.width/baseWidth,ratioY = canvas.height/baseHeight) {
        this.width = width;
        this.height = height;
        this.ratioX = ratioX;
        this.ratioY = ratioY;
        this.player = new Player(this);
        this.pipes = [];
        this.timer = 0;
        this.pipeInterval = 240;
        this.speed = 1;
        this.background = new Background(this);
        this.isScoring = false;
        this.frameTimer = 0;
        this.fps = 20;
        this.frameInterval = 1000/this.fps;
        this.timer = 0;
        this.showGameOverText = false; // Fix: Control game over text display
    }
    
    update(deltaTime) {
        if(gameOver) {
            this.showGameOverText = true;
            return;
        }
        
        ctx.fillStyle = '#333';
        ctx.font = `${30 * (this.ratioX + this.ratioY)/2}px Arial`;
        ctx.fillText(`Score: ${score}`,this.width/3,0.1 * this.height);
        if(this.speed < 3)this.speed += 1/1000;
        this.timer += 1;
        
        if(this.timer % this.pipeInterval===0){
            if(this.pipeInterval > 100)this.pipeInterval -= 5;
            const pipe = new Pipe(this);
            const pipe2 = new Pipe2(this, pipe.height);
            this.pipes.push(pipe, pipe2);
        }
        
        this.player.update(deltaTime);
        this.background.update();
        
        for(let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.update();
            
            if(pipe.x < -pipe.width){
                this.pipes.splice(i,1);
                continue;
            }
            
            // Fix 1: Score only for top pipes and check if player actually passed
            if(pipe.constructor.name === 'Pipe' && !pipe.scored) {
                // Check if pipe has passed the player completely
                if(pipe.x + pipe.width < this.player.x) {
                    score++;
                    pipe.scored = true;
                }
            }
            
            if(detectCollision(this.player,pipe)){
                gameOver = true;
                this.showGameOverText = true;
                gameOverSound.play();
            }
        }
    }
    
    draw() {
        this.background.draw();
        this.pipes.forEach(pipe => pipe.draw());
        this.player.draw();
        
        // Fix 2: Draw game over text in draw() method so it persists
        if(this.showGameOverText) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, this.width, this.height);
            
            ctx.fillStyle = 'white';
            ctx.font = `${50 * (this.ratioX + this.ratioY)/2}px Arial`;
            ctx.fillText('GAME OVER', this.width * 0.25, this.height/2);
            ctx.font = `${30 * (this.ratioX + this.ratioY)/2}px Arial`;
            ctx.fillText('Click to Restart', this.width * 0.25, this.height/2 + 50);
        }
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.x = 50 * this.game.ratioX;
        const magnitude = Math.hypot(this.game.ratioX,this.game.ratioY);
        this.height = 70 * this.game.ratioY;
        this.width = this.height;
        this.y = this.game.height / 2;
        this.jumpForce = 5 * this.game.ratioY;
        this.gravity = 0.2 * this.game.ratioY;
        this.speedY = 0;
        this.isJumping = false;
        this.groundMargin = 165 * this.game.ratioY;
        this.images = [
          document.getElementById('frame1'),
          document.getElementById('frame2'),
          document.getElementById('frame3'),
          document.getElementById('frame4'),
        ];
        this.frame = 0;
        this.maxFrame = 3;
        this.fps = 20;
        this.frameInterval = 1000/this.fps;
        this.frameTimer = 0;
        this.image = this.images[this.frame];
        this.sound = new Audio();
        this.sound.src = 'flap.wav';
        
        // Remove old listener to avoid duplicates
        if(this.jumpHandler) {
            canvas.removeEventListener('click', this.jumpHandler);
        }
        
        this.jumpHandler = () => {
            if(!gameOver) {
                this.isJumping = true;
                this.sound.play();
            }
        };
        canvas.addEventListener('click', this.jumpHandler);
    }
    
    animateSprite(deltaTime){
        if(this.frameTimer > this.frameInterval){
            this.frameTimer = 0;
            if(this.frame < this.maxFrame) {
               this.frame++;
            }
            else this.frame = 0;
            this.image = this.images[this.frame];
        }else{
            this.frameTimer += deltaTime;
        }
    }
    
    update(deltaTime) {
        if(gameOver) return;
        
        this.speedY += this.gravity;
        this.y += this.speedY;
        
        if (this.y + this.height > this.game.height - this.groundMargin) {
            this.y = this.game.height - this.height - this.groundMargin;
            this.speedY = 0;
            gameOver = true;
        }
        if (this.y < 0) {
            this.y = 0;
            this.speedY = 0;
        }
        if(this.speedY < 0) this.animateSprite(deltaTime);
        
        if (this.isJumping) {
            this.speedY = -this.jumpForce;
            this.isJumping = false;
        }
    }
    
    draw() {
        ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
    }
}

class Pipe{
    constructor(game){
        this.game = game;
        this.x = this.game.width;
        this.y = 0;
        this.width = 50; 
        this.height = (Math.random() * 150 + 50) * this.game.ratioY;
        this.gradient;   
        this.scored = false;
    }
    update(){
        this.gradient = ctx.createLinearGradient(this.x - 10,this.y,this.width,this.height);
        this.gradient.addColorStop(0,'orange');
        this.gradient.addColorStop(1,'brown');
        this.x -= this.game.speed;
    }
    draw(){
        ctx.fillStyle = this.gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x - 10,this.height - 20,this.width + 20,20);
        ctx.strokeRect(this.x - 10,this.height - 20,this.width + 20,20);
    }
}

class Pipe2{
    constructor(game,pipeHeight){
        this.game = game;
        this.gap = 150 * this.game.ratioY;
        this.x = this.game.width;
        this.y = pipeHeight + this.gap;
        this.width = 50; 
        this.speed = 1;
        this.gradient;
        this.height = 400 * this.game.ratioY;
        this.scored = false;
    }
    update(){
        this.gradient = ctx.createLinearGradient(this.x - 10,this.y,this.width,this.height);
        this.gradient.addColorStop(0,'orange');
        this.gradient.addColorStop(1,'brown');
        this.x -= this.game.speed;
    }
    draw(){
        ctx.fillStyle = this.gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x-10,this.y,this.width + 20,20);
        ctx.strokeRect(this.x-10,this.y,this.width + 20,20);
    }
}

class Background{
    constructor(game){
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.width = 1000;
        this.height = canvas.height;
        this.image = document.getElementById('background');
    }
    update(){
       this.x -= this.game.speed;
       if(this.x + this.width < 0) this.x = 0;        
    }
    draw(){
        ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
        ctx.drawImage(this.image,this.x + this.width,this.y,this.width,this.height);
    }
}

let game = new Game(canvas.width, canvas.height);

function restartGame() {
    gameOver = false;
    score = 0;
    game = new Game(canvas.width, canvas.height);
}

// Fix 3: Separate click handler for restart
canvas.addEventListener('click', (e) => {
    if(gameOver) {
        restartGame();
    }
});

window.addEventListener('resize',(e)=>{
    canvas.width = e.currentTarget.innerWidth;
    canvas.height = e.currentTarget.innerHeight;
    const ratioX = canvas.width/baseWidth;
    const ratioY = canvas.height/baseHeight;
    
    if(!gameOver) {
        const oldScore = score;
        game = new Game(canvas.width, canvas.height, ratioX, ratioY);
        score = oldScore;
    } else {
        game = new Game(canvas.width, canvas.height, ratioX, ratioY);
        game.showGameOverText = true; // Fix: Keep showing game over after resize
    }
});

function detectCollision(first,second){
    const threshold = 8;
    return !(
      first.x + threshold > second.x + second.width ||
      first.x - threshold + first.width < second.x || 
      first.y + threshold > second.y + second.height ||
      first.y - threshold + first.height < second.y
    );
}

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

});