import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../public/home.html',import.meta.url),'utf8');

test('CP10 Home recognizes Twitch subscribers, YouTube members and future recurring subscribers',()=>{
 assert.match(html,/<small data-i18n="recognitionSources">Miembros de YouTube · Suscriptores de Twitch · Apoyos recurrentes<\/small>/);
 assert.match(html,/recognitionTitle:"Gracias a quienes hacen posible este viaje"/);
 assert.match(html,/recognitionSources:"Miembros de YouTube · Suscriptores de Twitch · Apoyos recurrentes"/);
 assert.match(html,/recognitionSources:"YouTube members · Twitch subscribers · Recurring supporters"/);
 assert.match(html,/recognitionSources:"YouTubeメンバー · Twitchサブスクライバー · 継続サポーター"/);
 assert.doesNotMatch(html,/<small data-i18n="recognitionSources">[^<]*(?:Espectadores|Viewers|Seguidores|Followers)<\/small>/);
});

test('CP10 recognition remains a separate, non-interactive strip below both terminals',()=>{
 const t=html.indexOf('id="twitch-screen"'),r=html.indexOf('id="kg-recognition-strip"');
 assert.ok(t>0&&r>t,'Recognition strip should appear after YouTube/Twitch terminal section');
 assert.match(html,/id="kg-recognition-strip" class="kg-recognition-strip"/);
 assert.match(html,/data-i18n="recognitionTitle"/);
});
