#!/usr/bin/env python3
"""Restore the airport's public A/B terminal names without renaming the Terminal software.

Use: python KGBlaze-Information-Center/scripts/restore_airport_public_header.py KGBlaze-Information-Center/public/index.html
Use --verify to assert that all three translations, static heading and drawn canvas title are correct.
Idempotent. No deployment or database operations.
"""
from pathlib import Path
import argparse

AIRPORT={
 'es':'AEROPUERTO INTERNACIONAL DE LA KGBLAZE · TERMINALES A Y B',
 'en':'KGBLAZE INTERNATIONAL AIRPORT · TERMINALS A & B',
 'ja':'KGBLAZE国際空港 · ターミナルA・B',
}
ORIGINAL=[
 ('<h1 class="title-line" id="heading">AEROPUERTO INTERNACIONAL DE LA KGBLAZE · TERMINAL</h1>',
  '<h1 class="title-line" id="heading">'+AIRPORT['es']+'</h1>'),
 ("es:{title:'AEROPUERTO INTERNACIONAL DE LA KGBLAZE · TERMINAL'",
  "es:{title:'"+AIRPORT['es']+"'"),
 ("en:{title:'KGBLAZE INTERNATIONAL AIRPORT · TERMINAL'",
  "en:{title:'"+AIRPORT['en']+"'"),
 ("ja:{title:'KGBLAZE国際空港 · ターミナル'",
  "ja:{title:'"+AIRPORT['ja']+"'"),
 ("text(state.lang==='ja'?'KGBLAZE国際空港':state.lang==='en'?'KGBLAZE INTERNATIONAL AIRPORT':'AEROPUERTO INTERNACIONAL DE LA KGBLAZE',36,24,16,'#A9C9F5',400,undefined,75);",
  "const airportHeading=TRANSLATIONS[state.lang].title;\n  text(airportHeading,36,24,fitted(airportHeading,850,16,12,400,75),'#A9C9F5',400,undefined,75);")
]

def patch(s):
    count=0
    for old,new in ORIGINAL:
        n=s.count(old)
        if n==1:
            s=s.replace(old,new,1)
            count+=1
        elif n!=0 or new not in s:
            raise ValueError('Unexpected viewer source: '+old[:110]+' (matches '+str(n)+')')
    return s,count

def verify(s):
    for old,new in ORIGINAL:
        if old in s or new not in s: raise AssertionError('Missing corrected header: '+new[:110])
    if any(x not in s for x in AIRPORT.values()): raise AssertionError('Missing i18n translation')
    if 'terminalb' in s.lower() or 'terminal b' in s.lower(): raise AssertionError('Old software name returned')
    if '<canvas id="board"' not in s: raise AssertionError('Missing original viewer canvas')
    if "const TRANSLATIONS={" not in s: raise AssertionError('Missing language map')

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('file',type=Path)
    ap.add_argument('--verify',action='store_true')
    a=ap.parse_args()
    s=a.file.read_text(encoding='utf-8')
    if a.verify:
        verify(s)
        print('PASS: public viewer ES EN JA; software Terminal; canvas.')
    else:
        modified,num=patch(s)
        verify(modified)
        if num:
            a.file.write_text(modified,encoding='utf-8')
        print('Corrected public viewer occurrences:',num)

if __name__=='__main__':
    main()
