import { buildCommon } from './common-run';
import { criteriaStateOf } from './criteria';
import { VERIFY_STAGES } from './verify';
import type { Direction, VerifyOption } from './verify';
import type { CriterionId, CriterionShift, CriterionState, Message } from './types';

/**
 * 検証モードの全経路を網羅列挙する。
 * 標本ではなく全数である（3局面 × 各3択 = 27通り）。
 * シミュレータ本体と同じデータ・同じ規則を使うので、数値が実装からずれない。
 */
export type CensusOutcome = 'open' | 'closed' | 'ambiguous';

export type CensusPath = {
  choices: string[];
  directions: Direction[];
  outcome: CensusOutcome;
  states: Record<CriterionId, CriterionState>;
  met: number;
  unmet: number;
};

function replyMessage(index: number, option: VerifyOption, repeat: number): Message[] {
  const shifts: CriterionShift[] | undefined = option.target
    ? [{ id: option.target.id, state: (repeat >= 2 ? option.target.final : 'partial') as CriterionState }]
    : undefined;
  return [
    { id: `census-${index}-you`, author: 'あなた', initial: 'あ', role: 'constructive', text: option.text, reactions: [] },
    {
      id: `census-${index}-reply`,
      author: option.reply.author,
      initial: option.reply.initial,
      role: option.reply.role,
      text: option.reply.text,
      reactions: option.reply.reactions,
      criteria: shifts,
    },
  ];
}

function outcomeOf(directions: Direction[]): CensusOutcome {
  const converge = directions.filter((d) => d === 'converge').length;
  const distribute = directions.filter((d) => d === 'distribute').length;
  if (converge >= 2) return 'closed';
  if (distribute >= 2) return 'open';
  return 'ambiguous';
}

export function censusPaths(seed = 0): CensusPath[] {
  const common = buildCommon(seed);
  const paths: CensusPath[] = [];

  const walk = (stageIndex: number, chosen: VerifyOption[]) => {
    if (stageIndex === VERIFY_STAGES.length) {
      // 本体と同じ順序で組み立てる：共通前半を stage.at まで積み、その直後に選択を差し込む
      const messages: Message[] = [];
      let cursor = 0;
      chosen.forEach((option, index) => {
        const stage = VERIFY_STAGES[index];
        messages.push(...common.slice(cursor, stage.at));
        cursor = stage.at;
        const directionsSoFar = chosen.slice(0, index + 1).map((item) => item.direction);
        const repeat = directionsSoFar.filter((d) => d === option.direction).length;
        messages.push(...replyMessage(index, option, repeat));
      });
      messages.push(...common.slice(cursor));

      const states = criteriaStateOf(messages);
      const values = Object.values(states);
      const directions = chosen.map((option) => option.direction);
      paths.push({
        choices: chosen.map((option) => option.id),
        directions,
        outcome: outcomeOf(directions),
        states,
        met: values.filter((state) => state === 'met').length,
        unmet: values.filter((state) => state === 'unmet').length,
      });
      return;
    }
    for (const option of VERIFY_STAGES[stageIndex].options) walk(stageIndex + 1, [...chosen, option]);
  };

  walk(0, []);
  return paths;
}

export type CensusSummary = {
  total: number;
  open: number;
  closed: number;
  ambiguous: number;
  /** 開放側の基準が一つでも確定した経路 */
  improved: number;
  /** 閉鎖側の基準が一つでも確定した経路 */
  degraded: number;
  /** どの基準も確定しなかった経路 */
  unchanged: number;
  /** 同一方向を2回以上選んだ経路 */
  repeated: number;
};

export function censusSummary(paths: CensusPath[]): CensusSummary {
  const repeated = paths.filter((path) => {
    const counts: Record<string, number> = {};
    for (const direction of path.directions) counts[direction] = (counts[direction] ?? 0) + 1;
    return Object.values(counts).some((count) => count >= 2);
  }).length;
  return {
    total: paths.length,
    open: paths.filter((p) => p.outcome === 'open').length,
    closed: paths.filter((p) => p.outcome === 'closed').length,
    ambiguous: paths.filter((p) => p.outcome === 'ambiguous').length,
    improved: paths.filter((p) => p.met > 0).length,
    degraded: paths.filter((p) => p.unmet > 0).length,
    unchanged: paths.filter((p) => p.met === 0 && p.unmet === 0).length,
    repeated,
  };
}
