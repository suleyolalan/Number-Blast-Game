import { spawnBlockForColumn } from './blockSpawner';
import { COLS, ROWS } from './matrixEngine';

// ─── Tek Blok Düşme ─────────────────────────────────────────

/**
 * Bloğu bir adım aşağı taşır.
 * Zemine veya başka bloğa değdiyse landed: true döner.
 *
 * TEST NOTLARI:
 *   - row: -1 (ekran dışı) → nextRow: 0, boşsa landed: false ✓
 *   - nextRow >= ROWS → landed: true (zemin) ✓
 *   - nextRow'da aynı sütunda blok varsa → landed: true ✓
 *   - nextRow boşsa → { block: {..., row: nextRow}, landed: false } ✓
 */
export function stepBlockDown(matrix, fallingBlock) {
  if (!fallingBlock) return { block: null, landed: false };

  const { row, col } = fallingBlock;
  const nextRow = row + 1;

  // Sütun sınır kontrolü (güvenlik)
  if (col < 0 || col >= COLS) return { block: fallingBlock, landed: true };

  const hitBottom = nextRow >= ROWS;
  const hitBlock  = !hitBottom && matrix[nextRow] && matrix[nextRow][col] !== null;

  if (hitBottom || hitBlock) {
    return { block: fallingBlock, landed: true };
  }

  return { block: { ...fallingBlock, row: nextRow }, landed: false };
}

/**
 * Düşen bloğu sütunun en alt boş satırına yerleştirir.
 *
 * TEST NOTLARI:
 *   - Sütun tamamen doluysa → gameOver: true, landed: false ✓
 *   - Normal iniş → landingRow doğru hesaplanıyor ✓
 *   - row 0 dolunca → gameOver: true ✓ (isGameOver ikinci kez kontrol eder)
 *   - Gravity sonrası boşluk oluştuysa → yeni blok o boşluğa oturur ✓
 *
 * App.js bağlantısı:
 *   placeBlock(matrix, fallingBlock) → result.gameOver → doGameOver() tetiklenir
 */
export function landBlock(matrix, fallingBlock) {
  if (!fallingBlock) return { matrix, landed: false, gameOver: false };

  const { col } = fallingBlock;

  // Sütun sınır kontrolü
  if (col < 0 || col >= COLS) return { matrix, landed: false, gameOver: false };

  // Sütunun en alt boş satırını bul
  let landingRow = -1;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (matrix[row][col] === null) {
      landingRow = row;
      break;
    }
  }

  // Sütun tamamen dolu → oyun bitti
  if (landingRow < 0) {
    return { matrix, landed: false, gameOver: true };
  }

  const updatedMatrix = matrix.map(r => [...r]);
  updatedMatrix[landingRow][col] = { ...fallingBlock, row: landingRow };

  // row 0 doldu mu kontrol et
  const gameOver = updatedMatrix[0][col] !== null;
  return { matrix: updatedMatrix, landed: true, gameOver };
}

// ─── Gravity ─────────────────────────────────────────────────

/**
 * Patlama sonrası gravity: her sütundaki bloklar aşağı kayar.
 * Üst boşluklar NULL kalır — sonraki düşen bloklarla zamanla dolar.
 *
 * TEST NOTLARI:
 *   - Boş matris → boş matris döner ✓
 *   - Ortadaki blok silinince → üsttekiler bir satır aşağı kayar ✓
 *   - Farklı sütunlar birbirini etkilemez ✓
 *   - Blokların col ve row değerleri güncellenir ✓
 *   - Sütun tamamen boşsa → değişmez ✓
 *
 * App.js bağlantısı:
 *   removeBlocksAndApplyGravity → applyGravity çağırır
 */
export function applyGravity(matrix) {
  const newMatrix = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  for (let col = 0; col < COLS; col++) {
    // Sütundaki mevcut blokları sırayla topla (üstten alta)
    const blocks = [];
    for (let row = 0; row < ROWS; row++) {
      if (matrix[row][col] !== null && matrix[row][col] !== undefined) {
        blocks.push(matrix[row][col]);
      }
    }

    // Blokları matrisin altından yukarı yerleştir
    let writeRow = ROWS - 1;
    for (let i = blocks.length - 1; i >= 0; i--) {
      newMatrix[writeRow][col] = {
        ...blocks[i],
        row: writeRow,  // row güncellenir
        col,            // col aynı kalır
      };
      writeRow--;
    }
    // writeRow'un üstü zaten null — boşluk korunur
  }

  return newMatrix;
}

// ─── Spawn ───────────────────────────────────────────────────

/**
 * Belirtilen sütun için ekran dışından (row: -1) yeni blok üretir.
 *
 * App.js bağlantısı:
 *   getNextFallingBlock(col) → matrixEngine üzerinden çağrılır
 */
export function createFallingBlockForColumn(col) {
  return spawnBlockForColumn(col);
}

// ─── Rastgele Sütun Kuyruğu ──────────────────────────────────

/**
 * Her COLS blokta bir tüm sütunlar farklı sırayla kullanılır.
 * Aynı anda yalnızca BİR sütundan BİR blok düşer.
 *
 * Kullanım:
 *   const queue = createColumnQueue();
 *   const col   = queue.next();   // rastgele sütun
 *   queue.reset();                // yeni oyun başlayınca
 *
 * App.js bağlantısı:
 *   colQueue = useRef(createColumnQueue())
 *   colQueue.current.next()  → spawnNextBlock içinde
 *   colQueue.current.reset() → handleNewGame / handleRestart içinde
 */
/**
 * Tam rastgele (bağımsız) sütun kuyruğu oluşturur.
 * Geçmiş seçimleri hafızada tutmaz, her çağrıda 0 ile (COLS - 1) arasında rastgele indeks döner.
 */
export function createColumnQueue() {
  return {
    next() {
      // Her blok için geçmişten bağımsız olarak 0-7 (COLS) arası rastgele bir sütun indeksi üretilir.
      return Math.floor(Math.random() * COLS);
    },
    reset() {
      // Sistem tam rastgeleliğe geçirildiği için kuyruk hafızası (state) bulunmamaktadır.
      // app/index.js içerisindeki reset() çağrılarının çalışma zamanı hatası (Runtime Error) 
      // vermemesi adına bu fonksiyon yapısal olarak korunmuş, ancak içi boş bırakılmıştır.
    },
  };
}
