const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameSpeed = 2;
let gravity = 0.5;
let score = 0;
let sunTime = 60;
let gameOver = false;

// Robot Object
let robot = {
  x: 100,
  y: 300,
  width: 40,
  height: 40,
  vy: 0,
  isJumping: false
};

// Rooftops Array
let rooftops = [
  { x: 0, y: 340, width: 200, height: 60 },
  { x: 300, y: 340, width: 150, height: 60 },
  { x: 550, y: 340, width: 250, height: 60 }
];

// Panels
let panels = [];

// Obstacles Array
let obstacles = [
  { x: 400, y: 310, width: 30, height: 30 }
];

// Timer
let sunTimer = setInterval(() => {
  sunTime--;
  if (sunTime <= 0) {
    gameOver = true;
    clearInterval(sunTimer);
    setTimeout(() => {
      alert(`Game Over! You scored ${score} points!`);
      location.reload();
    }, 100);
  }
}, 1000);

// Key Events
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    // Check if robot is on a rooftop
    let onRoof = rooftops.some(roof =>
      robot.x + robot.width > roof.x &&
      robot.x < roof.x + roof.width
    );
    if (onRoof) {
      panels.push({ x: robot.x + 50, y: robot.y + robot.height - 10 });
      score += 10;
    }
  }
  if (e.code === 'ArrowUp' && !robot.isJumping) {
    robot.vy = -10;
    robot.isJumping = true;
  }
});

function update() {
  // Gravity
  robot.y += robot.vy;
  robot.vy += gravity;

  if (robot.y >= 300) {
    robot.y = 300;
    robot.vy = 0;
    robot.isJumping = false;
  }

  // Move rooftops
  rooftops.forEach(roof => roof.x -= gameSpeed);
  if (rooftops[0].x + rooftops[0].width < 0) {
    rooftops.shift();
    rooftops.push({
      x: 800,
      y: 340,
      width: 150 + Math.random() * 100,
      height: 60
    });
  }

  // Move panels
  panels.forEach(panel => panel.x -= gameSpeed);

  // Move obstacles
  obstacles.forEach(obs => obs.x -= gameSpeed);
  if (obstacles[0].x + obstacles[0].width < 0) {
    obstacles.shift();
    obstacles.push({
      x: 800,
      y: 310,
      width: 30,
      height: 30
    });
  }

  // Collision detection with obstacles
  obstacles.forEach(obs => {
    if (
      robot.x < obs.x + obs.width &&
      robot.x + robot.width > obs.x &&
      robot.y + robot.height > obs.y
    ) {
      gameOver = true;
      clearInterval(sunTimer);
      setTimeout(() => {
        alert(`You hit an obstacle! Final Score: ${score}`);
        location.reload();
      }, 100);
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#d0eaff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Rooftops
  ctx.fillStyle = 'gray';
  rooftops.forEach(roof => ctx.fillRect(roof.x, roof.y, roof.width, roof.height));

  // Panels
  ctx.fillStyle = 'orange';
  panels.forEach(panel => ctx.fillRect(panel.x, panel.y, 30, 10));

  // Obstacles
  ctx.fillStyle = 'red';
  obstacles.forEach(obs => ctx.fillRect(obs.x, obs.y, obs.width, obs.height));

  // Robot
  ctx.fillStyle = 'blue';
  ctx.fillRect(robot.x, robot.y, robot.width, robot.height);

  // HUD
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Sunlight: ${sunTime}s`, 700, 20);
}

function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();
