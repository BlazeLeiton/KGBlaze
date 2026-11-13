// Original-performance credits, not the creator's cover cast.
// Names in established Latin spelling and Japanese script are independently stored.
// A group can have a verified lineup without all songs sharing the same performers.
const name=(latin,ja=latin)=>({latin,ja});
const voice=(character,ja,cv,cvJa,extra={})=>({character:name(character,ja),cv:name(cv,cvJa),...extra});
const group=(name,cast,source,extra={})=>({kind:'group',name,cast,source,...extra});
export const originalPerformances={
 'yukitoki':{kind:'artist',name:name('yanaginagi','やなぎなぎ'),cast:[],source:'https://yanaginagi.net/discography/%E3%83%A6%E3%82%AD%E3%83%88%E3%82%AD/',writing:name('yanaginagi','やなぎなぎ'),composition:name('Katsutoshi Kitagawa','北川勝利')},
 'harumodoki':{kind:'artist',name:name('yanaginagi','やなぎなぎ'),cast:[],source:'https://yanaginagi.net/discography/%E6%98%A5%E6%93%AC%E3%81%8D-2/',writing:name('yanaginagi','やなぎなぎ'),composition:name('Katsutoshi Kitagawa','北川勝利')},
 'megumi-no-ame':{kind:'artist',name:name('yanaginagi','やなぎなぎ'),cast:[],source:'https://yanaginagi.net/discography/%E8%8A%BD%E3%81%90%E3%81%BF%E3%81%AE%E9%9B%A8/',writing:name('yanaginagi','やなぎなぎ'),composition:name('Katsutoshi Kitagawa','北川勝利')},

 'song-for-you':{kind:'character',name:name('Mana Nagase','長瀬麻奈'),cast:[voice('Mana Nagase','長瀬麻奈','Sayaka Kanda','神田沙也加')],source:'https://idolypride.jp/gallery/mv_song-for-you/',writing:name('PA-NON'),composition:name('Yu Sakai','さかいゆう')},
 'watashi-no-na-wa-hikari':group(name('LiGHTs'),[
  voice('Tiara','ティアラ','Yukari Anzai','安齋由香里'),
  voice('Rosetta','ロゼッタ','Risa Kubota','久保田梨沙'),
  voice('Lavie','ラヴィ','Live Mukai','向井莉生'),
  voice('Ashley','アシュレイ','Iori Saeki','佐伯伊織'),
  voice('Lynette','リネット','Mizuki Yamamoto','山本瑞稀')
 ],'https://www.youtube.com/watch?v=2pm28PVSYBc',{castSource:'https://www.jvcmusic.co.jp/-/Discography/A026102/VICL-65454.html',writing:name('y0c1e')}),

 'blue-spirit':group(name('Astrum'),[
  voice('Illustrious','イラストリアス','Sora Amamiya','雨宮天'),
  voice('Baltimore','ボルチモア','Minami Takahashi','高橋未奈美'),
  voice('Dido','ダイドー','Ruriko Aoki','青木瑠璃子'),
  voice('Tashkent','タシュケント','Shiori Izawa','井澤詩織'),
  voice('Albacore','アルバコア','Atsumi Tanezaki','種﨑敦美')
 ],'https://yostar-pictures.co.jp/works/detail/1995/',{composition:name('Takuya Ohata','大畑拓也')}),
 'only-one-yell':group(name('9-tie'),[
  voice('Suzune Miyama','美山鈴音','Hinaki Yano','矢野妃菜喜'),
  voice('Rena Hananoi','花野井玲那','Saku Mizuno','水野朔'),
  voice('Hiromi Hamaguri','濱栗広海','Nozomi Nagumo','南雲希美'),
  voice('Nagisa Imau','今鵜凪咲','Ruri Arai','荒井瑠里'),
  voice('Nodoka Yagi','八木野土香','Hina Yomiya','羊宮妃那'),
  voice('Ao Yodogawa','淀川逢生','Yuka Iwahashi','岩橋由佳'),
  voice('Uta Koizumi','小泉詩','Mizuna Shirakawa','白河みずな'),
  voice('Shiori Yamaga','山鹿栞','Miharu Hanai','花井美春'),
  voice('Mako Toma','当麻まこ','Shino Shimoji','下地紫野')
 ],'https://pjselection.com/music.html',{castSource:'https://pjselection.com/character.html'}),
 'snow-halation':group(name("μ's"),[
  voice('Honoka Kosaka','高坂穂乃果','Emi Nitta','新田恵海'),
  voice('Eli Ayase','絢瀬絵里','Yoshino Nanjo','南條愛乃'),
  voice('Kotori Minami','南ことり','Aya Uchida','内田彩'),
  voice('Umi Sonoda','園田海未','Suzuko Mimori','三森すずこ'),
  voice('Rin Hoshizora','星空凛','Riho Iida','飯田里穂'),
  voice('Maki Nishikino','西木野真姫','Pile','Pile'),
  voice('Nozomi Tojo','東條希','Aina Kusuda','楠田亜衣奈'),
  voice('Hanayo Koizumi','小泉花陽','Yurika Kubo','久保ユリカ'),
  voice('Nico Yazawa','矢澤にこ','Sora Tokui','徳井青空')
 ],'https://www.lovelive-anime.jp/otonokizaka/news.php?offset=1118'),
 'cake-song':group(name('Holy Quintet'),[
  voice('Madoka Kaname','鹿目まどか','Aoi Yūki','悠木碧'),
  voice('Homura Akemi','暁美ほむら','Chiwa Saitō','斎藤千和'),
  voice('Mami Tomoe','巴マミ','Kaori Mizuhashi','水橋かおり'),
  voice('Sayaka Miki','美樹さやか','Eri Kitamura','喜多村英梨'),
  voice('Kyōko Sakura','佐倉杏子','Ai Nonaka','野中藍'),
  voice('Bebe / Nagisa Momoe','ベベ／百江なぎさ','Kana Asumi','阿澄佳奈',{guest:true})
 ],'https://www.madoka-magica.com/rebellion/sp/character/',{
  editorial:true,groupSource:'https://online.aniplex.co.jp/itemPmhqAkdD.html',
  sceneSource:'https://wiki.puella-magi.net/Cake_Song',
  writing:name('Gekidan Inu Curry','劇団イヌカレー'),composition:name('Yuki Kajiura','梶浦由記'),
  musicSource:'https://note.com/madoka_magica/n/n65b32509a511'
 })
};
export function localizedName(n,lang){return n?(lang==='ja'?n.ja||n.latin:n.latin):'';}
export function originalArtist(song,lang){const p=originalPerformances[song.slug];if(!p)return song.artist||'';if(p.kind==='character')return voiceLabel(p.cast[0],lang);return localizedName(p.name,lang)||p.cast.map(c=>voiceLabel(c,lang)).join(' · ');}
export function voiceLabel(c,lang){return localizedName(c.character,lang)+(c.cv?(lang==='ja'?'（CV：':' (CV: ')+localizedName(c.cv,lang)+(lang==='ja'?'）':')'):'');}
export function originalArtistAliases(song){const p=originalPerformances[song.slug];return p?[p.name,...p.cast.flatMap(c=>[c.character,c.cv])].filter(Boolean).flatMap(n=>[n.latin,n.ja]).join(' '):'';}

export function originalCreditRows(song,lang){
 const p=originalPerformances[song.slug];if(!p)return [];
 const labels=({es:{cast:'Personajes y voces originales',writing:'Letra original',composition:'Composición',note:'Identificación editorial de los intérpretes de la escena; no es un crédito discográfico oficial.'},en:{cast:'Original characters and voices',writing:'Original lyrics',composition:'Composition',note:'Editorial identification of the scene performers, not an official release credit.'},ja:{cast:'原曲の登場人物・声優',writing:'作詞',composition:'作曲',note:'シーンの歌唱者を示す編集上の表記であり、公式の音源クレジットではありません。'}})[lang];
 const rows=p.cast.length?[{label:labels.cast,values:p.cast.map(c=>voiceLabel(c,lang))}]:[];
 if(p.writing)rows.push({label:labels.writing,values:[localizedName(p.writing,lang)]});
 if(p.composition)rows.push({label:labels.composition,values:[localizedName(p.composition,lang)]});
 return rows;
}
export function originalCreditNote(song,lang){return originalPerformances[song.slug]?.editorial?({es:'Identificación editorial de los intérpretes de la escena; no es un crédito discográfico oficial.',en:'Editorial identification of the scene performers, not an official release credit.',ja:'シーンの歌唱者を示す編集上の表記であり、公式の音源クレジットではありません。'})[lang]:'';}
export function originalCreditSources(song){const p=originalPerformances[song.slug];return p?[p.source,p.castSource,p.groupSource,p.sceneSource,p.musicSource].filter(Boolean):[];}
