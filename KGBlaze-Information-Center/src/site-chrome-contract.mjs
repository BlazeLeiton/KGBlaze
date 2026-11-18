/**
 * Project Relight · KGBlaze Chrome V1 — 18 Nov 2026.
 *
 * Frozen canonical values for the APPROVED common exterior after PR #172.
 * New site surfaces should import these values instead of inventing metrics.
 * The three existing renderers differ technically and are guarded by CI:
 *  - Home: static public/home.html (CSS/DOM).
 *  - Rebel Mix: generated src/music-page.mjs and music-navigation.mjs.
 *  - Terminal: src/viewer-portal-chrome.mjs and viewer-portal-ssr.mjs;
 *    the original board's setLang()->render() MUST remain untouched.
 *
 * Do not substitute this object for the three renderers without a separate
 * browser-verified migration. The approved computed UI is the contract.
 */
export const KG_CHROME_V1=Object.freeze({
  sourceCommit:'56b07befd09e2cbcc91ef3ec82e80b520c8b4357',
  desktop:Object.freeze({
    minWidth:761,headerHeight:58,headerPaddingX:24,headerGap:15,
    logoFontSize:24,logoFontWeight:750,logoLetterSpacing:'-.045em',
    navFontSize:12,navFontWeight:700,navGap:'clamp(11px,1.5vw,21px)',
    rightGap:15,departuresWidth:96,departuresHeight:35,departuresRadius:7,departuresIcon:21,
    languagesWidth:76,languageSlotWidth:20,languageFontSize:11,languageFontWeight:750,languageSlotHeight:30,
    socialWidth:50,socialTop:58,socialPadding:'34px 2px 16px',socialGap:14,
    socialHitWidth:44,socialHitHeight:30,socialIconSize:28
  }),
  mobile:Object.freeze({maxWidth:760,headerHeight:56,logoFontSize:23,socialHeight:60,socialIconSize:25}),
  colors:Object.freeze({
    header:'#020C41',social:'#010627',socialBorder:'#213363',
    departures:'#276EF1',activeLanguage:'#FFFFFF',inactiveLanguage:'#A5EBFF',languageUnderline:'#FA0073'
  }),
  languages:Object.freeze({codes:Object.freeze(['es','en','ja']),labels:Object.freeze(['ES','EN','JP']),storage:'kgblaze.locale.v1',cookie:'kgblaze_lang'}),
  assets:Object.freeze({
    socialKeys:Object.freeze(['yt','tw','ig','x','dc']),
    canonicalSocialModule:'src/music-social-icons.mjs (KG_SOCIAL_ORIGINALS)',
    headphones:'public/assets/icons/kgblaze-headphones-white.svg',
    headphonesGitBlob:'d58d23681dc675e3a3679ad065b95bf847d7bf65'
  })
});
export const KG_CHROME_LABELS_V1=Object.freeze({
  es:Object.freeze({about:'Sobre Blaze',music:'Música ▾',community:'Comunidad ▾',departures:'Salidas'}),
  en:Object.freeze({about:'About Blaze',music:'Music ▾',community:'Community ▾',departures:'Departures'}),
  ja:Object.freeze({about:'Blazeについて',music:'音楽 ▾',community:'コミュニティ ▾',departures:'出発'})
});
