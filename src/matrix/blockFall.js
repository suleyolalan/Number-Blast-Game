/**
 * Blokların yukarıdan aşağıya doğru düşme ve yerleşme mantığını yönetir.*/
 

import { spawnBlockForColumn } from './blockSpawner';
import { COLS, ROWS } from './matrixEngine';

/**
 * Belirli bir sütunda, verilen satır konumundan itibaren bir bloğun
 * düşebileceği en alt boş satırı bulur.
 *
 * @param {Array<Array<Object|null>>} matrix - Mevcut oyun matrisi
 * @param {number} col   - Kontrol edilecek sütun
 * @param {number} fromRow - Bloğun mevcut satır konumu
 * @returns {number} Bloğun yerleşeceği hedef satır indeksi
 */
export function findLandingRow(matrix, col, fromRow) {
  let targetRow = fromRow;

  for (let row = fromRow + 1; row < ROWS; row++) {
    if (matrix[row][col] !== null) {
      // Bir blokla karşılaştı, bir üstüne yerleş
      break;
    }
    targetRow = row;
  }

  return targetRow;
}

/**
 * Düşmekte olan bir bloğu matristeki doğru konuma yerleştirir.
 * Bloğun `row` değeri güncellenir ve matrise yazılır.
 *
 * @param {Array<Array<Object|null>>} matrix - Mevcut oyun matrisi (mutate edilir)
 * @param {Object} fallingBlock - Düşmekte olan blok nesnesi
 * @returns {{ matrix: Array, landed: boolean, gameOver: boolean }}

 */
export function landBlock(matrix, fallingBlock) {
  const { col } = fallingBlock;
  const landingRow = fallingBlock.row;

  // Yerleşecek yer yok → sütun tamamen dolu → oyun sonu
  if (landingRow < 0) {
    return { matrix, landed: false, gameOver: true };
  }

  const updatedMatrix = matrix.map(row => [...row]);
  const updatedBlock = { ...fallingBlock, row: landingRow };
  updatedMatrix[landingRow][col] = updatedBlock;

  // Sütunun ilk satırı (0. satır) doldu mu → oyun sonu koşulu
  const gameOver = landingRow === 0;

  return { matrix: updatedMatrix, landed: true, gameOver };
}

/**
 * Bir sütunda bloğu bir adım aşağı taşır 
 * Bloğun row değerini 1 artırır; zemine veya başka bloğa ulaştıysa `landed: true` döner.
 *
 * @param {Array<Array<Object|null>>} matrix  - Mevcut matris
 * @param {Object} fallingBlock - Şu an düşmekte olan blok
 * @returns {{ block: Object, landed: boolean }}
 */
export function stepBlockDown(matrix, fallingBlock) {
  const { row, col } = fallingBlock;
  const nextRow = row + 1;

  // Zemine veya başka bir bloğa ulaştı mı?
  const hitBottom = nextRow >= ROWS;
  const hitBlock = nextRow < ROWS && matrix[nextRow][col] !== null;

  if (hitBottom || hitBlock) {
    return { block: fallingBlock, landed: true };
  }

  return {
    block: { ...fallingBlock, row: nextRow },
    landed: false,
  };
}

/**
 * Bloklar patladıktan (yok edildikten) sonra matriste gravity (yerçekimi) uygular.
 * Her sütunda boşlukların üzerindeki bloklar bir aşağı kayar; üst satırlar boş kalır.
 *
 * @param {Array<Array<Object|null>>} matrix - Mevcut oyun matrisi
 * @returns {Array<Array<Object|null>>} Güncellenmiş matris
 */
export function applyGravity(matrix) {
  const newMatrix = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  for (let col = 0; col < COLS; col++) {
    // Sütundaki mevcut blokları (null olmayanları) topla
    const columnBlocks = [];
    for (let row = 0; row < ROWS; row++) {
      if (matrix[row][col] !== null) {
        columnBlocks.push(matrix[row][col]);
      }
    }

    // Blokları sütunun altından başlayarak yerleştir
    let writeRow = ROWS - 1;
    for (let i = columnBlocks.length - 1; i >= 0; i--) {
      const updatedBlock = { ...columnBlocks[i], row: writeRow, col };
      newMatrix[writeRow][col] = updatedBlock;
      writeRow--;
    }
    // Kalan üst satırlar null (boş) olarak kalır
  }

  return newMatrix;
}

/**
 * Tüm sütunlar için yeni düşen blok kuyruğu oluşturur.
 * Ceza mekanizmasında veya ilk başlatmada kullanılır.
 *
 * @returns {Array<Object>} Her sütun için bir düşen blok
 */
export function createFallingBlocksForAllColumns() {
  return Array.from({ length: COLS }, (_, col) => spawnBlockForColumn(col));
}

/**
 * Tek bir sütun için yeni bir düşen blok oluşturur.
 * Normal oyun akışında her sütuna sırayla çağrılır.
 *
 * @param {number} col - Sütun indeksi
 * @returns {Object} Yeni düşen blok
 */
export function createFallingBlockForColumn(col) {
  return spawnBlockForColumn(col);
}