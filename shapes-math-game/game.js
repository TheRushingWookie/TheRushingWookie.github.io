// Shape Math Game
// Educational game for learning addition through polygon shapes

// Shape colors - each polygon type has a unique color
const SHAPE_COLORS = {
    3: '#FF6B6B',  // Triangle - Coral
    4: '#4ECDC4',  // Square - Teal
    5: '#FFE66D',  // Pentagon - Gold
    6: '#95E1A3',  // Hexagon - Mint
    7: '#DDA0DD',  // Heptagon - Plum
    8: '#FFA07A',  // Octagon - Light Salmon
    9: '#87CEEB',  // Nonagon - Sky Blue
    10: '#FFB6C1'  // Decagon - Light Pink
};

const SHAPE_NAMES = {
    3: 'Triangle',
    4: 'Square',
    5: 'Pentagon',
    6: 'Hexagon',
    7: 'Heptagon',
    8: 'Octagon',
    9: 'Nonagon',
    10: 'Decagon'
};

// Game configuration
const CONFIG = {
    minSides: 3,
    maxSides: 8,
    minGoal: 6,
    maxGoal: 14,
    shapeCount: 8,
    baseSpeed: 0.8,
    shapeSize: 35,
    selectionGlow: '#667eea'
};

// Game state
let canvas, ctx, goalCanvas, goalCtx;
let shapes = [];
let selectedShapes = [];
let goalSides = 6;
let score = 0;
let highScore = 0;
let animationId;
let hintShapes = [];

// Shape class
class Shape {
    constructor(x, y, sides, size = CONFIG.shapeSize) {
        this.x = x;
        this.y = y;
        this.sides = sides;
        this.size = size;
        this.color = SHAPE_COLORS[sides];
        this.selected = false;
        this.hint = false;
        
        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = CONFIG.baseSpeed * (0.5 + Math.random() * 0.5);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Animation properties
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(canvasWidth, canvasHeight) {
        // Move shape
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off walls
        const margin = this.size + 10;
        if (this.x < margin || this.x > canvasWidth - margin) {
            this.vx *= -1;
            this.x = Math.max(margin, Math.min(canvasWidth - margin, this.x));
        }
        if (this.y < margin || this.y > canvasHeight - margin) {
            this.vy *= -1;
            this.y = Math.max(margin, Math.min(canvasHeight - margin, this.y));
        }
        
        // Rotate slowly
        this.rotation += this.rotationSpeed;
        this.pulsePhase += 0.05;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Calculate pulse for selected or hint shapes
        let currentSize = this.size;
        if (this.selected || this.hint) {
            currentSize = this.size + Math.sin(this.pulsePhase) * 3;
        }
        
        // Draw glow for selected shapes
        if (this.selected) {
            ctx.shadowColor = CONFIG.selectionGlow;
            ctx.shadowBlur = 20;
        } else if (this.hint) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
        }
        
        // Draw polygon
        ctx.beginPath();
        for (let i = 0; i < this.sides; i++) {
            const angle = (i * 2 * Math.PI / this.sides) - Math.PI / 2;
            const x = Math.cos(angle) * currentSize;
            const y = Math.sin(angle) * currentSize;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        
        // Fill
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Stroke
        ctx.strokeStyle = this.selected ? CONFIG.selectionGlow : 'rgba(0,0,0,0.2)';
        ctx.lineWidth = this.selected ? 4 : 2;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Draw side count label
        ctx.rotate(-this.rotation); // Unrotate for text
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.font = 'bold 16px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.sides.toString(), 0, 0);
        
        ctx.restore();
    }

    containsPoint(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.size + 10;
    }
}

// Draw a polygon on a canvas
function drawPolygon(ctx, centerX, centerY, sides, size, color, showLabel = true) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Draw shadow
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    
    // Draw polygon
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    
    // Draw label if requested
    if (showLabel) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = 'bold 18px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sides.toString(), 0, 0);
    }
    
    ctx.restore();
}

// Initialize the game
function init() {
    // Get canvas elements
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    goalCanvas = document.getElementById('goal-canvas');
    goalCtx = goalCanvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Load high score
    highScore = parseInt(localStorage.getItem('shapeMathHighScore')) || 0;
    document.getElementById('high-score').textContent = highScore;
    
    // Event listeners
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    document.getElementById('new-game-btn').addEventListener('click', newGame);
    document.getElementById('hint-btn').addEventListener('click', showHint);
    
    // Start game
    newGame();
}

// Resize canvas to fit container
function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Set actual canvas dimensions
    canvas.width = rect.width;
    canvas.height = 400;
    
    // Adjust for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);
    
    // Set CSS size
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '400px';
}

// Start a new game
function newGame() {
    score = 0;
    updateScore();
    generateNewGoal();
    spawnShapes();
    
    // Clear selections
    selectedShapes = [];
    updateSelectionDisplay();
    
    // Start game loop
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    gameLoop();
}

// Generate a new goal
function generateNewGoal() {
    goalSides = CONFIG.minGoal + Math.floor(Math.random() * (CONFIG.maxGoal - CONFIG.minGoal + 1));
    
    // Clear and draw goal shape
    goalCtx.clearRect(0, 0, goalCanvas.width, goalCanvas.height);
    
    // Use a composite color for the goal
    const goalColor = `hsl(${(goalSides * 30) % 360}, 70%, 60%)`;
    drawPolygon(goalCtx, 50, 50, Math.min(goalSides, 10), 35, goalColor, false);
    
    // Update goal text
    document.getElementById('goal-sides').textContent = `${goalSides} sides`;
    
    // Add celebration animation to goal
    document.querySelector('.goal-shape-container').classList.add('pulse');
    setTimeout(() => {
        document.querySelector('.goal-shape-container').classList.remove('pulse');
    }, 500);
}

// Spawn floating shapes
function spawnShapes() {
    shapes = [];
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Ensure we have shapes that can make the goal
    // First, find a valid pair
    let validPairs = [];
    for (let i = CONFIG.minSides; i <= CONFIG.maxSides; i++) {
        for (let j = i; j <= CONFIG.maxSides; j++) {
            if (i + j === goalSides) {
                validPairs.push([i, j]);
            }
        }
    }
    
    // If no valid pairs with current config, adjust
    if (validPairs.length === 0) {
        // Goal is too high or low, regenerate
        generateNewGoal();
        spawnShapes();
        return;
    }
    
    // Pick a random valid pair and ensure those shapes exist
    const [side1, side2] = validPairs[Math.floor(Math.random() * validPairs.length)];
    
    // Create shapes with guaranteed valid pair
    const sidesNeeded = [side1, side2];
    
    // Fill remaining slots with random shapes
    while (sidesNeeded.length < CONFIG.shapeCount) {
        const randomSides = CONFIG.minSides + Math.floor(Math.random() * (CONFIG.maxSides - CONFIG.minSides + 1));
        sidesNeeded.push(randomSides);
    }
    
    // Shuffle the array
    for (let i = sidesNeeded.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sidesNeeded[i], sidesNeeded[j]] = [sidesNeeded[j], sidesNeeded[i]];
    }
    
    // Create shape objects with spread-out positions
    const margin = CONFIG.shapeSize + 20;
    const cols = 4;
    const rows = Math.ceil(CONFIG.shapeCount / cols);
    const cellWidth = (canvasWidth - margin * 2) / cols;
    const cellHeight = (canvasHeight - margin * 2) / rows;
    
    for (let i = 0; i < sidesNeeded.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        // Position with some randomness within cell
        const x = margin + col * cellWidth + cellWidth / 2 + (Math.random() - 0.5) * cellWidth * 0.5;
        const y = margin + row * cellHeight + cellHeight / 2 + (Math.random() - 0.5) * cellHeight * 0.5;
        
        shapes.push(new Shape(x, y, sidesNeeded[i]));
    }
}

// Main game loop
function gameLoop() {
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Update and draw shapes
    for (const shape of shapes) {
        shape.update(canvasWidth, canvasHeight);
        shape.draw(ctx);
    }
    
    animationId = requestAnimationFrame(gameLoop);
}

// Handle click on canvas
function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    processClick(x, y);
}

// Handle touch on canvas
function handleTouch(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    processClick(x, y);
}

// Process click/touch
function processClick(x, y) {
    // Clear hint
    clearHint();
    
    // Find clicked shape
    for (const shape of shapes) {
        if (shape.containsPoint(x, y)) {
            handleShapeClick(shape);
            break;
        }
    }
}

// Handle clicking on a shape
function handleShapeClick(shape) {
    // If already selected, deselect
    if (shape.selected) {
        shape.selected = false;
        selectedShapes = selectedShapes.filter(s => s !== shape);
        updateSelectionDisplay();
        return;
    }
    
    // If we already have 2 selected, ignore
    if (selectedShapes.length >= 2) {
        return;
    }
    
    // Select this shape
    shape.selected = true;
    selectedShapes.push(shape);
    updateSelectionDisplay();
    
    // If we now have 2 selected, check the sum
    if (selectedShapes.length === 2) {
        setTimeout(checkMatch, 300);
    }
}

// Update the selection display
function updateSelectionDisplay() {
    const shape1El = document.getElementById('shape1-sides');
    const shape2El = document.getElementById('shape2-sides');
    const sumEl = document.getElementById('sum-sides');
    
    // Update shape 1
    if (selectedShapes[0]) {
        shape1El.textContent = selectedShapes[0].sides;
        shape1El.classList.add('active');
    } else {
        shape1El.textContent = '?';
        shape1El.classList.remove('active');
    }
    
    // Update shape 2
    if (selectedShapes[1]) {
        shape2El.textContent = selectedShapes[1].sides;
        shape2El.classList.add('active');
    } else {
        shape2El.textContent = '?';
        shape2El.classList.remove('active');
    }
    
    // Update sum
    if (selectedShapes.length === 2) {
        const sum = selectedShapes[0].sides + selectedShapes[1].sides;
        sumEl.textContent = sum;
    } else if (selectedShapes.length === 1) {
        sumEl.textContent = selectedShapes[0].sides + ' + ?';
    } else {
        sumEl.textContent = '?';
    }
    
    // Clear sum styling
    sumEl.classList.remove('correct', 'incorrect');
}

// Check if selected shapes match the goal
function checkMatch() {
    const sum = selectedShapes[0].sides + selectedShapes[1].sides;
    const sumEl = document.getElementById('sum-sides');
    sumEl.textContent = sum;
    
    if (sum === goalSides) {
        // Correct!
        sumEl.classList.add('correct');
        showFeedback('Correct! 🎉', true);
        
        // Update score
        score++;
        updateScore();
        
        // Create particles at shape positions
        createParticles(selectedShapes[0].x, selectedShapes[0].y);
        createParticles(selectedShapes[1].x, selectedShapes[1].y);
        
        // Wait, then generate new round
        setTimeout(() => {
            // Deselect shapes
            selectedShapes.forEach(s => s.selected = false);
            selectedShapes = [];
            updateSelectionDisplay();
            
            // New goal and shapes
            generateNewGoal();
            spawnShapes();
        }, 1000);
    } else {
        // Incorrect
        sumEl.classList.add('incorrect');
        showFeedback('Try again!', false);
        
        // Shake the game area
        document.querySelector('.game-area').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.game-area').classList.remove('shake');
        }, 500);
        
        // Deselect after delay
        setTimeout(() => {
            selectedShapes.forEach(s => s.selected = false);
            selectedShapes = [];
            updateSelectionDisplay();
        }, 800);
    }
}

// Show feedback message
function showFeedback(message, isCorrect) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = 'feedback show ' + (isCorrect ? 'correct' : 'incorrect');
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 1000);
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    
    // Check for new high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('shapeMathHighScore', highScore);
        document.getElementById('high-score').textContent = highScore;
        document.getElementById('high-score').classList.add('celebrate');
        setTimeout(() => {
            document.getElementById('high-score').classList.remove('celebrate');
        }, 600);
    }
}

// Create particle effects
function createParticles(x, y) {
    const gameArea = document.querySelector('.game-area');
    const rect = gameArea.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = (8 + Math.random() * 8) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = Object.values(SHAPE_COLORS)[Math.floor(Math.random() * Object.values(SHAPE_COLORS).length)];
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        particle.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
        
        gameArea.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Show hint - highlight a valid pair
function showHint() {
    clearHint();
    
    // Find shapes that add up to goal
    for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
            if (shapes[i].sides + shapes[j].sides === goalSides) {
                shapes[i].hint = true;
                shapes[j].hint = true;
                hintShapes = [shapes[i], shapes[j]];
                
                // Clear hint after 2 seconds
                setTimeout(clearHint, 2000);
                return;
            }
        }
    }
}

// Clear hint highlighting
function clearHint() {
    for (const shape of hintShapes) {
        shape.hint = false;
    }
    hintShapes = [];
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
