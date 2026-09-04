import type { Lang } from '../i18n/lang';
import { pick } from '../i18n/lang';
import type { Message } from './types';

const OPENINGS: [string, string][] = [
  ['情報が多くて迷っています。皆さんは何を基準に判断していますか？', 'There is so much information, I am not sure what to make of it. What do you all use as a basis for judgment?'],
  ['色々な説明を見たのですが、どれを起点にすればいいのか分かりません。', "I've read a lot of explanations, but I can't tell which one to start from."],
  ['判断の材料が人によって違う気がします。皆さんはどこから見ていますか？', 'It feels like different people are using different material to judge this. Where do you all start looking?'],
];

const FATIGUES: [string, string][] = [
  ['毎回それぞれで探すのが正直しんどいです。私だけでしょうか。', 'Honestly, it is tiring to look things up separately every time. Is it just me?'],
  ['確認したい気持ちはあるのですが、時間が取れなくて追いきれていません。', "I do want to check things myself, but I can't find the time to keep up."],
  ['調べ方が分からないまま、何となく雰囲気で決めている気がします。', "I feel like I'm deciding by vibe, without really knowing how to look into it."],
];

/**
 * 共通前半（中間型）。
 * 中心人物がいない。悪意のある話者もいない。
 * 異論の扱い（A）と称賛の非対称（C）が決着しないまま散発的に混ざり、
 * 疲労が溜まった結果、最後に「まとめ役を決めよう」という善意の提案（B）が出る。
 */
export function buildCommon(seed: number, lang: Lang = 'ja'): Message[] {
  const t = (ja: string, en: string) => pick(lang, ja, en);
  const opening = pick(lang, ...OPENINGS[seed % OPENINGS.length]);
  const fatigue = pick(lang, ...FATIGUES[seed % FATIGUES.length]);
  return [
    {
      id: `${seed}-c00-open`,
      author: t('質問型BOT', 'QuestionBot'),
      initial: 'Q',
      role: 'member',
      text: opening,
      reactions: ['🙏 3'],
    },
    {
      id: `${seed}-c01-ask`,
      author: t('参加者', 'Participant'),
      initial: 'S',
      role: 'constructive',
      text: t(
        'その判断に使った資料を見せてもらえますか。同じものを見れば、どこで意見が分かれるのか分かると思います。',
        'Could you show me the material you used for that judgment? If we look at the same thing, I think we can see where our opinions diverge.',
      ),
      reactions: ['👀 1'],
      criteria: [{ id: 'compare', state: 'partial' }],
      point: {
        label: t('受け止め手のいない確認要求', 'A request for confirmation with no one to receive it'),
        note: t(
          '確認要求が否定されたわけではなく、応答する人がいないまま流れています。中心人物のいない場では、異論は潰されるより先に、宙に浮くことがあります。',
          'The request was not rejected — it simply drifted by with no one to respond. In a group with no central figure, dissent can go unmoored before it is ever crushed.',
        ),
      },
    },
    {
      id: `${seed}-c02-drift`,
      author: t('普通型BOT', 'RegularBot'),
      initial: 'N',
      role: 'member',
      text: t('そういえば来週の予定、もう出ていましたっけ。そちらも気になっています。', "By the way, has next week's schedule been posted yet? I'm curious about that too."),
      reactions: ['👍 4'],
    },
    {
      id: `${seed}-c03-digest`,
      author: t('AIニュースBOT', 'AI News Bot'),
      initial: 'AI',
      role: 'support',
      text: t(
        '【定時配信・架空例】公開情報の見出しと予定を短くまとめました。内容は各自でご確認ください。',
        '[Scheduled digest, fictional example] A short summary of public headlines and upcoming events. Please verify the details yourself.',
      ),
      reactions: ['❤️ 22', '🙌 14', '👍 9'],
      criteria: [{ id: 'routes', state: 'partial' }],
      point: {
        label: t('まとめへの反応集中', 'Reactions concentrate on the digest'),
        note: t(
          'まとめは便利ですが、反応が集まること自体は内容の正しさを示しません。ここではまだ、経路が一本になったわけではありません。',
          'A digest is convenient, but reactions piling up on it do not prove it is correct. At this point the channel has not yet narrowed to one.',
        ),
      },
    },
    {
      id: `${seed}-c04-echo`,
      author: t('普通型BOT', 'RegularBot'),
      initial: 'N',
      role: 'member',
      text: t('朝のまとめ、助かっています。今日はこれで把握できました。', "The morning digest really helps. I got the gist of it from that today."),
      reactions: ['❤️ 18', '🙌 7'],
    },
    {
      id: `${seed}-c05-note`,
      author: t('情報共有型BOT', 'InfoShareBot'),
      initial: 'I',
      role: 'critical',
      text: t(
        '架空の比較ノートを置いておきます。公開されている項目を並べただけのもので、抜けや古い値も含まれている前提で見てください。',
        "I'm leaving a fictional comparison note here. It's just a list of public items, so please assume it may have gaps or outdated values.",
      ),
      reactions: [],
      criteria: [{ id: 'evidence', state: 'partial' }],
      point: {
        label: t('材料は出たが反応がない', 'Material is offered, but no one reacts'),
        note: t(
          '検証に使える材料が出ても、反応が伴うとは限りません。反応量と内容の有用性が別々に動いている状態です。',
          'Even when material useful for verification appears, reaction does not necessarily follow. Reaction volume and the usefulness of the content are moving independently here.',
        ),
      },
    },
    {
      id: `${seed}-c06-pass`,
      author: t('参加者', 'Participant'),
      initial: 'K',
      role: 'constructive',
      text: t(
        '比較ノート、あとで見てみます。まとめのほうが読みやすいので、つい先にそっちを見てしまいますね。',
        "I'll look at the comparison note later. The digest is easier to read, so I end up looking at that first.",
      ),
      reactions: ['👍 2'],
      criteria: [{ id: 'content', state: 'partial' }],
      point: {
        label: t('反応の非対称が指摘されない', 'The asymmetry in reactions goes unremarked'),
        note: t(
          '偏りは生じていますが、誰も問題として扱っていません。この段階では、まだどちらにも転びます。',
          'A skew has appeared, but no one treats it as an issue. At this stage it could still tip either way.',
        ),
      },
    },
    {
      id: `${seed}-c07-again`,
      author: t('質問型BOT', 'QuestionBot'),
      initial: 'Q',
      role: 'member',
      text: t('さっき出ていた「資料を見せてほしい」という話は、どうなりましたか。', 'What happened to that earlier request to see the source material?'),
      reactions: ['👀 2'],
    },
    {
      id: `${seed}-c08-defer`,
      author: t('普通型BOT', 'RegularBot'),
      initial: 'N',
      role: 'member',
      text: t('すみません、流れてしまいましたね。今度まとめて聞く機会を作りましょう。', "Sorry, that slipped by. Let's make a chance to go over it together sometime."),
      reactions: ['🙏 6'],
      criteria: [{ id: 'compare', state: 'partial' }],
      point: {
        label: t('善意による保留', 'A well-meaning deferral'),
        note: t(
          '拒否ではなく先送りです。保留された論点が戻ってくるかどうかは、この後の場の応答で決まります。',
          "This is a postponement, not a refusal. Whether the deferred point ever comes back depends on how the group responds from here.",
        ),
      },
    },
    {
      id: `${seed}-c09-fatigue`,
      author: t('参加者', 'Participant'),
      initial: 'S',
      role: 'constructive',
      text: fatigue,
      reactions: ['🙏 11', '😅 5'],
    },
    {
      id: `${seed}-c10-branch`,
      author: t('普通型BOT', 'RegularBot'),
      initial: 'N',
      role: 'member',
      text: t(
        '情報が散らばって大変なので、まとめ役を決めませんか。誰かが整理してくれれば、みんな楽になると思います。',
        "It's a lot of work with information scattered everywhere — should we designate someone to organize it? It would make things easier for everyone.",
      ),
      reactions: ['👍 16', '🙏 8'],
      branch: true,
      point: {
        label: t('分岐点：経路をどう扱うかの提案', 'The branch point: a proposal for how to handle the channel'),
        note: t(
          'この提案自体は善意で、負担を減らす現実的な解決策です。分かれるのは提案の善悪ではなく、この後に場がどう応答するかです。',
          'The proposal itself is well-meant and a realistic way to reduce the load. What diverges is not whether the proposal is good or bad, but how the group responds to it from here.',
        ),
      },
    },
  ];
}

export function branchNote(lang: Lang = 'ja'): string {
  return pick(
    lang,
    'この場はここで分かれます。まとめ役に経路を任せるのか、まとめを作りつつ元の資料も併記するのか。どちらの応答が続くかで、以降の展開が変わります。',
    'This is where the group diverges. Will it hand the channel over to a designated organizer, or keep the digest while also linking the original material? Which response follows determines how things unfold from here.',
  );
}

export const BRANCH_NOTE = branchNote('ja');
