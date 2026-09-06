const palette = [
  { name: 'Trắng', color: 'white' },
  { name: 'Vàng', color: 'yellow' },
  { name: 'Đỏ', color: 'red' },
  { name: 'Cam', color: 'orange' },
  { name: 'Xanh dương', color: 'blue' },
  { name: 'Xanh lá', color: 'green' },
  { name: 'Xám', color: 'gray' },
];

const state = {
  mode: '2d',
  selectedColor: 'yellow',
  stickers2d: Array(9).fill('gray'),
  stickers3d: {
    top: Array(9).fill('yellow'),
    front: Array(9).fill('red'),
    right: Array(9).fill('blue'),
  },
};

const modeButtons = document.querySelectorAll('[data-mode]');
const paletteElement = document.getElementById('palette');
const canvas = document.getElementById('stickerCanvas');
const form = document.getElementById('formulaForm');
const savedList = document.getElementById('savedList');
const status = document.getElementById('saveStatus');

function renderPalette() {
  paletteElement.innerHTML = palette.map(({ name, color }) => `
    <button class="swatch ${color === state.selectedColor ? 'selected' : ''}" data-color="${color}" type="button" title="${name}" aria-label="${name}">
      <span class="sticker ${color}"></span>
    </button>
  `).join('');
  paletteElement.querySelectorAll('[data-color]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedColor = button.dataset.color;
      renderPalette();
    });
  });
}

function renderCanvas() {
  if (state.mode === '2d') {
    canvas.className = 'editor-canvas canvas-2d';
    canvas.innerHTML = state.stickers2d.map((color, index) => `<button class="sticker ${color}" data-index="${index}" type="button" aria-label="Sticker ${index + 1}"></button>`).join('');
    canvas.querySelectorAll('[data-index]').forEach((sticker) => {
      sticker.addEventListener('click', () => {
        state.stickers2d[Number(sticker.dataset.index)] = state.selectedColor;
        renderCanvas();
      });
    });
    return;
  }

  canvas.className = 'editor-canvas canvas-3d';
  canvas.innerHTML = `<div class="cube-3d">${['top', 'front', 'right'].map((face) => `
    <div class="cube-face cube-${face} editor-face">
      ${state.stickers3d[face].map((color, index) => `<button class="sticker ${color}" data-face="${face}" data-index="${index}" type="button" aria-label="${face} sticker ${index + 1}"></button>`).join('')}
    </div>
  `).join('')}</div>`;
  canvas.querySelectorAll('[data-face]').forEach((sticker) => {
    sticker.addEventListener('click', () => {
      state.stickers3d[sticker.dataset.face][Number(sticker.dataset.index)] = state.selectedColor;
      renderCanvas();
    });
  });
}

function getSavedFormulas() {
  try {
    return JSON.parse(localStorage.getItem('cubeStudyFormulas') || '[]');
  } catch {
    return [];
  }
}

function renderSavedFormulas() {
  const formulas = getSavedFormulas();
  savedList.innerHTML = formulas.length ? formulas.map((formula) => `
    <li>
      <div><strong>${formula.name}</strong><span>${formula.mode.toUpperCase()} · ${formula.moves}</span></div>
      <button type="button" data-delete="${formula.id}" aria-label="Xóa ${formula.name}">Xóa</button>
    </li>
  `).join('') : '<li class="empty-state">Chưa có công thức tự tạo.</li>';
  savedList.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      const remaining = getSavedFormulas().filter((formula) => formula.id !== button.dataset.delete);
      localStorage.setItem('cubeStudyFormulas', JSON.stringify(remaining));
      renderSavedFormulas();
    });
  });
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    modeButtons.forEach((item) => item.classList.toggle('active', item === button));
    document.getElementById('modeDescription').textContent = state.mode === '2d'
      ? 'Lưới 3 × 3 phẳng, phù hợp cho OLL hoặc pattern một mặt.'
      : 'Khối có mặt trên, mặt trước và mặt phải để mô tả case F2L / PLL.';
    renderCanvas();
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('formulaName').value.trim();
  const moves = document.getElementById('formulaMoves').value.trim();
  if (!name || !moves) {
    status.textContent = 'Hãy nhập tên case và chuỗi công thức.';
    return;
  }
  const formulas = getSavedFormulas();
  formulas.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    moves,
    mode: state.mode,
    stickers: state.mode === '2d' ? [...state.stickers2d] : structuredClone(state.stickers3d),
  });
  localStorage.setItem('cubeStudyFormulas', JSON.stringify(formulas));
  status.textContent = 'Đã lưu công thức vào thư viện cá nhân.';
  form.reset();
  renderSavedFormulas();
});

document.getElementById('clearCanvas').addEventListener('click', () => {
  if (state.mode === '2d') state.stickers2d.fill('gray');
  else Object.values(state.stickers3d).forEach((face) => face.fill('gray'));
  renderCanvas();
});

renderPalette();
renderCanvas();
renderSavedFormulas();
