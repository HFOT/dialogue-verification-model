'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { censusPaths, censusSummary } from '../data/census';
import simulation from '../data/simulation.json';
import { criteriaList, criterionName, STATE_MARK, statePlain } from '../data/criteria';
import { verifyStages } from '../data/verify';
import type { Direction } from '../data/verify';
import { pick, useLang } from '../i18n/lang';
import type { Lang } from '../i18n/lang';

type LeverRow = { levers: { keepSource: boolean; noFixedOwner: boolean; inviteReturn: boolean }; n: number; closedRate: number; openRate: number };
type ShockRow = { kind: 'none' | 'funding' | 'influence' | 'power'; n: number; closedRate: number; openRate: number; middleRate: number; meanRoundsToClose: number | null; rounds: number };
const leverBaseline = (simulation.leverSweep as LeverRow[]).find((r) => !r.levers.keepSource && !r.levers.noFixedOwner && !r.levers.inviteReturn)!;
const leverFull = (simulation.leverSweep as LeverRow[]).find((r) => r.levers.keepSource && r.levers.noFixedOwner && r.levers.inviteReturn)!;

const SHOCK_ROUNDS_LABEL = simulation.shockSweep[0].rounds;

function dirMark(lang: Lang): Record<Direction, string> {
  return lang === 'en' ? { converge: 'Cv', distribute: 'Op', hold: 'Hd' } : { converge: '寄', distribute: '開', hold: '保' };
}
function dirName(lang: Lang): Record<Direction, string> {
  return lang === 'en' ? { converge: 'Converging', distribute: 'Distributing', hold: 'Holding' } : { converge: '集約寄り', distribute: '分散寄り', hold: '保留' };
}
function outcomeName(lang: Lang) {
  return lang === 'en'
    ? ({ open: 'Open', closed: 'Closed', ambiguous: 'Ambiguous' } as const)
    : ({ open: '開放型', closed: '閉鎖型', ambiguous: '曖昧なまま' } as const);
}
function shockKindName(lang: Lang): Record<ShockRow['kind'], string> {
  return lang === 'en'
    ? { none: 'No injection (baseline)', funding: 'Funding', influence: 'Influence', power: 'Power' }
    : { none: '注入なし（基準）', funding: '資金', influence: '影響力', power: '権力' };
}

export default function Paper() {
  const [lang, setLang] = useLang();
  const t = (ja: string, en: string) => pick(lang, ja, en);
  const paths = useMemo(() => censusPaths(0), []);
  const summary = useMemo(() => censusSummary(paths), [paths]);
  const CRITERIA = useMemo(() => criteriaList(lang), [lang]);
  const CRITERION_NAME = useMemo(() => criterionName(lang), [lang]);
  const STATE_PLAIN = useMemo(() => statePlain(lang), [lang]);
  const VERIFY_STAGES = useMemo(() => verifyStages(lang), [lang]);
  const DIR_MARK = useMemo(() => dirMark(lang), [lang]);
  const DIR_NAME = useMemo(() => dirName(lang), [lang]);
  const OUTCOME_NAME = useMemo(() => outcomeName(lang), [lang]);
  const SHOCK_NAME = useMemo(() => shockKindName(lang), [lang]);

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Dialogue Verification Model navigation">
        <Link className="brand" href="/" aria-label="Dialogue Verification Model home">
          <span className="brand-mark" />
          DIALOGUE VERIFICATION MODEL
        </Link>
        <span className="nav-statement">Working paper</span>
        <div className="nav-right">
          <button className="lang-toggle" type="button" onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')} aria-label="Switch language">
            {lang === 'ja' ? 'EN' : '日本語'}
          </button>
          <Link className="nav-back" href="/">
            {t('← モデルに戻る', '← Back to the model')}
          </Link>
        </div>
      </nav>

      <article className="paper">
        <header className="paper-head">
          <p className="eyebrow">{t('Working paper · 仮説提示', 'Working paper · a hypothesis')}</p>
          <h1>{lang === 'en' ? <>The branch is decided not by the proposal,<br />but by the response history before it</> : <>分岐は提案ではなく、<br />その前の応答履歴で決まる</>}</h1>
          <p className="paper-sub">{t('中心人物のいない集団における閉鎖化の転換点に関する仮説', 'A hypothesis about the tipping point toward closure in groups with no central figure')}</p>
          <p className="paper-meta">{t('研究ノート ／ 2026-09-04 ／ 実証は本稿の全数列挙の範囲に限られる', 'Research note / 2026-09-04 / the evidence here is limited to the exhaustive enumeration in this document')}</p>
        </header>

        <section>
          <h2>{t('要旨', 'Abstract')}</h2>
          <p>
            {t(
              '中心人物のいない集団が、時間とともに情報経路の閉じた状態へ向かう現象は繰り返し報告されてきた。しかし、その転換がどの局面で起きるのかは特定されていない。',
              'It has repeatedly been reported that groups with no central figure drift, over time, toward a closed information channel. Yet exactly which moment that transition occurs at has not been pinned down.',
            )}
          </p>
          <p>
            {t('本稿は次の仮説を提示する。', 'This paper proposes the following hypothesis.')} <b>{t('閉鎖化の転換点は「情報を集約しよう」という提案そのものではなく、その提案が出るまでに蓄積された、確認要求への応答履歴によって決まる。', 'The tipping point toward closure is decided not by the proposal to consolidate information itself, but by the history of responses to requests for confirmation accumulated before that proposal ever appears.')}</b>{' '}
            {t(
              '同一の集約提案であっても、それ以前に確認要求が場に回収された経験が反復していれば併記型の運用に落ち、回収されず流された経験が反復していれば経路の一本化に落ちる。',
              'Even the identical consolidation proposal settles into a side-by-side arrangement if the room has a repeated history of confirmation requests being taken up, and settles into a single narrowed channel if that history is one of requests drifting by unreceived.',
            )}
          </p>
          <p>
            {t(
              '検討のため、完全に架空の合成会話モデルを構築し、共通の前半から二つの後半へ分岐する構造として実装した。実在の集団を対象とした実証は行っていない。',
              'To examine this, a fully fictional synthetic-conversation model was built, implemented as a branching structure diverging from a shared first half into two second halves. No verification was performed on any real group.',
            )}
          </p>
        </section>

        <section>
          <h2>{t('1. 背景 — なぜ同じことが繰り返されるのか', '1. Background — why does the same thing keep happening?')}</h2>
          <p>
            {t(
              '集団が少数への集中へ向かう傾向は古くから指摘されてきた。Michels（1911）は、組織が規模を増すほど実務を担う少数へ決定が集まると論じた。重要なのは、原因を成員の悪意ではなく',
              "The tendency of groups to drift toward concentration in a few hands has long been noted. Michels (1911) argued that as an organization grows, decisions concentrate among the small number handling operations. What matters is that he located the cause not in members' ill will but in ",
            )}
            <b>{t('運営の効率', 'operational efficiency')}</b>
            {t(
              'に求めたことである。Olson（1965）は、集団が大きいほど各人の関与が薄まり、熱心な少数が実質的な決定権を持つことを示した。Freeman（1972）は、明示的な構造を持たない集団でこそ非公式な影響力が見えない形で固定されると指摘した。',
              '. Olson (1965) showed that the larger a group, the thinner each individual\'s stake becomes, letting a committed few end up holding real decision-making power. Freeman (1972) pointed out that it is precisely groups without explicit structure where informal influence sets in invisibly.',
            )}
          </p>
          <p>
            {t(
              'これらの知見は広く共有されている。にもかかわらず、同じ形の推移は繰り返される。知識の不足では説明がつかない。',
              'These findings are widely known. And yet the same shape of drift keeps recurring. A lack of knowledge does not explain it.',
            )}
          </p>
          <p>
            {t('本稿の出発点はここにある。繰り返しの原因は、', 'This is where this paper starts. Perhaps the reason it repeats is that, to ')}
            <b>{t('その場にいる一人ひとりにとって、各時点の応答が自然で、親切で、合理的に見えること', 'each person in the room, each response, at each moment, looks natural, kind, and reasonable')}</b>
            {t('にあるのではないか。', '.')}
          </p>
          <blockquote>
            {t(
              '「情報が散らばって大変だから、まとめ役を決めよう」——この提案に反対する理由は、提案された瞬間にはどこにもない。負担は実際に存在し、提案者に他意はなく、多くの成員が助かる。局所的にはすべて正しい。それでも、この提案が経路の一本化の起点になることがある。',
              '"It\'s a lot of work with information scattered everywhere — let\'s designate someone to organize it." There is no reason to object to this proposal in the moment it is made. The burden is real, the proposer has no ulterior motive, and it helps most members. Locally, everything about it is correct. And yet this proposal can still be the point where the channel narrows to one.',
            )}
          </blockquote>
        </section>

        <section>
          <h2>{t('2. 先行研究の位置づけ', '2. Where this sits relative to prior work')}</h2>
          <p>
            <b>{t('構造の傾向', 'Structural tendency')}</b>{t('：Michels（1911）、Olson（1965）、Freeman（1972）は集中への傾きを論じ、Ostrom（1990）は条件が整えば自治が長期に持続することを多数の事例で示した。後者は前者への反証として重要である。集中は必然ではない。', ': Michels (1911), Olson (1965), and Freeman (1972) argue for a tilt toward concentration, while Ostrom (1990) showed across many cases that self-governance can persist for a long time when conditions are right. The latter matters as a counterexample to the former — concentration is not inevitable.')}
          </p>
          <p>
            <b>{t('個人の応答', "Individual response")}</b>{t('：Noelle-Neumann（1974）は、少数派だと感じた者が発言を控え、その結果として多数派がさらに大きく見える循環を記述した。Heycke et al.（2018）は多数への一致が選好そのものに影響し得ることを扱い、Heerdink et al.（2015）は逸脱者への感情的反応を検討した。Curşeu et al.（2017）は、少数意見と受容的な風土が集団の情報処理を支える可能性を示した。', ": Noelle-Neumann (1974) described the cycle by which someone who feels like a minority holds back from speaking, which in turn makes the majority look even larger. Heycke et al. (2018) examined how agreeing with the majority can influence preference itself, and Heerdink et al. (2015) studied emotional reactions to deviants. Curşeu et al. (2017) showed how minority dissent and an accepting climate can support a group's information processing.")}
          </p>
          <p>
            <b>{t('離脱と発言', 'Exit and voice')}</b>{t('：Hirschman（1970）は、不満を持った成員の行動が「発言」と「離脱」に分かれる構造を分析した。分散型組織の文脈では、Buterin（2021）が保有量に基づく投票は保有の偏りをそのまま決定権の偏りに変えると論じている。', ': Hirschman (1970) analyzed the structure by which a dissatisfied member\'s behavior splits into "voice" and "exit." In the context of decentralized organizations, Buterin (2021) argues that voting by token holdings turns a skew in holdings directly into a skew in decision-making power.')}
          </p>
          <p>{t('これらはいずれも', 'All of these deal with a ')}<b>{t('傾向', 'tendency')}</b>{t('あるいは', ' or an ')}<b>{t('個人の反応', "individual's response")}</b>{t('を扱っている。本稿が問うのは、その中間にある', '. What this paper asks about is the moment of transition that sits ')}<b>{t('転換の局面', 'in between')}</b>{t('である。', '.')}</p>
        </section>

        <section>
          <h2>{t('3. 仮説', '3. Hypothesis')}</h2>
          <div className="hypo">
            <p className="hypo-tag">{t('主仮説 H1', 'Main hypothesis H1')}</p>
            <p>
              {t('中心人物のいない集団において、情報の散在に対する集約提案は、それ自体では閉鎖化を決定しない。閉鎖化するか否かは、', 'In a group with no central figure, a proposal to consolidate scattered information does not by itself determine closure. Whether closure follows depends on ')}
              <b>{t('その提案が出るまでに、確認要求が同じ場で扱われた経験が反復しているか', 'whether, by the time that proposal appears, the room has a repeated history of confirmation requests being addressed in that same room')}</b>
              {t('に依存する。', '.')}
            </p>
          </div>
          <div className="hypo">
            <p className="hypo-tag">{t('補助仮説 H2', 'Auxiliary hypothesis H2')}</p>
            <p>{t('単発の応答は転換を起こさない。同一方向の応答が反復した時にのみ、場の運用が固定される。', "A single response does not trigger the transition. The room's practice only locks in once responses pointing the same direction repeat.")}</p>
          </div>
          <p>{t('H1 が正しければ、注目すべき局面は移る。', 'If H1 is correct, the moment worth watching shifts.')}</p>
          <ul>
            <li>{t('転換点の観測単位は「提案の内容」ではなく「提案前の応答履歴」である', 'The unit of observation for the tipping point is not "the content of the proposal" but "the response history before the proposal."')}</li>
            <li>{t('集約提案を抑制しても閉鎖化は防げない。負担は実在するため、提案は繰り返し出てくる', 'Suppressing consolidation proposals does not prevent closure. Because the burden is real, the proposal keeps recurring.')}</li>
            <li>{t('介入すべきは提案の時点ではなく、', 'What warrants intervention is not the moment of the proposal, but ')}<b>{t('それ以前の、確認要求が宙に浮いた時点', 'the earlier moment when a request for confirmation was left unmoored')}</b>{t('である。', '.')}</li>
          </ul>
        </section>

        <section>
          <h2>{t('4. 方法 — 合成会話モデル', '4. Method — the synthetic-conversation model')}</h2>
          <p>
            {t(
              '仮説を検討可能な形にするため、架空の会話モデルを構築した。実在の会話・人物・組織は一切用いていない。したがってこのモデルは、いかなる実在の集団についての証拠にもならない。',
              'To make the hypothesis examinable, a fictional conversation model was built. No real conversation, person, or organization is used anywhere in it. This model therefore cannot serve as evidence about any real group.',
            )}
          </p>
          <p>
            {t(
              '共通前半（11 発言）と二つの後半を持つ分岐構造とした。共通前半には中心人物も悪意を持つ話者も置いていない。ここで次の二つが決着しないまま散発的に混ざる。',
              'It is a branching structure with a shared first half (11 statements) and two second halves. The shared first half has no central figure and no speaker with ill intent. In it, two things mix sporadically without ever settling:',
            )}
          </p>
          <ul>
            <li><b>{t('A：確認要求の宙吊り', 'A: a request for confirmation left unmoored')}</b> {t('— 根拠を尋ねる発言が、否定されるのではなく、受け止める者がいないまま流れる', "— a statement asking for the source doesn't get rejected; it simply drifts by with no one to receive it")}</li>
            <li><b>{t('C：反応の非対称', 'C: an asymmetry in reaction')}</b> {t('— まとめには反応が集まり、検証可能な比較材料には集まらない。誰も問題として扱わない', "— the digest draws reactions and the checkable comparison material draws none, and no one treats it as an issue")}</li>
          </ul>
          <p>
            {t(
              '疲労の表明を経て、共通前半は集約提案で終わる。ここが分岐点である。後半は、まとめ役への経路集約に落ちる系列と、まとめと元資料の併記に落ちる系列の二種類を用意した。両方は',
              'After an expression of fatigue, the shared first half ends on a consolidation proposal — this is the branch point. Two versions of the second half were prepared: one that settles into channeling everything through a designated organizer, and one that settles into keeping the digest alongside the original source. Both ',
            )}
            <b>{t('同一の提案から始まる', 'start from the identical proposal')}</b>{t('。', '.')}
          </p>
          <p>{t('観察指標として四つの基準を置いた。基準への文献の割り当ては本稿の解釈である。', 'Four criteria were set as observation indicators. Mapping them to the literature is this paper\'s own interpretation.')}</p>
          <div className="paper-table-wrap">
            <table className="paper-table">
              <thead>
                <tr><th>{t('基準', 'Criterion')}</th><th>{t('内容', 'What it checks')}</th><th>{t('主な依拠', 'Primary basis')}</th></tr>
              </thead>
              <tbody>
                <tr><td>{t('もとの資料', 'The original source')}</td><td>{t('主張のもとになった資料と、それに合わない材料が出るか', 'Whether the source behind a claim, and conflicting material, ever surface')}</td><td>Curşeu et al. (2017), Ostrom (1990)</td></tr>
                <tr><td>{t('中身の扱い', 'How content is treated')}</td><td>{t('誰が言ったかではなく中身で扱われるか', 'Whether it is judged by content, not by who said it')}</td><td>Heycke et al. (2018), Heerdink et al. (2015)</td></tr>
                <tr><td>{t('反対意見の扱い', 'How dissent is treated')}</td><td>{t('反対意見が同じ場に残るか', 'Whether dissent stays in the room')}</td><td>Noelle-Neumann (1974), Hirschman (1970)</td></tr>
                <tr><td>{t('情報の入り口', 'Entry points for information')}</td><td>{t('確かめる道が複数あるか', 'Whether multiple ways to verify things exist')}</td><td>Freeman (1972), Hirschman (1970)</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            {t('各基準は三状態（', 'Each criterion takes one of three states (')}{STATE_PLAIN.unmet} ／ {STATE_PLAIN.partial} ／ {STATE_PLAIN.met}{t('）を取る。', ').')} <b>{t('単発の寄与では確定させない。', 'A single contribution never settles it.')}</b>{' '}
            {t('同一方向の働きかけが反復した時にのみ確定状態へ移行する実装とした。これは H2 を実装に埋め込んだものである。', 'It only moves to a settled state once contributions pointing the same direction repeat. This is H2 embedded directly in the implementation.')}
          </p>
        </section>

        <section>
          <h2>{t('5. 実証 — 全経路の網羅列挙', '5. Evidence — exhaustive enumeration of every path')}</h2>
          <p>
            {t('実在の集団を対象とした検証は行っていない。代わりに、', 'No verification was performed on a real group. Instead, ')}<b>{t('モデル自身の挙動を全数列挙', "the model's own behavior was enumerated exhaustively")}</b>{t('した。検証モードは', '. The "try it yourself" mode has ')}
            {VERIFY_STAGES.length} {t('局面 × 各', 'moments, each with ')} {VERIFY_STAGES[0].options.length} {t('択であり、経路は全部で', ' options, giving ')} {summary.total} {t('通りである。標本ではなく全数なので、推定も誤差もない。', 'paths in total. Since this is the full set and not a sample, there is no estimation and no margin of error.')}
          </p>
          <p>
            {t(
              '以下の数値は、このページを開いた時にシミュレータ本体と同じデータ・同じ判定コードで計算している。実装を変えれば数値も変わる。文章と実装がずれない状態を保つための措置である。',
              'The numbers below are computed, each time this page loads, with the same data and the same judgment code as the simulator itself. Change the implementation and the numbers change with it — this is a deliberate measure to keep the prose and the implementation from drifting apart.',
            )}
          </p>

          <div className="census-cards">
            <div className="census-card"><b>{summary.total}</b><span>{t('全経路', 'Total paths')}</span></div>
            <div className="census-card is-open"><b>{summary.open}</b><span>{t('開放型に着地', 'Landed on open')}</span></div>
            <div className="census-card is-closed"><b>{summary.closed}</b><span>{t('閉鎖型に着地', 'Landed on closed')}</span></div>
            <div className="census-card"><b>{summary.ambiguous}</b><span>{t('曖昧なまま', 'Stayed ambiguous')}</span></div>
          </div>

          <div className="census-cards">
            <div className="census-card is-open"><b>{summary.improved}</b><span>{t('基準が開いた経路', 'Paths where a criterion opened')}</span></div>
            <div className="census-card is-closed"><b>{summary.degraded}</b><span>{t('基準が閉じた経路', 'Paths where a criterion closed')}</span></div>
            <div className="census-card"><b>{summary.unchanged}</b><span>{t('どの基準も確定しなかった経路', 'Paths where no criterion settled')}</span></div>
            <div className="census-card"><b>{summary.repeated}</b><span>{t('同一方向を2回以上選んだ経路', 'Paths choosing the same direction twice or more')}</span></div>
          </div>

          <p>
            {t('確定に至った経路は', 'The paths that reached a settled state number')} {summary.improved + summary.degraded} {t('通りで、いずれも同一方向の選択が反復した経路である。', ', and every one of them is a path where the same direction was chosen repeatedly.')}
            {t('反復のない経路', ' The paths with no repetition, ')} {summary.total - summary.repeated} {t('通りでは、どの基準も確定しなかった。', ', settled no criterion at all.')} <b>{t('これは H2 が実装の水準で成立していることを示す', 'This shows H2 holds at the level of the implementation')}</b>{t('。ただし、実装が仮説通りに書かれている以上、これは仮説の裏づけではなく、実装が仮説を正しく表現していることの確認にすぎない。', ". But since the implementation was written to match the hypothesis, this is not evidence for the hypothesis — it only confirms that the implementation correctly expresses it.")}
          </p>
          <p className="paper-note">
            <b>{t('なぜこうなるか。', 'Why this happens.')}</b> {t(
              '判定コード（criteria.ts の criteriaStateOf）は、確定状態（開いている／閉じ気味）を一度でも記録した基準を、その後の「どちらとも」で上書きしない規則になっている。逆に言えば、確定に達するには同一方向の寄与が複数回積み重なる必要がある。3局面という短い列では、2回連続で同方向を選んだ経路だけが確定に届き、1回だけの経路や方向が割れた経路は「どちらとも」のまま終わる。この閾値は著者が置いた実装上の規則であり、現実の会話で何回の反復が必要かを測定したものではない。',
              'The judgment code (criteriaStateOf in criteria.ts) has a rule that once a criterion has recorded a settled state (open or leaning closed), a later "mixed" contribution never overwrites it. Put differently, reaching a settled state requires contributions pointing the same direction to stack up more than once. Over a short sequence of three moments, only paths choosing the same direction twice in a row reach a settled state; paths with just one such choice, or with split directions, end up "mixed." This threshold is a rule the author set in the implementation — it is not a measurement of how many repetitions a real conversation would need.',
            )}
          </p>

          <div className="paper-table-wrap">
            <table className="paper-table census-table">
              <thead>
                <tr>
                  <th>{t('局面1', 'Moment 1')}</th><th>{t('局面2', 'Moment 2')}</th><th>{t('局面3', 'Moment 3')}</th>
                  <th>{t('着地', 'Landed on')}</th>
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
            {t('寄 = 集約寄りの応答 ／ 開 = 分散寄りの応答 ／ 保 = 保留。状態は', `${DIR_MARK.converge} = a response leaning toward consolidation / ${DIR_MARK.distribute} = a response leaning toward distribution / ${DIR_MARK.hold} = holding. The state is`)} {STATE_MARK.unmet} {t('閉じ気味 ／', 'leaning closed /')} {STATE_MARK.partial} {t('どちらとも ／', 'mixed /')} {STATE_MARK.met} {t('開いている。', 'open.')}
          </p>
        </section>

        <section>
          <h2>{t('6. エージェント・シミュレーション — 実際に計算した結果', '6. Agent simulation — results actually computed')}</h2>
          <p>
            {t('第5節は検証モードという狭い設計の全数列挙だった。ここでは範囲を広げ、参加・離脱・キーワードへの反応・新規参加者の違和感を持つ', 'Section 5 was an exhaustive enumeration within the narrow design of the "try it yourself" mode. Here the scope widens: a synthetic community with joining, leaving, reaction to keywords, and newcomer unease was actually simulated for ')}
            <b>{t(`合成コミュニティを ${simulation.parameters.rounds} ラウンド × ${simulation.total.toLocaleString()} 回`, `${simulation.parameters.rounds} rounds, run ${simulation.total.toLocaleString()} times`)}</b>
            {t('、実際にシミュレーションした。乱数の種は固定してあり、同じスクリプト（scripts/simulate.mjs）を実行すれば誰でも同じ数値を再現できる。', '. The random seed is fixed, so anyone running the same script (scripts/simulate.mjs) reproduces the exact same numbers.')}
          </p>
          <p className="paper-note">
            {t(
              '重要な限定を先に書く。これは',
              'An important limitation, stated up front: this is ',
            )}<b>{t('実在のコミュニティのデータではない', 'not data from a real community')}</b>{t(
              '。エージェントの振る舞いは著者が置いたパラメータ（発言傾向の分布、確認要求が起きる確率、集約提案が経路と開放度に与える効果量など）に従うだけで、実在の集団を観測して推定したものではない。示せるのは「この機構をこう書くと、この分布が出る」という',
              '. The agents\' behavior simply follows parameters the author set — the distribution of speaking tendency, the probability a confirmation request occurs, the effect size a consolidation proposal has on channel and openness, and so on — none of it estimated by observing a real group. What this can show is ',
            )}<b>{t('機構内の一貫性', 'consistency within the mechanism')}</b>{t(
              'であり、「現実がこうである」という主張ではない。パラメータは scripts/simulate.mjs に全て明示してある。',
              ': "write the mechanism this way and this distribution comes out" — not a claim about how reality is. Every parameter is spelled out in scripts/simulate.mjs.',
            )}
          </p>

          <h3 className="paper-h3">{t('6.1 集約提案の有無', '6.1 With and without the consolidation proposal')}</h3>
          <p>
            {t('集約提案が場に出るかどうかを半数ずつに割り付けた。提案が出た側は着地が閉鎖型', 'Whether the consolidation proposal appeared in the room was assigned to half the runs each. Among runs where it appeared, the closed-type landing rate was')} {(simulation.byProposal.with.closed / simulation.byProposal.with.n * 100).toFixed(1)}%{t('、出なかった側は', ', versus')} {(simulation.byProposal.without.closed / simulation.byProposal.without.n * 100).toFixed(1)}% {t('だった。提案の有無だけでも差は生まれる。ただしこれは H1 への反証にはならない。提案が出た回では、応答履歴が悪い場ほど提案そのものが出やすい設計にはしていないため、この差は主に提案が経路集約を後押しする効果量（パラメータ）を反映している。H1 が問うのはその先——同じ提案が出た場合に、直前の応答履歴でどれだけ結果が変わるかである。', "where it didn't appear. Even just the presence or absence of the proposal produces a gap. This does not refute H1, though — the proposal was not designed to appear more readily in rooms with a worse response history, so this gap mainly reflects the effect size (a parameter) by which the proposal itself nudges the channel toward consolidation. What H1 asks about is what comes next: given the same proposal, how much the outcome changes with the response history right before it.")}
          </p>

          <h3 className="paper-h3">{t('6.2 提案の直前2回、確認要求が受け止められていたか', '6.2 Whether the two requests right before the proposal were received')}</h3>
          <p>
            {t('集約提案が実際に出た経路だけを取り出し、', 'Taking only the paths where the consolidation proposal actually appeared, they were split into five bands by ')}<b>{t('提案の直前における確認要求の受け止め率', 'the rate at which confirmation requests were received right before the proposal')}</b>{t('で5つの区間に分けた。同一の提案でも、その直前の応答履歴によって着地がどれだけ変わるかを見る。', '. This looks at how much the outcome shifts, for the identical proposal, based purely on the response history right before it.')}
          </p>
          <div className="paper-table-wrap">
            <table className="paper-table">
              <thead>
                <tr><th>{t('直前の受け止め率', 'Prior receive rate')}</th><th>{t('件数', 'Count')}</th><th>{t('閉鎖型に着地', 'Landed on closed')}</th><th>{t('曖昧なまま', 'Stayed ambiguous')}</th></tr>
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
            {t('受け止め率が0〜40%の区間では閉鎖型への着地が', 'In the 0–40% band, landing on closed ranged')} {(simulation.byPreRecovery[0].closedRate * 100).toFixed(0)}〜{(simulation.byPreRecovery[1].closedRate * 100).toFixed(0)}% {t('だったのに対し、60〜80%の区間では', ', while in the 60–80% band it fell to')} {(simulation.byPreRecovery[3].closedRate * 100).toFixed(0)}% {t('まで下がった。', '.')} <b>{t('提案の文面は全区間で同一である。', 'The wording of the proposal is identical across every band.')}</b> {t('差を生んでいるのは提案そのものではなく、それ以前の応答履歴である。これは、このシミュレーションのパラメータの上で H1 が予測する形と一致する。80〜100%の区間でわずかに閉鎖型が増える', "What produces the difference is not the proposal itself but the response history before it. This matches the shape H1 predicts, on this simulation's parameters. The slight uptick in closed outcomes in the 80–100% band")} ({(simulation.byPreRecovery[4].closedRate * 100).toFixed(0)}%) {t('のは、この区間の母数に他の要因（離脱・参加の偶発的な集中）が混ざっているためと考えられ、単一の走査では原因を切り分けられていない。', "is likely because that band's population happens to mix in other factors (a chance clustering of leaves and joins), and a single sweep cannot separate out the cause.")}
          </p>
          <p className="paper-note">
            <b>{t('なぜこうなるか。', 'Why this happens.')}</b> {t(
              'このシミュレーションでは、集約提案が適用する開放度・集中度の増減幅（P.proposal.toBoth と P.proposal.toSingle）を、提案の',
              'In this simulation, the amount by which the consolidation proposal shifts openness and concentration (P.proposal.toBoth and P.proposal.toSingle) switches based on ',
            )}<b>{t('直前2回の受け止め', 'whether the two most recent requests were received')}</b>{t(
              '（recovered = recentAnswers.length===2 && recentAnswers.every(Boolean)）。受け止め率が高い経路ほど、この分岐で「併記型」寄りの効果（集中度を下げ開放度を上げる）が選ばれやすくなり、低い経路ほど「集約型」寄りの効果が選ばれやすくなる。数値の傾きは、この一行の条件分岐がラウンドを重ねて積分された結果である。80〜100%区間の逆転は、この区間に集まった経路のうち、途中で成員の離脱・加入がたまたま偏った少数の経路が平均を押し上げているためであり、受け止め率という単一変数だけでは説明しきれないことをそのまま表している。',
              ' (recovered = recentAnswers.length===2 && recentAnswers.every(Boolean)). The higher a path\'s receive rate, the more likely this branch picks the effect leaning toward "keep both" (lowering concentration, raising openness); the lower it is, the more likely it picks the effect leaning toward "consolidate." The slope in the numbers is simply this one conditional branch, integrated over many rounds. The reversal in the 80–100% band comes from a small number of paths in that band, where members happening to leave and join in a skewed way pulled the average up — a plain demonstration that the receive rate alone cannot fully explain it.',
            )}
          </p>

          <h3 className="paper-h3">{t('6.3 新規参加者の違和感', '6.3 Newcomer unease')}</h3>
          <p>
            {t('経路が集約した場（集中度が高い状態）に新しく人が加わった時の定着率は', "The retention rate for someone newly joining a room where the channel had already consolidated (a high-concentration state) was")} {(simulation.newcomer.retentionHighConcentration * 100).toFixed(1)}%{t('、経路が分散したままの場では', ', versus')} {(simulation.newcomer.retentionLowConcentration * 100).toFixed(1)}% {t('だった。集約した場では、確かめたい傾向の強い新規参加者ほど違和感を持って離れる、という規則をパラメータに入れており、その規則がそのまま定着率の差として表れている。これも機構の一貫性の確認であって、現実の参加者がそう感じることの証明ではない。', "in rooms where the channel stayed distributed. A rule was built into the parameters that, in a consolidated room, newcomers with a stronger urge to verify things are more likely to feel unease and leave — and that rule shows up directly as the gap in retention. This, too, is a check on the mechanism's consistency, not proof that a real newcomer would feel that way.")}
          </p>
          <p className="paper-note">
            <b>{t('なぜこうなるか。', 'Why this happens.')}</b> {t(
              '定着率の差は単一の規則（uneasy = concentration > 0.6 && newcomer.voice > 0.5）から直接生まれている。集中度が閾値を超えた場に、発言傾向の高い新規参加者が来ると、一定確率で離脱としてカウントされる。この規則を書かなければ差は出ない。したがって 6.3 の数値は「新規参加者が違和感を持つことの発見」ではなく、「そういう規則を置けば、その通りの分布が出る」という同語反復である。現実にそうなるかどうかは、この節では何も語っていない。',
              'The gap in retention comes directly from a single rule (uneasy = concentration > 0.6 && newcomer.voice > 0.5). When a newcomer with a high speaking tendency arrives in a room past the concentration threshold, they get counted as leaving with a set probability. Without that rule written in, there is no gap. So the numbers in 6.3 are not a discovery that "newcomers feel unease" — they are a tautology: write in that rule, and that is the distribution you get. This section says nothing about whether it actually happens that way in reality.',
            )}
          </p>

          <h3 className="paper-h3">{t('6.4 この節の位置づけ', '6.4 What this section is')}</h3>
          <p>
            {t('この節が示すのは「その場にいないと分からない話」ではなく、', 'What this section shows is not "something you had to be there to know" but ')}<b>{t('明示されたルールから計算される分布', 'a distribution computed from explicitly stated rules')}</b>{t('である。誰でも scripts/simulate.mjs を読んでパラメータを検討し、値を変えて再計算し、この結果に異議を唱えられる。これは実証ではなく、', '. Anyone can read scripts/simulate.mjs, examine the parameters, change the values, recompute, and challenge this result. This is not evidence — it is ')}<b>{t('反証可能な形にした仮説の一つの表現', 'one expression of the hypothesis put in a falsifiable form')}</b>{t('である。実在のコミュニティを対象とした検証は第9節に別途構想を記す。', '. A separate plan for verification against real communities is laid out in Section 9.')}
          </p>
        </section>

        <section className="lever-inline">
          <h3 className="paper-h3">{t('6.5 どの言い回しの要素が効くか — レバー掃引', '6.5 Which phrasing elements matter — a lever sweep')}</h3>
          <p>
            {t(
              '集約提案に足す言い回しの要素を3つに分け（元の資料も残す／固定の担当者を置かない／保留にした話を戻す）、組み合わせ8通りをそれぞれ4,000回走らせた。',
              'Three phrasing elements that could be added to the consolidation proposal (keep the original source / don\'t fix it on one person / bring a deferred point back) were combined in all 8 ways and each combination was run 4,000 times.',
            )}<b>{t('効果量はここでも著者が定義したものである。', "The effect sizes here, too, are ones the author defined.")}</b>{' '}
            {t('現実の言葉がこの通りに効く証拠ではなく、「この機構でこの要素を強めると、この方向へ動く」という設計仮説の表現として読んでほしい。', 'Read this not as evidence that real words work exactly this way, but as an expression of a design hypothesis: "strengthen this element in this mechanism, and it moves this way."')}
          </p>
          <div className="paper-table-wrap">
            <table className="paper-table">
              <thead>
                <tr><th>{t('元の資料', 'Keep source')}</th><th>{t('固定担当なし', 'No fixed owner')}</th><th>{t('保留を戻す', 'Return deferrals')}</th><th>{t('閉鎖型', 'Closed')}</th><th>{t('開放型', 'Open')}</th></tr>
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
            {t('要素を一つも足さない基準条件では', 'In the baseline condition with none of the elements added,')} {(leverBaseline.closedRate * 100).toFixed(1)}% {t('が閉鎖型に着地したのに対し、三つとも足すと', 'landed on closed, while adding all three brought')} {(leverFull.openRate * 100).toFixed(1)}% {t('が開放型に着地した。単体では「保留を戻す」の効果が最も大きいが、要素を組み合わせるほど効果は積み上がる。', 'to landing on open. Alone, "return deferrals" has the largest effect, but the effects stack the more elements are combined.')}
          </p>
          <p className="paper-note">
            <b>{t('なぜ組み合わせで効果が積み上がるか。', 'Why the effects stack when combined.')}</b> {t(
              '各レバーは集中度と開放度の両方に、それぞれ独立した増減を与える設計にしてある。「保留を戻す」は受け止め率を直接押し上げ、「固定担当なし」と「元の資料」は集約提案が適用する集中度の増分を打ち消し開放度の増分を足す。3つを同時に足すと、集中度の上昇はほぼ相殺され、開放度だけが40ラウンド分積み上がるため、着地の判定線（集中度0.45未満 かつ 開放度0.55超）を大きく超える。逆に1つも足さないと、集約提案は毎回集中度を押し上げるだけの効果しか持たず、40ラウンドの反復でほぼ確実に閉鎖側の判定線を超える。この「ほぼ確実に」という言葉自体が、単発では決まらず反復で決まるという H2 の主張を、数値の形で言い換えたものである。',
              'Each lever was designed to give an independent push to both concentration and openness. "Return deferrals" directly raises the receive rate; "no fixed owner" and "keep source" cancel out the rise in concentration the consolidation proposal applies and add to the rise in openness. Add all three at once, and the rise in concentration is nearly canceled while openness alone accumulates over 40 rounds, comfortably clearing the landing threshold (concentration under 0.45 and openness over 0.55). Add none, conversely, and the consolidation proposal only ever pushes concentration up, so 40 rounds of repetition clear the closed-side threshold almost every time. That phrase, "almost every time," is itself H2\'s claim — that nothing is decided in one instance, only through repetition — restated in numbers.',
            )}
          </p>
          <p className="paper-note">
            {t(
              'この3要素は架空の会話データ（app/data/open-run.ts）に実在の文として既に書かれている。「まとめは助かります。ただ、まとめだけになると後から確かめられないので、元の資料へのリンクも一緒に置きませんか」（元の資料）、「まとめ役は固定しないで持ち回りにしませんか」（固定担当なし）、「さっき保留になった話、ここで戻していいですか」（保留を戻す）。ここでの掃引は、後づけの理屈ではなく、会話データを書いた時点の設計判断を数値で裏返して確かめたものである。',
              'All three elements already exist as actual lines in the fictional conversation data (app/data/open-run.ts): "The digest helps. But if it\'s the only thing left, we can\'t check back later — could we also link the original material?" (keep source); "Should we rotate who organizes the digest instead of fixing it on one person?" (no fixed owner); "Can we bring back the point that got deferred earlier?" (return deferrals). This sweep is not reasoning added after the fact — it turns the design decisions made when that conversation data was written into numbers and checks them.',
            )}
          </p>
        </section>

        <section className="lever-inline">
          <h3 className="paper-h3">{t('6.6 何が構造を歪めるか — 外部要因の注入', '6.6 What warps the structure — injecting outside factors')}</h3>
          <p>
            {t('6.1〜6.5 は「場の内側だけで進む」動きを見ていた。ここでは、外側から特定の種類の要因が割り込んだ時、通常の場がどれだけ・どれくらいの速さで歪むかを見る。', '6.1–6.5 looked at movement that unfolds purely inside the room. Here, the question is how much — and how fast — an ordinary room warps when a specific kind of outside factor cuts in.')} <b>{t('資金', 'Funding')}</b>{t('（特定の提案や話者に予算がつき議題が一気に寄る）、', ' (a budget lands on a specific proposal or speaker and the agenda snaps toward it), ')}<b>{t('影響力', 'Influence')}</b>{t('（特定の声が以後の答えを継続的に塗り替える）、', ' (one voice keeps overwriting subsequent answers), and ')}<b>{t('権力', 'Power')}</b>{t('（正式な決定権が一人に付与される）の三種を想定し、注入しない場合と比較した。各条件', ' (formal decision-making authority is handed to one person) — three kinds were modeled and compared against no injection at all. Each condition was run')} {(simulation.shockSweep as ShockRow[])[0].n.toLocaleString()} {t('回、', ' times, over')} {simulation.shockSweep[0].rounds} {t('ラウンドで走らせた。', ' rounds.')}
          </p>
          <div className="paper-table-wrap">
            <table className="paper-table">
              <thead>
                <tr><th>{t('注入', 'Injection')}</th><th>{t('閉鎖型に着地', 'Landed on closed')}</th><th>{t('開放型に着地', 'Landed on open')}</th><th>{t('閉じるまでの平均ラウンド', 'Average rounds to close')}</th></tr>
              </thead>
              <tbody>
                {(simulation.shockSweep as ShockRow[]).map((row) => (
                  <tr key={row.kind}>
                    <td>{SHOCK_NAME[row.kind]}</td>
                    <td className={row.closedRate > 0.3 ? 'cell-state unmet' : 'cell-state met'}>{(row.closedRate * 100).toFixed(1)}%</td>
                    <td>{(row.openRate * 100).toFixed(1)}%</td>
                    <td>{row.meanRoundsToClose === null ? '—' : `${row.meanRoundsToClose.toFixed(1)} / ${row.rounds}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {t('注入がない基準条件では、', 'In the baseline with no injection, only')} {SHOCK_ROUNDS_LABEL} {t('ラウンドのうちに閉鎖型へ着地したのは', ' rounds in, only')} {(simulation.shockSweep[0].closedRate * 100).toFixed(1)}% {t('にとどまった。三種のいずれかを注入すると、この率は', ' had landed on closed. Inject any one of the three, and this rate jumps to')} {(simulation.shockSweep[2].closedRate * 100).toFixed(1)}〜{(simulation.shockSweep[3].closedRate * 100).toFixed(1)}% {t('まで跳ね上がる。閉じた経路に限っても、注入がある条件では基準条件よりずっと早く（平均で半分以下のラウンド数で）判定線を超えている。', '. Even restricted to paths that did close, the injected conditions cross the threshold much faster than baseline — in under half the average number of rounds.')}
          </p>
          <p className="paper-note">
            <b>{t('なぜこうなるか。', 'Why this happens.')}</b> {t(
              '「権力」は集中度に一度で大きな跳躍（+0.5）を与え、開放度も同時に落とす（−0.25）ため、注入の瞬間に判定線への距離が一気に縮まる。「資金」も同じ形の一回限りの跳躍（+0.35 / −0.15）だが幅が小さい分、届くまでにやや時間がかかる。「影響力」は一回では跳躍させず、代わりに',
              'Power gives concentration one large jump at once (+0.5) while simultaneously dropping openness (−0.25), so the distance to the threshold collapses the instant it is injected. Funding is the same shape of one-time jump (+0.35 / −0.15) but smaller, so it takes a little longer to arrive. Influence never jumps at once — instead it was given ',
            )}<b>{t('それ以降すべてのラウンドの確認要求の受け止め率を半分にする', "a lasting effect that halves the receive rate for confirmation requests in every round from then on")}</b>{t(
              'という持続的な効果にしてある。一回の衝撃としては最も弱いが、反復にわたって効き続けるため、時間をかけて基準条件から大きく離れていく。三者は「大きな一撃」と「小さな一撃」と「弱いが終わらない圧力」という異なる形の歪みとして実装しており、これは現実の資金・影響力・権力の作用の仕方についての著者の仮定であって、測定ではない。',
              '. As a single shock it is the weakest of the three, but because it keeps acting across every round, it drifts far from the baseline given enough time. The three were implemented as three different shapes of warp — a big blow, a small blow, and a weak pressure that never lets up — which is the author\'s assumption about how funding, influence, and power actually operate in reality, not a measurement of it.',
            )}
          </p>
        </section>

        <section>
          <h2>{t('7. 予測と反証条件', '7. Predictions and the conditions for refutation')}</h2>
          <p>{t('H1 が正しければ、実在の集団において次が観察されるはずである。', 'If H1 is correct, the following should be observable in real groups.')}</p>
          <ul>
            <li><b>P1</b> {t('集約提案の文面を統制しても、その前の応答履歴が異なれば、以後の経路構造は異なる', 'Even holding the wording of the consolidation proposal constant, a different response history before it produces a different subsequent channel structure.')}</li>
            <li><b>P2</b> {t('応答履歴が同一であれば、集約提案の有無にかかわらず、経路構造は同方向へ推移する', 'Given the identical response history, the channel structure drifts the same direction regardless of whether a consolidation proposal appears.')}</li>
            <li><b>P3</b> {t('単発の確認要求は、その後の構造に有意な差をもたらさない', 'A single confirmation request produces no significant difference in the subsequent structure.')}</li>
          </ul>
          <p>{t('次のいずれかが観察されれば H1 は棄却される。', 'H1 is refuted if any of the following is observed.')}</p>
          <ul>
            <li>{t('応答履歴を統制した上で、提案の文面だけで以後の経路構造が分岐する', 'Holding the response history constant, the wording of the proposal alone determines how the subsequent structure diverges.')}</li>
            <li>{t('単発の確認要求が、反復した場合と同等の効果を持つ（H2 の棄却）', 'A single confirmation request has an effect equivalent to a repeated one (refuting H2).')}</li>
            <li>{t('応答履歴と経路構造の間に関連が見られない', 'No relationship is found between response history and channel structure.')}</li>
          </ul>
        </section>

        <section>
          <h2>{t('8. 限界', '8. Limitations')}</h2>
          <ol>
            <li><b>{t('実在の集団では実証していない。', 'Not verified on any real group.')}</b> {t('第5節の全数列挙はモデルの挙動の確認であり、仮説の裏づけではない', "Section 5's exhaustive enumeration confirms the model's own behavior; it does not support the hypothesis.")}</li>
            <li><b>{t('合成会話は証拠ではない。', 'The synthetic conversations are not evidence.')}</b> {t('設計者が仮説通りに書いたのだから、仮説通りに動くのは当然である', "The designer wrote them to match the hypothesis, so of course they behave as the hypothesis predicts.")}</li>
            <li><b>{t('文献と基準の対応は解釈である。', 'The mapping between the literature and the criteria is an interpretation.')}</b> {t('挙げた文献はいずれも本モデルを検証していない。権威づけに用いてはならない', 'None of the cited works verified this model. They must not be used to lend it authority.')}</li>
            <li><b>{t('観測者効果を扱えていない。', 'It does not account for observer effects.')}</b> {t('参加型の検証では、選択者が観察されていることを知っている', "In the participatory verification mode, the person choosing knows they are being observed.")}</li>
            <li><b>{t('経路の重みが等価という仮定を置いている。', 'It assumes every moment carries equal weight.')}</b> {t('現実には局面ごとに影響力が異なる可能性が高い', 'In reality, different moments likely carry different amounts of influence.')}</li>
          </ol>
        </section>

        <section>
          <h2>{t('9. 今後の検証', '9. Future verification')}</h2>
          <ul>
            <li><b>{t('公開ログの利用', 'Using public logs')}</b> {t('— 公開されている議事録・フォーラム記録を対象に、確認要求とその応答を分類する。個人は同定せず、発話の構造のみを符号化する', "— classify requests for confirmation and their responses from public meeting minutes and forum records. No individual is identified; only the structure of the statements is coded.")}</li>
            <li><b>{t('事前登録', 'Pre-registration')}</b> {t('— 分類基準とコーディング規則を先に公開し、後付けの解釈を防ぐ', '— publish the classification criteria and coding rules in advance, to prevent after-the-fact interpretation.')}</li>
            <li><b>{t('コーダー間信頼性の測定', 'Measuring inter-coder reliability')}</b> {t('— 「確認要求が回収されたか」の判定が観察者間で一致するかを確かめる。一致しなければ、仮説以前に指標が成立していない', '— check whether observers agree on whether "a confirmation request was taken up." If they don\'t agree, the metric doesn\'t hold up even before the hypothesis is tested.')}</li>
            <li><b>{t('時系列の扱い', 'Handling time series')}</b> {t('— 応答履歴は累積量である。単発の断面では検証できない', "— response history is a cumulative quantity; it cannot be tested from a single snapshot.")}</li>
          </ul>
          <p>
            {t(
              '倫理的制約として、実在の集団を「閉鎖型」と分類して公表する形式は取らない。分類が対象への評価として流通した時点で、この研究は自らが批判した構造——結論だけが渡り、根拠を確かめられない状態——を再生産する。',
              'As an ethical constraint, this line of work will not publish real groups classified as "closed." The moment a classification circulates as a judgment of its subject, this research reproduces the very structure it criticizes — a conclusion handed over with no way to check the grounds behind it.',
            )}
          </p>
        </section>

        <section>
          <h2>{t('10. 結論', '10. Conclusion')}</h2>
          <blockquote>{t('分岐は、集約提案そのものではなく、その提案に至るまでの応答履歴によって決まる。', 'The branch is decided not by the consolidation proposal itself, but by the response history that led up to it.')}</blockquote>
          <p>
            {t(
              'この仮説が正しければ、注目すべき局面は変わる。誰かが権限を求めた瞬間ではなく、誰かの確認要求が宙に浮いたまま流れた、その静かな瞬間である。そこでは誰も悪意を持っていない。だからこそ、記録が残っていても繰り返される。',
              'If this hypothesis is correct, the moment worth watching changes. Not the moment someone reaches for authority, but the quiet moment when someone\'s request for confirmation drifted by unmoored. No one there means any harm. That is exactly why it keeps happening even when the record is there.',
            )}
          </p>
          <p>
            {t(
              '仮説はまだ検証されていない。反証条件は第7節に記した。実装、会話データ、判定コード、設計記録はすべて公開している。同じ手順で作り直すことも、誤りを指摘することもできる。',
              'The hypothesis has not been verified yet. The conditions for refutation are laid out in Section 7. The implementation, the conversation data, the judgment code, and the design record are all public. Anyone can rebuild it by the same steps, or point out where it is wrong.',
            )}
          </p>
          <p>{t('自分の主張にも、自分が掲げた基準を当てる。それがこの研究の最低条件である。', "Holding one's own claim to the same standard one has set — that is the baseline condition for this work.")}</p>
        </section>

        <section>
          <h2>{t('参考文献', 'References')}</h2>
          <p className="paper-note">{t('書誌情報は執筆時点の記載である。引用にあたっては原典を確認されたい。', 'Citation details are as recorded at the time of writing. Please verify against the original sources before citing.')}</p>
          <ul className="refs">
            <li>Buterin, V. (2021). <i>Moving beyond coin voting governance</i>. {t('エッセイ', 'Essay')}</li>
            <li>Curşeu, P. L., et al. (2017). Minority Dissent and Social Acceptance in Collaborative Learning Groups. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5368259/" target="_blank" rel="noreferrer">PMC5368259</a></li>
            <li>Freeman, J. (1972). <i>The Tyranny of Structurelessness</i>. <a href="https://www.jofreeman.com/joreen/tyranny.htm" target="_blank" rel="noreferrer">jofreeman.com</a></li>
            <li>Heerdink, M. W., et al. (2015). Emotional reactions to deviance in groups. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4466438/" target="_blank" rel="noreferrer">PMC4466438</a></li>
            <li>Heycke, T., et al. (2018). The Expression and Transfer of Valence Associated with Social Conformity. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6377616/" target="_blank" rel="noreferrer">PMC6377616</a></li>
            <li>Hirschman, A. O. (1970). <i>Exit, Voice, and Loyalty</i>. {t('書籍', 'Book')}</li>
            <li>Michels, R. (1911). <i>Zur Soziologie des Parteiwesens in der modernen Demokratie</i>{t('（寡頭制の鉄則）', ' (The Iron Law of Oligarchy)')}. {t('書籍', 'Book')}</li>
            <li>Noelle-Neumann, E. (1974). The Spiral of Silence. <i>Journal of Communication</i></li>
            <li>Olson, M. (1965). <i>The Logic of Collective Action</i>. {t('書籍', 'Book')}</li>
            <li>Ostrom, E. (1990). <i>Governing the Commons</i>. {t('書籍', 'Book')}</li>
          </ul>
        </section>

        <footer className="paper-foot">
          <p>
            {t(
              '登場する会話・人物・資料・イベントはすべて架空である。実在の人物、組織、コミュニティ、会話を診断・評価・告発するものではない。',
              'Every conversation, person, document, and event here is fictional. This does not diagnose, evaluate, or accuse any real person, organization, community, or conversation.',
            )}
          </p>
          <p>
            {t('実装と設計記録：', 'Implementation and design records: ')}<a href="https://github.com/HFOT/dialogue-verification-model" target="_blank" rel="noreferrer">github.com/HFOT/dialogue-verification-model</a>
          </p>
          <Link className="paper-back" href="/">{t('← モデルを動かす', '← Run the model')}</Link>
        </footer>
      </article>
    </main>
  );
}
