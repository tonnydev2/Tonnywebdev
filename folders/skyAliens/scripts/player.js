import { playerSprites } from './constants.js';
export class Player{
			constructor(game){
						this.game = game;
						this.width =  this.game.roadWidth * 0.7;
						this.height = this.width * 1.5;
						this.speed = 0;
						this.center = {
									road1: this.game.roads[0].start + (this.game.roadWidth - this.width - (this.game.roadWidth - this.width)/2),
									road2: this.game.roads[1].start + (this.game.roadWidth - this.width - (this.game.roadWidth - this.width)/2),
									road3: this.game.roads[2].start + (this.game.roadWidth - this.width - (this.game.roadWidth - this.width)/2),
						};
						this.x = this.center.road3;
						this.y = this.game.height - this.height;
						this.color = '#ff0000';
						this.health = 100;
						this.currentFrame = 0;
						this.images = playerSprites;
						this.frameInterval = 80;
						this.frame = 0;
						this.projectiles = [];
			}
			draw(){
					//this.game.ctx.fillStyle = this.color;
  //this.game.ctx.fillRect(this.x,this.y,this.width,this.height);
						this.game.ctx.drawImage(this.images[this.currentFrame],this.x,this.y,this.width ,this.height);
						this.projectiles.forEach(proj => proj.draw());
			}
			update(deltaTime){
						this.projTimer ++;
						if(this.frame > this.frameInterval){
									this.frame = 0;
									this.currentFrame = (this.currentFrame + 1) % playerSprites.length;
									if(this.currentFrame === 11 && this.game.score > 0) {
												this.projectiles.push(new Projectile(this.x + (this.width * 0.6), this.y + (this.height/2), this));
												this.game.score --;
									}
						}else{
									this.frame += deltaTime;
						}
						this.projectiles.forEach(proj => proj.update());
			}
}

class Projectile{
			constructor(x,y,player){
						this.player = player;
						this.x = x;
						this.y = y;
						this.width = 12;
						this.height = 12;
						this.color = 'orange';
			}
			draw(){
					this.player.game.ctx.fillStyle = this.color;
						this.player.game.ctx.fillRect(this.x,this.y,this.width,this.height);
			}
			update(){
						this.y --;
			}
}

