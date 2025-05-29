$(document).ready(function () {
  let materials = JSON.parse(localStorage.getItem("materials")) || [];
  let isFirstClick = true;  // 初回クリックフラグ

  // ロゴクリックでリフレッシュ
  $('#refresh-logo').on('click', function() {
    // 全てのセクションを非表示
    $('section').addClass('hidden');
    // ローディング画面を表示
    showLoading();
    // isFirstClickフラグをリセット
    isFirstClick = true;
  });

  // ローディング画面の制御
  const loadingScreen = $('#loading-screen');
  const loadingTicker = $('.loading-ticker');

  function showLoading() {
    loadingScreen.removeClass('hidden');
  }

  function hideLoading() {
    loadingScreen.addClass('hidden');
  }

  // ティッカーに画像を追加
  function initializeLoadingTicker() {
    const images = Array.from({length: 10}, (_, i) => `/img/kondate${i + 1}.jpg`);
    // 2周分の画像を追加（スムーズなループのため）
    [...images, ...images].forEach(src => {
      loadingTicker.append(`<img src="${src}" alt="献立画像" class="loading-ticker-item" onerror="this.src='/img/kondate1.jpg'">`);
    });
  }

  // 初期化時にティッカーを設定
  initializeLoadingTicker();

  // ページ読み込み時のローディング表示（最初はずっと表示）
  showLoading();
  // 初期表示でダッシュボードを隠す
  $('#dashboard').addClass('hidden');

  // サイドメニューの制御
  const menuTrigger = $('#menu-trigger');
  const menuTriggerIcon = $('#menu-trigger svg');
  const sideMenu = $('#side-menu');
  const menuOverlay = $('#menu-overlay');
  const mainWrapper = $('#main-wrapper');
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  function openMenu() {
    sideMenu.removeClass('translate-x-full');
    menuOverlay.removeClass('opacity-0 pointer-events-none').addClass('opacity-50');
    mainWrapper.addClass('-translate-x-32');
    menuTrigger.addClass('-rotate-180');
    $('body').addClass('overflow-hidden');
  }

  function closeMenu() {
    sideMenu.addClass('translate-x-full');
    menuOverlay.addClass('opacity-0 pointer-events-none').removeClass('opacity-50');
    mainWrapper.removeClass('-translate-x-32');
    menuTrigger.removeClass('-rotate-180');
    $('body').removeClass('overflow-hidden');
  }

  menuTrigger.on('click', toggleMenu);
  menuOverlay.on('click', closeMenu);

  // メニュー項目クリック時の処理
  $('.menu-item').on('click', function(e) {
    e.preventDefault();
    const target = $(this).data('target');
    
    if (isFirstClick) {
      // 初回クリック時は即座に切り替え
      isFirstClick = false;
      hideLoading();
      $('section').addClass('hidden');
      $('#' + target).removeClass('hidden').addClass('fade-in');
      if (target === 'list') {
        renderList();
      } else if (target === 'dashboard') {
        initializeDashboard();
      }
    } else {
      // 2回目以降は通常のローディング表示
      showLoading();
      setTimeout(() => {
        $('section').addClass('hidden');
        $('#' + target).removeClass('hidden').addClass('fade-in');
        if (target === 'list') {
          renderList();
        } else if (target === 'dashboard') {
          initializeDashboard();
        }
        hideLoading();
      }, 1000);
    }
  });

  // 材料登録行のテンプレート（2段組、削除ボタン付き）
  function createRegisterRow() {
    return $(`
      <div class="register-row bg-emerald-50 rounded-lg p-2 flex flex-col gap-1.5">
        <div class="flex flex-wrap gap-1.5">
          <input type="date" class="form-input w-36 py-1.5" placeholder="日付" />
          <input type="text" placeholder="購入店舗" class="form-input w-28 py-1.5" />
          <input type="text" placeholder="住所" class="form-input flex-1 min-w-[120px] py-1.5" />
        </div>
        <div class="flex flex-wrap gap-1.5 items-end">
          <input type="text" placeholder="材料名" class="form-input flex-1 min-w-[90px] py-1.5" />
          <input type="number" placeholder="量(g)" class="form-input w-20 py-1.5" />
          <input type="number" placeholder="値段(円)" class="form-input w-24 py-1.5" />
          <button type="button" class="delete-register-row text-red-400 hover:text-red-600 ml-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    `);
  }

  // 材料登録行追加
  function addRegisterRow() {
    const row = createRegisterRow();
    $('#register-rows').append(row);
    updateRegisterDeleteButtons();
  }

  // 材料登録行削除ボタンの有効/無効制御
  function updateRegisterDeleteButtons() {
    const rows = $('#register-rows .register-row');
    if (rows.length <= 1) {
      rows.find('.delete-register-row').prop('disabled', true).addClass('opacity-30 cursor-not-allowed');
    } else {
      rows.find('.delete-register-row').prop('disabled', false).removeClass('opacity-30 cursor-not-allowed');
    }
  }

  // 初期行1つ追加
  if ($('#register-rows').length) {
    $('#register-rows').empty();
    addRegisterRow();
  }

  // 行追加ボタン
  $('#register-add-row').on('click', function() {
    addRegisterRow();
  });

  // 行削除ボタン
  $(document).on('click', '.delete-register-row', function() {
    if ($('#register-rows .register-row').length > 1) {
      $(this).closest('.register-row').remove();
      updateRegisterDeleteButtons();
    }
  });

  // saveBtnクリック時、全行を登録
  $('#saveBtn').on('click', function () {
    let addedCount = 0;
    $('#register-rows .register-row').each(function() {
      const date = $(this).find('input[type="date"]').val();
      const shop = $(this).find('input[placeholder^="購入店舗"]').val();
      const address = $(this).find('input[placeholder^="住所"]').val();
      const name = $(this).find('input[placeholder^="材料名"]').val();
      const amount = $(this).find('input[placeholder^="量"]').val();
      const price = $(this).find('input[placeholder^="値段"]').val();
      if (date && shop && address && name && amount && price) {
        const item = { name, amount, price, shop, address, date };
        materials.push(item);
        addedCount++;
      }
    });
    localStorage.setItem("materials", JSON.stringify(materials));
    $('#register-rows').empty();
    addRegisterRow();
    showNotification(`${addedCount}件の材料を登録しました！`, "success");
  });

  // OCR入力行のテンプレート（2段組、プレースホルダー例付き）
  function createOcrRow() {
    return $(`
      <div class="ocr-row bg-emerald-50 rounded-lg p-2 flex flex-col gap-1.5">
        <div class="flex flex-wrap gap-1.5">
          <input type="date" class="form-input w-36 ocr-date py-1.5" placeholder="日付" />
          <input type="text" placeholder="店舗" class="form-input w-28 ocr-shop py-1.5" />
          <input type="text" placeholder="住所" class="form-input flex-1 min-w-[120px] ocr-address py-1.5" />
        </div>
        <div class="flex flex-wrap gap-1.5 items-end">
          <input type="text" placeholder="材料名" class="form-input flex-1 min-w-[90px] ocr-name py-1.5" />
          <input type="number" placeholder="量(g)" class="form-input w-20 ocr-amount py-1.5" />
          <input type="number" placeholder="値段(円)" class="form-input w-24 ocr-price py-1.5" />
          <button type="button" class="delete-ocr-row text-red-400 hover:text-red-600 ml-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    `);
  }

  // OCR行追加
  function addOcrRow() {
    const row = createOcrRow();
    $('#ocr-rows').append(row);
  }

  // 初期行1つ追加
  addOcrRow();

  // 行追加ボタン
  $('#ocr-add-row').on('click', function() {
    addOcrRow();
  });

  // 行削除ボタン
  $(document).on('click', '.delete-ocr-row', function() {
    $(this).closest('.ocr-row').remove();
  });

  // フィルター行の表示切り替え
  $(document).on('click', '.filter-toggle', function() {
    const filter = $(this).data('filter');
    $('#filter-row').removeClass('hidden');
    // すべてのセルを一旦非表示
    $('#filter-row th').addClass('hidden');
    // チェック欄と該当カラム、最後の空欄は表示
    $('#filter-row th:first').removeClass('hidden');
    $(`#filter-${filter}-cell`).removeClass('hidden');
    $('#filter-row th:last').removeClass('hidden');
  });
  // テーブル外クリックでフィルター行を非表示
  $(document).on('click', function(e) {
    if (!$(e.target).closest('thead').length) {
      $('#filter-row').addClass('hidden');
    }
  });

  // フィルターバッジの描画
  function renderFilterBadges() {
    const badgeArea = $('#filter-badges').empty();
    const filters = [
      { id: 'filter-date', label: '日付', value: $('#filter-date').val() },
      { id: 'filter-shop', label: '店舗', value: $('#filter-shop').val() },
      { id: 'filter-name', label: '材料名', value: $('#filter-name').val() },
      { id: 'filter-amount-min', label: '量(最小)', value: $('#filter-amount-min').val() },
      { id: 'filter-amount-max', label: '量(最大)', value: $('#filter-amount-max').val() },
      { id: 'filter-price-min', label: '値段(最小)', value: $('#filter-price-min').val() },
      { id: 'filter-price-max', label: '値段(最大)', value: $('#filter-price-max').val() },
    ];
    filters.forEach(f => {
      if (f.value) {
        const badge = $(`
          <span class="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-medium shadow-sm transition mr-1 mb-1">
            ${f.label}：${f.value}
            <button type="button" class="ml-2 text-emerald-500 hover:text-white hover:bg-emerald-400 rounded-full w-5 h-5 flex items-center justify-center filter-badge-clear" data-filter="${f.id}">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </span>
        `);
        badgeArea.append(badge);
      }
    });
  }

  // バッジの×クリックで該当フィルターをクリア
  $(document).on('click', '.filter-badge-clear', function(e) {
    e.stopPropagation();
    const id = $(this).data('filter');
    $(`#${id}`).val('');
    renderList();
    renderFilterBadges();
  });

  // 一覧描画
  function renderList() {
    renderFilterBadges();
    // 各フィルター値取得
    const filterDate = $("#filter-date").val();
    const filterShop = $("#filter-shop").val()?.toLowerCase() || "";
    const filterName = $("#filter-name").val()?.toLowerCase() || "";
    const amountMin = Number($("#filter-amount-min").val());
    const amountMax = Number($("#filter-amount-max").val());
    const priceMin = Number($("#filter-price-min").val());
    const priceMax = Number($("#filter-price-max").val());
    const list = $("#materialList").empty();

    let filteredMaterials = materials.filter(m => {
      if (filterDate && m.date !== filterDate) return false;
      if (filterShop && (!m.shop || !m.shop.toLowerCase().includes(filterShop))) return false;
      if (filterName && (!m.name || !m.name.toLowerCase().includes(filterName))) return false;
      if (!isNaN(amountMin) && Number(m.amount) < amountMin) return false;
      if (!isNaN(amountMax) && Number(m.amount) > amountMax) return false;
      if (!isNaN(priceMin) && Number(m.price) < priceMin) return false;
      if (!isNaN(priceMax) && Number(m.price) > priceMax) return false;
      return true;
    });

    if (filteredMaterials.length === 0) {
      list.append(`<tr><td colspan="7" class="text-center py-8 text-gray-400">材料が登録されていません</td></tr>`);
      return;
    }

    filteredMaterials.forEach((m, idx) => {
      const row = $(`
        <tr class="border-b hover:bg-emerald-50">
          <td class="p-2 text-center align-middle">
            <input type="checkbox" class="material-check" data-index="${m._index ?? idx}" />
          </td>
          <td class="p-2 align-middle">${m.date || '-'}</td>
          <td class="p-2 align-middle">${m.shop || '-'}</td>
          <td class="p-2 align-middle">${m.name || '-'}</td>
          <td class="p-2 align-middle">${m.amount || '-'}</td>
          <td class="p-2 align-middle">${m.price ? '¥' + Number(m.price).toLocaleString() : '-'}</td>
          <td class="p-2 text-center align-middle">
            <button class="delete-btn text-red-400 hover:text-red-600" data-name="${m.name}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </td>
        </tr>
      `);
      list.append(row);
    });
  }

  // 各フィルターのイベント
  $('#filter-date, #filter-shop, #filter-name, #filter-amount-min, #filter-amount-max, #filter-price-min, #filter-price-max').on('input change', renderList);

  // 献立提案ボタンの材料選択取得例
  $(document).on('click', '#generateBtn', function() {
    // チェックされた材料だけ取得
    const checkedIndexes = [];
    $('#materialList .material-check:checked').each(function() {
      checkedIndexes.push(Number($(this).data('index')));
    });
    // 絞り込み後の材料リストから選択されたものだけ抽出
    let filteredMaterials = materials.filter(m => {
      if ($('#filter-date').val() && m.date !== $('#filter-date').val()) return false;
      if ($('#filter-shop').val() && (!m.shop || !m.shop.toLowerCase().includes($('#filter-shop').val().toLowerCase()))) return false;
      if ($('#filter-name').val() && (!m.name || !m.name.toLowerCase().includes($('#filter-name').val().toLowerCase()))) return false;
      if (!isNaN(Number($('#filter-amount-min').val())) && Number(m.amount) < Number($('#filter-amount-min').val())) return false;
      if (!isNaN(Number($('#filter-amount-max').val())) && Number(m.amount) > Number($('#filter-amount-max').val())) return false;
      if (!isNaN(Number($('#filter-price-min').val())) && Number(m.price) < Number($('#filter-price-min').val())) return false;
      if (!isNaN(Number($('#filter-price-max').val())) && Number(m.price) > Number($('#filter-price-max').val())) return false;
      return true;
    });
    // チェックされたものだけ
    const selectedMaterials = filteredMaterials.filter((m, idx) => checkedIndexes.includes(idx));
    // ここでselectedMaterialsを使って献立提案処理を行う
    showNotification(`${selectedMaterials.length}件の材料で献立提案（ダミー）`, 'info');
  });

  // 材料削除
  $(document).on("click", ".delete-btn", function() {
    const name = $(this).data("name");
    materials = materials.filter(m => m.name !== name);
    localStorage.setItem("materials", JSON.stringify(materials));
    showNotification("材料を削除しました", "info");
    renderList();
  });

  $("#filter").on("input", renderList);

  // OCR画像プレビュー
  $("#ocr-image").on("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function (ev) {
      console.log("画像読み込み成功");
      $("#ocr-preview")
        .attr("src", ev.target.result)
        .removeClass("hidden")
        .addClass("fade-in");
    };
    reader.readAsDataURL(file);
  });

  // OCR入力欄から材料を登録
  $('#ocr-add-btn').on('click', function () {
    let addedCount = 0;
    $('#ocr-rows .ocr-row').each(function() {
      const name = $(this).find('.ocr-name').val();
      const amount = $(this).find('.ocr-amount').val();
      const price = $(this).find('.ocr-price').val();
      const shop = $(this).find('.ocr-shop').val();
      const address = $(this).find('.ocr-address').val();
      const date = $(this).find('.ocr-date').val();
      if (name && amount && price && shop && address && date) {
        const item = { name, amount, price, shop, address, date };
        materials.push(item);
        addedCount++;
      }
    });
    localStorage.setItem("materials", JSON.stringify(materials));
    $('#ocr-rows').empty();
    addOcrRow();
    showNotification(`${addedCount}件の材料を登録しました！`, "success");
  });

  // 通知表示
  function showNotification(message, type = "info") {
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      info: "bg-blue-500"
    };

    const notification = $(`
      <div class="fixed top-4 right-4 px-6 py-3 rounded-lg text-white ${colors[type]} shadow-lg transform transition-all duration-300 opacity-0 translate-y-[-1rem]">
        ${message}
      </div>
    `).appendTo("body");

    setTimeout(() => {
      notification.css({
        opacity: 1,
        transform: "translateY(0)"
      });
    }, 10);

    setTimeout(() => {
      notification.css({
        opacity: 0,
        transform: "translateY(-1rem)"
      });
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ダッシュボードの初期化
  function initializeDashboard() {
    // 1食単価の推移グラフ
    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['3/10', '3/11', '3/12', '3/13', '3/14', '3/15'], // 仮データ
        datasets: [{
          label: '1食単価',
          data: [850, 920, 780, 830, 940, 880], // 仮データ
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '¥' + value;
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        }
      }
    });

    // 献立スライダー
    new Swiper('.menuSwiper', {
      slidesPerView: 'auto',
      spaceBetween: 20,
      loop: true,
      speed: 400,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        }
      }
    });
  }
});
