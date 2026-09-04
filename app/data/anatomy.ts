import type { CriterionId, CriterionShift, CriterionState, Message } from './types';
import { shiftsFor } from './criteria';

/**
 * 発言の解剖。
 * 「どんな要素が含まれた文章か」と「どう影響しうるか」を分けて示す。
 * 影響は断定せず、可能性として書く。実在の話者の意図を示すものではない。
 */
export type PointAnatomy = { elements: string[]; influence: string };

function suffixOf(id: string): string {
  const index = id.indexOf('-');
  return index < 0 ? id : id.slice(index + 1);
}

/** 個別に読み解けるものは明示的に書く。既存の会話データには手を触れない。 */
const TABLE: Record<string, PointAnatomy> = {
  // 圧力側
  'guide-1': {
    elements: ['不安への言及', '確認順序の指定', '論争の細部化'],
    influence: '「まずここで整理されたものを見る」が習慣になると、一次情報や別の見方に触れる経路が実質的に狭くなる場合があります。',
  },
  'empathy-1': {
    elements: ['発言者への称賛', '内容への言及なし'],
    influence: '称賛が特定の話者の直後にだけ続くと、何を言ったかより誰が言ったかで注目が決まりやすくなります。',
  },
  'support-1': {
    elements: ['定時の要約', '各自確認の呼びかけ'],
    influence: '要約は入口として働きますが、それだけで判断が完結すると、確認の手数が減る場合があります。',
  },
  'delegation-nudge': {
    elements: ['自由の明示', '特定の案内役の反復提示'],
    influence: '「自由に選べる」と添えつつ同じ候補が繰り返されると、その選択が自然な標準に見えてくる場合があります。',
  },
  'pressure-endorsement': {
    elements: ['話者自身の評価基準', '支援先の集約'],
    influence: '評価の手順が共有されないまま推薦が続くと、確かめずに同じ先へ集まる状態になりやすくなります。',
  },
  'pressure-network': {
    elements: ['関係の広さの提示', '仲介の申し出', '外部の抑制'],
    influence: '情報の出入りが一人を経由する形になると、その人が扱わなかった論点は場に現れなくなる場合があります。',
  },
  'empathy-network': {
    elements: ['安心の表明', '待機の肯定'],
    influence: '「待っていれば届く」が共有されると、自分で確かめる行動が起きにくくなる場合があります。',
  },
  'case': {
    elements: ['検証可能な材料', '限界の明示'],
    influence: '確かめられる材料が出ても、場の関心と接続しなければ扱われずに流れる場合があります。',
  },
  'constructive': {
    elements: ['感謝', '限界の明示', '自分で確認する行動'],
    influence: '確認の手順が共有されると、判断を誰かに預けずに済む状態に近づきます。',
  },
  'core-reframe': {
    elements: ['前提の拡張', '比較の否定', '不安への言及'],
    influence: '評価軸そのものを広げ直すと、元の具体的な検証は答えられないまま扱いにくくなる場合があります。',
  },
  'core-opinion': {
    elements: ['私見の断り', '意図への言及', '公平性の提起'],
    influence: '内容の話が話者の姿勢の話に移ると、検証対象そのものへの注目が薄れる場合があります。',
  },
  'technical-turn': {
    elements: ['話題の切り替え', '手順の共有'],
    influence: '未解決の論点が残ったまま別の話題に移ると、その論点は戻ってこない場合があります。',
  },
  'holder-reset': {
    elements: ['目的の明示', '限界の明示', '訂正の受付'],
    influence: '目的と限界が示されると、他の人が検証に参加できる余地が残ります。',
  },
  'pressure-holder-critique': {
    elements: ['善意の承認', '前提の否定', '発言資格への言及'],
    influence: '改善案ではなく正誤の断定が返ると、発言そのものが取り下げられる方向に働く場合があります。',
  },
  'empathy-holder-critique': {
    elements: ['批判への称賛', '慎重さの要求'],
    influence: '批判の側にだけ共感が重なると、材料を改善するより黙る方が安全に見えてくる場合があります。',
  },
  'simulator': {
    elements: ['判断の補助', '結論を出さない設計'],
    influence: '前提を自分で確かめる道具が増えると、結論を受け取るだけの状態から離れやすくなります。',
  },
  'holder-reply': {
    elements: ['受領の表明', '自分の条件への引き寄せ'],
    influence: '共有が自分の判断に接続されると、材料が使われた実績として場に残ります。',
  },
  'pressure-reversal': {
    elements: ['提案者への要求', '責任の個人化'],
    influence: '提案の中身より提案者の行動が問われると、次に問いを出す人が減る場合があります。',
  },
  'pressure-boundary': {
    elements: ['外部言論の無効化', '内側の優先'],
    influence: '外の議論を断片として扱うと、場の外にある確認経路が使われなくなる場合があります。',
  },
  'guide-2': {
    elements: ['内集団の強調', '場の境界の設定'],
    influence: '「ここは現場を知る人の場所」という枠が置かれると、外からの異論が持ち込みにくくなる場合があります。',
  },

  // 中間型（共通前半）
  'c01-ask': {
    elements: ['根拠の要求', '比較の提案'],
    influence: '確認要求が出た時点では場は分かれていません。受け止め手が現れるかどうかで、この後の向きが決まります。',
  },
  'c03-digest': {
    elements: ['定時の要約', '各自確認の呼びかけ'],
    influence: 'まとめに反応が集まること自体は内容の確かさを示しません。入口が一つ増えた段階です。',
  },
  'c05-note': {
    elements: ['比較材料の提示', '欠落の明示'],
    influence: '確かめられる材料が出ても反応が伴わない状態です。反応量と有用性が別々に動いています。',
  },
  'c06-pass': {
    elements: ['読みやすさの優先', '偏りの未指摘'],
    influence: '偏りが生じても誰も問題として扱わない段階です。ここではまだどちらにも転びます。',
  },
  'c08-defer': {
    elements: ['謝意', '先送り'],
    influence: '拒否ではなく保留です。保留された論点が戻るかどうかで、比較できる場かどうかが決まります。',
  },
  'c10-branch': {
    elements: ['負担の軽減', '役割の集約提案'],
    influence: 'この提案自体は善意で現実的です。分かれるのは提案の善悪ではなく、この後に場がどう応答するかです。',
  },

  // 非圧力側
  'o01-both': {
    elements: ['まとめの肯定', '一次資料の併記', '手間の明示'],
    influence: 'まとめと元の資料が両方残ると、後から自分で確かめ直せる状態が保たれます。',
  },
  'o03-template': {
    elements: ['出典欄', '確認日', '未確認欄'],
    influence: '分からないことを分からないまま置ける形式があると、確度の低い情報が確定情報として流れにくくなります。',
  },
  'o06-return': {
    elements: ['保留の回収', '議題への復帰'],
    influence: '先送りされた論点が同じ場に戻ると、異論を比較できる状態が保たれます。',
  },
  'o07-counter': {
    elements: ['支持する材料', '食い違う材料', '結論の留保'],
    influence: '反証が同時に置かれると、判断が場ではなく各自に残ります。',
  },
  'o11-split': {
    elements: ['反応量への言及', '内容の確かさとの区別'],
    influence: '反応の多さと妥当性が別物として扱われると、誰が言ったかで扱いが決まりにくくなります。',
  },
  'o13-rotate': {
    elements: ['役割の持ち回り', '負担の分散'],
    influence: '経路が一人に固定されないと、その人が動けない時も情報が止まりにくくなります。',
  },
};

/** 個別の記述がないものは、効いている基準と向きから組み立てる。 */
const GENERIC: Record<CriterionId, Record<CriterionState, PointAnatomy>> = {
  evidence: {
    unmet: { elements: ['結論の提示', '根拠の省略'], influence: '根拠が示されないまま結論だけが残ると、後から確かめ直せなくなる場合があります。' },
    partial: { elements: ['材料の提示'], influence: '材料は出ていますが、確認の動きにつながるかはこの後の応答によります。' },
    met: { elements: ['根拠の提示', '反証の同時提示'], influence: '支持する材料と食い違う材料が並ぶと、判断が各自に残ります。' },
  },
  content: {
    unmet: { elements: ['発言者への言及', '内容への言及なし'], influence: '誰が言ったかで扱いが決まると、内容の確かさが検討されにくくなる場合があります。' },
    partial: { elements: ['反応の偏り'], influence: '偏りは生じていますが、まだ問題として扱われていません。' },
    met: { elements: ['反応量への言及', '内容との区別'], influence: '反応の多さと内容の確かさが分けて扱われると、評価の基準が発言者から離れます。' },
  },
  compare: {
    unmet: { elements: ['異論の再定義', '比較の抑制'], influence: '異論が同じ場に残らないと、両方の言い分を並べて比べられなくなる場合があります。' },
    partial: { elements: ['異論の提示'], influence: '異論は出ていますが、受け止められるかはこの後の応答によります。' },
    met: { elements: ['異論の受容', '同じ場での並置'], influence: '異論が場に残ると、比較したうえで各自が判断できます。' },
  },
  routes: {
    unmet: { elements: ['経路の集約', '外部の抑制'], influence: '情報の入口が一本に寄ると、そこを通らない話は届かなくなる場合があります。' },
    partial: { elements: ['入口の追加'], influence: '入口が一つ増えた段階です。他の経路が残るかはこの後の応答によります。' },
    met: { elements: ['経路の併記', '固定の回避'], influence: '経路が複数のまま保たれると、一つが止まっても確認の手段が残ります。' },
  },
};

export function anatomyOf(message: Message | undefined, shift: CriterionShift | undefined): PointAnatomy | null {
  if (!message) return null;
  const direct = TABLE[suffixOf(message.id)];
  if (direct) return direct;
  const target = shift ?? shiftsFor(message)[0];
  if (!target) return null;
  return GENERIC[target.id][target.state];
}
