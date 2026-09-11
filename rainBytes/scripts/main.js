const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resize(e){
    canvas.width = e.currentTarget.innerWidth;
    canvas.height = e.currentTarget.innerHeight;
}
window.addEventListener('resize',(e)=>{
    resize(e);
});

const gap = 50;
const bytes = [];

class Byte{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.speedX = 0;
        this.speedY = 2;
        this.wind = Math.random() * 0.006 - 0.003
        this.alpha = 1;
        this.color = `rgba(255,255,255,${this.alpha})`;
        this.bytes = [1,0];
        this.text = this.bytes[Math.floor(Math.random() * this.bytes.length)];
    }
    draw(){
        ctx.fillStyle = `rgba(0,0,0,${this.alpha-0.05})`;
        ctx.fillText(this.text,this.x-2,this.y+5);
        
      ctx.fillStyle = this.color;  
      ctx.font = '30px Arial';
      ctx.fillText(this.text,this.x,this.y);
        
    }
    update(){
      this.x += this.speedX;  
      this.y += this.speedY;  
        this.speedX += this.wind;
        this.speedY += this.wind;        
      if(this.alpha > 0)this.alpha -= 0.01; 
        this.color = `rgba( 255,255,255,${this.alpha})`;
        if(this.alpha <= 0.01) bytes.splice(Array.from(bytes).indexOf(this),1);       
    }
}


function addRow(y){
    for(let i=0; i <= canvas.width; i+=gap){
        bytes.push(new Byte(i,y));
    }
}
function addRow2(y){
    for(let i=gap/2; i <= canvas.width; i+=gap){
        bytes.push(new Byte(i,y));
    }
}
let timer = 0;
let hue1 = 360/7,hue2 = 360/6,hue3 = 360/5,hue4 = 360/4,hue5 = 360/3,hue6 = 360/2,hue7 = 360;
function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0,canvas.width,canvas.height)
    bytes.forEach(byte =>{
        byte.draw();
        byte.update();
    });
    timer++;
    if(timer % 20 === 0) addRow(0);
    else if(timer % 10 === 0) addRow2(canvas.height/2.5);
    else if(timer % 15 === 0) addRow(canvas.height/1.4);
    requestAnimationFrame(animate);
}
animate();

