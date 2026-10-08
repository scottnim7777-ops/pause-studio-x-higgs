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
  --set-env-vars "CONTACT_TO=info@pause8studio.com,TRUST_PROXY=1"
# 메일(SMTP)을 쓰면: --set-env-vars "SMTP_HOST=smtp.gmail.com,SMTP_PORT=465,SMTP_USER=…" 그리고 SMTP_PASS는 Secret Manager로
```
→ `https://pause-studio-2026-xxxx.a.run.app` 같은 임시 주소가 나옵니다.

### 임시 주소에서 확인할 것
- [ ] PC·휴대폰으로 열어 보기(히어로 인트로, 포트폴리오 크게 보기, 요금, FAQ)
- [ ] 상담 신청을 실제로 한 번 보내 보고 메일이 오는지(SMTP를 안 쓰면 FormSubmit이 처음 한 번 '확인 메일'을 보냄 → 승인)
- [ ] 카카오톡·문자 버튼, 이메일 보기
- [ ] 통화: 뉴질랜드 인터넷으로 `https://(임시 주소)/api/currency`를 열면 `{"currency":"NZD","source":"ip"}`, 첫 화면 가격이 **NZ$1,990**인지. 뉴질랜드 밖(휴대폰 데이터 로밍·해외 지인·VPN)에서는 **US$1,990**인지. GST 문구는 어디에도 없어야 함

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
- **통화(접속 위치, 2026-10-08 최종 정책 `docs/PRICING_CURRENCY_POLICY_2026-10-08.md`)**: 서버가 첫 화면을 줄 때 방문자의 공인 IP로 정합니다. **뉴질랜드로 판별될 때만 NZ$, 그 밖의 모든 나라와 판별 실패는 US$**(같은 숫자, 환율 변환 없음). 위치 권한(GPS)은 묻지 않고, 방문자가 고르는 버튼도 없으며, IP는 판별에만 쓰고 기록하지 않습니다.
  - **지금 배포 환경(Cloud Run) 기준 판별 방식**: Cloud Run은 방문자 국가를 따로 알려 주지 않아서, 앞단(구글 프런트엔드)이 넘겨주는 방문자 IP(`X-Forwarded-For`)를 서버 안의 뉴질랜드 IP 목록(`site/src/geo/nz-ip.json`, 인터넷 등록기관 APNIC 등의 공개 할당 자료)과 대조합니다. `TRUST_PROXY=1`(기본값) 그대로 두세요.
  - **더 정확하게(선택)**: 도메인을 Cloudflare 프록시(주황 구름)로 쓰면 `GEO_HEADER=cf-ipcountry`, 구글 외부 부하분산기를 앞에 두면 백엔드 서비스에 사용자 지정 요청 헤더 `X-Client-Geo-Location:{client_region}`을 추가하고 `GEO_HEADER=x-client-geo-location`. 이 헤더는 그 앞단이 직접 덮어쓰므로 믿을 수 있습니다(설정하지 않은 헤더는 방문자가 꾸밀 수 있어 쓰지 않음). 부하분산기를 쓰면 프록시가 한 단계 늘어 `TRUST_PROXY=2`가 필요할 수 있습니다.
  - **배포 후 확인**: `/api/currency` → `{"currency":"NZD"|"USD","source":"header"|"ip"|"none"}`(IP 같은 개인 정보는 돌려주지 않음). 뉴질랜드 인터넷에서 USD로 나오면 `TRUST_PROXY` 값을 확인하세요.
  - 뉴질랜드 IP 목록은 몇 달에 한 번 `python3 scripts/nz-ip.py` 후 다시 배포하면 최신. 뉴질랜드 IP로 등록되지 않은 연결(일부 위성 인터넷·해외 VPN 등)은 USD로 보일 수 있으며, 실제 계약 통화는 견적서에서 사업장 소재 국가로 확정합니다.
  - 첫 화면은 방문자마다 다르므로 `Cache-Control: private` — CDN을 앞에 둘 때 HTML은 캐시하지 않게. 빌드된 페이지 자체는 USD가 기본이라, 서버를 거치지 않은 복사본은 정책의 '판별 실패 = USD'와 같습니다.
  - 운영에서는 `?cur=` 덮어쓰기가 꺼져 있습니다(점검이 필요할 때만 `CURRENCY_OVERRIDE=1`).
