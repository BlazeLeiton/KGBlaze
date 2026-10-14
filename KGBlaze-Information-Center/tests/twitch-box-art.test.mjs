import test from 'node:test';
import assert from 'node:assert/strict';
import {getTwitchBoxArt,validTwitchCategoryName,twitchArtURL} from '../src/twitch-box-art.mjs';

const domain='https://static-cdn.jtvnw.net';
const generic=[9,9,9],real=[1,2,3,4];
const image=(url,bytes)=>({
 ok:true,url,headers:{get:key=>key.toLowerCase()==='content-type'?'image/jpeg':null},
 arrayBuffer:async()=>Uint8Array.from(bytes).buffer
});
function client(gameName,artBytes=real,overrides={}){
 const seen=[];
 const fetchImpl=async(url,options={})=>{
  const key=String(url);seen.push({url:key,options});
  if(key.startsWith('https://id.twitch.tv/oauth2/token'))
   return {ok:true,json:async()=>({access_token:'test-token',expires_in:3600})};
  if(key.startsWith('https://api.twitch.tv/helix/games'))
   return {ok:true,json:async()=>({data:[{id:'99',name:gameName,
     box_art_url:`${domain}/ttv-boxart/99-{width}x{height}.jpg`}]})};
  if(key===domain+'/ttv-static/404_boxart-285x380.jpg')
   return image(key,generic);
  if(key===domain+'/ttv-boxart/99-285x380.jpg')
   return image(overrides.redirectURL||key,artBytes);
  throw Error('Unexpected external request '+key);
 };
 return {fetchImpl,seen};
}
test('Validate names and Twitch-only image URLs',()=>{
 assert.equal(validTwitchCategoryName('Azur Lane'),true);
 assert.equal(validTwitchCategoryName(''),false);
 assert.equal(validTwitchCategoryName('line'+String.fromCharCode(10)+'break'),false);
 assert.equal(validTwitchCategoryName('x'.repeat(101)),false);
 assert.equal(twitchArtURL(domain+'/ttv-boxart/99-{width}x{height}.jpg'),domain+'/ttv-boxart/99-285x380.jpg');
 assert.equal(twitchArtURL('https://bad.test/ttv-boxart/99-{width}x{height}.jpg'),null);
});
test('Missing credentials must return fallback without network calls',async()=>{
 const {fetchImpl,seen}=client('No Token');
 assert.equal(await getTwitchBoxArt('No Token',{}, {fetchImpl}),null);
 assert.equal(seen.length,0);
});
test('Get Games returns genuine box art by exact category name',async()=>{
 const {fetchImpl,seen}=client('Relight Test Game A');
 const got=await getTwitchBoxArt('Relight Test Game A',
  {TWITCH_CLIENT_ID:'test-client',TWITCH_CLIENT_SECRET:'test-secret'},{fetchImpl});
 assert.equal(got,domain+'/ttv-boxart/99-285x380.jpg');
 assert.equal(seen.filter(x=>x.url.includes('/helix/games')).length,1);
 assert.ok(seen.some(x=>x.url.includes('name=Relight+Test+Game+A')));
});
test('Grey gamepad even with HTTP 200 is rejected; show editorial fallback',async()=>{
 const {fetchImpl}=client('Relight Test Game B',generic);
 const got=await getTwitchBoxArt('Relight Test Game B',
  {TWITCH_CLIENT_ID:'test-client',TWITCH_CLIENT_SECRET:'test-secret'},{fetchImpl});
 assert.equal(got,null);
});
test('Redirect to Twitch 404 placeholder is rejected',async()=>{
 const {fetchImpl}=client('Relight Test Game C',real,
 {redirectURL:domain+'/ttv-static/404_boxart-285x380.jpg'});
 assert.equal(await getTwitchBoxArt('Relight Test Game C',
  {TWITCH_CLIENT_ID:'test-client',TWITCH_CLIENT_SECRET:'test-secret'},{fetchImpl}),null);
});
