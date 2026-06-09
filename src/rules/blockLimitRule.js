// src/rules/blockLimitRule.js

const MIN_BLOCKS = 2; // zincirde en az 2 blok - tek blok patlamaması sınırı burda sağlanır.
const MAX_BLOCKS = 4; // en fazla 4 blok seçilir.

/**
 * Zincire daha fazla blok eklenip eklenemeyeceğini kontrol eder.
 * Max limitin aşılmasını önler.
 * @param {Array} chain
 * @returns {boolean}
 */
export function canAddMoreBlocks(chain) {
  return chain.length < MAX_BLOCKS; // zincir boyutu ile belirlenen max zincir boyutu karşılaştırılır
}

/**
 * Zincir onaylanabilir uzunlukta mı?
 * Onay butonuna basıldığında çağrılır.
 * Geçerli bir hamle için en az MIN_BLOCKS ve en fazla MAX_BLOCKS blok gereklidir.
 * @param {Array} chain
 * @returns {boolean}
 */
export function isChainLengthValid(chain) {
  return chain.length >= MIN_BLOCKS && chain.length <= MAX_BLOCKS; // zincir boyutu belirlenen aralıkta mı kontrolü
}