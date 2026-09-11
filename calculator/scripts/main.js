const display = document.querySelector('.display');
const del = document.querySelector('.del'); 
const equals = document.querySelector('.equals');
const sinBtn = document.querySelector('.sin');
const cosBtn = document.querySelector('.cos');
const tanBtn = document.querySelector('.tan');
const clear = document.querySelector('.clear');
const logBtn = document.querySelector('.log');
const log10Btn = document.querySelector('.log10');
const power = document.querySelector('.power');
const exp = document.querySelector('.exp');
const pi = document.querySelector('.pi');
let processor = '';
function updateDisplay(text){
			if(evaluated) display.innerHTML = text;
		 else 	display.innerHTML += text;
			evaluated = false;
}
function updateProcessor(text){
			if(evaluated) processor = text;
		 else 	processor += text;
			evaluated = false;
}
let evaluated = false;
const buttons = document.querySelectorAll('.number');
 
			buttons.forEach(button =>{
					button	.addEventListener('click',()=>{
								if(button.innerHTML === '➗') {
											updateProcessor('/');
											updateDisplay('➗');
								}
								else if(button.innerHTML === '➕'){
											updateProcessor('+');
											updateDisplay('➕');
								}
								else if(button.innerHTML === '➖'){
											updateProcessor('-');
											updateDisplay('➖');
								}
								else if(button.innerHTML === '✖️'){
											updateProcessor('*');
											updateDisplay('✖️');
								}
								 else{
											updateDisplay(button.innerHTML);
				  		updateProcessor(button.innerHTML);
								}
			});
});
del.addEventListener('click',()=>{
		 display.innerHTML = 	display.innerHTML.slice(0,-1);
});
equals.addEventListener('click',()=>{
			display.innerHTML = (parseFloat(eval(processor)));
			evaluated = true;
});
sinBtn.addEventListener('click',()=>{
			updateDisplay('sin(');
			updateProcessor('sin(')
});
cosBtn.addEventListener('click',()=>{
			updateDisplay('cos(');
			updateProcessor('cos(')
});
tanBtn.addEventListener('click',()=>{
			updateDisplay('tan(')
			updateProcessor('tan(')
});
clear.addEventListener('click',()=>{
			clearDisplay();
});
log10Btn.addEventListener('click',()=>{
			 updateDisplay(log10Btn.innerHTML+ '(')
			 updateProcessor('logTen(')
});
logBtn.addEventListener('click',()=>{
			 updateDisplay('log(');
			 updateProcessor('log(');
});
 power.addEventListener('click',()=>{
 			 updateDisplay('^');
 			 updateProcessor('**')
});
 pi.addEventListener('click',()=>{
 			updateDisplay('π');
 			updateProcessor('pai()');
 })

function sin(num){
			return Math.sin(num * Math.PI/180);
}
function cos(num){
			return Math.cos(num * Math.PI/180);
}
console.log(cos(60));
function tan(num){
			return Math.tan(num * Math.PI/180);
}
function clearDisplay(){
			display.innerHTML = '';
			processor = '';
			evaluated = false;
}
function log(num){
			return Math.log(num);
}
function logTen(num){
			return Math.log10(num);
}
function pai(){
			return Math.PI;
}
