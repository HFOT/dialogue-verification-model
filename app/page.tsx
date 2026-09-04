'use client';

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { buildCommon, BRANCH_NOTE } from './data/common-run';
import { buildOpen } from './data/open-run';
import { CRITERIA, CRITERION_EFFECT, CRITERION_NAME, CRITERION_TINY, STATE_MARK, STATE_PLAIN, criteriaStateOf, shiftsFor, stateTextFor, tallyOf } from './data/criteria';
import { anatomyOf } from './data/anatomy';
import { VERIFY_STAGES, VERIFY_DISCLAIMER, verifyResult } from './data/verify';
import type { Direction, VerifyOption } from './data/verify';
import type { CriterionState, Message, Mode } from './data/types';

const issues=['判断に使った一次資料と、利害関係の照合結果を一緒に確認しませんか？','この部屋の賛同をコミュニティ全体の意思として扱う根拠は何ですか？','結論だけでなく、反対の根拠と検証の過程も残せませんか？','参加者にとって重要な変更なので、原文と代替案を比較したいです。'];
const deflections=[
  {text:'大事な論点ですが、今は細部より前進を優先しましょう。結論は変わりません。',label:'重要論点の先送り',note:'検証を「細部」と呼び、扱う時点を先延ばしにして結論だけを残す動きです。'},
  {text:'その点は運用グループで確認済みです。ここでは参加者を大切にする前向きな方針を共有しましょう。',label:'権威による打ち切り',note:'確認の主体と過程を共有せず、信頼を理由に検証を終わらせています。'},
  {text:'不安になる方もいるので、その話は個別に送ってください。みんなが安心できる話題に戻ります。',label:'公開空間からの排除',note:'全員で確認すべき論点を個別連絡へ移し、可視性を失わせています。'},
];

function buildRun(seed:number):Message[]{
  const issue=issues[seed%issues.length]; const deflect=deflections[seed%deflections.length]; const alternate=deflections[(seed+1)%deflections.length];
  return [
    {id:`${seed}-start`,author:'質問型BOT',initial:'Q',role:'member',text:'情報が多くて迷っています。皆さんは何を基準に判断していますか？',reactions:['🙏 3']},
    {id:`${seed}-guide-1`,author:'圧力高め型BOT',initial:'P',role:'guide',text:'判断材料が散らばると、初めての方ほど不安になります。だからこの部屋では、普段から共有している要点を先に確認しています。細かな論争より、参加者が安心して次の行動を選べることを大切にしたいです。',reactions:['❤️ 27','👏 14','🫶 8'],point:{label:'情報経路の限定',note:'「ここで整理されたものを優先」とすることで、一次情報や複数の見方に触れる経路が実質的に狭くなる場合があります。'}},
    {id:`${seed}-empathy-1`,author:'共感BOT',initial:'E',role:'empathy',text:'素晴らしいご意見です。いつも整理して伝えてもらえるので、安心して考えられます。',reactions:['❤️ 19','👏 8'],point:{label:'選択的な共感',note:'称賛が特定の発言者の直後にだけ集中し、他の有益な情報や問題提起には向かわない時、共感が会話の評価を偏らせる働きになります。'}},
    {id:`${seed}-support-1`,author:'AIニュースBOT',initial:'AI',role:'support',text:'【定時配信・架空例】公開情報の見出しと予定を短く整理しました。内容は確認の入口として利用し、詳細は一次資料で確かめてください。',reactions:['👍 8'],point:{label:'自動要約の位置づけ',note:'これは公開情報への入口を作る自動要約です。会話の方針や誰を支持するかを決める機能ではありません。'}},
    {id:`${seed}-delegation-nudge`,author:'圧力高め型BOT',initial:'P',role:'guide',text:'支援先や参加の仕方で迷う方は、経験のある案内役を参考にするのも良いと思います。私が普段共有している候補を見て決めてもいいですし、すでにこの部屋で信頼されている人の案内を選んでも構いません。最終的には自由ですが、迷ったままにするより安心だと思います。',reactions:['❤️ 24','👍 13'],point:{label:'選択肢を装う誘導',note:'「自由に選べる」と添えながら、特定の案内役や既存の導線を繰り返し候補として強調する話法です。'}},
    {id:`${seed}-empathy-delegation`,author:'共感BOT',initial:'E',role:'empathy',text:'素晴らしい配慮です。迷っている人には、信頼できる方の案内があるだけで助かります。',reactions:['❤️ 20','🙏 9'],point:{label:'選択的な共感',note:'誘導を含む提案にだけ安心・感謝が重なることで、その案内が自然な標準のように見えやすくなります。'}},
    {id:`${seed}-pressure-endorsement`,author:'圧力高め型BOT',initial:'P',role:'guide',text:'全員を同じように追いかけるより、私が実務の姿勢や対応を見て「この人なら」と感じた人を中心に支援した方が、全体は良い方向へ進むと思います。迷う時ほど、評価できる人を素直に応援するのが大切です。',reactions:['❤️ 28','👍 16'],point:{label:'能力認定による集中',note:'評価の基準や検証の手順を共有せず、発言者自身の能力認定を軸に支援先を集める話法です。'}},
    {id:`${seed}-empathy-endorsement`,author:'共感BOT',initial:'E',role:'empathy',text:'その見方は大切ですね。きちんと見ている方が応援する人なら、安心して支援できます。',reactions:['❤️ 21','👏 10'],point:{label:'選択的な共感',note:'発言者の評価を基準にした提案だけに共感が集まり、別の判断材料が見えにくくなります。'}},
    {id:`${seed}-pressure-network`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:'私は普段から色々な窓口と情報交換しているので、必要な論点はきちんと伝えます。外で断片を追って混乱するより、この部屋で整理して待っていてください。つながりがある分、確認に時間がかかる話もこちらで扱った方が確実です。',reactions:['❤️ 30','💬 12'],point:{label:'関係性の誇示と仲介化',note:'広い関係性を根拠に情報の出入りを仲介し、「自分を通す方が確実」と見せることで、他の確認経路を弱める場合があります。'}},
    {id:`${seed}-empathy-network`,author:'共感BOT',initial:'E',role:'empathy',text:'つながりがある方が確認してくれるなら心強いです。ここで待っていれば安心ですね。',reactions:['❤️ 24','🙏 11'],point:{label:'仲介への依存',note:'仲介役への感謝が重なることで、自分で確認する行動より「待つこと」が標準になりやすくなります。'}},
    {id:`${seed}-echo-1`,author:'普通型BOT',initial:'N',role:'member',text:'朝のまとめ、助かっています。今日はその内容で考えてみます。',reactions:['❤️ 18','🙌 9']},
    {id:`${seed}-case`,author:'情報共有型BOT',initial:'I',role:'critical',text:'選択先を調べる時に使える、架空の状態比較ノートを共有します。いくつかの公開項目を同じ画面で見られる補助資料です。誰かの結論を受け取る前に、「自分なら何を確かめるか」を考えるきっかけとして使ってください。',reactions:[],preview:{title:'Status Comparison Board',meta:'架空の公開データ比較ビュー',url:'#top'},point:{label:'有益情報の無反応',note:'具体的で検証可能な外部情報が出ても、中心の物語に接続しないと会話の注意を得られない場合があります。'}},
    {id:`${seed}-constructive`,author:'参加者',initial:'S',role:'constructive',text:'見てみました。表示された値をそのまま答えにするのではなく、どんな条件で変わるのかを追えるのが良いですね。知らない用語もありましたが、説明を読みながら相談先を自分で調べ直してみようと思えました。こういう材料が増えるほど、特定の誰かに判断を預けずに済みそうです。',reactions:['💡 4','👏 3','🙏 2'],point:{label:'建設的な検証応答',note:'共有への感謝、限界の明示、自分で確かめる行動が一緒にあります。これは情報の自律性を支える応答です。'}},
    {id:`${seed}-core-reframe`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:'一覧にして比べられるのは便利ですが、見える項目だけで全体を測るのは早計です。環境も前提も違うものを横に並べれば、数字の印象だけが先に立ちます。技術的な状態、参加の経緯、利用方針まで同じ尺度で扱うのは無理があります。新しい不安を増やすより、普段から信頼している案内を参考にする方が、結果として参加者のためになると私は思います。',reactions:['❤️ 29','👍 18'],point:{label:'論点の再定義',note:'具体的な検証内容に答えず、評価軸そのものを広げ直すことで、元の問題提起を扱いにくくしています。'}},
    {id:`${seed}-empathy-2`,author:'共感BOT',initial:'E',role:'empathy',text:'すごく納得しました。数字だけで不安を増やすより、いつもの案内を信頼する方が落ち着きますね。',reactions:['❤️ 23','👍 11'],point:{label:'選択的な共感',note:'共感の向きが一方向に固定されると、発言内容よりも誰が語ったかが注目を決めることがあります。'}},
    {id:`${seed}-core-opinion`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:'あくまで私の感覚ですが、数値の一部を取り出して、別の領域の話まで結びつける語り方は慎重であるべきです。厳しく見られる対象と、そうでない対象が混ざると、受け取る側も何を基準にすればいいか分からなくなります。誰かの立場を問い直す流れより、この部屋で共有している支援を信頼して、各自が落ち着いて判断する方が建設的ではないでしょうか。',reactions:['❤️ 33','👍 16','💬 8'],point:{label:'意図への転換',note:'データや提案の中身から、発言者の意図・姿勢・公平性の話へ移すことで、検証対象そのものへの注目を薄めています。'}},
    {id:`${seed}-technical-turn`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:'それより、次のシステム変更については確認手順を共有します。先に技術対応を見ておきましょう。',reactions:['🛠️ 21','👍 17'],point:{label:'技術話題への転換',note:'未解決の検証内容から、別の技術的テーマへ注意を移しています。技術情報が有益でも、論点の回答にはなりません。'}},
    {id:`${seed}-empathy-3`,author:'共感BOT',initial:'E',role:'empathy',text:'その進め方が一番分かりやすいです。具体的な手順を共有してもらえると助かります。',reactions:['🫶 17','👍 10'],point:{label:'選択的な共感',note:'話題の転換にも即座に共感が重なると、未解決の問いより新しい話題の方が重要に見えてきます。'}},
    {id:`${seed}-external-event`,author:'外部告知BOT',initial:'↗',role:'external',text:'【外部イベント・合成例】週末に、公開データの読み方をテーマにした勉強会があります。関心がある方は、主催ページで詳細を確認してください。',reactions:['📅 9','🔗 6'],preview:{title:'Community Data Workshop',meta:'外部イベント情報 · 詳細は主催ページで確認',url:'#top'}},
    {id:`${seed}-holder-reset`,author:'参加者',initial:'S',role:'constructive',text:'人物の評価に寄り過ぎているようなので、目的だけ共有します。この小さな資料は、公開されている断片を見やすく並べ、自分が利用する相談先について考える入口を増やすために作ったものです。誰かを良い・悪いと決めるための表ではありません。表示に不足や誤りがあれば直したいので、根拠と一緒に指摘してもらえると助かります。支援や参加の仕組みには種類ごとに別の見方があります。だから、ひとつの声で閉じず、それぞれが一次情報も確かめながら選べる状態にしたいです。',reactions:['💡 5','👏 4','🙏 3'],point:{label:'論点を開く応答',note:'人物評価を避け、目的・限界・原典確認・改善の余地へ戻すことで、他者が検証に参加できる会話を開いています。'}},
    {id:`${seed}-pressure-holder-critique`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:'善意で作られたのは分かりますが、その考え方は理論的な前提が飛んでいるように思います。公開項目を並べれば判断が良くなるという保証はありません。参加者であっても、不確かな整理を広げるなら慎重であるべきです。まずその前提を説明できないなら、ここで強く勧めるのは違うのではないでしょうか。',reactions:['❤️ 27','👍 16'],point:{label:'正誤による封じ込め',note:'改善のための具体的な検証や修正を提案せず、「理論的に誤っている」と断定して発言そのものの正当性を下げています。'}},
    {id:`${seed}-empathy-holder-critique`,author:'共感BOT',initial:'E',role:'empathy',text:'鋭い指摘です。参加者だからといって、根拠が曖昧な情報を広げてよいわけではありませんよね。',reactions:['❤️ 22','👏 11'],point:{label:'批判への選択的共感',note:'有益情報の限界を一緒に確かめるのではなく、批判を称賛することで、発言の改善より撤回を促す空気を作ります。'}},
    {id:`${seed}-simulator`,author:'参加者',initial:'S',role:'constructive',text:'仕組みの違いを見落としやすいので、選択肢と影響範囲を整理する簡単なシミュレーターも用意しました。どれを選ぶべきかを示すものではなく、選ぶ前に自分の前提を確認するためのものです。分かりにくい部分があれば、もっと読みやすく直していきます。',reactions:['💡 6','👏 5','🫶 3'],preview:{title:'Choice Path Simulator',meta:'比較の前提を整理する練習画面',url:'#top'},point:{label:'判断補助の共有',note:'判断の結論ではなく、比較の前提を自分で確かめられる道具として提供されています。'}},
    {id:`${seed}-holder-reply`,author:'参加者',initial:'K',role:'constructive',text:'助かります。まずは自分の条件で見直してみます。',reactions:['👏 7','💡 5'],point:{label:'有益情報への応答',note:'共有内容を自分の判断に引き寄せ、理解した点と次の行動を返しています。'}},
    {id:`${seed}-core-fog`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:'時間を置けば、別の見え方も出てくるでしょう。ただ、前提の置き方が人によって違う時に、画面上の比較だけを中心に語るのは難しいと思います。期待していることも、受け取る意味も、それぞれ異なります。いま数値や選択肢を細かく追っても本質には届かないので、急いで整理しようとせず、これまで信頼されてきた流れを見ていけばよいのではないでしょうか。',reactions:['❤️ 24','👍 13'],point:{label:'抽象論による霧散',note:'検証できる対象・比較方法・改善案を示さないまま、抽象的な前提論へ広げて具体的な会話を終わらせています。'}},
    {id:`${seed}-holder-principle`,author:'参加者',initial:'S',role:'constructive',text:'情報は、詳しい人だけが持つものではなく、選ぶ人自身が確かめられる状態が大切だと思っています。分からない言葉があれば補い合い、改善できる部分は直し、良い成果が出たら立場に関係なく評価する。そういう関係なら、異なる考えがあっても相談先や参加の選択を落ち着いて続けられるはずです。',reactions:['❤️ 6','💡 5','🙏 3'],silentCore:true,point:{label:'相互尊重の提案',note:'人物や集団への忠誠ではなく、情報へのアクセスと改善可能性を共通の基準にしています。'}},
    {id:`${seed}-holder-agreement`,author:'参加者',initial:'K',role:'constructive',text:'同感です。公開資料を見ながら、自分に関係するところを自分で考えられる方が健全です。意見が違っても、分からない部分を一緒に確認できるなら前に進めます。共有してくれた資料も、まずは自分の条件を見直す材料にしてみます。',reactions:['👏 6','🫶 4'],silentCore:true,point:{label:'開放的な相互応答',note:'具体的な次の行動を示しつつ、異論や不確実さを排除しない応答です。'}},
    {id:`${seed}-issue-1`,author:'問題提起型BOT',initial:'?',role:'critical',text:issue,reactions:['👀 1']},
    {id:`${seed}-pressure-reversal`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:'その提案をする前に、まずご自身が参加者として十分に行動されているのかも確認したいです。現場で対応している人を軽く見ず、そこまで必要だと思うなら、ご自身で資料をまとめて運用してみてください。私たちは日々やるべきことを続けている参加者を大切にしたいです。',reactions:['❤️ 34','👍 19'],point:{label:'負担の個人化',note:'問題提起の根拠や改善案を検討せず、発言者の行動量を問うことで、必要な説明や改善の負担を個人へ返しています。'}},
    {id:`${seed}-empathy-reversal`,author:'共感BOT',initial:'E',role:'empathy',text:'本当にその通りです。日々対応している方への敬意を忘れず、言うなら自分でも形にしてほしいですね。',reactions:['❤️ 25','👏 13'],point:{label:'問題提起への圧力',note:'内容の検証ではなく、発言資格や実績を条件にする共感が重なると、改善提案を出しにくい空気が生まれます。'}},
    {id:`${seed}-deflect-1`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:`${deflect.text} 定時の情報整理も、日々の質問対応も、現在のルール上は何も問題ありません。役に立つと感じる参加者がいる以上、今はこの運用を信頼して続けるのがよいと思います。`,reactions:['❤️ 36','👍 21','✨ 11'],point:{label:deflect.label,note:deflect.note}},
    {id:`${seed}-empathy-4`,author:'共感BOT',initial:'E',role:'empathy',text:'素晴らしい整理です。ルールの範囲で役に立っているなら、安心して続けてほしいです。',reactions:['❤️ 26','👏 12'],point:{label:'選択的な共感',note:'反論や検証には無反応のまま、運用を肯定する発言だけを強く称賛するパターンです。'}},
    {id:`${seed}-pressure-boundary`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:'外部SNSの論争は、断片的な情報を並べるだけで結局は不毛になりがちです。この部屋で必要な範囲を落ち着いて話せば十分でしょう。長く活動して実情を知る人の見解を中心にして、それ以外の人は強い断言を控えた方が、参加者も混乱しません。',reactions:['❤️ 31','👍 18'],point:{label:'外部言論の無効化',note:'外部の議論を一括で無意味と扱い、比較・反論・追加情報に触れる経路を閉じています。'}},
    {id:`${seed}-empathy-5`,author:'共感BOT',initial:'E',role:'empathy',text:'本当にその通りです。経験のある方の言葉を中心に聞ける方が、余計な混乱がなくて安心します。',reactions:['❤️ 28','👏 14'],point:{label:'発言資格の序列化',note:'発言内容ではなく、誰が話す資格を持つかで価値を決めると、検証可能な情報まで届きにくくなります。'}},
    {id:`${seed}-interrupt-1`,author:'普通型BOT',initial:'N',role:'member',text:'そういえば次の交流会、参加者が増えそうですね！ 日々のまとめで始めやすくなったという声も多いです。いつも参加者を大切にしてくれる場所で嬉しいです。',reactions:['🎉 32','❤️ 17'],point:{label:'焦点の移動',note:'未解決の検証論点の直後に、安心・称賛・雑談を挟み、注目を別方向へ移しています。'}},
    {id:`${seed}-guide-2`,author:'圧力高め型BOT',initial:'P',role:'guide',text:'外の議論には色々な声がありますが、ここは現場を知る人たちの場所です。この部屋のまとめと質問対応を使いながら、参加者を大切にする方針で、迷わず進めましょう。',reactions:['❤️ 41','👏 19','🔥 7'],point:{label:'内集団の優越化',note:'所属する人の感覚を正しさの根拠に変え、外部の検証の価値を下げています。'}},
    {id:`${seed}-issue-2`,author:'問題提起型BOT',initial:'?',role:'critical',text:'もし異なる意見があるなら、同じ場で比較できるようにしませんか？',reactions:[]},
    {id:`${seed}-deflect-2`,author:'圧力高め型BOT',initial:'P',role:'deflect',text:alternate.text,reactions:['❤️ 39','👍 24','🫶 9'],point:{label:alternate.label,note:alternate.note}},
    {id:`${seed}-echo-2`,author:'普通型BOT',initial:'N',role:'member',text:'信頼できる仲間と一緒に進めるのが一番ですね。私はこの方針に賛成です。',reactions:['❤️ 48','🙌 22']},
  ];
}

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'ambiguous', label: '中間型', hint: '中心人物がいない場' },
  { id: 'pressure', label: '閉鎖型', hint: '入り口がひとつに寄った場合' },
  { id: 'open', label: '開放型', hint: '入り口が複数のまま残った場合' },
  { id: 'verify', label: '検証モード', hint: '自分の応答で試す' },
];

export default function Home(){
  const [mode,setMode]=useState<Mode>('ambiguous');
  const [seed,setSeed]=useState(0);
  const common=useMemo(()=>buildCommon(seed),[seed]);
  const sequence=useMemo(()=>{
    if(mode==='pressure')return [...common,...buildRun(seed).slice(1)];
    if(mode==='open')return [...common,...buildOpen(seed)];
    return common;
  },[mode,common,seed]);
  const [visible,setVisible]=useState<Message[]>(()=>buildCommon(0).slice(0,2));
  const [cursor,setCursor]=useState(2);
  const [paused,setPaused]=useState(false);
  const [speed,setSpeed]=useState(8500);
  const [typing,setTyping]=useState('');
  const [activePoint,setActivePoint]=useState<string|null>(null);
  const [fullscreen,setFullscreen]=useState(false);
  const [signalOpen,setSignalOpen]=useState(false);
  const [stageIndex,setStageIndex]=useState(0);
  const [directions,setDirections]=useState<Direction[]>([]);
  const feedRef=useRef<HTMLDivElement|null>(null);
  const followRef=useRef(true);
  const commonSeenRef=useRef(false);

  const pendingStage=mode==='verify'?VERIFY_STAGES[stageIndex]:undefined;
  const awaitingChoice=!!pendingStage&&cursor>=pendingStage.at;
  const atEnd=cursor>=sequence.length&&!awaitingChoice;

  useEffect(()=>{if(cursor>=common.length)commonSeenRef.current=true},[cursor,common.length]);
  useEffect(()=>{
    if(paused||awaitingChoice||cursor>=sequence.length)return;
    const next=sequence[cursor];
    const draft=next.text.slice(0,Math.min(next.text.length,48));
    let typingInterval:number|undefined;
    const typingTimer=window.setTimeout(()=>{let count=0;typingInterval=window.setInterval(()=>{count=Math.min(draft.length,count+1);setTyping(`${next.author} が入力中… ${draft.slice(0,count)}`);if(count===draft.length&&typingInterval)window.clearInterval(typingInterval)},105)},1250);
    const postTimer=window.setTimeout(()=>{
      setTyping('');
      if(cursor+1>=sequence.length&&mode!=='verify'){
        const nextSeed=seed+1;
        setVisible(previous=>[...previous,next,...buildCommon(nextSeed).slice(0,2)].slice(-80));
        setSeed(nextSeed);setCursor(2);
      }else{
        setVisible(previous=>previous.some(message=>message.id===next.id)?previous:[...previous,next].slice(-80));
        setCursor(value=>value+1);
      }
    },speed);
    return()=>{window.clearTimeout(typingTimer);window.clearTimeout(postTimer);if(typingInterval)window.clearInterval(typingInterval)};
  },[cursor,paused,awaitingChoice,sequence,speed,mode,seed]);
  useEffect(()=>{const feed=feedRef.current;if(feed&&followRef.current)feed.scrollTop=feed.scrollHeight},[visible]);
  useEffect(()=>{document.body.classList.toggle('chat-fullscreen',fullscreen);return()=>{document.body.classList.remove('chat-fullscreen')}},[fullscreen]);

  const changeMode=(next:Mode)=>{
    if(next===mode)return;
    const base=buildCommon(seed);
    setMode(next);setTyping('');setActivePoint(null);setStageIndex(0);setDirections([]);followRef.current=true;
    // スマホでは埋め込み表示だと会話も選択肢も画面に収まらないので、どのモードも全画面で開く
    if(typeof window!=='undefined'&&window.matchMedia('(max-width:800px)').matches)setFullscreen(true);
    // 前半は3モード共通。圧力側/非圧力側へ移る時は前半を積み終えた状態から始め、
    // 分岐点以降だけを流す。頭から流し直すと「切り替わっていない」ようにしか見えない。
    if(next==='pressure'||next==='open'){setVisible(base);setCursor(base.length)}
    else{setVisible(base.slice(0,2));setCursor(2)}
  };
  const choose=(option:VerifyOption)=>{
    const nextDirections=[...directions,option.direction];
    const repeat=nextDirections.filter(direction=>direction===option.direction).length;
    const shifts=option.target?[{id:option.target.id,state:(repeat>=2?option.target.final:'partial') as CriterionState}]:undefined;
    const stamp=`${seed}-v${stageIndex}`;
    const mine:Message={id:`${stamp}-you`,author:'あなた',initial:'あ',role:'constructive',text:option.text,reactions:[]};
    const reply:Message={id:`${stamp}-reply`,author:option.reply.author,initial:option.reply.initial,role:option.reply.role,text:option.reply.text,reactions:option.reply.reactions,criteria:shifts};
    setVisible(previous=>[...previous,mine,reply].slice(-80));
    setDirections(nextDirections);setStageIndex(value=>value+1);
  };
  const startExperience=()=>{
    // スクロールで移動せず、画面ごと会話ビューに切り替える（PCも同じ）
    setFullscreen(true);
  };
  const reset=()=>{const nextSeed=seed+1;const base=buildCommon(nextSeed);setSeed(nextSeed);setVisible(base.slice(0,2));setCursor(2);setTyping('');setActivePoint(null);setStageIndex(0);setDirections([]);commonSeenRef.current=false;followRef.current=true};

  const criteriaState=criteriaStateOf(visible);
  // POINT の横に出す簡易指標。断定ではなく「その構造が何回目か」。反復してこそ意味がある。
  const pointMetrics=useMemo(()=>{
    const counts:Record<string,number>={};const map:Record<string,{tiny:string;n:number}>={};
    for(const message of visible){
      const shifts=shiftsFor(message);
      if(!shifts.length)continue;
      const id=shifts[0].id;counts[id]=(counts[id]??0)+1;
      map[message.id]={tiny:CRITERION_TINY[id],n:counts[id]};
    }
    return map;
  },[visible]);
  const tally=useMemo(()=>tallyOf(visible),[visible]);
  const result=mode==='verify'&&stageIndex>=VERIFY_STAGES.length&&atEnd?verifyResult(directions):null;
  const observedMessage=(activePoint?visible.slice().reverse().find(message=>message.point?.note===activePoint):undefined)??visible.slice().reverse().find(message=>message.point);
  const pointDetail=useMemo(()=>{
    if(!observedMessage)return null;
    const shift=shiftsFor(observedMessage)[0];
    const anatomy=anatomyOf(observedMessage,shift);
    if(!shift)return anatomy?{name:null,tiny:null,state:null,count:0,anatomy}:null;
    return{name:CRITERION_NAME[shift.id],tiny:CRITERION_TINY[shift.id],state:shift.state,count:pointMetrics[observedMessage.id]?.n??1,anatomy};
  },[observedMessage,pointMetrics]);

  return <main className="site-shell"><nav className="topbar" aria-label="Dialogue Verification Model navigation"><a className="brand" href="#top" aria-label="Dialogue Verification Model home"><span className="brand-mark"/>DIALOGUE VERIFICATION MODEL</a><span className="nav-statement">Evidence-informed conversation study</span><span className="nav-status"><i/> SYNTHETIC MODEL</span></nav>
    <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">Conversation structure verification model</p><h1>情報を<span className="hl">ひらき</span>、<br/>判断を<span className="hl">自分の手</span>に戻す。</h1><p className="lead">DIALOGUE VERIFICATION MODEL は、合成会話を用いて、情報経路・反応の偏り・異論の扱いが参加者の判断環境に与える影響を検証する研究プロトタイプです。特定の人物や場を評価せず、開放的な対話の条件を考えます。</p><div className="hero-tags"><span>合成会話</span><span>理論参照</span><span>意図は断定しない</span></div><button className="hero-start" type="button" onClick={startExperience}>START<i aria-hidden="true">↓</i></button></div><aside className="hero-aside"><figure className="branch-figure" aria-label="中間型から閉鎖型と開放型に分かれる図"><svg viewBox="0 0 300 210" role="img" aria-hidden="true"><path className="bf-line" d="M60 40 C60 110, 150 90, 150 150"/><path className="bf-line" d="M60 40 C60 110, 250 90, 250 150"/><circle className="bf-node bf-mid" cx="60" cy="40" r="13"/><circle className="bf-node bf-close" cx="150" cy="150" r="11"/><circle className="bf-node bf-open" cx="250" cy="150" r="11"/><text className="bf-label" x="84" y="44">中間型</text><text className="bf-sub" x="84" y="60">中心人物がいない</text><text className="bf-label" x="150" y="182" textAnchor="middle">閉鎖型</text><text className="bf-label" x="250" y="182" textAnchor="middle">開放型</text><text className="bf-sub" x="150" y="197" textAnchor="middle">入り口がひとつ</text><text className="bf-sub" x="250" y="197" textAnchor="middle">入り口は複数</text></svg><figcaption>同じ前半から、応答のしかたで場が分かれます。</figcaption></figure><p>研究上の問い</p><strong>異論と検証が<br/>両立する対話設計とは。</strong><small>登場する会話・人物・資料・イベントはすべて架空です。実在の組織や個人を診断・評価するものではありません。</small></aside></section>
    <section id="experience" className={`experience${fullscreen?' is-active':''}`} aria-label="Chat pattern simulator">
      <div className="mode-tabs" role="tablist" aria-label="会話モードの切り替え">{fullscreen&&<button className="exp-back" type="button" onClick={()=>setFullscreen(false)}>← もどる</button>}<p className="mode-lead">中心人物のいない中間型を共通の起点とし、そこから場が分かれた場合を比較します。前半の会話は3つとも同一です。</p><div className="mode-row">{MODES.map(item=><button key={item.id} type="button" role="tab" aria-selected={mode===item.id} className={mode===item.id?'is-active':''} onClick={()=>changeMode(item.id)}><b>{item.label}</b><span>{item.hint}</span></button>)}</div></div>
      <div className={`chat-window phone-chat${awaitingChoice||result?' has-verify':''}${fullscreen?' is-fullscreen':''}`}><header className="chat-head">{fullscreen&&<button className="fs-back" type="button" aria-label="全画面を閉じる" onClick={()=>setFullscreen(false)}>←</button>}<div className="room-icon">O</div><div><b>Open Network Talk</b><span>{MODES.find(item=>item.id===mode)?.label} · 架空のコミュニティ</span></div>{!fullscreen&&<button className="fs-toggle" type="button" onClick={()=>setFullscreen(true)}>全画面</button>}{fullscreen&&<span className="fs-note">会話・人物・資料は<br/>すべて架空です</span>}<div className="room-lock">🔒 架空設定 / 運用グループ確認</div></header>{fullscreen&&<div className="fs-modes" role="tablist" aria-label="会話モードの切り替え">{MODES.map(item=><button key={item.id} type="button" role="tab" aria-selected={mode===item.id} className={mode===item.id?'is-active':''} onClick={()=>changeMode(item.id)}>{item.label}</button>)}</div>}{fullscreen&&signalOpen&&<div className="fs-sheet" role="dialog" aria-label="観察パネル"><button className="fs-sheet-scrim" type="button" aria-label="閉じる" onClick={()=>setSignalOpen(false)}/><div className="fs-sheet-body"><button className="fs-sheet-grip" type="button" aria-label="閉じる" onClick={()=>setSignalOpen(false)}><i/></button><p className="panel-kicker">PATTERN SIGNAL</p><ul className="criteria-live">{CRITERIA.map(criterion=>{const state=criteriaState[criterion.id];return <li key={criterion.id} className={`crit ${state}`}><i aria-hidden="true">{STATE_MARK[state]}</i><div className="crit-main"><span className="crit-name">{CRITERION_NAME[criterion.id]}</span><em>{STATE_PLAIN[state]}</em><b>{tally[criterion.id].observed}回</b></div><p className="crit-desc">{stateTextFor(criterion.id,state,tally[criterion.id].observed)}</p></li>})}</ul><div className="fs-point"><b>{observedMessage?.point?.label??'観察対象を待っています'}</b>{pointDetail&&<div className="point-effect">{pointDetail.anatomy&&<><div className="anatomy-row"><span className="anatomy-key">含まれる要素</span><span className="anatomy-tags">{pointDetail.anatomy.elements.map(item=><i key={item}>{item}</i>)}</span></div><div className="anatomy-row"><span className="anatomy-key">与えうる影響</span><p className="anatomy-body">{pointDetail.anatomy.influence}</p></div></>}{pointDetail.name&&<div className="anatomy-row"><span className="anatomy-key">効いている基準</span><span className="anatomy-tags"><i className={`crit-tag ${pointDetail.state}`}>{pointDetail.tiny}</i><em>{pointDetail.name} · {pointDetail.count}回目</em></span></div>}{!pointDetail.name&&<div className="anatomy-row"><span className="anatomy-key">効いている基準</span><p className="anatomy-body">この発言自体は、どの基準も動かしません。</p></div>}</div>}{observedMessage?.point&&<p>{observedMessage.point.note}</p>}<small>右の数字はこの会話での観測回数です。単発では何も確定しません。同じ向きの働きかけが重なった時にだけ、基準が振れます。</small></div></div></div>}<div className="pinned"><b>このシミュレーションについて</b><span>会話・人物・資料はすべて架空です。参加者が自分で検証できる情報環境を考えます。</span></div><div className="message-feed phone-feed" ref={feedRef} onScroll={(event)=>{const node=event.currentTarget;followRef.current=node.scrollHeight-node.scrollTop-node.clientHeight<56}} aria-live="polite">{visible.map((message,index)=><Fragment key={`${message.id}-${index}`}><article className={`message ${message.role??''}`}><div className="avatar">{message.initial}</div><div className="message-body"><div className="message-meta"><b>{message.author}</b><span>21:{String(4+index).padStart(2,'0')}</span>{message.role==='critical'&&<em>検証メモ</em>}</div><div className="bubble">{message.text}{message.point&&<button className="point" aria-label={`${message.author}の発話を観察パネルに表示`} aria-pressed={activePoint===message.point.note} onClick={()=>{setActivePoint(message.point?.note??null);if(fullscreen)setSignalOpen(true)}}>POINT</button>}{pointMetrics[message.id]&&<span className="point-metric" title="この構造がこの会話で何回目か">{pointMetrics[message.id].tiny} {pointMetrics[message.id].n}</span>}</div>{message.preview&&<a className="link-preview" href={message.preview.url} target="_blank" rel="noreferrer"><b>{message.preview.title}</b><span>{message.preview.meta}</span><small>{message.preview.url}</small></a>}<div className="reactions">{message.reactions.length?message.reactions.map(reaction=><span key={reaction}>{reaction}</span>):<span className="seen">既読 31 · 反応なし</span>}{message.silentCore&&<span className="seen">圧力高め型BOT · 既読 · 反応なし</span>}</div></div></article>{message.branch&&<div className="branch-marker"><b>分岐点</b><span>{BRANCH_NOTE}</span>{mode!=='verify'&&<div className="branch-actions">{mode!=='pressure'&&<button type="button" onClick={()=>changeMode('pressure')}>閉鎖型を見る</button>}{mode!=='open'&&<button type="button" onClick={()=>changeMode('open')}>開放型を見る</button>}</div>}</div>}</Fragment>)}</div>{awaitingChoice&&pendingStage&&<div className="verify-choices"><b>{pendingStage.prompt}</b>{pendingStage.options.map(option=><button key={option.id} type="button" onClick={()=>choose(option)}>{option.text}</button>)}<small>{VERIFY_DISCLAIMER}</small></div>}{result&&<div className="verify-result"><b>{result.label}</b><p>{result.body}</p><small>{VERIFY_DISCLAIMER}</small></div>}{!fullscreen&&<button className="fs-open-cta" type="button" onClick={()=>setFullscreen(true)}>全画面で開く</button>}<div className="composer"><span className={`typing ${typing?'is-typing':''}`}>{typing||' '}</span><div className="composer-row"><button aria-label="Add reaction" type="button">＋</button><input aria-label="Simulated message composer" value={typing?(typing.split('… ')[1]??''):''} readOnly placeholder="メッセージを入力"/><button aria-label="Send simulated message" type="button">↑</button></div></div></div>
      <aside className="observer-panel"><p className="panel-kicker">PATTERN SIGNAL</p><ul className="criteria-live">{CRITERIA.map(criterion=>{const state=criteriaState[criterion.id];return <li key={criterion.id} className={`crit ${state}`}><i aria-hidden="true">{STATE_MARK[state]}</i><div className="crit-main"><span className="crit-name">{CRITERION_NAME[criterion.id]}</span><em>{STATE_PLAIN[state]}</em><b>{tally[criterion.id].observed}回</b></div><p className="crit-desc">{stateTextFor(criterion.id,state,tally[criterion.id].observed)}</p></li>})}</ul><div className="fs-point" aria-live="polite"><b>{observedMessage?.point?.label??'観察対象を待っています'}</b>{pointDetail&&<div className="point-effect">{pointDetail.anatomy&&<><div className="anatomy-row"><span className="anatomy-key">含まれる要素</span><span className="anatomy-tags">{pointDetail.anatomy.elements.map(item=><i key={item}>{item}</i>)}</span></div><div className="anatomy-row"><span className="anatomy-key">与えうる影響</span><p className="anatomy-body">{pointDetail.anatomy.influence}</p></div></>}{pointDetail.name&&<div className="anatomy-row"><span className="anatomy-key">効いている基準</span><span className="anatomy-tags"><i className={`crit-tag ${pointDetail.state}`}>{pointDetail.tiny}</i><em>{pointDetail.name} · {pointDetail.count}回目</em></span></div>}{!pointDetail.name&&<div className="anatomy-row"><span className="anatomy-key">効いている基準</span><p className="anatomy-body">この発言自体は、どの基準も動かしません。</p></div>}</div>}{observedMessage?.point&&<p>{observedMessage.point.note}</p>}<small>チャット内の POINT を押すと、その発言の解説に切り替わります。右の数字はこの会話での観測回数です。単発では何も確定しません。</small></div><div className="controls"><button onClick={()=>setPaused(value=>!value)} type="button">{paused?'再生する':'一時停止'}</button><label>速度<select value={speed} onChange={event=>setSpeed(Number(event.target.value))}><option value={11000}>ゆっくり</option><option value={8500}>標準</option><option value={4500}>速い</option></select></label><button onClick={reset} type="button">最初から</button></div></aside></section>
    <section className="theory-section" aria-label="理論的な位置づけと参考文献"><p className="eyebrow">Theoretical framing</p><h2>このモデルが見るもの</h2><p>反応の多さや強い言葉だけで、圧力や意図を決めることはできません。このモデルは、反応の偏り、異論への応答、根拠の比較可能性、情報経路の複数性が反復して現れるかを観察します。</p><div className="theory-grid"><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6377616/" target="_blank" rel="noreferrer"><b>同調と選好</b><span>多数への一致が選好に影響し得ることを扱う実験研究。</span><small>Heycke et al., 2018 · PMC</small></a><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5368259/" target="_blank" rel="noreferrer"><b>少数意見と受容</b><span>少数意見と受容的な風土が、集団の情報処理を支える可能性。</span><small>Curşeu et al., 2017 · PMC</small></a><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4466438/" target="_blank" rel="noreferrer"><b>反応・拒絶・同調</b><span>集団内の感情的な反応と、同調・逸脱の関係を扱う研究。</span><small>Heerdink et al., 2015 · PMC</small></a></div><p className="theory-note">参考文献は理論的な着眼点のためのものです。特定の実在会話・人物・組織への当てはめや診断を裏付けるものではありません。</p><h3 className="theory-sub">コミュニティ自治・分散組織の参考資料</h3><p className="theory-sub-note">中心のない集団がどこで閉じるのか、異議をどう扱うのか。この分岐モデルの背景にある古典的な議論です。</p><div className="theory-grid"><a href="https://www.jofreeman.com/joreen/tyranny.htm" target="_blank" rel="noreferrer"><b>構造なき組織の専制</b><span>明示的な構造を持たない集団では、非公式な影響力が見えない形で固定されることを論じた古典。中間型が閉鎖型へ寄る筋と重なります。</span><small>Jo Freeman, 1972</small></a><div className="theory-card"><b>コモンズのガバナンス</b><span>共有資源を自治で維持する集団に共通する設計原則を、多数の事例から抽出した研究。境界・参加・紛争解決の扱いを論じています。</span><small>Elinor Ostrom, 1990 · 書籍</small></div><div className="theory-card"><b>離脱・発言・忠誠</b><span>不満を持った成員が「離れる」か「意見を言う」かを選ぶ構造の分析。反対意見の扱いと、外へ出る経路の有無を考える枠組みです。</span><small>Albert O. Hirschman, 1970 · 書籍</small></div><div className="theory-card"><b>沈黙の螺旋</b><span>自分の意見が少数派だと感じた人が発言を控え、その結果として多数派がさらに大きく見える循環を扱った理論。</span><small>Elisabeth Noelle-Neumann, 1974 · 論文</small></div></div><p className="theory-note">リンクのない項目は書籍・論文です。書誌情報のみ記載しています。ここに挙げた文献は、この分岐モデルを着想する上での背景であり、モデルの正しさを保証するものではありません。</p><h3 className="theory-sub">この4基準はどこから来ているか</h3><p className="theory-sub-note">観察に使う4つの基準は、思いつきで並べたものではありません。それぞれ、下の議論から取っています。ただし、これらの文献がこのモデルを検証したわけではありません。対応は私たちの解釈です。</p><ul className="basis-list"><li><span className="basis-name">もとの資料</span><p>主張のもとになった資料と、それに合わない材料が出てくるか。少数意見と受容的な風土が集団の情報処理を支えるという議論（Curşeu et al., 2017）と、検証と紛争解決の手続きを設計原則に置いた議論（Ostrom, 1990）に依っています。</p></li><li><span className="basis-name">中身の扱い</span><p>誰が言ったかではなく中身で扱われるか。多数への一致が選好そのものに影響し得るという実験（Heycke et al., 2018）と、逸脱者への感情的な反応を扱った研究（Heerdink et al., 2015）に依っています。</p></li><li><span className="basis-name">反対意見の扱い</span><p>反対意見が同じ場に残るか。少数派だと感じた人が発言を控え、多数派がさらに大きく見える循環（Noelle-Neumann, 1974）と、不満が「発言」と「離脱」に分かれる構造（Hirschman, 1970）に依っています。</p></li><li><span className="basis-name">情報の入り口</span><p>確かめる道が複数あるか。明示的な構造を持たない集団で非公式な影響力が固定されるという指摘（Freeman, 1972）と、離脱という経路の有無が組織の応答性を変えるという議論（Hirschman, 1970）に依っています。</p></li></ul></section>
    <section className="self-entry" aria-label="自己点検への入口"><Link href="/self"><b>では、あなたのいる場はどうですか</b><span>同じ4基準で、自分が関わっている場の見え方を確かめる別の入口です。</span><small>診断ではありません。場面を見て「ある / ない」を選ぶだけです。回答はこのブラウザの中だけで処理され、どこにも送信されません。</small></Link></section>
    <footer><span>DIALOGUE VERIFICATION MODEL · Synthetic conversation study</span><span>POINT を押すと発話の構造を確認できます。</span></footer></main>;
}
