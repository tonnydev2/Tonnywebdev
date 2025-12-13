import {positions,places} from './constants.js';
export class Pawn{
				constructor(x,y,color,startX,startY){
								this.x = x;
								this.y = y;
								this.color = color;
								this.radius = 8;
								this.startX = startX;
								this.startY = startY;
				}
				draw(context){
								context.fillStyle = this.color;
								context.beginPath();
								context.lineWidth = 9;
								context.strokeStyle = 'silver';
								context.arc(this.x,this.y,this.radius + 1,0,Math.PI*2);
								context.closePath();
								context.stroke();
								context.beginPath();
								context.lineWidth = 6;
								context.strokeStyle = 'gold';
								context.arc(this.x,this.y,this.radius,0,Math.PI*2);
								context.stroke();
								context.fill();
				}
				isPointInside(x, y) {
    const dx = this.x - x;
								 const dy = this.y - y;
								const distance = Math.sqrt(dx * dx + dy * dy);
								return distance <= this.radius + 5;
  }
				handleClick(){
								this.x = this.startX;
								this.y = this.startY;
								console.log(`pawn ${this.color},x: ${this.x},y: ${this.y} is clicked!`);
				}
}

const pawnRed1 = new Pawn(places.homeRed1[0],places.homeRed1[1],'red',places.startRed[0],places.startRed[1]);
const pawnRed2 = new Pawn(places.homeRed2[0],places.homeRed2[1],'red',places.startRed[0],places.startRed[1]);
const pawnRed3 = new Pawn(places.homeRed3[0],places.homeRed3[1],'red',places.startRed[0],places.startRed[1]);
const pawnRed4 = new Pawn(places.homeRed4[0],places.homeRed4[1],'red',places.startRed[0],places.startRed[1]);

const pawnGreen1 = new Pawn(places.homeGreen1[0],places.homeGreen1[1],'green',places.startGreen[0],places.startGreen[1]);
const pawnGreen2 = new Pawn(places.homeGreen2[0],places.homeGreen2[1],'green',places.startGreen[0],places.startGreen[1]);
const pawnGreen3 = new Pawn(places.homeGreen3[0],places.homeGreen3[1],'green',places.startGreen[0],places.startGreen[1]);
const pawnGreen4 = new Pawn(places.homeGreen4[0],places.homeGreen4[1],'green',places.startGreen[0],places.startGreen[1]);

const pawnBlue1 = new Pawn(places.homeBlue1[0],places.homeBlue1[1],'blue',places.startBlue[0],places.startBlue[1]);
const pawnBlue2 = new Pawn(places.homeBlue2[0],places.homeBlue2[1],'blue',places.startBlue[0],places.startBlue[1]);
const pawnBlue3 = new Pawn(places.homeBlue3[0],places.homeBlue3[1],'blue',places.startBlue[0],places.startBlue[1]);
const pawnBlue4 = new Pawn(places.homeBlue4[0],places.homeBlue4[1],'blue',places.startBlue[0],places.startBlue[1]);

const pawnYellow1 = new Pawn(places.homeYellow1[0],places.homeYellow1[1],'yellow',places.startYellow[0],places.startYellow[1]);
const pawnYellow2 = new Pawn(places.homeYellow2[0],places.homeYellow2[1],'yellow',places.startYellow[0],places.startYellow[1]);
const pawnYellow3 = new Pawn(places.homeYellow3[0],places.homeYellow3[1],'yellow',places.startYellow[0],places.startYellow[1]);
const pawnYellow4 = new Pawn(places.homeYellow4[0],places.homeYellow4[1],'yellow',places.startYellow[0],places.startYellow[1]);


export const redPawns = [pawnRed1,pawnRed2,pawnRed3,pawnRed4];
export const greenPawns = [pawnGreen1,pawnGreen2,pawnGreen3,pawnGreen4];
export const bluePawns = [pawnBlue1,pawnBlue2,pawnBlue3,pawnBlue4];
export const yellowPawns = [pawnYellow1,pawnYellow2,pawnYellow3,pawnYellow4];
