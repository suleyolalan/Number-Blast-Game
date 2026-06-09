// src/logic/speedManager.js
// Oyuncu puanına göre blok düşme aralığını (interval) belirler

const INITIAL_SPEED_MS = 5000; 
const MINIMUM_SPEED_MS = 1000; 
const SPEED_DECREMENT_MS = 1000; 
const SCORE_TIER = 100; 

/**
 * Toplam düşme süresini milisaniye (ms) cinsinden hesaplar.
 */
export function getDropInterval(score) {
  if (typeof score !== 'number' || score < 0) return INITIAL_SPEED_MS;
  
  const tier = Math.floor(score / SCORE_TIER);
  const speedReduction = tier * SPEED_DECREMENT_MS;
  const currentSpeed = INITIAL_SPEED_MS - speedReduction;
  
  return Math.max(currentSpeed, MINIMUM_SPEED_MS);
}

/**
 * Arayüz (Header) gösterimi için saniye (sn) cinsinden güncel hızı hesaplar.
 */
export function getDropIntervalSeconds(score) {
  return getDropInterval(score) / 1000;
}

/**
 * Bloğun tek bir satırı geçme süresini (adım hızını) milisaniye cinsinden hesaplar.
 * @param {number} score - Güncel puan
 * @param {number} rows - Matrisin toplam satır sayısı
 * @returns {number} setInterval için milisaniye değeri
 */
export function getStepInterval(score, rows) {
  const totalTime = getDropInterval(score);
  return Math.floor(totalTime / Math.max(rows, 1)); // 0'a bölünme ihtimaline karşı güvenlik önlemi
}