'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { CRITERIA, STATE_MARK } from '../data/criteria';
import {
  ANSWERS,
  CRITERION_SHORT,
  PHRASE_EXAMPLES,
  SELF_DISCLAIMER,
  SELF_QUESTIONS,
  readSelf,
  selfResult,
} from '../data/self-check';
import type { Answer, SelfState } from '../data/self-check';

const STATE_TEXT: Record<SelfState, string> = {
  met: '保たれて見える',
  partial: 'ゆらいで見える',
  unmet: '弱って見える',
  unknown: '観察できていない',
};

const STATE_ICON: Record<SelfState, string> = {
  met: STATE_MARK.met,
  partial: STATE_MARK.partial,
  unmet: STATE_MARK.unmet,
  unknown: '?',
};

export default function SelfCheck() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitted, setSubmitted] = useState(false);
  const answered = SELF_QUESTIONS.filter((question) => answers[question.id]).length;
  const reading = useMemo(() => readSelf(answers), [answers]);
  const result = useMemo(() => selfResult(reading), [reading]);

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Dialogue Verification Model navigation">
        <Link className="brand" href="/" aria-label="Dialogue Verification Model home">
          <span className="brand-mark" />
          DIALOGUE VERIFICATION MODEL
        </Link>
        <span className="nav-statement">Self observation</span>
        <Link className="nav-back" href="/">
          ← 合成会話モデルに戻る
        </Link>
      </nav>

      <section className="self-hero">
        <p className="eyebrow">Self observation</p>
        <h1>
          あなたには、
          <br />
          その場がどう見えていますか。
        </h1>
        <p className="lead">
          ここから先は架空の会話ではなく、あなた自身が関わっている場の話です。判定は出しません。場面を見て「ある / ない」を選ぶだけで、違和感がどのあたりから来ているのか、見当をつけるための入口です。
        </p>
        <p className="self-note">{SELF_DISCLAIMER}</p>
      </section>

      <section className="self-body" aria-label="自己点検の設問">
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
            {answered} / {SELF_QUESTIONS.length} 件に回答
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
                  <b>違和感の出どころ</b>
                  <p>
                    もっとも弱って見えているのは
                    {result.focus.map((id) => `「${CRITERION_SHORT[id]}」`).join('と')}
                    です。その場に対するもやもやは、この辺りから来ている可能性があります。
                  </p>
                </div>
              )}
              {result.unseen.length > 0 && (
                <div className="self-focus">
                  <b>見えていない場所</b>
                  <p>
                    {result.unseen.map((id) => `「${CRITERION_SHORT[id]}」`).join('と')}
                    は「わからない」のままです。判断を保留すべき領域として残しておいてください。
                  </p>
                </div>
              )}
              {(result.headline.includes('閉鎖') || result.headline.includes('中間')) && (
                <div className="phrase-box">
                  <b>試せる言い回し</b>
                  <p className="phrase-note">シミュレーション上で開放側への効果が大きかった要素です。効果を証明するものではなく、試す材料として置いています。</p>
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
                  回答を見直す
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                >
                  最初から
                </button>
              </div>
              <p className="self-note">{SELF_DISCLAIMER}</p>
            </>
          ) : (
            <>
              <p className="self-hint">
                すべての設問に答えると、4つの基準がどう見えているかを返します。答えられない設問は「わからない」を選んでください。それも観察結果として扱います。
              </p>
              <button
                type="button"
                className="self-submit"
                disabled={answered < SELF_QUESTIONS.length}
                onClick={() => setSubmitted(true)}
              >
                {answered < SELF_QUESTIONS.length ? `あと ${SELF_QUESTIONS.length - answered} 件` : '見え方を確かめる'}
              </button>
              <div className="validation-card">
                <b>使っている物差し</b>
                <span>合成会話モデルの右パネルと同じ4基準です。架空の会話で見た動きを、そのまま自分の場に当てています。</span>
                <small>単発の出来事では確定しません。「よくある」が揃った時にだけ振れます。</small>
              </div>
            </>
          )}
        </aside>
      </section>

      <footer>
        <span>DIALOGUE VERIFICATION MODEL · Self observation</span>
        <Link href="/">合成会話モデルに戻る</Link>
      </footer>
    </main>
  );
}
