const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const canvas2 = document.getElementById('next');
const context2 = canvas2.getContext('2d');
context.scale(20, 20);

const scoreElement = document.getElementById('score');
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === 'O') {
    return [
      [2, 2],
      [2, 2],
    ];
  } else if (type === 'L') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ];
  } else if (type === 'J') {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ];
  } else if (type === 'I') {
    return [
      [0, 0, 0, 0],
      [5, 5, 5, 5],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x + 1, y + offset.y, 1, 1);
      }
    });
  });
}

function drawMatrix2(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context2.fillStyle = colors[value];
        context2.fillRect((x + offset.x) * 10, (y + offset.y + 1) * 10, 10, 10);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    return true;
  }
  dropCounter = 0;
  return false;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

let pieces = 'TJLOSZI';
let next = "";
function playerReset() {
  let target_piece = pieces[Math.floor(Math.random() * pieces.length)];
  player.matrix = createPiece(next);
  pieces = pieces.replace(target_piece,"");
  next = target_piece;
  document.getElementById("tmp").innerText = "レベル：" + Math.floor(player.score / 100 + 1);
  if(pieces == "") pieces = 'TJLOSZI';
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) -
                 Math.floor(player.matrix[0].length / 2);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    alert("ゲームオーバー！");
    pieces = 'TJLOSZI';
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += 10;
  }
}

function draw() {
  context.fillStyle = '#000';
  context2.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context2.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ccc';
  context.fillRect(0, 0, 1, canvas.height);
  context.fillRect(11, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x:0, y:0});
  drawMatrix2(createPiece(next), {x:0, y:0});
  drawMatrix(player.matrix, player.pos);
  context.strokeStyle = '#888';
  context.lineWidth = 0.1;

  for(let i = 0;i < arena[0].length * 2;i++){
    context.beginPath();
    context.moveTo(10 * i / arena[0].length, 0);
    context.lineTo(10 * i / arena[0].length, 20);
    context.stroke();
  }
  for(let i = 0;i < arena.length * 2;i++){
    context.beginPath();
    context.moveTo(0, 20 * i / arena.length);
    context.lineTo(20, 20 * i / arena.length);
    context.stroke();
  }
}

function updateScore() {
  scoreElement.innerText = player.score;
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval / Math.floor(player.score / 100 + 1)) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}
// 'TJLOSZI';
const colors = [
  null,
  '#FF00FF',
  '#FFFF00',
  '#0000FF',
  '#FF8000',
  '#00FFFF',
  '#00FF00',
  '#FF0000'
];

const arena = createMatrix(10, 20);

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0
};

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.key === 'ArrowUp') {
    while(!playerDrop());
  }else if (event.key === 'q') {
    playerRotate(-1);
  } else if (event.key === 'w') {
    playerRotate(1);
  }
});
next = pieces[Math.floor(Math.random() * pieces.length)];
player.matrix = createPiece(next);
pieces = pieces.replace(next,"");
next = pieces[Math.floor(Math.random() * pieces.length)];
pieces = pieces.replace(next,"");
playerReset();
updateScore();
update();
