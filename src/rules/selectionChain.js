// src/rules/selectionChain.js

import { isAdjacentToChain } from './adjacencyChecker';
import { canAddMoreBlocks } from './blockLimitRule';

/**
 * Bloğun zincirde zaten seçili olup olmadığını kontrol eder.
 * @param {Object} block - { row, col }
 * @param {Array} chain
 * @returns {boolean}
 */
export function isAlreadySelected(block, chain) {
  return chain.some(
    (b) => b.row === block.row && b.col === block.col  // satır ve sütun eşleşme kontrolü yapılır
  );
}

/**
 * Zincire yeni blok eklemeye çalışır.
 * Başarılıysa güncel zinciri, başarısızsa sebebiyle birlikte döner.
 * @param {Object} block - { row, col, value }
 * @param {Array} chain
 * @returns {{ success: boolean, chain: Array, reason?: string }}
 */
export function addBlockToChain(block, chain) {
  if (isAlreadySelected(block, chain)) {
    return { success: false, chain, reason: 'Blok zaten seçili' }; // aynı blok tekrar seçilemez
  }

  if (!isAdjacentToChain(block, chain)) {
    return { success: false, chain, reason: 'Blok komşu değil' }; //yeni blok mevcut bloka komşu değilse eklenmez
  }

  if (!canAddMoreBlocks(chain)) {
    return { success: false, chain, reason: 'Maksimum 4 blok seçilebilir' }; // chain limit ölçülür, max blok sayısı 4 tür.
  }

  return { success: true, chain: [...chain, block] }; // yeni blok eklenir, güncellenmiş chain döner.
}

/**
 * Zinciri sıfırlar. Hamle bitince çağrılır.
 * @returns {Array}
 */
export function resetChain() {
  return []; 
}