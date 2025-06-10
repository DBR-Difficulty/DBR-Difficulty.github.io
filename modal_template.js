// GASでスプレッドシートに書き込むウェブアプリのURL
// テスト用
//const GAS_URL = "https://script.google.com/macros/s/AKfycbwsTN1BieANX7L1PQk_y6vs1RVQ6XkvNf6PwemEy5hrRM_uIDzO7aoGZCIV66pFX5VXPg/exec";

// 本番シート
const GAS_URL = "https://script.google.com/macros/s/AKfycbwAqEgEmymWS0Ztge7CKinjSiEPW8gYvCnA_qk1qxjk-gLo1xjT4dBhrGkISHZeTKZR/exec";

function setupModal(columnsToShow) {
    // モーダルの基本構造が存在しない場合は追加
    if (!document.getElementById("infoModal")) {
        $("body").append(
            `<div id="infoModal" class="modal">
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <div id="modalBody"></div>
                    <div id="modalActions" style="margin-top: 1rem;"></div>
                </div>
            </div>`);
    }

    let currentProposalType = null; // 現在表示中のフォームタイプ
    let modalJustOpened = false;

    const defaultLabels = {
        level: "レベル",
        pending: "査定中",
        recommend: "おすすめ度",
        ver: "バージョン",
        title: "タイトル",
        bpm: "BPM",
        notes: "ノーツ数",
        splv: "SPLv",
        video: "動画",
        textage: "TexTage",
        gauge: "ゲージ増加量（ノマゲ以下、GREAT以上）",
        comment: "コメント",
        remarks: "備考",
        inf: "INFINITAS収録有無",
        unlock: "INFINITAS解禁方法",
        // 拡張機能用
        lamp: "クリア状況",
        bp: "最小BP",
        score: "ベストスコア",
        "score-rank": "スコアランク(スコアレート)",
        "real-rank": "実質スコアランク(スコアレート)"
    };

    function extractHref(html) {
        if (!html) return "";
        const match = html.match(/href="([^"]+)"/);
        return match ? match[1] : "";
    }

    function extractTextageID(html) {
        const url = extractHref(html);
        const match = url.match(/score\/\d+\/([^.]+)\.html/);
        return match ? match[1] : "";
    }

    // 閉じるボタン処理
    function closeModal() {
        $("#infoModal").fadeOut();
        $("#modalActions").empty();
        currentProposalType = null; // フォームを閉じたらリセット
        modalJustOpened = false;
    }

    function adjustModalHeight() {
        const marginRem = 4; // 上下合わせて 4rem の余白を確保（2remずつ）
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize); // 通常は 16px
        const marginPx = marginRem * rootFontSize;

        const safeHeight = document.documentElement.clientHeight - marginPx;
        $("#infoModal .modal-content").css({
            "max-height": `${safeHeight}px`,
            "height": "auto" // 高さはコンテンツに応じて縮むように
        });
    }

    $(window).on("resize", function () {
        if ($("#infoModal").is(":visible")) {
            adjustModalHeight();
        }
    });

    $(document).on("click", ".close-btn", function () {
        closeModal();
    });

    // モーダル外クリックで閉じる（表示後のみ）
    $(document).off("click.modalClose").on("click.modalClose", function (event) {
        const $modal = $("#infoModal .modal-content");
        if (!modalJustOpened && !$(event.target).closest($modal).length && $("#infoModal").is(":visible")) {
            closeModal();
        }
    });

    // 表の行のレベル列にクリックイベントを登録
    $(document).off("click", ".col-level, .col-recommend, .col-ver, .col-title")
           .on("click", ".col-level, .col-recommend, .col-ver, .col-title", function () {
        const $row = $(this).closest("tr");

        const modalData = {};
        columnsToShow.forEach(key => {
            const $cell = $row.find(`.col-${key}`);

            // スコアとBPは input の value を読む
            if (key === "score" || key === "bp") {
                const $input = $cell.find("input");
                const val = $input.length ? $input.val().trim() : "";
                modalData[key] = val;
                modalData[`${key}HTML`] = val;
            }

            // その他は text と html 両方
            else {
                const text = $cell.length ? $cell.text().trim() : "";
                const html = $cell.length ? $cell.html() : "";
                modalData[key] = text;
                modalData[`${key}HTML`] = html;
            }

            // ページ種別に応じて固定値を設定
            if (modalData.inf == null || modalData.inf === "") {
                const isInfPage = document.body.dataset.page === "inf" || location.pathname.includes("inf");
                if (isInfPage) {
                    modalData.inf = "○";
                    modalData["infHTML"] = "○";
                }
            }

            if (modalData.recommend == null || modalData.recommend === "") {
                const isRecommendPage = document.body.dataset.page === "recommend" || location.pathname.includes("recommend");
                if (isRecommendPage) {
                    modalData.recommend = "☆";
                    modalData["recommendHTML"] = "☆";
                }
            }
        });

        let html = `<h2>${modalData.title || "譜面情報"}</h2>`;

        columnsToShow.forEach(key => {
            if (key === "title") return;
            const label = defaultLabels[key] || key.toUpperCase();

            if (key === "recommend") {
                // modalData.recommend に基づいた表示内容を設定
                let recommendText = '';
                if (modalData[key] === "☆") {
                    recommendText = "☆（強くおすすめできる）";
                } else if (modalData[key] === "○") {
                    recommendText = "○（やって損はしない）";
                } else {
                    recommendText = "無記入（そうでもない）";
                }

                html += `<div style="margin-bottom: 0.2rem;"><b>${label}:</b> ${recommendText}</div>`;

            } else if (key === "ver") {
                // modalData.ver に基づいた表示内容を設定
                let verText = '';
                switch(modalData[key]) {
                    case "1":
                        verText = "1st style";
                        break;
                    case "s":
                        verText = "substream";
                        break;
                    case "2":
                        verText = "2nd style";
                        break;
                    case "3":
                        verText = "3rd style";
                        break;
                    case "4":
                    case "5":
                    case "6":
                    case "7":
                    case "8":
                    case "9":
                    case "10":
                        verText = modalData[key] + "th style";
                        break;
                    case "11":
                        verText = "11 IIDX RED";
                        break;
                    case "12":
                        verText = "12 HAPPY SKY";
                        break;
                    case "13":
                        verText = "13 DistorteD";
                        break;
                    case "14":
                        verText = "14 GOLD";
                        break;
                    case "15":
                        verText = "15 DJ TROOPERS";
                        break;
                    case "16":
                        verText = "16 EMPRESS";
                        break;
                    case "17":
                        verText = "17 SIRIUS";
                        break;
                    case "18":
                        verText = "18 Resort Anthem";
                        break;
                    case "19":
                        verText = "19 Lincle";
                        break;
                    case "20":
                        verText = "20 tricoro";
                        break;
                    case "21":
                        verText = "21 SPADA";
                        break;
                    case "22":
                        verText = "22 PENDUAL";
                        break;
                    case "23":
                        verText = "23 copula";
                        break;
                    case "24":
                        verText = "24 SINOBUZ";
                        break;
                    case "25":
                        verText = "25 CANNON BALLERS";
                        break;
                    case "26":
                        verText = "26 Rootage";
                        break;
                    case "27":
                        verText = "27 HEROIC VERSE";
                        break;
                    case "28":
                        verText = "28 BISTROVER";
                        break;
                    case "29":
                        verText = "29 CastHour";
                        break;
                    case "30":
                        verText = "30 RESIDENT";
                        break;
                    case "31":
                        verText = "31 EPOLIS";
                        break;
                    case "32":
                        verText = "32 Pinky Crush";
                        break;
                    case "0":
                        verText = "CS or INFINITAS 専用曲";
                        break;
                    default:
                        verText = "不明";
                        break;
                }

                html += `<div style="margin-bottom: 0.2rem;"><b>${label}:</b> ${verText}</div>`;

            } else if (key === "lamp") {
                // modalData.lamp に基づいた表示内容を設定
                let lampText = '';
                if (modalData[key] === "FC") {
                    lampText = "FULL COMBO";
                } else if (modalData[key] === "EXH") {
                    lampText = "EX-HARD CLEAR";
                } else if (modalData[key] === "H") {
                    lampText = "HARD CLEAR";
                } else if (modalData[key] === "C") {
                    lampText = "CLEAR";
                } else if (modalData[key] === "E") {
                    lampText = "EASY CLEAR";
                } else if (modalData[key] === "AE") {
                    lampText = "A-EASY CLEAR";
                } else if (modalData[key] === "F") {
                    lampText = "FAILED";
                } else {
                    return;
                }

                html += `<div style="margin-bottom: 0.2rem;"><b>${label}:</b> ${lampText}</div>`;

            } else if ((key === "score-rank" || key === "real-rank") && modalData[key] && modalData[`${key}HTML`]) {
                if (modalData[key] === "") return;
 
                // スコアランクの<br>タグを半角スペースに置き換え
                let sanitizedText = modalData[`${key}HTML`].replace(/<br\s*\/?>/gi, ' ');

                html += `<div style="margin-bottom: 0.2rem;"><b>${label}:</b> ${sanitizedText}</div>`;

            } else if (key === "unlock" && modalData["inf"]) {
                // 'inf'がある場合のみ、'unlock' を表示
                unlockText = modalData[key] || "デフォルト解禁";
                html += `<div style="margin-bottom: 0.2rem;"><b>${label}:</b> ${unlockText}</div>`;

            } else if (key === "textage" && modalData[`${key}HTML`]) {
                let sanitizedText = modalData[`${key}HTML`].replace(/<a[^>]*>([^<]+)<\/a>/gi, (match) => {
                    // <a> タグの属性（href, targetなど）を保持
                    const linkAttributes = match.match(/<a[^>]*>/i)[0]; // <a> タグ全体を取得
                    // リンクテキストを {modalData.title} DBR に変更
                    const newLinkText = `${modalData.title} DBR`;

                    // 新しいリンクタグを返す
                    return linkAttributes.replace(/<a[^>]*>/, `<a ${linkAttributes.slice(2)}`) + newLinkText + '</a>';
                });

                html += `<div style="margin-bottom: 0.2rem;"><b>${label}:</b> ${sanitizedText}</div>`;

            } else if (key === "video" && modalData[`${key}HTML`]) {
                // <br> タグを削除
                let sanitizedText = modalData[`${key}HTML`].replace(/<br\s*\/?>/gi, '');

                // <a> タグが含まれている場合、margin-right を追加
                const isLinkPresent = /<a[^>]*>/gi.test(sanitizedText);

                if (isLinkPresent) {
                    // <a> タグに margin-right を追加
                    sanitizedText = sanitizedText.replace(/<a /gi, '<a style="margin-right: 0.125rem;" ');
                }

                html += `<div style="margin-bottom: 0.2rem;"><b>${label}:</b> ${sanitizedText}</div>`;

            } else if (modalData[key] && modalData[key].toString().trim()) {
                html += `<div style="margin-bottom: 0.2rem;"><b>${label}:</b> ${modalData[key]}</div>`;
            }
        });

        // notes/scratch を data-notes-full から逆算し、倍数前後両方表示
        let notesValue = parseInt($row.find(".col-notes a").data("notes-full")) || 0;
        let notesDisplayStr = $row.find(".col-notes").text().trim();

        let notesDisplay;
        let scratch;
        let halfNotes;
        let halfScratch;

        // --- 共通化関数を利用してURLを取得 ---
        const videoURL = extractHref(modalData.videoHTML);
        const textageID = extractTextageID(modalData.textageHTML);

        if (notesDisplayStr.startsWith("(") && notesDisplayStr.endsWith(")")) {
            // 括弧付き＝スクラッチ不明
            notesDisplay = parseInt(notesDisplayStr.replace(/[()]/g, "")) || 0;
            scratch = "不明";
            halfScratch = "";
        } else {
            notesDisplay = parseInt(notesDisplayStr) || 0;
            scratch = notesValue - notesDisplay;
            halfScratch = scratch / 2;
        }

        halfNotes = notesValue / 2;

        html += `<hr><small>
            皿含ノーツ数: ${notesValue === 0 ? "不明" : `${notesValue}（= ${halfNotes} × 2）`}
            皿枚数: ${scratch === "不明" ? "不明" : `${scratch}（= ${halfScratch} × 2）`}
        </small>`;

        const oldUnlockMethod = modalData.unlock ? parseUnlockMethod(modalData.unlock) : "";

        $("#modalBody").html(html);

        // 提案ボタン生成
        const isUnrated = modalData.level === "☆未査定" || modalData.level === "†☆未査定";
        const actions = [];

        if (isUnrated) {
            actions.push(`<button class="proposal-btn" data-type="new">新規提案</button>`);
        } else {
            actions.push(`<button class="proposal-btn" data-type="change">変更提案</button>`);
            actions.push(`<button class="proposal-btn" data-type="recommend">おすすめ提案</button>`);
        }

        $("#modalActions").html(actions.join(" "));

        // 各提案ボタンの挙動
        $(".proposal-btn").off("click").on("click", function () {
            const type = $(this).data("type");

            if (currentProposalType === type) {
                return; // 同じ種類のフォームがすでに表示中なら何もしない
            }

            $("#proposalForm").remove();
            currentProposalType = type; // 今回押された種類を記録

            const today = new Date();
            const formattedToday = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;


            let formHtml = `<form id="proposalForm" style="margin-top: 1rem;"><hr><b>【${type === "new" ? "新規提案" : type === "change" ? "変更提案" : "おすすめ提案"}フォーム】</b><br>`;

            if (type === "new") {
                formHtml += `
                <label>レベル（必須）: ☆<input name="level_new" required pattern="^[0-9]{1,2}\\.[0-9]{2}$"
                    maxlength="5" title="小数点以下2桁までの数値を入力してください（例：11.00）" style="width: 5ch;"></label><br>
                <label>おすすめ度（任意）:
                    <select name="recommend_new" style="margin-top: 0.2rem; margin-bottom: 0.2rem;">
                        <option value="">（選択）</option>
                        <option value="☆">☆:強くおすすめできる</option>
                        <option value="○">○:やって損はしない</option>
                        <option value="">無記入:そうでもない</option>
                    </select>
                </label><br>

                <label>コメント（任意）:<br><textarea name="comment_new" rows="3" style="width:100%; margin-top: 0.2rem;"></textarea></label><br>
                <small>※おすすめコメント、譜面傾向、解説、攻略情報などなんでも（表に反映されます）</small><br>
                                
                <label>INFINITAS収録有無（任意）:
                    <select name="inf_new" id="infPresence" style="margin-top: 0.5rem;">
                        <option value="">（選択）</option>
                        <option value="INF無し">INF無し</option>
                        <option value="○">INF有り</option>
                    </select>
                </label><br>

                <div id="unlockFields" style="display:none;">
                    <label>INFINITAS解禁区分（任意）:<br>

                    <select name="unlock_type" id="unlockTypeSelect">
                        <option value="">（選択）</option>
                        <option value="default">デフォルト曲</option>
                        <option value="BIT解禁">BIT解禁</option>
                        <option value="INFINITAS 楽曲パック">INFINITAS 楽曲パック</option>
                        <option value="pop'n music セレクション 楽曲パック">pop'n music セレクション 楽曲パック</option>
                        <option value="スタートアップセレクション 楽曲パック">スタートアップセレクション 楽曲パック</option>
                        <option value="jubeat セレクション 楽曲パック">jubeat セレクション 楽曲パック</option>
                        <option value="SOUND VOLTEX セレクション 楽曲パック">SOUND VOLTEX セレクション 楽曲パック</option>
                        <option value="BPL セレクション 楽曲パック">BPL セレクション 楽曲パック</option>
                        <option value="東方Project セレクション 楽曲パック">東方Project セレクション 楽曲パック</option>
                        <option value="ULTIMATE MOBILE セレクション 楽曲パック">ULTIMATE MOBILE セレクション 楽曲パック</option>
                        <option value="DJPOINT解禁">DJPOINT解禁</option>
                    </select>
                    <span id="unlockVolInput" style="display:none;">
                    vol.<input type="text" name="unlock_vol" style="width: 3ch;"
                    inputmode="numeric"
                    pattern="[0-9]+"
                    maxlength="3"
                    oninput="this.value = this.value.replace(/[^\\d]/g, '')">
                    </span>
                    </label><br>
                </div>

                <label>
                    <input type="checkbox" id="detailedScoreInfo" name="detailedScoreInfo" style="margin-top: 0.75rem;"/>
                    詳細な譜面情報を提供する
                </label>

                <div id="detailedScoreFields" style="display:none;">
                    <label>SP総ノーツ数（任意）: 
                        <input type="text" name="notes_sp" inputmode="numeric"
                            pattern="[0-9]+"
                            maxlength="4"
                            oninput="this.value = this.value.replace(/[^\\d]/g, ''); if (this.value.startsWith('0')) this.value = this.value.slice(1);"
                            value="${halfNotes || ''}" style="width: 4ch; margin-top: 0.5rem;">
                    </label>
                    <br>
                    <label>SP皿枚数（任意）: 
                        <input type="text" name="sara_sp" inputmode="numeric"
                            pattern="[0-9]+"
                            maxlength="4"
                            oninput="this.value = this.value.replace(/[^\\d]/g, ''); if (this.value.startsWith('0')) this.value = this.value.slice(1);"
                            value="${halfScratch || ''}" style="width: 4ch; margin-top: 0.5rem;">
                    </label>
                    <br>
                    <label>BPM（任意）: 
                        <input type="text" name="bpm" inputmode="numeric" 
                            pattern="^[0-9]+(?:-[0-9]+)?$" 
                            maxlength="7" 
                            oninput="this.value = this.value.replace(/[^0-9-]/g, '').replace(/(?<=\d)(?=\d{2,4}$)/, '-'); if (this.value.startsWith('0')) this.value = this.value.slice(1);"
                            value="${modalData.bpm || ''}" style="width: 7ch; margin-top: 0.5rem;">
                    </label><br>
                    <small>
                        ※<b>ソフランする場合「最小値-最大値」で記載してください</b>（例：95-210）
                    </small>
                    <br>
                    <label>TexTageID（任意）: 
                        <input type="text" name="textage_id" value="${textageID || ''}"/ style="margin-top: 1rem;" inputmode="url">
                    </label><br>
                    <small>
                        ※<b>TexTageで対象の譜面画像を表示した際のURL</b><br>
                        https://textage.cc/score/バージョン/<b>（ここを記載してください）</b>.html
                    </small><br>
                    <label>動画URL（任意）: 
                        <input type="text" name="video_url" value="${videoURL || ''}"/ style="margin-top: 1rem;" inputmode="url">
                    </label><br>
                    <small>
                        <b>※提案者ご自身の動画か掲載許可を得た動画URLでお願いします</b><br>
                        この項目が既に記載されている場合はそのまま送信してください<br>
                        2動画以上掲載したい場合、送信後に備考欄へ追記してください
                    </small>
                </div>
                `;
            }

            if (type === "change") {
                formHtml += `
                <label>変更後レベル（必須）: ☆<input name="level_change" required pattern="^[0-9]{1,2}\\.[0-9]{2}$"
                    maxlength="5" title="小数点以下2桁までの数値を入力してください（例：11.00）" style="width: 5ch;"></label><br>
                <label>提案理由（必須）:<br><textarea name="reason_change" rows="3" required style="width:100%;"></textarea></label><br>
                `;
            }

            if (type === "recommend") {
                formHtml += `
                <label>変更後おすすめ度（必須）:
                    <select name="recommend_change" required>
                        <option value="">（選択）</option>
                        <option value="☆">☆:強くおすすめできる</option>
                        <option value="○">○:やって損はしない</option>
                        <option value="">無記入:そうでもない</option>
                    </select>
                </label><br>
                <label>提案理由（必須）:<br><textarea name="reason_recommend" rows="3" required style="width:100%;"></textarea></label><br>
                `;
            }

            formHtml += `<button type="submit">送信（仮）</button></form>`;
            $("#modalActions").append(formHtml);

            // INF有無選択によりINF解禁区分の表示切替
            $(document).off("change", "#infPresence").on("change", "#infPresence", function () {
                const show = $(this).val() === "○";

                // INF有無が「○」の場合は表示、それ以外は非表示
                $("#unlockFields").toggle(show);

                // 表示状態に応じてrequired制御
                const $vol = $("input[name='unlock_vol']");
                if (show) {
                    // 表示時は状況に応じてrequired付ける or 外す
                    const unlockType = $("#unlockTypeSelect").val();
                    // BIT解禁などはrequired外し、それ以外はrequiredにする例
                    const needRequired = unlockType && !unlockType.match(/(default|BIT解禁|DJPOINT解禁)/);
                    $vol.prop("required", needRequired);
                } else {
                    // 非表示時は必ずrequired外す
                    $vol.prop("required", false);
                    $vol.val("");
                    $("#unlockTypeSelect").val("");

                    // unlockTypeSelectの変更があっても、INF有無が「○」でなければ必ず非表示にする
                    $("#unlockVolInput").hide();
                }
            });

            $(document).on("change", "#detailedScoreInfo", function() {
                if ($(this).is(":checked")) {
                    $("#detailedScoreFields").show();
                } else {
                    $("#detailedScoreFields").hide();
                }
            });

            $("#proposalForm").off("submit").on("submit", function (e) {
                e.preventDefault();

                // ボタンを無効化
                const submitButton = $(this).find("button[type='submit']");
                submitButton.prop("disabled", true);

                // ローディング表示
                const loadingMessage = `
                    <div id="loading">
                        <div class="spinner"></div>
                        <div class="loading-text">提案内容を反映中です。<br>しばらくお待ちください……</div>
                    </div>
                `;
                $("body").append(loadingMessage);  // ローディングを表示

                // INF有無が空欄の場合は、解禁区分関連の値をクリア
                if ($("#infPresence").val() !== "○") {
                    $("#unlockTypeSelect").val("");
                    $("input[name='unlock_vol']").val("");
                }

                const formData = Object.fromEntries(new FormData(this).entries());

                // チェックボックスが外れている場合、初期値送信
                if (!$("#detailedScoreInfo").is(":checked")) {
                    formData.notes_sp = halfNotes || '';
                    formData.sara_sp = halfScratch || '';
                    formData.bpm = modalData.bpm || '';
                    formData.textage_id = textageID || '';
                    formData.video_url = videoURL || '';
                }

                // 変更提案やおすすめ提案のバリデーション
                if (type === "change") {
                    // 変更提案時にレベルが同じ場合
                    if (modalData.level.replace(/^[☆†]*[☆†]/, "") === formData.level_change) {
                        $("#loading").remove(); // ローディングを削除
                        // バリデーションエラー
                        alert("変更後のレベルが現在のレベルと一致しています。変更してください。");
                        submitButton.prop("disabled", false); // ボタンを再度有効化
                        return; // 送信しない
                    }
                } else if (type === "recommend") {
                    // おすすめ提案時におすすめ度が同じ場合
                    if (modalData.recommend === formData.recommend_change) {
                        $("#loading").remove(); // ローディングを削除
                        // バリデーションエラー
                        alert("変更後のおすすめ度が現在のおすすめ度と一致しています。変更してください。");
                        submitButton.prop("disabled", false); // ボタンを再度有効化
                        return; // 送信しない
                    }
                }

                // unlock_vol の required 制御（自然なブラウザバリデーション）
                if (!e.target.checkValidity()) {
                    $("#loading").remove(); // ローディングを削除
                    e.target.reportValidity();
                    // ボタンを再度有効化
                    submitButton.prop("disabled", false);
                    return;
                }

                // INF解禁区分の作成
                let unlockStr = "";
                if (formData.unlock_type) {
                    unlockStr = formData.unlock_type;
                    if (!unlockStr.match(/(default|BIT解禁|DJPOINT解禁)/) && formData.unlock_vol?.trim()) {
                        unlockStr += ` vol.${formData.unlock_vol.trim()}`;
                    }
                }
 
                const unlockMethod = unlockStr ? parseUnlockMethod(unlockStr) : ""; 

                // 提案データを整理
                const data = {
                    提案日時: formattedToday
                };

                if (type === "new") {
                    data["バージョン"] = modalData.ver;
                    data["レベル"] = formData.level_new;
                    data["曲名"] = modalData.title;
                    data["動画URL"] = formData.video_url;
                    data["TexTageID"] = formData.textage_id;
                    data["ノーツ数(SP)"] = formData.notes_sp;
                    data["皿枚数(SP)"] = formData.sara_sp;
                    data["BPM"] = formData.bpm;
                    data["おすすめ度"] = formData.recommend_new;
                    data["INF有無"] =  "";
                    data["ACプレイ不可"] = modalData.level.startsWith("†") ? "○" : ""
                    data["コメント"] = formData.comment_new;
                    data["INF解禁区分"] = "";

                    // 明示的にINF無しを入力した場合
                    if (formData.inf_new === "INF無し") {
                        data["INF有無"] =  "";
                        data["INF解禁区分"] = "";
                    } else {
                        // INF有無とINF解禁区分に値がない場合、modalDataから値をセット
                        data["INF有無"] = formData.inf_new || modalData.inf || "";
                        if (unlockMethod === "default") {
                            data["INF解禁区分"] = "";
                        } else if (unlockMethod) {
                            data["INF解禁区分"] = unlockMethod;
                        } else if (oldUnlockMethod) {
                            data["INF解禁区分"] = oldUnlockMethod;
                        } else {
                            data["INF解禁区分"] = "";
                        }
                    }

                    // スプレッドシートに送信
                    sendNewProposalToSheet(data, submitButton, $("#loading"));
                } else if (type === "change") {
                    data["現在のレベル"] = modalData.level.replace(/^[☆†]*[☆†]/, "");
                    data["変更後のレベル"] = formData.level_change;
                    data["曲名"] = modalData.title;
                    data["提案理由"] = formData.reason_change;

                    // スプレッドシートに送信
                    sendChangeProposalToSheet(data, submitButton, $("#loading"));
                } else if (type === "recommend") {
                    data["現在のおすすめ度"] = modalData.recommend;
                    data["変更後のおすすめ度"] = formData.recommend_change;
                    data["曲名"] = modalData.title;
                    data["提案理由"] = formData.reason_recommend;

                    // スプレッドシートに送信
                    sendRecommendProposalToSheet(data, submitButton, $("#loading"));
                }
            });
        });

        $(document).off("change", "#unlockTypeSelect").on("change", "#unlockTypeSelect", function () {
            const val = $(this).val();
            const $unlockVol = $("input[name='unlock_vol']");

            if (val && !val.match(/(default|BIT解禁|DJPOINT解禁)/)) {
                $("#unlockVolInput").show();
                $unlockVol.prop("required", true); // 表示 → 必須
            } else {
                $("#unlockVolInput").hide();
                $unlockVol.val("").prop("required", false); // 非表示 → 必須解除
            }
        });

        modalJustOpened = true;
        adjustModalHeight();
        $("#infoModal").fadeIn(() => {
            modalJustOpened = false;
        });
    });
}

function parseUnlockMethod(formatted) {
    if (!formatted) return '';

    return formatted
        .replace(/BIT解禁/g, 'BIT')
        .replace(/INFINITAS 楽曲パック vol\.(\d+)/g, 'PK$1')
        .replace(/スタートアップセレクション 楽曲パック vol\.(\d+)/g, 'ST$1')
        .replace(/pop'n music セレクション 楽曲パック vol\.(\d+)/g, 'PM$1')
        .replace(/jubeat セレクション 楽曲パック vol\.(\d+)/g, 'ju$1')
        .replace(/SOUND VOLTEX セレクション 楽曲パック vol\.(\d+)/g, 'SV$1')
        .replace(/BPL セレクション 楽曲パック vol\.(\d+)/g, 'BPL$1')
        .replace(/東方Project セレクション 楽曲パック vol\.(\d+)/g, 'TH$1')
        .replace(/ULTIMATE MOBILE セレクション 楽曲パック vol\.(\d+)/g, 'UM$1')
        .replace(/DJPOINT解禁/g, 'DJP');
}

// 新規提案 GASにデータを送信
function sendNewProposalToSheet(proposalData, submitButton, loadingElement) {
    // proposalDataの内容を配列に変換
    const rowData = [
        proposalData["提案日時"],
        proposalData["バージョン"],
        proposalData["レベル"],
        proposalData["曲名"],
        proposalData["動画URL"],
        proposalData["TexTageID"],
        proposalData["ノーツ数(SP)"],
        proposalData["皿枚数(SP)"],
        proposalData["BPM"],
        proposalData["おすすめ度"],
        proposalData["INF有無"],
        proposalData["ACプレイ不可"],
        proposalData["コメント"],
        proposalData["INF解禁区分"]
    ];

    // proposalType（新規提案 or 変更提案）を追加
    rowData.push("new");  // "new" や "change" を追加

    // 配列をJSONに変換し、URLエンコード
    const encodedData = encodeURIComponent(JSON.stringify({
        data: rowData  // 配列を送信
    }));

    // URLSearchParamsを使ってデータを適切に変換
    const params = new URLSearchParams();
    params.append('data', encodedData);  // URLエンコードされたJSONを追加

    fetch(GAS_URL, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',  // 正しいContent-Type
        },
        body: params  // URLSearchParams型で送信
    })
    .then(response => response.json())
    .then(data => {
        // ローディング要素を削除
        loadingElement.remove();

        // レスポンスの表示（成功/失敗メッセージ）
        if (data.result === "success") {
            alert(`新規提案シートに遷移します。\n反映された内容をご確認ください。`);
            // OKを押した後にスプレッドシートに直接遷移
            // テスト用
            // window.location.href = "https://docs.google.com/spreadsheets/d/1wK7m7JO83Dc2v-TqGkWd7DqSNVThvPauzq5QpC8W1_0/edit?gid=1709558806#gid=1709558806";
            
            // 本番シート
            window.location.href = "https://docs.google.com/spreadsheets/d/1R-bgS7CZ1BBTzsk4KRKRSmBAZWNotZnQLfWtZFQr-Ek/edit?gid=1709558806#gid=1709558806";
        } else {
            alert(`${data.message}`);

            // ボタンを再度有効化
            submitButton.prop("disabled", false);
        }
    })
    .catch(error => {
        // ローディング要素を削除
        loadingElement.remove();

        console.error("送信エラー:", error);

        alert(`提案内容の送信に失敗しました。`);

        // ボタンを再度有効化
        submitButton.prop("disabled", false);
    });
}

// 変更提案 GASにデータを送信
function sendChangeProposalToSheet(proposalData, submitButton, loadingElement) {
    // proposalDataの内容を配列に変換
    const rowData = [
        proposalData["提案日時"],
        proposalData["現在のレベル"],
        proposalData["変更後のレベル"],
        proposalData["曲名"],
        proposalData["提案理由"]
    ];

    // proposalType（変更提案）を追加
    rowData.push("change");

    // 配列をJSONに変換し、URLエンコード
    const encodedData = encodeURIComponent(JSON.stringify({
        data: rowData  // 配列を送信
    }));

    // URLSearchParamsを使ってデータを適切に変換
    const params = new URLSearchParams();
    params.append('data', encodedData);  // URLエンコードされたJSONを追加

    fetch(GAS_URL, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',  // 正しいContent-Type
        },
        body: params  // URLSearchParams型で送信
    })
    .then(response => response.json())
    .then(data => {
        // ローディング要素を削除
        loadingElement.remove();

        // レスポンスの表示（成功/失敗メッセージ）
        if (data.result === "success") {
            alert(`変更提案シートに遷移します。\n反映された内容をご確認ください。`);

            // OKを押した後にスプレッドシートに直接遷移
            // テスト用
            // window.location.href = "https://docs.google.com/spreadsheets/d/1wK7m7JO83Dc2v-TqGkWd7DqSNVThvPauzq5QpC8W1_0/edit?gid=1267054778#gid=1267054778";
            
            // 本番シート
            window.location.href = "https://docs.google.com/spreadsheets/d/1R-bgS7CZ1BBTzsk4KRKRSmBAZWNotZnQLfWtZFQr-Ek/edit?gid=1267054778#gid=1267054778";
        } else {
            alert(`${data.message}`);

            // ボタンを再度有効化
            submitButton.prop("disabled", false);
        }
    })
    .catch(error => {
        // ローディング要素を削除
        loadingElement.remove();

        console.error("送信エラー:", error);

        alert(`提案内容の送信に失敗しました。`);

        // ボタンを再度有効化
        submitButton.prop("disabled", false);
    });
}

// おすすめ提案 GASにデータを送信
function sendRecommendProposalToSheet(proposalData, submitButton, loadingElement) {
    // proposalDataの内容を配列に変換
    const rowData = [
        proposalData["提案日時"],
        proposalData["現在のおすすめ度"],
        proposalData["変更後のおすすめ度"],
        proposalData["曲名"],
        proposalData["提案理由"]
    ];

    // 提案種類を追加
    rowData.push("recommend");

    // 配列をJSONに変換し、URLエンコード
    const encodedData = encodeURIComponent(JSON.stringify({
        data: rowData  // 配列を送信
    }));

    // URLSearchParamsを使ってデータを適切に変換
    const params = new URLSearchParams();
    params.append('data', encodedData);  // URLエンコードされたJSONを追加

    fetch(GAS_URL, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',  // 正しいContent-Type
        },
        body: params  // URLSearchParams型で送信
    })
    .then(response => response.json())
    .then(data => {
        // ローディング要素を削除
        loadingElement.remove();

        // レスポンスの表示（成功/失敗メッセージ）
        if (data.result === "success") {
            alert(`おすすめ提案シートに遷移します。\n反映された内容をご確認ください。`);
            // OKを押した後にスプレッドシートに直接遷移
            // テスト用
            // window.location.href = "https://docs.google.com/spreadsheets/d/1wK7m7JO83Dc2v-TqGkWd7DqSNVThvPauzq5QpC8W1_0/edit?pli=1&gid=1779953087#gid=1779953087";
            
            // 本番シート
            window.location.href = "https://docs.google.com/spreadsheets/d/1R-bgS7CZ1BBTzsk4KRKRSmBAZWNotZnQLfWtZFQr-Ek/edit?gid=1779953087#gid=1779953087";
        } else {
            alert(`${data.message}`);

            // ボタンを再度有効化
            submitButton.prop("disabled", false);
        }
    })
    .catch(error => {
        // ローディング要素を削除
        loadingElement.remove();

        console.error("送信エラー:", error);

        alert(`提案内容の送信に失敗しました。`);

        // ボタンを再度有効化
        submitButton.prop("disabled", false);
    });
}