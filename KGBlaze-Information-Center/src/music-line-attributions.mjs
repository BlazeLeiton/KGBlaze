// Editorial overlays over the creator's Spanish texts. Names are display metadata,
// not new lyric text. Keep original audio participants separate from cover performers.
// Per-line "official" allocations are not published by the labels: fan transcriptions
// are explicitly documented as references and condensed lines may combine parts.
const repeat=(n,label)=>Array(n).fill(label);
const everyone='Todos';
const urh='Umi · Rin · Hanayo',hem='Honoka · Eli · Maki',knn='Kotori · Nico · Nozomi';
export const lineAttributions={
 'ruteshi-kisuki-shiteru':{
  source:'https://lyruca.com/song/37487',
  corroboration:'https://ameblo.jp/love-live-kasi/entry-11934034550.html',
  status:'corroborated-fan-transcription',
  originalCast:['Honoka','Eli','Kotori','Umi','Rin','Maki','Nozomi','Hanayo','Nico'],
  lines:[
   [everyone,everyone,'Todos · respuesta de Nozomi'],
   [...repeat(3,urh),...repeat(2,hem)],
   repeat(2,knn),
   ['Nozomi'],
   repeat(8,everyone),
   [everyone,everyone,'Todos · respuesta de Umi y Rin'],
   [...repeat(3,hem),...repeat(2,knn)],
   repeat(2,urh),
   ['Kotori · Nico'],
   repeat(8,everyone),
   ['Nozomi','Nozomi','Kotori · Nico','Kotori · Nico',...repeat(4,everyone)],
   repeat(3,everyone)
  ],
  dialogueAfterStanza:9
 },
 'lets-be-one':{
  source:'https://ameblo.jp/lilla-part/entry-12870249699.html',
  status:'fan-transcription-condensed-spanish',
  originalCast:['Kanon','Keke','Chisato','Sumire','Ren','Kinako','Mei','Shiki','Natsumi','Margarete','Tomari'],
  lines:[
   ['Kanon','Kanon · Kinako · Margarete','Todas'],
   ['Kinako · Sumire','Margarete','Tomari · Sumire · Kinako · Margarete'],
   ['Chisato','Keke · Shiki'],
   ['Mei · Natsumi','Ren'],
   ['Todas','Keke · Shiki · Sumire · Kinako','Todas · Ren · Mei','Margarete · Tomari','Chisato · Natsumi · Kanon','Todas'],
   ['Tomari','Tomari','Margarete','Margarete'],
   ['Kinako','Shiki','Natsumi','Mei'],
   ['Todas','Mei · Tomari · Ren · Natsumi','Todas · Kanon · Chisato'],
   ['Chisato','Keke · Sumire','Ren','Kanon','Todas'],
   ['Margarete','Kanon · Margarete','Kanon · Kinako · Margarete'],
   ['Kanon','Todas','Todas','Todas','Todas','Todas']
  ],
  // Single Spanish lines sometimes contain sequential Japanese parts.
  // Boundaries are preliminary and preserve every original Spanish character.
  cuts:{
   '1:0':[{through:'andando, ',voice:'kinako'},{voice:'sumire'}],
   '1:2':[{through:'amor ',voice:'tomari'},{voice:'sumire+kinako+margarete+tomari'}],
   '2:1':[{through:'que ',voice:'keke'},{through:'inquebrantable ',voice:'shiki'},{voice:'keke+shiki'}],
   '3:0':[{through:'haber, ',voice:'mei'},{voice:'natsumi'}],
   '4:1':[{through:'seguramente ',voice:'keke+shiki'},{through:'conocido ',voice:'sumire+kinako'},{voice:'keke+shiki+sumire+kinako'}],
   '4:2':[{through:'seguir, ',voice:'shared'},{voice:'ren+mei'}],
   '4:4':[{through:'promesa ',voice:'chisato+natsumi'},{voice:'kanon'}],
   '7:1':[{through:'sueño ',voice:'mei+tomari'},{through:'compartimos ',voice:'ren+natsumi'},{voice:'mei+tomari+ren+natsumi'}],
   '7:2':[{through:'seguir, ',voice:'shared'},{voice:'kanon+chisato'}],
   '9:2':[{through:'significa ',voice:'kanon+kinako'},{through:'verdad ',voice:'kanon+kinako+margarete'},{voice:'shared'}],
   '10:1':[{through:'seguramente, ',voice:'margarete+tomari'},{through:'conocido, ',voice:'kinako+mei+shiki+natsumi'},{voice:'kanon+keke+chisato+sumire+ren'}]
  }
 },
 'gimi-gimi':{
  source:'https://mayopan.jp/music/',
  status:'official-cast-only',
  originalCast:['Live','Ichiko','Fu','Tokage','Yuki'],
  originalCastJa:['りぶ','苺子','譜風','十景','ゆき'],
  status:'fan-color-coded-video-preliminary',
  versionLines:{
   full:[
    Array(4).fill('Todos'),
    ['unattributed','unattributed','Todos','Todos','Live · Ichiko','Fu · Tokage','Yuki','Yuki'],
    ['Todos','Todos','Todos','Todos','Todos','Ichiko','Live'],
    ['Todos','Live','Ichiko','Todos','Todos','Todos','unattributed','unattributed'],
    ['Ichiko','Live','Fu','Tokage'],
    ['Todos','Todos','Todos','Todos','Todos','Yuki','unattributed'],
    ['Todos','Yuki','Todos','Todos'],
    ['Yuki','Tokage','Fu','Ichiko','Live'],
    Array(4).fill('Todos'),
    ['Live'],
    ['Todos','Todos','Todos','Todos','unattributed','Todos','unattributed','Todos'],
    Array(8).fill('Todos'),
    Array(2).fill('Todos')
   ]
  },
  // Confirmed visual switches in the full video; applies to both same-text releases.
  cuts:{
   '1:0':[{through:'despierte ',voice:'live'},{voice:'ichiko'}],
   '1:1':[{through:'menos cero ',voice:'fu'},{voice:'tokage'}],
   '3:7':[{through:'tu tengas ',voice:'ichiko'},{through:'tu mente ',voice:'tokage'},{voice:'fu+ichiko+tokage'}],
   '10:4':[{through:'millón ',voice:'tokage'},{through:'atestiguan ',voice:'fu'},{voice:'ichiko'}]
  }
 },
 'halloween-night':{
  source:'https://hololive.hololivepro.com/music/%E4%BB%8A%E5%AE%B5%E3%81%AFhalloween-night/',
  status:'official-cast-only',
  originalCast:['Yozora Mel','Murasaki Shion','Yuzuki Choco','Uruha Rushia'],
  status:'official-short-mv-visual-preliminary',
  lines:[
   ['Rushia','Rushia','Choco','Choco','Mel','Shion','Mel','Rushia','Shion','Shion'],
   ['unattributed','unattributed','unattributed','unattributed','unattributed','unattributed','unattributed','unattributed','unattributed'],
   ['Choco','unattributed','Mel','Rushia','Shion'],
   ['Todos','Todos','Choco','Mel','Todos','Todos','Shion'],
   ['Rushia','Todos','Todos','Shion','Rushia','unattributed','Todos','Choco','Todos']
  ],
  cuts:{
   '3:6':[{through:'bailar ',voice:'shared'},{voice:'shion'}],
   '4:3':[{through:'volar',voice:'shion'},{voice:'unattributed'}],
   '4:4':[{through:'bailar',voice:'rushia'},{voice:'unattributed'}],
   '4:5':[{through:'Está, ',voice:'mel'},{voice:'rushia'}]
  }
 }
};
export const ruteshiDialogueCast=[
 {voice:'Leon Live☆Heart',original:'Maki',credit:true},
 {voice:'Valeria Osorio',original:'Honoka',credit:true},
 {voice:'Blaze Leiton',original:'Eli',credit:false,asScriptRole:true},
 {voice:'Lanti Keeki',original:'Umi',credit:true},
 {voice:'Glaze Reyna',original:'Rin',credit:true,asScriptRole:true},
 {voice:'Doraimonuwu',original:'Hanayo',credit:true,url:'https://www.twitch.tv/doraimonuwu'},
 {voice:'CamininaVT',original:'Nico',credit:true,url:'https://www.twitch.tv/camininavt'},
 {voice:'Misao Chan',original:'Kotori',credit:true},
 {voice:'V.A.F.M.O.',original:'Nozomi',credit:true}
];


// Color legends follow the established Scripta Lyrica colorStanzas/colorLegend
// format. The numbers below are swatches sampled from franchise-site materials
// and catalogued by fan color-code references, NOT necessarily official brand HEX
// specifications. The Mayonaka Punch set is an editorial approximation sampled
// from official character illustrations: no canonical character HEX was found.
// textColor only brightens very dark official-associated marks for dark-mode reading.
export const originalColorPalettes={
 'ruteshi-kisuki-shiteru':[
  {id:'honoka',label:'Honoka Kōsaka',color:'#F38500'},
  {id:'eli',label:'Eli Ayase',color:'#7AEEFF'},
  {id:'kotori',label:'Kotori Minami',color:'#CEBFBF'},
  {id:'umi',label:'Umi Sonoda',color:'#1769FF',textColor:'#8EBBFF'},
  {id:'rin',label:'Rin Hoshizora',color:'#FFF832'},
  {id:'maki',label:'Maki Nishikino',color:'#FF503E'},
  {id:'nozomi',label:'Nozomi Tōjō',color:'#C455F6'},
  {id:'hanayo',label:'Hanayo Koizumi',color:'#6AE673'},
  {id:'nico',label:'Nico Yazawa',color:'#FF4F91'}
 ],
 'lets-be-one':[
  {id:'kanon',label:'Kanon Shibuya',color:'#FF7F27'},
  {id:'keke',label:'Keke Tang',color:'#A0FFF9'},
  {id:'chisato',label:'Chisato Arashi',color:'#FF6E90'},
  {id:'sumire',label:'Sumire Heanna',color:'#74F466'},
  {id:'ren',label:'Ren Hazuki',color:'#0000A0',textColor:'#9CA9FF'},
  {id:'kinako',label:'Kinako Sakurakoji',color:'#FFF442'},
  {id:'mei',label:'Mei Yoneme',color:'#FF3535',textColor:'#FF8383'},
  {id:'shiki',label:'Shiki Wakana',color:'#B2FFDD'},
  {id:'natsumi',label:'Natsumi Onitsuka',color:'#FF51C4'},
  {id:'margarete',label:'Wien Margarete',color:'#E49DFD'},
  {id:'tomari',label:'Tomari Onitsuka',color:'#4CD2E2'}
 ],
 'gimi-gimi':[
  {id:'live',label:'Live',color:'#ED788B'},
  {id:'ichiko',label:'Ichiko',color:'#FFDC6A'},
  {id:'fu',label:'Fu',color:'#96D1B5'},
  {id:'tokage',label:'Tokage',color:'#8378B5'},
  {id:'yuki',label:'Yuki',color:'#B14262'}
 ],
 'halloween-night':[
  {id:'mel',label:'Yozora Mel',color:'#FED62A'},
  {id:'shion',label:'Murasaki Shion',color:'#8466FE'},
  {id:'choco',label:'Yuzuki Choco',color:'#FE739E'},
  {id:'rushia',label:'Uruha Rushia',color:'#19E8C9'}
 ]
};
export const colorSources={
 'ruteshi-kisuki-shiteru':{source:'https://ratius.github.io/LLS/color.html',status:'fan-compilation-of-franchise-profile-swatches'},
 'lets-be-one':{source:'https://moegirl.uk/Template:LoveLive!角色颜色/doc',status:'fan-extraction-from-franchise-official-site'},
 'gimi-gimi':{source:'https://mayopan.jp/character/',status:'editorial-approximation-from-official-character-art'},
 'halloween-night':{source:'https://vtubernews.com/datalist-0009/',status:'fan-maintained-talent-color-catalog'}
};
const lookup={};
for(const [slug,members] of Object.entries(originalColorPalettes)){
 lookup[slug]=Object.fromEntries(members.map(m=>[m.id,m]));
}
const labelIds={
 'Honoka':'honoka','Eli':'eli','Kotori':'kotori','Umi':'umi','Rin':'rin','Maki':'maki','Nozomi':'nozomi','Hanayo':'hanayo','Nico':'nico',
 'Kanon':'kanon','Keke':'keke','Chisato':'chisato','Sumire':'sumire','Ren':'ren','Kinako':'kinako','Mei':'mei','Shiki':'shiki','Natsumi':'natsumi','Margarete':'margarete','Tomari':'tomari',
 'Live':'live','Ichiko':'ichiko','Fu':'fu','Tokage':'tokage','Yuki':'yuki',
 'Mel':'mel','Shion':'shion','Choco':'choco','Rushia':'rushia'
};
const groupVoice=(label,slug)=>{
 if(!label||label==='unattributed')return 'unattributed';
 if(label==='Todos'||label==='Todas'||label.includes('Todos')||label.includes('Todas')||label.includes('generación'))return 'shared';
 const ids=label.split(' · ').map(n=>labelIds[n]);
 if(ids.some(id=>!id||!lookup[slug][id]))throw new Error('Unverified line-role tag: '+slug+' '+label);
 return ids.join('+');
};
const coloredLine=(line,label,slug)=>{
 // Preserve the lyric text exactly and color embedded responses separately.
 if(slug==='ruteshi-kisuki-shiteru'&&label?.startsWith('Todos · respuesta de')){
  const i=line.lastIndexOf(' (');
  if(i>=0){const solo=label.includes('Nozomi')?'nozomi':'umi+rin';
   return [{text:line.slice(0,i+1),voice:'shared'},{text:line.slice(i+1),voice:solo,secondary:true}];}
 }
 if(slug==='ruteshi-kisuki-shiteru'&&line==='(Chun Chun) (Love Nico)'){
  return [{text:'(Chun Chun) ',voice:'kotori',secondary:true},{text:'(Love Nico)',voice:'nico',secondary:true}];
 }
 return [{text:line,voice:label?groupVoice(label,slug):'unattributed'}];
};

/** Convert existing validated reference labels into the approved colorStanzas
 * display without injecting parenthetical labels into ANY sung lyric. */
export function colorDivisionFromReference(lyric,slug){
 const spec=lineAttributions[slug],palette=originalColorPalettes[slug];
 if(!lyric?.text||!spec||!palette)return lyric;
 const stanzas=lyric.text.trim().split(/\n\s*\n/).map(x=>x.split('\n'));
 const lineLabels=spec.versionLines?.[lyric.version||'full']||spec.lines;
 // The Gimi Gimi full and TV adaptations currently carry the same text,
 // but are kept as independent named versions.
 if(lineLabels&&(lineLabels.length!==stanzas.length||stanzas.some((rows,i)=>lineLabels[i].length!==rows.length)))
  throw new Error('Source/line division mismatch: '+slug);
 const partsFor=(line,cuts,key)=>{
  if(!cuts)return coloredLine(line,lineLabels?.[Number(key.split(':')[0])]?.[Number(key.split(':')[1])],slug);
  let rest=line;
  const out=cuts.map((part,index)=>{
   if(part.through===undefined){
    if(index!==cuts.length-1)throw new Error('Non-final segment with no boundary: '+slug+' '+key);
    const end=rest;rest='';
    return {text:end,voice:part.voice};
   }
   const where=rest.indexOf(part.through);
   if(where<0)throw new Error('Missing preliminary boundary '+part.through+' in '+slug+' '+key);
   const end=rest.slice(0,where+part.through.length);
   rest=rest.slice(where+part.through.length);
   return {text:end,voice:part.voice};
  });
  if(rest||out.map(x=>x.text).join('')!==line)throw new Error('Text mismatch in '+slug+' '+key);
  return out;
 };
 const colorStanzas=stanzas.map((rows,i)=>rows.map((line,j)=>partsFor(line,spec.cuts?.[i+':'+j],i+':'+j)));
 return {...lyric,colorRole:'voice',colorLegend:palette,colorStanzas,
  dialogueAfterStanza:spec.dialogueAfterStanza,
  hiddenVoiceIds:['unattributed'],
  sharedLabel:{es:'Todas',en:'All',ja:'全員'},
  sharedColor:'#F0F3FF',
  distributionProvenance:spec.status};
}
