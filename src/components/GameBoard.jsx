// ============================================================
// GameBoard.jsx — 8×10 oyun tahtası grid bileşeni
// ============================================================

import { Dimensions, StyleSheet, View } from 'react-native';
import Block from './Block';

const ROWS = 10;
const COLS = 8;

const screenWidth = Dimensions.get('window').width;
const BOARD_PADDING = 8;
const CELL_GAP = 3;
const CELL_SIZE = Math.floor(
  (screenWidth - BOARD_PADDING * 2 - CELL_GAP * (COLS - 1)) / COLS
);

const GameBoard = ({ matrix = [], fallingBlocks = [], selectedCells = [], onCellPress }) => {

  // Düşen blokları hızlı erişim için map'e çevir: "row_col" → block
  const fallingMap = {};
  fallingBlocks.forEach(fb => {
    if (fb && fb.row >= 0 && fb.row < ROWS) {
      fallingMap[`${fb.row}_${fb.col}`] = fb;
    }
  });

  const isSelected = (row, col) =>
    selectedCells.some(([r, c]) => r === row && c === col);

  return (
    <View style={styles.board}>
      {Array.from({ length: ROWS }, (_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {Array.from({ length: COLS }, (_, colIdx) => {

            const cell = matrix[rowIdx]?.[colIdx] ?? null;
            const falling = fallingMap[`${rowIdx}_${colIdx}`];

            // Düşen blok varsa onu göster, yoksa matrix'teki hücreyi göster
            const activeCell = falling || cell;
            const value = activeCell && typeof activeCell === 'object'
              ? activeCell.number
              : activeCell;

            const selected = isSelected(rowIdx, colIdx);

            return (
              <Block
                key={colIdx}
                value={value}
                isSelected={selected}
                size={CELL_SIZE}
                onPress={() => value && onCellPress?.(rowIdx, colIdx, value)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    flex: 1,
    backgroundColor: '#0f0f23',
    padding: BOARD_PADDING,
    justifyContent: 'space-evenly',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

export default GameBoard;
export { CELL_SIZE, COLS, ROWS };
