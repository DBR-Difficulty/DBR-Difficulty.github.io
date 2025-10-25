import subprocess

from pathlib import Path

BASE_URL = "https://dbr-difficulty.github.io"

# ホワイトリスト読み込み
with open("sitemap_list.txt", "r", encoding="utf-8") as f:
    pages = [line.strip() for line in f if line.strip()]

xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]

for path in pages:
    full_path = "index.html" if path == "/" else path
    url = f"{BASE_URL}/{path.lstrip('/')}"

    # 最終コミット日時を取得（取得できない場合は省略）
    try:
        lastmod = subprocess.check_output(
            ["git", "log", "-1", "--format=%cI", "--", full_path],
            stderr=subprocess.DEVNULL
        ).decode("utf-8").strip()
    except subprocess.CalledProcessError:
        lastmod = None
        print(f"{full_path} の最終コミット日時が取得できません。lastmod は省略されます。")

    xml.append(f"  <url>")
    xml.append(f"    <loc>{url}</loc>")
    if lastmod:
        xml.append(f"    <lastmod>{lastmod}</lastmod>")
    xml.append(f"  </url>")

xml.append("</urlset>")

# 公開用フォルダに書き出す
Path("docs").mkdir(exist_ok=True)
with open("docs/sitemap.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(xml))

print("sitemap.xml generated in docs/ folder.")
