
// Bu dosya yanlış hamle sayacını yönetir ve ceza mekanizmasını tetikler.

// Kaç yanlış hamlede ceza uygulanacağı
const MAX_WRONG_MOVES = 3;

/* Yanlış hamle sayacının başlangıç durumunu oluşturur.
Sayaç sıfırdan başlar, ceza durumu false olur. */

export function createWrongMoveCounter() {
  // Sayacı sıfır, ceza durumunu false olarak başlat
  return {
    count: 0, // Yanlış hamle sayısı 
    isPenalty: false, // Ceza durumu 
  };
}

// Yanlış hamle yapıldığında sayacı 1 artırır.
/* Sayaç MAX_WRONG_MOVES'a ulaştığında isPenalty true olur.
 Orijinal counter'ı değiştirmez, yeni bir obje döndürür.*/

export function incrementWrongMove(counter) {
  const newCount = counter.count + 1;   // Mevcut sayaca 1 ekle
  const isPenalty = newCount >= MAX_WRONG_MOVES;   // Yeni sayaç MAX_WRONG_MOVES'a ulaştı mı kontrol et

  // Güncellenmiş yeni objeyi döndür — orijinali bozma
  return {
    count: newCount,
    isPenalty: isPenalty,
  };
}

// Ceza uygulandıktan sonra sayacı sıfırlar.
// Ceza tetiklendiğinde App.jsx bu fonksiyonu çağırır.

export function resetWrongMoveCounter() { // Sayacı başlangıç durumuna döndür
  return {
    count: 0,
    isPenalty: false,
  };
}

// Cezaya kaç yanlış hamle kaldığını döndürür.

export function getRemainingMoves(counter) {
  const remaining = MAX_WRONG_MOVES - counter.count;   // MAX_WRONG_MOVES'dan mevcut sayacı çıkar

  // Negatif olmasın , minimum 0 döndür
  return Math.max(0, remaining);
}

// Yanlış hamlenin tüm akışını yönetir.
// Sayacı artırır, ceza durumunu kontrol eder.
//  App.jsx sadece bu fonksiyonu çağırır, diğerleri yardımcıdır.

export function handleWrongMove(counter) {
  const updatedCounter = incrementWrongMove(counter);   // Sayacı artır

  // Ceza tetiklendiyse sayacı sıfırla ve ceza uygula
  if (updatedCounter.isPenalty) {
    return {
      counter: resetWrongMoveCounter(), // Sayacı sıfırla — ceza uygulandı, yeni tura başla
      shouldPenalize: true, // App.jsx'e ceza uygula sinyali gönder
    };
  }

  // Ceza tetiklenmediyse sadece güncellenmiş sayacı döndür
  return {
    counter: updatedCounter,
    shouldPenalize: false,
  };
}