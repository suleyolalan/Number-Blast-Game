// src/rules/adjacencyChecker.js

/**
 * İki bloğun komşu olup olmadığını kontrol eder.(8 yönlü)
 * Bloklar yatay,dikey ve çapraz olarak birbirlerine komşu olabilirler.
 * @param {Object} blockA - { row, col }
 * @param {Object} blockB - { row, col }
 * @returns {boolean}
 */
export function isAdjacent(blockA, blockB) {

  const rowDiff = Math.abs(blockA.row - blockB.row); //Satır farkı
  const colDiff = Math.abs(blockA.col - blockB.col); //Sütun Farkı

  const isSameBlock = rowDiff === 0 && colDiff === 0; //İki bloğun aynı olup olmadığını kontrol et
  const isClose = rowDiff <= 1 && colDiff <= 1; // İki blok arası fark 1 satır veya sütun olmalı

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
  
  // İlk blok her zaman eklenebilir ve zincir boşsa true döner(komşuluk kontrolü olmaz)
  if (chain.length === 0) return true;

  return chain.some(block => isAdjacent(newBlock, block));
}