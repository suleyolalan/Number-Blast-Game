
// Bu dosya seçilen blokların geçerliliğini ve hedef sayıyla eşleşmesini kontrol eder.

// PUAN TABLOSU
// Her sayının oyundaki puan karşılığı

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

// Seçilen blokların sayı değerlerini toplayıp toplamı döndürür.
// selectedBlocks → { value, row, col } objelerinden oluşan dizi

export function getSum(selectedBlocks) {
  if (!selectedBlocks || selectedBlocks.length === 0) return 0; // selectedBlocks dizisi boşsa 0 döndür
  return selectedBlocks.reduce((sum, block) => sum + block.value, 0);   // Her bloğun value alanını alıp hepsini topla
} // .reduce() bir diziyi tek bir değere indirgemek için kullanılır.

//  Seçilen blok sayısının kurala uygun olup olmadığını kontrol eder.
//  Oyun kuralı: en az 2, en fazla 4 blok seçilebilir.
//  selectedBlocks → seçilen blok dizisi

export function isCountValid(selectedBlocks) {
  const count = selectedBlocks.length;  // Seçilen blok sayısını al
  return count >= 2 && count <= 4;   // 2'den az veya 4'ten fazla seçildiyse geçersiz
}

// Seçilen blokların toplamının hedef sayıya eşit olup olmadığını kontrol eder.
//  selectedBlocks → seçilen blok dizisi
//  target → ekranda gösterilen hedef sayı

export function isEqualToTarget(selectedBlocks, target) {
  const sum = getSum(selectedBlocks);   // Seçilen blokların toplamını hesapla
  return sum === target;   // Toplam hedef sayıya eşit mi
}

//  Doğru hamlede kazanılacak puanı hesaplar.
//  Her bloğun sayısı SCORE_TABLE'daki karşılığıyla değerlendirilir.
//  selectedBlocks → seçilen blok dizisi

export function calculateScore(selectedBlocks) {
  // Her bloğun puan karşılığını SCORE_TABLE'dan alıp topla
  return selectedBlocks.reduce((total, block) => {
    // block.value → bloğun sayısı (1-9 arası)
    // SCORE_TABLE[block.value] → o sayının puan karşılığı
    return total + (SCORE_TABLE[block.value] || 0);
  }, 0);
}

// Bir hamlenin tamamen geçerli olup olmadığını tek fonksiyonla kontrol eder.
//  Blok sayısı kuralı + hedef eşitliği aynı anda kontrol edilir. App.jsx bu fonksiyonu kullanır, diğerleri yardımcıdır.
//  selectedBlocks → seçilen blok dizisi
//  target → ekranda gösterilen hedef sayı

export function validateMove(selectedBlocks, target) {
  if (!selectedBlocks || selectedBlocks.length === 0) {   // Hiç blok seçilmemişse geçersiz
    return {
      isValid: false, // Hamle geçerli mi
      sum: 0, // Seçilen blokların toplamı
      reason: 'Hiç blok seçilmedi',  // Geçersizse sebebi
    };
  }

  // Blok sayısı 2-4 aralığında değilse geçersiz
  if (!isCountValid(selectedBlocks)) {
    return {
      isValid: false,
      sum: getSum(selectedBlocks),
      reason: `Blok sayısı geçersiz: ${selectedBlocks.length} (min 2, max 4)`,
    };
  }

  // Toplam hedef sayıya eşit değilse geçersiz
  if (!isEqualToTarget(selectedBlocks, target)) {
    return {
      isValid: false,
      sum: getSum(selectedBlocks),
      reason: `Toplam ${getSum(selectedBlocks)}, hedef ${target}`,
    };
  }

  // Tüm kontroller geçildi, hamle geçerli
  return {
    isValid: true,
    sum: getSum(selectedBlocks),
    reason: null,
  };
}