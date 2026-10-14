/**
 * Category-first editorial matching for images already published with the agenda.
 * This function is self-contained so the public enhancement can embed its source
 * without modifying the 4.5 MB legacy viewer or publishing the private editor.
 */
export function artworkCandidates(event, entries) {
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 const items=Array.isArray(entries)?entries:[];
 const genericNames=new Set(['kgblaze general','kgblaze default','imagen general','arte general']);
 const isGeneral=item=>item?.id==='kgblaze-default'||genericNames.has(norm(item?.name));
 const general=items.find(x=>isGeneral(x)&&typeof x.img==='string'&&x.img)?.img||null;
 const match=(input)=>{
  const value=norm(input);if(!value)return null;
  let best=null;
  for(const item of items){
   if(typeof item?.img!=='string'||!item.img)continue;
   const aliases=[item.name,...(Array.isArray(item.aliases)?item.aliases:[])];
   for(const candidate of aliases){
    const alias=norm(candidate);
    if(alias.length<3||isGeneral(item)&&alias!==value)continue;
    if((' '+value+' ').includes(' '+alias+' ')&&(!best||alias.length>best.score))
     best={url:item.img,score:alias.length};
   }
  }
  return best?.url||null;
 };
 const category=match(event?.category),title=match(event?.title);
 // Only these platform-wide categories yield to a more specific editorial
 // title/alias; normal game and activity categories always retain priority.
 const titleBeforeGenericCategory=Boolean(title)&&
  new Set(['just chatting','entertainment','entretenimiento']).has(norm(event?.category));
 return {category,title,general,titleBeforeGenericCategory};
}
