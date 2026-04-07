// ============================================================
// ScoreBoard.jsx — Anlık oyun skoru özet paneli
// ============================================================

import { StyleSheet, Text, View } from 'react-native';

const SCORE_TABLE = {
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

// -------------------------------------------------------
// ScoreBoard bileşenleri
//   score          : oyuncunun toplam puanı
//   lastMovePoints : son hamlede kazanılan puan (geçici gösterim)
//   selectedValues : seçili blokların sayı değerleri listesi
//                    Örnek: [3, 5, 7] (bu hamle yapılırsa +19 puan)
//   totalMoves     : toplam doğru hamle sayısı
// -------------------------------------------------------
const ScoreBoard = ({
  score = 0,
  lastMovePoints = 0,
  selectedValues = [],
  totalMoves = 0,
}) => {

  // -------------------------------------------------------
  // Seçili blokların anlık puan toplamını hesapla.
  // reduce : diziyi tek bir değere indirgeme fonksiyonu.
  // Örnek: [3, 5, 7] → 3+7+12 = 22
  // -------------------------------------------------------
  const selectionPoints = selectedValues.reduce(
    (toplam, val) => toplam + (SCORE_TABLE[val] || 0),
    0 // başlangıç değeri sıfır
  );

  // -------------------------------------------------------
  // Sonraki hız artışına kaç puan kaldığını hesapla.
  // Her 100 puanda bir hız artar.
  // Örnek: 247 puan → bir sonraki eşik 300, kalan 53 puan
  // -------------------------------------------------------
  const currentTier = Math.floor(score / 100); // kaçıncı hız kademesindeyiz
  const currentSpeed = Math.max(5 - currentTier, 1); // mevcut düşme süresi (saniye)
  const nextThreshold = (currentTier + 1) * 100;     // bir sonraki eşik puanı
  const progressToNext = score % 100;                 // eşiğe kaç puan kaldı

  return (
    <View style={styles.container}>

      {/* ---- SEÇİM TOPLAMI (seçim yapılırken göster) ---- */}
      {selectedValues.length > 0 && (
        <View style={styles.selectionRow}>
          <Text style={styles.selectionLabel}>seçim puanı:</Text>

          {/* Kazanılacak puan — sarı renk ile kullanıcının dikkatini çekmeye çalıştım */}
          <Text style={styles.selectionPoints}>+{selectionPoints}</Text>

          {/* Seçili sayıları küçük göster: "3 + 5 + 7" */}
          <Text style={styles.selectionValues}>
            ({selectedValues.join(' + ')})
          </Text>
        </View>
      )}

      {/* ---- SON HAMLE PUANI (seçim bittikten sonra kısa süre göster) ---- */}
      {/* lastMovePoints > 0 ve seçim yoksa göster */}
      {lastMovePoints > 0 && selectedValues.length === 0 && (
        <Text style={styles.lastMoveText}>
          +{lastMovePoints} puan kazandın!
        </Text>
      )}

      {/* ---- ALT İSTATİSTİKLER ---- */}
      <View style={styles.statsRow}>

        {/* Sol: Toplam hamle sayısı */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>hamle</Text>
          <Text style={styles.statValue}>{totalMoves}</Text>
        </View>

        {/* Orta: Sonraki hız eşiğine ilerleme çubuğu */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            {currentSpeed > 1
              ? `${nextThreshold} puanda hız artar`
              : 'maksimum hıza ulaştı!'}
          </Text>

          {/* Mor ilerleme çubuğu — sadece hız artabilecekse göster */}
          {currentSpeed > 1 && (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  // progressToNext: 0-99 arası - yüzdeye çevir
                  { flex: progressToNext / 100 },
                ]}
              />
              <View style={{ flex: 1 - progressToNext / 100 }} />
            </View>
          )}
        </View>

        {/* Sağ: Toplam puan */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>toplam</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>

      </View>
    </View>
  );
};

// -------------------------------------------------------
// Stiller
// -------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },

  // Seçim toplamı satırı
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  selectionLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  selectionPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f39c12', // sarı kısım
  },
  selectionValues: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
  },

  // Son hamle puanı bildirimi
  lastMoveText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#2ecc71', // yeşil — başarı
    fontWeight: '600',
    marginBottom: 6,
  },

  // İstatistik satırı
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Sonraki hız eşiği ilerleme çubuğu
  progressSection: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9b59b6', // mor
    borderRadius: 2,
  },
});

export default ScoreBoard;
export { SCORE_TABLE };

