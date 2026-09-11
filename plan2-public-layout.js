(() => {
  const $=id=>document.getElementById(id);
  const app=$('app'), main=document.querySelector('main');
  if(!app||!main||$('view-dashboard')) return;

  const tabs=document.createElement('div');
  tabs.className='public-plan2-tabs';
  const destinations=[
    ['dashboard','Dashboard'],['planner','Planner'],['notes','Notes'],['work','My Work'],['flashcards','Flashcards'],['questions','Practice'],['mistakes','Mistakes'],['learn','Learn'],['test','Test'],['aiguide','AI Input Guide'],['progress','Progress'],['timer','Timer'],['library','Library']
  ].filter(([id])=>id==='dashboard'||$('view-'+id));
  destinations.forEach(([id,label])=>{
    const b=document.createElement('button');
    b.className='public-plan2-tab';
    b.dataset.publicGo=id;
    b.textContent=label;
    tabs.appendChild(b);
  });
  app.insertBefore(tabs,main);

  const dash=document.createElement('section');
  dash.className='view';
  dash.id='view-dashboard';
  dash.innerHTML=`
  <div class="public-dashboard">
    <div class="panel public-dash-hero"><div><div class="public-dash-kicker">Your study corner</div><h1>What do you want to work on today? 🌸</h1><p>Everything important is one tap away. Review cards, practise, make notes, plan a session or create your own flashcards.</p></div><div class="public-dash-flower">🌷</div></div>
    <div class="public-dash-stats">
      <div class="public-dash-stat"><b id="pubDashCorrect">0</b><span>questions right ✨</span></div>
      <div class="public-dash-stat"><b id="pubDashCards">0</b><span>flashcards available 🧠</span></div>
      <div class="public-dash-stat"><b id="pubDashMistakes">0</b><span>mistakes to review 📕</span></div>
      <div class="public-dash-stat"><b id="pubDashPlans">0</b><span>study tasks 🗓️</span></div>
    </div>
    <div class="public-dash-grid">
      <div class="panel"><h2>Quick start</h2><div class="public-quick-grid">
        <button class="public-quick" data-quick="flashcards"><b>🧠 Review flashcards</b><small>Spaced repetition review</small></button>
        <button class="public-quick" data-quick="learn"><b>🎯 Learn mode</b><small>Adaptive active recall</small></button>
        <button class="public-quick" data-quick="test"><b>🧪 Take a test</b><small>Timed or untimed practice</small></button>
        <button class="public-quick" data-quick="questions"><b>✏️ Quick practice</b><small>Work through maths questions</small></button>
        <button class="public-quick" data-quick="notes"><b>📝 Write a note</b><small>Save your own study notes</small></button>
        <button class="public-quick" data-quick="aiguide"><b>✨ AI Input Guide</b><small>Turn AI notes into cards and notes</small></button>
        <button class="public-quick" data-quick="planner"><b>🗓️ Plan a session</b><small>Add a study task</small></button>
        <button class="public-quick" data-quick="library"><b>🗂️ Open library</b><small>Decks, folders and sharing</small></button>
        <button class="public-quick" data-quick="timer"><b>⏱️ Focus timer</b><small>Start a study session</small></button>
      </div></div>
      <div class="panel"><h2>At a glance</h2><div class="public-dash-list">
        <div class="public-dash-row"><span>Practice accuracy</span><span id="pubDashAccuracy">—</span></div>
        <div class="public-dash-row"><span>Cards reviewed</span><span id="pubDashReviewed">0</span></div>
        <div class="public-dash-row"><span>Cards mastered</span><span id="pubDashMastered">0</span></div>
        <div class="public-dash-row"><span>Your notes</span><span id="pubDashNotes">0</span></div>
        <div class="public-dash-row"><span>Recent test</span><span id="pubDashTest">—</span></div>
      </div></div>
    </div>
  </div>`;
  main.insertBefore(dash,main.firstChild);

  function profile(){try{return currentUser?ensureData():null}catch{return null}}
  function totalCards(d){let total=12;Object.values(d.flashcards||{}).forEach(arr=>total+=(arr||[]).length);return total}
  function renderDash(){
    const d=profile(); if(!d)return;
    const p=d.practice||{right:0,wrong:0}, attempts=(p.right||0)+(p.wrong||0);
    $('pubDashCorrect').textContent=p.right||0;
    $('pubDashPlans').textContent=(d.plans||[]).length;
    $('pubDashNotes').textContent=(d.notes||[]).length;
    $('pubDashCards').textContent=totalCards(d);
    $('pubDashMistakes').textContent=(d.mistakes||[]).filter(x=>!x.mastered).length;
    $('pubDashAccuracy').textContent=attempts?Math.round((p.right||0)/attempts*100)+'%':'No attempts';
    let reviewed=0,mastered=0;
    Object.values(d.flashSrs||{}).forEach(r=>{if((r.reviews||0)>0)reviewed++;if((r.level||0)>=3)mastered++});
    $('pubDashReviewed').textContent=reviewed;
    $('pubDashMastered').textContent=mastered;
    const t=(d.tests||[])[0];
    $('pubDashTest').textContent=t?`${t.pct}%`:'No test yet';
  }

  function show(name){
    document.querySelectorAll('main>.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
    tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.publicGo===name));
    if(name==='progress'&&typeof renderProgress==='function')renderProgress();
    if(name==='dashboard')renderDash();
  }
  tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.publicGo));
  dash.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>show(b.dataset.quick));

  const flashView=$('view-flashcards');
  if(flashView){
    const panels=flashView.querySelectorAll('.panel');
    if(panels[1]) panels[1].classList.add('public-fc-create-callout');
  }

  const previousEnter=enterApp;
  enterApp=function(name){previousEnter(name);setTimeout(()=>{show('dashboard');renderDash()},0)};

  setTimeout(()=>{if(currentUser){show('dashboard');renderDash()}},0);
})();