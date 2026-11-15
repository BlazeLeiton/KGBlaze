// Original-performance credits, not the creator's cover cast.
// Names in established Latin spelling and Japanese script are independently stored.
// A group can have a verified lineup without all songs sharing the same performers.
const name=(latin,ja=latin)=>({latin,ja});
const voice=(character,ja,cv,cvJa,extra={})=>({character:name(character,ja),cv:name(cv,cvJa),...extra});
const group=(name,cast,source,extra={})=>({kind:'group',name,cast,source,...extra});
export const originalPerformances={
 'el-nano':{kind:'artist',name:name('Melendi'),cast:[],source:'https://www.qobuz.com/se-en/album/el-nano-melendi/5099920752750'},
 'there-is-a-reason':{kind:'artist',name:name('Konomi Suzuki','鈴木このみ'),cast:[],source:'https://ngnl.jp/goods/music/'},
 'xy-and-z':{kind:'character',name:name('Satoshi','サトシ'),cast:[voice('Satoshi','サトシ','Rica Matsumoto','松本梨香')],source:'https://www.sonymusic.co.jp/artist/sakotomohisa/info/461735'},
 'ten-to-sen':{kind:'artist',name:name('Miku Itō','伊藤美来'),cast:[],source:'https://columbia.jp/artist-info/itomiku/discography/COCC-18148.html'},
 'kimi-to-iu-shinwa':{kind:'artist',name:name('Jun Maeda × yanaginagi','麻枝 准×やなぎなぎ'),cast:[],source:'https://kamisama-day.jp/music/'},
 'ano-ne':{kind:'character',name:name('Yuna','ユナ'),cast:[voice('Yuna','ユナ','Maki Kawase','河瀬茉希')],source:'https://columbia.jp/prod-info/COCC-17809/',writing:name('eNu · Yūsuke Toshima','eNu・戸嶋友祐'),composition:name('Yūsuke Toshima','戸嶋友祐'),arrangement:name('Ruka Kawada','川田瑠夏'),sourceRelease:{date:'2020-10-21',catalog:'COCC-17809',track:1,duration:'4:11',source:'https://columbia.jp/prod-info/COCC-17809/'},variants:{'loved-ones':group(name('Yuna & Fina','ユナ＆フィナ'),[voice('Yuna','ユナ','Maki Kawase','河瀬茉希'),voice('Fina','フィナ','Azumi Waki','和氣あず未')],'https://columbia.jp/prod-info/COKM-43033/',{writing:name('eNu · Yūsuke Toshima','eNu・戸嶋友祐'),composition:name('Yūsuke Toshima','戸嶋友祐'),arrangement:name('Ruka Kawada','川田瑠夏'),sourceRelease:{date:'2020-12-24',catalog:'COKM-43033',track:1,duration:'4:30',broadcastDate:'2020-12-23',episode:12,source:'https://columbia.jp/prod-info/COKM-43033/'},reissuedOn:{date:'2023-04-19',digitalDate:'2023-04-11',catalog:'COCC-18117',track:3,source:'https://columbia.jp/prod-info/COCC-18117/'}})},sourceDiscography:[{id:'original',artist:'Yuna',date:'2020-10-21',catalog:'COCC-17809',track:1,duration:'4:11'},{id:'loved-ones',artist:'Yuna & Fina',date:'2020-12-24',catalog:'COKM-43033',track:1,duration:'4:30',reissue:{date:'2023-04-19',digitalDate:'2023-04-11',catalog:'COCC-18117',track:3}},{id:'loved-ones-yuna-side',artist:'Yuna',date:'2023-04-19',digitalDate:'2023-04-11',catalog:'COCC-18117',track:4,duration:'4:09',lyricsSource:'https://www.uta-net.com/song/336106/'},{id:'loved-ones-fina-side',artist:'Fina',date:'2023-04-19',digitalDate:'2023-04-11',catalog:'COCC-18117',track:5,duration:'4:10',lyricsSource:'https://www.uta-net.com/song/336105/'}],musicSource:'https://columbia.jp/prod-info/COCC-18117/'},
 'zutto':{kind:'character',name:name('Yuna','ユナ'),cast:[voice('Yuna','ユナ','Maki Kawase','河瀬茉希')],source:'https://columbia.jp/prod-info/COCC-18117/'},
 'kono-tate-ni-kakuremasu':{kind:'artist',name:name('Junjou no Afilia','純情のアフィリア'),cast:[],source:'https://bofuri.jp/music/'},
 'koko-kara-koko-kara':group(name('Penguin Manjuu Crew','Penguin Manjuu Crew'),[voice('Mari Tamaki (Kimari)','玉木マリ','Inori Minase','水瀬いのり'),voice('Shirase Kobuchizawa','小淵沢報瀬','Kana Hanazawa','花澤香菜'),voice('Hinata Miyake','三宅日向','Yuka Iguchi','井口裕香'),voice('Yuzuki Shiraishi','白石結月','Saori Hayami','早見沙織')],'https://yorimoi.com/products/music.html',{editorialAlias:true,officialCredit:name('Mari Tamaki, Shirase Kobuchizawa, Hinata Miyake & Yuzuki Shiraishi','玉木マリ・小淵沢報瀬・三宅日向・白石結月')}),
 'one-step':group(name('Penguin Manjuu Crew','Penguin Manjuu Crew'),[voice('Mari Tamaki (Kimari)','玉木マリ','Inori Minase','水瀬いのり'),voice('Shirase Kobuchizawa','小淵沢報瀬','Kana Hanazawa','花澤香菜'),voice('Hinata Miyake','三宅日向','Yuka Iguchi','井口裕香'),voice('Yuzuki Shiraishi','白石結月','Saori Hayami','早見沙織')],'https://yorimoi.com/products/music.html',{editorialAlias:true,officialCredit:name('Mari Tamaki, Shirase Kobuchizawa, Hinata Miyake & Yuzuki Shiraishi','玉木マリ・小淵沢報瀬・三宅日向・白石結月')}),
 'rvr':group(name('Liko & Roy','リコ＆ロイ'),[voice('Liko','リコ','Minori Suzuki','鈴木みのり'),voice('Roy','ロイ','Yuka Terasaki','寺崎裕香')],'https://www.sonymusic.co.jp/artist/Compilation/discography/BVCL-1357'),
 'level':{kind:'artist',name:name('yanaginagi × THE SIXTH LIE','やなぎなぎ×THE SIXTH LIE'),cast:[],source:'https://tensaiouji-anime.com/music/'},
 'bad-candy':{kind:'artist',name:name('yukaDD(;´∀｀)'),cast:[],source:'https://wmg.jp/yukadd/discography/25506'},
 'alive':{kind:'artist',name:name('ClariS'),cast:[],source:'https://www.sonymusic.co.jp/artist/claris/info/543244',writing:name('Ryosuke Shigenaga','重永亮介'),composition:name('Ryosuke Shigenaga','重永亮介')},
 'hana-no-tou':{kind:'artist',name:name('Sayuri','さユり'),cast:[],source:'https://lycoris-recoil.com/music/ed.html',writing:name('Sayuri','さユり'),composition:name('Sayuri','さユり'),musicSource:'https://www.uta-net.com/song/321038/'},
 'strobe-memory':{kind:'artist',name:name('Maaya Uchida','内田真礼'),cast:[],source:'https://uchidamaaya.jp/discography/12th_sg/',writing:name('RIRIKO'),composition:name('RIRIKO')},
 'youthful-beautiful':{kind:'artist',name:name('Maaya Uchida','内田真礼'),cast:[],source:'https://gridman.net/news/archives/233',writing:name('RIRIKO'),composition:name('RIRIKO')},

 'shiny-smily-story':group(name('hololive IDOL PROJECT'),[],'https://hololive.hololivepro.com/en/music/shiny-smily-story-2/'),
 'villain-vibes':{kind:'artist',name:name('AmaLee feat. Mori Calliope'),cast:[],source:'https://www.youtube.com/watch?v=kFaie-Tp1Jw',writing:name('AmaLee · Mori Calliope'),composition:name('AmaLee · Mori Calliope · Shawn Christmas')},
 'sparks-of-joy':{kind:'artist',name:name('IRyS'),cast:[],source:'https://hololive.hololivepro.com/music/sparks-of-joy/',writing:name('Konnie Aoki'),composition:name('Atsuhito Sato','佐藤厚仁')},
 'sparks':{kind:'artist',name:name('Takanashi Kiara','小鳥遊キアラ'),cast:[],source:'https://hololive.hololivepro.com/en/music/sparks/'},
 'stars-we-chase':{kind:'character',name:name('Mia Taylor','ミア・テイラー'),cast:[voice('Mia Taylor','ミア・テイラー','Shu Uchida','内田秀')],source:'https://go-for-launch.net/nijigasaki/cd.php',writing:name('Konnie Aoki'),composition:name('TeddyLoid')},
 'pastel':group(name('QU4RTZ'),[voice('Kasumi Nakasu','中須かすみ','Mayu Sagara','相良茉優'),voice('Kanata Konoe','近江彼方','Akari Kitō','鬼頭明里'),voice('Emma Verde','エマ・ヴェルデ','Maria Sashide','指出毬亜'),voice('Rina Tennoji','天王寺璃奈','Chiemi Tanaka','田中ちえ美')],'https://go-for-launch.net/nijigasaki/cd.php',{writing:name('nine'),composition:name('ygarshy · PASSiON KiNG')}),

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
  voice('Bebe','ベベ','Kana Asumi','阿澄佳奈',{guest:true})
 ],'https://www.madoka-magica.com/rebellion/sp/character/',{
  editorial:true,groupSource:'https://online.aniplex.co.jp/itemPmhqAkdD.html',
  sceneSource:'https://wiki.puella-magi.net/Cake_Song',
  writing:name('Gekidan Inu Curry','劇団イヌカレー'),composition:name('Yuki Kajiura','梶浦由記'),
  musicSource:'https://note.com/madoka_magica/n/n65b32509a511'
 })
};
// Original cast information remains separate from cover participants.
originalPerformances['kokuan-glossolalia']=group(name('IV KLORE'),[
 voice('Emilia','エミリア','Hazuki Hoshino','星乃葉月'),
 voice('Salsa','サルサ','Yū Sasahara','篠原侑'),
 voice('Garnet','ガーネット','Yōko Nakayama','中山瑶子'),
 voice('Alpha','あるふぁ','Tomomi Mineuchi','嶺内ともみ')
],'https://www.crunchyroll.com/es/news/latest/2020/5/11/el-anime-lapis-relights-aspirar-a-alcanzar-las-estrellas-en-julio');
export function localizedName(n,lang){return n?(lang==='ja'?n.ja||n.latin:n.latin):'';}
const performanceFor=(song,version)=>originalPerformances[song.slug]?.variants?.[version]||originalPerformances[song.slug];
export function originalArtist(song,lang,version){const p=performanceFor(song,version);if(!p)return song.artistLocalized?.[lang]||song.artist||'';if(p.kind==='character')return voiceLabel(p.cast[0],lang);return localizedName(p.name,lang)||p.cast.map(c=>voiceLabel(c,lang)).join(' · ');}
export function voiceLabel(c,lang){return localizedName(c.character,lang)+(c.cv?(lang==='ja'?'（CV：':' (CV: ')+localizedName(c.cv,lang)+(lang==='ja'?'）':')'):'');}
export function originalArtistAliases(song){const p=originalPerformances[song.slug];return p?[p.name,...p.cast.flatMap(c=>[c.character,c.cv])].filter(Boolean).flatMap(n=>[n.latin,n.ja]).join(' '):'';}

export function originalCreditRows(song,lang,version){
 const p=performanceFor(song,version);if(!p)return [];
 const labels=({es:{cast:'Voces originales',writing:'Letra original',composition:'Composición',note:'Identificación editorial de los intérpretes de la escena; no es un crédito discográfico oficial.'},en:{cast:'Original voices',writing:'Original lyrics',composition:'Composition',note:'Editorial identification of the scene performers, not an official release credit.'},ja:{cast:'原曲の声優',writing:'作詞',composition:'作曲',note:'シーンの歌唱者を示す編集上の表記であり、公式の音源クレジットではありません。'}})[lang];
 const rows=p.cast.length?[{label:labels.cast,values:p.cast.map(c=>voiceLabel(c,lang))}]:[];

 return rows;
}
export function originalCreditNote(song,lang){if(originalPerformances[song.slug]?.editorialAlias)return ({es:'Penguin Manjuu Crew es un alias creado por Blaze Leiton para las cuatro protagonistas; no es el nombre oficial de una unidad musical.',en:'Penguin Manjuu Crew is an alias created by Blaze Leiton for the four protagonists, not an official musical unit name.',ja:'Penguin Manjuu CrewはBlaze Leitonが4人の主人公につけた呼称で、公式ユニット名ではありません。'})[lang];return originalPerformances[song.slug]?.editorial?({es:'Identificación editorial de los intérpretes de la escena; no es un crédito discográfico oficial.',en:'Editorial identification of the scene performers, not an official release credit.',ja:'シーンの歌唱者を示す編集上の表記であり、公式の音源クレジットではありません。'})[lang]:'';}
export function originalCreditSources(song){const p=originalPerformances[song.slug];return p?[p.source,p.castSource,p.groupSource,p.sceneSource,p.musicSource].filter(Boolean):[];}
