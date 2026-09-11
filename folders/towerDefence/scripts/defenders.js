import {canvas, ctx} from './main.js';

export class Defender{
			constructor(x,y){
						this.x = x;
						this.y = y;
						this.width = 40;
						this.height = 70;
						this.color = 'orange';
			}
			draw(){
						ctx.fillStyle = this.color;
						ctx.fillRect(this.x,this.y,this.width,this.height);
			}
			drawDefender(x,y){
						ctx.fillStyle = 'red';
						ctx.beginPath();
						ctx.arc(x,y,20,0,Math.PI);
						ctx.fill();
			}
			isPointInside(x,y){
						return (x >= this.x && x <= this.x + this.width &&
						       y >= this.y && y <= this.y + this.height);
			}
			update(){
						
			}
}
export class Projectile{
			constructor(x,y,game){
						this.game = game;
						this.x = x;
						this.y = y;
						this.tan = 10;
						this.angle;
						this.velocityX = 1;
						this.velocityY = 1;
						this.radius = 5;
						this.color = 'orange';
						this.recoilTimer = 0; 
						this.distance;
			}
			draw(){
						ctx.fillStyle = this.color;
						ctx.beginPath();
						ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2);
						ctx.fill();
			}
			toRad(angle){
						angle = 360 - angle;
						const ang = angle * Math.PI/180;
						return ang;
			}
			toDeg(angle){
						return angle * 180/Math.PI;
			}
			animateToTarget(first, second){
						if(first.game.enemies.length <= 0 || first.distance >= 250) return;
						const opposite = first.y - second.y;
						const adjascent = first.x - second.x;
						//this.tangent = -this.opposite/this.adjascent;
						const mm = first.toDeg(Math.atan2(opposite,adjascent));
						first.angle = mm < 0 ? 180 - mm : 180 - mm;
						first.velocityX = Math.cos(first.toRad(first.angle)) * first.tan;
						first.velocityY = Math.sin(first.toRad(first.angle)) * first.tan;
			}
			collision(second){
						const dx = this.x - second.x;
						const dy = this.y - second.y;
						const distance = Math.hypot(dx,dy);
						
						return (distance <= this.radius + second.radius);
			}
			update(){
						if(this.recoilTimer <= 0 && this.game.enemies.length > 0){
									this.game.enemies.forEach(enemy =>{
												const dx = this.x - enemy.x;
												const dy = this.y - enemy.y;
												this.distance = Math.hypot(dx, dy);
												if(this.distance < 250 && enemy){
																		this.animateToTarget(this, enemy);
																		this.recoilTimer++;
															}else{
																		this.velocityX = 0;
																		this.velocityY = 0;
											}
									});
						}
						if(this.game.enemies.length > 0){
									this.x += this.velocityX;
									this.y += this.velocityY;
						}else{
									this.game.waveComplete = true;
						}
						
			}
}

