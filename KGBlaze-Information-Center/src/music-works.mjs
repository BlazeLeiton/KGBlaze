// Rebel Mix original-work names: stable catalog key, locale display, search aliases.
// Pokémon season numbers refer to the equivalent international distribution, not Japanese arc numbers.
const names=(en,ja,es=en,aliases=[])=>({es,en,ja,aliases});
export const works={
 'Azur Lane':names('Azur Lane','アズールレーン'),
 'Pokémon Horizons':{...names('Pokémon Horizons: The Series','ポケットモンスター（2023）','La Serie Horizontes Pokémon',['Pokémon Horizons','Pokémon Horizontes','Horizontes Pokémon','Pocket Monsters 2023','Poketto Monsutā 2023']),seasons:{2:names('Pokémon Horizons: Season 2—The Search for Laqua','ポケットモンスター（2023）','La Serie Horizontes Pokémon: En busca de Laqua')}},
 'Pokémon XY':{...names('Pokémon the Series: XY','ポケットモンスター XY','La Serie Pokémon XY',['Pocket Monsters XY','Poketto Monsutā XY','Kalos Quest','XY&Z']),seasons:{
  17:names('Pokémon the Series: XY','ポケットモンスター XY','La Serie Pokémon XY'),
  18:names('Pokémon the Series: XY Kalos Quest','ポケットモンスター XY','La Serie Pokémon XY-Expediciones en Kalos'),
  19:names('Pokémon the Series: XYZ','ポケットモンスター XY&Z','La Serie Pokémon XYZ')
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
