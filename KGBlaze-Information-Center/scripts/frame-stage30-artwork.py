#!/usr/bin/env python3
"""Approved square crops from real images; keep v1 intact."""
import hashlib, io, json, pathlib, urllib.request
from PIL import Image, ImageOps
root=pathlib.Path(__file__).resolve().parents[1]
art=root/'public'/'music-artwork'
manifest=art/'preserved-v2.json'
m=json.loads(manifest.read_text())
sha=lambda b: hashlib.sha256(b).hexdigest()
for slug in ('xy-and-z','level','el-nano'):
    row=m['works'][slug]
    assert row['version']==2
    out=root/'public'/row['path'].lstrip('/')
    if row.get('status')=='preserved' and out.exists():
        assert sha(out.read_bytes())==row['sha256']
        continue
    origin=row['origin']
    if slug=='xy-and-z':
        raw=(art/'xy-and-z-v1.webp').read_bytes()
        assert sha(raw)==row['previous']['sha256']
    else:
        urls=[origin]
        if slug=='el-nano': urls.insert(0,origin.split('?')[0]+'?fit=thumb&h=900&w=1368')
        errors=[]
        for url in urls:
            try:
                req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'image/*'})
                with urllib.request.urlopen(req,timeout=20) as res:
                    raw=res.read(12*1024*1024+1)
                    assert res.headers.get_content_type().startswith('image/') and len(raw)<=12*1024*1024
                    origin=res.geturl()
                with Image.open(io.BytesIO(raw)) as check: check.verify()
                break
            except Exception as exc: errors.append(str(exc))
        else: raise RuntimeError(slug+': '+str(errors))
    with Image.open(io.BytesIO(raw)) as src:
        img=ImageOps.exif_transpose(src).convert('RGB')
    w,h=img.size
    if slug=='xy-and-z':
        n=min(w,h); x=(w-n)//2; y=(h-n)//2
    elif slug=='level':
        n=round(w*.92); x=(w-n)//2; y=round(h*.102)
    else:
        n=min(w,h); x=round((w-n)*.81); y=(h-n)//2
    assert x>=0 and y>=0 and x+n<=w and y+n<=h
    crop=img.crop((x,y,x+n,y+n))
    crop.thumbnail((1000,1000),Image.Resampling.LANCZOS)
    crop.save(out,format='WEBP',quality=94,method=6)
    data=out.read_bytes()
    row.update(status='preserved',size=list(crop.size),sha256=sha(data),bytes=len(data),original_size=[w,h],retrieved_from=origin,source_sha256=sha(raw),crop_box=[x,y,x+n,y+n])
    print(slug,row['original_size'],row['crop_box'],row['size'])
manifest.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
