(() => {
 const links=[...document.querySelectorAll('#navigation a[href^="#"]')];
 const sections=links.map(link=>({link,section:document.querySelector(link.getAttribute('href'))})).filter(item=>item.section);
 const topButton=document.querySelector('.back-to-top');
 let frame=0;
 function update(){
  frame=0;
  const boundary=document.querySelector('.header').getBoundingClientRect().height+100;
  let current=sections[0];
  for(const item of sections)if(item.section.getBoundingClientRect().top<=boundary)current=item;
  if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-3)current=sections[sections.length-1];
  sections.forEach(({link})=>{
   const active=link===current?.link;link.classList.toggle('is-current',active);
   if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
  topButton.hidden=window.scrollY<600;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 function translate(){
  const english=document.documentElement.lang==='en';
  topButton.setAttribute('aria-label',english?'Back to top':'العودة لأعلى الصفحة');
  document.querySelectorAll('[data-ui-ar]').forEach(el=>el.textContent=el.getAttribute(english?'data-ui-en':'data-ui-ar'));
 }
 topButton.addEventListener('click',()=>{
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.querySelector('.header .brand').focus({preventScroll:true});
 });
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 new ResizeObserver(schedule).observe(document.querySelector('main'));
 new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 translate();update();
})();
