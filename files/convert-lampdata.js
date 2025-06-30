(() => {
  const url = location.href;
  const match = url.match(/^https:\/\/beatmania-clearlamp\.com\/djdata\/([a-zA-Z0-9_]+)(\/sp)?\/?$/);
  if (!match || url.includes('/dp')) {
    alert('このブックマークレットはクリアランプマネージャーの「/djdata/{ID}」または「/djdata/{ID}/sp」ページで使用してください。');
    return;
  }

  const difficultyMap = {
    beginner: 'B',
    normal: 'N',
    hyper: 'H',
    another: 'A',
    leggendaria: 'L'
  };

  const lampMap = {
    'NO': 'NO PLAY',
    'FAILED': 'F',
    'EASY': 'E',
    'CLEAR': 'C',
    'HARD': 'H',
    'EX': 'EXH',
    'A': 'AE',
  }; // フルコンは共通

  const musicNameMap = {
    'Scripted Connection⇒N mix': 'Scripted Connection⇒ N mix',
    'Scripted Connection⇒H mix': 'Scripted Connection⇒ H mix',
    'Scripted Connection⇒A mix': 'Scripted Connection⇒ A mix',
    'Anisakis-somatic mutation type "Forza"-': 'Anisakis -somatic mutation type"Forza"-',
    'あるビー！feat.ころねぽち': 'あるビー！ feat.ころねぽち',
    'NEW SENSATION-もう、あなたしか見えない-': 'NEW SENSATION -もう、あなたしか見えない-',
    'Ubertreffen': 'Übertreffen',
    '405nm(Ryu☆mix)': '405nm (Ryu☆mix)',
    'Blind Justice～Torn souls,Hurt Faiths～': 'Blind Justice ～Torn souls, Hurt Faiths ～',
    'ぷろぐれっしぶ時空少女!うらしまたろ子ちゃん！': 'ぷろぐれっしぶ時空少女！うらしまたろ子ちゃん！',
    'ピアノ協奏曲第１番"蠍火"': 'ピアノ協奏曲第１番”蠍火”',
    'Wonder Girl feat. Kanae Asada': 'Wonder Girl feat. Kanae Asaba',
    '夕焼け～Fading Day～': '夕焼け ～Fading Day～',
    'Session 1-Genesis-': 'Session 1 -Genesis-',
    'X↑X↓': 'Ｘ↑Ｘ↓',
    'JUSTICE/GUILTY feat.Nana Takahashi & 709sec.': 'JUSTICE/GUILTY feat. Nana Takahashi & 709sec.',
    'Hat Surprise(Season 2)': 'Hat Surprise (Season 2)',
    'XIø': 'Xlø',
    "We're so Happy (P*Light Remix) IIDX Ver.": "We're so Happy (P*Light Remix) IIDX ver.", // シングルクォート対応
    '†渚の小悪魔ラヴリィ〜レイディオ†(IIDX EDIT)': '†渚の小悪魔ラヴリィ～レイディオ†(IIDX EDIT)',
    'NEW GENERATION-もう、お前しか見えない-': 'NEW GENERATION -もう、お前しか見えない-',
    'PLASMA SOUL NIGHT feat. Nana Takahashi/709sec.': 'PLASMA SOUL NIGHT feat. Nana Takahashi / 709sec.',
    'キャトられ 恋はモ～モク': 'キャトられ♥恋はモ～モク',
    'A MINSTREL～ver.short-scape～': 'A MINSTREL ～ ver. short-scape ～',
    'Timepiece phase II(CN Ver.)': 'Timepiece phase II (CN Ver.)',
    'ALL MY TURN-このターンに、オレの全てを賭ける-': 'ALL MY TURN -このターンに、オレの全てを賭ける-',
    'DAWN-THE NEXT ENDEAVOUR-': 'DAWN -THE NEXT ENDEAVOUR-',
    'か・し・ま・し☆PUMP UP !': 'か・し・ま・し☆PUMP UP！',
    'もっと!モット!ときめき feat. 松下': 'もっと！モット！ときめき feat. 松下',
    '合体せよ!ストロングイェーガー!!(Ryu☆ remix)': '合体せよ！ストロングイェーガー！！ (Ryu☆ remix)',
    'This Is Club Musik feat.大久保紅葉': 'This Is Club Muzik feat. 大久保紅葉',
    '果たせぬ約束 ft.小林マナ': '果たせぬ約束 ft. 小林マナ',
    'ミラージュ･レジデンス': 'ミラージュ・レジデンス',
    '灼熱Lost Summer Dayz': '灼熱 Lost Summer Dayz',
    'Heavenly Sun(IIDX VERSION)': 'Heavenly Sun (IIDX VERSION)',
    'LOVE SHINE': 'LOVE♡SHINE',
    'Turii～Panta rhei～': 'Turii ～Panta rhei～',
    'wanna be a "BAD GIRL" feat.Nana Takahashi': 'wanna be a "BAD GIRL" feat. Nana Takahashi',
    'Mermaid girl-秋葉工房MIX-': 'Mermaid girl-秋葉工房 MIX-',
    'CROSSROAD ～Left Story～': 'CROSSROAD',
    'Abyss-The Heavens Remix-': 'Abyss -The Heavens Remix-',
    '取り残された美術 (Arranged:HiZuMi)': '取り残された美術(Arranged:HiZuMi)',
    'Punch Love 仮面': 'Punch Love♡仮面',
    'Best Of Me': 'Best of Me',
    'Chain of Pain': 'Chain of pain',
    'do the thing feat.Kanae Asaba': 'do the thing feat. Kanae Asaba',
    'Praludium': 'Präludium',
    'Apocalypse～dirge of swans～': 'Apocalypse ～dirge of swans～',
    'Space in Time': 'Space In Time',
    'Raspberry Heart(English version)': 'Raspberry♡Heart(English version)',
    '華爛漫-Flowers-': '華爛漫 -Flowers-',
    'Cyber Force-DJ Yoshitaka Remix-': 'Cyber Force -DJ Yoshitaka Remix-',
    'DENIM (ELECTRO MIX)': 'DENIM',
    'DIVE～INTO YOUR HEART～': 'DIVE ～INTO YOUR HEART～',
    'Get set,Go! feat.Kanae Asaba': 'Get set, Go! feat.Kanae Asaba',
    'GRADIUS-FULL SPEED-': 'GRADIUS -FULL SPEED-',
    'Session 9-Chronicles-': 'Session 9 -Chronicles-',
    'Sweet Sweet Magic': 'Sweet Sweet♡Magic',
    'Double Loving Heart': 'Double♡♡Loving Heart',
    'Space in Time': 'Space In Time',
    '零-ZERO-': '零 - ZERO -',
    "I Was The One(80's EUROBEAT STYLE)": "I Was The One (80's EUROBEAT STYLE)",
    'Vibing! Shake It!': 'Vibing! Shake it!',
    'TA・DA☆YO・SHI': 'TA・DA ☆ YO・SHI',
    'Burning Heat!(Full Option Mix)': 'Burning Heat! (Full Option Mix)',
    'City Never Sleeps (IIDX EDITION)': 'City Never Sleeps (IIDX Edition)',
    'Colors(radio edit)': 'Colors (radio edit)',
    'Colors-Y&Co.Eurobeat Remix-': 'Colors -Y&Co. Eurobeat Remix-',
    'DEATH†ZIGOQ〜怒りの高速爆走野郎〜': 'DEATH†ZIGOQ ～怒りの高速爆走野郎～',
    "Dr.Chemical & Killing Machine": "Dr. Chemical & Killing Machine",
    "Frozen Ray(original mix)": "Frozen Ray (original mix)",
    "Funny Shuffle": "Funny shuffle",
    "HYPER EUROBEAT(2DX style)": "HYPER EUROBEAT (2DX style)",
    "Jam & Marmalade": "Jam&Marmalade",
    "LETHEBOLG～双神威に斬り咲けり～": "LETHEBOLG ～双神威に斬り咲けり～",
    "LOVE WILL…": "LOVE WILL・・・",
    "Light and Cyber･･･": "Light and Cyber…",
    "PARANOiA MAX～DIRTY MIX～": "PARANOIA MAX～DIRTY MIX～",
    "RIDE ON THE LIGHT(HI GREAT MIX)": "RIDE ON THE LIGHT (HI GREAT MIX)" ,
    "RISLIM-Remix-": "RISLIM -Remix-",
    "冬椿 ft.Kanae Asaba": "冬椿 ft. Kanae Asaba",
    "Voltage(feat. Hidemaru)": "Voltage (feat. Hidemaru)",
    "e-motion 2003-romantic extra-": "e-motion 2003 -romantic extra-",
    "era(nostalmix)": "era (nostalmix)",
    "era(step mix)": "era (step mix)",
    "かげぬい Ver.BENIBOTAN": "かげぬい ～ Ver.BENIBOTAN ～",
    "がっつり陰キャ!?怪盗いいんちょの億劫^^;": "がっつり陰キャ!? 怪盗いいんちょの億劫^^;",
    'ワルツ第17番 ト短調"大犬のワルツ"': 'ワルツ第17番 ト短調”大犬のワルツ”',
    "恋する☆宇宙戦争っ!!": "恋する☆宇宙戦争っ！！",
    "旋律のドグマ ～Misérables～": "旋律のドグマ～Misérables～",
    "突撃！ガラスのニーソ姫！": "突撃!ガラスのニーソ姫!",
    "花吹雪～IIDX LIMITED～": "花吹雪 ～ IIDX LIMITED ～",
    "草原の王女 -奇跡を辿って-": "草原の王女-軌跡を辿って-",
    "走馬灯-The Last Song-": "走馬灯 -The Last Song-",
    "ULTiMΛTE": "ＵＬＴｉＭΛＴＥ",
    "never...": "never…",
    "fffff": "ƒƒƒƒƒ",
    "Nothing But Theory": "Nothing but Theory"

    // 必要に応じてここに追加
    // 'クリアランプマネージャー側表記': 'DBR難易度表側表記',
  };

  // 表入りしたためレベル制限を無視して取得する例外リスト
  // ["曲名", "譜面種別"]
  const levelIgnoreExceptions = [
    ["Rise'n Beauty", "N"],
  ];

  const lampData = {};

  const dlElements = document.querySelectorAll('dl[class*="another"], dl[class*="normal"], dl[class*="hyper"], dl[class*="leggendaria"], dl[class*="beginner"]');

  dlElements.forEach(dl => {
    const classes = dl.className.split(' ');
    const diffClass = classes.find(c => Object.keys(difficultyMap).includes(c));
    if (!diffClass) return;

    const levelElem = dl.querySelector('dd.level');
    if (!levelElem) return;
    const levelClass = [...levelElem.classList].find(cls => /^l\d+$/.test(cls));
    if (!levelClass) return;

    const levelNumber = parseInt(levelClass.replace('l', ''), 10);
    const diffChar = difficultyMap[diffClass];

    const musicNameElem = dl.querySelector('dd.musicName');
    if (!musicNameElem) return;
    let musicName = musicNameElem.textContent.trim();

    // 曲名をマップで変換
    musicName = musicNameMap[musicName] || musicName;

    // Lv6以下は原則スキップ、ただし例外は処理対象
    const isLevelIgnored = levelNumber < 7 && !levelIgnoreExceptions.some(
      ([title, diff]) => title === musicName && diff === diffChar
    );
    if (isLevelIgnored || levelNumber > 12) return;

    const dtElem = dl.querySelector('dt');
    if (!dtElem) return;
    const lampClass = dtElem.className.trim();

    const lampValue = lampMap[lampClass] || lampClass;
    if (lampValue === 'NO PLAY') return;  // NO PLAYは出力しない

    const key = `lamp_${musicName}(${diffChar})`;
    lampData[key] = lampValue;
  });

  const jsonStr = JSON.stringify({ lamp: lampData }, null, 2);

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);

  // DJNAME（titleから抽出、禁止文字を除去、空なら'unknown'）
  const titleMatch = document.title.match(/^DJ\s+(.+?)\s+\|/);
  let djName = titleMatch ? titleMatch[1].trim().replace(/[\\/:*?"<>|]/g, '') : '';
  if (!djName) djName = 'unknown';

  // 日付（yyyymmdd）
  const now = new Date();
  const yyyymmdd = now.getFullYear().toString()
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0');

  // ファイル名作成
  const fileName = `lamp_data_${djName}_${yyyymmdd}.json`;

  // ダウンロード処理
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
})();
