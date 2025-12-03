 const states = {
    STANDING:0,    
    SITTING: 1,
    RUNNING: 2,
    JUMPING: 3,
    FALLING: 4,
    ROLLING: 5
};

class State {
    constructor(state) {
        this.state = state;
    }
}
export class Standing extends State {
    constructor(player) {
        super('STANDING');
        this.player = player;
    }
    enter() {
        this.player.frameY = 0;
        this.player.maxFrame = 5;
        this.player.stopRunningSound();
    }
    handleInput(input) {
        if (input.includes('right')) {
            this.player.setState(states.RUNNING,1);
    }
    }
}
   
export class Sitting extends State {
    constructor(player) {
        super('SITTING');
        this.player = player;
    }
    enter() {
        this.player.frameY = 5;
        this.player.maxFrame = 4;
        this.player.stopRunningSound();
    }
    handleInput(input) {
        if (input.includes('right') || input.includes('left')) {
            this.player.setState(states.RUNNING,1);
        }else if(input.includes('up')) this.player.setState(states.STANDING,0)
    }
}

export class Running extends State {
    constructor(player) {
        super('RUNNING');
        this.player = player;
    }
    enter() {
        this.player.frameY = 3;
        this.player.maxFrame = 6;
        this.player.playRunningSound();
    }
    handleInput(input) {
        if (input.includes('down')) {
            this.player.setState(states.SITTING,0);
        } else if (input.includes('up') && this.player.onGround()) {
            this.player.setState(states.JUMPING,1);
        }else if(input.includes('enter')) this.player.setState(states.ROLLING,2);
    }
}

export class Jumping extends State {
    constructor(player) {
        super('JUMPING');
        this.player = player;
    }
    enter() {
        this.player.frameY = 1;
        this.player.frameX = 0;
        this.player.vy -= 20; // Apply jump force
        this.player.stopRunningSound();
    }
    handleInput(input) {
       if(input.includes('enter')) {
          this.player.setState(states.ROLLING,2);
       }
        // Jumping state will automatically transition to falling via physics check
        // No input handling needed here for state transition
    }
}

export class Falling extends State {
    constructor(player) {
        super('FALLING');
        this.player = player;
    }
    enter() {
        this.player.frameY = 2;
        this.player.frameX = 0;
        this.player.stopRunningSound();
    }
    handleInput(input) {
       if(!this.player.onGround() && input.includes('enter')) this.player.setState(states.ROLLING,1);
        if (this.player.onGround()) {
            this.player.setState(states.RUNNING,1);
        }
    }
}
export class Rolling extends State {
    constructor(player) {
        super('ROLLING');
        this.player = player;
    }
    enter() {
        this.player.frameY = 6;
        this.player.maxFrame = 5;
        this.player.stopRunningSound();
    }
    handleInput(input) {
        setTimeout(()=>{
            this.player.setState(states.RUNNING,1);
    },700);
    }
}

// Export states constant
export { states };