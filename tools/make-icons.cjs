// アプリのアイコン（icon-192.png・icon-512.png）を作る。紺の地に、立方体の絵（data.js の絵）と、さわる手の「？」（さわった形はどれ？）。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
const K = require(path.join(__dirname, "..", "data.js"));
const CSS = ".shp path{stroke:#1d2a3f;stroke-width:.06;stroke-linejoin:round}.s1{fill:#f6deb0}.s2{fill:#dba965}.s3{fill:#a96d33}.bk{fill:none;stroke-dasharray:.1 .08;opacity:.7}";
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><style>${CSS}</style><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#123554"/>
      <svg class="shp" x="12" y="18" width="68" height="68" viewBox="-1.6 -1.6 3.2 3.2">${K.svgBody("rippo")}</svg>
      <circle cx="78" cy="24" r="15" fill="#f2a43a"/><text x="78" y="31" text-anchor="middle" font-size="22" font-weight="900" font-family="sans-serif" fill="#123554">?</text></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
