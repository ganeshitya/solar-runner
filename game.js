const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 400; // You can adjust these values
canvas.height = 480; // You can adjust these values

let gameSpeed = 1;
let gravity = 0.3;
let score = 0;
let gameOver = false;
let panelHeight = 20;
let sunReachedHeight = 50;

// Robot
let robot = {
  x: 180,
  y: 400,
  width: 40,
  height: 40,
  vy: 0,
  isJumping: false
};

// Panels (Staircase)
let panels = [{ x: 160, y: 440, width: 80, height: panelHeight }];

// Falling Objects
let objects = [];

// Key Controls
let keys = {
  left: false,
  right: false,
  build: false
};

document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'Space') keys.build = true;
});

document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'ArrowRight') keys.right = false;
  if (e.code === 'Space') keys.build = false;
});

// Game Loop Functions
function update() {
  if (keys.left) robot.x -= 3;
  if (keys.right) robot.x += 3;

  // Prevent robot from falling off
  if (robot.x < 0) robot.x = 0;
  if (robot.x + robot.width > canvas.width) robot.x = canvas.width - robot.width;

  // Gravity & Jump
  robot.y += robot.vy;
  robot.vy += gravity;

  // Check if standing on top panel
  let topPanel = panels[panels.length - 1];
  if (
    robot.x + robot.width > topPanel.x &&
    robot.x < topPanel.x + topPanel.width &&
    robot.y + robot.height >= topPanel.y &&
    robot.y + robot.height <= topPanel.y + 5
  ) {
    robot.y = topPanel.y - robot.height;
    robot.vy = 0;
    robot.isJumping = false;
  }

  // Build Panels if Holding Space
  if (keys.build) {
    // Add panel every few frames
    if (frames % 30 === 0) {
      panels.push({
        x: topPanel.x,
        y: topPanel.y - panelHeight,
        width: 80,
        height: panelHeight
      });
      robot.y -= panelHeight;
      score += 10;
    }
  }

  // Move Panels & Check Height
  panels.forEach(panel => {
    panel.y += gameSpeed;
  });

  // If top panel reaches sun height — Victory!
  if (topPanel.y <= sunReachedHeight) {
    gameOver = true;
    setTimeout(() => {
      alert(`You reached the sun! Score: ${score}`);
      location.reload();
    }, 100);
  }

  // Spawn Falling Objects
  if (frames % 100 === 0) {
    objects.push({
      x: Math.random() * (canvas.width - 20),
      y: -20,
      width: 20,
      height: 20,
      vy: 2 + Math.random() * 2
    });
  }

  // Move Objects
  objects.forEach(obj => {
    obj.y += obj.vy;
  });

  // Collision with Robot
  objects.forEach(obj => {
    if (
      robot.x < obj.x + obj.width &&
      robot.x + robot.width > obj.x &&
      robot.y < obj.y + obj.height &&
      robot.y + robot.height > obj.y
    ) {
      gameOver = true;
      setTimeout(() => {
        alert(`Hit by falling object! Final Score: ${score}`);
        location.reload();
      }, 100);
    }
  });

  // Remove off-screen objects
  objects = objects.filter(obj => obj.y < canvas.height);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#d0eaff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sun (Goal)
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(200, 30, 20, 0, Math.PI * 2);
  ctx.fill();

  // Panels
  ctx.fillStyle = 'orange';
  panels.forEach(panel => ctx.fillRect(panel.x, panel.y, panel.width, panel.height));

  // Robot
  ctx.fillStyle = 'blue';
  ctx.fillRect(robot.x, robot.y, robot.width, robot.height);

  // Falling Objects
  ctx.fillStyle = 'red';
  objects.forEach(obj => ctx.fillRect(obj.x, obj.y, obj.width, obj.height));

  // HUD
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(`Score: ${score}`, 10, 20);
}

let frames = 0;
function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    frames++;
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();
