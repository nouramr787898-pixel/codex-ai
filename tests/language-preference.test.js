import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../translations.js',import.meta.url),'utf8');
function preferences({saved=null,languages=['en-US'],blocked=false}={}){
 const values=new Map(saved?[['codexa-lang',saved]]:[]);
 const context={window:{},navigator:{languages,language:languages[0]||''},localStorage:{
  getItem:key=>{if(blocked)throw new Error('Storage unavailable');return values.get(key)||null},
  setItem:(key,value)=>{if(blocked)throw new Error('Storage unavailable');values.set(key,value)}
 }};
 vm.runInNewContext(source,context);
 return context.window.codexaI18n;
}
test('explicit visitor choice overrides browser language',()=>{
 assert.equal(preferences({saved:'ar',languages:['en-US']}).preferredLanguage(),'ar');
 assert.equal(preferences({saved:'en',languages:['ar-EG']}).preferredLanguage(),'en');
});
test('first supported browser preference is used for a new visitor',()=>{
 assert.equal(preferences({languages:['fr-FR','en-GB','ar']}).preferredLanguage(),'en');
 assert.equal(preferences({languages:['ar-EG','en-US']}).preferredLanguage(),'ar');
 assert.equal(preferences({languages:['de-DE']}).preferredLanguage(),'ar');
});
test('blocked browser storage does not break language selection or saving',()=>{
 const i18n=preferences({blocked:true,languages:['en-US']});
 assert.equal(i18n.preferredLanguage(),'en');assert.doesNotThrow(()=>i18n.remember('codexa-lang','ar'));
});
test('portfolio search recognizes Arabic spelling variants and English categories',()=>{
 const i18n=preferences();assert.equal(i18n.searchText('أجازات'),i18n.searchText('اجازات'));
 assert.equal(i18n.categoryName('السياحة والسفر','en'),'Travel & tourism');
});
