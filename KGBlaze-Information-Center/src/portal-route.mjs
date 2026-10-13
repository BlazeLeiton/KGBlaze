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
 if(request.method!=='GET'&&request.method!=='HEAD')
  return {response:error(405,'METHOD_NOT_ALLOWED')};
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
 // /departures/api/admin/* must never be accessible from the vanity domain.
 if(internalPath.startsWith('/api')&&
    internalPath!=='/api/public'&&internalPath!=='/api/health')
  return {response:error(404,'NOT_FOUND')};
 url.pathname=internalPath;
 return {request:new Request(url.toString(),request),isPortal:true};
}
