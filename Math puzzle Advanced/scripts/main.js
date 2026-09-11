const startBtn = document.querySelector('.start');
const levelEl = document.querySelector('.levelEl');
const puzzleEl = document.querySelector('.puzzle');
const coinDisplay = document.querySelector('.coins');
const equationEl = document.querySelector('.equationEl');
const feedback = document.querySelector('.feedback');
const screens = document.querySelectorAll('.screen');
const difficultyBtns = document.querySelectorAll('.difficulty');
const numberPool = document.querySelector('.numberpool');
const checkBtn = document.getElementById('checkAnswer');
//Game state
let currentLevel = 1;
let currentPuzzle = 1;
let difficulty = 'easy';
let coins = 0;
let currentEquation = {};
let filledSlots = {};
let hiddenPos = [];


startBtn.addEventListener('click',()=>{
			showScreen(screens[1]);
});
difficultyBtns[0].addEventListener('click',()=>{
			showScreen(screens[2]);
			startGame(difficulty);
});
checkBtn.addEventListener('click',()=>{
						let id = '';
						if(hiddenPos.includes(0)) id = 'slotnum1';
						if(hiddenPos.includes(1)) id = 'slotnum2';
						if(hiddenPos.includes(2)) id = 'slotresult';
						checkAnswer(hiddenPos,id);
			});

function startGame(difficulty){
			let num1,num2,operator,result;
			equationEl.innerHTML = '';
			numberPool.innerHTML = '';
			feedback.textContent = 'Please drag numbers to their slots...'
			num1 = Math.floor(Math.random() * 10) + 1;
			num2 = Math.floor(Math.random() * 10) + 1;
			const operators = ['+','-','*','÷'];
			if(difficulty === 'easy'){
						operator = operators[Math.floor(Math.random() * 2)];
						
						if(operator === '+'){
									result = num1 + num2;
						}else{
									result = num1;
									num1 = result + num2;
						}
						let num1El,num2El,resultEl;
						hiddenPos = [Math.floor(Math.random() * 3)];
						if(!hiddenPos.includes(0)) num1El = createNewEl('num', num1);
						else createNewEl('slot', num1,'num1');
						const operEl = createNewEl('oper', operator);
					if(!hiddenPos.includes(1))	num2El = createNewEl('num', num2);
						else createNewEl('slot', num2,'num2');
					const equals = createNewEl('oper', '=');
					if(!hiddenPos.includes(2))	resultEl =  createNewEl('num', result);
						else createNewEl('slot', result, 'result');
						
						const poolNums = generateNumbers(hiddenPos,num1,num2,result);
						poolNums.forEach((num,index) =>{
									const div = document.createElement('div');
									div.className = 'numslot';
									div.innerHTML = num;
									div.id = `num${index}`;
									div.setAttribute('draggable','true');
									div.setAttribute('onDragStart','drag(event)');
									numberPool.appendChild(div);
						});
						const allNums = document.querySelectorAll('.numslot');
			}
			
}

function createNewEl(type, elem, id = ''){
			const div = document.createElement('div');
		if(type === 'num' || type === 'oper')	div.innerHTML = elem;
			if(type === 'num') div.className = 'number';
			else if(type === 'slot'){
						div.className = 'slot';
						div.id = `slot${id}`;
						div.setAttribute('ondrop','drop(event)')
						div.setAttribute('correctValue', elem);
						div.setAttribute('ondragover','allowDrop(event)');
			} 
			else div.className = 'operator';
			equationEl.appendChild(div);
			return div;
}
function showScreen(id){
			screens.forEach(screen => screen.classList.remove('active'));
			id.classList.add('active');
}
function generateNumbers(hidden,num1,num2,result){
			const numbers = new Set();
			let hiddenNum;
						if(hidden.includes(0)) {
									numbers.add(num1);
									hiddenNum = num1;
						}else if(hidden.includes(1)){
									numbers.add(num2);
									hiddenNum = num2;
						}else{
									numbers.add(result);
									hiddenNum = result;
						}
			
			while(numbers.size < 4){
						 const variation = Math.floor(Math.random() * 3) + 1;
			 			Math.random > 0.5 ?
			 			numbers.add(hiddenNum + variation):
			 			numbers.add(hiddenNum - variation);
			 }
			const array = Array.from(numbers);
			return shuffleArray(array);
}
 let isProcessing = false;
 function checkAnswer(hiddenPos,id){
 			if(isProcessing) return;
 			let isCorrect = true;
 			isProcessing = true;
 			const correctValue = document.getElementById(id).getAttribute('correctValue');
 			const userValue = filledSlots[id];
 			if(userValue != correctValue){
 						isCorrect = false;
 			}
 			else{
 						isCorrect = true;
 			}
 			if(isCorrect){
 						feedback.textContent = 'Correct. Well done!';
 						feedback.style.color = 'green';
 						equationEl.style.color = '#00ff00';
 						
 						setTimeout(()=>{
 									resetEqn('easy');
 									currentPuzzle ++;
 									coins ++;
 									puzzleEl.innerHTML = currentPuzzle;
 									coinDisplay.innerHTML = coins;
 									isProcessing = false;
 						},1500);
 			}
 			else{
 						feedback.textContent = 'Incorrect. Try Again!';
 						feedback.style.color = 'red';
 						equationEl.style.color = '#ff0000';
 						isProcessing = false;
 			}
 }
function shuffleArray(array){
			for(let i=array.length-1; i>0; i--){
						const j = Math.floor(Math.random() * (i+1));
						[array[i],array[j]] = [array[j],array[i]];
			}
			return array;
}

function resetEqn(difficulty){
			startGame(difficulty);
}

function drop(ev){
			ev.preventDefault();
			const data = ev.dataTransfer.getData("text");
			const draggedElement = document.getElementById(data);
            
            // Only allow dropping if the slot is empty
                const clone = draggedElement.cloneNode(true);
                clone.removeAttribute('draggable');
                clone.removeAttribute('ondragstart');
                clone.style.cursor = 'default';
                clone.style.margin = '0';
                ev.target.appendChild(clone);
                
                // Record the filled slot
                const slotId = ev.target.id;
                filledSlots[slotId] = parseInt(clone.textContent);
			               
}
function drag(ev) {
			ev.dataTransfer.setData("text", ev.target.id);
}
 function allowDrop(ev) {
 			ev.preventDefault();
 }
