// ============================================================
// Header.jsx — Oyunun üst bilgi çubuğu
//
// Ekranda gösterdikleri:
//   - Anlık puan (sol)
//   - Hedef sayı (orta, büyük kırmızı kutu)
//   - En yüksek skor (sağ)
//   - Hız çubuğu (blok düşme hızını gösterir)
//   - Yanlış hamle sayacı (3 nokta)
// ============================================================

import { StyleSheet, Text, View } from 'react-native';

// -------------------------------------------------------
// Header bileşenleri
//   score        : oyuncunun anlık toplam puanı
//   highScore    : tüm zamanların en yüksek skoru
//   targetNumber : o an hedeflenmesi gereken sayı
//   wrongCount   : kaç kez yanlış seçim yapıldı (0, 1, 2, 3)
//   dropInterval : bloğun kaç saniyede bir düştüğü (1-5 arası)
// -------------------------------------------------------
const Header = ({
  score = 0,
  highScore = 0,
  targetNumber = 0,
  wrongCount = 0,
  dropInterval = 5,
}) => {

  // -------------------------------------------------------
  // Hız barının doluluk oranını hesapla (0.0 ile 1.0 arası)
  // 5sn = yavaş = bar tam dolu (%100)
  // 1sn = hızlı = bar çok kısa (%20)
  // Formül: mevcut süre / maksimum süre
  // -------------------------------------------------------
  const speedRatio = dropInterval / 5;

  // -------------------------------------------------------
  // Hız barının rengini belirle:
  // yavaş : yeşil, orta : turuncu, hızlı : kırmızı
  // -------------------------------------------------------
  const speedColor =
    dropInterval >= 4 ? '#2ecc71' :  // yavaş: yeşil
    dropInterval >= 3 ? '#f39c12' :  // orta: turuncu
    dropInterval >= 2 ? '#e67e22' :  // hızlı: koyu turuncu
                        '#e74c3c';   // çok hızlı: kırmızı

  return (
    // Tüm header'ı saran dış kapsayıcı
    <View style={styles.container}>

      {/* ---- ANA BAR: puan | hedef sayı | en yüksek ---- */}
      <View style={styles.mainRow}>

        {/* Sol: Anlık Puan */}
        <View style={styles.sideSection}>
          <Text style={styles.sectionLabel}>puan</Text>
          <Text style={styles.sectionValue}>{score}</Text>
        </View>

        {/* Orta: Hedef Sayı (kırmızı dikkat çekici kutu) */}
        <View style={styles.targetBox}>
          <Text style={styles.targetLabel}>hedef sayı</Text>
          {/* targetNumber dışarıdan gelir, her doğru hamlede değişir */}
          <Text style={styles.targetNumber}>{targetNumber}</Text>
        </View>

        {/* Sağ: En Yüksek Skor */}
        <View style={styles.sideSection}>
          <Text style={styles.sectionLabel}>en yüksek</Text>
          {/* Altın sarısı renk — en yüksek skoru vurgular */}
          <Text style={[styles.sectionValue, { color: '#f39c12' }]}>
            {highScore}
          </Text>
        </View>

      </View>

      {/* ---- HIZ ÇUBUĞU ---- */}
      <View style={styles.speedRow}>
        <Text style={styles.speedLabel}>hız</Text>

        {/* Hız barının dış kapsayıcısı (gri arka plan) */}
        <View style={styles.speedTrack}>
          {/* Doluluk miktarı: genişlik = ekran genişliği × oran */}
          <View
            style={[
              styles.speedFill,
              {
                // flex ile orantılı genişlik (0.0 - 1.0 arası)
                flex: speedRatio,
                backgroundColor: speedColor,
              },
            ]}
          />
          {/* Boş kalan kısım */}
          <View style={{ flex: 1 - speedRatio }} />
        </View>

        {/* Kaç saniye olduğunu sayı olarak göster */}
        <Text style={[styles.speedValue, { color: speedColor }]}>
          {dropInterval}s
        </Text>
      </View>

      {/* ---- YANLIŞ HAMLE SAYACI ---- */}
      <View style={styles.wrongRow}>
        <Text style={styles.wrongLabel}>yanlış:</Text>

        {/* 3 nokta: dolu = yanlış yapıldı, boş = henüz yapılmadı */}
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.wrongDot,
              // i <= wrongCount ise bu nokta dolu (hata yapıldı)
              i <= wrongCount ? styles.wrongDotFilled : styles.wrongDotEmpty,
            ]}
          />
        ))}

        {/* 3 yanlış tamamlandıysa "CEZA!" uyarısı göster */}
        {wrongCount >= 3 && (
          <Text style={styles.penaltyText}>CEZA!</Text>
        )}
      </View>

    </View>
  );
};

// -------------------------------------------------------
// Stiller
// -------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e', // koyu lacivert header arka planı
  },

  // Ana satır: puan | hedef | en yüksek
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },

  // Sol ve sağ bölümler (puan, en yüksek)
  sideSection: {
    alignItems: 'center',
    gap: 2,
  },
  sectionLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },

  // Orta: hedef sayı kutusu
  targetBox: {
    backgroundColor: '#e74c3c', // kırmızı 
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  targetLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  targetNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 32,
  },

  // Hız çubuğu satırı
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: '#16213e', // biraz daha koyu arka plan
    gap: 10,
  },
  speedLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    width: 24, // sabit genişlik → bar hizalı görünsün
  },
  speedTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    flexDirection: 'row',   // doluluk ve boşluğu yan yana diz
    overflow: 'hidden',
  },
  speedFill: {
    height: '100%',
    borderRadius: 2,
  },
  speedValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },

  // Yanlış hamle sayacı satırı
  wrongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 9,
    backgroundColor: '#16213e',
    gap: 7,
  },
  wrongLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  wrongDot: {
    width: 12,
    height: 12,
    borderRadius: 6, // tam daire
  },
  wrongDotFilled: {
    backgroundColor: '#e74c3c', // dolu: kırmızı = hata
    borderWidth: 1.5,
    borderColor: '#e74c3c',
  },
  wrongDotEmpty: {
    backgroundColor: 'transparent', // boş: henüz hata yok
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  penaltyText: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: '700',
    marginLeft: 4,
  },
});

export default Header;