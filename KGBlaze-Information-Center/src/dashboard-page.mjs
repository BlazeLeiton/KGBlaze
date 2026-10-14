/** Hosted Stage 21 control panel.
 * Only PUBLIC editorial data may be read without authorization.
 * All mutations reuse the existing ADMIN_TOKEN-protected D1 publish route.
 * The v25 private/local HTML and its embedded fonts are never published.
 */
export const DASHBOARD_HTML = String.raw`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Terminal · Dashboard editorial | KGBlaze</title>
<style>
:root{color-scheme:dark;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;background:#09112b;color:#e8f0ff}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at top right,#193469 0,#0a1635 32%,#081025 72%);min-height:100vh}
button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}
a{color:#a4d4ff}header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;padding:18px 24px;border-bottom:1px solid #365179;background:#09152b}
.eyebrow{font-size:11px;color:#94b9e7;letter-spacing:.18em;text-transform:uppercase;font-weight:800}
header h1{font-size:23px;margin:5px 0 0;letter-spacing:.02em}
header .links{display:flex;gap:14px;font-size:13px;align-items:center}
main{display:grid;grid-template-columns:minmax(240px,315px) minmax(340px,1fr) minmax(275px,355px);gap:16px;max-width:1670px;margin:0 auto;padding:20px}
.panel{background:#0f2042;border:1px solid #35517e;border-radius:15px;box-shadow:0 8px 24px #0003;min-width:0}
.panel>h2{font-size:15px;letter-spacing:.025em;padding:16px;margin:0;border-bottom:1px solid #2b436f}
.padded{padding:16px}.muted,.help{color:#adbfde;font-size:12px;line-height:1.5}.row{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.spread{justify-content:space-between}.button{border-radius:9px;background:#253e6d;border:1px solid #5674a4;color:#eaf3ff;font-weight:650;padding:9px 12px}
.button:hover{background:#38588d}.button.primary{background:#3569b7;border-color:#6a99ed}.button.warn{color:#ffd3cf;border-color:#9f5454}
.field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;font-size:12px;font-weight:650;color:#bfd6fa}
.field input,.field select,.field textarea{background:#0b1731;color:#f1f5fe;padding:10px;border:1px solid #456491;border-radius:8px;min-width:0;width:100%;font-size:14px}
textarea{resize:vertical;min-height:72px}.field input:focus,.field select:focus,.field textarea:focus{outline:2px solid #86bcff}
.controls{display:grid;grid-template-columns:1fr 1fr;gap:9px}.controls .wide{grid-column:span 2}
#eventsList{max-height:66vh;overflow:auto;padding:8px}
.event{width:100%;text-align:left;display:block;padding:11px 13px;border:1px solid transparent;color:#ecf3ff;background:transparent;border-radius:9px;margin:3px 0}
.event strong,.event small{display:block}.event small{margin-top:5px;color:#b4c7e7;font-size:11px}
.event.active{background:#224579;border-color:#5c8bd1}.event:hover{background:#213d67}
.stat{display:inline-block;background:#264575;border:1px solid #3a5d8b;border-radius:99px;padding:2px 8px;font-size:10px;margin-top:6px}
.stat.ended{background:#163a47;border-color:#367b7b}
#notice{font-size:13px;padding:12px 16px;background:#153052;border-bottom:1px solid #35517e;min-height:45px}
#notice.error{background:#58262c;color:#ffd6d1}
#notice.success{background:#153d40;color:#befce8}
footer{padding:15px;color:#9ab6e3;font-size:12px;max-width:1500px;margin:auto}
#libraryItems{max-height:350px;overflow:auto;margin-bottom:12px}
.libitem{display:flex;align-items:center;gap:10px;background:#152d54;padding:7px;border-radius:9px;margin:5px 0}
.libitem img{width:45px;height:48px;object-fit:contain;background:#0c1730;border-radius:5px}
.libitem button{margin-left:auto}
#libraryPreview,#eventPreview{max-width:100%;max-height:125px;object-fit:contain;display:block;margin:5px auto}
details{margin-top:15px;border-top:1px solid #36517b;padding-top:12px}
summary{cursor:pointer;font-size:13px;font-weight:700;color:#bedaff}
code{font-size:12px;overflow-wrap:anywhere}
#auth{width:285px;max-width:100%;background:#101d3c;color:#fff;padding:8px 10px;border-radius:7px;border:1px solid #425b89}
.pill{padding:4px 8px;background:#182b4e;border:1px solid #375d99;border-radius:10px;font-size:11px}
.frame{display:block;width:100%;height:420px;background:#08122b;border:1px solid #35517e;border-radius:9px}
@media(max-width:1120px){main{grid-template-columns:minmax(220px,1fr) minmax(320px,2fr)}.right{grid-column:1/-1}}
@media(max-width:700px){main{grid-template-columns:1fr;padding:10px}.right{grid-column:auto}#eventsList{max-height:260px}header{padding:15px}}
</style></head><body>
<header><div><div class="eyebrow">Aeropuerto Internacional de la KGBlaze · Terminales A y B</div><h1>Centro de control editorial</h1></div>
<div class="links"><a href="/departures/" target="_blank" rel="noopener">Abrir salidas ↗</a><span class="pill" id="revision">Revisión —</span></div></header>
<div id="notice" role="status" aria-live="polite">Conectando a la misma agenda D1 de la Terminal…</div>
<main>
<section class="panel"><h2>Salidas y actividades</h2><div class="padded">
<label class="field">Buscar actividad <input id="search" placeholder="Título, categoría, fecha…"></label>
<div class="row"><button class="button primary" id="addEvent">＋ Nueva actividad</button><button class="button" id="reload">↻ Consultar</button></div>
<p class="help">La agenda es compartida con Departures. Las observaciones verificadas de YouTube y Twitch son de solo lectura.</p></div>
<div id="eventsList"></div></section>
<section class="panel"><h2>Edición editorial <span class="pill" id="selection">Sin selección</span></h2>
<div class="padded">
<p class="help">Los cambios de cada campo se publican automáticamente cuando terminas de editarlo. Un error de revisión o un vuelo finalizado nunca se sobrescribe en silencio.</p>
<div id="empty">Selecciona una actividad o crea una nueva para comenzar.</div>
<form id="editForm" hidden>
<div class="controls">
<label class="field wide">Título <input id="title" maxlength="150" required></label>
<label class="field">Fecha (CDMX) <input id="day" type="date" required></label>
<label class="field">Hora (CDMX) <input id="time" type="time"></label>
<label class="field wide">Categoría <input id="category" maxlength="200"></label>
<label class="field">Estado editorial <select id="status"></select></label>
<label class="field">Video ID YouTube <input id="videoId" maxlength="11" placeholder="Opcional"></label>
<label class="field wide">Texto adicional <textarea id="extra" maxlength="300" rows="2"></textarea></label>
</div>
<div class="field"><span>Plataformas publicadas</span><div class="row">
<label><input type="checkbox" class="platform" value="yt"> YouTube</label>
<label><input type="checkbox" class="platform" value="tw"> Twitch</label>
<label><input type="checkbox" class="platform" value="ig"> Instagram</label>
<label><input type="checkbox" class="platform" value="dc"> Discord</label>
</div></div>
<label class="field">Imagen editorial del calendario <select id="logoChoice"></select></label>
<label class="field">Subir portada editorial (máx. 1 MB) <input id="eventImage" type="file" accept="image/png,image/jpeg,image/webp"></label>
<img id="eventPreview" hidden alt="Imagen editorial">
<p class="help">La portada oficial de categoría en la ficha desplegable sigue siendo independiente de la imagen editorial del calendario.</p>
<div class="row"><button type="button" class="button warn" id="deleteEvent">Eliminar actividad</button><button type="button" class="button" id="publishNow">Guardar ahora</button></div>
</form></div></section>
<aside class="panel right"><h2>Biblioteca compartida y conexión</h2><div class="padded">
<label class="field">Clave administrativa existente (solo memoria de esta pestaña)
<input id="auth" type="password" autocomplete="off" placeholder="Necesaria para guardar cambios"></label>
<p class="help">No se crea un nuevo acceso ni se guarda la clave. La página puede abrirse sin iniciar sesión; las escrituras siguen protegidas por el token de Terminal.</p>
<div class="row"><span id="syncBadge" class="pill">Sincronizando</span><button class="button" id="retry">Reintentar</button></div>
<details open><summary>Biblioteca editorial compartida</summary>
<p class="help">Las imágenes de esta lista se guardan en los mismos campos libraryCustom de D1. Las imágenes de categoría oficial en las fichas siguen teniendo prioridad.</p>
<div id="libraryItems"></div>
<form id="libraryForm">
<label class="field">Nombre de imagen <input id="libName" maxlength="100" required placeholder="Karaoke / Collab Padoru…"></label>
<label class="field">Alias (separados por comas) <input id="libAliases" maxlength="300" placeholder="Alternativa 1, Alternativa 2"></label>
<label class="field">Archivo PNG/JPG/WebP (máx. 1 MB) <input id="libFile" type="file" accept="image/png,image/jpeg,image/webp"></label>
<img id="libraryPreview" hidden alt="Vista previa de biblioteca">
<button class="button primary" type="submit">＋ Añadir a biblioteca</button>
</form>
</details>
<details><summary>Ajustes avanzados de biblioteca</summary>
<p class="help">Se conserva el mapa libraryChanges del operativo original. Solo modificar el JSON si conoces los identificadores de las imágenes precargadas.</p>
<label class="field">Cambios en biblioteca (JSON)<textarea rows="5" id="libraryChanges"></textarea></label>
<button class="button" id="applyLibChanges">Aplicar biblioteca</button>
</details>
<details><summary>Vista pública en vivo</summary><p class="help">Muestra la Terminal publicada. El visor recibe revisiones automáticamente, normalmente en un máximo de 90 segundos.</p>
<iframe class="frame" title="Vista pública de salidas" loading="lazy" referrerpolicy="no-referrer" src="/departures/?embed=1"></iframe>
</details>
</div></aside>
</main><footer>KGBlaze · Dashboard web inicial · D1 única · Publicación por revisión (CAS) · Sin edición de observaciones verificadas</footer>
<script>
(function(){
"use strict";
const endpoint="/departures/api/public",admin="/departures/api/admin/publish";
const $=id=>document.getElementById(id);
const allowedStatuses=["A TIEMPO","POR CONFIRMAR","REPROGRAMADO","CANCELADO","EN VIVO","DESPEGÓ","DESCANSO","ESCALA","HIATUS"];
let agenda=null,revision=null,sync={},selectedId=null,saving=false,dirty=false,blocked=false,timer=null,libraryBytes=null,eventBytes=null;
const fields=["title","day","time","category","status","extra","videoId"];
const notify=(message,type)=>{const n=$("notice");n.textContent=message;n.className=type||"";};
function scrubImage(url){return typeof url==="string"&&(/^(data:image\\/(png|jpeg|webp);base64,)/.test(url)||/^https:\\/\\//.test(url))?url:"";}
function getEvent(){return agenda&&agenda.events.find(e=>e.id===selectedId);}
const clone=x=>JSON.parse(JSON.stringify(x));
function renderList(){
 const text=$("search").value.toLowerCase().trim(),host=$("eventsList");
 host.replaceChildren();
 if(!agenda)return;
 const events=[...agenda.events].sort((a,b)=>(a.day+" "+a.time).localeCompare(b.day+" "+b.time));
 for(const e of events){
  if(text&&!(e.title+" "+e.category+" "+e.day).toLowerCase().includes(text))continue;
  const b=document.createElement("button");b.type="button";b.className="event"+(selectedId===e.id?" active":"");
  const strong=document.createElement("strong");strong.textContent=e.title;
  const small=document.createElement("small");small.textContent=e.day+" · "+(e.time||"Sin hora")+" · "+(e.category||"Sin categoría");
  const badge=document.createElement("span");badge.className="stat";
  let show=e.status,ob=sync[e.id]?.youtube;
  if(ob?.verified&&ob.matchConfirmed&&ob.status==="completed"&&ob.lifeCycleStatus==="complete")show="DESPEGÓ";
  if(show==="DESPEGÓ")badge.classList.add("ended");
  badge.textContent=show;
  b.append(strong,small,badge);b.addEventListener("click",()=>{selectedId=e.id;renderList();renderEditor();});
  host.append(b);
 }
 if(!host.childNodes.length)host.textContent="No hay actividades con ese filtro.";
}
function libraryChoices(){
 const select=$("logoChoice"),current=getEvent()?.logoChoice||"auto";
 select.replaceChildren();
 [["auto","Automática"],["upload","Imagen subida"],...(agenda?.libraryCustom||[]).filter(x=>x?.id).map(x=>["lib:"+x.id,"Biblioteca: "+(x.name||x.id)])].forEach(pair=>{
 const o=document.createElement("option");o.value=pair[0];o.textContent=pair[1];select.append(o);
 });
 if(![...select.options].some(x=>x.value===current)){
 const o=document.createElement("option");o.value=current;o.textContent="Selección existente: "+current;select.append(o);
 }
 select.value=current;
}
function renderEditor(){
 const e=getEvent();$("editForm").hidden=!e;$("empty").hidden=!!e;$("selection").textContent=e?(e.id.length>25?e.id.slice(0,25)+"…":e.id):"Sin selección";
 if(!e)return;
 for(const key of fields)$(key).value=e[key]||"";
 for(const p of document.querySelectorAll(".platform"))p.checked=(e.platforms||[]).includes(p.value);
 libraryChoices();
 const url=scrubImage(e.logoData);
 $("eventPreview").hidden=!url;
 if(url)$("eventPreview").src=url;else $("eventPreview").removeAttribute("src");
}
function renderLibrary(){
 const host=$("libraryItems");host.replaceChildren();
 for(const item of agenda?.libraryCustom||[]){
  const div=document.createElement("div");div.className="libitem";
  const img=document.createElement("img");const url=scrubImage(item.img);if(url)img.src=url;img.alt="";
  const name=document.createElement("div");const s=document.createElement("strong");s.textContent=item.name||item.id||"Sin nombre";const aliases=document.createElement("small");aliases.className="help";aliases.textContent=(item.aliases||[]).join(", ");name.append(s,aliases);
  const btn=document.createElement("button");btn.type="button";btn.className="button warn";btn.textContent="×";btn.title="Eliminar "+s.textContent;
  btn.addEventListener("click",()=>{if(!confirm("¿Eliminar esta imagen de la biblioteca?"))return;agenda.libraryCustom=agenda.libraryCustom.filter(x=>x.id!==item.id);renderLibrary();libraryChoices();schedule();});
  div.append(img,name,btn);host.append(div);
 }
 $("libraryChanges").value=JSON.stringify(agenda?.libraryChanges||{},null,2);
}
function refreshFooter(){
 $("revision").textContent="Revisión "+(revision??"—");
 $("syncBadge").textContent=blocked?"Conflicto de revisión":saving?"Publicando…":dirty?"Pendiente de guardar":"Sincronizado · D1";
}
async function load(){
 if(saving||dirty){notify("Hay cambios sin guardar. Guarda antes de actualizar.","error");return;}
 try{
  const res=await fetch(endpoint,{cache:"no-store",credentials:"omit"});
  if(!res.ok)throw Error("HTTP "+res.status);
  const data=await res.json();
  if(!Array.isArray(data.events)||!Number.isInteger(data.revision))throw Error("Respuesta incompleta de Terminal");
  agenda={schema:data.schema,publishedAt:data.publishedAt,sourceNote:data.sourceNote,timezone:data.timezone,events:clone(data.events),
   libraryCustom:clone(data.libraryCustom||[]),libraryChanges:clone(data.libraryChanges||{}),
   hiatusWeeks:clone(data.hiatusWeeks||{}),clearedWeeks:clone(data.clearedWeeks||{})};
  revision=data.revision;sync=data.sync||{};blocked=false;
  if(!getEvent())selectedId=null;
  renderList();renderEditor();renderLibrary();refreshFooter();
  notify("Conectado a la publicación real · revisión "+revision+" · "+agenda.events.length+" actividades.","success");
 }catch(err){notify("No se pudo consultar Terminal: "+err.message,"error");}
}
function schedule(){
 dirty=true;refreshFooter();clearTimeout(timer);
 timer=setTimeout(flush,650);
}
async function flush(){
 if(!dirty||saving||blocked)return;
 const token=$("auth").value.trim();
 if(!token){notify("Puedes consultar sin iniciar sesión. Para guardar cambios, introduce la clave administrativa existente.","error");refreshFooter();return;}
 saving=true;dirty=false;refreshFooter();
 const copy=clone(agenda),baseRevision=revision;
 try{
  const res=await fetch(admin,{method:"POST",cache:"no-store",credentials:"omit",
   headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
   body:JSON.stringify({baseRevision,agenda:copy})});
  const result=await res.json().catch(()=>({error:"ERROR_NO_JSON"}));
  if(!res.ok){
   dirty=true;
   if(res.status===409||res.status===423)blocked=true;
   throw Error((result.error||"ERROR")+" ("+res.status+")");
  }
  revision=result.revision;notify("Publicado en Departures · revisión "+revision+". Las otras pantallas se actualizarán con su siguiente consulta.","success");
 }catch(err){notify("No se publicó: "+err.message+(blocked?". Revisa el conflicto antes de recargar.":""),"error");}
 finally{saving=false;refreshFooter();if(dirty&&!blocked&&$("auth").value.trim())schedule();}
}
function fileURL(file){return new Promise((resolve,reject)=>{if(!file||!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>1024*1024){reject(Error("Se requiere una imagen PNG/JPG/WebP de máximo 1 MB"));return;}
 const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(Error("No se pudo leer imagen"));reader.readAsDataURL(file);});}
for(const s of allowedStatuses){const opt=document.createElement("option");opt.value=s;opt.textContent=s;$("status").append(opt);}
for(const key of fields){
 $(key).addEventListener("change",()=>{const e=getEvent();if(!e)return;let val=$(key).value;
 if(key==="videoId"&&val&&!/^[A-Za-z0-9_-]{11}$/.test(val)){notify("Video ID de YouTube inválido. Se requieren 11 caracteres.","error");return;}
 if(key==="title"&&!val.trim()){notify("El título no puede quedar vacío.","error");return;}
 e[key]=val;if(key==="videoId"&&!val)delete e.videoId;
 schedule();renderList();});
}
for(const p of document.querySelectorAll(".platform"))p.addEventListener("change",()=>{const e=getEvent();if(!e)return;e.platforms=[...document.querySelectorAll(".platform:checked")].map(x=>x.value);schedule();renderList();});
$("logoChoice").addEventListener("change",()=>{const e=getEvent();if(e){e.logoChoice=$("logoChoice").value;schedule();}});
$("eventImage").addEventListener("change",async e=>{const ev=getEvent();if(!ev)return;try{ev.logoData=await fileURL(e.target.files[0]);ev.logoChoice="upload";renderEditor();schedule();}catch(err){notify(err.message,"error");}});
$("publishNow").addEventListener("click",()=>{dirty=true;flush();});
$("auth").addEventListener("change",()=>{if(dirty&&!blocked)flush();});
$("search").addEventListener("input",renderList);
$("reload").addEventListener("click",load);
$("retry").addEventListener("click",()=>{if(blocked){notify("Existe un conflicto. Exporta tus cambios antes de recargar.", "error");}else if(dirty)flush();else load();});
$("addEvent").addEventListener("click",()=>{
 if(!agenda)return;
 const day=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Mexico_City",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const id="man:web-"+crypto.randomUUID();const e={id,origin:"manual",day,time:"20:00",title:"Nueva actividad",category:"",extra:"",platforms:[],status:"POR CONFIRMAR",logoChoice:"auto",logoData:""};
 agenda.events.push(e);selectedId=id;renderList();renderEditor();schedule();
});
$("deleteEvent").addEventListener("click",()=>{const e=getEvent();if(!e||!confirm("¿Eliminar la actividad "+e.title+"?"))return;agenda.events=agenda.events.filter(x=>x.id!==e.id);selectedId=null;renderList();renderEditor();schedule();});
$("libraryForm").addEventListener("submit",async ev=>{
 ev.preventDefault();if(!agenda)return;
 const name=$("libName").value.trim();if(!name)return;
 try{
  const file=$("libFile").files[0];if(!file)throw Error("Selecciona una imagen de biblioteca.");
  const url=await fileURL(file);
  agenda.libraryCustom.push({id:"web-"+crypto.randomUUID(),name,aliases:$("libAliases").value.split(",").map(x=>x.trim()).filter(Boolean),img:url});
  $("libraryForm").reset();$("libraryPreview").hidden=true;renderLibrary();renderEditor();schedule();
 }catch(err){notify("Imagen no guardada: "+err.message,"error");}
});
$("libFile").addEventListener("change",async e=>{try{const url=await fileURL(e.target.files[0]);$("libraryPreview").src=url;$("libraryPreview").hidden=false;}catch(err){notify(err.message,"error");}});
$("applyLibChanges").addEventListener("click",()=>{
 try{const data=JSON.parse($("libraryChanges").value);if(!data||typeof data!=="object"||Array.isArray(data))throw Error("Debe ser un objeto JSON");agenda.libraryChanges=data;schedule();notify("Biblioteca preparada para sincronizar.","success");}
 catch(err){notify("JSON inválido: "+err.message,"error");}
});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!dirty&&!saving&&!blocked)load();});
window.addEventListener("beforeunload",e=>{if(dirty||saving){e.preventDefault();e.returnValue="";}});
load();
})();
</script>
</body></html>`;
