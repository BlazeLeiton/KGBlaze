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
   ['Kanon · Todas','3.ª · 2.ª · 1.ª generación','Todas','Todas','Todas','Todas']
  ]
 },
 'gimi-gimi':{
  source:'https://mayopan.jp/music/',
  status:'official-cast-only',
  originalCast:['Live (りぶ)','Ichiko (苺子)','Fū (譜風)','Tokage (十景)','Yuki (ゆき)'],
  defaultLabel:'Mayopan'
 },
 'halloween-night':{
  source:'https://hololive.hololivepro.com/music/%E4%BB%8A%E5%AE%B5%E3%81%AFhalloween-night/',
  status:'official-cast-only',
  originalCast:['Yozora Mel','Murasaki Shion','Yuzuki Choco','Uruha Rushia'],
  defaultLabel:'hololive IDOL PROJECT'
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
  {id:'live',label:'Live (りぶ)',color:'#EF96C8'},
  {id:'ichiko',label:'Ichiko (苺子)',color:'#F5D45D'},
  {id:'fu',label:'Fū (譜風)',color:'#88D7B5'},
  {id:'tokage',label:'Tokage (十景)',color:'#A894E5'},
  {id:'yuki',label:'Yuki (ゆき)',color:'#B96582'}
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
 'Kanon':'kanon','Keke':'keke','Chisato':'chisato','Sumire':'sumire','Ren':'ren','Kinako':'kinako','Mei':'mei','Shiki':'shiki','Natsumi':'natsumi','Margarete':'margarete','Tomari':'tomari'
};
const groupVoice=(label,slug)=>{
 if(!label||label==='Todos'||label==='Todas'||label.includes('Todos')||label.includes('Todas')||label.includes('generación'))return 'shared';
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
 if(spec.lines&&(spec.lines.length!==stanzas.length||stanzas.some((rows,i)=>spec.lines[i].length!==rows.length)))
  throw new Error('Source/line division mismatch: '+slug);
 const colorStanzas=stanzas.map((rows,i)=>rows.map((line,j)=>coloredLine(line,spec.lines?.[i]?.[j],slug)));
 return {...lyric,colorRole:'voice',colorLegend:palette,colorStanzas,
  dialogueAfterStanza:spec.dialogueAfterStanza,
  hiddenVoiceIds:['unattributed'],
  sharedLabel:{es:'Todas',en:'All',ja:'全員'},
  sharedColor:'#F0F3FF',
  distributionProvenance:spec.status};
}
