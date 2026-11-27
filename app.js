/* ============================================================
   12/12 가평 멍펜션 여행 · app.js
   - 코스 3안 탭 · 카카오맵 링크 · 체크리스트 · 코스 투표
   - 투표는 Supabase trip_votes 테이블이 있으면 함께 저장,
     없거나 연결이 안 되면 localStorage에 저장(폴백).
   ============================================================ */
(function () {
  'use strict';

  /* ── 1. 설정 ─────────────────────────────────────────── */
  var SUPABASE_URL = 'https://tjnomwjcuxcvgfmfbtom.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_YE4Hx-_azROWrSbxjkt8wg_7to9_bZX';
  var TABLE = 'trip_votes';

  var LS_VOTES = 'gapyeong.votes.v1';       // { 이름: { plan, updated_at } }
  var LS_ME = 'gapyeong.me.v1';             // 마지막에 쓴 이름
  var LS_CHECK = 'gapyeong.checklist.v1';   // { itemId: true }

  var GROUP_SIZE = 8;

  /* ── 2. 데이터 ───────────────────────────────────────── */
  var PLANS = [
    {
      id: 1,
      name: '1안',
      title: '운악산 현등사',
      tag: '최단 동선 · 여유 출발',
      summary: '펜션 반경 15분 안에서 점심·장보기·산책을 모두 해결하는 가장 여유로운 코스.',
      point: '전 코스가 <b>펜션 반경 15분 내</b>라 이동이 가장 적어요. 현등사 주차는 넉넉하고, 식당 앞 주차가 좁으면 맞은편 마트 주차장을 쓰면 됩니다.',
      stops: [
        { time: '10:30', kind: '출발', title: '서울 출발', desc: '8명 함께 차량 이동 · 가장 늦은 출발' },
        { time: '12:00', kind: '점심', title: '청평K 숯불닭갈비막국수', desc: '숯불닭갈비 + 막국수', map: 'http://place.map.kakao.com/1643390968' },
        { time: '13:10', kind: '장보기', title: '가평군농협하나로마트 조종점', desc: '음료·얼음·쌈채소 보충 · 점심집 길 건너 도보 1분', map: 'http://place.map.kakao.com/12620906' },
        { time: '13:50', kind: '관광', title: '운악산 현등사 산책', desc: '입장료 무료', map: 'http://place.map.kakao.com/8160246' },
        { time: '15:00', kind: '체크인', title: '가평 멍펜션', desc: '입실 15:00 · 짐 풀고 바비큐 준비', map: 'http://place.map.kakao.com/1211575770', key: true }
      ]
    },
    {
      id: 2,
      name: '2안',
      title: '아침고요수목원',
      tag: '겨울 감성 · 넓은 주차',
      summary: '오색별빛정원전 시즌 수목원을 낮에 산책하고 점심으로 내려오는 코스.',
      point: '8명 단체 차량 주차가 가장 편해요(<b>주차 1,000대 무료</b>). 점등은 17시라 낮 산책 위주로 보고 내려옵니다.',
      stops: [
        { time: '10:00', kind: '출발', title: '서울 출발', desc: '8명 함께 차량 이동' },
        { time: '11:30', kind: '관광', title: '아침고요수목원 산책', desc: '오색별빛정원전(12/4~3/14) · 토 10:00~23:00, 17:00 점등 · 성인 11,000원 · 주차 1,000대 무료', map: 'http://place.map.kakao.com/25855305' },
        { time: '13:10', kind: '점심', title: '청평K 숯불닭갈비막국수', desc: '차량 약 21분', map: 'http://place.map.kakao.com/1643390968' },
        { time: '14:15', kind: '장보기', title: '가평군농협하나로마트 조종점', desc: '음료·얼음·쌈채소 보충 · 점심집 길 건너 도보 1분', map: 'http://place.map.kakao.com/12620906' },
        { time: '15:00', kind: '체크인', title: '가평 멍펜션', desc: '차량 약 16분 · 입실 15:00', map: 'http://place.map.kakao.com/1211575770', key: true }
      ]
    },
    {
      id: 3,
      name: '3안',
      title: '가평레일파크',
      tag: '단체 액티비티',
      summary: '레일바이크를 먼저 타고 점심·장보기로 이어지는, 몸을 움직이는 코스.',
      point: '<b>4인승 2대</b>로 8명이 딱 나뉘어 타기 좋아요. 주말은 <b>사전 예약 필수</b>, 방한 준비도 챙기세요.',
      stops: [
        { time: '09:30', kind: '출발', title: '서울 출발', desc: '8명 함께 차량 이동 · 가장 이른 출발' },
        { time: '11:00', kind: '액티비티', title: '가평레일바이크 탑승', desc: '약 1시간 · 4인승 2대 · 주말 사전 예약 필수 · 방한 준비', map: 'http://place.map.kakao.com/27092396' },
        { time: '12:40', kind: '점심', title: '청평K 숯불닭갈비막국수', desc: '차량 약 34분', map: 'http://place.map.kakao.com/1643390968' },
        { time: '14:00', kind: '장보기', title: '가평군농협하나로마트 조종점', desc: '음료·얼음·쌈채소 보충 · 점심집 길 건너 도보 1분', map: 'http://place.map.kakao.com/12620906' },
        { time: '15:00', kind: '체크인', title: '가평 멍펜션', desc: '입실 15:00 · 짐 풀고 바비큐 준비', map: 'http://place.map.kakao.com/1211575770', key: true }
      ]
    }
  ];

  var CHECKLISTS = [
    {
      id: 'bbq',
      title: '바비큐 · 장보기',
      icon: 'basket',
      items: [
        { id: 'meat', text: '고기 8인분', note: '출발 전 대형마트에서 1차 구매' },
        { id: 'drinks', text: '술 · 음료', note: '1차 구매, 조종점에서 추가 보충' },
        { id: 'ice', text: '얼음', note: '하나로마트 조종점에서 보충' },
        { id: 'veg', text: '쌈채소 · 쌈장', note: '하나로마트 조종점에서 보충' },
        { id: 'gear', text: '그릴 용품 · 숯 · 호일', note: '펜션 비치 여부는 예약처에 확인' },
        { id: 'dishes', text: '일회용 그릇 · 수저 · 봉투' }
      ]
    },
    {
      id: 'winter',
      title: '방한 · 개인 준비물',
      icon: 'coat',
      items: [
        { id: 'padded', text: '패딩 · 장갑 · 목도리' },
        { id: 'hotpack', text: '핫팩' },
        { id: 'shoes', text: '미끄럽지 않은 신발' },
        { id: 'toilet', text: '세면도구 · 수건' },
        { id: 'clothes', text: '여벌 옷 · 속옷' },
        { id: 'medicine', text: '개인 상비약' },
        { id: 'battery', text: '보조배터리 · 충전기' }
      ]
    },
    {
      id: 'etc',
      title: '예약 · 당일 확인',
      icon: 'check',
      items: [
        { id: 'reserve', text: '레일바이크 사전 예약', note: '3안을 고른 경우 주말 예약 필수' },
        { id: 'checkin', text: '멍펜션 입실 15:00 · 퇴실 11:00' },
        { id: 'driver', text: '운전자 · 차량 배차 정하기' },
        { id: 'vote', text: '코스 투표 마감하기' }
      ]
    }
  ];

  var ICONS = {
    basket: '<svg viewBox="0 0 24 24"><path d="M4 9h16M6 9l1 10h10l1-10M9 9V6h6v3M10 13v3M14 13v3"/></svg>',
    coat: '<svg viewBox="0 0 24 24"><path d="M9 3 5 6v15h14V6l-4-3-3 4-3-4Z"/><path d="M12 10v11"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m4 12.5 5 5L20 6.5"/></svg>'
  };

  var PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>';

  /* ── 3. 작은 도구 ────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function stripTags(s) { return String(s).replace(/<[^>]*>/g, ''); }

  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    }
  };

  /* ── 4. 코스 탭 ──────────────────────────────────────── */
  var tabsBar = $('.tabs');
  var tabButtons = $$('.tab');
  var panels = $('#planPanels');

  function stopHTML(stop) {
    var map = stop.map
      ? '<a class="stop__map" href="' + stop.map + '" target="_blank" rel="noopener">' + PIN + '카카오맵</a>'
      : '';
    return '' +
      '<li class="stop' + (stop.key ? ' stop--key' : '') + '">' +
        '<div class="stop__mark" aria-hidden="true"></div>' +
        '<div class="stop__card">' +
          '<div class="stop__head">' +
            '<span class="stop__time">' + esc(stop.time) + '</span>' +
            '<span class="stop__kind">' + esc(stop.kind) + '</span>' +
          '</div>' +
          '<h3 class="stop__title">' + esc(stop.title) + '</h3>' +
          (stop.desc ? '<p class="stop__desc">' + esc(stop.desc) + '</p>' : '') +
          map +
        '</div>' +
      '</li>';
  }

  function planHTML(plan) {
    return '' +
      '<article class="panel" id="panel-' + plan.id + '" role="tabpanel" aria-labelledby="tab-' + plan.id + '" data-plan="' + plan.id + '">' +
        '<div class="plan-head">' +
          '<div class="plan-head__row">' +
            '<span class="plan-head__name">' + esc(plan.name) + '</span>' +
            '<h3 class="plan-head__title">' + esc(plan.title) + '</h3>' +
          '</div>' +
          '<p class="plan-head__tag">' + esc(plan.tag) + '</p>' +
          '<p class="plan-head__summary">' + esc(plan.summary) + '</p>' +
        '</div>' +
        '<ol class="timeline">' + plan.stops.map(stopHTML).join('') + '</ol>' +
        '<p class="plan-point">' + plan.point + '</p>' +
        '<div class="plan-cta">' +
          '<button type="button" class="btn btn--primary" data-pick="' + plan.id + '">이 코스로 투표하기</button>' +
          '<a class="btn btn--ghost" href="#vote">결과 보기</a>' +
        '</div>' +
      '</article>';
  }

  function renderPlans() {
    panels.innerHTML = PLANS.map(planHTML).join('');
    // 한 번에 하나만 보이도록: CSS 대신 hidden 속성 사용
    $$('.panel', panels).forEach(function (p) {
      p.hidden = p.getAttribute('data-plan') !== '1';
    });
  }

  function activatePlan(id) {
    id = String(id);
    tabsBar.setAttribute('data-active', id);
    tabButtons.forEach(function (btn) {
      var on = btn.getAttribute('data-plan') === id;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
    });
    $$('.panel', panels).forEach(function (p) {
      var on = p.getAttribute('data-plan') === id;
      p.hidden = !on;
      if (on) {
        // 애니메이션 다시 재생
        p.classList.remove('panel');
        void p.offsetWidth;
        p.classList.add('panel');
      }
    });
  }

  function bindTabs() {
    tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { activatePlan(btn.getAttribute('data-plan')); });
      btn.addEventListener('keydown', function (e) {
        var idx = PLANS.findIndex(function (p) { return String(p.id) === btn.getAttribute('data-plan'); });
        var next = null;
        if (e.key === 'ArrowRight') next = (idx + 1) % PLANS.length;
        if (e.key === 'ArrowLeft') next = (idx - 1 + PLANS.length) % PLANS.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = PLANS.length - 1;
        if (next === null) return;
        e.preventDefault();
        activatePlan(PLANS[next].id);
        tabButtons[next].focus();
      });
    });
  }

  /* ── 5. 투표 ─────────────────────────────────────────── */
  var voteModeEl = $('#voteMode');
  var form = $('#voteForm');
  var nickInput = $('#nickname');
  var submitBtn = $('#voteSubmit');
  var msgEl = $('#voteMsg');
  var choicesEl = $('#choices');
  var resultsEl = $('#results');

  var votes = {};            // { 이름: { plan, updated_at } }
  var mode = 'checking';     // 'checking' | 'supa' | 'local'
  var selectedPlan = null;
  var busy = false;
  var pollTimer = null;

  function normName(raw) {
    return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 10);
  }
  function planById(id) {
    for (var i = 0; i < PLANS.length; i++) if (String(PLANS[i].id) === String(id)) return PLANS[i];
    return null;
  }

  function readLocalVotes() {
    var v = store.get(LS_VOTES, {});
    if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
    var out = {};
    Object.keys(v).forEach(function (k) {
      var e = v[k];
      if (e && (e.plan === 1 || e.plan === 2 || e.plan === 3 || String(e.plan).match(/^[123]$/))) {
        out[k] = { plan: Number(e.plan), updated_at: e.updated_at || null };
      }
    });
    return out;
  }
  function saveLocalVotes() { store.set(LS_VOTES, votes); }

  /* Supabase REST 호출 (SDK 없이 fetch만 사용) */
  function sb(method, path, body) {
    var headers = {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY
    };
    if (body) headers['Content-Type'] = 'application/json';
    if (method === 'POST') headers.Prefer = 'resolution=merge-duplicates,return=representation';
    return fetch(SUPABASE_URL + '/rest/v1/' + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    }).then(function (res) {
      if (!res.ok) {
        return res.text().catch(function () { return ''; }).then(function (txt) {
          var msg = '';
          try { var j = JSON.parse(txt); msg = j.message || j.hint || j.code || ''; } catch (e) {}
          var err = new Error(msg || ('HTTP ' + res.status));
          err.status = res.status;
          throw err;
        });
      }
      if (res.status === 204) return null;
      return res.text().then(function (t) { return t ? JSON.parse(t) : null; });
    });
  }

  function setMode(next) {
    mode = next;
    voteModeEl.setAttribute('data-mode', next);
    if (next === 'supa') {
      voteModeEl.textContent = '함께 저장 중';
      voteModeEl.title = 'Supabase trip_votes 테이블에 저장 — 친구들 표가 함께 보여요';
    } else if (next === 'local') {
      voteModeEl.textContent = '이 폰에만 저장';
      voteModeEl.title = '공유 저장소가 아직 연결되지 않아 이 기기의 브라우저에만 저장돼요';
    } else {
      voteModeEl.textContent = '연결 확인 중…';
      voteModeEl.removeAttribute('data-mode');
    }
  }

  function fetchRemoteVotes() {
    return sb('GET', TABLE + '?select=nickname,plan,updated_at&order=updated_at.asc&limit=500')
      .then(function (rows) {
        var out = {};
        (rows || []).forEach(function (r) {
          var name = normName(r && r.nickname);
          var plan = Number(r && r.plan);
          if (!name || !(plan === 1 || plan === 2 || plan === 3)) return;
          out[name] = { plan: plan, updated_at: r.updated_at || null };
        });
        return out;
      });
  }

  function initVotes() {
    votes = readLocalVotes();
    renderResults();
    setMode('checking');

    fetchRemoteVotes().then(function (remote) {
      votes = remote;
      saveLocalVotes();
      setMode('supa');
      renderResults();
      syncMine();
      startPolling();
    }).catch(function (err) {
      // 테이블이 없거나(PGRST205/404) 네트워크가 막힌 경우 → localStorage 폴백
      setMode('local');
      renderResults();
      syncMine();
      if (window.console && console.info) {
        console.info('[가평여행] 공유 저장소를 쓰지 못해 이 기기에만 저장합니다:', err && err.message);
      }
    });
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = window.setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      if (mode !== 'supa' || busy) return;
      fetchRemoteVotes().then(function (remote) {
        votes = remote;
        saveLocalVotes();
        renderResults();
        syncMine();
      }).catch(function () { /* 조용히 넘어감 */ });
    }, 20000);
  }

  function renderChoices() {
    choicesEl.innerHTML = PLANS.map(function (p) {
      return '' +
        '<button type="button" class="choice" role="radio" aria-checked="false" data-plan="' + p.id + '">' +
          '<span class="choice__radio" aria-hidden="true"></span>' +
          '<span class="choice__body">' +
            '<span class="choice__name"><em>' + esc(p.name) + '</em>' + esc(p.title) + '</span>' +
            '<span class="choice__desc">' + esc(p.tag) + '</span>' +
          '</span>' +
        '</button>';
    }).join('');

    $$('.choice', choicesEl).forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectPlan(Number(btn.getAttribute('data-plan')), true);
      });
    });
  }

  function selectPlan(plan, byUser) {
    selectedPlan = plan ? Number(plan) : null;
    $$('.choice', choicesEl).forEach(function (btn) {
      var on = Number(btn.getAttribute('data-plan')) === selectedPlan;
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    if (byUser) {
      var p = planById(selectedPlan);
      var name = normName(nickInput.value);
      var mine = name && votes[name];
      if (mine && Number(mine.plan) === selectedPlan) {
        setMsg(esc(name) + ' 님은 이미 <b>' + esc(p.name) + '</b>에 투표했어요.', '');
      } else if (mine) {
        setMsg('<b>' + esc(p.name) + '</b>으로 바꾸려면 아래 <b>투표 변경하기</b>를 눌러 주세요.', '');
      } else {
        setMsg('');
      }
      updateSubmitLabel();
    }
  }

  function syncMine() {
    var name = normName(nickInput.value);
    var mine = name ? votes[name] : null;
    $$('.choice', choicesEl).forEach(function (btn) {
      btn.classList.toggle('is-mine', !!mine && Number(mine.plan) === Number(btn.getAttribute('data-plan')));
    });
    if (mine && !selectedPlan) selectPlan(Number(mine.plan), false);
    updateSubmitLabel();
  }

  function updateSubmitLabel() {
    var name = normName(nickInput.value);
    var mine = name ? votes[name] : null;
    submitBtn.textContent = mine ? '투표 변경하기' : '투표하기';
  }

  function setMsg(html, tone) {
    msgEl.innerHTML = html;
    if (tone) msgEl.setAttribute('data-tone', tone);
    else msgEl.removeAttribute('data-tone');
  }

  function renderResults() {
    var names = Object.keys(votes);
    var counts = { 1: 0, 2: 0, 3: 0 };
    var byPlan = { 1: [], 2: [], 3: [] };
    names.forEach(function (n) {
      var p = votes[n].plan;
      if (counts[p] === undefined) return;
      counts[p]++;
      byPlan[p].push(n);
    });
    var total = names.length;
    var me = normName(nickInput.value);

    var html = '' +
      '<div class="results__top">' +
        '<span class="results__title">현재 투표</span>' +
        '<span class="results__sub">' + total + '표 · 8명 중</span>' +
      '</div>';

    if (!total) {
      html += '<p class="results__empty">아직 표가 없어요. 첫 번째로 골라 주세요.</p>';
    } else {
      PLANS.forEach(function (p) {
        var n = counts[p.id];
        var pct = total ? Math.round((n / total) * 100) : 0;
        var voters = byPlan[p.id].map(function (name) {
          var isMe = me && name === me;
          return '<span class="voter' + (isMe ? ' voter--me' : '') + '">' + esc(name) + '</span>';
        }).join('');
        html += '' +
          '<div class="result" data-plan="' + p.id + '">' +
            '<div class="result__line">' +
              '<span class="result__label"><b>' + esc(p.name) + '</b>' + esc(p.title) + '</span>' +
              '<span class="result__count">' + n + '표<small>' + pct + '%</small></span>' +
            '</div>' +
            '<div class="bar" role="img" aria-label="' + esc(p.name) + ' ' + n + '표, ' + pct + '%">' +
              '<div class="bar__fill" style="width:' + (n ? Math.max(pct, 3) : 0) + '%"></div>' +
            '</div>' +
            (voters ? '<div class="result__voters">' + voters + '</div>' : '') +
          '</div>';
      });

      if (total < GROUP_SIZE) {
        html += '<p class="results__sub" style="margin-top:10px">' + (GROUP_SIZE - total) + '명 더 기다리는 중이에요.</p>';
      }
    }

    html += '' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">' +
        '<button type="button" class="refresh" id="refreshVotes">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg>새로고침' +
        '</button>' +
        (mode === 'local' ? '<span class="results__sub">관리자 설정 전 · 이 기기에만</span>' : '') +
      '</div>';

    resultsEl.innerHTML = html;

    var refreshBtn = $('#refreshVotes');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        if (busy) return;
        if (mode === 'local') {
          fetchRemoteVotes().then(function (remote) {
            votes = remote;
            saveLocalVotes();
            setMode('supa');
            renderResults();
            syncMine();
            startPolling();
            setMsg('공유 저장소에 연결됐어요. 이제 친구들 표가 함께 보여요.', 'ok');
          }).catch(function () {
            setMsg('아직 공유 저장소에 연결되지 않아 이 폰의 표만 보여요.', 'warn');
          });
          return;
        }
        fetchRemoteVotes().then(function (remote) {
          votes = remote;
          saveLocalVotes();
          renderResults();
          syncMine();
        }).catch(function () {
          setMsg('잠깐 새로고침하지 못했어요. 잠시 뒤 다시 눌러 주세요.', 'warn');
        });
      });
    }
  }

  function submitVote(name, plan) {
    var now = new Date().toISOString();
    if (mode === 'supa') {
      busy = true;
      submitBtn.disabled = true;
      submitBtn.textContent = '저장하는 중…';
      return sb('POST', TABLE + '?on_conflict=nickname', {
        nickname: name, plan: plan, updated_at: now
      }).then(function () {
        votes[name] = { plan: plan, updated_at: now };
        saveLocalVotes();
        busy = false;
        submitBtn.disabled = false;
        return 'supa';
      }).catch(function (err) {
        // 저장 실패 → 이 기기에는 남기고, 공유 저장소 상태를 다시 확인
        votes[name] = { plan: plan, updated_at: now };
        saveLocalVotes();
        busy = false;
        submitBtn.disabled = false;
        return fetchRemoteVotes().then(function (remote) {
          // 다른 사람 표는 서버 것으로 갱신하되 내 표는 방금 고른 값 유지
          var prev = votes[name];
          votes = remote;
          votes[name] = prev;
          saveLocalVotes();
          setMode('supa');
          return 'local-only';
        }).catch(function () {
          setMode('local');
          return 'local-only';
        });
      });
    }
    votes[name] = { plan: plan, updated_at: now };
    saveLocalVotes();
    return Promise.resolve('local');
  }

  function bindVote() {
    renderChoices();

    var lastMe = store.get(LS_ME, '');
    if (typeof lastMe === 'string' && lastMe) nickInput.value = lastMe;

    nickInput.addEventListener('input', function () {
      syncMine();
      if (msgEl.getAttribute('data-tone') === 'warn') setMsg('');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var name = normName(nickInput.value);
      if (!name) {
        setMsg('이름(닉네임)을 먼저 적어 주세요.', 'warn');
        nickInput.focus();
        return;
      }
      if (!selectedPlan) {
        setMsg('코스를 하나 골라 주세요.', 'warn');
        return;
      }
      var before = votes[name] ? Number(votes[name].plan) : null;
      var target = planById(selectedPlan);
      var isChange = before && before !== selectedPlan;

      submitBtn.disabled = true;
      submitVote(name, selectedPlan).then(function (where) {
        store.set(LS_ME, name);
        renderResults();
        syncMine();
        updateSubmitLabel();
        var tail = where === 'supa'
          ? ' 친구들에게도 함께 보여요.'
          : ' 이 기기에만 저장했어요.';
        if (isChange) {
          setMsg('<b>' + esc(name) + '</b> 님의 표를 <b>' + esc(planById(before).name) + '</b>에서 <b>' + esc(target.name) + '</b>으로 바꿨어요.' + tail, 'ok');
        } else {
          setMsg('<b>' + esc(name) + '</b> 님의 표를 <b>' + esc(target.name) + '</b>으로 저장했어요.' + tail, 'ok');
        }
      }).catch(function () {
        setMsg('저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.', 'warn');
      }).then(function () {
        submitBtn.disabled = false;
        updateSubmitLabel();
      });
    });

    // 코스 상세의 "이 코스로 투표하기"
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-pick]') : null;
      if (!btn) return;
      var plan = Number(btn.getAttribute('data-pick'));
      selectPlan(plan, true);
      var target = $('#vote');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(function () {
        if (!normName(nickInput.value)) nickInput.focus({ preventScroll: true });
      }, 420);
    });
  }

  /* ── 6. 체크리스트 ───────────────────────────────────── */
  function renderChecklist() {
    var saved = store.get(LS_CHECK, {});
    if (!saved || typeof saved !== 'object') saved = {};
    var host = $('#checkGroups');

    host.innerHTML = CHECKLISTS.map(function (group) {
      var items = group.items.map(function (item) {
        var on = !!saved[item.id];
        return '' +
          '<li><label class="item">' +
            '<input type="checkbox" data-item="' + esc(item.id) + '"' + (on ? ' checked' : '') + '>' +
            '<span class="item__box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m4 12.5 5 5L20 6.5"/></svg></span>' +
            '<span class="item__text">' + esc(item.text) +
              (item.note ? '<small>' + esc(item.note) + '</small>' : '') +
            '</span>' +
          '</label></li>';
      }).join('');
      return '' +
        '<details class="check" data-group="' + group.id + '">' +
          '<summary>' +
            '<span class="check__icon" aria-hidden="true">' + (ICONS[group.icon] || ICONS.check) + '</span>' +
            '<span class="check__title">' + esc(group.title) + '</span>' +
            '<span class="check__count" data-count="' + group.id + '">0/0</span>' +
            '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
          '</summary>' +
          '<ul class="check__list">' + items + '</ul>' +
        '</details>';
    }).join('');

    host.addEventListener('change', function (e) {
      var input = e.target;
      if (!input || input.type !== 'checkbox' || !input.getAttribute('data-item')) return;
      var state = store.get(LS_CHECK, {});
      if (!state || typeof state !== 'object') state = {};
      if (input.checked) state[input.getAttribute('data-item')] = true;
      else delete state[input.getAttribute('data-item')];
      store.set(LS_CHECK, state);
      updateCounts();
    });

    updateCounts();
  }

  function updateCounts() {
    var state = store.get(LS_CHECK, {}) || {};
    var totalDone = 0, totalAll = 0;
    CHECKLISTS.forEach(function (group) {
      var done = group.items.filter(function (i) { return !!state[i.id]; }).length;
      var el = $('[data-count="' + group.id + '"]');
      if (el) {
        el.textContent = done + '/' + group.items.length;
        el.classList.toggle('is-done', done === group.items.length);
      }
      totalDone += done;
      totalAll += group.items.length;
    });
    var all = $('#checkTotal');
    if (all) {
      all.textContent = totalDone + '/' + totalAll;
      all.style.color = totalDone === totalAll ? 'var(--pine)' : '';
    }
  }

  /* ── 7. 시작 ─────────────────────────────────────────── */
  function init() {
    renderPlans();
    bindTabs();
    activatePlan(1);
    renderChecklist();
    bindVote();
    initVotes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
