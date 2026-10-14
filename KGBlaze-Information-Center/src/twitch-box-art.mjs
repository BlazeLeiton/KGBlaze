/**
 * Read-only Twitch category art for public flight cards.
 * Credentials stay inside the Worker; no Twitch sync or D1 mutations.
 * We deliberately reject Twitch's generic grey controller placeholder.
 */
const CDN='static-cdn.jtvnw.net';
const FALLBACK='https://static-cdn.jtvnw.net/ttv-static/404_boxart-285x380.jpg';
const imageCache=new Map();
let tokenCache=null;
export function validTwitchCategoryName(s){
 return typeof s==='string'&&s.trim().length>0&&s.trim().length<=100&&!/[\u0000-\u001f\u007f]/.test(s);
}
export function twitchArtURL(template){
 if(typeof template!=='string')return null;
 let u;
 try{u=new URL(template.replaceAll('{width}','285').replaceAll('{height}','380'));}
 catch{return null;}
 return u.protocol==='https:'&&u.hostname===CDN&&u.pathname.startsWith('/ttv-boxart/')?u.href:null;
}
function sameBytes(a,b){
 if(a.byteLength!==b.byteLength)return false;
 const x=new Uint8Array(a),y=new Uint8Array(b);
 for(let i=0;i<x.length;i++)if(x[i]!==y[i])return false;
 return true;
}
async function fetchImage(url,fetchImpl){
 const r=await fetchImpl(url,{method:'GET',headers:{'Accept':'image/jpeg,image/*'},redirect:'follow'});
 if(!r.ok||!/^image\//i.test(r.headers.get('Content-Type')||''))return null;
 const finalURL=new URL(r.url||url);
 if(finalURL.hostname!==CDN||/404_boxart|placeholder/i.test(finalURL.pathname))return null;
 if(Number(r.headers.get('Content-Length')||0)>2_000_000)return null;
 const bytes=await r.arrayBuffer();
 return bytes.byteLength>0&&bytes.byteLength<=2_000_000?bytes:null;
}
async function hasRealArt(url,fetchImpl){
 // The CDN may return its placeholder with HTTP 200; checking onerror is insufficient.
 const art=await fetchImage(url,fetchImpl);
 if(!art)return false;
 const generic=await fetchImpl(FALLBACK,{method:'GET',headers:{'Accept':'image/jpeg,image/*'},redirect:'follow'});
 if(!generic.ok||!/^image\//i.test(generic.headers.get('Content-Type')||''))return false;
 if(Number(generic.headers.get('Content-Length')||0)>2_000_000)return false;
 const genericBytes=await generic.arrayBuffer();
 if(!genericBytes.byteLength||genericBytes.byteLength>2_000_000)return false;
 return !sameBytes(art,genericBytes);
}
async function appToken(clientId,clientSecret,fetchImpl,now){
 if(tokenCache?.clientId===clientId&&tokenCache.expiry>now()+60000)return tokenCache.token;
 const response=await fetchImpl('https://id.twitch.tv/oauth2/token',{
  method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
  body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,grant_type:'client_credentials'}).toString()
 });
 if(!response.ok)throw Error('TWITCH_TOKEN_UNAVAILABLE');
 const data=await response.json();
 if(typeof data.access_token!=='string'||!data.access_token)throw Error('TWITCH_TOKEN_INVALID');
 tokenCache={clientId,token:data.access_token,expiry:now()+Math.min(Math.max(0,+data.expires_in||0),86400)*1000};
 return data.access_token;
}
export async function getTwitchBoxArt(name,env,{fetchImpl=fetch,now=Date.now}={}){
 if(!validTwitchCategoryName(name))return null;
 if(!env.TWITCH_CLIENT_ID||!env.TWITCH_CLIENT_SECRET)return null;
 name=name.trim();
 const key=env.TWITCH_CLIENT_ID+'|'+name;
 const cached=imageCache.get(key);
 if(cached&&cached.expiry>now())return cached.url;
 const token=await appToken(env.TWITCH_CLIENT_ID,env.TWITCH_CLIENT_SECRET,fetchImpl,now);
 const url=new URL('https://api.twitch.tv/helix/games');
 url.searchParams.set('name',name);
 const r=await fetchImpl(url.toString(),{headers:{'Authorization':'Bearer '+token,'Client-Id':env.TWITCH_CLIENT_ID}});
 if(!r.ok)throw Error('TWITCH_GET_GAMES_UNAVAILABLE');
 const json=await r.json();
 const exact=Array.isArray(json?.data)?json.data.find(x=>x?.name?.toLocaleLowerCase()===name.toLocaleLowerCase()):null;
 const art=twitchArtURL(exact?.box_art_url);
 const verified=art&&await hasRealArt(art,fetchImpl)?art:null;
 if(imageCache.size>=150)imageCache.clear();
 imageCache.set(key,{url:verified,expiry:now()+60*60*1000});
 return verified;
}


// Search Categories is useful when YouTube only provides a descriptive stream title.
// A returned name must occur as a complete phrase in the title: never trust
// Twitch's ranking or silently treat any partial result as a confident match.
const TITLE_STOP=new Set([
 'jugando','jugamos','probando','nueva','nuevo','hoy','directo','stream','streaming',
 'live','en','vivo','de','la','el','las','los','y','con','por','para','del',
 'the','a','an','and','with','playing','play','collab','colaboracion','colaboración',
 'gameplay','vtuber','espanol','español','parte','part','episodio','ep','capitulo',
 'chapter','especial','special','primer','primera','first','reaction','reaccion'
]);
const TITLE_EXCLUDE=new Set(['gaming','games','game','youtube','twitch','karaoke','just chatting','collab','general']);
const GENERIC_CATEGORIES=new Set(['gaming','games','game','video games','games demos','games and demos','just chatting','charlando','charla','entretenimiento','variedad','variedades','variety','general','otros','other','live','stream','youtube','twitch','karaoke','collab']);
const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
export function titleCategoryQueries(title){
 const words=normalized(title).split(' ').filter(w=>w.length>=3&&!TITLE_STOP.has(w));
 const result=[];
 for(const size of [3,2,1]){
  for(let i=0;i+size<=words.length;i++){
   const part=words.slice(i,i+size).join(' ');
   if(part.length<5||TITLE_EXCLUDE.has(part)||result.includes(part))continue;
   result.push(part);
   if(result.length>=6)return result;
  }
 }
 return result;
}
const titleImageCache=new Map();
async function categoryFromTitle(title,env,{fetchImpl=fetch,now=Date.now,category=''}={}){
 if(!env.TWITCH_CLIENT_ID||!env.TWITCH_CLIENT_SECRET)return null;
 const key=env.TWITCH_CLIENT_ID+'|title|'+normalized(category)+'|'+normalized(title);
 const cached=titleImageCache.get(key);
 if(cached&&cached.expiry>now())return cached.url;
 const token=await appToken(env.TWITCH_CLIENT_ID,env.TWITCH_CLIENT_SECRET,fetchImpl,now);
 const whole=' '+normalized(title)+' ';
 const reference=normalized(category);
 const isGeneric=!reference||GENERIC_CATEGORIES.has(reference);
 let verified=null;
 for(const query of titleCategoryQueries(title)){
  const url=new URL('https://api.twitch.tv/helix/search/categories');
  url.searchParams.set('query',query);url.searchParams.set('first','30');
  const r=await fetchImpl(url.toString(),{headers:{'Authorization':'Bearer '+token,'Client-Id':env.TWITCH_CLIENT_ID}});
  if(!r.ok)break;
  const json=await r.json();
  const matches=(Array.isArray(json?.data)?json.data:[]).filter(item=>{
   const game=normalized(item?.name);
   // A specific published category blocks unrelated games inferred from the title.
   const related=isGeneric||(' '+game+' ').includes(' '+reference+' ')||(' '+reference+' ').includes(' '+game+' ');
   return game.length>=5&&!TITLE_EXCLUDE.has(game)&&related&&whole.includes(' '+game+' ');
  }).sort((a,b)=>normalized(b.name).length-normalized(a.name).length);
  for(const match of matches.slice(0,2)){
   const art=twitchArtURL(match.box_art_url);
   if(art&&await hasRealArt(art,fetchImpl)){verified=art;break;}
  }
  if(verified)break;
 }
 if(titleImageCache.size>=150)titleImageCache.clear();
 titleImageCache.set(key,{url:verified,expiry:now()+60*60*1000});
 return verified;
}
export async function getEventTwitchArt(event,env,opts={}){
 if(!event||(event.platforms||[]).every(p=>p!=='yt'&&p!=='tw'))return {artUrl:null,source:null};
 const category=typeof event.category==='string'?event.category.trim():'';
 const title=typeof event.title==='string'?event.title.trim():'';
 if(validTwitchCategoryName(category)){
  const artUrl=await getTwitchBoxArt(category,env,opts);
  if(artUrl)return {artUrl,source:'category'};
 }
 if(!validTwitchCategoryName(title))return {artUrl:null,source:null};
 // Skip duplicate exact lookups, but still reverse-search a descriptive title.
 // Some imported YouTube-only events have category === title.
 if(normalized(title)!==normalized(category)){
  const exact=await getTwitchBoxArt(title,env,opts);
  if(exact)return {artUrl:exact,source:'title'};
 }
 const discovered=await categoryFromTitle(title,env,{...opts,category});
 return {artUrl:discovered,source:discovered?'title':null};
}
