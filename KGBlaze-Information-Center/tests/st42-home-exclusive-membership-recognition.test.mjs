import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../public/home.html',import.meta.url),'utf8');

test('CP10 Home recognition is exclusively YouTube members and Twitch subscribers',()=>{
 assert.match(html,/<small data-i18n="recognitionSources">Miembros de YouTube · Suscriptores de Twitch<\/small>/);
 assert.match(html,/recognitionTitle:"Gracias a quienes hacen posible este viaje"/);
 assert.match(html,/recognitionSources:"Miembros de YouTube · Suscriptores de Twitch"/);
 assert.match(html,/recognitionSources:"YouTube members · Twitch subscribers"/);
 assert.match(html,/recognitionSources:"YouTubeメンバー · Twitchサブスクライバー"/);
 assert.doesNotMatch(html,/recognitionSources:[^\n]*?(?:Apoyos recurrentes|Recurring supporters|継続サポーター)/);
 assert.doesNotMatch(html,/<small data-i18n="recognitionSources">[^<]*(?:Apoyos recurrentes|Seguidores|Viewers)<\/small>/);
});

test('CP10 recognition remains a separate, non-interactive strip below both terminals',()=>{
 const y=html.indexOf('id="twitch-screen"');
 const t=html.indexOf('id="kg-recognition-strip"');
 assert.ok(y>0&&t>y,'Recognition strip should appear after YouTube/Twitch terminal section');
 assert.match(html,/id="kg-recognition-strip" class="kg-recognition-strip"/);
 assert.match(html,/data-i18n="recognitionTitle"/);
});
