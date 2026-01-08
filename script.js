const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");

const blockHeight = 50;
const blockWidth = 50;

const rows = Math.floor(board.clientHeight / blockHeight);
const cols = Math.floor(board.clientWidth / blockWidth);

// touch positions
let touchStartX = 0;
let touchStartY = 0;

let setIntervalId = null;

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const highScoreEl = document.getElementById("high-score");
let score = 0;
let startTime = null;
let timerInterval = null;

// Initialize high score from localStorage
const storedHigh = localStorage.getItem("snakeHighScore");
if (highScoreEl) highScoreEl.textContent = storedHigh ? storedHigh : "0";

let food = {
  y: Math.floor(Math.random() * rows),
  x: Math.floor(Math.random() * cols),
};

const blocks = [];
const snake = [{ x: 2, y: 2 }];

let direction = "down";

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

function render() {
  let head = null;

  blocks[`${food.y}-${food.x}`].classList.add("food");

  if (direction === "down") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "up") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "left") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  } else if (direction === "right") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  }

  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    clearInterval(setIntervalId);
    if (timerInterval) clearInterval(timerInterval);

    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";

    return;
  }
  const willEat = head.y == food.y && head.x == food.x;

  // check collision with self
  const collisionWithBody = snake.some((seg, idx) => {
    // if not eating, moving into the tail (last segment) is allowed because it will vacate
    if (!willEat && idx === snake.length - 1) return false;
    return seg.x === head.x && seg.y === head.y;
  });

  if (collisionWithBody) {
    clearInterval(setIntervalId);
    if (timerInterval) clearInterval(timerInterval);

    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";

    return;
  }

  if (willEat) {
    // remove old food
    const oldFoodBlock = blocks[`${food.y}-${food.x}`];
    if (oldFoodBlock) oldFoodBlock.classList.remove("food");

    // place new food
    food = {
      y: Math.floor(Math.random() * rows),
      x: Math.floor(Math.random() * cols),
    };
    const newFoodBlock = blocks[`${food.y}-${food.x}`];
    if (newFoodBlock) newFoodBlock.classList.add("food");

    // Increase score when food is eaten
    score += 1;
    if (scoreEl) scoreEl.textContent = score;
    if (highScoreEl && score > parseInt(highScoreEl.textContent || "0")) {
      highScoreEl.textContent = score;
      try {
        localStorage.setItem("snakeHighScore", String(score));
      } catch (err) {
        // ignore localStorage errors (e.g., privacy mode)
      }
    }
  }

  // remove previous snake classes (fill and head)
  snake.forEach((segment) => {
    const block = blocks[`${segment.y}-${segment.x}`];
    if (block) {
      block.classList.remove("fill");
      block.classList.remove("head");
    }
  });

  // move snake: add head, pop only if not eating
  snake.unshift(head);
  if (!willEat) snake.pop();

  // add classes: head for first segment, fill for the rest
  snake.forEach((segment, idx) => {
    const block = blocks[`${segment.y}-${segment.x}`];
    if (!block) return;
    if (idx === 0) {
      block.classList.add("head");
    } else {
      block.classList.add("fill");
    }
  });
}

startButton.addEventListener("click", () => {
  modal.style.display = "none";
  // reset score/time when starting
  score = 0;
  if (scoreEl) scoreEl.textContent = score;
  if (timeEl) timeEl.textContent = "00:00";
  if (timerInterval) clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    if (timeEl) timeEl.textContent = `${minutes}:${seconds}`;
  }, 1000);

  setIntervalId = setInterval(() => {
    render();
  }, 200);
});

const restartButton = document.querySelector(".btn-restart");

function resetGame() {
  clearInterval(setIntervalId);
  if (timerInterval) clearInterval(timerInterval);

  // Remove existing snake classes
  Object.values(blocks).forEach((block) => {
    if (!block) return;
    block.classList.remove("fill");
    block.classList.remove("head");
  });

  // Remove existing food class
  const oldFoodBlock = blocks[`${food.y}-${food.x}`];
  if (oldFoodBlock) oldFoodBlock.classList.remove("food");

  // Reset game state
  snake.length = 0;
  snake.push({ x: 2, y: 2 });
  direction = "down";

  // Reset score/time displays
  score = 0;
  if (scoreEl) scoreEl.textContent = score;
  if (timeEl) timeEl.textContent = "00:00";

  // Place new food
  food = {
    y: Math.floor(Math.random() * rows),
    x: Math.floor(Math.random() * cols),
  };
  const newFoodBlock = blocks[`${food.y}-${food.x}`];
  if (newFoodBlock) newFoodBlock.classList.add("food");

  // Show/hide modal
  modal.style.display = "none";
  gameOverModal.style.display = "none";

  // Add initial snake fill
  const startBlock = blocks[`${snake[0].y}-${snake[0].x}`];
  if (startBlock) startBlock.classList.add("head");

  // Start timers
  startTime = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    if (timeEl) timeEl.textContent = `${minutes}:${seconds}`;
  }, 1000);

  setIntervalId = setInterval(() => {
    render();
  }, 200);
}

if (restartButton) {
  restartButton.addEventListener("click", () => {
    resetGame();
  });
}

addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    // If start modal is visible, start the game
    if (
      startGameModal &&
      window.getComputedStyle(startGameModal).display !== "none"
    ) {
      if (startButton) startButton.click();
      return;
    }

    // If game over modal is visible, restart the game
    if (
      gameOverModal &&
      window.getComputedStyle(gameOverModal).display !== "none"
    ) {
      if (restartButton) restartButton.click();
      else resetGame();
      return;
    }
  }

  if (e.key === "ArrowDown") {
    direction = "down";
  } else if (e.key === "ArrowUp") {
    direction = "up";
  } else if (e.key === "ArrowLeft") {
    direction = "left";
  } else if (e.key === "ArrowRight") {
    direction = "right";
  }
});

board.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

board.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // horizontal swipe
    if (diffX > 0 && direction !== "left") {
      direction = "right";
    } else if (diffX < 0 && direction !== "right") {
      direction = "left";
    }
  } else {
    // vertical swipe
    if (diffY > 0 && direction !== "up") {
      direction = "down";
    } else if (diffY < 0 && direction !== "down") {
      direction = "up";
    }
  }
});
