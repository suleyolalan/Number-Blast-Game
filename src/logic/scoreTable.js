// src/logic/scoreTable.js

const SCORE_TABLE = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
  6: 9,
  7: 12,
  8: 15,
  9: 20,
};
export default SCORE_TABLE;

/**
 * Seçilen blokların (chain) toplam puan değerini hesaplar.
 * @param {Array} chain - Seçilen blok objelerinden oluşan dizi
 * @returns {number} Toplam kazanılacak puan
 */
export function calculateTotalScore(chain) {
  if (!chain || chain.length === 0) return 0;
  
  return chain.reduce((total, block) => {
    const num = block.number ?? block.value ?? 0;
    return total + (SCORE_TABLE[num] ?? 0);
  }, 0);
}