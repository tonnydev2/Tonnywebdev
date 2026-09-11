import { enmSprites } from './constants.js';
export class Enemies{
			constructor(game,road){
						this.game = game;
						this.width = 100;
						this.height = 120;
						this.road = road;
						this.images = enmSprites;
						this.currentFrame = 0;
						this.currentImage = this.images[this.currentFrame];
						this.center = {
									road1: this.game.roads[0].start + (this.game.roadWidth - this.width - (this.game.roadWidth - this.width)/2),
									road2: this.game.roads[1].start + (this.game.roadWidth - this.width - (this.game.roadWidth - this.width)/2),
									road3: this.game.roads[2].start + (this.game.roadWidth - this.width - (this.game.roadWidth - this.width)/2),
						};
						if(this.road === 0) this.x = this.center.road1;
						else if(this.road === 1) this.x = this.center.road2;
						else this.x = this.center.road3;
						this.y = this.game.barHeight - this.height;
						this.color = 'blue';
						this.health = 100;
						this.speedY = Math.random() * 1.5 + 0.5
			}
			draw(){
						//this.game.ctx.fillStyle = this.color;
						//this.game.ctx.fillRect(this.x,this.y,this.width,this.height);
						this.game.ctx.drawImage(this.currentImage,this.x,this.y,this.width,this.height);
						this.game.ctx.fillStyle = '#333';
						this.game.ctx.font = '20px Arial';
						this.game.ctx.fillText(this.health, this.x + (this.width * 0.3), this.y);
			}
			update(){
						this.y += this.speedY;
						this.currentFrame = (this.currentFrame + 1) % enmSprites.length;
						this.currentImage = this.images[this.currentFrame];
			}
}

