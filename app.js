// 單字卡：英文單字卡（間隔重複）、聽音拼字、例句填空、常用片語、單字本、設定與備份
const APP_VERSION = '1.0.0';
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 86400e3, MIN = 60e3;
const today = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const endOfToday = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let toastTimer;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200); }

// ---------- 設定 ----------
const S = {};
function loadSettings() {
  Object.assign(S, {
    theme: DB.setting('theme', 'normal'), newPerDay: DB.setting('newPerDay', 10), dir: DB.setting('dir', 'en'),
    autoSpeak: DB.setting('autoSpeak', true), rate: DB.setting('rate', 0.85), voice: DB.setting('voice', ''),
    accent: DB.setting('accent', 'en-US'),
    cats: DB.setting('cats', null),            // null 代表全部主題
  });
}
function setS(key, value) { S[key] = value; DB.setSetting(key, value); }

// ---------- 外觀：一般／低調 ----------
function applyTheme() {
  const stealth = S.theme === 'stealth';
  document.body.classList.toggle('stealth', stealth);
  document.querySelectorAll('[data-alt]').forEach(el => {
    if (!el.dataset.orig) el.dataset.orig = el.textContent;
    el.textContent = stealth ? el.dataset.alt : el.dataset.orig;
  });
  document.title = stealth ? '筆記' : '單字卡';
  document.querySelectorAll('#sTheme button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.theme)));
}

// ---------- 發音（手機內建的英文語音） ----------
let voices = [];
const langOf = v => v.lang.replace('_', '-');
function loadVoices() {
  voices = (speechSynthesis.getVoices() || []).filter(v => /^en/i.test(v.lang));
  const sel = $('sVoice');
  const list = [...voices].sort((a, b) => (langOf(b) === S.accent) - (langOf(a) === S.accent) || a.name.localeCompare(b.name));
  sel.innerHTML = '<option value="">自動選擇</option>' + list.map(v => `<option value="${esc(v.voiceURI)}">${esc(v.name)}（${esc(langOf(v))}）</option>`).join('');
  sel.value = S.voice || '';
}
function pickVoice() {
  const chosen = voices.find(x => x.voiceURI === S.voice);
  if (chosen) return chosen;
  const same = voices.filter(v => langOf(v) === S.accent);
  const pref = S.accent === 'en-GB' ? /Daniel|Kate|Serena|Arthur|Martha|Google UK/i : /Samantha|Ava|Allison|Susan|Nicky|Google US/i;
  return same.find(v => pref.test(v.name)) || same[0] || voices[0];
}
function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = S.accent || 'en-US';
  u.rate = Number(S.rate) || 0.85;
  const v = pickVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
if ('speechSynthesis' in window) { speechSynthesis.onvoiceschanged = loadVoices; }
const sayBtn = (text, label = '🔊 聽發音') => `<button class="say" data-say="${esc(text)}">${label}</button>`;
const sayInline = text => `<button class="say inline" data-say="${esc(text)}">🔊</button>`;

// ---------- 分頁 ----------
let view = 'home';
function go(v) {
  if (view === 'review' && v !== 'review') endReview(false);
  view = v;
  document.querySelectorAll('.view').forEach(s => { s.hidden = s.id !== `v-${v}`; });
  document.querySelectorAll('.tabbar button').forEach(b => b.toggleAttribute('aria-current', b.dataset.tab === v));
  if (v === 'review') startReview();
  if (v === 'home') renderHome();
  if (v === 'practice' && !pq) renderPracticeSetup();
  if (v === 'words') renderWords();
  if (v === 'settings') renderSettings();
  window.scrollTo(0, 0);
}
document.querySelectorAll('.tabbar button').forEach(b => b.addEventListener('click', () => go(b.dataset.tab)));
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));

// ---------- 間隔重複排程 ----------
// 新卡：1 分鐘 → 10 分鐘 → 畢業（1 天）；按「簡單」直接 4 天。
// 複習卡：記得 = 間隔 × 難易度；困難 = × 1.2；簡單 = × 難易度 × 1.3；忘了 → 10 分鐘後重學，間隔減半。
const STEPS = [1, 10], RELEARN = [10];
function schedule(c, r, now = Date.now()) {
  const n = c ? { ...c } : { state: 'learning', step: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0, added: today(now) };
  if (n.state === 'learning' || n.state === 'relearn') {
    const steps = n.state === 'learning' ? STEPS : RELEARN;
    if (r === 1) { n.step = 0; n.due = now + steps[0] * MIN; }
    else if (r === 2) { n.due = now + Math.max(1, steps[n.step] * 1.5) * MIN; }
    else if (r === 3 && n.step + 1 < steps.length) { n.step++; n.due = now + steps[n.step] * MIN; }
    else {
      n.interval = n.state === 'relearn' ? Math.max(1, n.interval) : (r === 4 ? 4 : 1);
      if (r === 4 && n.state === 'learning') n.ease += 0.15;
      n.state = 'review'; n.step = 0; n.due = now + n.interval * DAY;
    }
  } else {
    if (r === 1) {
      n.lapses++; n.ease = Math.max(1.3, n.ease - 0.2); n.interval = Math.max(1, n.interval * 0.5);
      n.state = 'relearn'; n.step = 0; n.due = now + RELEARN[0] * MIN;
    } else {
      if (r === 2) { n.interval = Math.max(n.interval + 1, n.interval * 1.2); n.ease = Math.max(1.3, n.ease - 0.15); }
      if (r === 3) n.interval = Math.max(n.interval + 1, n.interval * n.ease);
      if (r === 4) { n.interval = Math.max(n.interval + 1, n.interval * n.ease * 1.3); n.ease += 0.15; }
      if (n.interval > 3) n.interval *= 0.95 + Math.random() * 0.1;    // 稍微錯開，避免同一天堆太多
      n.due = now + n.interval * DAY;
    }
  }
  n.reps++; n.last_review = now;
  return n;
}
function fmtGap(ms) {
  const m = ms / MIN;
  if (m < 60) return `${Math.max(1, Math.round(m))} 分`;
  if (m < 60 * 24) return `${Math.round(m / 60)} 小時`;
  const d = ms / DAY;
  if (d < 30) return `${Math.round(d)} 天`;
  if (d < 365) return `${Math.round(d / 30)} 個月`;
  return `${(d / 365).toFixed(1)} 年`;
}

// ---------- 今日的卡片 ----------
const catFilter = () => S.cats && S.cats.length ? `AND (w.custom = 1 OR w.category IN (${S.cats.map(() => '?').join(',')}))` : '';
const catArgs = () => S.cats && S.cats.length ? S.cats : [];
function newToday() { return DB.get('SELECT COUNT(*) AS n FROM cards WHERE added = ?', [today()]).n; }
function counts() {
  const now = Date.now();
  const learnDue = DB.get("SELECT COUNT(*) AS n FROM cards WHERE state IN ('learning','relearn') AND due <= ?", [now]).n;
  const reviewDue = DB.get("SELECT COUNT(*) AS n FROM cards WHERE state = 'review' AND due <= ?", [endOfToday()]).n;
  const unseen = DB.get(`SELECT COUNT(*) AS n FROM words w LEFT JOIN cards c ON c.word_id = w.id WHERE c.word_id IS NULL ${catFilter()}`, catArgs()).n;
  const newLeft = Math.max(0, Math.min(S.newPerDay - newToday(), unseen));
  return { due: learnDue + reviewDue, newLeft, unseen };
}
const wordById = id => DB.get('SELECT * FROM words WHERE id = ?', [id]);
function nextCard() {
  const now = Date.now();
  const learn = DB.get("SELECT * FROM cards WHERE state IN ('learning','relearn') AND due <= ? ORDER BY due LIMIT 1", [now]);
  if (learn) return { card: learn, word: wordById(learn.word_id) };
  const rev = DB.get("SELECT * FROM cards WHERE state = 'review' AND due <= ? ORDER BY due LIMIT 1", [endOfToday()]);
  if (rev) return { card: rev, word: wordById(rev.word_id) };
  if (S.newPerDay - newToday() > 0) {
    const w = DB.get(`SELECT w.* FROM words w LEFT JOIN cards c ON c.word_id = w.id WHERE c.word_id IS NULL ${catFilter()} ORDER BY w.custom DESC, w.id LIMIT 1`, catArgs());
    if (w) return { card: null, word: w };
  }
  // 學習中的卡片 30 分鐘內就到期：提前拿出來，不用乾等
  const soon = DB.get("SELECT * FROM cards WHERE state IN ('learning','relearn') AND due <= ? ORDER BY due LIMIT 1", [now + 30 * MIN]);
  if (soon) return { card: soon, word: wordById(soon.word_id) };
  return null;
}

// ---------- 複習畫面 ----------
let cur = null, shownAt = 0, sessionDone = 0;
function startReview() { sessionDone = 0; $('rvDone').hidden = true; showNext(); }
function endReview(toHome = true) { cur = null; speechSynthesis?.cancel(); if (toHome) go('home'); }
const posTag = w => w.pos ? `<span class="pos">${esc(w.pos)}</span>` : '';
const exampleHtml = w => w.ex_en ? `<div class="ex"><span class="exen">${esc(w.ex_en)}</span>${sayInline(w.ex_en)}<br><span class="muted">${esc(w.ex_zh || '')}</span></div>` : '';
function showNext() {
  cur = nextCard();
  const c = counts();
  $('rvProg').textContent = `本次已完成 ${sessionDone}・剩餘約 ${c.due + c.newLeft}`;
  const flash = $('flash');
  if (!cur) {
    flash.hidden = true; $('rvShow').hidden = true; $('rvRates').hidden = true;
    $('rvDone').hidden = false;
    $('rvDone').innerHTML = `<div class="big-en">Well done!</div><div>今天的卡片都完成了${sessionDone ? `（這次複習了 ${sessionDone} 張）` : ''}。</div>
      <div class="muted small">想多學一點，可以到「設定」調高每日新單字數，或去做練習。</div><button class="primary" onclick="go('home')">回首頁</button>`;
    return;
  }
  flash.hidden = false; $('rvDone').hidden = true;
  const w = cur.word;
  cur.dir = S.dir === 'mix' ? (Math.random() < 0.5 ? 'en' : 'zh') : S.dir;
  const tag = cur.card ? (cur.card.state === 'review' ? '複習' : '學習中') : '新單字';
  $('rvFront').innerHTML = cur.dir === 'en'
    ? `<span class="tag">${tag}・${esc(w.category)}</span><div class="word">${esc(w.word)}</div>${posTag(w)}${sayBtn(w.word)}`
    : `<span class="tag">${tag}・${esc(w.category)}・想想英文怎麼說</span><div class="meaning">${esc(w.meaning)}</div>${posTag(w)}`;
  $('rvBack').hidden = true; $('rvShow').hidden = false; $('rvRates').hidden = true;
  shownAt = Date.now();
  if (cur.dir === 'en' && S.autoSpeak) speak(w.word);
}
function showAnswer() {
  if (!cur) return;
  const w = cur.word;
  $('rvBack').innerHTML = cur.dir === 'en'
    ? `<div class="meaning">${esc(w.meaning)}</div>${exampleHtml(w)}`
    : `<div class="word">${esc(w.word)}</div>${sayBtn(w.word)}${exampleHtml(w)}`;
  $('rvBack').hidden = false; $('rvShow').hidden = true; $('rvRates').hidden = false;
  const now = Date.now();
  [1, 2, 3, 4].forEach(r => { $(`rt${r}`).textContent = fmtGap(schedule(cur.card, r, now).due - now); });
  if (cur.dir === 'zh' && S.autoSpeak) speak(w.word);
}
function rate(r) {
  if (!cur) return;
  const now = Date.now(), n = schedule(cur.card, r, now);
  DB.run(`INSERT INTO cards (word_id, state, due, interval, ease, step, reps, lapses, last_review, added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(word_id) DO UPDATE SET state = excluded.state, due = excluded.due, interval = excluded.interval, ease = excluded.ease,
      step = excluded.step, reps = excluded.reps, lapses = excluded.lapses, last_review = excluded.last_review`,
    [cur.word.id, n.state, n.due, n.interval, n.ease, n.step, n.reps, n.lapses, n.last_review, n.added]);
  DB.run('INSERT INTO review_log (ts, day, kind, item, rating, ms) VALUES (?, ?, ?, ?, ?, ?)', [now, today(now), 'word', String(cur.word.id), r, now - shownAt]);
  sessionDone++;
  showNext();
}
$('rvShow').addEventListener('click', showAnswer);
$('flash').addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) { e.stopPropagation(); speak(b.dataset.say); } else if (!$('rvShow').hidden) showAnswer(); });
$('rvRates').addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) rate(Number(b.dataset.r)); });
$('rvExit').addEventListener('click', () => endReview(true));
$('hStart').addEventListener('click', () => go('review'));

// ---------- 首頁 ----------
function streak() {
  const days = new Set(DB.all('SELECT DISTINCT day FROM review_log WHERE ts > ?', [Date.now() - 400 * DAY]).map(r => r.day));
  let n = 0, t = Date.now();
  if (!days.has(today(t))) t -= DAY;           // 今天還沒練習，從昨天開始算
  while (days.has(today(t))) { n++; t -= DAY; }
  return n;
}
function renderHome() {
  const c = counts();
  const done = DB.get("SELECT COUNT(*) AS n FROM review_log WHERE day = ? AND kind = 'word'", [today()]).n;
  $('hDue').textContent = c.due; $('hNew').textContent = c.newLeft; $('hDone').textContent = done; $('hStreak').textContent = `${streak()} 天`;
  const total = done + c.due + c.newLeft;
  $('hGoalBar').style.width = `${total ? done / total * 100 : 100}%`;
  $('hGoalTxt').textContent = total ? `今日進度 ${done} / ${total}` : '今天還沒有卡片，先開始學新單字吧';
  $('hStart').textContent = c.due + c.newLeft ? `開始複習（${c.due + c.newLeft} 張）` : '今天的卡片都完成了';
  // 近 14 天
  const rows = DB.all('SELECT day, COUNT(*) AS n FROM review_log WHERE ts > ? GROUP BY day', [Date.now() - 15 * DAY]);
  const map = Object.fromEntries(rows.map(r => [r.day, r.n]));
  const days = Array.from({ length: 14 }, (_, i) => today(Date.now() - (13 - i) * DAY));
  const max = Math.max(1, ...days.map(d => map[d] || 0));
  $('hChart').innerHTML = days.map(d => `<span title="${d}：${map[d] || 0}">${map[d] || ''}<b style="height:${(map[d] || 0) / max * 80}%"></b></span>`).join('');
  const w7 = DB.get("SELECT COUNT(*) AS n, SUM(rating >= 3) AS ok FROM review_log WHERE kind = 'word' AND ts > ?", [Date.now() - 7 * DAY]);
  const p7 = DB.get("SELECT COUNT(*) AS n, SUM(rating) AS ok FROM review_log WHERE kind != 'word' AND ts > ?", [Date.now() - 7 * DAY]);
  $('hAcc').textContent = [w7.n ? `單字記得率 ${Math.round(w7.ok / w7.n * 100)}%` : '', p7.n ? `練習答對率 ${Math.round(p7.ok / p7.n * 100)}%` : ''].filter(Boolean).join('・') || '近 7 天還沒有紀錄';
  const st = DB.get(`SELECT COUNT(*) AS seen, SUM(state = 'review' AND interval >= 21) AS mature, SUM(state != 'review') AS learning FROM cards`);
  const totalW = DB.get('SELECT COUNT(*) AS n FROM words').n;
  const spellOk = DB.get("SELECT COUNT(*) AS n FROM practice_stats WHERE mode = 'spell' AND streak >= 2").n;
  $('hCounts').innerHTML = `<span>已學過的單字</span><b>${st.seen || 0} / ${totalW}</b>
    <span>已熟悉（間隔 3 週以上）</span><b>${st.mature || 0}</b>
    <span>學習中</span><b>${st.learning || 0}</b>
    <span>會拼的單字（連續拼對 2 次）</span><b>${spellOk}</b>`;
  $('topinfo').textContent = c.due + c.newLeft ? `今日 ${c.due + c.newLeft} 張` : '';
}

// ---------- 練習：找出例句裡的單字（含常見變化，例如 booked、ran out of） ----------
const IRREGULAR = {
  go: ['went', 'gone', 'goes'], come: ['came'], get: ['got', 'gotten'], take: ['took', 'taken'], make: ['made'], have: ['had', 'has'],
  know: ['knew', 'known'], think: ['thought'], see: ['saw', 'seen'], hear: ['heard'], speak: ['spoke', 'spoken'], say: ['said'],
  tell: ['told'], eat: ['ate', 'eaten'], drink: ['drank'], pay: ['paid'], find: ['found'], give: ['gave', 'given'], bring: ['brought'],
  leave: ['left'], send: ['sent'], forget: ['forgot', 'forgotten'], buy: ['bought'], sell: ['sold'], sleep: ['slept'], feel: ['felt'],
  meet: ['met'], sit: ['sat'], run: ['ran'], catch: ['caught'], drive: ['drove', 'driven'], put: ['put'], lose: ['lost'], wake: ['woke'],
  child: ['children'], foot: ['feet'], man: ['men'], woman: ['women'], wife: ['wives'], people: ['person'],
};
function forms(w) {
  const x = w.toLowerCase(), base = x.replace(/e$/, ''), last = x.slice(-1);
  const out = [x, `${x}s`, `${x}es`, `${x}ed`, `${x}d`, `${x}ing`, `${base}ing`, `${x}${last}ed`, `${x}${last}ing`, `${x}'s`, ...(IRREGULAR[x] || [])];
  if (/[^aeiou]y$/.test(x)) out.push(`${x.slice(0, -1)}ies`, `${x.slice(0, -1)}ied`);
  return [...new Set(out)].sort((a, b) => b.length - a.length);
}
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function findInSentence(word, sentence) {
  if (!word || !sentence) return null;
  const s = sentence.replace(/’/g, "'");
  const parts = word.replace(/’/g, "'").trim().split(/\s+/);
  const first = forms(parts[0]).map(reEsc).join('|');
  const rest = parts.slice(1).map(p => `\\s+${reEsc(p)}`).join('');
  const m = new RegExp(`(^|[^A-Za-z'])((?:${first})${rest})(?![A-Za-z])`, 'i').exec(s);
  if (!m) return null;
  const start = m.index + m[1].length;
  return { before: s.slice(0, start), hit: m[2], after: s.slice(start + m[2].length) };
}

// ---------- 練習 ----------
const MODES = {
  spell: { name: '聽音拼字', pool: w => !/\s/.test(w.word) && w.pos !== 'phr.' && w.word.length >= 2 },
  cloze: { name: '例句填空', pool: w => !!findInSentence(w.word, w.ex_en) },
  phrase: { name: '常用片語', pool: w => w.pos === 'phr.' },
};
let pMode = 'spell', pq = null;
function practiceStat(id, mode) { return DB.get('SELECT * FROM practice_stats WHERE word_id = ? AND mode = ?', [id, mode]); }
function renderPracticeSetup() {
  $('pSetup').hidden = false; $('pQuiz').hidden = true;
  document.querySelectorAll('#pModes button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === pMode)));
  const r = DB.get('SELECT COUNT(*) AS n, SUM(rating) AS ok FROM review_log WHERE kind = ? AND ts > ?', [pMode, Date.now() - 30 * DAY]);
  const weak = DB.get('SELECT COUNT(*) AS n FROM practice_stats WHERE mode = ? AND wrong > 0 AND streak < 2', [pMode]).n;
  $('pStats').textContent = r.n ? `近 30 天「${MODES[pMode].name}」答了 ${r.n} 題，答對 ${Math.round(r.ok / r.n * 100)}%；還有 ${weak} 個常錯的字。` : `還沒有練習過「${MODES[pMode].name}」。`;
}
$('pModes').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) { pMode = b.dataset.m; renderPracticeSetup(); } });

// 越常答錯的字越常出現；連續答對的少出現
function pWeight(w, mode, weakFirst) {
  const s = practiceStat(w.id, mode);
  if (!s) return weakFirst ? 0.6 : 1.5;
  const base = Math.max(0.3, 1 + s.wrong * 2 - Math.min(s.streak, 3) * 0.3);
  return weakFirst && s.wrong > 0 && s.streak < 2 ? base * 4 : base;
}
function buildPool(mode, scope) {
  const all = DB.all('SELECT w.*, c.word_id AS seen FROM words w LEFT JOIN cards c ON c.word_id = w.id').filter(MODES[mode].pool);
  if (scope !== 'learned') return all;
  const seen = all.filter(w => w.seen);
  if (seen.length >= 8) return seen;
  return [...seen, ...shuffle(all.filter(w => !w.seen)).slice(0, 30 - seen.length)];   // 學過的不夠：補一些還沒學的
}
function pickFrom(pool, used) {
  let cand = pool.filter(w => !used.has(w.id));
  if (!cand.length) { used.clear(); cand = pool; }
  const ws = cand.map(w => pWeight(w, pq.mode, pq.scope === 'weak')), sum = ws.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < cand.length; i++) { r -= ws[i]; if (r <= 0) return cand[i]; }
  return cand[cand.length - 1];
}
function startPractice() {
  const scope = $('pScope').value;
  const pool = buildPool(pMode, scope);
  if (pool.length < 4) return toast('可以練習的字太少，先去複習一些單字吧');
  const all = DB.all('SELECT * FROM words').filter(MODES[pMode].pool);     // 選項用
  pq = { mode: pMode, scope, pool, all, total: Number($('pCount').value), n: 0, right: 0, used: new Set(), wrongs: [] };
  $('pSetup').hidden = true; $('pQuiz').hidden = false; $('pqDone').hidden = true;
  nextPQ();
}
function nextPQ() {
  if (pq.n >= pq.total) return endPractice();
  const w = pickFrom(pq.pool, pq.used);
  pq.used.add(w.id);
  Object.assign(pq, { w, t0: Date.now(), locked: false, hints: 0 });
  $('pqProg').textContent = `${MODES[pq.mode].name}・第 ${pq.n + 1} / ${pq.total} 題・答對 ${pq.right}`;
  $('pqCard').hidden = false; $('pqFeedback').hidden = true; $('pqNext').hidden = true;
  $('pqSpell').hidden = pq.mode !== 'spell'; $('pqChoices').hidden = pq.mode === 'spell';
  if (pq.mode === 'spell') {
    $('pqSpell').querySelector('.btnrow').hidden = false;
    $('pqInput').value = ''; $('pqInput').disabled = false; $('pqOk').disabled = false; $('pqHint').disabled = false; $('pqSkip').disabled = false;
    renderSpellQ();
    speak(w.word);
    $('pqInput').focus();
  }
  if (pq.mode === 'cloze') {
    const f = findInSentence(w.word, w.ex_en);
    pq.hit = f.hit;
    $('pqQ').innerHTML = `<div class="cloze">${esc(f.before)}<span class="blank">${'_'.repeat(Math.max(4, Math.min(10, f.hit.length)))}</span>${esc(f.after)}</div>
      <div class="muted">${esc(w.ex_zh || '')}</div>`;
    renderChoices(w, o => o.word, o => (w.pos === 'phr.') === (o.pos === 'phr.') && (!w.pos || o.pos === w.pos || w.pos === 'phr.'));
  }
  if (pq.mode === 'phrase') {
    $('pqQ').innerHTML = `<div class="word">${esc(w.word)}</div>${sayBtn(w.word, '🔊 再聽一次')}`;
    renderChoices(w, o => o.meaning, () => true);
    speak(w.word);
  }
}
function renderSpellQ() {
  const w = pq.w;
  const mask = [...w.word].map((ch, i) => i < pq.hints ? ch : /[A-Za-z]/.test(ch) ? '_' : ch).join(' ');
  $('pqQ').innerHTML = `${sayBtn(w.word, '🔊 再聽一次')}<div class="meaning">${esc(w.meaning)}</div>${posTag(w)}
    <div class="mask">${esc(mask)}</div><div class="muted small">${w.word.length} 個字母</div>`;
}
// 四選一：正確答案＋三個同類型的其他選項（文字不重複）
function renderChoices(w, label, sameKind) {
  const seen = new Set([label(w).toLowerCase()]);
  const opts = [w];
  for (const o of shuffle(pq.all.filter(o => o.id !== w.id && sameKind(o))).concat(shuffle(pq.all.filter(o => o.id !== w.id)))) {
    if (opts.length >= 4) break;
    const k = label(o).toLowerCase();
    if (!seen.has(k)) { seen.add(k); opts.push(o); }
  }
  $('pqChoices').className = `choices ${pq.mode === 'phrase' ? 'zh' : 'en'}`;
  $('pqChoices').innerHTML = shuffle(opts).map(o => `<button data-ans="${o.id}">${esc(label(o))}</button>`).join('');
}
const normSpell = s => s.toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ').trim();
function recordPQ(ok) {
  const now = Date.now(), w = pq.w;
  pq.locked = true; pq.n++;
  if (ok) pq.right++; else pq.wrongs.push(w);
  DB.run(`INSERT INTO practice_stats (word_id, mode, correct, wrong, streak, last_ts) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(word_id, mode) DO UPDATE SET correct = correct + excluded.correct, wrong = wrong + excluded.wrong,
      streak = CASE WHEN excluded.correct = 1 THEN streak + 1 ELSE 0 END, last_ts = excluded.last_ts`, [w.id, pq.mode, ok ? 1 : 0, ok ? 0 : 1, ok ? 1 : 0, now]);
  DB.run('INSERT INTO review_log (ts, day, kind, item, rating, ms) VALUES (?, ?, ?, ?, ?, ?)', [now, today(now), pq.mode, String(w.id), ok ? 1 : 0, now - pq.t0]);
  $('pqProg').textContent = `${MODES[pq.mode].name}・第 ${pq.n} / ${pq.total} 題・答對 ${pq.right}`;
}
function showFeedback(ok, extra = '') {
  const w = pq.w;
  $('pqFeedback').className = `feedback ${ok ? 'ok' : 'ng'}`;
  $('pqFeedback').innerHTML = `<div class="fb-head">${ok ? '✓ 答對了' : '✗ 再記一下'}</div>
    <div><span class="fb-word">${esc(w.word)}</span> ${posTag(w)} ${sayInline(w.word)}　${esc(w.meaning)}</div>${extra}${exampleHtml(w)}`;
  $('pqFeedback').hidden = false;
  $('pqNext').hidden = false;
  $('pqNext').textContent = pq.n >= pq.total ? '看結果' : '下一題';
}
function checkSpell(skip = false) {
  if (!pq || pq.locked) return;
  const typed = $('pqInput').value;
  if (!skip && !typed.trim()) return toast('請先輸入拼字');
  const ok = !skip && normSpell(typed) === normSpell(pq.w.word);
  recordPQ(ok);
  $('pqInput').disabled = true; $('pqOk').disabled = true; $('pqHint').disabled = true; $('pqSkip').disabled = true;
  $('pqInput').blur(); $('pqSpell').querySelector('.btnrow').hidden = true;
  pq.hints = pq.w.word.length; renderSpellQ();
  showFeedback(ok, !ok && typed.trim() ? `<div class="muted small">你拼的是：<s>${esc(typed.trim())}</s></div>` : '');
  speak(pq.w.word);
}
$('pqSpell').addEventListener('submit', e => { e.preventDefault(); checkSpell(false); });
$('pqSkip').addEventListener('click', () => checkSpell(true));
$('pqHint').addEventListener('click', () => {
  if (!pq || pq.locked) return;
  if (pq.hints < pq.w.word.length - 1) pq.hints++;
  renderSpellQ(); $('pqInput').focus();
});
$('pqChoices').addEventListener('click', e => {
  const b = e.target.closest('[data-ans]');
  if (!b || !pq || pq.locked) return;
  const ok = Number(b.dataset.ans) === pq.w.id;
  b.classList.add(ok ? 'right' : 'wrong');
  if (!ok) [...$('pqChoices').children].find(x => Number(x.dataset.ans) === pq.w.id)?.classList.add('right');
  recordPQ(ok);
  if (pq.mode === 'cloze') { speak(pq.w.ex_en); $('pqQ').querySelector('.blank').textContent = pq.hit; $('pqQ').querySelector('.blank').classList.add('filled'); }
  else speak(pq.w.word);
  showFeedback(ok);
});
$('pqNext').addEventListener('click', () => { window.scrollTo(0, 0); nextPQ(); });
$('pqQ').addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) { speak(b.dataset.say); if (pq?.mode === 'spell' && !pq.locked) $('pqInput').focus(); } });
$('pqFeedback').addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) speak(b.dataset.say); });
function endPractice() {
  $('pqCard').hidden = true; $('pqSpell').hidden = true; $('pqChoices').hidden = true; $('pqFeedback').hidden = true; $('pqNext').hidden = true;
  const uniq = [...new Map(pq.wrongs.map(w => [w.id, w])).values()];
  $('pqDone').hidden = false;
  $('pqDone').innerHTML = `<div class="big-en">${pq.right} / ${pq.total}</div>
    <div>${pq.right === pq.total ? '全對，太厲害了！' : pq.right >= pq.total * 0.8 ? '很不錯！' : '多練習幾次就會記住。'}</div>
    ${uniq.length ? `<div class="wrongs">${uniq.map(w => `<button class="say" data-say="${esc(w.word)}">${esc(w.word)}・${esc(w.meaning)}</button>`).join('')}</div>` : ''}
    <div class="btnrow"><button class="primary" id="pqAgain">再練一次</button><button class="ghost" id="pqBack">換題型</button></div>`;
  $('pqAgain').onclick = startPractice;
  $('pqBack').onclick = () => { pq = null; renderPracticeSetup(); window.scrollTo(0, 0); };
}
$('pqDone').addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) speak(b.dataset.say); });
$('pStart').addEventListener('click', startPractice);
$('pqExit').addEventListener('click', () => { pq = null; speechSynthesis?.cancel(); renderPracticeSetup(); window.scrollTo(0, 0); });

// ---------- 單字本 ----------
let wCat = '全部';
function renderWords() {
  const cats = ['全部', ...WORD_CATEGORIES, ...(DB.get('SELECT 1 FROM words WHERE custom = 1') ? ['自訂'] : [])];
  $('wCats').innerHTML = cats.map(c => `<button data-cat="${esc(c)}" aria-pressed="${c === wCat}">${esc(c)}</button>`).join('');
  const q = $('wQ').value.trim();
  const where = [], args = [];
  if (wCat === '自訂') where.push('w.custom = 1');
  else if (wCat !== '全部') { where.push('w.category = ?'); args.push(wCat); }
  if (q) { where.push('(w.word LIKE ? OR w.meaning LIKE ?)'); args.push(`%${q}%`, `%${q}%`); }
  const rows = DB.all(`SELECT w.*, c.state, c.interval, c.due FROM words w LEFT JOIN cards c ON c.word_id = w.id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY w.custom DESC, w.id LIMIT 2000`, args);
  const learned = rows.filter(r => r.state).length;
  $('wMeta').textContent = `${rows.length} 個單字・已學 ${learned} 個`;
  const stTxt = r => !r.state ? '未學' : r.state === 'review' ? (r.interval >= 21 ? '熟悉' : '複習中') : '學習中';
  $('wList').innerHTML = rows.map(r => `<details class="witem">
    <summary><span><span class="w">${esc(r.word)}</span>${r.pos ? `<span class="rd">${esc(r.pos)}</span>` : ''}</span>
      <span class="m">${esc(r.meaning)}</span><span class="st ${r.state === 'review' ? 'review' : r.state ? 'learning' : ''}">${stTxt(r)}</span></summary>
    <div class="wb">
      <div>${sayBtn(r.word, `🔊 ${esc(r.word)}`)}</div>
      ${r.ex_en ? `<div><span class="exen">${esc(r.ex_en)}</span>${sayInline(r.ex_en)}<br><span class="muted">${esc(r.ex_zh || '')}</span></div>` : ''}
      <div class="muted small">${esc(r.category)}${r.state ? `・下次複習 ${new Date(r.due).toLocaleDateString('zh-TW')}` : ''}${r.custom ? `・<button class="ghost" data-delw="${r.id}">刪除這個單字</button>` : ''}</div>
    </div></details>`).join('') || '<p class="muted">找不到符合的單字。</p>';
}
$('wCats').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) { wCat = b.dataset.cat; renderWords(); } });
$('wQ').addEventListener('input', () => renderWords());
$('wList').addEventListener('click', e => {
  const s = e.target.closest('[data-say]'); if (s) { e.preventDefault(); speak(s.dataset.say); return; }
  const d = e.target.closest('[data-delw]');
  if (d) {
    if (d.dataset.armed !== '1') { d.dataset.armed = '1'; d.textContent = '再按一次確定刪除'; return; }
    const id = Number(d.dataset.delw);
    DB.run('DELETE FROM cards WHERE word_id = ?', [id]);
    DB.run('DELETE FROM practice_stats WHERE word_id = ?', [id]);
    DB.run('DELETE FROM words WHERE id = ? AND custom = 1', [id]);
    toast('已刪除'); renderWords();
  }
});
$('wAdd').addEventListener('submit', e => {
  e.preventDefault();
  const word = $('aWord').value.trim().replace(/\s+/g, ' '), meaning = $('aMeaning').value.trim();
  if (!word || !meaning) return toast('請填英文和中文意思');
  const id = Math.max(100000, (DB.get('SELECT MAX(id) AS m FROM words').m || 0) + 1);
  const pos = $('aPos').value || (/\s/.test(word) ? 'phr.' : null);
  DB.run('INSERT INTO words (id, key, word, pos, meaning, ex_en, ex_zh, category, custom) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, 1)',
    [id, word, pos, meaning, $('aEx').value.trim() || null, $('aExZh').value.trim() || null, '自訂']);
  ['aWord', 'aMeaning', 'aEx', 'aExZh'].forEach(i => { $(i).value = ''; });
  $('aPos').value = '';
  toast('已加入，會排在新單字的最前面'); wCat = '自訂'; renderWords();
});

// ---------- 設定 ----------
function renderSettings() {
  applyTheme();
  $('sNew').value = String(S.newPerDay); $('sDir').value = S.dir; $('sAuto').checked = !!S.autoSpeak;
  $('sRate').value = String(S.rate); $('sAccent').value = S.accent;
  if ('speechSynthesis' in window) loadVoices();
  const sel = new Set(S.cats || WORD_CATEGORIES);
  $('sCats').innerHTML = WORD_CATEGORIES.map(c => `<label><input type="checkbox" value="${esc(c)}" ${sel.has(c) ? 'checked' : ''}>${esc(c)}</label>`).join('');
  const last = DB.setting('lastBackup', null);
  $('sBackupInfo').textContent = last ? `上次匯出：${last}` : '還沒有匯出過備份。';
  $('sVer').textContent = `版本 ${APP_VERSION}・單字 ${DB.get('SELECT COUNT(*) AS n FROM words').n} 個`;
}
$('sTheme').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { setS('theme', b.dataset.v); applyTheme(); } });
$('sNew').addEventListener('change', e => setS('newPerDay', Number(e.target.value)));
$('sDir').addEventListener('change', e => setS('dir', e.target.value));
$('sAuto').addEventListener('change', e => setS('autoSpeak', e.target.checked));
$('sRate').addEventListener('change', e => setS('rate', Number(e.target.value)));
$('sAccent').addEventListener('change', e => { setS('accent', e.target.value); setS('voice', ''); loadVoices(); });
$('sVoice').addEventListener('change', e => setS('voice', e.target.value));
$('sTest').addEventListener('click', () => speak('Nice to meet you. How are you today?'));
$('sCats').addEventListener('change', () => {
  const v = [...$('sCats').querySelectorAll('input:checked')].map(i => i.value);
  if (!v.length) { toast('至少要選一個主題'); renderSettings(); return; }
  setS('cats', v.length === WORD_CATEGORIES.length ? null : v);
});
// 匯出：iPhone 用「分享」存到檔案 App；其他瀏覽器直接下載
$('sExport').addEventListener('click', async () => {
  await DB.saveNow();
  const name = `words-${today().replace(/-/g, '')}.db`;
  const file = new File([DB.exportBytes()], name, { type: 'application/octet-stream' });
  try {
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: name });
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }
    setS('lastBackup', new Date().toLocaleString('zh-TW', { hour12: false }));
    renderSettings();
  } catch (err) { if (err.name !== 'AbortError') toast(`匯出失敗：${err.message}`); }
});
$('sImport').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try { await DB.importBytes(await f.arrayBuffer()); loadSettings(); applyTheme(); pq = null; toast('已匯入備份'); go('home'); }
  catch (err) { toast(`匯入失敗：${err.message}`); }
});
$('sReset').addEventListener('click', async e => {
  const b = e.currentTarget;
  if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = '再按一次確定清除（無法復原）'; setTimeout(() => { b.dataset.armed = ''; b.textContent = '清除所有學習紀錄'; }, 4000); return; }
  await DB.reset(); loadSettings(); applyTheme(); pq = null; toast('已清除'); go('home');
});

// ---------- 啟動 ----------
(async () => {
  try {
    await DB.open();
    loadSettings();
    applyTheme();
    if ('speechSynthesis' in window) loadVoices();
    go('home');
  } catch (e) {
    $('loading').textContent = `載入失敗：${e.message}`;
    return;
  }
  $('loading').hidden = true;
  // 離線用：註冊 Service Worker（https 或 localhost 才能用）
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
