import { useState } from 'react';
import { SafeAreaView } from 'react-native';
import GameBoard from '../src/components/GameBoard';
import Header from '../src/components/Header';
import ScoreBoard from '../src/components/ScoreBoard';

const testMatrix = Array.from({ length: 10 }, (_, r) =>
  Array.from({ length: 8 }, () =>
    r >= 7 ? Math.ceil(Math.random() * 9) : null
  )
);

export default function Page() {
  const [selected, setSelected] = useState([]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f23' }}>
      <Header
        score={120}
        highScore={350}
        targetNumber={15}
        wrongCount={1}
        dropInterval={4}
      />
      <GameBoard
        matrix={testMatrix}
        selectedCells={selected}
        onCellPress={(r, c, v) => {
          setSelected(prev =>
            prev.some(([pr, pc]) => pr === r && pc === c)
              ? prev.filter(([pr, pc]) => !(pr === r && pc === c))
              : [...prev, [r, c]]
          );
        }}
      />
      <ScoreBoard
        score={120}
        selectedValues={selected.map(([r, c]) => testMatrix[r][c])}
        totalMoves={0}
        lastMovePoints={0}
      />
    </SafeAreaView>
  );
}