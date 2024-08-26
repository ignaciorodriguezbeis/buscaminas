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

    let rows = 20;
    let cols = 20;
    let minesCount = 40;
    let boardMatrix;
    let gameOver = false;
    let remainingMines = minesCount;
    let timer = null;
    let secondsElapsed = 0;

    // Función para actualizar el contador de minas
    function updateMineCounter() {
        mineCounter.textContent = remainingMines;
    }

    // Función para actualizar el contador de tiempo
    function updateTimeCounter() {
        timeCounter.textContent = secondsElapsed.toString().padStart(3, '0');
    }

     // Función para iniciar el contador de tiempo
     function startTimer() {
        if (timer !== null) return;  
        timer = setInterval(() => {
            secondsElapsed++;
            updateTimeCounter();
        }, 1000);
    }

    // Función para detener el contador de tiempo
    function stopTimer() {
        clearInterval(timer);
        timer = null;
    }

    // Función para reiniciar el contador de tiempo
    function resetTimer() {
        stopTimer();
        secondsElapsed = 0;
        updateTimeCounter();
    }

    // Función para inicializar el tablero
    function initializeBoard() {
        board.innerHTML = ''; 
        remainingMines = minesCount;
        updateMineCounter(); 
        resetTimer(); 
        boardMatrix = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
                mine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0,
            }))
        );

        placeMines();
        calculateAdjacentMines();
        createCells();
        gameOverMessage.style.display = 'none';
        gameOver = false;
    }

    // Función para colocar minas aleatoriamente
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < minesCount) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);

            if (!boardMatrix[randomRow][randomCol].mine) {
                boardMatrix[randomRow][randomCol].mine = true;
                minesPlaced++;
            }
        }
    }

    // Función para calcular las minas adyacentes a cada celda
    function calculateAdjacentMines() {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!boardMatrix[row][col].mine) {
                    boardMatrix[row][col].adjacentMines = getAdjacentMines(row, col);
                }
            }
        }
    }

    // Función para obtener la cantidad de minas adyacentes a una celda
    function getAdjacentMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    if (boardMatrix[newRow][newCol].mine) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    // Función para crear las celdas del tablero
    function createCells() {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;

                cell.addEventListener("click", () => handleCellClick(row, col, cell));
                cell.addEventListener("contextmenu", (event) => handleCellRightClick(row, col, cell, event));

                board.appendChild(cell);
            }
        }
        board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    }

   // Función para manejar el clic en una celda
   function handleCellClick(row, col, cell) {
    if (gameOver || boardMatrix[row][col].flagged || boardMatrix[row][col].revealed) return;

    if (secondsElapsed === 0) startTimer(); 

    boardMatrix[row][col].revealed = true;

    if (boardMatrix[row][col].mine) {
        cell.classList.add("mine");
        cell.textContent = "💣";
        gameOver = true;
        stopTimer();  
        showGameOver();
        } else {
            cell.classList.add("revealed");
            const adjacentMines = boardMatrix[row][col].adjacentMines;
            if (adjacentMines > 0) {
                cell.textContent = adjacentMines;
                cell.classList.add(`mine-count-${adjacentMines}`);
            } else {
                floodFill(row, col);
            }
        }
    }

    // Función para manejar el clic derecho (marcar con banderita)
    function handleCellRightClick(row, col, cell, event) {
        event.preventDefault();  
        if (gameOver || boardMatrix[row][col].revealed) return;

        if (!boardMatrix[row][col].flagged) {
            boardMatrix[row][col].flagged = true;
            cell.classList.add("flagged");
            cell.textContent = "🚩";  
            remainingMines--;
        } else {
            boardMatrix[row][col].flagged = false;
            cell.classList.remove("flagged");
            cell.textContent = '';  
            remainingMines++;
        }
        updateMineCounter(); 
    }

    // Función de Game Over
    function showGameOver() {
        gameOverMessage.style.display = 'block';
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        let timeElement = document.getElementById('game-over-time');
        if (!timeElement) {
            timeElement = document.createElement('div');
            timeElement.id = 'game-over-time';
            gameOverMessage.appendChild(timeElement);
        }
        
        // Actualizar el contenido del mensaje de Game Over
        gameOverMessage.innerHTML = `Game Over<br><div id="game-over-time">Tiempo: ${formattedTime}</div>`;
    }

    // Función para llenar por inundación las celdas adyacentes vacías
    function floodFill(row, col) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    const adjacentCell = document.querySelector(`[data-row='${newRow}'][data-col='${newCol}']`);
                    if (!boardMatrix[newRow][newCol].revealed && !boardMatrix[newRow][newCol].mine) {
                        handleCellClick(newRow, newCol, adjacentCell);
                    }
                }
            }
        }
    }

    // Función para reiniciar el juego
    resetButton.addEventListener("click", initializeBoard);

    // Función para abrir la ventana de ajustes
    settingsButton.addEventListener("click", () => {
        settingsModal.style.display = "block";
    });

    // Función para cerrar la ventana de ajustes
    closeButton.addEventListener("click", () => {
        settingsModal.style.display = "none";
    });

    // Aplicar los ajustes seleccionados
    applySettingsButton.addEventListener("click", () => {
        const newGridSize = parseInt(gridSizeInput.value);
        const newMinesCount = parseInt(mineCountInput.value);

        if (newMinesCount < 1 || newMinesCount >= newGridSize * newGridSize) {
            alert("La cantidad de minas debe ser mayor a 0 y menor que el número total de casillas.");
            return;
        }

        rows = newGridSize;
        cols = newGridSize;
        minesCount = newMinesCount;
        initializeBoard(); 
        settingsModal.style.display = "none"; 
    });

    // Cerrar la ventana modal si se hace clic fuera de ella
    window.addEventListener("click", (event) => {
        if (event.target == settingsModal) {
            settingsModal.style.display = "none";
        }
    });
    function updateTimeCounter() {
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        timeCounter.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    initializeBoard(); 
});
