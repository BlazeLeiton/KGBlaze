/* Stage 41 — Home banner derives only from the existing Terminal public feed.
 * The native Terminal's lights, statuses and canvas are deliberately unchanged.
 */
(function(scope){
 'use strict';
 const TZ='America/Mexico_City';
 const INACTIVE=new Set(['CANCELADO','DESCANSO','ESCALA','HIATUS','DESPEGÓ']);
 const SCHEDULED=new Set(['A TIEMPO','POR CONFIRMAR','REPROGRAMADO']);
 const VIDEO=/^[A-Za-z0-9_-]{11}$/;
 const COPY={
  es:{header:'PRÓXIMAS SALIDAS',emptyState:'SIN PROGRAMACIÓN',emptyTitle:'Terminal en espera',
      emptyBody:'No hay salidas programadas en este momento.',unavailableState:'SIN DATOS',
      unavailableTitle:'Terminal no disponible',unavailableBody:'No se pudo consultar la programación.',
      action:'Revisa el programa completo',ongoing:'Transmisión en curso',
      states:{'A TIEMPO':'A TIEMPO','EN VIVO':'EN VIVO','POR CONFIRMAR':'POR CONFIRMAR','REPROGRAMADO':'REPROGRAMADO'}},
  en:{header:'UPCOMING DEPARTURES',emptyState:'Nothing scheduled yet',emptyTitle:'Terminal on standby',
      emptyBody:'No departures scheduled at this time.',unavailableState:'DATA UNAVAILABLE',
      unavailableTitle:'Terminal unavailable',unavailableBody:'The schedule could not be retrieved.',
      action:'View the full schedule',ongoing:'Stream in progress',
      states:{'A TIEMPO':'ON TIME','EN VIVO':'LIVE','POR CONFIRMAR':'UNCONFIRMED','REPROGRAMADO':'RESCHEDULED'}},
  ja:{header:'出発予定',emptyState:'配信予定なし',emptyTitle:'ターミナル待機中',
      emptyBody:'現在、出発予定はありません。',unavailableState:'情報取得不可',
      unavailableTitle:'ターミナル情報を取得できません',unavailableBody:'現在、配信予定を確認できません。',
      action:'配信予定をすべて見る',ongoing:'配信中',
      states:{'A TIEMPO':'定刻','EN VIVO':'配信中','POR CONFIRMAR':'未確定','REPROGRAMADO':'日時変更'}}
 };
 const COLORS={'A TIEMPO':'#36D978','EN VIVO':'#ED006F','POR CONFIRMAR':'#F5BF47','REPROGRAMADO':'#F5BF47'};
 const clean=x=>typeof x==='string'?x.trim().replace(/\s+/g,' '):'';
 const same=(a,b)=>clean(a).normalize('NFKC').toLocaleLowerCase().replace(/[\p{P}\p{S}]+/gu,'').replace(/\s+/g,'')===
     clean(b).normalize('NFKC').toLocaleLowerCase().replace(/[\p{P}\p{S}]+/gu,'').replace(/\s+/g,'');
 const editorialIdentity=e=>JSON.stringify([e?.day||'',e?.time||'',e?.title||'',e?.category||'',
     Array.isArray(e?.platforms)?[...e.platforms].sort():[],e?.videoId||'']);
 function youtubeMatch(e,ob){
  return !!(e?.platforms?.includes('yt')&&ob&&ob.source==='youtube_data_api_v3'&&
   ob.verified===true&&ob.matchConfirmed===true&&VIDEO.test(ob.videoId||'')&&
   ob.editorialIdentity===editorialIdentity(e)&&
   ['upcoming','live','completed'].includes(ob.status));
 }
 function twitchMatch(e,ob){
  return !!(e?.platforms?.includes('tw')&&ob?.verified===true&&ob.matchConfirmed===true&&
   ['upcoming','live','completed'].includes(ob.status));
 }
 function status(e,sync){
  const original=e?.status||'POR CONFIRMAR';
  if(INACTIVE.has(original))return original;
  const yt=sync?.youtube,tw=sync?.twitch;
  // Preserve native Terminal priority: a recognised YouTube room wins on a dual-platform event.
  if(youtubeMatch(e,yt)){
   if(yt.status==='live')return 'EN VIVO';
   if(yt.status==='completed')return 'DESPEGÓ';
   if(original==='POR CONFIRMAR'&&yt.status==='upcoming')return 'A TIEMPO';
   return original==='EN VIVO'?'POR CONFIRMAR':original;
  }
  if(twitchMatch(e,tw)){
   if(tw.status==='live')return 'EN VIVO';
   if(tw.status==='completed')return 'DESPEGÓ';
   if(original==='POR CONFIRMAR'&&tw.status==='upcoming')return 'A TIEMPO';
  }
  // Manual/unsourced live labels are not enough to assert an active broadcast on Home.
  return original==='EN VIVO'?'POR CONFIRMAR':original;
 }
 function start(e){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(e?.day||''))return NaN;
  const time=/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time||'')?e.time:'23:59';
  return Date.parse(e.day+'T'+time+':00-06:00');
 }
 function category(e){
  // Calendar category is the activity (game/group), not the dynamically updated stream title.
  const c=clean(e?.category),title=clean(e?.title);
  return c&&c.length<=90?c:(title||c);
 }
 function subtitle(e,obs,st,locale){
  const main=category(e),candidates=[];
  if(e?.spontaneous&&e?.spontaneousDetailOverride)candidates.push(e.extra);
  if(st==='EN VIVO'&&youtubeMatch(e,obs?.youtube)&&obs.youtube.status==='live')
   candidates.push(obs.youtube.videoTitle);
  candidates.push(e?.extra,e?.title);
  for(const raw of candidates){
   const candidate=clean(raw);
   if(candidate&&!same(candidate,main)&&candidate.length<=300)return candidate;
  }
  return COPY[locale]?.ongoing||COPY.es.ongoing;
 }
 function formatDate(e,locale){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(e?.day||''))return '';
  const lang=locale==='ja'?'ja-JP':locale==='en'?'en-US':'es-MX';
  const d=new Date(e.day+'T12:00:00Z');
  const date=new Intl.DateTimeFormat(lang,{timeZone:'UTC',year:'numeric',month:locale==='ja'?'numeric':'short',day:'numeric'}).format(d);
  const time=/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time||'')?e.time:'';
  return time?date+' · '+time+' · CDMX':date;
 }
 function select(data,now=Date.now()){
  if(!data||data.schema!=='relight-public-v1'||!Array.isArray(data.events))return {kind:'unavailable'};
  const matches=data.events.map(e=>({e,sync:data.sync?.[e?.id]||{},when:start(e)}))
   .filter(x=>x.e&&x.e.title?.trim()&&Number.isFinite(x.when))
   .map(x=>({...x,status:status(x.e,x.sync)}))
   .filter(x=>!INACTIVE.has(x.status))
   .sort((a,b)=>a.when-b.when||String(a.e.id).localeCompare(String(b.e.id)));
  const live=matches.find(x=>x.status==='EN VIVO');
  if(live)return {...live,kind:'live'};
  const next=matches.find(x=>SCHEDULED.has(x.status)&&x.when>=now);
  return next?{...next,kind:'scheduled'}:{kind:'empty'};
 }
 scope.KGHomeDeparture=Object.freeze({COPY,COLORS,select,category,subtitle,formatDate,status,youtubeMatch,same,TZ});
})(typeof window==='object'?window:globalThis);
