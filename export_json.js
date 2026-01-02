(function() {
  window.exportJsonFile = async function(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const file = new File([blob], "dbr_data.json", { type: "application/json" });

    const ua = navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(ua);

    // iOS用
    if (isiOS && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "DBRプレー記録 エクスポート",
          text: "DBRプレー記録 エクスポート"
        });
        return;
      } catch (e) {
        return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dbr_data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  window.addEventListener("message", (e) => {
    if (e.data?.type !== "DBR_EXPORT_JSON") return;
    window.exportJsonFile(e.data.payload);
  });
})();