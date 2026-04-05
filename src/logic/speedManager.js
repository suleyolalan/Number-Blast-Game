// speedManager.js — Blok düşme hızını yönetir
// PDF'e göre: Her 100 puanda 1 saniye azalır, min 1 saniye

const INITIAL_INTERVAL = 5000; // 5 saniye (ms cinsinden)
const MIN_INTERVAL = 1000;     // 1 saniye minimum
const INTERVAL_STEP = 1000;    // Her 100 puanda 1 saniye azalır
const SCORE_STEP = 100;        // Hız artış eşiği

/**
 * Toplam puana göre blok düşme süresini (ms) döndürür.
 * @param {number} score - Oyuncunun toplam puanı
 * @returns {number} Düşme süresi (ms)
 */
export function getDropInterval(score) {
  const tier = Math.floor(score / SCORE_STEP); // Kaçıncı hız kademesi
  const interval = INITIAL_INTERVAL - tier * INTERVAL_STEP;
  return Math.max(interval, MIN_INTERVAL);
}

/**
 * Saniye cinsinden düşme süresini döndürür (Header'da gösterim için).
 * @param {number} score
 * @returns {number} Saniye (1-5)
 */
export function getDropIntervalSeconds(score) {
  return getDropInterval(score) / 1000;
}

/**
 * Bir sonraki hız artışı için gereken puan eşiğini döndürür.
 * @param {number} score
 * @returns {number|null} Eşik puanı (maksimum hızdaysa null)
 */
export function getNextSpeedThreshold(score) {
  const interval = getDropInterval(score);
  if (interval <= MIN_INTERVAL) return null; // Zaten max hız
  const tier = Math.floor(score / SCORE_STEP);
  return (tier + 1) * SCORE_STEP;
}
