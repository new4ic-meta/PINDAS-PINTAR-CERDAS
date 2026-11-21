/* PINDAS Quiz Randomizer Repair Module
 * Safe standalone helper. It does not overwrite the existing 8 games.
 * Integrate with app.js after mapping existing question objects to this format:
 * { id, ageGroup, question, options:[{id,text}], correctOptionId, difficulty, hint }
 */
(function (root) {
  "use strict";

  const AGE_GROUPS = ["4-6", "7-9", "10-12", "13-15", "16-17"];

  function randomIndex(max) {
    if (!Number.isInteger(max) || max <= 0) throw new Error("max mesti > 0");
    if (root.crypto && root.crypto.getRandomValues) {
      const range = 0x100000000;
      const limit = range - (range % max);
      const buf = new Uint32Array(1);
      let n;
      do { root.crypto.getRandomValues(buf); n = buf[0]; } while (n >= limit);
      return n % max;
    }
    return Math.floor(Math.random() * max);
  }

  function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function validateQuestion(q) {
    return !!(
      q && typeof q.id === "string" && q.id &&
      typeof q.question === "string" && q.question.trim() &&
      Array.isArray(q.options) && q.options.length >= 2 &&
      q.options.every(o => o && typeof o.id === "string" && typeof o.text === "string") &&
      q.options.some(o => o.id === q.correctOptionId)
    );
  }

  function forAge(questionBank, ageGroup) {
    if (!AGE_GROUPS.includes(ageGroup)) throw new Error("Kategori umur tidak sah: " + ageGroup);
    return questionBank.filter(q => q && q.ageGroup === ageGroup && validateQuestion(q));
  }

  function createSession(questionBank, ageGroup, totalQuestions) {
    const pool = forAge(questionBank, ageGroup);
    if (!pool.length) throw new Error("Bank soalan kosong/tidak sah untuk umur " + ageGroup);
    const count = Math.max(1, Math.min(Number(totalQuestions) || 5, pool.length));
    const selected = shuffle(pool).slice(0, count);
    return {
      ageGroup,
      questionIds: selected.map(q => q.id),
      answeredIds: [],
      index: 0,
      questions: selected.map(q => ({
        ...q,
        options: shuffle(q.options)
      }))
    };
  }

  function currentQuestion(session) {
    if (!session || session.index >= session.questions.length) return null;
    return session.questions[session.index];
  }

  function markAnswered(session, questionId) {
    if (!session) throw new Error("Sesi kuiz tiada.");
    const current = currentQuestion(session);
    if (!current || current.id !== questionId) {
      throw new Error("Soalan yang dihantar bukan soalan aktif.");
    }
    if (session.answeredIds.includes(questionId)) {
      throw new Error("Soalan ini telah dijawab.");
    }
    session.answeredIds.push(questionId);
    session.index += 1;
    return currentQuestion(session);
  }

  function isFinished(session) {
    return !session || session.index >= session.questions.length;
  }

  const api = {
    AGE_GROUPS,
    shuffle,
    validateQuestion,
    forAge,
    createSession,
    currentQuestion,
    markAnswered,
    isFinished
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PINDASQuizRandomizer = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
