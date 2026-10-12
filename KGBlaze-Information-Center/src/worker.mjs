import {EMPTY_AGENDA,normalizeEditorial,publishReconcile,publicAgenda,toSyncEnvelope,nowISO,currentMonday} from './core.mjs';
const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...HEADERS,...extra}});
const err=(status,code,detail)=>json({ok:false,error:code,detail},status);
function localCors(req,env){
 const origin=req.headers.get('Origin');
 if(!origin)return {};
 const allowed=origin==='null'||origin==='http://localhost'||/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)||origin===env.ADMIN_ALLOWED_ORIGIN||origin===new URL(req.url).origin;
 return allowed?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Max-Age':'300'}:{};
}
async function authorized(req,env){
 const v=req.headers.get('Authorization')||'',secret=env.ADMIN_TOKEN||'';
 if(!secret||!v.startsWith('Bearer '))return false;
 const enc=new TextEncoder(),a=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(v.slice(7)))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(secret)));
 let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
async function getState(env){
 const row=await env.DB.prepare('SELECT revision,editorial_json,sync_json,updated_at FROM terminalb_state WHERE id=1').first();
 return row?{revision:row.revision,editorial:JSON.parse(row.editorial_json),sync:JSON.parse(row.sync_json),updatedAt:row.updated_at}:
 {revision:0,editorial:EMPTY_AGENDA(),sync:{},updatedAt:null};
}
async function storeEditorial(env,old,next){
 const t=nowISO();
 if(old.revision===0&&old.updatedAt===null){
  const r=await env.DB.prepare('INSERT OR IGNORE INTO terminalb_state (id,revision,editorial_json,sync_json,updated_at) VALUES (1,1,?,?,?)').bind(JSON.stringify(next),JSON.stringify(old.sync),t).run();
  if(r.meta.changes!==1)return false;
 }else{
  const r=await env.DB.prepare('UPDATE terminalb_state SET revision=revision+1, editorial_json=?,updated_at=? WHERE id=1 AND revision=?').bind(JSON.stringify(next),t,old.revision).run();
  if(r.meta.changes!==1)return false;
 }
 await env.DB.prepare("INSERT INTO terminalb_audit (revision,source,happened_at,note) VALUES (?,'editor',?,'Actualización editorial desde operativo local')").bind(old.revision+1,t).run();
 return true;
}
async function savePreview(req,env,revision){
 const type=req.headers.get('Content-Type')||'';
 if(!type.startsWith('image/png'))return err(415,'PNG_REQUIRED');
 if(Number(req.headers.get('Content-Length')||0)>2_500_000)return err(413,'PREVIEW_TOO_LARGE');
 const buf=await req.arrayBuffer();if(buf.byteLength>2_500_000)return err(413,'PREVIEW_TOO_LARGE');
 const b=new Uint8Array(buf);if(b.length<24||[137,80,78,71,13,10,26,10].some((x,i)=>x!==b[i]))return err(400,'BAD_PNG');
 const w=(b[16]<<24)|(b[17]<<16)|(b[18]<<8)|b[19],h=(b[20]<<24)|(b[21]<<16)|(b[22]<<8)|b[23];
 if(w!==1080||h!==1080)return err(400,'PNG_MUST_BE_1080_SQUARE');
 const week=req.headers.get('X-TerminalB-Week')||'';if(!/^\d{4}-\d\d-\d\d$/.test(week))return err(400,'WEEK_REQUIRED');
 await env.DB.prepare("INSERT INTO terminalb_preview (id,week,mime,payload,updated_at) VALUES (1,?,'image/png',?,?) ON CONFLICT(id) DO UPDATE SET week=excluded.week,payload=excluded.payload,updated_at=excluded.updated_at").bind(week,new Uint8Array(buf),nowISO()).run();
 return json({ok:true,week,revision});
}
async function handler(req,env){
 const url=new URL(req.url),path=url.pathname,method=req.method;
 if(path==='/api/health'&&method==='GET')return json({ok:true,service:'kgblaze-terminalb',database:!!env.DB,version:'preview-0.1'});
 if(!env.DB&&['/api/public','/agenda_publica.json'].includes(path))return err(503,'DATABASE_NOT_CONFIGURED');
 if(!env.DB&&(path.startsWith('/api/')||path==='/og-semana.png'))return err(503,'DATABASE_NOT_CONFIGURED');
 if((path==='/api/public'||path==='/agenda_publica.json')&&method==='GET'){
  const d=await getState(env);return json(publicAgenda(d.editorial,d.sync,d.revision));
 }
 if(path==='/og-semana.png'&&method==='GET'){
  const r=await env.DB.prepare('SELECT week,payload FROM terminalb_preview WHERE id=1').first();
  if(!r||r.week!==currentMonday())return new Response('No hay vista previa publicada',{status:404,headers:{'Cache-Control':'no-store'}});
  return new Response(r.payload instanceof Uint8Array||r.payload instanceof ArrayBuffer?r.payload:new Uint8Array(r.payload),{headers:{'Content-Type':'image/png','Cache-Control':'public,max-age=60','X-TerminalB-Week':r.week}});
 }
 if(!path.startsWith('/api/admin/'))return null;
 const cors=localCors(req,env);
 if(method==='OPTIONS')return Object.keys(cors).length?new Response(null,{status:204,headers:cors}):err(403,'ORIGIN_NOT_ALLOWED');
 if(req.headers.has('Origin')&&!Object.keys(cors).length)return err(403,'ORIGIN_NOT_ALLOWED');
 if(!await authorized(req,env))return json({ok:false,error:'UNAUTHORIZED'},401,cors);
 const d=await getState(env);
 if(path==='/api/admin/snapshot'&&method==='GET')return json({schema:'terminalb-admin-v1',revision:d.revision,editorial:d.editorial,sync:toSyncEnvelope(d.sync,d.revision),updatedAt:d.updatedAt},200,cors);
 if(path==='/api/admin/sync'&&method==='GET')return json(toSyncEnvelope(d.sync,d.revision),200,cors);
 if(path==='/api/admin/publish'&&method==='POST'){
  if(Number(req.headers.get('Content-Length')||0)>5_200_000)return json({error:'TOO_LARGE'},413,cors);
  let body;try{const raw=await req.text();if(raw.length>5_200_000)return json({error:'TOO_LARGE'},413,cors);body=JSON.parse(raw);}catch{return json({error:'INVALID_JSON'},400,cors);}
  let check;try{check=publishReconcile(d.editorial,body.agenda,d.sync,body.baseRevision,d.revision);}catch(e){return json({ok:false,error:'INVALID_AGENDA',detail:e.message},400,cors);}
  if(!check.ok)return json(check,check.code,cors);
  if(!await storeEditorial(env,d,check.agenda))return json({ok:false,error:'CONFLICT_REVISION',detail:'El servidor cambió durante la publicación'},409,cors);
  return json({ok:true,revision:d.revision+1,publishedAt:nowISO(),events:check.agenda.events.length},200,cors);
 }
 if(path==='/api/admin/preview'&&method==='POST'){
  const result=await savePreview(req,env,d.revision);const h=new Headers(result.headers);for(const [k,v] of Object.entries(cors))h.set(k,v);return new Response(result.body,{status:result.status,headers:h});
 }
 return json({error:'NOT_FOUND'},404,cors);
}
export default {
 async fetch(req,env){
  try{
   const r=await handler(req,env);if(r)return r;
   if(!env.ASSETS)return err(503,'ASSETS_NOT_CONFIGURED');
   const asset=await env.ASSETS.fetch(req);
   const path=new URL(req.url).pathname;
   if((path==='/'||path==='/index.html')&&env.DB&&typeof HTMLRewriter!=='undefined'&&asset.ok){
    const r=await env.DB.prepare('SELECT week FROM terminalb_preview WHERE id=1').first();
    if(r?.week===currentMonday()){
     const image=new URL('/og-semana.png',req.url).href;
     return new HTMLRewriter().on('meta[property="og:image"],meta[name="twitter:image"]',{element(el){el.setAttribute('content',image);}}).transform(asset);
    }
   }
   return asset;
  }catch(e){console.error('TerminalB Worker error:',e);return err(500,'SERVER_ERROR');}
 },
 // Platform polling intentionally NOT enabled until credentials and conservative matching are tested.
 async scheduled(_controller,env,_ctx){console.log('Scheduled sync pending platform credentials',!!env.DB);}
};
