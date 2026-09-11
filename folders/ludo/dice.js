// dice.js - Ensure rollDice method exists
import {dices,canvas,ctx} from './main.js';

export class Dice {
  constructor(x, y, width = 30, height = 30, color = 'red') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.currentValue = 0;
    this.image = dices[this.currentValue];
    this.isRolling = false;
    this.rollInterval = null;
  }
  
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
  
  isPointInside(x, y) {
    return x >= this.x && 
           x <= this.x + this.width && 
           y >= this.y && 
           y <= this.y + this.height;
  }
  
  handleClick() {
    if (this.isRolling) {
      console.log(`${this.color} dice is already rolling!`);
      return;
    }
    
    console.log(`🎲 ${this.color} dice clicked - starting roll...`);
    this.rollDice();
  }
  
  // Public method to roll dice (can be called by AI)
  rollDice() {
    if (this.isRolling) {
      console.log(`${this.color} dice is already rolling!`);
      return;
    }
    
    console.log(`🎲 ${this.color} dice rolling...`);
    this.isRolling = true;
    let count = 0;
    const maxEffects = 15;
    
    if (this.rollInterval) {
      clearInterval(this.rollInterval);
    }
    
    this.rollInterval = setInterval(() => {
      count++;
      
      if (count <= maxEffects) {
        const visualNums = Math.floor(Math.random() * 6);
        this.currentValue = visualNums;
        this.image = dices[this.currentValue];
        this.draw();
      } else {
        clearInterval(this.rollInterval);
        this.isRolling = false;
        
        const roll = Math.floor(Math.random() * 6);
        this.currentValue = roll;
        this.image = dices[this.currentValue];
        this.draw();
        
        console.log(`🎲 ${this.color} dice rolled: ${roll + 1}`);
        
        const rollEvent = new CustomEvent('diceRolled', {
          detail: {
            value: roll + 1,
            color: this.color,
            dice: this
          }
        });
        document.dispatchEvent(rollEvent);
      }
    }, 50);
  }
  
  reset() {
    if (this.rollInterval) {
      clearInterval(this.rollInterval);
      this.isRolling = false;
    }
    this.currentValue = 0;
    this.image = dices[0];
  }
}