document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const rows = 20;  // Número de filas
    const cols = 20;  // Número de columnas
    const minesCount = 40; // Número de minas

    // Crear una matriz para almacenar el estado del tablero
    const boardMatrix = Array(rows).fill(null).map(() => Array(cols).fill({
        mine: false,
        revealed: false,
        adjacentMines: 0,
    }));

    // Función para colocar minas aleatoriamente en el tablero
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < minesCount) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            if (!boardMatrix[row][col].mine) {
                boardMatrix[row][col] = { ...boardMatrix[row][col], mine: true };
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

                boardMatrix[row][col] = { ...boardMatrix[row][col], adjacentMines: minesCount };
            }
        }
    }

    // Colocar minas y calcular minas adyacentes
    placeMines();
    calculateAdjacentMines();

    // Configurar las dimensiones del grid
    board.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    board.style.gridTemplateRows = `repeat(${rows}, 30px)`;

    // Crear las celdas del tablero
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.addEventListener("click", () => handleCellClick(row, col, cell));
            board.appendChild(cell);
        }
    }

    // Función para manejar el clic en una celda
    function handleCellClick(row, col, cell) {
        if (boardMatrix[row][col].revealed) return;

        cell.classList.add("revealed");
        boardMatrix[row][col].revealed = true;

        if (boardMatrix[row][col].mine) {
            cell.classList.add("mine");
            cell.textContent = "💣"; // Mostrar una mina
        } else {
            cell.textContent = boardMatrix[row][col].adjacentMines || '';
            if (boardMatrix[row][col].adjacentMines === 0) {
                floodFill(row, col);
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
});
