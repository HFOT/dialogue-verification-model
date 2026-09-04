import type { Lang } from '../i18n/lang';
import { pick } from '../i18n/lang';
import type { Message } from './types';

/**
 * 非圧力側後半。
 * 共通前半の「まとめ役を決めよう」という提案から始まり、
 * まとめは作るが元の資料も併記する形に落ち着いた場合の展開。
 * 有益な側にも限界と手間があることを明示し、「正解の場」としては描かない。
 */
export function buildOpen(seed: number, lang: Lang = 'ja'): Message[] {
  const t = (ja: string, en: string) => pick(lang, ja, en);
  return [
    {
      id: `${seed}-o01-both`,
      author: t('参加者', 'Participant'),
      initial: 'S',
      role: 'constructive',
      text: t(
        'まとめは助かります。ただ、まとめだけになると後から確かめられないので、元の資料へのリンクも一緒に置きませんか。手間は増えますが。',
        "The digest helps. But if it's the only thing left, we can't check back later — could we also link the original material alongside it? It's more work, but still.",
      ),
      reactions: ['👍 12', '🙏 5'],
      criteria: [{ id: 'routes', state: 'partial' }],
      point: {
        label: t('経路の併記', 'Keeping both channels'),
        note: t(
          'まとめを否定せず、まとめと一次資料の両方を残す提案です。負担が増えることを認めた上で出されています。',
          "This does not reject the digest — it proposes keeping both the digest and the original source, openly acknowledging the extra burden.",
        ),
      },
    },
    {
      id: `${seed}-o02-use`,
      author: t('普通型BOT', 'RegularBot'),
      initial: 'N',
      role: 'member',
      text: t('賛成です。普段はまとめから入って、気になったところだけ元を見る、くらいで十分だと思います。', "Agreed. Starting from the digest and checking the source only for the parts that catch your interest should be enough most of the time."),
      reactions: ['👍 9'],
    },
    {
      id: `${seed}-o03-template`,
      author: t('情報共有型BOT', 'InfoShareBot'),
      initial: 'I',
      role: 'critical',
      text: t(
        'まとめ用のひな形を置きます。出典、確認した日、まだ確認できていない項目を書く欄を入れました。埋まらない欄は空のままで構いません。',
        "I'll leave a template for the digest. It has fields for the source, the date it was checked, and items not yet verified. It's fine to leave a field blank if it can't be filled.",
      ),
      reactions: ['👏 7', '💡 6'],
      criteria: [{ id: 'evidence', state: 'partial' }],
      point: {
        label: t('未確認を書ける形式', 'A format that allows "not yet verified"'),
        note: t(
          '分からないことを分からないまま置ける欄があると、確度の低い情報が確定情報として流れにくくなります。',
          'Having a field where something unknown can stay marked unknown makes it harder for low-confidence information to circulate as if it were settled fact.',
        ),
      },
    },
    {
      id: `${seed}-o04-unknown`,
      author: t('参加者', 'Participant'),
      initial: 'K',
      role: 'constructive',
      text: t('未確認の欄があるのは助かります。埋めなきゃいけない空気があると、つい憶測で書いてしまうので。', "It helps to have an unverified field. Without it, the pressure to fill something in tends to make people write guesses."),
      reactions: ['🙏 8'],
      criteria: [{ id: 'content', state: 'partial' }],
    },
    {
      id: `${seed}-o05-recall`,
      author: t('質問型BOT', 'QuestionBot'),
      initial: 'Q',
      role: 'member',
      text: t('さっき保留になった「資料を見せてほしい」の話、ここで戻していいですか。', "Can we bring back the earlier request to see the source material, the one that got postponed?"),
      reactions: ['👀 4'],
    },
    {
      id: `${seed}-o06-return`,
      author: t('参加者', 'Participant'),
      initial: 'S',
      role: 'constructive',
      text: t('どうぞ。保留のままでした。今の話とつながるので、ここで扱いましょう。', "Please do — it never got picked up. It connects to what we're discussing now, so let's handle it here."),
      reactions: ['👍 11'],
      criteria: [{ id: 'compare', state: 'partial' }],
      point: {
        label: t('保留の回収', 'Retrieving a deferred point'),
        note: t(
          '先送りされた論点が同じ場に戻されています。保留が回収されるかどうかは、異論を比較できる場かどうかの分かれ目です。',
          'A deferred point is brought back into the same room. Whether a deferral gets retrieved is the dividing line for whether dissent can actually be compared.',
        ),
      },
    },
    {
      id: `${seed}-o07-counter`,
      author: t('情報共有型BOT', 'InfoShareBot'),
      initial: 'I',
      role: 'critical',
      text: t(
        '根拠になりそうな架空の公開資料と、それと食い違う別の資料を両方置きます。どちらが正しいかは、この場では決められません。',
        "I'll post a fictional public source that could serve as grounding, along with another one that conflicts with it. This group can't settle which is correct.",
      ),
      reactions: ['👏 9', '💡 7'],
      criteria: [{ id: 'evidence', state: 'met' }],
      point: {
        label: t('反証の同時提示', 'Presenting the counter-evidence alongside it'),
        note: t(
          '結論を出さずに、支持する材料と食い違う材料を並べています。判断は各自に残されています。',
          "Without forcing a conclusion, this lays supporting and conflicting material side by side. The judgment is left to each person.",
        ),
      },
    },
    {
      id: `${seed}-o08-notice`,
      author: t('普通型BOT', 'RegularBot'),
      initial: 'N',
      role: 'member',
      text: t('合わない材料も一緒に出すんですね。少し不安になりますが、後で知るよりはいいです。', "So the conflicting material gets posted too. It's a little unsettling, but better than finding out later."),
      reactions: ['🙏 6'],
    },
    {
      id: `${seed}-o09-why`,
      author: t('参加者', 'Participant'),
      initial: 'S',
      role: 'constructive',
      text: t(
        '反対の材料が一つも出てこない話のほうが、あとで困ることが多いので。迷える状態のまま渡すほうが誠実だと思っています。',
        "A story with no conflicting material at all tends to cause more trouble later. I think it's more honest to hand it over still open to doubt.",
      ),
      reactions: ['👏 14'],
      criteria: [{ id: 'compare', state: 'met' }],
    },
    {
      id: `${seed}-o10-digest`,
      author: t('AIニュースBOT', 'AI News Bot'),
      initial: 'AI',
      role: 'support',
      text: t(
        '【定時配信・架空例】本日の見出しです。この要約は一次資料の代わりにはなりません。元のリンクを併記しています。',
        "[Scheduled digest, fictional example] Today's headlines. This summary is not a substitute for the primary source — the original links are included alongside it.",
      ),
      reactions: ['❤️ 15', '👍 8'],
    },
    {
      id: `${seed}-o11-split`,
      author: t('参加者', 'Participant'),
      initial: 'K',
      role: 'constructive',
      text: t(
        'さっき反応が集まった投稿と、ほとんど付かなかった投稿がありましたが、確かさで言うと逆でしたね。反応の数と内容は別々に見たほうがよさそうです。',
        "Earlier, one post drew a lot of reaction and another drew almost none — but in terms of accuracy, it was the other way around. It seems better to judge reaction count and content separately.",
      ),
      reactions: ['💡 10', '👏 6'],
      criteria: [{ id: 'content', state: 'met' }],
      point: {
        label: t('反応と妥当性の分離', 'Separating reaction from validity'),
        note: t(
          '反応量が内容の評価とは別物として、場の中で明示的に扱われています。',
          'Reaction volume is explicitly treated as separate from content evaluation within the group.',
        ),
      },
    },
    {
      id: `${seed}-o12-external`,
      author: t('外部告知BOT', 'ExternalNoticeBot'),
      initial: '↗',
      role: 'external',
      text: t(
        '【外部イベント・合成例】週末に、公開データの読み方をテーマにした架空の勉強会があります。ここと違う見方も持ち帰ってきてください。',
        "[External event, synthetic example] There's a fictional workshop this weekend on how to read public data. Please bring back a perspective different from ours.",
      ),
      reactions: ['👍 7'],
    },
    {
      id: `${seed}-o13-rotate`,
      author: t('参加者', 'Participant'),
      initial: 'S',
      role: 'constructive',
      text: t(
        'まとめ役は固定しないで持ち回りにしませんか。特定の一人を通さないと情報が届かない形は、その人の負担も大きいので。',
        "Should we rotate who organizes the digest instead of fixing it on one person? Routing everything through a single point is a heavy burden on that person too.",
      ),
      reactions: ['👏 13', '🙏 9'],
      criteria: [{ id: 'routes', state: 'met' }],
      point: {
        label: t('経路の固定回避', 'Avoiding a fixed channel'),
        note: t(
          '経路を一人に集約しない運用です。集約を避ける理由が、公平さではなく負担の分散として語られています。',
          "This is an arrangement that avoids concentrating the channel in one person. The reason given for avoiding it is not fairness but spreading the burden.",
        ),
      },
    },
    {
      id: `${seed}-o14-close`,
      author: t('普通型BOT', 'RegularBot'),
      initial: 'N',
      role: 'member',
      text: t('確かに、誰か一人に寄ると、その人が忙しい時に全部止まりますしね。', "True — if it all rests on one person, everything stalls whenever they're busy."),
      reactions: ['👍 10'],
    },
  ];
}
