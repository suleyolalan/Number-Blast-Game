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
    (b) => b.row === block.row && b.col === block.col
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
    return { success: false, chain, reason: 'Blok zaten seçili' };
  }

  if (!isAdjacentToChain(block, chain)) {
    return { success: false, chain, reason: 'Blok komşu değil' };
  }

  if (!canAddMoreBlocks(chain)) {
    return { success: false, chain, reason: 'Maksimum 4 blok seçilebilir' };
  }

  return { success: true, chain: [...chain, block] };
}

/**
 * Zinciri sıfırlar. Hamle bitince çağrılır.
 * @returns {Array}
 */
export function resetChain() {
  return [];
}