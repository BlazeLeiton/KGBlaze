import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {HERO_CAROUSEL_SCHEMA,validateHeroCarousel,HERO_CAROUSEL_CSS,mountHeroCarousel} from '../public/assets/home-hero-carousel.mjs';
const home=readFileSync(fileURLToPath(new URL('../public/home.html',import.meta.url)),'utf8');
const fake=(id)=>({id,title:{es:'Título '+id,en:'Title '+id,ja:'見出し '+id},
 eyebrow:{es:'DESTINO',en:'DESTINATION',ja:'目的地'},
 subtitle:{es:'Texto '+id,en:'Copy '+id,ja:'説明 '+id},
 images:{desktop:'/assets/mock/desktop-'+id+'.webp',mobile:'/assets/mock/mobile-'+id+'.webp'},
 href:'/music/songs/'});
const config=slides=>({schema:HERO_CAROUSEL_SCHEMA,slides});
test('Stage 41 CP06 carousel cannot activate until actual creative content is approved',async()=>{
 const x=validateHeroCarousel(config([]));
 assert.equal(x.enabled,false);assert.equal(x.reason,'content_pending');
 assert.equal((await mountHeroCarousel(null,config([]))).enabled,false);
 assert.equal(home.includes('home-hero-carousel.mjs'),false,'No carousel script is linked to the published Home');
 assert.equal(home.includes('kg-hero-selectors'),false,'No visible selectors are published yet');
 assert.equal(home.includes('id="kg-recognition-strip"'),true,'Approved recognition remains');
});
test('requires 2–6 complete, unique, locally hosted bilingual-plus-Japanese slide assets',()=>{
 const slides=[fake('welcome'),fake('music')];
 const ok=validateHeroCarousel(config(slides));
 assert.equal(ok.enabled,true);assert.equal(ok.slides.length,2);
 assert.equal(validateHeroCarousel(config([fake('one')])).reason,'slide_count');
 assert.equal(validateHeroCarousel(config(Array.from({length:7},(_,i)=>fake('s'+i)))).reason,'slide_count');
 assert.equal(validateHeroCarousel(config([fake('same'),fake('same')])).reason,'invalid_slide_id');
 assert.equal(validateHeroCarousel(config([fake('valid'),{...fake('other'),title:{es:'Hola',en:'Hello'}}])).reason,'incomplete_locales');
 assert.equal(validateHeroCarousel(config([fake('safe'),{...fake('evil'),images:{desktop:'https://example.com/remote.jpg',mobile:'/assets/b.webp'}}])).reason,'missing_local_art');
 assert.equal(validateHeroCarousel(config([fake('safe'),{...fake('evil'),href:'//elsewhere.com'}])).reason,'invalid_destination');
 assert.equal(validateHeroCarousel(config([fake('safe'),{...fake('noimg'),images:{desktop:'/assets/a.svg',mobile:'/assets/b.svg'}}])).enabled,false);
});
test('selector is vertical desktop and horizontal mobile, only changing the heading/backdrop',()=>{
 assert.match(HERO_CAROUSEL_CSS,/\.kg-hero-selectors\{position:absolute;top:50%;left:-18px;transform:translateY\(-50%\);display:flex;flex-direction:column/);
 assert.match(HERO_CAROUSEL_CSS,/@media\(max-width:760px\)/);
 assert.match(HERO_CAROUSEL_CSS,/\.kg-hero-selectors\{position:relative;left:auto;top:auto;transform:none;flex-direction:row/);
 assert.match(HERO_CAROUSEL_CSS,/transition:opacity 900ms ease/);
 assert.match(HERO_CAROUSEL_CSS,/@media\(prefers-reduced-motion:reduce\)/);
 const script=readFileSync(fileURLToPath(new URL('../public/assets/home-hero-carousel.mjs',import.meta.url)),'utf8');
 assert.match(script,/hero\.querySelector\('#youtube-screen'\)/);
 assert.match(script,/hero\.querySelector\('#twitch-screen'\)/);
 assert.doesNotMatch(script,/replaceChildren\(makeEmbed|\.media-grid\.replaceChildren|\.media-grid\.innerHTML|fetch\(/);
 assert.match(script,/document\.addEventListener\('kgblaze:localechange',onLang\)/);
});
