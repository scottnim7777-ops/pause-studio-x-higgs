#!/usr/bin/env bash
# 시안 조판용 폰트(모두 SIL OFL 1.1)를 drafts/fonts/ 에 받는다. 용량(약 40MB) 때문에 git에는 넣지 않는다.
set -euo pipefail
cd "$(dirname "$0")/../drafts/fonts"
G=https://raw.githubusercontent.com/google/fonts/main/ofl
get(){ [ -s "$2" ] || curl -fsSL -o "$2" "$1"; }
get "$G/hahmlet/Hahmlet%5Bwght%5D.ttf" Hahmlet-VF.ttf
get "$G/instrumentserif/InstrumentSerif-Regular.ttf" InstrumentSerif-Regular.ttf
get "$G/instrumentserif/InstrumentSerif-Italic.ttf" InstrumentSerif-Italic.ttf
get "$G/archivo/Archivo%5Bwdth,wght%5D.ttf" Archivo-VF.ttf
for w in Regular Medium SemiBold Bold; do get "$G/ibmplexsanskr/IBMPlexSansKR-$w.ttf" "IBMPlexSansKR-$w.ttf"; done
for w in Regular Medium; do get "$G/ibmplexmono/IBMPlexMono-$w.ttf" "IBMPlexMono-$w.ttf"; done
get "$G/gowunbatang/GowunBatang-Regular.ttf" GowunBatang-Regular.ttf
get "$G/gowunbatang/GowunBatang-Bold.ttf" GowunBatang-Bold.ttf
get "$G/fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf" Fraunces-VF.ttf
get "https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.woff2" SUIT-Variable.woff2
[ -s SUIT-Variable.ttf ] || python3 -c "from fontTools.ttLib import TTFont; f=TTFont('SUIT-Variable.woff2'); f.flavor=None; f.save('SUIT-Variable.ttf')"
if [ ! -s PretendardVariable.ttf ]; then T=$(mktemp -d); (cd "$T" && npm pack pretendard@1.3.9 --silent >/dev/null && tar xzf pretendard-1.3.9.tgz); cp "$T/package/dist/public/variable/PretendardVariable.ttf" .; fi
echo "fonts ready: $(ls | wc -l) files"
