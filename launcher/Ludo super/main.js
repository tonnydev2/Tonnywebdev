// main.js - Complete Ludo Game with AI Players and Fixed Screens
import {Pawn, redPawns, greenPawns, bluePawns, yellowPawns} from './pawns.js';
import {Dice} from './dice.js';
import { isSafePosition } from './constants.js';
import { hide, show, progress } from './initial_pages.js';
import { TouchVisualizer } from './touches.js';
import { ParticleSystem } from './particles.js';
import { dragDice } from './dragDice.js' ;

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 350;
canvas.height = 550;

const images = {
  image1: document.getElementById('dice1'),
  image2: document.getElementById('dice2'),
  image3: document.getElementById('dice3'),
  image4: document.getElementById('dice4'),
  image5: document.getElementById('dice5'),
  image6: document.getElementById('dice6')
};

const dices = [images.image1, images.image2, images.image3, images.image4, images.image5, images.image6];
const ParticleSystems = new ParticleSystem();

// Simple Sound System
class GameSounds {
  constructor() {
    this.muted = false;
  }

  playSound(type) {
    if (this.muted) return;
    
    // Simple sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      let frequency = 440;
      let duration = 0.2;
      
      switch(type) {
        case 'dice':
          frequency = 200 + Math.random() * 600;
          duration = 0.5;
          break;
        case 'move':
          frequency = 440;
          duration = 0.1;
          break;
        case 'capture':
          frequency = 880;
          duration = 0.3;
          break;
        case 'finish':
          frequency = 1318.51;
          duration = 0.5;
          break;
        case 'win':
          frequency = 1046.50;
          duration = 1;
          break;
      }
      
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Fallback to console beep
      console.log('\x07');
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

const gameSounds = new GameSounds();

// Enhanced AI System with prioritized decision making
class AIPlayer {
  constructor(color, difficulty = 'medium') {
    this.color = color;
    this.difficulty = difficulty;
  }
  
  getValidMoves(pawns, rollValue) {
    const validMoves = [];
    
    pawns.forEach((pawn, index) => {
      if (this.isMoveValid(pawn, rollValue)) {
        // Calculate all move properties
        const canCapture = this.canCapture(pawn, rollValue);
        const capturedPawns = canCapture ? this.getCapturedPawns(pawn, rollValue) : [];
        const canLeaveHome = (pawn.isInHome && rollValue === 6);
        const createsThreat = this.createsThreat(pawn, rollValue);
        const reachesStar = this.reachesStar(pawn, rollValue);
        const stepsMoved = pawn.stepsMoved || 0;
        const distanceFromHome = pawn.positionIndex;
        const willFinish = this.willFinish(pawn, rollValue);
        const entersHomeStretch = this.entersHomeStretch(pawn, rollValue);
        
        validMoves.push({
          pawn: pawn,
          index: index,
          pawnId: pawn.id,
          stepsMoved: stepsMoved,
          distanceFromHome: distanceFromHome,
          canCapture: canCapture,
          capturedPawns: capturedPawns,
          captureCount: capturedPawns.length,
          canLeaveHome: canLeaveHome,
          createsThreat: createsThreat,
          reachesStar: reachesStar,
          willFinish: willFinish,
          entersHomeStretch: entersHomeStretch,
          score: this.evaluateMove(pawn, rollValue)
        });
      }
    });
    
    // Sort by priority: 
    // 1. Capture (highest priority - ALWAYS take captures)
    // 2. Finish pawn
    // 3. Leave home (get out with 6)
    // 4. Enter home stretch
    // 5. Moves that don't create threats
    // 6. Reach star positions
    // 7. Regular moves (prefer pawns that have moved less if creating threat)
    validMoves.sort((a, b) => {
      // CAPTURE IS HIGHEST PRIORITY - ALWAYS PICK CAPTURES FIRST
      if (a.canCapture && !b.canCapture) return -1;
      if (!a.canCapture && b.canCapture) return 1;
      
      // If both are captures, prioritize capturing more pawns
      if (a.canCapture && b.canCapture) {
        return b.captureCount - a.captureCount;
      }
      
      // Then finishing a pawn
      if (a.willFinish && !b.willFinish) return -1;
      if (!a.willFinish && b.willFinish) return 1;
      
      // Then leaving home
      if (a.canLeaveHome && !b.canLeaveHome) return -1;
      if (!a.canLeaveHome && b.canLeaveHome) return 1;
      
      // Then entering home stretch
      if (a.entersHomeStretch && !b.entersHomeStretch) return -1;
      if (!a.entersHomeStretch && b.entersHomeStretch) return 1;
      
      // For threat assessment:
      // If both create threats, prefer the pawn that has moved less
      if (a.createsThreat && b.createsThreat) {
        return a.stepsMoved - b.stepsMoved; // Prefer pawn with fewer steps
      }
      
      // If one creates threat and other doesn't, prefer no threat
      if (!a.createsThreat && b.createsThreat) return -1;
      if (a.createsThreat && !b.createsThreat) return 1;
      
      // Then reaching star
      if (a.reachesStar && !b.reachesStar) return -1;
      if (!a.reachesStar && b.reachesStar) return 1;
      
      // Finally, sort by score and prefer pawns that have moved less
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      
      // If scores are equal, prefer pawn that has moved less
      return a.stepsMoved - b.stepsMoved;
    });
    
    return validMoves;
  }
  
  isMoveValid(pawn, rollValue) {
    if (pawn.isFinished) return false;
    
    if (pawn.isInHome) {
      return rollValue === 6;
    }
    
    if (pawn.isInHomeStretch) {
      const remainingSteps = pawn.path.length - 1 - pawn.positionIndex;
      return rollValue <= remainingSteps;
    }
    
    return pawn.positionIndex + rollValue < pawn.path.length;
  }
  
  getCapturedPawns(pawn, rollValue) {
    if (pawn.isInHome || pawn.isInHomeStretch || pawn.isFinished) return [];
    
    const newIndex = pawn.positionIndex + rollValue;
    if (newIndex >= pawn.path.length) return [];
    
    // Check if new position is safe (can't capture on safe positions)
    if (isSafePosition(newIndex)) return [];
    
    // Get the new position coordinates
    const newPos = pawn.path[newIndex];
    const captured = [];
    
    // Check all other pawns to see if any are at that position
    const allPawnsArray = [redPawns, greenPawns, bluePawns, yellowPawns];
    for (const pawnArray of allPawnsArray) {
      for (const otherPawn of pawnArray) {
        if (otherPawn.color === pawn.color || otherPawn.isFinished || otherPawn.isInHome) continue;
        
        // Check if other pawn is at the target position
        if (!otherPawn.isInHome && !otherPawn.isInHomeStretch && !otherPawn.isFinished) {
          const otherPos = otherPawn.path[otherPawn.positionIndex];
          if (otherPos && newPos && otherPos.x === newPos.x && otherPos.y === newPos.y) {
            captured.push(otherPawn);
          }
        }
      }
    }
    
    return captured;
  }
  
  canCapture(pawn, rollValue) {
    return this.getCapturedPawns(pawn, rollValue).length > 0;
  }
  
  createsThreat(pawn, rollValue) {
    if (pawn.isInHome || pawn.isInHomeStretch || pawn.isFinished) return false;
    
    const newIndex = pawn.positionIndex + rollValue;
    if (newIndex >= pawn.path.length) return false;
    
    // Don't consider it a threat if moving to star (safe position)
    if (isSafePosition(newIndex)) return false;
    
    const newPos = pawn.path[newIndex];
    
    // Check if this move would put us in front of any opponent pawn
    const allPawnsArray = [redPawns, greenPawns, bluePawns, yellowPawns];
    for (const pawnArray of allPawnsArray) {
      for (const otherPawn of pawnArray) {
        if (otherPawn.color === pawn.color || otherPawn.isFinished || otherPawn.isInHome) continue;
        
        if (!otherPawn.isInHome && !otherPawn.isInHomeStretch && !otherPawn.isFinished) {
          // Check if opponent pawn is behind us and could capture us on their next turn
          // We check if opponent is within 6 steps behind AND on the same path position
          const stepsBehind = otherPawn.positionIndex - newIndex;
          if (stepsBehind > 0 && stepsBehind <= 6) {
            // Check if opponent's path position matches our position
            const opponentPos = otherPawn.path[otherPawn.positionIndex];
            if (opponentPos && newPos && opponentPos.x === newPos.x && opponentPos.y === newPos.y) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }
  
  reachesStar(pawn, rollValue) {
    if (pawn.isInHome || pawn.isInHomeStretch || pawn.isFinished) return false;
    
    const newIndex = pawn.positionIndex + rollValue;
    return isSafePosition(newIndex);
  }
  
  willFinish(pawn, rollValue) {
    if (pawn.isInHome || pawn.isFinished) return false;
    
    if (pawn.isInHomeStretch) {
      const remainingSteps = pawn.path.length - 1 - pawn.positionIndex;
      return rollValue === remainingSteps;
    }
    
    const newIndex = pawn.positionIndex + rollValue;
    return newIndex === pawn.path.length - 1;
  }
  
  entersHomeStretch(pawn, rollValue) {
    if (pawn.isInHome || pawn.isInHomeStretch || pawn.isFinished) return false;
    
    const newIndex = pawn.positionIndex + rollValue;
    return newIndex >= pawn.path.length - 7 && newIndex < pawn.path.length;
  }
  
  evaluateMove(pawn, rollValue) {
    let score = 0;
    
    // Getting out of home is good
    if (pawn.isInHome && rollValue === 6) {
      score += 50;
    }
    
    // Finishing is excellent
    if (this.willFinish(pawn, rollValue)) {
      score += 150;
    }
    
    // Entering home stretch is good
    if (this.entersHomeStretch(pawn, rollValue)) {
      score += 40;
    }
    
    // Moving forward is generally good (but less weight than special moves)
    if (!pawn.isInHome && !pawn.isFinished) {
      score += rollValue * 3;
    }
    
    // Getting to safe positions
    if (this.reachesStar(pawn, rollValue)) {
      score += 25;
    }
    
    // Penalize moves that create threats (unless it's the only option)
    if (this.createsThreat(pawn, rollValue)) {
      score -= 20;
    }
    
    // Prefer pawns that have moved less (to balance progress)
    const stepsMoved = pawn.stepsMoved || 0;
    score += (20 - stepsMoved) * 0.5; // Small bonus for less-moved pawns
    
    return score;
  }
  
  chooseBestMove(validMoves) {
    if (validMoves.length === 0) return null;
    
    // Log all valid moves for debugging
    console.log(`🤖 ${this.color} AI options (${validMoves.length}):`);
    validMoves.forEach((move, i) => {
      const captureInfo = move.canCapture ? `CAPTURE ${move.captureCount} pawn(s)! ` : '';
      const threatInfo = move.createsThreat ? '(⚠️ CREATES THREAT) ' : '';
      const starInfo = move.reachesStar ? '(⭐ REACHES STAR) ' : '';
      const finishInfo = move.willFinish ? '(🏁 FINISHES) ' : '';
      const homeInfo = move.canLeaveHome ? '(🏠 LEAVES HOME) ' : '';
      const stretchInfo = move.entersHomeStretch ? '(↗️ ENTERS HOME STRETCH) ' : '';
      console.log(`  ${i+1}. Pawn ${move.pawnId}: ${captureInfo}${finishInfo}${homeInfo}${stretchInfo}${starInfo}${threatInfo}steps: ${move.stepsMoved}, score: ${move.score}`);
    });
    
    // FIRST PRIORITY: Check for capture moves
    const captureMoves = validMoves.filter(move => move.canCapture);
    if (captureMoves.length > 0) {
      // Sort captures by number of pawns captured (most first)
      captureMoves.sort((a, b) => b.captureCount - a.captureCount);
      console.log(`🤖 ${this.color} AI MUST CAPTURE! Choosing capture move with pawn ${captureMoves[0].pawnId} (${captureMoves[0].captureCount} pawn(s))`);
      return captureMoves[0];
    }
    
    // For easy AI, sometimes make suboptimal choices
    if (this.difficulty === 'easy' && validMoves.length > 1) {
      // 30% chance to choose a non-optimal move (but never pass up a capture - already handled)
      if (Math.random() < 0.3) {
        // Filter out moves that create threats for easy AI (they're more cautious)
        const safeMoves = validMoves.filter(move => !move.createsThreat);
        if (safeMoves.length > 0) {
          const randomSafeMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
          console.log(`🤖 ${this.color} AI (easy) chooses random safe move with pawn ${randomSafeMove.pawnId}`);
          return randomSafeMove;
        }
        // If all moves create threats, pick a random one
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        console.log(`🤖 ${this.color} AI (easy) chooses random move with pawn ${randomMove.pawnId} (all moves create threats)`);
        return randomMove;
      }
    }
    
    // For medium AI, sometimes choose second best
    if (this.difficulty === 'medium' && validMoves.length > 1) {
      if (Math.random() < 0.15) {
        // But prefer safe moves over threatening ones
        const nonThreateningMoves = validMoves.filter(move => !move.createsThreat);
        if (nonThreateningMoves.length > 1) {
          console.log(`🤖 ${this.color} AI (medium) chooses second best safe move with pawn ${nonThreateningMoves[1].pawnId}`);
          return nonThreateningMoves[1];
        } else if (validMoves.length > 1) {
          console.log(`🤖 ${this.color} AI (medium) chooses second best move with pawn ${validMoves[1].pawnId}`);
          return validMoves[1];
        }
      }
    }
    
    // For hard AI, always choose the best strategic move
    console.log(`🤖 ${this.color} AI chooses best strategic move with pawn ${validMoves[0].pawnId}`);
    return validMoves[0];
  }
  
  async makeMove(pawns, rollValue) {
    console.log(`🤖 ${this.color} AI thinking...`);
    
    // Add thinking delay
    await this.delay(this.getThinkingDelay());
    
    const validMoves = this.getValidMoves(pawns, rollValue);
    const bestMove = this.chooseBestMove(validMoves);
    
    if (bestMove) {
      let action = 'moves';
      if (bestMove.canCapture) action = 'CAPTURES';
      else if (bestMove.willFinish) action = 'FINISHES';
      else if (bestMove.canLeaveHome) action = 'LEAVES HOME';
      else if (bestMove.entersHomeStretch) action = 'ENTERS HOME STRETCH';
      else if (bestMove.reachesStar) action = 'MOVES TO STAR';
      else if (bestMove.createsThreat) action = 'TAKES RISK (threat)';
      
      console.log(`🤖 ${this.color} AI ${action} with pawn ${bestMove.pawn.id} (steps moved: ${bestMove.stepsMoved})`);
      return bestMove.pawn;
    }
    
    console.log(`🤖 ${this.color} AI has no valid moves`);
    return null;
  }
  
  getThinkingDelay() {
    switch(this.difficulty) {
      case 'easy': return 1500;
      case 'medium': return 1000;
      case 'hard': return 500;
      default: return 1000;
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
class AIManager {
  constructor() {
    this.aiPlayers = new Map();
    this.playerTypes = {};
  }
  
  setPlayerType(color, type, difficulty = 'medium') {
    this.playerTypes[color] = type;
    
    if (type === 'computer') {
      this.aiPlayers.set(color, new AIPlayer(color, difficulty));
      console.log(`🎮 ${color} set as computer player (${difficulty})`);
    } else {
      this.aiPlayers.delete(color);
      console.log(`🎮 ${color} set as human player`);
    }
  }
  
  isAIPlayer(color) {
    return this.playerTypes[color] === 'computer';
  }
  
  getAIPlayer(color) {
    return this.aiPlayers.get(color);
  }
  
  async makeAIMove(color, pawns, rollValue) {
    const aiPlayer = this.getAIPlayer(color);
    if (!aiPlayer) return null;
    
    try {
      return await aiPlayer.makeMove(pawns, rollValue);
    } catch (error) {
      console.error(`Error in AI move for ${color}:`, error);
      return null;
    }
  }
}

const aiManager = new AIManager();

class Board {
  constructor() {
    this.x = -1;
    this.y = 100;
    this.width = 350;
    this.height = 350;
    this.image = document.getElementById('ludo');
  }
  
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

// Create dice
const dice1 = new Dice(0, 0, 50, 50, 'red');
const dice2 = new Dice(canvas.width - 50, 0, 50, 50, 'green');
const dice3 = new Dice(0, canvas.height - 50, 50, 50, 'blue');
const dice4 = new Dice(canvas.width - 50, canvas.height - 50, 50, 50, 'yellow');

const board = new Board();
const allDice = [dice1, dice2, dice3, dice4];
const allPawns = [redPawns, greenPawns, bluePawns, yellowPawns];

// Game states
let gameState = 'intro';
let players = ['red', 'green', 'blue', 'yellow'];
let currentPlayerIndex = 0;
let activePlayer = players[currentPlayerIndex];
let diceRolled = false;
let currentRollValue = 0;
let pawnMovedThisTurn = false;
let isAnimating = false;
let autoMoveInProgress = false;

// Track finished players
let finishedPlayers = new Set();
let extraTurnEarned = false;
let isCaptureAnimation = false;
let nextPlayerAfterWin = null;

// Get DOM elements
const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const screen3 = document.getElementById('screen3');
const startBtn = document.getElementById('startBtn');
let winScreen = null;

// Player selections
const playerSelections = {
  red: { type: 'human', difficulty: 'medium' },
  green: { type: 'human', difficulty: 'medium' },
  blue: { type: 'human', difficulty: 'medium' },
  yellow: { type: 'human', difficulty: 'medium' }
};

// Initialize game
function initGame() {
  console.log('🎲 Initializing Ludo Game...');
  
  // Show screen1 by default (with progress)
  showScreen1();
  
  // Start progress automatically on screen1
  startProgress();
  
  // Set up event listeners
  setupEventListeners();
  
  // Start game loop
  
  
  console.log('Ready! Progress will start automatically...');
}

function startProgress() {
  // Start progress bar on screen1
    progress();
}

function showScreen1() {
  gameState = 'intro';
  if (screen1) show(screen1);
  if (screen2) hide(screen2);
  if (screen3) hide(screen3);
}

function showScreen2() {
  gameState = 'player_selection';
  if (screen1) hide(screen1);
  if (screen2) show(screen2);
  if (screen3) hide(screen3);
  
  // Reset player selections to default
  resetPlayerSelections();
}

function showScreen3() {
  gameState = 'playing';
  if (screen1) hide(screen1);
  if (screen2) hide(screen2);
  if (screen3) show(screen3);
  if (winScreen) {
    winScreen.remove();
    winScreen = null;
  }
  
  startActualGame();
}

for(const dice of allDice){
  dragDice(dice,canvas);
}

function startActualGame() {
  resetGameState();
  finishedPlayers.clear();
  
  // Initialize AI players based on selection
  initializeAIPlayers();
  
  currentPlayerIndex = 0;
  activePlayer = getNextAvailablePlayer(0);
  
  updatePawnStacking();
  setPlayerPawnsOnTop(activePlayer);
  
  console.log(`🎮 Game started! First player: ${activePlayer.toUpperCase()}`);
  console.log('Player configurations:', playerSelections);
  
  // If first player is AI, auto-roll after delay
  if (aiManager.isAIPlayer(activePlayer)) {
    setTimeout(() => {
      triggerAIRoll();
    }, 1000);
  }
}

function resetPlayerSelections() {
  // Reset all to human by default
  players.forEach(color => {
    playerSelections[color] = { type: 'human', difficulty: 'medium' };
    updatePlayerModeUI(color, 'human');
  });
}

function updatePlayerModeUI(color, mode) {
  const humanImg = document.getElementById(`${color}ModeImg`);
  const compImg = document.getElementById(`${color}ModeImg2`);
  const difficultySelect = document.getElementById(`${color}Difficulty`);
  
  if (humanImg && compImg) {
    if (mode === 'human') {
      humanImg.classList.add('active');
      compImg.classList.remove('active');
      humanImg.style.opacity = '1';
      compImg.style.opacity = '0.5';
      if (difficultySelect) difficultySelect.style.display = 'none';
    } else {
      humanImg.classList.remove('active');
      compImg.classList.add('active');
      humanImg.style.opacity = '0.5';
      compImg.style.opacity = '1';
      if (difficultySelect) difficultySelect.style.display = 'inline-block';
    }
  }
}

function initializeAIPlayers() {
  // Set player types based on selections
  players.forEach(color => {
    const selection = playerSelections[color];
    if (selection.type === 'computer') {
      aiManager.setPlayerType(color, 'computer', selection.difficulty);
    } else {
      aiManager.setPlayerType(color, 'human');
    }
  });
}

function getNextAvailablePlayer(startIndex) {
  if (finishedPlayers.size === 4) return null;
  let index = startIndex;
  for (let i = 0; i < players.length; i++) {
    const player = players[index];
    if (!finishedPlayers.has(player)) return player;
    index = (index + 1) % players.length;
  }
  return null;
}

function resetAllPawns() {
  allPawns.flat().forEach(pawn => !pawn.isInHome && pawn.sendToHome());
  updatePawnStacking();
}

function resetGameState() {
  diceRolled = false;
  currentRollValue = 0;
  pawnMovedThisTurn = false;
  isAnimating = false;
  autoMoveInProgress = false;
  extraTurnEarned = false;
  isCaptureAnimation = false;
  nextPlayerAfterWin = null;
  resetPulseEffects();
  allDice.forEach(dice => dice.reset && dice.reset());
}

function setupEventListeners() {
  // Player mode image buttons on screen2
  setupPlayerModeButtons();
  
  // Start game button on screen2
  const startGameBtn = document.getElementById('startGameBtn');
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      console.log('Start Game button clicked');
      showScreen3();
      hide(screen2);
      drawAll();
    });
  }
  
  // Canvas clicks
  canvas.addEventListener('click', handleCanvasClick);
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
  
  // Game events
  document.addEventListener('diceRolled', handleDiceRolled);
  document.addEventListener('pawnMoveComplete', handlePawnMoveComplete);
}

function setupPlayerModeButtons() {
  players.forEach(color => {
    const humanImg = document.getElementById(`${color}ModeImg`);
    const compImg = document.getElementById(`${color}ModeImg2`);
    const difficultySelect = document.getElementById(`${color}Difficulty`);
    
    if (humanImg) {
      humanImg.addEventListener('click', function() {
        console.log(`${color} set to human`);
        setPlayerMode(color, 'human');
      });
    }
    
    if (compImg) {
      compImg.addEventListener('click', function() {
        console.log(`${color} set to computer`);
        setPlayerMode(color, 'computer');
      });
    }
    
    if (difficultySelect) {
      difficultySelect.addEventListener('change', function() {
        playerSelections[color].difficulty = this.value;
        console.log(`${color} difficulty set to ${this.value}`);
      });
    }
  });
}

function setPlayerMode(color, mode) {
  playerSelections[color].type = mode;
  updatePlayerModeUI(color, mode);
}

const touch = new TouchVisualizer(canvas);  
let drawTouch = false;
function handleCanvasClick(e){
  
  if (gameState !== 'playing') {
    console.log(`Game is not active (state: ${gameState})`);
    return;
  }
  
  if (autoMoveInProgress) {
    console.log(`Auto-move in progress, ignoring click`);
    return;
  }
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  touch.recordTouch(x,y);
  drawTouch = true;
  // If current player is AI, don't allow human clicks
  if (aiManager.isAIPlayer(activePlayer)) {
    console.log(`It's ${activePlayer} AI's turn - waiting for AI move...`);
    return;
  }
  
  let diceClicked = false;
  for (const dice of allDice) {
    if (dice.isPointInside(x, y) && dice.color === activePlayer) {
      console.log(`Clicked on ${dice.color} dice`);
      
      if (diceRolled) {
        console.log(`Already rolled this turn! Current roll: ${currentRollValue}`);
      } else {
        gameSounds.playSound('dice');
        dice.handleClick();
      }
      
      diceClicked = true;
      break;
    }
  }
  
  if (!diceClicked && diceRolled && !isAnimating && !pawnMovedThisTurn) {
    handlePawnMovement(x, y);
  } else if (!diceClicked && !diceRolled) {
    console.log(`Need to roll dice first! Click the ${activePlayer} dice.`);
  }
}

function handleKeyDown(e) {
  if (e.key === 'm' || e.key === 'M') {
    const muted = gameSounds.toggleMute();
    console.log(`Sounds: ${muted ? 'Muted' : 'Unmuted'}`);
  }
  if ((e.key === 'r' || e.key === 'R') && (gameState === 'playing' || gameState === 'player_won')) {
    console.log('Restarting game...');
    showScreen1();
    startProgress();
  }
}

function triggerAIRoll() {
  if (gameState !== 'playing') return;
  if (diceRolled || isAnimating || autoMoveInProgress) return;
  
  const dice = allDice.find(d => d.color === activePlayer);
  if (dice) {
    console.log(`🤖 ${activePlayer} AI rolling dice...`);
    gameSounds.playSound('dice');
    dice.handleClick();
  }
}

async function handleDiceRolled(e) {
  if (gameState !== 'playing') return;
  
  const { value, color } = e.detail;
  console.log(`Dice rolled: ${color} rolled ${value}`);
  
  if (color !== activePlayer) {
    console.log(`Wrong player! It's ${activePlayer}'s turn, not ${color}'s`);
    return;
  }
  
  if (diceRolled) {
    console.log(`Already rolled this turn!`);
    return;
  }
  
  diceRolled = true;
  currentRollValue = value;
  console.log(`${color} can move a pawn ${value} spaces`);
  
  // Check if player has any movable pawns
  if (!playerHasMovablePawns(color, value)) {
    console.log(`${color} has no pawns that can move with ${value}`);
    if (value === 6) {
      console.log(`${color} rolled 6 but has no movable pawns`);
    }
    nextPlayer();
    return;
  }
  
  autoMoveInProgress = false;
  resetPulseEffects();
  
  // If human player, show pulse effects
  if (!aiManager.isAIPlayer(color)) {
    pulseValidPawns();
  }
  
  updatePawnStacking();
  setPlayerPawnsOnTop(activePlayer);
  
  // Handle AI move
  if (aiManager.isAIPlayer(color)) {
    setTimeout(async () => {
      await handleAIMove();
    }, 800);
  } else {
    // Human player: check for auto-move
    const singleValidPawn = checkForSingleValidMove();
    if (singleValidPawn) {
      console.log(`Auto-moving ${activePlayer} pawn ${singleValidPawn.id}`);
      autoMoveInProgress = true;
      
      setTimeout(() => {
        if (diceRolled && !isAnimating && !pawnMovedThisTurn && autoMoveInProgress) {
          resetPulseEffects();
          isAnimating = true;
          pawnMovedThisTurn = true;
          gameSounds.playSound('move');
          const moved = singleValidPawn.move(currentRollValue);
          if (!moved) {
            isAnimating = false;
            pawnMovedThisTurn = false;
            autoMoveInProgress = false;
          }
        }
        autoMoveInProgress = false;
      }, 800);
    }
  }
}

async function handleAIMove() {
  if (!aiManager.isAIPlayer(activePlayer)) return;
  
  console.log(`🤖 ${activePlayer} AI thinking...`);
  
  let pawnArray;
  switch(activePlayer) {
    case 'red': pawnArray = redPawns; break;
    case 'green': pawnArray = greenPawns; break;
    case 'blue': pawnArray = bluePawns; break;
    case 'yellow': pawnArray = yellowPawns; break;
    default: return;
  }
  
  const selectedPawn = await aiManager.makeAIMove(activePlayer, pawnArray, currentRollValue);
  
  if (selectedPawn) {
    console.log(`🤖 ${activePlayer} AI moving pawn ${selectedPawn.id}`);
    
    isAnimating = true;
    pawnMovedThisTurn = true;
    gameSounds.playSound('move');
    
    const moved = selectedPawn.move(currentRollValue);
    if (!moved) {
      isAnimating = false;
      pawnMovedThisTurn = false;
      console.log('AI move failed');
    }
  } else {
    console.log(`🤖 ${activePlayer} AI has no valid move`);
    nextPlayer();
  }
}

function handlePawnMovement(x, y) {
  if (!diceRolled || isAnimating || isCaptureAnimation || pawnMovedThisTurn) return;
  if (aiManager.isAIPlayer(activePlayer)) return;
  
  let pawnArray;
  switch(activePlayer) {
    case 'red': pawnArray = redPawns; break;
    case 'green': pawnArray = greenPawns; break;
    case 'blue': pawnArray = bluePawns; break;
    case 'yellow': pawnArray = yellowPawns; break;
    default: return;
  }
  
  for (const pawn of pawnArray) {
    if (pawn.isPointInside(x, y)) {
      console.log(`Clicked on ${activePlayer} pawn ${pawn.id}`);
      
      if (!validateMove(pawn, currentRollValue)) {
        console.log(`Move validation failed`);
        return;
      }
      
      isAnimating = true;
      pawnMovedThisTurn = true;
      gameSounds.playSound('move');
      resetPulseEffects();
      updatePawnStacking();
      setPlayerPawnsOnTop(activePlayer);
      
      const moved = pawn.move(currentRollValue);
      if (!moved) {
        isAnimating = false;
        pawnMovedThisTurn = false;
        console.log(`Move failed`);
      }
      return;
    }
  }
  
  console.log(`No pawn clicked`);
}

function handlePawnMoveComplete(e) {
  if (gameState !== 'playing') return;
  
  const { color, pawnId, isFinished } = e.detail;
  console.log(`Pawn ${color}-${pawnId} move complete`);
  
  autoMoveInProgress = false;
  updatePawnStacking();
  
  // Get the pawn that just moved
  const movedPawn = findPawnById(color, pawnId);
  
  if (movedPawn) {
    // Get the pawn's current position for explosion effects
    const pawnX = movedPawn.x;
    const pawnY = movedPawn.y;
    
    // Check for captures
    const capturedPawns = checkForCapturesWithPositions(movedPawn);
    
    if (capturedPawns.length > 0) {
      // Create explosion effects for each captured pawn
      capturedPawns.forEach(capturedPawn => {
        // Get the captured pawn's position BEFORE sending it home
        const capturedX = capturedPawn.x;
        const capturedY = capturedPawn.y;
        
        // Create explosion at captured pawn's position
        ParticleSystems.createExplosion(capturedX, capturedY, capturedPawn.color, 20);
        
        // Create trail from captured pawn to home (optional)
        const homePos = capturedPawn.getHomePosition();
        ParticleSystems.createTrail(capturedX, capturedY, homePos.x, homePos.y, capturedPawn.color, 15);
        
        // Send pawn home (this happens in checkForCaptures, but we need to ensure it happens)
        capturedPawn.sendToHome();
      });
      
      gameSounds.playSound('capture');
      extraTurnEarned = true;
      console.log(`${color} gets extra turn for capture!`);
    }
    
    // Check if this pawn finished
    if (!capturedPawns.length && isFinished) {
      // Create celebration explosion at finished pawn position
      ParticleSystems.createExplosion(pawnX, pawnY, color, 30);
      
      // Add trail effect from last position to finish
      const lastPosition = movedPawn.path[movedPawn.path.length - 1];
      ParticleSystems.createTrail(pawnX, pawnY, lastPosition.x, lastPosition.y, color, 20);
      
      gameSounds.playSound('finish');
      
      // Check if player has won
      if (checkPlayerFinished(color)) {
        showWinScreen(color);
        return;
      }
      extraTurnEarned = true;
      console.log(`${color} gets extra turn for finishing pawn!`);
    }
  }
  
  handleTurnComplete();
}

// New helper function to check for captures and return captured pawns
function checkForCapturesWithPositions(movedPawn) {
  const capturedPawns = [];
  
  if (movedPawn.isInHome || movedPawn.isInHomeStretch || movedPawn.isFinished) return capturedPawns;
  if (isSafePosition(movedPawn.positionIndex)) return capturedPawns;
  
  const movedCellId = movedPawn.getCellId();
  
  for (const pawnArray of allPawns) {
    for (const otherPawn of pawnArray) {
      if (otherPawn === movedPawn || 
          otherPawn.color === movedPawn.color ||
          otherPawn.isInHome ||
          otherPawn.isInHomeStretch ||
          otherPawn.isFinished) continue;
      
      if (isSafePosition(otherPawn.positionIndex)) continue;
      
      if (movedCellId === otherPawn.getCellId()) {
        console.log(`${movedPawn.color} captured ${otherPawn.color}!`);
        capturedPawns.push(otherPawn);
      }
    }
  }
  
  return capturedPawns;
}

function handleTurnComplete() {
  console.log(`Completing turn for ${activePlayer}`);
  
  if (extraTurnEarned) {
    console.log(`${activePlayer} gets another turn!`);
    extraTurnEarned = false;
    diceRolled = false;
    currentRollValue = 0;
    pawnMovedThisTurn = false;
    isAnimating = false;
    autoMoveInProgress = false;
    
    // Reset dice visual for AI players too
    const dice = allDice.find(d => d.color === activePlayer);
    if (dice && dice.reset) {
      dice.reset();
    }
    
    // If it's AI's turn again, trigger roll
    if (aiManager.isAIPlayer(activePlayer)) {
      setTimeout(() => {
        triggerAIRoll();
      }, 1000);
    }
    return;
  }
  
  isAnimating = false;
  autoMoveInProgress = false;
  
  if (currentRollValue === 6) {
    console.log(`${activePlayer} rolled 6, gets another turn`);
    diceRolled = false;
    currentRollValue = 0;
    pawnMovedThisTurn = false;
    
    // Reset dice visual
    const dice = allDice.find(d => d.color === activePlayer);
    if (dice && dice.reset) {
      dice.reset();
    }
    
    // If AI rolled 6, trigger their next roll
    if (aiManager.isAIPlayer(activePlayer)) {
      setTimeout(() => {
        triggerAIRoll();
      }, 1000);
    }
  } else {
    nextPlayer();
  }
}

function nextPlayer() {
  console.log(`Switching to next player`);
  
  diceRolled = false;
  currentRollValue = 0;
  pawnMovedThisTurn = false;
  isAnimating = false;
  autoMoveInProgress = false;
  extraTurnEarned = false;
  
  resetPulseEffects();
  allDice.forEach(dice => dice.reset && dice.reset());
  
  let attempts = 0;
  do {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    activePlayer = players[currentPlayerIndex];
    attempts++;
    
    if (attempts > players.length) {
      gameOver();
      return;
    }
  } while (finishedPlayers.has(activePlayer));
  
  updatePawnStacking();
  setPlayerPawnsOnTop(activePlayer);
  
  console.log(`Now it's ${activePlayer}'s turn`);
  
  // If next player is AI, trigger their move after delay
  if (aiManager.isAIPlayer(activePlayer)) {
    setTimeout(() => {
      triggerAIRoll();
    }, 1000);
  }
}

export function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const allPawnsFlat = allPawns.flat();
  allPawnsFlat.sort((a, b) => a.zIndex - b.zIndex);
  
  board.draw();
  allPawnsFlat.forEach(pawn => pawn.draw(ctx));
  allDice.forEach(dice => {
    dice.draw();
    dice.update();
  });
  
  if (gameState === 'playing') {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Player: ${activePlayer.toUpperCase()}`, 10, 30);
    
    if (aiManager.isAIPlayer(activePlayer)) {
      ctx.fillStyle = 'purple';
      ctx.fillText(`🤖 AI`, 120, 30);
    }
    
    if (diceRolled) {
      ctx.fillStyle = 'blue';
      ctx.fillText(`Rolled: ${currentRollValue}`, 10, 50);
    }
    
    if (currentRollValue === 6 && diceRolled) {
      ctx.fillStyle = 'red';
      ctx.fillText(`Rolled a 6!`, 10, 70);
    }
    
    if (extraTurnEarned) {
      ctx.fillStyle = 'green';
      ctx.font = '14px Arial';
      ctx.fillText(`Extra turn earned!`, 10, 90);
    }
    
    if (finishedPlayers.size > 0) {
      ctx.fillStyle = 'gray';
      ctx.font = '12px Arial';
      let yPos = 130;
      ctx.fillText('Finished players:', 10, yPos);
      finishedPlayers.forEach(player => {
        yPos += 15;
        ctx.fillText(`• ${player.toUpperCase()}`, 20, yPos);
      });
    }
  }
  ParticleSystems.draw(ctx);
  ParticleSystems.update();
  
  if(drawTouch) touch.draw();
  requestAnimationFrame(drawAll);
}

function pulseValidPawns() {
  if (!diceRolled || isAnimating) return;
  
  let pawnArray;
  switch(activePlayer) {
    case 'red': pawnArray = redPawns; break;
    case 'green': pawnArray = greenPawns; break;
    case 'blue': pawnArray = bluePawns; break;
    case 'yellow': pawnArray = yellowPawns; break;
    default: return;
  }
  
  pawnArray.forEach(pawn => {
    pawn.isPulsing = validateMove(pawn, currentRollValue);
  });
}

function resetPulseEffects() {
  allPawns.flat().forEach(pawn => pawn.isPulsing = false);
}

function validateMove(pawn, steps) {
  if (pawn.isInHome && steps !== 6) return false;
  if (pawn.isFinished) return false;
  
  if (pawn.isInHomeStretch) {
    const remainingSteps = pawn.path.length - 1 - pawn.positionIndex;
    if (steps > remainingSteps) return false;
  }
  
  if (!pawn.isInHome) {
    const newIndex = pawn.positionIndex + steps;
    if (newIndex >= pawn.path.length) return false;
  }
  
  return true;
}

function checkForSingleValidMove() {
  let validPawns = [];
  let pawnArray;
  
  switch(activePlayer) {
    case 'red': pawnArray = redPawns; break;
    case 'green': pawnArray = greenPawns; break;
    case 'blue': pawnArray = bluePawns; break;
    case 'yellow': pawnArray = yellowPawns; break;
    default: return null;
  }
  
  pawnArray.forEach(pawn => {
    if (validateMove(pawn, currentRollValue)) validPawns.push(pawn);
  });
  
  return validPawns.length === 1 ? validPawns[0] : null;
}

function setPlayerPawnsOnTop(playerColor) {
  allPawns.flat().forEach(pawn => pawn.zIndex = 0);
  
  let playerPawns;
  switch(playerColor) {
    case 'red': playerPawns = redPawns; break;
    case 'green': playerPawns = greenPawns; break;
    case 'blue': playerPawns = bluePawns; break;
    case 'yellow': playerPawns = yellowPawns; break;
    default: return;
  }
  
  playerPawns.forEach(pawn => pawn.zIndex = 10);
}

function updatePawnStacking() {
  allPawns.flat().forEach(pawn => pawn.resetStackOffset());
  
  const cellGroups = {};
  allPawns.flat().forEach(pawn => {
    if (!pawn.isInHome && !pawn.isFinished) {
      const cellId = pawn.getCellId();
      if (!cellGroups[cellId]) cellGroups[cellId] = [];
      cellGroups[cellId].push(pawn);
    }
  });
  
  for (const cellId in cellGroups) {
    const pawnsInCell = cellGroups[cellId];
    const sameColorPawns = {};
    
    pawnsInCell.forEach(pawn => {
      if (!sameColorPawns[pawn.color]) sameColorPawns[pawn.color] = [];
      sameColorPawns[pawn.color].push(pawn);
    });
    
    for (const color in sameColorPawns) {
      const colorPawns = sameColorPawns[color];
      if (colorPawns.length > 1) {
        colorPawns.forEach((pawn, index) => {
          pawn.setStackOffset(index, colorPawns.length);
        });
      }
    }
  }
}

function playerHasMovablePawns(color, rollValue) {
  let pawnArray;
  switch(color) {
    case 'red': pawnArray = redPawns; break;
    case 'green': pawnArray = greenPawns; break;
    case 'blue': pawnArray = bluePawns; break;
    case 'yellow': pawnArray = yellowPawns; break;
    default: return false;
  }
  
  return pawnArray.some(pawn => {
    if (pawn.isFinished) return false;
    if (pawn.isInHome) return rollValue === 6;
    if (pawn.isInHomeStretch) {
      const remainingSteps = pawn.path.length - 1 - pawn.positionIndex;
      return rollValue <= remainingSteps;
    }
    return pawn.positionIndex + rollValue < pawn.path.length;
  });
}

function findPawnById(color, id) {
  let pawnArray;
  switch(color) {
    case 'red': pawnArray = redPawns; break;
    case 'green': pawnArray = greenPawns; break;
    case 'blue': pawnArray = bluePawns; break;
    case 'yellow': pawnArray = yellowPawns; break;
    default: return null;
  }
  
  return pawnArray.find(pawn => pawn.id === id);
}

function checkPlayerFinished(color) {
  let pawnArray;
  switch(color) {
    case 'red': pawnArray = redPawns; break;
    case 'green': pawnArray = greenPawns; break;
    case 'blue': pawnArray = bluePawns; break;
    case 'yellow': pawnArray = yellowPawns; break;
    default: return false;
  }
  
  return pawnArray.every(pawn => pawn.isFinished);
}

export function showWinScreen(winnerColor) {
  gameState = 'player_won';
  
  let nextIndex = (players.indexOf(activePlayer) + 1) % players.length;
  nextPlayerAfterWin = getNextAvailablePlayer(nextIndex);
  finishedPlayers.add(winnerColor);
  
  winScreen = document.createElement('div');
  winScreen.id = 'winScreen';
  winScreen.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${window.innerWidth}px;
    height: ${window.innerHeight}px;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    z-index: 1001;
  `;
  
  const colorNames = { red: 'Red', green: 'Green', blue: 'Blue', yellow: 'Yellow' };
  const isAIWinner = aiManager.isAIPlayer(winnerColor);
  
  winScreen.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h1 style="text-align: center; font-size: 2em; margin-top: 30px; margin-left: 50px; color: ${winnerColor};">
        ${isAIWinner ? '🤖' : '🎉'} VICTORY! ${isAIWinner ? '🤖' : '🎉'}
      </h1>
      <div style="font-size: 1.2em; margin-bottom: 20px;">
        <span style="font-weight: bold; padding: 5px 15px; border-radius: 20px; background: ${winnerColor}40; border: 2px solid ${winnerColor};">
          ${colorNames[winnerColor]} ${isAIWinner ? 'AI' : 'Player'}
        </span>
        <div style="margin-top: 10px;">has finished all pawns!</div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 15px; width: 80%; margin: 0 auto;">
        <button id="continueGameBtn" style="padding: 15px; font-size: 1.1em; background: #4CAF50; color: white; border: none; border-radius: 25px; cursor: pointer;">
          ▶ CONTINUE GAME
        </button>
        <button id="newGameBtn" style="padding: 12px; font-size: 1em; background: #2196F3; color: white; border: none; border-radius: 20px; cursor: pointer;">
          🎮 NEW GAME
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(winScreen);
  
  document.getElementById('continueGameBtn').addEventListener('click', continueGame);
  document.getElementById('newGameBtn').addEventListener('click', () => {
    winScreen.remove();
    showScreen1();
    startProgress();
  });
  
  gameSounds.playSound('win');
}

function continueGame() {
  if (!winScreen) return;
  winScreen.remove();
  winScreen = null;
  gameState = 'playing';
  
  if (nextPlayerAfterWin) {
    currentPlayerIndex = players.indexOf(nextPlayerAfterWin);
    activePlayer = nextPlayerAfterWin;
  } else {
    gameOver();
    return;
  }
  
  resetGameState();
  updatePawnStacking();
  setPlayerPawnsOnTop(activePlayer);
  
  console.log(`Continuing... Next player: ${activePlayer.toUpperCase()}`);
  
  if (aiManager.isAIPlayer(activePlayer)) {
    setTimeout(() => {
      triggerAIRoll();
    }, 1000);
  }
}

function gameOver() {
  gameState = 'game_over';
  
  const gameOverDiv = document.createElement('div');
  gameOverDiv.id = 'gameOverScreen';
  gameOverDiv.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${window.innerWidth}px;
    height: ${window.innerHeight}px;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    z-index: 1002;
  `;
  
  gameOverDiv.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h1 style="font-size: 2.0rem; margin-bottom: 20px; color: gold;">
        🏆 GAME COMPLETE! 🏆
      </h1>
      <div style="font-size: 1.3em; margin-bottom: 30px; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
        All players have finished!
      </div>
      
      <button id="playAgainFinalBtn" style="padding: 15px 40px; font-size: 1.2em; background: #FF9800; color: white; border: none; border-radius: 25px; cursor: pointer;">
        PLAY AGAIN
      </button>
    </div>
  `;
  
  document.body.appendChild(gameOverDiv);
  document.getElementById('playAgainFinalBtn').addEventListener('click', () => {
    gameOverDiv.remove();
    showScreen1();
    startProgress();
  });
}

// Initialize the game when page loads
window.addEventListener('load', initGame);
// Export what's needed
export { canvas, ctx, dices, gameSounds, aiManager };