(() => {
  const $=id=>document.getElementById(id);
  const DEFAULTS=[{id:'reward-game-100',name:'Buy a game',cost:100},{id:'reward-game-300',name:'Big game / special reward',cost:300}];
  const clone=x=>JSON.parse(JSON.stringify(x));
  function data(){
    if(!currentUser)return null;
    const d=ensureData();
    d.rewardSystem ||= {points:0,rewards:clone(DEFAULTS)};
    d.rewardSystem.points=Number.isFinite(+d.rewardSystem.points)?+d.rewardSystem.points:0;
    if(!Array.isArray(d.rewardSystem.rewards)||!d.rewardSystem.rewards.length)d.rewardSystem.rewards=clone(DEFAULTS);
    saveData(d); return d;
  }
  function state(){return data()?.rewardSystem||{points:0,rewards:clone(DEFAULTS)}}
  function saveState(s){const d=data();if(!d)return;d.rewardSystem=s;saveData(d)}
  function toast(text){let el=$('rewardToast');if(!el){el=document.createElement('div');el.id='rewardToast';el.className='reward-toast';document.body.appendChild(el)}el.textContent=text;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1600)}
  function award(amount=2){if(!currentUser)return;const s=state();s.points+=amount;saveState(s);renderAll();toast(`+${amount} points ✨`)}
  window.addStudyRewardPoints=award;
  function nearest(s){const list=[...s.rewards].filter(r=>+r.cost>0).sort((a,b)=>+a.cost-+b.cost);return list.find(r=>s.points<+r.cost)||list[list.length-1]||null}
  function info(s){const t=nearest(s);if(!t)return{target:null,pct:0,left:0};const cost=Math.max(1,+t.cost||1);return{target:t,pct:Math.min(100,Math.round(s.points/cost*100)),left:Math.max(0,cost-s.points)}}

  function showView(name){
    document.querySelectorAll('main>.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
    document.querySelectorAll('.public-plan2-tab').forEach(b=>b.classList.toggle('active',b.dataset.publicGo===name));
    if(name==='rewards')renderAll();
  }
  function mount(){
    const main=document.querySelector('main'),tabs=document.querySelector('.public-plan2-tabs');if(!main)return;
    if(!$('view-rewards')){
      const v=document.createElement('section');v.id='view-rewards';v.className='view';v.innerHTML=`<div class="section-head"><button class="back-btn">←</button><div><h2>🎁 Rewards & Points</h2><p>Turn studying into goals you actually want to reach.</p></div></div><div class="panel reward-panel"><div class="reward-title-row"><div><h3>Your points</h3><p>Every correct question and every flashcard you know earns <b>2 points</b>.</p></div><div class="reward-balance"><b id="rewardBalance">0</b><span>points</span></div></div><div class="reward-goal-card"><div class="reward-goal-top"><div><small>Next reward</small><b id="rewardNextName">Buy a game</b></div><strong id="rewardNextText">0 / 100</strong></div><div class="reward-bar"><i id="rewardBarFill"></i></div><p id="rewardGoalHelp" class="reward-help"></p></div></div><div class="panel reward-panel"><h3>Reward settings</h3><p class="reward-help">Make these yours. Change the name, change the points, or add another reward.</p><div id="rewardRows"></div><button class="secondary-btn" id="addRewardBtn">+ Add reward</button></div>`;main.appendChild(v);v.querySelector('.back-btn').onclick=()=>showView('dashboard');$('addRewardBtn').onclick=()=>{const s=state();s.rewards.push({id:crypto.randomUUID(),name:'New reward',cost:100});saveState(s);renderAll()};
    }
    if(tabs&&!tabs.querySelector('[data-public-go="rewards"]')){const b=document.createElement('button');b.className='public-plan2-tab';b.dataset.publicGo='rewards';b.textContent='Rewards';tabs.appendChild(b);b.onclick=()=>showView('rewards')}
    const dash=$('view-dashboard');if(dash&&!$('pubRewardWidget')){const box=document.createElement('div');box.className='panel dash-reward-widget';box.id='pubRewardWidget';box.innerHTML=`<div class="reward-dash-top"><div><small>Reward points</small><b><span id="dashRewardPoints">0</span> pts</b></div><button class="secondary-btn" id="openRewardsBtn">Rewards</button></div><div class="reward-bar"><i id="dashRewardBar"></i></div><div class="reward-dash-bottom" id="dashRewardText"></div>`;dash.querySelector('.public-dashboard')?.appendChild(box);$('openRewardsBtn').onclick=()=>showView('rewards')}
  }
  function renderRows(){const rows=$('rewardRows');if(!rows)return;const s=state();rows.innerHTML=s.rewards.map(r=>`<div class="reward-edit-row" data-id="${r.id}"><input class="reward-name-input" value="${String(r.name).replace(/"/g,'&quot;')}" aria-label="Reward name"><label><input class="reward-cost-input" type="number" min="1" step="1" value="${Math.max(1,+r.cost||1)}"> points</label><button class="reward-delete" title="Delete reward">×</button></div>`).join('');rows.querySelectorAll('.reward-edit-row').forEach(row=>{const id=row.dataset.id,name=row.querySelector('.reward-name-input'),cost=row.querySelector('.reward-cost-input');const persist=()=>{const s=state(),r=s.rewards.find(x=>x.id===id);if(!r)return;r.name=name.value.trim()||'Reward';r.cost=Math.max(1,Math.round(+cost.value||1));saveState(s);renderAll(false)};name.onchange=persist;cost.onchange=persist;row.querySelector('.reward-delete').onclick=()=>{const s=state();if(s.rewards.length<=1){toast('Keep at least one reward');return}s.rewards=s.rewards.filter(x=>x.id!==id);saveState(s);renderAll()}})}
  function renderAll(withRows=true){if(!currentUser)return;const s=state(),p=info(s);if($('rewardBalance'))$('rewardBalance').textContent=s.points;if($('dashRewardPoints'))$('dashRewardPoints').textContent=s.points;if(p.target){if($('rewardNextName'))$('rewardNextName').textContent=p.target.name;if($('rewardNextText'))$('rewardNextText').textContent=`${s.points} / ${p.target.cost}`;if($('rewardBarFill'))$('rewardBarFill').style.width=p.pct+'%';if($('rewardGoalHelp'))$('rewardGoalHelp').textContent=p.left?`${p.left} more points to reach this reward.`:`You reached this reward! 🎉`;if($('dashRewardBar'))$('dashRewardBar').style.width=p.pct+'%';if($('dashRewardText'))$('dashRewardText').textContent=p.left?`${p.left} points until ${p.target.name}`:`${p.target.name} reached! 🎉`}if(withRows)renderRows()}

  // Main Practice uses self-grading buttons.
  if(typeof grade==='function'){const oldGrade=grade;grade=function(correct){oldGrade(correct);if(correct)award(2)}}
  // Spaced repetition: Again = missed; Hard/Good/Easy = known.
  document.addEventListener('click',e=>{const b=e.target.closest?.('#view-flashcards [data-rate]');if(b&&b.dataset.rate&&b.dataset.rate!=='again')award(2)});
  function hook(btnId,feedbackId,qId){const b=$(btnId),f=$(feedbackId),q=$(qId);if(!b||!f||!q)return;let cycle=0,last=-1;new MutationObserver(()=>cycle++).observe(q,{childList:true,subtree:true,characterData:true});b.addEventListener('click',()=>setTimeout(()=>{const text=(f.textContent||'').trim().toLowerCase();if(last!==cycle&&(text.startsWith('✓ correct')||text.startsWith('correct'))){last=cycle;award(2)}},0))}
  hook('learnCheck','learnFeedback','learnPrompt');hook('testSubmit','testFeedback','testQuestion');

  mount();renderAll();
  const previousEnter=enterApp;enterApp=function(name){previousEnter(name);setTimeout(()=>{mount();renderAll()},0)};
})();