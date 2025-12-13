export class BallManager {
    constructor() {
        this.balls = [];
        this.pocketedBalls = new Set();
        this.originalBalls = [];
        this.initializeOriginalBalls();
    }
    
    initializeOriginalBalls() {
        this.originalBalls = [
            {
                x: 80, y: 170, radius: 15,
                velocityX: 4, velocityY: 5,
                color: 'red', id: 1
            },
            {
                x: 200, y: 325, radius: 15,
                velocityX: -2, velocityY: 0,
                color: 'yellow', id: 2
            },
            {
                x: 250, y: 200, radius: 15,
                velocityX: 9, velocityY: 0,
                color: 'blue', id: 3
            },
            {
                x: 150, y: 250, radius: 15,
                velocityX: -7, velocityY: -8,
                color: 'green', id: 4
            }
        ];
    }
    
    getActiveBalls() {
        return this.balls;
    }
    
    updateActiveBalls() {
        this.balls = this.originalBalls
            .filter(ball => !this.pocketedBalls.has(ball.id))
            .map(ball => ({...ball}));
    }
    
    pocketBall(id) {
        this.pocketedBalls.add(id);
        console.log(`Ball ${id} pocketed!`);
    }
    
    updateOriginalBalls(activeBalls) {
        for (const ball of activeBalls) {
            const originalBall = this.originalBalls.find(b => b.id === ball.id);
            if (originalBall) {
                Object.assign(originalBall, ball);
            }
        }
    }
    
    reset() {
        this.balls = [];
        this.pocketedBalls.clear();
        this.initializeOriginalBalls();
    }
}

export const ballManager = new BallManager();

