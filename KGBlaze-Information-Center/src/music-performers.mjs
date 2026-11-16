// Original-performance credits, not the creator's cover cast.
// Names in established Latin spelling and Japanese script are independently stored.
// A group can have a verified lineup without all songs sharing the same performers.
const name=(latin,ja=latin)=>({latin,ja});
const voice=(character,ja,cv,cvJa,extra={})=>({character:name(character,ja),cv:name(cv,cvJa),...extra});
const group=(name,cast,source,extra={})=>({kind:'group',name,cast,source,...extra});
export const originalPerformances={
 'halloween-night':{kind:'group',name:name('hololive IDOL PROJECT'),cast:[voice('Yozora Mel','夜空メル','Yozora Mel','夜空メル'),voice('Murasaki Shion','紫咲シオン','Murasaki Shion','紫咲シオン'),voice('Yuzuki Choco','癒月ちょこ','Yuzuki Choco','癒月ちょこ'),voice('Uruha Rushia','潤羽るしあ','Uruha Rushia','潤羽るしあ')].map(x=>({character:x.character})),source:'https://hololive.hololivepro.com/en/music/%E4%BB%8A%E5%AE%B5%E3%81%AFhalloween-night-2/'},
 'suki-yuki-maji-magic':{kind:'artist',name:name('Mitchie M feat. Hatsune Miku','Mitchie M feat. 初音ミク'),cast:[],source:'https://karent.jp/webnews/452'},
 'crossing-field':{kind:'artist',name:name('LiSA'),cast:[],source:'https://www.uta-net.com/song/133622/'},
 'brave-shine':{kind:'artist',name:name('Aimer'),cast:[],source:'https://www.sonymusic.co.jp/artist/aimer/discography/DFCL-2130',writing:name('aimerrhythm'),composition:name('Hisashi Koyama','小山寿')},
 'catch-the-moment':{kind:'artist',name:name('LiSA'),cast:[],source:'https://www.cdjapan.co.jp/product/SVWC-70235'},
 'under-the-party-lights':{kind:'artist',name:name('AmaLee'),cast:[],source:'https://www.youtube.com/watch?v=sW02T8Pwq5s',writing:name('Victor Hime'),composition:name('Victor Hime')},
  'caste-room':{kind:'artist',name:name('ZAQ'),cast:[],source:"https://zaqzaqzaq.jp/discography/%E3%82%AB%E3%83%BC%E3%82%B9%E3%83%88%E3%83%AB%E3%83%BC%E3%83%A0/",writing:name('ZAQ'),composition:name('ZAQ'),arrangement:name('ZAQ')},
  'dance-in-the-game':{kind:'artist',name:name('ZAQ'),cast:[],source:"https://zaqzaqzaq.jp/discography/dance-in-the-game/",writing:name('ZAQ'),composition:name('ZAQ'),arrangement:name('ZAQ')},
  'minor-piece':{kind:'artist',name:name('ZAQ'),cast:[],source:"https://zaqzaqzaq.jp/discography/%E3%83%9E%E3%82%A4%E3%83%8A%E3%83%BC%E3%83%94%E3%83%BC%E3%82%B9/",writing:name('ZAQ'),composition:name('ZAQ'),arrangement:name('ZAQ')},
 'toge-toge-sadistic':group(name('Enormita','エノルミータ'),[voice('Magia Baiser','マジアベーゼ','Fuka Izumi','和泉風花'),voice('Leopard','レオパルト','Aoi Koga','古賀葵'),voice('Nero Alice','ネロアリス','Shiori Sugiura','杉浦しおり')],'https://mahoako-anime.com/music.html',{writing:name('Karasuya Sabou','烏屋茶房'),composition:name('Karasuya Sabou','烏屋茶房'),arrangement:name('Karasuya Sabou','烏屋茶房')}),
 'your-reality':{kind:'character',name:name('Monika','モニカ'),cast:[voice('Monika','モニカ','Jillian Ashcraft','Jillian Ashcraft')],source:'https://www.youtube.com/watch?v=CAL4WMpBNs0',writing:name('Dan Salvato'),composition:name('Dan Salvato')},
 'yakusoku':group(name('Roselia'),[voice('Yukina Minato','湊友希那','Aina Aiba','相羽あいな'),voice('Lisa Imai','今井リサ','Yuki Nakashima','中島由貴')],'https://bang-dream.com/discographies/1388/',{writing:name('Asuka Oda','織田あすか'),composition:name('Yusuke Takeda','竹田祐介'),arrangement:name('Yusuke Takeda','竹田祐介')}),
 'u-belle':{kind:'group',name:name('millennium parade × Belle'),cast:[voice('Belle','ベル','Kaho Nakamura','中村佳穂')],source:'https://musicbrainz.org/release/28f857cc-8364-4476-b0fe-8103135c7346',writing:name('Daiki Tsuneta','常田大希'),composition:name('Daiki Tsuneta','常田大希')},
 'p3-fes':{kind:'artist',name:name('Yumi Kawamura · Lotus Juice','川村ゆみ · Lotus Juice'),cast:[],source:'https://musicbrainz.org/release/6df99608-a0ef-481d-ac48-d614ebf45a75',writing:name('Shigeo Komori · Yoshihiro Komori · Lotus Juice'),composition:name('Shoji Meguro','目黒将司'),arrangement:name('Shoji Meguro','目黒将司')},
 'pop-step':{kind:'character',name:name('Pop☆Step','ポップ☆ステップ'),cast:[voice('Pop☆Step','ポップ☆ステップ','Ikumi Hasegawa','長谷川育美')],source:'https://www.youtube.com/watch?v=CAHsPGk5z6s',writing:name('Yuno Sonoda','園田ゆの'),composition:name('Yuki Hayashi','林ゆうき')},
 'spektro':{kind:'character',name:name('Yū Akeuchi','明内ユウ'),cast:[voice('Yū Akeuchi','明内ユウ','Seria Fukagawa','深川芹亜')],source:'https://www.youtube.com/watch?v=rgS4MKJfYrA',writing:name('Rasuko Ōkuma · Ayumu Nakazato','大熊らすこ · 中里アユム'),composition:name('sakai asuka')},
 'the-secret-night':group(name('DiverDiva'),[voice('Karin Asaka','朝香果林','Miyu Kubota','久保田未夢'),voice('Ai Miyashita','宮下愛','Natsumi Murakami','村上奈津実')],'https://www.lantis.jp/release-item/LACM-24131.html',{writing:name('Dummy Dog'),composition:name('Dummy Dog'),arrangement:name('Dummy Dog')}),
 'shukufuku':{kind:'artist',name:name('YOASOBI'),cast:[],source:'https://www.youtube.com/watch?v=3eytpBOkOFA',writing:name('Ayase'),composition:name('Ayase')},
 'planetarium':{kind:'artist',name:name('Hoshimachi Suisei','星街すいせい'),cast:[],source:'https://www.youtube.com/watch?v=CfUIwzDo4HE',writing:name('DECO*27'),composition:name('DECO*27'),arrangement:name('kous')},
 'ruteshi-kisuki-shiteru':{kind:'group',name:name("μ's"),cast:[],source:'https://www.lantis.jp/release-item/LACM-14260.html',writing:name('Aki Hata','畑亜貴'),composition:name('Takashi Saeki','佐伯高志'),arrangement:name('Takashi Saeki','佐伯高志')},
 'ryuusei':{kind:'artist',name:name('Eir Aoi','藍井エイル'),cast:[],source:'https://www.sonymusic.co.jp/artist/aoieir/info/494743'},
 'senaka-awase':{kind:'artist',name:name('AliA'),cast:[],source:'https://www.youtube.com/watch?v=yKQkBQ5su9A',writing:name('TKT'),composition:name('EREN'),arrangement:name('EREN')},
 'shiny-days':{kind:'artist',name:name('Asaka','亜咲花'),cast:[],source:'https://asaka1007.jp/discography/shinydays/',writing:name('Kento Nagatsuka','永塚健登'),composition:name('Sho Aratame','新田目翔'),arrangement:name('Shinichi Yuki','悠木真一')},
 'heart-no-shuchou':{kind:'artist',name:name('CHiCO with HoneyWorks'),cast:[],source:'https://honeyworks.jp/news/1127/',writing:name('shito, Gom'),composition:name('shito'),arrangement:name('HoneyWorks')},
 'karakuri-pierrot':{kind:'artist',name:name('40mP feat. Hatsune Miku','40mP feat. 初音ミク'),cast:[],source:'https://www.youtube.com/watch?v=xxFkW3PCT5M',writing:name('40mP'),composition:name('40mP')},
 'last-cup-of-coffee':{kind:'artist',name:name('LilyPichu'),cast:[],source:'https://www.youtube.com/watch?v=n64abW0dHNw'},
 'lets-be-one':group(name('Liella!'),[voice('Kanon Shibuya','澁谷かのん','Sayuri Date','伊達さゆり'),voice('Keke Tang','唐可可','Liyuu','Liyuu'),voice('Chisato Arashi','嵐千砂都','Nako Misaki','岬なこ'),voice('Sumire Heanna','平安名すみれ','Naomi Payton','ペイトン尚未'),voice('Ren Hazuki','葉月恋','Nagisa Aoyama','青山なぎさ'),voice('Kinako Sakurakoji','桜小路きな子','Nozomi Suzuhara','鈴原希実'),voice('Mei Yoneme','米女メイ','Akane Yabushima','薮島朱音'),voice('Shiki Wakana','若菜四季','Wakana Ookuma','大熊和奏'),voice('Natsumi Onitsuka','鬼塚夏美','Aya Emori','絵森彩'),voice('Wien Margarete','ウィーン・マルガレーテ','Yuina','結那'),voice('Tomari Onitsuka','鬼塚冬毬','Sakura Sakakura','坂倉花')],'https://catalog.bandainamcomusiclive.co.jp/release/72056/',{writing:name('Junko Miyajima','宮嶋淳子'),composition:name('Takuya Ohata','大畑拓也')}),
 'lonely-feather':{kind:'character',name:name('Sylvia Lyyneheym','シルヴィア・リューネハイム'),cast:[voice('Sylvia Lyyneheym','シルヴィア・リューネハイム','Haruka Chisuga','千菅春香')],source:'https://asterisk-war.com/sp/music/',writing:name('Rasmus Faber'),composition:name('Rasmus Faber'),arrangement:name('Rasmus Faber')},
 'minikui-ikimono':{kind:'artist',name:name('CHiCO with HoneyWorks'),cast:[],source:'https://www.othersidepicnic.com/music/',writing:name('HoneyWorks'),composition:name('HoneyWorks'),arrangement:name('HoneyWorks')},
 'mirai-connection':{kind:'artist',name:name('ЯeaL'),cast:[],source:'https://www.sonymusic.co.jp/artist/real/info/492917',writing:name('Ryoko, Kisuke, Takuya Watanabe','Ryoko、喜介、渡辺拓也'),composition:name('Ryoko'),arrangement:name('Takuya Watanabe','渡辺拓也')},
 'otome-domo-yo':{kind:'artist',name:name('CHiCO with HoneyWorks'),cast:[],source:'https://honeyworks.jp/news/5185/',writing:name('HoneyWorks'),composition:name('HoneyWorks')},
 'ougon-kouro':{kind:'artist',name:name('Masayoshi Oishi','オーイシマサヨシ'),cast:[],source:'https://www.014014.jp/discography/5579',writing:name('Masayoshi Oishi','大石昌良'),composition:name('Masayoshi Oishi','大石昌良')},
 'ai-no-uta':{kind:'artist',name:name('Haruka Chisuga','千菅春香'),cast:[],source:"https://www.jvcmusic.co.jp/flyingdog/-/Discography/A024282/VTCL-35225.html",writing:name('Toshiaki Yamada','山田稔明'),composition:name('Rasmus Faber'),arrangement:name('Rasmus Faber')},
 'beginners-rock':{kind:'character',name:name('Kinako Sakurakoji','桜小路きな子'),cast:[voice('Kinako Sakurakoji','桜小路きな子','Nozomi Suzuhara','鈴原希実')],source:'https://music.apple.com/us/song/1765297125',writing:name('Junko Miyajima','宮嶋淳子'),composition:name('Shinpei Nozaki','野崎心平')},
 'dakara-boku-wa-boku-wo-tebanasu':{kind:'artist',name:name('WEAVER'),cast:[],source:'https://www.lisani.jp/0000056592/',writing:name('Yuji Sugimoto','杉本雄治'),composition:name('Yuji Sugimoto','杉本雄治')},
 'end-of-a-life':{kind:'artist',name:name('Mori Calliope','森カリオペ'),cast:[],source:"https://hololive.hololivepro.com/en/music/end-of-a-life/",writing:name('Mori Calliope','森カリオペ')},
 'gg':{kind:'artist',name:name('ReoNa'),cast:[],source:"https://www.cdjapan.co.jp/product/VVCL-2618"},
 'gimi-gimi':group(name('Mayopan','まよぱん'),[voice('Live','りぶ','Fairouz Ai','ファイルーズあい'),voice('Ichiko','苺子','Yuina Ito','伊藤ゆいな'),voice('Fū','譜風','Hina Yomiya','羊宮妃那'),voice('Tokage','十景','Hitomi Ueda','上田瞳'),voice('Yuki','ゆき','Ai Kayano','茅野愛衣')],"https://mayopan.jp/music/",{writing:name('Yohei Matsui','松井洋平'),composition:name('John Kanda','神田ジョン')}),
 'leon-no-sabe-que-existo':{kind:'artist',name:name('Catch 22','キャッチ22'),cast:[],source:"https://victoryrecords.bandcamp.com/album/keasbey-nights"},
 'hitoribocchi-tokyo':group(name('Kessoku Band','結束バンド'),[voice('Ikuyo Kita','喜多郁代','Ikumi Hasegawa','長谷川育美')],"https://bocchi.rocks/kessokuband/discography/?article_id=kessoku"),
 'kaze-no-uta':{kind:'artist',name:name('FLOW'),cast:[],source:"https://www.cdjapan.co.jp/product/KSCL-2762"},
 'el-mismo-sol':{kind:'artist',name:name('Alejandro Fernández','アレハンドロ・フェルナンデス'),cast:[],source:'https://www.qobuz.com/us-en/album/el-mismo-sol-alejandro-fernandez/0060252782814'},
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
originalPerformances['ruteshi-kisuki-shiteru'].cast=originalPerformances['snow-halation'].cast.map(x=>({...x}));
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
