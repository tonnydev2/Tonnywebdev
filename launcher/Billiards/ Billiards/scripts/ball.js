// Instead of exporting the array directly, export an object with the array
export const ballState = {
    balls: [],
    pocketedBalls: new Set()
};

// Export original balls as constants
export const ball1 = {
    x: 80,
    y: 325,
    radius: 15,
    velocityX: 4,
    velocityY: 0,
    color: 'red',
    id: 1
};

export const ball2 = {
    x: 100,
    y: 300,
    radius: 15,
    velocityX: 20,
    velocityY: 0,
    color: 'yellow',
    id: 2
};

export const ball3 = {
    x: 250,
    y: 200,
    radius: 15,
    velocityX: 9,
    velocityY: 0,
    color: 'red',
    id: 3
};

export const ball4 = {
    x: 150,
    y: 250,
    radius: 15,
    velocityX: -7,
    velocityY: -8,
    color: 'yellow',
    id: 4
};

// Export helper functions
export const originalBalls = [ball1, ball2, ball3, ball4];

