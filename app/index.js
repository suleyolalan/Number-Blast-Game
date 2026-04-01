// ============================================================
// app/index.js — Ana Oyun Dosyası
//
// Kişi 1 → logic/
// Kişi 2 → components/ 
// Kişi 3 → rules/
// Kişi 4 → matrix/
// ============================================================

import { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ── Kişi 2: Görsel bileşenler ───────────
import GameBoard from '../src/components/GameBoard';
import Header from '../src/components/Header';
import Leaderboard from '../src/components/Leaderboard';
import ScoreBoard from '../src/components/ScoreBoard';

// ── Kişi 1: Logic ──────────────────────────────────────────
// targetNumber.js → refreshTarget grid'e bakarak ulaşılabilir hedef üretir
import { refreshTarget } from '../src/logic/targetNumber';
// selectionChecker.js → validateMove hamle kontrolü, calculateScore puan hesabı
import { calculateScore, validateMove } from '../src/logic/selectionChecker';
// wrongMoveCounter.js → handleWrongMove sayacı artırır + ceza kontrol eder
import { createWrongMoveCounter, handleWrongMove } from '../src/logic/wrongMoveCounter';

// ── Kişi 3: Rules ──────────────────────────────────────────
// selectionChain.js → addBlockToChain zincire blok ekler, resetChain sıfırlar
import { addBlockToChain, resetChain } from '../src/rules/selectionChain';
// blockLimitRule.js → isChainLengthValid min2 max4 kontrolü
import { isChainLengthValid } from '../src/rules/blockLimitRule';

// ── Kişi 4: Matrix ─────────────────────────────────────────
// matrixEngine.js → createInitialMatrix, removeBlocksAndApplyGravity, isGameOver
import {
  createInitialMatrix,
  isGameOver,
  removeBlocksAndApplyGravity,
} from '../src/matrix/matrixEngine';
// blockSpawner.js → spawnFullRow ceza/düşme için tam satır üretir
import { spawnFullRow } from '../src/matrix/blockSpawner';

// ── Sabitler ────────────────────────────────────────────────
// Vize aşamasında blok düşme süresi sabittir (5 saniye)

const FIXED_DROP_INTERVAL = 5;

export default function Page() {

  // ── STATE'LER ───────────────────────────────────────────

  // Oyun matrisi — 4. kişinin createInitialMatrix() ile başlar
  // Alt 3 satır blok dolu, üstü null (boş)
  const [matrix, setMatrix] = useState(() => createInitialMatrix());

  // Seçim zinciri — 3. kişinin selectionChain yapısını kullanır
  // Her eleman 4. kişinin blok objesi: { row, col, number, color, id, ... }
  const [chain, setChain] = useState([]);

  // Puan ve en yüksek skor
  const [score, setScore]         = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Hedef sayı — 1. kişinin refreshTarget(grid) ile üretilir
  const [targetNumber, setTargetNumber] = useState(0);

  // Yanlış hamle sayacı — 1. kişinin obje yapısı: { count, isPenalty }
  const [wrongCounter, setWrongCounter] = useState(() => createWrongMoveCounter());

  // Son hamlede kazanılan puan (ScoreBoard gösterimi için)
  const [lastMovePoints, setLastMovePoints] = useState(0);

  // Toplam doğru hamle sayısı
  const [totalMoves, setTotalMoves] = useState(0);

  // Liderlik tablosu modal açık mı?
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);

  // Kaydedilen skor listesi
  const [scores, setScores] = useState([]);

  // Oyun bitti mi?
  const [gameOver, setGameOver] = useState(false);

  // Blok düşme zamanlayıcısı — temizleyebilmek için ref'te tutuyoruz
  const dropTimer = useRef(null);

  // ── İLK AÇILIŞTA HEDEF SAYI ÜRET ───────────────────────
  // Matrix hazır olduktan sonra refreshTarget çağrılır
  useEffect(() => {
    setTargetNumber(refreshTarget(matrix));
  }, []);

  // ── BLOK DÜŞME ZAMANLAYICISI ────────────────────────────
  // Her FIXED_DROP_INTERVAL saniyede bir yukarıdan yeni satır iner
  useEffect(() => {
    if (gameOver) return;

    if (dropTimer.current) clearInterval(dropTimer.current);

    dropTimer.current = setInterval(() => {
      setMatrix(prev => {
        // 4. kişinin spawnFullRow ile yeni bir satır üret
        const newRow = spawnFullRow(0);

        // Mevcut matrisi bir satır aşağı kaydır, en üste yeni satırı ekle
        const shifted = [newRow, ...prev.slice(0, prev.length - 1)];

        // Oyun sonu kontrolü: 4. kişinin isGameOver (0. satırda dolu hücre var mı)
        if (isGameOver(shifted)) {
          clearInterval(dropTimer.current);
          setGameOver(true);
          setScores(s => [...s, {
            name: 'Oyuncu',
            score,
            date: new Date().toLocaleDateString('tr-TR'),
          }]);
          setLeaderboardVisible(true);
        }

        return shifted;
      });
    }, FIXED_DROP_INTERVAL * 1000);

    return () => clearInterval(dropTimer.current);
  }, [gameOver]);

  // ── HÜCREYE BASILINCA ────────────────────────────────────
  const handleCellPress = (row, col) => {
    if (gameOver) return;

    // Matristeki gerçek blok nesnesini al (4. kişinin { row, col, number, id, ... } objesi)
    const block = matrix[row]?.[col];
    if (!block) return;

    // Zincirin sonundaki bloğa tekrar basılırsa → geri al
    const lastBlock = chain[chain.length - 1];
    if (lastBlock && lastBlock.row === row && lastBlock.col === col) {
      setChain(prev => prev.slice(0, -1));
      return;
    }

    // 3. kişinin addBlockToChain: komşu mu? limit aşıldı mı? kontrol eder
    // { success: bool, chain: [...], reason?: string } döndürür
    const result = addBlockToChain(block, chain);
    if (result.success) {
      setChain(result.chain);
      setLastMovePoints(0);
    }
  };

  // ── ONAYLA BUTONUNA BASILINCA ────────────────────────────
  const handleConfirm = () => {
    // 3. kişinin isChainLengthValid: en az 2, en fazla 4 blok seçili mi?
    if (!isChainLengthValid(chain)) return;

    // 1. kişinin validateMove için blokları { row, col, value } formatına çevir
    // (selectionChecker.js 'value' alanını kullanıyor, 4. kişinin blok objesi 'number' kullanıyor)
    const blocksForValidation = chain.map(b => ({
      row:   b.row,
      col:   b.col,
      value: b.number,
    }));

    // 1. kişinin validateMove: { isValid, sum, reason } döndürür
    const result = validateMove(blocksForValidation, targetNumber);

    if (result.isValid) {
      // ── DOĞRU HAMLE ──

      // 1. kişinin calculateScore ile kazanılan puanı hesapla
      const earned   = calculateScore(blocksForValidation);
      const newScore = score + earned;

      setLastMovePoints(earned);
      setScore(newScore);
      setTotalMoves(t => t + 1);
      if (newScore > highScore) setHighScore(newScore);

      // 4. kişinin removeBlocksAndApplyGravity: seçili blokları sil, gravity uygula
      const updatedMatrix = removeBlocksAndApplyGravity(matrix, chain);
      setMatrix(updatedMatrix);

      // Zinciri sıfırla, yanlış sayacını sıfırla, yeni hedef üret
      setChain(resetChain());
      setWrongCounter(createWrongMoveCounter());
      setTargetNumber(refreshTarget(updatedMatrix));

    } else {
      // ── YANLIŞ HAMLE ──

      // 1. kişinin handleWrongMove: { counter, shouldPenalize } döndürür
      const { counter, shouldPenalize } = handleWrongMove(wrongCounter);
      setWrongCounter(counter);
      setChain(resetChain());

      // 3 yanlışta ceza: yukarıdan yeni satır iner
      if (shouldPenalize) {
        setMatrix(prev => {
          const newRow = spawnFullRow(0);
          return [newRow, ...prev.slice(0, prev.length - 1)];
        });
        setWrongCounter(createWrongMoveCounter()); // sayacı sıfırla
      }
    }
  };

  // ── İPTAL BUTONUNA BASILINCA ────────────────────────────
  const handleCancel = () => {
    setChain(resetChain());
    setLastMovePoints(0);
  };

  // ── YENİDEN BAŞLAT ───────────────────────────────────────
  const handleRestart = () => {
    const freshMatrix = createInitialMatrix();
    setMatrix(freshMatrix);
    setChain(resetChain());
    setScore(0);
    setTargetNumber(refreshTarget(freshMatrix));
    setWrongCounter(createWrongMoveCounter());
    setLastMovePoints(0);
    setTotalMoves(0);
    setGameOver(false);
    setLeaderboardVisible(false);
  };

  // ── RENDER İÇİN YARDIMCI VERİLER ────────────────────────

  // Header'a wrongCount sayısı lazım (obje değil sayı)
  const wrongCount = wrongCounter.count;

  // GameBoard [[row, col]] formatında bekliyor
  const selectedCells = chain.map(b => [b.row, b.col]);

  // ScoreBoard seçili blokların sayı değerlerini bekliyor
  // 4. kişinin blok objesi 'number' alanını kullanıyor
  const selectedValues = chain.map(b => b.number);

  // ── RENDER ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      {/* Üst bilgi barı */}
      <Header
        score={score}
        highScore={highScore}
        targetNumber={targetNumber}
        wrongCount={wrongCount}
        dropInterval={FIXED_DROP_INTERVAL}
      />

      {/* 8×10 oyun tahtası */}
      <GameBoard
        matrix={matrix}
        selectedCells={selectedCells}
        onCellPress={handleCellPress}
      />

      {/* Alt puan paneli */}
      <ScoreBoard
        score={score}
        selectedValues={selectedValues}
        totalMoves={totalMoves}
        lastMovePoints={lastMovePoints}
      />

      {/* Onayla / İptal butonları */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>iptal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>onayla ✓</Text>
        </TouchableOpacity>
      </View>

      {/* Liderlik tablosu — oyun bitince otomatik açılır */}
      <Leaderboard
        visible={leaderboardVisible}
        scores={scores}
        currentScore={score}
        onClose={() => {
          setLeaderboardVisible(false);
          handleRestart();
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#16213e',
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2ecc71',
    alignItems: 'center',
  },
  confirmText: {
    color: '#0a2a1a',
    fontSize: 14,
    fontWeight: '700',
  },
});