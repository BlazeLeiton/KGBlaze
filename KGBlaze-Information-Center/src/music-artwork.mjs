// Original-release jacket art, not the cover performer's own album.
// Prefer illustrated anime/game editions. Preserve source and edition separately from video thumbnails.
// External artwork references are review candidates; fallback always uses the creator's video thumbnail.
export const releaseArtwork={
"miiro": {
    "image": "https://www.jvcmusic.co.jp/img/jackets/VTCL-35202.jpg?_c=init",
    "source": "https://www.jvcmusic.co.jp/flyingdog/-/Discography/A019681/VTCL-35202.html",
    "release": "海色 · VTCL-35202",
    "kind": "anime"
  },
  "graphite-diamond": {
    "image": "https://straycats.co.jp/wp/wp-content/uploads/2019/09/mayn_anime_h1.jpg",
    "source": "https://straycats.co.jp/release/xnst-10014/",
    "release": "graphite/diamond · XNST-10014",
    "kind": "anime"
  },
  "high-free-spirits": {
    "image": "https://trysail.jp/s3/skiyaki/uploads/ckeditor/pictures/32044/content_for_web_SVWC70153.jpg",
    "source": "https://trysail.jp/contents/40569",
    "release": "High Free Spirits · SVWC-70153/54",
    "kind": "anime"
  },
  "savior-of-song": {
    "image": "https://nanonano.me/s3/skiyaki/uploads/image/file/1370/VICL-35166.jpg",
    "source": "https://nanonano.me/musics/448",
    "release": "SAVIOR OF SONG · Arpeggio of Blue Steel ver.",
    "kind": "anime"
  },

 'caesura-of-despair':{image:'https://hololive.hololivepro.com/wp-content/uploads/2021/07/irys_1stalbm_jk-1000x997.png',source:'https://hololive.hololivepro.com/en/music/caesura-of-despair/',release:'||:Caesura of Despair · CVRD-056',kind:'illustrated'},
 'watashi-no-na-wa-hikari':{image:'https://www.jvcmusic.co.jp/img/jackets/VICL-65454.jpg?_c=810975cb4b6218f5df509fa16a6c6446',source:'https://www.jvcmusic.co.jp/-/Discography/A026102/VICL-65454.html',release:'SKY FULL of MAGIC · VICL-65454',kind:'anime'},
 'song-for-you':{image:'https://idolypride.jp/wp-content/uploads/2021/10/IP1stAL_TsuJo_JK_JPEG_rgb-300x300.jpg',source:'https://www.sonymusic.co.jp/artist/mananagase/discography/SMCL-737',release:'IDOLY PRIDE Collection Album [奇跡] · SMCL-737',kind:'anime'},
 'blue-spirit':{image:'/music-artwork/blue-spirit-v1.webp',source:'https://wiki.biligame.com/blhx/%E7%A2%A7%E8%93%9D%E6%B5%B7%E4%BA%8B%E5%B1%80%E5%85%B1%E9%B8%A3%E7%9A%84PASSION%E6%B4%BB%E5%8A%A8%E4%B8%93%E9%A2%98',release:'Blue Spirit · Universe in Unison',kind:'game',artworkContext:'Official in-game collectible record artwork; documented among legacy song jackets in Heart-Linking Harmony (2024; Resonant Passion in translated Asian event references); first appearance unconfirmed.'},
 'are-ga-koi-datta-no-ka-na':{image:'/music-artwork/are-ga-koi-datta-no-ka-na-v1.webp',source:'https://open.spotify.com/intl-ja/track/23eX2EUwE7EhiLWoPl1Pdv',release:'あれが恋だったのかな',kind:'anime'},
 'cake-song':{image:'https://www.giantrobot.com/cdn/shop/files/SubinYeon_CakeSong_8x10___500.jpg?v=1751643268&width=720',source:'https://www.giantrobot.com/products/reanimated-2025-subin-yeon-cake-song',release:'Cake Song — Subin Yeon',kind:'illustration',credit:'Subin Yeon'},
 'dokimeki-diary':{image:'https://vocalmagazine.jp/wp-content/uploads/2023/04/%E6%9C%9F%E9%96%93%E7%94%9F%E7%94%A3%E9%99%90%E5%AE%9A%E7%9B%A4_%E3%83%89%E3%82%AD%E3%83%A1%E3%82%AD%E3%83%80%E3%82%A4%E3%82%A2%E3%83%AA%E3%83%BCJK-1024x911.jpg',source:'https://www.sonymusic.co.jp/artist/asmi/discography/SRCL-12528',release:'Dokimeki Diary · SRCL-12528',kind:'anime'},
 'only-one-yell':{image:'https://pjselection.com/assets/music/mtcd.jpg?v3=',source:'https://pjselection.com/music.html',release:'SELECTION PROJECT Main Theme Song CD · ZMCZ-15051',kind:'anime'},
 'la-vaguelette':{image:'https://resources.tidal.com/images/38d05322/10fa/4dd5/ae73/71881f57ddb1/1280x1280.jpg',source:'https://tidal.com/album/327431559/track/327431560',release:'Genshin Impact - La vaguelette (Original Game Soundtrack)',kind:'game'},
 'snow-halation':{image:'https://cdn.tower.jp/za/o/5W/zaP5_G2533715W.JPG',source:'https://tower.jp/item/2813824',release:'Snow halation · LACM-4774',kind:'anime'},
 'butter-fly':{image:'https://www.feelmee.jp/uploads/rf5704bf82951c4/NECM10231_180.jpg',source:'https://www.feelmee.jp/index.php/item/product/1093',release:'Butter-Fly ~tri. Version~ · NECM-10231',kind:'anime'},
 'connect':{image:'https://www.lisani.jp/claris-best1st/images/connect_img01.jpg',source:'https://www.lisani.jp/claris-best1st/history/junior.php',release:'Connect · SECL-949',kind:'anime'},
 'mumei':{image:'https://hololive.hololivepro.com/wp-content/uploads/2023/10/mumei_jaket_B.png',source:'https://hololive.hololivepro.com/en/music/339/',release:'mumei · CVRD-339',kind:'illustrated'}
};

// Versioned, same-origin URLs. Original source URLs remain in the registry for attribution.
export const artworkPath=slug=>'/music/artwork-cache/'+slug+'-v1';
export const artworkSources=new Map(Object.entries(releaseArtwork).filter(([,a])=>a.image.startsWith('https://')).map(([slug,a])=>[artworkPath(slug),a.image]));
export function artworkURL(slug){const a=releaseArtwork[slug];return a?(a.image.startsWith('https://')?artworkPath(slug):a.image):'';}

// Preserved WebP snapshot is independent of the external URL and cache expiry.
export const artworkBackupPath=path=>artworkSources.has(path)?'/music-artwork/'+path.split('/').pop()+'.webp':null;
