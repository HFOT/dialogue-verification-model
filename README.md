# DIALOGUE VERIFICATION MODEL

閉鎖的なオンライン会話で起こり得る構造を、**すべて架空のBOT会話**として観察する研究プロトタイプです。

> A research prototype for observing how information pathways, selective praise, and the handling of dissent shape a group's judgment environment. Every conversation, bot, document, and event in this project is synthetic. It does not diagnose or evaluate any real person, organization, or community.

---

## これは何ではないか

先に書いておきます。

**実在の人物、組織、コミュニティ、会話を診断・評価・告発するためのものではありません。**

登場するBOT名・会話・資料・イベント・URLはすべて架空です。実在の会話の引用、人物名、組織名、画像、スクリーンショットは一切使用していません。

単発の発言から意図を断定することもしません。観察するのは、次の4つが**反復して現れるか**だけです。

1. 根拠と反証が提示されるか
2. 発言者の資格ではなく内容が評価されるか
3. 異論を同じ場で比較できるか
4. 情報経路が複数あるか

## 何を見るものか

中心になる人がいないコミュニティは、どちらとも言えない**中間型**から始まることが多く、そこから経路が集約する側か、分散したままの側かに分かれていきます。

このモデルは、その**分岐がどこで起きるのか**を見るために作られています。3つのモードは並列の標本ではなく、**共通の前半を持つ分岐**です。

| モード | 内容 |
|---|---|
| 中間型 | 中心人物がいない場。異論の扱いと反応の偏りが決着しないまま混ざる |
| 圧力側 | 同じ前半から、情報経路が一人に集約した場合 |
| 非圧力側 | 同じ前半から、経路が複数のまま保たれた場合 |
| 検証モード | 3つの局面で、見る側が自分で応答を選ぶ |

分岐点になるのは「情報が散らばって大変なので、まとめ役を決めませんか」という**善意の提案**です。この提案自体に善悪はありません。分かれるのは提案の中身ではなく、その後に場がどう応答するかです。

非圧力側も「正解の場」としては描いていません。手間が増えること、確認の負担が残ることを本文に含めています。

## 自己点検 `/self`

別の入口として、**回答者自身が関わっている場**を同じ4基準で見る画面があります。

場面を8つ提示して `よくある / たまにある / ない / わからない` を選ぶだけです。`たまにある` では基準は振れません。`よくある` が揃って初めて振れます。単発では決まらない、という前提をそのまま回答形式にしています。

ここで診断するのは**場ではなく、回答者から今どう見えているか**です。結果はすべて「あなたには〜に見えています」と書かれます。同じ場でも、立場が違えば違う結果になります。

自由記述は受け取りません。組織名も個人名も入力させません。回答はブラウザの中だけで処理され、送信も保存もされません。

## 公開先

https://hfot.github.io/dialogue-verification-model/

## 起動

```bash
npm install
npm run dev
```

`http://localhost:3001/` で開きます。

## デプロイ（GitHub Pages）

vinext は `output: 'export'` に対応していないため、本番サーバーを立てて2ページをスナップショットし、`gh-pages` ブランチへ載せています。

```bash
npm run build:pages
npx vinext start --port 4599
```

別のシェルで以下を実行し、`_next` と2つの HTML を集めて `gh-pages` に push します。

```bash
curl -sf http://localhost:4599/dialogue-verification-model/ -o index.html
curl -sf http://localhost:4599/dialogue-verification-model/self -o self/index.html
```

`build:pages` は `PAGES_BASE_PATH` を付けてビルドします。通常の `npm run build` と `npm run dev` はルート配信のままで、影響を受けません。

スナップショットを取る前に、**古いサーバーが残っていないか必ず確認してください。** 残っていると旧ビルドの HTML を拾い、参照するチャンクのハッシュがずれて 404 になります。

## 参考文献

理論的な着眼点のためのものであり、実在の個人・組織への診断根拠ではありません。

1. Heycke et al. (2018), *The Expression and Transfer of Valence Associated with Social Conformity* — https://pmc.ncbi.nlm.nih.gov/articles/PMC6377616/
2. Curşeu et al. (2017), *Minority Dissent and Social Acceptance in Collaborative Learning Groups* — https://pmc.ncbi.nlm.nih.gov/articles/PMC5368259/
3. Heerdink et al. (2015), *Emotional reactions to deviance in groups* — https://pmc.ncbi.nlm.nih.gov/articles/PMC4466438/

## 構成

- `app/page.tsx` — 圧力側の会話データ、モード切替、自動送出、観察パネル
- `app/data/` — 共通前半・非圧力側・検証モード・自己点検の各データと判定
- `app/self/` — 自己点検の画面
- `HANDOFF.md` — 編集時の条件と実装メモ
- `docs/superpowers/specs/` — 設計判断の記録

編集する場合は `HANDOFF.md` の「編集時の重要条件」を先に読んでください。
