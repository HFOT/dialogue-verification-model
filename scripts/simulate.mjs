/**
 * 合成コミュニティのエージェント・シミュレーション。
 *
 * 目的: 仮説 H1（分岐は集約提案そのものではなく、その前の応答履歴で決まる）を、
 *       明示したパラメータの上で反証可能な形にして走らせる。
 *
 * これは実在の集団についての証拠ではない。パラメータは著者が置いたものであり、
 * 結果はこのパラメータの上でしか意味を持たない。乱数は種を固定してあるので、
 * 同じコードを走らせれば誰でも同じ数値を再現できる。
 *
 * 実行: node scripts/simulate.mjs
 * 出力: app/data/simulation.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// ---- 再現可能な擬似乱数 (mulberry32) ----
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- パラメータ（すべて明示。変えれば結果も変わる） ----
const P = {
  runs: 100000,
  rounds: 40,
  initialMembers: 12,
  startOpenness: 0.5,
  startConcentration: 0.3,
  // 1ラウンドで起きる出来事の確率
  event: { ask: 0.3, digest: 0.25, join: 0.15, leave: 0.15, proposal: 0.15 },
  // 確認要求が受け止められる確率 = 在席者の発言傾向の平均 * w1 + 開放度 * w2
  answerWeight: { voice: 0.6, openness: 0.4 },
  step: { answered: 0.06, ignored: 0.06, digest: 0.04, digestWhenClosed: 0.03 },
  proposal: { toBoth: { concentration: -0.1, openness: 0.08 }, toSingle: { concentration: 0.15, openness: -0.1 } },
  newcomer: { discomfortAbove: 0.6, discomfortLeaveProb: 0.6 },
  // 開放度が低いほど、発言傾向の高い成員から抜けやすい（発言より離脱）
  exitVoiceBias: 0.7,
  classify: { closedConc: 0.6, closedOpen: 0.45, openConc: 0.45, openOpen: 0.55 },
};

const clamp = (x) => Math.max(0, Math.min(1, x));

function runOnce(rand, { proposalPresent }) {
  let members = Array.from({ length: P.initialMembers }, () => ({ voice: rand() }));
  let openness = P.startOpenness;
  let concentration = P.startConcentration;

  let asksBefore = 0;
  let answeredBefore = 0;
  let asksAfter = 0;
  let answeredAfter = 0;
  let recentAnswers = [];
  let proposalDone = false;
  let proposalRound = null;
  let joins = 0;
  let discomfortExits = 0;
  let voiceExits = 0;

  for (let round = 0; round < P.rounds; round += 1) {
    const roll = rand();
    let acc = 0;
    const pick = (p) => {
      acc += p;
      return roll < acc;
    };

    if (pick(P.event.ask)) {
      const meanVoice = members.length ? members.reduce((sum, m) => sum + m.voice, 0) / members.length : 0;
      const pAnswer = meanVoice * P.answerWeight.voice + openness * P.answerWeight.openness;
      const answered = rand() < pAnswer;
      if (proposalDone) {
        asksAfter += 1;
        if (answered) answeredAfter += 1;
      } else {
        asksBefore += 1;
        if (answered) answeredBefore += 1;
      }
      recentAnswers.push(answered);
      if (recentAnswers.length > 2) recentAnswers.shift();
      openness = clamp(openness + (answered ? P.step.answered : -P.step.ignored));
    } else if (pick(P.event.digest)) {
      concentration = clamp(concentration + P.step.digest + (openness < 0.4 ? P.step.digestWhenClosed : 0));
    } else if (pick(P.event.join)) {
      joins += 1;
      const newcomer = { voice: rand() };
      // 経路が寄っている場に、確かめたい新規参加者が入ると違和感を持つ
      const uneasy = concentration > P.newcomer.discomfortAbove && newcomer.voice > 0.5;
      if (uneasy && rand() < P.newcomer.discomfortLeaveProb) discomfortExits += 1;
      else members.push(newcomer);
    } else if (pick(P.event.leave)) {
      if (members.length > 3) {
        // 開放度が低いほど、発言傾向の高い者が先に抜ける
        const bias = (1 - openness) * P.exitVoiceBias;
        const sorted = [...members].sort((a, b) => b.voice - a.voice);
        const index = rand() < bias ? 0 : Math.floor(rand() * sorted.length);
        const gone = sorted[index];
        if (gone.voice > 0.6) voiceExits += 1;
        members = members.filter((m) => m !== gone);
      }
    } else if (pick(P.event.proposal)) {
      if (proposalPresent && !proposalDone) {
        proposalDone = true;
        proposalRound = round;
        // 提案の文面は一定。分かれるのは直前の応答履歴（H1 の操作化）
        const recovered = recentAnswers.length === 2 && recentAnswers.every(Boolean);
        const effect = recovered ? P.proposal.toBoth : P.proposal.toSingle;
        concentration = clamp(concentration + effect.concentration);
        openness = clamp(openness + effect.openness);
      }
    }
  }

  const outcome =
    concentration > P.classify.closedConc && openness < P.classify.closedOpen
      ? 'closed'
      : concentration < P.classify.openConc && openness > P.classify.openOpen
        ? 'open'
        : 'middle';

  return {
    outcome,
    openness,
    concentration,
    preRecovery: asksBefore ? answeredBefore / asksBefore : null,
    postRecovery: asksAfter ? answeredAfter / asksAfter : null,
    proposalPresent,
    proposalRound,
    joins,
    discomfortExits,
    voiceExits,
    members: members.length,
  };
}

function summarize(rows) {
  const n = rows.length;
  const count = (fn) => rows.filter(fn).length;
  return {
    n,
    closed: count((r) => r.outcome === 'closed'),
    open: count((r) => r.outcome === 'open'),
    middle: count((r) => r.outcome === 'middle'),
  };
}

function bucketByRecovery(rows) {
  const buckets = [
    { label: '0–20%', lo: 0, hi: 0.2 },
    { label: '20–40%', lo: 0.2, hi: 0.4 },
    { label: '40–60%', lo: 0.4, hi: 0.6 },
    { label: '60–80%', lo: 0.6, hi: 0.8 },
    { label: '80–100%', lo: 0.8, hi: 1.01 },
  ];
  return buckets.map((b) => {
    const rows_ = rows.filter((r) => r.preRecovery !== null && r.preRecovery >= b.lo && r.preRecovery < b.hi);
    const s = summarize(rows_);
    return {
      label: b.label,
      n: s.n,
      closedRate: s.n ? s.closed / s.n : 0,
      openRate: s.n ? s.open / s.n : 0,
      middleRate: s.n ? s.middle / s.n : 0,
    };
  });
}

function main() {
  const rand = rng(20260904);
  const withProposal = [];
  const withoutProposal = [];

  for (let i = 0; i < P.runs; i += 1) {
    const proposalPresent = i % 2 === 0; // 半々に割り付ける
    const row = runOnce(rand, { proposalPresent });
    (proposalPresent ? withProposal : withoutProposal).push(row);
  }

  const all = [...withProposal, ...withoutProposal];
  const proposed = withProposal.filter((r) => r.proposalRound !== null);

  // 新規参加者の定着：経路が寄った場かどうかで分ける
  const highConc = all.filter((r) => r.concentration > 0.6);
  const lowConc = all.filter((r) => r.concentration <= 0.6);
  const retention = (rows) => {
    const joins = rows.reduce((sum, r) => sum + r.joins, 0);
    const exits = rows.reduce((sum, r) => sum + r.discomfortExits, 0);
    return joins ? 1 - exits / joins : null;
  };

  const result = {
    generatedBy: 'scripts/simulate.mjs',
    seed: 20260904,
    parameters: P,
    total: all.length,
    overall: summarize(all),
    byProposal: {
      with: summarize(withProposal),
      without: summarize(withoutProposal),
    },
    byPreRecovery: bucketByRecovery(proposed),
    newcomer: {
      totalJoins: all.reduce((sum, r) => sum + r.joins, 0),
      discomfortExits: all.reduce((sum, r) => sum + r.discomfortExits, 0),
      retentionHighConcentration: retention(highConc),
      retentionLowConcentration: retention(lowConc),
    },
    voiceExits: {
      closed: withProposal.concat(withoutProposal).filter((r) => r.outcome === 'closed').reduce((s, r) => s + r.voiceExits, 0),
      open: withProposal.concat(withoutProposal).filter((r) => r.outcome === 'open').reduce((s, r) => s + r.voiceExits, 0),
    },
  };

  result.leverSweep = leverSweep(rand, 100000 / 8);
  result.shockSweep = shockSweep(rand, 100000 / 4);

  const out = 'app/data/simulation.json';
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify({ overall: result.overall, byProposal: result.byProposal, byPreRecovery: result.byPreRecovery, newcomer: result.newcomer }, null, 2));
}


// ---- レバー掃引 ----
// 集約提案に、どの言い回し要素を足すと結果が変わるかを、要素の組み合わせ (2^3) で走査する。
// 各レバーの効果量はここで著者が定義したものであり、実測ではない。
// 「この機構ならこう動く」という設計仮説の表現であって、現実の言葉の効果を証明するものではない。
function runLever(rand, levers) {
  let openness = P.startOpenness;
  let concentration = P.startConcentration;
  for (let round = 0; round < P.rounds; round += 1) {
    const roll = rand();
    if (roll < 0.4) {
      // 確認要求。keepSource / inviteReturn があるほど受け止められやすい
      const pAnswer = 0.35 + (levers.keepSource ? 0.12 : 0) + (levers.inviteReturn ? 0.15 : 0);
      const answered = rand() < pAnswer;
      openness = clamp(openness + (answered ? P.step.answered : -P.step.ignored));
    } else if (roll < 0.7) {
      // 集約提案の適用。noFixedOwner があるほど集中しにくい
      const concDelta = 0.12 - (levers.noFixedOwner ? 0.1 : 0) - (levers.keepSource ? 0.05 : 0);
      const openDelta = -0.05 + (levers.keepSource ? 0.09 : 0) + (levers.noFixedOwner ? 0.05 : 0) + (levers.inviteReturn ? 0.04 : 0);
      concentration = clamp(concentration + concDelta);
      openness = clamp(openness + openDelta);
    }
  }
  return concentration > P.classify.closedConc && openness < P.classify.closedOpen ? 'closed' : concentration < P.classify.openConc && openness > P.classify.openOpen ? 'open' : 'middle';
}

function leverSweep(rand, trialsPerCondition = 100000 / 8) {
  const conditions = [];
  for (const keepSource of [false, true]) {
    for (const noFixedOwner of [false, true]) {
      for (const inviteReturn of [false, true]) {
        const levers = { keepSource, noFixedOwner, inviteReturn };
        let closed = 0;
        let open = 0;
        for (let i = 0; i < trialsPerCondition; i += 1) {
          const outcome = runLever(rand, levers);
          if (outcome === 'closed') closed += 1;
          if (outcome === 'open') open += 1;
        }
        conditions.push({
          levers,
          n: trialsPerCondition,
          closedRate: closed / trialsPerCondition,
          openRate: open / trialsPerCondition,
        });
      }
    }
  }
  return conditions.sort((a, b) => a.closedRate - b.closedRate);
}

// ---- 外部要因の注入実験 ----
// 「通常の場」に、資金・影響力・権力のいずれかが割り込むと、どれだけ・どれくらいの速さで歪むか。
// 効果量はここでも著者が定義したものであり、実測ではない。
// 「この機構にこの種の注入を入れると、この速さで閉じる」という設計仮説の表現。
const SHOCK_ROUNDS = 60;
const SHOCK_KINDS = ['none', 'funding', 'influence', 'power'];

function runShock(rand, kind) {
  let openness = 0.55;
  let concentration = 0.25;
  const shockRound = kind === 'none' ? null : Math.floor(SHOCK_ROUNDS * 0.3 + rand() * SHOCK_ROUNDS * 0.2);
  let closedRound = null;

  for (let round = 0; round < SHOCK_ROUNDS; round += 1) {
    const roll = rand();
    const afterShock = shockRound !== null && round >= shockRound;

    if (roll < 0.35) {
      // 確認要求。influence（影響力）が入り込むと、以後は特定の声が答えを塗り替え、素の受け止め率が下がる
      let pAnswer = 0.2 + 0.5 * openness;
      if (kind === 'influence' && afterShock) pAnswer *= 0.5;
      const answered = rand() < pAnswer;
      openness = clamp(openness + (answered ? 0.05 : -0.05));
    } else if (roll < 0.55) {
      // 定例の集約行為。influence が入り込むと、集約そのものが少しずつ濃くなる
      concentration = clamp(concentration + 0.02 + (kind === 'influence' && afterShock ? 0.015 : 0));
    }

    if (kind !== 'none' && round === shockRound) {
      if (kind === 'funding') {
        // 資金：特定の提案・特定の話者に予算がつき、そこへ議題が一気に寄る
        concentration = clamp(concentration + 0.35);
        openness = clamp(openness - 0.15);
      } else if (kind === 'power') {
        // 権力：正式な決定権が一人に付与され、即座に確定させられる
        concentration = clamp(concentration + 0.5);
        openness = clamp(openness - 0.25);
      }
      // influence は一回の跳躍ではなく、以降の各ラウンドへの継続的な偏りとして効く（上のロジック）
    }

    if (closedRound === null && concentration > P.classify.closedConc && openness < P.classify.closedOpen) {
      closedRound = round;
    }
  }

  const outcome =
    concentration > P.classify.closedConc && openness < P.classify.closedOpen
      ? 'closed'
      : concentration < P.classify.openConc && openness > P.classify.openOpen
        ? 'open'
        : 'middle';

  return { kind, outcome, closedRound, shockRound };
}

function shockSweep(rand, trialsPerKind = 100000 / 4) {
  return SHOCK_KINDS.map((kind) => {
    const rows = Array.from({ length: trialsPerKind }, () => runShock(rand, kind));
    const closed = rows.filter((r) => r.outcome === 'closed');
    const roundsToClose = closed.map((r) => r.closedRound).filter((v) => v !== null);
    const mean = roundsToClose.length ? roundsToClose.reduce((s, v) => s + v, 0) / roundsToClose.length : null;
    return {
      kind,
      n: trialsPerKind,
      closedRate: closed.length / trialsPerKind,
      openRate: rows.filter((r) => r.outcome === 'open').length / trialsPerKind,
      middleRate: rows.filter((r) => r.outcome === 'middle').length / trialsPerKind,
      meanRoundsToClose: mean,
      rounds: SHOCK_ROUNDS,
    };
  });
}

main();
