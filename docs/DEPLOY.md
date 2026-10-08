# 기존 사이트를 새 사이트로 바꾸는 방법 (도메인 그대로)

**결론: 도메인(pause8studio.com)은 그대로 두고, 그 도메인이 가리키는 '사이트 프로그램'만 새것으로 바꿉니다.**
도메인을 새로 사거나 옮길 필요가 없고, 검색엔진 등록(구글 서치 콘솔 인증 코드)도 그대로 이어집니다.

## 0. 먼저 확인할 것 — 지금 사이트가 어디서 돌아가고 있나
기존 프로젝트(`pause-studio-v2`)는 Google AI Studio에서 만든 Express 서버(`server.ts`, 포트 3000)입니다.
보통 **AI Studio → 'Deploy to Cloud Run'(구글 클라우드)** 로 올리고, Cloud Run에서 도메인을 연결합니다.
- 구글 클라우드 콘솔 → Cloud Run → 서비스 목록에 사이트가 있는지, '도메인 매핑'에 pause8studio.com이 있는지 확인
- 다른 곳(Vercel·Render·Railway 등)이라면 그 서비스의 프로젝트 화면에서 도메인 설정을 확인
- 도메인을 산 곳(가비아·GoDaddy·Namecheap·Cloudflare 등)의 DNS 설정(A/CNAME 기록)을 보면 어디로 연결돼 있는지 알 수 있음

## 1. 새 사이트를 '임시 주소'로 먼저 올리기 (기존 사이트는 그대로 둠)
새 사이트는 `site/` 폴더 하나로 끝납니다(Node 서버 + 정적 파일, `Dockerfile` 포함).
Cloud Run 예시(구글 클라우드 CLI):
```bash
cd site
gcloud run deploy pause-studio-2026 --source . --region australia-southeast1 --allow-unauthenticated \
  --set-env-vars "CONTACT_TO=scottnim7777@gmail.com,TRUST_PROXY=1"
# 메일(SMTP)을 쓰면: --set-env-vars "SMTP_HOST=smtp.gmail.com,SMTP_PORT=465,SMTP_USER=…" 그리고 SMTP_PASS는 Secret Manager로
```
→ `https://pause-studio-2026-xxxx.a.run.app` 같은 임시 주소가 나옵니다.

### 임시 주소에서 확인할 것
- [ ] PC·휴대폰으로 열어 보기(히어로 인트로, 포트폴리오 크게 보기, 요금, FAQ)
- [ ] 상담 신청을 실제로 한 번 보내 보고 메일이 오는지(SMTP를 안 쓰면 FormSubmit이 처음 한 번 '확인 메일'을 보냄 → 승인)
- [ ] 카카오톡·문자 버튼, 이메일 보기
- [ ] 통화: 뉴질랜드에서 열면 요금이 **NZD**(GST 포함), 주소 끝에 `?cur=usd`를 붙이면 **USD**로 보이는지(뉴질랜드 밖 방문자 화면). 실제로 미국 등에서 보면 자동으로 USD

## 2. 도메인을 새 사이트로 돌리기
- **Cloud Run**: 도메인 매핑에서 pause8studio.com(과 www)을 새 서비스 `pause-studio-2026`으로 바꿈
- **다른 호스팅**: 새 사이트를 올린 곳에서 도메인을 추가하고, DNS 기록을 안내대로 바꿈
- 바뀌는 데 몇 분~몇 시간(보통 1시간 안). 그동안은 옛 사이트나 새 사이트가 섞여 보일 수 있음

## 3. 되돌리기(문제가 생기면)
- 기존 서비스는 **지우지 말고 1~2주 그대로 둠** → 도메인 매핑(또는 DNS)만 다시 옛 서비스로 돌리면 즉시 원상복구
- 문제가 없으면 2주 뒤 옛 서비스를 정리

## 4. 바꾼 뒤 할 일
- 구글 서치 콘솔: 인증 코드는 새 사이트에도 그대로 들어 있음 → 사이트맵(`https://pause8studio.com/sitemap.xml`) 다시 제출
- 예전 주소(/promo-image 등)는 새 서버가 첫 화면으로 자동 이동(301)시킴
- 카카오톡·인스타그램 등에 걸어 둔 링크 미리보기 이미지가 바뀌었는지 확인(공유 이미지 `og.jpg`)

## 참고
- 코드 위치: `scottnim7777-ops/pause-studio-x-higgs` 저장소의 `site/` 폴더(브랜치 `claude/charming-euler-bt8uf2`). 원하시면 기존 `pause-studio-v2` 저장소에 옮겨 넣을 수도 있습니다.
- 환경 변수: `site/.env.example` 참고. 비밀번호(SMTP_PASS)는 코드나 저장소에 넣지 말고 배포 서비스의 비밀값 기능으로.
- **통화(접속 위치)**: 서버가 첫 화면을 줄 때 방문자 IP로 뉴질랜드 = NZD, 그 밖의 나라 = USD(같은 숫자)를 고릅니다. 따로 설정할 것은 없습니다.
  - Cloud Run처럼 앞에 프록시가 한 단계 있으면 `TRUST_PROXY=1`(기본값) 그대로. Cloudflare·Vercel 등을 쓰면 그쪽이 알려 주는 국가 정보를 먼저 씁니다.
  - 뉴질랜드 IP 목록(`site/src/geo/nz-ip.json`)은 인터넷 등록기관 공개 자료로 만든 것 — 몇 달에 한 번 `python3 scripts/nz-ip.py` 후 다시 배포하면 최신.
  - 첫 화면은 방문자마다 다르므로 `Cache-Control: private` — CDN을 앞에 둘 때 HTML은 캐시하지 않게.
