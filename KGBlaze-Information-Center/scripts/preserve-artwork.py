#!/usr/bin/env python3
"""Snapshot only the sources already registered for Rebel Mix; never overwrite an existing artwork."""
import concurrent.futures
import hashlib
import io
import json
import os
import pathlib
import subprocess
import sys
import urllib.request
from urllib.parse import urlparse
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ART = PUBLIC / "music-artwork"
MANIFEST = ART / "preserved-v2.json"
LIMIT = 12 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 40_000_000
data = json.loads(MANIFEST.read_text())
works = data["works"]
registry = json.loads(subprocess.check_output(["node", "--input-type=module", "-e",
    "import {releaseArtwork} from './src/music-artwork.mjs'; console.log(JSON.stringify(releaseArtwork))"], cwd=ROOT))
def digest(b):
    return hashlib.sha256(b).hexdigest()
def path_for(row):
    return PUBLIC / row["path"].lstrip("/")
def inspect(path):
    raw = path.read_bytes()
    with Image.open(io.BytesIO(raw)) as img:
        if img.format != "WEBP": raise ValueError("expected WebP")
        img.load()
        return {"size": list(img.size), "sha256": digest(raw), "bytes": len(raw)}
def fetch(url):
    if urlparse(url).scheme != "https": raise ValueError("HTTPS only")
    req = urllib.request.Request(url, headers={"User-Agent": "KGBlaze-Artwork-Preservation/1.0", "Accept": "image/webp,image/png,image/jpeg,image/avif,image/gif"})
    with urllib.request.urlopen(req, timeout=15) as response:
        if urlparse(response.geturl()).scheme != "https": raise ValueError("HTTPS redirect required")
        if not response.headers.get_content_type().startswith("image/"): raise ValueError("not an image")
        raw = response.read(LIMIT + 1)
        if len(raw) > LIMIT or not raw: raise ValueError("image size limit")
        return raw, response.geturl()
def snapshot(slug, row):
    if row["status"] == "composite": return slug, row
    p = path_for(row)
    if p.exists():
        now = inspect(p)
        if row.get("sha256") and row["sha256"] != now["sha256"]: raise ValueError(slug + ": existing snapshot changed")
        return slug, dict(row, **now, status="preserved")
    if not row["origin"].startswith("https://"): raise ValueError(slug + ": missing local original")
    urls = [row["origin"]]
    # Prefer the original square release/HD video artwork where the same asset is available.
    if slug == "aint-backing-down":
        urls.insert(0,row["origin"].replace("1200x630bb.jpg","1200x1200bb.jpg"))
    if slug == "tempestas-claim":
        urls.insert(0,row["origin"].replace("mqdefault.jpg","maxresdefault.jpg"))
    # Preexisting records may already be cached by the deployed portal.
    if slug not in {"kenka","kokuan-glossolalia","hikari-aru-basho-e","starlog","aint-backing-down","tempestas-claim"}:
        urls.append("https://kgblaze.dpdns.org/music/artwork-cache/" + slug + "-v" + str(row["version"]))
    errors=[]
    for url in urls:
        try:
            raw, resolved=fetch(url)
            with Image.open(io.BytesIO(raw)) as source:
                original=list(source.size)
                if min(original)<100: raise ValueError("image too small")
                source.load()
                img=ImageOps.exif_transpose(source).convert("RGB")
                img.thumbnail((1200,1200),Image.Resampling.LANCZOS)
                p.parent.mkdir(parents=True,exist_ok=True)
                tmp=p.with_suffix(".tmp")
                img.save(tmp,format="WEBP",quality=92,method=6)
                now=inspect(tmp)
                os.replace(tmp,p)
                return slug,dict(row,**now,status="preserved",original_size=original,retrieved_from=resolved,source_sha256=digest(raw))
        except Exception as exc:
            errors.append(str(exc))
    return slug,dict(row,status="pending-snapshot",failure="; ".join(errors)[:300])
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    results=list(ex.map(lambda kv:snapshot(*kv),works.items()))
for slug,row in results:
    works[slug]=row
# The medley is a derivative of its four source records, not the historical EP jacket.
medley=works["melodia-del-oceano"]
components=medley["components"]
if all(works[s]["status"]=="preserved" for s in components):
    out=ART/"melodia-del-oceano-v1.webp"
    if not out.exists():
        canvas=Image.new("RGB",(1200,1200))
        for i,slug in enumerate(components):
            with Image.open(path_for(works[slug])) as src:
                # Center all source art except Miiro, whose title is on the right.
                crop=ImageOps.fit(src.convert("RGB"),(600,600),Image.Resampling.LANCZOS,centering=(1.0,0.5) if slug=="miiro" else (0.5,0.5))
                canvas.paste(crop,((i%2)*600,(i//2)*600))
        canvas.save(out,format="WEBP",quality=93,method=6)
    works["melodia-del-oceano"]=dict(medley,**inspect(out),status="preserved-composite",path="/music-artwork/melodia-del-oceano-v1.webp",component_hashes={s:works[s]["sha256"] for s in components})
data["works"]=works
MANIFEST.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
pending=[s for s,r in works.items() if r["status"] not in ("preserved","preserved-composite")]
print(json.dumps({"total":len(works),"preserved":len(works)-len(pending),"pending":pending},ensure_ascii=False))
if pending and "--strict" in sys.argv:
    sys.exit(1)
