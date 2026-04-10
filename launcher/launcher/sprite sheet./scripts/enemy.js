export class Enemy{
				constructor(width,height,game){
								this.width = width;
								this.height = height;
								this.game = game;
								this.speed = 1;
								this.health = 100;
								this.x = this.game.width;
								this.y = this.game.height - this.height - this.game.groundMargin;
				}
				update(){
								this.x-= this.speed;
				}
				draw(ctx){
								ctx.fillStyle = 'red';
								ctx.fillRect(this.x,this.y,this.width,this.width);
				}
}

