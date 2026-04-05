// src/rules/adjacencyChecker.js

/**
 * İki bloğun 8 yönlü komşu olup olmadığını kontrol eder.
 * @param {Object} blockA - { row, col }
 * @param {Object} blockB - { row, col }
 * @returns {boolean}
 */
export function isAdjacent(blockA, blockB) {
  const rowDiff = Math.abs(blockA.row - blockB.row);
  const colDiff = Math.abs(blockA.col - blockB.col);

  const isSameBlock = rowDiff === 0 && colDiff === 0;
  const isClose = rowDiff <= 1 && colDiff <= 1;

  return isClose && !isSameBlock;
}

/**
 * Yeni bloğun, mevcut seçim zincirinin son elemanına komşu olup olmadığını kontrol eder.
 * Zincir boşsa her blok eklenebilir (ilk seçim).
 * @param {Object} newBlock - { row, col }
 * @param {Array} chain - [{ row, col }, ...]
 * @returns {boolean}
 */
export function isAdjacentToChain(newBlock, chain) {
  if (chain.length === 0) return true;

  return chain.some(block => isAdjacent(newBlock, block));
}