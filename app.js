/* PINDAS – PINTAR CERDAS | Enjin Permainan & Pengurusan Aplikasi */

const STORAGE_KEY = 'pindas_pintar_cerdas_v1';

const defaultState = {
  ageGroup: '7-9',
  totalScore: 0,
  totalStars: 0,
  level: 1,
  gamesPlayed: 0,
  playedTypes: [],
  highScores: {},
  records: [],
  unlockedBadges: [],
  dailyCompletedDate: '',
  parentPin: '',
  dailyTimeLimitMins: 30,
  todayPlayedSeconds: 0,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  showAdPlaceholder: true
};

let state = loadState();
let session = null;
let speedTimer = null;
let playTimeTracker = null;
let pinBuffer = '';
let pinMode = 'unlock'; // 'setup' | 'unlock' | 'change'
let parentUnlocked = false;
let deferredPrompt = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.lastActiveDate !== today) {
      parsed.todayPlayedSeconds = 0;
      parsed.lastActiveDate = today;
    }
    return { ...defaultState, ...parsed };
  } catch (e) {
    return { ...defaultState };
  }
}

function saveState() {
  state.level = Math.floor(state.totalScore / 150) + 1;
  checkBadges();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Abaikan ralat storan jika penuh
  }
  updateHeaderStats();
}

function checkBadges() {
  const unlock = (id) => {
    if (!state.unlockedBadges.includes(id)) {
      state.unlockedBadges.push(id);
    }
  };
  if (state.gamesPlayed >= 1) unlock('first_win');
  if (state.totalStars >= 10) unlock('star_10');
  if (state.totalStars >= 30) unlock('star_30');
  if (state.totalScore >= 500) unlock('score_500');
  if (state.totalScore >= 1500) unlock('score_1500');
  if (state.level >= 5) unlock('level_5');
  if (state.dailyCompletedDate === new Date().toISOString().slice(0, 10)) unlock('daily_hero');
  if (state.playedTypes.length >= 5) unlock('all_rounder');
}

function updateHeaderStats() {
  document.getElementById('statScore').textContent = state.totalScore.toLocaleString('ms-MY');
  document.getElementById('statStars').textContent = state.totalStars;
  document.getElementById('statLevel').textContent = 'Tahap ' + state.level;
  const adBox = document.getElementById('adPlaceholderBox');
  if (adBox) {
    adBox.style.display = state.showAdPlaceholder ? 'block' : 'none';
  }
}

/* Navigasi Paparan */
function switchView(viewId) {
  stopSpeedTimer();
  document.querySelectorAll('.view-section').forEach((el) => el.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });

  if (viewId === 'viewHome') renderHome();
  if (viewId === 'viewAchievements') renderAchievements();
  if (viewId === 'viewRecords') renderRecords();
  if (viewId === 'viewParent') renderParentView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Paparan Utama */
function renderHome() {
  const ageWrap = document.getElementById('ageSelector');
  ageWrap.innerHTML = AGE_GROUPS.map((ag) => `
    <button class="age-chip ${state.ageGroup === ag.id ? 'active' : ''}" onclick="selectAge('${ag.id}')">
      ${ag.label}
    </button>
  `).join('');

  const today = new Date().toISOString().slice(0, 10);
  const dailyDone = state.dailyCompletedDate === today;
  const dailyBtn = document.getElementById('dailyStartBtn');
  const dailyDesc = document.getElementById('dailyDesc');
  if (dailyDone) {
    dailyBtn.textContent = 'Selesai ✓';
    dailyDesc.textContent = 'Tahniah! Misi harian selesai. Boleh main lagi untuk latihan.';
  } else {
    dailyBtn.textContent = 'Mula (+50)';
    dailyDesc.textContent = '5 soalan campuran khas umur ' + getAgeLabel(state.ageGroup) + '.';
  }

  const grid = document.getElementById('gamesGrid');
  grid.innerHTML = GAMES_CATALOG.map((g) => {
    const hi = state.highScores[g.id] || 0;
    return `
      <button class="game-card" onclick="startGame('${g.id}')">
        <div class="game-icon" style="background:${g.bg}">${g.icon}</div>
        <div class="game-title">${g.title}</div>
        <div class="game-desc">${g.desc}</div>
        <div class="game-meta">Rekod: ${hi} mata</div>
      </button>
    `;
  }).join('');
}

function getAgeLabel(ageId) {
  const found = AGE_GROUPS.find((a) => a.id === ageId);
  return found ? found.label : ageId;
}

function selectAge(ageId) {
  state.ageGroup = ageId;
  saveState();
  renderHome();
}

/* Penjanaan Set Soalan Mengikut Permainan & Umur */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestionsForGame(gameId, age) {
  if (gameId === 'kepantasan') {
    const pool = [
      ...QUESTION_BANK.pengetahuan[age],
      ...QUESTION_BANK.matematik[age],
      ...QUESTION_BANK.logik[age]
    ];
    return shuffleArray(pool);
  }
  if (gameId === 'harian') {
    const pool = [
      QUESTION_BANK.pengetahuan[age][0],
      QUESTION_BANK.matematik[age][0],
      QUESTION_BANK.logik[age][0],
      QUESTION_BANK.gambar[age][0],
      QUESTION_BANK.tekateki[age][0]
    ];
    return shuffleArray(pool);
  }
  return shuffleArray(QUESTION_BANK[gameId][age]);
}

/* Mula Permainan */
function startGame(gameId) {
  if (isTimeLimitExceeded()) {
    openTimeLimitModal();
    return;
  }

  const gameMeta = GAMES_CATALOG.find((g) => g.id === gameId);
  const questions = buildQuestionsForGame(gameId, state.ageGroup);

  session = {
    gameId,
    gameTitle: gameMeta.title,
    gameType: gameMeta.type,
    questions,
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    streak: 0,
    answered: false,
    wordGuess: [],
    wordUsedIndices: [],
    timeLeft: gameId === 'kepantasan' ? 45 : 0
  };

  document.querySelectorAll('.view-section').forEach((el) => el.classList.remove('active'));
  document.getElementById('viewPlay').classList.add('active');
  document.getElementById('playGameTitle').textContent = gameMeta.title;

  if (gameId === 'kepantasan') {
    startSpeedTimer();
  } else {
    document.getElementById('playTimerBadge').style.display = 'none';
  }

  renderQuestion();
}

function startSpeedTimer() {
  stopSpeedTimer();
  const badge = document.getElementById('playTimerBadge');
  badge.style.display = 'inline-block';
  badge.textContent = '⏱️ ' + session.timeLeft + 's';

  speedTimer = setInterval(() => {
    if (!session) {
      stopSpeedTimer();
      return;
    }
    session.timeLeft -= 1;
    badge.textContent = '⏱️ ' + session.timeLeft + 's';
    if (session.timeLeft <= 0) {
      stopSpeedTimer();
      finishGame();
    }
  }, 1000);
}

function stopSpeedTimer() {
  if (speedTimer) {
    clearInterval(speedTimer);
    speedTimer = null;
  }
}

/* Papar Soalan Semasa */
function renderQuestion() {
  if (!session) return;
  if (session.currentIndex >= session.questions.length) {
    finishGame();
    return;
  }

  session.answered = false;
  const qObj = session.questions[session.currentIndex];
  const totalQ = session.questions.length;
  const pct = (session.currentIndex / totalQ) * 100;

  document.getElementById('playProgress').style.width = pct + '%';
  document.getElementById('playScoreBadge').textContent = '⭐ ' + session.score;
  document.getElementById('questionCounter').textContent =
    session.gameId === 'kepantasan'
      ? `Soalan #${session.currentIndex + 1} • Kombo x${Math.max(1, session.streak)}`
      : `Soalan ${session.currentIndex + 1} daripada ${totalQ} (${getAgeLabel(state.ageGroup)})`;

  const picEl = document.getElementById('pictureStage');
  if (qObj.pic) {
    picEl.style.display = 'block';
    picEl.textContent = qObj.pic;
  } else {
    picEl.style.display = 'none';
  }

  const fb = document.getElementById('feedbackBox');
  fb.className = 'feedback-box';
  fb.innerHTML = '';

  const nextBtn = document.getElementById('nextQuestionBtn');
  nextBtn.style.display = 'none';

  const mcqWrap = document.getElementById('mcqContainer');
  const wordWrap = document.getElementById('wordContainer');
  const hintBox = document.getElementById('hintBox');

  if (session.gameType === 'word') {
    mcqWrap.style.display = 'none';
    wordWrap.style.display = 'block';
    document.getElementById('questionText').textContent = 'Susun huruf menjadi perkataan yang betul:';
    hintBox.style.display = 'block';
    hintBox.textContent = '💡 Pembayang: ' + qObj.hint;
    setupWordPuzzle(qObj.word);
  } else {
    wordWrap.style.display = 'none';
    mcqWrap.style.display = 'block';
    hintBox.style.display = 'none';
    document.getElementById('questionText').textContent = qObj.q;

    const letters = ['A', 'B', 'C', 'D'];
    mcqWrap.innerHTML = qObj.opts.map((opt, idx) => `
      <button class="option-btn" id="optBtn_${idx}" onclick="submitMcqAnswer(${idx})">
        <span class="option-letter">${letters[idx]}</span>
        <span>${opt}</span>
      </button>
    `).join('');
  }
}

/* Jawapan Pilihan Berganda */
function submitMcqAnswer(selectedIdx) {
  if (!session || session.answered) return;
  session.answered = true;

  const qObj = session.questions[session.currentIndex];
  const isCorrect = selectedIdx === qObj.ans;

  qObj.opts.forEach((_, idx) => {
    const btn = document.getElementById('optBtn_' + idx);
    btn.disabled = true;
    if (idx === qObj.ans) btn.classList.add('correct');
    if (idx === selectedIdx && !isCorrect) btn.classList.add('wrong');
  });

  handleAnswerOutcome(isCorrect, qObj.exp);
}

/* Permainan Teka Perkataan */
function setupWordPuzzle(targetWord) {
  const cleanWord = targetWord.toUpperCase();
  const extraChars = ['A', 'E', 'I', 'K', 'L', 'M', 'N', 'R', 'S', 'T', 'U'];
  const poolChars = cleanWord.split('');
  while (poolChars.length < Math.min(cleanWord.length + 3, 12)) {
    const rand = extraChars[Math.floor(Math.random() * extraChars.length)];
    poolChars.push(rand);
  }
  session.wordTarget = cleanWord;
  session.wordLetters = shuffleArray(poolChars);
  session.wordGuess = [];
  session.wordUsedIndices = [];
  renderWordBoard();
}

function renderWordBoard() {
  const slotsEl = document.getElementById('wordSlots');
  const bankEl = document.getElementById('letterBank');
  const targetLen = session.wordTarget.length;

  let slotsHtml = '';
  for (let i = 0; i < targetLen; i++) {
    const ch = session.wordGuess[i] || '';
    slotsHtml += `<div class="letter-slot">${ch}</div>`;
  }
  slotsEl.innerHTML = slotsHtml;

  bankEl.innerHTML = session.wordLetters.map((ch, idx) => {
    const used = session.wordUsedIndices.includes(idx);
    return `<button class="bank-key" ${used || session.answered ? 'disabled' : ''} onclick="pickLetter(${idx})">${ch}</button>`;
  }).join('');
}

function pickLetter(idx) {
  if (!session || session.answered) return;
  if (session.wordGuess.length >= session.wordTarget.length) return;
  session.wordGuess.push(session.wordLetters[idx]);
  session.wordUsedIndices.push(idx);
  renderWordBoard();

  if (session.wordGuess.length === session.wordTarget.length) {
    checkWordAnswer();
  }
}

function backspaceLetter() {
  if (!session || session.answered || session.wordGuess.length === 0) return;
  session.wordGuess.pop();
  session.wordUsedIndices.pop();
  renderWordBoard();
}

function clearWordGuess() {
  if (!session || session.answered) return;
  session.wordGuess = [];
  session.wordUsedIndices = [];
  renderWordBoard();
}

function checkWordAnswer() {
  session.answered = true;
  const formed = session.wordGuess.join('');
  const isCorrect = formed === session.wordTarget;
  const qObj = session.questions[session.currentIndex];
  renderWordBoard();

  const detail = isCorrect
    ? qObj.exp
    : `Jawapan tepat ialah <strong>${session.wordTarget}</strong>. ${qObj.exp}`;
  handleAnswerOutcome(isCorrect, detail);
}

/* Pengiraan Markah & Maklum Balas */
function handleAnswerOutcome(isCorrect, explanation) {
  const fb = document.getElementById('feedbackBox');
  if (isCorrect) {
    session.correctCount += 1;
    session.streak += 1;
    const points = 20 + (session.streak > 1 ? 5 : 0);
    session.score += points;
    fb.className = 'feedback-box show good';
    fb.innerHTML = `✅ <strong>Tahniah, tepat! (+${points} mata)</strong><br>${explanation}`;
  } else {
    session.streak = 0;
    fb.className = 'feedback-box show bad';
    fb.innerHTML = `❌ <strong>Kurang tepat!</strong><br>${explanation}`;
  }

  document.getElementById('playScoreBadge').textContent = '⭐ ' + session.score;

  if (session.gameId === 'kepantasan') {
    setTimeout(() => {
      if (session && session.timeLeft > 0) {
        session.currentIndex += 1;
        if (session.currentIndex >= session.questions.length) {
          session.questions = session.questions.concat(buildQuestionsForGame('kepantasan', state.ageGroup));
        }
        renderQuestion();
      }
    }, 750);
  } else {
    const nextBtn = document.getElementById('nextQuestionBtn');
    nextBtn.style.display = 'block';
    nextBtn.textContent =
      session.currentIndex + 1 >= session.questions.length ? 'Lihat Keputusan 🏆' : 'Soalan Seterusnya ➡️';
  }
}

function nextQuestion() {
  if (!session) return;
  session.currentIndex += 1;
  renderQuestion();
}

/* Tamat Permainan & Paparan Keputusan */
function finishGame() {
  stopSpeedTimer();
  if (!session) return;

  const totalAnswered = session.gameId === 'kepantasan' ? Math.max(1, session.currentIndex) : session.questions.length;
  const ratio = session.correctCount / totalAnswered;

  let starsEarned = 1;
  if (ratio >= 0.8 || (session.gameId === 'kepantasan' && session.correctCount >= 6)) {
    starsEarned = 3;
  } else if (ratio >= 0.5 || (session.gameId === 'kepantasan' && session.correctCount >= 3)) {
    starsEarned = 2;
  }

  let bonus = 0;
  const today = new Date().toISOString().slice(0, 10);
  if (session.gameId === 'harian' && state.dailyCompletedDate !== today) {
    bonus = 50;
    state.dailyCompletedDate = today;
  }

  const finalScore = session.score + bonus;
  state.totalScore += finalScore;
  state.totalStars += starsEarned;
  state.gamesPlayed += 1;

  if (!state.playedTypes.includes(session.gameId)) {
    state.playedTypes.push(session.gameId);
  }

  const prevHigh = state.highScores[session.gameId] || 0;
  const isNewRecord = finalScore > prevHigh;
  if (isNewRecord) {
    state.highScores[session.gameId] = finalScore;
  }

  state.records.unshift({
    game: session.gameTitle,
    age: getAgeLabel(state.ageGroup),
    score: finalScore,
    stars: starsEarned,
    date: new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  });
  if (state.records.length > 25) state.records.pop();

  saveState();

  document.querySelectorAll('.view-section').forEach((el) => el.classList.remove('active'));
  document.getElementById('viewResult').classList.add('active');

  document.getElementById('resultStars').textContent = '⭐'.repeat(starsEarned) + '☆'.repeat(3 - starsEarned);
  document.getElementById('resultTitle').textContent =
    starsEarned === 3 ? 'Cemerlang Sekali!' : starsEarned === 2 ? 'Bagus! Teruskan Usaha!' : 'Syabas Mencuba!';
  document.getElementById('resultSubtitle').textContent =
    isNewRecord ? '🎉 Rekod Markah Tertinggi Baharu dicatat!' : `${session.gameTitle} • Kategori ${getAgeLabel(state.ageGroup)}`;

  document.getElementById('resScore').textContent = finalScore;
  document.getElementById('resCorrect').textContent = `${session.correctCount}/${totalAnswered}`;
  document.getElementById('resLevel').textContent = 'Tahap ' + state.level;

  const replayId = session.gameId;
  document.getElementById('replayBtn').onclick = () => startGame(replayId);
  session = null;
}

/* Pencapaian & Lencana */
function renderAchievements() {
  const grid = document.getElementById('badgesGrid');
  grid.innerHTML = BADGES_DATA.map((b) => {
    const unlocked = state.unlockedBadges.includes(b.id);
    return `
      <div class="badge-item ${unlocked ? 'unlocked' : ''}">
        <span class="badge-emoji">${unlocked ? b.icon : '🔒'}</span>
        <span class="badge-name">${b.name}</span>
        <span class="badge-req">${b.req}</span>
      </div>
    `;
  }).join('');
}

/* Rekod Permainan & Markah Tertinggi */
function renderRecords() {
  const hiList = document.getElementById('highScoresList');
  hiList.innerHTML = GAMES_CATALOG.map((g) => `
    <div class="record-item">
      <span>${g.icon} <strong>${g.title}</strong></span>
      <span style="color:var(--primary);font-weight:800">${state.highScores[g.id] || 0} mata</span>
    </div>
  `).join('');

  const histList = document.getElementById('historyList');
  if (state.records.length === 0) {
    histList.innerHTML = '<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:12px 0;">Belum ada rekod permainan. Mulakan permainan pertama anda!</p>';
    return;
  }

  histList.innerHTML = state.records.map((r) => `
    <div class="record-item">
      <div>
        <strong>${r.game}</strong> <span style="font-size:11px;color:var(--text-muted)">(${r.age})</span>
        <div style="font-size:11px;color:var(--text-muted)">${r.date}</div>
      </div>
      <div style="text-align:right">
        <strong style="color:var(--primary)">+${r.score}</strong>
        <div style="font-size:12px">${'⭐'.repeat(r.stars)}</div>
      </div>
    </div>
  `).join('');
}

/* Kawalan Ibu Bapa Dilindungi PIN */
function renderParentView() {
  const lockPanel = document.getElementById('parentLockPanel');
  const dashPanel = document.getElementById('parentDashboardPanel');

  if (parentUnlocked) {
    lockPanel.style.display = 'none';
    dashPanel.style.display = 'block';
    document.getElementById('timeLimitSelect').value = String(state.dailyTimeLimitMins);
    document.getElementById('adToggleSelect').value = state.showAdPlaceholder ? 'on' : 'off';
    const minsUsed = Math.floor(state.todayPlayedSeconds / 60);
    document.getElementById('todayUsageText').textContent = `${minsUsed} minit digunakan hari ini`;
    return;
  }

  lockPanel.style.display = 'block';
  dashPanel.style.display = 'none';
  pinBuffer = '';
  pinMode = state.parentPin ? 'unlock' : 'setup';
  document.getElementById('pinPromptTitle').textContent =
    pinMode === 'setup' ? 'Tetapkan PIN Ibu Bapa (4 Digit)' : 'Masukkan PIN Ibu Bapa';
  document.getElementById('pinPromptSub').textContent =
    pinMode === 'setup'
      ? 'Cipta 4 digit PIN untuk melindungi tetapan masa dan data permainan.'
      : 'Sila masukkan 4 digit PIN untuk mengakses tetapan.';
  document.getElementById('pinErrorMsg').textContent = '';
  updatePinDots();
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('pinDot_' + i);
    if (dot) dot.classList.toggle('filled', i < pinBuffer.length);
  }
}

function pressPinKey(digit) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += String(digit);
  updatePinDots();

  if (pinBuffer.length === 4) {
    setTimeout(() => {
      if (pinMode === 'setup') {
        state.parentPin = pinBuffer;
        saveState();
        parentUnlocked = true;
        renderParentView();
      } else if (pinMode === 'change') {
        state.parentPin = pinBuffer;
        saveState();
        parentUnlocked = true;
        renderParentView();
      } else {
        if (pinBuffer === state.parentPin) {
          parentUnlocked = true;
          renderParentView();
        } else {
          document.getElementById('pinErrorMsg').textContent = 'PIN salah. Sila cuba lagi.';
          pinBuffer = '';
          updatePinDots();
        }
      }
    }, 150);
  }
}

function clearPinInput() {
  pinBuffer = '';
  document.getElementById('pinErrorMsg').textContent = '';
  updatePinDots();
}

function lockParentPanel() {
  parentUnlocked = false;
  renderParentView();
}

function startChangePin() {
  parentUnlocked = false;
  document.getElementById('parentDashboardPanel').style.display = 'none';
  document.getElementById('parentLockPanel').style.display = 'block';
  pinBuffer = '';
  pinMode = 'change';
  document.getElementById('pinPromptTitle').textContent = 'Masukkan PIN Baharu (4 Digit)';
  document.getElementById('pinPromptSub').textContent = 'Pilih 4 digit nombor baharu yang mudah diingati ibu bapa.';
  document.getElementById('pinErrorMsg').textContent = '';
  updatePinDots();
}

function updateTimeLimit(val) {
  state.dailyTimeLimitMins = parseInt(val, 10);
  saveState();
}

function updateAdSetting(val) {
  state.showAdPlaceholder = val === 'on';
  saveState();
}

function resetAllGameData() {
  const savedPin = state.parentPin;
  const savedLimit = state.dailyTimeLimitMins;
  state = {
    ...defaultState,
    parentPin: savedPin,
    dailyTimeLimitMins: savedLimit
  };
  saveState();
  renderParentView();
  alert('Semua data kemajuan, bintang dan rekod permainan telah ditetapkan semula.');
}

/* Pemantauan Had Masa Harian */
function isTimeLimitExceeded() {
  if (!state.dailyTimeLimitMins || state.dailyTimeLimitMins <= 0) return false;
  return state.todayPlayedSeconds >= state.dailyTimeLimitMins * 60;
}

function openTimeLimitModal() {
  document.getElementById('timeLimitModal').classList.add('open');
}

function closeTimeLimitModal() {
  document.getElementById('timeLimitModal').classList.remove('open');
  switchView('viewHome');
}

function startUsageTracker() {
  if (playTimeTracker) clearInterval(playTimeTracker);
  playTimeTracker = setInterval(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastActiveDate !== today) {
      state.todayPlayedSeconds = 0;
      state.lastActiveDate = today;
    }
    state.todayPlayedSeconds += 5;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    if (session && isTimeLimitExceeded()) {
      stopSpeedTimer();
      session = null;
      openTimeLimitModal();
    }
  }, 5000);
}

/* Sokongan Pemasangan PWA */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function openInstallModal() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => {
      deferredPrompt = null;
    });
    return;
  }
  document.getElementById('installModal').classList.add('open');
}

function closeInstallModal() {
  document.getElementById('installModal').classList.remove('open');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

/* Permulaan Aplikasi */
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderStats();
  renderHome();
  startUsageTracker();
});
