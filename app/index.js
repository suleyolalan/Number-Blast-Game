import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import GameBoard from '../src/components/GameBoard';
import Header from '../src/components/Header';
import Leaderboard from '../src/components/Leaderboard';
import ScoreBoard from '../src/components/ScoreBoard';

import { isChainLengthValid } from '../src/rules/blockLimitRule';
import { addBlockToChain, resetChain } from '../src/rules/selectionChain';

import {
  calculateSelectionScore,
  COLS,
  createInitialMatrix,
  getNextFallingBlock,
  moveBlockDown,
  placeBlock,
  removeBlocksAndApplyGravity,
  validateMove,
} from '../src/matrix/matrixEngine';

import { getDropInterval, getDropIntervalSeconds } from '../src/logic/speedManager';
import { refreshTarget } from '../src/logic/targetNumber';
import { createWrongMoveCounter, handleWrongMove } from '../src/logic/wrongMoveCounter';
import { spawnRowOfFallingBlocks } from '../src/matrix/blockSpawner';

export default function Page() {
  const [matrix, setMatrix] = useState(() => createInitialMatrix());
  const [fallingBlocks, setFallingBlocks] = useState(() =>
    Array.from({ length: COLS }, (_, col) => getNextFallingBlock(col))
  );
  const [chain, setChain] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [targetNumber, setTargetNumber] = useState(() => {
    const m = createInitialMatrix();
    const t = refreshTarget(m);
    return typeof t === 'number' ? t : Number(t) || 2;
  });
  const [wrongCounter, setWrongCounter] = useState(() => createWrongMoveCounter());
  const [scores, setScores] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const dropTimer = useRef(null);
  const matrixRef = useRef(matrix);
  const fallingRef = useRef(fallingBlocks);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => { matrixRef.current = matrix; }, [matrix]);
  useEffect(() => { fallingRef.current = fallingBlocks; }, [fallingBlocks]);
  useEffect(() => { scoreRef.current = score; }, [score]);

const doGameOver = useCallback(() => {
  if (gameOverRef.current) return;
  gameOverRef.current = true;
  clearInterval(dropTimer.current);
  setGameOver(true);
  setScores(prev => [...prev, {
    name: 'Oyuncu',
    score: scoreRef.current,
    date: new Date().toLocaleDateString('tr-TR'),
  }]);
  Alert.alert('Oyun Bitti!', `Puanın: ${scoreRef.current}`, [
    { text: 'Tamam', onPress: () => setShowLeaderboard(true) },
  ]);
}, []);

  const tick = useCallback(() => {
    const prevMatrix = matrixRef.current;
    const prevFalling = fallingRef.current;
    let newMatrix = prevMatrix.map(r => [...r]);
    const nextFalling = [];
    let shouldGameOver = false;

    for (let col = 0; col < COLS; col++) {
      const fb = prevFalling[col];
      if (!fb) { nextFalling.push(getNextFallingBlock(col)); continue; }

      const { block, landed } = moveBlockDown(newMatrix, fb);

      if (landed) {
        const result = placeBlock(newMatrix, block);
        newMatrix = result.matrix;
        if (result.gameOver) { shouldGameOver = true; nextFalling.push(null); }
        else nextFalling.push(getNextFallingBlock(col));
      } else {
        nextFalling.push(block);
      }
    }

    setMatrix(newMatrix);
    setFallingBlocks(nextFalling);
    if (shouldGameOver) doGameOver();
  }, [doGameOver]);

  const dropInterval = getDropInterval(score);

  useEffect(() => {
    if (gameOver) return;
    clearInterval(dropTimer.current);
    dropTimer.current = setInterval(tick, dropInterval);
    return () => clearInterval(dropTimer.current);
  }, [dropInterval, gameOver, tick]);



  const handleCellPress = useCallback((row, col) => {
    if (gameOver) return;
    const cell = matrixRef.current[row]?.[col];
    if (!cell) return;
    const block = typeof cell === 'object'
      ? cell
      : { row, col, number: cell, value: cell, id: `${row}_${col}` };
    const result = addBlockToChain(block, chain);
    if (result.success) setChain(result.chain);
  }, [chain, gameOver]);

  const handleConfirm = useCallback(() => {
    if (!isChainLengthValid(chain)) return;
    const { isValid } = validateMove(chain, targetNumber);

    if (isValid) {
      const points = calculateSelectionScore(chain);
      const newScore = score + points;
      const newMatrix = removeBlocksAndApplyGravity(matrix, chain);
      const newTarget = refreshTarget(newMatrix);

      setMatrix(newMatrix);
      setScore(newScore);
      setLastPoints(points);
      setTotalMoves(t => t + 1);
      setTargetNumber(typeof newTarget === 'number' ? newTarget : Number(newTarget) || 2);
      setChain(resetChain());
      setWrongCounter(createWrongMoveCounter());
      if (newScore > highScore) setHighScore(newScore);
      setTimeout(() => setLastPoints(0), 2000);
    } else {
      const result = handleWrongMove(wrongCounter);
      setWrongCounter(result.counter);
      setChain(resetChain());
      if (result.shouldPenalize) {
        setFallingBlocks(spawnRowOfFallingBlocks(COLS));
      }
    }
  }, [chain, targetNumber, matrix, score, highScore, wrongCounter]);

  const handleNewGame = useCallback(() => {
    const newMatrix = createInitialMatrix();
    gameOverRef.current = false;
    setMatrix(newMatrix);
    setFallingBlocks(Array.from({ length: COLS }, (_, col) => getNextFallingBlock(col)));
    setChain(resetChain());
    setScore(0);
    setTotalMoves(0);
    setLastPoints(0);
    const t = refreshTarget(newMatrix);
    setTargetNumber(typeof t === 'number' ? t : Number(t) || 2);
    setWrongCounter(createWrongMoveCounter());
    setGameOver(false);
    setShowLeaderboard(false);
  }, []);

  const selectedCells = chain.map(b => [b.row, b.col]);
  const selectedValues = chain.map(b => b.number ?? b.value ?? 0);

  return (
    <SafeAreaView style={styles.root}>
      <Header
        score={score}
        highScore={highScore}
        targetNumber={targetNumber}
        wrongCount={wrongCounter.count}
        dropInterval={getDropIntervalSeconds(score)}
      />
      <GameBoard
        matrix={matrix}
        fallingBlocks={fallingBlocks}
        selectedCells={selectedCells}
        onCellPress={handleCellPress}
      />
      <ScoreBoard
        score={score}
        lastMovePoints={lastPoints}
        selectedValues={selectedValues}
        totalMoves={totalMoves}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.btn, styles.cancelBtn]}
          onPress={() => setChain(resetChain())}
          disabled={chain.length === 0}
        >
          <Text style={styles.btnText}>✕ İptal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.confirmBtn, chain.length < 2 && styles.btnDisabled]}
          onPress={handleConfirm}
          disabled={chain.length < 2}
        >
          <Text style={styles.btnText}>✓ Onayla ({chain.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.leaderBtn]}
          onPress={() => setShowLeaderboard(true)}
        >
          <Text style={styles.btnText}>🏆</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.newGameBtn]}
          onPress={handleNewGame}
        >
          <Text style={styles.btnText}>↺</Text>
        </TouchableOpacity>
      </View>
      <Leaderboard
        scores={scores}
        currentScore={score}
        visible={showLeaderboard}
        onClose={() => { setShowLeaderboard(false); if (gameOver) handleNewGame(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f23' },
  buttonRow: { flexDirection: 'row', padding: 30, gap: 8, backgroundColor: '#16213e' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#2ecc71' },
  cancelBtn: { backgroundColor: '#e74c3c' },
  leaderBtn: { flex: 0, paddingHorizontal: 16, backgroundColor: '#f39c12' },
  newGameBtn: { flex: 0, paddingHorizontal: 16, backgroundColor: '#9b59b6' },
  btnDisabled: { backgroundColor: '#444', opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});