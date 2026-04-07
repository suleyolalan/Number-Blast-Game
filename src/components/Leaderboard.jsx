// ============================================================
// Leaderboard.jsx — Liderlik tablosu (modal olarak açılır)
//
// Oyun bittiğinde veya kullanıcı istediğinde açılır.
// Skorları yüksekten düşüğe sıralar, max 10 kişiyi gösterir.
// ============================================================

import {
  Modal,
  ScrollView, // liste uzunsa kaydırılabilir olsun
  StyleSheet,
  Text, // React Native'de modal = üste açılan pencere
  TouchableOpacity,
  View,
} from 'react-native';

// -------------------------------------------------------
// Leaderboard bileşenleri
//
// Props:
//   scores       : skor listesi. Her eleman:
//                  { name: 'Ali', score: 250, date: '2025-05-01' }
//   currentScore : bu oyunda kazanılan puan (listedeyse vurgular)
//   visible      : modal açık mı? (true/false)
//   onClose      : kapat butonuna basılınca çağrılır
// -------------------------------------------------------
const Leaderboard = ({
  scores = [],
  currentScore = 0,
  visible = false,
  onClose,
}) => {

  // -------------------------------------------------------
  // Skorları yüksekten düşüğe sırala, sadece ilk 10'u al.
  // spread operator [...scores] : orijinal diziyi bozmamak için kopya al
  // sort → b.score - a.score : büyükten küçüğe sıralar
  // slice(0, 10) : ilk 10 elemanı al
  // -------------------------------------------------------
  const sorted = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // -------------------------------------------------------
  // İlk 3 sıraya madalya rengi ver
  // -------------------------------------------------------
  const getMedalColor = (rank) => {
    if (rank === 0) return '#f1c40f'; // 1. → altın
    if (rank === 1) return '#b2bec3'; // 2. → gümüş
    if (rank === 2) return '#e67e22'; // 3. → bronz
    return null;                      // diğerleri → renk yok
  };

  return (
    // transparent : arka planı siyah/yarı saydam yapmak için
    // animationType : açılış animasyonu
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose} // Android geri tuşuna basılınca kapat
    >
      {/* Karartılmış arka plan — dışına tıklanırsa modal kapansın */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Modal kutusu — dışına tıklamayı engelle (kendi içine değil) */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBox}
          onPress={() => {}} // dışa tıklamayı engellemek için boş handler
        >

          {/* ---- BAŞLIK ---- */}
          <View style={styles.header}>
            <Text style={styles.trophy}>🏆</Text>
            <Text style={styles.title}>liderlik tablosu</Text>

            {/* Bu oyundaki skor gösterimi */}
            {currentScore > 0 && (
              <Text style={styles.currentScoreText}>
                bu oyun:{' '}
                <Text style={styles.currentScoreValue}>{currentScore}</Text>
                {' '}puan
              </Text>
            )}
          </View>

          {/* ---- SKOR LİSTESİ ---- */}
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {sorted.length === 0 ? (
              // Hiç skor yoksa boş mesaj göster
              <Text style={styles.emptyText}>
                henüz kayıtlı skor yok
              </Text>
            ) : (
              sorted.map((entry, idx) => {
                const medalColor = getMedalColor(idx);
                // Bu satır mevcut oyunun skoruyla aynıysa vurgula
                const isCurrentGame = entry.score === currentScore;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.row,
                      // Mevcut oyun satırı: yeşilimsi arka plan
                      isCurrentGame && styles.currentGameRow,
                      // Çift satırlar çok hafif farklı arka plan (zebra efekti)
                      idx % 2 !== 0 && styles.altRow,
                    ]}
                  >
                    {/* Sıra numarası (renkli madalya) */}
                    <Text
                      style={[
                        styles.rank,
                        { color: medalColor || 'rgba(255,255,255,0.35)' },
                      ]}
                    >
                      {idx + 1}.
                    </Text>

                    {/* İsim + tarih */}
                    <View style={styles.nameSection}>
                      <Text style={styles.name}>
                        {entry.name || 'anonim'}
                      </Text>
                      {entry.date && (
                        <Text style={styles.date}>{entry.date}</Text>
                      )}
                    </View>

                    {/* Skor */}
                    <Text
                      style={[
                        styles.score,
                        {
                          color: medalColor ||
                            (isCurrentGame ? '#2ecc71' : 'rgba(255,255,255,0.8)'),
                        },
                      ]}
                    >
                      {entry.score}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* ---- KAPAT BUTONU ---- */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>kapat</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// -------------------------------------------------------
// Stiller
// -------------------------------------------------------
const styles = StyleSheet.create({
  // Karartılmış arka plan
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal kutusunun kendisi
  modalBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    width: '88%',
    maxHeight: '80%',       // ekranın %80'ini geçmesin
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',     // içerik köşelerden taşmasın
  },

  // Başlık alanı
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  trophy: {
    fontSize: 24,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f1c40f', // altın sarısı başlık
    marginBottom: 4,
  },
  currentScoreText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  currentScoreValue: {
    color: '#2ecc71',
    fontWeight: '600',
  },

  // Liste kapsayıcısı
  list: {
    maxHeight: 360,
  },

  // Tek bir skor satırı
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  currentGameRow: {
    backgroundColor: 'rgba(46,204,113,0.08)', // hafif yeşil arka plan
    borderLeftColor: '#2ecc71',               // sol yeşil çizgi
  },
  altRow: {
    backgroundColor: 'rgba(255,255,255,0.02)', // zebra
  },

  // Sıra numarası
  rank: {
    width: 28,
    fontSize: 14,
    fontWeight: '700',
  },

  // İsim + tarih
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  date: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 1,
  },

  // Skor
  score: {
    fontSize: 17,
    fontWeight: '700',
  },

  // Boş liste mesajı
  emptyText: {
    textAlign: 'center',
    padding: 24,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
  },

  // Kapat butonu
  closeButton: {
    margin: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Leaderboard;