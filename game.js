const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let robotX = 50;
let robotY = 300;
let robotWidth = 40;
let score = 0;
let sunTime = 60;
let panels = [];
let isJumping = false;
let jumpHeight = 0;
let gameRunning = true;

function drawRobot() {
  ctx.fillStyle = 'blue';
  ctx.fillRect(robotX, robotY - jumpHeight, robotWidth, 40);
}

function drawPanel(x, y) {
  ctx.fillStyle = 'orange';
  ctx.fillRect(x, y, 30, 10);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = 'lightgray';
  ctx.fillRect(0, 340, canvas.width, 60);

  drawRobot();

  panels.forEach(panel => {
    panel.x -= 2;
    drawPanel(panel.x, panel.y);
  });

  document.getElementById('score').textContent = score;
  document.getElementById('sun').textContent = sunTime;
}

function gameLoop() {
  if (gameRunning) {
    draw();
    requestAnimationFrame(gameLoop);
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (!isJumping) {
      panels.push({ x: robotX + 50, y: robotY + 30 - jumpHeight });
      score += 10;
    }
  }
  if (e.code === 'ArrowUp' && !isJumping) {
    isJumping = true;
    let jumpInterval = setInterval(() => {
      if (jumpHeight < 50) {
        jumpHeight += 5;
      } else {
        clearInterval(jumpInterval);
        let fallInterval = setInterval(() => {
          if (jumpHeight > 0) {
            jumpHeight -= 5;
          } else {
            clearInterval(fallInterval);
            isJumping = false;
          }
        }, 30);
      }
    }, 30);
  }
});

// Sunlight Timer
let sunInterval = setInterval(() => {
  if (sunTime > 0) {
    sunTime--;
  } else {
    gameRunning = false;
    clearInterval(sunInterval);
    alert(`Game Over! You scored ${score} points!`);
  }
}, 1000);

gameLoop();
