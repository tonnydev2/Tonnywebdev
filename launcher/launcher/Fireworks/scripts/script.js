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
				for(let i=0; i<20; i++){
				particles.push(new Particle());
}
});
canvas.addEventListener('touchmove',function(e){
				touch.x = e.touches[0].clientX;
				touch.y = e.touches[0].clientY;
				for(let i=0; i<20; i++){
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
								this.size = Math.random() * 10 + 1;
								this.speedX = Math.random() * 6 - 3;
								this.speedY = Math.random() * 6 - 3;
								this.color = `hsl(${hue},100%,50%)`;
				}
				draw(){
								ctx.fillStyle = this.color;
								ctx.beginPath();
								ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
								ctx.fill();
				}
				update(){
								hue++;
								this.x += this.speedX;
								this.y += this.speedY;
								if(this.size > 0.2){
												this.size -= 0.1;
								}
				}
}


function handleParticles(){
				for(let i=0; i<particles.length;i++){
								particles[i].draw();
								particles[i].update();
								for(let j=i; j<particles.length; j++){
												const dx = particles[i].x - particles[j].x;
												const dy = particles[i].y - particles[j].y;
												const distance = Math.sqrt(dx * dx + dy * dy);
												
												if(distance < 200){
																ctx.strokeStyle = particles[j].color;
																ctx.lineWidth = particles[i].size/3;
																ctx.beginPath();
																ctx.moveTo(particles[i].x,particles[i].y);
																ctx.lineTo(particles[j].x,particles[j].y);
																ctx.stroke();
												}
								}
								if(particles[i].size < 0.2){
												particles.splice(i,1);
												i--;
								}
				}
}
function animate(){
				ctx.fillStyle = 'rgba(0,0,0,1)';
				ctx.fillRect(0,0,canvas.width,canvas.height);
				handleParticles();
				requestAnimationFrame(animate);
}
animate();