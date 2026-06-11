// ─── Renk ve Puan Tabloları ──────────────────────────────────

import SCORE_TABLE from '../logic/scoreTable.js'; // Her sayının puan karşılığı

// Her sayının blok rengi (1-9)

export const NUMBER_COLORS = {
  1: '#FF4444', // Kırmızı
  2: '#FF8C00', // Turuncu
  3: '#FFD700', // Sarı
  4: '#32CD32', // Yeşil
  5: '#1E90FF', // Mavi
  6: '#9370DB', // Mor
  7: '#FF69B4', // Pembe
  8: '#20B2AA', // Teal
  9: '#8B0000', // Koyu Kırmızı
};

// ─── Temel Blok Üretici ──────────────────────────────────────

/**
 * Tek bir blok nesnesi oluşturur.
 * @param {number} row   - Satır indeksi
 * @param {number} col   - Sütun indeksi
 * @param {number|null} value - Belirli değer (null ise rastgele)
 */
export function createBlock(row, col, value = null) {
  const number = value !== null ? value : getRandomNumber();
  return {
    id:         `block_${row}_${col}_${Date.now()}_${Math.random()}`,
    number,
    color:      NUMBER_COLORS[number],
    scoreValue: SCORE_TABLE[number],
    row,
    col,
    isSelected: false,
  };
}

/**
 * 1–9 arası rastgele tam sayı döner.
 */
export function getRandomNumber() {
  return Math.floor(Math.random() * 9) + 1;
}

// ─── Spawn Fonksiyonları ─────────────────────────────────────

/**
 * Belirli sütun için ekran dışından (row: -1) düşecek blok üretir.
 *
 * App.js bağlantısı:
 *   createFallingBlockForColumn(col) → spawnBlockForColumn(col) çağırır
 */
export function spawnBlockForColumn(col) {
  return createBlock(-1, col);
}

/**
 * Ceza mekanizması: tüm sütunlarda aynı anda bir satır oluşturur.
 *
 * TEST NOTLARI:
 *   - 8 blok döner (COLS kadar) ✓
 *   - Her bloğun col değeri 0..7 sırasıyla atanır ✓
 *   - row parametresi doğru set edilir — App.js'te row: 0 olarak eklenir ✓
 *   - Her blok bağımsız id alır (id çakışması yok) ✓
 *
 * App.js bağlantısı (HEAD branch):
 *   shouldPenalize → spawnFullRow(0) → [newRow, ...prev.slice(0, ROWS - 1)]
 *
 * App.js bağlantısı (9ed879d branch):
 *   shouldPenalize → spawnRowOfFallingBlocks(COLS) → map ile row:0 atanır
 *
 * @param {number} row  - Ceza satırının yerleştirileceği satır indeksi (genellikle 0)
 * @param {number} cols - Sütun sayısı (varsayılan 8)
 */
export function spawnFullRow(row, cols = 8) {
  return Array.from({ length: cols }, (_, col) => createBlock(row, col));
}

/**
 * Tüm sütunlar için üstten düşecek blokları hazırlar (row: -1).
 * spawnFullRow'dan farkı: bloklar ekran dışından başlar, animasyonlu iner.
 *
 * App.js bağlantısı (9ed879d branch):
 *   spawnRowOfFallingBlocks(COLS) → .map((b, col) => ({ ...b, row: 0, col }))
 *
 * @param {number} cols - Sütun sayısı (varsayılan 8)
 */
export function spawnRowOfFallingBlocks(cols = 8) {
  return Array.from({ length: cols }, (_, col) => spawnBlockForColumn(col));
}
