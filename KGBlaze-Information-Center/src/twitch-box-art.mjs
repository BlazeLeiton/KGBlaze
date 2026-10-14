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
