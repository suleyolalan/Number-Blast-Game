// ============================================================
// GameBoard.jsx — 8×10 oyun tahtası grid bileşeni
//
// Bu bileşen tüm oyun alanını çizer.
// Her satır ve sütundaki hücre için Block bileşenini kullanır.
// ============================================================

import { Dimensions, StyleSheet, View } from 'react-native';
import Block from './Block'; // Tek blok bileşenimizi içe aktarıyoruz

// -------------------------------------------------------
// Sabitler — PDF'te belirtilen matris boyutu
// -------------------------------------------------------
const ROWS = 10; // satır sayısı
const COLS = 8;  // sütun sayısı

// -------------------------------------------------------
// Ekran genişliğini alarak blok boyutunu hesapla.
// Telefon ekranı ne kadar büyük/küçük olursa olsun
// bloklar sığacak şekilde otomatik boyutlanır.
//
// Örnek: ekran 390px genişse
//   padding (8+8) = 16
//   bloklar arası boşluk: 8 sütun × 3px = 24
//   kalan alan: 390 - 16 - 24 = 350
//   blok boyutu: 350 / 8 = ~43px
// -------------------------------------------------------
const screenWidth = Dimensions.get('window').width;
const BOARD_PADDING = 8;
const CELL_GAP = 3;
const CELL_SIZE = Math.floor(
  (screenWidth - BOARD_PADDING * 2 - CELL_GAP * (COLS - 1)) / COLS
);

// -------------------------------------------------------
// GameBoard bileşeni
//
// Props:
//   matrix        → 10×8'lik 2D dizi. Her eleman 1-9 arası
//                   sayı ya da null (boş hücre).
//                   Kullanım: matrix[satır][sütun]
//
//   selectedCells → Seçili hücrelerin koordinat listesi.
//                   Örnek: [[2,3], [2,4], [3,4]]
//                   (3. kişinin adjacencyChecker'ı bu listeyi yönetir)
//
//   onCellPress   → Kullanıcı bir bloğa dokunduğunda çağrılır.
//                   App.jsx'e (satır, sütun, değer) iletir.
//                   Örnek: onCellPress(2, 3, 5)
// -------------------------------------------------------
const GameBoard = ({ matrix = [], selectedCells = [], onCellPress }) => {

  // Verilen (satır, sütun) çiftinin seçili olup olmadığını kontrol et
  // Array.some → dizide en az bir eleman koşulu sağlıyorsa true döner
  const isSelected = (row, col) =>
    selectedCells.some(([r, c]) => r === row && c === col);

  return (
    // Oyun alanının dış kapsayıcısı
    <View style={styles.board}>

      {/* 10 satırı döngüyle oluştur */}
      {Array.from({ length: ROWS }, (_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>

          {/* Her satırda 8 sütunu döngüyle oluştur */}
          {Array.from({ length: COLS }, (_, colIdx) => {

            // Bu hücrenin değerini matrisden al
            // ?. → matrix[rowIdx] yoksa hata vermez, undefined döner
            // ?? null → undefined ise null kullan (Block boş hücre çizer)
            const cell = matrix[rowIdx]?.[colIdx] ?? null;
            const value = cell && typeof cell === 'object' ? cell.number : cell;

            // Bu hücre seçili mi?
            const selected = isSelected(rowIdx, colIdx);

            return (
              <Block
                key={colIdx}
                value={value}
                isSelected={selected}
                size={CELL_SIZE}
                // Bloka dokunulunca App.jsx'e haber ver
                // value varsa (boş değilse) tetikle
                onPress={() => value && onCellPress?.(rowIdx, colIdx, value)}
              />
            );
          })}

        </View>
      ))}

    </View>
  );
};

// -------------------------------------------------------
// Stiller
// -------------------------------------------------------
const styles = StyleSheet.create({
  board: {
    flex: 1,                        // kalan alanı doldur
    backgroundColor: '#0f0f23',     // koyu lacivert arka plan
    padding: BOARD_PADDING,
    justifyContent: 'space-evenly', // satırları eşit aralıklarla dağıt
  },
  row: {
    flexDirection: 'row',           // blokları yatayda yan yana diz
    justifyContent: 'space-evenly', // sütunları eşit aralıklarla dağıt
  },
});

export default GameBoard;
// ROWS ve COLS'u dışa aktar — App.jsx ve diğer dosyalar kullanabilsin
export { CELL_SIZE, COLS, ROWS };

