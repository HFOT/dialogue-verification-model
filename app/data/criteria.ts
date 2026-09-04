import type { CriterionId, CriterionShift, CriterionState, Message } from './types';

export const CRITERIA: { id: CriterionId; label: string }[] = [
  { id: 'evidence', label: '根拠と反証が提示されるか' },
  { id: 'content', label: '発言者の資格ではなく内容が評価されるか' },
  { id: 'compare', label: '異論を同じ場で比較できるか' },
  { id: 'routes', label: '情報経路が複数あるか' },
];

/** スマホの簡易表示用。1〜2文字に切り詰めた基準名。 */
export const CRITERION_TINY: Record<CriterionId, string> = {
  evidence: '根拠',
  content: '内容',
  compare: '異論',
  routes: '経路',
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
