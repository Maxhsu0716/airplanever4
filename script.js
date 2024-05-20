let planeRow = 9;
let planeCol = 2;
let verticalRockInterval;
let horizontalRockInterval;
let verticalRocks = [];
let horizontalRocks = [];
let gameStarted = false;
let batteryCount = 5; // 電池格子數量增加至5
let timerInterval; // 計時器間隔
let elapsedTime = 0; // 經過的時間，以毫秒作單位
let scoreboard = [];
let rockSpeed = 250; // 落石初始速度，單位為毫秒
let speedIncreaseInterval; // 控制速度增加的間隔
let batteryRecoverInterval; // 控制電池恢復的間隔

// 生成網格的函數
function generateGrid(rows, cols) {
    const table = document.getElementById('grid');
    table.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            // 在第10行第三列添加飛機
            if (i === planeRow && j === planeCol) {
                const plane = document.createElement('div');
                plane.classList.add('plane');
                td.appendChild(plane);
            }
            // 在特定位置添加落石
            verticalRocks.concat(horizontalRocks).forEach(rock => {
                if (i === rock.row && j === rock.col) {
                    const rockElement = document.createElement('div');
                    rockElement.classList.add('rock');
                    td.appendChild(rockElement);
                }
            });
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

function addToScoreboard(time) {
    scoreboard.push(time);
    scoreboard.sort((a, b) => b - a); // 降序排序
    if (scoreboard.length > 3) {
        scoreboard.pop(); // 如果超過3個成績，則刪除最小成績
    }
    updateScoreboard(); // 更新計分板顯示
}

// 更新計分板
function updateScoreboard() {
    const scoreboardList = document.getElementById('scoreboard-list');
    scoreboardList.innerHTML = ''; // 清空計分板

    scoreboard.forEach((time, index) => {
        const minutes = String(Math.floor(time / 60000)).padStart(2, '0');
        const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, '0');
        const milliseconds = String(time % 1000).padStart(3, '0');
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${minutes}:${seconds}:${milliseconds}`;
        scoreboardList.appendChild(listItem);
    });
}

// 顯示GAMEOVER
function showGameOverMessage() {
    const gameOverBox = document.createElement('div');
    gameOverBox.classList.add('game-over-box');

    const gameOverText = document.createElement('div');
    gameOverText.textContent = 'GAME OVER';
    gameOverText.classList.add('game-over-text');
    
    gameOverBox.appendChild(gameOverText);

    const retryButton = document.createElement('button');
    retryButton.textContent = 'RETRY';
    retryButton.addEventListener('click', function() {
        // 重置遊戲
        resetGame();
    });
    gameOverBox.appendChild(retryButton);
    
    document.body.appendChild(gameOverBox);

    // 停止落石移動
    clearInterval(verticalRockInterval);
    clearInterval(horizontalRockInterval);
    // 停止電池恢復
    clearInterval(batteryRecoverInterval);
    // 停止計時器
    clearInterval(timerInterval);
    // 停止速度增加
    clearInterval(speedIncreaseInterval);
    // 移除按鍵事件監聽器
    document.removeEventListener('keydown', handleKeyPress);
}

function resetGame() {
    // 將遊戲時間添加到計分板中
    if (gameStarted) {
        addToScoreboard(elapsedTime); // 將遊戲時間以毫秒為單位添加到計分板中
    }

    // 重置遊戲狀態
    gameStarted = false;
    batteryCount = 5;
    elapsedTime = 0; // 重置經過的時間
    verticalRocks = [];
    horizontalRocks = [];
    planeRow = 9;
    planeCol = 2;
    rockSpeed = 250; // 重置落石速度
    clearInterval(verticalRockInterval);
    clearInterval(horizontalRockInterval);
    clearInterval(batteryRecoverInterval);
    clearInterval(timerInterval);
    clearInterval(speedIncreaseInterval);

    // 重置計時器顯示
    updateTimer(); // 立即調用 updateTimer 來更新顯示

    // 重置計分板顯示
    updateScoreboard();

    // 重置電池顏色
    const batteryCells = document.querySelectorAll('#battery .cell');
    batteryCells.forEach(cell => cell.classList.remove('gray')); // 移除所有电池格子的灰色状态

    // 重新生成網格
    generateGrid(10, 5);

    // 顯示PLAY按鈕
	const playButton = document.getElementById('play-button');
    
	// 顯示彈出視窗
    document.getElementById('popup').style.display = 'block';

    // 移除遊戲結束消息
    const gameOverBox = document.querySelector('.game-over-box');
    if (gameOverBox) {
        gameOverBox.remove();
    }

    // 停止落石移動
    clearInterval(verticalRockInterval);
    clearInterval(horizontalRockInterval);
    // 停止電池恢復
    clearInterval(batteryRecoverInterval);
    // 停止計時器
    clearInterval(timerInterval);
    // 停止速度增加
    clearInterval(speedIncreaseInterval);

    // 重新添加按鍵事件監聽器
    document.addEventListener('keydown', handleKeyPress);
}




// 當網頁加載完成後執行
window.onload = function() {
    generateGrid(10, 5);
    document.addEventListener('keydown', handleKeyPress);
    generateControlButtons();

    // 初始化計時器顯示
    updateTimer(); // 在游戏开始前确保计时器显示为 00:00:000

    // 設置PLAY的點擊事件
    const playButton = document.getElementById('play-button');
    playButton.addEventListener('click', function() {
        gameStarted = true;
        playButton.style.display = 'none';
        generateVerticalRocks(); // 生成隨機數量的縱向落石
        generateHorizontalRocks(); // 生成隨機數量的橫向落石
        verticalRockInterval = setInterval(moveVerticalRock, rockSpeed); // 設置縱向落石初始速度
        horizontalRockInterval = setInterval(moveHorizontalRock, rockSpeed); // 設置橫向落石初始速度

        // 每隔3秒回復一格電力
        batteryRecoverInterval = setInterval(() => {
            if (batteryCount < 5) {
                const batteryCells = document.querySelectorAll('#battery .cell');
                batteryCells[batteryCount].classList.remove('gray');
                batteryCount++;
                // 回復WASD按鍵事件監聽器
                if (batteryCount > 0) {
                    document.addEventListener('keydown', handleKeyPress);
                }
            }
        }, 3000); // 每隔3000毫秒（3秒）恢復一格電力

        // 啟動計時器
        timerInterval = setInterval(() => {
            elapsedTime += 10;
            updateTimer();
        }, 10);

        // 每30秒增加一次落石速度
        speedIncreaseInterval = setInterval(increaseRockSpeed, 30000);
    });
};

// 更新飛機和落石位置
function updateGrid() {
    generateGrid(10, 5);
}

// 檢查碰撞
function checkCollision() {
    verticalRocks.concat(horizontalRocks).forEach(rock => {
        if (planeRow === rock.row && planeCol === rock.col) {
            showGameOverMessage();
        }
    });
}

// 在按下WASD时播放飞机音效
function playPlaneSound() {
    const planeSound = document.getElementById('planeSound');
    planeSound.currentTime = 0; // 重置音效播放时间，以确保按下连续快速按键时也能正常播放
    planeSound.play();
}

// 處理按鍵按下事件
function handleKeyPress(event) {
    if (!gameStarted) return;
    switch (event.key) {
        case 'w':
        case 'W':
            if (planeRow > 0) planeRow--;
            playPlaneSound(); // 播放飞机音效
            break;
        case 'a':
        case 'A':
            if (planeCol > 0) planeCol--;
            playPlaneSound(); // 播放飞机音效
            break;
        case 's':
        case 'S':
            if (planeRow < 9) planeRow++;
            playPlaneSound(); // 播放飞机音效
            break;
        case 'd':
        case 'D':
            if (planeCol < 4) planeCol++;
            playPlaneSound(); // 播放飞机音效
            break;
    }

    // 減少電池格子計數
    if (batteryCount > 0) {
        batteryCount--;
        const batteryCells = document.querySelectorAll('#battery .cell');
        batteryCells[batteryCount].classList.add('gray');
        if (batteryCount === 0) {
            // 如果所有電池格子都變灰，禁用 WASD 按鍵
            document.removeEventListener('keydown', handleKeyPress);
        }
    }

    updateGrid();
    checkCollision(); // 每次按鍵後檢查碰撞
}



// 縱向落石移動邏輯
function moveVerticalRock() {
    verticalRocks.forEach(rock => {
        if (rock.row < 9) {
            rock.row++;
        } else {
            rock.row = 0;
            rock.col = Math.floor(Math.random() * 5);
        }
    });
    updateGrid();
    checkCollision(); // 每次移動石頭後檢查碰撞
}

// 橫向落石移動邏輯
function moveHorizontalRock() {
    horizontalRocks.forEach(rock => {
        if (rock.col > 0) {
            rock.col--;
        } else {
            rock.col = 4;
            rock.row = Math.floor(Math.random() * 10);
        }
    });
    updateGrid();
    checkCollision(); // 每次移動石頭後檢查碰撞
}

// 生成隨機數量的縱向落石
function generateVerticalRocks() {
    const rockCount = Math.floor(Math.random() * 4) + 2; // 生成2到5个縱向落石
    verticalRocks = [];
    for (let i = 0; i < rockCount; i++) {
        const rock = { row: 0, col: Math.floor(Math.random() * 5), direction: 'down' };
        verticalRocks.push(rock);
    }
}

// 生成隨機數量的橫向落石
function generateHorizontalRocks() {
    const rockCount = Math.floor(Math.random() * 4) + 2; // 生成2到5个橫向落石
    horizontalRocks = [];
    for (let i = 0; i < rockCount; i++) {
        const rock = { row: Math.floor(Math.random() * 10), col: 4, direction: 'left' };
        horizontalRocks.push(rock);
    }
}

// 生成 WASD 
function generateControlButtons() {
    const controlButtons = document.querySelector('.control-buttons');

    controlButtons.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            handleKeyPress({ key: event.target.textContent });
        }
    });
}

// 更新計時器顯示
function updateTimer() {
    const minutes = String(Math.floor(elapsedTime / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((elapsedTime % 60000) / 1000)).padStart(2, '0');
    const milliseconds = String(elapsedTime % 1000).padStart(3, '0');
    document.getElementById('timer').textContent = `${minutes}:${seconds}:${milliseconds}`;
}

// 增加落石速度
function increaseRockSpeed() {
    if (rockSpeed > 50) {
        rockSpeed -= 50; // 每30秒將速度提高50毫秒
        clearInterval(verticalRockInterval);
        clearInterval(horizontalRockInterval);
        verticalRockInterval = setInterval(moveVerticalRock, rockSpeed);
        horizontalRockInterval = setInterval(moveHorizontalRock, rockSpeed);
    }
}

// 當網頁加載完成後執行
window.onload = function() {
    generateGrid(10, 5);
    document.addEventListener('keydown', handleKeyPress);
    generateControlButtons();

    // 初始化計時器顯示
    updateTimer(); // 在游戏开始前确保计时器显示为 00:00:000

    // 顯示彈出視窗
    document.getElementById('popup').style.display = 'block';

    // 設置PLAY的點擊事件
    const playButton = document.getElementById('play-button');
    playButton.addEventListener('click', function() {
        gameStarted = true;
        document.getElementById('popup').style.display = 'none'; // 隱藏彈出視窗
        generateVerticalRocks(); // 生成隨機數量的縱向落石
        generateHorizontalRocks(); // 生成隨機數量的橫向落石
        verticalRockInterval = setInterval(moveVerticalRock, rockSpeed); // 設置縱向落石初始速度
        horizontalRockInterval = setInterval(moveHorizontalRock, rockSpeed); // 設置橫向落石初始速度

        // 每隔3秒回復一格電力
        batteryRecoverInterval = setInterval(() => {
            if (batteryCount < 5) {
                const batteryCells = document.querySelectorAll('#battery .cell');
                batteryCells[batteryCount].classList.remove('gray');
                batteryCount++;
                // 回復WASD按鍵事件監聽器
                if (batteryCount > 0) {
                    document.addEventListener('keydown', handleKeyPress);
                }
            }
        }, 3000); // 每隔3000毫秒（3秒）恢復一格電力

        // 啟動計時器
        timerInterval = setInterval(() => {
            elapsedTime += 10;
            updateTimer();
        }, 10);

        // 每30秒增加一次落石速度
        speedIncreaseInterval = setInterval(increaseRockSpeed, 30000);
    });
};