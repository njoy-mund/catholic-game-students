const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('scoreVal');
const comboEl = document.getElementById('comboVal');
const levelEl = document.getElementById('levelVal');
const levelNameEl = document.getElementById('levelName');
const livesEl = document.getElementById('livesVal');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const notifEl = document.getElementById('notification');

let gameRunning = false;
let score = 0;
let combo = 1;
let level = 1;
let lives = 3;
let animationId;

const levelNames = [
    "The Cross",
    "12 Apostles",
    "Armor of God",
    "Walls of Jericho",
    "Heavenly Gates"
];

const paddle = {
    width: 120,
    baseWidth: 120,
    height: 16,
    x: canvas.width / 2 - 60,
    y: canvas.height - 35,
    speed: 9,
    dx: 0,
    maryTimer: 0,
    laserTimer: 0
};

let balls = [];
let bricks = [];
let particles = [];
let angels = [];
let powerUps = [];
let lasers = [];

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === ' ' && gameRunning) launchOrShoot();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = mouseX - paddle.width / 2;
    clampPaddle();
});

canvas.addEventListener('click', () => {
    if (gameRunning) launchOrShoot();
});

function clampPaddle() {
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

function showNotification(text, color = '#ffd700') {
    notifEl.textContent = text;
    notifEl.style.color = color;
    notifEl.style.textShadow = `0 0 15px ${color}`;
    notifEl.style.opacity = 1;
    clearTimeout(notifEl.timeout);
    notifEl.timeout = setTimeout(() => {
        notifEl.style.opacity = 0;
    }, 2500);
}

function createBall(x, y, speedMult = 1, attached = false) {
    const baseSpeed = 5.5 + (level * 0.3);
    const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
    return {
        x: x,
        y: y,
        radius: 8,
        speed: baseSpeed * speedMult,
        dx: Math.cos(angle) * baseSpeed * speedMult,
        dy: Math.sin(angle) * baseSpeed * speedMult,
        attached: attached,
        piercing: false,
        pierceTimer: 0
    };
}

function launchOrShoot() {
    let launched = false;
    balls.forEach(b => {
        if (b.attached) {
            b.attached = false;
            launched = true;
        }
    });
    if (!launched && paddle.laserTimer > 0) {
        lasers.push({ x: paddle.x + 15, y: paddle.y, dy: -10 });
        lasers.push({ x: paddle.x + paddle.width - 15, y: paddle.y, dy: -10 });
    }
}

function buildLevel(lvl) {
    bricks = [];
    const cols = 10;
    const rows = Math.min(5 + Math.floor(lvl / 2), 8);
    const padding = 8;
    const offsetTop = 60;
    const offsetLeft = 35;
    const brickWidth = (canvas.width - offsetLeft * 2 - padding * (cols - 1)) / cols;
    const brickHeight = 26;

    let grid = [];
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            let active = true;
            if (lvl === 1) {
                active = (c === 4 || c === 5 || r === 2);
            } else if (lvl === 2) {
                active = (c % 2 === 0 || r === 0 || r === rows - 1);
            }
            grid[r][c] = active ? 'normal' : null;
        }
    }

    let availableCoords = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c]) availableCoords.push({ r, c });
        }
    }

    availableCoords.sort(() => Math.random() - 0.5);

    if (availableCoords.length > 0) {
        const yCoord = availableCoords.pop();
        grid[yCoord.r][yCoord.c] = 'yahweh';
    }
    if (availableCoords.length > 0) {
        const jCoord = availableCoords.pop();
        grid[jCoord.r][jCoord.c] = 'jesus';
    }
    if (availableCoords.length > 0) {
        const mCoord = availableCoords.pop();
        grid[mCoord.r][mCoord.c] = 'mary';
    }
    if (availableCoords.length > 0) {
        const aCoord = availableCoords.pop();
        grid[aCoord.r][aCoord.c] = 'angel';
    }
    if (lvl >= 2 && availableCoords.length > 0) {
        const aCoord2 = availableCoords.pop();
        grid[aCoord2.r][aCoord2.c] = 'angel';
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let type = grid[r][c];
            if (!type) continue;

            if (type === 'normal' && lvl >= 2 && Math.random() < 0.25) {
                type = 'armor';
            }

            let hp = 1;
            let color = '#3b82f6';
            let label = '';

            if (type === 'yahweh') {
                hp = 3;
                color = '#ffd700';
                label = 'YAHWEH';
            } else if (type === 'jesus') {
                hp = 2;
                color = '#ff3333';
                label = 'JESUS';
            } else if (type === 'mary') {
                hp = 1;
                color = '#38bdf8';
                label = 'MARY';
            } else if (type === 'angel') {
                hp = 1;
                color = '#ffffff';
                label = 'ANGEL';
            } else if (type === 'armor') {
                hp = 2;
                color = '#10b981';
                label = 'ARMOR';
            } else {
                const palette = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'];
                color = palette[r % palette.length];
            }

            bricks.push({
                x: offsetLeft + c * (brickWidth + padding),
                y: offsetTop + r * (brickHeight + padding),
                width: brickWidth,
                height: brickHeight,
                type: type,
                hp: hp,
                maxHp: hp,
                color: color,
                label: label
            });
        }
    }

    levelEl.textContent = lvl;
    levelNameEl.textContent = levelNames[(lvl - 1) % levelNames.length];
}
function createExplosion(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            radius: Math.random() * 3 + 1.5,
            color: color,
            alpha: 1
        });
    }
}

function triggerSpecialPower(brick) {
    const cx = brick.x + brick.width / 2;
    const cy = brick.y + brick.height / 2;

    if (brick.type === 'yahweh') {
        showNotification("YAHWEH'S GLORY! ALL BLOCKS CLEARED!", "#ffd700");
        createExplosion(canvas.width / 2, canvas.height / 2, '#ffd700', 80);
        bricks.forEach(b => {
            score += 50 * combo;
            createExplosion(b.x + b.width / 2, b.y + b.height / 2, b.color, 6);
        });
        bricks = [];
    } 
    else if (brick.type === 'jesus') {
        showNotification("GRACE OF JESUS! HALF OF BLOCKS BURST!", "#ff4d4d");
        createExplosion(cx, cy, '#ff4d4d', 40);
        let remaining = bricks.filter(b => b !== brick);
        remaining.sort(() => Math.random() - 0.5);
        let toDestroyCount = Math.ceil(remaining.length / 2);
        let destroyedSet = new Set(remaining.slice(0, toDestroyCount));
        
        bricks = bricks.filter(b => {
            if (destroyedSet.has(b)) {
                score += 40 * combo;
                createExplosion(b.x + b.width / 2, b.y + b.height / 2, '#ff4d4d', 10);
                return false;
            }
            return true;
        });
    } 
    else if (brick.type === 'mary') {
        showNotification("MARY'S PROTECTION! FULL SHIELD & +2 FAST BALLS!", "#38bdf8");
        paddle.width = canvas.width;
        paddle.x = 0;
        paddle.maryTimer = 900;

        balls.push(createBall(cx, cy, 1.35, false));
        balls.push(createBall(cx, cy, 1.35, false));
    } 
    else if (brick.type === 'angel') {
        showNotification("GUARDIAN ANGEL SUMMONED!", "#ffffff");
        angels.push({
            x: cx,
            y: cy,
            dx: 5,
            dy: -5,
            timer: 600,
            wingAngle: 0
        });
    } 
    else {
        if (Math.random() < 0.15) {
            const pTypes = ['fireball', 'lasers'];
            const chosen = pTypes[Math.floor(Math.random() * pTypes.length)];
            powerUps.push({
                x: cx,
                y: cy,
                dy: 3,
                type: chosen
            });
        }
    }
}

function damageBrick(brick, index) {
    brick.hp--;
    score += 20 * combo;
    combo++;
    updateHUD();

    if (brick.hp <= 0) {
        createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 18);
        bricks.splice(index, 1);
        triggerSpecialPower(brick);
    } else {
        createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, '#ffffff', 6);
        if (brick.type === 'yahweh') {
            showNotification(`YAHWEH BLOCK: ${brick.hp} HIT(S) LEFT`, "#ffd700");
        } else if (brick.type === 'jesus') {
            showNotification(`JESUS BLOCK: 1 HIT LEFT`, "#ff4d4d");
        }
    }
}

function updateHUD() {
    scoreEl.textContent = score;
    comboEl.textContent = `x${combo}`;
    livesEl.textContent = lives;
}

function resetBallAndPaddle() {
    paddle.width = paddle.baseWidth;
    paddle.maryTimer = 0;
    paddle.laserTimer = 0;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    balls = [createBall(canvas.width / 2, paddle.y - 12, 1, true)];
    combo = 1;
    updateHUD();
}

function update() {
    if (paddle.maryTimer > 0) {
        paddle.maryTimer--;
        paddle.width = canvas.width;
        paddle.x = 0;
        if (paddle.maryTimer === 0) {
            paddle.width = paddle.baseWidth;
            paddle.x = canvas.width / 2 - paddle.width / 2;
            showNotification("Shield Bar returned to normal size", "#a8c0ff");
        }
    } else {
        if (rightPressed) paddle.x += paddle.speed;
        if (leftPressed) paddle.x -= paddle.speed;
        clampPaddle();
    }

    if (paddle.laserTimer > 0) paddle.laserTimer--;

    for (let i = balls.length - 1; i >= 0; i--) {
        let b = balls[i];
        if (b.pierceTimer > 0) {
            b.pierceTimer--;
            if (b.pierceTimer === 0) b.piercing = false;
        }

        if (b.attached) {
            b.x = paddle.x + paddle.width / 2;
            b.y = paddle.y - b.radius - 2;
            continue;
        }

        b.x += b.dx;
        b.y += b.dy;

        if (b.x - b.radius < 0) {
            b.x = b.radius;
            b.dx = Math.abs(b.dx);
        } else if (b.x + b.radius > canvas.width) {
            b.x = canvas.width - b.radius;
            b.dx = -Math.abs(b.dx);
        }

        if (b.y - b.radius < 0) {
            b.y = b.radius;
            b.dy = Math.abs(b.dy);
        }

        if (
            b.y + b.radius >= paddle.y &&
            b.y - b.radius <= paddle.y + paddle.height &&
            b.x >= paddle.x &&
            b.x <= paddle.x + paddle.width
        ) {
            let hitPoint = (b.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            let angle = hitPoint * (Math.PI / 3);
            let currentSpeed = Math.hypot(b.dx, b.dy);
            b.dx = currentSpeed * Math.sin(angle);
            b.dy = -Math.abs(currentSpeed * Math.cos(angle));
            b.y = paddle.y - b.radius - 1;
            combo = 1;
            updateHUD();
        }

        if (b.y - b.radius > canvas.height) {
            balls.splice(i, 1);
        }

        for (let j = bricks.length - 1; j >= 0; j--) {
            let br = bricks[j];
            if (
                b.x + b.radius > br.x &&
                b.x - b.radius < br.x + br.width &&
                b.y + b.radius > br.y &&
                b.y - b.radius < br.y + br.height
            ) {
                if (!b.piercing) {
                    let overlapLeft = (b.x + b.radius) - br.x;
                    let overlapRight = (br.x + br.width) - (b.x - b.radius);
                    let overlapTop = (b.y + b.radius) - br.y;
                    let overlapBottom = (br.y + br.height) - (b.y - b.radius);
                    let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                        b.dx = -b.dx;
                    } else {
                        b.dy = -b.dy;
                    }
                }
                damageBrick(br, j);
                break;
            }
        }
    }
    if (balls.length === 0) {
        lives--;
        updateHUD();
        if (lives <= 0) {
            gameOver();
            return;
        } else {
            resetBallAndPaddle();
        }
    }

    for (let i = angels.length - 1; i >= 0; i--) {
        let a = angels[i];
        a.timer--;
        a.wingAngle += 0.2;

        if (bricks.length > 0) {
            let target = bricks;
            let tx = target.x + target.width / 2;
            let ty = target.y + target.height / 2;
            let angle = Math.atan2(ty - a.y, tx - a.x);
            a.x += Math.cos(angle) * 7;
            a.y += Math.sin(angle) * 7;

            for (let j = bricks.length - 1; j >= 0; j--) {
                let br = bricks[j];
                if (a.x > br.x && a.x < br.x + br.width && a.y > br.y && a.y < br.y + br.height) {
                    damageBrick(br, j);
                    break;
                }
            }
        }

        if (a.timer <= 0) {
            angels.splice(i, 1);
        }
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        let p = powerUps[i];
        p.y += p.dy;

        if (
            p.y + 12 >= paddle.y &&
            p.y - 12 <= paddle.y + paddle.height &&
            p.x >= paddle.x &&
            p.x <= paddle.x + paddle.width
        ) {
            if (p.type === 'fireball') {
                showNotification("HOLY SPIRIT FIREBALL!", "#ff9900");
                balls.forEach(b => {
                    b.piercing = true;
                    b.pierceTimer = 480;
                });
            } else if (p.type === 'lasers') {
                showNotification("LIGHT BEAMS ACTIVATED!", "#00ffcc");
                paddle.laserTimer = 600;
            }
            powerUps.splice(i, 1);
        } else if (p.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }

    for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        l.y += l.dy;
        let hit = false;
        for (let j = bricks.length - 1; j >= 0; j--) {
            let br = bricks[j];
            if (l.x > br.x && l.x < br.x + br.width && l.y > br.y && l.y < br.y + br.height) {
                damageBrick(br, j);
                hit = true;
                break;
            }
        }
        if (hit || l.y < 0) lasers.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let pt = particles[i];
        pt.x += pt.dx;
        pt.y += pt.dy;
        pt.alpha -= 0.025;
        if (pt.alpha <= 0) particles.splice(i, 1);
    }

    if (bricks.length === 0) {
        level++;
        showNotification(`LEVEL ${level}: ${levelNames[(level - 1) % levelNames.length]}`, "#ffd700");
        buildLevel(level);
        if (balls.length === 0) {
            balls.push(createBall(canvas.width / 2, paddle.y - 12, 1, true));
        } else {
            balls.attached = true;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.05)';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 100);
    ctx.lineTo(canvas.width / 2, 500);
    ctx.moveTo(canvas.width / 2 - 120, 220);
    ctx.lineTo(canvas.width / 2 + 120, 220);
    ctx.stroke();
    ctx.restore();

    bricks.forEach(br => {
        ctx.save();
        ctx.fillStyle = br.color;
        ctx.shadowColor = br.color;
        ctx.shadowBlur = br.type !== 'normal' ? 12 : 4;
        ctx.fillRect(br.x, br.y, br.width, br.height);

        if (br.hp > 1) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(br.x + 1, br.y + 1, br.width - 2, br.height - 2);
        }

        if (br.label) {
            ctx.fillStyle = (br.type === 'yahweh' || br.type === 'angel') ? '#000000' : '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let text = br.hp > 1 ? `${br.label} (${br.hp})` : br.label;
            ctx.fillText(text, br.x + br.width / 2, br.y + br.height / 2);
        }
        ctx.restore();
    });

    ctx.save();
    ctx.fillStyle = paddle.maryTimer > 0 ? '#38bdf8' : '#ffd700';
    ctx.shadowColor = paddle.maryTimer > 0 ? '#38bdf8' : '#ffd700';
    ctx.shadowBlur = 15;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.restore();

    balls.forEach(b => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.piercing ? '#ff9900' : '#ffffff';
        ctx.shadowColor = b.piercing ? '#ff9900' : '#ffd700';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
    });

    angels.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -14, 8, 3, 0, 0, Math.PI * 2);
        ctx.stroke();

        let flap = Math.sin(a.wingAngle) * 6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-20, -15 + flap, -25, 5);
        ctx.quadraticCurveTo(-10, 5, 0, 0);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(20, -15 + flap, 25, 5);
        ctx.quadraticCurveTo(10, 5, 0, 0);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    powerUps.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.type === 'fireball' ? '#ff9900' : '#00ffcc';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type === 'fireball' ? 'F' : 'L', p.x, p.y);
        ctx.restore();
    });

    ctx.fillStyle = '#00ffcc';
    lasers.forEach(l => {
        ctx.fillRect(l.x - 2, l.y, 4, 15);
    });

    particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    overlay.style.display = 'flex';
    overlay.querySelector('h1').textContent = 'MISSION COMPLETE';
    overlay.querySelector('.subtitle').textContent = `Final Score: ${score} | Reached Level ${level}`;
    startBtn.textContent = 'PLAY AGAIN';
}

startBtn.addEventListener('click', () => {
    score = 0;
    combo = 1;
    level = 1;
    lives = 3;
    angels = [];
    powerUps = [];
    lasers = [];
    particles = [];
    updateHUD();
    buildLevel(level);
    resetBallAndPaddle();
    overlay.style.display = 'none';
    gameRunning = true;
    gameLoop();
});
