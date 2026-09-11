import {canvas, ctx} from './main.js';

export class MoneyBar{
			constructor(x,y, money){
						this.x = x;
						this.y = y;
						this.width = 60;
						this.height = 40;
						this.color = 'pink';
						this.textSize = this.height/2;
						this.textY = this.y + this.height * 0.6;
						this.money = money;
			}
			draw(){
						ctx.fillStyle = this.color;
						ctx.fillRect(this.x,this.y,this.width,this.height);
						
						ctx.fillStyle = 'black';
						ctx.font = this.textSize + 'px Arial';
						ctx.fillText(this.money, this.x + 5, this.textY);
			}
			update(){
						
			}
}

export class LifeBar{
			constructor(x,y, life){
						this.x = x;
						this.y = y;
						this.width = 60;
						this.height = 40;
						this.textSize = this.height/2;
						this.textY = this.y + this.height * 0.6;
						this.color = 'pink';
						this.life = life;
			}
			draw(){
						ctx.fillStyle = this.color;
						ctx.fillRect(this.x,this.y,this.width,this.height);
						
						ctx.fillStyle = 'black';
						ctx.font = this.textSize + 'px Arial';
						ctx.fillText(this.life, this.x + 5, this.textY);
			}
			update(){
						
			}
}



