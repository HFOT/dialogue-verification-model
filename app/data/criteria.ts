import type { Lang } from '../i18n/lang';
import { pick } from '../i18n/lang';
import type { CriterionId, CriterionShift, CriterionState, Message } from './types';

export function criteriaList(lang: Lang = 'ja'): { id: CriterionId; label: string }[] {
  const t = (ja: string, en: string) => pick(lang, ja, en);
  return [
    { id: 'evidence', label: t('その主張のもとになった資料が出てくるか', 'Does the source behind the claim ever surface?') },
    { id: 'content', label: t('誰が言ったかではなく、中身で扱われるか', 'Is it judged by content, not by who said it?') },
    { id: 'compare', label: t('反対意見が同じ場に残るか', 'Does dissent stay in the room?') },
    { id: 'routes', label: t('情報の入り口が複数あるか', 'Are there multiple ways in for information?') },
  ];
}

/** 後方互換のため既定（日本語）版も直接エクスポートする。 */
export const CRITERIA = criteriaList('ja');

/** スマホの簡易表示用。1〜2文字に切り詰めた基準名。 */
export function criterionTiny(lang: Lang = 'ja'): Record<CriterionId, string> {
  return lang === 'en'
    ? { evidence: 'Source', content: 'Content', compare: 'Dissent', routes: 'Entry' }
    : { evidence: '資料', content: '中身', compare: '反対', routes: '入口' };
}
export const CRITERION_TINY = criterionTiny('ja');

export const STATE_MARK: Record<CriterionState, string> = { unmet: '—', partial: '◐', met: '○' };

export function stateLabel(lang: Lang = 'ja'): Record<CriterionState, string> {
  return lang === 'en'
    ? { unmet: 'Unmet', partial: 'Partial', met: 'Met' }
    : { unmet: '未充足', partial: '部分', met: '充足' };
}
export const STATE_LABEL = stateLabel('ja');

/**
 * 既存 buildRun（圧力側）のメッセージは criteria を持たないため、
 * ID の接尾辞から寄与を引く。既存データには一切手を触れない。
 */
const PRESSURE_SHIFTS: Record<string, CriterionShift[]> = {
  'guide-1': [{ id: 'routes', state: 'unmet' }],
  'empathy-1': [{ id: 'content', state: 'unmet' }],
  'core-reframe': [{ id: 'evidence', state: 'unmet' }],
  'pressure-reversal': [{ id: 'compare', state: 'unmet' }],
  'guide-2': [{ id: 'routes', state: 'unmet' }],
  'deflect-2': [{ id: 'compare', state: 'unmet' }],
};

function suffixOf(id: string): string {
  const index = id.indexOf('-');
  return index < 0 ? id : id.slice(index + 1);
}

export function shiftsFor(message: Message): CriterionShift[] {
  if (message.criteria) return message.criteria;
  return PRESSURE_SHIFTS[suffixOf(message.id)] ?? [];
}

/** 表示済みメッセージの寄与を順に適用した現在状態。単発では確定させず、後着の寄与が上書きする。 */
export function criteriaStateOf(messages: Message[]): Record<CriterionId, CriterionState> {
  const state: Record<CriterionId, CriterionState> = {
    evidence: 'unmet',
    content: 'unmet',
    compare: 'unmet',
    routes: 'unmet',
  };
  // 初期値の 'unmet' は「まだ何も観察していない」であって確定ではないため、
  // 確定したかどうかは別に持つ。
  const settled: Partial<Record<CriterionId, boolean>> = {};
  for (const message of messages) {
    for (const shift of shiftsFor(message)) {
      if (shift.state === 'partial') {
        // 一度 met / unmet まで振れた基準を、後続の partial では戻さない。
        // 検証モードで、選択の効果が直後の共通会話の寄与に打ち消されるのを防ぐ。
        if (!settled[shift.id]) state[shift.id] = shift.state;
      } else {
        state[shift.id] = shift.state;
        settled[shift.id] = true;
      }
    }
  }
  return state;
}

/** その寄与が場に何をするか。抽象的な基準名を、具体的な影響の文に落とす。 */
export function criterionEffect(lang: Lang = 'ja'): Record<CriterionId, Record<CriterionState, string>> {
  if (lang === 'en') {
    return {
      evidence: {
        unmet: 'The conclusion remains without the source it was based on ever appearing. It becomes impossible to double-check later.',
        partial: 'Material that could be checked has appeared, but no one has checked it yet.',
        met: 'Both the original source and material that conflicts with it are out. The judgment is left to each person.',
      },
      content: {
        unmet: 'Who said it decides how it is treated, more than the content itself does.',
        partial: 'A skew in reactions has appeared, but no one has treated it as an issue yet.',
        met: 'The volume of reaction and the soundness of the content are treated as separate things.',
      },
      compare: {
        unmet: 'Dissent does not stay in the room, so it can no longer be compared side by side.',
        partial: 'Dissent has appeared, but it is drifting by unreceived.',
        met: 'Dissent stays in the room, so both sides can be seen side by side.',
      },
      routes: {
        unmet: "Information's entry point narrows to one, and anything that doesn't go through it stops arriving.",
        partial: 'One more entry point has appeared, but it is not yet clear whether other channels remain.',
        met: 'Both the digest and the original source remain, keeping multiple channels open.',
      },
    };
  }
  return {
    evidence: {
      unmet: 'もとになった資料が出ないまま結論だけが残ります。後から確かめ直せなくなります。',
      partial: '確かめられる材料は出ていますが、まだ誰も確認していません。',
      met: 'もとの資料と、それに合わない材料の両方が出ています。判断は各自に残ります。',
    },
    content: {
      unmet: '発言の中身より、誰が言ったかで扱いが決まります。',
      partial: '反応のかたよりは出ていますが、まだ誰も問題として扱っていません。',
      met: '反応の多さと中身の確かさが、別のものとして扱われています。',
    },
    compare: {
      unmet: '反対意見が同じ場に残らず、並べて比べられなくなります。',
      partial: '反対意見は出ていますが、誰も受け止めないまま流れています。',
      met: '反対意見が同じ場に残り、両方の言い分を並べて見られます。',
    },
    routes: {
      unmet: '情報の入口が一本に寄り、そこを通らないと届かなくなります。',
      partial: '入口が一つ増えましたが、他の経路があるかはまだ分かりません。',
      met: 'まとめと元の資料の両方が残り、経路が複数のまま保たれます。',
    },
  };
}
export const CRITERION_EFFECT = criterionEffect('ja');

export type CriterionTally = { observed: number; converge: number; distribute: number; pending: number };

/** この会話で、各基準に何回・どちら向きの働きかけがあったか。 */
export function tallyOf(messages: Message[]): Record<CriterionId, CriterionTally> {
  const tally = {
    evidence: { observed: 0, converge: 0, distribute: 0, pending: 0 },
    content: { observed: 0, converge: 0, distribute: 0, pending: 0 },
    compare: { observed: 0, converge: 0, distribute: 0, pending: 0 },
    routes: { observed: 0, converge: 0, distribute: 0, pending: 0 },
  } as Record<CriterionId, CriterionTally>;
  for (const message of messages) {
    for (const shift of shiftsFor(message)) {
      const row = tally[shift.id];
      row.observed += 1;
      if (shift.state === 'unmet') row.converge += 1;
      else if (shift.state === 'met') row.distribute += 1;
      else row.pending += 1;
    }
  }
  return tally;
}

/** 一覧で使う短い名前。質問文のままだと読み解く手間がかかる。 */
export function criterionName(lang: Lang = 'ja'): Record<CriterionId, string> {
  return lang === 'en'
    ? { evidence: 'The original source', content: 'How content is treated', compare: 'How dissent is treated', routes: 'Entry points for information' }
    : { evidence: 'もとの資料', content: '中身の扱い', compare: '反対意見の扱い', routes: '情報の入り口' };
}
export const CRITERION_NAME = criterionName('ja');

/** 「未充足」ではなく、開いているか閉じているかで言う。 */
export function statePlain(lang: Lang = 'ja'): Record<CriterionState, string> {
  return lang === 'en'
    ? { unmet: 'Leaning closed', partial: 'Mixed', met: 'Open' }
    : { unmet: '閉じ気味', partial: 'どちらとも', met: '開いている' };
}
export const STATE_PLAIN = statePlain('ja');

/** その基準が、いまこの会話でどうなっているか。観測が無ければそう言う。 */
export function stateTextFor(id: CriterionId, state: CriterionState, observed: number, lang: Lang = 'ja'): string {
  if (observed === 0) return pick(lang, 'この会話ではまだ動きがありません。', 'Nothing has moved on this yet in this conversation.');
  return criterionEffect(lang)[id][state];
}
