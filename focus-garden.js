(() => {
  const $=id=>document.getElementById(id);
  const plants={sunflower:{name:'Sunflower',full:'🌻',stages:['🟤','🌱','🌿','🌿🟢','🌻']},cactus:{name:'Cactus',full:'🌵',stages:['🟤','🌱','🌵','🌵🌵','🌵🌸']},flower:{name:'Cherry Blossom',full:'🌸',stages:['🟤','🌱','🌿','🌷','🌸']}};
  const fresh=()=>({active:'sunflower',minutes:0,garden:[],justCompleted:false});
  function state(){if(!currentUser)return fresh();const d=ensureData();d.gardenSystem=Object.assign(fresh(),d.gardenSystem||{});d.gardenSystem.garden=Array.isArray(d.gardenSystem.garden)?d.gardenSystem.garden:[];saveData(d);return d.gardenSystem}
  function saveState(s){if(!currentUser)return;const d=ensureData();d.gardenSystem=s;saveData(d)}
  function stage(min){return min>=120?5:min>=75?4:min>=50?3:min>=25?2:1}
  function wait(n=60){const view=$('view-timer');if(!view||!$('focusLength')){if(n)setTimeout(()=>wait(n-1),100);return}if($('publicPlantCard'))return;mount(view)}
  function mount(view){
    const card=document.createElement('div');card.id='publicPlantCard';card.className='panel plant-card';card.innerHTML=`<div class="plant-art" id="plantArt"></div><div class="plant-title" id="plantTitle"></div><div class="plant-minutes" id="plantMinutes"></div><div class="plant-progress"><i id="plantProgressFill"></i></div><div class="plant-stage" id="plantStage"></div><div class="plant-picker"><button class="plant-pick" data-plant="sunflower">🌻 Sunflower</button><button class="plant-pick" data-plant="cactus">🌵 Cactus</button><button class="plant-pick" data-plant="flower">🌸 Cherry Blossom</button></div><button class="secondary-btn garden-btn" id="gardenToggle">🌿 My Garden</button><div class="garden-panel" id="gardenPanel"><h3>My Garden</h3><div class="garden-grid" id="gardenGrid"></div></div>`;
    const sectionHead=view.querySelector('.section-head');sectionHead?.insertAdjacentElement('afterend',card);
    card.querySelectorAll('[data-plant]').forEach(b=>b.onclick=()=>choose(b.dataset.plant));$('gardenToggle').onclick=()=>{$('gardenPanel').classList.toggle('open');renderGarden()};
    watchTimer();render();
  }
  function choose(id){const s=state();if(s.minutes>0&&s.active!==id)return;s.active=id;s.justCompleted=false;saveState(s);render()}
  function render(){if(!$('plantArt')||!currentUser)return;const s=state(),p=plants[s.active]||plants.sunflower,st=stage(s.minutes);$('plantArt').textContent=p.stages[st-1];$('plantArt').className='plant-art stage-'+st;$('plantTitle').textContent=`Growing ${p.name} ${p.full}`;$('plantMinutes').textContent=`${Math.min(120,s.minutes)} / 120 minutes`;$('plantProgressFill').style.width=Math.min(100,s.minutes/120*100)+'%';$('plantStage').textContent=`Stage ${st} of 5${st===5?' · Fully grown':''}`;document.querySelectorAll('#publicPlantCard [data-plant]').forEach(b=>{b.classList.toggle('active',b.dataset.plant===s.active);b.disabled=s.minutes>0&&b.dataset.plant!==s.active});renderGarden()}
  function renderGarden(){if(!$('gardenGrid')||!currentUser)return;const s=state();$('gardenGrid').innerHTML=s.garden.length?s.garden.slice().reverse().map(x=>`<div class="garden-item"><span class="emoji">${plants[x.type]?.full||'🌿'}</span><b>${plants[x.type]?.name||'Plant'}</b><small>Completed ${new Date(x.completed).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small></div>`).join(''):'<div class="garden-empty">No fully grown plants yet. Finish 120 focus minutes to grow your first one 🌱</div>'}
  function celebratePlant(p){const layer=document.createElement('div');layer.className='focus-celebration';for(let i=0;i<18;i++){const e=document.createElement('span');e.className='focus-petal';e.textContent=i%2?'🌸':'✨';e.style.left=(Math.random()*100)+'vw';e.style.animationDelay=(Math.random()*.5)+'s';layer.appendChild(e)}document.body.appendChild(layer);setTimeout(()=>layer.remove(),2300);if(typeof notice==='function')notice(`Your ${p.name} is fully grown! ${p.full}`);else setTimeout(()=>alert(`Your ${p.name} is fully grown! ${p.full}`),0)}
  function addMinutes(min){if(!currentUser||!min||min<1)return;const s=state(),p=plants[s.active]||plants.sunflower;if(s.justCompleted)return;s.minutes=Math.min(120,s.minutes+min);if(s.minutes>=120){s.garden.push({id:crypto.randomUUID(),type:s.active,completed:new Date().toISOString()});s.justCompleted=true;saveState(s);render();celebratePlant(p);setTimeout(()=>{const latest=state();if(latest.justCompleted&&latest.minutes>=120){latest.minutes=0;latest.justCompleted=false;saveState(latest);render()}},1800)}else{saveState(s);render()}}
  function parseTimer(){const parts=($('timerDisplay')?.textContent||'').split(':').map(Number);return parts.length===2&&parts.every(Number.isFinite)?parts[0]*60+parts[1]:null}
  function watchTimer(){
    if(window.__publicGardenWatch)return;window.__publicGardenWatch=true;
    const toggle=$('timerToggle'),reset=$('timerReset'),display=$('timerDisplay');let active=false,prev=parseTimer(),sessionMinutes=+$('focusLength').value||25;
    toggle.addEventListener('click',()=>{if(toggle.textContent.trim()==='Start'){active=true;sessionMinutes=Math.max(1,+$('focusLength').value||25)}else if(toggle.textContent.trim()==='Pause'){active=false}},true);
    reset.addEventListener('click',()=>{active=false;prev=null},true);
    new MutationObserver(()=>{const cur=parseTimer();if(cur==null)return;const completed=active&&prev!=null&&prev<=1&&cur>=60&&toggle.textContent.trim()==='Start';if(completed){active=false;addMinutes(sessionMinutes)}prev=cur}).observe(display,{childList:true,subtree:true,characterData:true});
  }
  const prevEnter=typeof enterApp==='function'?enterApp:null;if(prevEnter){enterApp=function(name){prevEnter(name);setTimeout(render,0)}}
  window.addEventListener('storage',render);wait();
})();