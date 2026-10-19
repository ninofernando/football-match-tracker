const KEY='jogo60-v1', DUR=3600000;
const BALL='<img src="icons/football-line.svg" alt="" width="18" height="18">';
const BOOT='<img src="icons/shoe-cleats.svg" alt="" width="18" height="18">';
const def=()=>({phase:'setup',teams:['Equipa A','Equipa B'],players:Array.from({length:10},(_,i)=>({id:i+1,name:'',team:i<5?'A':'B'})),events:[],elapsed:0,running:false,started:false,startedAt:0,nid:1});
let S;
try{S=JSON.parse(localStorage.getItem(KEY))||def()}catch(e){S=def()}
if(S.started===undefined)S.started=!!(S.elapsed>0||S.running);
let showLog=false, confirmReset=false, logTimer=null, confirmEnd=false, endTimer=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cur=()=>Math.min(DUR,S.elapsed+(S.running?Date.now()-S.startedAt:0));
const fmt=ms=>{const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const pname=p=>p.name.trim()||('Jogador '+p.id);
const cnt=(pid,t)=>S.events.filter(e=>e.pid===pid&&e.type===t).length;
const goals=t=>S.events.filter(e=>e.type==='g'&&S.players.find(p=>p.id===e.pid)?.team===t).length;

function setup(){
  const tn=S.teams;
  document.getElementById('app').innerHTML=`<div class="setup">
  <h1>Novo jogo</h1><p class="sub">60 minutos, 10 jogadores. Escreve os nomes e escolhe a equipa de cada um.</p>
  <div class="teams">
    <input type="text" id="tA" value="${esc(tn[0])}" aria-label="Nome da equipa A" maxlength="20">
    <input type="text" id="tB" value="${esc(tn[1])}" aria-label="Nome da equipa B" maxlength="20">
  </div>
  <div class="plist">${S.players.map(p=>`<div class="row">
    <input type="text" data-id="${p.id}" value="${esc(p.name)}" placeholder="Jogador ${p.id}" maxlength="22">
    <div class="seg"><button class="A ${p.team==='A'?'on':''}" onclick="setTeam(${p.id},'A')">A</button><button class="B ${p.team==='B'?'on':''}" onclick="setTeam(${p.id},'B')">B</button></div>
  </div>`).join('')}</div>
  <div class="row"><button class="btn main" onclick="startGame()">${S.started?'Voltar ao jogo':'Começar o jogo'}</button></div>
  </div>`;
}
function readSetup(){
  const a=document.getElementById('tA'),b=document.getElementById('tB');
  if(a)S.teams=[a.value.trim()||'Equipa A',b.value.trim()||'Equipa B'];
  document.querySelectorAll('input[data-id]').forEach(i=>{S.players.find(p=>p.id==i.dataset.id).name=i.value});
}
function setTeam(id,t){readSetup();S.players.find(p=>p.id===id).team=t;save();setup()}
function startGame(){readSetup();S.phase='game';autoStart();save();render()}

function col(t){
  const L=t==='A'?0:1;
  return `<div class="${t}"><h2>${esc(S.teams[L])}</h2>${S.players.filter(p=>p.team===t).map(p=>{
    const g=cnt(p.id,'g'),a=cnt(p.id,'a');
    return `<div class="pl"><span class="nm">${esc(pname(p))}</span>
    <button class="act ${g?'on':''}" onclick="add(${p.id},'g')" aria-label="Golo de ${esc(pname(p))}">${BALL}<span>${g}</span></button>
    <button class="act ${a?'on':''}" onclick="add(${p.id},'a')" aria-label="Assistência de ${esc(pname(p))}">${BOOT}<span>${a}</span></button></div>`}).join('')||'<p class="mut">Sem jogadores.</p>'}</div>`;
}
function game(){
  const c=cur(), end=c>=DUR;
  const status=end?'Fim do jogo':(S.running?'Tempo a decorrer':'Tempo parado');
  document.getElementById('app').innerHTML=`
  <div class="top">
    <div class="clock ${!end&&!S.running?'paused':''}"><span id="clk">${fmt(c)}</span><small id="st">${status}</small></div>
    <div class="row" style="flex-wrap:wrap">
      ${end
        ?`<button class="btn main" onclick="showFinal()">Ver resultado</button>`
        :`<button class="btn main" onclick="togglePause()">${S.running?'Parar tempo':'Retomar'}</button>
      <button class="btn warn" onclick="endGame()">${confirmEnd?'Confirmar: terminar':'Terminar'}</button>`}
      <button class="btn" onclick="toggleLog()">Refazer</button>
      <button class="btn" onclick="S.phase='setup';save();render()">Jogadores</button>
    </div>
  </div>
  <div class="card score">
    <div><div class="tn A" style="color:var(--a)">${esc(S.teams[0])}</div><div class="n A">${goals('A')}</div></div>
    <div class="x">–</div>
    <div><div class="tn" style="color:var(--b)">${esc(S.teams[1])}</div><div class="n B">${goals('B')}</div></div>
  </div>
  <div class="cols">${col('A')}${col('B')}</div>
  ${showLog?logHtml():''}`;
}

function frow(p){
  const g=cnt(p.id,'g'),a=cnt(p.id,'a');
  return `<div class="fr ${g||a?'':'zero'}"><span class="nm">${esc(pname(p))}</span>
  <span class="st" title="Golos">${BALL}${g}</span><span class="st" title="Assistências">${BOOT}${a}</span></div>`;
}

function fcol(t){
  const L=t==='A'?0:1;
  const ps=S.players.filter(p=>p.team===t).sort((x,y)=>(cnt(y.id,'g')-cnt(x.id,'g'))||(cnt(y.id,'a')-cnt(x.id,'a')));
  return `<div class="${t}"><h2>${esc(S.teams[L])}</h2>${ps.map(frow).join('')||'<p class="mut">Sem jogadores.</p>'}</div>`;
}
function final(){
  const ga=goals('A'), gb=goals('B'), c=cur(), full=c>=DUR;
  const res=ga===gb?'Empate':'Vitória de '+esc(S.teams[ga>gb?0:1]);
  const rc=ga===gb?'':(ga>gb?'A':'B');
  document.getElementById('app').innerHTML=`<div class="final">
  <h1>Resultado final</h1>
  <p class="sub">${full?'Jogo completo · 60:00':'Jogo terminado aos '+fmt(c)}</p>
  <div class="card score">
    <div><div class="tn" style="color:var(--a)">${esc(S.teams[0])}</div><div class="n A">${ga}</div></div>
    <div class="x">–</div>
    <div><div class="tn" style="color:var(--b)">${esc(S.teams[1])}</div><div class="n B">${gb}</div></div>
  </div>
  <p class="verdict ${rc}">${res}</p>
  <div class="cols">${fcol('A')}${fcol('B')}</div>
  <div class="row fbtns">
    <button class="btn" onclick="backToGame()">${full?'Ver jogo':'Voltar ao jogo'}</button>
    <button class="btn warn" onclick="resetAll()">${confirmReset?'Confirmar: apagar tudo':'Novo jogo'}</button>
  </div>
  </div>`;
}
function logHtml(){
  const ev=[...S.events].reverse();
  return `<div class="card log"><div class="top" style="margin:0 0 6px"><b style="font-size:18px">Refazer registos</b>
  <div class="row"><button class="btn" onclick="undoLast()" ${ev.length?'':'disabled'}>Anular o último</button>
  <button class="btn warn" onclick="resetAll()">${confirmReset?'Confirmar: apagar tudo':'Novo jogo'}</button></div></div>
  ${ev.length?ev.map(e=>{const p=S.players.find(x=>x.id===e.pid);return `<div class="ev"><span class="m">${e.min}’</span>
  <span class="t">${e.type==='g'?'Golo':'Assistência'} · ${esc(pname(p))} <span class="mut">(${esc(S.teams[p.team==='A'?0:1])})</span></span>
  <button class="x" onclick="del(${e.id})" aria-label="Apagar registo">✕</button></div>`}).join(''):'<p class="mut">Ainda não há registos. Toca na bola ou na chuteira de um jogador.</p>'}</div>`;
}
function add(pid,type){
  S.events.push({id:S.nid++,pid,type,min:Math.min(60,Math.floor(cur()/60000)+1)});
  confirmReset=false;showLog=false;clearTimeout(logTimer);save();render();
}
function del(id){armLog();S.events=S.events.filter(e=>e.id!==id);save();render()}
function undoLast(){armLog();S.events.pop();save();render()}
function resetAll(){
  armLog();
  if(!confirmReset){confirmReset=true;render();return}
  const keep={teams:S.teams,players:S.players};
  S=Object.assign(def(),keep,{phase:'setup'});confirmReset=false;showLog=false;save();render();
}
function autoStart(){if(S.phase==='game'&&!S.started&&!S.running&&S.elapsed<DUR){S.started=true;S.running=true;S.startedAt=Date.now()}}
function togglePause(){
  if(cur()>=DUR)return;
  if(S.running){S.elapsed=cur();S.running=false}
  else{S.running=true;S.startedAt=Date.now()}
  save();render();
}
function finish(){
  S.elapsed=cur();S.running=false;S.phase='final';
  showLog=false;confirmReset=false;confirmEnd=false;clearTimeout(endTimer);clearTimeout(logTimer);
  save();render();
}
function endGame(){
  if(!confirmEnd){
    confirmEnd=true;clearTimeout(endTimer);
    endTimer=setTimeout(()=>{confirmEnd=false;if(S.phase==='game')render()},4000);
    render();return;
  }
  finish();
}
function showFinal(){S.phase='final';showLog=false;confirmReset=false;save();render()}
function backToGame(){S.phase='game';confirmReset=false;save();render()}
function toggleLog(){showLog=!showLog;confirmReset=false;armLog();render()}
function armLog(){clearTimeout(logTimer);if(showLog)logTimer=setTimeout(()=>{showLog=false;confirmReset=false;render()},8000)}
function render(){S.phase==='setup'?setup():S.phase==='final'?final():game()}
setInterval(()=>{
  if(S.phase!=='game')return;
  const c=cur();
  if(S.running&&c>=DUR){S.elapsed=DUR;S.running=false;S.phase='final';showLog=false;confirmReset=false;confirmEnd=false;save();render();return}
  const el=document.getElementById('clk');if(el)el.textContent=fmt(c);
},250);
autoStart();save();render();
