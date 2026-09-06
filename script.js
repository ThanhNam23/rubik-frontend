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

// ---- Solver — gọi backend qua /api/ ----
const btnScramble = document.getElementById('btnScramble');
const btnSolve = document.getElementById('btnSolve');
const scrambleInput = document.getElementById('scrambleInput');
const resultLine = document.getElementById('resultLine');

async function callApi(path, body) {
  resultLine.textContent = 'Đang xử lý…';
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error('status ' + res.status);
    return await res.json();
  } catch (err) {
    resultLine.textContent = 'Backend chưa sẵn sàng (' + err.message + '). Đây là nơi /api/scramble và /api/solve sẽ được gọi.';
    return null;
  }
}

if (btnScramble) {
  btnScramble.addEventListener('click', async () => {
    const data = await callApi('/api/scramble');
    if (data) {
      scrambleInput.value = data.scramble;
      resultLine.textContent = '';
    }
  });
}

if (btnSolve) {
  btnSolve.addEventListener('click', async () => {
    if (!scrambleInput.value.trim()) {
      resultLine.textContent = 'Nhập chuỗi xáo trộn trước, hoặc bấm "Tạo xáo trộn".';
      return;
    }
    const data = await callApi('/api/solve', { scramble: scrambleInput.value });
    if (data) resultLine.textContent = data.solution;
  });
}
