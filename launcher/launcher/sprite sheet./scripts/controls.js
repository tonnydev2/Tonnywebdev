export class Controls{
				constructor(game,width,height,x,y){
								this.game = game
								this.width = width;
								this.height = height;
								this.x = x;
								this.y =  y;
								this.buttons = [
								  new Button(this,x +100,y,'^'),
								  new Button(this,x + 100, y + 100,'⬇'),
								  new Button(this,x+40, y+ 50,'<'),
								  new Button(this, x + 160, y + 50,'>'),
								  new Button(this,width - 150 ,y + 50,'A'),
								];
				}
				draw(ctx){
								ctx.fillStyle = 'rgba(225,225,225,0.001)';
								ctx.fillRect(this.x,this.y,this.width,this.height);
								this.buttons.forEach(button=>{
												button.draw(ctx);
								});
				}
}
class Button{
				constructor(control,x,y,text){
								this.control = control;
								this.size = 50;
								this.width = this.size;
								this.height = this.size;
								this.text = text;
								this.x = x;
								this.y = y;
								this.touch = {
												x: null,
												y: null,
								};
						
				}
				    setEventListener(){
				    				document.addEventListener('click',(e)=>{
						 				this.touch.x = e.x;
						 				this.touch.y = e.y;
						 				this.handleClick();
						 });
				    }
				    handleClick(){
				    				console.log('Fuck You!');
				    }
				    isPointInside(touch, button) {
        if(
				    				  !(touch.x < button.x ||
				    				    touch.x > button.x + button.width ||
				    				    touch.y < button.y ||
				    				    touch.y > button.y + button.height)
				    				){
				    								return true;
				    				}
    }
				draw(ctx){
								ctx.globalAlpha = 0.4;
								ctx.fillStyle = 'rgba(225,225,225,0.2)';
								ctx.fillRect(this.x,this.y,this.width,this.height);
								ctx.fillStyle = 'red';
								ctx.font = '50px Arial';
								ctx.fillText(this.text,this.x - 5,this.y + 45);
								ctx.globalAlpha = 1;
				}
				
}
