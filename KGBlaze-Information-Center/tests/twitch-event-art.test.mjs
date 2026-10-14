import test from 'node:test';
import assert from 'node:assert/strict';
import {getEventTwitchArt,titleCategoryQueries} from '../src/twitch-box-art.mjs';

const cdn='https://static-cdn.jtvnw.net';
function setup({games={},search=[]}={}){
 const calls=[];
 const image=(url,bytes)=>({ok:true,url,headers:{get:k=>k.toLowerCase()==='content-type'?'image/jpeg':null},arrayBuffer:async()=>Uint8Array.from(bytes).buffer});
 const fetchImpl=async(value)=>{
  const u=new URL(String(value));calls.push(u.href);
  if(u.hostname==='id.twitch.tv')return {ok:true,json:async()=>({access_token:'token-for-tests',expires_in:3600})};
  if(u.pathname==='/helix/games'){
   const name=u.searchParams.get('name');
   const game=games[name];
   return {ok:true,json:async()=>({data:game?[{id:game,name,box_art_url:cdn+'/ttv-boxart/'+game+'-{width}x{height}.jpg'}]:[]})};
  }
  if(u.pathname==='/helix/search/categories'){
   const query=u.searchParams.get('query');
   return {ok:true,json:async()=>({data:search.filter(x=>x.name.toLowerCase().includes(query)) .map(x=>({id:x.id,name:x.name,box_art_url:cdn+'/ttv-boxart/'+x.id+'-{width}x{height}.jpg'}))})};
  }
  if(u.pathname==='/ttv-static/404_boxart-285x380.jpg')return image(u.href,[9,9,9]);
  if(u.pathname.startsWith('/ttv-boxart/'))return image(u.href,[1,2,3,4]);
  throw Error('Unexpected '+u.href);
 };
 return {fetchImpl,calls};
}
let seq=0;
const env=()=>({TWITCH_CLIENT_ID:'relight-art-test-'+(++seq),TWITCH_CLIENT_SECRET:'fake-secret'});
test('YouTube-only entry resolves official art using the published category first',async()=>{
 const c=setup({games:{'Azur Lane':'azur'}});
 const e={id:'manual:yt-1',category:'Azur Lane',title:'Collab Padoru',platforms:['yt']};
 assert.deepEqual(await getEventTwitchArt(e,env(),{fetchImpl:c.fetchImpl}),{artUrl:cdn+'/ttv-boxart/azur-285x380.jpg',source:'category'});
 assert.equal(c.calls.filter(u=>u.includes('/helix/games')).length,1);
 assert.equal(c.calls.filter(u=>u.includes('/search/categories')).length,0);
});
test('Generic YouTube category can infer an exact game phrase from stream title',async()=>{
 const c=setup({search:[{name:'Azur Lane',id:'azur'}]});
 const e={category:'Gaming',title:'Jugando Azur Lane con amigos',platforms:['yt']};
 assert.deepEqual(await getEventTwitchArt(e,env(),{fetchImpl:c.fetchImpl}),{artUrl:cdn+'/ttv-boxart/azur-285x380.jpg',source:'title'});
 assert.ok(c.calls.some(x=>x.includes('/helix/search/categories')));
});
test('An unrelated title category is rejected when the published category is specific',async()=>{
 const c=setup({search:[{name:'Gran Premio',id:'grandprix'}]});
 const e={category:'Formula 1',title:'Formula 1 Gran Premio de México',platforms:['tw']};
 assert.deepEqual(await getEventTwitchArt(e,env(),{fetchImpl:c.fetchImpl}),{artUrl:null,source:null});
});
test('No Twitch app credentials means no external calls even for YouTube',async()=>{
 const c=setup();
 const e={category:'Minecraft',title:'Minecraft',platforms:['yt']};
 assert.deepEqual(await getEventTwitchArt(e,{}, {fetchImpl:c.fetchImpl}),{artUrl:null,source:null});
 assert.equal(c.calls.length,0);
});
test('Search rejects generic keywords and preserves substantive game terms',()=>{
 const queries=titleCategoryQueries('EN VIVO: Jugando Azur Lane con amigos');
 assert.ok(queries.includes('azur lane'));
 assert.ok(!queries.includes('en vivo'));
});
