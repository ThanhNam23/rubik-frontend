const timerDisplay = document.getElementById('timerDisplay');
const timerStatus = document.getElementById('timerStatus');
const solveList = document.getElementById('solveList');
const solveCount = document.getElementById('solveCount');
const bestTime = document.getElementById('bestTime');
const scrambleLine = document.getElementById('scrambleLine');
const backendStatus = document.getElementById('backendStatus');
const scrambleMoves = ['R', 'L', 'U', 'D', 'F', 'B'];
let timerStartedAt = 0;
let timerInterval = null;
let isHoldingSpace = false;
let solves = [];

function setBackendStatus(message, connected) {
  backendStatus.textContent = message;
  backendStatus.style.color = connected ? 'var(--green)' : 'var(--red)';
}

function formatTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const centiseconds = Math.floor((milliseconds % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

function renderTimer() {
  if (timerStartedAt) timerDisplay.textContent = formatTime(Date.now() - timerStartedAt);
}

function renderHistory() {
  solveCount.textContent = `${solves.length} solve`;
  bestTime.textContent = solves.length ? formatTime(Math.min(...solves)) : '--';
  solveList.innerHTML = solves.length
    ? solves.slice(0, 8).map((time, index) => `<li><span>#${solves.length - index}</span><strong>${formatTime(time)}</strong></li>`).join('')
    : '<li class="empty-state">Chưa có solve nào</li>';
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
  solves.unshift(elapsed);
  clearInterval(timerInterval);
  timerInterval = null;
  timerStartedAt = 0;
  timerDisplay.classList.remove('running');
  timerStatus.textContent = 'Đã ghi nhận';
  renderHistory();
  saveSolve(elapsed, scrambleLine.textContent);
}

async function saveSolve(timeMs, scramble) {
  try {
    const response = await fetch('/api/solves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ time_ms: timeMs, scramble }),
    });
    if (!response.ok) throw new Error(`POST ${response.status}`);
    setBackendStatus('Backend: đã lưu solve qua /api/solves', true);
  } catch {
    setBackendStatus('Backend chưa sẵn sàng: solve này chỉ có trong phiên hiện tại', false);
  }
}

async function loadBackendData() {
  try {
    const [healthResponse, solvesResponse] = await Promise.all([
      fetch('/api/health', { headers: { Accept: 'application/json' } }),
      fetch('/api/solves?limit=8', { headers: { Accept: 'application/json' } }),
    ]);
    if (!healthResponse.ok || !solvesResponse.ok) throw new Error('API unavailable');
    const data = await solvesResponse.json();
    solves = (data.items || []).map((solve) => solve.time_ms);
    renderHistory();
    setBackendStatus('Backend: đã kết nối qua /api/health', true);
  } catch {
    setBackendStatus('Backend chưa sẵn sàng: timer vẫn chạy local', false);
  }
}

function newScramble() {
  const moves = [];
  while (moves.length < 9) {
    const move = scrambleMoves[Math.floor(Math.random() * scrambleMoves.length)];
    if (moves.length && moves[moves.length - 1][0] === move) continue;
    moves.push(move + ['', "'", '2'][Math.floor(Math.random() * 3)]);
  }
  scrambleLine.textContent = moves.join(' ');
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerStartedAt = 0;
  timerDisplay.textContent = '00:00.00';
  timerDisplay.classList.remove('running');
  timerStatus.textContent = 'Sẵn sàng';
}

timerDisplay.addEventListener('click', () => (timerStartedAt ? stopTimer() : startTimer()));
document.getElementById('newScramble').addEventListener('click', newScramble);
document.getElementById('resetTimer').addEventListener('click', resetTimer);
document.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' || event.target.matches('button') || isHoldingSpace) return;
  event.preventDefault();
  isHoldingSpace = true;
  timerStatus.textContent = 'Thả Space để bắt đầu';
});
document.addEventListener('keyup', (event) => {
  if (event.code !== 'Space') return;
  event.preventDefault();
  if (isHoldingSpace) timerStartedAt ? stopTimer() : startTimer();
  isHoldingSpace = false;
});

loadBackendData();
