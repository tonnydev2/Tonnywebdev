export const pocket1 = {
    x: 60,
    y: 325,
    radius: 15,
    color: 'black'
};
export const pocket2 = {
    x: 60,
    y:80,
    radius: 15,
    color: 'black'
};

export const pocket3 = {
    x: 300,
    y: 80,
    radius: 15,
    color: 'black'
};

export function drawPocket(ctx, pocket) {
    ctx.fillStyle = pocket.color;
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
    ctx.fill();
}

export const pocket4 = {
    x: 300,
    y: 325,
    radius: 15,
    color: 'black'
};
export const pocket5 = {
    x: 60,
    y: 570,
    radius: 15,
    color: 'black'
};
export const pocket6 = {
    x: 300,
    y: 570,
    radius: 15,
    color: 'black'
};