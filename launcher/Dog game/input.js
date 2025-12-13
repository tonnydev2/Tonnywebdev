 export class InputHandler {
    constructor() {
        this.arrowUp = document.getElementById('arrow-up');
        this.arrowDown = document.getElementById('arrow-down');
        this.arrowLeft = document.getElementById('arrow-left');
        this.arrowRight = document.getElementById('arrow-right');
        this.enter = document.getElementById('enter');
        this.keys = [];
        this.pressedButtons = new Set(); // Track pressed buttons

        // Add event listeners for each button
        this.addButtonEvents(this.arrowUp, 'up');
        this.addButtonEvents(this.arrowDown, 'down');
        this.addButtonEvents(this.arrowLeft, 'left');
        this.addButtonEvents(this.arrowRight, 'right');
        this.addButtonEvents(this.enter, 'enter');
    }

    addButtonEvents(button, key) {
        // Mouse events
        button.addEventListener('mousedown', () => this.addKey(key));
        button.addEventListener('mouseup', () => this.removeKey(key));
        button.addEventListener('mouseleave', () => this.removeKey(key));

        // Touch events for mobile devices
        button.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            this.addKey(key);
        });
        button.addEventListener('touchend', () => this.removeKey(key));
        button.addEventListener('touchcancel', () => this.removeKey(key));
    }

    addKey(key) {
        if (!this.pressedButtons.has(key)) {
            this.pressedButtons.add(key);
            this.keys.push(key);
            console.log(`Added ${key}:`, this.keys);
        }
    }

    removeKey(key) {
        if (this.pressedButtons.has(key)) {
            this.pressedButtons.delete(key);
            const index = this.keys.indexOf(key);
            this.keys.splice(index, 1);
            console.log(`Removed ${key}:`, this.keys);
        }
    }
}

// Initialize the input handler
const inputHandler = new InputHandler();

