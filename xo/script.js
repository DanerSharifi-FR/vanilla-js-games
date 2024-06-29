class Game {
    constructor(gameContainer, cases, startBtn, stopBtn) {
        this.gameContainer = gameContainer;
        this.cases = cases;
        this.startBtn = startBtn;
        this.stopBtn = stopBtn;
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        this.strategicPositions = [0, 2, 6, 8];
        this.mode = document.querySelector('input[name="mode"]:checked').value;
        this.resetGame();

        this.startBtn.addEventListener('click', this.startGame.bind(this));
        this.stopBtn.addEventListener('click', this.stopGame.bind(this));
    }

    startGame() {
        this.resetGame();
        this.toggleGameState(true);
        this.enableCaseClicks();
    }

    stopGame() {
        this.toggleGameState(false);
        this.disableCaseClicks();
    }

    resetGame() {
        this.userPositions = { 'user1': [], 'user2': [] };
        this.availableCases = Array.from(Array(9).keys());
        this.cases.forEach(cell => cell.innerHTML = '');
    }

    toggleGameState(isStarted) {
        this.gameContainer.classList.toggle('gameStarted', isStarted);
        this.gameContainer.classList.toggle('gameStopped', !isStarted);
    }

    enableCaseClicks() {
        this.cases.forEach(cell => cell.addEventListener('click', this.handleCaseClick.bind(this)));
    }

    disableCaseClicks() {
        this.cases.forEach(cell => cell.removeEventListener('click', this.handleCaseClick.bind(this)));
    }

    handleCaseClick(event) {
        const cell = event.target;
        if (cell.innerHTML === '' && this.gameContainer.classList.contains('gameStarted')) {
            this.makeMove(cell, 'X', 'user1');
            if (this.mode === 'computer') this.computerMove();

            const winner = this.checkWinner();
            if (winner) {
                this.endGame(`${winner} wins!`);
            } else if (this.checkDraw()) {
                this.endGame('Draw!');
            }
        }
    }

    makeMove(cell, symbol, user) {
        cell.innerHTML = symbol;
        const cellIndex = parseInt(cell.getAttribute('data-case'));
        this.userPositions[user].push(cellIndex);
        this.availableCases = this.availableCases.filter(index => index !== cellIndex);
    }

    computerMove() {
        if (this.attemptComputerWin() || this.preventUser1Win() || this.makeStrategicMove() || this.makeRandomMove()) return;
    }

    attemptWinOrBlock(user) {
        for (const combination of this.winningCombinations) {
            const [userCount, emptyCount, position] = this.getCombinationCounts(combination, user);
            if (userCount === 2 && emptyCount === 1) {
                this.makeMove(this.cases[position], 'O', 'user2');
                return true;
            }
        }
        return false;
    }

    attemptComputerWin() {
        return this.attemptWinOrBlock('user2');
    }

    preventUser1Win() {
        return this.attemptWinOrBlock('user1');
    }

    getCombinationCounts(combination, user) {
        let userCount = 0;
        let emptyCount = 0;
        let emptyPosition = -1;

        combination.forEach(pos => {
            if (this.userPositions[user].includes(pos)) userCount++;
            else if (this.availableCases.includes(pos)) {
                emptyCount++;
                emptyPosition = pos;
            }
        });

        return [userCount, emptyCount, emptyPosition];
    }

    makeStrategicMove() {
        if (this.userPositions.user1.length > 2) return false;

        if (this.userPositions.user1.length === 2) {
            const availableCenter = [1, 3, 5, 7].find(cc => this.availableCases.includes(cc));
            if (availableCenter !== undefined) {
                this.makeMove(this.cases[availableCenter], 'O', 'user2');
                return true;
            }
        }

        const attempts = this.strategicPositions.filter(pos => this.userPositions.user1.includes(pos));
        if (attempts.length > 0) {
            const middleCase = 4;
            if (this.availableCases.includes(middleCase)) {
                this.makeMove(this.cases[middleCase], 'O', 'user2');
                return true;
            }
        }
        return false;
    }

    makeRandomMove() {
        const randomIndex = Math.floor(Math.random() * this.availableCases.length);
        const randomCase = this.availableCases[randomIndex];
        this.makeMove(this.cases[randomCase], 'O', 'user2');
        return true;
    }

    checkWinner() {
        for (const combination of this.winningCombinations) {
            if (combination.every(pos => this.userPositions.user1.includes(pos))) return 'user1';
            if (combination.every(pos => this.userPositions.user2.includes(pos))) return 'user2';
        }
        return null;
    }

    checkDraw() {
        return this.availableCases.length === 0;
    }

    endGame(message) {
        this.stopGame();
        this.startBtn.textContent = 'Play again';
        setTimeout(() => alert(message), 1000);
    }
}

// Initializing the game
const gameContainer = document.querySelector('#gameContainer');
const cases = document.querySelectorAll('.case');
const startBtn = document.querySelector('#start');
const stopBtn = document.querySelector('#stop');

const game = new Game(gameContainer, cases, startBtn, stopBtn);
