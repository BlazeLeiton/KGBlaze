// Rebel Mix original-work names: stable catalog key, locale display, search aliases.
// Pokémon season numbers refer to the equivalent international distribution, not Japanese arc numbers.
// Assign the FIRST international season containing an appearance of the song, not a range.
// Japanese titles/subdivisions are independent: per-song sourceJapanese overrides the series fallback.
const names=(en,ja,es=en,aliases=[])=>({es,en,ja,aliases});
export const works={
 'Kantai Collection':names('Kantai Collection','艦隊これくしょん -艦これ-','Kantai Collection',['KanColle','Kantai Collection: KanColle']),
 'High School Fleet':names('High School Fleet','ハイスクール・フリート','High School Fleet',['Haifuri','Hai-Furi']),
 'Arpeggio of Blue Steel':names('Arpeggio of Blue Steel -Ars Nova-','蒼き鋼のアルペジオ -アルス・ノヴァ-','Arpeggio of Blue Steel -Ars Nova-',['Arpeggio of Blue Steel','Aoki Hagane no Arpeggio']),
 'Oregairu':names('My Teen Romantic Comedy SNAFU','やはり俺の青春ラブコメはまちがっている。','Oregairu',['My Teen Romantic Comedy Is Wrong, as I Expected','Yahari Ore no Seishun Love Come wa Machigatteiru','Oregairu']),
 'Oregairu Zoku':names('My Teen Romantic Comedy SNAFU TOO!','やはり俺の青春ラブコメはまちがっている。続','Oregairu Zoku',['Oregairu','My Teen Romantic Comedy Is Wrong, as I Expected Too']),
 'Oregairu Kan':names('My Teen Romantic Comedy SNAFU Climax','やはり俺の青春ラブコメはまちがっている。完','Oregairu Kan',['Oregairu','My Teen Romantic Comedy Is Wrong, as I Expected: Climax']),
 'Hensuki':names("Hensuki: Are You Willing to Fall in Love with a Pervert, as Long as She's a Cutie?",'可愛ければ変態でも好きになってくれますか？','Hensuki',['Kawaikereba Hentai demo Suki ni Natte Kuremasuka']),
 'Science Fell in Love r=1-sinθ':names('Science Fell in Love, So I Tried to Prove It r=1-sinθ','理系が恋に落ちたので証明してみた。r=1-sinθ','Science Fell in Love r=1-sinθ',['Rikekoi']),
 'Shikimori’s Not Just a Cutie':names('Shikimori’s Not Just a Cutie','可愛いだけじゃない式守さん','Shikimori’s Not Just a Cutie',['Kawaii dake ja Nai Shikimori-san']),
 'More than a Married Couple, But Not Lovers':names('More than a Married Couple, But Not Lovers','夫婦以上、恋人未満。','More than a Married Couple, But Not Lovers',['Fuukoi','Fuufu Ijou Koibito Miman']),
 'To LOVE-Ru Darkness':names('To LOVE-Ru Darkness','To LOVEる -とらぶる- ダークネス'),
 'Masamune-kun’s Revenge R':names('Masamune-kun’s Revenge R','政宗くんのリベンジR','Masamune-kun’s Revenge R',['Masamune-kun no Revenge R']),
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
 'Lapis Re:LiGHTs':names('Lapis Re:LiGHTs','ラピスリライツ'),
 'IDOLY PRIDE':names('IDOLY PRIDE','IDOLY PRIDE','IDOLY PRIDE',['アイドリープライド']),
 'Selection Project':names('SELECTION PROJECT','SELECTION PROJECT'),
 'Genshin Impact':names('Genshin Impact','原神'),
 'Love Live! School Idol Project':names('Love Live! School Idol Project','ラブライブ！'),
 'Love Live! Sunshine!!':names('Love Live! Sunshine!!','ラブライブ！サンシャイン!!'),
 'Love Live! Nijigasaki High School Idol Club':names('Love Live! Nijigasaki High School Idol Club','ラブライブ！虹ヶ咲学園スクールアイドル同好会'),
 'Love Live! Superstar!!':names('Love Live! Superstar!!','ラブライブ！スーパースター!!'),
 'Love Live! Hasunosora Girls’ High School Idol Club':names('Love Live! Hasunosora Girls’ High School Idol Club','ラブライブ！蓮ノ空女学院スクールアイドルクラブ'),
 'Ikizulive! LOVELIVE! BLUEBIRD':names('Ikizulive! LOVELIVE! BLUEBIRD','イキヅライブ！ LOVELIVE! BLUEBIRD'),
 'Love Live!':names('Love Live!','ラブライブ！シリーズ'),
 'hololive':names('hololive','ホロライブ'),
 'hololive JP':names('hololive JP','ホロライブJP'),
 'hololive Indonesia':names('hololive Indonesia','ホロライブインドネシア'),
 'hololive China':names('hololive China','ホロライブ中国'),
 'hololive DEV_IS':names('hololive DEV_IS','hololive DEV_IS'),
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
