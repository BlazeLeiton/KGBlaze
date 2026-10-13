import test from 'node:test';
import assert from 'node:assert/strict';
import {currentMonday,addDays,normalizeEditorial,publishReconcile,finalization,lockedChanges,ytHasRoom,twitchFinal,publicAgenda,EMPTY_AGENDA} from '../src/core.mjs';
const base=(now)=>{const mon=currentMonday(now);return {...EMPTY_AGENDA(),events:[{id:'one',origin:'manual',day:mon,time:'22:00',title:'MiSide',category:'MiSide',platforms:['yt','tw'],status:'POR CONFIRMAR'}]};};
test('5 semanas de CDMX, no semana pasada ni quinta futura',()=>{const n=new Date('2026-10-12T19:00:00Z');const a=base(n),m=currentMonday(n);a.events.push({...a.events[0],id:'prev',day:addDays(m,-1)},{...a.events[0],id:'six',day:addDays(m,35)},{...a.events[0],id:'fifth',day:addDays(m,34)});const v=normalizeEditorial(a,n);assert.deepEqual(v.events.map(e=>e.id),['one','fifth']);});
test('sincronización posterior a escritura impide sobrescribir edición obsoleta',()=>{const n=new Date('2026-10-12T19:00:00Z');const a=base(n);const r=publishReconcile(a,a,{},1,2,n);assert.equal(r.code,409);});
test('no se admiten estados o IDs duplicados',()=>{const n=new Date('2026-10-12T19:00:00Z'),a=base(n);a.events.push({...a.events[0]});assert.throws(()=>normalizeEditorial(a,n));a.events.pop();a.events[0].status='AUTOCANCELADO';assert.throws(()=>normalizeEditorial(a,n));});
test('YouTube completo bloquea, interrupción no',()=>{const e={platforms:['yt','tw']};assert.equal(finalization(e,{youtube:{status:'live',matchConfirmed:true,videoId:'abcdefghijk'},twitch:{status:'completed',matchConfirmed:true,endedAt:'2026-10-12T18:00:00Z'}},Date.parse('2026-10-12T19:00:00Z')),null);assert.equal(finalization(e,{youtube:{status:'completed',lifeCycleStatus:'complete',matchConfirmed:true,videoId:'abcdefghijk'}},Date.now()).reason,'youtube_complete');});
test('Twitch finaliza tras 15min, no a los 14m59s',()=>{const t='2026-10-12T18:00:00Z';const s={status:'completed',matchConfirmed:true,endedAt:t};assert.equal(twitchFinal(s,Date.parse(t)+899000),false);assert.equal(twitchFinal(s,Date.parse(t)+900000),true);});
test('cambios editoriales bloqueados tras finalización real',()=>{const n=new Date('2026-10-12T19:00:00Z');const a=normalizeEditorial(base(n),n),b=structuredClone(a);b.events[0].time='23:00';const sync={one:{youtube:{matchConfirmed:true,videoId:'abcdefghijk',lifeCycleStatus:'complete',status:'completed'}}};assert.deepEqual(lockedChanges(a,b,sync),['one']);assert.equal(publishReconcile(a,b,sync,2,2,n).code,423);});
test('un status manual CANCELADO no es fabricado por backend',()=>{const n=new Date('2026-10-12T19:00:00Z');const a=normalizeEditorial(base(n),n);const pub=publicAgenda(a,{one:{youtube:{status:'live',matchConfirmed:true,verified:true}}},1,n);assert.equal(pub.events[0].status,'POR CONFIRMAR');});
test('no aceptar sync falso suministrado por el cliente',()=>{const n=new Date('2026-10-12T19:00:00Z'),a=base(n);a.sync={one:{youtube:{verified:true,status:'completed',lifeCycleStatus:'complete'}}};const normalized=normalizeEditorial(a,n);assert.equal('sync' in normalized,false);});
test('normalización de eventos ICS conserva Twitch y manuales',()=>{
 const n=new Date('2026-10-12T19:00:00Z'),a=base(n);
 a.events=[
  {...a.events[0],id:'tw:uid-uno',origin:'tw'},
  {...a.events[0],id:'tw:uid-dos',origin:'twitch'},
  {...a.events[0],id:'tw:uid-legado',origin:'manual'},
  {...a.events[0],id:'man:uno',origin:'manual'}
 ];
 const original=structuredClone(a),res=normalizeEditorial(a,n);
 assert.deepEqual(res.events.map(x=>x.origin),['twitch','twitch','twitch','manual']);
 assert.deepEqual(a,original,'no se debe modificar la entrada');
});
test('vista pública corrige revisión 1 antigua sin aumentar revisión ni mutar D1',()=>{
 const n=new Date('2026-10-12T19:00:00Z'),a=base(n);
 a.events=[{...a.events[0],id:'tw:uid-legado',origin:'manual'}, {...a.events[0],id:'man:manual-real',origin:'manual'}];
 const original=structuredClone(a),pub=publicAgenda(a,{},1,n);
 assert.equal(pub.revision,1);
 assert.deepEqual(pub.events.map(x=>x.origin),['twitch','manual']);
 assert.deepEqual(a,original);
});
test('migración de origen no bloquea un evento finalizado sin cambios reales',()=>{
 const n=new Date('2026-10-12T19:00:00Z'),a=base(n);
 a.events[0].id='tw:uid-antiguo';a.events[0].origin='manual';
 const old=structuredClone(normalizeEditorial(a,n));old.events[0].origin='manual';
 const newer=structuredClone(old);newer.events[0].origin='twitch';
 const sync={'tw:uid-antiguo':{youtube:{matchConfirmed:true,videoId:'abcdefghijk',lifeCycleStatus:'complete',status:'completed'}}};
 assert.deepEqual(lockedChanges(old,newer,sync,n.getTime()),[]);
 newer.events[0].time='23:00';
 assert.deepEqual(lockedChanges(old,newer,sync,n.getTime()),['tw:uid-antiguo']);
});
test('la rotación de cinco semanas no queda bloqueada por vuelos de semanas anteriores',()=>{const n=new Date('2026-10-19T19:00:00Z'),week=currentMonday(n),old={...EMPTY_AGENDA(),events:[{id:'past',origin:'manual',day:addDays(week,-1),time:'10:00',title:'Pasado',status:'DESPEGÓ',platforms:['yt']}]},newer={...EMPTY_AGENDA(),events:[]};const sync={past:{youtube:{matchConfirmed:true,videoId:'abcdefghijk',status:'completed',lifeCycleStatus:'complete'}}};assert.deepEqual(lockedChanges(old,newer,sync,n.getTime()),[]);});
