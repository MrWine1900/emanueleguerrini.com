#!/usr/bin/env python3
"""Static site integrity check: local resources, anchors, accessibility basics."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).parent
class Inspect(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[];self.ids=set();self.duplicate=[];self.forms=[];self.h1s=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids:self.duplicate.append(a['id'])
            self.ids.add(a['id'])
        if tag=='h1':self.h1s+=1
        if tag in ('a','link','script','img'):
            ref=a.get('href') or a.get('src')
            if ref:self.links.append(ref)
        if tag=='form':self.forms.append(a.get('action',''))
errors=[];count=0
for path in ROOT.rglob('*.html'):
    if '.git' in path.parts:continue
    count+=1
    obj=Inspect();obj.feed(path.read_text(encoding='utf8'))
    if obj.duplicate:errors.append(f'{path}: duplicate IDs {obj.duplicate}')
    if obj.h1s!=1:errors.append(f'{path}: expected one h1, got {obj.h1s}')
    for link in obj.links+obj.forms:
        if link.startswith(('https://','http://','mailto:','tel:','data:','javascript:')):continue
        target=unquote(urlsplit(link).path)
        if not target:
            anchor=urlsplit(link).fragment
            if anchor and anchor not in obj.ids:errors.append(f'{path}: missing same-page anchor #{anchor}')
            continue
        candidate=(ROOT/target.lstrip('/') if target.startswith('/') else path.parent/target)
        if candidate.is_dir():candidate=candidate/'index.html'
        if not candidate.exists():errors.append(f'{path}: unresolved {link}')
        anchor=urlsplit(link).fragment
        if anchor and candidate.suffix=='.html' and candidate.exists():
            p=Inspect();p.feed(candidate.read_text(encoding='utf8'))
            if anchor not in p.ids:errors.append(f'{path}: unresolved target anchor {link}')
print(f'Checked {count} HTML files: {len(errors)} error(s)')
for err in errors:print('FAIL',err)
raise SystemExit(bool(errors))
