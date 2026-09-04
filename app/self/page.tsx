'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { criteriaList, STATE_MARK } from '../data/criteria';
import {
  answersList,
  criterionShort,
  phraseExamples,
  selfDisclaimer,
  selfQuestions,
  readSelf,
  selfResult,
} from '../data/self-check';
import type { Answer, SelfState } from '../data/self-check';
import { pick, useLang } from '../i18n/lang';
import type { Lang } from '../i18n/lang';

function stateText(lang: Lang): Record<SelfState, string> {
  return lang === 'en'
    ? { met: 'looks intact', partial: 'looks wavering', unmet: 'looks weakened', unknown: 'not observed' }
    : { met: '保たれて見える', partial: 'ゆらいで見える', unmet: '弱って見える', unknown: '観察できていない' };
}

const STATE_ICON: Record<SelfState, string> = {
  met: STATE_MARK.met,
  partial: STATE_MARK.partial,
  unmet: STATE_MARK.unmet,
  unknown: '?',
};

export default function SelfCheck() {
  const [lang, setLang] = useLang();
  const t = (ja: string, en: string) => pick(lang, ja, en);
  const CRITERIA = useMemo(() => criteriaList(lang), [lang]);
  const CRITERION_SHORT = useMemo(() => criterionShort(lang), [lang]);
  const ANSWERS = useMemo(() => answersList(lang), [lang]);
  const SELF_QUESTIONS = useMemo(() => selfQuestions(lang), [lang]);
  const SELF_DISCLAIMER = useMemo(() => selfDisclaimer(lang), [lang]);
  const PHRASE_EXAMPLES = useMemo(() => phraseExamples(lang), [lang]);
  const STATE_TEXT = useMemo(() => stateText(lang), [lang]);

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitted, setSubmitted] = useState(false);
  const answered = SELF_QUESTIONS.filter((question) => answers[question.id]).length;
  const reading = useMemo(() => readSelf(answers), [answers]);
  const result = useMemo(() => selfResult(reading, lang), [reading, lang]);
  const isClosedOrMiddle = result.headline.includes('閉鎖') || result.headline.includes('中間') || result.headline.includes('closed') || result.headline.includes('middling');

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Dialogue Verification Model navigation">
        <Link className="brand" href="/" aria-label="Dialogue Verification Model home">
          <span className="brand-mark" />
          DIALOGUE VERIFICATION MODEL
        </Link>
        <span className="nav-statement">Self observation</span>
        <div className="nav-right">
          <button className="lang-toggle" type="button" onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')} aria-label="Switch language">
            {lang === 'ja' ? 'EN' : '日本語'}
          </button>
          <Link className="nav-back" href="/">
            {t('← 合成会話モデルに戻る', '← Back to the model')}
          </Link>
        </div>
      </nav>

      <section className="self-hero">
        <p className="eyebrow">Self observation</p>
        <h1>
          {lang === 'en' ? (
            <>How does it look to you, <br />the room you are in?</>
          ) : (
            <>あなたには、<br />その場がどう見えていますか。</>
          )}
        </h1>
        <p className="lead">
          {t(
            'ここから先は架空の会話ではなく、あなた自身が関わっている場の話です。判定は出しません。場面を見て「ある / ない」を選ぶだけで、違和感がどのあたりから来ているのか、見当をつけるための入口です。',
            'From here on, this is not about a fictional conversation — it is about a room you yourself are part of. This does not render a verdict. You simply look at scenes and pick "yes" or "no," as an entry point for guessing where the unease is coming from.',
          )}
        </p>
        <p className="self-note">{SELF_DISCLAIMER}</p>
      </section>

      <section className="self-body" aria-label={t('自己点検の設問', 'Self-check questions')}>
        <ol className="self-questions">
          {SELF_QUESTIONS.map((question, index) => (
            <li key={question.id} className={answers[question.id] ? 'is-answered' : ''}>
              <p className="self-scene">
                <b>{String(index + 1).padStart(2, '0')}</b>
                {question.scene}
              </p>
              <div className="self-answers" role="group" aria-label={question.scene}>
                {ANSWERS.map((answer) => (
                  <button
                    key={answer.id}
                    type="button"
                    aria-pressed={answers[question.id] === answer.id}
                    className={answers[question.id] === answer.id ? 'is-picked' : ''}
                    onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: answer.id }))}
                  >
                    {answer.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <aside className="self-panel">
          <p className="panel-kicker">READING</p>
          <p className="self-progress">
            {answered} / {SELF_QUESTIONS.length} {t('件に回答', 'answered')}
          </p>
          {submitted ? (
            <>
              <div className="self-result">
                <b>{result.headline}</b>
                <p>{result.body}</p>
              </div>
              <ul className="criteria-live">
                {CRITERIA.map((criterion) => {
                  const state = reading[criterion.id].state;
                  return (
                    <li key={criterion.id} className={`crit ${state}`}>
                      <i aria-hidden="true">{STATE_ICON[state]}</i>
                      <span>{CRITERION_SHORT[criterion.id]}</span>
                      <em>{STATE_TEXT[state]}</em>
                    </li>
                  );
                })}
              </ul>
              {result.focus.length > 0 && (
                <div className="self-focus">
                  <b>{t('違和感の出どころ', 'Where the unease comes from')}</b>
                  <p>
                    {t(
                      `もっとも弱って見えているのは${result.focus.map((id) => `「${CRITERION_SHORT[id]}」`).join('と')}です。その場に対するもやもやは、この辺りから来ている可能性があります。`,
                      `What looks weakest is ${result.focus.map((id) => `"${CRITERION_SHORT[id]}"`).join(' and ')}. The unease you feel about that room may be coming from around here.`,
                    )}
                  </p>
                </div>
              )}
              {result.unseen.length > 0 && (
                <div className="self-focus">
                  <b>{t('見えていない場所', "What you can't see")}</b>
                  <p>
                    {t(
                      `${result.unseen.map((id) => `「${CRITERION_SHORT[id]}」`).join('と')}は「わからない」のままです。判断を保留すべき領域として残しておいてください。`,
                      `${result.unseen.map((id) => `"${CRITERION_SHORT[id]}"`).join(' and ')} stayed at "don't know." Keep it as an area where judgment should stay on hold.`,
                    )}
                  </p>
                </div>
              )}
              {isClosedOrMiddle && (
                <div className="phrase-box">
                  <b>{t('試せる言い回し', 'Phrasing you could try')}</b>
                  <p className="phrase-note">
                    {t(
                      'シミュレーション上で開放側への効果が大きかった要素です。効果を証明するものではなく、試す材料として置いています。',
                      "These are the elements that had the largest effect toward the open side in the simulation. This doesn't prove they work — it's offered as something to try.",
                    )}
                  </p>
                  <ul>
                    {PHRASE_EXAMPLES.map((phrase) => (
                      <li key={phrase.label}>
                        <span className="phrase-label">{phrase.label}</span>
                        <p>「{phrase.text}」</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="self-actions">
                <button type="button" onClick={() => setSubmitted(false)}>
                  {t('回答を見直す', 'Review your answers')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                >
                  {t('最初から', 'Start over')}
                </button>
              </div>
              <p className="self-note">{SELF_DISCLAIMER}</p>
            </>
          ) : (
            <>
              <p className="self-hint">
                {t(
                  'すべての設問に答えると、4つの基準がどう見えているかを返します。答えられない設問は「わからない」を選んでください。それも観察結果として扱います。',
                  'Once you answer every question, this returns how the four criteria look. If you can\'t answer one, choose "don\'t know" — that counts as an observation too.',
                )}
              </p>
              <button
                type="button"
                className="self-submit"
                disabled={answered < SELF_QUESTIONS.length}
                onClick={() => setSubmitted(true)}
              >
                {answered < SELF_QUESTIONS.length ? t(`あと ${SELF_QUESTIONS.length - answered} 件`, `${SELF_QUESTIONS.length - answered} left`) : t('見え方を確かめる', 'Check how it looks')}
              </button>
              <div className="validation-card">
                <b>{t('使っている物差し', 'The yardstick in use')}</b>
                <span>{t('合成会話モデルの右パネルと同じ4基準です。架空の会話で見た動きを、そのまま自分の場に当てています。', "The same four criteria as the model's right-hand panel. The patterns you saw in the fictional conversation are applied directly to your own room.")}</span>
                <small>{t('単発の出来事では確定しません。「よくある」が揃った時にだけ振れます。', 'A single instance settles nothing. It only shifts once "often" answers line up.')}</small>
              </div>
            </>
          )}
        </aside>
      </section>

      <footer>
        <span>DIALOGUE VERIFICATION MODEL · Self observation</span>
        <Link href="/">{t('合成会話モデルに戻る', 'Back to the model')}</Link>
      </footer>
    </main>
  );
}
