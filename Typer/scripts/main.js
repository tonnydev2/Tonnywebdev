const container = document.querySelector('.text-holder');
const startBtn = document.querySelector('.start');
const pauseBtn = document.querySelector('.pause');
const resetBtn = document.querySelector('.reset');
const feedback = document.querySelector('.feedback');
const range = document.querySelector('.range');
const speedEl = document.querySelector('.speed');
const importBtn = document.querySelector('.import');

let text = `This is my sample text I wrote using JavaScript.
Feel free to intergrate it.`
let timeOut;
let speed = 30;
let isTyping = false;
let resetted = false;
resetBtn.addEventListener('click',()=>{
			container.value = '';
			isTyping = false;
			pauseBtn.style.background = '#4CAF50';
});

startBtn.addEventListener('click',()=>{
			if(!isTyping)typeText(text);
			pauseBtn.style.background = '#4CAF50';
});
pauseBtn.addEventListener('click',()=>{
			clearInterval(timeOut);
			isTyping = false;
			pauseBtn.style.background = 'rgba(0,0,0,0.5)'
});
range.addEventListener('input',(e)=>{
			speed = e.target.value;
			if(speed < 20){
						speedEl.textContent = 'Slow';
			}else if(speed < 60){
						speedEl.textContent = 'Medium';
			}else{
						speedEl.textContent = 'Fast';
			}
})

function typeText(text){
			let typingIndex = 0;
			let typedText = '';
			function type(){
						if(typingIndex < text.length){
									isTyping = true;
									typedText += text.charAt(typingIndex);
									typingIndex++;
									container.value = typedText;
									container.scrollTop = container.scrollHeight;
									const percent = Math.floor((typingIndex/text.length) * 100)
									feedback.textContent = `Typing... ${percent}%`;
									if(percent >= 100) {
												feedback.textContent = 'Complete...';
												isTyping = false;
									}
									timeOut = setTimeout(type,100-speed);
						}
			}
			type();
}
importBtn.addEventListener('click',()=>{
			const input = document.createElement('input');
			input.type = 'file';
			document.body.appendChild(input);
			input.onchange = function(event){;
    const files = event.target.files;
    
    for(let file of files){
        const reader = new FileReader();
        reader.onload = function(e){
            const result = e.target.result;
            
            if(file.type.startsWith('image')){
                alert('File format not allowed!');
            }else{
            			text = result;
            }
        };
        if(file.type.startsWith('image')){
            reader.readAsDataURL(file);
        }else{
            reader.readAsText(file); 
        }
    }
			}
			input.click();
			document.body.removeChild(input);
});



