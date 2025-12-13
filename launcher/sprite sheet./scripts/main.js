import {Background} from './background.js'; 
import {InputHandler} from './input.js';
import {Player} from './player.js'
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 350;
canvas.height = 350;

   class Game{
   				constructor(width,height){
   								this.width = width;
   								this.height = height;
   								this.speed = 0;
   								this.maxSpeed = 3;
   								this.groundMargin = 60;
   								this.input = new InputHandler();
   								this.player = new Player(this);
   								this.background = new Background(this);
   				}
   				update(deltaTime){
   								this.player.update(this.input.keys,deltaTime);
   						
   				}
   				draw(){
   								this.background.draw(ctx);
   								this.player.draw(ctx);
   				}
   }
  
 const game = new Game(canvas.width,canvas.height);
  console.log(game);
let lastTime = 0;
function animate(timeStamp){
				  const deltaTime = timeStamp-lastTime;
				  lastTime = timeStamp;
				  ctx.clearRect(0,0,canvas.width,canvas.height);
  				game.draw();
    game.update(deltaTime);
				  requestAnimationFrame(animate);
}
animate(0);
				   

  
