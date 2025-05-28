$(document).ready(function () {
  let materials = JSON.parse(localStorage.getItem("materials")) || [];

  // メニュー切り替え
  $(".menu-btn").on("click", function () {
    const target = $(this).data("target");
    $("section").addClass("hidden");
    $("#" + target).removeClass("hidden");
    if (target === "list") renderList();
  });

  // 登録ボタン
  $("#saveBtn").on("click", function () {
    const name = $("#name").val();
    const amount = $("#amount").val();
    const price = $("#price").val();

    if (!name || !amount || !price) {
      alert("すべての項目を入力してください");
      return;
    }

    const item = { name, amount, price };
    materials.push(item);
    localStorage.setItem("materials", JSON.stringify(materials));

    $("#name, #amount, #price").val("");
    alert("登録しました！");
  });

  // 一覧描画
  function renderList() {
    const filter = $("#filter").val()?.toLowerCase() || "";
    const list = $("#materialList").empty();

    materials
      .filter(m => m.name.toLowerCase().includes(filter))
      .forEach(m => {
        const html = `
          <div class="bg-white p-2 mb-2 shadow rounded">
            <strong>${m.name}</strong> - ${m.amount}g / ¥${m.price}
          </div>`;
        list.append(html);
      });
  }

  $("#filter").on("input", renderList);

  // OCR画像プレビュー
  $("#ocr-image").on("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      console.log("画像読み込み成功");
      $("#ocr-preview").attr("src", ev.target.result);
    };
    reader.readAsDataURL(file);
  });

  // OCRテキスト → 材料リストに変換
  $("#ocr-add-btn").on("click", function () {
    const rawText = $("#ocr-text").val();
    if (!rawText.trim()) return alert("テキストを入力してください");

    const lines = rawText.split("\n");
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/); // 空白区切り
      if (parts.length >= 3) {
        const [name, amount, price] = parts;
        const item = { name, amount, price };
        materials.push(item);
      }
    });

    localStorage.setItem("materials", JSON.stringify(materials));
    $("#ocr-text").val("");
    alert("材料を登録しました！");
  });
});
