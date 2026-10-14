import test from 'node:test';
import {readFileSync} from 'node:fs';
const s=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
test('Stage 12 source audit: embedded view and CSS',()=>{
 const needles=['const embedded','let embedded','embedded=','embedded =','body.embedded','.embedded','.bottom-controls','.compact-full','.compact-week','makeEmbedCodes','function renderBoardOnly','function inWeek','function changeWeek','function changePage'];
 for(const n of needles){
  let cursor=0;const matches=[];
  for(let i=0;i<9;i++){
   const index=s.indexOf(n,cursor);
   if(index<0)break;
   matches.push(s.slice(Math.max(0,index-170),Math.min(s.length,index+470)).replace(/\\s+/g,' '));
   cursor=index+n.length;
  }
  console.log('RELIGHT_EMBED_CSS '+n+': '+JSON.stringify(matches));
 }
});
