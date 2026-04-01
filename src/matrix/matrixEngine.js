

import { applyGravity, createFallingBlockForColumn, landBlock, stepBlockDown } from './blockFall';
import { createBlock } from './blockSpawner';

// ─── Sabitler ───────
export const COLS = 8;
export const ROWS = 10;
export const INITIAL_FILLED_ROWS = 3; 
export const MIN_SELECTION = 2;       
export const MAX_SELECTION = 4;       
export const MAX_WRONG_MOVES = 3;   

// ─── Başlangıç Durumu ─────

/**
 * Boş bir 8×10 matris oluşturur. Tüm hücreler null.
 * @returns {Array<Array<null>>}
 */
export function createEmptyMatrix() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

/**
 * Alt 3 satır (7, 8, 9. satırlar) rastgele bloklarla doldurulur.
 * @returns {Array<Array<Object|null>>}
 */
export function createInitialMatrix() {
  const matrix = createEmptyMatrix();
  const startRow = ROWS - INITIAL_FILLED_ROWS; // = 7

  for (let row = startRow; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      matrix[row][col] = createBlock(row, col);
    }
  }

  return matrix;
}

// ─── Hedef Sayı ─────────────────────────────────────────────────────────────

/**
 * Yeni bir hedef sayı üretir.
 *
 * @returns {number} Hedef sayı
 */
export function generateTargetNumber() {
  // 2 blok min → en az 2, 4 blok max → en fazla 36 (9+9+9+9)
  // Makul aralık: 2 ile 20 arası (oynanabilirlik için)
  return Math.floor(Math.random() * 19) + 2;
}

// ─── Blok Seçim Mantığı ─────────────────────────────────────────────────────

/**
 * İki hücrenin (r1,c1) ve (r2,c2) komşu olup olmadığını kontrol eder.
 *
 * @param {number} r1
 * @param {number} c1
 * @param {number} r2
 * @param {number} c2
 * @returns {boolean}
 */
export function areAdjacent(r1, c1, r2, c2) {
  const rowDiff = Math.abs(r1 - r2);
  const colDiff = Math.abs(c1 - c2);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

/**
 * Yeni seçilmek istenen bloğun mevcut seçim zincirine eklenip eklenemeyeceğini kontrol eder.
 *
 * Kurallar:
 * 1. Zincir boşsa her zaman eklenebilir.
 * 2. Blok daha önce seçilmemişse ve zincirdeki herhangi bir blokla komşuysa eklenebilir.
 * 3. Zincir maksimum uzunluğa (4) ulaşmışsa eklenemez.
 *
 * @param {Array<Object>} selectedBlocks - Mevcut seçim zinciri
 * @param {Object} candidateBlock - Eklenmek istenen blok
 * @returns {boolean}
 */
export function canAddToSelection(selectedBlocks, candidateBlock) {
  if (selectedBlocks.length >= MAX_SELECTION) return false;

  // Aynı blok zaten seçili mi?
  const alreadySelected = selectedBlocks.some(b => b.id === candidateBlock.id);
  if (alreadySelected) return false;

  // Zincir boşsa serbestçe ekle
  if (selectedBlocks.length === 0) return true;

  // Zincirdeki en az bir blokla komşu olmalı
  return selectedBlocks.some(b =>
    areAdjacent(b.row, b.col, candidateBlock.row, candidateBlock.col)
  );
}

/**
 * Seçilen blokların toplam değerini hesaplar.
 * @param {Array<Object>} selectedBlocks
 * @returns {number}
 */
export function calculateSelectionSum(selectedBlocks) {
  return selectedBlocks.reduce((sum, block) => sum + block.number, 0);
}

/**
 * Seçilen blokların toplam puan değerini hesaplar.
 * @param {Array<Object>} selectedBlocks
 * @returns {number}
 */
export function calculateSelectionScore(selectedBlocks) {
  return selectedBlocks.reduce((sum, block) => sum + block.scoreValue, 0);
}

// ─── Hamle Kontrolü ──────
/**
 * Bir hamlenin doğru olup olmadığını kontrol eder.
 *
 * @param {Array<Object>} selectedBlocks - Seçilen bloklar
 * @param {number} targetNumber - Hedef sayı
 * @returns {{ isValid: boolean, reason: string }}
 */
export function validateMove(selectedBlocks, targetNumber) {
  if (selectedBlocks.length < MIN_SELECTION) {
    return { isValid: false, reason: `En az ${MIN_SELECTION} blok seçmelisiniz.` };
  }
  if (selectedBlocks.length > MAX_SELECTION) {
    return { isValid: false, reason: `En fazla ${MAX_SELECTION} blok seçebilirsiniz.` };
  }

  const sum = calculateSelectionSum(selectedBlocks);
  if (sum !== targetNumber) {
    return {
      isValid: false,
      reason: `Toplam (${sum}) hedef sayıya (${targetNumber}) eşit değil.`,
    };
  }

  return { isValid: true, reason: 'Doğru hamle!' };
}

// ─── Matris Güncelleme ───────

/**
 * Doğru hamle sonrasında seçilen blokları matristen siler.
 * Ardından gravity uygulanır.
 *
 * @param {Array<Array<Object|null>>} matrix - Mevcut matris
 * @param {Array<Object>} selectedBlocks - Silinecek bloklar
 * @returns {Array<Array<Object|null>>} Güncellenmiş matris
 */
export function removeBlocksAndApplyGravity(matrix, selectedBlocks) {
  const selectedIds = new Set(selectedBlocks.map(b => b.id));

  // Seçilen blokları null ile değiştir
  const clearedMatrix = matrix.map(row =>
    row.map(cell => (cell && selectedIds.has(cell.id) ? null : cell))
  );

  // Gravity uygula: üstteki bloklar aşağı kayar
  return applyGravity(clearedMatrix);
}

/**
 * Matriste bir sütunun tamamen dolu olup olmadığını (10. satıra kadar) kontrol eder.
 
 * @param {Array<Array<Object|null>>} matrix
 * @returns {boolean}
 */
export function isGameOver(matrix) {
  for (let col = 0; col < COLS; col++) {
    if (matrix[0][col] !== null) return true;
  }
  return false;
}

/**
 * Düşen bir bloğu matrise yerleştirir.
 * blockFall.js'teki landBlock fonksiyonunu proxy'ler.
 *
 * @param {Array<Array<Object|null>>} matrix
 * @param {Object} fallingBlock
 * @returns {{ matrix: Array, landed: boolean, gameOver: boolean }}
 */
export function placeBlock(matrix, fallingBlock) {
  return landBlock(matrix, fallingBlock);
}

/**
 * Düşen bloğu bir adım aşağı hareket ettirir.
 * blockFall.js'teki stepBlockDown fonksiyonunu proxy'ler.
 *
 * @param {Array<Array<Object|null>>} matrix
 * @param {Object} fallingBlock
 * @returns {{ block: Object, landed: boolean }}
 */
export function moveBlockDown(matrix, fallingBlock) {
  return stepBlockDown(matrix, fallingBlock);
}

/**
 * Bir sonraki sütun için yeni düşen blok üretir.
 *
 * @param {number} col - Sütun indeksi (0-7)
 * @returns {Object} Yeni blok
 */
export function getNextFallingBlock(col) {
  return createFallingBlockForColumn(col);
}

// ─── Yardımcı / Debug ──────

/**
 * Matrisi konsolda okunabilir şekilde yazdırır. (Geliştirme aşaması için)
 * @param {Array<Array<Object|null>>} matrix
 */
export function printMatrix(matrix) {
  console.log('─'.repeat(COLS * 3 + 1));
  matrix.forEach((row, r) => {
    const line = row.map(cell => (cell ? String(cell.number).padStart(2) : ' .'))
      .join(' ');
    console.log(`${String(r).padStart(2)}| ${line}`);
  });
  console.log('─'.repeat(COLS * 3 + 1));
}