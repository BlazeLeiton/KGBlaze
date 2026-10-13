import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const viewer=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const TITLES={
  es:'AEROPUERTO INTERNACIONAL DE LA KGBLAZE · TERMINALES A Y B',
  en:'KGBLAZE INTERNATIONAL AIRPORT · TERMINALS A & B',
  ja:'KGBLAZE国際空港 · ターミナルA・B'
};

test('public title ES keeps airport Terminals A and B',()=>{
  assert.ok(viewer.includes("es:{title:'"+TITLES.es+"'"));
  assert.ok(viewer.includes('<h1 class="title-line" id="heading">'+TITLES.es+'</h1>'));
});
test('public title EN keeps airport Terminals A and B',()=>{
  assert.ok(viewer.includes("en:{title:'"+TITLES.en+"'"));
});
test('public title JA keeps airport Terminals A and B',()=>{
  assert.ok(viewer.includes("ja:{title:'"+TITLES.ja+"'"));
});
test('canvas draws translated public airport title with fit',()=>{
  assert.ok(viewer.includes('const airportHeading=TRANSLATIONS[state.lang].title;'));
  assert.ok(viewer.includes('text(airportHeading,36,24,fitted(airportHeading,850,16,12,400,75)'));
});
test('technical software remains Terminal without B suffix',()=>{
  assert.doesNotMatch(viewer,/terminal\s*b\b|terminalb/i);
  assert.ok(viewer.includes('KGBLAZE · Terminal — Tablero semanal de salidas'));
});
