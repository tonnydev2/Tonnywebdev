 import { Standing,Sitting, Running, Jumping, Falling,Rolling, states } from './state.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 91.3;
        this.x = 0;
        this.y = this.game.height - this.height-this.game.groundMargin;
        this.image = document.getElementById('player');
        this.speed = 0;
        this.maxSpeed = 5;
        this.vy = 0;
        this.weight = 1;
        this.baseWeight = 1; // Store base weight
        this.heavyWeight = 2.5; // Heavy weight when pressing down
        this.fps = 20;
        this.frameInterval = 1000/this.fps;
        this.frameTimer = 0;
        
        // Sound tracking
        this.isPlayingRunningSound = false;
        this.runningSound = null;
        this.whimperSound = null;
        this.lastWhimperTime = 0;
        this.whimperCooldown = 3000; // 3 seconds between whimpers
        
        // Initialize all states
        this.states = [
            new Standing(this),
            new Sitting(this),
            new Running(this), 
            new Jumping(this),
            new Falling(this),
            new Rolling(this)
        ];
        this.currentState = this.states[states.SITTING];
        this.currentState.enter();
        
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 5;
        
    }
    
    setState(state,speed) {
        // Stop running sound when changing from running state
        if (this.currentState.state === 'RUNNING' && state !== states.RUNNING) {
            this.stopRunningSound();
        }
        
        // Start running sound when entering running state
        if (state === states.RUNNING && this.currentState.state !== 'RUNNING') {
            this.playRunningSound();
        }
        
        this.currentState = this.states[state];
        this.game.speed = this.game.maxSpeed * speed;
        this.currentState.enter();
    }

    update(input,deltaTime) {
        if (this.game.gameOver) {
            this.stopAllSounds();
            return;
        }
        
        this.currentState.handleInput(input);
        
        // Play whimper sound occasionally when sitting or standing
        this.updateWhimperSound(deltaTime);
        
        // Adjust weight based on down arrow input when in air
        if (input.includes('down') && !this.onGround()) {
            this.weight = this.heavyWeight;
        } else {
            this.weight = this.baseWeight;
        }
        
        // Horizontal movement
        if (input.includes('right')) this.x += this.maxSpeed;
        else if (input.includes('left')) this.x -= this.maxSpeed;
        
        // Boundary checks
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
        
        // Vertical movement (gravity)
        this.y += this.vy;
        if (!this.onGround()) this.vy += this.weight;
        else this.vy = 0;
        
        // Automatic state transitions based on physics
        if (!this.onGround() && this.vy >= 0 && this.currentState.state !== 'ROLLING') {
            this.setState(states.FALLING,1);
        }else if(!this.onGround() && this.vy >= 0 && this.currentState.state === 'ROLLING'){
            this.setState(states.ROLLING,2);
        }else if(!this.onGround() && input.includes('down') && this.currentState.state === 'ROLLING') this.vy = 3;
        
        //Animating sprites
        if(this.frameTimer > this.frameInterval){
            this.frameTimer = 0;
        if(this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = 0;
        } else{
            this.frameTimer += deltaTime;
        }
    }

    draw(context) {
        context.drawImage(
            this.image, 
            this.frameX * this.width, 
            this.frameY * this.height, 
            this.width, 
            this.height, 
            this.x, 
            this.y, 
            this.width, 
            this.height
        );
    }

    onGround() {
        return this.y >= this.game.height - this.height-this.game.groundMargin;
    }
    
    playRunningSound() {
        if (!this.isPlayingRunningSound && !this.game.gameOver) {
            this.runningSound = this.game.soundManager.play('buck', 0.4, true);
            this.isPlayingRunningSound = true;
        }
    }
    
    stopRunningSound() {
        if (this.isPlayingRunningSound && this.runningSound) {
            this.runningSound.pause();
            this.runningSound.currentTime = 0;
            this.isPlayingRunningSound = false;
        }
    }
    
    updateWhimperSound(deltaTime) {
        if (this.game.gameOver) return;
        
        this.lastWhimperTime += deltaTime;
        
        // Play whimper occasionally when sitting or standing
        if (this.lastWhimperTime > this.whimperCooldown && 
            (this.currentState.state === 'SITTING' || this.currentState.state === 'STANDING')) {
            
            // Random chance to play whimper
            if (Math.random() < 0.3) { // 30% chance
                this.playWhimperSound();
                this.lastWhimperTime = 0;
            }
        }
    }
    
    playWhimperSound() {
        if (!this.game.gameOver) {
            this.whimperSound = this.game.soundManager.play('whimper', 0.5);
        }
    }
    
    stopAllSounds() {
        this.stopRunningSound();
        if (this.whimperSound) {
            this.whimperSound.pause();
            this.whimperSound.currentTime = 0;
        }
    }
}