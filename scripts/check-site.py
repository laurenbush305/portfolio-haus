#!/usr/bin/env python3
"""Validate rendered routes, metadata, assets, fragment links and sitemap exclusions."""
import json, sys
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET
root=Path(sys.argv[1] if len(sys.argv)>1 else '_site').resolve()
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.ids=set();self.refs=[];self.meta={};self.canonical=[];self.headings=0;self.title='';self.in_title=False;self.in_json=False;self.json_text='';self.schemas=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  if tag in ('a','img','script','link'):
   for key in ('href','src'):
    if key in a:self.refs.append(a[key])
  if tag=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content','')
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href',''))
  if tag=='h1':self.headings+=1
  if tag=='title':self.in_title=True
  if tag=='script' and a.get('type')=='application/ld+json':self.in_json=True;self.json_text=''
 def handle_data(self,data):
  if self.in_title:self.title+=data
  if self.in_json:self.json_text+=data
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script' and self.in_json:self.schemas.append(json.loads(self.json_text));self.in_json=False
pages={f:Page(f.read_text()) for f in root.rglob('*.html')}
errors=[]
unique={key:{} for key in ('title','description','canonical')}
for f,p in pages.items():
 rel=f.relative_to(root)
 if p.headings!=1:errors.append(f'{rel}: expected one h1, found {p.headings}')
 if not p.title.strip() or not p.meta.get('description'):errors.append(f'{rel}: missing title/description')
 if len(p.canonical)!=1 or not p.canonical[0].startswith('https://portfolio.haus/'):errors.append(f'{rel}: invalid canonical')
 if p.meta.get('og:url')!=(p.canonical[0] if p.canonical else ''):errors.append(f'{rel}: og:url mismatch')
 if not p.meta.get('og:image','').startswith('https://portfolio.haus/'):errors.append(f'{rel}: invalid OG image')
 if p.meta.get('og:title')!=p.title or p.meta.get('og:description')!=p.meta.get('description'):errors.append(f'{rel}: inconsistent OG title/description')
 if 'noindex' not in p.meta.get('robots',''):
  for key,value in [('title',p.title),('description',p.meta.get('description','')),('canonical',p.canonical[0] if p.canonical else '')]:
   if value in unique[key]:errors.append(f'{rel}: duplicate indexable {key} with {unique[key][value]}')
   unique[key][value]=rel
 if not p.schemas:errors.append(f'{rel}: missing schema')
 if '{{' in f.read_text() or '{%' in f.read_text():errors.append(f'{rel}: unresolved Liquid')
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc or not u.path and not u.fragment:continue
  target=root/unquote(u.path).lstrip('/') if u.path.startswith('/') else f.parent/unquote(u.path)
  if not u.path:target=f
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{rel}: broken {ref}');continue
  if u.fragment and target.suffix=='.html':
   parsed=pages.get(target.resolve())
   if parsed and unquote(u.fragment) not in parsed.ids:errors.append(f'{rel}: missing fragment {ref}')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls={x.text for x in ET.parse(root/'sitemap.xml').findall('s:url/s:loc',ns)}
expected=['/','/institutions/','/founders/','/work/','/about/','/start/','/method/','/receipts/','/tools/','/tools/can-they-repeat-it/']
assert urls=={'https://portfolio.haus'+p for p in expected},f'Unexpected sitemap: {urls}'
for p in ['government','insights','resources','contact','ways-to-work','tools/doctrine-build-lite','tools/opportunity-readiness-brief']:
 assert 'noindex' in pages[root/p/'index.html'].meta.get('robots',''),p
for path in ['docs','tests','scripts','README.md','LAUNCH-CHECKLIST.md','Gemfile']:
 assert not (root/path).exists(),f'Non-site file published: {path}'
assert 'Sitemap: https://portfolio.haus/sitemap.xml' in (root/'robots.txt').read_text()
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(pages)} rendered HTML pages; internal routes/assets/fragments, metadata, JSON-LD, 10 sitemap URLs, noindex, robots, source exclusions.')
