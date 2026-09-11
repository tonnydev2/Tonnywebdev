import {Game, ctx, canvas} from './main.js';
export class Plot{
			constructor(x, y, width, height, game){
						this.x = x;
						this.y = y;
						this.width = width;
						this.height = height;
						this.color = 'green';
						this.game = game;
			}
			draw(){
						ctx.fillStyle = this.color;
						ctx.fillRect(this.x,this.y,this.width,this.height);
			}
}

