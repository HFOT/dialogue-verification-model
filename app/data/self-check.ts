import type { CriterionId } from './types';

/**
 * 自己点検（別入口）。
 * 実在のコミュニティを診断するものではなく、
 * 「回答者が今そこをどう見ているか」を本人が確かめるための道具。
 * 回答はブラウザの状態にのみ保持し、どこにも送らない。自由記述は受け取らない。
 */

export type Answer = 'often' | 'sometimes' | 'never' | 'unknown';

export const ANSWERS: { id: Answer; label: string }[] = [
  { id: 'often', label: 'よくある' },
  { id: 'sometimes', label: 'たまにある' },
  { id: 'never', label: 'ない' },
  { id: 'unknown', label: 'わからない' },
];

/** converge = 入り口がひとつに寄っていく側の兆候 / distribute = 複数のまま保たれる側の兆候 */
export type Polarity = 'converge' | 'distribute';

export type SelfQuestion = { id: string; criterion: CriterionId; polarity: Polarity; scene: string };

export const SELF_QUESTIONS: SelfQuestion[] = [
  { id: 'q1', criterion: 'evidence', polarity: 'converge', scene: '結論だけが共有されて、その根拠になった資料は出てこない。' },
  { id: 'q2', criterion: 'evidence', polarity: 'distribute', scene: 'ある主張に対して、それと食い違う材料も一緒に出てくる。' },
  { id: 'q3', criterion: 'content', polarity: 'converge', scene: '同じ内容でも、誰が言ったかで場の反応が大きく変わる。' },
  { id: 'q4', criterion: 'content', polarity: 'distribute', scene: '反応が少なかった投稿でも、中身が良ければ後から拾われる。' },
  { id: 'q5', criterion: 'compare', polarity: 'converge', scene: '根拠を尋ねた人が、答えを得られないまま流される。' },
  { id: 'q6', criterion: 'compare', polarity: 'distribute', scene: '意見が割れた時、両方の言い分が同じ場に並ぶ。' },
  { id: 'q7', criterion: 'routes', polarity: 'converge', scene: 'その場の外から情報を持ち込むと、歓迎されない空気になる。' },
  { id: 'q8', criterion: 'routes', polarity: 'distribute', scene: '同じことを、別の場所や資料でも確かめられる。' },
];

export const CRITERION_SHORT: Record<CriterionId, string> = {
  evidence: 'もとの資料',
  content: '中身の扱い',
  compare: '反対意見の扱い',
  routes: '情報の入り口',
};

export type SelfState = 'met' | 'partial' | 'unmet' | 'unknown';

const WEIGHT: Record<Answer, number> = { often: 2, sometimes: 1, never: 0, unknown: 0 };

export type SelfReading = { state: SelfState; score: number; observed: boolean };

/**
 * 基準ごとに、集約側の兆候と分散側の兆候を突き合わせる。
 * 「たまにある」は単発の観察なので確定させない。「よくある」が揃って初めて振れる。
 */
export function readSelf(answers: Record<string, Answer>): Record<CriterionId, SelfReading> {
  const reading = {} as Record<CriterionId, SelfReading>;
  for (const criterion of ['evidence', 'content', 'compare', 'routes'] as CriterionId[]) {
    const asked = SELF_QUESTIONS.filter((question) => question.criterion === criterion);
    let score = 0;
    let observed = false;
    for (const question of asked) {
      const answer = answers[question.id];
      if (!answer || answer === 'unknown') continue;
      observed = true;
      score += question.polarity === 'distribute' ? WEIGHT[answer] : -WEIGHT[answer];
    }
    const state: SelfState = !observed ? 'unknown' : score >= 2 ? 'met' : score <= -2 ? 'unmet' : 'partial';
    reading[criterion] = { state, score, observed };
  }
  return reading;
}

export type SelfResult = { headline: string; body: string; focus: CriterionId[]; unseen: CriterionId[] };

export function selfResult(reading: Record<CriterionId, SelfReading>): SelfResult {
  const entries = Object.entries(reading) as [CriterionId, SelfReading][];
  const unmet = entries.filter(([, value]) => value.state === 'unmet');
  const met = entries.filter(([, value]) => value.state === 'met');
  const unseen = entries.filter(([, value]) => value.state === 'unknown').map(([id]) => id);
  const observed = entries.filter(([, value]) => value.observed);
  const scores = observed.map(([, value]) => value.score);
  const lowest = Math.min(...scores);
  // すべて同点なら偏りが無いということなので、どこも名指ししない。
  const focus =
    scores.length > 0 && lowest !== Math.max(...scores)
      ? observed.filter(([, value]) => value.score === lowest && value.state !== 'met').map(([id]) => id)
      : [];

  if (unseen.length >= 3) {
    return {
      headline: 'まだ像を結んでいません',
      body: '「わからない」が多く、判断の材料が足りていません。答えられないこと自体が観察結果です。その場のどこが見えていないのかを、まず確かめる価値があります。',
      focus,
      unseen,
    };
  }
  if (unmet.length >= 2) {
    return {
      headline: 'あなたには、情報の入り口がひとつに寄った場に見えています',
      body: '情報の入り口や反対意見の扱いが、一方向に寄って見えている状態です。ただしこれは場の性質そのものではなく、あなたの位置から見えている像です。同じ場でも、別の人からは違って見える可能性があります。',
      focus,
      unseen,
    };
  }
  if (met.length >= 3 && unmet.length === 0) {
    return {
      headline: 'あなたには、確かめる道が複数ある場に見えています',
      body: 'もとの資料が開かれた形で共有され、反対意見が同じ場に残り、確かめる道が複数ある状態に見えています。ここで確かめる価値があるのは、それがどの範囲まで成り立っているかです。見えていない場所には別の構造があるかもしれません。',
      focus,
      unseen,
    };
  }
  return {
    headline: 'あなたには、中間型に見えています',
    body: 'どちらにも振り切っていません。中心になる人がいない場は、この状態から始まり、何かをきっかけにどちらかへ寄っていきます。今どこに違和感があるかを見ておくと、寄っていく方向が見えます。',
    focus,
    unseen,
  };
}

export const SELF_DISCLAIMER =
  'これは診断ではありません。あなたが今その場をどう見ているかの記録です。回答はこのブラウザの中だけで処理され、どこにも送信されません。同じ場でも、立場が違えば違う結果になります。';
