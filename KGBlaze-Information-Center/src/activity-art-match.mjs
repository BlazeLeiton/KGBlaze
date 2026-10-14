/**
 * Editorial library matching only for the PUBLIC expanded flight card.
 * Keep this function self-contained: Wrangler embeds its function source in
 * the legacy viewer. The calendar still uses its own editorial logo choice.
 */
export function artworkCandidates(event, entries) {
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 const items=Array.isArray(entries)?entries:[];
 const genericNames=new Set(['kgblaze general','kgblaze default','imagen general','arte general']);
 const isGeneral=item=>item?.id==='kgblaze-default'||genericNames.has(norm(item?.name));
 const general=items.find(x=>isGeneral(x)&&typeof x.img==='string'&&x.img)?.img||null;
 const match=(input,accept=()=>true)=>{
  const value=norm(input);if(!value)return null;
  let best=null;
  for(const item of items){
   if(!accept(item)||typeof item?.img!=='string'||!item.img)continue;
   const aliases=[item.name,...(Array.isArray(item.aliases)?item.aliases:[])];
   for(const candidate of aliases){
    const alias=norm(candidate);
    if(alias.length<3||(isGeneral(item)&&alias!==value))continue;
    if((' '+value+' ').includes(' '+alias+' ')&&(!best||alias.length>best.score))
     best={url:item.img,score:alias.length};
   }
  }
  return best?.url||null;
 };
 const categoryName=String(event?.category||'');
 const categoryKey=norm(categoryName);
 const isGenericChat=new Set(['just chatting','entertainment','entretenimiento']).has(categoryKey);
 const ytOnly=(event?.platforms||[]).includes('yt')&&!(event?.platforms||[]).includes('tw');
 const isBroadCategory=!categoryKey||new Set(['gaming','games','video games','games demos','games and demos','general','other','otros']).has(categoryKey)||
  (ytOnly&&new Set(['music','education','people blogs','science technology','film animation','comedy','sports','travel events','news politics','howto style','autos vehicles','pets animals','nonprofits activism','movies','shows']).has(categoryKey));
 const category=match(isGenericChat?'Just Chatting':categoryName,x=>!isGeneral(x));
 const onlySpecial=x=>[x?.name,...(Array.isArray(x?.aliases)?x.aliases:[])]
  .some(alias=>['karaoke','collab padoru','padoru'].includes(norm(alias)));
 const specialTitle=isGenericChat?match(event?.title,onlySpecial):null;
 // Only a generic/unspecified YouTube category can fall back to a library
 // title alias; a specific game's category must never lose to "Padoru".
 const title=isGenericChat?specialTitle:
   isBroadCategory?match(event?.title,x=>!isGeneral(x)&&(!categoryKey||!onlySpecial(x))):null;
 return {category,title,general,specialTitle,isGenericChat,isBroadCategory,
  titleBeforeGenericCategory:Boolean(specialTitle)};
}
