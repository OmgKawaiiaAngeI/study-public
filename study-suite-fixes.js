(() => {
  const q=id=>document.getElementById(id);
  const esc2=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function profileData(){if(!currentUser)return null;const d=ensureData();d.starred||={};d.flashcards||={};saveData(d);return d}
  const starter={
    Algebra:[['Solve 3x + 7 = 22.','x = 5'],['Expand 4(x + 3).','4x + 12'],['Factorise x² + 5x.','x(x + 5)']],
    Fractions:[['Simplify 18/24.','3/4'],['Calculate 2/3 + 1/6.','5/6'],['Find 3/5 of 40.','24']],
    Percentages:[['Find 15% of 200.','30'],['Increase 80 by 25%.','100'],['Decrease 500 by 10%.','450']],
    Geometry:[['Area of a triangle with base 8 cm and height 5 cm?','20 cm²'],['Angles on a straight line add to?','180°'],['Circumference when r=7 cm and π=22/7?','44 cm']]
  };
  function cards(d,t){return (starter[t]||[]).map((x,i)=>({id:`starter:${t}:${i}`,front:x[0],back:x[1]})).concat((d.flashcards[t]||[]).map(x=>({id:x.id,front:x.front,back:x.back})))}

  // Make “Study starred only” a real separate review loop.
  const panel=q('publicFc')?.closest('.panel');
  if(panel&&q('starOnly')&&!q('starredReviewStage')){
    const stage=document.createElement('div');stage.id='starredReviewStage';stage.className='hidden starred-review-stage';stage.innerHTML=`<div class="public-fc" id="starredOnlyCard"><div class="public-fc-inner"><div class="public-fc-face front" id="starredFront"></div><div class="public-fc-face back" id="starredBack"></div></div></div><div class="suite-toolbar"><span id="starredCounter" class="pill"></span><div><button id="starredPrev" class="secondary-btn">← Prev</button> <button id="starredNext" class="secondary-btn">Next →</button></div></div>`;panel.appendChild(stage);
    let idx=0,flip=false,list=[];
    function refreshList(){const d=profileData(),topic=q('fcTopic')?.value||'';list=cards(d,topic).filter(c=>d.starred[`${topic}|${c.front}`]);idx=Math.min(idx,Math.max(0,list.length-1));return {d,topic}}
    function renderStarred(){const {topic}=refreshList();if(!list.length){q('starredFront').textContent='No starred cards in this deck.';q('starredBack').textContent='Star some cards first.';q('starredCounter').textContent='0 starred';return}const c=list[idx];q('starredFront').textContent=c.front;q('starredBack').textContent=c.back;q('starredOnlyCard').classList.toggle('flipped',flip);q('starredCounter').textContent=`${idx+1} / ${list.length} · ${topic}`;}
    q('starOnly').onchange=()=>{const on=q('starOnly').checked;panel.querySelector('#publicFc').classList.toggle('hidden',on);q('fcRateRow')?.classList.toggle('hidden',on||!q('publicFc').classList.contains('flipped'));q('fcFlipBtn')?.classList.toggle('hidden',on);stage.classList.toggle('hidden',!on);idx=0;flip=false;if(on)renderStarred();};
    q('starredOnlyCard').onclick=()=>{flip=!flip;renderStarred()};q('starredPrev').onclick=()=>{refreshList();if(list.length){idx=(idx-1+list.length)%list.length;flip=false;renderStarred()}};q('starredNext').onclick=()=>{refreshList();if(list.length){idx=(idx+1)%list.length;flip=false;renderStarred()}};
  }

  // Keep feedback one tap away from every page.
  if(!q('floatingFeedback')){const b=document.createElement('button');b.id='floatingFeedback';b.className='floating-feedback';b.innerHTML='💬 <span>Suggest</span>';b.onclick=()=>go('feedback');document.body.appendChild(b)}

  // IndexedDB mirror for the profile index. This survives ordinary browser/app closes and can restore the local index if it is missing.
  const DB='studyCornerProfilesDB',STORE='profileIndex',KEY='users',LS='studyCornerUsersV1';
  function dbOpen(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  async function mirrorUsers(){try{const raw=localStorage.getItem(LS);if(!raw)return;const db=await dbOpen(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(raw,KEY)}catch(e){}}
  async function restoreUsers(){try{if(localStorage.getItem(LS))return;const db=await dbOpen(),tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(KEY);r.onsuccess=()=>{if(r.result&&!localStorage.getItem(LS)){localStorage.setItem(LS,r.result);location.reload()}}}catch(e){}}
  q('signupBtn')?.addEventListener('click',()=>setTimeout(mirrorUsers,80));q('loginBtn')?.addEventListener('click',()=>setTimeout(mirrorUsers,80));mirrorUsers();restoreUsers();

  // Show clear persistence status so users know what “account” means.
  const auth=q('authScreen')?.querySelector('.auth-card');if(auth&&!q('profileStorageStatus')){const p=document.createElement('div');p.id='profileStorageStatus';p.className='profile-storage-status';p.innerHTML='<b>✓ Profile saving is on</b><span>Your account stays on this browser after you close the site. Use Backup to move it to another device.</span>';auth.appendChild(p)}
})();