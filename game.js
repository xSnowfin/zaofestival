/* ============================================================
   Lost in the Wind — 蔵王ジャンプ台フェスティバル 謎解きゲーム
   プロトタイプ実装（HTML/CSS/JS 単体・カメラ不要のQR体験シミュレーション）

   仕様：会場に散らばった3つのQRコードを自由な順番で探索する。
   QRコードを読み取る＝その場所の謎が出題されるトリガー。
   謎を解くと羽根を1枚獲得し、マップに戻って別のQRを探せる。
   3つすべて解き終えたら、最終選択パートへ進む。
   ============================================================ */

(() => {
"use strict";

/* ---------------- ゲームデータ ----------------
   各ルートの spots 配列に、その場所固有の謎（title/desc/visual/hint/answer/story）を
   直接ひも付けている。QRコード1つ＝spot1つ＝謎1つ、という1:1対応。          */

const ROUTES = {
  yuuki: {
    label: "勇気の道",
    badgeClass: "yuuki",
    color: "#b2492f",
    theme: "ジャンプ台・湖",
    spots: [
      {
        id:"k1", name:"蔵王ジャンプ台", x:100, y:90,
        title:"謎その一：風の言葉",
        desc:"風が<ruby>頬<rt>ほお</rt></ruby>をなでる。目の前には、空へと続く大きなジャンプ台がそびえ立っている。",
        visual:"空へ飛び立つ場所を<ruby>示<rt>しめ</rt></ruby>すドイツ語を見つけよう。",
        hint:"<ruby>冒険<rt>ぼうけん</rt></ruby>の書のジャンプ台の<ruby>説明<rt>せつめい</rt></ruby>のところにスキーに<ruby>関<rt>かん</rt></ruby>するドイツ語が書かれているよ。ジャンプ台の<ruby>別名<rt>べつめい</rt></ruby>でかかれているところを探そう。",
        answer:["シャンツェ","しゃんつぇ"],
        story:"その言葉を口にした<ruby>瞬間<rt>しゅんかん</rt></ruby>、風が<ruby>優<rt>やさ</rt></ruby>しく吹き抜ける。ジャンプ台の方から、一枚の羽根がひらりと<ruby>舞<rt>ま</rt></ruby>い落ちてきた。",
      },
      {
        id:"k2", name:"色の変わる湖", x:220, y:180,
        title:"謎その二：色が変わる水",
        desc:"<ruby>湖<rt>みずうみ</rt></ruby>の<ruby>水面<rt>すいめん</rt></ruby>が太陽の光を受けて、宝石のように<ruby>輝<rt>かがや</rt></ruby>いている。",
        visual:"青色やエメラルドグリーンに変わるのはドッコ沼と<ruby>蔵王御釜<rt>ざおうおかま</rt></ruby>のどっち？",
        hint:"<ruby>冒険<rt>ぼうけん</rt></ruby>の書のドッコ沼と<ruby>蔵王御釜<rt>ざおうおかま</rt></ruby>のページに<ruby>説明<rt>せつめい</rt></ruby>があるよ。<ruby>冒険<rt>ぼうけん</rt></ruby>の書をよく読んでみよう。",
        answer:["ドッコぬま","どっこ沼","ドッコ沼","どっこぬま"],
        story:"<ruby>湖<rt>みずうみ</rt></ruby>の名を<ruby>告<rt>つ</rt></ruby>げると、<ruby>水面<rt>すいめん</rt></ruby>がきらりと<ruby>輝<rt>かがや</rt></ruby>く。風に乗って、小さな羽根が手のひらへと<ruby>舞<rt>ま</rt></ruby>い<ruby>降<rt>お</rt></ruby>りてきた。",
      },
      {
        id:"k3", name:"スキーヤーの最高到達点", x:130, y:300,
        title:"謎その三：プロ選手の飛行",
        desc:"空高く飛び立つスキーヤーの姿が目に浮かぶ。ここには、世界に<ruby>誇<rt>ほこ</rt></ruby>る<ruby>大記録<rt>だいきろく</rt></ruby>が<ruby>刻<rt>きざ</rt></ruby>まれている。",
        visual:"<ruby>蔵王<rt>ざおう</rt></ruby>ジャンプ台で<ruby>髙梨沙羅選手<rt>たかなしさらせんしゅ</rt></ruby>が<ruby>記録<rt>きろく</rt></ruby>した<ruby>最高<rt>さいこう</rt></ruby>の<ruby>飛距離<rt>ひきょり</rt></ruby>は何m？",
        hint:"<ruby>冒険<rt>ぼうけん</rt></ruby>の書のジャンプ台のところを見てみよう。<ruby>詳<rt>くわ</rt></ruby>しい<ruby>数値<rt>すうち</rt></ruby>が書いてあるよ。ジャンプ台の<ruby>看板<rt>かんばん</rt></ruby>にもヒントがあるかも...",
        answer:["106.0","106","１０６","１０６.０", "106メートル"],
        story:"まるでスキーヤーが空を<ruby>舞<rt>ま</rt></ruby>うように、一枚の羽根が風に乗ってあなたのもとへ飛んできた。",
      },
      {
       id: "k4", name: "ジャンプ台の謎", x: 400, y: 200,
       title: "謎その四：ジャンプ台の謎",
       desc: "風が<ruby>頬<rt>ほお</rt></ruby>をなでる。目の前には、空へと続く大きなジャンプ台がそびえ立っている。",
       visual: "ジャンプ<ruby>台<rt>だい</rt></ruby>の<ruby>標高差<rt>ひょうこうさ</rt></ruby>は<ruby>霞城<rt>かじょう</rt></ruby>セントラルとほぼ<ruby>同<rt>おな</rt></ruby>じ<ruby>何<rt>なん</rt></ruby>m？",
       hint: "<ruby>冒険<rt>ぼうけん</rt></ruby>の<ruby>書<rt>しょ</rt></ruby>のジャンプ<ruby>台<rt>だい</rt></ruby>の<ruby>説明<rt>せつめい</rt></ruby>をよく<ruby>読<rt>よ</rt></ruby>んでみてね。<ruby>標高差<rt>ひょうこうさ</rt></ruby>の<ruby>数字<rt>すうじ</rt></ruby>を探してみよう。",
       answer: ["106", "106m", "１０６", "１０６ｍ", "106メートル"],
       story: "<ruby>眼下<rt>がんか</rt></ruby>に<ruby>広<rt>ひろ</rt></ruby>がる<ruby>壮大<rt>そうだい</rt></ruby>な<ruby>景色<rt>けしき</rt></ruby>とともに、<ruby>風<rt>かぜ</rt></ruby>を切るような<ruby>新<rt>あたら</rt></ruby>しい手がかりを<ruby>手<rt>て</rt></ruby>に入れた。"
      },
      {
        id:"k5", name:"色の変わる湖", x:220, y:180,
        title:"謎その五：色が変わる水",
        desc:"<ruby>湖<rt>みずうみ</rt></ruby>の<ruby>水面<rt>すいめん</rt></ruby>が太陽の光を受けて、宝石のように<ruby>輝<rt>かがや</rt></ruby>いている。",
        visual:"<ruby>季節<rt>きせつ</rt></ruby>や<ruby>天候<rt>てんこう</rt></ruby>で色が変わるのはドッコ沼と<ruby>蔵王御釜<rt>ざおうおかま</rt></ruby>のどっち？",
        hint:"<ruby>冒険<rt>ぼうけん</rt></ruby>の書のドッコ沼と<ruby>蔵王御釜<rt>ざおうおかま</rt></ruby>のページに<ruby>説明<rt>せつめい</rt></ruby>が<ruby>紹介<rt>しょうかい</rt></ruby>されているよ。<ruby>冒険<rt>ぼうけん</rt></ruby>の書をよく読んでみよう。",
        answer:["ざおうおかま","蔵王御釜","蔵王おかま","ざおう御釜","おかま","御釜"],
        story:"<ruby>湖<rt>みずうみ</rt></ruby>の名を<ruby>告<rt>つ</rt></ruby>げると、<ruby>水面<rt>すいめん</rt></ruby>がきらりと<ruby>輝<rt>かがや</rt></ruby>く。風に乗って、小さな羽根が手のひらへと<ruby>舞<rt>ま</rt></ruby>い<ruby>降<rt>お</rt></ruby>りてきた。",
      },
    ],
  },
  yukemuri: {
    label: "湯けむりの道",
    badgeClass: "yukemuri",
    color: "#5ea3b5",
    theme: "蔵王温泉・樹氷・高湯通り",
    spots: [
      {
       id:"y1", name:"蔵王樹氷", x:150, y:80,
       title:"謎その一：雪の怪物",
       desc:"雪と風が作り出した白い<ruby>木々<rt>きぎ</rt></ruby>が、静かにあなたを見つめている。",
       visual:"<ruby>樹氷<rt>じゅひょう</rt></ruby>ができる<ruby>条件<rt>じょうけん</rt></ruby>を探して、3つのうち1つ答えよう。",
       hint:"<ruby>冒険<rt>ぼうけん</rt></ruby>の書の<ruby>樹氷<rt>じゅひょう</rt></ruby>の<ruby>説明<rt>せつめい</rt></ruby>のところをよんでみよう。",
       answer:["あおもりとどまつのき","アオモリトドマツの木","アオモリトドマツのき","あおもりとどまつの木","つめたいきょうふう","冷たい強風","冷たいきょうふう","つめたい強風","てきどなゆき","適度な雪","てきどな雪","適度なゆき"],
       story:"白く<ruby>凍<rt>こお</rt></ruby>った枝の<ruby>隙間<rt>すきま</rt></ruby>から、<ruby>淡<rt>あわ</rt></ruby>く光る羽根が姿を<ruby>現<rt>あら</rt></ruby>した。",
      },
      {
       id:"y2", name:"共同浴場", x:90, y:190,
       title:"謎その二：魔法の湯",
       desc:"湯けむりが立ち上り、あたたかな空気が<ruby>辺<rt>あた</rt></ruby>りを<ruby>包<rt>つつ</rt></ruby>み込む。",
       visual:"<ruby>共同浴場<rt>きょうどうよくじょう</rt></ruby>は何の湯と呼ばれているか。",
       hint:"<ruby>冒険<rt>ぼうけん</rt></ruby>の書の<ruby>蔵王温泉<rt>ざおうおんせん</rt></ruby>についての説明のところに書いてあるよ。<ruby>冒険<rt>ぼうけん</rt></ruby>の書をよく読んでみよう。",
       answer:["美肌の湯","美肌","びはだ","びはだの湯","美肌のゆ","びはだのゆ"],
       story:"その名を<ruby>告<rt>つ</rt></ruby>げると、湯けむりの中から小さな羽根がそっと<ruby>現<rt>あら</rt></ruby>れた。",
      },
      {
       id:"y3", name:"300年の道", x:210, y:290,
       title:"謎その三：300年の道",
       desc:"<ruby>硫黄<rt>いおう</rt></ruby>の<ruby>香<rt>かお</rt></ruby>りが<ruby>漂<rt>ただ</rt></ruby>う<ruby>石畳<rt>いしだん</rt></ruby>の道。その道は、三百年もの時を<ruby>旅人<rt>たびびと</rt></ruby>とともに<ruby>歩<rt>あゆ</rt></ruby>んできた。",
       visual:"300年続く通りの名前は？",
       hint:"<ruby>冒険<rt>ぼうけん</rt></ruby>の書の<ruby>蔵王温泉<rt>ざおうおんせん</rt></ruby>についての説明のところに書いてあるよ。<ruby>冒険<rt>ぼうけん</rt></ruby>の書をよく読んでみよう。",
       answer:["高湯どおり","たかゆ通り","高湯通り","たかゆどおり","たかゆ","高湯"],
       story:"<ruby>温泉<rt>おんせん</rt></ruby>の<ruby>香<rt>かお</rt></ruby>りとともに、一枚の羽根がふわりと風に<ruby>舞<rt>ま</rt></ruby>い降りてきた。",
      },
      {
       id: "y4", name: "蔵王御釜", x: 450, y: 180,
       title: "謎その四：御釜の形",
       desc: "<ruby>大自然<rt>だいしぜん</rt></ruby>が生み出した<ruby>神秘的<rt>しんぴてき</rt></ruby>な<ruby>光景<rt>こうけい</rt></ruby>が目の前に広がっている。",
       visual: "<ruby>太古<rt>たいこ</rt></ruby>の<ruby>噴火<rt>ふんか</rt></ruby>で生まれた<ruby>蔵王<rt>ざおう</rt></ruby>の<ruby>御釜<rt></rt></ruby>はどのような形をしているか。",
       hint: "<ruby>冒険<rt>ぼうけん</rt></ruby>の書の<ruby>蔵王御釜<rt>ざおうおかま</rt></ruby>の<ruby>説明<rt>せつめい</rt></ruby>に<ruby>紹介<rt>しょうかい</rt></ruby>されているよ。<ruby>冒険<rt>ぼうけん</rt></ruby>の書をよく読んでみよう。",
       answer: ["お鍋","鍋","なべ","おなべ"],
       story: "風に乗って、小さな羽根が手のひらへと<ruby>舞<rt>ま</rt></ruby>い<ruby>降<rt>お</rt></ruby>りてきた。"
      },
      {
        id:"y5", name:"色の変わる湖", x:220, y:180,
        title:"謎その五：色が変わる水",
        desc:"<ruby>湖<rt>みずうみ</rt></ruby>の<ruby>水面<rt>すいめん</rt></ruby>が太陽の光を受けて、宝石のように<ruby>輝<rt>かがや</rt></ruby>いている。",
        visual:"<ruby>季節<rt>きせつ</rt></ruby>や<ruby>天候<rt>てんこう</rt></ruby>で色が変わるのはドッコ沼と<ruby>蔵王御釜<rt>ざおうおかま</rt></ruby>のどっち？",
        hint:"<ruby>冒険<rt>ぼうけん</rt></ruby>の書のドッコ沼と<ruby>蔵王御釜<rt>ざおうおかま</rt></ruby>の<ruby>説明<rt>せつめい</rt></ruby>に<ruby>紹介<rt>しょうかい</rt></ruby>されているよ。<ruby>冒険<rt>ぼうけん</rt></ruby>の書をよく読んでみよう。",
        answer:["ざおうおかま","蔵王御釜","蔵王おかま","ざおう御釜","おかま","御釜"],
        story:"<ruby>湖<rt>みずうみ</rt></ruby>の名を<ruby>告<rt>つ</rt></ruby>げると、<ruby>水面<rt>すいめん</rt></ruby>がきらりと<ruby>輝<rt>かがや</rt></ruby>く。風に乗って、小さな羽根が手のひらへと<ruby>舞<rt>ま</rt></ruby>い<ruby>降<rt>お</rt></ruby>りてきた。",
      },
    ],
  },
};

// ストーリー：導入 → ルート選択 → (自由順序で3つのQR/謎) → 最終選択 → エンディング
const STORY = {
  intro: [
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"あっ…！ようこそ、蔵王ジャンプ台フェスティバルへ。ぼくは<ruby>修行中<rt>しゅぎょうちゅう</rt></ruby>の<ruby>小天狗<rt>こてんぐ</rt></ruby>、<ruby>疾風丸<rt>はやてまる</rt></ruby>だ！" },
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"実は少し困ったことになっていて......。" },
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"実は<ruby>師匠<rt>ししょう</rt></ruby>の<ruby>白嶺坊<rt>はくれいぼう</rt></ruby>から大切な<ruby>羽団扇<rt>はうちわ</rt></ruby>を<ruby>預<rt>あず</rt></ruby>かっていたんだけど......。" },
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"さっき<ruby>突然吹<rt>とつぜんふ</rt></ruby>いた強い風で、三枚の羽根が会場のあちこちへ飛ばされてしまったんだ！" },
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"羽根はただ飛ばされたわけじゃないみたいなんだ。" },
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"<ruby>蔵王<rt>ざおう</rt></ruby>の風は昔から人々の<ruby>祈<rt>いの</rt></ruby>りや自然の<ruby>記憶<rt>きおく</rt></ruby>を運ぶと言われている。羽根もそれぞれ<ruby>蔵王<rt>ざおう</rt></ruby>の物語を<ruby>宿<rt>やど</rt></ruby>した場所へ飛んでいったみたいなんだ。" },
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"だから、その場所に<ruby>隠<rt>かく</rt></ruby>された謎を解くことができれば、羽根を見つけられるはず！" },
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"ありがとう！きっと君なら見つけられるよ！" },
  ],
  routeChoice: {
    char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>",
    text:"羽根は風に乗って、二つの方向へ飛んでいったようだ。どちらの道を探しに行く？",
  },
};

const ENDINGS = {
  all_return: {
    emoji:"🕊",
    title:"すべてを、あるべき場所へ",
    body:"五枚の羽根をすべて<ruby>疾風丸<rt>はやてまる</rt></ruby>に返すと、<ruby>白嶺坊<rt>はくれいぼう</rt></ruby>は静かにうなずいた。「よくぞ、風に<ruby>惑<rt>まど</rt></ruby>わされず届けてくれた」。<ruby>羽団扇<rt>はうちわ</rt></ruby>は再び<ruby>師匠<rt>ししょう</rt></ruby>の手に<ruby>渡<rt>わた</rt></ruby>り、蔵王の風は<ruby>穏<rt>おだ</rt></ruby>やかに凪いだという。<ruby>疾風丸<rt>はやてまる</rt></ruby>は<ruby>深々<rt>ふかぶか</rt></ruby>と頭を下げ、いつか一人前の<ruby>天狗<rt>てんぐ</rt></ruby>になったら、また会いに来ると<ruby>約束<rt>やくそく</rt></ruby>してくれた。",
  },
  keep_one: {
    emoji:"🪶",
    title:"一枚の羽根と、約束",
    body:"四枚の羽根を返し、一枚だけを手元に<ruby>残<rt>のこ</rt></ruby>すことにした。<ruby>白嶺坊<rt>はくれいぼう</rt></ruby>は少し<ruby>驚<rt>おど</rt></ruby>いた顔をしたあと、優しく<ruby>微笑<rt>ほほえ</rt></ruby>んだ。「その羽根は、きみと<ruby>疾風丸<rt>はやてまる</rt></ruby>を結ぶ<ruby>縁<rt>えん</rt></ruby>の<ruby>証<rt>あかし</rt></ruby>にしよう」。手のひらに残った小さな羽根は、蔵王を再び訪れるための道しるべになった。",
  },
};

/* ---------------- 状態管理 ---------------- */

const STORAGE_KEY = "lostinthewind_save_v3";

let state = {
  route: null,             // 'yuuki' | 'yukemuri'
  solvedSpotIds: [],       // 解決済みspotのid一覧（順不同）
  activeSpotId: null,      // 現在挑戦中の謎に対応するspot id
  phase: "intro",          // intro -> map -> puzzle -> story-inline -> ... -> endingSelect -> endingResult
  storyStep: 0,
  endingKey: null,
};

function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed && typeof parsed === "object") return parsed;
    }
  }catch(e){}
  return null;
}
function resetState(){
  state = { route:null, solvedSpotIds:[], activeSpotId:null, phase:"intro", storyStep:0, endingKey:null };
  saveState();
}

function currentRoute(){ return state.route ? ROUTES[state.route] : null; }
function findSpot(spotId){
  const route = currentRoute();
  if(!route) return null;
  return route.spots.find(s => s.id === spotId) || null;
}

/* ルートをまたいでspotIdからspotを探す（QRリンク直接アクセス用） */
function findSpotAnywhere(spotId){
  for(const key in ROUTES){
    const spot = ROUTES[key].spots.find(s => s.id === spotId);
    if(spot) return { routeKey:key, spot };
  }
  return null;
}

/* そのspot専用のURL（QRコード生成用）を作る */
function getSpotUrl(spotId){
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("spot", spotId);
  return url.toString();
}

/* ---------------- DOM参照 ---------------- */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const views = {
  top: $("#view-top"),
  story: $("#view-story"),
  puzzle: $("#view-puzzle"),
  map: $("#view-map"),
  endingSelect: $("#view-ending-select"),
  endingResult: $("#view-ending-result"),
  notebook: $("#view-notebook"),
};

function showView(name){
  Object.values(views).forEach(v => v.classList.remove("active"));
  views[name].classList.add("active");
  window.scrollTo({top:0, behavior:"instant"});
  updateTabBar(name);
}

function updateTabBar(name){
  $$(".tab-btn").forEach(btn => {
    const target = btn.dataset.view;
    const map = { top:"view-top", notebook:"view-notebook", map:"view-map" };
    btn.classList.toggle("active", target === map[name]);
  });
}

/* ---------------- 雪片背景 ---------------- */

function initSnowfall(){
  const wrap = $("#snowfall");
  const count = window.innerWidth < 500 ? 22 : 36;
  for(let i=0;i<count;i++){
    const s = document.createElement("span");
    const left = Math.random()*100;
    const dur = 8 + Math.random()*10;
    const delay = Math.random()*10;
    const size = 2 + Math.random()*3;
    s.style.left = left+"vw";
    s.style.width = size+"px";
    s.style.height = size+"px";
    s.style.animationDuration = dur+"s";
    s.style.animationDelay = "-"+delay+"s";
    wrap.appendChild(s);
  }
}

/* ---------------- トップ画面 ---------------- */

function renderTop(){
  const total = 5;
  const solved = state.solvedSpotIds.length;
  $("#statFeathers").textContent = `${solved}/${total}`;
  $("#statRoute").textContent = state.route ? ROUTES[state.route].label : "未選択";
  $("#statQR").textContent = `${solved}/${total}`;

  const hasSave = state.phase !== "intro" || state.route !== null;
  $("#continueBtn").style.display = hasSave ? "inline-flex" : "none";
  //常に同じ文字を表示
  $("#startBtn").textContent ="冒険の書を受け取る"; 
  $("#startBtn").style.display = hasSave ? "none" : "inline-flex";
}

$("#startBtn").addEventListener("click", () => {
  const hasSave = state.phase !== "intro" || state.route !== null;
  if(hasSave){
    resumeFromState();
  } else {
    playCinematic("🌬", "Lost in the Wind", "羽団扇の羽根を探せ", "風が吹き始める……", () => {
      beginIntro();
    });
  }
});
$("#continueBtn").addEventListener("click", () => {
  resumeFromState();
});
$("#restartBtn").addEventListener("click", () => {
  if(confirm("最初からやり直しますか？ここまでの記録は消えます。")){
    resetState();
    showView("top");
    renderTop();
  }
});

/* ---------------- ストーリー進行 ---------------- */
/* ---------------- シネマティック演出 ---------------- */

function playCinematic(icon, title, subtitle, text, next){
  const cine = $("#cinematic");
  $("#cineIcon").textContent = icon;
  $("#cineTitle").textContent = title;
  $("#cineSubTitle").textContent = subtitle;
  $("#cineText").textContent = text;

  cine.classList.remove("hidden");
  setTimeout(() => {
    cine.classList.add("hidden");
    setTimeout(() => { if(next) next(); }, 800);
  }, 3000);
}

let typewriterTimer = null;

function typewriterText(el, text, onDone) {
  clearInterval(typewriterTimer);

  // 1. 一時的なDOM要素を作成してHTML構造を安全にパース
  const temp = document.createElement('div');
  temp.innerHTML = text;

  // 2. ノードを再帰的に走査し、タイピング対象の本文テキストのみ span.tw-char で囲む
  function prepareNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const chars = Array.from(node.textContent);
      const frag = document.createDocumentFragment();
      chars.forEach(c => {
        const span = document.createElement('span');
        span.className = 'tw-char';
        span.style.visibility = 'hidden'; // 初期状態は非表示
        span.textContent = c;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      if (tagName === 'rt') {
        // ルビテキストはタイピングカウントから外し、初期状態を非表示にする
        node.style.visibility = 'hidden';
        return;
      }
      Array.from(node.childNodes).forEach(prepareNodes);
    }
  }

  Array.from(temp.childNodes).forEach(prepareNodes);
  el.innerHTML = temp.innerHTML;

  // 3. タイピング対象の文字（span.tw-char）を取得
  const charSpans = Array.from(el.querySelectorAll('.tw-char'));
  let index = 0;

  // 4. 順々に文字を表示するタイマー処理
  typewriterTimer = setInterval(() => {
    if (index < charSpans.length) {
      const currentSpan = charSpans[index];
      currentSpan.style.visibility = 'visible';

      // 親文字が表示されたタイミングで、その <ruby> 内のルビ（<rt>）も同時に表示
      const parentRuby = currentSpan.closest('ruby');
      if (parentRuby) {
        const rt = parentRuby.querySelector('rt');
        if (rt) rt.style.visibility = 'visible';
      }

      index++;
    } else {
      clearInterval(typewriterTimer);
      // 完了時に万が一非表示のルビが残っていれば全表示
      el.querySelectorAll('rt').forEach(rt => rt.style.visibility = 'visible');
      if (onDone) onDone();
    }
  }, 30);
}

function showStoryChoices(choices){
  const box = $("#storyChoices");
  box.innerHTML = "";
  choices.forEach(choice =>{
    const btn = document.createElement("button");
    btn.className = "choice-card";
    btn.textContent = choice.text;
    btn.addEventListener("click",()=>{
      box.innerHTML = "";
      if(choice.next){
        choice.next();
      }
    });
    box.appendChild(btn);
  });
}

function showFeatherEffect(next){
  const feather=document.createElement("div");
  feather.className="feather-effect";
  feather.textContent="🪶";
  document.body.appendChild(feather);
  setTimeout(()=>{
    feather.remove();
    if(next) next();
  },3000);
}


function showEndingFeathers(){
  for(let i=0;i<30;i++){
    setTimeout(()=>{
      const feather=document.createElement("div");
      feather.className="ending-feather";
      feather.textContent="🪶";
      feather.style.left=
      Math.random()*100+"vw";
      document.body.appendChild(feather);
      setTimeout(()=>{
        feather.remove();
      },5000);
    },i*100);

  }

}
function renderProgressStrip(current, total){
  const strip = $("#progressStrip");
  strip.innerHTML = "";
  for(let i=0;i<total;i++){
    const d = document.createElement("div");
    d.className = "progress-dot" + (i < current ? " done" : i === current ? " current" : "");
    strip.appendChild(d);
  }
}

function beginIntro(){
  state.phase = "intro";
  state.storyStep = 0;
  saveState();
  showView("story");
  showIntroStep();
}

function showIntroStep(){
  const total = STORY.intro.length + 1; // +1 for route choice
  renderProgressStrip(state.storyStep, total);
  const step = STORY.intro[state.storyStep];
  $("#charEmoji").textContent = step.char;
  $("#charName").innerHTML = step.name + "<span>小天狗（修行中）</span>";
  $("#storyChoices").innerHTML = "";
  $("#storyNextBtn").style.display = "none";
  typewriterText($("#storyText"), step.text, () => {
     if(state.storyStep === 1){
      showStoryChoices([
        {
          text:"どうしたの？",
          next:()=>{
            state.storyStep++;
            saveState();
            showIntroStep();
          }
        },
        {
          text:"手伝えることはある？",
          next:()=>{
            state.storyStep++;
            saveState();
            showIntroStep();
          }
        }
      ]);
      return;
    }
    if(state.storyStep === 6){
      showStoryChoices([
        {
          text:"謎を一緒に解けばいいんだね！",
          next:()=>{
            state.storyStep++;
            saveState();
            showIntroStep();
          }
        },
        {
          text:"一緒に探そう！",
          next:()=>{
            state.storyStep++;
            saveState();
            showIntroStep();
          }
        }
      ]);
      return;
    }
    $("#storyNextBtn").style.display = "inline-flex";

    if(state.storyStep < STORY.intro.length - 1){
        $("#storyNextBtn").textContent = "次へ";
        $("#storyNextBtn").onclick = () => {
            state.storyStep++;
            saveState();
            showIntroStep();
        };
    } else {
        $("#storyNextBtn").textContent = "冒険へ";
        $("#storyNextBtn").onclick = () => {
            showRouteChoice();
        };
    }
  });
}

function showRouteChoice(){
  renderProgressStrip(STORY.intro.length, STORY.intro.length+1);
  const step = STORY.routeChoice;
  $("#charEmoji").textContent = step.char;
  $("#charName").innerHTML = step.name + "<span>小天狗（修行中）</span>";
  $("#storyNextBtn").style.display = "none";
  typewriterText($("#storyText"), step.text, () => {
    const box = $("#storyChoices");
    box.innerHTML = "";
    Object.entries(ROUTES).forEach(([key, route]) => {
      const btn = document.createElement("button");
      btn.className = "choice-card";
      btn.innerHTML = `<div class="cc-title">${route.label}</div><div class="cc-desc">テーマ：${route.theme}</div>`;
      btn.addEventListener("click", () => {
        state.route = key;
        state.solvedSpotIds = [];
        saveState();
        renderTop();
        goToMap();
      });
      box.appendChild(btn);
    });
  });
}

function resumeFromState(){
  if(!state.route){
    playCinematic("🌬", "Lost in the Wind", "羽団扇の羽根を探す冒険が始まる", "風が吹き始める……", () => {
      beginIntro();
    });
    return;
  }
  if(state.phase === "endingSelect"){
    playCinematic("🪶🪶🪶🪶🪶", "羽団扇が完成した", "師匠のもとへ向かおう", () => {
      showMasterScene();
    });
  } else if(state.phase === "endingResult" && state.endingKey){
    renderEndingResult(state.endingKey);
    showView("endingResult");
  } else {
    // puzzle / story-inline / map いずれも、マップから再開すれば迷わない
    goToMap();
  }
}

/* ---------------- マップ／QR探索パート ----------------
   ルートを選ぶと、まずここに来る。3つのQR（×印）が最初から
   すべて見えており、好きな順にタップして読み取れる。         */

function goToMap(){
  state.phase = "map";
  state.activeSpotId = null;
  saveState();
  renderMap();
  showView("map");
}

function renderMap(){
  const route = currentRoute();
  if(!route) return;
  $("#mapRouteBadge").textContent = route.label;
  $("#mapRouteBadge").className = "route-badge " + route.badgeClass;

  const solvedCount = state.solvedSpotIds.length;
  $("#mapProgressLabel").textContent = `謎を発見：${solvedCount}/${route.spots.length}（好きな順番で探索できます）`;

  const list = $("#spotList");
  list.innerHTML = "";

  route.spots.forEach((spot) => {
    const found = state.solvedSpotIds.includes(spot.id);

    const item = document.createElement("div");
    item.className = "spot-item" + (found ? " found" : "");

    const mark = document.createElement("span");
    mark.className = "spot-mark";
    mark.textContent = found ? "✓" : "？";
    item.appendChild(mark);

    const name = document.createElement("span");
    name.className = "spot-name";
    name.textContent = spot.name;
    item.appendChild(name);

    const status = document.createElement("span");
    status.className = "spot-status";
    status.textContent = found ? "解決済み" : "未発見";
    item.appendChild(status);

    list.appendChild(item);
  });
}

let pendingSpot = null;

function openQrScan(spot){
  pendingSpot = spot;
  $("#qrScanBox").style.display = "block";
  $("#qrScanLabel").innerHTML = `「${spot.name}」でQRコードを見つけたようだ。<br>読み取ると、この場所の謎が現れる。`;
  $("#qrScanBox").scrollIntoView({behavior:"smooth", block:"nearest"});
}

$("#qrScanCancel").addEventListener("click", () => {
  $("#qrScanBox").style.display = "none";
  pendingSpot = null;
});

$("#qrScanConfirm").addEventListener("click", () => {
  if(!pendingSpot) return;
  const spot = pendingSpot;
  pendingSpot = null;
  $("#qrScanBox").style.display = "none";
  goToPuzzle(spot);
});

/* ---------------- 謎パート ----------------
   QRコードを読み取った先で、その場所固有の謎が出題される。   */

function goToPuzzle(spot){
  if(state.solvedSpotIds.includes(spot.id)){
    alert(`「${spot.name}」の謎はすでに解決済みだよ。まだ見つけていない場所を探してみよう！`);
    goToMap();
    return;
  }
  state.activeSpotId = spot.id;
  state.phase = "puzzle";
  saveState();

  const route = currentRoute();
  $("#puzzleRouteLabel").textContent = `${route.label} · ${spot.name}`;
  $("#puzzleTitle").textContent = spot.title;
  $("#puzzleDesc").innerHTML = spot.desc;
  $("#puzzleVisual").innerHTML = spot.visual;
  $("#hintBox").classList.remove("show");
  $("#hintBox").innerHTML = spot.hint;
  $("#hintToggle").textContent = "ヒントを見る（冒険の書より）";
  $("#answerInput").value = "";
  $("#answerFeedback").textContent = "";
  $("#answerFeedback").className = "feedback-msg";
  showView("puzzle");
  $("#answerInput").focus({preventScroll:true});
}

$("#hintToggle").addEventListener("click", () => {
  const box = $("#hintBox");
  const showing = box.classList.toggle("show");
  $("#hintToggle").textContent = showing ? "ヒントを隠す" : "ヒントを見る（冒険の書より）";
});

$("#puzzleBackBtn").addEventListener("click", () => {
  goToMap();
});

function checkAnswer(){
  const spot = findSpot(state.activeSpotId);
  if(!spot) return;
  const val = $("#answerInput").value.trim();
  if(!val) return;
  const normalized = val.replace(/\s/g,"");
  const correct = spot.answer.some(a => a.replace(/\s/g,"") === normalized);
  const fb = $("#answerFeedback");
  if(correct){
    if(!state.solvedSpotIds.includes(spot.id)){
      state.solvedSpotIds.push(spot.id);
    }
    saveState();

    playCinematic("🪶", "羽根を見つけた", "Feather Found", "疾風丸の羽団扇に必要な羽根だ。", () => {
      showFeatherEffect(() => {
        showFeatherStory(spot);
      });
    });
  } else {
    fb.textContent = "うーん、違うようだ。冒険の書のヒントをもう一度確かめてみて。";
    fb.className = "feedback-msg ng";
  }
}
$("#answerCheckBtn").addEventListener("click", checkAnswer);
$("#answerInput").addEventListener("keydown", (e) => { if(e.key === "Enter") checkAnswer(); });

/* ---------------- 羽根獲得ストーリー ---------------- */

function showFeatherStory(spot){
  continueFeatherStory();
  function continueFeatherStory(){
    state.phase = "story-inline";
    saveState();

    const route = currentRoute();
    const total = route.spots.length;

    showView("story");
    renderProgressStrip(state.solvedSpotIds.length, total);

    $("#charEmoji").textContent = "🪶";
    $("#charName").innerHTML = "疾風丸<span>小天狗（修行中）</span>";
    $("#storyChoices").innerHTML = "";
    $("#storyNextBtn").style.display = "none";

    typewriterText($("#storyText"), spot.story + "\n\n羽根を1枚、見つけた！", () => {
      $("#storyNextBtn").style.display = "inline-flex";

      const complete = state.solvedSpotIds.length >= total;
      $("#storyNextBtn").textContent = complete ? "師匠のもとへ向かう" : "地図に戻る";

      $("#storyNextBtn").onclick = () => {
        if(complete){
          playCinematic("🪶🪶🪶🪶🪶", "羽団扇が完成した", "The Wind Returns", "師匠のもとへ向かおう", () => {
            showMasterScene();
          });
        } else {
          goToMap();
        }
      };
    });
  }
}
function showMasterScene(){
  showView("story");
  $("#charEmoji").textContent="🦅";
  $("#charName").innerHTML=
  "<ruby>白嶺坊<rt>はくれいぼう</rt></ruby><span>蔵王の大天狗</span>";
  $("#storyChoices").innerHTML="";
  $("#storyNextBtn").style.display="none";

  typewriterText(
    $("#storyText"),
    `見事だ。<br>
     五枚の<ruby>羽根<rt>はね</rt></ruby>は再び一つとなった。<br>
     <ruby>疾風丸<rt>はやてまる</rt></ruby>、
     お前も良き旅人に出会えたようだ。`,

    ()=>{
      $("#storyNextBtn").style.display="inline-flex";
      $("#storyNextBtn").innerHTML="<ruby>羽団扇<rt>はうちわ</rt></ruby>をどうする？";
      $("#storyNextBtn").onclick=()=>{
        goToEndingSelect();
      };
    }
  );
}
/* ---------------- 最終選択・エンディング ---------------- */

function goToEndingSelect(){
  state.phase = "endingSelect";
  saveState();
  showView("endingSelect");
  $("#masterText").innerHTML = "";
  typewriterText($("#masterText"),
    "……よくぞ、五枚の羽根を集めてくれた。さて、この<ruby>羽団扇<rt>はうちわ</rt></ruby>をどうするか、きみに委ねよう。",
    () => {
      const box = $("#endingChoices");
      box.innerHTML = "";
      const opts = [
        { key:"all_return", title:"羽根をすべて返す", desc:"疾風丸に羽根をすべて返し、<ruby>羽団扇<rt>はうちわ</rt></ruby>を元通りにする。" },
        { key:"keep_one", title:"一枚だけ残す", desc:"一枚の羽根を記念に残し、四枚を返す。" },
      ];
      opts.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "choice-card";
        btn.innerHTML = `
          <div class="cc-title">${opt.title}</div>
          <div class="cc-desc">${opt.desc}</div>
        `;

        btn.addEventListener("click", () => {
          playCinematic("🕊", "ありがとう", "Thank You", "羽根は再び風とともに還る", () => {
            state.endingKey = opt.key;
            state.phase = "endingResult";
            saveState();
            renderEndingResult(opt.key);
            showView("endingResult");
            showEndingFeathers();
          });
        });

        box.appendChild(btn);
      });
    }
  );
}

function renderEndingResult(key){
  const ending = ENDINGS[key];
  $("#endEmoji").textContent = ending.emoji;
  $("#endTitle").innerHTML = ending.title;
  $("#endBody").innerHTML = ending.body;

  const summary = $("#endSummary");
  summary.innerHTML = "";
  const routeChip = document.createElement("span");
  routeChip.className = "feather-chip";
  routeChip.textContent = `選んだ道：${ROUTES[state.route].label}`;
  summary.appendChild(routeChip);
  const featherChip = document.createElement("span");
  featherChip.className = "feather-chip";
  featherChip.textContent = `集めた羽根：${state.solvedSpotIds.length}枚`;
  summary.appendChild(featherChip);

  const otherRoute = state.route === "yuuki" ? "yukemuri" : "yuuki";
  const noteChip = document.createElement("span");
  noteChip.className = "feather-chip empty";
  noteChip.textContent = `未踏の道：${ROUTES[otherRoute].label}`;
  summary.appendChild(noteChip);
}

$("#playAgainBtn").addEventListener("click", () => {
  /* ゲームクリア後のアンケート画面 */
  window.open("https://docs.google.com/forms/d/e/1FAIpQLScEIeP9r2LDAQNzG5nxoUGIfGApFnYQOS9Q8OY6GQmB92rtGw/viewform?usp=publish-editor", "_blank");
});

/* ---------------- 冒険の書（ノートブック） ---------------- */

const NOTEBOOK_PAGES = [
  {
    key:"map", label:"会場マップ",
    render:() => `<div class="card"><div class="eyebrow">会場マップ</div><p class="lead">受付で受け取ったパンフレットを参考に、選んだ道に隠された5つのQRコードを、好きな順番で探し出そう。「探索」タブでは、どの謎をすでに解いたかを確認できます。</p></div>`,
  },
  {
    key:"record", label:"羽根の記録",
    render:() => {
      const route = currentRoute();
      const total = route ? route.spots.length : 3;
      let chips = "";
      if(route){
        route.spots.forEach(spot => {
          const has = state.solvedSpotIds.includes(spot.id);
          chips += `<span class="feather-chip${has ? "" : " empty"}">${has ? "🪶 " + spot.name : "未発見：" + spot.name}</span>`;
        });
      } else {
        chips = `<span class="feather-chip empty">まだ道を選んでいません</span>`;
      }
      return `<div class="card">
        <div class="eyebrow">羽根の記録欄</div>
        <p class="lead" style="margin-bottom:10px;">これまでに集めた羽根：${state.solvedSpotIds.length} / ${total}</p>
        <div class="feather-log">${chips}</div>
      </div>`;
    },
  },
];

function renderNotebook(){
  const tabsWrap = $("#notebookTabs");
  const pagesWrap = $("#notebookPages");
  tabsWrap.innerHTML = "";
  pagesWrap.innerHTML = "";

  NOTEBOOK_PAGES.forEach((page, idx) => {
    const tab = document.createElement("button");
    tab.className = "ntab" + (idx===0 ? " active" : "");
    tab.textContent = page.label;
    tab.addEventListener("click", () => {
      $$(".ntab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      $$(".notebook-page").forEach(p => p.classList.remove("active"));
      document.getElementById("np-"+page.key).classList.add("active");
    });
    tabsWrap.appendChild(tab);

    const pageEl = document.createElement("div");
    pageEl.className = "notebook-page" + (idx===0 ? " active" : "");
    pageEl.id = "np-"+page.key;
    pageEl.innerHTML = page.render();
    pagesWrap.appendChild(pageEl);
  });
}

/* ---------------- タブナビゲーション ---------------- */

$$(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.view;
    if(target === "view-top"){
      showView("top");
      renderTop();
    } else if(target === "view-notebook"){
      renderNotebook();
      showView("notebook");
    } else if(target === "view-map"){
      if(!state.route){
        alert("まずは冒険の書を受け取り、道を選んでから探索できます。");
        return;
      }
      renderMap();
      showView("map");
    }
  });
});

/* ---------------- URLリンク直接アクセス（QRコード用） ----------------
   各謎（spot）にQRコードを用意する予定。
   QRコードには「このゲームのURL + ?spot=スポットID」を埋め込んでおけば、
   読み取るだけでその謎が直接開く。以下はその処理と、
   リンク一覧を確認するための簡易admin画面。                          */

function showAdminLinks(){
  const wrap = document.createElement("div");
  wrap.id = "adminLinksOverlay";
  wrap.style.cssText = "position:fixed;inset:0;background:#0d232d;color:#f4f7f5;z-index:99999;overflow:auto;padding:24px;font-family:sans-serif;";

  let html = "<h1 style='margin-bottom:6px;font-size:20px;'>QRコード用リンク一覧</h1>";
  html += "<p style='font-size:13px;opacity:0.7;margin-bottom:20px;'>各URLをQRコード生成サービスに貼り付けて、対応するスポットにQRコードを設置してください。</p>";

  Object.entries(ROUTES).forEach(([key, route]) => {
    html += `<h2 style="margin:20px 0 10px;color:#e0a951;font-size:16px;">${route.label}</h2>`;
    route.spots.forEach(spot => {
      const url = getSpotUrl(spot.id);
      html += `
        <div style="margin-bottom:12px;padding:12px 14px;border:1px solid rgba(244,247,245,0.16);border-radius:8px;">
          <div style="font-weight:bold;font-size:14px;">${spot.name}（id: ${spot.id}）</div>
          <div style="word-break:break-all;font-size:12.5px;margin-top:6px;">
            <a href="${url}" style="color:#8fd4a8;">${url}</a>
          </div>
        </div>`;
    });
  });

  html += "<button id='adminCloseBtn' style='margin-top:10px;padding:10px 16px;border-radius:8px;border:none;background:#e0a951;color:#0d232d;font-weight:bold;cursor:pointer;'>閉じる</button>";
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  document.getElementById("adminCloseBtn").addEventListener("click", () => wrap.remove());
}

/* URLパラメータを見て、QRリンク経由のアクセスかどうか判定・処理する。
   処理した場合は true を返す（通常のトップ画面表示をスキップするため）。 */
function handleUrlParams(){
  const params = new URLSearchParams(window.location.search);

  if(params.get("admin") === "1"){
    showAdminLinks();
    return false; // admin画面はオーバーレイなので、裏側は通常通り表示してOK
  }

  const spotId = params.get("spot");
  if(!spotId) return false;

  const found = findSpotAnywhere(spotId);
  if(!found){
    alert("指定された謎が見つかりませんでした。QRコードをもう一度確認してください。");
    return false;
  }

  const { routeKey, spot } = found;

  // すでに別ルートを選択済みで、かつQRが別ルートのものだった場合は
  // 進行させず、選んだルートのマップに戻す（誤って別ルートの問題を
  // 解いてしまうのを防ぐ）。
  if(state.route && state.route !== routeKey){
    const currentRouteLabel = ROUTES[state.route] ? ROUTES[state.route].label : "選んだ道";
    alert(`このQRコードは「${ROUTES[routeKey].label}」のものだよ。今は「${currentRouteLabel}」を探索中だから、この謎には進めないよ。`);
    history.replaceState(null, "", window.location.pathname + window.location.hash);
    if(state.phase === "intro"){
      state.phase = "map";
      saveState();
    }
    renderTop();
    if(state.route){
      renderMap();
      showView("map");
    } else {
      showView("top");
    }
    return true;
  }

  // ルート未選択の場合は、このQRのルートを選択する。
  if(state.route !== routeKey){
    state.route = routeKey;
    state.solvedSpotIds = [];
  }
  if(state.phase === "intro"){
    state.phase = "map";
  }
  state.endingKey = null;
  saveState();
  renderTop();

  goToPuzzle(spot);

  // URLをきれいにしておく（リロードや戻るボタンでの誤動作を防ぐ）
  history.replaceState(null, "", window.location.pathname + window.location.hash);

  return true;
}

/* ---------------- 初期化 ---------------- */

function init(){
  initSnowfall();
  const saved = loadState();
  if(saved) state = Object.assign(
    { route:null, solvedSpotIds:[], activeSpotId:null, phase:"intro", storyStep:0, endingKey:null },
    saved
  );
  renderTop();

  const handledByUrl = handleUrlParams();
  if(!handledByUrl){
    showView("top");
  }
}

init();

})();
