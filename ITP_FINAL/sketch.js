// GAME CONSTANTS
const GRAVITY = 5;
const MOVE_SPEED = 5;
const JUMP_HEIGHT = 150;
const FALL_SPEED = 10;
const FRAME_RATE = 60;
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
const GAME_DURATION = 30;
const INITIAL_LIVES = 3;
const COLLECTABLE_RANGE = 40;
const ENEMY_COLLISION_RANGE = 20;
const ENEMY_JUMP_RANGE = 30;
const ENEMY_POSITIONS = [600, 1600, -600, 3010, -1350, 2400, 3650];

// DECLARING AND INITIALISING GLOBAL VARIABLES
let gameCharX;
let gameCharY;
let floorPosY;
let isLeft = false;
let isRight = false;
let isFalling = false;
let isPlummeting = false;
let cameraPosX = 0;
let gameScore = 0;
let gameOver = false;
let restartDelay = false;
let lives = 0;
let startTime = 0;
let timeUp = false;
let frozenTime = null; 
let timerSoundPlayed = false;
let gameFont;
let myFont;

// AUDIO VARIABLES
let bgMusic;
let jumpSound;
let collectSound;
let enemyHitSound;
let enemyDefeatSound;
let fallSound;
let winSound;
let winApplauseSound;
let timerSound;
let soundsLoaded = false;

// DECLARING AND INITIALISING ARRAYS
let treesX = [];
let clouds = [];
let mountains = [];
let canyons = [];
let collectables = [];
let enemies = [];
let fallingLeaves = [];
let flagPole = {};
let fireworks = [];
let birds = [];
let goldenKeys = [];
let butterflies = [];
let platforms = [];
let cars = [];
let streetLights = [];

// INDEPENDENT CODE //
// GAME INITIALIZATION
function resetGame() {
    // Reset flags, states and variables to initial values
    gameOver = false;
    timeUp = false;
    lives = INITIAL_LIVES;
    gameScore = 0;
    gameCharX = width / 2;
    gameCharY = floorPosY;
    startTime = millis();
    frozenTime = null; // Reset frozen time for timer display
    flagPole.isReached = false;
    timerSoundPlayed = false;

    for (let i = 0; i < collectables.length; i++) {
        collectables[i].isFound = false;
    }

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].isDead = false;
        enemies[i].xPos = enemies[i].base;
    }

    for (let i = 0; i < goldenKeys.length; i++) {
        goldenKeys[i].isFound = false;
    }

    for (let i = 0; i < platforms.length; i++) {
        platforms[i].xPos = platforms[i].originalXPos;
    }

    cars = [];
    for (let i = 0; i < 8; i++) {
        cars.push({
        x: random(-1500, 4000),
        y1: floorPosY + 45, 
        y2: floorPosY + 75,
        speed: random(1.5, 3),
        color: [random(100, 255), random(100, 255), random(100, 255)], 
        type: random() > 0.5 ? 'car' : 'truck' 
        });
    }

    isPlummeting = false;
    isFalling = false;
    isLeft = false;
    isRight = false;
    restartDelay = false;
    fireworks = [];
    cameraPosX = 0;

    startBackgroundMusic();
    loop();
}

function preload() {
    // Empty preload prevents blocking - sounds load asynchronously in setup instead
    gameFont = loadFont('assets/gamefont.ttf');
    myFont = loadFont('assets/myfont.ttf');
}

function canPlaySound(soundFile) {
    // !! converts to boolean, ensures soundFile exists and has isLoaded function
    return !!soundFile && typeof soundFile.isLoaded === 'function' && soundFile.isLoaded();
}

function startBackgroundMusic() {
    if (!canPlaySound(bgMusic)) {
        return;
    }

    // Guard pattern prevents redundant music restarts
    bgMusic.setVolume(0.2);
    if (!bgMusic.isPlaying()) {
        bgMusic.loop();
    }
}

function loadGameSounds() {
    // Guard clause - exit early if p5.sound library unavailable
    if (typeof loadSound !== 'function') {
        soundsLoaded = false;
        return;
    }
    // Silent failure handler - game continues even if audio files missing
    const failSilently = function() {};
    bgMusic = loadSound('assets/backgroundsound.mp3', startBackgroundMusic, failSilently);
    enemyHitSound = loadSound('assets/enemyhit.mp3', failSilently, failSilently);
    jumpSound = loadSound('assets/jumpsound.mp3', failSilently, failSilently);
    fallSound = loadSound('assets/fallsound.mp3', failSilently, failSilently);
    collectSound = loadSound('assets/collectsound.mp3', failSilently, failSilently);
    winSound = loadSound('assets/winsound.mp3', failSilently, failSilently);
    enemyDefeatSound = loadSound('assets/enemydefeat.mp3', failSilently, failSilently);
    winApplauseSound = loadSound('assets/winapplause.mp3', failSilently, failSilently);
    timerSound = loadSound('assets/timersound.mp3', failSilently, failSilently);
    soundsLoaded = true;
}
function setup() {
    frameRate(FRAME_RATE);
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    noSmooth();
    floorPosY = height * 3/4;
    gameCharX = width/2;
    gameCharY = floorPosY;
    loadGameSounds();
    // INDEPENDENT CODE  STARTS //
    lives = INITIAL_LIVES; // Initialise the lives to 3 so game doesn't end instantly
    startTime = millis(); // Start the timer when the game starts
    timeUp = false;

    // Procedural generation of animated entities with random properties
    for (let i = 0; i < 12; i++) {
        birds.push({
            x: random(-2000, 4000),
            y: random(60, 200),
            speed: random(1, 2),
            wingAngle: random(0, TWO_PI) // TWO_PI ensures full rotation range for wing animation
        });
    }
    //  colorful butterflies flying
    for (let i = 0; i < 10; i++) {
        butterflies.push({
            x: random(-2000, 4000),
            y: random(floorPosY - 100, floorPosY - 40), // Flying around the trees and near ground
            speed: random(0.5, 1.5),
            wingAngle: random(0, TWO_PI),
            color: [random(100, 255), random(100, 255), random(100, 255)]
        });
    }

    // 8 moving cars on the road for added challenge
    for (let i = 0; i < 8; i++) {
        cars.push({
            x: random(-1500, 4000),
            y1: floorPosY + 45, // Adjusting cars/trucks in upper and lower lane 
            y2: floorPosY + 85,
            speed: random(1.5, 3),
            color: [random(100, 255), random(100, 255), random(100, 255)], // Vehicle's colors 
            type: random() > 0.5 ? 'car' : 'truck' // Vehicle variety
        });
    }

    // Flagpole as a single object (not an array) with state tracking
    flagPole = {xPos: 4000, isReached: false};

    // Array of objects with fixed properties for consistent visual design
    streetLights = [
        {xPos: -1200, yPos: floorPosY, poleWidth: 6, poleHeight: 120, armLength: 25, fixtureWidth: 12, fixtureHeight: 15, lightSize: 10, glowSize: 60},
        {xPos: -500, yPos: floorPosY, poleWidth: 6, poleHeight: 120, armLength: 25, fixtureWidth: 12, fixtureHeight: 15, lightSize: 10, glowSize: 60},
        {xPos: 0, yPos: floorPosY, poleWidth: 6, poleHeight: 120, armLength: 25, fixtureWidth: 12, fixtureHeight: 15, lightSize: 10, glowSize: 60},
        {xPos: 1050, yPos: floorPosY, poleWidth: 6, poleHeight: 120, armLength: 25, fixtureWidth: 12, fixtureHeight: 15, lightSize: 10, glowSize: 60},
        {xPos: 2550, yPos: floorPosY, poleWidth: 6, poleHeight: 120, armLength: 25, fixtureWidth: 12, fixtureHeight: 15, lightSize: 10, glowSize: 60},
        {xPos: 3765, yPos: floorPosY, poleWidth: 6, poleHeight: 120, armLength: 25, fixtureWidth: 12, fixtureHeight: 15, lightSize: 10, glowSize: 60}
    ];
    // INDEPENDENT CODE ENDS //

    clouds = [
        {xPos: -450, yPos: 100, size: 1, speed: 0.15},
        {xPos: -700, yPos: 80, size: 0.8, speed: 0.3},
        {xPos: -300, yPos: 120, size: 1.2, speed: 0.4},
        {xPos: -1200, yPos: 120, size: 1.2, speed: 0.4},
        {xPos: -1800, yPos: 90, size: 1, speed: 0.4},
        {xPos: 100, yPos: 100, size: 1, speed: 0.3},
        {xPos: 300, yPos: 100, size: 1, speed: 0.3},
        {xPos: 500, yPos: 80, size: 0.8, speed: 0.2},
        {xPos: 800, yPos: 80, size: 0.8, speed: 0.25},
        {xPos: 1200, yPos: 90, size: 1, speed: 0.35},
        {xPos: 1500, yPos: 120, size: 1.2, speed: 0.4},
        {xPos: 1600, yPos: 110, size: 1.1, speed: 0.3},
        {xPos: 2200, yPos: 90, size: 1, speed: 0.2},
        {xPos: 2500, yPos: 100, size: 1, speed: 0.3},
        {xPos: 3000, yPos: 100, size: 1, speed: 0.4},
        {xPos: 3300, yPos: 100, size: 1, speed: 0.35},
        {xPos: 3600, yPos: 80, size: 0.8, speed: 0.25},
        {xPos: 4000, yPos: 90, size: 1, speed: 0.35},
        {xPos: 3850, yPos: 100, size: 1.2, speed: 0.3}
    ];

    mountains = [
        {xPos: -700, yPos: floorPosY, width: 250, height: 290},
        {xPos: -1500, yPos: floorPosY, width: 190, height: 310},
        {xPos: -1800, yPos: floorPosY, width: 280, height: 280},
        {xPos: -2400, yPos: floorPosY, width: 300, height: 280},
        {xPos: 400, yPos: floorPosY, width: 250, height: 250},
        {xPos: 750, yPos: floorPosY, width: 200, height: 290},
        {xPos: 1960, yPos: floorPosY, width: 300, height: 300},
        {xPos: 2060, yPos: floorPosY, width: 350, height: 350},
        {xPos: 3000, yPos: floorPosY, width: 400, height: 380}
    ];

    treesX = [-2700, -2100, -1330, -700, -290, 330, 700, 1350, 1650, 2100, 3100, 3500];
  
    // Nested loop generates multiple leaves per tree with randomized properties(OWN LOGIC APPLIED)
    for (let i = 0; i < treesX.length; i++) {
        for (let j = 0; j < 8; j++) {
            fallingLeaves.push({
                x: treesX[i] + random(-40, 40),
                y: floorPosY - random(150, 50),
                speed: random(1, 3),
                sway: random(0.5, 1.5),
                angle: random(0, TWO_PI)
            });
        } 
    }

    canyons = [
        {xPos: 120, width: 150},
        {xPos: 1150, width: 140},
        {xPos: 2650, width: 185},
        {xPos: -1150, width: 130},
        {xPos: 1800, width: 100}
    ];

    // Factory pattern creates platform objects with encapsulated draw/update methods
    platforms = [
        createPlatform(135, floorPosY - 70, 110, 60, 15, 1, 1), // Horizontal movement
        createPlatform(1150, floorPosY - 80, 110, 70, 15, 1.5, 1, true), // Vertical movement
        createPlatform(2655, floorPosY - 70, 120, 70, 15, 2, 1), // Horizontal movement
        createPlatform(3650, floorPosY - 85, 100, 0, 15, 0, 0) // Still platform
    ];

    // Array.map() transforms position array into Enemy class instances
    enemies = ENEMY_POSITIONS.map(x => new Enemy(x, floorPosY + 5, 100, 2));

    collectables = [
        {xPos: -2700, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: -2100, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: -1330, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: -700, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: -290, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: 370, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: 700, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: 1650, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: 1350, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: 2100, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: 3100, yPos: floorPosY - 50, size: 18, isFound: false},
        {xPos: 3500, yPos: floorPosY - 50, size: 18, isFound: false}
    ];

    goldenKeys = [
        {xPos: -500, yPos: floorPosY - 40, size: 18, isFound: false},
        {xPos: -1700, yPos: floorPosY - 40, size: 18, isFound: false},
        {xPos: 3300, yPos: floorPosY - 40, size: 18, isFound: false},
        {xPos: 900, yPos: floorPosY - 40, size: 18, isFound: false},
        {xPos: 1130, yPos: floorPosY - 40, size: 18, isFound: false},
        {xPos: 1950, yPos: floorPosY - 40, size: 18, isFound: false},
        {xPos: 2400, yPos: floorPosY - 40, size: 18, isFound: false},
        {xPos: 2950, yPos: floorPosY - 40, size: 18, isFound: false},
        {xPos: 3550, yPos: floorPosY - 40, size: 18, isFound: false}
    ];

    startBackgroundMusic();
}

// MAIN GAME LOOP
function draw() {
    background(100, 155, 255);
    fill(255);
    textSize(20);
    text("score: " + gameScore, 50, 20);

    for (let i = 0; i < INITIAL_LIVES; i++) {
        if (i < lives) {
            drawHeart(170 + i * 25, 15, 16); // Hearts positioned with mathematical spacing 
        } else {
            drawSkull(170 + i * 25, 15, 16); // Draw skulls for lost lives
        }
    }

    drawClock(); // Display timer on screen
    drawSun(); // call the draw sun function 
    // camera follows character by offsetting world
    cameraPosX = gameCharX - width / 2;

    push();
    // Translate all world-space objects to create side-scrolling.
    translate(-cameraPosX, 0);

    // calling all the draw functions to render the game world and entities
    drawRoad();
    drawCars();
    renderFlagpole();
    checkFlagpole();
    drawFireworks();
    drawStreetLights();
    drawClouds();
    drawMountains();
    drawTrees();
    drawFallingLeaves();
    drawFlyingBirds();
    drawButterflies();

    // Draw all enemies using their encapsulated draw method
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].draw();
    }

    drawCanyons();

    // Platforms self-update and self-render via encapsulated methods
    for (let i = 0; i < platforms.length; i++) {
        platforms[i].update();
        platforms[i].checkPlatform(gameCharX, gameCharY); // Check if player is on this platform and move them if so
        platforms[i].draw();
    }

    drawApples();
    drawGoldenKeys();
    drawCharacter();
    handleGameInteractions();
    pop();
    handleGameStateDisplay();
}

// INDEPENDENT BUT ADOPTED CODE LOGIC //
// FACTORY & CLASS FUNCTIONS
// Factory pattern - returns object with closure over private variables
function createPlatform(x, y, w, range, h, speed, dir = 1, vertical = false) {
    return {
        xPos: x,
        yPos: y,
        width: w,
        range: range,
        originalXPos: x, // Store original X for horizontal movement reference
        originalYPos: y, // Store original Y for vertical movement reference
        height: h,
        speed: speed,
        dir: dir,
        vertical: vertical,

        draw: function() {
            push();
            fill(139, 90, 43);
            stroke(101, 67, 33);
            strokeWeight(2);
            rect(this.xPos, this.yPos, this.width, this.height);
            stroke(101, 67, 33);
            strokeWeight(1);
            for (let j = 1; j < 4; j++) {
                line(this.xPos + (j * this.width/4), this.yPos, this.xPos + (j * this.width/4), this.yPos + this.height);
            }  
            pop();
        },

        update: function() {
            if (this.vertical) {
                this.yPos += this.dir * this.speed;
                let upperLimit = this.originalYPos - this.range;
                let lowerLimit = floorPosY - 80;
                // Bounce between originalYPos - range and originalYPos + range
                if (this.yPos < upperLimit || this.yPos > lowerLimit) {
                    this.dir *= -1;
                } 
            } else {
                this.xPos += this.dir * this.speed;
                if (this.xPos < this.originalXPos - this.range || this.xPos > this.originalXPos + this.range) {
                    this.dir *= -1;
                }
            }
        },

        checkPlatform: function(charX, charY) {
            if (charX > this.xPos && charX < this.xPos + this.width) {
                let distance = charY - this.yPos;
                if (distance >= 0 && distance <= 8) {
                    gameCharY = this.yPos; // Snap character to platform surface
                    if (this.vertical) {
                        gameCharY += this.dir * this.speed; // Carry character vertically
                    } else {
                        gameCharX += this.speed * this.dir; // Drag character with platform
                    }
                    isFalling = false; // Reset falling state when on platform
                    return true;
                }
            }
            return false;
        }
    };
}

// Enemy class with patrolling behavior and death state
class Enemy {
    constructor(x, y, range, speed) {
        this.xPos = x; // Current x coordinate of enemy, which will change as it moves
        this.yPos = y; // Fixed y coordinate of enemy, as they only move horizontally
        this.range = range;
        this.speed = speed;
        this.dir = 1;
        this.base = x; // Starting x position
        this.isDead = false;
    }
    // Update method to move enemy back and forth within its range, and stop if it's dead
        update() {
            if (!this.isDead) {
                this.xPos += this.dir * this.speed;
                if (this.xPos < this.base || this.xPos > this.base + this.range) {
                    this.dir *= -1;
                }
            }
        }

        draw() {
            if (!this.isDead) {
                fill(0);
                triangle(this.xPos - 27, this.yPos - 15, this.xPos - 16, this.yPos - 22, this.xPos - 16, this.yPos - 8);
                triangle(this.xPos + 27, this.yPos - 15, this.xPos + 16, this.yPos - 22, this.xPos + 16, this.yPos - 8);
                // Main body
                fill(220, 30, 30);
                ellipse(this.xPos, this.yPos - 15, 40, 38); 
                // Face
                fill(255, 180, 180);
                ellipse(this.xPos, this.yPos - 8, 25, 22); 
                // Eyes
                fill(255);
                ellipse(this.xPos - 8, this.yPos - 18, 15, 15); 
                ellipse(this.xPos + 8, this.yPos - 18, 15, 15); 
                // Pupils
                fill(0);
                ellipse(this.xPos - 6, this.yPos - 16, 8, 8); 
                ellipse(this.xPos + 10, this.yPos - 16, 8, 8); 
                // Horns
                fill(80, 10, 10);
                triangle(this.xPos + 15, this.yPos - 22, this.xPos + 5, this.yPos - 25, this.xPos + 3, this.yPos - 20); 
                triangle(this.xPos - 15, this.yPos - 22, this.xPos - 5, this.yPos - 25, this.xPos - 3, this.yPos - 20); 
                // Mouth
                fill(165, 42, 42);
                triangle(this.xPos, this.yPos - 12, this.xPos - 5, this.yPos - 6, this.xPos + 5, this.yPos - 6); 
                stroke(0);
                strokeWeight(1);
                // Antennas
                line(this.xPos - 2, this.yPos - 33, this.xPos - 5, this.yPos - 39); 
                line(this.xPos + 2, this.yPos - 33, this.xPos + 5, this.yPos - 39); 
                noStroke();
            }
        }
}

// INDEPENDENT CODE //
// Particle system for firework explosion effect
function createFirework(x, y) {
    let particles = [];
    let colours = [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
        [255, 255, 0],
        [255, 0, 255],
        [0, 255, 255]
    ];
    for (let i = 0; i < 50; i++) {
        let color = random(colours);
        particles.push({
            x: x, // origin
            y: y,
            vx: random(-3, 3), // Random horizontal velocity of particles
            vy: random(-3, 3), // Random vertical velocity of particles
            alpha: 255, // Initial opacity of particles
            color: color
        });
    }
    return particles;
}

// RENDERING FUNCTIONS
function renderFlagpole() {
    push();
    // Vertical pole extended from ground
    strokeWeight(4);
    stroke(180);
    line(flagPole.xPos, floorPosY - 1, flagPole.xPos, floorPosY - 120); 
    // Flag attached to the pole
    noStroke();
    fill(255, 0, 0);
    triangle(flagPole.xPos, floorPosY - 121, flagPole.xPos, floorPosY - 80, flagPole.xPos + 40, floorPosY - 100); 
    pop();
}

// INDEPENDENT CODE FUNCTIONS STARTS //
// Particle system with physics simulation and auto-cleanup
function drawFireworks() {
    // Iterate backwards for safe array removal during iteration
    for (let i = fireworks.length - 1; i >= 0; i--) {
        let fW = fireworks[i];
        let finished = true;
        for (let j = 0; j < fW.length; j++) {
            let q = fW[j];
            fill(q.color[0], q.color[1], q.color[2], q.alpha);
            noStroke();
            ellipse(q.x, q.y, 4, 4);
            // Physics simulation: velocity-based movement
            q.x += q.vx;
            q.y += q.vy;
            q.vy += 0.1; // Gravity effect on particles
            q.alpha -= 3; // Fade out particles over time
            if (q.alpha > 0) {
                finished = false;
            }
        }
        // Remove firework if all particles have faded out
        if (finished) {
            fireworks.splice(i, 1);
        }
    }
}

function drawFallingLeaves() {
    fill(205, 127, 50);
    for (let i = 0; i < fallingLeaves.length; i++) {
        let leaf = fallingLeaves[i];
        leaf.x += sin(leaf.angle) * leaf.sway; // Sway effect using sine wave
        leaf.angle += 0.05; // phase shift 
        leaf.y += leaf.speed;
        if (leaf.y > floorPosY + 10) {
            leaf.y = floorPosY - random(200, 100); // Reset the leaf's y position to fall again from above
            leaf.x = treesX [floor(random(treesX.length))] + random(-40, 40); // Reset the leaf's x position around a random tree
        }
    ellipse(leaf.x, leaf.y, 10, 5);
    }
}

function drawFlyingBirds() {
    stroke(0);
    strokeWeight(1);
    for (let i = 0; i < birds.length; i++) {
        let bird = birds[i];
        let wingFlap = sin(bird.wingAngle) * 5; // Flapping effect using wing angle
        line(bird.x - 8, bird.y + wingFlap, bird.x, bird.y);
        line(bird.x, bird.y, bird.x + 8, bird.y + wingFlap);
        bird.x += bird.speed;
        bird.wingAngle += 0.05; // Flapping speed
        // Reset the bird's x and y positions once its off-screen
        if (bird.x > 3500) {
            bird.x = -2500;
            bird.y = random(60, 250);
        }
    }
    noStroke();
}

function drawButterflies() {
    for (let i = 0; i < butterflies.length; i++) {
        let butterfly = butterflies[i];
        // Update position 
        butterfly.x += butterfly.speed;
        butterfly.wingAngle += 0.15;
        // Reset when off-screen
        if (butterfly.x > 3500) {
            butterfly.x = -2500;
            butterfly.y = random(floorPosY - 100, floorPosY - 40);
            continue; // Skip drawing this frame when resetting
        }
        push();
        translate(butterfly.x, butterfly.y);
        // abs(sin()) creates 0-1 range for wing opening/closing
        let wingFlap = abs(sin(butterfly.wingAngle)) * 0.8 + 0.2;
        // Body
        fill(40, 30, 20);
        noStroke();
        ellipse(0, 0, 2, 6); 
        // Head
        fill(50, 40, 30);
        ellipse(0, -4, 3, 3); 
        // Antennas
        stroke(40, 30, 20);
        strokeWeight(0.5);
        line(0, -4, -1.5, -7); 
        line(0, -4, 1.5, -7); 
        noStroke();
        fill(butterfly.color[0], butterfly.color[1], butterfly.color[2], 200);
        // Left wing flap
        push();
        rotate(-wingFlap * 0.6); 
        ellipse(-6, -2, 9, 11);
        fill(butterfly.color[0] - 50, butterfly.color[1] - 50, butterfly.color[2] - 50);
        ellipse(-6.5, -3, 3, 4);
        pop();
        // Left wing flap (smaller)
        push();
        rotate(-wingFlap * 0.4); 
        fill(butterfly.color[0] - 30, butterfly.color[1] - 30, butterfly.color[2] - 30, 200);
        ellipse(-5, 2, 7, 8);
        pop();
        // Right wing flap
        push();
        rotate(wingFlap * 0.6); 
        fill(butterfly.color[0], butterfly.color[1], butterfly.color[2], 200);
        ellipse(6, -2, 9, 11);
        fill(butterfly.color[0] - 50, butterfly.color[1] - 50, butterfly.color[2] - 50);
        ellipse(6.5, -3, 3, 4);
        pop();
        // Right wing flap (smaller)
        push();
        rotate(wingFlap * 0.4); 
        fill(butterfly.color[0] - 30, butterfly.color[1] - 30, butterfly.color[2] - 30, 200);
        ellipse(5, 2, 7, 8); 
        pop();
        pop();
    }
}

function drawGoldenKeys() {
    for (let i = 0; i < goldenKeys.length; i++) {
        let key = goldenKeys[i];
        if (!key.isFound) {
            push();
            let floatOffset = sin((frameCount + i * 10) * 0.10) * 5; // Floating effect using sine wave
            // Key's main body
            fill(255, 215, 0);
            stroke(218, 165, 32);
            strokeWeight(1);
            rect(key.xPos - 15, key.yPos - 3 + floatOffset, 25, 6, 2); 
            // Key's head
            noFill();
            stroke(255, 215, 0);
            strokeWeight(3);
            ellipse(key.xPos - 18, key.yPos + floatOffset, 12, 12); 
            // Key's teeth
            fill(255, 215, 0);
            noStroke();
            rect(key.xPos + 8, key.yPos - 3 + floatOffset, 3, 6); 
            rect(key.xPos + 5, key.yPos - 3 + floatOffset, 3, 4);
            rect(key.xPos + 2, key.yPos - 3 + floatOffset, 3, 6);
            // Shine effect 
            fill(255, 255, 200, 150);
            ellipse(key.xPos - 10, key.yPos - 2 + floatOffset, 4, 4); 
            pop();
            // Collection check(allow pickup from ground if close horizontally)
            let dx = abs(gameCharX - key.xPos);
            if (dx < COLLECTABLE_RANGE && gameCharY >= floorPosY - 10) {
                key.isFound = true;
                gameScore += 1; // Increment score upon collection
                if (canPlaySound(collectSound)) {
                    collectSound.play();
                }
            }
        }
    }
}

function drawHeart(x, y, size) {
    push();
    fill(255, 0, 0);
    noStroke();
    arc(x - size/4, y, size/2, size/2, PI, 0); // Left half
    arc(x + size/4, y, size/2, size/2, PI, 0); // Right half
    triangle(x - size/2, y, x + size/2, y, x, y + size * 0.7); // Bottom point of heart
    pop();
}

function drawSkull(x, y, size) {
    push();
    // Main skull head
    fill(200, 200, 200);
    noStroke();
    ellipse(x, y - 2, size, size);
    // Jaw
    fill(180, 180, 180);
    rect(x - size/4, y + 2, size/2, size/4, 2);
    // Eyes
    fill(0);
    ellipse(x - size/5, y - 4, size/4, size/4);
    ellipse(x + size/5, y - 4, size/4, size/4);
    // Nose
    triangle(x, y, x - size/8, y + size/5, x + size/8, y + size/5);
    // Teeth
    fill(255);
    rect(x - size/5, y + 3, size/6, size/5, 1);
    rect(x, y + 3, size/6, size/5, 1);
    pop();
}

function drawWheel(x, y, size) {
    fill(30, 30, 30);
    ellipse(x, y, size, size); // Outer wheel
    fill(180);
    ellipse(x, y, size/2, size/2); // Inner circle
}

function drawCars() {
    for (let i = 0; i < cars.length; i++) {
        let vehicle = cars[i];
        push();
        if (vehicle.type == 'car') {
            // Main body 
            fill(vehicle.color[0], vehicle.color[1], vehicle.color[2]);
            stroke(0);
            strokeWeight(1);
            rect(vehicle.x, vehicle.y1 - 10, 60, 20, 3); 
            // Cabin
            fill(vehicle.color[0] - 30, vehicle.color[1] - 30, vehicle.color[2] - 30);
            rect(vehicle.x + 15, vehicle.y1 - 20, 30, 10, 3); 
            // Windows
            fill(100, 150, 200, 150);
            rect(vehicle.x + 17, vehicle.y1 - 18, 12, 6); 
            rect(vehicle.x + 31, vehicle.y1 - 18, 12, 6);
            noStroke();
            drawWheel(vehicle.x + 15, vehicle.y1 + 10, 12);
            drawWheel(vehicle.x + 45, vehicle.y1 + 10, 12);
            // Headlights
            fill(255, 255, 150);
            ellipse(vehicle.x + 58, vehicle.y1 - 5, 4, 3); 
            ellipse(vehicle.x + 58, vehicle.y1 + 5, 4, 3);
        } else {
            fill(vehicle.color[0], vehicle.color[1], vehicle.color[2]);
            stroke(0);
            strokeWeight(1);
            rect(vehicle.x, vehicle.y2 - 15, 40, 25, 2);
            fill(vehicle.color[0] - 20, vehicle.color[1] - 20, vehicle.color[2] - 20);
            rect(vehicle.x + 40, vehicle.y2 - 10, 25, 20, 3);
            fill(vehicle.color[0] - 40, vehicle.color[1] - 40, vehicle.color[2] - 40);
            rect(vehicle.x + 42, vehicle.y2 - 20, 21, 10, 3);
            fill(100, 150, 200, 150);
            rect(vehicle.x + 44, vehicle.y2 - 18, 17, 6);
            noStroke();
            drawWheel(vehicle.x + 15, vehicle.y2 + 10, 14);
            drawWheel(vehicle.x + 50, vehicle.y2 + 10, 14);
            fill(255, 255, 150);
            ellipse(vehicle.x + 63, vehicle.y2 - 5, 4, 3);
            ellipse(vehicle.x + 63, vehicle.y2 + 5, 4, 3);
        }
        pop();
        vehicle.x += vehicle.speed; // Car moving forward when not near the canyon
        if (vehicle.x > 4500) {
            vehicle.x = random(-1500, 4000);
            vehicle.y1 = floorPosY + 45;
            vehicle.y2 = floorPosY + 75;
        }
    }
}

function drawStreetLights() {
    for (let i = 0; i < streetLights.length; i++) {
        let lights = streetLights[i];
        push();
        // Vertical pole
        fill(60, 60, 60);
        stroke(40, 40, 40);
        strokeWeight(2);
        rect(lights.xPos - lights.poleWidth/2, lights.yPos - lights.poleHeight, lights.poleWidth, lights.poleHeight); 
        // Base of arm and arm
        fill(70, 70, 70);
        rect(lights.xPos - lights.poleWidth/2 - 2, lights.yPos - lights.poleHeight - 5, lights.poleWidth + 4, 8); 
        rect(lights.xPos - lights.poleWidth/2, lights.yPos - lights.poleHeight - 5, lights.armLength, 4); 
        // Fixture
        fill(80, 80, 80);
        stroke(50, 50, 50);
        strokeWeight(1);
        rect(lights.xPos + lights.armLength - 4, lights.yPos - lights.poleHeight - 10, lights.fixtureWidth, lights.fixtureHeight, 2); 
        // Light glow effect
        noStroke();
        fill(255, 255, 150, 200);
        ellipse(lights.xPos + lights.armLength + 2, lights.yPos - lights.poleHeight + 2, lights.lightSize, lights.lightSize - 2); 
        // Inner brighter glow
        fill(255, 255, 200, 250);
        ellipse(lights.xPos + lights.armLength + 2, lights.yPos - lights.poleHeight + 2, lights.lightSize - 4, lights.lightSize - 5); 
        // Ground glow effect
        fill(255, 255, 150, 30);
        ellipse(lights.xPos + lights.armLength + 2, lights.yPos, lights.glowSize, 20); 
        pop();
    }
}

function drawSun() {
    noStroke();
    fill(255, 220, 80);
    ellipse(100, 90, 100);
    fill(255, 200, 80, 30);
    ellipse(100, 90, 120); // Outer shadow
    fill(255, 200, 80, 15);
    ellipse(100, 90, 140); // Outline
}

function drawClock() {
    let elapsedTime = (millis() - startTime) / 1000; // Convert to seconds
    let timeRemaining;
    //let timeRemaining = GAME_DURATION - elapsedTime; // Calculate remaining time
    if (flagPole.isReached) {
        if (frozenTime === null) frozenTime = max(0, GAME_DURATION - elapsedTime);
            timeRemaining = frozenTime; // Display frozen time without counting down
    } else {
        timeRemaining = GAME_DURATION - elapsedTime;
    }
    textAlign(RIGHT);
    fill(timeRemaining > 4 ? 255 : color(255, 0, 0)); // Change color to red when time is running out
    push();
    stroke(timeRemaining > 4 ? 255 : color(255, 0, 0));
    strokeWeight(2);
    noFill();
    ellipse(width - 90, 12, 16, 16); // Clock outline
    line(width - 90, 12, width - 90, 7); // Minute hand (static)
    line(width - 90, 12, width - 85, 12); // Second hand (moves based on time remaining)
    pop();
    textSize(20);
    timeRemaining = max(0, timeRemaining);
    if (timeRemaining <= 4 && timeRemaining > 0 && !timerSoundPlayed) {
        timerSoundPlayed = true;
        if (canPlaySound(bgMusic)) {
            bgMusic.setVolume(0.1); // set background music volume low to avoid overlap with timer sound
        }
    if (canPlaySound(timerSound)) {
        timerSound.setVolume(0.4);
        timerSound.play(); // Play timer warning sound
    }
    }
    text(Math.ceil(timeRemaining) + "s", width - 45, 20);
    textAlign(LEFT); // Reset text allignment
    // Ending game condition when timer is up 
    if (timeRemaining <= 0 && !flagPole.isReached) {
        timeUp = true;
        gameOver = true;
    }
}
// INDEPENDENT CODE ENDS //

function drawRoad() {
    noStroke();
    fill(60, 60, 60);
    rect(cameraPosX, floorPosY, width, height - floorPosY); // Road surface
    fill(255, 200, 0);
    // Snap dash start to a fixed world grid so dashes don't "swim" while the camera scrolls.
    let startMarkX = floor((cameraPosX - 60) / 60) * 60; 
    for (let i = startMarkX; i <= cameraPosX + width + 60; i += 60) {
        rect(i, floorPosY + 65, 40, 5);
    }
    fill(255);
    rect(cameraPosX, floorPosY + 30, width, 3); // Road divider line
    rect(cameraPosX, floorPosY + 100, width, 3); 
}

function drawClouds() {
    for (let i = 0; i < clouds.length; i++) {
        let {xPos, yPos, size, speed} = clouds[i];
        // Shadow of clouds(INDEPENDENT CODE))
        fill(0, 0, 0, 50);
        ellipse(xPos + 10, yPos + 10, 60 * size, 60 * size);
        ellipse(xPos + 40 * size, yPos, 80 * size, 80 * size);
        ellipse(xPos + 80 * size, yPos + 10, 60 * size, 60 * size);
        ellipse(xPos + 50 * size, yPos - 10 * size, 60 * size, 60 * size);
        // White clouds
        fill(255);
        ellipse(xPos, yPos, 60 * size, 60 * size);
        ellipse(xPos + 30 * size, yPos - 10 * size, 80 * size, 80 * size);
        ellipse(xPos + 70 * size, yPos, 60 * size, 60 * size);
        ellipse(xPos + 40 * size, yPos - 20 * size, 60 * size, 60 * size);
        clouds[i].xPos += speed; // Moves horizontally
        if (clouds[i].xPos > 4300) {
            clouds[i].xPos = -1000; // Reset left to avoid sudden appearance
        }
    }
}

function drawMountains() {
    for (let i = 0; i < mountains.length; i++) {
        let {xPos, yPos, width, height} = mountains[i];
        // Left face darker
        noStroke();
        fill(129, 133, 137); 
        triangle(xPos - 15, yPos, xPos + width/2, yPos - height, xPos + width/3, yPos);
        // Middle face medium shade
        fill(180, 180, 180); 
        triangle(xPos + width/3, yPos, xPos + width/2, yPos - height, xPos + width * 4/3, yPos);
        // Right face lighter
        fill(220, 220, 220); 
        triangle(xPos + width * 4/3, yPos, xPos + width/2, yPos - height, xPos + width, yPos);
    }
}

function drawTrees() {
    for (let i = 0; i < treesX.length; i++) {
        let treeX = treesX[i];
        let treeY = floorPosY;
        // Still leaves on the ground of multiple shades of orange and brown
        push();
        noStroke();
        fill(205, 127, 50);
        ellipse(treeX + 10, treeY + 4, 15, 8);
        ellipse(treeX + 25, treeY + 5, 12, 6);
        ellipse(treeX + 35, treeY + 3, 10, 5);
        ellipse(treeX - 5, treeY + 4, 13, 7);
        ellipse(treeX - 15, treeY + 6, 11, 5);
        ellipse(treeX - 25, treeY + 3, 14, 7);
        ellipse(treeX + 40, treeY + 7, 9, 4);
        ellipse(treeX - 30, treeY + 8, 10, 5);
        fill(180, 100, 40);
        ellipse(treeX + 15, treeY + 7, 11, 5);
        ellipse(treeX + 5, treeY + 8, 9, 4);
        ellipse(treeX + 30, treeY + 9, 10, 5);
        ellipse(treeX - 10, treeY + 9, 12, 6);
        ellipse(treeX - 20, treeY + 10, 8, 4);
        ellipse(treeX + 45, treeY + 5, 11, 5);
        fill(160, 80, 30);
        ellipse(treeX + 20, treeY + 10, 10, 4);
        ellipse(treeX, treeY + 11, 9, 4);
        ellipse(treeX - 8, treeY + 12, 8, 3);
        ellipse(treeX + 38, treeY + 11, 7, 3);
        pop();
        // Trunk
        fill(120, 100, 40);
        rect(treeX, treeY - 100, 40, 100); 
        fill(205, 127, 50);
        ellipse(treeX + 20, treeY - 115, 130, 80);
        ellipse(treeX + 20, treeY - 150, 110, 70);
        ellipse(treeX + 20, treeY - 185, 90, 60);
    }
}

function drawCanyons() {
    for (let i = 0; i < canyons.length; i++) {
        let {xPos, width} = canyons[i];
        // Left edge of canyon
        fill(100, 150, 50);
        rect(xPos - 20, floorPosY, 20, height - floorPosY); 
        // Canyon area
        fill(48, 25, 52);
        rect(xPos, floorPosY, width, height - floorPosY); 
        // Right edge of canyon
        fill(100, 150, 50);
        rect(xPos + width, floorPosY, 20, height - floorPosY); 
        fill(0);
        triangle(xPos - 20, floorPosY, xPos, floorPosY + 10, xPos - 20, floorPosY + 23);
        triangle(xPos - 20, floorPosY + 30, xPos, floorPosY + 43, xPos - 20, floorPosY + 55);
        triangle(xPos - 20, floorPosY + 62, xPos, floorPosY + 76, xPos - 20, floorPosY + 90);
        triangle(xPos - 20, floorPosY + 97, xPos, floorPosY + 110, xPos - 20, floorPosY + 120);
        triangle(xPos - 20, floorPosY + 127, xPos, floorPosY + 135, xPos - 20, floorPosY + 145);
        triangle(xPos + width + 20, floorPosY, xPos + width, floorPosY + 10, xPos + width + 20, floorPosY + 23);
        triangle(xPos + width + 20, floorPosY + 30, xPos + width, floorPosY + 43, xPos + width + 20, floorPosY + 55);
        triangle(xPos + width + 20, floorPosY + 62, xPos + width, floorPosY + 76, xPos + width + 20, floorPosY + 90);
        triangle(xPos + width + 20, floorPosY + 97, xPos + width, floorPosY + 110, xPos + width + 20, floorPosY + 120);
        triangle(xPos + width + 20, floorPosY + 127, xPos + width, floorPosY + 135, xPos + width + 20, floorPosY + 145);
    }
}

function drawApples() {
    for (let i = 0; i < collectables.length; i++) {
        let apple = collectables[i];
        if (!apple.isFound) {
            push();
            translate(apple.xPos - 6, apple.yPos - 8); // Move the origin to the center of the apple for rotation
            rotate(frameCount * 0.05); // Rotate around the center of the apple for a spinning effect
            translate(-(apple.xPos - 6), -(apple.yPos - 8)); // Move back the origin after rotation
            fill(194, 49, 37);
            ellipse(apple.xPos - 10, apple.yPos, 22, 25); // Main body 
            ellipse(apple.xPos - 2.5, apple.yPos, 22, 25);
            fill(105, 194, 37);
            ellipse(apple.xPos - 6, apple.yPos - 17, 3, 10); // Stem
            pop();
            let dx = abs(gameCharX - apple.xPos);
            if (dx < COLLECTABLE_RANGE && gameCharY >= floorPosY - 10) {
                apple.isFound = true;
                gameScore += 1;
                if (canPlaySound(collectSound)) {
                    collectSound.setVolume(0.3); 
                    collectSound.play();
                }
            }
        }
    }
}

function drawCharacter() {
    if (isLeft && isFalling) {
        // Jumping left
        fill(134, 135, 132);
        rect(gameCharX - 10.5, gameCharY - 62, 20, 20); // Head
        // Antenna
        stroke(80);
        strokeWeight(2);
        line(gameCharX + 5.5, gameCharY - 62, gameCharX + 5.5, gameCharY - 77);
        // Antenna tip 
        noStroke();
        fill(255, 100, 100);
        ellipse(gameCharX + 5.5, gameCharY - 77, 6, 6); 
        // Left eye
        fill(0);
        ellipse(gameCharX - 6, gameCharY - 54, 4, 7); 
        // Body 
        fill(53, 54, 52);
        rect(gameCharX - 10, gameCharY - 45, 30, 40); 
        // Legs
        fill(134, 135, 132);
        rect(gameCharX - 5, gameCharY - 3, 5, 10); 
        rect(gameCharX + 8, gameCharY - 6, 5, 10); 
        noStroke();
    } else if (isRight && isFalling) {
        // Jumping right
        fill(134, 135, 132);
        rect(gameCharX + 1, gameCharY - 52, 20, 20);
        stroke(80);
        strokeWeight(2);
        line(gameCharX + 6.5, gameCharY - 52, gameCharX + 6.5, gameCharY - 67);
        noStroke();
        fill(255, 100, 100);
        ellipse(gameCharX + 6.5, gameCharY - 67, 6, 6);
        fill(0);
        ellipse(gameCharX + 13, gameCharY - 54, 4, 7);
        fill(53, 54, 52);
        rect(gameCharX - 10, gameCharY - 45, 30, 40);
        fill(134, 135, 132);
        rect(gameCharX - 5, gameCharY - 6, 5, 10);
        rect(gameCharX + 9, gameCharY - 3, 5, 10);
        noStroke();
      } else if (isLeft) {
          // Walking left
          fill(134, 135, 132);
          rect(gameCharX - 10.5, gameCharY - 52, 20, 20);
          stroke(80);
          strokeWeight(2);
          line(gameCharX + 5.5, gameCharY - 50, gameCharX + 5.5, gameCharY - 65);
          noStroke();
          fill(255, 100, 100);
          ellipse(gameCharX + 5.5, gameCharY - 65, 6, 6);
          fill(0);
          ellipse(gameCharX - 4, gameCharY - 44, 4, 7);
          fill(53, 54, 52);
          rect(gameCharX - 10, gameCharY - 35, 30, 40);
          fill(134, 135, 132);
          rect(gameCharX - 3, gameCharY + 2, 5, 10);
          rect(gameCharX + 8, gameCharY - 3, 5, 10);
          noStroke();
        } else if (isRight) {
            // Walking right
            fill(134, 135, 132);
            rect(gameCharX + 1, gameCharY - 52, 20, 20);
            stroke(80);
            strokeWeight(2);
            line(gameCharX + 6.5, gameCharY - 50, gameCharX + 6.5, gameCharY - 65);
            noStroke();
            fill(255, 100, 100);
            ellipse(gameCharX + 6.5, gameCharY - 65, 6, 6);
            fill(0);
            ellipse(gameCharX + 13, gameCharY - 44, 4, 7);
            fill(53, 54, 52);
            rect(gameCharX - 10, gameCharY - 35, 30, 40);
            fill(134, 135, 132);
            rect(gameCharX - 3, gameCharY - 3, 5, 10);
            rect(gameCharX + 9, gameCharY + 2, 5, 10);
            noStroke();
          } else if (isFalling || isPlummeting) {
              // Jumping straight up or falling down
              fill(134, 135, 132);
              rect(gameCharX - 4.5, gameCharY - 55, 20, 20);
              stroke(80);
              strokeWeight(2);
              line(gameCharX + 5.5, gameCharY - 55, gameCharX + 5.5, gameCharY - 70);
              noStroke();
              fill(255, 100, 100);
              ellipse(gameCharX + 5.5, gameCharY - 75, 6, 6);
              fill(0);
              ellipse(gameCharX + 1, gameCharY - 43, 4, 7);
              ellipse(gameCharX + 10, gameCharY - 43, 4, 7);
              fill(53, 54, 52);
              rect(gameCharX - 10, gameCharY - 35, 30, 40);
              fill(134, 135, 132);
              rect(gameCharX - 3, gameCharY - 8, 5, 10);
              rect(gameCharX + 8, gameCharY - 8, 5, 10);
              noStroke();
            } else {
                // Standing front faced
                stroke(80);
                strokeWeight(2);
                line(gameCharX + 5.5, gameCharY - 50, gameCharX + 5.5, gameCharY - 65);
                noStroke();
                fill(255, 100, 100);
                ellipse(gameCharX + 5.5, gameCharY - 65, 6, 6);
                fill(134, 135, 132);
                rect(gameCharX - 4.5, gameCharY - 50, 20, 20);
                fill(0);
                ellipse(gameCharX + 1, gameCharY - 43, 4, 7);
                ellipse(gameCharX + 10, gameCharY - 43, 4, 7);
                fill(53, 54, 52);
                rect(gameCharX - 10, gameCharY - 35, 30, 40);
                fill(134, 135, 132);
                rect(gameCharX - 3, gameCharY + 2, 5, 10);
                rect(gameCharX + 8, gameCharY + 2, 5, 10);
                noStroke();
                fill(134, 135, 132);
                rect(gameCharX - 15, gameCharY - 32, 5, 13);
                rect(gameCharX + 20, gameCharY - 32, 5, 13);
              } 
}

// GAME LOGIC FUNCTIONS
function checkFlagpole() {
    let d = abs(gameCharX - flagPole.xPos); // Distance between character and flagpole
    if (d < 5) {
        // Stop the character once the flagpole is reached 
        if (!flagPole.isReached) {
            flagPole.isReached = true; 
            isLeft = false;
            isRight = false;
            if (canPlaySound(winSound) && canPlaySound(winApplauseSound)) {
                bgMusic.setVolume(0.1);  
                winApplauseSound.play();
                winSound.play(); // Play win sound effect when reaching the flagpole
            }
        }
        // Launch a firework every 20 frames after reaching the flagpole
        if (frameCount % 20 === 0) {
            fireworks.push(createFirework(flagPole.xPos + random(-100, 100), random(100, 300)));
        }
    }
}

function handleGameStateDisplay() {
   // Restart overlay aligned to screen coordinates
    if (gameOver) {
        push();
        fill(0, 0, 0, 180);
        rect(0, 0, width, height);
        textSize(60);
        fill(255);
        textAlign(CENTER);
        // Ternary operator for conditional text display
        textFont(gameFont); // Custom font
        fill(timeUp ? color(255, 165, 0) : color(255, 0, 0)); // red color for game over, orange for time's up
        text(timeUp ? "TIME'S UP! " : "GAME OVER", width/2, height/2 - 50);
        textFont('sans-serif'); // Reset to default font for score display
        textSize(20);
        fill(255);
        textFont(myFont);
        text("Press R to Restart", width/2, height/2);
        pop();
        noLoop(); // Pause draw loop when game over
    }

    // Final message shown when flagpole is reached 
    if (flagPole.isReached) {
        push();
        fill(0, 0, 0, 150);
        rect(0, 0, width, height);
        textSize(60);
        fill(255, 215, 0);
        textAlign(CENTER);
        text("LEVEL COMPLETE", width/2, height/2 - 50);
        textSize(30);
        fill(255);
        text("Final Score: " + gameScore, width/2, height/2 + 15);
        textSize(20);
        textFont(myFont);
        text("Press R to Restart", width/2, height/2 + 60);
        pop();
        // Keep looping so fireworks animation continues after level completion
    }
}

function handleGameInteractions() {
    // Character's movement
    if (isLeft) {
        gameCharX -= MOVE_SPEED; //moving left speed
    }

    if (isRight) {
        gameCharX += MOVE_SPEED; //moving right speed
    }

    // INDEPENDENT CODE //
    // Check if character is on a platform FIRST
    let onPlatform = false;
    for (let i = 0; i < platforms.length; i++) {
        let platform = platforms[i];
        // Horizontal tolerance makes landing forgiving and avoids edge jitter.
        if (gameCharX > platform.xPos - 8 && gameCharX < platform.xPos + platform.width + 8) {
            // Vertical tolerance creates stable platform snapping on moving platforms.
            let distToPlatform = gameCharY - platform.yPos;
            if (distToPlatform >= -3 && distToPlatform <= 8) {
                gameCharY = platform.yPos; // Snap to platform
                isFalling = false;
                onPlatform = true;
                break;
            }
        }
    }

    // Gravity is applied only when neither platform collision nor ground support is active.
    if (!onPlatform && !isPlummeting) {
        if (gameCharY < floorPosY) {
            gameCharY += GRAVITY; // Gravity effect
            isFalling = true;
        } else {
            gameCharY = floorPosY;
            isFalling = false;
          }
    }

    // Canyon detection
    for (let i = 0; i < canyons.length; i++) {
        let canyon = canyons[i];
        if (gameCharX > canyon.xPos && gameCharX < canyon.xPos + canyon.width && gameCharY >= floorPosY) {
            isPlummeting = true; // Jump over canyon
            if (canPlaySound(fallSound)) {
                bgMusic.setVolume(0.1); // Lower background music volume 
                fallSound.setVolume(0.1);
                fallSound.play(); // Play fall sound effect when falling into canyon
            }
        }
    }

    // Collision with enemy and jump on enemy 
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (!enemy.isDead) {  //only works if enemy is not destroyed
            enemy.update();
            let d = dist(gameCharX, gameCharY, enemy.xPos, enemy.yPos);  //distance between character and enemy
            // Two-branch enemy logic: top-hit while falling defeats enemy, otherwise collision damages player.
            if (d < ENEMY_JUMP_RANGE && gameCharY < enemy.yPos - 20 && isFalling) {
                enemy.isDead = true;  //enemy destroys when character jumps on it
                gameScore += 2;  //Bonus points for destroying enemy
                gameCharY -= 50;  //Small bounce effect
                if (canPlaySound(enemyDefeatSound)) {
                    bgMusic.setVolume(0.1); // Lower background music volume to avoid overlap with enemy defeat sound
                    enemyDefeatSound.play(); // Play enemy defeat sound effect
                }
            }
        // Side/front collision branch (non-stomp): consume life and trigger respawn.
        else if (d < ENEMY_COLLISION_RANGE && !gameOver) {
            if (lives <= 0) {
                gameOver = true;
                if (canPlaySound(enemyHitSound)) {
                    bgMusic.setVolume(0.1); // Lower background music volume to avoid overlap with enemy hit sound
                    enemyHitSound.play(); // Play hit sound effect
                }
            } else {
                lives -= 1; //Decrease lives when hit
                restartDelay = true;
                if (canPlaySound(enemyHitSound)) {
                    enemyHitSound.play(); // Play hit sound effect
                }
              }
        }
        }
    }

    // Restarts the game position after hit
    if (restartDelay) {
        gameCharX = width/2;
        gameCharY = floorPosY;
        isFalling = false;
        isLeft = false;
        isRight = false;
        restartDelay = false;
    }

    // Plummeting down the canyon
    if (isPlummeting) {
        gameCharY += FALL_SPEED; //speed of falling
        isLeft = false;
        isRight = false;
    }

    // Wait until the character has fallen completely off the screen
    if (isPlummeting && gameCharY > height + 200) {
        gameOver = true;
    }
}

// INPUT HANDLERS
function keyPressed() {
    if (typeof userStartAudio === 'function') {
        userStartAudio();
    }
    startBackgroundMusic(); //start background music on first key press

    // If statements to control animations when keys are pressed 
    if (!isPlummeting) {
        if (!flagPole.isReached) {
            if (key == 'a') {
                isLeft = true;
            } else if(key == 'd') {
                isRight = true;
              } else if(key == 'w' && !isFalling) {
                  gameCharY -= JUMP_HEIGHT;
                  if (canPlaySound(jumpSound)) {
                      jumpSound.setVolume(0.4); 
                      jumpSound.play(); // Play jump sound effect
                  }
                }
        }
    }

    if (key == 'R' || key == 'r') {
        if (gameOver || flagPole.isReached) {
            resetGame(); // Reset the game when R is pressed after game-over or level completion
        }
    }
}

function keyReleased() {
    // If statements to control animations when keys are released 
    if (key == 'a') {
        isLeft = false;
    } else if (key == 'd') {
        isRight = false;
      }
}
