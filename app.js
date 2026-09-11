const $=id=>document.getElementById(id);
const usersKey='studyCornerUsersV1';
let currentUser=null;
let timerSeconds=1500,timerRunning=false,timerInterval=null;
const banks={
 'Algebra':[['Solve 3x + 7 = 22.','3x = 15\nx = 5'],['Expand 4(x + 3).','4x + 12'],['Factorise x² + 5x.','x(x + 5)']],
 'Fractions':[['Simplify 18/24.','3/4'],['Calculate 2/3 + 1/6.','5/6'],['Find 3/5 of 40.','24']],
 'Percentages':[['Find 15% of 200.','30'],['A price rises from $80 to $100. Find the percentage increase.','25%'],['Decrease 500 by 10%.','450']],
 'Geometry':[['Find the area of a triangle with base 8 cm and height 5 cm.','20 cm²'],['Angles on a straight line add to?','180°'],['Find the circumference of a circle of radius 7 cm using π = 22/7.','44 cm']]
};
let qTopic='Algebra',qIndex=0;
function users(){try{return JSON.parse(localStorage.getItem(usersKey)||'{}')}catch{return{}}}
function saveUsers(o){localStorage.setItem(usersKey,JSON.stringify(o))}
function hashPin(pin){let h=2166136261;for(const c of pin){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function userKey(){return 'studyCorner:'+currentUser.toLowerCase()}
function data(){try{return JSON.parse(localStorage.getItem(userKey())||'{}')}catch{return{}}}
function saveData(d){localStorage.setItem(userKey(),JSON.stringify(d))}
function ensureData(){const d=data();d.theme ||= 'pinkblue';d.plans ||= [];d.notes ||= [];d.work ||= [];d.practice ||= {right:0,wrong:0};saveData(d);return d}
function showAuth(){currentUser=null;$('app').classList.add('hidden');$('authScreen').classList.remove('hidden')}
function enterApp(name){currentUser=name;const d=ensureData();document.body.dataset.theme=d.theme;$('authScreen').classList.add('hidden');$('app').classList.remove('hidden');$('helloUser').textContent='Hi, '+name+' 👋';go('home');renderAll()}
$('loginTab').onclick=()=>toggleAuth('login');$('signupTab').onclick=()=>toggleAuth('signup');
function toggleAuth(which){$('loginTab').classList.toggle('active',which==='login');$('signupTab').classList.toggle('active',which==='signup');$('loginPane').classList.toggle('active',which==='login');$('signupPane').classList.toggle('active',which==='signup');$('authMessage').textContent=''}
$('signupBtn').onclick=()=>{const n=$('signupName').value.trim(),p=$('signupPin').value.trim();if(n.length<2)return msg('Username must be at least 2 characters.');if(!/^\d{4,8}$/.test(p))return msg('PIN must be 4–8 digits.');const u=users(),k=n.toLowerCase();if(u[k])return msg('That username already exists on this browser.');u[k]={name:n,pin:hashPin(p)};saveUsers(u);currentUser=n;ensureData();enterApp(n)};
$('loginBtn').onclick=()=>{const n=$('loginName').value.trim(),p=$('loginPin').value.trim(),u=users()[n.toLowerCase()];if(!u||u.pin!==hashPin(p))return msg('Username or PIN is incorrect.');enterApp(u.name)};
function msg(t){$('authMessage').textContent=t}
$('logoutBtn').onclick=showAuth;
function go(name){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$('view-'+name).classList.add('active');document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===name));if(name==='progress')renderProgress()}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));document.querySelectorAll('.back-btn').forEach(b=>b.onclick=()=>go('home'));
$('themeBtn').onclick=()=>$('themeModal').classList.remove('hidden');$('closeTheme').onclick=()=>$('themeModal').classList.add('hidden');$('themeModal').onclick=e=>{if(e.target===$('themeModal'))$('themeModal').classList.add('hidden')};document.querySelectorAll('.theme-option').forEach(b=>b.onclick=()=>{const d=ensureData();d.theme=b.dataset.theme;saveData(d);document.body.dataset.theme=d.theme;$('themeModal').classList.add('hidden')});
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function card(title,body,meta,id,type,badge=''){return `<div class="item-card"><button class="delete-btn" data-del="${type}" data-id="${id}">×</button><h3>${esc(title)} ${badge?`<span class="badge">${esc(badge)}</span>`:''}</h3><div class="item-meta">${esc(meta||'')}</div><p>${esc(body||'')}</p></div>`}
function bindDeletes(){document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const d=ensureData(),arr=d[b.dataset.del];d[b.dataset.del]=arr.filter(x=>x.id!==b.dataset.id);saveData(d);renderAll()})}
$('addPlan').onclick=()=>{const topic=$('planTopic').value.trim(),task=$('planTask').value.trim();if(!topic||!task)return;const d=ensureData();d.plans.unshift({id:crypto.randomUUID(),date:$('planDate').value,topic,task});saveData(d);$('planTopic').value='';$('planTask').value='';renderPlans()};
$('addNote').onclick=()=>{const title=$('noteTitle').value.trim(),body=$('noteBody').value.trim();if(!title||!body)return;const d=ensureData();d.notes.unshift({id:crypto.randomUUID(),title,body,created:new Date().toLocaleDateString()});saveData(d);$('noteTitle').value='';$('noteBody').value='';renderNotes()};
$('addWork').onclick=()=>{const topic=$('workTopic').value.trim(),details=$('workDetails').value.trim();if(!topic||!details)return;const d=ensureData();d.work.unshift({id:crypto.randomUUID(),date:$('workDate').value,topic,details,status:$('workStatus').value});saveData(d);$('workTopic').value='';$('workDetails').value='';renderWork()};
function renderPlans(){const d=ensureData();$('planList').innerHTML=d.plans.length?d.plans.map(x=>card(x.topic,x.task,x.date||'No date',x.id,'plans')).join(''):'<div class="panel muted">No study tasks yet.</div>';bindDeletes()}
function renderNotes(){const d=ensureData();$('notesList').innerHTML=d.notes.length?d.notes.map(x=>card(x.title,x.body,x.created,x.id,'notes')).join(''):'<div class="panel muted">No notes yet.</div>';bindDeletes()}
function renderWork(){const d=ensureData(),labels={done:'Completed',review:'Needs review',hard:'Found difficult'};$('workList').innerHTML=d.work.length?d.work.map(x=>card(x.topic,x.details,x.date||'No date',x.id,'work',labels[x.status])).join(''):'<div class="panel muted">No work entries yet.</div>';bindDeletes()}
function initQuestions(){const s=$('questionTopic');s.innerHTML=Object.keys(banks).map(k=>`<option>${k}</option>`).join('');s.onchange=()=>{qTopic=s.value;qIndex=0;renderQuestion()};renderQuestion()}
function renderQuestion(){const q=banks[qTopic][qIndex];$('questionText').textContent=q[0];$('answerText').textContent=q[1];$('answerText').classList.add('hidden');$('gradeRow').classList.add('hidden');$('showAnswer').classList.remove('hidden')}
$('showAnswer').onclick=()=>{$('answerText').classList.remove('hidden');$('gradeRow').classList.remove('hidden');$('showAnswer').classList.add('hidden')};function grade(correct){const d=ensureData();d.practice[correct?'right':'wrong']++;saveData(d);qIndex=(qIndex+1)%banks[qTopic].length;renderQuestion()}$('rightBtn').onclick=()=>grade(true);$('wrongBtn').onclick=()=>grade(false);
function renderProgress(){const d=ensureData();$('statPlans').textContent=d.plans.length;$('statNotes').textContent=d.notes.length;$('statWork').textContent=d.work.length;$('statCorrect').textContent=d.practice.right;const total=d.practice.right+d.practice.wrong,p=total?Math.round(d.practice.right/total*100):0;$('accuracyBar').style.width=p+'%';$('accuracyLabel').textContent=total?`${p}% accuracy from ${total} attempt${total===1?'':'s'}.`:'No practice attempts yet.'}
function renderAll(){renderPlans();renderNotes();renderWork();renderProgress()}
function timerRender(){const m=String(Math.floor(timerSeconds/60)).padStart(2,'0'),s=String(timerSeconds%60).padStart(2,'0');$('timerDisplay').textContent=m+':'+s}$('timerToggle').onclick=()=>{timerRunning=!timerRunning;$('timerToggle').textContent=timerRunning?'Pause':'Start';if(timerRunning)timerInterval=setInterval(()=>{timerSeconds--;if(timerSeconds<=0){clearInterval(timerInterval);timerRunning=false;timerSeconds=1500;$('timerToggle').textContent='Start';alert('Focus session complete!');}timerRender()},1000);else clearInterval(timerInterval)};$('timerReset').onclick=()=>{clearInterval(timerInterval);timerRunning=false;timerSeconds=1500;$('timerToggle').textContent='Start';timerRender()};
const today=new Date().toISOString().slice(0,10);$('planDate').value=today;$('workDate').value=today;initQuestions();timerRender();showAuth();

// Public study upgrades are kept separate so the base app stays easy to maintain.
const upgradeCss=document.createElement('link');upgradeCss.rel='stylesheet';upgradeCss.href='public-upgrades.css?v=1';document.head.appendChild(upgradeCss);
const upgradeScript=document.createElement('script');upgradeScript.src='public-upgrades.js?v=1';document.body.appendChild(upgradeScript);