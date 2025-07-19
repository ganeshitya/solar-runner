// game.js

// --- Game Configuration ---
const config = {
    canvasWidth: 400,
    canvasHeight: 480,
    gameSpeed: 1,
    gravity: 0.3,
    panelHeight: 20,
    robotJumpForce: -7, // Increased for a more noticeable jump
    sunReachedHeight: 50,
    fallingObjectSpawnRate: 100, // frames
    fallingObjectMinSpeed: 2,
    fallingObjectMaxSpeed: 4,
    panelBuildRate: 10 // frames (was 30, making it faster)
};

// --- Game State Variables ---
let score = 0;
let gameOver = false;
let frames = 0; // Global frame counter for timing events

// --- Game Elements ---
const robot = {
    x: config.canvasWidth / 2 - 20, // Center the robot initially
    y: config.canvasHeight - 80, // Start robot higher off the bottom panel
    width: 40,
    height: 40,
    vy: 0,
    isJumping: false,
    onGround: false // New property to track if robot is on a panel
};

const panels = [
    { x: config.canvasWidth / 2 - 40, y: config.canvasHeight - 40, width: 80, height: config.panelHeight } // Initial bottom panel
];

const fallingObjects = [];

// --- Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = config.canvasWidth;
canvas.height = config.canvasHeight;

// --- Input Handling ---
const keys = {
    left: false,
    right: false,
    build: false
};

document.addEventListener('keydown', e => {
    switch (e.code) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'Space':
            if (!keys.build) { // Only trigger build once per press
                keys.build = true;
            }
            break;
        case 'KeyR': // Restart game
            if (gameOver) {
                resetGame();
            }
            break;
    }
});

document.addEventListener('keyup', e => {
    switch (e.code) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'Space':
            keys.build = false;
            break;
    }
});

// --- Game Logic Functions ---

/**
 * Resets the game to its initial state.
 */
function resetGame() {
    score = 0;
    gameOver = false;
    frames = 0;
    robot.x = config.canvasWidth / 2 - 20;
    robot.y = config.canvasHeight - 80;
    robot.vy = 0;
    robot.isJumping = false;
    robot.onGround = false;
    panels.splice(0, panels.length); // Clear existing panels
    panels.push({ x: config.canvasWidth / 2 - 40, y: config.canvasHeight - 40, width: 80, height: config.panelHeight });
    fallingObjects.splice(0, fallingObjects.length); // Clear existing objects
}

/**
 * Updates the robot's position and state.
 */
function updateRobot() {
    // Horizontal movement
    if (keys.left) robot.x -= 3;
    if (keys.right) robot.x += 3;

    // Boundary checks
    if (robot.x < 0) robot.x = 0;
    if (robot.x + robot.width > canvas.width) robot.x = canvas.width - robot.width;

    // Apply gravity
    robot.y += robot.vy;
    robot.vy += config.gravity;

    // Check for landing on panels
    robot.onGround = false;
    panels.forEach(panel => {
        // Simple AABB collision detection for landing
        if (
            robot.x < panel.x + panel.width &&
            robot.x + robot.width > panel.x &&
            robot.y + robot.height >= panel.y &&
            robot.y + robot.height <= panel.y + (robot.vy > 0 ? 5 : 0) // Only check for landing if falling
        ) {
            robot.y = panel.y - robot.height; // Snap to top of panel
            robot.vy = 0;
            robot.onGround = true;
            robot.isJumping = false; // Reset jump state
        }
    });

    // If robot falls off all panels
    if (robot.y + robot.height > canvas.height) {
        gameOver = true;
        showGameOver(`Robot fell! Final Score: ${score}`);
    }
}

/**
 * Handles the building of new panels.
 */
function buildPanels() {
    if (keys.build && robot.onGround) { // Only build if space is held and robot is on a panel
        if (frames % config.panelBuildRate === 0) {
            const topPanel = panels[panels.length - 1];
            panels.push({
                x: topPanel.x,
                y: topPanel.y - config.panelHeight, // New panel above the current top
                width: 80,
                height: config.panelHeight
            });
            robot.y -= config.panelHeight; // Move robot up with the new panel
            score += 10;
        }
    }
}

/**
 * Updates the position of existing panels.
 */
function updatePanels() {
    panels.forEach(panel => {
        panel.y += config.gameSpeed;
    });

    // Check for victory condition
    const topPanel = panels[panels.length - 1];
    if (topPanel.y <= config.sunReachedHeight) {
        gameOver = true;
        showGameOver(`You reached the sun! Score: ${score}`);
    }

    // Remove panels that have fallen off-screen (optimization)
    panels = panels.filter(panel => panel.y < canvas.height + panel.height);
}

/**
 * Spawns new falling objects.
 */
function spawnFallingObjects() {
    if (frames % config.fallingObjectSpawnRate === 0) {
        fallingObjects.push({
            x: Math.random() * (canvas.width - 20),
            y: -20, // Start above canvas
            width: 20,
            height: 20,
            vy: config.fallingObjectMinSpeed + Math.random() * (config.fallingObjectMaxSpeed - config.fallingObjectMinSpeed)
        });
    }
}

/**
 * Updates the position and handles collisions of falling objects.
 */
function updateFallingObjects() {
    fallingObjects.forEach((obj, index) => {
        obj.y += obj.vy;

        // Collision with Robot
        if (
            robot.x < obj.x + obj.width &&
            robot.x + robot.width > obj.x &&
            robot.y < obj.y + obj.height &&
            robot.y + robot.height > obj.y
        ) {
            gameOver = true;
            showGameOver(`Hit by falling object! Final Score: ${score}`);
        }
    });

    // Remove off-screen objects
    fallingObjects = fallingObjects.filter(obj => obj.y < canvas.height + obj.height);
}

/**
 * Displays game over message and offers restart.
 * @param {string} message - The message to display.
 */
function showGameOver(message) {
    setTimeout(() => {
        alert(`${message}\nPress 'R' to restart.`);
    }, 100);
}

// --- Drawing Functions ---

/**
 * Clears the canvas and draws all game elements.
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#d0eaff'; // Light blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun (Goal)
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(config.canvasWidth / 2, config.sunReachedHeight / 2, 20, 0, Math.PI * 2);
    ctx.fill();

    // Panels
    ctx.fillStyle = 'orange';
    panels.forEach(panel => ctx.fillRect(panel.x, panel.y, panel.width, panel.height));

    // Robot
    ctx.fillStyle = 'blue';
    ctx.fillRect(robot.x, robot.y, robot.width, robot.height);

    // Falling Objects
    ctx.fillStyle = 'red';
    fallingObjects.forEach(obj => ctx.fillRect(obj.x, obj.y, obj.width, obj.height));

    // HUD (Score)
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    // Game Over Text
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText('Press "R" to Restart', canvas.width / 2, canvas.height / 2 + 25);
        ctx.textAlign = 'left'; // Reset text alignment
    }
}

// --- Main Game Loop ---
function gameLoop() {
    if (!gameOver) {
        updateRobot();
        buildPanels();
        updatePanels();
        spawnFallingObjects();
        updateFallingObjects();
        frames++;
    }
    draw(); // Always draw, even if game is over, to show game over screen
    requestAnimationFrame(gameLoop);
}

// Start the game!
gameLoop();
