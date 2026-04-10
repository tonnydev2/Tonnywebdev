const homegap = 207;
export const positions = [
[
				[50,150],[90,190],[50,190],[90,150]
],
[
				[50 + homegap,150],[90 + homegap,190],[50 + homegap,190],[90 + homegap,150]
],
[
 	[50,150 + homegap],[90,190+ homegap],[50,190+ homegap],[90,150+ homegap]
],
[
				[homegap + 50,150+ homegap],[homegap + 90,190+ homegap],[homegap + 50,190+ homegap],[homegap + 90,150+ homegap]
],
[
		[37,250],[197,137],[150,412],[312,297]
]
];

// paths.js - Complete coordinate paths for all players
 export const CELL_SIZE = 23;

// Starting positions from your data
export const START_POSITIONS = {
  red: { x: 37, y: 250 },
  green: { x: 197, y: 137 },
  blue: { x: 150, y: 412 },
  yellow: { x: 312, y: 297 }
};

// Generate Red Path
export const RED_PATH = generateRedPath();

function generateRedPath() {
  const start = START_POSITIONS.red;
  let x = start.x;
  let y = start.y;
  const path = [{x, y}]; // Position 0 - Home exit
  
  // Red movement pattern (clockwise from top-left):
  // 5 right, 6 up, 3 right, 6 down, 6 right, 3 up,
  // 6 left, 6 down, 3 left, 6 up, 6 left, 2 up, 6 right
  
  // 5 cells positive horizontal (right)
  for (let i = 1; i <= 4; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x += CELL_SIZE;
    y -= CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells negative vertical (up)
  for (let i = 1; i <= 5; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells positive horizontal (right) - corner
  for (let i = 1; i <= 2; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells positive vertical (down)
  for (let i = 1; i <= 5; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  for (let i=1; i<=1; i++) {
    x += CELL_SIZE;
    y += CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells positive horizontal (right)
  for (let i = 1; i <= 5; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells negative vertical (up)
  for (let i = 1; i <= 2; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells negative horizontal (left)
  for (let i = 1; i <= 5; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x -= CELL_SIZE;
    y += CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells positive vertical (down)
  for (let i = 1; i <= 5; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells negative horizontal (left)
  for (let i = 1; i <= 2; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells negative vertical (up)
  for (let i = 1; i <= 5; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x -= CELL_SIZE;
    y -= CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells negative horizontal (left)
  for (let i = 1; i <= 5; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 2 cells negative vertical (up)
  for (let i = 1; i <= 1; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells positive horizontal (right) - Home stretch
  for (let i = 1; i <= 6; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  return path;
}

// Generate Green Path (rotated 90 degrees clockwise from red)
export const GREEN_PATH = generateGreenPath();
function generateGreenPath() {
  const start = START_POSITIONS.green;
  let x = start.x;
  let y = start.y;
  const path = [{x, y}]; // Position 0 - Home exit
  
  // Green movement pattern (from top-right):
  // 5 down, 6 left, 3 down, 6 right, 6 down, 3 left,
  // 6 up, 6 right, 3 up, 6 left, 6 up, 2 left, 6 down
  
  // 5 cells positive vertical (down) - FIRST 4 STRAIGHT
  for (let i = 1; i <= 4; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  // 1 DIAGONAL (5th move of the first segment)
  x += CELL_SIZE;
  y += CELL_SIZE;
  path.push({x, y});
  
  // 6 cells negative horizontal (left) - NEXT 5 STRAIGHT
  for (let i = 1; i <= 5; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells positive vertical (down) - corner (NEXT 2 STRAIGHT)
  for (let i = 1; i <= 2; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells positive horizontal (right) - NEXT 5 STRAIGHT
  for (let i = 1; i <= 5; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 1 DIAGONAL (6th move of this segment)
  y += CELL_SIZE;
  x -= CELL_SIZE;
  path.push({x, y});
  
  // 6 cells positive vertical (down) - NEXT 5 STRAIGHT
  for (let i = 1; i <= 5; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells negative horizontal (left) - NEXT 2 STRAIGHT
  for (let i = 1; i <= 2; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells negative vertical (up) - NEXT 5 STRAIGHT
  for (let i = 1; i <= 5; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 1 DIAGONAL (6th move of this segment)
  x -= CELL_SIZE;
  y -= CELL_SIZE;
  path.push({x, y});
  
  // 6 cells positive horizontal (right) - NEXT 5 STRAIGHT
  for (let i = 1; i <= 5; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells negative vertical (up) - NEXT 2 STRAIGHT
  for (let i = 1; i <= 2; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells negative horizontal (left) - NEXT 5 STRAIGHT
  for (let i = 1; i <= 5; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  // 1 DIAGONAL (6th move of this segment)
  x += CELL_SIZE;
  y -= CELL_SIZE;
  path.push({x, y});
  
  // 6 cells negative vertical (up) - NEXT 5 STRAIGHT
  for (let i = 1; i <= 5; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 2 cells negative horizontal (left) - NEXT 1 STRAIGHT
  for (let i = 1; i <= 1; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells positive vertical (down) - Home stretch - ALL 6 STRAIGHT
  for (let i = 1; i <= 6; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  return path;
}

// Generate Blue Path (rotated 180 degrees from red)
export const BLUE_PATH = generateBluePath();

function generateBluePath() {
  const start = START_POSITIONS.blue;
  let x = start.x;
  let y = start.y;
  const path = [{x, y}]; // Position 0 - Home exit
  
  // Blue movement pattern (from bottom-left):
  // 5 up, 6 right, 3 up, 6 left, 6 up, 3 right,
  // 6 down, 6 left, 3 down, 6 right, 6 down, 2 right, 6 up
  
  // 5 cells negative vertical (up)
  for (let i = 1; i <= 4; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  for(let i=1; i<=1; i++){
    x -= CELL_SIZE;
    y -= CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells positive horizontal (right)
  for (let i = 1; i <= 5; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells negative vertical (up) - corner
  for (let i = 1; i <= 2; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells negative horizontal (left)
  for (let i = 1; i <= 5; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x += CELL_SIZE;
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells negative vertical (up)
  for (let i = 1; i <= 5; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells positive horizontal (right)
  for (let i = 1; i <= 2; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells positive vertical (down)
  for (let i = 1; i <= 5; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x += CELL_SIZE;
    y += CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells negative horizontal (left)
  for (let i = 1; i <= 5; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells positive vertical (down)
  for (let i = 1; i <= 2; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells positive horizontal (right)
  for (let i = 1; i <= 5; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x -= CELL_SIZE;
    y += CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells positive vertical (down)
  for (let i = 1; i <= 5; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  // 2 cells positive horizontal (right)
  for (let i = 1; i <= 1; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells negative vertical (up) - Home stretch
  for (let i = 1; i <= 6; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  return path;
}

// Generate Yellow Path (rotated 270 degrees from red)
export const YELLOW_PATH = generateYellowPath();

function generateYellowPath() {
  const start = START_POSITIONS.yellow;
  let x = start.x;
  let y = start.y;
  const path = [{x, y}]; // Position 0 - Home exit
  
  // Yellow movement pattern (from bottom-right):
  // 5 left, 6 up, 3 left, 6 down, 6 left, 3 up,
  // 6 right, 6 down, 3 right, 6 up, 6 right, 2 up, 6 left
  
  // 5 cells negative horizontal (left)
  for (let i = 1; i <= 4; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x -= CELL_SIZE;
    y += CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells negative vertical (up)
  for (let i = 1; i <= 5; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells negative horizontal (left) - corner
  for (let i = 1; i <= 2; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells positive vertical (down)
  for (let i = 1; i <= 5; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x -= CELL_SIZE;
    y -= CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells negative horizontal (left)
  for (let i = 1; i <= 5; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells negative vertical (up)
  for (let i = 1; i <= 2; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells positive horizontal (right)
  for (let i = 1; i <= 5; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x += CELL_SIZE;
    y -= CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells positive vertical (down)
  for (let i = 1; i <= 5; i++) {
    y -= CELL_SIZE;
    path.push({x, y});
  }
  
  // 3 cells positive horizontal (right)
  for (let i = 1; i <= 2; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells negative vertical (up)
  for (let i = 1; i <= 5; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  for (let i = 1; i <= 1; i++) {
    x += CELL_SIZE;
    y += CELL_SIZE;
    path.push({x, y});
  }
  // 6 cells positive horizontal (right)
  for (let i = 1; i <= 5; i++) {
    x += CELL_SIZE;
    path.push({x, y});
  }
  
  // 2 cells negative vertical (up)
  for (let i = 1; i <= 1; i++) {
    y += CELL_SIZE;
    path.push({x, y});
  }
  
  // 6 cells negative horizontal (left) - Home stretch
  for (let i = 1; i <= 6; i++) {
    x -= CELL_SIZE;
    path.push({x, y});
  }
  
  return path;
} 

// Safe zones (positions where pawns cannot be captured)
// These are the star/safe positions on the board (1-indexed)
export const SAFE_CELL_INDICES = [1, 9, 14, 22, 27, 35, 40, 48];

// Home stretch start indices (last 6 positions)
export const HOME_STRETCH_START = 51; // 0-indexed position where home stretch begins

// Total path length
export const TOTAL_PATH_LENGTH = 57; // 0-56 = 57 positions

// Helper to check if a position is safe
export function isSafePosition(positionIndex) {
  return SAFE_CELL_INDICES.includes(positionIndex + 1); // Convert to 1-indexed
}

// Helper to check if in home stretch
export function isInHomeStretch(positionIndex) {
  return positionIndex >= HOME_STRETCH_START;
}
// Add to constants.js:

// Cell ID mapping - each unique cell on the board gets an ID
// We'll map each coordinate in each path to a shared cell ID

export function getCellId(x, y) {
  // Round to nearest cell grid position
  const gridX = Math.round(x / CELL_SIZE);
  const gridY = Math.round(y / CELL_SIZE);
  return `${gridX}_${gridY}`;
}

// Pre-calculate cell IDs for all paths
export const RED_CELL_IDS = RED_PATH.map(pos => getCellId(pos.x, pos.y));
export const GREEN_CELL_IDS = GREEN_PATH.map(pos => getCellId(pos.x, pos.y));
export const BLUE_CELL_IDS = BLUE_PATH.map(pos => getCellId(pos.x, pos.y));
export const YELLOW_CELL_IDS = YELLOW_PATH.map(pos => getCellId(pos.x, pos.y));

// Map shared cells (where different colors can meet)
// These are the cells on the main track (not home stretches)
export const SHARED_CELLS = {
  // You'll need to manually identify which cells are shared
  // For example, position 0-50 might be shared (before home stretches)
  // This requires analyzing your path coordinates
};

// Helper to check if a position is on shared track
export function isSharedPosition(positionIndex) {
  return positionIndex < HOME_STRETCH_START;
}
const redPath = generateRedPath();
const greenPath = generateGreenPath();
const bluePath = generateBluePath();
const yellowPath = generateYellowPath()
 

export const places = {
				homeRed1 : positions[0][0],
				homeRed2 : positions[0][1],
				homeRed3 : positions[0][2],
				homeRed4 : positions[0][3],
					homeGreen1 : positions[1][0],
				homeGreen2 : positions[1][1],
				homeGreen3 : positions[1][2],
				homeGreen4 : positions[1][3],
					homeBlue1 : positions[2][0],
				homeBlue2 : positions[2][1],
				homeBlue3 : positions[2][2],
				homeBlue4 : positions[2][3],
					homeYellow1 : positions[3][0],
				homeYellow2 : positions[3][1],
				homeYellow3 : positions[3][2],
				homeYellow4 : positions[3][3],
}
