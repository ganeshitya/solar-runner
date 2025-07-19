const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gravity = 0.5;
let gameSpeed = 2;
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
  isJumping: false,
  isPlacingPanel: false
};

// Platforms (Rooftops)
let platforms = [
  { x: 0, y: 340, width: 200, height: 60 }
];

// Panels
let panels = [];

// Sunlight Timer
let sunTimer = setInterval(() => {
  sunTime--;
  if (sunTime <= 0) {
    gameOver = true;
    clearInterval(sunTimer);
    setTimeout(() => {
      alert(`Sunset! Your score: ${score}`);
      location.reload();
    }, 100);
  }
}, 1000);

// Controls
document.addEventListener('keydown', e => {
  if (e.code === 'ArrowUp' && !robot.isJumping) {
    robot.vy = -12;
    robot.isJumping = true;
  }
  if (e.code === 'Space' && robot.isJumping && !robot.isPlacingPanel) {
    // Place Panel in front of robot, aligned with next platform if exists
    let nextPlatform = platforms.find(p => p.x > robot.x);
    if (nextPlatform) {
      panels.push({ x: nextPlatform.x + 10, y: nextPlatform.y - 10 });
      score += 20;
      robot.isPlacingPanel = true;
    }
  }
});

function update() {
  // Gravity & Jump Physics
  robot.y += robot.vy;
  robot.vy += gravity;

  // Ground Collision (Platform Check)
  let onPlatform = platforms.some(p =>
    robot.x + robot.width > p.x &&
    robot.x < p.x + p.width &&
    robot.y + robot.height >= p.y &&
    robot.y + robot.height <= p.y + 10
  );

  if (onPlatform) {
    robot.y = platforms.find(p => 
      robot.x + robot.width > p.x &&
      robot.x < p.x + p.width
    ).y - robot.height;
    robot.vy = 0;
    robot.isJumping = false;
    robot.isPlacingPanel = false;
  } else if (robot.y > canvas.height) {
    gameOver = true;
    clearInterval(sunTimer);
    setTimeout(() => {
      alert(`You fell! Final Score: ${score}`);
      location.reload();
    }, 100);
  }

  // Move Platforms & Panels
  platforms.forEach(p => p.x -= gameSpeed);
  panels.forEach(panel => panel.x -= gameSpeed);

  // Remove off-screen platforms and panels
  platforms = platforms.filter(p => p.x + p.width > -50);
  panels = panels.filter(panel => panel.x > -50);

  // Generate new platforms with manageable gaps
  if (platforms[platforms.length - 1].x + platforms[platforms.length - 1].width < 600) {
    let width = 150 + Math.random() * 100;
    let gap = 100 + Math.random() * 50; // Manageable gap
    platforms.push({
      x: platforms[platforms.length - 1].x + platforms[platforms.length - 1].width + gap,
      y: 340,
      width: width,
      height: 60
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#d0eaff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Platforms
  ctx.fillStyle = 'gray';
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  // Panels
  ctx.fillStyle = 'orange';
  panels.forEach(panel => ctx.fillRect(panel.x, panel.y, 30, 10));

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
