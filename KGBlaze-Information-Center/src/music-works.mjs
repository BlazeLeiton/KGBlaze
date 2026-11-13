// Rebel Mix original-work names: stable catalog key, locale display, search aliases.
// Pokémon season numbers refer to the equivalent international distribution, not Japanese arc numbers.
// Assign the FIRST international season containing an appearance of the song, not a range.
// Japanese titles/subdivisions are independent: per-song sourceJapanese overrides the series fallback.
const names=(en,ja,es=en,aliases=[])=>({es,en,ja,aliases});
export const works={
 'Azur Lane':names('Azur Lane','アズールレーン'),
 'Pokémon Horizons':{pokemon:true,romaji:'Pocket Monsters (2023)',...names('Pokémon Horizons: The Series','ポケットモンスター（2023）','La Serie Horizontes Pokémon',['Pokémon Horizons','Pokémon Horizontes','Horizontes Pokémon','Pocket Monsters 2023','Poketto Monsutā 2023']),seasons:{2:names('Pokémon Horizons: Season 2—The Search for Laqua','ポケットモンスター（2023）','La Serie Horizontes Pokémon: En busca de Laqua')}},
 'Pokémon XY':{pokemon:true,romaji:'Pocket Monsters XY',...names('Pokémon the Series: XY','ポケットモンスター XY','La Serie Pokémon XY',['Pocket Monsters XY','Poketto Monsutā XY','Kalos Quest','XY&Z']),seasons:{
  17:names('Pokémon the Series: XY','ポケットモンスター XY','La Serie Pokémon XY'),
  18:names('Pokémon the Series: XY Kalos Quest','ポケットモンスター XY','La Serie Pokémon XY-Expediciones en Kalos'),
  19:{...names('Pokémon the Series: XYZ','ポケットモンスター XY&Z','La Serie Pokémon XYZ'),romaji:'Pocket Monsters XY&Z'}
 }},
 'Pokémon Black & White':{pokemon:true,romaji:'Pocket Monsters Best Wishes!',...names('Pokémon: Black & White','ポケットモンスター ベストウイッシュ','Pokémon: Negro y Blanco',['Best Wishes','Pocket Monsters Best Wishes!']),seasons:{
  14:names('Pokémon: Black & White','ポケットモンスター ベストウイッシュ','Pokémon: Negro y Blanco'),
  15:names('Pokémon: BW Rival Destinies','ポケットモンスター ベストウイッシュ','Pokémon Negro y Blanco: Destinos rivales'),
  16:names('Pokémon: BW Adventures in Unova and Beyond','ポケットモンスター ベストウイッシュ','Pokémon Negro y Blanco: Aventuras en Unova y más allá')
 }},
 'Selection Project':names('SELECTION PROJECT','SELECTION PROJECT'),
 'Genshin Impact':names('Genshin Impact','原神'),
 'Love Live! School Idol Project':names('Love Live! School Idol Project','ラブライブ！'),
 'Digimon Adventure tri.':names('Digimon Adventure tri.','デジモンアドベンチャー tri.'),
 'Senpai wa Otokonoko':names('Senpai is an Otokonoko','先輩はおとこのこ','Senpai is an Otokonoko',['Senpai wa Otokonoko','Senpai ha Otokonoko']),
 'Puella Magi Madoka Magica':names('Puella Magi Madoka Magica','魔法少女まどか☆マギカ','Puella Magi Madoka Magica',['Mahou Shoujo Madoka Magica','Mahō Shōjo Madoka Magica']),
 'hololive English':names('hololive English','hololive English'),
 'Madoka Magica: Rebellion':names('Puella Magi Madoka Magica the Movie: Rebellion','劇場版 魔法少女まどか☆マギカ［新編］叛逆の物語','Puella Magi Madoka Magica the Movie: Rebellion',['Madoka Magica: Rebellion','Hangyaku no Monogatari'])
};
export function workName(key,lang,season){
 const work=Object.hasOwn(works,key)?works[key]:null;
 return work?.seasons?.[season]?.[lang]||work?.[lang]||work?.en||key;
}
export function workAliases(key,season){
 const work=Object.hasOwn(works,key)?works[key]:null;
 if(!work)return [key];
 return [...new Set([key,work.es,work.en,work.ja,...work.aliases,...['es','en','ja'].map(l=>workName(key,l,season))])];
}

export function isPokemonWork(key){return Object.hasOwn(works,key)&&works[key].pokemon===true;}
export function japaneseWork(song,romaji=false){
 const work=Object.hasOwn(works,song.series)?works[song.series]:null;
 // Use the actual Japanese broadcast title when known; never derive its season from international numbering.
 return romaji?(song.sourceJapanese?.romaji||work?.seasons?.[song.season]?.romaji||work?.romaji||''):(song.sourceJapanese?.title||workName(song.series,'ja',song.season));
}
export function pokemonWorkLabel(song,lang){
 const suffix=song.sourceEdition==='jp'?(lang==='ja'?'日本版':'JP'):song.sourceEdition==='international'?(lang==='ja'?'海外版':'INT'):'';
 if(lang==='ja')return japaneseWork(song)+(suffix?'（'+suffix+'）':'');
 return workName(song.series,lang,song.season)+(song.season?' · '+(lang==='es'?'Temporada':'Season')+' '+song.season:'')+(suffix?' ('+suffix+')':'');
}
export function pokemonCounterpart(song,lang){
 if(!isPokemonWork(song.series))return '';
 if(lang==='ja')return workName(song.series,'en',song.season)+(song.season?' · Season '+song.season:'');
 return japaneseWork(song,true);
}
