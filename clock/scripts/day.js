const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 250;
canvas.height = 250;
let angle = 0;
const centerX = canvas.width/2;
const centerY = canvas.height/2;

function drawClock(sec,min,hrs){
 const second = sec -15;
 const ang = (second/60)*Math.PI * 2;
 const secHand = 90;
 
 const minute = min -15;
 const min_ang = ((minute/60) * Math.PI * 2) + ((second/60) * (Math.PI * 2)/60);
 const minHand = 70;
 
 const hour = hrs - 3;
 const hrs_ang = (hour/12)*Math.PI * 2;
 const hrsHand = 40;
 
 ctx.beginPath();
 ctx.strokeStyle = 'cyan'
 ctx.moveTo(centerX*2 ,centerY);
 ctx.lineTo(centerX*2 - 10,centerY)
 ctx.stroke();
 ctx.beginPath();
 ctx.moveTo(0 ,centerY);
 ctx.lineTo(0 + 10,centerY)
 ctx.stroke();
 ctx.beginPath();
 ctx.moveTo(centerX ,centerY*2);
 ctx.lineTo(centerX,centerY*2 -10)
 ctx.stroke();
 ctx.beginPath();
 ctx.moveTo(centerX ,0);
 ctx.lineTo(centerX,0 + 10)
 ctx.stroke();
 
 ctx.strokeStyle = "white";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(centerX,centerY,centerX,0,2*Math.PI);
			ctx.stroke();
			
			ctx.beginPath();
			ctx.strokeStyle = 'red';
			ctx.moveTo(centerX,centerY);
			ctx.lineTo(centerX + Math.cos(ang) * secHand, centerY + Math.sin(ang) * secHand);
			ctx.stroke();
 
 ctx.beginPath();
			ctx.strokeStyle = 'orangered';
 ctx.lineWidth = 3;
			ctx.moveTo(centerX,centerY);
			ctx.lineTo(centerX + Math.cos(min_ang) * minHand, centerY + Math.sin(min_ang) * minHand);
			ctx.stroke();
 
 ctx.beginPath();
			ctx.strokeStyle = 'blue';
 ctx.lineWidth = 5;
			ctx.moveTo(centerX,centerY);
			ctx.lineTo(centerX + Math.cos(hrs_ang) * hrsHand, centerY + Math.sin(hrs_ang) * hrsHand);
			ctx.stroke();
 
 ctx.fillStyle = "#333";
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.arc(centerX,centerY,5,0,2*Math.PI);
			ctx.fill();

}
let seconds;
let minutes;
let hours;
function days(){
 const time = Date.now();
const date = new Date(time); // Create a Date object

// Now extract individual components
const day = date.getDate(); // 1-31
const month = date.getMonth() + 1; // 0-11, so add 1
const year = date.getFullYear(); // Full year
hours = date.getHours(); // 0-23
minutes = date.getMinutes(); // 0-59
seconds = date.getSeconds(); // 0-59
 const day2 = date.getDay();
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
 const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
// Update your HTML elements
 document.getElementById('day').innerHTML = days[day2 - 1];
document.getElementById('dd').innerHTML = day.toString().padStart(2,0);
document.getElementById('mm').innerHTML = months[month - 1].toString().padStart(2,0);
document.getElementById('yyyy').innerHTML = year.toString().padStart(4,0);
document.getElementById('hour').innerHTML = (hours % 12).toString().padStart(2,0);
document.getElementById('min').innerHTML = minutes.toString().padStart(2,0);
document.getElementById('sec').innerHTML = seconds.toString().padStart(2,0) + `${Number(hours) >= 12 ? ' PM' : ' AM'}`;
}
function animate(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 days();
 angle += 0.02;
 drawClock(seconds,minutes,hours);
 requestAnimationFrame(animate);
}

animate();