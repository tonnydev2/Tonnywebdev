export class InputHandler{
				constructor(){
								this.keyUp = document.getElementById('arrowUp');
								this.keyDown = document.getElementById('arrowDown');
								this.keyLeft = document.getElementById('arrowLeft');
								this.keyRight = document.getElementById('arrowRight');
								this.keyEnter = document.getElementById('enter');
								this.keys = [];
								
						 this.setEventListener(this.keyUp, 'up');
								this.setEventListener(this.keyDown, 'down');
								this.setEventListener(this.keyLeft, 'left');
								this.setEventListener(this.keyRight, 'right');
								this.setEventListener(this.keyEnter, 'enter');
				}
				setEventListener(button, key){
								button.addEventListener('touchstart',(e)=>{
												e.preventDefault();
												this.addKey(key)
								});
								button.addEventListener('touchend',(e)=> this.removeKey(key));
								button.addEventListener('touchcancel',(e)=> this.removeKey(key));
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
