// Read-only artwork cache. Only URLs registered in music-artwork.mjs are accepted.
// Edge cache retains successful raster images for 7 days; browsers for 24 hours.
import {artworkSources,artworkBackupPath} from './music-artwork.mjs';
const MAX_BYTES=4*1024*1024;
const types=new Set(['image/jpeg','image/png','image/webp','image/gif','image/avif']);
const failure=(status)=>new Response(null,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function browserResponse(response,head=false){
 const headers=new Headers(response.headers);
 headers.set('Cache-Control','public, max-age=86400');
 return new Response(head?null:response.body,{status:200,headers});
}
export async function serveArtwork(request,{cache=globalThis.caches?.default,fetcher=globalThis.fetch,assets,ctx}={}){
 const url=new URL(request.url),source=artworkSources.get(url.pathname);
 if(!source)return failure(404);
 if(request.method!=='GET'&&request.method!=='HEAD')return failure(405);
 url.search='';url.hash='';
 const key=new Request(url.toString(),{method:'GET'});
 // Prefer the preserved selected image. No expiry or upstream outage can erase it.
 if(assets){try{const saved=await assets.fetch(new Request(new URL(artworkBackupPath(url.pathname),url),{method:request.method}));if(saved.ok&&(saved.headers.get('Content-Type')||'').startsWith('image/webp')){return browserResponse(saved,request.method==='HEAD');}}catch{}}

 try{const hit=await cache?.match(key);if(hit)return browserResponse(hit,request.method==='HEAD');}catch{}
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),8000);
 try{
  const upstream=await fetcher(source,{signal:controller.signal,redirect:'follow',headers:{Accept:'image/avif,image/webp,image/png,image/jpeg,image/gif'}});
  const type=(upstream.headers.get('Content-Type')||'').split(';')[0].trim().toLowerCase();
  if(!upstream.ok||!types.has(type)||Number(upstream.headers.get('Content-Length'))>MAX_BYTES||!upstream.body)return failure(502);
  const reader=upstream.body.getReader(),chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();return failure(502);}chunks.push(value);}
  if(!size)return failure(502);
  const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength;}
  const response=new Response(body,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=604800','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow, noarchive'}});
  if(cache){const copy=response.clone();const saving=Promise.resolve().then(()=>cache.put(key,copy)).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(saving);else await saving;}
  return browserResponse(response,request.method==='HEAD');
 }catch{return failure(502);}finally{clearTimeout(timeout);}
}
