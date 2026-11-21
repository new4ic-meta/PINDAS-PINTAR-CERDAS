/* PINDAS QUIZ FIX - REVISION 3 */
(function () {
  'use strict';

  if (typeof window.buildQuestionsForGame !== 'function') {
    console.error('[PINDAS] Fungsi asal tidak dijumpai.');
    return;
  }

  // Simpan fungsi asal.
  const originalBuild = window.buildQuestionsForGame;

  // Fisher-Yates shuffle.
  function shuffleQuestions(list) {
    const result = list.slice();

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  // Buang soalan pendua.
  function removeDuplicates(list) {
    const seen = new Set();

    return list.filter(function (question) {
      const key = String(
        question.q || question.word || ''
      ).trim().toLowerCase();

      if (!key || seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }

  // Balut fungsi asal tanpa mengubah sistem permainan.
  window.buildQuestionsForGame = function (...args) {
    const originalQuestions = originalBuild.apply(this, args);

    if (!Array.isArray(originalQuestions)) {
      console.error('[PINDAS] Bank soalan tidak sah.');
      return originalQuestions;
    }

    const uniqueQuestions = removeDuplicates(originalQuestions);

    return shuffleQuestions(uniqueQuestions);
  };

  console.info('[PINDAS] Revision 3 berjaya dimuatkan.');
})();
