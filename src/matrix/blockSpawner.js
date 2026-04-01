
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

// Puan tablosu (Section 5'e göre)
export const SCORE_TABLE = {
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

/**
 * Tek bir blok nesnesi oluşturur.
 * @param {number} row - Bloğun bulunduğu satır indeksi
 * @param {number} col - Bloğun bulunduğu sütun indeksi
 * @param {number|null} value - Belirli bir değer atanacaksa (null ise rastgele)
 * @returns {Object} Blok nesnesi
 */
export function createBlock(row, col, value = null) {
  const number = value !== null ? value : getRandomNumber();
  return {
    id: `block_${row}_${col}_${Date.now()}_${Math.random()}`,
    number,
    color: NUMBER_COLORS[number],
    scoreValue: SCORE_TABLE[number],
    row,
    col,
    isSelected: false,
  };
}

/**
 * 1 ile 9 arasında rastgele bir tam sayı döner.
 * @returns {number}
 */
export function getRandomNumber() {
  return Math.floor(Math.random() * 9) + 1;
}

/**
 * Belirli bir sütun için üstten düşecek yeni bir blok oluşturur.
 * Blok başlangıçta satır -1'de (ekran dışında üstte) konumlandırılır.
 * @param {number} col - Sütun indeksi
 * @returns {Object} Yeni blok nesnesi
 */
export function spawnBlockForColumn(col) {
  return createBlock(-1, col);
}

/**
 * Bir satır için tüm sütunlarda yeni bloklar oluşturur (ceza mekanizması veya başlangıç için).
 * @param {number} row - Satır indeksi
 * @param {number} cols - Toplam sütun sayısı (varsayılan 8)
 * @returns {Array<Object>} Blok dizisi
 */
export function spawnFullRow(row, cols = 8) {
  return Array.from({ length: cols }, (_, col) => createBlock(row, col));
}

/**
 * Tüm sütunlar için üstten düşecek blokları hazırlar.
 * @param {number} cols - Toplam sütun sayısı (varsayılan 8)
 * @returns {Array<Object>} Her sütun için bir blok içeren dizi
 */
export function spawnRowOfFallingBlocks(cols = 8) {
  return Array.from({ length: cols }, (_, col) => spawnBlockForColumn(col));
}