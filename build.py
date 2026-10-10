#!/usr/bin/env python3
"""Build the standalone portfolio from its single content source. No dependencies."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / 'content.json').read_text())
cfg = data['CFG']
esc = lambda s: html.escape(str(s), quote=True)

def icon(name, key):
    if not key:
        return '<span class="skill-glyph" aria-hidden="true">&lt;/&gt;</span>'
    return f'<img src="public/icons/{esc(key)}.svg" width="32" height="32" loading="lazy" alt="" class="{"invert-icon" if key == "github" else ""}">'

def social(buttons=False):
    return ''.join(f'<a class="{"btn s" if buttons else "social-link"}" data-profile="{key}" href="{esc(cfg[key])}" target="_blank" rel="noopener noreferrer">{name} <span aria-hidden="true">↗</span></a>' for key, name in [('linkedin','LinkedIn'),('github','GitHub'),('leetcode','LeetCode')])

reactor = '''<svg class="reactor" viewBox="0 0 300 300" fill="none" aria-hidden="true">
<circle class="reactor-halo" cx="150" cy="150" r="111"/>
<g class="reactor-outer"><circle cx="150" cy="150" r="140"/><circle cx="150" cy="150" r="133" stroke-dasharray="1 12"/><path d="M150 10a140 140 0 0 1 121 70M150 290A140 140 0 0 1 29 220"/><path d="M150 0v15M300 150h-15M150 300v-15M0 150h15"/></g>
<g class="reactor-inner"><circle cx="150" cy="150" r="116" stroke-dasharray="65 25 8 25"/><circle cx="150" cy="150" r="101"/><path d="M63 100l87-50 87 50v100l-87 50-87-50z"/></g>
<circle class="reactor-core" cx="150" cy="150" r="74"/>
<path class="reactor-ticks" d="M150 62v14M150 224v14M62 150h14M224 150h14"/>
<text x="150" y="164" text-anchor="middle">VK</text><text class="reactor-sub" x="150" y="190" text-anchor="middle">ALWAYS EVOLVING</text></svg>'''

road = '''<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="road-glow" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0c0e11"/><stop offset="1" stop-color="#15232a"/></linearGradient></defs><rect width="1440" height="900" fill="url(#road-glow)"/><g fill="none" stroke="#4cc9f0" opacity=".3"><path d="M0 890 650 400M1440 890 790 400M280 900 695 400M1160 900 745 400"/><path class="road-dash" d="M570 900 713 400M870 900 727 400" stroke-dasharray="60 80" stroke-width="3"/></g><g fill="none" stroke="#e4b879"><path d="M430 555l75-20 54 15M840 550l54-15 75 20" stroke-width="4"/><path d="M484 535l30-35 99-10 35 45M796 535l35-45 99 10 30 35" opacity=".7"/></g></svg>'''

values = {**{k: esc(v) for k,v in cfg.items() if isinstance(v,str)}, 'reactor':reactor, 'road_svg':road, 'social_inline':social(), 'social_buttons':social(True)}
values['resume_link'] = esc(cfg['resumeUrl'] or 'mailto:'+cfg['email']+'?subject=Resume%20request')
values['resume_label'] = 'View Resume' if cfg['resumeUrl'] else 'Request Resume'

rows=[]
for i,items in enumerate(data['marquees']):
    group=''.join(f'<li class="lg">{icon(n,k)}<span>{esc(n)}</span></li>' for n,k in items)
    # Identical groups, including trailing padding, keep the -50% loop seamless.
    rows.append(f'<div class="mrow {"rev" if i else ""}"><ul class="mset" aria-label="{"AI and development tools" if i else "Languages and frameworks"}">{group}</ul><ul class="mset" aria-hidden="true">{group}</ul></div>')
values['marquees']=''.join(rows)
values['tabs']=''.join(f'<button type="button" role="tab" id="tab-{s["id"]}" aria-controls="panel-{s["id"]}" aria-selected="{str(i==0).lower()}" tabindex="{0 if i==0 else -1}">{esc(s["name"])}</button>' for i,s in enumerate(data['skills']))
panels=[]
for s in data['skills']:
    items=''.join(f'<li style="--i:{i}">{icon(n,k)}<span>{esc(n)}</span></li>' for i,(n,k) in enumerate(s['items']))
    panels.append(f'<div class="skill-panel" id="panel-{s["id"]}" role="tabpanel" aria-labelledby="tab-{s["id"]}" tabindex="0"><div class="skill-intro"><p class="eyebrow">{esc(s["label"])}</p><h3>{esc(s["title"])}</h3><p>{esc(s["description"])}</p><span class="skill-context">{esc(s["context"])}</span></div><ul class="xl">{items}</ul></div>')
values['skill_panels']=''.join(panels)

motifs=[
 '<rect x="30" y="20" width="80" height="100" rx="3"/><path d="M42 20v100M54 45h42M54 60h42M54 75h28M54 96h20"/>',
 '<path d="M25 110h95M35 120V20M35 100Q60 95 80 70T115 28"/><path d="M50 40h12m-6-6v12M82 108l10-10m0 10-10-10"/><circle cx="80" cy="70" r="4"/>',
 '<path d="m35 38 38 35 38-35M35 38v65l38-30 38 30V38M35 103h76"/><circle cx="35" cy="38" r="7"/><circle cx="111" cy="38" r="7"/><circle cx="73" cy="73" r="10"/><circle cx="35" cy="103" r="7"/><circle cx="111" cy="103" r="7"/>'
]
education=[]
for i,(e,copy) in enumerate(zip(data['EDU'],data['education_copy'])):
    num,title,desc,score,unit=copy
    degree=['SSC','Intermediate · MPC','B.Tech · CSE (AI & ML)'][i]
    education.append(f'<li class="milestone rv"><div class="milestone-date"><span class="milestone-num">{num}</span><span>{esc(e[2])}</span></div><div class="milestone-main"><p class="eyebrow">{esc(title)}</p><h3>{degree}</h3><p class="institution">{esc(e[1])}</p>{"<p class=degree-name>Bachelor of Technology — Computer Science and Engineering (AI &amp; ML)</p>" if i==2 else ""}<p class="milestone-copy">{esc(desc)}</p></div><div class="milestone-art" aria-hidden="true"><svg viewBox="0 0 146 140">{motifs[i]}</svg></div><div class="milestone-score"><strong data-result="{score}" aria-hidden="true">{score}</strong><span aria-hidden="true">{unit}</span><small>{"CGPA" if i==2 else "ACADEMIC RESULT"}</small><span class="sr-only">{esc(e[3])}</span></div></li>')
values['education']=''.join(education)

experience=[]
for i,e in enumerate(data['EXP']):
    current='Present' in e['when']
    pts=''.join(f'<li>{esc(t)}</li>' for t in e['pts'])
    experience.append(f'<article class="exp rv"><div class="experience-meta"><p class="when">{esc(e["when"])}</p>{"<span class=tag>Current chapter</span>" if current else "<span class=tag>Completed internship</span>"}<p class="muted">{esc(e["sub"])}</p><span class="experience-number" aria-hidden="true">0{i+1}</span></div><div><h3>{esc(e["role"])}</h3><p class="org">{esc(e["org"])}</p><ul class="contributions">{pts}</ul><p class="note">{esc(e["note"])}</p></div></article>')
values['experience']=''.join(experience)

projects=[]
for p in data['PROJ']:
    tech=''.join(f'<li>{esc(t)}</li>' for t in p['tech'])
    work=''.join(f'<li>{esc(t)}</li>' for t in p['work'])
    links=''.join(f'<a class="btn s" href="{esc(p[key])}" target="_blank" rel="noopener noreferrer">{label} ↗</a>' for key,label in [('gh','GitHub'),('demo','Live demo')] if p[key])
    # Preserve original authored SVG graphics and their truthful captions.
    diagram=data['V'][str(p['id'])]
    projects.append(f'<article class="proj rv"><div class="viz"><div class="viz-label"><span>0{p["id"]} / SYSTEM STUDY</span><span aria-hidden="true">＋</span></div>{diagram}</div><div class="project-copy"><p class="project-category">{esc(p["cat"])} <span>/ {p["year"]}</span></p><span class="tag {"live" if p["status"]=="In progress" else ""}">{esc(p["status"])}</span><h3>{esc(p["title"])}</h3><p class="project-summary">{esc(p["sum"])}</p><ul class="chips" aria-label="Technologies">{tech}</ul><details><summary>Explore case study<span class="sr-only">: {esc(p["title"])}</span></summary><div class="case-study"><h4>The problem</h4><p>{esc(p["problem"])}</p><h4>The approach</h4><p>{esc(p["sol"])}</p><h4>My contributions</h4><ul>{work}</ul><p class="note">{esc(p["note"])}</p>{links}</div></details></div></article>')
values['projects']=''.join(projects)
values['certifications']=''.join(f'<li><span aria-hidden="true">↗</span>{esc(t)}</li>' for t in data['CERT'])

template=(ROOT/'template.html').read_text()
for k,v in values.items():
    template=template.replace('{{'+k+'}}',v)
unresolved=re.findall(r'\{\{.*?\}\}',template)
if unresolved:
    raise ValueError('Unresolved template values: '+str(unresolved))
(ROOT/'index.html').write_text(template)
(ROOT/'js/config.js').write_text('// Generated by build.py. Edit content.json, then rebuild.\nwindow.PORTFOLIO = '+json.dumps(cfg,ensure_ascii=False,indent=2)+';\n')
print('Built index.html and js/config.js from content.json.')
