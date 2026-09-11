import {Plot} from './plots.js';
import {Defender, Projectile } from './defenders.js';
import { MoneyBar, LifeBar } from './statistics.js';
import { Enemy } from './enemies.js';

export const canvas = document.getElementById('canvas1');
export const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export class Game{
			constructor(ctx, canvas){
						this.ctx = ctx;
						this.canvas = canvas;
						this.plots = [];
						this.defenders = [];
						this.fightersPos = [];
						this.touchX;
						this.touchY;
						this.waveComplete = false;
						this.fighters = [];
						this.plotPos = [
						{x: 0, y: 0, width: 150, height: 200},{x: 200, y: 0, width: 100, height: 200}, {x: 350, y: 0, width: 80, height: 500},{x: 0, y: 350, width: canvas.width, height:500}
						];
						this.defenderPos = [
						{x: 20, y: 100}, {x: 235, y: 100}, {x: 350, y: 100}, {x: 50, y: 370}, {x: 300, y: 370}
						];
						this.enemyPos = [
						{x: 170, y: 20}, {x: 20, y: 240}
						];
						this.addEnemy();
						this.enemies = [];
						this.projectiles = [];
						this.route = [{x: 170, y: 240}, {x: 330, y: 240}, {x: 330, y: 0}]
						this.timer = 0;
						this.coins = 1500;
						this.hearts = 15;
						this.defenderCost = 500;
						this.money = String(this.coins).padStart(4);
						this.moneyBar = new MoneyBar(10, 10, this.money);
						this.lifeBar = new LifeBar(80, 10, this.hearts + '/15');
						this.plotWidth = 50;
						this.widthRatio = 1;
						this.heightRatio = 1; 
						this.projectileTimer = 0;
						this.projectileInterval = 60;
						this.plotPos.forEach(pl => {
									this.plots.push(new Plot(pl.x * this.widthRatio,pl.y * this.heightRatio,pl.width * this.widthRatio,pl.height * this.heightRatio,this));
						});
						this.defenderPos.forEach(def =>{
									this.defenders.push(new Defender(def.x,def.y));
						});
						this.enemyPos.forEach(enemy =>{
									this.enemies.push(new Enemy(enemy.x,enemy.y, this));
						});
			}
			addEnemy(){
							for(let i=0; i<3; i++){
									this.enemyPos.push({x: 170 + i, y: 20 + i});
						}
						for(let i=0; i<3; i++){
									this.enemyPos.push({x:  + i, y: 240 + i});
						}
			}
			draw(){
						this.plots.forEach(pl =>{
									pl.draw();
						});
						this.defenders.forEach(def => {
									def.draw();
						});
						if(this.fighters.length > 0){
									this.fighters.forEach(fighter =>{
												fighter.def.drawDefender(fighter.x,fighter.y);
									});
						}
						if(this.enemies.length > 0){
									this.enemies.forEach(enemy =>{
												enemy.draw();
								});
						}
						if(this.projectiles.length > 0){
									this.projectiles.forEach(proj =>{
												proj.draw();
									});
						}
						this.handleDefDraw();
						this.moneyBar.draw();
						this.lifeBar.draw();
						if(this.waveComplete){
									ctx.fillStyle = '#333';
									ctx.font = '30px Arial';
									ctx.fillText('WAVE COMPLETE', canvas.width * 0.3, canvas.height/2);
						}
			}
			handleDefDraw(){
						if(this.timer > 0) return;
						if(this.fightersPos.length > 0 && this.coins >= this.defenderCost){
									this.fightersPos.forEach(fgt =>{
												this.fighters.push({def: this.defenders[fgt.i], x: fgt.x, y: fgt.y});
												if(this.defenders[fgt.i].isPointInside(this.touchX,this.touchY)){
															this.coins -= this.defenderCost;
															this.moneyBar.money = this.coins;
															this.timer ++;
												}
									});
						}
			}
			update(){
						this.enemies.forEach(enemy =>{
									if(enemy) enemy.update();
						});
						this.projectileTimer ++;
						if(this.projectileTimer % this.projectileInterval === 0){
									this.fighters.forEach(fgt =>{
												this.projectiles.push(new Projectile(fgt.x,fgt.y,this));
									});
						}
						this.projectiles.forEach(proj =>{
									if(proj) proj.update();
						});
						this.enemies.forEach(enemy =>{
									this.projectiles.forEach(proj =>{
												if(proj.collision(enemy)){
															let index = Array.from(this.projectiles).indexOf(proj);
															this.projectiles.splice(index, 1);
															enemy.health -= 20;
												}
									});
						});
						
						this.enemies.forEach(enemy =>{
									let distance, reached;
									this.route.forEach(r =>{
												const dx = r.x - enemy.x;
												const dy = r.y - enemy.y;
												distance = Math.hypot(dx,dy);
												reached = distance <= enemy.radius;
									});
									if(enemy.health <= 0){
												let index2 = Array.from(this.enemies).indexOf(enemy);
												this.enemies.splice(index2, 1);
												this.coins += 100;
												this.moneyBar.money = this.coins;
									}
									if(reached){
												let index2 = Array.from(this.enemies).indexOf(enemy);
												this.enemies.splice(index2, 1);
												this.hearts --;
												this.lifeBar.life = this.hearts + '/15';
												if(this.enemies.length <= 0){
															this.waveComplete = true;
												}
									}
						});
			}
}

let game = new Game(ctx, canvas);

window.addEventListener('resize',(e)=>{
			const oldWidth = canvas.width;
			const oldHeight = canvas.height;
			canvas.width = e.currentTarget.innerWidth;
			canvas.height = e.currentTarget.innerHeight;
			const widthRatio = canvas.width/oldWidth;
			const heightRatio = canvas.height/oldHeight;
			game.widthRatio = widthRatio;
			game.heightRatio = heightRatio;
			game.plots.forEach(pl =>{
						pl.x *= widthRatio;
						pl.y *= heightRatio;
						pl.width *= widthRatio;
						pl.height *= heightRatio;
			});
			game.defenders.forEach(def =>{
						def.x *= widthRatio;
						def.y *= heightRatio;
						def.width *= widthRatio;
						def.height *= heightRatio;
			});
			game.moneyBar.x *= widthRatio;
			game.moneyBar.y *= heightRatio;
			game.moneyBar.width *= widthRatio;
			game.moneyBar.height *= heightRatio;
			
			game.lifeBar.x *= widthRatio;
			game.lifeBar.y *= heightRatio;
			game.lifeBar.width *= widthRatio;
			game.lifeBar.height *= heightRatio;
			
			game.projectiles.forEach(proj =>{
						proj.x *= widthRatio;
						proj.y *= heightRatio;
			})
			
			game.fighters.forEach(pos =>{
						pos.x *= widthRatio;
						pos.y *= heightRatio;
			});
			
			game.lifeBar.textSize = game.lifeBar.height/2;
			game.lifeBar.textY = game.lifeBar.y + game.lifeBar.height * 0.6;
			
			game.moneyBar.textSize = game.moneyBar.height/2;
			game.moneyBar.textY = game.moneyBar.y + game.moneyBar.height * 0.6;

			game.route.forEach(r =>{
						r.x *= widthRatio;
						r.y *= heightRatio;
			});
			console.log(game.widthRatio);
			
			game.enemies.forEach(enemy =>{
						enemy.x *= widthRatio;
						enemy.y *= heightRatio;
			});
});
 

function handleClick(){
			game.defenders.forEach((def,index) =>{
						document.addEventListener('click',(e)=>{
						game.timer = 0;
									game.touchX = e.x;
									game.touchY = e.y;
										if(def.isPointInside(e.x,e.y) && game.coins >= game.defenderCost){
												game.fightersPos.push({x: def.x + (def.width/2), y: def.y + (def.height/2), i: index});
									}
							});
				});
}
handleClick();

function animate(){
			ctx.clearRect(0,0,canvas.width,canvas.height);
			game.draw();
			game.update();
			requestAnimationFrame(animate);
}
animate();

