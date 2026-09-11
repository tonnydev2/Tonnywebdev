const container = document.querySelector('.board');
const board = ['','','','','','','','',''];
for(let i=0; i<board.length;i++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.addEventListener('click', ()=> handleCellClick(i));
    container.appendChild(cell);
}

let gamePoints = 0;
const cells = document.querySelectorAll('.cell');
const players = ['o','x'];
const  currentPlayer = 'x'
const aiPlayer = 'o';
updateDisplay();

const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
let gameActive = true;
function handleCellClick(index){
    if(!gameActive || board[index] !== '') return;
        board[index] = currentPlayer;
        cells[index].style.color = 'green';
        updateDisplay(); 
       
        
    
      if(checkWinForPlayer('x')){
          feedback.innerHTML = 'Player X won!';
          gameActive = false;
          setTimeout(()=>{
              resetGame();
          },2000);
          return;
      }
    
    if(board.every(cell => cell !== '')){
          feedback.innerHTML = 'Its a draw';
          gameActive = false;
          setTimeout(()=>{
              resetGame();
          },2000);
        return;
      }
         
        setTimeout(()=>{
          if(gameActive){  
            const aiPlay = aiMove();
            board[aiPlay] = aiPlayer;
            cells[aiPlay].style.color = 'red';
            cells[aiPlay].innerHTML = board[aiPlay];
            if(checkWinForPlayer('o')){
          feedback.innerHTML = 'Player O won!';
          gameActive = false;
          setTimeout(()=>{
              resetGame();
          },2000);
            }
          }
        },500);
    getPoints();
    }
function checkWinForPlayer(player) {
    return winPatterns.some(pattern => {
        return pattern.every(index => board[index] === player);
    });
}


function resetGame(){
    gameActive = true;
    for(let i=0; i<board.length; i++){
        board[i] = '';
        updateDisplay();
    }
    
    feedback.innerHTML = 'Tik Tac Toe board game';
}
function updateDisplay(){
    cells.forEach((cell,index) => {
        cell.innerHTML = board[index];
    });
}
const arrFound = [];
function getPoints(){
    let pattern = [];
    let found;
    winPatterns.forEach(pt => pattern.push(pt.slice(0,2)));
    if(pattern.some(pat => pat.every(it => board[it] === 'x'))){
        found = pattern.find(pat => pat.every(it => board[it] === 'x')) || '';
        if(found && arrFound.indexOf(found === -1))arrFound.push(found);
        if(arrFound.includes(found)) console.log('true');
        else console.log('false');
        console.log(arrFound.length);
        console.log(arrFound);
        updatePoints();
        return;
    }
    else{
        board.forEach(b => {
        if(b === 'x') gamePoints += 1;
        updatePoints();
        return;
    });
    }
}
function aiMove(){
    for(let i=0; i<board.length; i++){
        if(board[i] === ''){
            board[i] = 'o';
            if(checkWinForPlayer('o')){
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    
for(let i=0; i<board.length; i++){
    if(board[i] === ''){
        board[i] = 'x';
        if(checkWinForPlayer('x')){
            board[i] = '';
            return i;
        }
        board[i] = '';
    }
  }
    if(board[4] === '') return 4;
    const corners = [0,2,6,8];
    const emptyCorners = corners.filter(index => board[index] === '');
    if (emptyCorners.length > 0)return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    
    const edges = [1,3,5,7];
    const emptyedges = edges.filter(index => board[index] === '');
    if(emptyedges.length > 0) return emptyedges[Math.floor(Math.random() * emptyedges.length)];
    
    return null;
}
function updatePoints(){
    const elem = document.querySelector('.gamePoints');
    elem.innerHTML = gamePoints;
    elem.classList.add('pulse');
    setTimeout(()=>{
        elem.classList.remove('pulse');
    },3000);
}