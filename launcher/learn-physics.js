const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 350;
canvas.height = 300
 const ball1 = {
 				x: 30,
 				y: 40,
 				radius: 20,
 				velocityX : 4,
 				velocityY: 0,
 				color: 'red'
 }
const ball2 = {
 				x : 200,
 				y: 20,
 				radius: 20,
				 velocityX :  -3,
				 velocityY : 0,
 				color: 'blue'
 }
 const gravity = 0.2;
 const resititution = 0.9;
const airResistance = Math.random()* 0.09 + 0.01;
  function ballCollision(){
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
  								const nV1 = ball1.velocityX * normalX + ball1.velocityY * normalY;
  								const tV1 = ball1.velocityX * tangetX + ball1.velocityY * tangetY;
  								const nV2 = ball2.velocityX * normalX + ball2.velocityY * normalY;
  								const tV2 = ball2.velocityX * tangetX + ball2.velocityY * tangetY;
  								const m1 = 2;
  								const m2 = 2;
  								const totalM = 4;
  								const nV1After = (nV1 *(m1-m2)+2 * m2 * nV2)/totalM;
  								const nV2After = (nV2 *(m2-m1)+2 * m1 * nV1)/totalM;
  								ball1.velocityX = nV1After * normalX + tV1 * tangetX;
  								ball1.velocityY = nV1After * normalY + tV1 * tangetY;
  								ball2.velocityY = nV2After * normalY + tV2 * tangetY;
  								ball2.velocityX = nV2After * normalX + tV2 * tangetX;
  				}
  }

  function update(ball){
  				ball.velocityX * (1 - airResistance);
  				ball.velocityY * (1 - airResistance);
  				ball.velocityY += gravity;
  				
  				ball.x += ball.velocityX;
  				ball.y += ball.velocityY;
  				if(ball.x + ball.radius > canvas.width){
  								ball.x = canvas.width - ball.radius;
  								ball.velocityX = -(ball.velocityX * resititution);
  				}
  				if(ball.x- ball.radius < 0){
  								ball.x = ball.radius;
  								ball.velocityX = -(ball.velocityX * resititution);
  				}
  				if(ball.y + ball.radius > canvas.height){
  								ball.y = canvas.height - ball.radius;
  								ball.velocityY = -(ball.velocityY *resititution);
  				}
  				if(ball.y - ball.radius < 0){
  								ball.y = ball.radius;
  								ball.velocityY = -(ball.velocityY *resititution);
  				}
  } 				
   function draw(x,y,radius,color){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x,y,radius,0,Math.PI*2);
   				ctx.fill();
   				ctx.closePath();
   				ctx.beginPath();
   				ctx.strokeStyle = 'rgba(225,225,225,0.3)';
   				ctx.lineWidth = 3;
   				ctx.fillStyle = 'rgba(225,225,225,0.5)';
   				ctx.arc(x-8,y-5,radius/3,0,Math.PI*2);
   				ctx.fill();
   				ctx.stroke();
   				
  }
  function animate(){
  				ctx.fillStyle = 'rgba(0,0,0,0.5)';
  				ctx.fillRect(0,0,canvas.width,canvas.height);
  				update(ball1);
  				update(ball2);
  				ballCollision();
  				draw(ball1.x,ball1.y,ball1.radius,ball1.color);
  				draw(ball2.x,ball2.y,ball2.radius,ball2.color);
  				requestAnimationFrame(animate);
  }
animate();