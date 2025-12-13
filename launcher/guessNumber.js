 function appendNumber(num){
    Input.value += num;
}

const Input = document.getElementById('input');
let attempts = 0;
const btn = document.getElementById('btn');
const randomNum = (Math.random() * 99 + 1).toFixed(0);
const text = document.getElementById('text');
const scenario = `	I chose a number between 1 to 100.
				Can you guess it in not more than 10 attempts`;

typeText(scenario,text);

// Sound configuration
function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play().catch(error => {
        console.log('Audio play failed:', error);
    });
}

function respond(message, delay, color){
    setTimeout(()=>{
        text.innerHTML = 'I chose a number between 1 to 100. Can you guess it in not more than 10 attempts';
        text.style.color = 'black';
    }, delay);
    text.innerHTML = message;
    text.style.color = color;
}
function typeText(text,element){
    let typingIndex = 0;
    let typedText = '';
    function type(){
        if(typingIndex < text.length){
            typedText += text.charAt(typingIndex);
            typingIndex ++;
            element.innerHTML = typedText;
            setTimeout(type ,50);
        }
    }
        type();
        
}
                       
        function speakText(text) {
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.9;
                utterance.pitch = 1.2;
                utterance.volume = 0.8;
                
                // Try to use a female voice if available
                const voices = window.speechSynthesis.getVoices();
                const femaleVoice = voices.find(voice => 
                    voice.name.includes('Female') || 
                    voice.name.includes('woman') || 
                    voice.name.includes('Zira') || 
                    voice.name.includes('Victoria')
                );
                
                if (femaleVoice) {
                    utterance.voice = femaleVoice;
                }
                
                window.speechSynthesis.speak(utterance);
            } 
        }
speakText(scenario);
const sounds = {
    high: 'tooHigh.mp3',
    low: 'tooLow.mp3',
    congrats: 'congratulations.mp3'
}

btn.addEventListener('click', function(){
    attempts++;
    const value = parseInt(Input.value.trim());
    
    if(isNaN(value)){
        alert('Please enter a valid number!');
        attempts--;
        return;
    }
    
    if(value > 100) {
        respond(`"${value}" exceeds the maximum number(100)`, 2000, 'red');
         Input.value = '';
        attempts--;
        return;
    }
    
    if(value < randomNum) {
        respond('Too Low', 1000, 'red');
        playSound(sounds.low);
    }
    else if(value > randomNum) {
        respond('Too High', 1000, 'orange');
        playSound(sounds.high);
    }
   else if(value == randomNum) { // Use == for loose comparison since one is string, one is number
        respond(`Congratulations you guessed the number(${randomNum}) in ${attempts} attempts`, 6000, 'green');
        playSound(sounds.congrats);
        setTimeout(() => {
            location.reload();
        }, 6000);
    }
    
    if(attempts >= 10 && value != randomNum){
        alert(`Exceeded attempts, the number was "${randomNum}".`);
        setTimeout(() => {
            location.reload();
        }, 6000);
    }
    
    Input.value = '';
    Input.focus();
});