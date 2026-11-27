-- ============================================================
--  12/12 가평 멍펜션 여행 · 코스 투표 테이블
--  Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 RUN 하세요.
--  여러 번 실행해도 안전합니다.
-- ============================================================

-- 1) UUID 생성 확장 (이미 있으면 그대로)
create extension if not exists "pgcrypto";

-- 2) 투표 테이블 ----------------------------------------------
--  한 사람(닉네임)당 한 표. 다시 투표하면 행을 고칩니다(update).
create table if not exists public.trip_votes (
  id         uuid primary key default gen_random_uuid(),
  nickname   text     not null,                         -- 친구가 적는 이름 (최대 10자)
  plan       smallint not null check (plan between 1 and 3),  -- 1안 / 2안 / 3안
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_votes_nickname_key unique (nickname)   -- 닉네임 1개 = 1표
);

create index if not exists trip_votes_plan_idx on public.trip_votes (plan);

-- 3) 행 수준 보안(RLS) ---------------------------------------
--  로그인 없는 링크 공유 앱이라 publishable(anon) 키로
--  읽기·추가·수정만 허용합니다. 삭제는 열지 않습니다.
alter table public.trip_votes enable row level security;

drop policy if exists "trip_votes_read"   on public.trip_votes;
drop policy if exists "trip_votes_insert" on public.trip_votes;
drop policy if exists "trip_votes_update" on public.trip_votes;

create policy "trip_votes_read"
  on public.trip_votes for select
  using (true);

create policy "trip_votes_insert"
  on public.trip_votes for insert
  with check (true);

create policy "trip_votes_update"
  on public.trip_votes for update
  using (true)
  with check (true);

-- 4) updated_at 자동 갱신 (선택) ------------------------------
create or replace function public.touch_trip_votes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trip_votes_touch on public.trip_votes;
create trigger trip_votes_touch
  before update on public.trip_votes
  for each row execute function public.touch_trip_votes_updated_at();

-- 5) 실시간 구독 (선택) --------------------------------------
--  publication 에 추가해 두면 나중에 realtime 구독으로 확장하기 쉽습니다.
do $$
begin
  alter publication supabase_realtime add table public.trip_votes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- 6) 확인용 (선택) -------------------------------------------
-- select nickname, plan, updated_at from public.trip_votes order by updated_at;
