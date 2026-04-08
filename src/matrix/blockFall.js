import { spawnBlockForColumn } from './blockSpawner';
import { COLS, ROWS } from './matrixEngine';

// ─── Tek Blok Düşme ─────────────────────────────────────────

/**
 * Bloğu bir adım aşağı taşır.
 * Zemine veya başka bloğa değdiyse landed: true döner.
 */
export function stepBlockDown(matrix, fallingBlock) {
  const { row, col } = fallingBlock;
  const nextRow = row + 1;

  const hitBottom = nextRow >= ROWS;
  const hitBlock  = nextRow < ROWS && matrix[nextRow][col] !== null;

  if (hitBottom || hitBlock) {
    return { block: fallingBlock, landed: true };
  }

  return { block: { ...fallingBlock, row: nextRow }, landed: false };
}

/**
 * Düşen bloğu sütunun en alt boş satırına yerleştirir.
 * @returns {{ matrix, landed, gameOver }}
 */
export function landBlock(matrix, fallingBlock) {
  const { col } = fallingBlock;

  let landingRow = -1;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (matrix[row][col] === null) {
      landingRow = row;
      break;
    }
  }

  if (landingRow < 0) {
    return { matrix, landed: false, gameOver: true };
  }

  const updatedMatrix = matrix.map(r => [...r]);
  updatedMatrix[landingRow][col] = { ...fallingBlock, row: landingRow };

  const gameOver = updatedMatrix[0][col] !== null;
  return { matrix: updatedMatrix, landed: true, gameOver };
}

// ─── Gravity ─────────────────────────────────────────────────

/**
 * Patlama sonrası gravity: bloklar aşağı kayar.
 * Üst boşluklar NULL kalır — sonraki düşen bloklarla zamanla dolar.
 */
export function applyGravity(matrix) {
  const newMatrix = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  for (let col = 0; col < COLS; col++) {
    const blocks = [];
    for (let row = 0; row < ROWS; row++) {
      if (matrix[row][col] !== null) blocks.push(matrix[row][col]);
    }

    let writeRow = ROWS - 1;
    for (let i = blocks.length - 1; i >= 0; i--) {
      newMatrix[writeRow][col] = { ...blocks[i], row: writeRow, col };
      writeRow--;
    }
  }

  return newMatrix;
}

// ─── Spawn ───────────────────────────────────────────────────

/** Belirtilen sütun için ekran dışından (row: -1) yeni blok üretir. */
export function createFallingBlockForColumn(col) {
  return spawnBlockForColumn(col);
}

// ─── Rastgele Sütun Kuyruğu ──────────────────────────────────

/**
 * Her 8 blokta bir tüm sütunlar farklı sırayla kullanılır.
 * Aynı anda yalnızca BİR sütundan BİR blok düşer.
 *
 *   const queue = createColumnQueue();
 *   const col   = queue.next();  // rastgele sütun
 *   queue.reset();               // oyun yeniden başlayınca
 */
export function createColumnQueue() {
  let queue = [];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function refill() {
    queue = shuffle(Array.from({ length: COLS }, (_, i) => i));
  }

  refill();

  return {
    next() {
      if (queue.length === 0) refill();
      return queue.shift();
    },
    reset() { refill(); },
  };
}