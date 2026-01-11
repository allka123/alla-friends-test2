// ===== ДОСТУП =====
const LOGIN = "alla_puzzle";
const PASS  = "lovekabachok";

// ===== НАСТРОЙКИ =====
const SIZE = 800;
const ROWS = 5;
const COLS = 10;
const TOTAL = ROWS * COLS;
const MISSING_INDEX = Math.floor(Math.random() * TOTAL);

const puzzle = document.getElementById("puzzle");
let fixedCount = 0;
let pieces = [];

// ===== АВТОРИЗАЦИЯ =====
function auth() {
  if (
    loginInput.value === LOGIN &&
    passInput.value === PASS
  ) {
    login.classList.add("hidden");
    game.classList.remove("hidden");
    initPuzzle();
  } else {
    error.innerText = "❌ Алла не доверяет тебе";
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initPuzzle() {
  puzzle.innerHTML = "";
  pieces = [];
  fixedCount = 0;

  const pw = SIZE / COLS;
  const ph = SIZE / ROWS;

  let index = 0;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {

      if (index === MISSING_INDEX) {
        index++;
        continue; // ❌ потерянный кусок
      }

      const piece = createPiece(x, y, index, pw, ph);
      puzzle.appendChild(piece);
      pieces.push(piece);

      index++;
    }
  }

  startChaos();
  startTeleportation();
}

// ===== СОЗДАНИЕ КУСКА =====
function createPiece(x, y, index, pw, ph) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  svg.setAttribute("width", pw);
  svg.setAttribute("height", ph);
  svg.classList.add("piece");

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", crazyPath(pw, ph));

  const clip = document.createElementNS(svgNS, "clipPath");
  clip.setAttribute("id", "clip" + index);
  clip.appendChild(path);

  const defs = document.createElementNS(svgNS, "defs");
  defs.appendChild(clip);
  svg.appendChild(defs);

  const img = document.createElementNS(svgNS, "image");
  img.setAttribute("href", "alla.png");
  img.setAttribute("width", SIZE);
  img.setAttribute("height", SIZE);
  img.setAttribute("x", -x * pw);
  img.setAttribute("y", -y * ph);
  img.setAttribute("clip-path", `url(#clip${index})`);

  svg.appendChild(img);

  svg.style.left = Math.random() * (SIZE - pw) + "px";
  svg.style.top  = Math.random() * (SIZE - ph) + "px";

  svg.correctX = x * pw;
  svg.correctY = y * ph;
  svg.fixed = false;

  enableDrag(svg);

  return svg;
}

// ===== ФОРМА =====
function crazyPath(w, h) {
  const r = Math.random() * 15 + 10;
  return `
    M 0 ${r}
    Q ${w/2} ${-r} ${w} ${r}
    Q ${w+r} ${h/2} ${w} ${h-r}
    Q ${w/2} ${h+r} 0 ${h-r}
    Q ${-r} ${h/2} 0 ${r}
    Z
  `;
}

// ===== ПЕРЕТАСКИВАНИЕ =====
function enableDrag(el) {
  let offsetX, offsetY;

  el.onmousedown = e => {
    if (el.fixed) return;

    offsetX = e.offsetX;
    offsetY = e.offsetY;

    document.onmousemove = ev => {
      el.style.left = ev.pageX - puzzle.offsetLeft - offsetX + "px";
      el.style.top  = ev.pageY - puzzle.offsetTop - offsetY + "px";
    };

    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;

      checkFix(el);
    };
  };
}

function checkFix(el) {
  const dx = Math.abs(parseInt(el.style.left) - el.correctX);
  const dy = Math.abs(parseInt(el.style.top) - el.correctY);

  if (dx < 15 && dy < 15) {
    el.style.left = el.correctX + "px";
    el.style.top  = el.correctY + "px";
    el.fixed = true;
    fixedCount++;

    if (fixedCount === pieces.length) {
      endGame();
    }
  }
}

// ===== ХАОС (НЕЗАФИКСИРОВАННЫЕ) =====
function startChaos() {
  setInterval(() => {
    pieces.forEach(p => {
      if (p.fixed) return;
      if (Math.random() < 0.02) {
        const r = Math.random();
        if (r < 0.25) {
          p.style.transform = "scale(1.4)";
          setTimeout(() => p.style.transform = "", 10000);
        } else if (r < 0.5) {
          p.style.opacity = "0";
          setTimeout(() => p.style.opacity = "1", 10000);
        } else {
          p.classList.add("blackout");
          setTimeout(() => p.classList.remove("blackout"), 10000);
        }
      }
    });
  }, 3000);
}

// ===== РЕДКАЯ ТЕЛЕПОРТАЦИЯ ЗАФИКСИРОВАННЫХ =====
function startTeleportation() {
  setInterval(() => {
    const fixed = pieces.filter(p => p.fixed);
    if (fixed.length < 3) return;
    if (Math.random() < 0.05) {
      const p = fixed[Math.floor(Math.random() * fixed.length)];
      p.fixed = false;
      fixedCount--;
      p.style.left = Math.random() * 600 + "px";
      p.style.top  = Math.random() * 600 + "px";
    }
  }, 10000);
}

// ===== ФИНАЛ =====
function endGame() {
  game.classList.add("hidden");
  final.classList.remove("hidden");
}
