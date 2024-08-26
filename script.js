document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const resetButton = document.getElementById("reset-button");
    const settingsButton = document.getElementById("settings-button");
    const mineCounter = document.getElementById("mine-counter");
    const timeCounter = document.getElementById("time-counter");
    const gameOverMessage = document.getElementById("game-over-message");
    const settingsModal = document.getElementById("settings-modal");
    const closeButton = document.querySelector(".close-button");
    const applySettingsButton = document.getElementById("apply-settings-button");
    const gridSizeInput = document.getElementById("grid-size");
    const mineCountInput = document.getElementById("mine-count");
    const winMessage = document.getElementById("win-message");
    const winText = document.getElementById("win-text");
    const winComment = document.getElementById("win-comment");
    const winTime = document.getElementById("win-time");

    let rows = 20;
    let cols = 20;
    let mines = 40;
    let timer;
    let elapsedTime = 0;
    let boardArray = [];
    let gameStarted = false;

    function initializeGame() {
        board.innerHTML = '';
        boardArray = [];
        elapsedTime = 0;
        timeCounter.textContent = '0:00';
        mineCounter.textContent = mines;
        gameOverMessage.style.display = 'none';
        winMessage.style.display = 'none';
        
        
        board.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
        board.style.gridTemplateRows = `repeat(${rows}, 30px)`;
        for (let r = 0; r < rows; r++) {
            boardArray[r] = [];
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('contextmenu', handleCellRightClick);
                board.appendChild(cell);
                boardArray[r][c] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0
                };
            }
        }

       
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (!boardArray[r][c].isMine) {
                boardArray[r][c].isMine = true;
                minesPlaced++;
                
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const nr = r + i;
                        const nc = c + j;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !boardArray[nr][nc].isMine) {
                            boardArray[nr][nc].adjacentMines++;
                        }
                    }
                }
            }
        }
    }

    function handleCellClick(event) {
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }
        const cell = event.target;
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const cellData = boardArray[row][col];

        if (cellData.isRevealed || cellData.isFlagged) return;

        if (cellData.isMine) {
            revealAllMines();
            showGameOver();
            return;
        }

        revealCell(row, col);

        
        if (checkWin()) {
            stopTimer();
            showWinMessage();
        }
    }

    function handleCellRightClick(event) {
        event.preventDefault();
        const cell = event.target;
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const cellData = boardArray[row][col];

        if (cellData.isRevealed) return;

        cellData.isFlagged = !cellData.isFlagged;
        cell.classList.toggle('flagged');
        updateMineCounter();
    }

    function revealCell(row, col) {
        const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        const cellData = boardArray[row][col];
        if (cellData.isRevealed) return;

        cellData.isRevealed = true;
        cell.classList.add('revealed');
        cell.classList.remove('flagged');
        if (cellData.isMine) {
            cell.textContent = '💣';
            cell.classList.add('mine');
        } else {
            cell.textContent = cellData.adjacentMines || '';
            if (cellData.adjacentMines) {
                cell.classList.add(`mine-count-${cellData.adjacentMines}`);
            }
            if (cellData.adjacentMines === 0) {
                
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const nr = parseInt(row) + i;
                        const nc = parseInt(col) + j;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                            revealCell(nr, nc);
                        }
                    }
                }
            }
        }
    }

    function revealAllMines() {
        board.querySelectorAll('.cell').forEach(cell => {
            const row = cell.dataset.row;
            const col = cell.dataset.col;
            if (boardArray[row][col].isMine) {
                cell.textContent = '💣';
                cell.classList.add('mine');
            }
        });
    }

    function updateMineCounter() {
        const flaggedCount = board.querySelectorAll('.cell.flagged').length;
        mineCounter.textContent = mines - flaggedCount;
    }

    function startTimer() {
        timer = setInterval(() => {
            elapsedTime++;
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = elapsedTime % 60;
            timeCounter.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    function showGameOver() {
        gameOverMessage.style.display = 'block';
    }

    function showWinMessage() {
        winText.textContent = "Win!";
        winComment.textContent = "Your rock!";
        winTime.textContent = `Time: ${timeCounter.textContent}`;
        winMessage.style.display = 'block';
    }

    function hideSettings() {
        settingsModal.style.display = 'none';
    }

    function showSettings() {
        settingsModal.style.display = 'block';
    }

    function checkWin() {
        return board.querySelectorAll('.cell.revealed').length === (rows * cols - mines);
    }

    resetButton.addEventListener("click", () => {
        initializeGame();
        startTimer();
        gameStarted = true;
    });

    settingsButton.addEventListener("click", showSettings);

    closeButton.addEventListener("click", hideSettings);

    applySettingsButton.addEventListener("click", () => {
        rows = cols = parseInt(gridSizeInput.value, 10);
        mines = parseInt(mineCountInput.value, 10);
        if (mines > rows * cols) mines = rows * cols;
        mineCounter.textContent = mines;
        initializeGame();
        hideSettings();
    });

    initializeGame();
});
