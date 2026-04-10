const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particles = [];
window.addEventListener('resize',()=>{
				canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
let touch = {
				x: undefined,
				y: undefined,
}
let hue = 1;
canvas.addEventListener('click',function(e){
				touch.x = e.x;
				touch.y = e.y;
				for(let i=0; i<2; i++){
				particles.push(new Particle());
}
});
canvas.addEventListener('touchmove',function(e){
				touch.x = e.touches[0].clientX;
				touch.y = e.touches[0].clientY;
				for(let i=0; i<10; i++){
				particles.push(new Particle());
}
});
console.log(touch.x,touch.y);
class Particle{
				constructor(){
								this.x = touch.x;
								this.y = touch.y;
								//this.x = Math.random() * canvas.width;
								//this.y = Math.random() * canvas.height;
								this.radius = Math.random() * 10 + 1;
								this.speedX = Math.random() * 6 - 3;
								this.speedY = Math.random() * 6 - 3;
								this.color = `hsl(${hue},100%,50%)`;
								this.sound = new Audio('fireworks.wav');
				}
				draw(){
								ctx.fillStyle = this.color;
								ctx.beginPath();
								ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
								ctx.fill();
				}
				update(){
								
								hue+= 50;
								this.x += this.speedX;
								this.y += this.speedY;
								handleEdgeCollision(this);
				//				if(this.size > 0.2){
									//			this.size -= 0.1;
						//		}
				}
}


function handleParticles(){
				for(let i=0; i<particles.length;i++){
								particles[i].draw();
								particles[i].update();
							 for(let j=i; j<particles.length; j++){
							 				ballCollision(particles[i],particles[j]);
							 				ctx.beginPath();
							 				ctx.strokeStyle = particles[i].color;
							 				ctx.moveTo(particles[i].x,particles[i].y);
							 				ctx.lineTo(particles[j].x,particles[j].y);
							 				ctx.stroke();
						  		if(particles[i].size < 0.2){
											  	particles.splice(i,1);
								  				i--;
								    }
							  	}
								}
				}
function handleEdgeCollision(particle){
				if(particle.x > canvas.width - particle.size){
								particle.speedX = -particle.speedX;
				}
				if(particle.x < particle.size){
								particle.x = particle.size;
								particle.speedX = -particle.speedX;
				}
				if(particle.y + particle.size > canvas.height){
								particle.speedY = -particle.speedY;
				}
				if(particle.y < particle.size){
								particle.speedY = -particle.speedY;
				}
}
   function ballCollision(ball1,ball2){
  				const dx = ball1.x-ball2.x;
  				const dy = ball1.y-ball2.y;
  				const distance = Math.sqrt(dx * dx + dy* dy);
  				
  				if(distance < ball1.radius+ball2.radius){
  								const overlap = (ball1.radius + ball2.radius) - distance;
  								const separateX = overlap *(ball1.x - ball2.x)/distance/2;
  								const separateY = overlap *(ball1.y - ball2.y)/distance/2;
  							 ball1.x += separateX;
  						 ball1.y += separateY;
  								ball2.y -= separateY;
  								ball2.x -= separateX;	
  								const normalX = (ball1.x-ball2.x)/distance;
  								const normalY = (ball1.y-ball2.y)/distance;
  								const tangetX = -normalY;
  								const tangetY = normalX;
  								const nV1 = ball1.speedX * normalX + ball1.speedY * normalY;
  								const tV1 = ball1.speedX * tangetX + ball1.speedY * tangetY;
  								const nV2 = ball2.speedX * normalX + ball2.speedY * normalY;
  								const tV2 = ball2.speedX * tangetX + ball2.speedY * tangetY;
  								const m1 = 2;
  								const m2 = 2;
  								const totalM = 4;
  								const nV1After = (nV1 *(m1-m2)+2 * m2 * nV2)/totalM;
  								const nV2After = (nV2 *(m2-m1)+2 * m1 * nV1)/totalM;
  								ball1.speedX = nV1After * normalX + tV1 * tangetX;
  								ball1.speedY = nV1After * normalY + tV1 * tangetY;
  								ball2.speedY = nV2After * normalY + tV2 * tangetY;
  								ball2.speedX = nV2After * normalX + tV2 * tangetX;
  				}
  }
  
function animate(){
				ctx.fillStyle = 'rgba(0,0,0,0.5)';
				ctx.fillRect(0,0,canvas.width,canvas.height);
				handleParticles();
				requestAnimationFrame(animate);
}


window.addEventListener('load',()=>{
				animate();
});

