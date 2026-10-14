import test from 'node:test';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
test('Stage 12 audit source markers for compact embed controls',()=>{
 const needles=['sin iframe','without iframe','?embed','embed=','embedMode','isEmbed','Ver completo','ver completo','fullView','prevWeek','prevPage','nextWeek','nextPage','langButtons','iframeCode','copyEmbed','embedPreview','embed-image'];
 for(const label of needles){
  const hits=[];
  let index=0;
  for(let i=0;i<8;i++){
   const at=source.toLowerCase().indexOf(label.toLowerCase(),index);
   if(at<0)break;
   hits.push(source.slice(Math.max(0,at-160),Math.min(source.length,at+240)).replace(/\\s+/g,' '));
   index=at+label.length;
  }
  // Public file only. Temporary diagnostics will be replaced after inspection.
  console.log('RELIGHT_SOURCE_AUDIT '+label+': '+JSON.stringify(hits));
 }
});
