import type { Message } from './types';

/**
 * 非圧力側後半。
 * 共通前半の「まとめ役を決めよう」という提案から始まり、
 * まとめは作るが元の資料も併記する形に落ち着いた場合の展開。
 * 有益な側にも限界と手間があることを明示し、「正解の場」としては描かない。
 */
export function buildOpen(seed: number): Message[] {
  return [
    {
      id: `${seed}-o01-both`,
      author: '参加者',
      initial: 'S',
      role: 'constructive',
      text: 'まとめは助かります。ただ、まとめだけになると後から確かめられないので、元の資料へのリンクも一緒に置きませんか。手間は増えますが。',
      reactions: ['👍 12', '🙏 5'],
      criteria: [{ id: 'routes', state: 'partial' }],
      point: {
        label: '経路の併記',
        note: 'まとめを否定せず、まとめと一次資料の両方を残す提案です。負担が増えることを認めた上で出されています。',
      },
    },
    {
      id: `${seed}-o02-use`,
      author: '普通型BOT',
      initial: 'N',
      role: 'member',
      text: '賛成です。普段はまとめから入って、気になったところだけ元を見る、くらいで十分だと思います。',
      reactions: ['👍 9'],
    },
    {
      id: `${seed}-o03-template`,
      author: '情報共有型BOT',
      initial: 'I',
      role: 'critical',
      text: 'まとめ用のひな形を置きます。出典、確認した日、まだ確認できていない項目を書く欄を入れました。埋まらない欄は空のままで構いません。',
      reactions: ['👏 7', '💡 6'],
      criteria: [{ id: 'evidence', state: 'partial' }],
      point: {
        label: '未確認を書ける形式',
        note: '分からないことを分からないまま置ける欄があると、確度の低い情報が確定情報として流れにくくなります。',
      },
    },
    {
      id: `${seed}-o04-unknown`,
      author: '参加者',
      initial: 'K',
      role: 'constructive',
      text: '未確認の欄があるのは助かります。埋めなきゃいけない空気があると、つい憶測で書いてしまうので。',
      reactions: ['🙏 8'],
      criteria: [{ id: 'content', state: 'partial' }],
    },
    {
      id: `${seed}-o05-recall`,
      author: '質問型BOT',
      initial: 'Q',
      role: 'member',
      text: 'さっき保留になった「資料を見せてほしい」の話、ここで戻していいですか。',
      reactions: ['👀 4'],
    },
    {
      id: `${seed}-o06-return`,
      author: '参加者',
      initial: 'S',
      role: 'constructive',
      text: 'どうぞ。保留のままでした。今の話とつながるので、ここで扱いましょう。',
      reactions: ['👍 11'],
      criteria: [{ id: 'compare', state: 'partial' }],
      point: {
        label: '保留の回収',
        note: '先送りされた論点が同じ場に戻されています。保留が回収されるかどうかは、異論を比較できる場かどうかの分かれ目です。',
      },
    },
    {
      id: `${seed}-o07-counter`,
      author: '情報共有型BOT',
      initial: 'I',
      role: 'critical',
      text: '根拠になりそうな架空の公開資料と、それと食い違う別の資料を両方置きます。どちらが正しいかは、この場では決められません。',
      reactions: ['👏 9', '💡 7'],
      criteria: [{ id: 'evidence', state: 'met' }],
      point: {
        label: '反証の同時提示',
        note: '結論を出さずに、支持する材料と食い違う材料を並べています。判断は各自に残されています。',
      },
    },
    {
      id: `${seed}-o08-notice`,
      author: '普通型BOT',
      initial: 'N',
      role: 'member',
      text: '合わない材料も一緒に出すんですね。少し不安になりますが、後で知るよりはいいです。',
      reactions: ['🙏 6'],
    },
    {
      id: `${seed}-o09-why`,
      author: '参加者',
      initial: 'S',
      role: 'constructive',
      text: '反対の材料が一つも出てこない話のほうが、あとで困ることが多いので。迷える状態のまま渡すほうが誠実だと思っています。',
      reactions: ['👏 14'],
      criteria: [{ id: 'compare', state: 'met' }],
    },
    {
      id: `${seed}-o10-digest`,
      author: 'AIニュースBOT',
      initial: 'AI',
      role: 'support',
      text: '【定時配信・架空例】本日の見出しです。この要約は一次資料の代わりにはなりません。元のリンクを併記しています。',
      reactions: ['❤️ 15', '👍 8'],
    },
    {
      id: `${seed}-o11-split`,
      author: '参加者',
      initial: 'K',
      role: 'constructive',
      text: 'さっき反応が集まった投稿と、ほとんど付かなかった投稿がありましたが、確かさで言うと逆でしたね。反応の数と内容は別々に見たほうがよさそうです。',
      reactions: ['💡 10', '👏 6'],
      criteria: [{ id: 'content', state: 'met' }],
      point: {
        label: '反応と妥当性の分離',
        note: '反応量が内容の評価とは別物として、場の中で明示的に扱われています。',
      },
    },
    {
      id: `${seed}-o12-external`,
      author: '外部告知BOT',
      initial: '↗',
      role: 'external',
      text: '【外部イベント・合成例】週末に、公開データの読み方をテーマにした架空の勉強会があります。ここと違う見方も持ち帰ってきてください。',
      reactions: ['👍 7'],
    },
    {
      id: `${seed}-o13-rotate`,
      author: '参加者',
      initial: 'S',
      role: 'constructive',
      text: 'まとめ役は固定しないで持ち回りにしませんか。特定の一人を通さないと情報が届かない形は、その人の負担も大きいので。',
      reactions: ['👏 13', '🙏 9'],
      criteria: [{ id: 'routes', state: 'met' }],
      point: {
        label: '経路の固定回避',
        note: '経路を一人に集約しない運用です。集約を避ける理由が、公平さではなく負担の分散として語られています。',
      },
    },
    {
      id: `${seed}-o14-close`,
      author: '普通型BOT',
      initial: 'N',
      role: 'member',
      text: '確かに、誰か一人に寄ると、その人が忙しい時に全部止まりますしね。',
      reactions: ['👍 10'],
    },
  ];
}
