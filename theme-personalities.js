(() => {
  const configs={
    pinkblue:{brand:'✦',hero:'🌷',heading:'What do you want to work on today? 🌸',icons:{planner:'🗓️',notes:'📝',work:'📚',questions:'✏️',progress:'📊',timer:'⏱️',flashcards:'🧠',mistakes:'📕',learn:'🎯',test:'🧪',library:'🗂️',aiguide:'✨',rewards:'🎁'}},
    earth:{brand:'🌱',hero:'🪴',heading:'What do you want to grow today? 🌿',icons:{planner:'🌿',notes:'🍃',work:'📗',questions:'🌱',progress:'🌾',timer:'⏱️',flashcards:'🪴',mistakes:'🍂',learn:'🌻',test:'🌼',library:'🧺',aiguide:'🌱',rewards:'🌸'}},
    mono:{brand:'✦',hero:'◻️',heading:'What do you want to work on today? ◇',icons:{planner:'◫',notes:'✎',work:'▣',questions:'□',progress:'◔',timer:'◷',flashcards:'◈',mistakes:'!',learn:'◎',test:'◇',library:'▦',aiguide:'◇',rewards:'☆'}}
  };
  const getTheme=()=>document.body.dataset.theme||'pinkblue';
  function setTextIcon(el,icon){if(!el)return; const span=el.querySelector(':scope > span'); if(span) span.textContent=icon;}
  function apply(){
    const c=configs[getTheme()]||configs.pinkblue;
    const brand=document.querySelector('.brand-mark'); if(brand)brand.textContent=c.brand;
    const flower=document.querySelector('.public-dash-flower'); if(flower)flower.textContent=c.hero;
    const heroTitle=document.querySelector('.public-dash-hero h1'); if(heroTitle)heroTitle.textContent=c.heading;
    document.querySelectorAll('.nav-card[data-go]').forEach(b=>setTextIcon(b,c.icons[b.dataset.go]||'✦'));
    document.querySelectorAll('.public-quick[data-quick]').forEach(b=>{const strong=b.querySelector('b'); if(!strong)return;const label=strong.textContent.replace(/^\S+\s+/,'');strong.textContent=(c.icons[b.dataset.quick]||'✦')+' '+label;});
  }
  const obs=new MutationObserver(muts=>{if(muts.some(m=>m.type==='attributes'&&m.attributeName==='data-theme'))apply();});
  obs.observe(document.body,{attributes:true});
  document.addEventListener('click',e=>{const b=e.target.closest('.theme-option');if(b)setTimeout(apply,0)});
  setTimeout(apply,0);setTimeout(apply,500);
  if(!document.querySelector('link[data-rewards-css]')){const css=document.createElement('link');css.rel='stylesheet';css.href='rewards.css?v=1';css.dataset.rewardsCss='1';document.head.appendChild(css)}
  if(!document.querySelector('script[data-rewards-js]')){const js=document.createElement('script');js.src='rewards.js?v=1';js.dataset.rewardsJs='1';document.body.appendChild(js)}
  if(!document.getElementById('appShellV3Styles')){const l=document.createElement('link');l.id='appShellV3Styles';l.rel='stylesheet';l.href='app-shell-v3.css?v=1';document.head.appendChild(l)}
  if(!document.getElementById('appShellV3Script')){const s=document.createElement('script');s.id='appShellV3Script';s.src='app-shell-v3.js?v=1';document.body.appendChild(s)}
})();