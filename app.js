/* =========================================================
   PINDAS – PINTAR CERDAS
   APP.JS — FULL REPLACEMENT
   Fix: pemilihan umur, bank soalan, randomizer dan sesi kuiz
   ========================================================= */

(function () {
  'use strict';

  /* =========================
     1. KONFIGURASI
  ========================= */

  const STORAGE = {
    age: 'pindas_selected_age',
    stats: 'pindas_v4_stats',
    badges: 'pindas_v4_badges',
    history: 'pindas_v4_history',
    pin: 'pindas_parent_pin',
    timeLimit: 'pindas_time_limit',
    adSetting: 'pindas_ad_setting',
    dailyUsage: 'pindas_daily_usage'
  };

  const DEFAULT_AGE = '4-6';
  const QUESTIONS_PER_GAME = 5;
  const SPEED_DURATION = 45;

  const AGE_GROUPS = window.AGE_GROUPS || [
    { id: '4-6', label: '4–6 Tahun' },
    { id: '7-9', label: '7–9 Tahun' },
    { id: '10-12', label: '10–12 Tahun' },
    { id: '13-15', label: '13–15 Tahun' },
    { id: '16-17', label: '16–17 Tahun' }
  ];

  const GAMES_CATALOG = window.GAMES_CATALOG || [];

  const BADGES_DATA = window.BADGES_DATA || [];

  const QUESTION_BANK = window.QUESTION_BANK || {};

  const GAME_NAMES = {
    pengetahuan: 'Pengetahuan Am',
    matematik: 'Matematik',
    perkataan: 'Permainan Perkataan',
    logik: 'Logik',
    kepantasan: 'Kepantasan',
    harian: 'Cabaran Harian',
    gambar: 'Teka Gambar',
    tekateki: 'Teka-teki'
  };

  const CATEGORY_IDS = [
    'pengetahuan',
    'matematik',
    'perkataan',
    'logik',
    'gambar',
    'tekateki'
  ];

  /* =========================
     2. STATE PERMAINAN
  ========================= */

  let selectedAge = load(STORAGE.age, DEFAULT_AGE);

  let currentGame = null;
  let currentQuestions = [];
  let currentQuestionIndex = 0;
  let currentQuestion = null;

  let score = 0;
  let correctAnswers = 0;
  let answered = false;

  let wordSlots = [];
  let letterBank = [];

  let timerInterval = null;
  let speedTimeLeft = SPEED_DURATION;
  let sessionStartTime = 0;
  let sessionElapsed = 0;

  let speedMode = false;
  let dailyMode = false;

  let lastGameId = null;
  let pinInput = '';
  let changingPin = false;
  let newPinFirstEntry = '';

  let stats = load(STORAGE.stats, {
    totalScore: 0,
    totalCorrect: 0,
    totalGames: 0,
    level: 1,
    stars: 0,
    bestScore: 0
  });

  let badges = load(STORAGE.badges, []);
  let history = load(STORAGE.history, []);

  /* =========================
     3. UTILITI
  ========================= */

  function $(id) {
    return document.getElementById(id);
  }

  function load(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('[PINDAS] Gagal menyimpan data:', error);
    }
  }

  function shuffle(array) {
    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function todayKey() {
    const date = new Date();

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  function getAgeLabel(ageId) {
    const group = AGE_GROUPS.find(item => item.id === ageId);
    return group ? group.label : ageId;
  }

  function saveAge(ageId) {
    const valid = AGE_GROUPS.some(item => item.id === ageId);

    if (!valid) return;

    selectedAge = ageId;
    save(STORAGE.age, selectedAge);

    updateAgeSelector();
    console.log('[PINDAS] Umur dipilih:', selectedAge);
  }

  /* =========================
     4. BANK SOALAN
  ========================= */

  /*
     Menyokong dua bentuk data:

     Bentuk A:
     QUESTION_BANK['4-6'].pengetahuan

     Bentuk B:
     QUESTION_BANK.pengetahuan['4-6']
  */

  function getAgeBank(ageId) {
    if (!QUESTION_BANK || typeof QUESTION_BANK !== 'object') {
      return {};
    }

    if (
      QUESTION_BANK[ageId] &&
      typeof QUESTION_BANK[ageId] === 'object'
    ) {
      return QUESTION_BANK[ageId];
    }

    const result = {};

    CATEGORY_IDS.forEach(category => {
      if (
        QUESTION_BANK[category] &&
        QUESTION_BANK[category][ageId]
      ) {
        result[category] = QUESTION_BANK[category][ageId];
      }
    });

    return result;
  }

  function getCategoryQuestions(ageId, category) {
    const ageBank = getAgeBank(ageId);

    let questions = ageBank[category];

    if (!Array.isArray(questions)) {
      questions = [];
    }

    return questions.filter(question => {
      return question && typeof question === 'object';
    });
  }

  function normalizeQuestion(question, category) {
    const copy = JSON.parse(JSON.stringify(question));

    copy.gameId = category;

    if (copy.q == null && copy.question != null) {
      copy.q = copy.question;
    }

    if (copy.opts == null && Array.isArray(copy.options)) {
      copy.opts = copy.options;
    }

    if (copy.ans == null && copy.answer != null) {
      copy.ans = copy.answer;
    }

    if (copy.exp == null && copy.explanation != null) {
      copy.exp = copy.explanation;
    }

    if (category === 'perkataan') {
      copy.word = String(copy.word || '').toUpperCase();
      copy.hint = copy.hint || 'Susun huruf untuk membentuk perkataan.';
    }

    return copy;
  }

  /*
     Fungsi utama pemilihan soalan.
     Didedahkan pada window supaya fail lain boleh mengaksesnya.
  */

  function buildQuestionsForGame(gameId, ageId, count) {
    const age = AGE_GROUPS.some(item => item.id === ageId)
      ? ageId
      : selectedAge;

    const total = Math.max(1, Number(count) || QUESTIONS_PER_GAME);

    let pool = [];

    if (gameId === 'harian' || gameId === 'kepantasan') {
      CATEGORY_IDS.forEach(category => {
        const questions = getCategoryQuestions(age, category);

        questions.forEach(question => {
          pool.push(normalizeQuestion(question, category));
        });
      });
    } else {
      const questions = getCategoryQuestions(age, gameId);

      questions.forEach(question => {
        pool.push(normalizeQuestion(question, gameId));
      });
    }

    /*
       Jangan gunakan bank umur lain sebagai ganti.
       Jika bank umur pilihan kosong, pulangkan array kosong.
    */

    if (pool.length === 0) {
      console.warn(
        '[PINDAS] Tiada soalan untuk umur',
        age,
        'dan kategori',
        gameId
      );

      return [];
    }

    /*
       Fisher-Yates shuffle.
       Soalan asal dalam data.js tidak diubah.
    */

    pool = shuffle(pool);

    /*
       Elakkan soalan yang sama dalam sesi.
       Setiap objek disalin sebelum digunakan.
    */

    const selected = pool.slice(0, Math.min(total, pool.length));

    return selected.map(question => {
      return JSON.parse(JSON.stringify(question));
    });
  }

  window.buildQuestionsForGame = buildQuestionsForGame;

  /* =========================
     5. PAPARAN PILIHAN UMUR
  ========================= */

  function updateAgeSelector() {
    const selector = $('ageSelector');

    if (!selector) return;

    /*
       Jika elemen ialah SELECT.
    */

    if (selector.tagName === 'SELECT') {
      selector.value = selectedAge;

      selector.onchange = function () {
        saveAge(this.value);
      };

      return;
    }

    /*
       Jika pilihan umur menggunakan BUTTON.
    */

    const buttons = selector.querySelectorAll(
      '[data-age], button, .age-option'
    );

    buttons.forEach(button => {
      const ageId =
        button.dataset.age ||
        button.value ||
        button.getAttribute('data-value');

      if (!ageId) return;

      button.classList.toggle('active', ageId === selectedAge);
      button.setAttribute(
        'aria-pressed',
        ageId === selectedAge ? 'true' : 'false'
      );

      button.onclick = function () {
        saveAge(ageId);
      };
    });
  }

  function renderAgeSelector() {
    const selector = $('ageSelector');

    if (!selector) return;

    if (selector.tagName === 'SELECT') {
      selector.innerHTML = AGE_GROUPS.map(group => {
        return `
          <option value="${escapeHTML(group.id)}">
            ${escapeHTML(group.label)}
          </option>
        `;
      }).join('');

      selector.value = selectedAge;

      selector.onchange = function () {
        saveAge(this.value);
      };

      return;
    }

    /*
       Untuk paparan yang menggunakan butang.
       Jika butang umur sudah tersedia dalam HTML,
       fungsi updateAgeSelector akan mengendalikannya.
    */

    const existing = selector.querySelectorAll('[data-age]');

    if (existing.length > 0) {
      updateAgeSelector();
      return;
    }

    selector.innerHTML = AGE_GROUPS.map(group => {
      return `
        <button
          type="button"
          class="age-option ${group.id === selectedAge ? 'active' : ''}"
          data-age="${escapeHTML(group.id)}"
          aria-pressed="${group.id === selectedAge}"
        >
          ${escapeHTML(group.label)}
        </button>
      `;
    }).join('');

    updateAgeSelector();
  }

  /* =========================
     6. PAPARAN KATALOG PERMAINAN
  ========================= */

  function renderGames() {
    const container = $('gamesGrid');

    if (!container) return;

    const games = GAMES_CATALOG.length
      ? GAMES_CATALOG
      : [
          { id: 'pengetahuan', name: 'Pengetahuan Am' },
          { id: 'matematik', name: 'Matematik' },
          { id: 'perkataan', name: 'Perkataan' },
          { id: 'logik', name: 'Logik' },
          { id: 'kepantasan', name: 'Kepantasan' },
          { id: 'harian', name: 'Cabaran Harian' },
          { id: 'gambar', name: 'Teka Gambar' },
          { id: 'tekateki', name: 'Teka-teki' }
        ];

    if (container.children.length > 0) {
      return;
    }

    container.innerHTML = games.map(game => {
      const name = game.name || game.title || GAME_NAMES[game.id] || game.id;

      return `
        <button
          type="button"
          class="game-card"
          onclick="startGame('${escapeHTML(game.id)}')"
        >
          <span>${escapeHTML(name)}</span>
        </button>
      `;
    }).join('');
  }

  /* =========================
     7. KAWALAN PAPARAN
  ========================= */

  function switchView(viewName) {
    const targetId = viewName.startsWith('view')
      ? viewName
      : 'view' + viewName.charAt(0).toUpperCase() + viewName.slice(1);

    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.remove('active');
      view.style.display = 'none';
    });

    const target = $(targetId);

    if (target) {
      target.classList.add('active');
      target.style.display = '';
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');

      if (
        item.dataset.view === viewName ||
        item.dataset.view === targetId
      ) {
        item.classList.add('active');
      }
    });

    if (viewName === 'achievements') {
      renderAchievements();
    }

    if (viewName === 'records') {
      renderRecords();
    }
  }

  /* =========================
     8. HAD PENGGUNAAN HARIAN
  ========================= */

  function getDailyUsage() {
    const usage = load(STORAGE.dailyUsage, {
      date: todayKey(),
      seconds: 0
    });

    if (usage.date !== todayKey()) {
      return {
        date: todayKey(),
        seconds: 0
      };
    }

    return usage;
  }

  function getTimeLimit() {
    return Number(load(STORAGE.timeLimit, 0)) || 0;
  }

  function isTimeLimitReached() {
    const limit = getTimeLimit();

    if (limit <= 0) return false;

    return getDailyUsage().seconds >= limit * 60;
  }

  function updateDailyUsage(seconds) {
    const usage = getDailyUsage();

    usage.seconds += Math.max(0, Math.floor(seconds));

    save(STORAGE.dailyUsage, usage);

    updateParentDashboard();
  }

  /* =========================
     9. MULAKAN PERMAINAN
  ========================= */

  function startGame(gameId) {
    if (!gameId) return;

    /*
       Pastikan umur sah sebelum membina soalan.
    */

    if (!AGE_GROUPS.some(group => group.id === selectedAge)) {
      selectedAge = DEFAULT_AGE;
      save(STORAGE.age, selectedAge);
    }

    if (isTimeLimitReached()) {
      const modal = $('timeLimitModal');

      if (modal) modal.style.display = 'flex';

      return;
    }

    stopTimer();

    currentGame = gameId;
    lastGameId = gameId;

    speedMode = gameId === 'kepantasan';
    dailyMode = gameId === 'harian';

    currentQuestionIndex = 0;
    currentQuestion = null;

    score = 0;
    correctAnswers = 0;
    answered = false;

    speedTimeLeft = SPEED_DURATION;

    const numberOfQuestions = speedMode
      ? 20
      : QUESTIONS_PER_GAME;

    currentQuestions = buildQuestionsForGame(
      gameId,
      selectedAge,
      numberOfQuestions
    );

    if (!currentQuestions.length) {
      alert(
        'Maaf, belum ada soalan untuk kategori ' +
        getAgeLabel(selectedAge) +
        '. Sila semak bank soalan dalam data.js.'
      );

      return;
    }

    sessionStartTime = Date.now();
    sessionElapsed = 0;

    const title = $('playGameTitle');

    if (title) {
      title.textContent =
        (GAME_NAMES[gameId] || gameId) +
        ' • ' +
        getAgeLabel(selectedAge);
    }

    switchView('play');

    renderQuestion();

    if (speedMode) {
      startSpeedTimer();
    }
  }

  /* =========================
     10. PAPAR SOALAN
  ========================= */

  function renderQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
      finishGame();
      return;
    }

    currentQuestion = currentQuestions[currentQuestionIndex];
    answered = false;

    const question = currentQuestion;

    const counter = $('questionCounter');
    const progress = $('playProgress');
    const questionText = $('questionText');
    const pictureStage = $('pictureStage');
    const hintBox = $('hintBox');
    const mcqContainer = $('mcqContainer');
    const wordContainer = $('wordContainer');
    const nextButton = $('nextQuestionBtn');
    const feedback = $('feedbackBox');

    if (counter) {
      counter.textContent =
        'Soalan ' +
        (currentQuestionIndex + 1) +
        ' / ' +
        currentQuestions.length;
    }

    if (progress) {
      progress.style.width =
        ((currentQuestionIndex + 1) / currentQuestions.length * 100) + '%';
    }

    if (questionText) {
      questionText.textContent =
        question.q ||
        question.question ||
        question.word ||
        'Sila jawab soalan berikut.';
    }

    if (pictureStage) {
      if (question.pic) {
        pictureStage.style.display = '';

        if (/^https?:\/\//i.test(question.pic) || question.pic.startsWith('data:')) {
          pictureStage.innerHTML = `
            <img
              src="${escapeHTML(question.pic)}"
              alt="Gambar soalan"
              style="max-width:100%;max-height:220px;object-fit:contain;"
            >
          `;
        } else {
          pictureStage.textContent = question.pic;
        }
      } else {
        pictureStage.innerHTML = '';
        pictureStage.style.display = 'none';
      }
    }

    if (hintBox) {
      if (question.hint) {
        hintBox.textContent = 'Petunjuk: ' + question.hint;
        hintBox.style.display = '';
      } else {
        hintBox.textContent = '';
        hintBox.style.display = 'none';
      }
    }

    if (feedback) {
      feedback.textContent = '';
      feedback.className = '';
    }

    if (nextButton) {
      nextButton.style.display = 'none';
      nextButton.disabled = false;
    }

    if (question.gameId === 'perkataan' || question.word) {
      if (mcqContainer) {
        mcqContainer.innerHTML = '';
        mcqContainer.style.display = 'none';
      }

      if (wordContainer) {
        wordContainer.style.display = '';
      }

      renderWordQuestion(question);
    } else {
      if (wordContainer) {
        wordContainer.style.display = 'none';
      }

      if (mcqContainer) {
        mcqContainer.style.display = '';
      }

      renderMCQ(question);
    }

    updateScoreDisplay();
  }

  /* =========================
     11. SOALAN OBJEKTIF
  ========================= */

  function renderMCQ(question) {
    const container = $('mcqContainer');

    if (!container) return;

    const options = Array.isArray(question.opts)
      ? question.opts.slice()
      : [];

    if (!options.length) {
      container.innerHTML = '<p>Soalan ini belum mempunyai pilihan jawapan.</p>';
      return;
    }

    const correctAnswer = question.ans;

    let correctText = null;

    if (typeof correctAnswer === 'number') {
      correctText = options[correctAnswer];
    } else if (typeof correctAnswer === 'string') {
      correctText = correctAnswer;
    }

    const shuffled = shuffle(options);

    question._correctText = correctText;

    container.innerHTML = shuffled.map((option, index) => {
      return `
        <button
          type="button"
          class="answer-option"
          data-answer-index="${index}"
        >
          ${escapeHTML(option)}
        </button>
      `;
    }).join('');

    container.querySelectorAll('.answer-option').forEach(button => {
      button.addEventListener('click', function () {
        const chosen = shuffled[Number(this.dataset.answerIndex)];

        checkMCQAnswer(chosen, correctText);
      });
    });
  }

  function checkMCQAnswer(chosen, correctText) {
    if (answered) return;

    answered = true;

    const isCorrect = String(chosen).trim().toLowerCase() ===
      String(correctText).trim().toLowerCase();

    const buttons = document.querySelectorAll(
      '#mcqContainer .answer-option'
    );

    buttons.forEach(button => {
      button.disabled = true;

      const value = button.textContent.trim();

      if (
        value.toLowerCase() ===
        String(correctText).trim().toLowerCase()
      ) {
        button.classList.add('correct');
      }

      if (
        value.toLowerCase() ===
        String(chosen).trim().toLowerCase() &&
        !isCorrect
      ) {
        button.classList.add('wrong');
      }
    });

    processAnswer(isCorrect);
  }

  /* =========================
     12. SOALAN PERKATAAN
  ========================= */

  function renderWordQuestion(question) {
    const slots = $('wordSlots');
    const bank = $('letterBank');

    if (!slots || !bank) return;

    const answer = String(question.word || '').toUpperCase();

    wordSlots = new Array(answer.length).fill(null);

    letterBank = shuffle(
      answer.split('').map((letter, index) => ({
        id: index,
        letter: letter
      }))
    );

    slots.innerHTML = wordSlots.map((value, index) => {
      return `
        <button
          type="button"
          class="word-slot"
          data-slot="${index}"
        ></button>
      `;
    }).join('');

    bank.innerHTML = letterBank.map(item => {
      return `
        <button
          type="button"
          class="letter-button"
          data-letter-id="${item.id}"
        >
          ${escapeHTML(item.letter)}
        </button>
      `;
    }).join('');

    bank.querySelectorAll('.letter-button').forEach(button => {
      button.addEventListener('click', function () {
        selectLetter(Number(this.dataset.letterId));
      });
    });

    slots.querySelectorAll('.word-slot').forEach(button => {
      button.addEventListener('click', function () {
        removeLetter(Number(this.dataset.slot));
      });
    });
  }

  function selectLetter(letterId) {
    if (answered) return;

    const letter = letterBank.find(item => item.id === letterId);

    if (!letter) return;

    const emptySlot = wordSlots.findIndex(item => item === null);

    if (emptySlot === -1) return;

    wordSlots[emptySlot] = letter;

    updateWordDisplay();

    if (wordSlots.every(item => item !== null)) {
      checkWordAnswer();
    }
  }

  function removeLetter(slotIndex) {
    if (answered) return;

    if (wordSlots[slotIndex] === null) return;

    wordSlots[slotIndex] = null;

    updateWordDisplay();
  }

  function updateWordDisplay() {
    const slots = $('wordSlots');
    const bank = $('letterBank');

    if (!slots || !bank) return;

    slots.querySelectorAll('.word-slot').forEach((button, index) => {
      const item = wordSlots[index];

      button.textContent = item ? item.letter : '';
    });

    bank.querySelectorAll('.letter-button').forEach(button => {
      const id = Number(button.dataset.letterId);

      const used = wordSlots.some(item => item && item.id === id);

      button.disabled = used;
      button.classList.toggle('used', used);
    });
  }

  function checkWordAnswer() {
    if (answered) return;

    const guess = wordSlots.map(item => item.letter).join('');
    const answer = String(currentQuestion.word || '').toUpperCase();

    processAnswer(guess === answer);
  }

  function backspaceLetter() {
    if (answered) return;

    for (let i = wordSlots.length - 1; i >= 0; i--) {
      if (wordSlots[i] !== null) {
        wordSlots[i] = null;
        break;
      }
    }

    updateWordDisplay();
  }

  function clearWordGuess() {
    if (answered) return;

    wordSlots.fill(null);
    updateWordDisplay();
  }

  /* =========================
     13. SEMAK JAWAPAN
  ========================= */

  function processAnswer(isCorrect) {
    if (answered && currentQuestion && currentQuestion._processed) {
      return;
    }

    answered = true;

    if (currentQuestion) {
      currentQuestion._processed = true;
    }

    const feedback = $('feedbackBox');

    if (isCorrect) {
      score += 10;
      correctAnswers++;

      if (feedback) {
        feedback.textContent = 'Betul! Syabas!';
        feedback.className = 'feedback correct';
      }
    } else {
      if (feedback) {
        feedback.textContent = 'Belum tepat. ' +
          (currentQuestion.exp || 'Teruskan mencuba!');
        feedback.className = 'feedback wrong';
      }
    }

    if (isCorrect && currentQuestion.exp && feedback) {
      feedback.textContent += ' ' + currentQuestion.exp;
    }

    updateScoreDisplay();

    const nextButton = $('nextQuestionBtn');

    if (nextButton) {
      nextButton.style.display = '';
      nextButton.textContent =
        currentQuestionIndex >= currentQuestions.length - 1
          ? 'Lihat Keputusan'
          : 'Soalan Seterusnya';
    }

    if (speedMode) {
      setTimeout(() => {
        if (currentGame === 'kepantasan' && answered) {
          nextQuestion();
        }
      }, 900);
    }
  }

  /* =========================
     14. SOALAN SETERUSNYA
  ========================= */

  function nextQuestion() {
    if (!currentGame) return;

    currentQuestionIndex++;

    if (currentQuestionIndex >= currentQuestions.length) {
      if (speedMode) {
        /*
           Tambah satu pusingan baharu hanya selepas
           semua soalan dalam pusingan semasa digunakan.
        */

        currentQuestions = buildQuestionsForGame(
          'kepantasan',
          selectedAge,
          20
        );

        currentQuestionIndex = 0;

        if (!currentQuestions.length) {
          finishGame();
          return;
        }
      } else {
        finishGame();
        return;
      }
    }

    renderQuestion();
  }

  /* =========================
     15. PAPARAN MARKAH
  ========================= */

  function updateScoreDisplay() {
    const scoreBadge = $('playScoreBadge');

    if (scoreBadge) {
      scoreBadge.textContent = '⭐ ' + score;
    }

    const timerBadge = $('playTimerBadge');

    if (timerBadge && speedMode) {
      timerBadge.textContent = '⏱ ' + speedTimeLeft + 's';
    }
  }

  /* =========================
     16. MOD KEPANTASAN
  ========================= */

  function startSpeedTimer() {
    stopTimer();

    timerInterval = setInterval(() => {
      speedTimeLeft--;

      updateScoreDisplay();

      if (speedTimeLeft <= 0) {
        stopTimer();
        finishGame();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  /* =========================
     17. TAMAT PERMAINAN
  ========================= */

  function finishGame() {
    stopTimer();

    if (!currentGame) return;

    sessionElapsed = Math.max(
      0,
      Math.floor((Date.now() - sessionStartTime) / 1000)
    );

    updateDailyUsage(sessionElapsed);

    const bonus = dailyMode ? 50 : 0;
    const finalScore = score + bonus;

    stats.totalScore += finalScore;
    stats.totalCorrect += correctAnswers;
    stats.totalGames++;
    stats.bestScore = Math.max(stats.bestScore, finalScore);

    stats.stars += Math.floor(finalScore / 10);

    stats.level = Math.max(
      1,
      Math.floor(stats.totalScore / 100) + 1
    );

    save(STORAGE.stats, stats);

    const record = {
      game: currentGame,
      gameName: GAME_NAMES[currentGame] || currentGame,
      age: selectedAge,
      score: finalScore,
      correct: correctAnswers,
      total: currentQuestions.length,
      date: new Date().toLocaleString('ms-MY')
    };

    history.unshift(record);
    history = history.slice(0, 50);

    save(STORAGE.history, history);

    updateBadges(finalScore);

    const resultStars = $('resultStars');
    const resultTitle = $('resultTitle');
    const resultSubtitle = $('resultSubtitle');
    const resScore = $('resScore');
    const resCorrect = $('resCorrect');
    const resLevel = $('resLevel');

    if (resultStars) {
      const starCount = Math.max(
        1,
        Math.min(3, Math.ceil(correctAnswers / Math.max(1, currentQuestions.length) * 3))
      );

      resultStars.textContent = '⭐'.repeat(starCount);
    }

    if (resultTitle) {
      resultTitle.textContent =
        correctAnswers === currentQuestions.length
          ? 'Hebat! Semua Betul!'
          : 'Tahniah! Permainan Selesai';
    }

    if (resultSubtitle) {
      resultSubtitle.textContent =
        getAgeLabel(selectedAge) +
        ' • ' +
        (GAME_NAMES[currentGame] || currentGame);
    }

    if (resScore) resScore.textContent = finalScore;
    if (resCorrect) {
      resCorrect.textContent =
        correctAnswers + ' / ' + currentQuestions.length;
    }

    if (resLevel) resLevel.textContent = stats.level;

    updateParentDashboard();

    switchView('result');
  }

  /* =========================
     18. PENCAPAIAN
  ========================= */

  function updateBadges(finalScore) {
    const earned = [];

    if (stats.totalGames >= 1) earned.push('first_win');
    if (stats.stars >= 10) earned.push('star_10');
    if (stats.stars >= 30) earned.push('star_30');
    if (stats.totalScore >= 500) earned.push('score_500');
    if (stats.totalScore >= 1500) earned.push('score_1500');
    if (stats.level >= 5) earned.push('level_5');

    if (dailyMode) earned.push('daily_hero');

    const playedGames = new Set(history.map(item => item.game));

    if (CATEGORY_IDS.every(id => playedGames.has(id))) {
      earned.push('all_rounder');
    }

    earned.forEach(id => {
      if (!badges.includes(id)) badges.push(id);
    });

    save(STORAGE.badges, badges);
  }

  function renderAchievements() {
    const container = $('badgesGrid');

    if (!container) return;

    if (!BADGES_DATA.length) {
      container.innerHTML = badges.length
        ? badges.map(id => `<div class="badge-card">🏅 ${escapeHTML(id)}</div>`).join('')
        : '<p>Belum ada pencapaian. Jom bermain!</p>';

      return;
    }

    container.innerHTML = BADGES_DATA.map(badge => {
      const earned = badges.includes(badge.id);

      return `
        <div class="badge-card ${earned ? 'earned' : 'locked'}">
          <div>${earned ? '🏅' : '🔒'}</div>
          <strong>${escapeHTML(badge.name || badge.title || badge.id)}</strong>
          <small>${escapeHTML(badge.description || '')}</small>
        </div>
      `;
    }).join('');
  }

  /* =========================
     19. REKOD PERMAINAN
  ========================= */

  function renderRecords() {
    const highScores = $('highScoresList');
    const historyList = $('historyList');

    if (highScores) {
      highScores.innerHTML = history.length
        ? history.slice(0, 10).map(item => `
            <div class="record-item">
              <strong>${escapeHTML(item.gameName)}</strong>
              <span>${escapeHTML(item.score)} mata</span>
            </div>
          `).join('')
        : '<p>Belum ada rekod permainan.</p>';
    }

    if (historyList) {
      historyList.innerHTML = history.length
        ? history.map(item => `
            <div class="record-item">
              <strong>${escapeHTML(item.gameName)}</strong>
              <span>${escapeHTML(getAgeLabel(item.age))}</span>
              <span>${escapeHTML(item.correct)} / ${escapeHTML(item.total)}</span>
              <span>${escapeHTML(item.score)} mata</span>
              <small>${escapeHTML(item.date)}</small>
            </div>
          `).join('')
        : '<p>Belum ada sejarah permainan.</p>';
    }
  }

  /* =========================
     20. PANEL IBU BAPA
  ========================= */

  function showParentLock() {
    const lock = $('parentLockPanel');
    const dashboard = $('parentDashboardPanel');

    if (lock) lock.style.display = '';
    if (dashboard) dashboard.style.display = 'none';
  }

  function showParentDashboard() {
    const lock = $('parentLockPanel');
    const dashboard = $('parentDashboardPanel');

    if (lock) lock.style.display = 'none';
    if (dashboard) dashboard.style.display = '';

    updateParentDashboard();
  }

  function pressPinKey(number) {
    if (pinInput.length >= 4) return;

    pinInput += String(number);

    updatePinDots();

    if (pinInput.length === 4) {
      checkParentPin();
    }
  }

  function updatePinDots() {
    const dots = document.querySelectorAll('.pin-dot');

    dots.forEach((dot, index) => {
      dot.classList.toggle('filled', index < pinInput.length);
    });
  }

  function clearPinInput() {
    pinInput = '';
    updatePinDots();

    const error = $('pinErrorMsg');

    if (error) error.textContent = '';
  }

  function checkParentPin() {
    const savedPin = String(load(STORAGE.pin, '1234'));

    if (changingPin) {
      if (!newPinFirstEntry) {
        newPinFirstEntry = pinInput;
        clearPinInput();

        const error = $('pinErrorMsg');

        if (error) {
          error.textContent = 'Masukkan PIN baharu sekali lagi.';
        }

        return;
      }

      if (pinInput === newPinFirstEntry) {
        save(STORAGE.pin, pinInput);

        changingPin = false;
        newPinFirstEntry = '';

        clearPinInput();

        const error = $('pinErrorMsg');

        if (error) {
          error.textContent = 'PIN baharu berjaya disimpan.';
        }

        return;
      }

      newPinFirstEntry = '';
      clearPinInput();

      const error = $('pinErrorMsg');

      if (error) {
        error.textContent = 'PIN tidak sama. Cuba semula.';
      }

      return;
    }

    if (pinInput === savedPin) {
      clearPinInput();
      showParentDashboard();
    } else {
      clearPinInput();

      const error = $('pinErrorMsg');

      if (error) {
        error.textContent = 'PIN tidak betul.';
      }
    }
  }

  function startChangePin() {
    changingPin = true;
    newPinFirstEntry = '';

    clearPinInput();

    const error = $('pinErrorMsg');

    if (error) {
      error.textContent = 'Masukkan PIN baharu 4 angka.';
    }
  }

  function lockParentPanel() {
    changingPin = false;
    newPinFirstEntry = '';

    clearPinInput();
    showParentLock();
  }

  function updateParentDashboard() {
    const usageText = $('todayUsageText');

    if (usageText) {
      const seconds = getDailyUsage().seconds;
      const minutes = Math.floor(seconds / 60);

      usageText.textContent = minutes + ' minit';
    }

    const timeSelect = $('timeLimitSelect');

    if (timeSelect) {
      timeSelect.value = String(getTimeLimit());
    }

    const adSelect = $('adToggleSelect');

    if (adSelect) {
      adSelect.value = String(load(STORAGE.adSetting, true));
    }
  }

  function updateTimeLimit(value) {
    const limit = Number(value);

    if (!Number.isFinite(limit) || limit < 0) return;

    save(STORAGE.timeLimit, limit);
    updateParentDashboard();
  }

  function updateAdSetting(value) {
    save(STORAGE.adSetting, value === 'true' || value === true);

    const adArea = document.querySelector('.ad-placeholder');

    if (adArea) {
      adArea.style.display =
        (value === 'true' || value === true) ? '' : 'none';
    }
  }

  function resetAllGameData() {
    const confirmed = confirm(
      'Padam semua markah, rekod dan pencapaian permainan?'
    );

    if (!confirmed) return;

    stats = {
      totalScore: 0,
      totalCorrect: 0,
      totalGames: 0,
      level: 1,
      stars: 0,
      bestScore: 0
    };

    badges = [];
    history = [];

    save(STORAGE.stats, stats);
    save(STORAGE.badges, badges);
    save(STORAGE.history, history);

    renderAchievements();
    renderRecords();
    updateParentDashboard();

    alert('Data permainan telah ditetapkan semula.');
  }

  /* =========================
     21. MODAL
  ========================= */

  function openInstallModal() {
    const modal = $('installModal');

    if (modal) modal.style.display = 'flex';
  }

  function closeInstallModal() {
    const modal = $('installModal');

    if (modal) modal.style.display = 'none';
  }

  function closeTimeLimitModal() {
    const modal = $('timeLimitModal');

    if (modal) modal.style.display = 'none';
  }

  /* =========================
     22. BUTANG ULANG MAIN
  ========================= */

  function replayGame() {
    if (lastGameId) {
      startGame(lastGameId);
    }
  }

  /* =========================
     23. EVENT LISTENERS
  ========================= */

  function bindEvents() {
    const replayButton = $('replayBtn');

    if (replayButton) {
      replayButton.addEventListener('click', replayGame);
    }

    const nextButton = $('nextQuestionBtn');

    if (nextButton) {
      nextButton.addEventListener('click', nextQuestion);
    }

    document.querySelectorAll('[data-view]').forEach(button => {
      button.addEventListener('click', function () {
        switchView(this.dataset.view);
      });
    });

    const timeSelect = $('timeLimitSelect');

    if (timeSelect) {
      timeSelect.addEventListener('change', function () {
        updateTimeLimit(this.value);
      });
    }

    const adSelect = $('adToggleSelect');

    if (adSelect) {
      adSelect.addEventListener('change', function () {
        updateAdSetting(this.value);
      });
    }
  }

  /* =========================
     24. FUNGSI GLOBAL HTML
  ========================= */

  window.startGame = startGame;
  window.nextQuestion = nextQuestion;
  window.switchView = switchView;

  window.backspaceLetter = backspaceLetter;
  window.clearWordGuess = clearWordGuess;

  window.pressPinKey = pressPinKey;
  window.clearPinInput = clearPinInput;

  window.updateTimeLimit = updateTimeLimit;
  window.updateAdSetting = updateAdSetting;

  window.startChangePin = startChangePin;
  window.lockParentPanel = lockParentPanel;
  window.resetAllGameData = resetAllGameData;

  window.openInstallModal = openInstallModal;
  window.closeInstallModal = closeInstallModal;
  window.closeTimeLimitModal = closeTimeLimitModal;

  /* =========================
     25. INIT
  ========================= */

  function init() {
    /*
       Pastikan umur tersimpan ialah salah satu
       daripada lima kumpulan umur yang sah.
    */

    const validAge = AGE_GROUPS.some(group => {
      return group.id === selectedAge;
    });

    if (!validAge) {
      selectedAge = DEFAULT_AGE;
      save(STORAGE.age, selectedAge);
    }

    renderAgeSelector();
    renderGames();

    bindEvents();

    updateParentDashboard();
    renderAchievements();
    renderRecords();

    /*
       Pastikan paparan awal ialah halaman utama.
    */

    const home = $('viewHome');

    if (home) {
      switchView('home');
    }

    /*
       Pulihkan tetapan iklan.
    */

    updateAdSetting(load(STORAGE.adSetting, true));

    console.log('PINDAS berjaya dimulakan.');
    console.log('Umur aktif:', selectedAge);
    console.log('Bank umur aktif:', getAgeBank(selectedAge));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
