"""Preserve selected jackets, never replace an existing snapshot on failure."""
import hashlib, io, json, pathlib, subprocess, urllib.request
from PIL import Image, ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'public'/'music-artwork'
OUT.mkdir(parents=True,exist_ok=True)
registry=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {releaseArtwork,artworkPath} from './src/music-artwork.mjs'; console.log(JSON.stringify(Object.entries(releaseArtwork).filter(([,a])=>a.image.startsWith('https://')).map(([slug,a])=>({slug,source:a.image,cache:artworkPath(slug)}))))"],cwd=ROOT))
manifest=OUT/'preserved-v1.json'
records=json.loads(manifest.read_text()) if manifest.exists() else {}
for item in registry:
    slug=item['slug']; path=OUT/(slug+'-v1.webp')
    if path.exists():
        print('KEEP',slug,flush=True); continue
    errors=[]
    for url in ['https://kgblaze.dpdns.org'+item['cache'],item['source']]:
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'image/webp,image/png,image/jpeg,image/*'})
            with urllib.request.urlopen(req,timeout=20) as response:
                if not response.headers.get_content_type().startswith('image/'): raise ValueError('not an image')
                raw=response.read(4*1024*1024+1)
            if len(raw)>4*1024*1024: raise ValueError('image too large')
            with Image.open(io.BytesIO(raw)) as image:
                image.load(); image=ImageOps.exif_transpose(image).convert('RGB')
                if min(image.size)<100: raise ValueError('image too small')
                original=list(image.size); image.thumbnail((720,720),Image.Resampling.LANCZOS)
                target=path.with_suffix('.tmp')
                image.save(target,format='WEBP',quality=88,method=6)
                target.replace(path)
            records[slug]={'source':item['source'],'retrieved_from':url,'original_size':original,'size':list(image.size),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
            print('SAVED',slug,path.stat().st_size,flush=True); break
        except Exception as exc:
            errors.append(str(exc))
    else: print('UNAVAILABLE',slug,'; '.join(errors),flush=True)
manifest.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print('Preserved',sum((OUT/(i['slug']+'-v1.webp')).exists() for i in registry),'of',len(registry),flush=True)
