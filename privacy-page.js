(() => {
 const i18n=window.codexaI18n;
 let language=i18n.preferredLanguage();
 const theme=i18n.stored('codexa-theme');if(theme==='light'||theme==='dark')document.body.dataset.theme=theme;
 const button=document.querySelector('#privacyLangBtn');
 function render(){
  i18n.apply(language);button.textContent=language==='ar'?'EN':'عربي';
  button.setAttribute('aria-label',language==='ar'?'التبديل إلى الإنجليزية':'Switch to Arabic');
 }
 button.addEventListener('click',()=>{language=language==='ar'?'en':'ar';i18n.remember('codexa-lang',language);render()});
 render();
})();
