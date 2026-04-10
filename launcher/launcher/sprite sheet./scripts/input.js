import {Game} from './main.js';
export class InputHandler{
				constructor(game){
								this.game = game;
								this.buttons = this.game.controls.buttons;
								this.keyUp = this.buttons[0];
								this.keyDown = this.buttons[1];
								this.keyLeft = this.buttons[2];
								this.keyRight = this.buttons[3];
								this.keyEnter = this.buttons[4];
								this.keys = [];
										
						 this.setEventListener(this.keyUp, 'up');
								this.setEventListener(this.keyDown, 'down');
								this.setEventListener(this.keyLeft, 'left');
								this.setEventListener(this.keyRight, 'right');
								this.setEventListener(this.keyEnter, 'enter');
				}
		 setEventListener(button,key){
		 				this.game.canvas.addEventListener('touchstart',(e)=>{
		 								e.preventDefault();
								});
		 				this.game.canvas.addEventListener('touchend',()=>{
		 								this.removeKey(key);
		 				});
		 				this.game.canvas.addEventListener('touchcancel',()=>{
		 								this.removeKey(key);
		 				});
		 }
				addKey(key){
								if(this.keys.indexOf(key) === -1) this.keys.push(key);
								console.log(`added: ${key}`);
				}
				removeKey(key){
								this.keys.splice(this.keys.indexOf(key),1);
								console.log(`removed: ${key}`);
				}
}
