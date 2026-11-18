import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';

test('Home Rebel Mix headphones SVG really loads and has visible size in Chrome desktop and mobile',{timeout:60000},async t=>{
 const binaries=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const chrome=binaries.find(b=>spawnSync(b,['--version'],{encoding:'utf8',timeout:3000}).status===0);
 if(!chrome){t.skip('Chrome unavailable');return}
 const html=readFileSync(fileURLToPath(new URL('../public/home.html',import.meta.url)),'utf8');
 const svg=readFileSync(fileURLToPath(new URL('../public/assets/icons/kgblaze-headphones-white.svg',import.meta.url)),'utf8');
 const probe='<script>setTimeout(()=>{const el=document.querySelector(".headphones-svg");const r=el?.getBoundingClientRect();const visible=!!el&&el.complete&&el.naturalWidth>=40&&r.width>=30&&r.height>=30&&getComputedStyle(el).display!=="none"&&getComputedStyle(el).opacity!=="0";document.documentElement.setAttribute("data-kg-headphones",visible?"PASS":"FAIL");},450)</script>';
 const srv=createServer((req,res)=>{
  if(req.url?.startsWith('/assets/icons/kgblaze-headphones-white.svg')){
   res.writeHead(200,{'Content-Type':'image/svg+xml','Cache-Control':'no-store'});res.end(svg);return;
  }
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  res.end(html.replace('</body>',probe+'</body>'));
 });
 await new Promise(resolve=>srv.listen(0,'127.0.0.1',resolve));
 const port=srv.address().port;
 try{
  for(const size of ['1440,900','375,780']){
   const out=await new Promise((resolve,reject)=>{
    const child=spawn(chrome,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size='+size,'--virtual-time-budget=1600','--dump-dom','http://127.0.0.1:'+port+'/'],{stdio:['ignore','pipe','pipe']});
    let result='',errors='';
    child.stdout.on('data',d=>{result+=d.toString();if(result.length>15000000)child.kill()});
    child.stderr.on('data',d=>errors=(errors+d.toString()).slice(-1200));
    child.on('error',reject);
    child.on('close',code=>resolve({code,result,errors}));
   });
   assert.equal(out.code,0,'Chrome failed '+size+': '+out.errors);
   assert.match(out.result,/data-kg-headphones="PASS"/,'SVG failed to visibly load at '+size);
  }
 }finally{await new Promise(resolve=>srv.close(resolve))}
});
