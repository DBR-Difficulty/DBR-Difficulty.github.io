
import json, pickle
from js import document, Uint8Array, Blob, URL, FileReader

# タイトル変換マップ
# daken_counter : DBR難易度表
# daken_counter側誤字じゃなければ消していく
title_map = {
    "ギョギョっと人魚 爆婚ブライダル": "ギョギョっと人魚♨爆婚ブライダル",
    "キャトられ恋はモ～モク": "キャトられ♥恋はモ～モク",
    "100％ minimoo-G": "100% minimoo-G",
    "19，November": "19,November",
    "Amor De Verao": "Amor De Verão",
    "BLOSSOM": "BLO§OM",
    "Blind Justice ～Torn souls， Hurt Faiths ～": "Blind Justice ～Torn souls, Hurt Faiths ～",
    "CODE:1 [revision1.0.1]": "CODE:1 [revision 1.0.1]",
    "CODE:0": "CODE:Ø",
    "CROSSROAD ～Left Story～": "CROSSROAD",
    "Double Loving Heart": "Double♡♡Loving Heart",
    "Geirskogul": "Geirskögul",
    "L'amour et la liberte": "L'amour et la liberté",
    "LOVE SHINE": "LOVE♡SHINE",
    "Praludium": "Präludium",
    "Raison d'etre～交差する宿命～": "Raison d'être～交差する宿命～",
    "Raspberry Heart(English version)": "Raspberry♡Heart(English version)",
    "Smug Face -どうだ、オレの生き様は-(ONLY ONE EDITION)": "Smug Face -どうだ、オレの生き様は- (ONLY ONE EDITION)",
    "Time To Empress": "Time to Empress",
    "e-motion 2003  -romantic extra-": "e-motion 2003 -romantic extra-",
    "!Viva!": "¡Viva!",
    "ATHER": "ÆTHER",
    "Ubertreffen": "Übertreffen",
    "Ou Legends": "Ōu Legends",
    "ピアノ協奏曲第1番\"蠍火\" (BlackY Remix)": "ピアノ協奏曲第1番”蠍火” (BlackY Remix)",
    "共犯へヴンズコード": "共犯ヘヴンズコード", # 平仮名のへ
    "旋律のドグマ～Miserables～": "旋律のドグマ～Misérables～",
    "表裏一体！？怪盗いいんちょの悩み": "表裏一体！？怪盗いいんちょの悩み♥",
    "超!!遠距離らぶメ～ル": "超!!遠距離らぶ♡メ～ル",
    "火影": "焱影",
    "Macho Monky": "Mächö Mönky",
    "Sweet Sweet Magic": "Sweet Sweet♡Magic",
    "フェティッシュペイパー ～脇の汗回転ガール～": "フェティッシュペイパー ～ 脇の汗回転ガール ～",
    'JOURNEY TO "FANTASICA" (IIDX LIMITED)': 'JOURNEY TO "FANTASICA" (IIDX LIMITED )',
    "L'amour et la liberte": "L'amour et la liberté",
    "Love km": "Love♡km",
    "Note Highway ft.KANASA from bless4": "Note Highway ft. KANASA from bless4",
    "Programmed Sun(xac Antarctic Ocean mix)": "Programmed Sun (xac Antarctic Ocean mix)",
}

# INFが旧譜面の曲を置き換えるマップ
# key = (曲名, 譜面種別)
chart_specific_title_map = {
    ("ADVANCE", "A"): "ADVANCE(譜面変更前)",
    ("ADVANCE", "H"): "ADVANCE(譜面変更前)",
    ("ADVANCE", "N"): "ADVANCE(譜面変更前)",
    ("DEEP ROAR", "A"): "DEEP ROAR(譜面変更前)",
    ("madrugada", "A"): "madrugada(譜面変更前)",
    ("MAX 300", "N"): "MAX 300(譜面変更前)",
    ("New Castle Legions", "A"): "New Castle Legions(譜面変更前)",
    ("New Castle Legions", "H"): "New Castle Legions(譜面変更前)",
    ("New Castle Legions", "N"): "New Castle Legions(譜面変更前)",
    ("PARANOIA survivor MAX", "A"): "PARANOIA survivor MAX(譜面変更前)",
    ("PARANOIA survivor MAX", "H"): "PARANOIA survivor MAX(譜面変更前)",
    ("PARANOIA survivor MAX", "N"): "PARANOIA survivor MAX(譜面変更前)",
    ("soldier's waltz", "A"): "soldier's waltz(譜面変更前)",
    ("soldier's waltz", "H"): "soldier's waltz(譜面変更前)",
    ("soldier's waltz", "N"): "soldier's waltz(譜面変更前)",
    ("THE SHINING POLARIS(kors k mix)", "A"): "THE SHINING POLARIS(kors k mix)(譜面変更前)",
    ("THE SHINING POLARIS(kors k mix)", "H"): "THE SHINING POLARIS(kors k mix)(譜面変更前)",
    ("THE SHINING POLARIS(kors k mix)", "N"): "THE SHINING POLARIS(kors k mix)(譜面変更前)",
    ("VJ ARMY", "A"): "VJ ARMY(譜面変更前)",
    ("VJ ARMY", "H"): "VJ ARMY(譜面変更前)",
    ("VJ ARMY", "N"): "VJ ARMY(譜面変更前)",
    ("ミッドナイト堕天使", "A"): "ミッドナイト堕天使(譜面変更前)",
    ("L'amour et la liberte", "N"): "L'amour et la liberté(譜面変更前)"
}

# レベル制限を無視して取得する例外リスト
# key = (曲名, 譜面種別)
level_ignore_exceptions = [
    ("Rise'n Beauty", "N"),
]

def convert_alllog(*args):
    try:
        files = list(document.getElementById("fileInput").files)
        if not files:
            print("ファイルが選択されていません")
            return

        file = files[0]
        reader = FileReader.new()

        def onload(evt):
            try:
                array = Uint8Array.new(reader.result)
                buffer = bytes(array.to_py())
                data = pickle.loads(buffer)

                bp13 = document.getElementById("bp13hard").checked
                bp5 = document.getElementById("bp5exh").checked
                bp0 = document.getElementById("bp0fc").checked

                ignore_failed_bp = document.getElementById("ignoreFailedBp").checked
                ignore_ascr_score = document.getElementById("ignoreAscrScore").checked

                lamp_order = ["F-COMBO", "EXH-CLEAR", "H-CLEAR", "CLEAR", "E-CLEAR", "A-CLEAR", "FAILED", "NO PLAY"]
                lamp_map = {"F-COMBO": "FC", "EXH-CLEAR": "EXH", "H-CLEAR": "H", "CLEAR": "C", "E-CLEAR": "E", "A-CLEAR": "AE", "FAILED": "F"}
                lamp_rank = {lamp: i for i, lamp in enumerate(lamp_order)}
                best_data = {}

                for row in data:
                    row = list(row)
                    try:
                        # 一応皿ありにも対応
                        # 多分DBRMやDBシンクロ乱も取れちゃう リザルトで共通なのが公式仕様なのでどうにもならない
                        # FHD化以前のオプション取得時代なら取れる？
                        # レベル7未満は除外 表入りした譜面は例外的に取得
                        level = int(row[0])
                        raw_title = row[1]
                        chart_type = row[2][-1]
                        
                        # 例外判定を先に行う
                        ignore_level_limit = (raw_title, chart_type) in level_ignore_exceptions

                        if (level < 7 and not ignore_level_limit) or "BATTLE, RAN / RAN" not in row[12]:
                            continue

                        chart_specific_key = (raw_title, chart_type)
                        if chart_specific_key in chart_specific_title_map:
                            title = chart_specific_title_map[chart_specific_key]
                        else:
                            title = title_map.get(raw_title, raw_title)

                        key = f"{title}({chart_type})"

                        lamp_raw = row[7]
                        score = int(row[9]) if row[9] not in (None, "") else None
                        bp = int(row[11]) if row[11] not in (None, "") else None
                        is_ascr = "A-SCR" in row[12]

                        if key not in best_data:
                            best_data[key] = {"lamp": None, "lamp_rank": len(lamp_order), "score": None, "bp": None}

                        # ランプ更新（順位ベース）
                        if lamp_raw in lamp_map:
                            r = lamp_rank[lamp_raw]
                            if r < best_data[key]["lamp_rank"]:
                                best_data[key]["lamp"] = lamp_map[lamp_raw]
                                best_data[key]["lamp_rank"] = r

                        # FAILEDかつ記録が不自然な場合はスコア・BP両方を弾く（途中落ちリザ対策）
                        is_bad_failed = (lamp_raw == "FAILED") and (
                            (bp is not None and bp <= 100) or
                            (score is not None and score <= 2000)
                        )

                        if is_bad_failed:
                            score = None
                            bp = None

                        # 条件により score, bp を破棄
                        if ignore_ascr_score and not is_ascr:
                            score = None
                        if ignore_failed_bp and lamp_raw == "FAILED":
                            bp = None

                        if bp is not None:
                            # BPだけの独立更新
                            if bp is not None:
                                if best_data[key]["bp"] is None or bp < best_data[key]["bp"]:
                                    best_data[key]["bp"] = bp
                                # 補完ランプ
                                if bp0 and bp == 0:
                                    best_data[key]["lamp"] = "FC"
                                elif bp5 and bp <= 5:
                                    best_data[key]["lamp"] = "EXH"
                                elif bp13 and bp <= 13:
                                    best_data[key]["lamp"] = "H"

                        # スコアだけの独立更新
                        if score is not None:
                            if best_data[key]["score"] is None or score > best_data[key]["score"]:
                                best_data[key]["score"] = score

                    except Exception as e:
                        print(f"行スキップ: {e}")
                        continue

                output = {"bp": {}, "lamp": {}, "score": {}}
                for key, d in best_data.items():
                    if d["lamp"]: output["lamp"][f"lamp_{key}"] = d["lamp"]
                    if d["score"] is not None: output["score"][f"score_{key}"] = str(d["score"])
                    if d["bp"] is not None: output["bp"][f"bp_{key}"] = str(d["bp"])

                json_str = json.dumps(output, ensure_ascii=False, indent=2)
                document.getElementById("output").textContent = json_str

                blob = Blob.new([json_str], { "type": "application/json" })
                url = URL.createObjectURL(blob)
                btn = document.getElementById("downloadBtn")
                btn.href = url
                btn.download = "dbr_import.json"
                btn.disabled = False

            except Exception as e:
                print(f"読み込みエラー: {e}")

        reader.onload = onload
        reader.readAsArrayBuffer(file)

    except Exception as e:
        print(f"ファイル選択エラー: {e}")
