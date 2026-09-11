import { Player } from './player.js';
import { Enemies } from './enemies.js';
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const background = document.getElementById('background');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let x,y;
let oldX, newX;
let swipe = {
			left: false,
			right: false,
}
let moveMade = false;
canvas.addEventListener('touchstart',(e)=>{
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
			oldX = x;
});
canvas.addEventListener('touchmove',(e)=>{
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
			newX = x;
});
canvas.addEventListener('touchend',(e)=>{
			 const wipe = oldX - newX;
			 if(wipe > 50) {
			 			swipe.left = true;
			 			swipe.right = false;
			 }
			 else if(wipe < -50){
			 			swipe.right = true;
			 			swipe.left = false;
			 }
			 else {
			 			 swipe.right = false;
			 			 swipe.left = false;
			 }
			changePlayerPos();
			 
});
 

class Game{
			constructor(width,height,ctx){
						this.width = width;
						this.height = height;
						this.ctx = ctx;
						this.barHeight = 50;
						this.score = 10;
						this.roadWidth = this.width/3;
						this.roads = [
						{start: 0, end: this.roadWidth},{start: this.roadWidth, end: this.roadWidth * 2}, {start: this.roadWidth * 2, end: this.roadWidth * 3}
						];
						this.swipeLeft = swipe.left;
						this.swipeRight = swipe.right;
						this.player = new Player(this);
						this.enemies = [new Enemies(this, 1)];
						this.life = Math.round(this.player.health/25);
						this.heart = '❤️';
						this.health = this.heart.repeat(this.life);
						this.enemyTimer = 0;
						this.enemyInterval = 300;
						this.kill = {
									score: 6,
									x: undefined,
									y: undefined,
									alpha: 1,
						}
						this.kills = [];
			}
			draw(){
						this.ctx.drawImage(background,0,this.barHeight,this.width,this.height);
					//	ctx.strokeStyle = '#333';
						ctx.beginPath();
						ctx.moveTo(this.roadWidth,this.barHeight);
						ctx.lineTo(this.roadWidth,this.height);
						ctx.setLineDash([5, 5]);
						//ctx.stroke();
						ctx.beginPath();
						ctx.moveTo(this.roadWidth * 2,this.barHeight);
						ctx.lineTo(this.roadWidth * 2,this.height);
						ctx.setLineDash([5, 5]);
				//		ctx.stroke();
						this.player.draw();
						this.enemies.forEach(enemy => enemy.draw());
						this.ctx.fillStyle = 'blue';
						this.ctx.fillRect(0,0,this.width,this.barHeight);
						this.ctx.fillStyle = '#f0f0f0';
						this.ctx.font = '25px Arial';
						this.ctx.fillText(`Armos: ${this.score}`, 10, this.barHeight/2);
						this.ctx.fillText(`Health: ${this.health}`, this.width * 0.4, this.barHeight/2);
   this.kills.forEach(kill => {
   			let alpha = 1;
   			this.ctx.fillStyle = `rgba(33,33,33,${kill.alpha})`;
   			this.ctx.font = '20px Arial';
   			this.ctx.fillText(kill.score,kill.x,kill.y);
   });
			}
			update(deltaTime){
						this.enemyTimer ++;
						if(this.enemyTimer % this.enemyInterval === 0){
									this.enemies.push(new Enemies(this, Math.floor(Math.random() * 3)));
													if(this.enemyInterval > 120) this.enemyInterval --;
						}
						this.player.update(deltaTime);
						this.enemies.forEach(enemy => enemy.update());
						this.enemies.forEach(enemy =>{
									const enemyIndex = Array.from(this.enemies).indexOf(enemy);
									if(enemy.health <= 0) {
												this.kill.x = enemy.x;
												this.kill.y = enemy.y;
												this.kill.alpha = 1;
												this.kills.push(this.kill);
												this.enemies.splice(enemyIndex, 1);
												this.score += this.kill.score;
									}
									if(collision(this.player,enemy, 50) && this.player.health > 0) this.player.health --;
									this.life = Math.round(this.player.health/25);
									this.health = this.heart.repeat(this.life);
									this.player.projectiles.forEach(proj =>{
												if(collision(proj,enemy,50)){
															if(enemy.health > 0)enemy.health -= 25;
															const index = Array.from(this.player.projectiles).indexOf(proj);
															this.player.projectiles.splice(index, 1);
												}
									})
						});
						this.kills.forEach(kill => {
									Math.random() > 0.5 ? kill.x ++ : kill.x --;
									kill.y --;
									kill.alpha -= 0.01;
   });
			}
}

const game = new Game(canvas.width,canvas.height,ctx);
function changePlayerPos(){
			if(game.player.x == game.player.center.road1 && swipe.left){
									game.player.x = game.player.center.road1;
									
						}else 	if(game.player.x == game.player.center.road1 && swipe.right){
									game.player.x = game.player.center.road2;
									
						}else 	if(game.player.x == game.player.center.road2 && swipe.left){
									game.player.x = game.player.center.road1;
									
						}else 	if(game.player.x == game.player.center.road2 && swipe.right){
									game.player.x = game.player.center.road3;
									
						}else 	if(game.player.x == game.player.center.road3 && swipe.left){
									game.player.x = game.player.center.road2;
									
						}else 	{
									game.player.x = game.player.center.road3;
									
						}
}
function collision(first,second,threshold = 0){
			return !(
			  first.x + first.width < second.x ||
			  first.x > second.x + second.width ||
			  first.y + first.height < second.y ||
			  first.y > second.y + second.height - threshold
			);
}
let lastTime = 0;
function animate(timestamp){
			const deltaTime = timestamp-lastTime;
			lastTime = timestamp;
			ctx.clearRect(0,0,canvas.width,canvas.height);
			game.draw();
			game.update(deltaTime);
			if(game.life > 0)requestAnimationFrame(animate);
			
}
animate(0);

