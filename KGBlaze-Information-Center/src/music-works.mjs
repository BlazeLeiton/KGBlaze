// Rebel Mix original-work names: stable catalog key, locale display, search aliases.
// Pokémon season numbers refer to the equivalent international distribution, not Japanese arc numbers.
// Assign the FIRST international season containing an appearance of the song, not a range.
// Japanese titles/subdivisions are independent: per-song sourceJapanese overrides the series fallback.
const names=(en,ja,es=en,aliases=[])=>({es,en,ja,aliases});
export const works={
 'The Executioner and Her Way of Life':names('The Executioner and Her Way of Life','処刑少女の生きる道','The Executioner and Her Way of Life',['Shokei Shoujo no Virgin Road','The Executioner and Her Way of Life']),
 'Sword Art Online':names('Sword Art Online','ソードアート・オンライン'),
 'Sword Art Online: Ordinal Scale':names('Sword Art Online: Ordinal Scale','劇場版 ソードアート・オンライン -オーディナル・スケール-'),
 'Pokémon Original':{pokemon:true,romaji:'Pocket Monsters',...names('Pokémon Original Series','ポケットモンスター','Pokémon: Serie original'),seasons:{1:names('Pokémon: Indigo League','ポケットモンスター','Pokémon: Liga Añil'),2:names('Pokémon: Adventures in the Orange Islands','ポケットモンスター','Pokémon: Aventuras en las Islas Naranja'),3:names('Pokémon: The Johto Journeys','ポケットモンスター','Pokémon: Los viajes Johto'),4:names('Pokémon: Johto League Champions','ポケットモンスター','Pokémon: Campeones de la Liga Johto'),5:names('Pokémon: Master Quest','ポケットモンスター','Pokémon: La búsqueda del maestro')}},
 'Pokémon Ruby & Sapphire':{pokemon:true,romaji:'Pocket Monsters Advanced Generation',...names('Pokémon the Series: Ruby and Sapphire','ポケットモンスター アドバンスジェネレーション','Pokémon: Rubí y Zafiro'),seasons:{6:names('Pokémon: Advanced','ポケットモンスター アドバンスジェネレーション','Pokémon: Fuerza Máxima'),7:names('Pokémon: Advanced Challenge','ポケットモンスター アドバンスジェネレーション','Pokémon: Reto Máximo'),8:names('Pokémon: Advanced Battle','ポケットモンスター アドバンスジェネレーション','Pokémon: Batalla Avanzada'),9:names('Pokémon: Battle Frontier','ポケットモンスター アドバンスジェネレーション','Pokémon: Batalla de la Frontera')}},
 'Classroom of the Elite':{...names('Classroom of the Elite','ようこそ実力至上主義の教室へ'),seasons:{1:names('Classroom of the Elite','ようこそ実力至上主義の教室へ'),2:names('Classroom of the Elite II','ようこそ実力至上主義の教室へ 2nd Season'),3:names('Classroom of the Elite III','ようこそ実力至上主義の教室へ 3rd Season')}},
 'Gushing Over Magical Girls':names('Gushing Over Magical Girls','魔法少女にあこがれて','Gushing Over Magical Girls',['Mahou Shoujo ni Akogarete']),
 'Doki Doki Literature Club!':names('Doki Doki Literature Club!','ドキドキ文芸部！'),
 'BanG Dream!':names('BanG Dream!','バンドリ！'),
 'BELLE':names('BELLE','竜とそばかすの姫','BELLE',['Ryū to Sobakasu no Hime']),
 'Persona 3 FES':names('Persona 3 FES','ペルソナ3フェス'),
 'My Hero Academia: Vigilantes':names('My Hero Academia: Vigilantes','ヴィジランテ -僕のヒーローアカデミア ILLEGALS-'),
 'Mobile Suit Gundam: The Witch from Mercury':names('Mobile Suit Gundam: The Witch from Mercury','機動戦士ガンダム 水星の魔女','Mobile Suit Gundam: La Bruja de Mercurio'),
 'Sword Art Online Alternative: Gun Gale Online':names('Sword Art Online Alternative: Gun Gale Online','ソードアート・オンライン オルタナティブ ガンゲイル・オンライン'),
 'Our Last Crusade or the Rise of a New World':names('Our Last Crusade or the Rise of a New World','キミと僕の最後の戦場、あるいは世界が始まる聖戦'),
 'Laid-Back Camp':names('Laid-Back Camp','ゆるキャン△','Laid-Back Camp',['Yuru Camp']),
 'Confession Executive Committee':names('Confession Executive Committee','告白実行委員会','Confession Executive Committee',['Kokuhaku Jikkou Iinkai','HoneyWorks']),
 'VOCALOID':names('VOCALOID','VOCALOID',['VOCALOID'].join(''),['Hatsune Miku','Vocaloid']),
 'Otherside Picnic':names('Otherside Picnic','裏世界ピクニック','Otherside Picnic',['Urasekai Picnic']),
 'O Maidens in Your Savage Season':names('O Maidens in Your Savage Season','荒ぶる季節の乙女どもよ。','O Maidens in Your Savage Season',['Araburu Kisetsu no Otome-domo yo']),
 'Pokémon Sun & Moon':{pokemon:true,romaji:'Pocket Monsters Sun & Moon',...names('Pokémon the Series: Sun & Moon','ポケットモンスター サン＆ムーン','La Serie Pokémon: Sol y Luna',['Sun & Moon','Sol y Luna','Pocket Monsters Sun & Moon']),seasons:{20:names('Pokémon the Series: Sun & Moon','ポケットモンスター サン＆ムーン','La Serie Pokémon: Sol y Luna'),21:names('Pokémon the Series: Sun & Moon—Ultra Adventures','ポケットモンスター サン＆ムーン','La Serie Pokémon: Sol y Luna – Ultra Aventuras'),22:names('Pokémon the Series: Sun & Moon—Ultra Legends','ポケットモンスター サン＆ムーン','La Serie Pokémon: Sol y Luna – Ultraleyendas')}},
 'The Asterisk War':names('The Asterisk War','学戦都市アスタリスク','The Asterisk War',['Gakusen Toshi Asterisk']),
 'Sagrada Reset':names('Sagrada Reset','サクラダリセット','Sagrada Reset',['Sakurada Reset']),
 'Sword Art Online Alternative: Gun Gale Online II':names('Sword Art Online Alternative: Gun Gale Online II','ソードアート・オンライン オルタナティブ ガンゲイル・オンラインII','Sword Art Online Alternative: Gun Gale Online II',['GGO II','SAO Alternative']),
 'Mayonaka Punch':names('Mayonaka Punch','真夜中ぱんチ','Mayonaka Punch',['Mayopan']),
 'Bocchi the Rock!':names('Bocchi the Rock!','ぼっち・ざ・ろっく！','Bocchi the Rock!',['Bocchi la Roca','Bocchi the Rock']),
 'Tales of Zestiria the X':names('Tales of Zestiria the X','テイルズ オブ ゼスティリア ザ クロス'),
 'Formula 1':names('Formula 1','フォーミュラ1','Fórmula 1',['F1','Aston Martin','Fernando Alonso']),
 'Pan American Games':names('Pan American Games','パンアメリカン競技大会','Juegos Panamericanos',['Guadalajara 2011','Juegos Panamericanos Guadalajara 2011','Panamericanos']),
 'No Game No Life: Zero':names('No Game No Life: Zero','ノーゲーム・ノーライフ ゼロ'),
 'Stardust Telepath':names('Stardust Telepath','星屑テレパス','Stardust Telepath',['Hoshikuzu Telepath']),
 'The Day I Became a God':names('The Day I Became a God','神様になった日','The Day I Became a God',['Kamisama ni Natta Hi']),
 'Kuma Kuma Kuma Bear':names('Kuma Kuma Kuma Bear','くまクマ熊ベアー'),
 'Kuma Kuma Kuma Bear Punch!':names('Kuma Kuma Kuma Bear Punch!','くまクマ熊ベアーぱーんち！'),
 'BOFURI 2':names('BOFURI: I Don’t Want to Get Hurt, so I’ll Max Out My Defense. Season 2','痛いのは嫌なので防御力に極振りしたいと思います。2','BOFURI 2',['BOFURI','Bofuri Season 2']),
 'A Place Further than the Universe':names('A Place Further than the Universe','宇宙よりも遠い場所','A Place Further than the Universe',['Sora yori mo Tooi Basho','Sora Yori']),
 'The Genius Prince’s Guide to Raising a Nation Out of Debt':names('The Genius Prince’s Guide to Raising a Nation Out of Debt','天才王子の赤字国家再生術','The Genius Prince’s Guide to Raising a Nation Out of Debt',['Tensai Ouji','Tensai Ōji']),
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
 "Girls' Frontline":names("Girls' Frontline","ドールズフロントライン","Girls' Frontline",["Dolls' Frontline","Doll's Frontline","少女前線"]),
 'Lycoris Recoil':names('Lycoris Recoil','リコリス・リコイル','Lycoris Recoil',['LycoReco']),
 'SSSS.GRIDMAN':names('SSSS.GRIDMAN','SSSS.GRIDMAN'),
 'SSSS.DYNAZENON':names('SSSS.DYNAZENON','SSSS.DYNAZENON'),
 'Pokémon':names('Pokémon','ポケモン'),
 'Azur Lane':names('Azur Lane','アズールレーン'),
 'Azur Lane The Animation':names('Azur Lane The Animation','アズールレーン THE ANIMATION'),
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

// Filter families are independent of the credited original work.
const familyNames={
 'Pokémon':names('Pokémon','ポケモン'),
 'Love Live!':names('Love Live!','ラブライブ！'),
 'hololive':names('hololive','ホロライブ'),
 'Madoka Magica':names('Madoka Magica','魔法少女まどか☆マギカ'),
 'Oregairu':names('Oregairu','俺ガイル'),
 'Masamune-kun’s Revenge':names('Masamune-kun’s Revenge','政宗くんのリベンジ'),
 'GRIDMAN UNIVERSE':names('GRIDMAN UNIVERSE','グリッドマン ユニバース'),
 'Fate/stay night: Unlimited Blade Works':names('Fate/stay night: Unlimited Blade Works','Fate/stay night [Unlimited Blade Works]'),
 'Fate/series':names('Fate/series','Fateシリーズ'),
 'Arpeggio of Blue Steel':names('Arpeggio of Blue Steel','蒼き鋼のアルペジオ')
};
export function familyForWork(key){
 if(/^Sword Art Online(?:$|:| Alternative\b)/.test(key))return 'Sword Art Online';
 if(key==='Azur Lane The Animation'||key==='Azur Lane')return 'Azur Lane';
 if(key==='Kuma Kuma Kuma Bear'||key==='Kuma Kuma Kuma Bear Punch!')return 'Kuma Kuma Kuma Bear';
 if(isPokemonWork(key)||key==='Pokémon'||/^Pokémon\b/u.test(key))return 'Pokémon';
 if(/^Love Live!|^Ikizulive!/i.test(key))return 'Love Live!';
 if(/^hololive\b/i.test(key))return 'hololive';
 if(['Puella Magi Madoka Magica','Madoka Magica: Rebellion'].includes(key))return 'Madoka Magica';
 if(/^Oregairu\b/.test(key))return 'Oregairu';
 if(/^Masamune-kun[’']s Revenge/.test(key))return 'Masamune-kun’s Revenge';
 if(['SSSS.GRIDMAN','SSSS.DYNAZENON','GRIDMAN UNIVERSE'].includes(key))return 'GRIDMAN UNIVERSE';
 if(/^Fate(?:\/|$)/i.test(key))return 'Fate/series';
 return key;
}
export function workFamilies(song){
 return [...new Set((song.sourceWorks||[song.series]).filter(Boolean).map(familyForWork))];
}
export function familyLabel(key,lang){return familyNames[key]?.[lang]||workName(key,lang);}
export function filterAffiliations(song){
 const a=song.affiliation;if(!a)return [];
 if(a.franchise==='hololive')return song.hololiveAllBranches?['holo-en','holo-jp','holo-id']:['holo-en','holo-jp','holo-id'].filter(x=>x===a.branch);
 if(a.franchise==='love-live')return [...new Set([...(a.groups||[]),...(a.participatingGroups||[]),...(a.unit==='ll-aiscream'?['ll-aiscream']:[])])];
 return [];
}

// Compatibility for the first editorial revision.
export const primaryWorkKey=familyForWork;
export const primaryWorkKeys=workFamilies;
