import { canvas, ctx } from './main.js';

export class Enemy{
			constructor(x,y, game){
						this.game = game;
						this.x = x;
						this.y = y;
						this.radius = 10;
						this.color = 'blue';
						this.velocityX = 1;
						this.velocityY = 1;
						this.tan = Math.random() * 0.5 + 0.5;
						this.angle;
						this.health = 100;
						this.routeNum = 0;
			}
			draw(){
						ctx.fillStyle = this.color;
						ctx.beginPath();
						ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
						ctx.fill();
						
						ctx.fillStyle = 'black';
						ctx.font = '20px Arial';
						ctx.fillText(this.health, this.x , this.y - this.radius);
			}
			toRad(angle){
						angle = 360 - angle;
						const ang = angle * Math.PI/180;
						return ang;
			}
			toDeg(angle){
						return angle * 180/Math.PI;
			}
			update(){
						const dx = this.game.route[this.routeNum].x - this.x;
						const dy = this.game.route[this.routeNum].y - this.y;
						const distance = Math.hypot(dx,dy);
						this.animateToTarget(this, this.game.route[this.routeNum]);
						
						
						if(distance <= this.radius && this.routeNum < this.game.route.length - 1) this.routeNum++;
			}
			animateToTarget(first, second){
						const opposite = first.y - second.y;
						const adjascent = first.x - second.x;
						//this.tangent = -this.opposite/this.adjascent;
						const mm = first.toDeg(Math.atan2(opposite,adjascent));
						first.angle = mm < 0 ? 180 - mm : 180 - mm;
						first.velocityX = Math.cos(first.toRad(first.angle)) * first.tan;
						first.velocityY = Math.sin(first.toRad(first.angle)) * first.tan;
						
						first.x += first.velocityX;
						first.y += first.velocityY;
			}
}

