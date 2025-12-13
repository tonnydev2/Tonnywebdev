import {Background} from './background.js';
import {Idle,Running,Jumping,KO,Punching} from './states.js';
import {images,index} from './constants.js';

export class Player{
    constructor(game){
        this.game = game;
        this.width = 100;
        this.height = 100;
        this.playerSpeed = 0;
        this.x = 30;
        this.y = this.game.height - this.height-this.game.groundMargin;
        
        // Create all states
        this.states = {
            idle: new Idle(this),
            running: new Running(this),
            jumping: new Jumping(this),
            ko: new KO(this),
            punching: new Punching(this)
        };
        
        // Start with punching state
        this.currentState = this.states.idle;
        this.currentState.enter();  // Initialize the state
        this.num = 0;  // Start at frame 0
        this.maxFrame = 30;  // Should be set by the state
        
        // Get initial image
        this.image = this.currentState.getCurrentFrame();
        
        this.vy = 0;
        this.jumpForce = 20;
        this.weight = 1;
        this.interval = 30;
        this.frameTimer = 0;
    }
    
    update(input,deltaTime){
        // Animation update
        if(this.frameTimer > this.interval){
            this.frameTimer = 0;
            
            // Update the frame in the current state
            this.image = this.currentState.updateFrame();
           
            // Check state transitions
            const nextStateName = this.currentState.handleInput(input);
            if(nextStateName && this.states[nextStateName]) {
                this.setState(nextStateName);
            }
        } else {
            this.frameTimer += deltaTime;
        }
        
        // Movement logic (keep as is)
        if(input.includes('left')) {
            this.x += this.playerSpeed;
            this.playerSpeed = this.game.maxSpeed;
        }
        else if(input.includes('right')){
            this.x -= this.playerSpeed;
            this.playerSpeed = this.game.maxSpeed;
        }
        else {
            this.x += this.playerSpeed;
            this.playerSpeed = 0;
        }
        if(this.x < -20) this.x = -20;
        else if(this.x > this.game.width - this.width + 30) this.x = this.game.width - this.width+30;
        if(input.includes('up') && this.onGround()) this.vy -= this.jumpForce;
        this.y += this.vy;
        if(!this.onGround()) this.vy += this.weight;
        else this.vy = 0;
    }
    
    setState(stateName){
        if(this.states[stateName]) {
            this.currentState = this.states[stateName];
            this.currentState.enter();
            this.image = this.currentState.getCurrentFrame();
        }
    }
    
    draw(ctx){
        // Debug: Check if image is valid before drawing
        if(!this.image) {
            console.error("No image to draw!");
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        
        if(!this.image.complete) {
            console.warn("Image not loaded yet:", this.image.src);
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        
        // Try-catch for drawing errors
        try {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } catch(error) {
            console.error("Error drawing image:", error);
            console.error("Image details:", this.image);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    onGround(){
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }
}