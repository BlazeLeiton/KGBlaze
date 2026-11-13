// Historical affiliation at ORIGINAL SONG release, independent of cover release.
 // Stable tag IDs support a franchise, branch, generation/unit and crossover memberships.
const tag=(id,en,ja=en,es=en)=>({id,es,en,ja});
export const franchiseRegistry={
 hololive:{
  root:tag('hololive','hololive','ホロライブ'),
  branches:[tag('holo-jp','hololive JP','ホロライブJP'),tag('holo-en','hololive English','ホロライブEnglish'),tag('holo-id','hololive Indonesia','ホロライブインドネシア'),tag('holo-cn','hololive China','ホロライブ中国'),tag('holo-devis','hololive DEV_IS')],
  units:[tag('holo-myth','Myth'),tag('holo-council','Council'),tag('holo-hope','Project: HOPE'),tag('holo-promise','Promise'),tag('holo-advent','Advent'),tag('holo-justice','Justice'),tag('holo-regloss','ReGLOSS'),tag('holo-flowglow','FLOW GLOW'),tag('holo-area15','AREA15'),tag('holo-holoro','holoro'),tag('holo-holoh3ro','holoh3ro'),...Array.from({length:6},(_,i)=>tag('holo-gen'+i,'Gen '+i,i+'期生','Generación '+i)),tag('holo-gamers','hololive GAMERS','ホロライブゲーマーズ'),tag('holo-holox','Secret Society holoX','秘密結社holoX')]
 },
 'love-live':{
  root:tag('love-live','Love Live!','ラブライブ！'),
  groups:[tag('ll-muse',"μ's"),tag('ll-aqours','Aqours'),tag('ll-nijigasaki','Nijigasaki','虹ヶ咲'),tag('ll-liella','Liella!'),tag('ll-hasunosora','Hasunosora','蓮ノ空'),tag('ll-bluebird','Ikizurai-bu!','いきづらい部！'),tag('ll-aiscream','AiScReam'),tag('ll-crossover','Crossover','シリーズ横断','Multiserie')],
  series:{
   'Love Live! School Idol Project':['ll-muse'],
   'Love Live! Sunshine!!':['ll-aqours'],
   'Love Live! Nijigasaki High School Idol Club':['ll-nijigasaki'],
   'Love Live! Superstar!!':['ll-liella'],
   'Love Live! Hasunosora Girls’ High School Idol Club':['ll-hasunosora'],
   'Ikizulive! LOVELIVE! BLUEBIRD':['ll-bluebird'],
   'Love Live!':['ll-crossover']
  }
 }
};
const all=[...Object.values(franchiseRegistry).flatMap(f=>[f.root,...(f.branches||[]),...(f.units||[]),...(f.groups||[])])];
export function franchiseTagLabel(id,lang){const t=all.find(t=>t.id===id);return t?.[lang]||t?.en||id;}
export function franchiseTags(song){
 const a=song.affiliation;if(!a)return [];
 // Debut cohort remains searchable, but never replaces original-release unit.
 return [...new Set([a.franchise,a.branch,...(a.groups||[]),a.unit,a.debutUnit,...(a.participatingGroups||[])].filter(Boolean))];
}
export function affiliationWork(song,lang){
 const a=song.affiliation;
 if(a?.franchise!=='hololive')return null;
 const brand=a.brandAtRelease|| (a.branch?franchiseTagLabel(a.branch,lang):franchiseTagLabel('hololive',lang));
 return brand+(a.unit?' -'+franchiseTagLabel(a.unit,lang)+'-':'');
}
export function affiliationDetails(song,lang){
 const a=song.affiliation;if(!a)return [];
 const labels={es:{branch:'Rama histórica',unit:'Unidad al estreno original',debut:'Generación de debut',group:'Grupo principal',participants:'Grupos participantes',event:'Evento / proyecto'},en:{branch:'Historical branch',unit:'Unit at original release',debut:'Debut cohort',group:'Main group',participants:'Participating groups',event:'Event / project'},ja:{branch:'旧所属グループ',unit:'原曲発表時のユニット',debut:'デビュー時の期・ユニット',group:'所属グループ',participants:'参加グループ',event:'イベント・企画'}}[lang];
 const rows=[];
 if(a.branch)rows.push([labels.branch,franchiseTagLabel(a.branch,lang)]);
 if(a.unit)rows.push([labels.unit,franchiseTagLabel(a.unit,lang)]);
 if(a.debutUnit&&a.debutUnit!==a.unit)rows.push([labels.debut,franchiseTagLabel(a.debutUnit,lang)]);
 if(a.groups?.length)rows.push([labels.group,a.groups.map(id=>franchiseTagLabel(id,lang)).join(' · ')]);
 if(a.participatingGroups?.length)rows.push([labels.participants,a.participatingGroups.map(id=>franchiseTagLabel(id,lang)).join(' · ')]);
 if(a.event)rows.push([labels.event,a.event]);
 return rows;
}
