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
   [everyone,everyone,'Todos · respuesta de Umi, Rin y Hanayo'],
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
