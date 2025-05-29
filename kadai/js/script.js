$(document).ready(function () {
  let materials = JSON.parse(localStorage.getItem("materials")) || [];

  // メニュー切り替え
  $(".menu-btn").on("click", function () {
    const target = $(this).data("target");
    $("section").addClass("hidden");
    $("#" + target).removeClass("hidden").addClass("fade-in");
    if (target === "list") renderList();
  });

  // 登録ボタン
  $("#saveBtn").on("click", function () {
    const name = $("#name").val();
    const amount = $("#amount").val();
    const price = $("#price").val();

    if (!name || !amount || !price) {
      showNotification("すべての項目を入力してください", "error");
      return;
    }

    const item = { name, amount, price };
    materials.push(item);
    localStorage.setItem("materials", JSON.stringify(materials));

    $("#name, #amount, #price").val("");
    showNotification("材料を登録しました！", "success");
  });

  // 一覧描画
  function renderList() {
    const filter = $("#filter").val()?.toLowerCase() || "";
    const list = $("#materialList").empty();

    const filteredMaterials = materials.filter(m => 
      m.name.toLowerCase().includes(filter)
    );

    if (filteredMaterials.length === 0) {
      list.html(`
        <div class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <p class="text-gray-500 text-lg">材料が登録されていません</p>
          <p class="text-gray-400 text-sm mt-2">「材料登録」から新しい材料を追加してください</p>
        </div>
      `);
      return;
    }

    // 合計金額の計算
    const totalPrice = filteredMaterials.reduce((sum, m) => sum + Number(m.price), 0);

    // 合計表示
    list.append(`
      <div class="bg-green-50 rounded-xl p-4 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-green-700">登録済み材料</p>
            <p class="text-2xl font-bold text-green-800">${filteredMaterials.length}個</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-green-700">合計金額</p>
            <p class="text-2xl font-bold text-green-800">¥${totalPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>
    `);

    // 材料リストのグリッド表示
    const grid = $('<div class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>');
    
    filteredMaterials.forEach(m => {
      const card = $(`
        <div class="material-card group">
          <div class="flex justify-between items-start">
            <div class="flex-grow">
              <h3 class="text-lg font-medium text-gray-800 mb-1">${m.name}</h3>
              <div class="flex items-center gap-3 text-sm text-gray-600">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                  </svg>
                  ${m.amount}g
                </span>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  ¥${Number(m.price).toLocaleString()}
                </span>
              </div>
            </div>
            <button class="delete-btn opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg" data-name="${m.name}">
              <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      `);
      grid.append(card);
    });

    list.append(grid);
  }

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

  // OCRテキスト → 材料リストに変換
  $("#ocr-add-btn").on("click", function () {
    const rawText = $("#ocr-text").val();
    if (!rawText.trim()) {
      showNotification("テキストを入力してください", "error");
      return;
    }

    const lines = rawText.split("\n");
    let addedCount = 0;
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/); // 空白区切り
      if (parts.length >= 3) {
        const [name, amount, price] = parts;
        const item = { name, amount, price };
        materials.push(item);
        addedCount++;
      }
    });

    localStorage.setItem("materials", JSON.stringify(materials));
    $("#ocr-text").val("");
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
});
