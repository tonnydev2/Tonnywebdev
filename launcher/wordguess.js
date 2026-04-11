

import {lookUp,all} from './wordguessconstant.js';

const hint = document.querySelector('.hint');
const totalScore = document.getElementById('total_score');

// Game state
const gameState = {
    score: 0,
    hints: 5,
    coins: 0,
    unlockedLevels: 1, // Start with only level 1 unlocked
    stars: 0 // Track stars earned
};

let starCount = 0;
const particle = document.getElementById('particle');
const starsEl = document.getElementById('stars');
const starFill = document.getElementById('starFill');
const stars = ['⭐','⭐⭐','⭐⭐⭐'];
const hintRect = particle.getBoundingClientRect();

if (starsEl) {
    starsEl.style.position = 'absolute';
    starsEl.style.left = '250px';
}

if (starFill) {
    starFill.style.left = '300px';
}

// Global variables
let pick = null;
let cells = null;
let cellIndex = 0;
let activeCell = null;
const filledCells = [];
let answerBoxes = null;
let feedBack = null;
let timer = -1;
let hue = 0;
let level = 1;

const screen1 = document.querySelector('.screen1');
const screen2 = document.querySelector('.screen3'); // Level selection screen
const screen3 = document.querySelector('.screen2'); // Game screen
const start = document.getElementById('start-btn');

if (start) {
    start.addEventListener('click', () => {
        if (screen1) screen1.style.display = 'none';
        if (screen2) {
            screen2.style.display = 'block';
            updateLevelButtons(); // Update level buttons when showing level selection
        }
    });
}

const wordguess = document.querySelectorAll('.wordguess');
setInterval(() => {
    if (wordguess.length > 0) {
        timer < wordguess.length - 1 ? timer++ : timer = 0;
        wordguess[timer].classList.add('animate');
        hue += 50;
        wordguess[timer].style.color = `hsl(${hue},100%,50%)`;
    }
}, 500);

const levels = document.querySelectorAll('.level');

// Function to update level buttons based on unlocked levels
function updateLevelButtons() {
    levels.forEach((levelElement, i) => {
        const levelNumber = i + 1;
        const img = levelElement.querySelector('img');
        const p = levelElement.querySelector('p');
        
        if (levelNumber <= gameState.unlockedLevels) {
            // Level is unlocked
            img.src = 'unlocked.png';
            levelElement.style.cursor = 'pointer';
            levelElement.style.pointerEvents = 'auto';
            p.style.color = '#000000';
        } else {
            // Level is locked
            img.src = 'locked.png';
            levelElement.style.cursor = 'not-allowed';
            levelElement.style.pointerEvents = 'none';
            p.style.color = '#666666';
        }
    });
}

// Function to check if player earned enough stars to unlock next level
function checkLevelUnlock() {
    console.log("Checking level unlock. Stars:", starCount, "Unlocked levels:", gameState.unlockedLevels);
    
    if (starCount >= 3 && gameState.unlockedLevels < levels.length) {
        // Player has 3 stars, unlock next level
        gameState.unlockedLevels++;
        gameState.stars = 0; // Reset stars for next level
        starCount = 0;
        
        // Save to localStorage
        saveGameState();
        
        // Update stars display
        handleStars();
        
        // Show level up message
        feed(`Congratulations! You've unlocked Level ${gameState.unlockedLevels}!`, '#4CAF50');
        
        // Go back to level selection screen after delay
        setTimeout(() => {
            if (screen3) screen3.style.display = 'none';
            if (screen2) {
                screen2.style.display = 'block';
                updateLevelButtons();
            }
        }, 2000);
        
        return true;
    }
    return false;
}

// Set up level click handlers
levels.forEach((levelElement, i) => {
    levelElement.addEventListener('click', () => {
        const levelNumber = i + 1;
        
        // Check if level is unlocked
        if (levelNumber > gameState.unlockedLevels) {
            alert(`Level ${levelNumber} is locked! Complete Level ${gameState.unlockedLevels} first.`);
            return;
        }
        
        level = levelNumber;
        console.log("Selected level:", level);
        
        // Reset game with new level
        const newPick = resetGame();
        if (newPick) {
            pick = newPick;
        }
        
        // Switch screens
        if (screen2) screen2.style.display = 'none';
        if (screen3) screen3.style.display = 'block';
    });
});

// Load saved state from localStorage
function loadGameState() {
    try {
        const savedScore = localStorage.getItem('wordGuessingScores');
        const savedHints = localStorage.getItem('wordGuessHints');
        const savedTotalScore = localStorage.getItem('wordGuessCoins');
        const savedUnlockedLevels = localStorage.getItem('wordGuessUnlockedLevels');
        const savedStars = localStorage.getItem('wordGuessStars');
        
        if (savedScore) gameState.score = parseInt(savedScore) || 0;
        if (savedHints) gameState.hints = parseInt(savedHints) || 5;
        if (savedTotalScore) gameState.coins = parseInt(savedTotalScore) || 0;
        if (savedUnlockedLevels) gameState.unlockedLevels = parseInt(savedUnlockedLevels) || 1;
        if (savedStars) gameState.stars = parseInt(savedStars) || 0;
        
        // Initialize starCount from saved stars
        starCount = gameState.stars;
    } catch (e) {
        console.error("Error loading game state:", e);
    }
}

// Save state to localStorage
function saveGameState() {
    try {
        localStorage.setItem('wordGuessingScores', gameState.score);
        localStorage.setItem('wordGuessHints', gameState.hints);
        localStorage.setItem('wordGuessCoins', gameState.coins);
        localStorage.setItem('wordGuessUnlockedLevels', gameState.unlockedLevels);
        localStorage.setItem('wordGuessStars', gameState.stars);
    } catch (e) {
        console.error("Error saving game state:", e);
    }
}

// Helper functions (activate, deActivate, addFilledCells, resolveAnswer, trackType, typeText)
// ... [Keep all your existing helper functions exactly as they were] ...

// Update caption with new word
function updateCaption(newPick) {
    const caption = document.getElementById('caption');
    if (!caption || !newPick) return;
    
    const caption_text = `I looked up in a dictionary and chose ${trackType(newPick)} with ${newPick.length} characters. Can you guess it?`;
    
    // Clear any existing typing animation
    if (caption.typingTimeout) {
        clearTimeout(caption.typingTimeout);
        caption.typingTimeout = null;
    }
    
    // Clear and retype the caption
    caption.innerHTML = '';
    typeText(caption_text, caption);
}

// Reset game for new round
function resetGame() {
    console.log("resetGame called with level:", level);
    
    if (!answerBoxes) {
        console.error("answerBoxes element not found!");
        return null;
    }
    
    // Get new word first to know its length
    const newPick = lookUp(level);
    if (!newPick) {
        console.error("No word found for level:", level);
        return null;
    }
    
    console.log("New word:", newPick);
    
    // Clear existing answer boxes
    answerBoxes.innerHTML = '';
    
    // Create new answer boxes matching the new word's length
    for (let i = 0; i < newPick.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'answer_box';
        answerBoxes.appendChild(cell);
    }
    
    // Get the new cells - UPDATE GLOBAL VARIABLE
    cells = document.querySelectorAll('.answer_box');
    console.log("Created", cells.length, "cells");
    
    // Reset game state variables
    cellIndex = 0;
    filledCells.length = 0;
    
    // Set up event listeners for new cells
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (activeCell) deActivate(activeCell);
            
            const clickedIndex = Array.from(cells).indexOf(cell);
            cellIndex = clickedIndex;
            activate(cell);
        });
    });
    
    // Set first cell as active
    if (cells.length > 0) {
        activeCell = cells[cellIndex];
        activate(activeCell);
    } else {
        activeCell = null;
    }
    
    // Update caption with new word
    updateCaption(newPick);
    
    // Update feedback
    if (feedBack) {
        feedBack.textContent = `Level ${level} - Get 3 stars to unlock next level!`;
        feedBack.style.color = '#4CAF50';
    }
    
    // Return the new pick
    return newPick;
}

// Add stars 
function handleStars() {
    if (starFill) {
        // Show current stars
        starFill.innerHTML = starCount >= 1 ? stars[starCount - 1] || '' : '';
        
        // Update gameState stars
        gameState.stars = starCount;
        saveGameState();
    }
}

function activate(cell) {
    if (!cell) return;
    activeCell = cell;
    cell.classList.add('active');
}

function deActivate(cell) {
    if (!cell) return;
    cell.classList.remove('active');
}

function addFilledCells() {
    filledCells.length = 0;
    if (!cells) return;
    
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].innerHTML !== '') {
            filledCells.push(cells[i]);
        }
    }
}
function trackType(option) {
    if (!option || !all) return 'an item';
    
    switch(true) {
        case all.fruits && all.fruits.includes(option): return 'a fruit';
        case all.domesticAnimals && all.domesticAnimals.includes(option): return 'a domestic animal';
        case all.wildAnimals && all.wildAnimals.includes(option): return 'a wild animal';
        case all.countries && all.countries.includes(option): return 'a country name';
        case all.plants && all.plants.includes(option): return 'a plant';
        case all.food && all.food.includes(option): return 'a food type';
        case all.vehicles && all.vehicles.includes(option): return 'a vehicle';
        case all.insects && all.insects.includes(option): return 'an insect';
        case all.peopleNames && all.peopleNames.includes(option): return `a person's name`;
        case all.birds && all.birds.includes(option): return 'a bird';
        default: return 'an item';
    }
}

function typeText(text, element) {
    if (!element) return;
    
    let index = 0;
    let typedText = '';
    
    // Clear any existing typing
    if (element.typingTimeout) {
        clearTimeout(element.typingTimeout);
    }
    
    function type() {
        if (index < text.length) {
            typedText += text.charAt(index);
            element.innerHTML = typedText;
            index++;
            element.typingTimeout = setTimeout(type, 70);
        } else if (typedText.length === text.length) {
            setTimeout(() => {
                if (pick) {
                    feed(`hmm... ${trackType(pick)}? Good luck cracking it.`, '#C1FF2A');
                }
            }, 500);
        }
    }
    type();
}
function resolveAnswer() {
    if (!cells) return;
    
    const allFilled = filledCells.length === cells.length;
    if (allFilled) {
        checkAnswer();
    }
}


// Check if answer is correct
function checkAnswer() {
    console.log("checkAnswer called");
    
    if (!cells || !feedBack || !pick) {
        console.error("Missing required elements in checkAnswer!");
        return;
    }
    
    const guess = Array.from(cells).map(cell => cell.innerHTML).join('');
    console.log("Guess:", guess, "Correct:", pick);
    
    if (guess === pick) {
        // Calculate score: word length × 5
        const scoreEarned = pick.length * 5;
        gameState.score += scoreEarned;
        gameState.coins += Math.floor(scoreEarned / 5);
        
        // Add a star for correct answer (max 3 stars per level)
        if (starCount < 3) {
            starCount++;
            handleStars();
            feed(`Correct! You earned ${scoreEarned} points and got ${starCount}/3 stars!`, 'green');
        } else {
            feed(`Correct! You earned ${scoreEarned} points! You already have 3 stars!`, 'green');
        }
        
        cells.forEach(cell => {
            cell.classList.remove('incorrect');
            cell.classList.add('correct');
        });
        
        // Save score and update UI
        saveGameState();
        updateUI();
        
        // Check if player unlocked next level
        const unlocked = checkLevelUnlock();
        
        // Reset game after delay (unless we're going back to level selection)
        if (!unlocked) {
            setTimeout(() => {
                const newPick = resetGame();
                if (newPick) {
                    pick = newPick;
                }
            }, 2000);
        }
        
    } else {
        // Wrong answer - no star earned
        feed('Incorrect! Try again. No star earned.', 'red');
        
        cells.forEach(cell => {
            const thisCellIndex = Array.from(cells).indexOf(cell);
            if (cell.innerHTML !== pick[thisCellIndex]) {
                cell.classList.add('incorrect');
            } else {
                cell.classList.add('correct');
            }
        });
        
        setTimeout(() => {
            if (cells && pick) {
                const failed = [];
                cells.forEach(cell => {
                    cell.classList.remove('incorrect');
                    const thisCellIndex = Array.from(cells).indexOf(cell);
                    if (cell.innerHTML !== pick[thisCellIndex]) {
                        cell.innerHTML = '';
                        failed.push(cell);
                    }
                });
                
                const cracked = pick.length - failed.length;
                if (cracked >= (pick.length * 0.5)) {
                    feed(`Ah! almost there, only ${failed.length} ${failed.length === 1 ? 'character' : 'characters'} remaining. You need ${3 - starCount} more stars to unlock next level.`, '#FF7800');
                } else if (cracked > 0) {
                    feed(`Not bad, at least you've cracked ${cracked} ${cracked === 1 ? 'character' : 'characters'}. You need ${3 - starCount} more stars to unlock next level.`, '#FF00FF');
                } else {
                    feed(`Don't give up! You need ${3 - starCount} more stars to unlock next level.`, '#FF004C');
                }
                
                // Reactivate the first empty cell
                if (cells.length > 0) {
                    let firstEmptyIndex = -1;
                    for (let i = 0; i < cells.length; i++) {
                        if (cells[i].innerHTML === '') {
                            firstEmptyIndex = i;
                            break;
                        }
                    }
                    
                    if (firstEmptyIndex !== -1) {
                        if (activeCell) deActivate(activeCell);
                        cellIndex = firstEmptyIndex;
                        activeCell = cells[cellIndex];
                        activate(activeCell);
                    } else {
                        activeCell = null;
                    }
                }
            }
        }, 1000);
    }
}

function feed(feedback, color) {
    console.log("Feedback:", feedback);
    if (feedBack) {
        feedBack.textContent = feedback;
        feedBack.style.color = color;
    } else {
        console.warn("Feedback element not found!");
    }
}

// Update UI with current state
function updateUI() {
    const scoreElement = document.getElementById('score');
    const hintsElement = document.getElementById('hints');
    const totalScoreElement = document.getElementById('totalScore');
    
    if (scoreElement) scoreElement.textContent = gameState.score;
    if (hintsElement) hintsElement.textContent = gameState.hints;
    if (totalScoreElement) totalScoreElement.textContent = gameState.coins;
    if (totalScore) totalScore.textContent = gameState.coins;
}

// Show shop dialog function
// ... [Keep your existing showShopDialog function] ...
function showShopDialog() {
    const shopDialog = document.getElementById('shopDialog');
    if (!shopDialog) return;
    
    const buyHintBtn = document.getElementById('buyHint');
    const closeShopBtn = document.getElementById('closeShop');
    const hintCostElement = document.getElementById('hintCost');
    const currentScoreElement = document.getElementById('currentScore');
    
    if (!buyHintBtn) {
        console.error('Buy hint button not found');
        return;
    }
    
    if (hintCostElement) hintCostElement.textContent = '5';
    if (currentScoreElement) currentScoreElement.textContent = gameState.coins;
    shopDialog.style.display = 'flex';
    
    if (buyHintBtn) {
        buyHintBtn.onclick = function() {
            if (gameState.coins >= 5) {
                const numOfHints = Math.trunc(gameState.coins / 5);
                gameState.coins -= 5 * numOfHints;
                gameState.hints += numOfHints;
                saveGameState();
                updateUI();
                shopDialog.style.display = 'none';
                alert(`Purchased ${numOfHints} hint${numOfHints > 1 ? 's' : ''}!`);
            } else {
                alert('Not enough coins to buy hints!');
            }
        };
    }
    
    if (closeShopBtn) {
        closeShopBtn.onclick = function() {
            shopDialog.style.display = 'none';
        };
    }
    
    // Close when clicking outside
    shopDialog.onclick = function(e) {
        if (e.target === shopDialog) {
            shopDialog.style.display = 'none';
        }
    };
}

window.addEventListener('load', () => {
    console.log("Game loading...");
    
    // Load saved state
    loadGameState();
    
    // Initialize starCount from saved state
    starCount = gameState.stars;
    
    // Get DOM elements
    const caption = document.getElementById('caption');
    answerBoxes = document.getElementById('answerBoxes');
    const hintButton = document.querySelector('.hint');
    feedBack = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.button');
    const totalScoreElement = document.getElementById('total_score');
    
    console.log("DOM elements loaded:", {
        answerBoxes: !!answerBoxes,
        feedBack: !!feedBack,
        hintButton: !!hintButton,
        buttons: buttons.length
    });
    
    // Initialize game
    const newPick = resetGame();
    if (newPick) {
        pick = newPick;
    }
    
    // Initialize stars display
    handleStars();
    
    // Update level buttons
    updateLevelButtons();
    
    // Update UI with initial values
    updateUI();
    
    // Create shop dialog if it doesn't exist
    if (!document.getElementById('shopDialog')) {
        const shopDialog = document.createElement('div');
        shopDialog.id = 'shopDialog';
        shopDialog.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const numOfHints = Math.trunc(gameState.coins / 5);
        shopDialog.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center; max-width: 300px;">
                <h2 style="margin-bottom: 1rem;">Hints Shop</h2>
                <p>Buy hints when you run out!</p>
                <p>1 Hint costs <span id="hintCost" style="color: green; font-weight: bold;">5</span> coins</p>
                <p>Your current coins: <span id="currentScore" style="font-weight: bold;">${gameState.coins}</span></p>
                <button id="buyHint" style="margin: 10px; padding: 10px 20px; background: green; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Buy Hint${numOfHints > 1 ? 's' : ''}
                </button>
                <button id="closeShop" style="margin: 10px; padding: 10px 20px; background: #ccc; border: none; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(shopDialog);
    }
    
    // Button click handlers
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (!activeCell) {
                console.log("No active cell!");
                return;
            }
            
            activeCell.innerHTML = button.innerHTML;
            deActivate(activeCell);
            
            // Find next empty cell
            let nextIndex = cellIndex;
            for (let i = 0; i < cells.length; i++) {
                nextIndex = (cellIndex + i + 1) % cells.length;
                if (cells[nextIndex].innerHTML === '') {
                    break;
                }
            }
            
            cellIndex = nextIndex;
            activate(cells[cellIndex]);
            
            addFilledCells();
            resolveAnswer();
        });
    });
    
    // Hint click handler
    if (hintButton) {
        hintButton.addEventListener('click', () => {
            console.log("Hint clicked, hints available:", gameState.hints);
            
            // Check if player has hints
            if (gameState.hints <= 0) {
                showShopDialog();
                return;
            }
            
            // Use a hint
            gameState.hints--;
            saveGameState();
            updateUI();
            
            if (!cells || !pick) return;
            
            // Find empty cells
            const emptyCells = Array.from(cells).filter(cell => cell.innerHTML === '');
            if (emptyCells.length === 0) return;
            
            // Pick a random empty cell
            const randCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const cellIndexToFill = Array.from(cells).indexOf(randCell);
            
            // Fill the cell with correct letter
            randCell.innerHTML = pick[cellIndexToFill];
            particle.innerHTML = pick[cellIndexToFill];
             animate();
																														
            
            
            // Deactivate current active cell if it exists
            if (activeCell) deActivate(activeCell);
            
            // Find next empty cell to activate
            let nextEmptyIndex = -1;
            for (let i = 0; i < cells.length; i++) {
                const checkIndex = (cellIndexToFill + i + 1) % cells.length;
                if (cells[checkIndex].innerHTML === '') {
                    nextEmptyIndex = checkIndex;
                    break;
                }
            }
            
            // If there's an empty cell, activate it
            if (nextEmptyIndex !== -1) {
                cellIndex = nextEmptyIndex;
                activate(cells[cellIndex]);
            } else {
                activeCell = null;
            }
            
            addFilledCells();
            resolveAnswer();
        });
    }
    
    console.log("Game initialized successfully!");
    console.log("Unlocked levels:", gameState.unlockedLevels);
    console.log("Current stars:", starCount);
});