# AGENTS.md

さわった形はどれ？：手でさわって分かった手がかり（とがった角の数・まっすぐなふち・平らな面・曲がった面・面の形・穴）を読み、目で見る形を4つの絵から選ぶ1日5問の学習ゲーム（モリヌークスの問い）。正解したら2段目で「ほかの形ではないと分かる手がかりは？」を3つから選ぶ。ときどき、モリヌークスの問いと答え合わせ（Locke 1694・Held ら 2011）の問題も出る。`index.html` と `data.js`（形・手がかり・問題の種類・形の絵）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 問題（12種類×3000問：手がかりに合う形が1つだけ・2段目の答えが1つに決まる・形の数を絵のもとから数え直す・研究の数が原典の表どおり）・今日の回と上級（3年分）・とことん・通しで遊ぶ・続きから・復習・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 数は原典の値だけ：Held ら (2011) "The newly sighted fail to match seen with felt", Nature Neuroscience 14(5): 551–553（5人・8〜17歳・48時間以内・20組・98%・92%・58%・3人・5日）と、Locke『人間知性論』第2版（1694）Book II ch.9 §8・Molyneux の最初の手紙（1688）。`data.js` の `PAPER` にだけ書き、`qa/run.mjs` の `PB`（別に書いた原典の表）とくらべる。確かめられない数は足さない。
- 形の数（角・辺・面など）は `data.js` の `SHAPES`。`qa/run.mjs` の `TB`（別に書いた表）と、絵のもと（`POLY` の頂点と面）から数え直した数の両方とくらべる。手がかりの文は `clue()` だけで作る。
- 目の見え方のちがいで、人のよい悪いをくらべない。見えない人・見える人を笑いや失敗の題にしない。お笑いを入れない。
- 2段目：形の問題は「<ほかの形>ではないと分かる手がかりは？」（正解はその形とちがう手がかりの種類、まちがいの2つは同じ値の種類）。問いと研究の問題は続きの問い（Locke の答え・見る→見る・年れい・何日後・最初の手紙の年など）。問いの文に1段目の答えを書かない。
- 今日の回（やさしい2・ふつう2・むずかしい1）・上級（むずかしい3）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。`SHAPES`・`KINDS` は最後に足すだけ、選ぶ形は `POOL`（はじめの13）で変えない（QA の `PIN` が第1回を見る）。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。上級はヒントなし。時間制限なし。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。
- 記録 `swk-v1`・文字 `swk-fs`・復習 `swk-depth`。`depth.js`・`qa/depth-check.mjs`・見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）・引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）・store・core・kiroku は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は たまたま当たった？（tamatama-atari）から写した（2段目は わざと？わざとじゃない？ の形）。写し元の言葉が残っていないかを QA が見る。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答えを出さない。外へ通信しない（CSP の `connect-src 'self'` を広げない）。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
