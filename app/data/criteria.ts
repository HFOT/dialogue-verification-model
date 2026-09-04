import type { CriterionId, CriterionShift, CriterionState, Message } from './types';

export const CRITERIA: { id: CriterionId; label: string }[] = [
  { id: 'evidence', label: 'その主張のもとになった資料が出てくるか' },
  { id: 'content', label: '誰が言ったかではなく、中身で扱われるか' },
  { id: 'compare', label: '反対意見が同じ場に残るか' },
  { id: 'routes', label: '情報の入り口が複数あるか' },
];

/** スマホの簡易表示用。1〜2文字に切り詰めた基準名。 */
export const CRITERION_TINY: Record<CriterionId, string> = {
  evidence: '資料',
  content: '中身',
  compare: '反対',
  routes: '入口',
};

export const STATE_MARK: Record<CriterionState, string> = { unmet: '—', partial: '◐', met: '○' };
export const STATE_LABEL: Record<CriterionState, string> = { unmet: '未充足', partial: '部分', met: '充足' };

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
export const CRITERION_EFFECT: Record<CriterionId, Record<CriterionState, string>> = {
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
export const CRITERION_NAME: Record<CriterionId, string> = {
  evidence: 'もとの資料',
  content: '中身の扱い',
  compare: '反対意見の扱い',
  routes: '情報の入り口',
};

/** 「未充足」ではなく、開いているか閉じているかで言う。 */
export const STATE_PLAIN: Record<CriterionState, string> = {
  unmet: '閉じ気味',
  partial: 'どちらとも',
  met: '開いている',
};

/** その基準が、いまこの会話でどうなっているか。観測が無ければそう言う。 */
export function stateTextFor(id: CriterionId, state: CriterionState, observed: number): string {
  if (observed === 0) return 'この会話ではまだ動きがありません。';
  return CRITERION_EFFECT[id][state];
}
