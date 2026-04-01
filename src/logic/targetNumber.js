
const TARGET_MIN = 2;
const TARGET_MAX = 36;

/* En az 2 blok seçileceği için minimum 2, en fazla 4 blok × 9 = 36. 
Sadece bu aralığı bir obje olarak dışarı veriyor. */

export function getTargetRange() {
  return { min: TARGET_MIN, max: TARGET_MAX };
}

/* Math.random() → 0 ile 1 arasında ondalıklı sayı üretir (1 dahil değil).
 (TARGET_MAX - TARGET_MIN + 1) → yani * 35 → 0 ile 34.99... arasına çeker.
 Math.floor(...) → ondalığı atar, 0–34 arası tam sayı olur.
+ TARGET_MIN → yani + 2 → 2–36 aralığına taşır.  */

export function generateTargetNumber() {
  return Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN;
}

/* grid → mevcut 10×8'lik matris. target → ulaşılması gereken sayı. Fonksiyon bu grid'de bu hedefe ulaşılabilir mi diye sorar. */

export function isTargetReachable(grid, target) {
  const rows = grid.length;
  const cols = grid[0].length; /* Grid'in kaç satır kaç sütundan oluştuğunu alır.*/

  // 8 yönlü komşuluk (yatay, dikey, çapraz) 
  // (x=-1 -> üst y=-1 -> sol üst, y=0 -> sol, y=1 -> sol alt, x=0 -> aynı satır, x=1 -> alt)
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [ 0, -1],          [ 0, 1],
    [ 1, -1], [ 1, 0], [ 1, 1],
  ];

  // Geçerli bir hücre mi? (sınırlar içinde ve null değil)
  function isValid(r, c) {
    return r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== null;
  }

  // DFS (Derinlik Öncelikli Arama) ile 2-4 blok komşuluk zinciri dener
  // DFS'in stratejisi: bir yöne gir, tıkanana kadar ilerlemeye devam et. Tıkandığında geri dön, başka yönü dene.
    
  /* r, c → şu an bulunduğumuz hücre. 
    currentSum → şimdiye kadar seçilen blokların toplamı. 
    count → kaç blok seçildi. 
    visited → bu hamlede hangi hücreleri zaten seçtiğimizi tutar (aynı bloğu iki kez seçmesin diye.) */ 

  function dfs(r, c, currentSum, count, visited) { 
    if (count >= 2 && currentSum === target) return true; // En az 2 blok seçilmişse ve toplam hedefe eşitse
    if (count === 4) return false; // 4 blok seçildi ama toplam tutmadı 

    for (const [dr, dc] of directions) {
      const nr = r + dr; // Yeni satır
      const nc = c + dc; // Yeni sütun
      const key = `${nr},${nc}`; // Ziyaret edilen hücreleri string olarak tutar (örneğin "2,3").
      if (isValid(nr, nc) && !visited.has(key)) { // Geçerli ve daha önce ziyaret edilmemiş bir hücreyse
        visited.add(key); // Bu hücreyi ziyaret edilenler setine ekle (zincir içinde tekrar seçilemez)
        if (dfs(nr, nc, currentSum + grid[nr][nc], count + 1, visited)) { // Bu hücreyi seç ve devam et (Toplamı güncelle (currentSum + grid[nr][nc]), sayacı artır (count + 1), visited'ı geç)
          return true;
        }
        visited.delete(key); // Geri dönüldüğünde bu hücreyi ziyaret edilenler setinden çıkar (backtracking)
      }
    }
    return false;
}

// Grid'deki her hücreyi başlangıç noktası olarak dener.

  for (let r = 0; r < rows; r++) { // Tüm hücreleri dolaşır
    for (let c = 0; c < cols; c++) { 
      if (grid[r][c] === null) continue; // Boş hücreleri atla
      const visited = new Set([`${r},${c}`]); //Bu hücreyi başlangıç al, visited'a ekle, DFS başlat.
      if (dfs(r, c, grid[r][c], 1, visited)) return true; // Eğer bu hücreden başlayan bir zincir hedefe ulaşabiliyorsa true döner.
    }
  }

  return false;
}

// Dışarıya açılan tek ana fonksiyon. App.jsx buradan çağırır.

export function refreshTarget(grid) {
  let target; // üretilecek sayı
  let attempts = 0;  // kaç kez denendiğini sayar, sonsuz döngüyü önlemek için.
  const MAX_ATTEMPTS = 100; // kaç kez hedef sayı üretmeyi deneriz

  do {
    target = generateTargetNumber();
    attempts++; //Rastgele hedef üret, deneme sayısını artır.

    // 100 denemede ulaşılabilir sayı bulunamazsa en küçük mevcut bloğu hedef yap
    if (attempts >= MAX_ATTEMPTS) {
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
          if (grid[r][c] !== null) return grid[r][c];
        }
      }
    }
  } while (!isTargetReachable(grid, target)); // Üretilen hedef sayıya mevcut grid'de ulaşılamıyorsa döngü tekrar çalışır, yeni sayı üretilir.

  return target;
}

/*

### Fonksiyonlar arası ilişki

generateTargetNumber()
        ↓
isTargetReachable(grid, target)
        ↓ (false ise tekrar)
refreshTarget(grid)  ← dışarıya export edilen ana fonksiyon */