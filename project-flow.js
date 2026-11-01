(() => {
 const section=document.querySelector('#process');
 const steps=[...section.querySelectorAll('.flow-step')];
 const rail=section.querySelector('.flow-rail');
 const fill=section.querySelector('.flow-fill');
 const details={
  ar:[['الاكتشاف','نستمع لأهدافك، نفهم جمهورك، ونحدد متطلبات مشروعك قبل التنفيذ.'],['التصميم','نصمم تجربة المستخدم والواجهات والألوان ونراجعها معك قبل بدء البرمجة.'],['التطوير','نبرمج الصفحات والوظائف المطلوبة ونختبر تكامل المكونات خطوة بخطوة.'],['الإطلاق والدعم','نراجع الأداء والتوافق، ونجهز الإطلاق، ثم نحدد آلية المتابعة والدعم المتفق عليها.']],
  en:[['Discovery','We understand your goals, audience and requirements before starting implementation.'],['Design','We create and review the user experience and interface designs before development.'],['Development','We build the requested functionality and test each component carefully.'],['Launch & Support','We check quality, prepare the release and agree on post-launch support.']]
 };
 let active=0;
 function alignRail(){
  const base=section.querySelector('.flow-steps').getBoundingClientRect();
  const first=steps[0].querySelector('.flow-circle').getBoundingClientRect();
  const last=steps[3].querySelector('.flow-circle').getBoundingClientRect();
  const firstX=first.left+first.width/2,lastX=last.left+last.width/2;
  rail.style.left=(Math.min(firstX,lastX)-base.left)+'px';
  rail.style.width=Math.abs(lastX-firstX)+'px';
  rail.style.top=(first.top+first.height/2-base.top-1.5)+'px';
 }
 function update(){
  const language=document.documentElement.lang==='en'?'en':'ar';
  steps.forEach((step,i)=>{step.setAttribute('aria-pressed',String(i===active));step.classList.toggle('flow-complete',i<active)});
  section.querySelectorAll('[data-flow-ar]').forEach(el=>el.textContent=el.getAttribute('data-flow-'+language));
  section.querySelector('#flowDetailTitle').textContent=details[language][active][0];
  section.querySelector('#flowDetailText').textContent=details[language][active][1];
  section.querySelector('.flow-badge').textContent=String(active+1).padStart(2,'0');
  fill.style.width=(active/3*100)+'%';
  alignRail();
 }
 steps.forEach((step,i)=>step.addEventListener('click',()=>{active=i;update()}));
 new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
 new ResizeObserver(alignRail).observe(section.querySelector('.flow-steps'));
 document.fonts.ready.then(alignRail);
 update();
})();
