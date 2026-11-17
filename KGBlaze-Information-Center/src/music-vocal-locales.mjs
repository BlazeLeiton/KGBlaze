/** Consistent visible vocal names for all duet and ensemble legends.
 * ES/EN: romanized names only. JA: original writing if verified and applicable.
 * Creator handles remain unchanged, because no Japanese stage-name spelling is known.
 */
const japaneseNames=new Map(Object.entries({
 'Honoka Kōsaka':'高坂穂乃果','Eli Ayase':'絢瀬絵里','Kotori Minami':'南ことり',
 'Umi Sonoda':'園田海未','Rin Hoshizora':'星空凛','Maki Nishikino':'西木野真姫',
 'Nozomi Tōjō':'東條希','Hanayo Koizumi':'小泉花陽','Nico Yazawa':'矢澤にこ',
 'Kanon Shibuya':'澁谷かのん','Keke Tang':'唐可可','Chisato Arashi':'嵐千砂都',
 'Sumire Heanna':'平安名すみれ','Ren Hazuki':'葉月恋','Kinako Sakurakoji':'桜小路きな子',
 'Mei Yoneme':'米女メイ','Shiki Wakana':'若菜四季','Natsumi Onitsuka':'鬼塚夏美',
 'Wien Margarete':'ウィーン・マルガレーテ','Tomari Onitsuka':'鬼塚冬毬',
 'Live':'りぶ','Ichiko':'苺子','Fu':'譜風','Fū':'譜風','Tokage':'十景','Yuki':'ゆき',
 'Yozora Mel':'夜空メル','Murasaki Shion':'紫咲シオン','Yuzuki Choco':'癒月ちょこ','Uruha Rushia':'潤羽るしあ',
 'Karin Asaka':'朝香果林','Ai Miyashita':'宮下愛',
 'Tokino Sora':'ときのそら','Roboco-san':'ロボ子さん','Shirakami Fubuki':'白上フブキ','Shirogane Noel':'白銀ノエル','Minato Aqua':'湊あくあ',
 'Chisato Nishikigi':'錦木千束','Takina Inoue':'井ノ上たきな'
}));
const splitDualScript=label=>{
 const match=String(label).match(/^(.+?)\s*[（(]([\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}・ー\s]+)[)）]$/u);
 return match?{latin:match[1].trim(),japanese:match[2].trim()}:null;
};
export function localizedVocalName(entry,lang){
 if(typeof entry==='string')entry={label:entry};
 const source=entry?.label||'';
 const explicit=entry?.labels?.[lang]||entry?.localizedLabels?.[lang]||(lang==='ja'?entry?.labelJa:null);
 if(explicit)return explicit;
 const dual=splitDualScript(source);
 if(lang==='ja')return japaneseNames.get(source)||dual?.japanese||source;
 return dual?.latin||source;
}
