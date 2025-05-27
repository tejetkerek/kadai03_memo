// メニューの表示・非表示切替（プッシュ型）
$("#menu-toggle").on("click", function () {
  $("#side-menu").toggleClass("-translate-x-full");
  $("#main-content").toggleClass("translate-x-48"); // ←ここでスライド！
});




// ページ切り替え
$(".menu-btn").on("click", function () {
  const target = $(this).data("target");
  $(".screen").addClass("hidden");
  $("#" + target).removeClass("hidden");
});

// セーブ機能
$("#save").on("click", function () {
  const key = $("#title").val();
  const value = $("#text").val();
  if (!key || !value) return;

  localStorage.setItem(key, value);
  renderList();
  $("#title").val("");
  $("#text").val("");
});

// 全削除
$("#clear").on("click", function () {
  localStorage.clear();
  renderList();
});

// 一覧表示処理
function renderList() {
  $("#memoList").empty();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    const item = `<li class="bg-white p-2 shadow border rounded"><strong>${key}</strong><br>${value}</li>`;
    $("#memoList").append(item);
  }
}

// 初期化時に表示
$(function () {
  renderList();
});

