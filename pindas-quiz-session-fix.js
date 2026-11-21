/* PINDAS – QUIZ SESSION FIX
   Muatkan fail ini SELEPAS data.js dan app.js dalam index.html.
   Contoh:
   <script src="./data.js"></script>
   <script src="./app.js"></script>
   <script src="./pindas-quiz-session-fix.js"></script>
*/
(function () {
  'use strict';

  if (typeof window.buildQuestionsForGame !== 'function' ||
      typeof window.handleAnswerOutcome !== 'function') {
    console.error('[PINDAS] Quiz fix gagal dimuatkan: app.js belum tersedia.');
    return;
  }

  // Bina satu set baharu setiap kali permainan dimulakan.
  // Bank asal dan format soalan tidak diubah.
  window.buildQuestionsForGame = function (gameId, age) {
    var pool;

    if (gameId === 'kepantasan') {
      var bank = window.QUESTION_BANK;
      pool = []
        .concat((bank.pengetahuan && bank.pengetahuan[age]) || [])
        .concat((bank.matematik && bank.matematik[age]) || [])
        .concat((bank.logik && bank.logik[age]) || []);
    } else if (gameId === 'harian') {
      var categories = ['pengetahuan', 'matematik', 'logik', 'gambar', 'tekateki'];
      pool = categories.map(function (category) {
        var items = (window.QUESTION_BANK[category] &&
                     window.QUESTION_BANK[category][age]) || [];
        return items.length ? items[Math.floor(Math.random() * items.length)] : null;
      }).filter(Boolean);
    } else {
      pool = (window.QUESTION_BANK[gameId] &&
              window.QUESTION_BANK[gameId][age]) || [];
    }

    // Buang soalan pendua berdasarkan teks/word sebelum shuffle.
    var seen = new Set();
    var unique = pool.filter(function (q) {
      var key = String(q.q || q.word || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    function shuffle(list) {
      var copy = list.slice();
      for (var i = copy.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      return copy;
    }

    return shuffle(unique).map(function (question) {
      var copy = Object.assign({}, question);
      if (Array.isArray(copy.opts) && Number.isInteger(copy.ans)) {
        var correct = copy.opts[copy.ans];
        copy.opts = shuffle(copy.opts);
        copy.ans = copy.opts.indexOf(correct);
      }
      return copy;
    });
  };

  // Gantikan pengendalian jawapan supaya mod Kepantasan tidak mengulang
  // bank yang sama. Jika bank habis sebelum 45 saat, permainan tamat.
  window.handleAnswerOutcome = function (isCorrect, explanation) {
    if (!window.session) return;

    var activeSession = window.session;
    var feedback = document.getElementById('feedbackBox');

    if (isCorrect) {
      activeSession.correctCount += 1;
      activeSession.streak += 1;
      var points = 20 + (activeSession.streak > 1 ? 5 : 0);
      activeSession.score += points;
      feedback.className = 'feedback-box show good';
      feedback.innerHTML = '✅ <strong>Tahniah, tepat! (+' + points +
        ' mata)</strong><br>' + explanation;
    } else {
      activeSession.streak = 0;
      feedback.className = 'feedback-box show bad';
      feedback.innerHTML = '❌ <strong>Kurang tepat!</strong><br>' + explanation;
    }

    document.getElementById('playScoreBadge').textContent = '⭐ ' + activeSession.score;

    if (activeSession.gameId === 'kepantasan') {
      window.setTimeout(function () {
        // Elak pemasa lama mengubah sesi permainan yang baharu.
        if (window.session !== activeSession) return;
        if (activeSession.timeLeft <= 0) return;

        activeSession.currentIndex += 1;
        if (activeSession.currentIndex >= activeSession.questions.length) {
          // Jangan tambah semula soalan yang telah dijawab.
          window.finishGame();
          return;
        }
        window.renderQuestion();
      }, 750);
    } else {
      var nextButton = document.getElementById('nextQuestionBtn');
      nextButton.style.display = 'block';
      nextButton.textContent =
        activeSession.currentIndex + 1 >= activeSession.questions.length
          ? 'Lihat Keputusan 🏆'
          : 'Soalan Seterusnya ➡️';
    }
  };

  console.info('[PINDAS] Quiz session fix berjaya dimuatkan.');
})();
