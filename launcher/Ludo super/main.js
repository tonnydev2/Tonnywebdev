import {Pawn,redPawns,greenPawns,bluePawns,yellowPawns} from './pawns.js';
import {Dice} from './dice.js';
export const canvas = document.getElementById('canvas1');
export const ctx = canvas.getContext('2d');
canvas.width = 350;
canvas.height = 550;

const images = {
  image1: document.getElementById('dice1'),
  image2: document.getElementById('dice2'),
  image3: document.getElementById('dice3'),
  image4: document.getElementById('dice4'),
  image5: document.getElementById('dice5'),
  image6: document.getElementById('dice6')
};

export const dices = [images.image1, images.image2, images.image3, images.image4, images.image5, images.image6];

class Board {
  constructor() {
    this.x = -1;
    this.y = 100;
    this.width = 350;
    this.height = 350;
    this.image = document.getElementById('ludo');
  }
  
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}


// Create dice at different positions
const dice1 = new Dice(0, 0, 100, 100, 'red');
const dice2 = new Dice(canvas.width - 100, 0, 100, 100, 'green');
const dice3 = new Dice(0, canvas.height - 100, 100, 100, 'blue');
const dice4 = new Dice(canvas.width - 100, canvas.height - 100, 100, 100, 'yellow');

const board = new Board();
// Store all dice in an array for easy checking
const allDice = [dice1, dice2, dice3, dice4];
const allPawns = [redPawns,greenPawns,bluePawns,yellowPawns];
let players = ['red','green','blue','yellow'];
let currentPlayer = 0;
let activePlayer = players[currentPlayer];
// Draw everything
function drawAll() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  board.draw();
  allDice.forEach(dice => dice.draw(ctx));
				redPawns.forEach(pawn => pawn.draw(ctx));
				greenPawns.forEach(pawn => pawn.draw(ctx));
				bluePawns.forEach(pawn => pawn.draw(ctx));
				yellowPawns.forEach(pawn => pawn.draw(ctx));
  
				requestAnimationFrame(drawAll);
}
 function handlePawnMovement(x,y){
document.addEventListener('diceRolled',(e)=>{
 const {value,color} = e.detail;
				for (const pawn of allPawns) {
								if(pawn[0].isPointInside(x,y) && value === 6 && color === 'red') {
												pawn[0].handleClick();
								  return;
								}
										if(pawn[1].isPointInside(x,y) && value === 6 && color === 'green') {
										  if(activePlayer === 'red'){
												pawn[1].handleClick();
												return;
										  }
								}
										if(pawn[2].isPointInside(x,y) && value === 6 && color === 'blue') {
												pawn[2].handleClick();
												return;
								}
										if(pawn[3].isPointInside(x,y) && value === 6 && color === 'yellow') {
												pawn[3].handleClick();
												return;
								}
				}
});
 }

 // Listen for dice roll events
document.addEventListener('diceRolled', (e) => {
  const { value, color } = e.detail;
  console.log(`Player ${color} rolled: ${value}`);
  
  // Store for pawn movement
  window.currentRoll = value;
  
  // Move to next player
  if (currentPlayer >= 3 && value < 6) {
    currentPlayer = 0;
  } else if(value < 6 && currentPlayer < 3){
    currentPlayer++;
  }
  activePlayer = players[currentPlayer];
  console.log(`Next player: ${activePlayer}`);
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  handlePawnMovement(x,y);
  for (const dice of allDice) {
    if (dice.isPointInside(x, y) && dice.color === activePlayer) {
      dice.handleClick();
    }
  }
});
// Initial draw
drawAll();