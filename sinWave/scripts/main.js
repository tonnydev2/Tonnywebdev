const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 385;
canvas.height = 550;

let ball = {
			x: 5,
			y: 200,
			angle: 0,
}
function drawCircle(x,y,r,fill){
			ctx.beginPath();
			ctx.fillStyle = fill;
			ctx.strokeStyle = 'white';
			ctx.arc(x,y,r,0,2*Math.PI);
			ctx.fill();
}
function drawLine(startX,startY,endX,endY){
			ctx.strokeStyle = 'green';
			ctx.beginPath();
			ctx.moveTo(startX,startY);
			ctx.lineTo(endX,endY);
			ctx.stroke();
}
let pause = false;
document.addEventListener('click',()=>{
			pause = pause === true ? false : true;
			animate();
});
let traj = [];
let alpha = 1;
function animate(){
	 ctx.clearRect(0,0,canvas.width,canvas.height);
			if(ball.x >= canvas.width/2){
						ball.x += 0;
						traj.forEach(el =>{
									el.x--;
									if(el.x <= 5) traj.splice(traj.indexOf(el),1);
						});
			}else {
						ball.x ++;
			}
			ball.angle+=0.02;
			ball.y += Math.sin(ball.angle) * 1;
			traj.push({x: ball.x, y: ball.y, alpha: 1,});
			drawCircle(ball.x,ball.y,5,'red');
			drawLine(5, 250, 5 + 430, 250);
			drawLine(5, 40, 5, 450);
			ctx.fillStyle = 'cyan';
			ctx.font = '25px Bold';
			ang = Math.floor((ball.angle * 180/Math.PI)+90)%360;
		ctx.fillText('Angle: '+ang,canvas.width/2, 100);
			traj.forEach(el => {
						drawCircle(el.x,el.y,2,`rgba(255,0,0,${el.alpha})`);
						el.alpha = el.x/(canvas.width/2);
			});
			if(!pause)requestAnimationFrame(animate);
}
animate();