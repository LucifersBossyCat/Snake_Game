const boardSize = 20;
const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const speedSelect = document.getElementById("speed");
const difficultySelect = document.getElementById("difficulty");
const themeSelect = document.getElementById("theme");

const settingsToggle = document.getElementById("settings-toggle");
const settingsModal = document.getElementById("settings-modal");
const closeSettings = document.getElementById("close-settings");

let snake = [{ x: 10, y: 10 }];
let food;
let direction = { x: 1, y: 0 };
let intervalId;
let score = 0;
let isPaused = false;
let obstacles = [];

let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreDisplay.textContent = highScore;

// === Board Rendering ===
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    board.appendChild(cell);
  }
}

function updateBoard() {
  createBoard();
  drawSnake();
  drawFood();
  drawObstacles();
}

function drawSnake() {
  snake.forEach(segment => {
    const index = segment.y * boardSize + segment.x;
    board.children[index]?.classList.add("snake");
  });
}

function drawFood() {
  const index = food.y * boardSize + food.x;
  board.children[index]?.classList.add("food");
}

function drawObstacles() {
  obstacles.forEach(obs => {
    const index = obs.y * boardSize + obs.x;
    const cell = board.children[index];
    if (cell) {
      cell.style.backgroundColor = "#4e2a3a";
      cell.style.borderRadius = "4px";
    }
  });
}

function getRandomFoodPosition() {
  let newFood;
  let maxAttempts = 1000;
  let attempts = 0;

  do {
    newFood = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize)
    };
    attempts++;
  } while (
    attempts < maxAttempts &&
    (
      snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      obstacles.some(obs => obs.x === newFood.x && obs.y === newFood.y)
    )
  );

  if (attempts >= maxAttempts) {
    console.warn("Could not place food after many attempts.");
    return null;
  }

  return newFood;
}




// === Game Logic ===
function moveSnake() {
  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;

  if (
    head.x < 0 || head.x >= boardSize ||
    head.y < 0 || head.y >= boardSize ||
    snake.some(seg => seg.x === head.x && seg.y === head.y) ||
    obstacles.some(obs => obs.x === head.x && obs.y === head.y)
  ) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    if (score > highScore) {
      highScore = score;
      highScoreDisplay.textContent = highScore;
      localStorage.setItem("snakeHighScore", highScore);
    }
    food = getRandomFoodPosition();
  } else {
    snake.pop();
  }

  updateBoard();
}

function startGame() {
  resetGame();
  generateObstacles(difficultySelect.value);
  applyTheme();

  clearInterval(intervalId);
  intervalId = setInterval(moveSnake, parseInt(speedSelect.value));
  startBtn.textContent = "Restart";
  pauseBtn.textContent = "Pause";
  isPaused = false;
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  food = getRandomFoodPosition();
  score = 0;
  scoreDisplay.textContent = score;
  updateBoard();
}

function gameOver() {
  clearInterval(intervalId);
  document.getElementById("final-score").textContent = score;
  document.getElementById("game-over-modal").classList.remove("hidden");
  document.getElementById("close-popup-btn").addEventListener("click", () => {
  document.getElementById("game-over-modal").classList.add("hidden");
});

}


function togglePause() {
  if (!intervalId) return;
  if (isPaused) {
    intervalId = setInterval(moveSnake, parseInt(speedSelect.value));
    pauseBtn.textContent = "Pause";
    isPaused = false;
  } else {
    clearInterval(intervalId);
    pauseBtn.textContent = "Resume";
    isPaused = true;
  }
}

// === Obstacles ===
function generateObstacles(level) {
  obstacles = [];

    // Perimeter Walls — Top, Bottom, Left, Right
  for (let i = 0; i < boardSize; i++) {
    obstacles.push({ x: i, y: 0 });              // Top
    obstacles.push({ x: i, y: boardSize - 1 });  // Bottom
    obstacles.push({ x: 0, y: i });              // Left
    obstacles.push({ x: boardSize - 1, y: i });  // Right
  }

  if (level === "easy") {
    // No obstacles
    return;
  }

  else if (level === "normal") {
    // Two horizontal lines with center gaps
    for (let x = 2; x < 18; x++) {
      if (x === 9 || x === 10) continue; // leave central gap
      obstacles.push({ x, y: 4 }, { x, y: 15 });
    }
  }

  else if (level === "hard") {
    // Vertical columns with gaps
    for (let y = 3; y < 17; y++) {
      if (y === 9 || y === 10) continue;
      obstacles.push({ x: 5, y }, { x: 14, y });
    }

    // Two shorter horizontal blocks
    for (let x = 4; x < 8; x++) {
      obstacles.push({ x, y: 8 });
    }
    for (let x = 12; x < 16; x++) {
      obstacles.push({ x, y: 11 });
    }
  }
}


// === Theme Application ===
function applyTheme() {
  const theme = themeSelect.value;
  document.body.className = `theme-${theme}`;
}

// === Controls ===
document.addEventListener("keydown", e => {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

  if (keys.includes(e.key)) {
    e.preventDefault(); // Prevent scrolling
  }

  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
    case "p":
    case "P":
      togglePause();
      break;
  }
});


// === Modal Handling ===
settingsToggle.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});
closeSettings.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

// === Button Events ===
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
themeSelect.addEventListener("change", applyTheme);
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("game-over-modal").classList.add("hidden");
  startGame();
});

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
  createBoard();
  updateBoard();
  applyTheme();
});
