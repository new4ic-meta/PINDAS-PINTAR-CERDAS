// Run in browser console after loading pindas-quiz-randomizer.js.
const bank = [
  {id:"q1",ageGroup:"4-6",question:"1+1?",options:[{id:"a",text:"1"},{id:"b",text:"2"}],correctOptionId:"b"},
  {id:"q2",ageGroup:"4-6",question:"2+1?",options:[{id:"a",text:"2"},{id:"b",text:"3"}],correctOptionId:"b"},
  {id:"q3",ageGroup:"4-6",question:"3+1?",options:[{id:"a",text:"3"},{id:"b",text:"4"}],correctOptionId:"b"}
];
const s = PINDASQuizRandomizer.createSession(bank, "4-6", 3);
console.assert(s.questionIds.length === 3, "3 soalan dipilih");
console.assert(new Set(s.questionIds).size === 3, "tiada soalan berulang");
while (!PINDASQuizRandomizer.isFinished(s)) {
  const q = PINDASQuizRandomizer.currentQuestion(s);
  console.assert(q.options.some(o => o.id === q.correctOptionId), "jawapan betul kekal dipetakan");
  PINDASQuizRandomizer.markAnswered(s, q.id);
}
console.log("Ujian asas modul lulus.");
