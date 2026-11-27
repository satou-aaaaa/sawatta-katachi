// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の問題（答え）は入れず、遊び方の例だけ（問題データにない言い方で、正解の印も付けない。CodeRabbit mansion-kimari#1）。
// 左に題、右に「さわった手がかり」の例と、形の絵4つ（data.js の絵）。手がかりの例は2段目の手がかりの種類の名前だけ（答えの決まる文にしない）。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
const K = require(path.join(__dirname, "..", "data.js"));
const CSS = ".shp path,.shp circle,.shp ellipse{stroke:#1d2a3f;stroke-width:.05;stroke-linejoin:round}.s1{fill:#f6deb0}.s2{fill:#dba965}.s3{fill:#a96d33}.hl{fill:#fff;opacity:.45;stroke:none!important}.bk{fill:none;stroke-dasharray:.1 .08;stroke-width:.035;opacity:.7}";
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const line = (t) => `<div style="font-size:30px;font-weight:700;padding:6px 16px;border-radius:12px;background:#fff;border:3px solid #1d2a3f55">✋ ${t}</div>`;
  const pic = (id) => `<div style="background:#fff;border:3px solid #1d2a3f55;border-radius:12px;display:flex;align-items:center;justify-content:center;height:150px"><svg class="shp" width="130" height="130" viewBox="-1.6 -1.6 3.2 3.2">${K.svgBody(id)}</svg></div>`;
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif"><style>${CSS}</style>
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:44px 60px;background:#f4ede2;color:#1d2a3f;display:flex;gap:44px;align-items:center">
    <div style="flex:0 0 440px">
      <div style="font-size:30px;color:#83261a;letter-spacing:.06em">モリヌークスの問い</div>
      <div style="font-size:72px;font-weight:900;margin-top:8px;line-height:1.15;color:#123554">さわった形は<br><span style="color:#b23a24">どれ？</span></div>
      <div style="font-size:34px;margin-top:14px">手がかりから、<br>目で見る形を選ぶ。</div>
    </div>
    <div style="flex:1;background:#fffdf7;border:4px solid #1d2a3f;border-radius:8px;overflow:hidden">
      <div style="font-size:28px;font-weight:700;padding:14px 18px;background:#164f33;color:#fff">✋ さわって分かったこと</div>
      <div style="display:flex;flex-direction:column;gap:8px;padding:14px 16px 6px">${line("とがった角の数？")}${line("平らな面の形？")}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;padding:10px 16px 18px">${["kyu", "rippo", "ensui", "sanchu"].map(pic).join("")}</div>
    </div>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
