/**
 * Shared, source-faithful rendering preparation for ensemble (3+ performer)
 * vocal divisions. All incoming source text and color attributions remain
 * untouched; this module only groups tightly interwoven parts for display.
 */
export const isEnsembleLyric=lyric=>lyric?.colorRole!=='song'&&(lyric?.colorLegend?.length||0)>=3;

export function normalizeEnsembleLine(line,lyric){
 if(!isEnsembleLyric(lyric)||!Array.isArray(line))return line;
 const known=new Set(lyric.colorLegend.map(part=>part.id));
 const characters=line.flatMap(part=>[...part.text].map(ch=>({ch,voice:part.voice,secondary:!!part.secondary})));
 const out=[];
 const append=(text,voice,secondary=false)=>{
  if(!text)return;
  const prev=out.at(-1);
  if(prev?.voice===voice&&!!prev.secondary===secondary)prev.text+=text;
  else out.push({text,voice,...(secondary?{secondary:true}:{})});
 };
 for(let i=0;i<characters.length;){
  if(characters[i].ch==='('){
   let depth=0,end=-1;
   for(let j=i;j<characters.length;j++){
    if(characters[j].ch==='(')depth++;
    if(characters[j].ch===')'&&!--depth){end=j;break;}
   }
   if(end>=i){
    const phrase=characters.slice(i,end+1);
    const voices=[...new Set(phrase.flatMap(x=>x.voice.split('+')).filter(id=>known.has(id)))];
    // Source run boundaries inside one response often separate individual
    // characters (rich-text color artifacts). Dots show all documented
    // voices; they do not assert that every voice was simultaneous.
    if(voices.length>1){
     append(phrase.map(x=>x.ch).join(''),voices.join('+'),phrase.some(x=>x.secondary));
     i=end+1;
     continue;
    }
   }
  }
  const part=characters[i];
  append(part.ch,part.voice,part.secondary);
  i++;
 }
 return out;
}

export function ensembleVoiceIds(voice,lyric){
 if(!isEnsembleLyric(lyric))return [];
 const known=new Set(lyric.colorLegend.map(part=>part.id));
 if(voice==='shared')return lyric.colorLegend.map(part=>part.id);
 return [...new Set(String(voice).split('+').filter(id=>known.has(id)))];
}
