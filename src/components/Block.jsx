// ============================================================
// Block.jsx — Tek bir blok hücresini temsil eden bileşen
// Bu bileşen oyun tahtasındaki her kareyi çizdiğimiz kısım
// ============================================================

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// -------------------------------------------------------
// Her sayıya karşılık gelen sabit renk eşleşmesi.
// bg  : bloğun arka plan rengi
// text : üzerindeki sayının rengi
// -------------------------------------------------------
const BLOCK_COLORS = {
  1: { bg: '#e74c3c', text: '#fff' }, // kırmızı
  2: { bg: '#e67e22', text: '#fff' }, // turuncu
  3: { bg: '#f1c40f', text: '#333' }, // sarı 
  4: { bg: '#2ecc71', text: '#fff' }, // yeşil
  5: { bg: '#1abc9c', text: '#fff' }, // turkuaz
  6: { bg: '#3498db', text: '#fff' }, // mavi
  7: { bg: '#9b59b6', text: '#fff' }, // mor
  8: { bg: '#e91e63', text: '#fff' }, // pembe
  9: { bg: '#607d8b', text: '#fff' }, // gri-mavi
};

// -------------------------------------------------------
// Block bileşeni
//
// Props (dışarıdan gelen veriler):
//   value      : bloğun sayısı (1-9). null ise boş hücre.
//   isSelected : bu blok seçili mi? (true/false)
//   onPress    : bloka dokunulduğunda çalışacak fonksiyon
//   size       : bloğun piksel boyutu (varsayılan: 36)
// -------------------------------------------------------
const Block = ({ value, isSelected = false, onPress, size = 36 }) => {

  // Eğer value yoksa (null/undefined) : boş hücre çiz, dokunulamaz
  if (!value) {
    return (
      <View
        style={[
          styles.cell,
          styles.emptyCell,
          { width: size, height: size, borderRadius: size * 0.15 },
        ]}
      />
    );
  }

  // Sayıya göre rengi bul, tanımlı değilse gri kullan
  const colors = BLOCK_COLORS[value] || { bg: '#888', text: '#fff' };

  return (
    // TouchableOpacity : dokunulabilir alan oluşturur, basıldığında hafif solar
    // activeOpacity : parmak basılı tutulduğunda hafif solar (0.7 = %70 opaklık)
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          borderRadius: size * 0.15,        // köşe yuvarlama, boyuta göre orantılı
          backgroundColor: colors.bg,        // sayıya özel renk
          // Seçiliyse: beyaz kenarlık + hafif büyüme
          borderWidth: isSelected ? 2.5 : 0,
          borderColor: isSelected ? '#fff' : 'transparent',
          transform: [{ scale: isSelected ? 1.08 : 1 }],
          // Seçiliyse z-index yükselt (diğer blokların üstüne çıksın)
          zIndex: isSelected ? 2 : 1,
          // Gölge efekti (iOS)
          shadowColor: isSelected ? colors.bg : 'transparent',
          shadowOpacity: isSelected ? 0.7 : 0,
          shadowRadius: isSelected ? 6 : 0,
          elevation: isSelected ? 6 : 0, // Android için shadow
        },
      ]}
    >
      {/* Bloğun ortasındaki sayı */}
      <Text
        style={[
          styles.cellText,
          {
            color: colors.text,
            fontSize: size * 0.4, // boyuta göre orantılı yazı büyüklüğü
          },
        ]}
      >
        {value}
      </Text>

      {/* Seçiliyse sol üst köşede küçük onay işareti göster */}
      {isSelected && (
        <Text style={styles.checkMark}>✓</Text>
      )}
    </TouchableOpacity>
  );
};

// -------------------------------------------------------
// Stil tanımları
// StyleSheet.create : React Native'e özgü stil sistemi,
// normal CSS değil (margin, padding, flex hepsi aynı
// ama px birimi yok, sayı yazılır doğrudan)
// -------------------------------------------------------
const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',     // içeriği yatayda ortala
    justifyContent: 'center', // içeriği dikeyde ortala
    margin: 1.5,              // bloklar arası boşluk
  },
  emptyCell: {
    // Boş hücre: çok hafif beyaz (oyun alanı görünsün diye)
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cellText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  checkMark: {
    position: 'absolute', // hücrenin köşesine yapıştır
    top: 2,
    left: 3,
    fontSize: 8,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '700',
  },
});

// Bu dosyayı başka yerlerde kullanabilmek için dışa aktar
export default Block;
export { BLOCK_COLORS };

