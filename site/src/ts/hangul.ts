/**
 * 한글 자판으로 치듯 보여 주기(히어로 제목 · 마무리 선언에서 같이 씀)
 * 한 글자의 입력 단계: 초성 → 받침 없는 글자 → 완성(받침이 있으면). 예) 장: ㅈ → 자 → 장
 * scripts/fonts.py의 typing_steps와 같은 규칙(타이핑 중에 지나가는 글자도 글꼴 묶음에 넣기 위해)
 */
export const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

export function steps(ch: string): string[] {
  const c = ch.charCodeAt(0) - 0xac00;
  if (c < 0 || c > 11171) return [ch];
  const cho = Math.floor(c / 588), jung = Math.floor((c % 588) / 28), jong = c % 28;
  const s = [CHO[cho], String.fromCharCode(0xac00 + cho * 588 + jung * 28)];
  if (jong) s.push(ch);
  return s;
}
