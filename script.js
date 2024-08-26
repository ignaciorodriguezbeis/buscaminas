document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const resetButton = document.getElementById("reset-button");
    const settingsButton = document.getElementById("settings-button");
    const mineCounter = document.getElementById("mine-counter");
    const gameOverMessage = document.getElementById("game-over-message");
    const rows = 20;
    const cols = 20;
    const minesCount = 40;
    let boardMatrix;
    let gameOver = false;
    let remainingMines = minesCount;

    // Función para actualizar el contador de minas
    function updateMineCounter() {
        mineCounter.textContent = remainingMines;
    }

    // Función para inicializar el tablero
    function initializeBoard() {
        board.innerHTML = ''; // Limpiar el tablero
        remainingMines = minesCount;
        updateMineCounter(); // Inicializar el contador de minas
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

    // Función para reiniciar el juego
    resetButton.addEventListener("click", () => {
        initializeBoard(); // Reiniciar el tablero
    });

    // Función para manejar el clic en una celda
    function handleCellClick(row, col, cell) {
        if (gameOver || boardMatrix[row][col].revealed || boardMatrix[row][col].flagged) return;

        cell.classList.add("revealed");
        cell.setAttribute('data-adjacent-mines', boardMatrix[row][col].adjacentMines);
        boardMatrix[row][col].revealed = true;

        if (boardMatrix[row][col].mine) {
            cell.classList.add("mine");
            cell.textContent = "💣"; // Mostrar una mina
            triggerGameOver();
        } else {
            cell.textContent = boardMatrix[row][col].adjacentMines || '';
            setColor(cell, boardMatrix[row][col].adjacentMines);
            if (boardMatrix[row][col].adjacentMines === 0) {
                floodFill(row, col);
            }
        }
    }

    // Función para manejar el clic derecho (marcar con banderita)
    function handleCellRightClick(row, col, cell, event) {
        event.preventDefault();  // Prevenir el menú contextual predeterminado

        if (gameOver || boardMatrix[row][col].revealed) return;

        if (!boardMatrix[row][col].flagged) {
            boardMatrix[row][col].flagged = true;
            cell.classList.add("flagged");
            cell.textContent = "🚩";  // Emoji de banderita
            remainingMines--;
        } else {
            boardMatrix[row][col].flagged = false;
            cell.classList.remove("flagged");
            cell.textContent = '';  // Remover banderita
            remainingMines++;
        }
        updateMineCounter(); // Actualizar el contador de minas restantes
    }

    // funcionalidad al botón de ajustes
    settingsButton.addEventListener("click", () => {
        alert("Abrir configuraciones (aquí puedes agregar funcionalidad específica para las configuraciones)");
    });

    initializeBoard(); // Inicializar el tablero cuando la página carga 

    // Función para cambiar el color del número
    function setColor(cell, number) {
        switch (number) {
            case 1:
                cell.style.color = 'blue';
                break;
            case 2:
                cell.style.color = 'green';
                break;
            case 3:
                cell.style.color = 'red';
                break;
            case 4:
                cell.style.color = 'purple';
                break;
            case 5:
                cell.style.color = 'orange';
                break;    
            default:
                cell.style.color = 'black';
                break;
        }
    }

    // Función para colocar minas aleatoriamente en el tablero
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < minesCount) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            if (!boardMatrix[row][col].mine) {
                boardMatrix[row][col].mine = true;
                minesPlaced++;
            }
        }
    }

    // Función para calcular el número de minas adyacentes
    function calculateAdjacentMines() {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (boardMatrix[row][col].mine) continue;

                let minesCount = 0;
                directions.forEach(([dx, dy]) => {
                    const newRow = row + dx;
                    const newCol = col + dy;
                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && boardMatrix[newRow][newCol].mine) {
                        minesCount++;
                    }
                });
                boardMatrix[row][col].adjacentMines = minesCount;
            }
        }
    }

    // Función para crear las celdas en el DOM
    function createCells() {
        board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.addEventListener("click", () => handleCellClick(row, col, cell));
                cell.addEventListener("contextmenu", (event) => handleCellRightClick(row, col, cell, event));
                board.appendChild(cell);
            }
        }
    }

    // Función de Game Over
    function triggerGameOver() {
        gameOver = true;
        gameOverMessage.style.display = 'block';
    }

    // Función para revelar las celdas adyacentes recursivamente
    function floodFill(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && !boardMatrix[newRow][newCol].revealed && !boardMatrix[newRow][newCol].mine) {
                const cell = board.children[newRow * cols + newCol];
                handleCellClick(newRow, newCol, cell);
            }
        });
    }

    initializeBoard(); // Inicializar el tablero cuando la página carga
});
