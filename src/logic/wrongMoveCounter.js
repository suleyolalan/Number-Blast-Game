// wrongMoveCounter.js — Yanlış hamle sayacını yönetir ve ceza mekanizmasını tetikler.

// Kaç yanlış hamlede ceza uygulanacağı
const MAX_WRONG_MOVES = 3;

/**
 * Yanlış hamle sayacının başlangıç durumunu oluşturur.
 * Sayaç sıfırdan başlar, ceza durumu false olur.
 */
export function createWrongMoveCounter() {
  return {
    count: 0,        // Yanlış hamle sayısı
    isPenalty: false, // Ceza durumu
  };
}

/**
 * Yanlış hamle yapıldığında sayacı 1 artırır.
 * Sayaç MAX_WRONG_MOVES'a ulaştığında isPenalty true olur.
 * Orijinal counter'ı değiştirmez, yeni bir obje döndürür.
 * @param {object} counter - Mevcut sayaç objesi
 * @returns {object} Güncellenmiş sayaç objesi
 */
export function incrementWrongMove(counter) {
  const newCount = counter.count + 1;
  const isPenalty = newCount >= MAX_WRONG_MOVES;

  return {
    count: newCount,
    isPenalty: isPenalty,
  };
}

/**
 * Ceza uygulandıktan sonra sayacı sıfırlar.
 * @returns {object} Sıfırlanmış sayaç objesi
 */
export function resetWrongMoveCounter() {
  return {
    count: 0,
    isPenalty: false,
  };
}

/**
 * Cezaya kaç yanlış hamle kaldığını döndürür.
 * @param {object} counter - Mevcut sayaç objesi
 * @returns {number} Kalan yanlış hamle hakkı (min: 0)
 */
export function getRemainingMoves(counter) {
  const remaining = MAX_WRONG_MOVES - counter.count;
  return Math.max(0, remaining);
}

/**
 * Yanlış hamlenin tüm akışını yönetir.
 * Sayacı artırır, ceza durumunu kontrol eder.
 * App.jsx sadece bu fonksiyonu çağırır; diğerleri yardımcıdır.
 * @param {object} counter - Mevcut sayaç objesi
 * @returns {{ counter: object, shouldPenalize: boolean }}
 */
export function handleWrongMove(counter) {
  const updatedCounter = incrementWrongMove(counter);

  if (updatedCounter.isPenalty) {
    // Ceza tetiklendi → sayacı sıfırla, App'e ceza sinyali gönder
    return {
      counter: resetWrongMoveCounter(),
      shouldPenalize: true,
    };
  }

  return {
    counter: updatedCounter,
    shouldPenalize: false,
  };
}