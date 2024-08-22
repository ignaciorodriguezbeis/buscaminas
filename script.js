document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const rows = 20;
    const cols = 20;
    const minesCount = 40;

    // Crear una matriz para almacenar el estado del tablero
    const boardMatrix = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
            mine: false,
            revealed: false,
            flagged: false,
            adjacentMines: 0,
        }))
    );

    // Función para manejar el clic en una celda
    function handleCellClick(row, col, cell) {
        if (boardMatrix[row][col].revealed || boardMatrix[row][col].flagged) return;

        cell.classList.add("revealed");
        cell.setAttribute('data-adjacent-mines', boardMatrix[row][col].adjacentMines);
        boardMatrix[row][col].revealed = true;

        if (boardMatrix[row][col].mine) {
            cell.classList.add("mine");
            cell.textContent = "💣"; // Mostrar una mina
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

        if (boardMatrix[row][col].revealed) return;

        if (!boardMatrix[row][col].flagged) {
            boardMatrix[row][col].flagged = true;
            cell.classList.add("flagged");
            cell.textContent = "🚩";  // Emoji de banderita
        } else {
            boardMatrix[row][col].flagged = false;
            cell.classList.remove("flagged");
            cell.textContent = '';  // Remover banderita
        }
    }

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

    // Función de llenado de áreas
    function floodFill(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && !boardMatrix[newRow][newCol].revealed) {
                handleCellClick(newRow, newCol, board.children[newRow * cols + newCol]);
            }
        });
    }

    // Colocar minas y calcular minas adyacentes
    placeMines();
    calculateAdjacentMines();

    // Configurar las dimensiones del grid
    board.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    board.style.gridTemplateRows = `repeat(${rows}, 30px)`;

    // Crear las celdas del tablero y añadir los manejadores de eventos
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.addEventListener("click", () => handleCellClick(row, col, cell));
            cell.addEventListener("contextmenu", (event) => handleCellRightClick(row, col, cell, event));
            board.appendChild(cell);
        }
    }
});
