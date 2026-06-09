import { applyGravity, createFallingBlockForColumn, landBlock, stepBlockDown } from './blockFall';
import { createBlock } from './blockSpawner';

// ─── Sabitler ────────────────────────────────────────────────
export const COLS              = 8;
export const ROWS              = 10;
export const INITIAL_FILLED_ROWS = 3;
export const MIN_SELECTION     = 2;
export const MAX_SELECTION     = 4;
export const MAX_WRONG_MOVES   = 3;

// ─── Oyun Fazları ────────────────────────────────────────────
// FALLING → tek blok düşüyor, oyuncu dokunamaz
// WAITING → blok indi, oyuncu seçim yapıyor
export const GAME_PHASE = {
  FALLING: 'FALLING',
  WAITING: 'WAITING',
};

// ─── Matris ──────────────────────────────────────────────────

export function createEmptyMatrix() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

/** Alt 3 satır dolu, üstü boş */
export function createInitialMatrix() {
  const matrix = createEmptyMatrix();
  const startRow = ROWS - INITIAL_FILLED_ROWS; // 7

  for (let row = startRow; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      matrix[row][col] = createBlock(row, col);
    }
  }
  return matrix;
}

// ─── Tek Blok Düşme API'si ───────────────────────────────────

/** Belirtilen sütun için yeni düşen blok üretir (row: -1) */
export function getNextFallingBlock(col) {
  return createFallingBlockForColumn(col);
}

/** Bloğu bir adım aşağı taşır → { block, landed } */
export function moveBlockDown(matrix, fallingBlock) {
  return stepBlockDown(matrix, fallingBlock);
}

/** İnen bloğu matrise yerleştirir → { matrix, landed, gameOver } */
export function placeBlock(matrix, fallingBlock) {
  return landBlock(matrix, fallingBlock);
}

// ─── Oyun Sonu ───────────────────────────────────────────────

export function isGameOver(matrix) {
  for (let col = 0; col < COLS; col++) {
    if (matrix[0][col] !== null) return true;
  }
  return false;
}

// ─── Doğru Hamle Pipeline ────────────────────────────────────
// 1. Seçilen blokları sil (patlama)
// 2. Gravity (üsttekiler aşağı kayar)
// Boşluklar anında DOLMAZ — sonraki düşen bloklarla zamanla dolar.
export function removeBlocksAndApplyGravity(matrix, selectedBlocks) {
  const selectedIds = new Set(selectedBlocks.map(b => b.id));

  const clearedMatrix = matrix.map(row =>
    row.map(cell => (cell && selectedIds.has(cell.id) ? null : cell))
  );

  return applyGravity(clearedMatrix);
}

// ─── Yardımcılar ─────────────────────────────────────────────

export function areAdjacent(r1, c1, r2, c2) {
  const rowDiff = Math.abs(r1 - r2);
  const colDiff = Math.abs(c1 - c2);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

export function calculateSelectionSum(selectedBlocks) {
  return selectedBlocks.reduce((sum, b) => sum + b.number, 0);
}

export function calculateSelectionScore(selectedBlocks) {
  return selectedBlocks.reduce((sum, b) => sum + b.scoreValue, 0);
}

export function validateMove(selectedBlocks, targetNumber) {
  if (selectedBlocks.length < MIN_SELECTION) {
    return { isValid: false, reason: `En az ${MIN_SELECTION} blok seçmelisiniz.` };
  }
  if (selectedBlocks.length > MAX_SELECTION) {
    return { isValid: false, reason: `En fazla ${MAX_SELECTION} blok seçebilirsiniz.` };
  }
  const sum = calculateSelectionSum(selectedBlocks);
  if (sum !== targetNumber) {
    return { isValid: false, reason: `Toplam (${sum}) hedef (${targetNumber})'e eşit değil.` };
  }
  return { isValid: true, reason: 'Doğru hamle!' };
}

export function printMatrix(matrix) {
  console.log('─'.repeat(COLS * 3 + 1));
  matrix.forEach((row, r) => {
    const line = row.map(cell => (cell ? String(cell.number).padStart(2) : ' .')).join(' ');
    console.log(`${String(r).padStart(2)}| ${line}`);
  });
  console.log('─'.repeat(COLS * 3 + 1));
}