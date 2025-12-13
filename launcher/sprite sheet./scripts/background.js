export class Background{
				constructor(game){
								this.game = game;
								this.x = 0;
								this.y = 0;
								this.width = 1000;
								this.height = 350;
								this.image = document.getElementById('background');
				}
				update(speed){
								this.x-= speed;
								if(this.x + this.width <= 0){
												this.x = 0;
								}
				}
				draw(context){
								context.drawImage(this.image,this.x,this.y,this.width,this.height);
								context.drawImage(this.image,this.x + this.width,this.y,this.width,this.height);
				}
}

