// ============================================================
// app/index.js — Ana Oyun Dosyası
// ============================================================

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
  ROWS,
  validateMove,
} from '../src/matrix/matrixEngine';

import { getDropIntervalSeconds } from '../src/logic/speedManager';
import { refreshTarget } from '../src/logic/targetNumber';
import { createWrongMoveCounter, handleWrongMove } from '../src/logic/wrongMoveCounter';
import { createColumnQueue } from '../src/matrix/blockFall';
import { spawnRowOfFallingBlocks } from '../src/matrix/blockSpawner';

// ── refreshTarget guard ───────────────────────────────────────
function safeTarget(mat, currentTarget = null) {
  let result;
  try {
    const raw = refreshTarget(mat, currentTarget);
    if (typeof raw === 'number' && !isNaN(raw)) result = raw;
    else if (raw && typeof raw === 'object' && typeof raw.number === 'number') result = raw.number;
    else {
      const n = Number(raw);
      result = (!isNaN(n) && n > 0) ? n : Math.floor(Math.random() * 19) + 2;
    }
  } catch (_) {
    result = Math.floor(Math.random() * 19) + 2;
  }
  if (currentTarget !== null && result === currentTarget) {
    result = result >= 36 ? 2 : result + 1;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────

export default function Page() {

  const [matrix,             setMatrix]             = useState(() => createInitialMatrix());
  const [fallingBlock,       setFallingBlock]       = useState(null);
  const [chain,              setChain]              = useState([]);
  const [score,              setScore]              = useState(0);
  const [highScore,          setHighScore]          = useState(0);
  const [totalMoves,         setTotalMoves]         = useState(0);
  const [lastPoints,         setLastPoints]         = useState(0);
  const [targetNumber,       setTargetNumber]       = useState(0);
  const [wrongCounter,       setWrongCounter]       = useState(() => createWrongMoveCounter());
  const [scores,             setScores]             = useState([]);
  const [showLeaderboard,    setShowLeaderboard]    = useState(false);
  const [gameOver,           setGameOver]           = useState(false);

  // ── Ref'ler ───────────────────────────────────────────────
  const matrixRef      = useRef(matrix);
  const fallingRef     = useRef(null);       // şu an düşen blok
  const scoreRef       = useRef(0);
  const gameOverRef    = useRef(false);
  const doGameOverRef  = useRef(null);
  const colQueue       = useRef(createColumnQueue());
  const stepTimer      = useRef(null);       // 500ms adım timer'ı

  useEffect(() => { matrixRef.current  = matrix; }, [matrix]);
  useEffect(() => { scoreRef.current   = score;  }, [score]);

  // ── Oyun Sonu ─────────────────────────────────────────────
  const doGameOver = useCallback(() => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    clearInterval(stepTimer.current);
    setGameOver(true);
    setScores(prev => [...prev, {
      name:  'Oyuncu',
      score: scoreRef.current,
      date:  new Date().toLocaleDateString('tr-TR'),
    }]);
    Alert.alert('Oyun Bitti!', `Puanın: ${scoreRef.current}`, [
      { text: 'Tamam', onPress: () => setShowLeaderboard(true) },
    ]);
  }, []);

  useEffect(() => { doGameOverRef.current = doGameOver; }, [doGameOver]);

  // ── Yeni blok spawn et, adım timer'ını başlat ─────────────
  const spawnNextBlock = useCallback(() => {
    if (gameOverRef.current) return;
    const col  = colQueue.current.next();
    const newB = getNextFallingBlock(col);
    fallingRef.current = newB;
    setFallingBlock(newB);

    // 1000ms'de bir adım aşağı in
    clearInterval(stepTimer.current);
    stepTimer.current = setInterval(() => {
      if (gameOverRef.current) { clearInterval(stepTimer.current); return; }

      const currentMatrix  = matrixRef.current;
      const currentFalling = fallingRef.current;
      if (!currentFalling) { clearInterval(stepTimer.current); return; }

      const { block, landed } = moveBlockDown(currentMatrix, currentFalling);

      if (!landed) {
        // Bir adım aşağı
        fallingRef.current = block;
        setFallingBlock({ ...block });
        return;
      }

      // Blok indi → matrise yerleştir
      clearInterval(stepTimer.current);
      const result = placeBlock(currentMatrix, block);
      setMatrix(result.matrix);
      fallingRef.current = null;
      setFallingBlock(null);

      if (result.gameOver) {
        doGameOverRef.current();
        return;
      }

      spawnNextBlock();
    }, 1000);
  }, []);

  // ── İlk hedef + ilk blok ─────────────────────────────────
  useEffect(() => {
    setTargetNumber(safeTarget(matrix));
    spawnNextBlock();
    return () => {
      clearInterval(stepTimer.current);
    };
  }, []); // eslint-disable-line

  // ── Hücreye Basılınca ─────────────────────────────────────
  const handleCellPress = useCallback((row, col) => {
    if (gameOver) return;
    const cell = matrixRef.current[row]?.[col];
    if (!cell) return;
    const block = typeof cell === 'object'
      ? cell
      : { row, col, number: cell, value: cell, id: `${row}_${col}` };
    // Seçili bloğa tekrar basılınca zincirden çıkar
    const isAlreadySelected = chain.some(b => b.row === row && b.col === col);
    if (isAlreadySelected) {
      setChain(prev => prev.filter(b => !(b.row === row && b.col === col)));
      return;
    }
    
    const result = addBlockToChain(block, chain);
    if (result.success) setChain(result.chain);
  }, [chain, gameOver]);

  // ── Onayla ────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!isChainLengthValid(chain)) return;
    const { isValid } = validateMove(chain, targetNumber);

    if (isValid) {
      const points   = calculateSelectionScore(chain);
      const newScore = score + points;
      const newMatrix = removeBlocksAndApplyGravity(matrixRef.current, chain);

      setMatrix(newMatrix);
      setScore(newScore);
      setLastPoints(points);
      setTotalMoves(t => t + 1);
      setTargetNumber(safeTarget(newMatrix, targetNumber));
      setChain(resetChain());
      if (newScore > highScore) setHighScore(newScore);
      setTimeout(() => setLastPoints(0), 2000);

    } else {
      const result = handleWrongMove(wrongCounter);
      setChain(resetChain());
      setTargetNumber(safeTarget(matrixRef.current, targetNumber));

      if (result.shouldPenalize) {
        setWrongCounter({ count: 3, isPenalty: true });
        setTimeout(() => setWrongCounter(createWrongMoveCounter()), 500);
        // Ceza: tüm sütunlardan yeni blok indir
        setMatrix(prev => {
          const penaltyRow = spawnRowOfFallingBlocks(COLS).map((b, col) => ({
            ...b, row: 0, col,
          }));
          return [penaltyRow, ...prev.slice(0, ROWS - 1)];
        });
      } else {
        setWrongCounter(result.counter);
      }
    }
  }, [chain, targetNumber, score, highScore, wrongCounter]);

  // ── Yeni Oyun ─────────────────────────────────────────────
  const handleNewGame = useCallback(() => {
    clearInterval(stepTimer.current);
    gameOverRef.current = false;
    fallingRef.current  = null;
    colQueue.current.reset();

    const newMatrix = createInitialMatrix();
    setMatrix(newMatrix);
    setFallingBlock(null);
    setChain(resetChain());
    setScore(0);
    setTotalMoves(0);
    setLastPoints(0);
    setTargetNumber(safeTarget(newMatrix));
    setWrongCounter(createWrongMoveCounter());
    setGameOver(false);
    setShowLeaderboard(false);

    // Kısa gecikme sonra ilk bloğu başlat
    setTimeout(spawnNextBlock, 500);
  }, [spawnNextBlock]);

  // ── Render ────────────────────────────────────────────────
  const selectedCells  = chain.map(b => [b.row, b.col]);
  const selectedValues = chain.map(b => b.number ?? b.value ?? 0);

  // Düşen bloğu display matrisine ekle (sadece görsel)
  const displayMatrix = matrixRef.current.map(row =>
    row.map(cell => (cell ? cell.number : null))
  );
  if (fallingBlock && fallingBlock.row >= 0 && fallingBlock.row < ROWS) {
    displayMatrix[fallingBlock.row][fallingBlock.col] = fallingBlock.number;
  }

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
        matrix={displayMatrix}
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
  root:       { flex: 1, backgroundColor: '#0f0f23' },
  buttonRow:  { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#16213e' },
  btn:        { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#2ecc71' },
  leaderBtn:  { flex: 0, paddingHorizontal: 16, backgroundColor: '#f39c12' },
  newGameBtn: { flex: 0, paddingHorizontal: 16, backgroundColor: '#9b59b6' },
  btnDisabled:{ backgroundColor: '#444', opacity: 0.5 },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 14 },
});