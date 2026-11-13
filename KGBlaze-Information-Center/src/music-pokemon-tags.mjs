// Editorial anime-era tags, not literal episode geography.
// Season numbering follows international distribution. Horizons restarts at 1.
import {isPokemonWork} from './music-works.mjs';
export const pokemonBlocks=[
 {id:'kanto',label:'Kanto',ja:'カントー',first:1,last:2},
 {id:'johto',label:'Johto',ja:'ジョウト',first:3,last:5},
 {id:'hoenn',label:'Hoenn',ja:'ホウエン',first:6,last:9},
 {id:'sinnoh',label:'Sinnoh',ja:'シンオウ',first:10,last:13},
 {id:'unova',label:'Unova',ja:'イッシュ',first:14,last:16},
 {id:'kalos',label:'Kalos',ja:'カロス',first:17,last:19},
 {id:'alola',label:'Alola',ja:'アローラ',first:20,last:22},
 {id:'journeys',label:'Journeys',ja:'Journeys',first:23,last:25},
 {id:'horizons',label:'Horizons',ja:'Horizons'}
];
export function tagsForSeason(era,season){
 if(!['ash','horizons'].includes(era)||!Number.isInteger(season)||season<1)return null;
 const block=era==='horizons'?pokemonBlocks.find(b=>b.id==='horizons'):pokemonBlocks.find(b=>season>=b.first&&season<=b.last);
 if(!block)return null;
 return {block:block.id,seasonKey:era+':'+season,season};
}
export function pokemonTags(song){
 if(!isPokemonWork(song.series))return null;
 return tagsForSeason(song.series==='Pokémon Horizons'?'horizons':'ash',song.season);
}
export function blockLabel(id,lang){const b=pokemonBlocks.find(x=>x.id===id);return b?(lang==='ja'?b.ja:b.label):id;}
export function seasonTagLabel(tag,lang){
 if(!tag)return '';
 const era=tag.seasonKey.startsWith('horizons:')?'Horizons · ':'';
 return era+({es:'Temporada ',en:'Season ',ja:'海外版シーズン'}[lang]||'Season ')+tag.season;
}
