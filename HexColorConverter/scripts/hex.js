const labels = document.querySelectorAll('label');
const redRange = document.getElementById('redRange');
const greenRange = document.getElementById('greenRange');
const blueRange = document.getElementById('blueRange');
let h1 = '00',h2 = '00',h3 = '00';
const copyBtn = document.getElementById('copy');


redRange.addEventListener('input',(e)=>{
				const value = e.target.value;
				labels[0].innerHTML = value;
				h1 = convertToHex(value);
			textToCopy =	text.innerHTML = '#'+h1+h2+h3;
				fill(display,text.innerHTML);
});
greenRange.addEventListener('input',(e)=>{
				const value = e.target.value;
				labels[1].innerHTML = value;
				h2 = convertToHex(value);
				textToCopy = text.innerHTML = '#'+h1+h2+h3;
				fill(display,text.innerHTML);
});
blueRange.addEventListener('input',(e)=>{
				const value = e.target.value;
				labels[2].innerHTML = value;
				h3 = convertToHex(value);
				textToCopy = text.innerHTML = '#'+h1+h2+h3;
				fill(display,text.innerHTML);
});


function convertToHex(num){
				if(num < 10) return '0'+num;
				
				const num2 = num % 16;
				const num1 = Math.trunc(num/16);
				function convert(number){
								if(number < 10) return number;
								switch(number){
					 case 10: return 'A';
								break;
								case 11: return 'B';
								break;
								case 12: return 'C';
								break; 
								case 13: return 'D';
								break;
								case 14: return 'E';
								break;
								case 15: return 'F';
								break;
								}
				}
				return `${convert(num1)}${convert(num2)}`;
				
}
function fill(element,color){
				element.style.background = color;
}
let textToCopy = document.getElementById('text').innerHTML;
copyBtn.addEventListener('click',async ()=>{
				await navigator.clipboard.writeText(textToCopy);
});