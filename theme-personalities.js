(() => {
  const configs={
    pinkblue:{brand:'✦',hero:'🌷',heading:'What do you want to work on today? 🌸',icons:{planner:'🗓️',notes:'📝',work:'📚',questions:'✏️',progress:'📊',timer:'⏱️',flashcards:'🧠',mistakes:'📕',learn:'🎯',test:'🧪',library:'🗂️'}},
    earth:{brand:'🌱',hero:'🪴',heading:'What do you want to grow today? 🌿',icons:{planner:'🌿',notes:'🍃',work:'📗',questions:'🌱',progress:'🌾',timer:'⏱️',flashcards:'🪴',mistakes:'🍂',learn:'🌻',test:'🌼',library:'🧺'}},
    mono:{brand:'✦',hero:'◻️',heading:'What do you want to work on today? ◇',icons:{planner:'◫',notes:'✎',work:'▣',questions:'□',progress:'◔',timer:'◷',flashcards:'◈',mistakes:'!',learn:'◎',test:'◇',library:'▦'}}
  };
  const getTheme=()=>document.body.dataset.theme||'pinkblue';
  function setTextIcon(el,icon){if(!el)return; const span=el.querySelector(':scope > span'); if(span) span.textContent=icon;}
  function apply(){
    const c=configs[getTheme()]||configs.pinkblue;
    const brand=document.querySelector('.brand-mark'); if(brand)brand.textContent=c.brand;
    const flower=document.querySelector('.public-dash-flower'); if(flower)flower.textContent=c.hero;
    const heroTitle=document.querySelector('.public-dash-hero h1'); if(heroTitle)heroTitle.textContent=c.heading;
    document.querySelectorAll('.nav-card[data-go]').forEach(b=>setTextIcon(b,c.icons[b.dataset.go]||'✦'));
    document.querySelectorAll('.public-quick[data-quick]').forEach(b=>{
      const strong=b.querySelector('b'); if(!strong)return;
      const label=strong.textContent.replace(/^\S+\s+/,'');
      strong.textContent=(c.icons[b.dataset.quick]||'✦')+' '+label;
    });
  }
  const obs=new MutationObserver(muts=>{if(muts.some(m=>m.type==='attributes'&&m.attributeName==='data-theme'))apply();});
  obs.observe(document.body,{attributes:true});
  document.addEventListener('click',e=>{const b=e.target.closest('.theme-option');if(b)setTimeout(apply,0)});
  setTimeout(apply,0);setTimeout(apply,500);
})();