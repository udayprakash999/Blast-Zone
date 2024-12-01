// Global variables
let gridSize = 5; // Default grid size (Easy level)
let bombPositions = [];
let foundBomb = false;
let score = 0;
let timeLeft = 60;
let timerInterval;
let difficulty = 'easy'; // Default difficulty level

const gridElement = document.querySelector('.grid');
const messageElement = document.querySelector('.message');
const scoreElement = document.querySelector('.score');
const timerElement = document.querySelector('.timer');
const restartButton = document.querySelector('#restart');
const difficultyScreen = document.querySelector('#difficulty-screen');
const gameScreen = document.querySelector('#game-screen');

// Difficulty Selection buttons
document.querySelectorAll('.difficulty-selection button').forEach(button => {
  button.addEventListener('click', (e) => {
    difficulty = e.target.id; // Get selected difficulty
    setGameDifficulty(difficulty);
    startGame();
  });
});

// Set Game Difficulty
function setGameDifficulty(level) {
  switch(level) {
    case 'easy':
      gridSize = 5;
      break;
    case 'medium':
      gridSize = 6;
      break;
    case 'hard':
      gridSize = 7;
      break;
  }
  score = 0;
  timeLeft = 60;
  bombPositions = [];
  foundBomb = false;
  scoreElement.textContent = `Score: ${score}`;
  timerElement.textContent = `Time Left: ${timeLeft}s`;
  createGrid();
  placeBombs();
}

// Create grid and cells
function createGrid() {
  gridElement.innerHTML = ''; // Clear previous grid
  gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 70px)`;
  gridElement.style.gridTemplateRows = `repeat(${gridSize}, 70px)`;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    cell.addEventListener('click', () => checkCell(i, cell));
    gridElement.appendChild(cell);
  }
}

// Place bombs randomly based on difficulty
function placeBombs() {
  const totalCells = gridSize * gridSize;
  const numBombs = Math.floor(totalCells / 5); // 20% of grid size (adjustable)
  while (bombPositions.length < numBombs) {
    const bombPosition = Math.floor(Math.random() * totalCells);
    if (!bombPositions.includes(bombPosition)) {
      bombPositions.push(bombPosition);
    }
  }
}

// Handle cell click and check for bomb
function checkCell(index, cell) {
  if (foundBomb) return; // Stop if bomb is already found

  if (bombPositions.includes(index)) {
    cell.style.backgroundColor = '#F44336'; // Red for bomb
    cell.innerHTML = '💣'; // Show bomb emoji
    messageElement.textContent = 'Bomb found! Game Over!';
    
    // Change the theme to red
    document.body.style.backgroundColor = '#D32F2F';  // Red theme for the whole page
    gameScreen.style.backgroundColor = `#960018`; // Red theme for the game screen
    
    // Darken the text color to black
    messageElement.style.color = '#212121';  // Dark text color for message
    scoreElement.style.color = '#212121';    // Dark text color for score
    timerElement.style.color = '#212121';    // Dark text color for timer

    playSound('bomb');
    foundBomb = true;
    scoreElement.textContent = `Score: ${score}`;
    clearInterval(timerInterval); // Stop timer when bomb is found
    restartButton.style.display = 'block'; // Show restart button
  } else {
    cell.style.backgroundColor = '#4CAF50'; // Green for safe cells
    score++; // Increase score for safe cell
    scoreElement.textContent = `Score: ${score}`;
    playSound('safe');
  }
}

// Start the timer countdown
function startTimer() {
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timerElement.textContent = `Time Left: ${timeLeft}s`;
    } else {
      messageElement.textContent = 'Time\'s Up! Game Over!';
      clearInterval(timerInterval);
      restartButton.style.display = 'block'; // Show restart button
    }
  }, 1000);
}

// Play sound effect for bomb or safe
function playSound(type) {
  const audio = new Audio(type === 'bomb' ? 'bomb-sound.mp3' : 'safe-sound.mp3');
  audio.play();
}

// Freeze Timer functionality for 7 seconds
document.querySelector('#freeze-timer').addEventListener('click', () => {
  if (foundBomb) return;  // Don't freeze if the bomb is already found

  // Show the styled freeze timer notification
  const freezeNotification = document.createElement('div');
  freezeNotification.classList.add('freeze-notification');
  freezeNotification.textContent = "Time Freezer will work for 7 seconds!";
  document.body.appendChild(freezeNotification);

  // Remove the notification after 2 seconds
  setTimeout(() => {
    freezeNotification.remove();
  }, 2000);

  // Freeze the timer for 7 seconds
  const originalTimeLeft = timeLeft;

  // Stop the main timer
  clearInterval(timerInterval);

  // Temporarily pause the game timer
  let frozenTime = 7;
  const frozenInterval = setInterval(() => {
    if (frozenTime > 0) {
      frozenTime--;
    } else {
      clearInterval(frozenInterval); // Unfreeze the timer after 7 seconds
      timeLeft = originalTimeLeft; // Restore the original time left
      startTimer(); // Restart the timer
    }
  }, 1000);

  // Set the time to be frozen for 7 seconds
  timeLeft = frozenTime;
  timerElement.textContent = `Time Left: ${timeLeft}s`; // Display the frozen time
});

// Reveal Safe Cell functionality
document.querySelector('#reveal-safe-cell').addEventListener('click', () => {
  if (foundBomb) return;  // Don't reveal if the bomb is already found

  // Get all cells that are not bombs
  const safeCells = Array.from(document.querySelectorAll('.grid-cell')).filter((cell, index) => !bombPositions.includes(index));
  
  // Pick a random safe cell
  const randomSafeCell = safeCells[Math.floor(Math.random() * safeCells.length)];
  
  // Highlight the safe cell
  randomSafeCell.style.backgroundColor = '#FFEB3B';  // Yellow background for safe cell
  setTimeout(() => {
    randomSafeCell.style.backgroundColor = ''; // Reset the cell after a brief moment
  }, 1000);
  
  playSound('safe');
});

// Bomb Radar functionality
document.querySelector('#bomb-radar').addEventListener('click', () => {
  if (foundBomb) return;  // Don't activate radar if bomb is already found

  // Pick a random bomb position
  const randomBombIndex = bombPositions[Math.floor(Math.random() * bombPositions.length)];
  const randomBombCell = document.querySelectorAll('.grid-cell')[randomBombIndex];
  
  // Highlight the bomb cell temporarily
  randomBombCell.style.backgroundColor = '#FF0000';  // Red for bomb radar
  setTimeout(() => {
    randomBombCell.style.backgroundColor = '';  // Reset the cell after a brief moment
  }, 1000);
  
  playSound('safe'); // Optional sound effect for radar
});

// Restart the game and go back to the difficulty selection screen
restartButton.addEventListener('click', () => {
  resetGame();
  showDifficultyScreen(); // Show the difficulty screen
  restartButton.style.display = 'none'; // Hide restart button
});

// Reset game variables
function resetGame() {
  foundBomb = false;
  score = 0;
  timeLeft = 60;
  bombPositions = [];
  scoreElement.textContent = `Score: ${score}`;
  timerElement.textContent = `Time Left: ${timeLeft}s`;
  messageElement.textContent = "Game Started! Find the bomb!";
  clearInterval(timerInterval); // Stop any running timer
  gridElement.innerHTML = ''; // Clear the grid

  // Revert the theme to default (or initial theme)
  document.body.style.backgroundColor = '#121212';  // Default dark theme
  gameScreen.style.backgroundColor = '#212121'; // Default game screen color

  // Revert text color back to default (light color)
  messageElement.style.color = '#FFFFFF'; // Default white color for message
  scoreElement.style.color = '#FFFFFF';   // Default white color for score
  timerElement.style.color = '#FFFFFF';   // Default white color for timer
}

// Show the difficulty selection screen and hide the game screen
function showDifficultyScreen() {
  difficultyScreen.style.display = 'block'; // Show the difficulty selection screen
  gameScreen.style.display = 'none'; // Hide the game screen
}

// Start the game
function startGame() {
  difficultyScreen.style.display = 'none'; // Hide difficulty screen
  gameScreen.style.display = 'block'; // Show game screen
  setGameDifficulty(difficulty); // Set game difficulty based on selected level
  startTimer();
}

