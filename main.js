 import {Player} from './player.js';
import {InputHandler} from './input.js';
import {Background} from './background.js';
import {FlyingEnemy,GroundEnemy} from './enemy .js'

// Sound Manager Class
class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.allSounds = []; // Track all active sounds
    }

    loadSound(name, src) {
        this.sounds[name] = new Audio(src);
        this.sounds[name].load();
        this.sounds[name].preload = 'auto';
    }

    play(name, volume = 1.0, loop = false) {
        if (this.muted || !this.sounds[name]) return null;
        
        try {
            const sound = this.sounds[name].cloneNode();
            sound.volume = volume;
            sound.loop = loop;
            sound.play().catch(e => console.log('Audio play failed:', e));
            this.allSounds.push(sound);
            return sound;
        } catch (e) {
            console.log('Sound play error:', e);
            return null;
        }
    }

    stop(name) {
        if (this.sounds[name]) {
            this.sounds[name].pause();
            this.sounds[name].currentTime = 0;
        }
    }

    stopAll() {
        this.allSounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        this.allSounds = [];
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopAll();
        }
        return this.muted;
    }
}

// Define the collision function at the top level
function detectCollision(element1, element2) {
    return (
        element1.x+10 < element2.x + element2.width &&
        element1.x+10 + element1.width > element2.x &&
        element1.y+10 < element2.y + element2.height &&
        element1.y+10 + element1.height > element2.y
    );
}

window.addEventListener('load',function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 350;
    canvas.height = 300;
    
    class Game{
        constructor(width,height){
            this.width = width;
            this.height = height;
            this.speed = 0;
            this.maxSpeed = 10;
            this.groundMargin = 50;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler();
            this.enemies = [];
            this.blasts = []; // Array for blast effects
            this.enemyTimer = 0;
            this.timerInterval = 2000;
            this.gameOver = false;
            this.health = 100; // Initialize health to 100%
            
            // Initialize sound manager and load sounds
            this.soundManager = new SoundManager();
            this.loadSounds();
            
            // Game sound reference
            this.gameSound = null;
            this.soundsStarted = false;
        }
        
        loadSounds() {
            // Load all sound files from local storage
            this.soundManager.loadSound('buck', 'buck.wav');
            this.soundManager.loadSound('crash', 'crash.wav');
            this.soundManager.loadSound('gameSound', 'gameSound.wav');
            this.soundManager.loadSound('gameOver', 'gameOver.wav');
            this.soundManager.loadSound('whimper', 'whimper.wav');
            this.soundManager.loadSound('tackle', 'tackle.wav');
        }
        
        startGameSounds() {
            if (this.soundsStarted) return;
            
            // Play background game sound (looping) with user interaction
            this.gameSound = this.soundManager.play('gameSound', 0.3,true);
            this.soundsStarted = true;
            
            // If gameSound fails, try to start it on first user interaction
            if (!this.gameSound) {
                const startSoundOnInteraction = () => {
                    this.gameSound = this.soundManager.play('gameSound', 0.3, true);
                    document.removeEventListener('click', startSoundOnInteraction);
                    document.removeEventListener('keydown', startSoundOnInteraction);
                };
                document.addEventListener('click', startSoundOnInteraction);
                document.addEventListener('keydown', startSoundOnInteraction);
            }
        }
        
        update(deltaTime){
            if (this.gameOver) return; // Stop updating if game over
            
            // Start sounds on first update (after user interaction)
            if (!this.soundsStarted) {
                this.startGameSounds();
            }
            
            this.background.update();
            this.player.update(this.input.keys,deltaTime);
            
            if(this.enemyTimer > this.timerInterval){
                this.enemyTimer = 0;
                this.addEnemy();
            }else{
                this.enemyTimer += deltaTime;
            }
            
            // Update enemies and check collisions
            this.enemies.forEach((enemy, index) => {
                enemy.update(deltaTime);
                
                // Check collision for each enemy with player
                if(detectCollision(enemy, this.player)){
                    if (this.player.currentState.state === 'ROLLING') {
                        // Remove enemy and create blast effect
                        this.createBlast(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        this.enemies.splice(index, 1);
                        this.health = Math.min(100, this.health + 5); // Increase health by 5%
                        
                        // Play crash sound when rolling into enemy
                        this.soundManager.play('crash', 0.7);
                    } else {
                        // Decrease health by 20% when not rolling
                        this.health -= 20;
                        this.enemies.splice(index, 1);
                        
                        // Play crash sound when hit by enemy
                        this.soundManager.play('tackle', 0.5);
                        
                        if (this.health <= 0) {
                            this.health = 0;
                            this.gameOver = true;
                            this.handleGameOver();
                        }
                    }
                }
                
                if(enemy.markedDelete) {
                    this.enemies.splice(this.enemies.indexOf(enemy),1);
                }
            });
            
            // Update blast effects
            this.blasts.forEach((blast, index) => {
                blast.update(deltaTime);
                if (blast.markedDelete) {
                    this.blasts.splice(index, 1);
                }
            });
        }
        
        handleGameOver() {
            // Stop all sounds
            this.soundManager.stopAll();
            // Play game over sound
            this.soundManager.play('gameOver', 0.8);
        }
        
        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            
            // Draw blast effects
            this.blasts.forEach(blast => {
                blast.draw(context);
            });
            
            // Draw health bar
            this.drawHealthBar(context);
            
            // Draw game over screen
            if (this.gameOver) {
                this.drawGameOver(context);
            }
        }
        
        drawHealthBar(context) {
            const barWidth = 200;
            const barHeight = 20;
            const x = 10;
            const y = 10;
            
            // Background
            context.fillStyle = 'red';
            context.fillRect(x, y, barWidth, barHeight);
            
            // Health
            context.fillStyle = 'green';
            context.fillRect(x, y, (barWidth * this.health) / 100, barHeight);
            
            // Border
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.strokeRect(x, y, barWidth, barHeight);
            
            // Health text
            context.fillStyle = 'white';
            context.font = '12px Arial';
            context.fillText(`Health: ${Math.round(this.health)}%`, x, y - 5);
        }
        
        drawGameOver(context) {
            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, this.width, this.height);
            
            context.fillStyle = 'white';
            context.font = '30px Arial';
            context.textAlign = 'center';
            context.fillText('GAME OVER', this.width / 2, this.height / 2);
            context.font = '16px Arial';
            context.fillText('Refresh to play again', this.width / 2, this.height / 2 + 30);
        }
        
        createBlast(x, y) {
            this.blasts.push(new BlastEffect(this, x, y));
        }
        
        addEnemy(){
            if(this.speed > 0 && Math.random() > 0.5){
                this.enemies.push(new GroundEnemy(this));
            }
            this.enemies.push(new FlyingEnemy(this));
        }
    }
    
    // Blast Effect Class
    class BlastEffect {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.radius = 5;
            this.maxRadius = 30;
            this.growthRate = 2;
            this.opacity = 1;
            this.fadeRate = 0.05;
            this.markedDelete = false;
        }
        
        update(deltaTime) {
            this.radius += this.growthRate;
            this.opacity -= this.fadeRate;
            
            if (this.radius >= this.maxRadius || this.opacity <= 0) {
                this.markedDelete = true;
            }
        }
        
        draw(context) {
            context.save();
            context.globalAlpha = this.opacity;
            context.fillStyle = 'cyan';
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fill();
            
            // Inner glow
            context.fillStyle = 'white';
            context.beginPath();
            context.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
    }
    
    const game = new Game(canvas.width,canvas.height);
    console.log(game);
    let lastTime = 0;
    
    function animate(timeStamp){
        const deltaTime = timeStamp-lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        game.draw(ctx);
        game.update(deltaTime);
        if (!game.gameOver) {
            requestAnimationFrame(animate);
        }
    }
    
    // Start animation on user interaction to help with autoplay policies
    canvas.addEventListener('click', function() {
        if (lastTime === 0) {
            animate(0);
        }
    });
    
    document.addEventListener('keydown', function() {
        if (lastTime === 0) {
            animate(0);
        }
    });
    
    // Start animation automatically with fallback
    animate(0);
});
    window.addEventListener('close',function(e){
        this.soundManager.stopAll();
    });
