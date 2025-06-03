// ティッカーに画像を追加
function initializeLoadingTicker() {
  const images = Array.from({length: 10}, (_, i) => `../img/kondate${i + 1}.jpg`);
  // 2周分の画像を追加（スムーズなループのため）
  [...images, ...images].forEach(src => {
    loadingTicker.append(`<img src="${src}" alt="献立画像" class="loading-ticker-item" onerror="this.src='../img/kondate1.jpg'">`);
  });
} 