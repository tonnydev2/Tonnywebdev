const container = document.querySelector('.container');
const ball = document.querySelector('.ball');
const status = document.querySelector('.status');
const notepad = document.querySelector('.text-area');
const fileInput = document.querySelector('.files');
let isTouching = false;
let removeBall = false
let Ball = {
 						x: 0,
 						y: 0,
 			 speedX: 2,
 			 speedY: 2
 			};
function drag(element){
			const rect = container.getBoundingClientRect();
			
			container.addEventListener('touchstart',(e)=>{
						isTouching = true;
						let x = e.touches[0].clientX-rect.left;
						let y = e.touches[0].clientY-rect.top;
						element.style.position = 'absolute';
						element.style.left = x + 'px';
						element.style.top = y + 'px';
						status.textContent = `x: ${x.toFixed(2)},  y: ${y.toFixed(2)}`;
			});
			container.addEventListener('touchmove',(e)=>{
						isTouching = true;
						let x = e.touches[0].clientX-rect.left;
						let y = e.touches[0].clientY-rect.top;
						status.textContent = `x: ${x.toFixed(2)},  y: ${y.toFixed(2)}`;
						element.style.position = 'absolute';
						element.style.left = x + 'px';
						element.style.top = y + 'px';
						Ball.x = x;
						Ball.y = y;
						e.stopPropagation();
						e.preventDefault();
			});
			container.addEventListener('touchend',()=>{
						isTouching = false;
			});
}

 
 function updateBall(){
 			if(isTouching || removeBall) return;
 			Ball.x += Ball.speedX;
 			Ball.y += Ball.speedY;
 			if(Ball.x >= 300) {
 						Ball.x = 300;
 						Ball.speedX *= -1;
 			}
 			else if(Ball.y >= 420){
 						Ball.y = 420;
 						Ball.speedY *= -1;
 			}
 			else if(Ball.x <= 0){
 						Ball.x = 0;
 						Ball.speedX *= -1;
 			}
 			else if(Ball.y <= 0){
 						Ball.y = 0;
 						Ball.speedY *= -1;
 			}
 			Ball.speedY += 0.5;
  	if(Ball.x <= -10) {
  	 						removeBall = true;					
  	 						ball.remove();
  	 						status.innerHTML = 'Enjoy Tonnoid notepad!';

  	 						console.log('y');
  	}
  						ball.style.position = 'absolute';
 			ball.style.left = Ball.x + 'px';
 			ball.style.top = Ball.y + 'px';
 			status.textContent = `x: ${Ball.x.toFixed(2)},  y: ${Ball.y.toFixed(2)}`;
 }
function typeText(text,element){
			 let currentIndex = 0;
			 let typedText = '';
			 function type(){
			 			if(currentIndex < text.length){
			 						typedText += text.charAt(currentIndex);
			 						currentIndex ++;
			 						element.value = typedText;
			 						element.scrollTop = element.scrollHeight;
			 						setTimeout(type,50);
			 			}
			 }
			type();
}
if(!removeBall) drag(ball);
function animate(){
			updateBall();
			requestAnimationFrame(animate);
}
animate();
fileInput.addEventListener('change',(event)=>{
    const files = event.target.files;
    
    for(let file of files){
        const reader = new FileReader();
        reader.onload = function(e){
            const result = e.target.result;
            
            if(file.type.startsWith('image')){
                const image = document.createElement('img');
                image.src = result;
            }else{
                typeText(result,notepad);
            }
        };
        if(file.type.startsWith('image')){
            reader.readAsDataURL(file);
        }else{
            reader.readAsText(file); 
        }
    }
});

