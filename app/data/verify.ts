import type { Lang } from '../i18n/lang';
import { pick } from '../i18n/lang';
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

export function verifyStages(lang: Lang = 'ja'): VerifyStage[] {
  const t = (ja: string, en: string) => pick(lang, ja, en);
  return [
    {
      id: 'stage-dissent',
      at: 2,
      prompt: t('確認を求める発言が出ましたが、誰も応答していません。あなたなら何を書きますか。', 'A request for confirmation appeared, but no one has responded. What would you write?'),
      options: [
        {
          id: 'dissent-wait',
          text: t('詳しい人がいると思うので、その方の見解を待ちましょう。', "I think someone knowledgeable will show up — let's wait for their view."),
          direction: 'converge',
          target: { id: 'compare', final: 'unmet' },
          reply: {
            author: t('普通型BOT', 'RegularBot'),
            initial: 'N',
            role: 'member',
            text: t('そうですね、詳しい方の話を聞いてからのほうが安心です。', "Good idea, it's more reassuring to hear from someone knowledgeable first."),
            reactions: ['👍 8'],
          },
        },
        {
          id: 'dissent-join',
          text: t('私も同じ資料を見たいです。どこにあるか教えてもらえますか。', "I'd like to see the same material too. Could you tell me where to find it?"),
          direction: 'distribute',
          target: { id: 'compare', final: 'met' },
          reply: {
            author: t('情報共有型BOT', 'InfoShareBot'),
            initial: 'I',
            role: 'critical',
            text: t('架空の公開ページを置いておきます。古い値が混ざっている前提で見てください。', "I'll leave a fictional public page here. Please assume some values may be outdated."),
            reactions: ['👏 5'],
          },
        },
        {
          id: 'dissent-later',
          text: t('時間がある時に自分で見てみます。', "I'll take a look myself when I have time."),
          direction: 'hold',
          reply: {
            author: t('普通型BOT', 'RegularBot'),
            initial: 'N',
            role: 'member',
            text: t('了解です。分かったら共有してもらえると助かります。', "Got it. It'd help if you share what you find."),
            reactions: ['🙏 3'],
          },
        },
      ],
    },
    {
      id: 'stage-asymmetry',
      at: 6,
      prompt: t('まとめには反応が集まり、比較ノートには付きませんでした。あなたなら何を書きますか。', 'The digest drew reactions, but the comparison note drew none. What would you write?'),
      options: [
        {
          id: 'asym-follow',
          text: t('反応が多いほうが分かりやすいので、そちらを基準にしましょう。', "The one with more reactions is easier to follow, so let's use that as the standard."),
          direction: 'converge',
          target: { id: 'content', final: 'unmet' },
          reply: {
            author: t('普通型BOT', 'RegularBot'),
            initial: 'N',
            role: 'member',
            text: t('確かに、みんなが見ているほうが安心ですね。', "True, it's reassuring when everyone's looking at the same thing."),
            reactions: ['❤️ 12'],
          },
        },
        {
          id: 'asym-open',
          text: t('反応が少ないほうの中身も見てみます。読みにくいだけかもしれないので。', "I'll take a look at the one with fewer reactions too — it might just be harder to read."),
          direction: 'distribute',
          target: { id: 'content', final: 'met' },
          reply: {
            author: t('参加者', 'Participant'),
            initial: 'K',
            role: 'constructive',
            text: t('私も見てみます。読みにくさと内容の確かさは別ですしね。', "I'll look too — readability and accuracy aren't the same thing after all."),
            reactions: ['💡 6'],
          },
        },
        {
          id: 'asym-both',
          text: t('どちらも目は通しておきます。', "I'll skim through both, at least."),
          direction: 'hold',
          reply: {
            author: t('普通型BOT', 'RegularBot'),
            initial: 'N',
            role: 'member',
            text: t('両方見られる方はそれが一番だと思います。', "If you can look at both, that's probably best."),
            reactions: ['👍 4'],
          },
        },
      ],
    },
    {
      id: 'stage-route',
      at: 11,
      prompt: t('まとめ役を決めようという提案が出ました。あなたなら何を書きますか。', 'A proposal came up to designate someone to organize things. What would you write?'),
      options: [
        {
          id: 'route-delegate',
          text: t('まとめ役に任せましょう。そのほうが全員の負担が減ります。', "Let's leave it to the organizer — that reduces the load on everyone."),
          direction: 'converge',
          target: { id: 'routes', final: 'unmet' },
          reply: {
            author: t('普通型BOT', 'RegularBot'),
            initial: 'N',
            role: 'member',
            text: t('助かります。ではその方を通す形でお願いしましょう。', "That helps. Let's route things through them, then."),
            reactions: ['👍 15', '🙏 7'],
          },
        },
        {
          id: 'route-both',
          text: t('まとめは作りつつ、元の資料へのリンクも併記しませんか。手間は増えますが。', "Could we keep the digest but also link the original material? It's more work, but still."),
          direction: 'distribute',
          target: { id: 'routes', final: 'met' },
          reply: {
            author: t('情報共有型BOT', 'InfoShareBot'),
            initial: 'I',
            role: 'critical',
            text: t('併記の欄を足しておきます。埋まらない時は空のままで構いません。', "I'll add a field for that. It's fine to leave it blank if it can't be filled."),
            reactions: ['👏 8'],
          },
        },
        {
          id: 'route-wait',
          text: t('決めずに、しばらくこのままでもいい気がします。', "I think it's okay to leave it undecided for now."),
          direction: 'hold',
          reply: {
            author: t('普通型BOT', 'RegularBot'),
            initial: 'N',
            role: 'member',
            text: t('急いで決めることでもないですしね。', "It's not something we need to rush, after all."),
            reactions: ['👍 5'],
          },
        },
      ],
    },
  ];
}

/** 後方互換のための既定（日本語）版。構造（id/at/direction/target）は言語に依らず同一。 */
export const VERIFY_STAGES = verifyStages('ja');

export type VerifyResult = { label: string; body: string };

/** 出すのは話者の類型判定ではなく、場の応答の記述。 */
export function verifyResult(directions: Direction[], lang: Lang = 'ja'): VerifyResult {
  const t = (ja: string, en: string) => pick(lang, ja, en);
  const converge = directions.filter((direction) => direction === 'converge').length;
  const distribute = directions.filter((direction) => direction === 'distribute').length;
  if (converge >= 2) {
    return {
      label: t('この場は集約側に着地しました', 'This room landed on the converging side'),
      body: t(
        '確認要求が受け止められないまま流れ、情報の入口が一つに寄りました。同じ方向の応答が繰り返されたことで、経路が固定されています。',
        "Requests for confirmation drifted by unreceived, and information's entry point narrowed to one. Because responses kept pointing the same direction, the channel has become fixed.",
      ),
    };
  }
  if (distribute >= 2) {
    return {
      label: t('この場は分散側に着地しました', 'This room landed on the distributed side'),
      body: t(
        '確認要求が同じ場に残り、まとめと元の資料の両方が保たれました。同じ方向の応答が繰り返されたことで、経路が複数のまま維持されています。',
        'Requests for confirmation stayed in the room, and both the digest and the original source were kept. Because responses kept pointing the same direction, multiple channels have stayed open.',
      ),
    };
  }
  return {
    label: t('この場は曖昧なままです', 'This room remains ambiguous'),
    body: t(
      '同じ方向の応答が続かなかったため、まだ方向が決まっていません。中間型は、次の局面まで分かれないことがあります。',
      "Because responses didn't keep pointing the same direction, no direction has been set yet. A middling room can stay undecided until the next moment.",
    ),
  };
}

export function verifyDisclaimer(lang: Lang = 'ja'): string {
  return pick(
    lang,
    'これはあなたの類型ではなく、この場の応答の記述です。1回の発言では何も確定しません。同じ方向の応答が繰り返された時にだけ、場が固まります。',
    "This is not a label for what type you are — it's a description of how this room responded. No single statement decides anything. Only when responses keep pointing the same direction does the room settle.",
  );
}
export const VERIFY_DISCLAIMER = verifyDisclaimer('ja');
