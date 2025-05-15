// Initialize game state
let board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];
let currentPlayer = "X";
let gameActive = true;

const statusDisplay = document.getElementById("status");
const cells = document.querySelectorAll(".cell");
const resetButton = document.getElementById("reset");
const themeToggle = document.getElementById("theme-toggle");
const xColorPicker = document.getElementById("x-color");
const oColorPicker = document.getElementById("o-color");
const winLine = document.getElementById("win-line");
const moveSound = document.getElementById("move-sound");
const winSound = document.getElementById("win-sound");
const drawSound = document.getElementById("draw-sound");
const startSound = document.getElementById("start-sound");

// Preload audio
[moveSound, winSound, drawSound, startSound].forEach(audio => {
    audio.load();
});

// Dynamic CSS for custom colors
const styleSheet = document.createElement("style");
document.head.appendChild(styleSheet);
function updateColors() {
    styleSheet.textContent = `
        .cell.x { color: ${xColorPicker.value}; }
        .cell.o { color: ${oColorPicker.value}; }
        #win-line.x { background-color: ${xColorPicker.value}; }
        #win-line.o { background-color: ${oColorPicker.value}; }
    `;
}
xColorPicker.addEventListener("input", updateColors);
oColorPicker.addEventListener("input", updateColors);
updateColors();

// Theme toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark")
        ? "Light Mode"
        : "Dark Mode";
});

// Event listeners for cells
cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick, { passive: true });
});

// Reset game
resetButton.addEventListener("click", resetGame);

// Enable audio after user interaction
document.addEventListener("click", () => {
    moveSound.muted = false;
    winSound.muted = false;
    drawSound.muted = false;
    startSound.muted = false;
}, { once: true });

function handleCellClick(e) {
    const cell = e.target;
    const index = cell.getAttribute("data-index");
    const row = Math.floor(index / 3);
    const col = index % 3;

    if (board[row][col] !== "" || !gameActive) return;

    board[row][col] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    moveSound.play().catch(() => console.log("Move sound blocked"));

    const winCells = checkWin();
    if (winCells) {
        statusDisplay.textContent = `Player ${currentPlayer} Wins!`;
        statusDisplay.classList.add("win");
        gameActive = false;
        drawWinLine(winCells);
        createParticles();
        winSound.play().catch(() => console.log("Win sound blocked"));
        return;
    }

    if (checkDraw()) {
        statusDisplay.textContent = "It's a Draw!";
        gameActive = false;
        drawSound.play().catch(() => console.log("Draw sound blocked"));
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWin() {
    // Rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === currentPlayer && board[i][1] === currentPlayer && board[i][2] === currentPlayer) {
            return [i * 3, i * 3 + 1, i * 3 + 2];
        }
    }

    // Columns
    for (let i = 0; i < 3; i++) {
        if (board[0][i] === currentPlayer && board[1][i] === currentPlayer && board[2][i] === currentPlayer) {
            return [i, i + 3, i + 6];
        }
    }

    // Diagonals
    if (board[0][0] === currentPlayer && board[1][1] === currentPlayer && board[2][2] === currentPlayer) {
        return [0, 4, 8];
    }
    if (board[0][2] === currentPlayer && board[1][1] === currentPlayer && board[2][0] === currentPlayer) {
        return [2, 4, 6];
    }

    return null;
}

function checkDraw() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === "") {
                return false;
            }
        }
    }
    return true;
}

function drawWinLine(cells) {
    const first = cells[0];
    const last = cells[cells.length - 1];
    const board = document.querySelector("#board");
    const boardSize = parseFloat(getComputedStyle(board).width); // Total board width
    const gap = 6; // Grid gap
    const padding = 6; // Board padding
    const cellSize = (boardSize - 2 * padding - 2 * gap) / 3; // Calculate cell size

    let x1, y1, x2, y2, width, height, rotate;

    // Calculate start and end points (centers of first and last cells)
    const firstRow = Math.floor(first / 3);
    const firstCol = first % 3;
    const lastRow = Math.floor(last / 3);
    const lastCol = last % 3;

    // Cell center coordinates
    x1 = padding + firstCol * (cellSize + gap) + cellSize / 2;
    y1 = padding + firstRow * (cellSize + gap) + cellSize / 2;
    x2 = padding + lastCol * (cellSize + gap) + cellSize / 2;
    y2 = lastRow * (cellSize + gap) + cellSize / 2;

    if (first % 3 === last % 3) { // Column
        width = 10;
        height = boardSize - 2 * padding;
        x1 = x1; // Center of column
        y1 = padding;
        rotate = 0;
    } else if (Math.floor(first / 3) === Math.floor(last / 3)) { // Row
        width = boardSize - 2 * padding;
        height = 10;
        x1 = padding;
        y1 = y1; // Center of row
        rotate = 0;
    } else { // Diagonals
        width = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        height = 10;
        rotate = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    }

    winLine.style.width = "0";
    winLine.style.height = `${height}px`;
    winLine.style.left = `${x1}px`;
    winLine.style.top = `${y1}px`;
    winLine.style.transform = `rotate(${rotate}deg)`;
    winLine.classList.add(currentPlayer.toLowerCase());

    // Trigger animation
    setTimeout(() => {
        winLine.style.width = `${width}px`;
    }, 10);
}
function createParticles() {
    const particleContainer = document.createElement("div");
    particleContainer.className = "particles";
    document.querySelector(".container").appendChild(particleContainer);

    const particleCount = 20;
    const color = currentPlayer === "X" ? xColorPicker.value : oColorPicker.value;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.background = color;
        const angle = Math.random() * 360;
        const distance = Math.random() * 100 + 50;
        particle.style.setProperty("--x", `${Math.cos(angle * Math.PI / 180) * distance}px`);
        particle.style.setProperty("--y", `${Math.sin(angle * Math.PI / 180) * distance}px`);
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        particleContainer.appendChild(particle);
    }

    setTimeout(() => {
        particleContainer.remove();
    }, 1500);
}

function resetGame() {
    board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];
    currentPlayer = "X";
    gameActive = true;
    statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    statusDisplay.classList.remove("win");
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("x", "o");
    });
    winLine.style.width = "0";
    winLine.classList.remove("x", "o");
    const particleContainer = document.querySelector(".particles");
    if (particleContainer) particleContainer.remove();
    startSound.play().catch(() => console.log("Start sound blocked"));
}