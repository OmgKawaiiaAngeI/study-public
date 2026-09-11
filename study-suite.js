(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const DAY = 86400000;
  const starterCards = {
    'Algebra': [['Solve 3x + 7 = 22.','x = 5'],['Expand 4(x + 3).','4x + 12'],['Factorise x² + 5x.','x(x + 5)']],
    'Fractions': [['Simplify 18/24.','3/4'],['Calculate 2/3 + 1/6.','5/6'],['Find 3/5 of 40.','24']],
    'Percentages': [['Find 15% of 200.','30'],['Increase 80 by 25%.','100'],['Decrease 500 by 10%.','450']],
    'Geometry': [['Area of a triangle with base 8 cm and height 5 cm?','20 cm²'],['Angles on a straight line add to?','180°'],['Circumference when r=7 cm and π=22/7?','44 cm']]
  };

  function getData(){
    if(!currentUser) return null;
    const d = ensureData();
    d.flashcards ||= {};
    d.flashSrs ||= {};
    d.mistakes ||= [];
    d.topicStats ||= {};
    d.folders ||= {};
    d.starred ||= {};
    d.exam ||= {name:'', date:''};
    d.darkMode ||= false;
    d.learnStats ||= {};
    d.tests ||= [];
    saveData(d);
    return d;
  }
  function allTopics(d){ return [...new Set([...Object.keys(starterCards), ...Object.keys(d?.flashcards || {})])]; }
  function cardsFor(d, topic){
    const base=(starterCards[topic]||[]).map((x,i)=>({id:`starter:${topic}:${i}`,front:x[0],back:x[1],topic,custom:false}));
    const custom=(d?.flashcards?.[topic]||[]).map(x=>({id:x.id,front:x.front,back:x.back,topic,custom:true}));
    return base.concat(custom);
  }
  function addHomeCard(goTo, icon, title, small){
    const grid=document.querySelector('.nav-grid'); if(!grid || grid.querySelector(`[data-go="${goTo}"]`)) return;
    const b=document.createElement('button'); b.className='nav-card'; b.dataset.go=goTo;
    b.innerHTML=`<span>${icon}</span><b>${esc(title)}</b><small>${esc(small)}</small>`;
    b.onclick=()=>go(goTo); grid.appendChild(b);
  }
  function addView(name,title,subtitle,body){
    const id='view-'+name; if($(id)) return $(id);
    const s=document.createElement('section'); s.id=id; s.className='view';
    s.innerHTML=`<div class="section-head"><button class="back-btn">←</button><div><h2>${title}</h2><p>${subtitle}</p></div></div>${body}`;
    document.querySelector('main').appendChild(s); s.querySelector('.back-btn').onclick=()=>go('home'); return s;
  }
  function notice(text){
    let n=$('suiteNotice'); if(!n){n=document.createElement('div');n.id='suiteNotice';n.className='suite-notice';document.body.appendChild(n)}
    n.textContent=text;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),2200);
  }
  function recordTopic(d,topic,correct){d.topicStats[topic] ||= {right:0,wrong:0};d.topicStats[topic][correct?'right':'wrong']++;}
  function addMistake(d,topic,q,a,explanation){
    const key=`suite|${topic}|${q}`; const m=d.mistakes.find(x=>x.key===key);
    if(m){m.count=(m.count||0)+1;m.last=Date.now();m.mastered=false;}
    else d.mistakes.unshift({key,topic,index:0,q,a,explanation:explanation||a,count:1,mastered:false,last:Date.now()});
  }

  // 1) Learn Mode — mixed question formats, increasingly written as mastery rises.
  addHomeCard('learn','🎯','Learn Mode','Adaptive deck practice');
  addView('learn','Learn Mode','Practice one deck with easier prompts first, then harder recall.',`
    <div class="panel"><div class="suite-toolbar"><select id="learnDeck"></select><span id="learnMastery" class="pill">0 mastered</span></div>
    <div id="learnPrompt" class="question-card"></div><div id="learnChoices" class="choice-grid"></div>
    <input id="learnWritten" class="hidden" placeholder="Type your answer">
    <button id="learnCheck" class="primary-btn compact">Check</button><div id="learnFeedback" class="suite-feedback"></div>
    <button id="learnNext" class="secondary-btn hidden">Next</button></div>`);
  let learnTopic='',learnIndex=0,learnMode='choice',learnAnswered=false,learnStreak=0;
  function populateLearn(){const d=getData();if(!d)return;const s=$('learnDeck');const topics=allTopics(d);s.innerHTML=topics.map(t=>`<option>${esc(t)}</option>`).join('');if(!topics.includes(learnTopic))learnTopic=topics[0]||'';s.value=learnTopic;s.onchange=()=>{learnTopic=s.value;learnIndex=0;learnStreak=0;renderLearn()};renderLearn();}
  function learnDistractors(d,topic,correct){return cardsFor(d,topic).map(c=>c.back).filter(x=>x!==correct).sort(()=>Math.random()-.5).slice(0,3);}
  function renderLearn(){const d=getData();if(!d||!learnTopic)return;const cards=cardsFor(d,learnTopic);if(!cards.length)return;learnIndex%=cards.length;const c=cards[learnIndex],stats=d.learnStats[learnTopic]||{right:0,wrong:0};learnMode=(stats.right>=3||learnStreak>=2)?'written':'choice';learnAnswered=false;$('learnPrompt').textContent=c.front;$('learnFeedback').innerHTML='';$('learnNext').classList.add('hidden');$('learnCheck').classList.remove('hidden');$('learnMastery').textContent=`${stats.right} correct · ${stats.wrong} missed`;
    if(learnMode==='choice'){ $('learnWritten').classList.add('hidden'); $('learnChoices').classList.remove('hidden'); const opts=[c.back,...learnDistractors(d,learnTopic,c.back)].sort(()=>Math.random()-.5); $('learnChoices').innerHTML=opts.map(o=>`<button data-answer="${esc(o)}">${esc(o)}</button>`).join(''); $('learnChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(learnAnswered)return;$('learnChoices').querySelectorAll('button').forEach(x=>x.classList.remove('picked'));b.classList.add('picked');$('learnWritten').dataset.choice=b.dataset.answer;}); }
    else { $('learnChoices').classList.add('hidden'); $('learnWritten').classList.remove('hidden'); $('learnWritten').value=''; $('learnWritten').dataset.choice=''; }
  }
  function norm(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ').replace(/[.,]/g,'');}
  $('learnCheck').onclick=()=>{const d=getData();if(!d||learnAnswered)return;const c=cardsFor(d,learnTopic)[learnIndex];const ans=learnMode==='choice'?$('learnWritten').dataset.choice:$('learnWritten').value;const correct=norm(ans)===norm(c.back);learnAnswered=true;d.learnStats[learnTopic] ||= {right:0,wrong:0};d.learnStats[learnTopic][correct?'right':'wrong']++;recordTopic(d,learnTopic,correct);if(correct)learnStreak++;else{learnStreak=0;addMistake(d,learnTopic,c.front,c.back,`Review the flashcard answer: ${c.back}`)}saveData(d);$('learnFeedback').innerHTML=correct?'<b>✓ Correct!</b> Nice recall.':`<b>Not quite.</b><br>Answer: ${esc(c.back)}`;$('learnCheck').classList.add('hidden');$('learnNext').classList.remove('hidden');};
  $('learnNext').onclick=()=>{const d=getData();learnIndex=(learnIndex+1)%cardsFor(d,learnTopic).length;renderLearn()};

  // 2) Test Mode — configurable count + timer + auto score.
  addHomeCard('test','🧪','Test Mode','Build a timed practice test');
  addView('test','Test Mode','Choose a deck, number of questions and optional timer.',`
    <div class="panel" id="testSetup"><select id="testDeck"></select><div class="field-row"><label>Questions</label><select id="testCount"><option>5</option><option>10</option><option>20</option></select></div><div class="field-row"><label>Time limit</label><select id="testMinutes"><option value="0">No timer</option><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="20">20 minutes</option></select></div><button id="startTest" class="primary-btn">Start test</button></div>
    <div class="panel hidden" id="testRun"><div class="suite-toolbar"><b id="testCounter"></b><span id="testClock" class="pill"></span></div><div id="testQuestion" class="question-card"></div><input id="testAnswer" placeholder="Type your answer"><button id="testSubmit" class="primary-btn">Submit answer</button><div id="testFeedback" class="suite-feedback"></div></div>
    <div class="panel hidden" id="testResult"></div>`);
  let testState=null,testTimer=null;
  function populateTest(){const d=getData();if(!d)return;$('testDeck').innerHTML=allTopics(d).map(t=>`<option>${esc(t)}</option>`).join('');}
  function renderTestQ(){const q=testState.questions[testState.i];$('testCounter').textContent=`${testState.i+1} / ${testState.questions.length}`;$('testQuestion').textContent=q.front;$('testAnswer').value='';$('testFeedback').innerHTML='';$('testSubmit').disabled=false;}
  function endTest(){clearInterval(testTimer);const d=getData();const pct=Math.round(testState.correct/testState.questions.length*100);d.tests.unshift({date:new Date().toISOString(),topic:testState.topic,score:testState.correct,total:testState.questions.length,pct});d.tests=d.tests.slice(0,20);saveData(d);$('testRun').classList.add('hidden');$('testResult').classList.remove('hidden');$('testResult').innerHTML=`<h3>Test complete</h3><div class="test-score">${pct}%</div><p>${testState.correct} / ${testState.questions.length} correct</p><button id="testAgain" class="secondary-btn">Take another</button>`;$('testAgain').onclick=()=>{$('testResult').classList.add('hidden');$('testSetup').classList.remove('hidden')};}
  $('startTest').onclick=()=>{const d=getData(),topic=$('testDeck').value,cards=cardsFor(d,topic);if(!cards.length)return;const count=Math.min(+$('testCount').value,cards.length);testState={topic,questions:[...cards].sort(()=>Math.random()-.5).slice(0,count),i:0,correct:0,seconds:+$('testMinutes').value*60};$('testSetup').classList.add('hidden');$('testResult').classList.add('hidden');$('testRun').classList.remove('hidden');if(testState.seconds){$('testClock').textContent=Math.floor(testState.seconds/60)+':00';testTimer=setInterval(()=>{testState.seconds--;$('testClock').textContent=`${String(Math.floor(testState.seconds/60)).padStart(2,'0')}:${String(testState.seconds%60).padStart(2,'0')}`;if(testState.seconds<=0)endTest()},1000)}else $('testClock').textContent='Untimed';renderTestQ();};
  $('testSubmit').onclick=()=>{const d=getData(),q=testState.questions[testState.i],correct=norm($('testAnswer').value)===norm(q.back);if(correct)testState.correct++;else addMistake(d,testState.topic,q.front,q.back,'Review the correct flashcard answer and try it again later.');recordTopic(d,testState.topic,correct);saveData(d);$('testFeedback').innerHTML=correct?'<b>✓ Correct</b>':`<b>Incorrect.</b> ${esc(q.back)}`;$('testSubmit').disabled=true;setTimeout(()=>{testState.i++;if(testState.i>=testState.questions.length)endTest();else renderTestQ()},650);};

  // 3) Starred flashcards — study only starred cards.
  const fcPanel=$('publicFc')?.closest('.panel');
  if(fcPanel&&!$('starCurrentCard')){const bar=document.createElement('div');bar.className='star-bar';bar.innerHTML='<button id="starCurrentCard" class="secondary-btn">☆ Star card</button><label><input id="starOnly" type="checkbox"> Study starred only</label>';fcPanel.insertBefore(bar,$('publicFc'));}
  function currentFcIdentity(){const topic=$('fcTopic')?.value||'';const front=$('fcFrontText')?.textContent||'';return {topic,front,key:`${topic}|${front}`};}
  function refreshStar(){if(!$('starCurrentCard')||!currentUser)return;const d=getData(),x=currentFcIdentity(),on=!!d.starred[x.key];$('starCurrentCard').textContent=on?'★ Starred':'☆ Star card';}
  $('starCurrentCard')?.addEventListener('click',()=>{const d=getData(),x=currentFcIdentity();if(!x.front)return;if(d.starred[x.key])delete d.starred[x.key];else d.starred[x.key]={topic:x.topic,front:x.front};saveData(d);refreshStar();});
  if($('fcFrontText'))new MutationObserver(refreshStar).observe($('fcFrontText'),{childList:true,subtree:true,characterData:true});
  $('starOnly')?.addEventListener('change',()=>{const d=getData(),checked=$('starOnly').checked,topic=$('fcTopic').value;if(!checked){notice('Star filter off');return}const starred=cardsFor(d,topic).filter(c=>d.starred[`${topic}|${c.front}`]);if(!starred.length){notice('No starred cards in this deck yet');$('starOnly').checked=false;return}notice(`${starred.length} starred card${starred.length===1?'':'s'} in ${topic}`);});

  // 4 + 5) Library folders + deck sharing/import codes.
  addHomeCard('library','🗂️','Library','Folders, decks & sharing');
  addView('library','Library','Organise decks into folders and share them with friends.',`
    <div class="panel"><div class="suite-toolbar"><input id="newFolder" placeholder="New folder name"><button id="addFolder" class="secondary-btn">Create folder</button></div><div id="folderChips" class="folder-chips"></div></div>
    <div id="deckLibrary" class="deck-grid"></div>
    <div class="panel"><h3>Import a shared deck</h3><textarea id="shareCodeInput" placeholder="Paste a Study Corner share code here..."></textarea><button id="importShareCode" class="primary-btn">Import deck</button></div>`);
  function renderLibrary(){const d=getData();if(!d)return;const folderNames=[...new Set(Object.values(d.folders).filter(Boolean))];$('folderChips').innerHTML=folderNames.length?folderNames.map(f=>`<span class="folder-chip">📁 ${esc(f)}</span>`).join(''):'<span class="muted">No folders yet.</span>';$('deckLibrary').innerHTML=allTopics(d).map(topic=>{const count=cardsFor(d,topic).length,folder=d.folders[topic]||'';return `<div class="panel deck-card"><h3>${esc(topic)}</h3><p>${count} cards</p><select data-folder-deck="${esc(topic)}"><option value="">No folder</option>${folderNames.map(f=>`<option ${f===folder?'selected':''}>${esc(f)}</option>`).join('')}</select><div class="deck-actions"><button class="secondary-btn" data-share-deck="${esc(topic)}">Share deck</button><button class="secondary-btn" data-learn-deck="${esc(topic)}">Learn</button></div></div>`}).join('');document.querySelectorAll('[data-folder-deck]').forEach(s=>s.onchange=()=>{const d=getData();d.folders[s.dataset.folderDeck]=s.value;saveData(d);renderLibrary()});document.querySelectorAll('[data-share-deck]').forEach(b=>b.onclick=()=>shareDeck(b.dataset.shareDeck));document.querySelectorAll('[data-learn-deck]').forEach(b=>b.onclick=()=>{learnTopic=b.dataset.learnDeck;go('learn');populateLearn()});}
  $('addFolder').onclick=()=>{const name=$('newFolder').value.trim();if(!name)return;const d=getData();d.folderList ||= [];if(!d.folderList.includes(name))d.folderList.push(name);saveData(d);$('newFolder').value='';const phantom=`__folder_${Date.now()}`;d.folders[phantom]=name;saveData(d);renderLibrary();};
  function encodeShare(obj){return 'SC1:'+btoa(unescape(encodeURIComponent(JSON.stringify(obj))))}
  function decodeShare(code){return JSON.parse(decodeURIComponent(escape(atob(code.replace(/^SC1:/,'')))))}
  async function shareDeck(topic){const d=getData(),payload={v:1,title:topic,cards:cardsFor(d,topic).map(c=>[c.front,c.back])},code=encodeShare(payload);try{await navigator.clipboard.writeText(code);notice('Deck share code copied!')}catch{prompt('Copy this share code:',code)}}
  $('importShareCode').onclick=()=>{try{const obj=decodeShare($('shareCodeInput').value.trim());if(!obj.title||!Array.isArray(obj.cards))throw new Error();const d=getData(),topic=obj.title+' (shared)';d.flashcards[topic] ||= [];obj.cards.forEach(([front,back])=>d.flashcards[topic].push({id:crypto.randomUUID(),front:String(front),back:String(back)}));saveData(d);$('shareCodeInput').value='';notice(`Imported ${obj.cards.length} cards`);renderLibrary();populateLearn();populateTest();}catch{notice('That share code is not valid')}};

  // 6) Daily Review dashboard.
  addHomeCard('daily','☀️','Daily Review','Everything due today');
  addView('daily','Daily Review','One place for today’s tasks, due cards and mistakes.',`<div id="dailyHero" class="panel"></div><div class="daily-grid"><div class="panel"><h3>📅 Today</h3><div id="dailyTasks"></div></div><div class="panel"><h3>🧠 Flashcards due</h3><div id="dailyCards"></div><button class="secondary-btn" id="dailyFlashBtn">Review flashcards</button></div><div class="panel"><h3>📕 Mistakes</h3><div id="dailyMistakes"></div><button class="secondary-btn" id="dailyMistakeBtn">Open Mistake Book</button></div></div>`);
  function countDue(d){let n=0;allTopics(d).forEach(t=>cardsFor(d,t).forEach(c=>{const r=d.flashSrs[c.id];if(!r||!r.due||r.due<=Date.now())n++}));return n;}
  function renderDaily(){const d=getData();if(!d)return;const today=new Date().toISOString().slice(0,10),tasks=d.plans.filter(p=>p.date===today),due=countDue(d),mist=d.mistakes.filter(m=>!m.mastered).length;let exam='';if(d.exam?.date){const days=Math.max(0,Math.ceil((new Date(d.exam.date+'T23:59:59')-new Date())/DAY));exam=`<span class="pill">${esc(d.exam.name||'Exam')} · ${days} day${days===1?'':'s'} left</span>`}$('dailyHero').innerHTML=`<h3>Today’s review</h3><p>${tasks.length} task${tasks.length===1?'':'s'} · ${due} cards due · ${mist} mistakes to review</p>${exam}`;$('dailyTasks').innerHTML=tasks.length?tasks.map(x=>`<p><b>${esc(x.topic)}</b><br>${esc(x.task)}</p>`).join(''):'<p class="muted">Nothing scheduled today.</p>';$('dailyCards').innerHTML=`<div class="daily-number">${due}</div><p class="muted">cards ready for review</p>`;$('dailyMistakes').innerHTML=`<div class="daily-number">${mist}</div><p class="muted">questions to revisit</p>`;}
  $('dailyFlashBtn').onclick=()=>go('flashcards');$('dailyMistakeBtn').onclick=()=>go('mistakes');

  // 7) Exam date + countdown.
  addHomeCard('exam','📆','Exam Countdown','Set your next test date');
  addView('exam','Exam Countdown','Set a target date so Study Corner can keep it visible.',`<div class="panel"><input id="examName" placeholder="Exam name, e.g. CSEC Mathematics"><input id="examDate" type="date"><button id="saveExam" class="primary-btn">Save exam</button></div><div id="examCountdown" class="panel countdown-card"></div>`);
  function renderExam(){const d=getData();if(!d)return;$('examName').value=d.exam?.name||'';$('examDate').value=d.exam?.date||'';if(!d.exam?.date){$('examCountdown').innerHTML='<p class="muted">No exam date set yet.</p>';return}const days=Math.max(0,Math.ceil((new Date(d.exam.date+'T23:59:59')-new Date())/DAY));$('examCountdown').innerHTML=`<span>${days}</span><b>day${days===1?'':'s'} until ${esc(d.exam.name||'your exam')}</b>`;}
  $('saveExam').onclick=()=>{const d=getData();d.exam={name:$('examName').value.trim(),date:$('examDate').value};saveData(d);renderExam();renderDaily();notice('Exam countdown saved')};

  // 8) Search everything.
  addHomeCard('search','🔎','Search','Find anything you saved');
  addView('search','Search','Search notes, tasks, work, flashcards and mistakes.',`<div class="panel"><input id="globalSearch" placeholder="Search Study Corner..."></div><div id="searchResults" class="stack"></div>`);
  function runSearch(){const d=getData(),q=norm($('globalSearch').value);if(!q){$('searchResults').innerHTML='<div class="panel muted">Start typing to search.</div>';return}const out=[];d.notes.forEach(n=>{if(norm(n.title+' '+n.body).includes(q))out.push({type:'Note',title:n.title,text:n.body})});d.plans.forEach(p=>{if(norm(p.topic+' '+p.task).includes(q))out.push({type:'Planner',title:p.topic,text:p.task})});d.work.forEach(w=>{if(norm(w.topic+' '+w.details).includes(q))out.push({type:'Work',title:w.topic,text:w.details})});allTopics(d).forEach(t=>cardsFor(d,t).forEach(c=>{if(norm(t+' '+c.front+' '+c.back).includes(q))out.push({type:'Flashcard · '+t,title:c.front,text:c.back})}));d.mistakes.forEach(m=>{if(norm(m.topic+' '+m.q+' '+m.a).includes(q))out.push({type:'Mistake',title:m.q,text:m.a})});$('searchResults').innerHTML=out.length?out.slice(0,60).map(r=>`<div class="item-card"><div class="item-meta">${esc(r.type)}</div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div>`).join(''):'<div class="panel muted">No matches found.</div>';}
  $('globalSearch').oninput=runSearch;

  // 9) Dark mode.
  const darkBtn=document.createElement('button');darkBtn.className='icon-btn';darkBtn.id='darkModeBtn';darkBtn.title='Dark mode';darkBtn.textContent='☾';document.querySelector('.top-actions')?.prepend(darkBtn);
  function applyDark(){const d=getData();if(!d)return;document.body.classList.toggle('dark-mode',!!d.darkMode);darkBtn.textContent=d.darkMode?'☀':'☾';darkBtn.title=d.darkMode?'Light mode':'Dark mode';}
  darkBtn.onclick=()=>{const d=getData();d.darkMode=!d.darkMode;saveData(d);applyDark()};

  // 10) Export / backup + restore.
  addHomeCard('backup','💾','Backup','Export or restore your data');
  addView('backup','Backup & Restore','Keep a copy of your Study Corner data.',`<div class="panel"><h3>Export my data</h3><p class="muted">Downloads your notes, decks, progress, mistakes, preferences and planner as a JSON backup.</p><button id="exportBackup" class="primary-btn">Download backup</button></div><div class="panel"><h3>Restore a backup</h3><input id="restoreFile" type="file" accept="application/json,.json"><button id="restoreBackup" class="secondary-btn">Restore file</button><p class="muted">Restoring replaces the current profile’s Study Corner data.</p></div>`);
  $('exportBackup').onclick=()=>{const d=getData(),blob=new Blob([JSON.stringify({app:'Study Corner',version:2,exportedAt:new Date().toISOString(),data:d},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`study-corner-${currentUser}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  $('restoreBackup').onclick=async()=>{const f=$('restoreFile').files[0];if(!f)return notice('Choose a backup file first');try{const obj=JSON.parse(await f.text());if(obj.app!=='Study Corner'||!obj.data)throw new Error();saveData(obj.data);notice('Backup restored');setTimeout(()=>location.reload(),700)}catch{notice('That backup file is not valid')}};

  // 11) Paste anything → Study Set.
  addHomeCard('importhub','📥','Import Hub','Paste anything into Study Corner');
  addView('importhub','Import Hub','Paste notes or AI output and turn it into a saved note or flashcard deck.',`<div class="panel"><input id="importTitle" placeholder="Title / deck name"><textarea id="importText" class="big-textarea" placeholder="Paste notes, Q || A lines, tab-separated cards, or copied AI output here..."></textarea><div class="import-actions"><button id="makeNote" class="secondary-btn">Make Note</button><button id="makeCards" class="primary-btn compact">Make Flashcards</button></div><div id="importResult" class="suite-feedback"></div></div>`);
  function parseCards(text){const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean),out=[];for(const line of lines){let parts=line.includes('||')?line.split('||'):line.includes('\t')?line.split('\t'):null;if(!parts){const i=line.indexOf(':');if(i>1)parts=[line.slice(0,i),line.slice(i+1)]}if(parts&&parts.length>=2){const q=parts.shift().trim(),a=parts.join(' ').trim();if(q&&a)out.push([q,a])}}return out;}
  $('makeNote').onclick=()=>{const d=getData(),body=$('importText').value.trim(),title=$('importTitle').value.trim()||'Imported notes';if(!body)return;d.notes.unshift({id:crypto.randomUUID(),title,body,created:new Date().toLocaleDateString()});saveData(d);$('importResult').innerHTML='<b>✓ Note saved.</b>';};
  $('makeCards').onclick=()=>{const d=getData(),cards=parseCards($('importText').value),topic=$('importTitle').value.trim()||'Imported deck';if(!cards.length){$('importResult').innerHTML='<b>No flashcards detected.</b> Use one card per line like: Question || Answer';return}d.flashcards[topic] ||= [];cards.forEach(([front,back])=>d.flashcards[topic].push({id:crypto.randomUUID(),front,back}));saveData(d);$('importResult').innerHTML=`<b>✓ ${cards.length} flashcards added to ${esc(topic)}.</b>`;populateLearn();populateTest();renderLibrary();};

  // 12) Feedback / feature suggestions — uses native share sheet or clipboard so the user chooses where to send it.
  addHomeCard('feedback','💬','Suggest a Feature','Tell us what would make it better');
  addView('feedback','Feedback','Suggest a feature or report something that is not working.',`<div class="panel"><select id="feedbackType"><option>Feature suggestion</option><option>Bug report</option><option>Something I love</option><option>Other feedback</option></select><textarea id="feedbackText" class="big-textarea" placeholder="What should Study Corner add or improve?"></textarea><button id="shareFeedback" class="primary-btn">Share feedback</button><button id="copyFeedback" class="secondary-btn feedback-copy">Copy feedback</button><p class="muted">Your device will let you choose where to send it. Study Corner does not post anything automatically.</p></div>`);
  function feedbackMessage(){return `Study Corner — ${$('feedbackType').value}\n\n${$('feedbackText').value.trim()}`}
  $('shareFeedback').onclick=async()=>{const text=feedbackMessage();if(!$('feedbackText').value.trim())return notice('Write your feedback first');if(navigator.share){try{await navigator.share({title:'Study Corner feedback',text});return}catch(e){if(e.name==='AbortError')return}}try{await navigator.clipboard.writeText(text);notice('Feedback copied — send it to the person who shared Study Corner')}catch{notice('Could not open sharing on this device')}};
  $('copyFeedback').onclick=async()=>{const text=feedbackMessage();if(!$('feedbackText').value.trim())return notice('Write your feedback first');try{await navigator.clipboard.writeText(text);notice('Feedback copied!')}catch{prompt('Copy your feedback:',text)}};

  // Login persistence fix: remember successful profiles across normal site closes, restore backup index, auto-login.
  const USERS='studyCornerUsersV1', USERS_BACKUP='studyCornerUsersBackupV1', REMEMBER='studyCornerRememberUserV2';
  try{const primary=localStorage.getItem(USERS),backup=localStorage.getItem(USERS_BACKUP);if(!primary&&backup)localStorage.setItem(USERS,backup);if(primary)localStorage.setItem(USERS_BACKUP,primary);}catch(e){}
  const remember=document.createElement('label');remember.className='remember-row';remember.innerHTML='<input id="rememberProfile" type="checkbox" checked> Remember this profile on this device';$('loginPane')?.appendChild(remember);
  function saveRememberSoon(){setTimeout(()=>{try{const u=JSON.parse(localStorage.getItem(USERS)||'{}');if(Object.keys(u).length)localStorage.setItem(USERS_BACKUP,JSON.stringify(u));if(currentUser&&$('rememberProfile')?.checked)localStorage.setItem(REMEMBER,currentUser);}catch(e){}},20)}
  $('signupBtn')?.addEventListener('click',saveRememberSoon);$('loginBtn')?.addEventListener('click',saveRememberSoon);$('logoutBtn')?.addEventListener('click',()=>{try{localStorage.removeItem(REMEMBER)}catch(e){}});
  const accountNote=document.querySelector('.auth-card small');if(accountNote)accountNote.textContent='Your profile is saved on this browser/device. Use Backup if you want to move it to another device or protect against cleared browser data.';
  try{const remembered=localStorage.getItem(REMEMBER),u=JSON.parse(localStorage.getItem(USERS)||'{}');if(remembered&&u[remembered.toLowerCase()])enterApp(u[remembered.toLowerCase()].name);}catch(e){}

  // Page-entry hooks and initial setup.
  const originalGo=go; go=function(name){originalGo(name);if(name==='learn')populateLearn();if(name==='test')populateTest();if(name==='library')renderLibrary();if(name==='daily')renderDaily();if(name==='exam')renderExam();if(name==='search')runSearch();if(name==='feedback'){}if(name==='backup'){}applyDark();};
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
  populateLearn();populateTest();renderLibrary();renderDaily();renderExam();refreshStar();applyDark();
})();