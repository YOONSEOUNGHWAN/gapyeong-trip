# 12/12 가평 멍펜션 여행 · 일정 & 코스 투표

12월 12일(토)~13일(일) 8명 친구 여행용 모바일 페이지입니다.
순수 HTML/CSS/JS, 빌드 없음. `index.html`을 열면 바로 동작합니다.

## 파일

| 파일 | 내용 |
| --- | --- |
| `index.html` | 페이지 뼈대 (히어로·숙소·탭·투표·체크리스트) |
| `styles.css` | 모바일 우선 디자인 (390px 기준, 라이트/다크 자동) |
| `app.js` | 코스 3안 데이터, 투표, 체크리스트, Supabase 연동 |
| `supabase-setup.sql` | 투표 테이블 생성 SQL |
| `favicon.svg` | 탭 아이콘 |

## 코스 3안

| | 1안 현등사 | 2안 아침고요수목원 | 3안 가평레일파크 |
| --- | --- | --- | --- |
| 출발 | 10:30 | 10:00 | 09:30 |
| 첫 코스 | 점심 12:00 | 수목원 11:30 | 레일바이크 11:00 |
| 체크인 | 15:00 | 15:00 | 15:00 |
| 특징 | 이동 최소 | 주차 편함 | 단체 액티비티 |

## 투표 저장 방식

1. **공유 저장 (Supabase)** — `trip_votes` 테이블이 있으면 친구들이 각자 폰에서 투표해도 한 화면에 모입니다.
   - Supabase 대시보드 → SQL Editor → `supabase-setup.sql` 전체 붙여넣고 RUN.
   - 테이블이 생기면 페이지를 새로고침만 하면 자동으로 공유 모드로 바뀝니다(상단 배지가 "함께 저장 중").
2. **폴백 (localStorage)** — 테이블이 없거나 네트워크가 막히면 자동으로 이 기기에만 저장합니다.
   - 배지가 "이 폰에만 저장"으로 표시됩니다. 이 상태에서는 친구별 표가 합쳐지지 않습니다.

한 사람(닉네임)당 한 표이고, 같은 이름으로 다시 투표하면 표가 바뀝니다.

## 배포 (GitHub Pages)

```bash
git init
git add .
git commit -m "feat: 12/12 가평 여행 일정·코스 투표 페이지"
gh repo create YOONSEOUNGHWAN/gapyeong-trip --public --source=. --push
gh api -X POST repos/YOONSEOUNGHWAN/gapyeong-trip/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

배포 주소: <https://YOONSEOUNGHWAN.github.io/gapyeong-trip/>
(첫 배포는 1~2분 걸립니다.) 링크를 아는 사람은 누구나 페이지를 보고 투표할 수 있으니 단체 채팅방에만 공유하세요.
