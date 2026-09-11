// ai.js - Ensure proper async handling
import { isSafePosition, isInHomeStretch } from './constants.js';

export class AIPlayer {
  constructor(color, difficulty = 'hard') {
    this.color = color;
    this.difficulty = difficulty;
    this.thinkingDelay = this.getThinkingDelay();
  }
  
  getThinkingDelay() {
    switch(this.difficulty) {
      case 'easy': return 1500;
      case 'medium': return 1000;
      case 'hard': return 500;
      default: return 1000;
    }
  }
  
  // Get all valid moves for current roll
  getValidMoves(pawns, rollValue) {
    const validMoves = [];
    
    pawns.forEach((pawn, index) => {
      if (this.isMoveValid(pawn, rollValue)) {
        validMoves.push({
          pawn: pawn,
          index: index,
          score: this.evaluateMove(pawn, rollValue)
        });
      }
    });
    
    // Sort by score (highest first)
    validMoves.sort((a, b) => b.score - a.score);
    return validMoves;
  }
  
  // Check if a move is valid
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
  
  // Evaluate a move and assign a score
  evaluateMove(pawn, rollValue) {
    let score = 0;
    
    // Getting out of home is always good
    if (pawn.isInHome && rollValue === 6) {
      score += 100;
    }
    
    // Finishing a pawn is excellent
    if (!pawn.isInHome && !pawn.isInHomeStretch) {
      const newIndex = pawn.positionIndex + rollValue;
      if (newIndex === pawn.path.length - 1) {
        score += 200;
      }
    }
    
    // Entering home stretch is good
    if (!pawn.isInHomeStretch) {
      const newIndex = pawn.positionIndex + rollValue;
      if (newIndex >= pawn.path.length - 7 && newIndex < pawn.path.length) {
        score += 50;
      }
    }
    
    // Moving forward is generally good
    if (!pawn.isInHome) {
      score += rollValue * 5;
    }
    
    // Getting to safe positions
    if (!pawn.isInHome) {
      const newIndex = pawn.positionIndex + rollValue;
      if (isSafePosition(newIndex)) {
        score += 30;
      }
    }
    
    return score;
  }
  
  // Choose the best move
  chooseBestMove(validMoves) {
    if (validMoves.length === 0) return null;
    
    // For easy AI, sometimes make suboptimal choices
    if (this.difficulty === 'easy' && validMoves.length > 1) {
      if (Math.random() < 0.3) {
        return validMoves[1] || validMoves[0];
      }
    }
    
    // For medium AI, 10% chance to choose second best
    if (this.difficulty === 'medium' && validMoves.length > 1) {
      if (Math.random() < 0.1) {
        return validMoves[1] || validMoves[0];
      }
    }
    
    return validMoves[0];
  }
  
  // Make an AI move
  async makeMove(pawns, rollValue) {
    console.log(`🤖 ${this.color} AI thinking... (${this.difficulty} difficulty)`);
    
    // Add thinking delay for realism
    await this.delay(this.thinkingDelay);
    
    const validMoves = this.getValidMoves(pawns, rollValue);
    
    if (validMoves.length === 0) {
      console.log(`🤖 ${this.color} AI has no valid moves`);
      return null;
    }
    
    const bestMove = this.chooseBestMove(validMoves);
    
    if (bestMove) {
      console.log(`🤖 ${this.color} AI chooses pawn ${bestMove.pawn.id} (score: ${bestMove.score.toFixed(1)})`);
      return bestMove.pawn;
    }
    
    return null;
  }
  
  // Helper delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class AIManager {
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
    if (!aiPlayer) {
      console.log(`No AI player found for ${color}`);
      return null;
    }
    
    try {
      return await aiPlayer.makeMove(pawns, rollValue);
    } catch (error) {
      console.error(`Error in AI move for ${color}:`, error);
      return null;
    }
  }
}