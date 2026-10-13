#!/usr/bin/env python3
"""One-shot, idempotent patch for the public Terminal flight information card.

The HTML embeds large font resources. This script deliberately changes only
two exact JavaScript snippets and leaves the rest of the asset byte-for-byte
unchanged. It never edits Worker code, sync states, or editorial data.
"""
from pathlib import Path

VIEWER = Path(__file__).resolve().parents[1] / "public" / "index.html"
OLD_HELPER = """function verifiedVideo(e){const sync=publicState.sync?.[e.id]?.youtube;if(!verifiedItem(sync)||sync.matchConfirmed!==true||!(e.platforms||[]).includes('yt'))return null;const candidate=sync.videoId||sync.id||'';const id=/^[a-zA-Z0-9_-]{11}$/.test(candidate)?candidate:'';let url='';if(id)url=`https://www.youtube.com/watch?v=${id}`;else try{const u=new URL(sync.url||'');if(['www.youtube.com','youtube.com','youtu.be','m.youtube.com'].includes(u.hostname)&&u.protocol==='https:')url=u.href;}catch{};return {url,id};}"""
NEW_HELPER = """function flightYouTubeVideo(e){
 if(!(e.platforms||[]).includes('yt'))return null;
 const validId=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{11}$/.test(v)?v:'';
 // An editorially linked waiting room is a navigation target, not a verified live observation.
 const editorialId=validId(e.videoId);
 if(editorialId)return {url:`https://youtu.be/${editorialId}`,id:editorialId};
 // Keep independently verified platform observations as a secondary source.
 const sync=publicState.sync?.[e.id]?.youtube;
 if(!verifiedItem(sync)||sync.matchConfirmed!==true||sync.status==='missing')return null;
 let id=validId(sync.videoId)||validId(sync.id);
 if(!id)try{
  const u=new URL(sync.videoUrl||sync.url||'');
  if(u.protocol==='https:'&&['www.youtube.com','youtube.com','m.youtube.com','youtu.be'].includes(u.hostname)){
   const candidate=u.hostname==='youtu.be'?u.pathname.split('/')[1]:u.pathname.startsWith('/live/')?u.pathname.split('/')[2]:u.pathname==='/watch'?u.searchParams.get('v'):'';
   id=validId(candidate);
  }
 }catch{}
 return id?{url:`https://youtu.be/${id}`,id}:null;
}"""
OLD_IMAGE = """const video=verifiedVideo(e);if(video?.id){const img=document.createElement('img');img.className='flight-thumb';img.src=`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;img.alt=tr.thumb;img.loading='lazy';img.onerror=()=>img.remove();host.append(img);}"""
NEW_IMAGE = """const video=flightYouTubeVideo(e);if(video?.id){const img=document.createElement('img');img.className='flight-thumb';img.alt=tr.thumb;img.loading='lazy';const hq=`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;let fallbackTried=false;const fallback=()=>{if(!fallbackTried){fallbackTried=true;img.src=hq;}else img.remove();};img.onerror=fallback;img.onload=()=>{if(!fallbackTried&&(img.naturalWidth<640||img.naturalHeight<360))fallback();};img.src=`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;host.append(img);}"""

def main():
    html = VIEWER.read_text(encoding="utf-8")
    if NEW_HELPER in html and NEW_IMAGE in html and OLD_HELPER not in html and OLD_IMAGE not in html:
        print("Terminal viewer YouTube links already patched.")
        return
    for label, fragment in [("helper", OLD_HELPER), ("thumbnail", OLD_IMAGE)]:
        if html.count(fragment) != 1:
            raise SystemExit(f"Refusing to patch: expected one exact {label} snippet, found {html.count(fragment)}")
    html = html.replace(OLD_HELPER, NEW_HELPER).replace(OLD_IMAGE, NEW_IMAGE)
    if "function verifiedVideo(e)" in html or "const video=verifiedVideo(e)" in html:
        raise SystemExit("Refusing to write: obsolete helper remained.")
    VIEWER.write_text(html, encoding="utf-8")
    print("Terminal viewer patched: editorial YouTube videoId => youtu.be and maxresdefault (fallback hqdefault).")

if __name__ == "__main__":
    main()
