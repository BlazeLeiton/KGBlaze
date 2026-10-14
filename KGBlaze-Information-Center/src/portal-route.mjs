/**
 * Expose the public Terminal under https://kgblaze.dpdns.org/departures/
 * without changing the existing workers.dev host or private editor.
 *
 * The viewer currently requests root /api/public; keep a public-only alias
 * for compatibility. /departures/api/public is the canonical API path.
 */
export const PORTAL_HOST='kgblaze.dpdns.org';
const error=(status,code)=>new Response(JSON.stringify({ok:false,error:code}),{
 status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}
});
export function routePortalRequest(request){
 const url=new URL(request.url);
 if(url.hostname!==PORTAL_HOST)return {request,isPortal:false};
 // Only the dashboard's existing token-protected admin publish endpoints
 // may write on the custom domain. No public endpoint is made writable.
 const methods={
  '/departures/api/admin/publish':['POST'],
  '/departures/api/admin/preview':['POST'],
  '/departures/api/admin/snapshot':['GET','HEAD'],
  '/departures/api/admin/sync':['GET','HEAD']
 };
 const allowed=methods[url.pathname];
 if(allowed?!allowed.includes(request.method):request.method!=='GET'&&request.method!=='HEAD')
  return {response:error(405,'METHOD_NOT_ALLOWED')};
 // Optional short alias, routed back into the same Terminal surface.
 if(url.pathname==='/dashboard'||url.pathname==='/dashboard/'||
    url.pathname==='/departures/dashboard'){
  url.pathname='/departures/dashboard/';
  return {response:Response.redirect(url.toString(),308)};
 }
 if(url.pathname==='/'||url.pathname==='/departures'){
  const permanent=url.pathname==='/departures';
  url.pathname='/departures/';
  return {response:Response.redirect(url.toString(),permanent?308:302)};
 }
 // Temporary public-only compatibility for the viewer's absolute API fetch.
 // Deny all unlisted root API paths, particularly /api/admin/*.
 if(['/api/public','/api/health','/og-semana.png','/agenda_publica.json'].includes(url.pathname))
  return {request,isPortal:true};
 if(!url.pathname.startsWith('/departures/'))
  return {response:error(404,'NOT_FOUND')};
 const internalPath=url.pathname.slice('/departures'.length);
 // Restricted admin routes still pass through the Worker's existing
 // Authorization: Bearer ADMIN_TOKEN, revision CAS, and audit logging.
 // The unprefixed /api/admin/* remains inaccessible on this host.
 const publicAPI=['/api/public','/api/health','/api/public/twitch-box-art'];
 const adminAPI=['/api/admin/snapshot','/api/admin/sync','/api/admin/publish','/api/admin/preview'];
 if(internalPath.startsWith('/api')&&!publicAPI.includes(internalPath)&&
    !adminAPI.includes(internalPath))
  return {response:error(404,'NOT_FOUND')};
 url.pathname=internalPath;
 return {request:new Request(url.toString(),request),isPortal:true};
}
