import {dices,canvas,ctx} from './main.js';
 export class Dice{
  constructor(x, y, width = 100, height = 100, color = 'red') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.currentValue = 0;
    this.image = dices[this.currentValue];
  }
  draw(){
    ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
  }
   isPointInside(x, y) {
    return x >= this.x && 
           x <= this.x + this.width && 
           y >= this.y && 
           y <= this.y + this.height;
  }
  handleClick() {
    let count = 0;
    const maxEffects = 15;
    
    if (window.visualEffectInterval) {
      clearInterval(window.visualEffectInterval);
    }
    
    window.visualEffectInterval = setInterval(() => {
      count++;
      
      if (count <= maxEffects) {
        const visualNums = Math.floor(Math.random() * 6);
        this.currentValue = visualNums;
        this.image = dices[this.currentValue];
        this.draw();
      } else {
        clearInterval(window.visualEffectInterval);
        const roll = Math.floor(Math.random() * 6);
        this.currentValue = roll;
        this.image = dices[this.currentValue];
        this.draw();
        
        // Dispatch a custom event with roll value
        const rollEvent = new CustomEvent('diceRolled', {
          detail: {
            value: roll + 1, // Convert 0-5 to 1-6
            color: this.color,
            dice: this
          }
        });
        document.dispatchEvent(rollEvent);
      }
    }, 50);
  }
}