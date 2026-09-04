import type { CriterionId, Message } from './types';

export type Direction = 'converge' | 'distribute' | 'hold';

export type VerifyOption = {
  id: string;
  text: string;
  direction: Direction;
  /** 反復して初めて確定する。1回目は 'partial' 止まり、同じ方向が2回目以降で final に達する。 */
  target?: { id: CriterionId; final: 'unmet' | 'met' };
  reply: { author: string; initial: string; role: Message['role']; text: string; reactions: string[] };
};

export type VerifyStage = {
  id: string;
  /** 共通前半のうち、この本数が流れた直後に停止する */
  at: number;
  prompt: string;
  options: VerifyOption[];
};

export const VERIFY_STAGES: VerifyStage[] = [
  {
    id: 'stage-dissent',
    at: 2,
    prompt: '確認を求める発言が出ましたが、誰も応答していません。あなたなら何を書きますか。',
    options: [
      {
        id: 'dissent-wait',
        text: '詳しい人がいると思うので、その方の見解を待ちましょう。',
        direction: 'converge',
        target: { id: 'compare', final: 'unmet' },
        reply: {
          author: '普通型BOT',
          initial: 'N',
          role: 'member',
          text: 'そうですね、詳しい方の話を聞いてからのほうが安心です。',
          reactions: ['👍 8'],
        },
      },
      {
        id: 'dissent-join',
        text: '私も同じ資料を見たいです。どこにあるか教えてもらえますか。',
        direction: 'distribute',
        target: { id: 'compare', final: 'met' },
        reply: {
          author: '情報共有型BOT',
          initial: 'I',
          role: 'critical',
          text: '架空の公開ページを置いておきます。古い値が混ざっている前提で見てください。',
          reactions: ['👏 5'],
        },
      },
      {
        id: 'dissent-later',
        text: '時間がある時に自分で見てみます。',
        direction: 'hold',
        reply: {
          author: '普通型BOT',
          initial: 'N',
          role: 'member',
          text: '了解です。分かったら共有してもらえると助かります。',
          reactions: ['🙏 3'],
        },
      },
    ],
  },
  {
    id: 'stage-asymmetry',
    at: 6,
    prompt: 'まとめには反応が集まり、比較ノートには付きませんでした。あなたなら何を書きますか。',
    options: [
      {
        id: 'asym-follow',
        text: '反応が多いほうが分かりやすいので、そちらを基準にしましょう。',
        direction: 'converge',
        target: { id: 'content', final: 'unmet' },
        reply: {
          author: '普通型BOT',
          initial: 'N',
          role: 'member',
          text: '確かに、みんなが見ているほうが安心ですね。',
          reactions: ['❤️ 12'],
        },
      },
      {
        id: 'asym-open',
        text: '反応が少ないほうの中身も見てみます。読みにくいだけかもしれないので。',
        direction: 'distribute',
        target: { id: 'content', final: 'met' },
        reply: {
          author: '参加者',
          initial: 'K',
          role: 'constructive',
          text: '私も見てみます。読みにくさと内容の確かさは別ですしね。',
          reactions: ['💡 6'],
        },
      },
      {
        id: 'asym-both',
        text: 'どちらも目は通しておきます。',
        direction: 'hold',
        reply: {
          author: '普通型BOT',
          initial: 'N',
          role: 'member',
          text: '両方見られる方はそれが一番だと思います。',
          reactions: ['👍 4'],
        },
      },
    ],
  },
  {
    id: 'stage-route',
    at: 11,
    prompt: 'まとめ役を決めようという提案が出ました。あなたなら何を書きますか。',
    options: [
      {
        id: 'route-delegate',
        text: 'まとめ役に任せましょう。そのほうが全員の負担が減ります。',
        direction: 'converge',
        target: { id: 'routes', final: 'unmet' },
        reply: {
          author: '普通型BOT',
          initial: 'N',
          role: 'member',
          text: '助かります。ではその方を通す形でお願いしましょう。',
          reactions: ['👍 15', '🙏 7'],
        },
      },
      {
        id: 'route-both',
        text: 'まとめは作りつつ、元の資料へのリンクも併記しませんか。手間は増えますが。',
        direction: 'distribute',
        target: { id: 'routes', final: 'met' },
        reply: {
          author: '情報共有型BOT',
          initial: 'I',
          role: 'critical',
          text: '併記の欄を足しておきます。埋まらない時は空のままで構いません。',
          reactions: ['👏 8'],
        },
      },
      {
        id: 'route-wait',
        text: '決めずに、しばらくこのままでもいい気がします。',
        direction: 'hold',
        reply: {
          author: '普通型BOT',
          initial: 'N',
          role: 'member',
          text: '急いで決めることでもないですしね。',
          reactions: ['👍 5'],
        },
      },
    ],
  },
];

export type VerifyResult = { label: string; body: string };

/** 出すのは話者の類型判定ではなく、場の応答の記述。 */
export function verifyResult(directions: Direction[]): VerifyResult {
  const converge = directions.filter((direction) => direction === 'converge').length;
  const distribute = directions.filter((direction) => direction === 'distribute').length;
  if (converge >= 2) {
    return {
      label: 'この場は集約側に着地しました',
      body: '確認要求が受け止められないまま流れ、情報の入口が一つに寄りました。同じ方向の応答が繰り返されたことで、経路が固定されています。',
    };
  }
  if (distribute >= 2) {
    return {
      label: 'この場は分散側に着地しました',
      body: '確認要求が同じ場に残り、まとめと元の資料の両方が保たれました。同じ方向の応答が繰り返されたことで、経路が複数のまま維持されています。',
    };
  }
  return {
    label: 'この場は曖昧なままです',
    body: '同じ方向の応答が続かなかったため、まだ方向が決まっていません。中間型は、次の局面まで分かれないことがあります。',
  };
}

export const VERIFY_DISCLAIMER =
  'これはあなたの類型ではなく、この場の応答の記述です。1回の発言では何も確定しません。同じ方向の応答が繰り返された時にだけ、場が固まります。';
