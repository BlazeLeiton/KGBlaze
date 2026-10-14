import test from 'node:test';
import {readFileSync} from 'node:fs';
const s=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
test('Stage 12 source audit: compact embed contract',()=>{
 const needles=['searchParams.get(\'embed\')','searchParams.has(\'embed\')','embed===','embedMode','compact-controls','small-lang','openFull','bottomControls','pagePrev','pageNext','classList.add(\'embed','classList.toggle(\'embed','plainLabel','iframeLabel','copyPlain','<canvas id=','<canvas'];
 for(const n of needles){
  let cursor=0;const matches=[];
  for(let i=0;i<4;i++){
   const index=s.indexOf(n,cursor);
   if(index<0)break;
   matches.push(s.slice(Math.max(0,index-350),Math.min(s.length,index+580)).replace(/\\s+/g,' '));
   cursor=index+n.length;
  }
  console.log('RELIGHT_EMBED_DETAIL '+n+': '+JSON.stringify(matches));
 }
});
