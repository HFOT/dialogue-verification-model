import type { Lang } from '../i18n/lang';
import { pick } from '../i18n/lang';
import type { CriterionId } from './types';

/**
 * 自己点検（別入口）。
 * 実在のコミュニティを診断するものではなく、
 * 「回答者が今そこをどう見ているか」を本人が確かめるための道具。
 * 回答はブラウザの状態にのみ保持し、どこにも送らない。自由記述は受け取らない。
 */

export type Answer = 'often' | 'sometimes' | 'never' | 'unknown';

export function answersList(lang: Lang = 'ja'): { id: Answer; label: string }[] {
  return lang === 'en'
    ? [
        { id: 'often', label: 'Often' },
        { id: 'sometimes', label: 'Sometimes' },
        { id: 'never', label: 'No' },
        { id: 'unknown', label: "Don't know" },
      ]
    : [
        { id: 'often', label: 'よくある' },
        { id: 'sometimes', label: 'たまにある' },
        { id: 'never', label: 'ない' },
        { id: 'unknown', label: 'わからない' },
      ];
}
export const ANSWERS = answersList('ja');

/** converge = 入り口がひとつに寄っていく側の兆候 / distribute = 複数のまま保たれる側の兆候 */
export type Polarity = 'converge' | 'distribute';

export type SelfQuestion = { id: string; criterion: CriterionId; polarity: Polarity; scene: string };

export function selfQuestions(lang: Lang = 'ja'): SelfQuestion[] {
  const t = (ja: string, en: string) => pick(lang, ja, en);
  return [
    { id: 'q1', criterion: 'evidence', polarity: 'converge', scene: t('結論だけが共有されて、その根拠になった資料は出てこない。', 'Only the conclusion gets shared — the source behind it never appears.') },
    { id: 'q2', criterion: 'evidence', polarity: 'distribute', scene: t('ある主張に対して、それと食い違う材料も一緒に出てくる。', 'When a claim is made, material that conflicts with it comes out alongside it.') },
    { id: 'q3', criterion: 'content', polarity: 'converge', scene: t('同じ内容でも、誰が言ったかで場の反応が大きく変わる。', 'The same content gets a very different reaction depending on who said it.') },
    { id: 'q4', criterion: 'content', polarity: 'distribute', scene: t('反応が少なかった投稿でも、中身が良ければ後から拾われる。', 'A post that drew little reaction still gets picked up later if the content holds up.') },
    { id: 'q5', criterion: 'compare', polarity: 'converge', scene: t('根拠を尋ねた人が、答えを得られないまま流される。', 'Someone who asks for the source gets no answer and is left to drift.') },
    { id: 'q6', criterion: 'compare', polarity: 'distribute', scene: t('意見が割れた時、両方の言い分が同じ場に並ぶ。', 'When opinions split, both sides get laid out in the same room.') },
    { id: 'q7', criterion: 'routes', polarity: 'converge', scene: t('その場の外から情報を持ち込むと、歓迎されない空気になる。', 'Bringing in information from outside the room is met with a cold reception.') },
    { id: 'q8', criterion: 'routes', polarity: 'distribute', scene: t('同じことを、別の場所や資料でも確かめられる。', 'The same thing can be verified through another place or source.') },
  ];
}
export const SELF_QUESTIONS = selfQuestions('ja');

export function criterionShort(lang: Lang = 'ja'): Record<CriterionId, string> {
  return lang === 'en'
    ? { evidence: 'The original source', content: 'How content is treated', compare: 'How dissent is treated', routes: 'Entry points for information' }
    : { evidence: 'もとの資料', content: '中身の扱い', compare: '反対意見の扱い', routes: '情報の入り口' };
}
export const CRITERION_SHORT = criterionShort('ja');

export type SelfState = 'met' | 'partial' | 'unmet' | 'unknown';

const WEIGHT: Record<Answer, number> = { often: 2, sometimes: 1, never: 0, unknown: 0 };

export type SelfReading = { state: SelfState; score: number; observed: boolean };

/**
 * 基準ごとに、集約側の兆候と分散側の兆候を突き合わせる。
 * 「たまにある」は単発の観察なので確定させない。「よくある」が揃って初めて振れる。
 */
export function readSelf(answers: Record<string, Answer>): Record<CriterionId, SelfReading> {
  const reading = {} as Record<CriterionId, SelfReading>;
  const questions = SELF_QUESTIONS;
  for (const criterion of ['evidence', 'content', 'compare', 'routes'] as CriterionId[]) {
    const asked = questions.filter((question) => question.criterion === criterion);
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

export function selfResult(reading: Record<CriterionId, SelfReading>, lang: Lang = 'ja'): SelfResult {
  const t = (ja: string, en: string) => pick(lang, ja, en);
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
      headline: t('まだ像を結んでいません', "No clear picture yet"),
      body: t(
        '「わからない」が多く、判断の材料が足りていません。答えられないこと自体が観察結果です。その場のどこが見えていないのかを、まず確かめる価値があります。',
        'Too many "don\'t know" answers to judge from. Not being able to answer is itself an observation. It is worth first figuring out what part of the room you cannot see.',
      ),
      focus,
      unseen,
    };
  }
  if (unmet.length >= 2) {
    return {
      headline: t('あなたには、閉鎖型に見えています', 'To you, this looks like the closed type'),
      body: t(
        '情報の入り口や反対意見の扱いが、一方向に寄って見えている状態です。ただしこれは場の性質そのものではなく、あなたの位置から見えている像です。同じ場でも、別の人からは違って見える可能性があります。',
        "Entry points for information and how dissent gets treated look like they lean one way from where you stand. This is not a property of the room itself, though — it's the view from your position. Someone else in the same room might see it differently.",
      ),
      focus,
      unseen,
    };
  }
  if (met.length >= 3 && unmet.length === 0) {
    return {
      headline: t('あなたには、開放型に見えています', 'To you, this looks like the open type'),
      body: t(
        'もとの資料が開かれた形で共有され、反対意見が同じ場に残り、確かめる道が複数ある状態に見えています。ここで確かめる価値があるのは、それがどの範囲まで成り立っているかです。見えていない場所には別の構造があるかもしれません。',
        'The original source looks openly shared, dissent looks like it stays in the room, and there look to be multiple ways to verify things. What is worth checking here is how far that actually extends. Somewhere you can\'t see may work differently.',
      ),
      focus,
      unseen,
    };
  }
  return {
    headline: t('あなたには、中間型に見えています', 'To you, this looks like the middling type'),
    body: t(
      'どちらにも振り切っていません。中心になる人がいない場は、この状態から始まり、何かをきっかけにどちらかへ寄っていきます。今どこに違和感があるかを見ておくと、寄っていく方向が見えます。',
      "It hasn't tipped fully either way. A room with no central figure tends to start out like this and drift toward one side or the other from some trigger. Noticing where the unease sits now can hint at which way it will drift.",
    ),
    focus,
    unseen,
  };
}

export function selfDisclaimer(lang: Lang = 'ja'): string {
  return pick(
    lang,
    'これは診断ではありません。あなたが今その場をどう見ているかの記録です。回答はこのブラウザの中だけで処理され、どこにも送信されません。同じ場でも、立場が違えば違う結果になります。',
    'This is not a diagnosis. It is a record of how you currently see that room. Your answers are processed only in this browser and never sent anywhere. The same room can produce a different result for someone in a different position.',
  );
}
export const SELF_DISCLAIMER = selfDisclaimer('ja');

/**
 * 試せる言い回しの例。
 * 架空の会話データ（open-run.ts）に実際に書かれている3つの文で、
 * シミュレーション（scripts/simulate.mjs のレバー掃引）でも開放側への効果が大きかった要素に対応する。
 * ただし効果量はそのシミュレーションの著者が置いたパラメータ上のものであり、
 * この言い回し自体の効果を実証したものではない。断定ではなく、試す材料として示す。
 */
export type PhraseExample = { label: string; text: string; source: string };

export function phraseExamples(lang: Lang = 'ja'): PhraseExample[] {
  const t = (ja: string, en: string) => pick(lang, ja, en);
  return [
    {
      label: t('元の資料も残す', 'Keep the original source too'),
      text: t(
        'まとめは助かります。ただ、まとめだけになると後から確かめられないので、元の資料へのリンクも一緒に置きませんか。',
        "The digest helps. But if it's the only thing left, we can't check back later — could we also link the original material alongside it?",
      ),
      source: 'app/data/open-run.ts',
    },
    {
      label: t('固定の担当者を置かない', 'Do not fix it on one person'),
      text: t(
        'まとめ役は固定しないで持ち回りにしませんか。特定の一人を通さないと情報が届かない形は、その人の負担も大きいので。',
        "Should we rotate who organizes the digest instead of fixing it on one person? Routing everything through a single point is a heavy burden on that person too.",
      ),
      source: 'app/data/open-run.ts',
    },
    {
      label: t('保留にした話を戻す', 'Bring a deferred point back'),
      text: t('さっき保留になった話、ここで戻していいですか。', "Can we bring back the point that got deferred earlier?"),
      source: 'app/data/open-run.ts',
    },
  ];
}
export const PHRASE_EXAMPLES = phraseExamples('ja');
