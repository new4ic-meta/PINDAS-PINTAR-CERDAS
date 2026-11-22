(() => {
"use strict";
const $ = id => document.getElementById(id);
const DATA = window.PINDAS_DATA || {};
let age = "4-6", subject = "Asas Nombor", deck = [], index = 0, answered = 0, locked = false;
const usedByRound = new Set();
const progressKey = "pindasCombinedProgressV1";

function shuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function subjects(){return Object.keys(DATA[age] || {});}
function renderSubjects(){
  $("subjectChoices").innerHTML="";
  subjects().forEach(s=>{const b=document.createElement("button");b.className="subject"+(s===subject?" selected":"");b.textContent=s;b.addEventListener("click",()=>{subject=s;renderSubjects();startQuiz();});$("subjectChoices").appendChild(b);});
}
function startQuiz(){
  const bank=(DATA[age]||{})[subject]||[];
  deck=shuffle(bank.map((q,i)=>({...q,_id:age+"|"+subject+"|"+i})));
  index=0;answered=0;locked=false;usedByRound.clear();
  showQuestion();
}
function showQuestion(){
  const q=deck[index];
  if(!q){$("questionText").textContent="Tiada soalan tersedia untuk pilihan ini.";return;}
  $("quizSubject").textContent=subject;
  $("questionCount").textContent=`Soalan ${index+1} / ${deck.length}`;
  $("questionText").textContent=q.q;
  $("quizFeedback").textContent="";
  $("nextQuestion").disabled=true;
  $("answerChoices").innerHTML="";
  q.a.forEach((label,i)=>{const b=document.createElement("button");b.className="answer";b.textContent=label;b.addEventListener("click",()=>chooseAnswer(i));$("answerChoices").appendChild(b);});
  $("progressText").textContent=`Kemajuan sesi: ${answered} dijawab`;
  $("progressFill").style.width=(deck.length?answered/deck.length*100:0)+"%";
}
function chooseAnswer(choice){
  if(locked)return;locked=true;answered++;
  const q=deck[index], buttons=[...$("answerChoices").children];
  buttons.forEach((b,i)=>{b.disabled=true;if(i===q.c)b.classList.add("correct");else if(i===choice)b.classList.add("wrong");});
  $("quizFeedback").textContent=choice===q.c?"Betul! Bagus, teruskan.":"Belum tepat. Jawapan yang betul ditandakan.";
  $("nextQuestion").disabled=false;
  $("progressText").textContent=`Kemajuan sesi: ${answered} dijawab`;
  $("progressFill").style.width=(answered/deck.length*100)+"%";
  try{localStorage.setItem(progressKey,JSON.stringify({age,subject,answered,total:deck.length,updated:new Date().toISOString()}));}catch(_){}
}
function nextQuestion(){
  if(!locked)return;
  if(index<deck.length-1){index++;locked=false;showQuestion();}
  else{$("questionText").textContent=`Selesai! Anda telah menjawab ${answered} soalan ${subject}.`; $("answerChoices").innerHTML="";$("quizFeedback").textContent="Tekan “Ulang bidang” untuk susunan soalan baharu."; $("nextQuestion").disabled=true;}
}
$("ageChoices").addEventListener("click",e=>{const b=e.target.closest("[data-age]");if(!b)return;age=b.dataset.age;[...$("ageChoices").children].forEach(x=>x.classList.toggle("selected",x===b));subject=subjects()[0];renderSubjects();startQuiz();});
$("nextQuestion").addEventListener("click",nextQuestion);
$("restartQuiz").addEventListener("click",startQuiz);
renderSubjects();startQuiz();

// Main navigation
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+b.dataset.page));}));

// PIYDEN NEON RUSH
let score=0,best=0,combo=3,timeLeft=45,running=false,soundOn=true,spawnTimer=null,clockTimer=null,audio=null;
const area=$("gameArea");
try{best=Number(localStorage.getItem("piydenArcadeV2Best"))||0;}catch(_){}
$("gameBest").textContent=best;
function updateGame(){ $("gameScore").textContent=score;$("gameTime").textContent=timeLeft;$("gameCombo").textContent="x"+combo;$("gameBest").textContent=best;}
function tone(freq=520){if(!soundOn)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;g.gain.value=.035;o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.08);}catch(_){}}
function clearOrbs(){area.querySelectorAll(".orb").forEach(x=>x.remove());}
function stopGame(message){running=false;clearInterval(spawnTimer);clearInterval(clockTimer);clearOrbs();$("gameOverlay").hidden=false;$("gameOverlayTitle").textContent="TAMAT!";$("gameOverlayText").textContent=message||`Skor anda: ${score}`;$("gameStart").textContent="MAIN LAGI";if(score>best){best=score;try{localStorage.setItem("piydenArcadeV2Best",String(best));}catch(_){}}updateGame();}
function spawnOrb(){
  if(!running)return;
  const r=Math.random(),type=r<.64?"blue":r<.88?"red":"gold",orb=document.createElement("button");
  orb.type="button";orb.className="orb "+type;orb.setAttribute("aria-label",type==="blue"?"Orb biru tambah sepuluh":type==="red"?"Orb merah tolak lima belas":"Orb emas tambah lima puluh");
  const size=46,rect=area.getBoundingClientRect();orb.style.left=Math.max(0,Math.random()*(rect.width-size))+"px";orb.style.top=Math.max(0,Math.random()*(rect.height-size))+"px";
  orb.addEventListener("pointerdown",e=>{e.preventDefault();if(!running)return;const points=type==="blue"?10:type==="red"?-15:50;score=Math.max(0,score+points*combo);combo=type==="red"?1:Math.min(12,combo+1);tone(type==="gold"?880:type==="red"?180:520);orb.remove();updateGame();});
  area.appendChild(orb);setTimeout(()=>orb.remove(),1100);
}
function startGame(){clearInterval(spawnTimer);clearInterval(clockTimer);clearOrbs();score=0;combo=3;timeLeft=45;running=true;$("gameOverlay").hidden=true;updateGame();spawnTimer=setInterval(spawnOrb,720);clockTimer=setInterval(()=>{timeLeft--;updateGame();if(timeLeft<=0)stopGame(`Masa tamat. Skor akhir: ${score}`);},1000);}
$("gameStart").addEventListener("click",startGame);$("gameRestart").addEventListener("click",startGame);
$("soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("soundToggle").textContent=soundOn?"🔊 Bunyi: ON":"🔇 Bunyi: OFF";if(soundOn)tone();});

// AFIDAN local helper tools
const toolInfo={
 assistant:["AI Assistant","Tulis soalan atau perkara yang mahu difahami. AFIDAN akan susun permintaan menjadi langkah yang lebih jelas."],
 writer:["Penulis Kandungan","Masukkan topik, tujuan dan pembaca sasaran. AFIDAN menyediakan rangka penulisan."],
 video:["AI Video Planner","Masukkan tajuk video. AFIDAN membina rangka pembukaan, isi dan penutup."],
 robotics:["Robotics","Masukkan idea robotik. AFIDAN menyusun objektif, komponen umum dan langkah pembelajaran selamat."],
 home:["Smart Home","Masukkan ruang atau keperluan rumah. AFIDAN menyediakan senarai idea automasi dan pertimbangan privasi."],
 cyber:["Cybersecurity","Masukkan situasi digital. AFIDAN memberi peringatan keselamatan asas."],
 shopping:["Smart Shopping","Masukkan barang dan bajet. AFIDAN membina senarai perbandingan keperluan, harga dan ketahanan."]
};
let activeTool="assistant";
function selectTool(key){
  activeTool=key;$("afidanTitle").textContent=toolInfo[key][0];
  document.querySelectorAll(".tool-card").forEach(b=>b.classList.toggle("active",b.dataset.tool===key));
  $("afidanOutput").textContent=toolInfo[key][1];
}
$("afidanTools").addEventListener("click",e=>{const b=e.target.closest("[data-tool]");if(b)selectTool(b.dataset.tool);});
$("afidanRun").addEventListener("click",()=>{
  const input=$("afidanInput").value.trim();if(!input){$("afidanOutput").textContent="Sila masukkan idea atau arahan dahulu.";return;}
  const templates={
    assistant:`RINGKASAN PERMINTAAN\n${input}\n\nLANGKAH SETERUSNYA\n1. Nyatakan hasil yang anda mahu.\n2. Pecahkan tugasan kepada bahagian kecil.\n3. Semak fakta penting daripada sumber yang dipercayai.\n4. Nilai hasil sebelum digunakan.`,
    writer:`RANGKA KANDUNGAN\nTajuk: ${input}\n\n1. Pengenalan — terangkan topik dan sebab ia penting.\n2. Isi utama — huraikan 2 hingga 3 perkara penting.\n3. Contoh — berikan contoh yang tepat dan mudah difahami.\n4. Kesimpulan — rumuskan mesej utama.\n\nSemak fakta dan ubah suai mengikut pembaca sasaran.`,
    video:`RANGKA VIDEO PENDEK\nTopik: ${input}\n\n0–3 saat: Pembukaan yang menarik.\n4–12 saat: Terangkan masalah atau persoalan.\n13–25 saat: Berikan 2 atau 3 isi utama.\nAkhir: Rumusan dan ajakan yang sesuai.\n\nPastikan visual, muzik dan bahan yang digunakan mempunyai kebenaran penggunaan.`,
    robotics:`NOTA PEMBELAJARAN ROBOTIK\nIdea: ${input}\n\n• Objektif: Apakah tugas yang perlu dipelajari?\n• Konsep: Sensor, pengawal dan output.\n• Perancangan: Lukis aliran input → proses → output.\n• Ujian: Mulakan dengan simulasi atau kit pendidikan yang sesuai dan pengawasan orang dewasa.`,
    home:`IDEA RUMAH PINTAR\nKeperluan: ${input}\n\n• Kenal pasti masalah yang mahu diselesaikan.\n• Utamakan peranti yang mempunyai kemas kini keselamatan.\n• Gunakan kata laluan unik dan pengesahan berbilang faktor.\n• Semak privasi, kebenaran aplikasi dan keserasian sebelum membeli.`,
    cyber:`SENARAI SEMAK KESELAMATAN\nSituasi: ${input}\n\n• Jangan kongsi kata laluan, OTP atau kod pengesahan.\n• Semak alamat laman melalui saluran rasmi.\n• Berhati-hati dengan mesej yang mendesak atau menjanjikan ganjaran luar biasa.\n• Jika melibatkan akaun, hubungi penyedia melalui aplikasi atau nombor rasmi.`,
    shopping:`SENARAI PERBANDINGAN\nBarang/keperluan: ${input}\n\nBandingkan setiap pilihan berdasarkan:\n1. Harga keseluruhan dan kos penghantaran.\n2. Fungsi yang benar-benar diperlukan.\n3. Waranti dan sokongan selepas jualan.\n4. Ulasan yang boleh dipercayai.\n5. Polisi pemulangan dan keselamatan pembayaran.`
  };
  $("afidanOutput").textContent=templates[activeTool];
});
selectTool("assistant");

// PWA status + service worker
function networkLabel(){ $("networkStatus").textContent=navigator.onLine?"● Dalam talian":"● Mod luar talian"; }
window.addEventListener("online",networkLabel);window.addEventListener("offline",networkLabel);networkLabel();
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{$("networkStatus").textContent="● Cache offline belum tersedia";}));}
})();