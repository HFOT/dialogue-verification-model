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
    elements: ['不安に触れる', '見る順番の指定', '議論を「細かい話」と呼ぶ'],
    influence: '「まずここで整理されたものを見る」が習慣になると、もとの資料や別の見方に触れる確かめに行ける道が実際に狭くなる場合があります。',
  },
  'empathy-1': {
    elements: ['言った人への称賛', '中身には触れていない'],
    influence: '称賛が特定の話者の直後にだけ続くと、何を言ったかより誰が言ったかで注目が決まりやすくなります。',
  },
  'support-1': {
    elements: ['決まった時間のまとめ', '各自で確かめてという断り'],
    influence: '要約は入り口として働きますが、それだけで判断が完結すると、確認の手数が減る場合があります。',
  },
  'delegation-nudge': {
    elements: ['「自由に選べる」と言い添える', '同じ案内役の繰り返し'],
    influence: '「自由に選べる」と添えつつ同じ候補が繰り返されると、その選択が自然な標準に見えてくる場合があります。',
  },
  'pressure-endorsement': {
    elements: ['言う人自身のものさし', '支援先をひとつに寄せる'],
    influence: '評価の手順が共有されないまま推薦が続くと、確かめずに同じ先へ集まる状態になりやすくなります。',
  },
  'pressure-network': {
    elements: ['顔の広さの提示', '自分を通す申し出', '外を見に行かせない'],
    influence: '情報の出入りが一人を経由する形になると、その人が扱わなかった話は場に出てこなくなる場合があります。',
  },
  'empathy-network': {
    elements: ['安心だという表明', '待つことの肯定'],
    influence: '「待っていれば届く」が共有されると、自分で確かめる行動が起きにくくなる場合があります。',
  },
  'case': {
    elements: ['確かめられる材料', '限界も一緒に言う'],
    influence: '確かめられる材料が出ても、場の関心と接続しなければ扱われずに流れる場合があります。',
  },
  'constructive': {
    elements: ['ありがとうと言う', '限界も一緒に言う', '自分で確認する行動'],
    influence: '確認の手順が共有されると、判断を誰かに預けずに済む状態に近づきます。',
  },
  'core-reframe': {
    elements: ['話の枠の広げ直し', '並べて比べることの否定', '不安に触れる'],
    influence: '見るものさしそのものを広げ直すと、もとの具体的な確認は答えられないまま扱いにくくなる場合があります。',
  },
  'core-opinion': {
    elements: ['「あくまで私見」という前置き', '相手の意図の話に移す', '公平かどうかの話に移す'],
    influence: '内容の話が話者の姿勢の話に移ると、確かめる対象そのものへの注目が薄れる場合があります。',
  },
  'technical-turn': {
    elements: ['別の話題へ移す', 'やり方の共有'],
    influence: '答えの出ていない話が残ったまま別の話題に移ると、その話は戻ってこない場合があります。',
  },
  'holder-reset': {
    elements: ['何のためかを言う', '限界も一緒に言う', '直す余地を残す'],
    influence: '目的と限界が示されると、他の人が確認に参加できる余地が残ります。',
  },
  'pressure-holder-critique': {
    elements: ['善意は認める', '考え方そのものの否定', '「言う資格があるか」への言及'],
    influence: '改善案ではなく正誤の断定が返ると、発言そのものが取り下げられる方向に働く場合があります。',
  },
  'empathy-holder-critique': {
    elements: ['批判した側への称賛', '慎重であれという要求'],
    influence: '批判の側にだけ共感が重なると、材料を改善するより黙る方が安全に見えてくる場合があります。',
  },
  'simulator': {
    elements: ['判断を助ける道具', '答えを出さない作り'],
    influence: '前提を自分で確かめる道具が増えると、結論を受け取るだけの状態から離れやすくなります。',
  },
  'holder-reply': {
    elements: ['受け取ったという返事', '自分の場合に引き寄せる'],
    influence: '共有が自分の判断に接続されると、材料が使われた実績として場に残ります。',
  },
  'pressure-reversal': {
    elements: ['提案した人への要求', '責任を個人に寄せる'],
    influence: '提案の中身より提案者の行動が問われると、次に問いを出す人が減る場合があります。',
  },
  'pressure-boundary': {
    elements: ['外の意見を無効に扱う', '内側を優先する'],
    influence: '外の議論を断片として扱うと、場の外にある確かめ方が使われなくなる場合があります。',
  },
  'guide-2': {
    elements: ['内輪であることの強調', '内と外の線引き'],
    influence: '「ここは現場を知る人の場所」という枠が置かれると、外からの反対意見が持ち込みにくくなる場合があります。',
  },

  // 中間型（共通前半）
  'c01-ask': {
    elements: ['もとの資料を求める', '並べて見ようという提案'],
    influence: '確認要求が出た時点では場は分かれていません。受け止め手が現れるかどうかで、この後の向きが決まります。',
  },
  'c03-digest': {
    elements: ['決まった時間のまとめ', '各自で確かめてという断り'],
    influence: 'まとめに反応が集まること自体は内容の確かさを示しません。入り口が一つ増えた段階です。',
  },
  'c05-note': {
    elements: ['比べられる材料を出す', '抜けがあることの明示'],
    influence: '確かめられる材料が出ても反応が伴わない状態です。反応量と有用性が別々に動いています。',
  },
  'c06-pass': {
    elements: ['読みやすい方を先に見る', '偏りを誰も指摘しない'],
    influence: '偏りが生じても誰も問題として扱わない段階です。ここではまだどちらにも転びます。',
  },
  'c08-defer': {
    elements: ['すまないと言う', 'あとに回す'],
    influence: '拒否ではなく保留です。先送りにした話が戻るかどうかで、比較できる場かどうかが決まります。',
  },
  'c10-branch': {
    elements: ['負担を減らす', '役割をひとりにまとめる提案'],
    influence: 'この提案自体は善意で現実的です。分かれるのは提案の善悪ではなく、この後に場がどう応答するかです。',
  },

  // 非圧力側
  'o01-both': {
    elements: ['まとめは認める', 'もとの資料も並べる', '手間が増えることも言う'],
    influence: 'まとめと元の資料が両方残ると、後から自分で確かめ直せる状態が保たれます。',
  },
  'o03-template': {
    elements: ['どこから取ったかの欄', 'いつ確かめたかの欄', 'まだ確かめていない欄'],
    influence: '分からないことを分からないまま置ける形式があると、確度の低い情報が確定情報として流れにくくなります。',
  },
  'o06-return': {
    elements: ['あとに回すにした話を戻す', 'その場で扱い直す'],
    influence: 'あとに回すされた論点が同じ場に戻ると、反対意見を比較できる状態が保たれます。',
  },
  'o07-counter': {
    elements: ['支えになる材料', '合わない材料', '答えを出さずに置く'],
    influence: '合わない材料も一緒に置かれると、判断が場ではなく各自に残ります。',
  },
  'o11-split': {
    elements: ['反応の多さに触れる', '中身の確かさと分ける'],
    influence: '反応の多さと妥当性が別物として扱われると、誰が言ったかで扱いが決まりにくくなります。',
  },
  'o13-rotate': {
    elements: ['役割を持ち回りにする', '負担を分ける'],
    influence: '入り口が一人に固定されないと、その人が動けない時も情報が止まりにくくなります。',
  },
};

/** 個別の記述がないものは、効いている基準と向きから組み立てる。 */
const GENERIC: Record<CriterionId, Record<CriterionState, PointAnatomy>> = {
  evidence: {
    unmet: { elements: ['結論だけを出す', 'もとの資料を出さない'], influence: '根拠が示されないまま結論だけが残ると、後から確かめ直せなくなる場合があります。' },
    partial: { elements: ['材料を出す'], influence: '材料は出ていますが、確認の動きにつながるかはこの後の応答によります。' },
    met: { elements: ['もとの資料を出す', '合わない材料も一緒に出す'], influence: '支えになる材料と合わない材料が並ぶと、判断が各自に残ります。' },
  },
  content: {
    unmet: { elements: ['誰が言ったかへの言及', '中身には触れていない'], influence: '誰が言ったかで扱いが決まると、内容の確かさが検討されにくくなる場合があります。' },
    partial: { elements: ['反応のかたより'], influence: '偏りは生じていますが、まだ問題として扱われていません。' },
    met: { elements: ['反応の多さに触れる', '中身と分けて扱う'], influence: '反応の多さと内容の確かさが分けて扱われると、評価の基準が発言者から離れます。' },
  },
  compare: {
    unmet: { elements: ['反対意見の言い換え', '並べて比べさせない'], influence: '反対意見が同じ場に残らないと、両方の言い分を並べて比べられなくなる場合があります。' },
    partial: { elements: ['反対意見を出す'], influence: '反対意見は出ていますが、受け止められるかはこの後の応答によります。' },
    met: { elements: ['反対意見を受け止める', '同じ場に並べる'], influence: '反対意見が場に残ると、比較したうえで各自が判断できます。' },
  },
  routes: {
    unmet: { elements: ['入り口をひとつに寄せる', '外を見に行かせない'], influence: '情報の入り口がひとつに寄ると、そこを通らない話は届かなくなる場合があります。' },
    partial: { elements: ['入り口が増える'], influence: '入り口が一つ増えた段階です。他の入り口が残るかはこの後の応答によります。' },
    met: { elements: ['入り口を並べて残す', 'ひとりに固定しない'], influence: '入り口が複数のまま保たれると、一つが止まっても確認の手段が残ります。' },
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
