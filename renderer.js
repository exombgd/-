let isPaused = true;
let player1Score = 0;
let player2Score = 0;
const SPEED = 3;
const EDGE_THRESHOLD = 150;
const MAP_PAN_SPEED = 15;

let map;
const balls = {
    ball1: {
        element: document.getElementById('ball1'),
        x: 0,
        y: 0,
        keys: { w: false, a: false, s: false, d: false }
    },
    ball2: {
        element: document.getElementById('ball2'),
        x: 0,
        y: 0,
        keys: { up: false, left: false, down: false, right: false }
    }
};

// 初始化地图
function initMap() {
    map = new AMap.Map('map-container', {
        zoom: 15,
        center: [116.397428, 39.90923],
        viewMode: '3D',
        features: ['bg', 'road'],
        showIndoorMap: false,
        autoFitView: true
    });

    map.on('complete', () => {
        resetRound();
        document.getElementById('map-container').style.opacity = 1;
    });
}

// 重置回合
function resetRound() {
    balls.ball1.x = window.innerWidth/2 - 100;
    balls.ball1.y = window.innerHeight/2;
    balls.ball2.x = window.innerWidth/2 + 100;
    balls.ball2.y = window.innerHeight/2;
    
    balls.ball1.element.style.transform = `translate(${balls.ball1.x}px, ${balls.ball1.y}px)`;
    balls.ball2.element.style.transform = `translate(${balls.ball2.x}px, ${balls.ball2.y}px)`;
    
    document.getElementById('score1').textContent = player1Score;
    document.getElementById('score2').textContent = player2Score;
}

function updatePositions() {
    if(isPaused) return;
    
    // 分别更新两个小球的位置
    updateBall(balls.ball1);
    updateBall(balls.ball2);

    checkCollision();
}

// 独立的小球更新函数
function updateBall(ball) {
    let dx = 0, dy = 0;
    
    // 仅处理当前小球的按键状态
    if(ball === balls.ball1) {
        if(ball.keys.w) dy -= SPEED;
        if(ball.keys.s) dy += SPEED;
        if(ball.keys.a) dx -= SPEED;
        if(ball.keys.d) dx += SPEED;
    } else {
        if(ball.keys.up) dy -= SPEED;
        if(ball.keys.down) dy += SPEED;
        if(ball.keys.left) dx -= SPEED;
        if(ball.keys.right) dx += SPEED;
    }

    const newX = Math.max(20, Math.min(window.innerWidth-20, ball.x + dx));
    const newY = Math.max(20, Math.min(window.innerHeight-20, ball.y + dy));
    
    ball.x = newX;
    ball.y = newY;
    ball.element.style.transform = `translate(${newX}px, ${newY}px)`;

    // 地图滚动逻辑
    if (dx !== 0 || dy !== 0) {
        let panX = 0, panY = 0;
        
        // 水平方向：只有朝边界方向移动时才滚动
        if (newX > window.innerWidth - EDGE_THRESHOLD && dx > 0) {
            panX = -MAP_PAN_SPEED;
        } else if (newX < EDGE_THRESHOLD && dx < 0) {
            panX = MAP_PAN_SPEED;
        }
        
        // 垂直方向：只有朝边界方向移动时才滚动
        if (newY > window.innerHeight - EDGE_THRESHOLD && dy > 0) {
            panY = -MAP_PAN_SPEED;
        } else if (newY < EDGE_THRESHOLD && dy < 0) {
            panY = MAP_PAN_SPEED;
        }

        if(panX !== 0 || panY !== 0) {
            map.panBy(panX, panY);
        }
    }
}

// 碰撞检测（保持不变）
function checkCollision() {
    const dx = balls.ball1.x - balls.ball2.x;
    const dy = balls.ball1.y - balls.ball2.y;
    const distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 30) {
        if(balls.ball1.x > window.innerWidth/2) {
            player1Score++;
        } else {
            player2Score++;
        }
        
        isPaused = true;
        document.body.style.filter = 'blur(2px)';
        const centerScore = document.getElementById('center-score');
        centerScore.textContent = `${player1Score} - ${player2Score}`;
        
        centerScore.style.display = 'block';
        resetRound();
    }
}

// 修复的按键事件监听
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        // Player1 (WASD)
        case 'KeyW': balls.ball1.keys.w = true; break;
        case 'KeyS': balls.ball1.keys.s = true; break;
        case 'KeyA': balls.ball1.keys.a = true; break;
        case 'KeyD': balls.ball1.keys.d = true; break;
        
        // Player2 (方向键)
        case 'ArrowUp': balls.ball2.keys.up = true; break;
        case 'ArrowDown': balls.ball2.keys.down = true; break;
        case 'ArrowLeft': balls.ball2.keys.left = true; break;
        case 'ArrowRight': balls.ball2.keys.right = true; break;
        
        case 'Space':
            e.preventDefault();
            if(isPaused) {
                isPaused = false;
                document.body.style.filter = 'none';
                document.getElementById('center-score').style.display = 'none';
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'KeyW': balls.ball1.keys.w = false; break;
        case 'KeyS': balls.ball1.keys.s = false; break;
        case 'KeyA': balls.ball1.keys.a = false; break;
        case 'KeyD': balls.ball1.keys.d = false; break;
        case 'ArrowUp': balls.ball2.keys.up = false; break;
        case 'ArrowDown': balls.ball2.keys.down = false; break;
        case 'ArrowLeft': balls.ball2.keys.left = false; break;
        case 'ArrowRight': balls.ball2.keys.right = false; break;
    }
});

// 游戏循环
function gameLoop() {
    updatePositions();
    requestAnimationFrame(gameLoop);
}

// 初始化
window.onload = () => {
    initMap();
    const checkReady = () => {
        if(document.getElementById('map-container').style.opacity === '1') {
            gameLoop();
        } else {
            setTimeout(checkReady, 100);
        }
    };
    checkReady();
};