'use client';

import { useEffect, useState } from 'react';

export type Lang = 'ja' | 'en';

const KEY = 'dvm-lang';

/** 言語状態。ブラウザにだけ保存し、どこにも送信しない。既定は日本語。 */
export function useLang(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>('ja');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === 'ja' || saved === 'en') setLangState(saved);
    } catch {
      // ストレージが使えない環境では既定言語のまま
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // 保存できなくても表示の切り替え自体は成立させる
    }
  };

  return [lang, setLang];
}

/** 日本語と英語を並べて書き、lang に応じてどちらかを返す。会話データ・UI文言の両方で使う共通ヘルパー。 */
export function pick(lang: Lang, ja: string, en: string): string {
  return lang === 'en' ? en : ja;
}
