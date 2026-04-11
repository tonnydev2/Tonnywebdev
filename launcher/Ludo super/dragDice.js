export function dragDice(dice, canvas){
    const {x,y,speedX,speedY} = dice;
   let lastTime;
   let currentTime;
   let initX;
   let initY;
   let finalX, finalY;
 let rect = canvas.getBoundingClientRect(); 
 window.addEventListener('resize',()=>{
    rect = canvas.getBoundingClientRect();
 });   
 canvas.addEventListener('touchstart',(e)=>{
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;  
    if(dice.isPointInside(touchX,touchY)){    
    dice.x = touchX;
    dice.y = touchY;
    initX = touchX;
    initY = touchY;
    lastTime = Date.now();
    }else{
       dice.x
    }
 });   
   canvas.addEventListener('touchmove',(e)=>{
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;  
   if(dice.isPointInside(touchX,touchY)){      
    dice.x = touchX;
    dice.y = touchY;
    finalX = touchX;
    finalY = touchY;
    currentTime = Date.now();
   }    
console.log(touchX,touchY);      
 });   
   canvas.addEventListener('touchend',()=>{
      if(currentTime){
      const distX = finalX - initX;
      const distY = finalY - initY;
      const time = currentTime - lastTime;
      dice.speedX = distX/(time/15);
      dice.speeedY = distY/(time/15);
      }else{
         dice.x = x;
         dice.y = y;
      }
   });
   
}

