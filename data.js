// さわった形はどれ？（モリヌークスの問い）の問題を作る（ブラウザと node の両方で使う）。
// 2つの種類がある。
//  1. 形の問題（type "shape"）：手でさわって分かった手がかり（角の数・平らな面・曲がった面・面の形・穴など）を読み、
//     目で見る形の絵を4つから選ぶ。正解したら2段目「ほかの形ではないと分かる手がかりは？」を3つから選ぶ。
//     手がかりは SHAPES に書いた形の数（角・辺・面）だけから作る。数は QA が絵の作り方（POLY の頂点と面）から数え直してくらべる。
//  2. 問いと研究の問題（type "fact"）：モリヌークスの問いと、その答え合わせ。正解がある。中身は次の2つに書いてあることだけ。
//     Locke『An Essay Concerning Human Understanding』第2版（1694）Book II ch.9 §8（Molyneux の手紙。スタンフォード哲学百科事典
//     「Molyneux's Problem」が引く本文で確かめた）と、Held ら 2011 "The newly sighted fail to match seen with felt",
//     Nature Neuroscience 14(5): 551–553（本文で確かめた数：5人・8〜17歳・48時間以内・20組・98%・92%・58%・3人・5日）。
// 乱数 R は呼ぶ回数が同じ tag なら毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// SHAPES・KINDS は最後に足すだけにし、足す種類には since:"YYYY-MM-DD"（出し始める日・公開の翌日以降）を付ける。
// 形の問題で選ぶ形は POOL（はじめの13個）に決めてある。形を足しても POOL は変えない（過去の日の問題が変わるため。QA の PIN が第1回を見る）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」と「このゲームについて」に出す）
  const SRC = {
    locke: ["Locke『An Essay Concerning Human Understanding』第2版（1694）Book II ch.9 §8（スタンフォード哲学百科事典「Molyneux's Problem」）", "https://plato.stanford.edu/entries/molyneux-problem/"],
    held: ["Held ら（2011）The newly sighted fail to match seen with felt（Nature Neuroscience 14(5)）", "https://doi.org/10.1038/nn.2795"],
  };
  // 研究と本の数（ゲームの中の数はここからだけ出す。QA は別に書いた表とくらべる）
  // n：調べた人数、age0・age1：年れい、hrs：手術から調べるまで（時間以内）、pairs：形の組の数、
  // tt：さわる→さわる、vv：見る→見る、tv：さわる→見る（どれも当たった割合の平均 %）、re：あとで調べ直した人数、days：調べ直し（最初から早い人で何日後）
  // ed：問いがのった『人間知性論』第2版の年、letter：Molyneux が最初に手紙で問いを出した年
  const PAPER = { n: 5, age0: 8, age1: 17, hrs: 48, pairs: 20, tt: 98, vv: 92, tv: 58, re: 3, days: 5, ed: 1694, letter: 1688 };

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end

  // ---- 形 ----
  // v：とがった角（頂点）の数、e：まっすぐなふち（辺）の数、f：平らな面の数、c：曲がった面があるか（1/0）、k：平らな面の形、h：穴があるか（1/0）
  // poly：絵を作る形（POLY の名前。曲がった形は null）
  const SH = (id, name, v, e, f, c, k, h, poly) => ({ id, name, v, e, f, c, k, h, poly });
  const SHAPES = [
    SH("kyu", "球", 0, 0, 0, 1, "none", 0, null),
    SH("rippo", "立方体", 8, 12, 6, 0, "sq", 0, "rippo"),
    SH("choku", "直方体", 8, 12, 6, 0, "rect", 0, "choku"),
    SH("enchu", "円柱", 0, 0, 2, 1, "circ", 0, null),
    SH("ensui", "円すい", 1, 0, 1, 1, "circ", 0, null),
    SH("hankyu", "半球", 0, 0, 1, 1, "circ", 0, null),
    SH("shisui", "四角すい", 5, 8, 5, 0, "sqtri", 0, "shisui"),
    SH("sansui", "三角すい", 4, 6, 4, 0, "tri", 0, "sansui"),
    SH("sanchu", "三角柱", 6, 9, 5, 0, "trirect", 0, "sanchu"),
    SH("gochu", "五角柱", 10, 15, 7, 0, "pent", 0, "gochu"),
    SH("rokuchu", "六角柱", 12, 18, 8, 0, "hex", 0, "rokuchu"),
    SH("hachi", "正八面体", 6, 12, 8, 0, "tri", 0, "hachi"),
    SH("donut", "ドーナツ形", 0, 0, 0, 1, "none", 1, null),
  ];
  const SHP = Object.fromEntries(SHAPES.map((s) => [s.id, s]));
  const BYNAME = Object.fromEntries(SHAPES.map((s) => [s.name, s]));
  const POOL = SHAPES.slice(0, 13); // 選ぶ形（数を変えない）
  const CURVED = POOL.filter((s) => s.c), FLAT = POOL.filter((s) => !s.c);

  // 平らな面の形の言い方（さわって分かること）
  const KTXT = {
    none: "平らな面は無い",
    sq: "平らな面は、どれも同じ大きさの正方形",
    rect: "平らな面はどれも四角で、細長い長方形の面がある",
    circ: "平らな面は、まるい形（円）",
    sqtri: "四角の面が1つあり、ほかの面は三角",
    tri: "平らな面は、どれも三角",
    trirect: "両はしの面は三角で、まわりの面は四角",
    pent: "両はしの面は五角形で、まわりの面は四角",
    hex: "両はしの面は六角形で、まわりの面は四角",
  };
  // 手がかりの種類（2段目の答えにもなる）
  const CATS = ["v", "e", "f", "c", "k", "h"];
  const cnt = (n) => (n < 10 ? `${n}つ` : `${n}個`); // 10より上は「つ」で数えない
  const clue = (s, c) => {
    if (c === "v") return s.v ? `とがった角が${cnt(s.v)}ある` : "とがった角は1つも無い";
    if (c === "e") return s.e ? `まっすぐなふち（辺）が${s.e}本ある` : "まっすぐなふち（辺）は無い";
    if (c === "f") return s.f ? `平らな面が${cnt(s.f)}ある` : "平らな面は1つも無い";
    if (c === "c") return s.c ? "なめらかに曲がった面がある" : "曲がった面は無い。どの面も平ら";
    if (c === "k") return KTXT[s.k];
    return s.h ? "まん中に、指が通りぬける穴がある" : "指が通りぬける穴は無い";
  };
  const differ = (a, b, c) => a[c] !== b[c];

  // 2段目の答え（形の問題は手がかりの種類、問いと研究の問題は数や答え）
  const GROUPS = {
    v: { name: "とがった角の数", sub: "頂点" },
    e: { name: "まっすぐなふちの数", sub: "辺" },
    f: { name: "平らな面の数", sub: "面" },
    c: { name: "曲がった面", sub: "あるか・無いか" },
    k: { name: "平らな面の形", sub: "三角・四角・円など" },
    h: { name: "穴", sub: "指が通るか" },
    no: { name: "当てられない", sub: "「いいえ」" },
    yes: { name: "当てられる", sub: "「はい」" },
    half: { name: "半分だけ当たる", sub: "どちらとも言えない" },
    p_vv: { name: `${PAPER.vv}%`, sub: "見る → 見る" },
    p_tt: { name: `${PAPER.tt}%`, sub: "さわる → さわる" },
    p_tv: { name: `${PAPER.tv}%`, sub: "さわる → 見る" },
    p_50: { name: "50%", sub: "勘で選ぶのと同じ" },
    a_kid: { name: `${PAPER.age0}〜${PAPER.age1}歳`, sub: "子どもと若い人" },
    a_mid: { name: "30〜50歳", sub: "おとな" },
    a_old: { name: "70歳より上", sub: "お年より" },
    d_5: { name: `早い人で${PAPER.days}日後`, sub: "数日" },
    d_1y: { name: "1年後", sub: "長い時間" },
    d_1h: { name: "1時間後", sub: "すぐ" },
    y_88: { name: `${PAPER.letter}年`, sub: "第2版より前" },
    y_1794: { name: "1794年", sub: "100年あと" },
    y_1594: { name: "1594年", sub: "100年まえ" },
  };

  // ---- 形の問題を作る ----
  // T：答えの形、ds：ほかの3つ、cats：手がかりに使う種類の候補（この順にためす）、max：手がかりの数の上限
  // どのほかの形とも、手がかりのどれか1つで分けられるときだけ作る。作れなければ null（R を同じ回数だけ引いてやり直す）
  function clueSet(R, T, ds, cats, max) {
    const order = shuffle(R, cats).filter((c) => !(c === "k" && T.f === 0)), use = []; // 平らな面が無い形に「面の形」は言わない（「平らな面は1つも無い」と同じになる）
    const left = () => ds.filter((d) => !use.some((c) => differ(T, d, c)));
    for (const c of order) {
      if (!left().length) break;
      if (ds.some((d) => !use.some((u) => differ(T, d, u)) && differ(T, d, c))) use.push(c);
    }
    if (left().length) return null;
    if (use.length < 2) { const more = order.find((c) => !use.includes(c)); if (more) use.push(more); }
    if (use.length > max) return null;
    return CATS.filter((c) => use.includes(c)); // 手がかりはいつも同じ順（角 → 辺 → 面 → 曲がった面 → 面の形 → 穴）
  }
  // 2段目：ほかの形 d のどれか1つを選び、「d ではないと分かる手がかりは？」。正解は手がかりの中で d とちがう種類のうち1つ、
  // まちがいは d と同じ値の種類2つ（どの手がかりで見ても d と分けられないので、答えは1つに決まる）
  function second(R, T, ds, use) {
    for (const d of shuffle(R, ds)) {
      const dif = use.filter((c) => differ(T, d, c)), eq = CATS.filter((c) => !differ(T, d, c));
      if (!dif.length || eq.length < 2) continue;
      const grp = dif[ri(R, 0, dif.length - 1)], wr = pickN(R, eq, 2);
      return { d, grp, g2: shuffle(R, [grp, ...wr]) };
    }
    return null;
  }
  function shapeQ(R, pickT, pickD, cats, max) {
    for (let t = 0; t < 40; t++) {
      const T = pickT(R), ds = pickD(R, T);
      if (!T || !ds || ds.length !== 3) continue;
      const use = clueSet(R, T, ds, cats, max);
      if (!use) continue;
      const sec = second(R, T, ds, use);
      if (!sec) continue;
      const opts = shuffle(R, [T, ...ds]).map((s) => s.name);
      const lines = use.map((c) => clue(T, c));
      return { type: "shape", media: "さわって分かったこと", lines, q: lines.join("。") + "。", ask: "目で見ると、どの形？", opts, ans: T.name, shp: T.id, use,
        grp: sec.grp, g2: sec.g2, ask2: `「${sec.d.name}」ではないと分かる手がかりは？`, other: sec.d.id,
        gwhy: `${sec.d.name}は「${clue(sec.d, sec.grp)}」。手がかりの「${clue(T, sec.grp)}」と合いません。` };
    }
    return null;
  }
  const anyOf = (list) => (R) => list[ri(R, 0, list.length - 1)];
  const randD = (from) => (R, T) => pickN(R, from.filter((s) => s !== T), 3);
  // 近い形：同じ値の手がかりが多い順に5つ選び、そこから3つ
  const near = (R, T) => { const sc = POOL.filter((s) => s !== T).map((s) => [s, CATS.filter((c) => !differ(T, s, c)).length]); const top = sc.slice().sort((a, b) => b[1] - a[1] || POOL.indexOf(a[0]) - POOL.indexOf(b[0])).slice(0, 5).map((x) => x[0]); return pickN(R, top, 3); };

  // ---- 問いと研究の問題 ----
  const MOL = [
    "生まれつき目が見えず、手でさわって球と立方体を見分けられるようになった人がいる。",
    "あるとき、目が見えるようになった。机の上に、同じ金属でできた、同じくらいの大きさの球と立方体がある。",
  ];
  const fact = (lines, ask, opts, ans, grp, g2, ask2, gwhy, media, svg) => (R) => ({ type: "fact", media, lines, q: lines.join(""), ask, opts: shuffle(R, opts), ans, grp, g2: shuffle(R, g2), ask2, gwhy, svg: svg || null });
  const HELD = [
    `目が見えないまま育ち、手術で見えるようになった${PAPER.n}人（${PAPER.age0}〜${PAPER.age1}歳）。`,
    `手術から${PAPER.hrs}時間のうちに、おもちゃの形を2つ並べて「さっきの形はどっち？」と聞いた。`,
  ];
  const pc = (n) => `${n}%`;

  // id：種類、lv：難しさ、src：出典、name：帳に出す名前、look：1回目のヒント、key：2回目のヒント（2つにしぼるときに出す）、why：説明
  const K = (id, lv, src, name, look, key, why, make) => ({ id, lv, src: [src], name, look, key, why, make });
  const KINDS = [
    // ---- やさしい ----
    K("maru", 0, "locke", "まるい形", "曲がった面がある形は、ころがる。とがった所はある？", "手がかりを1つずつ、絵の形に当てはめる",
      "曲がった面のある形（球・円柱・円すい・半球・ドーナツ形）は、とがった角・平らな面・穴の数で分けられます。",
      (R) => shapeQ(R, anyOf(CURVED), randD(POOL), CATS, 3)),
    K("kado", 0, "locke", "角のある形", "とがった角や平らな面を数えると？", "手がかりを1つずつ、絵の形に当てはめる",
      "平らな面だけでできた形は、角・辺・面の数と、面の形で分けられます。",
      (R) => shapeQ(R, anyOf(FLAT), randD(POOL), CATS, 3)),
    K("toi", 0, "locke", "問いへの答え", "さわって覚えたことと、見たときの感じはつながっている？", "モリヌークスもロックも「いいえ」と答えた",
      `Molyneux は手紙でこの問いを出し、「いいえ。さわった感じと見た感じのつながりを、まだ経験していないから」と答えました。Locke は『人間知性論』第2版（${PAPER.ed}年）にのせ、同じ答えだと書きました。`,
      fact(MOL, "さわる前に、目だけで、どちらが球か言える？ Molyneux の答えは？", ["当てられない", "当てられる", "球だけ当てられる"], "当てられない",
        "no", ["no", "yes", "half"], "この問いを本にのせた Locke の答えは？", "Locke は「この考え深い友人の答えに同意する」と書き、見てすぐには確かに言えないと考えました。", "モリヌークスの問い", "molyneux")),
    // ---- ふつう ----
    K("nimaru", 1, "locke", "似たまるい形", "とがった角・平らな面・穴。ちがうのはどれ？", "手がかりを1つずつ、絵の形に当てはめる",
      "円柱・円すい・半球は、どれも平らな円の面と曲がった面があります。平らな面の数と、とがった先があるかで分けられます。",
      (R) => shapeQ(R, anyOf(CURVED), randD(CURVED), CATS, 3)),
    K("nikado", 1, "locke", "似た角のある形", "角・辺・面の数を、絵で数えてみる", "手がかりを1つずつ、絵の形に当てはめる",
      "角のある形どうしは、数だけでなく面の形（三角・四角・五角形・六角形）でも分けられます。",
      (R) => shapeQ(R, anyOf(FLAT), randD(FLAT), CATS, 3)),
    K("tv", 1, "held", "さわって、見て選ぶ", "さわった形を、見て選ぶのはむずかしかった", `さわる→見るは${pc(PAPER.tv)}。2つから選ぶので、勘で選んでも50%`,
      `Held ら（2011）。見た形どうし・さわった形どうしならよく当たったのに、さわった形を見て選ぶと${pc(PAPER.tv)}で、勘で選んだとき（50%）に近い数でした。`,
      fact(HELD, "さわった形を、見て選ぶ。当たったのは平均で？", [pc(PAPER.tv), pc(PAPER.vv), pc(PAPER.tt)], pc(PAPER.tv),
        "p_vv", ["p_vv", "p_tv", "p_50"], "見た形を、見て選ぶと？", `見た形どうしなら${pc(PAPER.vv)}、さわった形どうしなら${pc(PAPER.tt)}。目も手もよく働いていたのに、2つを結ぶところだけ低かったのです。`, "Held ら 2011", "pair")),
    K("tt", 1, "held", "さわって、さわって選ぶ", "手だけなら、よく当たった", `さわる→さわるは${pc(PAPER.tt)}、見る→見るは${pc(PAPER.vv)}`,
      `Held ら（2011）。さわった形をさわって選ぶと${pc(PAPER.tt)}、見た形を見て選ぶと${pc(PAPER.vv)}当たりました。`,
      fact(HELD, "さわった形を、さわって選ぶ。当たったのは平均で？", [pc(PAPER.tt), pc(PAPER.tv), "50%"], pc(PAPER.tt),
        "p_tv", ["p_tv", "p_tt", "p_50"], "さわった形を、見て選ぶと？", `さわった形を見て選ぶと${pc(PAPER.tv)}。勘で選んだとき（50%）に近い数でした。`, "Held ら 2011", "pair")),
    // ---- むずかしい ----
    K("chikai", 2, "locke", "よく似た形", "1つの手がかりで、2つ以上の絵が残る。手がかりを全部合わせると？", "手がかりを1つずつ、絵の形に当てはめる",
      "よく似た形は、1つの手がかりでは分けられません。いくつかの手がかりを合わせると、1つに決まります。",
      (R) => shapeQ(R, anyOf(POOL), near, CATS, 3)),
    K("kazu", 2, "locke", "数だけの手がかり", "角・辺・面の数を、絵の中で数える。見えない後ろ側もある", "見えている角や面から、後ろ側の数も考える",
      "角の数・辺の数・面の数だけでも、形は分けられます。角のある形では「角 − 辺 ＋ 面 ＝ 2」になります（オイラーの多面体定理）。",
      (R) => shapeQ(R, anyOf(FLAT), randD(FLAT), ["v", "e", "f"], 3)),
    K("ninzu", 2, "held", "研究で調べた人", `調べたのは${PAPER.n}人`, `${PAPER.n}人とも、生まれつき目が見えず、手術で見えるようになった`,
      `Held ら（2011）が調べたのは${PAPER.n}人（${PAPER.age0}〜${PAPER.age1}歳）。生まれつき白内障などで目が見えず、手術で見えるようになった人たちです。`,
      fact(["目が見えないまま育ち、手術で見えるようになった人たちに、手術のすぐあと、さわった形を見て選んでもらった研究がある。"], "この研究で調べたのは何人？", [`${PAPER.n}人`, "50人", "500人"], `${PAPER.n}人`,
        "a_kid", ["a_kid", "a_mid", "a_old"], "その人たちの年れいは？", `${PAPER.age0}〜${PAPER.age1}歳でした。手術は、インドの病院で行われました（Project Prakash）。`, "Held ら 2011", "pair")),
    K("ato", 2, "held", "あとで調べ直すと", `${PAPER.re}人を、あとでもう一度調べた`, "数日で、さわった形と見た形が結びつき始めた",
      `Held ら（2011）。${PAPER.re}人を、新しい似た形でもう一度調べると、さわった形を見て選ぶ当たりが増えていました。早い人で最初から${PAPER.days}日後です。練習はしていません。`,
      fact([...HELD, `最初は、さわった形を見て選ぶと${pc(PAPER.tv)}でした。`], `${PAPER.re}人を、あとでもう一度調べると？`, ["当たりが増えた", "変わらなかった", "当たりが減った"], "当たりが増えた",
        "d_5", ["d_5", "d_1y", "d_1h"], "増えていたのは、最初から？", `早い人で${PAPER.days}日後でした。そのあいだ、形の練習はしていません。ふだんの暮らしで見たりさわったりしただけです。`, "Held ら 2011", "pair")),
    K("hon", 2, "locke", "問いがのった本", `Locke『人間知性論』の第2版にのった`, `第2版は${PAPER.ed}年。手紙はそれより前`,
      `Molyneux の問いは、Locke『人間知性論』第2版（${PAPER.ed}年）Book II 第9章 §8 にのりました。Molyneux が最初に手紙で問いを出したのは${PAPER.letter}年です。`,
      fact(MOL, "この問いがのった Locke『人間知性論』第2版は何年？", [`${PAPER.ed}年`, "1794年", "1894年"], `${PAPER.ed}年`,
        "y_88", ["y_88", "y_1794", "y_1594"], "Molyneux が最初に手紙で問いを出したのは？", `${PAPER.letter}年です。のちに${PAPER.ed - 1}年の手紙でもう一度出し、Locke が第2版にのせました。`, "モリヌークスの問い", "molyneux")),
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv, date) => KINDS.filter((k) => k.lv === lv && (!date || !k.since || k.since <= date)).map((k) => k.id);
  const FACT = KINDS.filter((k) => k.src[0] === "held" || k.id === "toi" || k.id === "hon").map((k) => k.id);

  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  function make(tag) {
    const [kind] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null;
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    if (!p) return null;
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.lines.join("")}:${P.opts.slice().sort().join("/")}:${P.ask2}`;

  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0, date), 2), n = pickN(R, kindsOf(1, date), 2), h = pickN(R, kindsOf(2, date), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2, date).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  // ---- 絵（SVG）----
  // 角のある形は頂点と面から作る（QA が頂点・辺・面の数を数え、SHAPES の数とくらべる）。見る向きはどれも同じ（右上から少し見下ろす）
  const ngon = (n, r, y, a0) => Array.from({ length: n }, (_, i) => { const a = a0 + (i * 2 * Math.PI) / n; return [r * Math.cos(a), y, r * Math.sin(a)]; });
  function prism(n, r, h, a0) {
    const top = ngon(n, r, h, a0), bot = ngon(n, r, -h, a0), V = [...top, ...bot];
    const F = [top.map((_, i) => i), bot.map((_, i) => n + i)];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; F.push([i, j, n + j, n + i]); }
    return { V, F };
  }
  const box = (x, y, z) => { const V = []; for (const a of [-x, x]) for (const b of [-y, y]) for (const c of [-z, z]) V.push([a, b, c]); return { V, F: [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]] }; };
  const TH = 0.62; // 三角すいの底の高さ
  const POLY = {
    rippo: box(0.95, 0.95, 0.95),
    choku: box(1.35, 0.62, 0.8),
    shisui: (() => { const b = ngon(4, 1.25, -0.75, 0.25); return { V: [...b, [0, 1.05, 0]], F: [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]] }; })(),
    sansui: (() => { const b = ngon(3, 1.25, -TH, 1.2); return { V: [...b, [0, -TH + 1.25 * Math.sqrt(3) * Math.sqrt(2 / 3), 0]], F: [[0, 1, 2], [0, 1, 3], [1, 2, 3], [2, 0, 3]] }; })(),
    sanchu: (() => { const T = [[-1.05, -0.75], [1.05, -0.75], [0, 0.95]], V = [...T.map(([x, y]) => [x, y, 0.95]), ...T.map(([x, y]) => [x, y, -0.95])]; return { V, F: [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]] }; })(),
    gochu: prism(5, 1.1, 0.7, -Math.PI / 2),
    rokuchu: prism(6, 1.1, 0.65, 0.35),
    hachi: { V: [[1.15, 0, 0.3], [-1.15, 0, -0.3], [0, 1.35, 0], [0, -1.35, 0], [-0.3, 0, 1.15], [0.3, 0, -1.15]], F: [[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 2, 4], [1, 4, 3], [1, 3, 5], [1, 5, 2]] },
  };
  const YAW = -0.6, PITCH = 0.42, LIGHT = [-0.45, 0.75, 0.5];
  const rot = ([x, y, z]) => { const c = Math.cos(YAW), s = Math.sin(YAW), x1 = c * x + s * z, z1 = -s * x + c * z, cp = Math.cos(PITCH), sp = Math.sin(PITCH); return [x1, cp * y - sp * z1, sp * y + cp * z1]; };
  const f2 = (n) => (Math.round(n * 100) / 100).toString();
  const shadeOf = (n) => { const L = Math.hypot(...LIGHT), d = (n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / L; return d > 0.55 ? 1 : d > 0.1 ? 2 : 3; };
  function polySvg(p) {
    const V = p.V.map(rot), cx = V.reduce((a, v) => a + v[0], 0) / V.length, cy = V.reduce((a, v) => a + v[1], 0) / V.length, cz = V.reduce((a, v) => a + v[2], 0) / V.length;
    let out = "", back = "";
    const vis = [];
    for (const f of p.F) {
      const P = f.map((i) => V[i]), a = P[0], b = P[1], c = P[2];
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const m = [P.reduce((s, v) => s + v[0], 0) / P.length - cx, P.reduce((s, v) => s + v[1], 0) / P.length - cy, P.reduce((s, v) => s + v[2], 0) / P.length - cz];
      if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) n = n.map((x) => -x);
      const len = Math.hypot(...n) || 1; n = n.map((x) => x / len);
      if (n[2] <= 0.02) continue; // 後ろ向きの面は見えない
      vis.push(f);
      out += `<path class="s${shadeOf(n)}" d="M${P.map((v) => `${f2(v[0])} ${f2(-v[1])}`).join("L")}Z"/>`;
    }
    // 見えない辺は点線（算数の見取図と同じ）。見える面のどれにも入っていない辺
    const seen = new Set(), on = (f, a, b) => f.some((x, i) => (x === a && f[(i + 1) % f.length] === b) || (x === b && f[(i + 1) % f.length] === a));
    for (const f of p.F) for (let i = 0; i < f.length; i++) {
      const a = f[i], b = f[(i + 1) % f.length], id = Math.min(a, b) + "-" + Math.max(a, b);
      if (seen.has(id)) continue; seen.add(id);
      if (!vis.some((g) => on(g, a, b))) back += `<path class="bk" d="M${f2(V[a][0])} ${f2(-V[a][1])}L${f2(V[b][0])} ${f2(-V[b][1])}"/>`;
    }
    return out + back;
  }
  // 曲がった形は2Dの線で描く（同じ見下ろしの向き）
  const sp = Math.sin(PITCH), cp = Math.cos(PITCH);
  function curveSvg(id) {
    const e = (y, r) => ({ y: f2(-y * cp), ry: f2(r * sp), r: f2(r) });
    if (id === "kyu") return `<circle class="s2" cx="0" cy="0" r="1.25"/><ellipse class="hl" cx="-0.42" cy="-0.45" rx="0.42" ry="0.3"/>`;
    if (id === "enchu") { const t = e(0.85, 1), b = e(-0.85, 1); return `<path class="s2" d="M-1 ${t.y}L-1 ${b.y}A1 ${b.ry} 0 0 0 1 ${b.y}L1 ${t.y}Z"/><path class="hl" d="M-0.75 ${f2(+t.y + 0.25)}L-0.75 ${f2(+b.y + 0.25)}L-0.45 ${f2(+b.y + 0.33)}L-0.45 ${f2(+t.y + 0.33)}Z"/><ellipse class="s1" cx="0" cy="${t.y}" rx="1" ry="${t.ry}"/><path class="bk" d="M-1 ${b.y}A1 ${b.ry} 0 0 1 1 ${b.y}"/>`; }
    if (id === "ensui") { const b = e(-0.8, 1.1), ty = f2(-1.1 * cp); return `<path class="s2" d="M0 ${ty}L-1.1 ${b.y}A1.1 ${b.ry} 0 0 0 1.1 ${b.y}Z"/><path class="hl" d="M0 ${ty}L-0.7 ${f2(+b.y + 0.3)}L-0.35 ${f2(+b.y + 0.42)}Z"/><path class="bk" d="M-1.1 ${b.y}A1.1 ${b.ry} 0 0 1 1.1 ${b.y}"/>`; }
    if (id === "hankyu") { const t = e(0.35, 1.25); return `<path class="s2" d="M-1.25 ${t.y}A1.25 1.25 0 0 0 1.25 ${t.y}Z"/><path class="hl" d="M-0.95 ${f2(+t.y + 0.25)}A0.95 0.85 0 0 0 -0.35 ${f2(+t.y + 0.95)}A0.8 0.75 0 0 1 -0.95 ${f2(+t.y + 0.25)}Z"/><ellipse class="s1" cx="0" cy="${t.y}" rx="1.25" ry="${t.ry}"/>`; }
    if (id === "donut") return `<path class="s2" fill-rule="evenodd" d="M-1.3 0A1.3 0.95 0 1 0 1.3 0A1.3 0.95 0 1 0 -1.3 0ZM-0.5 -0.08A0.5 0.3 0 1 0 0.5 -0.08A0.5 0.3 0 1 0 -0.5 -0.08Z"/><path class="s3" d="M-0.5 -0.08A0.5 0.3 0 0 1 0.5 -0.08A0.56 0.4 0 0 0 -0.5 -0.08Z"/><path class="hl" d="M-1.05 -0.2A1.05 0.65 0 0 1 0.3 -0.78A1.1 0.75 0 0 0 -1.05 -0.2Z"/>`;
    return "";
  }
  // 絵の中身（<svg> の中）。外の <svg> は画面ごとに付ける
  const svgBody = (id) => { const s = SHP[id]; return s ? (s.poly ? polySvg(POLY[s.poly]) : curveSvg(id)) : ""; };
  const svgOf = (id, label) => `<svg class="shp" viewBox="-1.6 -1.6 3.2 3.2" role="img" aria-label="${label || (SHP[id] ? SHP[id].name : "")}">${svgBody(id)}</svg>`;

  const SWK = { KINDS, BY, GROUPS, CATS, LV, SRC, PAPER, SHAPES, SHP, BYNAME, POOL, POLY, KTXT, FACT, clue, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN, shuffle, svgBody, svgOf, rot };
  if (typeof module !== "undefined" && module.exports) module.exports = SWK; else root.SWK = SWK;
})(typeof window !== "undefined" ? window : globalThis);
