// Public metadata pilot. Publication IDs and dates from ReSpark R8 historical exports.
// Do not publish private lyrics, audio or unverified credits here.
const v=(id,langs,date,videoId,label,extra={})=>({id,langs,year:Number(date.slice(0,4)),date,videoId,label,...extra});
const es=['Español','Spanish','スペイン語'],en=['Inglés','English','英語'],ja=['Japonés','Japanese','日本語'],multi=['Multilingüe','Multilingual','多言語'];
// sourceEdition is the anime's music edition, never the cover's performance language.
// Optional region/localization and sourceArc are kept separate from the series/season.
export const songs=[
 {slug:'blue-spirit',title:'Blue Spirit',artist:'Astrum',series:'Azur Lane',sourceDetail:'Universe in Unison',versions:[v('es',['ES'],'2022-04-01','UpSPzNDYHhE',es),v('en',['EN'],'2024-04-26','v3QAe_f6Eh0',en)]},
 {slug:'dokimeki-diary',title:'ドキメキダイアリー',romanized:'Dokimeki Diary',artist:'asmi feat. Chinozo',series:'Pokémon Horizons',season:1,sourceEdition:'jp',theme:'OP 1',sourceArc:'Liko and Roy’s Departure',versions:[v('es',['ES'],'2023-05-09','8sAotUCAJH8',es),v('ensemble',['ES'],'2023-12-21','788bQGCtuvM',['Ensamble','Ensemble','合唱版'])]},
 {slug:'only-one-yell',title:'Only one yell',artist:'9-tie',series:'Selection Project',theme:'ED',firstCover:true,versions:[v('es',['ES'],'2021-12-14','aqNZaI72bGM',es)]},
 {slug:'la-vaguelette',title:'La vaguelette',artist:'Cécilia Cara',series:'Genshin Impact',versions:[v('es-fr',['ES','FR'],'2023-12-01','Y7UBoG9twvc',['Español / Francés','Spanish / French','スペイン語 / フランス語'])]},
 {slug:'snow-halation',title:'Snow halation',artist:"μ's",series:'Love Live! School Idol Project',versions:[v('naked-garden',['ES'],'2023-12-24','8fU_uZrWx6s',['Español · naked garden','Spanish · naked garden','スペイン語 · naked garden'],{arrangement:'naked garden Ver. — ChouCho'}),v('hso-orchestra',['JA'],'2023-12-26','yN26-VzWLro',['Japonés · HSO Orchestra','Japanese · HSO Orchestra','日本語 · HSO Orchestra'],{arrangement:'HSO Orchestra Ver.'})]},
 {slug:'butter-fly',title:'Butter-Fly',artist:'Kōji Wada',series:'Digimon Adventure tri.',versions:[v('multi',[],'2024-08-28','szD0mwa7KIY',multi,{multilingual:true,arrangement:'tri. Version'})]},
 {slug:'are-ga-koi-datta-no-ka-na',title:'あれが恋だったのかな',romanized:'Are ga Koi Datta no ka na',artist:'Kujira feat. nishina',series:'Senpai wa Otokonoko',theme:'ED',versions:[v('es',['ES'],'2024-09-03','Zsa4soVWhk4',es)]},
 {slug:'connect',title:'コネクト',romanized:'Connect',artist:'ClariS',series:'Puella Magi Madoka Magica',theme:'OP',versions:[v('es',['ES'],'2026-10-03','KY678pt_GK0',es)]},
 {slug:'mumei',title:'mumei',artist:'Nanashi Mumei',series:'hololive English',versions:[v('es',['ES'],'2026-10-07','Z-jGRvrjW-I',es)]},
 {slug:'cake-song',title:'Cake Song',artist:null,series:'Madoka Magica: Rebellion',versions:[v('es',['ES'],'2026-11-01','NMw0X9BaW44',['Fandub en español','Spanish fandub','スペイン語吹替'])]}
];
