/* =========================================================
   PINDAS – PINTAR CERDAS
   APP.JS – VERSI PEMBAIKAN KESELURUHAN
   Umur 4–17 Tahun
   ========================================================= */

(() => {
  'use strict';

  // Pastikan data.js dimuatkan terlebih dahulu.
  if (
    typeof AGE_GROUPS === 'undefined' ||
    typeof GAMES_CATALOG === 'undefined' ||
    typeof QUESTION_BANK === 'undefined'
  ) {
    console.error('[PINDAS] Data permainan tidak dijumpai.');
    return;
  }

  const $ = id => document.getElementById(id);

  const STORAGE = {
    score: 'pindas_score',
    stars: 'pindas_stars',
    records: 'pindas_records',
    history: 'pindas_history',
    badges: 'pindas_badges',
    age: 'pindas_age',
    pin: 'pindas_parent_pin',
    limit: 'pindas_time_limit',
    usage: 'pindas_daily_usage',
    ad: 'pindas_ad_setting',
    played: 'pindas_played_games'
  };

  const QUESTION_COUNT = 5;
  const SPEED_SECONDS = 45;
  const DEFAULT_PIN = '1234';

  let selectedAge = localStorage.getItem(STORAGE.age) || '4-6';

  let session = {
    gameId: null,
    questions: [],
    index: 0,
    score: 0,
    correct: 0,
    answered: false,
    usedQuestions: new Set(),
    startTime: 0
  };

  let wordAnswer = [];
  let wordLetters = [];
  let speedTimer = null;
  let speedRemaining = SPEED_SECONDS;
  let usageTimer = null;
  let dailyBonus = false;
  let pinInput = '';
  let pinChangeMode = false;
  let currentView = 'viewHome';

  /* =========================================================
     UTILITI
     ========================================================= */

  function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('[PINDAS] Gagal menyimpan data:', error);
    }
  }

  function getAgeQuestions(gameId, ageId) {
    const game = QUESTION_BANK[gameId];
    if (!game) return [];

    const questions = game[ageId];
    return Array.isArray(questions) ? questions : [];
  }

  function getQuestionKey(question, gameId) {
    return gameId + '|' + (question.q || question.word || '') +
      '|' + (question.hint || '');
  }

  /* =========================================================
     SISTEM PEMILIHAN SOALAN
     ========================================================= */

  function buildQuestionsForGame(gameId, ageId = selectedAge, count = QUESTION_COUNT) {
    const bank = getAgeQuestions(gameId, ageId);

    if (!bank.length) {
      console.warn('[PINDAS] Tiada soalan:', gameId, ageId);
      return [];
    }

    // Salin bank supaya data asal tidak berubah.
    const pool = shuffle(bank);

    return pool.slice(0, Math.min(count, pool.length)).map(question => ({
      ...question,
      gameId,
      questionKey: getQuestionKey(question, gameId)
    }));
  }

  // Fungsi ini turut didedahkan untuk keserasian kod lain.
  window.buildQuestionsForGame = buildQuestionsForGame;

  function buildDailyQuestions(ageId) {
    const available = [];

    Object.keys(QUESTION_BANK).forEach(gameId => {
      getAgeQuestions(gameId, ageId).forEach(question => {
        available.push({
          ...question,
          gameId,
          questionKey: getQuestionKey(question, gameId)
        });
      });
    });

    return shuffle(available).slice(0, QUESTION_COUNT);
  }

  /* =========================================================
     PAPARAN KATEGORI UMUR
     ========================================================= */

  function renderAgeSelector() {
    const container = $('ageSelector');
    if (!container) return;

    container.innerHTML = AGE_GROUPS.map(age => `
      <button
        type="button"
        class="age-btn ${age.id === selectedAge ? 'active' : ''}"
        data-age="${age.id}"
        aria-pressed="${age.id === selectedAge}"
      >
        ${escapeHTML(age.label)}
      </button>
    `).join('');

    container.querySelectorAll('[data-age]').forEach(button => {
      button.addEventListener('click', () => {
        selectedAge = button.dataset.age;
        localStorage.setItem(STORAGE.age, selectedAge);
        renderAgeSelector();
        updateSchoolProgress();
      });
    });
  }

  /* =========================================================
     PAPARAN SENARAI PERMAINAN
     ========================================================= */

  function renderGames() {
    const container = $('gamesGrid');
    if (!container) return;

    container.innerHTML = GAMES_CATALOG.map(game => `
      <button
        type="button"
        class="game-card"
        onclick="startGame('${game.id}')"
        style="--game-bg:${escapeHTML(game.bg)}"
      >
        <span class="game-icon">${game.icon}</span>
        <strong>${escapeHTML(game.title)}</strong>
        <small>${escapeHTML(game.desc)}</small>
      </button>
    `).join('');
  }

  /* =========================================================
     NAVIGASI
     ========================================================= */

  function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.remove('active');
    });

    const target = $(viewId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(button => {
      button.classList.toggle(
        'active',
        button.dataset.view === viewId
      );
    });

    currentView = viewId;

    if (viewId === 'viewAchievements') renderBadges();
    if (viewId === 'viewRecords') renderRecords();
    if (viewId === 'viewParent') openParentPanel();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.switchView = switchView;

  /* =========================================================
     MULAKAN PERMAINAN
     ========================================================= */

  function startGame(gameId) {
    stopSpeedTimer();

    const game = GAMES_CATALOG.find(item => item.id === gameId);
    if (!game) return;

    if (!canPlayToday()) return;

    let questions;

    if (gameId === 'harian') {
      questions = buildDailyQuestions(selectedAge);
      dailyBonus = true;
    } else if (gameId === 'kepantasan') {
      questions = buildQuestionsForGame(gameId, selectedAge);

      // Mod kepantasan menggunakan gabungan semua kategori
      // supaya bank soalan lebih besar.
      questions = [];

      Object.keys(QUESTION_BANK).forEach(id => {
        getAgeQuestions(id, selectedAge).forEach(question => {
          questions.push({
            ...question,
            gameId: id,
            questionKey: getQuestionKey(question, id)
          });
        });
      });

      questions = shuffle(questions);
      dailyBonus = false;
    } else {
      questions = buildQuestionsForGame(gameId, selectedAge);
      dailyBonus = false;
    }

    if (!questions.length) {
      alert('Maaf, soalan untuk kategori ini belum tersedia.');
      return;
    }

    session = {
      gameId,
      questions,
      index: 0,
      score: 0,
      correct: 0,
      answered: false,
      usedQuestions: new Set(),
      startTime: Date.now()
    };

    const title = $('playGameTitle');
    if (title) title.textContent = game.title;

    const timerBadge = $('playTimerBadge');

    if (gameId === 'kepantasan') {
      speedRemaining = SPEED_SECONDS;

      if (timerBadge) {
        timerBadge.style.display = 'inline-block';
        timerBadge.textContent = '⏱️ ' + speedRemaining + 's';
      }
    } else if (timerBadge) {
      timerBadge.style.display = 'none';
    }

    switchView('viewPlay');

    renderQuestion();

    if (gameId === 'kepantasan') {
      startSpeedTimer();
    }
  }

  window.startGame = startGame;

  /* =========================================================
     PAPAR SOALAN
     ========================================================= */

  function renderQuestion() {
    const question = session.questions[session.index];

    if (!question) {
      finishGame();
      return;
    }

    session.answered = false;

    const counter = $('questionCounter');
    const questionText = $('questionText');
    const hintBox = $('hintBox');
    const pictureStage = $('pictureStage');
    const mcq = $('mcqContainer');
    const wordContainer = $('wordContainer');
    const feedback = $('feedbackBox');
    const nextButton = $('nextQuestionBtn');

    if (counter) {
      counter.textContent =
        'Soalan ' + (session.index + 1) +
        ' daripada ' + session.questions.length;
    }

    if (questionText) {
      questionText.textContent = question.q || question.hint || '';
    }

    if (hintBox) {
      if (question.hint) {
        hintBox.style.display = 'block';
        hintBox.textContent = '💡 Petunjuk: ' + question.hint;
      } else {
        hintBox.style.display = 'none';
        hintBox.textContent = '';
      }
    }

    if (pictureStage) {
      if (question.pic) {
        pictureStage.style.display = 'block';
        pictureStage.textContent = question.pic;
      } else {
        pictureStage.style.display = 'none';
        pictureStage.textContent = '';
      }
    }

    if (feedback) {
      feedback.style.display = 'none';
      feedback.innerHTML = '';
    }

    if (nextButton) {
      nextButton.style.display = 'none';
    }

    const isWord = Boolean(question.word);

    if (wordContainer) {
      wordContainer.style.display = isWord ? 'block' : 'none';
    }

    if (mcq) {
      mcq.style.display = isWord ? 'none' : 'flex';
      mcq.innerHTML = '';
    }

    if (isWord) {
      renderWordQuestion(question);
    } else {
      renderMCQ(question);
    }

    updatePlayProgress();
    updatePlayScore();
  }

  /* =========================================================
     PILIHAN JAWAPAN RAWAK
     ========================================================= */

  function renderMCQ(question) {
    const container = $('mcqContainer');
    if (!container) return;

    const options = question.opts || [];

    // Simpan jawapan sebenar sebelum pilihan diacak.
    const correctAnswer = Number(question.ans);

    const shuffledOptions = shuffle(
      options.map((text, originalIndex) => ({
        text,
        correct: originalIndex === correctAnswer
      }))
    );

    container.innerHTML = shuffledOptions.map((option, index) => `
      <button
        type="button"
        class="option-btn"
        data-correct="${option.correct}"
      >
        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
        <span>${escapeHTML(option.text)}</span>
      </button>
    `).join('');

    container.querySelectorAll('.option-btn').forEach(button => {
      button.addEventListener('click', () => {
        if (session.answered) return;

        const isCorrect = button.dataset.correct === 'true';

        answerQuestion(isCorrect, question, button);
      });
    });
  }

  /* =========================================================
     SISTEM TEKA PERKATAAN
     ========================================================= */

  function renderWordQuestion(question) {
    const slots = $('wordSlots');
    const bank = $('letterBank');

    if (!slots || !bank) return;

    wordAnswer = [];
    const answer = question.word.toUpperCase().split('');

    const distractors = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .split('')
      .filter(letter => !answer.includes(letter));

    const extraLetters = shuffle(distractors).slice(
      0,
      Math.min(3, Math.max(0, 10 - answer.length))
    );

    wordLetters = shuffle([...answer, ...extraLetters]).map(
      (letter, index) => ({
        id: index,
        letter,
        used: false
      })
    );

    slots.innerHTML = answer.map((letter, index) => `
      <button
        type="button"
        class="word-slot"
        data-slot="${index}"
        aria-label="Ruang huruf ${index + 1}"
      ></button>
    `).join('');

    bank.innerHTML = wordLetters.map(item => `
      <button
        type="button"
        class="letter-btn"
        data-letter-id="${item.id}"
      >${item.letter}</button>
    `).join('');

    bank.querySelectorAll('.letter-btn').forEach(button => {
      button.addEventListener('click', () => {
        selectWordLetter(Number(button.dataset.letterId));
      });
    });

    slots.querySelectorAll('.word-slot').forEach(button => {
      button.addEventListener('click', () => {
        removeWordLetter(Number(button.dataset.slot));
      });
    });

    // Tambah butang semak kerana index.html asal
    // hanya menyediakan butang padam dan kosongkan.
    let checkButton = $('checkWordBtn');

    if (!checkButton) {
      checkButton = document.createElement('button');
      checkButton.id = 'checkWordBtn';
      checkButton.className = 'primary-btn';
      checkButton.type = 'button';
      checkButton.textContent = '✓ Semak Jawapan';

      const controls = document.querySelector('.word-controls');

      if (controls) {
        controls.appendChild(checkButton);
      }
    }

    checkButton.onclick = checkWordAnswer;
    checkButton.disabled = false;
  }

  function selectWordLetter(id) {
    if (session.answered) return;

    const item = wordLetters.find(letter => letter.id === id);
    if (!item || item.used) return;

    const question = session.questions[session.index];

    if (wordAnswer.length >= question.word.length) return;

    item.used = true;

    wordAnswer.push({
      id: item.id,
      letter: item.letter
    });

    updateWordDisplay();

    if (wordAnswer.length === question.word.length) {
      checkWordAnswer();
    }
  }

  function updateWordDisplay() {
    const slots = $('wordSlots');
    const bank = $('letterBank');

    if (!slots || !bank) return;

    slots.querySelectorAll('.word-slot').forEach((slot, index) => {
      slot.textContent = wordAnswer[index]?.letter || '';
    });

    bank.querySelectorAll('.letter-btn').forEach(button => {
      const item = wordLetters.find(
        letter => letter.id === Number(button.dataset.letterId)
      );

      button.disabled = !item || item.used;
    });
  }

  function removeWordLetter(index) {
    if (session.answered) return;

    const item = wordAnswer[index];
    if (!item) return;

    const original = wordLetters.find(letter => letter.id === item.id);

    if (original) original.used = false;

    wordAnswer.splice(index, 1);
    updateWordDisplay();
  }

  function backspaceLetter() {
    if (session.answered || !wordAnswer.length) return;

    const item = wordAnswer.pop();

    const original = wordLetters.find(letter => letter.id === item.id);
    if (original) original.used = false;

    updateWordDisplay();
  }

  window.backspaceLetter = backspaceLetter;

  function clearWordGuess() {
    if (session.answered) return;

    wordAnswer = [];
    wordLetters.forEach(item => item.used = false);

    updateWordDisplay();
  }

  window.clearWordGuess = clearWordGuess;

  function checkWordAnswer() {
    if (session.answered) return;

    const question = session.questions[session.index];

    if (wordAnswer.length !== question.word.length) {
      showFeedback(false, 'Lengkapkan semua huruf dahulu.');
      return;
    }

    const answer = wordAnswer.map(item => item.letter).join('');
    const correct = answer === question.word.toUpperCase();

    answerQuestion(correct, question);
  }

  /* =========================================================
     PROSES JAWAPAN
     ========================================================= */

  function answerQuestion(isCorrect, question, selectedButton) {
    if (session.answered) return;

    session.answered = true;

    const feedback = $('feedbackBox');

    if (isCorrect) {
      session.correct++;
      session.score += 10;
    }

    if (selectedButton) {
      document.querySelectorAll('.option-btn').forEach(button => {
        button.disabled = true;

        if (button.dataset.correct === 'true') {
          button.classList.add('correct');
        } else if (button === selectedButton && !isCorrect) {
          button.classList.add('wrong');
        }
      });
    }

    if (question.word) {
      const slots = $('wordSlots');

      if (slots) {
        slots.querySelectorAll('.word-slot').forEach(slot => {
          slot.disabled = true;
          slot.classList.add(isCorrect ? 'correct' : 'wrong');
        });
      }

      const checkButton = $('checkWordBtn');
      if (checkButton) checkButton.disabled = true;
    }

    let message = isCorrect
      ? '🎉 Betul! Tahniah!'
      : '😊 Belum tepat. Cuba lagi pada soalan seterusnya.';

    if (question.exp) {
      message += '<br><br>📚 ' + escapeHTML(question.exp);
    }

    if (feedback) {
      feedback.innerHTML = message;
      feedback.style.display = 'block';
      feedback.classList.toggle('correct', isCorrect);
      feedback.classList.toggle('wrong', !isCorrect);
    }

    updatePlayScore();
    updatePlayProgress();

    const nextButton = $('nextQuestionBtn');

    if (nextButton) {
      nextButton.style.display =
        session.gameId === 'kepantasan' ? 'none' : 'block';
    }

    if (session.gameId === 'kepantasan') {
      setTimeout(() => {
        if (currentView !== 'viewPlay') return;
        if (session.answered) nextQuestion();
      }, 550);
    }
  }

  function showFeedback(isCorrect, message) {
    const feedback = $('feedbackBox');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.style.display = 'block';
    feedback.classList.toggle('correct', isCorrect);
    feedback.classList.toggle('wrong', !isCorrect);
  }

  /* =========================================================
     SOALAN SETERUSNYA
     ========================================================= */

  function nextQuestion() {
    if (!session.gameId) return;

    if (session.gameId === 'kepantasan') {
      // Elakkan soalan berulang sehingga bank habis.
      session.index++;

      if (session.index >= session.questions.length) {
        session.questions = shuffle(session.questions);
        session.index = 0;
      }

      renderQuestion();
      return;
    }

    session.index++;

    if (session.index >= session.questions.length) {
      finishGame();
      return;
    }

    renderQuestion();
  }

  window.nextQuestion = nextQuestion;

  /* =========================================================
     KEMAS KINI MARKAH DAN PROGRESS
     ========================================================= */

  function updatePlayScore() {
    const badge = $('playScoreBadge');

    if (badge) {
      badge.textContent = '⭐ ' + session.score;
    }
  }

  function updatePlayProgress() {
    const progress = $('playProgress');
    if (!progress) return;

    const total = session.questions.length || 1;

    const percentage = Math.min(
      100,
      ((session.index + (session.answered ? 1 : 0)) / total) * 100
    );

    progress.style.width = percentage + '%';
  }

  /* =========================================================
     MOD KEPANTASAN
     ========================================================= */

  function startSpeedTimer() {
    stopSpeedTimer();

    speedTimer = setInterval(() => {
      speedRemaining--;

      const badge = $('playTimerBadge');

      if (badge) {
        badge.textContent = '⏱️ ' + speedRemaining + 's';
      }

      if (speedRemaining <= 0) {
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

  /* =========================================================
     TAMAT PERMAINAN
     ========================================================= */

  function finishGame() {
    stopSpeedTimer();

    if (!session.gameId) return;

    const completedGame = session.gameId;
    const total = session.questions.length;
    const score = session.score;

    let bonus = 0;

    if (dailyBonus && session.index >= total - 1) {
      bonus = 50;
    }

    const finalScore = score + bonus;

    const totalScore = Number(
      localStorage.getItem(STORAGE.score) || 0
    ) + finalScore;

    const totalStars = Number(
      localStorage.getItem(STORAGE.stars) || 0
    ) + session.correct;

    localStorage.setItem(STORAGE.score, totalScore);
    localStorage.setItem(STORAGE.stars, totalStars);

    const records = readStorage(STORAGE.records, {});
    records[completedGame] = Math.max(
      records[completedGame] || 0,
      finalScore
    );
    saveStorage(STORAGE.records, records);

    const history = readStorage(STORAGE.history, []);

    history.unshift({
      game: completedGame,
      score: finalScore,
      correct: session.correct,
      total,
      date: new Date().toISOString()
    });

    saveStorage(STORAGE.history, history.slice(0, 50));

    const played = readStorage(STORAGE.played, []);
    if (!played.includes(completedGame)) {
      played.push(completedGame);
    }
    saveStorage(STORAGE.played, played);

    updateStats();
    checkBadges();

    const resultScore = $('resScore');
    const resultCorrect = $('resCorrect');
    const resultLevel = $('resLevel');
    const resultTitle = $('resultTitle');
    const resultSubtitle = $('resultSubtitle');

    if (resultScore) resultScore.textContent = finalScore;
    if (resultCorrect) {
      resultCorrect.textContent = session.correct + '/' + total;
    }

    if (resultLevel) {
      resultLevel.textContent = getLevel(totalScore);
    }

    if (resultTitle) {
      resultTitle.textContent =
        session.correct >= Math.ceil(total / 2)
          ? 'Tahniah!'
          : 'Teruskan Berusaha!';
    }

    if (resultSubtitle) {
      resultSubtitle.textContent =
        'Anda memperoleh ' + finalScore + ' mata.' +
        (bonus ? ' Termasuk bonus harian 50 mata!' : '');
    }

    const stars = $('resultStars');

    if (stars) {
      stars.textContent =
        session.correct >= total ? '⭐⭐⭐' :
        session.correct >= Math.ceil(total / 2) ? '⭐⭐' : '⭐';
    }

    const replay = $('replayBtn');

    if (replay) {
      replay.onclick = () => startGame(completedGame);
    }

    recordUsage();
    dailyBonus = false;

    session.gameId = null;

    switchView('viewResult');
  }

  /* =========================================================
     STATISTIK
     ========================================================= */

  function getLevel(score) {
    return 'Tahap ' + (Math.floor(score / 500) + 1);
  }

  function updateStats() {
    const score = Number(localStorage.getItem(STORAGE.score) || 0);
    const stars = Number(localStorage.getItem(STORAGE.stars) || 0);

    if ($('statScore')) $('statScore').textContent = score;
    if ($('statStars')) $('statStars').textContent = stars;
    if ($('statLevel')) $('statLevel').textContent = getLevel(score);
  }

  /* =========================================================
     LENCANA
     ========================================================= */

  function checkBadges() {
    if (typeof BADGES_DATA === 'undefined') return;

    const score = Number(localStorage.getItem(STORAGE.score) || 0);
    const stars = Number(localStorage.getItem(STORAGE.stars) || 0);
    const played = readStorage(STORAGE.played, []);
    const records = readStorage(STORAGE.records, {});

    const unlocked = readStorage(STORAGE.badges, []);

    const conditions = {
      first_win: played.length >= 1,
      star_10: stars >= 10,
      star_30: stars >= 30,
      score_500: score >= 500,
      score_1500: score >= 1500,
      level_5: Math.floor(score / 500) + 1 >= 5,
      daily_hero: Boolean(records.harian),
      all_rounder: played.length >= 5
    };

    BADGES_DATA.forEach(badge => {
      if (conditions[badge.id] && !unlocked.includes(badge.id)) {
        unlocked.push(badge.id);
      }
    });

    saveStorage(STORAGE.badges, unlocked);
  }

  function renderBadges() {
    const container = $('badgesGrid');
    if (!container || typeof BADGES_DATA === 'undefined') return;

    const unlocked = readStorage(STORAGE.badges, []);

    container.innerHTML = BADGES_DATA.map(badge => {
      const earned = unlocked.includes(badge.id);

      return `
        <div class="badge-item ${earned ? 'unlocked' : 'locked'}">
          <div class="badge-icon">${earned ? badge.icon : '🔒'}</div>
          <strong>${escapeHTML(badge.name)}</strong>
          <small>${escapeHTML(badge.req)}</small>
          <span>${earned ? 'Dibuka' : 'Belum dibuka'}</span>
        </div>
      `;
    }).join('');
  }

  /* =========================================================
     REKOD
     ========================================================= */

  function renderRecords() {
    const recordsContainer = $('highScoresList');
    const historyContainer = $('historyList');

    const records = readStorage(STORAGE.records, {});
    const history = readStorage(STORAGE.history, []);

    if (recordsContainer) {
      recordsContainer.innerHTML = GAMES_CATALOG.map(game => `
        <div class="record-row">
          <span>${game.icon} ${escapeHTML(game.title)}</span>
          <strong>${records[game.id] || 0} mata</strong>
        </div>
      `).join('');
    }

    if (historyContainer) {
      historyContainer.innerHTML = history.length
        ? history.slice(0, 20).map(item => {
            const game = GAMES_CATALOG.find(g => g.id === item.game);

            return `
              <div class="record-row">
                <span>${game ? game.icon : '🎮'}
                  ${game ? escapeHTML(game.title) : 'Permainan'}
                  <small>${new Date(item.date).toLocaleDateString('ms-MY')}</small>
                </span>
                <strong>${item.score} mata</strong>
              </div>
            `;
          }).join('')
        : '<p>Belum ada rekod permainan.</p>';
    }
  }

  function updateSchoolProgress() {
    const played = readStorage(STORAGE.played, []);
    const element = $('schoolProgressText');

    if (!element) return;

    element.textContent = played.length
      ? played.length + ' jenis permainan telah dicuba!'
      : 'Mulakan kelas pertama!';
  }

  /* =========================================================
     KAWALAN IBU BAPA
     ========================================================= */

  function openParentPanel() {
    const lock = $('parentLockPanel');
    const dashboard = $('parentDashboardPanel');

    if (lock) lock.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';

    pinInput = '';
    pinChangeMode = false;
    updatePinDots();
  }

  function pressPinKey(number) {
    if (pinInput.length >= 4) return;

    pinInput += String(number);
    updatePinDots();

    if (pinInput.length === 4) {
      setTimeout(checkPin, 150);
    }
  }

  window.pressPinKey = pressPinKey;

  function updatePinDots() {
    for (let i = 0; i < 4; i++) {
      const dot = $('pinDot_' + i);

      if (dot) {
        dot.classList.toggle('filled', i < pinInput.length);
      }
    }
  }

  function checkPin() {
    const savedPin = localStorage.getItem(STORAGE.pin) || DEFAULT_PIN;

    if (pinChangeMode) {
      localStorage.setItem(STORAGE.pin, pinInput);
      pinChangeMode = false;
      pinInput = '';

      const error = $('pinErrorMsg');
      if (error) error.textContent = 'PIN baharu berjaya disimpan.';

      updatePinDots();
      return;
    }

    if (pinInput === savedPin) {
      const lock = $('parentLockPanel');
      const dashboard = $('parentDashboardPanel');

      if (lock) lock.style.display = 'none';
      if (dashboard) dashboard.style.display = 'block';

      loadParentSettings();
    } else {
      const error = $('pinErrorMsg');
      if (error) error.textContent = 'PIN tidak tepat. Cuba sekali lagi.';

      pinInput = '';
      updatePinDots();
    }
  }

  function clearPinInput() {
    pinInput = '';
    updatePinDots();

    if ($('pinErrorMsg')) {
      $('pinErrorMsg').textContent = '';
    }
  }

  window.clearPinInput = clearPinInput;

  function startChangePin() {
    pinInput = '';
    pinChangeMode = true;

    const title = $('pinPromptTitle');
    const subtitle = $('pinPromptSub');
    const lock = $('parentLockPanel');
    const dashboard = $('parentDashboardPanel');

    if (title) title.textContent = 'Masukkan PIN Baharu';
    if (subtitle) subtitle.textContent = 'Masukkan 4 digit PIN baharu.';

    if (lock) lock.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';

    updatePinDots();
  }

  window.startChangePin = startChangePin;

  function lockParentPanel() {
    openParentPanel();

    if ($('pinPromptTitle')) {
      $('pinPromptTitle').textContent = 'Masukkan PIN Ibu Bapa';
    }

    if ($('pinPromptSub')) {
      $('pinPromptSub').textContent =
        'Lindungi tetapan masa dan data permainan.';
    }
  }

  window.lockParentPanel = lockParentPanel;

  /* =========================================================
     TETAPAN IBU BAPA
     ========================================================= */

  function loadParentSettings() {
    const limit = localStorage.getItem(STORAGE.limit) || '30';
    const ad = localStorage.getItem(STORAGE.ad) || 'on';

    if ($('timeLimitSelect')) $('timeLimitSelect').value = limit;
    if ($('adToggleSelect')) $('adToggleSelect').value = ad;

    updateUsageText();
  }

  function updateTimeLimit(value) {
    localStorage.setItem(STORAGE.limit, value);
  }

  window.updateTimeLimit = updateTimeLimit;

  function updateAdSetting(value) {
    localStorage.setItem(STORAGE.ad, value);

    const box = $('adPlaceholderBox');

    if (box) {
      box.style.display = value === 'on' ? 'block' : 'none';
    }
  }

  window.updateAdSetting = updateAdSetting;

  /* =========================================================
     HAD MASA BERMAIN
     ========================================================= */

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getUsage() {
    const data = readStorage(STORAGE.usage, {
      date: todayKey(),
      minutes: 0
    });

    if (data.date !== todayKey()) {
      return {
        date: todayKey(),
        minutes: 0
      };
    }

    return data;
  }

  function updateUsageText() {
    const element = $('todayUsageText');
    if (!element) return;

    const usage = getUsage();
    element.textContent =
      usage.minutes + ' minit digunakan hari ini';
  }

  function canPlayToday() {
    const limit = Number(localStorage.getItem(STORAGE.limit) || 30);

    if (limit === 0) return true;

    const usage = getUsage();

    if (usage.minutes >= limit) {
      const modal = $('timeLimitModal');
      if (modal) modal.classList.add('active');
      return false;
    }

    return true;
  }

  function recordUsage() {
    const usage = getUsage();
    usage.minutes += 1;

    saveStorage(STORAGE.usage, usage);
    updateUsageText();
  }

  function closeTimeLimitModal() {
    const modal = $('timeLimitModal');

    if (modal) modal.classList.remove('active');

    switchView('viewHome');
  }

  window.closeTimeLimitModal = closeTimeLimitModal;

  /* =========================================================
     MODAL PEMASANGAN
     ========================================================= */

  function openInstallModal() {
    const modal = $('installModal');
    if (modal) modal.classList.add('active');
  }

  window.openInstallModal = openInstallModal;

  function closeInstallModal() {
    const modal = $('installModal');
    if (modal) modal.classList.remove('active');
  }

  window.closeInstallModal = closeInstallModal;

  /* =========================================================
     RESET DATA
     ========================================================= */

  function resetAllGameData() {
    const confirmed = confirm(
      'Adakah anda pasti mahu memadam semua markah, bintang, rekod dan pencapaian?'
    );

    if (!confirmed) return;

    [
      STORAGE.score,
      STORAGE.stars,
      STORAGE.records,
      STORAGE.history,
      STORAGE.badges,
      STORAGE.played,
      STORAGE.usage
    ].forEach(key => localStorage.removeItem(key));

    updateStats();
    renderRecords();
    renderBadges();
    updateSchoolProgress();
    updateUsageText();

    alert('Semua data permainan telah ditetapkan semula.');
    switchView('viewHome');
  }

  window.resetAllGameData = resetAllGameData;

  /* =========================================================
     PEMBERSIHAN APABILA KELUAR
     ========================================================= */

  window.addEventListener('beforeunload', () => {
    stopSpeedTimer();
    if (usageTimer) clearInterval(usageTimer);
  });

  /* =========================================================
     MULAKAN APLIKASI
     ========================================================= */

  function initializePindas() {
    renderAgeSelector();
    renderGames();

    updateStats();
    renderBadges();
    renderRecords();
    updateSchoolProgress();

    const ad = localStorage.getItem(STORAGE.ad) || 'on';

    if ($('adPlaceholderBox')) {
      $('adPlaceholderBox').style.display =
        ad === 'on' ? 'block' : 'none';
    }

    // Butang permainan semula dan paparan utama.
    if ($('viewHome')) {
      $('viewHome').classList.add('active');
    }

    // Tetapkan had masa lalai.
    if (!localStorage.getItem(STORAGE.limit)) {
      localStorage.setItem(STORAGE.limit, '30');
    }

    // Paparkan keadaan harian.
    if ($('dailyDesc')) {
      $('dailyDesc').textContent =
        '5 soalan campuran khas hari ini.';
    }

    console.log('[PINDAS] Sistem berjaya dimulakan.');
    console.log('[PINDAS] Kategori umur:', AGE_GROUPS.length);
    console.log('[PINDAS] Mod permainan:', GAMES_CATALOG.length);
  }

  initializePindas();

})();
