class Enemy{
				constructor(){
								this.frameX = 0;
								this.frameY = 0;
								this.fps = 20;
								this.frameInterval = 1000/this.fps;
								this.frameTimer = 0;
				}
				update(deltaTime){
								//Movement
								this.x -= this.speedX + this.game.speed;
								if(this.frameTimer > this.frameInterval){
												this.frameTimer = 0;
												if(this.frameX < this.maxFrame) this.frameX ++;
												else this.frameX = 0;
								}else{
												this.frameTimer += deltaTime;
								}
								if(this.x + this.width < 0) this.markedDelete = true;
				}
				draw(context){
								context.drawImage(this.image,this.frameX * this.width,0,this.width,this.height,this.x,this.y,this.width,this.height);
				}
}
 export class FlyingEnemy extends Enemy{
 				 constructor(game){
 				 				super();
 				 				this.game = game;
 				 				this.width = 60;
 				 				this.height = 44;
 				 				this.x = Math.random() * this.game.width + this.game.width;
 				 				this.y = Math.random() * 30 + 50;
 				 				this.speedX = Math.random() * 2 + 2;
 				 				this.maxFrame = 5;
 				 				this.image = document.getElementById('flies');
 				 				this.markedDelete = false;
 				 				this.angle = 0;
 				 				this.va = Math.random() * 0.1 +0.1;
 				 }
 				update(deltaTime){
 								super.update(deltaTime);
 								this.angle += this.va;
 								this.y += Math.sin(this.angle);
 				}
 }
 export class GroundEnemy extends Enemy {
 				constructor(game){
 								super();
 								this.game = game;
 								this.width= 60;
 								this.height = 87;
 								this.x = this.game.width;
 								this.y = this.game.height-this.height-this.game.groundMargin;
 								this.frameX = 0;
 								this.frameY = 0;
 								this.maxFrame = 1;
 								this.image = document.getElementById('plant');
 								this.speedX = 0;
 								this.speedY = 0;
 				}
 }
 class ClimbingEnemy extends Enemy{
 				
 }
