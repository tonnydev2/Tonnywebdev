import {Enemy} from './enemy.js';
import {Background} from './background.js'; 
import {InputHandler} from './input.js';
import {Player} from './player.js';
import {Controls} from './controls.js';
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const box = document.createElement('div');
box.className = 'dialogue-box';
box.id = 'messageBox';
document.body.appendChild(box);
console.log(box);
box.innerHTML = `<h2> Warning Message</h2> <p>Game is paused.\nPlease rotate the screen for better game experience!</p>`;
box.style.display = "none";
function collision(first, second) {
    if (!(first.x > second.x + second.width ||
        first.x + first.width-40 < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)
    ) {
        return true;
    }
}

export class Game{
   				constructor(canvas,context){
   				    this.canvas = canvas;
        this.ctx = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.baseHeight = 720;
   								this.speed = 0;
   								this.maxSpeed = 3;
   								this.groundMargin = 60;
   								this.enemies = [];
   								this.enemy = new Enemy(100,100,this);
   								this.timer = 0;
   				  this.gamePaused = false;  
   								this.gameOver = false;
   							this.resize(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', e => {
            this.resize(e.currentTarget.innerWidth, e.currentTarget.innerHeight);
        });
   				    this.input = new InputHandler(this);
   				    console.log(this.input.keys);
   				}
       resize(width, height){
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.fillStyle = 'red';
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ratio = this.height / this.baseHeight;
           this.player = new Player(this,width/5,height/5);
           this.background = new Background(this,height);
           this.groundMargin * this.ratio;
           this.controls = new Controls(this,width,height,0, height/2);
           this.checkOrientation();
    }
       checkOrientation() {
        const warning = document.getElementById('rotation-warning');
        
        if (this.canvas.width < this.canvas.height) {
            this.isPaused = true;
            box.style.display = 'block';
        } else {
            // Landscape mode - hide warning and resume game
            this.isPaused = false;
            box.style.display = 'none';
        }
    }
    

   				update(deltaTime){
   				    this.controls.buttons[0].setEventListener();
   				    if(this.isPaused || this.gameOver) return;
   								this.timer++;
   								if(this.timer % 500 === 0){
   												this.enemies.push(new Enemy(100,100,this));
   								}
   									 for( let i=0; i<this.enemies.length; i++){
   						 				this.enemies[i].update();
   									 						if(collision(this.player,this.enemies[i])){
   						 												this.enemies[i].speed = 0;
   									 						}
   									 				if(collision(this.player,this.enemies[i]) && this.player.currentState !== this.player.states.punching){
   									 								this.player.health--;
   									 				}
   									 						if(collision(this.player,this.enemies[i]) && this.player.currentState === this.player.states.punching){
   						 												this.enemies[i].health--;
   						 								}
   						 				if(this.enemies[i].x + this.enemies[i].width < 0 || this.enemies[i].health <= 0){
   						 								this.enemies.splice(i,1);
   						 								i--;
   						 								console.log(this.enemies.length);
   						 				}
   								  		 }
   								this.player.update(this.input.keys,deltaTime);
   				}
   				draw(){
   								this.background.draw(ctx);
   								this.player.draw(ctx);
   						 for( let i=0; i<this.enemies.length; i++){
   						 				this.enemies[i].draw(ctx);
   						 }
   				    this.controls.draw(ctx);
   				}
   }

  
 const game = new Game(canvas,ctx);
console.log(canvas.width, canvas.height);

function gameStatus(){
				if(game.gameOver){
								ctx.fillStyle = 'red';
								ctx.font = '50px Arial';
								ctx.fillText('GAME OVER', 50, 150);
				}
}
let lastTime = 0;
function animate(timeStamp){
				  const deltaTime = timeStamp-lastTime;
				  lastTime = timeStamp;
				  ctx.clearRect(0,0,canvas.width,canvas.height);
  				game.draw();
    game.update(deltaTime);
				   gameStatus();
    if(!game.gameOver)requestAnimationFrame(animate);
}

animate(0);
 game.checkOrientation(); 
