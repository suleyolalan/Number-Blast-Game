// src/rules/blockLimitRule.js

const MIN_BLOCKS = 2;
const MAX_BLOCKS = 4;

/**
 * Zincire daha fazla blok eklenip eklenemeyeceğini kontrol eder.
 * @param {Array} chain
 * @returns {boolean}
 */
export function canAddMoreBlocks(chain) {
  return chain.length < MAX_BLOCKS;
}

/**
 * Zincir onaylanabilir uzunlukta mı?
 * Onay butonuna basıldığında çağrılır.
 * @param {Array} chain
 * @returns {boolean}
 */
export function isChainLengthValid(chain) {
  return chain.length >= MIN_BLOCKS && chain.length <= MAX_BLOCKS;
}