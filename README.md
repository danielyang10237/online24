# Online24

An online multiplayer version of the classic 24 puzzle game where players race to solve mathematical equations using four given numbers and basic arithmetic operations. Supports live score keeping and created for fun and friendly public competitions.

## Overview

Online24 is my real-time multiplayer web game that challenges players to solve the 24 puzzle as quickly as possible. Players are given four numbers and must use addition (+), subtraction (-), multiplication (×), and division (÷) to reach exactly 24. The game features:

- **Real-time multiplayer gameplay** with WebSocket connections
- **Competitive scoring system** based on solution speed
- **Multiple game modes** (3, 5, or 10 rounds)
- **Live leaderboards** and round-by-round scoring
- **Responsive web interface** built with React

## How the Game Works

### The 24 Puzzle
The 24 puzzle is a mathematical card game where players are given four numbers (typically from 1-13, representing playing cards) and must use each number exactly once with the four basic arithmetic operations to reach exactly 24.

**Example:**
- Given numbers: 3, 4, 6, 2
- Solution: (6 × 4) ÷ (3 - 2) = 24 ÷ 1 = 24

### Game Mechanics
1. **Round Structure**: Each game consists of multiple rounds (3, 5, or 10)
2. **Time Limit**: Each round has a 50-second time limit
3. **Scoring**: Points are awarded based on how quickly you solve the puzzle (faster = more points)
4. **Winning**: The player with the highest total score after all rounds wins

### Gameplay Flow
1. Players join a lobby and enter their username
2. Once 2+ players are ready, the game can start
3. Each round begins with a countdown and displays four random numbers
4. Players race to find a valid solution using the interactive number wheel
5. Points are awarded based on solution speed
6. After all rounds, final scores are displayed

## Project Structure

### Client-Side (`/client-side/`)
The React frontend application that handles the user interface and game interactions is held in client-side.

```
client-side/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── DashBoard.jsx   # Main dashboard with WebSocket connection
│   │   ├── LoginPage.jsx   # Username entry and lobby
│   │   ├── GameConsole.jsx # Game interface and controls
│   │   ├── NumberWheel.jsx # Interactive puzzle solver
│   │   ├── TimerBar.jsx    # Round timer display
│   │   └── LeaderboardModal.jsx # Score display
│   ├── css/               # Component-specific styles
│   └── App.js             # Main application component
├── package.json           # Dependencies and scripts
└── package-lock.json
```

### Server-Side (`/server-side/`)
The Node.js code is the backend that manages game logic, WebSocket connections, and multiplayer synchronization.

```
server-side/
├── server-logic/
│   ├── server.js          # Main WebSocket server and game orchestration
│   ├── client.js          # Client connection management
│   ├── serverHelpers.js   # Game logic and round management
│   └── combinations.js    # Pre-calculated solvable number combinations
├── index.js               # Server entry point
├── package.json           # Dependencies and scripts
└── package-lock.json
```

## Dependencies

### Client-Side Dependencies
- **React 18.2.0** - Frontend framework
- **React DOM 18.2.0** - DOM rendering
- **React Scripts 5.0.1** - Build tools and development server
- **Socket.io Client 4.7.2** - WebSocket communication
- **WebSocket 1.0.34** - WebSocket client library
- **Ant Design 5.12.5** - UI component library
- **Bootstrap 5.3.2** - CSS framework
- **React Bootstrap 2.9.2** - Bootstrap components for React
- **Axios 1.6.2** - HTTP client
- **Testing Libraries** - Jest, React Testing Library for testing

### Server-Side Dependencies
- **Node.js 18.12.1** - Runtime environment
- **WebSocket 1.0.34** - WebSocket server implementation
- **HTTP 0.0.1-security** - HTTP server module

### Prerequisites
- Node.js (version 18.12.1 or compatible)
- npm (comes with Node.js)

### Production Deployment

The application is currently deployed on Render.com:
- **Client**: Accessible via the deployed React app
- **Server**: WebSocket server running on `wss://online24-server.onrender.com/`


## Game Features

### Multiplayer Support
- Real-time WebSocket communication
- Automatic reconnection handling
- Player lobby with username validation
- Live player count and status updates

### Game Modes
- **3 Rounds**: Quick games for casual play
- **5 Rounds**: Standard game length
- **10 Rounds**: Extended games for competitive play

### Interactive Puzzle Solver
- Visual number wheel interface
- Drag-and-drop style number selection
- Operator buttons for arithmetic operations
- Reset and scramble functionality
- Real-time solution validation

### Scoring System
- Points awarded based on solution speed
- Faster solutions receive higher scores
- Round-by-round score tracking
- Final leaderboard display

## Technical Details

The game uses WebSocket connections for real-time communication between clients and server. Message types include:

The server uses a pre-calculated list of 859 solvable number combinations (stored in `combinations.js`) to ensure every round has a valid solution.

- Server maintains authoritative game state
- Clients receive updates for UI synchronization
- Automatic cleanup on player disconnection
- Round timer management with automatic progression
