import {index} from './constants.js';
 const animations = [
  // idle frame
[ index[0],index[1],index[2],index[3],index[4],index[5],index[6],index[7],index[8],index[9],index[10],index[11],index[12],index[13],index[14],index[15],index[16],index[17],index[18],index[19] ],
 // running frame
[ index[20],index[21],index[22],index[23],index[24],index[25],index[26],index[27],index[28],index[29],index[30],index[31],index[32],index[33],index[34],index[35],index[36],index[37],index[38],index[39],index[40],index[41],index[42],index[43],index[44],index[45],index[46],index[47],index[48],index[49],index[50],index[51],index[52],index[53],index[54],index[55],index[56],index[57] ],
//jumping frame
[ index[58],index[59],index[60],index[61],index[62],index[63],index[64],index[65],index[66],index[67],index[68],index[69],index[70],index[71],index[72],index[73],index[74],index[75],index[76],index[77],index[78],index[79],index[80],index[81],index[82],index[83],index[84],index[85],index[86],index[87] ],
// k.o frame 
[ index[88],index[89],index[90],index[91],index[92],index[93],index[94],index[95],index[96],index[97],index[98],index[99],index[100],index[101],index[102],index[103],index[104],index[105],index[106],index[107],index[108],index[109],index[110],index[111],index[112],index[113],index[114],index[115],index[116],index[117],index[118],index[119],index[120],index[121],index[122],index[123],index[124],index[125],index[126],index[127],index[128],index[129] ],
// punch frame 
[ index[130],index[131],index[132],index[133],index[134],index[135],index[136],index[137],index[138],index[139]  ]
  ];

 class State{
    constructor(stateName){
        this.states = {
            idle: animations[0],
            running: animations[1],
            jumping: animations[2],
            ko: animations[3],
            punching: animations[4]
        }
        this.stateName = stateName;  // Store the name
        this.currentFrame = 0;  // Add frame counter to base class
    }
    
    // Optional: Add these to base class if all states use them
    getCurrentFrame(){
        return this.states[this.stateName.toLowerCase()][this.currentFrame];
    }
    
    updateFrame(){
        const animation = this.states[this.stateName.toLowerCase()];
        this.currentFrame++;
        if(this.currentFrame >= animation.length) {
            this.currentFrame = 0;
        }
        return this.getCurrentFrame();
    }
}
export class Idle extends State{
    constructor(player){
        super('idle');  // lowercase to match states object
        this.player = player;
        this.currentFrame = 0;
    				  this.player.interval = 50;
    }
    enter(){
        this.player.maxFrame = 20;
        this.currentFrame = 0;
        console.log("Entered idle state");
    }
    
    getCurrentFrame(){
        return this.states.idle[this.currentFrame];
    }
    
    updateFrame(){
        this.currentFrame++;
        if(this.currentFrame >= this.states.idle.length) {
            this.currentFrame = 0;
        }
        return this.getCurrentFrame();
    }
    
    handleInput(input){
        if(input.includes('left') || input.includes('right')) {
            return 'running';
        }
        else if(input.includes('enter')){
            return 'punching';
        }
        else if(input.includes('up')){
            return 'jumping';
        }
        return null;
    }
}
    export class Running extends State{
    constructor(player){
        super('running');  
        this.player = player;
        this.currentFrame = 10;  
    								 
    }
    enter(){
        this.player.maxFrame = 37;
        this.currentFrame = 0; 
        this.player.interval = 10;    				
    }
    
    getCurrentFrame(){
        // Get current frame from the punching animation
        return this.states.running[this.currentFrame];
    }
    
    updateFrame(){
        // Update to next frame
        this.player.game.background.update(5);
        this.currentFrame++;
        if(this.currentFrame >= 28) {
            this.currentFrame = 10;
        }
        return this.getCurrentFrame();
    }
    
    handleInput(input){
    				        if(input.includes('up')) {
            return 'jumping';
        }
        else if(input.includes('down')){
            return 'idle';
        }
    				      else if(input.includes('enter')) return 'punching';
    				      
        return null;
    }
}
    export class Jumping extends State{
    constructor(player){
        super('jumping');  
        this.player = player;
        this.currentFrame = 0;  // Add this
    }
    enter(){
    				  this.player.interval = 30;
        this.player.maxFrame = 30;
        this.currentFrame = 0;  // Reset frame counter
        // Don't return, just set up the state
        console.log("Entered punching state");
    }
    
    getCurrentFrame(){
        // Get current frame from the punching animation
        return this.states.jumping[this.currentFrame];
    }
    
    updateFrame(){
        this.player.game.background.update(7);
        // Update to next frame
        this.currentFrame++;
        if(this.currentFrame >= this.states.running.length) {
            this.currentFrame = 0;
        }
        return this.getCurrentFrame();
    }
    
    handleInput(input){
    				if(this.player.vy >= 0 && this.player.onGround()){
            return 'running';
        }
        return null;
    }
}
 export class KO extends State{
    constructor(player){
        super('ko');  
        this.player = player;
        this.currentFrame = 0;  // Add this
    }
    enter(){
    				  this.player.interval = 100;
        this.player.maxFrame = 42;
        this.currentFrame = 0;  // Reset frame counter
        // Don't return, just set up the state
        console.log("Entered punching state");
    }
    
    getCurrentFrame(){
        // Get current frame from the punching animation
        return this.states.ko[this.currentFrame];
    }
    
    updateFrame(){
        // Update to next frame
        this.currentFrame++;
        if(this.currentFrame >= this.states.ko.length) {
            this.currentFrame = 0;
        }
        return this.getCurrentFrame();
    }
    
    handleInput(input){
        // Return next state name if needed
        return null; // Stay in punching state
    }
}
 export class Punching extends State{
    constructor(player){
        super('punching');  // Changed from 'JUMPING' to 'punching'
        this.player = player;
        this.currentFrame = 0;  // Add this
    }
    enter(){
    				  this.player.interval = 50;
        this.player.maxFrame = 10;
        this.currentFrame = 0;  // Reset frame counter
        // Don't return, just set up the state
        console.log("Entered punching state");
    }
    
    getCurrentFrame(){
        // Get current frame from the punching animation
        return this.states.punching[this.currentFrame];
    }
    
    updateFrame(){
        // Update to next frame
        this.currentFrame++;
        if(this.currentFrame >= this.states.punching.length) {
            this.currentFrame = 0;
        }
        return this.getCurrentFrame();
    }
    
    handleInput(input){
    				if(input.includes('left')){
    				  return 'running';
    }
    				else if(input.includes('up')) {
    								return 'jumping';
    				}
        else if(input.includes('enter')){
            return 'idle';
        }
        return null; 
    }
}