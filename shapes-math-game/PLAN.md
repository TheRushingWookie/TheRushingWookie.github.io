# Educational Shapes Math Game - Development Plan

## Overview
An interactive educational game that teaches addition and subtraction through polygon shapes. Players identify pairs of shapes whose sides add up to match a goal shape.

## Game Concept

### Core Mechanics
1. **Goal Shape Display**: A target polygon is shown prominently at the top of the screen
2. **Floating Shapes**: Multiple polygons with varying sides (3-10) float slowly around the play area
3. **Selection**: Player clicks on two shapes that add up to the goal shape's side count
4. **Scoring**: Correct matches earn points; new goal appears after each success
5. **Progressive Difficulty**: Gradually increase speed and reduce time as score increases

### Shapes (Polygons)
- Triangle (3 sides)
- Square (4 sides)
- Pentagon (5 sides)
- Hexagon (6 sides)
- Heptagon (7 sides)
- Octagon (8 sides)
- Nonagon (9 sides)
- Decagon (10 sides)

### Example Gameplay
- Goal: Hexagon (6 sides)
- Player clicks: Triangle (3) + Triangle (3) = 6 ✓
- OR: Square (4) + Pentagon (5) = 9 ✗ (wrong, no points)

## Technical Architecture

### File Structure
```
shapes-math-game/
├── index.html      # Main HTML structure
├── style.css       # Styling and animations
├── game.js         # Core game logic
└── PLAN.md         # This document
```

### HTML Structure
- Header with game title and instructions
- Score display panel
- Goal shape display area
- Main game canvas/container for floating shapes
- Feedback messages (correct/incorrect)
- Sound toggle (optional)

### CSS Features
- Clean, modern educational design
- Bright, engaging colors for shapes
- Smooth animations for floating movement
- Visual feedback for selections
- Responsive design for various screen sizes
- Particle effects for correct answers

### JavaScript Components

#### 1. Shape Class
```javascript
class Shape {
  - sides: number
  - x, y: position
  - vx, vy: velocity
  - size: radius
  - color: fill color
  - selected: boolean
  - draw(): render shape on canvas
  - update(): move shape, handle boundaries
  - containsPoint(x, y): check if clicked
}
```

#### 2. Game State Manager
```javascript
- score: current score
- goalSides: target number of sides
- shapes: array of floating shapes
- selectedShapes: array of clicked shapes (max 2)
- gameLoop(): main animation loop
- checkMatch(): verify if selected shapes sum to goal
- generateNewGoal(): create new target
- spawnShapes(): create floating shapes
```

#### 3. Event Handlers
- Canvas click: shape selection
- Touch support for mobile
- Keyboard shortcuts (optional)

### Game Flow
1. Initialize game with random goal shape (5-15 sides for sums)
2. Spawn 6-10 random shapes with sides 3-10
3. Shapes float around, bouncing off walls
4. Player clicks first shape → highlight it
5. Player clicks second shape → check sum
6. If correct: +1 point, celebration effect, new goal, refresh some shapes
7. If incorrect: shake animation, deselect, try again
8. Track high score in localStorage

### Visual Design
- Background: Subtle gradient (light blue to white)
- Shapes: Each polygon type has a unique color
  - Triangle: Coral
  - Square: Sky Blue
  - Pentagon: Gold
  - Hexagon: Mint Green
  - Heptagon: Lavender
  - Octagon: Salmon
  - Nonagon: Turquoise
  - Decagon: Pink
- Goal area: Highlighted with glow effect
- Selected shapes: Pulsing border animation

### Accessibility Considerations
- High contrast colors
- Shape labels showing side count
- Clear visual feedback
- Works with mouse and touch

## Implementation Phases

### Phase 1: Basic Structure ✓
- Create HTML skeleton
- Set up canvas
- Basic CSS layout

### Phase 2: Shape Rendering
- Implement polygon drawing function
- Create Shape class
- Display goal shape

### Phase 3: Animation
- Implement floating movement
- Add boundary collision
- Smooth animation loop

### Phase 4: Interaction
- Click/tap detection
- Shape selection highlighting
- Match verification

### Phase 5: Game Logic
- Scoring system
- Goal generation
- Level progression

### Phase 6: Polish
- Visual effects (particles, glow)
- Sound effects (optional)
- High score persistence
- Mobile optimization

## GitHub Pages Deployment
- Game will be accessible at: `[username].github.io/[repo]/shapes-math-game/`
- No build step required - pure HTML/CSS/JS
- Works offline once loaded

## Future Enhancements (Optional)
- Subtraction mode (find difference)
- Multiplication mode
- Timed challenges
- Multiple difficulty levels
- Leaderboard
- Achievement badges
