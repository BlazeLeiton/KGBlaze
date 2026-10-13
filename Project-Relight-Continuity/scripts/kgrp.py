#!/usr/bin/env python3
"""Project Relight continuity-registry audit and next-stage bootstrap.
Stdlib only; operates solely inside Project-Relight-Continuity.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
INDEX = ROOT / 'STAGES' / 'index.json'

def load_index():
    return json.loads(INDEX.read_text(encoding='utf-8'))

def audit():
    d = load_index()
    errors = []
    if d.get('default_recovery') != 'deep-complete':
        errors.append('default_recovery must be deep-complete')
    if not d.get('include_all_prior_stages'):
        errors.append('all previous stages must be included')
    if not d.get('incomplete_without_verified_handoff'):
        errors.append('unclosed stages must be recovered')
    if not d.get('audit_on_uncertainty'):
        errors.append('audit on uncertainty must remain enabled')
    stages = d.get('stages', [])
    nums = [x.get('number') for x in stages]
    if nums != list(range(1, len(stages)+1)):
        errors.append(f'non-contiguous stage numbering: {nums}')
    if d.get('latest_stage') != len(stages):
        errors.append('latest_stage not equal to number of entries')
    unclosed = []
    for s in stages:
        n = s.get('number')
        expected = f'STAGE-{n:02}.md' if isinstance(n, int) and n > 0 else None
        if s.get('id') != f'STAGE-{n:02}' or s.get('file') != expected:
            errors.append(f'incorrect stage name for {n}')
        p = ROOT / 'STAGES' / (expected or '__missing__.md')
        if not p.is_file():
            errors.append(f'missing file: {p.name}')
        elif not p.read_text(encoding='utf-8').strip():
            errors.append(f'empty file: {p.name}')
        if s.get('closure_verified') is not True:
            unclosed.append(n)
    for extra in (ROOT / 'PROTOCOL.md', ROOT / 'AUDIT.md', ROOT / 'DECISIONS.md', ROOT / 'SOURCES.md', ROOT / 'HANDOFFS' / 'CURRENT.md'):
        if not extra.is_file():
            errors.append(f'missing expected file: {extra.relative_to(ROOT)}')
    print(json.dumps({'result': 'FAIL' if errors else 'PASS', 'latest_stage':d.get('latest_stage'), 'unclosed_stages': unclosed, 'errors':errors}, ensure_ascii=False, indent=2))
    return bool(errors)

def add_stage(title: str, source: str):
    title, source = title.strip(), source.strip()
    if not title or not source:
        raise ValueError('Both title and evidence/source identifying the new conversation are required')
    if audit():
        raise RuntimeError('Fix current registry errors before adding a new stage')
    d = load_index()
    n = d['latest_stage']+1
    name = f'STAGE-{n:02}.md'
    target = ROOT / 'STAGES' / name
    if target.exists():
        raise FileExistsError(f'Will not overwrite {name}')
    template = (ROOT/'TEMPLATES'/'STAGE.md').read_text(encoding='utf-8')
    txt = template.replace('# Stage N — [nombre]', f'# Stage {n} — {title}')
    txt = txt.replace('Fecha de apertura y cierre (si aplica):', f'Fuente inicial: {source}\nFecha de apertura y cierre (si aplica):')
    target.write_text(txt,encoding='utf-8')
    d['stages'].append({'number':n,'id':f'STAGE-{n:02}','file':name,'period':'por documentar','focus':title,'closure_verified':False,'closure_note':'Nuevo Stage; recuperar último tramo y pendientes aunque no tenga cierre.'})
    d['latest_stage']=n
    d['updated_on']=dt.date.today().isoformat()
    INDEX.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/'HANDOFFS'/'CURRENT.md').open('a',encoding='utf-8').write(f'\n## Etapa añadida: Stage {n}\n- Fuente: {source}\n- Estado: cierre NO ACREDITADO; recuperación profunda obligatoria.\n')
    print(f'Added Stage {n} at {target.relative_to(ROOT)}. Review handoff and decisions; git commit required.')
    return audit()

def main():
    p=argparse.ArgumentParser(description='KGRP registry audit and automatic next-stage creation')
    sub=p.add_subparsers(dest='command',required=True)
    sub.add_parser('audit')
    a=sub.add_parser('add-stage')
    a.add_argument('--title',required=True)
    a.add_argument('--source',required=True,help='Original new chat or other verifiable evidence; do not invent stage')
    args=p.parse_args()
    try:
        return int(audit() if args.command=='audit' else add_stage(args.title,args.source))
    except (OSError,ValueError,RuntimeError,KeyError,TypeError) as ex:
        print(f'ERROR: {ex}',file=sys.stderr)
        return 2
if __name__=='__main__':
    raise SystemExit(main())
