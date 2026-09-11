const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const angleInput = document.querySelector('input');
const status = document.querySelector('.status');
canvas.width = 340;
canvas.height = 350;

function toRad(pheta){
 			return pheta * Math.PI/180;
}
function cordinates(pheta,rd){
			return { x: (Math.cos(toRad(pheta)) * rd),
						       y: (Math.sin(toRad(pheta)) * rd)
			};
}
function getAngle(){
			if(angleInput.value.trim() === '') return;
			return angleInput.value.trim();
}
function setUpAngle(){
			let angle = getAngle();
			if(angle && angle > 360) angle = angle%360;
			if(angle) status.textContent = `Drawing angle for ${angle}°`;
}
function drawAngle(){
			const angle = getAngle() % 360;
 	const length = 150;		
 	setUpAngle();		
			const cords = cordinates(angle, length);
 			console.log(cords.x/100,cords.y/100);
 			const origin = {
 			 			x: canvas.width/2,
 			 			y: canvas.height/2,
 			}
			const construction = {
						horizontal: {
									x1: origin.x,
									x2: origin.x + length,
									y1: origin.y,
									y2: origin.y,
						},
						vertical: {
									x1: origin.x,
									x2: origin.x + cords.x,
									y1: origin.y,
									y2: origin.y - cords.y,
						}
			}
			
			ctx.beginPath();
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#333';
			ctx.moveTo(construction.horizontal.x1,construction.horizontal.y1);
			ctx.lineTo(construction.horizontal.x2,construction.horizontal.y2);
			ctx.stroke();
 			
 	ctx.beginPath();
 	ctx.strokeStyle = 'blue';
 	ctx.lineWidth = 2;
 	ctx.arc(origin.x,origin.y,20,-toRad(angle), 0);
 	ctx.stroke();
 			ctx.closePath();
 	
 					
			ctx.beginPath();
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#333';
			ctx.moveTo(construction.vertical.x1,construction.vertical.y1);
			ctx.lineTo(construction.vertical.x2,construction.vertical.y2);
			ctx.stroke();
 			
 			const halfA = angle/2;
 			const pos = cordinates(halfA, 30);
 	ctx.fillStyle = '#333';
 			ctx.font = '20px Arial';
 	ctx.fillText(`${angle}°`,origin.x + pos.x,origin.y - pos.y);
 	ctx.fill();		
 	angleInput.value = '';		
}
const button = document.querySelector('.drawBtn');
button.addEventListener('click', ()=>{
 	ctx.clearRect(0,0,canvas.width,canvas.height);		
 	drawAngle();		
});
window.addEventListener('keypress',(e)=>{
 		if(e.key === 'Enter'){
 		 			ctx.clearRect(0,0,canvas.width,canvas.height);
 		 			drawAngle();	
 		}	
});