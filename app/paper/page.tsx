'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { censusPaths, censusSummary } from '../data/census';
import simulation from '../data/simulation.json';

type LeverRow = { levers: { keepSource: boolean; noFixedOwner: boolean; inviteReturn: boolean }; n: number; closedRate: number; openRate: number };
type ShockRow = { kind: 'none' | 'funding' | 'influence' | 'power'; n: number; closedRate: number; openRate: number; middleRate: number; meanRoundsToClose: number | null; rounds: number };
const leverBaseline = (simulation.leverSweep as LeverRow[]).find((r) => !r.levers.keepSource && !r.levers.noFixedOwner && !r.levers.inviteReturn)!;
const leverFull = (simulation.leverSweep as LeverRow[]).find((r) => r.levers.keepSource && r.levers.noFixedOwner && r.levers.inviteReturn)!;
import { CRITERIA, CRITERION_NAME, STATE_MARK, STATE_PLAIN } from '../data/criteria';
import { VERIFY_STAGES } from '../data/verify';
import type { Direction } from '../data/verify';

const DIR_MARK: Record<Direction, string> = { converge: '寄', distribute: '開', hold: '保' };
const DIR_NAME: Record<Direction, string> = { converge: '集約寄り', distribute: '分散寄り', hold: '保留' };
const OUTCOME_NAME = { open: '開放型', closed: '閉鎖型', ambiguous: '曖昧なまま' } as const;

const SHOCK_ROUNDS_LABEL = simulation.shockSweep[0].rounds;

export default function Paper() {
  const paths = useMemo(() => censusPaths(0), []);
  const summary = useMemo(() => censusSummary(paths), [paths]);

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Dialogue Verification Model navigation">
        <Link className="brand" href="/" aria-label="Dialogue Verification Model home">
          <span className="brand-mark" />
          DIALOGUE VERIFICATION MODEL
        </Link>
        <span className="nav-statement">Working paper</span>
        <Link className="nav-back" href="/">
          ← モデルに戻る
        </Link>
      </nav>

      <article className="paper">
        <header className="paper-head">
          <p className="eyebrow">Working paper · 仮説提示</p>
          <h1>分岐は提案ではなく、<br />その前の応答履歴で決まる</h1>
          <p className="paper-sub">中心人物のいない集団における閉鎖化の転換点に関する仮説</p>
          <p className="paper-meta">研究ノート ／ 2026-09-04 ／ 実証は本稿の全数列挙の範囲に限られる</p>
        </header>

        <section>
          <h2>要旨</h2>
          <p>
            中心人物のいない集団が、時間とともに情報経路の閉じた状態へ向かう現象は繰り返し報告されてきた。しかし、その転換がどの局面で起きるのかは特定されていない。
          </p>
          <p>
            本稿は次の仮説を提示する。<b>閉鎖化の転換点は「情報を集約しよう」という提案そのものではなく、その提案が出るまでに蓄積された、確認要求への応答履歴によって決まる。</b>
            同一の集約提案であっても、それ以前に確認要求が場に回収された経験が反復していれば併記型の運用に落ち、回収されず流された経験が反復していれば経路の一本化に落ちる。
          </p>
          <p>
            検討のため、完全に架空の合成会話モデルを構築し、共通の前半から二つの後半へ分岐する構造として実装した。実在の集団を対象とした実証は行っていない。
          </p>
        </section>

        <section>
          <h2>1. 背景 — なぜ同じことが繰り返されるのか</h2>
          <p>
            集団が少数への集中へ向かう傾向は古くから指摘されてきた。Michels（1911）は、組織が規模を増すほど実務を担う少数へ決定が集まると論じた。重要なのは、原因を成員の悪意ではなく<b>運営の効率</b>に求めたことである。Olson（1965）は、集団が大きいほど各人の関与が薄まり、熱心な少数が実質的な決定権を持つことを示した。Freeman（1972）は、明示的な構造を持たない集団でこそ非公式な影響力が見えない形で固定されると指摘した。
          </p>
          <p>
            これらの知見は広く共有されている。にもかかわらず、同じ形の推移は繰り返される。知識の不足では説明がつかない。
          </p>
          <p>
            本稿の出発点はここにある。繰り返しの原因は、<b>その場にいる一人ひとりにとって、各時点の応答が自然で、親切で、合理的に見えること</b>にあるのではないか。
          </p>
          <blockquote>
            「情報が散らばって大変だから、まとめ役を決めよう」——この提案に反対する理由は、提案された瞬間にはどこにもない。負担は実際に存在し、提案者に他意はなく、多くの成員が助かる。局所的にはすべて正しい。それでも、この提案が経路の一本化の起点になることがある。
          </blockquote>
        </section>

        <section>
          <h2>2. 先行研究の位置づけ</h2>
          <p>
            <b>構造の傾向</b>：Michels（1911）、Olson（1965）、Freeman（1972）は集中への傾きを論じ、Ostrom（1990）は条件が整えば自治が長期に持続することを多数の事例で示した。後者は前者への反証として重要である。集中は必然ではない。
          </p>
          <p>
            <b>個人の応答</b>：Noelle-Neumann（1974）は、少数派だと感じた者が発言を控え、その結果として多数派がさらに大きく見える循環を記述した。Heycke et al.（2018）は多数への一致が選好そのものに影響し得ることを扱い、Heerdink et al.（2015）は逸脱者への感情的反応を検討した。Curşeu et al.（2017）は、少数意見と受容的な風土が集団の情報処理を支える可能性を示した。
          </p>
          <p>
            <b>離脱と発言</b>：Hirschman（1970）は、不満を持った成員の行動が「発言」と「離脱」に分かれる構造を分析した。分散型組織の文脈では、Buterin（2021）が保有量に基づく投票は保有の偏りをそのまま決定権の偏りに変えると論じている。
          </p>
          <p>これらはいずれも<b>傾向</b>あるいは<b>個人の反応</b>を扱っている。本稿が問うのは、その中間にある<b>転換の局面</b>である。</p>
        </section>

        <section>
          <h2>3. 仮説</h2>
          <div className="hypo">
            <p className="hypo-tag">主仮説 H1</p>
            <p>
              中心人物のいない集団において、情報の散在に対する集約提案は、それ自体では閉鎖化を決定しない。閉鎖化するか否かは、<b>その提案が出るまでに、確認要求が同じ場で扱われた経験が反復しているか</b>に依存する。
            </p>
          </div>
          <div className="hypo">
            <p className="hypo-tag">補助仮説 H2</p>
            <p>単発の応答は転換を起こさない。同一方向の応答が反復した時にのみ、場の運用が固定される。</p>
          </div>
          <p>H1 が正しければ、注目すべき局面は移る。</p>
          <ul>
            <li>転換点の観測単位は「提案の内容」ではなく「提案前の応答履歴」である</li>
            <li>集約提案を抑制しても閉鎖化は防げない。負担は実在するため、提案は繰り返し出てくる</li>
            <li>介入すべきは提案の時点ではなく、<b>それ以前の、確認要求が宙に浮いた時点</b>である</li>
          </ul>
        </section>

        <section>
          <h2>4. 方法 — 合成会話モデル</h2>
          <p>
            仮説を検討可能な形にするため、架空の会話モデルを構築した。実在の会話・人物・組織は一切用いていない。したがってこのモデルは、いかなる実在の集団についての証拠にもならない。
          </p>
          <p>
            共通前半（11 発言）と二つの後半を持つ分岐構造とした。共通前半には中心人物も悪意を持つ話者も置いていない。ここで次の二つが決着しないまま散発的に混ざる。
          </p>
          <ul>
            <li><b>A：確認要求の宙吊り</b> — 根拠を尋ねる発言が、否定されるのではなく、受け止める者がいないまま流れる</li>
            <li><b>C：反応の非対称</b> — まとめには反応が集まり、検証可能な比較材料には集まらない。誰も問題として扱わない</li>
          </ul>
          <p>
            疲労の表明を経て、共通前半は集約提案で終わる。ここが分岐点である。後半は、まとめ役への経路集約に落ちる系列と、まとめと元資料の併記に落ちる系列の二種類を用意した。両者は<b>同一の提案から始まる</b>。
          </p>
          <p>観察指標として四つの基準を置いた。基準への文献の割り当ては本稿の解釈である。</p>
          <div className="paper-table-wrap">
            <table className="paper-table">
              <thead>
                <tr><th>基準</th><th>内容</th><th>主な依拠</th></tr>
              </thead>
              <tbody>
                <tr><td>もとの資料</td><td>主張のもとになった資料と、それに合わない材料が出るか</td><td>Curşeu et al. (2017), Ostrom (1990)</td></tr>
                <tr><td>中身の扱い</td><td>誰が言ったかではなく中身で扱われるか</td><td>Heycke et al. (2018), Heerdink et al. (2015)</td></tr>
                <tr><td>反対意見の扱い</td><td>反対意見が同じ場に残るか</td><td>Noelle-Neumann (1974), Hirschman (1970)</td></tr>
                <tr><td>情報の入り口</td><td>確かめる道が複数あるか</td><td>Freeman (1972), Hirschman (1970)</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            各基準は三状態（{STATE_PLAIN.unmet} ／ {STATE_PLAIN.partial} ／ {STATE_PLAIN.met}）を取る。<b>単発の寄与では確定させない。</b>
            同一方向の働きかけが反復した時にのみ確定状態へ移行する実装とした。これは H2 を実装に埋め込んだものである。
          </p>
        </section>

        <section>
          <h2>5. 実証 — 全経路の網羅列挙</h2>
          <p>
            実在の集団を対象とした検証は行っていない。代わりに、<b>モデル自身の挙動を全数列挙</b>した。検証モードは
            {VERIFY_STAGES.length} 局面 × 各 {VERIFY_STAGES[0].options.length} 択であり、経路は全部で {summary.total} 通りである。標本ではなく全数なので、推定も誤差もない。
          </p>
          <p>
            以下の数値は、このページを開いた時にシミュレータ本体と同じデータ・同じ判定コードで計算している。実装を変えれば数値も変わる。文章と実装がずれない状態を保つための措置である。
          </p>

          <div className="census-cards">
            <div className="census-card"><b>{summary.total}</b><span>全経路</span></div>
            <div className="census-card is-open"><b>{summary.open}</b><span>開放型に着地</span></div>
            <div className="census-card is-closed"><b>{summary.closed}</b><span>閉鎖型に着地</span></div>
            <div className="census-card"><b>{summary.ambiguous}</b><span>曖昧なまま</span></div>
          </div>

          <div className="census-cards">
            <div className="census-card is-open"><b>{summary.improved}</b><span>基準が開いた経路</span></div>
            <div className="census-card is-closed"><b>{summary.degraded}</b><span>基準が閉じた経路</span></div>
            <div className="census-card"><b>{summary.unchanged}</b><span>どの基準も確定しなかった経路</span></div>
            <div className="census-card"><b>{summary.repeated}</b><span>同一方向を2回以上選んだ経路</span></div>
          </div>

          <p>
            確定に至った経路は {summary.improved + summary.degraded} 通りで、いずれも同一方向の選択が反復した経路である。
            反復のない経路 {summary.total - summary.repeated} 通りでは、どの基準も確定しなかった。<b>これは H2 が実装の水準で成立していることを示す</b>。ただし、実装が仮説通りに書かれている以上、これは仮説の裏づけではなく、実装が仮説を正しく表現していることの確認にすぎない。
          </p>
          <p className="paper-note">
            <b>なぜこうなるか。</b> 判定コード（<code>criteria.ts</code> の <code>criteriaStateOf</code>）は、確定状態（開いている／閉じ気味）を一度でも記録した基準を、その後の「どちらとも」で上書きしない規則になっている。逆に言えば、確定に達するには同一方向の寄与が複数回積み重なる必要がある。3局面という短い列では、2回連続で同方向を選んだ経路だけが確定に届き、1回だけの経路や方向が割れた経路は「どちらとも」のまま終わる。この閾値は著者が置いた実装上の規則であり、現実の会話で何回の反復が必要かを測定したものではない。
          </p>

          <div className="paper-table-wrap">
            <table className="paper-table census-table">
              <thead>
                <tr>
                  <th>局面1</th><th>局面2</th><th>局面3</th>
                  <th>着地</th>
                  {CRITERIA.map((criterion) => <th key={criterion.id}>{CRITERION_NAME[criterion.id]}</th>)}
                </tr>
              </thead>
              <tbody>
                {paths.map((path) => (
                  <tr key={path.choices.join('-')} className={`row-${path.outcome}`}>
                    {path.directions.map((direction, index) => (
                      <td key={index} title={DIR_NAME[direction]}>{DIR_MARK[direction]}</td>
                    ))}
                    <td className="cell-outcome">{OUTCOME_NAME[path.outcome]}</td>
                    {CRITERIA.map((criterion) => (
                      <td key={criterion.id} className={`cell-state ${path.states[criterion.id]}`}>
                        {STATE_MARK[path.states[criterion.id]]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="paper-note">
            寄 = 集約寄りの応答 ／ 開 = 分散寄りの応答 ／ 保 = 保留。状態は {STATE_MARK.unmet} 閉じ気味 ／ {STATE_MARK.partial} どちらとも ／ {STATE_MARK.met} 開いている。
          </p>
        </section>

        <section>
          <h2>6. エージェント・シミュレーション — 実際に計算した結果</h2>
          <p>
            第5節は検証モードという狭い設計の全数列挙だった。ここでは範囲を広げ、参加・離脱・キーワードへの反応・新規参加者の違和感を持つ<b>合成コミュニティを {simulation.parameters.rounds} ラウンド × {simulation.total.toLocaleString()} 回</b>、実際にシミュレーションした。乱数の種は固定してあり、同じスクリプト（<code>scripts/simulate.mjs</code>）を実行すれば誰でも同じ数値を再現できる。
          </p>
          <p className="paper-note">
            重要な限定を先に書く。これは<b>実在のコミュニティのデータではない</b>。エージェントの振る舞いは著者が置いたパラメータ（発言傾向の分布、確認要求が起きる確率、集約提案が経路と開放度に与える効果量など）に従うだけで、実在の集団を観測して推定したものではない。示せるのは「この機構をこう書くと、この分布が出る」という<b>機構内の一貫性</b>であり、「現実がこうである」という主張ではない。パラメータは <code>scripts/simulate.mjs</code> に全て明示してある。
          </p>

          <h3 className="paper-h3">6.1 集約提案の有無</h3>
          <p>
            集約提案が場に出るかどうかを半数ずつに割り付けた。提案が出た側は着地が閉鎖型 {(simulation.byProposal.with.closed / simulation.byProposal.with.n * 100).toFixed(1)}%、出なかった側は {(simulation.byProposal.without.closed / simulation.byProposal.without.n * 100).toFixed(1)}% だった。提案の有無だけでも差は生まれる。ただしこれは H1 への反証にはならない。提案が出た回では、応答履歴が悪い場ほど提案そのものが出やすい設計にはしていないため、この差は主に提案が経路集約を後押しする効果量（パラメータ）を反映している。H1 が問うのはその先——同じ提案が出た場合に、直前の応答履歴でどれだけ結果が変わるかである。
          </p>

          <h3 className="paper-h3">6.2 提案の直前2回、確認要求が受け止められていたか</h3>
          <p>
            集約提案が実際に出た経路だけを取り出し、<b>提案の直前における確認要求の受け止め率</b>で5つの区間に分けた。同一の提案でも、その直前の応答履歴によって着地がどれだけ変わるかを見る。
          </p>
          <div className="paper-table-wrap">
            <table className="paper-table">
              <thead>
                <tr><th>直前の受け止め率</th><th>件数</th><th>閉鎖型に着地</th><th>曖昧なまま</th></tr>
              </thead>
              <tbody>
                {simulation.byPreRecovery.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.n.toLocaleString()}</td>
                    <td className={row.closedRate > 0.5 ? 'cell-state unmet' : 'cell-state met'}>{(row.closedRate * 100).toFixed(1)}%</td>
                    <td>{(row.middleRate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            受け止め率が0〜40%の区間では閉鎖型への着地が {(simulation.byPreRecovery[0].closedRate * 100).toFixed(0)}〜{(simulation.byPreRecovery[1].closedRate * 100).toFixed(0)}% だったのに対し、60〜80%の区間では {(simulation.byPreRecovery[3].closedRate * 100).toFixed(0)}% まで下がった。<b>提案の文面は全区間で同一である。</b>差を生んでいるのは提案そのものではなく、それ以前の応答履歴である。これは、このシミュレーションのパラメータの上で H1 が予測する形と一致する。80〜100%の区間でわずかに閉鎖型が増える({(simulation.byPreRecovery[4].closedRate * 100).toFixed(0)}%)のは、この区間の母数に他の要因（離脱・参加の偶発的な集中）が混ざっているためと考えられ、単一の走査では原因を切り分けられていない。
          </p>
          <p className="paper-note">
            <b>なぜこうなるか。</b> このシミュレーションでは、集約提案が適用する開放度・集中度の増減幅（<code>P.proposal.toBoth</code> と <code>P.proposal.toSingle</code>）を、提案の<b>直前2回の受け止め</b>で切り替える設計にしてある（<code>recovered = recentAnswers.length===2 && recentAnswers.every(Boolean)</code>）。受け止め率が高い経路ほど、この分岐で「併記型」寄りの効果（集中度を下げ開放度を上げる）が選ばれやすくなり、低い経路ほど「集約型」寄りの効果が選ばれやすくなる。数値の傾きは、この一行の条件分岐がラウンドを重ねて積分された結果である。80〜100%区間の逆転は、この区間に集まった経路のうち、途中で成員の離脱・加入がたまたま偏った少数の経路が平均を押し上げているためであり、受け止め率という単一変数だけでは説明しきれないことをそのまま表している。
          </p>

          <h3 className="paper-h3">6.3 新規参加者の違和感</h3>
          <p>
            経路が集約した場（集中度が高い状態）に新しく人が加わった時の定着率は {(simulation.newcomer.retentionHighConcentration * 100).toFixed(1)}%、経路が分散したままの場では {(simulation.newcomer.retentionLowConcentration * 100).toFixed(1)}% だった。集約した場では、確かめたい傾向の強い新規参加者ほど違和感を持って離れる、という規則をパラメータに入れており、その規則がそのまま定着率の差として表れている。これも機構の一貫性の確認であって、現実の参加者がそう感じることの証明ではない。
          </p>
          <p className="paper-note">
            <b>なぜこうなるか。</b> 定着率の差は単一の規則（<code>uneasy = concentration &gt; 0.6 &amp;&amp; newcomer.voice &gt; 0.5</code>）から直接生まれている。集中度が閾値を超えた場に、発言傾向の高い新規参加者が来ると、一定確率で離脱としてカウントされる。この規則を書かなければ差は出ない。したがって 6.3 の数値は「新規参加者が違和感を持つことの発見」ではなく、「そういう規則を置けば、その通りの分布が出る」という同語反復である。現実にそうなるかどうかは、この節では何も語っていない。
          </p>

          

        <h3 className="paper-h3">6.4 この節の位置づけ</h3>
          <p>
            この節が示すのは「その場にいないと分からない話」ではなく、<b>明示されたルールから計算される分布</b>である。誰でも <code>scripts/simulate.mjs</code> を読んでパラメータを検討し、値を変えて再計算し、この結果に異議を唱えられる。これは実証ではなく、<b>反証可能な形にした仮説の一つの表現</b>である。実在のコミュニティを対象とした検証は第9節に別途構想を記す。
          </p>
        </section>

        <section className="lever-inline">
          <h3 className="paper-h3">6.5 どの言い回しの要素が効くか — レバー掃引</h3>
          <p>
            集約提案に足す言い回しの要素を3つに分け（元の資料も残す／固定の担当者を置かない／保留にした話を戻す）、組み合わせ8通りをそれぞれ4,000回走らせた。<b>効果量はここでも著者が定義したものである。</b>
            現実の言葉がこの通りに効く証拠ではなく、「この機構でこの要素を強めると、この方向へ動く」という設計仮説の表現として読んでほしい。
          </p>
          <div className="paper-table-wrap">
            <table className="paper-table">
              <thead>
                <tr><th>元の資料</th><th>固定担当なし</th><th>保留を戻す</th><th>閉鎖型</th><th>開放型</th></tr>
              </thead>
              <tbody>
                {simulation.leverSweep.map((row, i) => (
                  <tr key={i}>
                    <td>{row.levers.keepSource ? '○' : '—'}</td>
                    <td>{row.levers.noFixedOwner ? '○' : '—'}</td>
                    <td>{row.levers.inviteReturn ? '○' : '—'}</td>
                    <td className={row.closedRate > 0.5 ? 'cell-state unmet' : 'cell-state met'}>{(row.closedRate * 100).toFixed(1)}%</td>
                    <td className={row.openRate > 0.5 ? 'cell-state met' : ''}>{(row.openRate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            要素を一つも足さない基準条件では {(leverBaseline.closedRate * 100).toFixed(1)}% が閉鎖型に着地したのに対し、三つとも足すと {(leverFull.openRate * 100).toFixed(1)}% が開放型に着地した。単体では「保留を戻す」の効果が最も大きいが、要素を組み合わせるほど効果は積み上がる。
          </p>
          <p className="paper-note">
            <b>なぜ組み合わせで効果が積み上がるか。</b> 各レバーは集中度と開放度の両方に、それぞれ独立した増減を与える設計にしてある。「保留を戻す」は受け止め率を直接押し上げ、「固定担当なし」と「元の資料」は集約提案が適用する集中度の増分を打ち消し開放度の増分を足す。3つを同時に足すと、集中度の上昇はほぼ相殺され、開放度だけが40ラウンド分積み上がるため、着地の判定線（集中度0.45未満 かつ 開放度0.55超）を大きく超える。逆に1つも足さないと、集約提案は毎回集中度を押し上げるだけの効果しか持たず、40ラウンドの反復でほぼ確実に閉鎖側の判定線を超える。この「ほぼ確実に」という言葉自体が、単発では決まらず反復で決まるという H2 の主張を、数値の形で言い換えたものである。
          </p>
          <p className="paper-note">
            この3要素は架空の会話データ（<code>app/data/open-run.ts</code>）に実在の文として既に書かれている。「まとめは助かります。ただ、まとめだけになると後から確かめられないので、元の資料へのリンクも一緒に置きませんか」（元の資料）、「まとめ役は固定しないで持ち回りにしませんか」（固定担当なし）、「さっき保留になった話、ここで戻していいですか」（保留を戻す）。ここでの掃引は、後づけの理屈ではなく、会話データを書いた時点の設計判断を数値で裏返して確かめたものである。
          </p>
        </section>


        <section className="lever-inline">
          <h3 className="paper-h3">6.6 何が構造を歪めるか — 外部要因の注入</h3>
          <p>
            6.1〜6.5 は「場の内側だけで進む」動きを見ていた。ここでは、外側から特定の種類の要因が割り込んだ時、通常の場がどれだけ・どれくらいの速さで歪むかを見る。<b>資金</b>（特定の提案や話者に予算がつき議題が一気に寄る）、<b>影響力</b>（特定の声が以後の答えを継続的に塗り替える）、<b>権力</b>（正式な決定権が一人に付与される）の三種を想定し、注入しない場合と比較した。各条件 {(simulation.shockSweep as ShockRow[])[0].n.toLocaleString()} 回、{simulation.shockSweep[0].rounds} ラウンドで走らせた。
          </p>
          <div className="paper-table-wrap">
            <table className="paper-table">
              <thead>
                <tr><th>注入</th><th>閉鎖型に着地</th><th>開放型に着地</th><th>閉じるまでの平均ラウンド</th></tr>
              </thead>
              <tbody>
                {(simulation.shockSweep as ShockRow[]).map((row) => (
                  <tr key={row.kind}>
                    <td>{{ none: '注入なし（基準）', funding: '資金', influence: '影響力', power: '権力' }[row.kind]}</td>
                    <td className={row.closedRate > 0.3 ? 'cell-state unmet' : 'cell-state met'}>{(row.closedRate * 100).toFixed(1)}%</td>
                    <td>{(row.openRate * 100).toFixed(1)}%</td>
                    <td>{row.meanRoundsToClose === null ? '—' : `${row.meanRoundsToClose.toFixed(1)} / ${row.rounds}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            注入がない基準条件では、{SHOCK_ROUNDS_LABEL} ラウンドのうちに閉鎖型へ着地したのは {(simulation.shockSweep[0].closedRate * 100).toFixed(1)}% にとどまった。三種のいずれかを注入すると、この率は {(simulation.shockSweep[2].closedRate * 100).toFixed(1)}〜{(simulation.shockSweep[3].closedRate * 100).toFixed(1)}% まで跳ね上がる。閉じた経路に限っても、注入がある条件では基準条件よりずっと早く（平均で半分以下のラウンド数で）判定線を超えている。
          </p>
          <p className="paper-note">
            <b>なぜこうなるか。</b> 「権力」は集中度に一度で大きな跳躍（+0.5）を与え、開放度も同時に落とす（−0.25）ため、注入の瞬間に判定線への距離が一気に縮まる。「資金」も同じ形の一回限りの跳躍（+0.35 / −0.15）だが幅が小さい分、届くまでにやや時間がかかる。「影響力」は一回では跳躍させず、代わりに<b>それ以降すべてのラウンドの確認要求の受け止め率を半分にする</b>という持続的な効果にしてある。一回の衝撃としては最も弱いが、反復にわたって効き続けるため、時間をかけて基準条件から大きく離れていく。三者は「大きな一撃」と「小さな一撃」と「弱いが終わらない圧力」という異なる形の歪みとして実装しており、これは現実の資金・影響力・権力の作用の仕方についての著者の仮定であって、測定ではない。
          </p>
        </section>

        <section>
          <h2>7. 予測と反証条件</h2>
          <p>H1 が正しければ、実在の集団において次が観察されるはずである。</p>
          <ul>
            <li><b>P1</b> 集約提案の文面を統制しても、その前の応答履歴が異なれば、以後の経路構造は異なる</li>
            <li><b>P2</b> 応答履歴が同一であれば、集約提案の有無にかかわらず、経路構造は同方向へ推移する</li>
            <li><b>P3</b> 単発の確認要求は、その後の構造に有意な差をもたらさない</li>
          </ul>
          <p>次のいずれかが観察されれば H1 は棄却される。</p>
          <ul>
            <li>応答履歴を統制した上で、提案の文面だけで以後の経路構造が分岐する</li>
            <li>単発の確認要求が、反復した場合と同等の効果を持つ（H2 の棄却）</li>
            <li>応答履歴と経路構造の間に関連が見られない</li>
          </ul>
        </section>

        <section>
          <h2>8. 限界</h2>
          <ol>
            <li><b>実在の集団では実証していない。</b> 第5節の全数列挙はモデルの挙動の確認であり、仮説の裏づけではない</li>
            <li><b>合成会話は証拠ではない。</b> 設計者が仮説通りに書いたのだから、仮説通りに動くのは当然である</li>
            <li><b>文献と基準の対応は解釈である。</b> 挙げた文献はいずれも本モデルを検証していない。権威づけに用いてはならない</li>
            <li><b>観測者効果を扱えていない。</b> 参加型の検証では、選択者が観察されていることを知っている</li>
            <li><b>経路の重みが等価という仮定を置いている。</b> 現実には局面ごとに影響力が異なる可能性が高い</li>
          </ol>
        </section>

        <section>
          <h2>9. 今後の検証</h2>
          <ul>
            <li><b>公開ログの利用</b> — 公開されている議事録・フォーラム記録を対象に、確認要求とその応答を分類する。個人は同定せず、発話の構造のみを符号化する</li>
            <li><b>事前登録</b> — 分類基準とコーディング規則を先に公開し、後付けの解釈を防ぐ</li>
            <li><b>コーダー間信頼性の測定</b> — 「確認要求が回収されたか」の判定が観察者間で一致するかを確かめる。一致しなければ、仮説以前に指標が成立していない</li>
            <li><b>時系列の扱い</b> — 応答履歴は累積量である。単発の断面では検証できない</li>
          </ul>
          <p>
            倫理的制約として、実在の集団を「閉鎖型」と分類して公表する形式は取らない。分類が対象への評価として流通した時点で、この研究は自らが批判した構造——結論だけが渡り、根拠を確かめられない状態——を再生産する。
          </p>
        </section>

        <section>
          <h2>10. 結論</h2>
          <blockquote>分岐は、集約提案そのものではなく、その提案に至るまでの応答履歴によって決まる。</blockquote>
          <p>
            この仮説が正しければ、注目すべき局面は変わる。誰かが権限を求めた瞬間ではなく、誰かの確認要求が宙に浮いたまま流れた、その静かな瞬間である。そこでは誰も悪意を持っていない。だからこそ、記録が残っていても繰り返される。
          </p>
          <p>
            仮説はまだ検証されていない。反証条件は第7節に記した。実装、会話データ、判定コード、設計記録はすべて公開している。同じ手順で作り直すことも、誤りを指摘することもできる。
          </p>
          <p>自分の主張にも、自分が掲げた基準を当てる。それがこの研究の最低条件である。</p>
        </section>

        <section>
          <h2>参考文献</h2>
          <p className="paper-note">書誌情報は執筆時点の記載である。引用にあたっては原典を確認されたい。</p>
          <ul className="refs">
            <li>Buterin, V. (2021). <i>Moving beyond coin voting governance</i>. エッセイ</li>
            <li>Curşeu, P. L., et al. (2017). Minority Dissent and Social Acceptance in Collaborative Learning Groups. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5368259/" target="_blank" rel="noreferrer">PMC5368259</a></li>
            <li>Freeman, J. (1972). <i>The Tyranny of Structurelessness</i>. <a href="https://www.jofreeman.com/joreen/tyranny.htm" target="_blank" rel="noreferrer">jofreeman.com</a></li>
            <li>Heerdink, M. W., et al. (2015). Emotional reactions to deviance in groups. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4466438/" target="_blank" rel="noreferrer">PMC4466438</a></li>
            <li>Heycke, T., et al. (2018). The Expression and Transfer of Valence Associated with Social Conformity. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6377616/" target="_blank" rel="noreferrer">PMC6377616</a></li>
            <li>Hirschman, A. O. (1970). <i>Exit, Voice, and Loyalty</i>. 書籍</li>
            <li>Michels, R. (1911). <i>Zur Soziologie des Parteiwesens in der modernen Demokratie</i>（寡頭制の鉄則）. 書籍</li>
            <li>Noelle-Neumann, E. (1974). The Spiral of Silence. <i>Journal of Communication</i></li>
            <li>Olson, M. (1965). <i>The Logic of Collective Action</i>. 書籍</li>
            <li>Ostrom, E. (1990). <i>Governing the Commons</i>. 書籍</li>
          </ul>
        </section>

        <footer className="paper-foot">
          <p>
            登場する会話・人物・資料・イベントはすべて架空である。実在の人物、組織、コミュニティ、会話を診断・評価・告発するものではない。
          </p>
          <p>
            実装と設計記録：<a href="https://github.com/HFOT/dialogue-verification-model" target="_blank" rel="noreferrer">github.com/HFOT/dialogue-verification-model</a>
          </p>
          <Link className="paper-back" href="/">← モデルを動かす</Link>
        </footer>
      </article>
    </main>
  );
}
