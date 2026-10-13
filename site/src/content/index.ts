/**
 * 언어별 문구 고르기. en.ts가 ko.ts와 같은 모양이 아니면 아래 대입에서 타입 오류가 나서 빌드가 멈춘다(영어 페이지에 빠진 글이 생기지 않게).
 */
import * as ko from './ko';
import * as en from './en';

export type Lang = 'ko' | 'en';
export type Content = typeof ko;
const checked: Content = en; // 모양이 다르면 여기서 오류
export const contentOf = (lang: Lang): Content => (lang === 'en' ? checked : ko);
export type { Txt, Cur, CompareCase, FilmSample, Plan, VideoPlan, WorkItem, Faq } from './ko';
