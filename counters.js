(() => {
 const counters=[...document.querySelectorAll('.count-up[data-target]')];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const frames=new WeakMap();
 function stop(el){cancelAnimationFrame(frames.get(el));frames.delete(el)}
 function animate(el){
  stop(el);
  const target=Math.max(1,Number(el.dataset.target)||1);
  if(reduced.matches){el.textContent=String(target);return}
  el.textContent='1';
  const started=performance.now();
  const tick=now=>{
   const progress=Math.min(1,(now-started)/2400);
   el.textContent=String(Math.floor(1+(target-1)*progress));
   if(progress<1)frames.set(el,requestAnimationFrame(tick));
   else{el.textContent=String(target);frames.delete(el)}
  };
  frames.set(el,requestAnimationFrame(tick));
 }
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting)animate(entry.target);
   else{stop(entry.target);entry.target.textContent=reduced.matches?entry.target.dataset.target:'1'}
  }),{threshold:.5});
  counters.forEach(el=>observer.observe(el));
 }else counters.forEach(animate);
 reduced.addEventListener('change',()=>counters.forEach(animate));
})();
