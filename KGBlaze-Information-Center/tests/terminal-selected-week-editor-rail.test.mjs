import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../public/v25-web.html',import.meta.url),'utf8');
const start=html.indexOf('function render(){');
const end=html.indexOf('// V24: Hasta siete eventos',start);
assert.ok(start>=0&&end>start,'The hosted V25 render function must remain available');
const renderSource=html.slice(start,end);

function makeEditor(initialWeek){
 const state={week:initialWeek,page:0,lang:'es',lastUpdated:'2026-11-19',hiatusWeeks:{},clearedWeeks:{}};
 const activities=[
  {id:'man:current',origin:'manual',day:'2026-11-19',time:'20:00',title:'Actividad de esta semana',status:'A TIEMPO',platforms:[]},
  {id:'man:future',origin:'manual',day:'2026-11-26',time:'22:00',title:'Collab Padoru',status:'A TIEMPO',platforms:[]}
 ];
 const nodes=new Map();
 const eventList={children:[],replaceChildren(){this.children=[];},append(child){this.children.push(child);}};
 nodes.set('eventList',eventList);
 const $=id=>{
  if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',disabled:false,classList:{toggle(){}},replaceChildren(){},append(){}});
  return nodes.get(id);
 };
 const document={createElement(tag){return {tagName:tag,className:'',innerHTML:'',textContent:''};}};
 const inWeek=()=>{
  const last=new Date(state.week+'T12:00:00Z');
  last.setUTCDate(last.getUTCDate()+6);
  const endDay=last.toISOString().slice(0,10);
  return activities.filter(e=>e.day>=state.week&&e.day<=endDay);
 };
 const draws=[];
 const render=new Function(
  'state','populateWeeks','$','inWeek','friendlyWeek','document','eventLocked',
  'LOGOS','tagName','STATUS','BLANK_STATUS','statusLabel','effectiveEventLogo',
  'esc','DAY_NAMES','dayDate','updateEventListHeight','draw',
  renderSource+'\nreturn render;'
 )(
  state,()=>{},$,inWeek,week=>week,document,()=>false,
  {},k=>k,['A TIEMPO'],new Set(),s=>s,()=>'',s=>String(s),
  ['DOM','LUN','MAR','MIE','JUE','VIE','SAB'],s=>new Date(s+'T12:00:00Z'),
  ()=>{},(items,total,pages)=>draws.push({items,total,pages})
 );
 return {state,render,eventList,draws};
}

test('V25 editor and preview both show the selected future week, including delete controls',()=>{
 const app=makeEditor('2026-11-23');
 app.render();
 assert.equal(app.state.week,'2026-11-23');
 assert.equal(app.eventList.children.length,1);
 assert.match(app.eventList.children[0].innerHTML,/Collab Padoru/);
 assert.match(app.eventList.children[0].innerHTML,/data-delete="man:future"/);
 assert.doesNotMatch(app.eventList.children[0].innerHTML,/Actividad de esta semana/);
 assert.deepEqual(app.draws.at(-1).items.map(e=>e.id),['man:future']);
});

test('Switching back to the current week updates both the editor and the preview',()=>{
 const app=makeEditor('2026-11-23');
 app.render();
 app.state.week='2026-11-16';
 app.render();
 assert.equal(app.state.week,'2026-11-16');
 assert.equal(app.eventList.children.length,1);
 assert.match(app.eventList.children[0].innerHTML,/Actividad de esta semana/);
 assert.doesNotMatch(app.eventList.children[0].innerHTML,/Collab Padoru/);
 assert.deepEqual(app.draws.at(-1).items.map(e=>e.id),['man:current']);
});
