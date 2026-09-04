import type { Message } from './types';

const openings = [
  '情報が多くて迷っています。皆さんは何を基準に判断していますか？',
  '色々な説明を見たのですが、どれを起点にすればいいのか分かりません。',
  '判断の材料が人によって違う気がします。皆さんはどこから見ていますか？',
];

const fatigues = [
  '毎回それぞれで探すのが正直しんどいです。私だけでしょうか。',
  '確認したい気持ちはあるのですが、時間が取れなくて追いきれていません。',
  '調べ方が分からないまま、何となく雰囲気で決めている気がします。',
];

/**
 * 共通前半（中間型）。
 * 中心人物がいない。悪意のある話者もいない。
 * 異論の扱い（A）と称賛の非対称（C）が決着しないまま散発的に混ざり、
 * 疲労が溜まった結果、最後に「まとめ役を決めよう」という善意の提案（B）が出る。
 */
export function buildCommon(seed: number): Message[] {
  const opening = openings[seed % openings.length];
  const fatigue = fatigues[seed % fatigues.length];
  return [
    {
      id: `${seed}-c00-open`,
      author: '質問型BOT',
      initial: 'Q',
      role: 'member',
      text: opening,
      reactions: ['🙏 3'],
    },
    {
      id: `${seed}-c01-ask`,
      author: '参加者',
      initial: 'S',
      role: 'constructive',
      text: 'その判断に使った資料を見せてもらえますか。同じものを見れば、どこで意見が分かれるのか分かると思います。',
      reactions: ['👀 1'],
      criteria: [{ id: 'compare', state: 'partial' }],
      point: {
        label: '受け止め手のいない確認要求',
        note: '確認要求が否定されたわけではなく、応答する人がいないまま流れています。中心人物のいない場では、異論は潰されるより先に、宙に浮くことがあります。',
      },
    },
    {
      id: `${seed}-c02-drift`,
      author: '普通型BOT',
      initial: 'N',
      role: 'member',
      text: 'そういえば来週の予定、もう出ていましたっけ。そちらも気になっています。',
      reactions: ['👍 4'],
    },
    {
      id: `${seed}-c03-digest`,
      author: 'AIニュースBOT',
      initial: 'AI',
      role: 'support',
      text: '【定時配信・架空例】公開情報の見出しと予定を短くまとめました。内容は各自でご確認ください。',
      reactions: ['❤️ 22', '🙌 14', '👍 9'],
      criteria: [{ id: 'routes', state: 'partial' }],
      point: {
        label: 'まとめへの反応集中',
        note: 'まとめは便利ですが、反応が集まること自体は内容の正しさを示しません。ここではまだ、経路が一本になったわけではありません。',
      },
    },
    {
      id: `${seed}-c04-echo`,
      author: '普通型BOT',
      initial: 'N',
      role: 'member',
      text: '朝のまとめ、助かっています。今日はこれで把握できました。',
      reactions: ['❤️ 18', '🙌 7'],
    },
    {
      id: `${seed}-c05-note`,
      author: '情報共有型BOT',
      initial: 'I',
      role: 'critical',
      text: '架空の比較ノートを置いておきます。公開されている項目を並べただけのもので、抜けや古い値も含まれている前提で見てください。',
      reactions: [],
      criteria: [{ id: 'evidence', state: 'partial' }],
      point: {
        label: '材料は出たが反応がない',
        note: '検証に使える材料が出ても、反応が伴うとは限りません。反応量と内容の有用性が別々に動いている状態です。',
      },
    },
    {
      id: `${seed}-c06-pass`,
      author: '参加者',
      initial: 'K',
      role: 'constructive',
      text: '比較ノート、あとで見てみます。まとめのほうが読みやすいので、つい先にそっちを見てしまいますね。',
      reactions: ['👍 2'],
      criteria: [{ id: 'content', state: 'partial' }],
      point: {
        label: '反応の非対称が指摘されない',
        note: '偏りは生じていますが、誰も問題として扱っていません。この段階では、まだどちらにも転びます。',
      },
    },
    {
      id: `${seed}-c07-again`,
      author: '質問型BOT',
      initial: 'Q',
      role: 'member',
      text: 'さっき出ていた「資料を見せてほしい」という話は、どうなりましたか。',
      reactions: ['👀 2'],
    },
    {
      id: `${seed}-c08-defer`,
      author: '普通型BOT',
      initial: 'N',
      role: 'member',
      text: 'すみません、流れてしまいましたね。今度まとめて聞く機会を作りましょう。',
      reactions: ['🙏 6'],
      criteria: [{ id: 'compare', state: 'partial' }],
      point: {
        label: '善意による保留',
        note: '拒否ではなく先送りです。保留された論点が戻ってくるかどうかは、この後の場の応答で決まります。',
      },
    },
    {
      id: `${seed}-c09-fatigue`,
      author: '参加者',
      initial: 'S',
      role: 'constructive',
      text: fatigue,
      reactions: ['🙏 11', '😅 5'],
    },
    {
      id: `${seed}-c10-branch`,
      author: '普通型BOT',
      initial: 'N',
      role: 'member',
      text: '情報が散らばって大変なので、まとめ役を決めませんか。誰かが整理してくれれば、みんな楽になると思います。',
      reactions: ['👍 16', '🙏 8'],
      branch: true,
      point: {
        label: '分岐点：経路をどう扱うかの提案',
        note: 'この提案自体は善意で、負担を減らす現実的な解決策です。分かれるのは提案の善悪ではなく、この後に場がどう応答するかです。',
      },
    },
  ];
}

export const BRANCH_NOTE =
  'この場はここで分かれます。まとめ役に経路を任せるのか、まとめを作りつつ元の資料も併記するのか。どちらの応答が続くかで、以降の展開が変わります。';
