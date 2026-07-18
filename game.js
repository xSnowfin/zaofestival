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
    theme: "ジャンプ台・山岳信仰",
    spots: [
      {
        id:"y1", name:"ジャンプ台 展望台", x:150, y:80,
        title:"謎その一：山を仰ぐ者たち",
        desc:"ジャンプ台の麓に、古い立て札が立っている。そこにはこう刻まれていた。",
        visual:"「天へ近づく者は、まず　三　つ　数える」\n展望台の柱は、いくつ並んでいるだろう？",
        hint:"冒険の書「ジャンプ台」のページに、柱の写真と本数のヒントが載っているよ。柱は横に一列、等間隔で並んでいる。",
        answer:["5","五","五本","5本"],
        story:"柱を数え終えると、疾風丸がぱっと表情を明るくした。「これで羽根が一枚、見つかった気がする！」",
      },
      {
        id:"y2", name:"山頂の鳥居", x:90, y:190,
        title:"謎その二：祈りの言葉",
        desc:"鳥居の前で、疾風丸が空を見上げてつぶやく。",
        visual:"蔵王で古くから信仰されてきた山の神様は、何と呼ばれてきた？\n（冒険の書「山岳信仰」のページにヒントあり）",
        hint:"冒険の書には「蔵王権現」という言葉が紹介されているはず。ひらがな・カタカナ・漢字、どれで答えてもOK。",
        answer:["蔵王権現","ざおうごんげん","ザオウゴンゲン"],
        story:"正しい名を口にすると、鳥居の柱の隙間から小さな羽根がそっと現れた。",
      },
      {
        id:"y3", name:"御釜 展望ポイント", x:210, y:290,
        title:"謎その三：エメラルドの謎",
        desc:"御釜のほとりで、水面が陽に照らされて輝いている。",
        visual:"御釜の水面が見せる、あの美しい色は何色と呼ばれている？\n（ヒント：宝石の名前）",
        hint:"冒険の書「御釜」のページに色の名前が書かれているよ。緑色の宝石の名前を思い出してみて。",
        answer:["エメラルド","エメラルドグリーン","翠緑"],
        story:"色の名を告げると、湖畔の風がふわりと舞い上がり、最後の羽根が手のひらに舞い降りた。",
      },
    ],
  },
  yukemuri: {
    label: "湯けむりの道",
    badgeClass: "yukemuri",
    color: "#5ea3b5",
    theme: "蔵王温泉・樹氷・コマクサ",
    spots: [
      {
        id:"k1", name:"蔵王温泉 共同浴場", x:100, y:90,
        title:"謎その一：湯けむりの記憶",
        desc:"共同浴場の入口で、湯気があたたかく立ちのぼる。",
        visual:"蔵王温泉が発見されたと伝えられているのは、およそ何年前？\n（冒険の書「蔵王温泉」のページに西暦と年数のヒントあり）",
        hint:"冒険の書には開湯の伝承年数が書かれているよ。「約」がつく大きな数字を探してみて。百の位に注目。",
        answer:["1900","1900年","約1900年"],
        story:"数字を答えると、下駄箱の裏から羽根が一枚、ひらりと舞い落ちてきた。",
      },
      {
        id:"k2", name:"樹氷原の入口", x:220, y:180,
        title:"謎その二：氷の怪物",
        desc:"樹氷原の入口で、白く凍りついた木々が並んでいる。",
        visual:"この不思議な氷の姿をした木々は、通称「〇〇モンスター」と呼ばれている。〇〇に入る言葉は？",
        hint:"冒険の書「樹氷」のページに愛称が紹介されているよ。カタカナ3文字。",
        answer:["スノー","すのー","SNOW","snow"],
        story:"答えを口にした瞬間、氷の枝の間からきらりと光るものが。羽根が凍りついた木の根元にあった。",
      },
      {
        id:"k3", name:"コマクサの群生地", x:130, y:300,
        title:"謎その三：高嶺の花",
        desc:"砂礫の斜面に、小さなピンク色の花が風に揺れている。",
        visual:"厳しい環境でしか育たないこの高山植物は、しばしば「高嶺の〇」と呼ばれ親しまれている。〇に入る漢字一文字は？",
        hint:"冒険の書「コマクサ」のページを見てみよう。美しいものの代名詞になっている漢字一文字だよ。",
        answer:["花","はな"],
        story:"花の名を告げると、群生地の風がやみ、最後の羽根が静かに舞い降りた。",
      },
    ],
  },
};

// ストーリー：導入 → ルート選択 → (自由順序で3つのQR/謎) → 最終選択 → エンディング
const STORY = {
  intro: [
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"あっ…！ようこそ、蔵王ジャンプ台フェスティバルへ。ぼくは<ruby>修行中<rt>しゅぎょうちゅう</rt></ruby>の<ruby>小天狗<rt>こてんぐ</rt></ryby>、<ruby>疾風丸<rt>はやてまる</rt></ruby>だ。実は困ったことになっていて…" },
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"<ruby>師匠<rt>ししょう</rt></ruby>からお借りした大切な「羽団扇（はうちわ）」の羽根が、強い風で吹き飛ばされてしまったんだ。会場のあちこちに散らばってしまった…！" },
    { char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>", text:"きみの力を貸してほしい。この「<ruby>冒険<rt>ぼうけん</rt></ruby>の書」を渡すから、会場に散らばったQRコードを見つけて、謎を解きながら羽根を探してくれないか？ <ruby>順番<rt>じゅんばん</rt></ruby>はどこからでも<ruby>構<rt>かま</rt></ruby>わないよ。" },
  ],
  routeChoice: {
    char:"🐦", name:"<ruby>疾風丸<rt>はやてまる</rt></ruby>",
    text:"羽根は風に乗って、二つの方向へ飛んでいったようだ。どちらの道から探しに行く？",
  },
};

const ENDINGS = {
  all_return: {
    emoji:"🕊",
    title:"すべてを、あるべき場所へ",
    body:"三枚の羽根をすべて疾風丸に返すと、白嶺坊は静かにうなずいた。「よくぞ、風に惑わされず届けてくれた」。羽団扇は再び師匠の手に渡り、蔵王の風は穏やかに凪いだという。疾風丸は深々と頭を下げ、いつか一人前の天狗になったら、また会いに来ると約束してくれた。",
  },
  keep_one: {
    emoji:"🪶",
    title:"一枚の羽根と、約束",
    body:"二枚の羽根を返し、一枚だけを手元に残すことにした。白嶺坊は少し驚いた顔をしたあと、優しく微笑んだ。「その羽根は、きみと疾風丸を結ぶ縁の証にしよう」。手のひらに残った小さな羽根は、蔵王を再び訪れるための道しるべになった。",
  },
};

/* ---------------- 状態管理 ---------------- */

const STORAGE_KEY = "lostinthewind_save_v2";

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
  const total = 3;
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
  }else{
    beginIntro();
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

let typewriterTimer = null;

function typewriterText(el, text, onDone){
    clearInterval(typewriterTimer);
    el.innerHTML = text;

    if(onDone) onDone();
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
    beginIntro();
    return;
  }
  if(state.phase === "endingSelect"){
    goToEndingSelect();
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

  const svg = $("#mapSvg");
  svg.innerHTML = "";

  // 簡易背景装飾（山の稜線）
  const ns = "http://www.w3.org/2000/svg";
  const ridge = document.createElementNS(ns, "path");
  ridge.setAttribute("d", "M0,340 L50,260 L110,310 L160,220 L210,290 L260,240 L300,300 L300,375 L0,375 Z");
  ridge.setAttribute("fill", "rgba(244,247,245,0.05)");
  svg.appendChild(ridge);

  route.spots.forEach((spot) => {
    const found = state.solvedSpotIds.includes(spot.id);

    const g = document.createElementNS(ns, "g");
    g.setAttribute("class", "map-pin" + (found ? " found" : ""));
    g.setAttribute("transform", `translate(${spot.x},${spot.y})`);

    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("class", "pin-body");
    circle.setAttribute("r", "16");
    circle.setAttribute("fill", found ? "rgba(143,212,168,0.25)" : "rgba(224,169,81,0.18)");
    circle.setAttribute("stroke", found ? "#8fd4a8" : route.color);
    circle.setAttribute("stroke-width", "2");
    g.appendChild(circle);

    const mark = document.createElementNS(ns, "text");
    mark.setAttribute("x","0"); mark.setAttribute("y","5");
    mark.setAttribute("text-anchor","middle");
    mark.setAttribute("font-size","16");
    mark.setAttribute("fill", found ? "#8fd4a8" : "#f4f7f5");
    mark.textContent = found ? "✓" : "×";
    g.appendChild(mark);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x","0"); label.setAttribute("y","30");
    label.setAttribute("text-anchor","middle");
    label.setAttribute("font-size","8.5");
    label.setAttribute("fill","rgba(244,247,245,0.55)");
    label.textContent = spot.name;
    g.appendChild(label);

    if(!found){
      g.addEventListener("click", () => openQrScan(spot));
    }

    svg.appendChild(g);
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
  state.activeSpotId = spot.id;
  state.phase = "puzzle";
  saveState();

  const route = currentRoute();
  $("#puzzleRouteLabel").textContent = `${route.label} · ${spot.name}`;
  $("#puzzleTitle").textContent = spot.title;
  $("#puzzleDesc").textContent = spot.desc;
  $("#puzzleVisual").textContent = spot.visual;
  $("#hintBox").classList.remove("show");
  $("#hintBox").textContent = spot.hint;
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
    fb.textContent = "正解！ 冒険の書に記録しよう。";
    fb.className = "feedback-msg ok";
    $("#answerInput").disabled = true;
    $("#answerCheckBtn").disabled = true;
    setTimeout(() => {
      $("#answerInput").disabled = false;
      $("#answerCheckBtn").disabled = false;
      showFeatherStory(spot);
    }, 700);
  } else {
    fb.textContent = "うーん、違うようだ。冒険の書のヒントをもう一度確かめてみて。";
    fb.className = "feedback-msg ng";
  }
}
$("#answerCheckBtn").addEventListener("click", checkAnswer);
$("#answerInput").addEventListener("keydown", (e) => { if(e.key === "Enter") checkAnswer(); });

/* ---------------- 羽根獲得ストーリー ---------------- */

function showFeatherStory(spot){
  if(!state.solvedSpotIds.includes(spot.id)){
    state.solvedSpotIds.push(spot.id);
  }
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
    const isComplete = state.solvedSpotIds.length >= total;
    $("#storyNextBtn").textContent = isComplete ? "師匠のもとへ向かう" : "地図に戻る";
    $("#storyNextBtn").onclick = () => {
      renderTop();
      if(isComplete){
        goToEndingSelect();
      } else {
        goToMap();
      }
    };
  });
}

/* ---------------- 最終選択・エンディング ---------------- */

function goToEndingSelect(){
  state.phase = "endingSelect";
  saveState();
  showView("endingSelect");
  $("#masterText").textContent = "";
  typewriterText($("#masterText"),
    "……よくぞ、三枚の羽根を集めてくれた。さて、この羽団扇をどうするか、きみに委ねよう。",
    () => {
      const box = $("#endingChoices");
      box.innerHTML = "";
      const opts = [
        { key:"all_return", title:"羽根をすべて返す", desc:"疾風丸に羽根をすべて返し、羽団扇を元通りにする。" },
        { key:"keep_one", title:"一枚だけ残す", desc:"一枚の羽根を記念に残し、二枚を返す。" },
      ];
      opts.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "choice-card";
        btn.innerHTML = `<div class="cc-title">${opt.title}</div><div class="cc-desc">${opt.desc}</div>`;
        btn.addEventListener("click", () => {
          state.endingKey = opt.key;
          state.phase = "endingResult";
          saveState();
          renderEndingResult(opt.key);
          showView("endingResult");
          renderTop();
        });
        box.appendChild(btn);
      });
    }
  );
}

function renderEndingResult(key){
  const ending = ENDINGS[key];
  $("#endEmoji").textContent = ending.emoji;
  $("#endTitle").textContent = ending.title;
  $("#endBody").textContent = ending.body;

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
  window.open("https://example.com", "_blank");
});

/* ---------------- 冒険の書（ノートブック） ---------------- */

const NOTEBOOK_PAGES = [
  {
    key:"map", label:"会場マップ",
    render:() => `<div class="card"><div class="eyebrow">会場マップ</div><p class="lead">受付で受け取ったパンフレットから、選んだ道のマップと×印を確認できます。3つのQRコードは好きな順番で探せます。×印の位置を目安にQRコードを探してください。</p></div>`,
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

/* ---------------- 初期化 ---------------- */

function init(){
  initSnowfall();
  const saved = loadState();
  if(saved) state = Object.assign(
    { route:null, solvedSpotIds:[], activeSpotId:null, phase:"intro", storyStep:0, endingKey:null },
    saved
  );
  renderTop();
  showView("top");
}

init();

})();
