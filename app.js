(() => {
"use strict";
const $=id=>document.getElementById(id);
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".nav,.panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active");}));
/* PINDAS: no-repeat bag per age+subject, reshuffled only after exhaustion. */
let bag=[], current=null, score=0, answered=0, locked=false;
const key=()=>`pindas:v2:${$("age").value}:${$("subject").value}`;
function loadBag(){try{return JSON.parse(localStorage.getItem(key())||"[]")}catch{return []}}
function saveBag(){localStorage.setItem(key(),JSON.stringify(bag))}
function pool(){return (window.PINDAS_QUESTIONS||[]).filter(q=>q.age===$("age").value&&($("subject").value==="campur"||q.subject===$("subject").value))}
function updateStats(){$("score").textContent=score;$("answered").textContent=answered;$("remaining").textContent=bag.length}
function nextQuestion(){
 locked=false; let all=pool(); if(!all.length){$("quiz").innerHTML='<p>Bank soalan untuk pilihan ini belum tersedia.</p>';return}
 if(!bag.length){bag=all.map(q=>q.id);for(let i=bag.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}saveBag();}
 let id=bag.pop();saveBag();current=all.find(q=>q.id===id);
 $("quiz").innerHTML=`<p class="eyebrow">${current.subject.toUpperCase()} · ${current.age} TAHUN</p><p class="question">${current.question}</p><div class="answers">${current.options.map((o,i)=>`<button class="answer" data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div>`;
 document.querySelectorAll(".answer").forEach((b,i)=>b.addEventListener("click",()=>checkAnswer(current.options[i],b)));
 updateStats();
}
function checkAnswer(choice,button){if(locked)return;locked=true;let ok=choice===current.answer;if(ok){score+=10;$("quizFeedback").textContent="Betul! +10 mata."}else{$("quizFeedback").textContent=`Belum tepat. Jawapan: ${current.answer}.`}if(!ok)button.style.borderColor="#fb7185";document.querySelectorAll(".answer").forEach(b=>{b.disabled=true;if(b.textContent.endsWith(current.answer))b.style.borderColor="#4ade80"});answered++;updateStats();}
$("startQuiz").addEventListener("click",()=>{if(!current||locked)nextQuestion();else $("quizFeedback").textContent="Pilih satu jawapan dahulu."});
$("resetQuiz").addEventListener("click",()=>{bag=[];saveBag();score=0;answered=0;current=null;$("quizFeedback").textContent="Sesi diset semula. Soalan akan dikocok semula.";updateStats();$("quiz").innerHTML='<p class="muted">Tekan Mula / Soalan seterusnya.</p>';});
["age","subject"].forEach(id=>$(id).addEventListener("change",()=>{bag=loadBag();current=null;$("quiz").innerHTML='<p class="muted">Pilihan berubah. Tekan mula untuk soalan baharu.</p>';updateStats();}));
bag=loadBag();updateStats();

/* PIYDEN canvas game: visible objects are drawn every animation frame. */
const canvas=$("gameCanvas"),ctx=canvas.getContext("2d");let running=false,remaining=45,gscore=0,combo=0,last=0,player={x:360,y:210,r:13},orbs=[],keys={};
function spawn(){const types=[{c:"#38bdf8",v:10,r:10},{c:"#fb7185",v:-15,r:11},{c:"#facc15",v:50,r:13}];let t=types[Math.floor(Math.random()*types.length)];return{x:25+Math.random()*670,y:25+Math.random()*370,...t}}
function draw(){ctx.clearRect(0,0,720,420);ctx.fillStyle="#0a1730";ctx.fillRect(0,0,720,420);ctx.strokeStyle="#142b4a";for(let x=0;x<720;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,420);ctx.stroke()}for(let y=0;y<420;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(720,y);ctx.stroke()}
orbs.forEach(o=>{ctx.shadowBlur=18;ctx.shadowColor=o.c;ctx.fillStyle=o.c;ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});ctx.fillStyle="#fff";ctx.shadowBlur=16;ctx.shadowColor="#fff";ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0; if(!running){ctx.fillStyle="#dceaff";ctx.font="bold 23px system-ui";ctx.textAlign="center";ctx.fillText("NEON RUSH",360,195);ctx.font="14px system-ui";ctx.fillText("Tekan Mula permainan",360,222)}}
function update(ts){if(!running){draw();return}let dt=Math.min((ts-last)/16,2);last=ts;if(keys.left||keys.a)player.x-=4*dt;if(keys.right||keys.d)player.x+=4*dt;if(keys.up||keys.w)player.y-=4*dt;if(keys.down||keys.s)player.y+=4*dt;player.x=Math.max(14,Math.min(706,player.x));player.y=Math.max(14,Math.min(406,player.y));
if(Math.random()<.035&&orbs.length<9)orbs.push(spawn());orbs=orbs.filter(o=>{if(Math.hypot(o.x-player.x,o.y-player.y)<o.r+player.r){gscore+=o.v;combo=o.v>0?combo+1:0;$("gameScore").textContent=gscore;$("combo").textContent=combo;return false}return true});draw();requestAnimationFrame(update)}
function startGame(){running=true;remaining=45;gscore=0;combo=0;orbs=[spawn(),spawn(),spawn(),spawn()];player={x:360,y:210,r:13};$("time").textContent=45;$("gameScore").textContent=0;$("combo").textContent=0;$("gameMsg").textContent="Mula! Kumpul orb.";last=performance.now();requestAnimationFrame(update);clearInterval(window.piydenTimer);window.piydenTimer=setInterval(()=>{remaining--;$("time").textContent=remaining;if(remaining<=0){running=false;clearInterval(window.piydenTimer);$("gameMsg").textContent=`Tamat! Skor akhir: ${gscore}. Tekan mula untuk bermain lagi.`;draw()}},1000)}
$("gameStart").addEventListener("click",startGame);
window.addEventListener("keydown",e=>{let k=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();keys[k.replace("arrow","")]=true});
window.addEventListener("keyup",e=>{let k=e.key.toLowerCase();keys[k.replace("arrow","")]=false});
document.querySelectorAll("[data-dir]").forEach(b=>{let d=b.dataset.dir;const on=e=>{e.preventDefault();keys[d]=true},off=e=>{e.preventDefault();keys[d]=false};b.addEventListener("pointerdown",on);["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,off));});
draw();

/* AFIDAN: offline-safe deterministic helper, optional secure online API endpoint. */
let moduleName="assistant";document.querySelectorAll(".module").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".module").forEach(x=>x.classList.remove("active"));b.classList.add("active");moduleName=b.dataset.module;}));
function offlineDraft(prompt,mod){const p=prompt.trim();if(!p)return "Sila masukkan permintaan dahulu.";const title={assistant:"Draf bantuan",agent:"Pelan tindakan",video:"Rangka video",robotics:"Idea robotik",home:"Cadangan rumah pintar",security:"Semakan keselamatan",shopping:"Panduan perbandingan"}[mod]||"Bantuan";return `${title} — MOD ASAS OFFLINE\n\nPermintaan: ${p}\n\nCadangan:\n1. Tetapkan hasil akhir yang anda mahu.\n2. Senaraikan maklumat atau bahan yang diperlukan.\n3. Pecahkan kerja kepada langkah kecil.\n4. Semak ketepatan, keselamatan dan kesesuaian sebelum digunakan.\n\nNota: Ini ialah rangka bantuan luar talian, bukan jawapan AI generatif atau fakta yang telah disahkan.`}
async function generate(){const prompt=$("request").value.trim();if(!prompt){$("aiOutput").textContent="Sila masukkan permintaan dahulu.";return}const btn=$("generate");btn.disabled=true;btn.textContent="Sedang menyediakan…";$("aiOutput").textContent="Sedang memproses…";
try{const r=await fetch("/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,module:moduleName})});if(r.ok){const data=await r.json();if(data.answer){$("aiOutput").textContent=data.answer;$("aiStatus").textContent="ONLINE";return}}throw new Error("online unavailable")}catch(e){$("aiOutput").textContent=offlineDraft(prompt,moduleName);$("aiStatus").textContent="ASAS · OFFLINE"}finally{btn.disabled=false;btn.textContent="Jana bantuan"}}
$("generate").addEventListener("click",generate);$("clearAI").addEventListener("click",()=>{$("request").value="";$("aiOutput").textContent="Masukkan permintaan dan tekan “Jana bantuan”."});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();