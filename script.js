// ---- Tabs cho trang algorithms.html ----
const tabButtons = document.querySelectorAll('.tab-row button');
const tabLabels = {
  f2l: 'First Two Layers — ghép 2 tầng đầu',
  oll: 'Orient Last Layer — định hướng tầng cuối',
  pll: 'Permute Last Layer — hoán vị tầng cuối',
};

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    document.getElementById('panel-' + tab).classList.add('active');
    const desc = document.getElementById('tabDesc');
    if (desc) desc.textContent = tabLabels[tab];
  });
});

// ---- Timer luyện tốc độ ----
const timerDisplay = document.getElementById('timerDisplay');
const timerStatus = document.getElementById('timerStatus');
const solveList = document.getElementById('solveList');
const solveCount = document.getElementById('solveCount');
const bestTime = document.getElementById('bestTime');
const scrambleLine = document.getElementById('scrambleLine');
const scrambleMoves = ['R', 'L', 'U', 'D', 'F', 'B'];
let timerStartedAt = 0;
let timerInterval = null;
let isHoldingSpace = false;
let solves = [];

function formatTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const centiseconds = Math.floor((milliseconds % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

function renderTimer() {
  if (timerStartedAt) timerDisplay.textContent = formatTime(Date.now() - timerStartedAt);
}

function startTimer() {
  if (timerStartedAt) return;
  timerStartedAt = Date.now();
  timerStatus.textContent = 'Đang chạy';
  timerDisplay.classList.add('running');
  timerInterval = setInterval(renderTimer, 10);
}

function stopTimer() {
  if (!timerStartedAt) return;
  const elapsed = Date.now() - timerStartedAt;
  clearInterval(timerInterval);
  timerInterval = null;
  timerStartedAt = 0;
  timerDisplay.classList.remove('running');
  timerStatus.textContent = 'Đã ghi nhận';
  solves.unshift(elapsed);
  renderHistory();
}

function renderHistory() {
  solveCount.textContent = `${solves.length} solve`;
  bestTime.textContent = solves.length ? formatTime(Math.min(...solves)) : '--';
  solveList.innerHTML = solves.length ? solves.slice(0, 6).map((time, index) => `<li><span>#${solves.length - index}</span><strong>${formatTime(time)}</strong></li>`).join('') : '<li class="empty-state">Chưa có solve nào</li>';
}

function newScramble() {
  const moves = [];
  while (moves.length < 9) {
    const move = scrambleMoves[Math.floor(Math.random() * scrambleMoves.length)];
    if (moves.length && moves[moves.length - 1][0] === move) continue;
    const suffix = ['', "'", '2'][Math.floor(Math.random() * 3)];
    moves.push(move + suffix);
  }
  scrambleLine.textContent = moves.join(' ');
}

if (timerDisplay) {
  timerDisplay.addEventListener('click', () => (timerStartedAt ? stopTimer() : startTimer()));
  document.getElementById('newScramble').addEventListener('click', newScramble);
  document.getElementById('resetTimer').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStartedAt = 0;
    timerDisplay.textContent = '00:00.00';
    timerDisplay.classList.remove('running');
    timerStatus.textContent = 'Sẵn sàng';
  });
  document.addEventListener('keydown', (event) => {
    if (event.code !== 'Space' || event.target.matches('input, textarea, button') || isHoldingSpace) return;
    event.preventDefault();
    isHoldingSpace = true;
    timerStatus.textContent = 'Thả Space để bắt đầu';
  });
  document.addEventListener('keyup', (event) => {
    if (event.code !== 'Space') return;
    event.preventDefault();
    if (isHoldingSpace) startTimer();
    isHoldingSpace = false;
  });
}
