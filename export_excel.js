document.addEventListener("DOMContentLoaded", function () {
    // 共通フォント & 色ユーティリティ
    const baseFont = { name: "Noto Sans JP", size: 9 };
    const bigFont  = { name: "Noto Sans JP", size: 12, bold: true };
    const blue   = { argb: "FF0000C0" };   // #0000c0
    const white  = { argb: "FFFFFFFF" };
    const black  = { argb: "FF000000" };

    // ランプ色マップ（ARGB 形式へ変換）
    const lampColorMap = {
        "NO PLAY":  null,         // 背景も文字も透明扱い
        "F":   "FF666666",
        "AE":  "FFB366FF",
        "E":   "FF33CC33",
        "C":   "FF66CCFF",
        "H":   "FFFFFFFF",
        "EXH": "FFFFFF00",
        "FC":  "FFFFA500"
    };

    // ARGB 文字列 => fill オブジェクト
    const makeFill = argb => ({
        type: "pattern",
        pattern: "solid",
        fgColor: { argb }
    });

    const exportBtn = document.getElementById("export-excel-btn");
    if (!exportBtn) return;

    exportBtn.addEventListener("click", async () => {
        const table = document.getElementById("table_int");
        if (!table) {
            alert("テーブルが見つかりません。");
            return;
        }

        // --- ローディング表示追加（ここで表示） ---
        const loadingHTML = `
            <div id="loading">
                <div class="spinner"></div>
                <div class="loading-text">Excelファイルを出力中です。<br>しばらくお待ちください……</div>
            </div>
        `;
        $("body").append(loadingHTML); // jQueryで追加（ファイル内でも既にjQuery使用済み）

        // --- ボタン無効化 ---
        exportBtn.disabled = true;

        try {
            // === 見出し文字列からシート名／ファイル名を作成 =====================
            const headingSpan = document.querySelector("strong > span");
            let rawTitle = headingSpan ? headingSpan.textContent.trim() : "DBR難易度表";

            /* シート名：使用禁止記号 \ / : * ? " < > | [ ] を _ にし、31 文字以内 */
            const sheetName = rawTitle.replace(/[\\/:*?"<>|\[\]]/g, "_").slice(0, 31);

            /* ファイル名：\ / : * ? " < > | を _ に置換（長さ制限は不要）*/
            const fileTitle = rawTitle.replace(/[\\/:*?"<>|]/g, "_");
            // ========================================================================

            const clonedTable = table.cloneNode(true);

            // --- header行取得 & 列数記録（これを基準に揃える） ---
            const headerRow = clonedTable.querySelector("tr");
            const headerColCount = headerRow.cells.length;

            // --- colspan 解除 ---
            Array.from(clonedTable.rows).forEach(row => {
                for (let c = row.cells.length - 1; c >= 0; --c) {
                    const cell = row.cells[c];
                    const span = cell.colSpan;
                    if (span && span > 1) {
                        /* このセルは元々 colspan → Excel 側で 12pt にしたい */
                        cell.dataset.bigFont = "1";
                        cell.colSpan = 1;
                        cell.classList.add("colspan-value");
                        /* 右隣に 1 つずつ挿入（逆順でズレを防止） */
                        for (let i = span - 1; i >= 1; --i) {
                            const blank = row.insertCell(c + 1);
                            blank.textContent = "";
                            blank.classList.add("colspan-blank");   // 追加：空セル判定用
                        }
                    }
                }

                // ----- 行セル数をヘッダーと一致させる -----
                // 足りないぶんは空セルを補完
                while (row.cells.length < headerColCount) {
                    const blank = row.insertCell(-1);   // 行末に追加
                    blank.textContent = "";
                    blank.classList.add("colspan-blank");
                }
                // 多すぎるぶんは右側から削除
                while (row.cells.length > headerColCount) {
                    row.deleteCell(row.cells.length - 1);
                }
            });

            // --- headerの列を探して処理 ---
            let videoCellIndex = -1;
            let textageCellIndex = -1;
            let lampCellIndex    = -1;       // 行ループでも見える
            let titleCellIndex   = -1;
            let bpmCellIndex     = -1;
            let notesCellIndex   = -1;
            let scratchCellIndex = -1;
            let splvCellIndex    = -1;

            Array.from(headerRow.cells).forEach((cell, idx) => {
                const txt = cell.textContent.trim();
                if (txt === "IR")    irCellIndex   = idx;
                else if (txt === "動画")    videoCellIndex   = idx;
                else if (txt === "TexTage") textageCellIndex = idx;
                else if (txt === "ランプ")   lampCellIndex    = idx;
                else if (txt === "タイトル") titleCellIndex    = idx;
                else if (txt === "BPM")      bpmCellIndex      = idx;
                else if (txt === "ノーツ数") notesCellIndex    = idx;
                else if (txt === "皿含")     scratchCellIndex  = idx;
                else if (txt === "SPLv")     splvCellIndex     = idx;
            });

            if (videoCellIndex === -1) {
                alert("動画列が見つかりません。");
                return;
            }

            Array.from(clonedTable.rows).forEach(row => {
                const cells = row.cells;
                if (cells.length > videoCellIndex) {
                    const videoCell = cells[videoCellIndex];
                    const firstLink = videoCell.querySelector("a");
                    if (firstLink) {
                        const href = firstLink.href;
                        videoCell.innerHTML = `<a href="${href}">動画</a>`;
                    } else if (videoCell.querySelector("img")) {
                        videoCell.textContent = "動画";
                    }
                }
            });

            // --- ExcelJS でブック作成 ---
            const workbook  = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(sheetName);   // ← 動的名

            const rowStyleMap = {
                tr_separate: {
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFAAAAAA' } },
                    font: { bold: true, color: { argb: 'FFFFFFFF' } },
                    alignment: { horizontal: "center", vertical: "middle" }
                },
                tr_normal: {
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }
                },
                tr_proposed: {
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
                }
            };

            const centerCols = new Set([
                "col-recommend", "col-ir", "col-video", "col-textage",
                "col-gauge", "col-density", "col-inf"
            ]);

            // --- テーブル → worksheet へ書き出し ---
            const maxLen = [];              // 各列で最長文字数を記録

            clonedTable.querySelectorAll("tr").forEach((tr, rowIndex) => {
                const excelRow = worksheet.getRow(rowIndex + 1);
                Array.from(tr.cells).forEach((td, colIndex) => {
                    // input 要素優先で取得
                    const text = td.textContent.trim();  // 先に text を定義
                    const input = td.querySelector("input");
                    let value = (input ? input.value.trim() : td.textContent.trim()) || undefined;
            
                    const cell = excelRow.getCell(colIndex + 1);

                    /* ---------- IR / 動画 / TexTage 列：リンク保持 ---------- */
                    if (colIndex === irCellIndex || colIndex === videoCellIndex || colIndex === textageCellIndex) {
                        const a = td.querySelector("a");
                        if (a && a.href) {
                            cell.value = { text: a.textContent.trim() || "リンク", hyperlink: a.href };
                        } else {
                            cell.value = value === undefined ? null : value;
                        }
                    } else {
                        cell.value = value === undefined ? null : value;
                    }

                    cell.font  = { ...baseFont };   // 基本フォントを先に設定

                    // 文字数を計測（全角=2文字相当で概算）→ colspan-blankは無視
                    if (!td.classList.contains("colspan-blank")) {
                        const str = value ? String(value) : ""; // undefinedなら空文字に
                        const len = [...str].reduce((n, ch) => n + (ch.charCodeAt(0) > 0xFF ? 2 : 1), 0);
                        maxLen[colIndex] = Math.max(maxLen[colIndex] || 0, len);
                    }

                    // ヘッダー
                    if (rowIndex === 0) {
                        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF666666" } };
                        // colspanから分割された左端セル（data-big-font=1）にだけ12pt
                        const isBigFont = td.dataset.bigFont === "1";
                        cell.fill = makeFill("FF666666");
                        cell.font = {
                            ...baseFont,
                            size: isBigFont ? 12 : baseFont.size,
                            bold: true,
                            color: white
                        };
                        cell.alignment = { horizontal: "center", vertical: "middle" };
                        
                        // 全辺に格子線
                        const edge = { style: 'thin', color: { argb: "FF000000" } };
                        cell.border = { top: edge, left: edge, bottom: edge, right: edge };
                    } else {
                        // 行スタイル
                        for (const [cls, style] of Object.entries(rowStyleMap)) {
                            if (tr.classList.contains(cls)) {
                                Object.assign(cell, style);
                                break;
                            }
                        }
                        // 中央寄せ指定の列
                        const horiz = [...td.classList].some(cls => centerCols.has(cls)) ? "center" : "left";
                        cell.alignment = { horizontal: horiz, vertical: "middle" };

                        // 青文字：特定列のデータ文字列
                        if (
                            colIndex === titleCellIndex ||
                            colIndex === bpmCellIndex ||
                            colIndex === notesCellIndex ||
                            colIndex === scratchCellIndex ||
                            colIndex === splvCellIndex
                        ) {
                            cell.font = { ...cell.font, color: blue };
                        }

                        // IR / 動画 / TexTage 列：青＋下線
                        if (colIndex === irCellIndex || colIndex === videoCellIndex || colIndex === textageCellIndex) {
                            cell.font = { ...cell.font, color: blue, underline: true };
                        }

                        // ランプ列：背景と文字色
                        if (colIndex === lampCellIndex) {
                            const argb = lampColorMap[value];
                            cell.alignment = { horizontal: "center", vertical: "middle" }; // 中央寄せ追加
                            if (argb) {
                                cell.fill  = makeFill(argb);
                                cell.font  = { ...cell.font, color: (value==="H"||value==="EXH"||value==="FC") ? black : white };
                            } else if (value==="NO PLAY") {
                                cell.value = null;           // 文字も背景も消す
                            }
                        }

                        /* ---------- colspan-blankセルのフォント判定修正 ---------- */
                        if (td.classList.contains("colspan-blank")) {
                            // 左隣セルを取得
                            const prevTd = td.previousElementSibling;
                            // 左隣セルの data-big-font が '1' なら bigFont、そうでなければ baseFont
                            if (prevTd && prevTd.dataset.bigFont === "1") {
                                cell.font = { ...bigFont, color: { argb: 'FF000000' }};
                            } else {
                                cell.font = { ...baseFont };
                            }
                        } else {
                            // colspan-blank でなければ bigFont判定
                            if (td.dataset.bigFont === "1") {
                                cell.font = { ...bigFont, color: { argb: 'FF000000' }};
                            }
                        }
                        /* ---------- 罫線追加: colspan 以外に格子線 ---------- */
                        if (!td.classList.contains("colspan-blank") && !td.classList.contains("colspan-value")) {
                            const edge = { style: 'thin' };
                            cell.border = { top: edge, left: edge, bottom: edge, right: edge };
                        }
                    }
                });
            });

            /* ---------- header列数に合わせて右罫線と列幅調整 ---------- */
            (() => {
                const edge = { style: 'thin', color: { argb: "FF000000" } };

                // 右端列に右罫線を追加（header列数が正解とみなす）
                for (let row = 1; row <= worksheet.rowCount; ++row) {
                    const cell = worksheet.getRow(row).getCell(headerColCount);
                    const existing = cell.border || {};
                    cell.border = {
                        top: existing.top,
                        left: existing.left,
                        bottom: existing.bottom,
                        right: edge
                    };
                }

                // headerColCount より右にある列を削除（colspan-blank由来など）
                for (let col = worksheet.columnCount; col > headerColCount; --col) {
                    worksheet.spliceColumns(col, 1);
                }

                // 列幅指定：headerColCount だけに限定
                worksheet.columns = Array.from({ length: headerColCount }, (_, i) => {
                    const len = maxLen[i];
                    if (typeof len === "undefined") return { width: 0 };
                    if (i === 0) return { width: 8 }; // 1列目は固定
                    const w = Math.min(Math.max(len + 1, 4), 40);
                    return { width: w };
                });
            })();

            // --- ダウンロード処理 ---
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const link = document.createElement("a");
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const dd = String(now.getDate()).padStart(2, "0");
            const timestamp = `${yyyy}${mm}${dd}`;

            link.href = URL.createObjectURL(blob);
            link.download = `${fileTitle}_${timestamp}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Excel出力エラー:", e);
            alert("Excelファイルの出力中にエラーが発生しました。");
        } finally {
            // --- ローディング削除 & ボタン再有効化 ---
            $("#loading").remove();
            exportBtn.disabled = false;
        }
    })
});
